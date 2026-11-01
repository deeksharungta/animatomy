// The image work of pack-sprites.mjs, run inside headless Chrome. Self-contained: it is sent to the page as
// source. Keys out a plain background, finds each whole animal on the sheet (the cell its centre sits in names
// its frame, so a paw reaching past the cell line is kept), finds its feet and (when hanging) its two topmost
// claws; then scales every frame to one body height, pins it in a 512 cell and draws the atlas.
export async function packInPage(src, cfg) {
  // The sheet, and with --add the animal's existing atlas, which stays on top with the new rows under it.
  const img = new Image(), base = cfg.base && new Image(), baseRows = cfg.base?.rows ?? 0;
  img.src = src;
  if (base) base.src = cfg.base.src;
  await Promise.all([img.decode(), base?.decode()]);
  const { cols, rows, cell, body, actions, out } = cfg, W = img.width, H = img.height, cw = W / cols, ch = H / rows;
  const kinds = actions.flatMap(([name, n]) => Array(n).fill(name)), hangs = kinds.map((k) => k === "hang");
  const sheet = document.createElement("canvas");
  sheet.width = W; sheet.height = H;
  const sg = sheet.getContext("2d");
  sg.drawImage(img, 0, 0);
  const d = sg.getImageData(0, 0, W, H), p = d.data;
  // A plain background: flood it away from the sheet's edges, softening the pixels where it meets a figure.
  const edge = [];
  for (let x = 0; x < W; x++) edge.push(x, (H - 1) * W + x);
  for (let y = 0; y < H; y++) edge.push(y * W, y * W + W - 1);
  if (cfg.background !== "none" && edge.filter((k) => p[k * 4 + 3] > 200).length / edge.length > 0.9) {
    const bg = [0, 1, 2].map((c) => edge.reduce((s, k) => s + p[k * 4 + c], 0) / edge.length);
    const dist = (k) => Math.abs(p[k * 4] - bg[0]) + Math.abs(p[k * 4 + 1] - bg[1]) + Math.abs(p[k * 4 + 2] - bg[2]);
    const seen = new Uint8Array(W * H), stack = [...edge];
    while (stack.length) {
      const k = stack.pop();
      if (seen[k] || dist(k) > 48) continue;
      seen[k] = 1; p[k * 4 + 3] = 0;
      const x = k % W, y = (k - x) / W;
      if (x > 0) stack.push(k - 1); if (x < W - 1) stack.push(k + 1); if (y > 0) stack.push(k - W); if (y < H - 1) stack.push(k + W);
    }
    for (let k = 0; k < W * H; k++) if (!seen[k] && dist(k) < 90 && (seen[k - 1] || seen[k + 1] || seen[k - W] || seen[k + W])) p[k * 4 + 3] = Math.round(p[k * 4 + 3] * ((dist(k) - 48) / 42));
  }
  // Every connected shape on the sheet, with its size, centre and box.
  const lab = new Int32Array(W * H), comps = [];
  for (let k = 0; k < W * H; k++) {
    if (lab[k] || p[k * 4 + 3] <= 24) continue;
    const C = { id: comps.length + 1, n: 0, sx: 0, sy: 0, b: [W, H, 0, 0] }, st = [k];
    lab[k] = C.id;
    while (st.length) {
      const q = st.pop(), x = q % W, y = (q - x) / W;
      C.n++; C.sx += x; C.sy += y;
      if (x < C.b[0]) C.b[0] = x; if (y < C.b[1]) C.b[1] = y; if (x > C.b[2]) C.b[2] = x; if (y > C.b[3]) C.b[3] = y;
      const grow = (r) => { if (!lab[r] && p[r * 4 + 3] > 24) { lab[r] = C.id; st.push(r); } };
      if (x > 0) grow(q - 1); if (x < W - 1) grow(q + 1); if (y > 0) grow(q - W); if (y < H - 1) grow(q + W);
    }
    comps.push(C);
  }
  // Each frame's animal is the largest shape centred in its cell; a loose whisker or claw joins the animal
  // whose box it sits in, and a speck that belongs to nobody goes.
  const cellOf = (C) => Math.min(rows - 1, Math.floor(C.sy / C.n / ch)) * cols + Math.min(cols - 1, Math.floor(C.sx / C.n / cw));
  const mains = hangs.map((_, i) => comps.filter((C) => cellOf(C) === i).reduce((a, C) => (!a || C.n > a.n ? C : a), null));
  const members = mains.map((M) => (M ? [M] : []));
  for (const C of comps) {
    if (mains.includes(C)) continue;
    const hosts = mains.map((M, i) => [M, i]).filter(([M]) => M && (() => { const pad = 0.08 * Math.max(M.b[2] - M.b[0], M.b[3] - M.b[1]); return C.b[0] >= M.b[0] - pad && C.b[2] <= M.b[2] + pad && C.b[1] >= M.b[1] - pad && C.b[3] <= M.b[3] + pad; })());
    const near = hosts.sort(([A], [B]) => Math.hypot(A.sx / A.n - C.sx / C.n, A.sy / A.n - C.sy / C.n) - Math.hypot(B.sx / B.n - C.sx / C.n, B.sy / B.n - C.sy / C.n))[0];
    if (near) members[near[1]].push(C);
  }
  const cut = hangs.map((hang, i) => {
    const problems = [];
    if (!mains[i]) { problems.push("empty cell"); const c = document.createElement("canvas"); c.width = c.height = 1; return { c, box: [0, 0, 1, 1], feet: [0, 0], problems }; }
    const ids = new Set(members[i].map((C) => C.id)), b = members[i].reduce((a, C) => [Math.min(a[0], C.b[0]), Math.min(a[1], C.b[1]), Math.max(a[2], C.b[2]), Math.max(a[3], C.b[3])], [W, H, 0, 0]);
    if (b[0] <= 1 || b[1] <= 1 || b[2] >= W - 2 || b[3] >= H - 2) problems.push("touches the sheet's edge: part of the animal may be cut off");
    if (b[2] - b[0] > 1.6 * cw || b[3] - b[1] > 1.6 * ch) problems.push("joined to a neighbouring animal: give it more room");
    const w = b[2] - b[0] + 1, h = b[3] - b[1] + 1, c = document.createElement("canvas");
    c.width = w; c.height = h;
    const g = c.getContext("2d"), cd = g.createImageData(w, h), q = cd.data;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const k = (b[1] + y) * W + b[0] + x;
      if (ids.has(lab[k])) for (let j = 0; j < 4; j++) q[(y * w + x) * 4 + j] = p[k * 4 + j];
    }
    g.putImageData(cd, 0, 0);
    let fringe = 0, soft = 0;
    for (let k = 0; k < w * h; k++) if (q[k * 4 + 3] > 24 && q[k * 4 + 3] < 230) { soft++; if (q[k * 4] + q[k * 4 + 1] + q[k * 4 + 2] > 700) fringe++; }
    if (soft && fringe / soft > 0.25) problems.push("pale fringe round the edge: the background was not fully removed");
    const A = (x, y) => q[(y * w + x) * 4 + 3];
    // Feet: under the body's centre of mass, which a standing animal keeps over its feet (a tail or a
    // wing tip lower down does not count); a flying frame keeps the centre itself.
    let mx = 0, my = 0, mn = 0, fy = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (A(x, y) > 128) { mx += x; my += y; mn++; }
    mx /= mn || 1; my /= mn || 1;
    for (let y = 0; y < h; y++) for (let x = Math.max(0, Math.round(mx - w * 0.12)); x < Math.min(w, mx + w * 0.12); x++) if (A(x, y) > 128) fy = y;
    // Grips: the highest point of the figure, then the highest point at least a fifth of its width away.
    const tops = [];
    for (let x = 0; x < w; x++) for (let y = 0; y < h; y++) if (A(x, y) > 128) { tops.push([x, y]); break; }
    const g1 = tops.reduce((a, t) => (t[1] < a[1] ? t : a), tops[0]);
    const g2 = tops.filter((t) => Math.abs(t[0] - g1[0]) > w * 0.2).reduce((a, t) => (!a || t[1] < a[1] ? t : a), null) ?? g1;
    return { c, box: [0, 0, w - 1, h - 1], feet: [mx, fy], centre: [mx, my], grips: hang ? [g1, g2].sort((a, t) => a[0] - t[0]) : null, problems };
  });
  const drops = cut.filter((f, i) => f.centre && kinds[i] !== "fly").map((f) => f.feet[1] - f.centre[1]).sort((a, b) => a - b);
  for (const [i, f] of cut.entries()) if (kinds[i] === "fly" && f.centre) f.feet = [f.centre[0], f.centre[1] + (drops[drops.length >> 1] ?? 0)];
  // One scale for the whole sheet, from the median height of its upright frames (of all, if none stand),
  // shrunk if any frame would not fit a cell.
  const upright = cut.filter((f, i) => !["run", "stand4", "hang", "fly"].includes(kinds[i]));
  const hs = (upright.length ? upright : cut).map((f) => f.box[3] - f.box[1]).sort((a, b) => a - b);
  let s = body / hs[Math.floor(hs.length / 2)];
  for (const f of cut) s = Math.min(s, (cell - 24) / (f.box[2] - f.box[0] || 1), (cell - 24) / (f.box[3] - f.box[1] || 1));
  const atlas = document.createElement("canvas");
  atlas.width = cols * cell * out; atlas.height = (baseRows + rows) * cell * out;
  const A = atlas.getContext("2d");
  A.imageSmoothingQuality = "high";
  if (base) A.drawImage(base, 0, 0, atlas.width, baseRows * cell * out);
  const frames = cut.map((f, i) => {
    const pin = f.grips ? [(f.grips[0][0] + f.grips[1][0]) / 2, Math.min(f.grips[0][1], f.grips[1][1])] : f.feet;
    const to = f.grips ? [cell / 2, 40] : [cell / 2, cell - 36];
    let dx = to[0] - pin[0] * s, dy = to[1] - pin[1] * s;
    dx = Math.max(12 - f.box[0] * s, Math.min(cell - 12 - f.box[2] * s, dx)); dy = Math.max(12 - f.box[1] * s, Math.min(cell - 12 - f.box[3] * s, dy));
    const ox = (i % cols) * cell, oy = (baseRows + Math.floor(i / cols)) * cell, at = (q) => [+(q[0] * s + dx).toFixed(1), +(q[1] * s + dy).toFixed(1)];
    A.save(); A.beginPath(); A.rect(ox * out, oy * out, cell * out, cell * out); A.clip();
    A.drawImage(f.c, (ox + dx) * out, (oy + dy) * out, f.c.width * s * out, f.c.height * s * out); A.restore();
    const box = f.box.map((v, k) => +(v * s + (k % 2 ? dy + oy : dx + ox)).toFixed(1));
    return { rect: [ox, oy, cell, cell], feet: at(f.feet), box, ...(f.grips ? { grips: f.grips.map(at) } : {}), problems: f.problems };
  });
  return { webp: atlas.toDataURL("image/webp", 0.9), frames };
}
