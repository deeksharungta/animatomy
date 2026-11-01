// The image work of pack-sprites.mjs, run inside headless Chrome. Self-contained: it is sent to the page as
// source. For each cell of the sheet: key out a plain background, find the figure, its feet and (when hanging)
// its two topmost claws; then scale every frame to one body height, pin it in a 512 cell and draw the atlas.
export async function packInPage(src, cfg) {
  const img = new Image();
  img.src = src;
  await img.decode();
  const { cols, rows, cell, body, actions, out } = cfg, cw = img.width / cols, ch = img.height / rows;
  const hangs = actions.flatMap(([name, n]) => Array(n).fill(name === "hang"));
  const cut = [];
  for (let i = 0; i < hangs.length; i++) {
    const c = document.createElement("canvas");
    c.width = Math.round(cw); c.height = Math.round(ch);
    const g = c.getContext("2d");
    g.drawImage(img, (i % cols) * cw, Math.floor(i / cols) * ch, cw, ch, 0, 0, cw, ch);
    const d = g.getImageData(0, 0, c.width, c.height), p = d.data, W = c.width, H = c.height;
    const problems = [];
    // A plain background: flood it away from the edges, softening the pixels where it meets the figure.
    const edge = [];
    for (let x = 0; x < W; x++) edge.push(x, (H - 1) * W + x);
    for (let y = 0; y < H; y++) edge.push(y * W, y * W + W - 1);
    const opaqueEdge = edge.filter((k) => p[k * 4 + 3] > 200).length / edge.length;
    if (cfg.background !== "none" && opaqueEdge > 0.9) {
      const bg = [0, 1, 2].map((ch) => edge.reduce((s, k) => s + p[k * 4 + ch], 0) / edge.length);
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
      g.putImageData(d, 0, 0);
    }
    // Keep the animal: the largest connected shape and anything near it, so specks spilled from a
    // neighbouring cell go, while whiskers and claws stay.
    const lab = new Int32Array(W * H), comps = [];
    for (let k = 0; k < W * H; k++) {
      if (lab[k] || p[k * 4 + 3] <= 24) continue;
      const C = { n: 0, box: [W, H, 0, 0] }, st = [k];
      lab[k] = comps.length + 1;
      while (st.length) {
        const q = st.pop(), x = q % W, y = (q - x) / W;
        C.n++; C.box = [Math.min(C.box[0], x), Math.min(C.box[1], y), Math.max(C.box[2], x), Math.max(C.box[3], y)];
        for (const r of [x > 0 && q - 1, x < W - 1 && q + 1, y > 0 && q - W, y < H - 1 && q + W]) if (r !== false && !lab[r] && p[r * 4 + 3] > 24) { lab[r] = comps.length + 1; st.push(r); }
      }
      comps.push(C);
    }
    const main = comps.reduce((a, b) => (b.n > a.n ? b : a), { n: 0, box: [0, 0, W, H] }), mb = main.box, pad = 0.08 * Math.max(mb[2] - mb[0], mb[3] - mb[1]);
    const keep = comps.map((C) => C === main || (C.box[0] >= mb[0] - pad && C.box[2] <= mb[2] + pad && C.box[1] >= mb[1] - pad && C.box[3] <= mb[3] + pad));
    for (let k = 0; k < W * H; k++) if (lab[k] && !keep[lab[k] - 1]) p[k * 4 + 3] = 0;
    g.putImageData(d, 0, 0);
    let [x0, y0, x1, y1] = [W, H, -1, -1], fringe = 0, soft = 0;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const k = (y * W + x) * 4, a = p[k + 3];
      if (a > 24) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
      if (a > 24 && a < 230) { soft++; if (p[k] + p[k + 1] + p[k + 2] > 700) fringe++; }
    }
    if (x1 < 0) { problems.push("empty cell"); cut.push({ c, box: [0, 0, 1, 1], feet: [0, 0], problems }); continue; }
    if (x0 <= 1 || y0 <= 1 || x1 >= W - 2 || y1 >= H - 2) problems.push("touches the cell edge: part of the animal may be cut off");
    if (soft && fringe / soft > 0.25) problems.push("pale fringe round the edge: the background was not fully removed");
    // Feet: the middle of the lowest few rows of the figure. Grips: the topmost point of each half.
    let fx = 0, fn = 0;
    for (let y = Math.round(y1 - (y1 - y0) * 0.04); y <= y1; y++) for (let x = x0; x <= x1; x++) if (p[(y * W + x) * 4 + 3] > 128) { fx += x; fn++; }
    // Grips: the highest point of the figure, then the highest point at least a fifth of its width away.
    const tops = [];
    for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) if (p[(y * W + x) * 4 + 3] > 128) { tops.push([x, y]); break; }
    const g1 = tops.reduce((a, b) => (b[1] < a[1] ? b : a), tops[0]);
    const g2 = tops.filter((t) => Math.abs(t[0] - g1[0]) > (x1 - x0) * 0.2).reduce((a, b) => (!a || b[1] < a[1] ? b : a), null) ?? g1;
    cut.push({ c, box: [x0, y0, x1, y1], feet: [fx / (fn || 1), y1], grips: hangs[i] ? [g1, g2].sort((a, b) => a[0] - b[0]) : null, problems });
  }
  // One scale for the whole sheet, from the median body height, shrunk if any frame would not fit a cell.
  const hs = cut.map((f) => f.box[3] - f.box[1]).sort((a, b) => a - b);
  let s = body / hs[Math.floor(hs.length / 2)];
  for (const f of cut) s = Math.min(s, (cell - 24) / (f.box[2] - f.box[0]), (cell - 24) / (f.box[3] - f.box[1]));
  const atlas = document.createElement("canvas");
  atlas.width = cols * cell * out; atlas.height = rows * cell * out;
  const A = atlas.getContext("2d");
  A.imageSmoothingQuality = "high";
  const frames = cut.map((f, i) => {
    const pin = f.grips ? [(f.grips[0][0] + f.grips[1][0]) / 2, Math.min(f.grips[0][1], f.grips[1][1])] : f.feet;
    const to = f.grips ? [cell / 2, 40] : [cell / 2, cell - 36];
    let dx = to[0] - pin[0] * s, dy = to[1] - pin[1] * s;
    dx = Math.max(12 - f.box[0] * s, Math.min(cell - 12 - f.box[2] * s, dx)); dy = Math.max(12 - f.box[1] * s, Math.min(cell - 12 - f.box[3] * s, dy));
    const ox = (i % cols) * cell, oy = Math.floor(i / cols) * cell, at = (q) => [+(q[0] * s + dx).toFixed(1), +(q[1] * s + dy).toFixed(1)];
    A.save(); A.beginPath(); A.rect(ox * out, oy * out, cell * out, cell * out); A.clip();
    A.drawImage(f.c, (ox + dx) * out, (oy + dy) * out, f.c.width * s * out, f.c.height * s * out); A.restore();
    const box = [f.box[0], f.box[1], f.box[2], f.box[3]].map((v, k) => +(v * s + (k % 2 ? dy + oy : dx + ox)).toFixed(1));
    return { rect: [ox, oy, cell, cell], feet: at(f.feet), box, ...(f.grips ? { grips: f.grips.map(at) } : {}), problems: f.problems };
  });
  return { webp: atlas.toDataURL("image/webp", 0.9), frames };
}
