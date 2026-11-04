// What changes each frame, as markup: the lever and everything on it, the switch plunger, the wheel's rungs and
// spokes, the teeth of the pinion, spur gear and feed gear, and what turns with the can (label seam and panel, the
// lid's code dots and the cut). Serialized into the page as it stands; K carries the kit and lathe functions.
export function dynamic(K, P, C, S) {
  const at = (p) => K.iso(p, P), rad = (d) => (d * Math.PI) / 180, out = {};
  const a = C.THETA * (1 - S.lev), ca = Math.cos(a), sa = Math.sin(a);
  const [px, py, pz] = C.PIVOT;
  const lv = (p) => { const dx = p[0] - px, dz = p[2] - pz; return [px + dx * ca - dz * sa, p[1], pz + dx * sa + dz * ca]; };
  const turn = (d) => [d[0] * ca - d[2] * sa, d[1], d[0] * sa + d[2] * ca];
  const ax = turn([1, 0, 0]), nz = turn([0, 0, 1]), Y = [0, 1, 0];
  // A box on the lever: centre-line along the lever from s0 to s1, half-widths in y and in the lever's up direction.
  const bar = (s0, s1, y0, y1, v0, v1) => K.prismOf(K.frameOf([px, 0, pz], ax, Y, nz), [[y0, v0], [y1, v0], [y1, v1], [y0, v1]], s0, s1, P);
  // A box hanging square to the lever: plan in (along, y) at the lever-frame point o, from depth d0 down to d1.
  const hang = (o, s0, s1, y0, y1, d0, d1) => K.prismOf(K.frameOf(lv(o), [-nz[0], 0, -nz[2]], ax, [0, -1, 0]), [[s0, -y0], [s1, -y0], [s1, -y1], [s0, -y1]], d0, d1, P);
  const Lv = C.LEVER, H = C.HANDLE, lit = S.lit === "lever";
  const y0 = Lv.y - Lv.w, y1 = Lv.y + Lv.w, s = (x) => x - px;
  const xFace = C.HOUSE.x + C.HOUSE.w;
  const stem = pz - Lv.t - (C.PAD.z + 2), PF = K.frameOf(lv([C.PAD.x, C.PAD.y, pz - Lv.t]), [-nz[0], 0, -nz[2]], ax, [0, -1, 0]);
  out.leverIn = K.solidSvg(bar(s(Lv.x0), s(xFace - 4), y0, y1, -Lv.t, Lv.t), { tone: "hi", crease: "lo", lit }) +
    K.solidSvg(K.disc(0, stem, 1.4, PF, P), { tone: "hi" }) +
    K.solidSvg(K.disc(stem, stem + 2, C.PAD.r, PF, P), { tone: "mid", crease: "lo" }) +
    K.dotsSvg([at(lv([px, Lv.y + Lv.w, pz]))], { size: 0.6, tone: "hi" });
  const ribs = [];
  for (let i = 0; i < 7; i++) { const xx = H.x0 + 3 + i * 2.4; ribs.push(K.pathOf([at(lv([xx, Lv.y - H.w, pz + Lv.t + 1.5])), at(lv([xx, Lv.y + H.w, pz + Lv.t + 1.5]))])); }
  out.leverOut = K.solidSvg(bar(s(xFace), s(Lv.x1), y0, y1, -Lv.t, Lv.t), { tone: "hi", crease: "lo", lit }) +
    K.solidSvg(hang([C.HANGER.x0, 0, pz - Lv.t], 0, C.HANGER.x1 - C.HANGER.x0, C.HANGER.y0, C.HANGER.y1, 0, pz - Lv.t - (C.SHOE.z + C.SHOE.h)), { tone: "mid" }) +
    K.solidSvg(hang([C.SHOE.x, 0, C.SHOE.z + C.SHOE.h], 0, C.SHOE.w, C.SHOE.y, C.SHOE.y + C.SHOE.d, 0, C.SHOE.h), { tone: "hi", crease: "lo" }) +
    K.dotsSvg([[C.SHOE.x + 2, C.SHOE.y + 2], [C.SHOE.x + 2, C.SHOE.y + C.SHOE.d - 2]].map(([x, y]) => at(lv([x, y, C.SHOE.z + C.SHOE.h]))), { size: 0.45 }) +
    K.solidSvg(bar(s(H.x0), s(H.x1), Lv.y - H.w, Lv.y + H.w, Lv.t, Lv.t + 1.5), { tone: "hi", crease: "lo" }) +
    K.lineSvg(ribs.join(""), { tone: "faint" });
  out.plunger = (() => {
    const sw = C.SWITCH, x = sw.x + sw.w / 2, y = sw.y + sw.d / 2, top = Math.min(sw.z + sw.h + 2.4, lv([x, y, pz - Lv.t])[2]);
    return K.solidSvg(K.cylinder(x, y, 1.1, sw.z + sw.h, top - sw.z - sw.h, P, 16), { tone: "hi", lit: S.on && !S.duty });
  })();

  // The wheel: 24 rungs between the rims and six spokes on the far rim, at the wheel's angle.
  const W = C.WHEEL, rungs = [], spokes = [];
  for (let i = 0; i < 24; i++) { const t = S.wheel + (i / 24) * Math.PI * 2; rungs.push(K.pathOf([at([W.x0, W.r * Math.cos(t), W.z + W.r * Math.sin(t)]), at([W.x1, W.r * Math.cos(t), W.z + W.r * Math.sin(t)])])); }
  for (let i = 0; i < 6; i++) { const t = S.wheel + (i / 6) * Math.PI * 2 + 0.26; spokes.push(K.pathOf([at([W.x0, 2.4 * Math.cos(t), W.z + 2.4 * Math.sin(t)]), at([W.x0, (W.r - 1.2) * Math.cos(t), W.z + (W.r - 1.2) * Math.sin(t)])])); }
  out.rungs = K.lineSvg(rungs.join(""), { tone: "mid" });
  out.spokes = K.lineSvg(spokes.join(""), { tone: "mid" });
  const fx = (x, z) => K.frameOf([x, 0, z], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  const teeth = (F, len, r, n, phase) => K.fadedSvg(K.ribsOf(F, 0, len, r, n, P, { phase, fade: [0.08, 0.5], seams: true }), { tone: "lo" });
  out.pinion = teeth(fx(C.PIN.x0, C.PIN.z), C.PIN.x1 - C.PIN.x0, C.PIN.r - 0.8, C.PIN.teeth, S.wheel);
  out.gear = teeth(fx(C.GEAR.x0, C.FEED.z), C.GEAR.x1 - C.GEAR.x0, C.GEAR.r - 0.8, C.GEAR.teeth, S.gear);
  const holes = [];
  for (let i = 0; i < 4; i++) { const t = S.gear + (i / 4) * Math.PI * 2 + 0.4; holes.push(K.pathOf(Array.from({ length: 20 }, (_, j) => { const u = (j / 20) * Math.PI * 2; return at([C.GEAR.x1, 11 * Math.cos(t) + 3.4 * Math.cos(u), C.FEED.z + 11 * Math.sin(t) + 3.4 * Math.sin(u)]); }), true)); }
  out.holes = `<path class="co-void" d="${holes.join("")}"/>` + K.dotsSvg([at([C.GEAR.x1 + 3, 5 * Math.cos(S.gear + 2), C.FEED.z + 5 * Math.sin(S.gear + 2)])], { size: 0.5 });
  out.feed = teeth(fx(C.FEED.x0, C.FEED.z), C.FEED.x1 - C.FEED.x0, C.FEED.r - 0.7, C.FEED.teeth, S.gear);

  // The can turns by S.can (radians, counter-clockwise from above): the label's seam and printed panel go round.
  const K0 = C.CAN, deg = (S.can * 180) / Math.PI;
  const Fz = K.frameOf([K0.x, K0.y, 16], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const panel = [];
  const seam = K.ribsOf(Fz, 0, 86, K0.r + 0.15, 1, P, { phase: rad(200 + deg), fade: [0.05, 0.4] });
  for (const off of [-24, 24]) panel.push(...K.ribsOf(Fz, 20, 66, K0.r + 0.15, 1, P, { phase: rad(20 + deg + off), fade: [0.05, 0.4] }));
  const arcs = [20, 66].map((h) => K.arcOf(Fz, h, K0.r + 0.15, P, { from: rad(deg - 4), to: rad(deg + 44) })).join("");
  out.label = K.fadedSvg(seam, { tone: "lo" }) + K.fadedSvg(panel, { tone: "lo" }) + K.lineSvg(arcs, { tone: "lo" });
  // The cut: from the hole Chomp punched, round the lid at r 36.2 to where his teeth are now; hidden in the notch.
  const inNotch = (d) => { const m = ((d % 360) + 360) % 360; return m > C.NOTCH.a0 + 0.5 && m < C.NOTCH.a1 - 0.5; };
  const pol = (d, r, z) => [K0.x + r * Math.cos(rad(d)), K0.y + r * Math.sin(rad(d)), z];
  const runs = [];
  let run = [];
  const span = Math.min(360, (S.cut * 180) / Math.PI);
  for (let i = 0; i <= Math.ceil(span / 1.5); i++) {
    const d = C.CUT_A + Math.min(span, i * 1.5);
    if (inNotch(d)) { if (run.length > 1) runs.push(run); run = []; } else run.push(at(pol(d, C.CUT_R, K0.lid)));
  }
  if (run.length > 1) runs.push(run);
  const ends = S.pierced ? [at(pol(C.CUT_A, C.CUT_R, K0.lid)), at(pol(C.CUT_A + span, C.CUT_R, K0.lid))] : [];
  out.cut = (runs.length ? K.lineSvg(runs.map((r) => K.pathOf(r)).join(""), { tone: "hi" }) : "") + (span < 359 ? K.dotsSvg(ends.filter((p, i) => i === 0 || !inNotch(C.CUT_A + span)), { size: 0.75, tone: "mid" }) : "");
  const code = [];
  for (let i = 0; i < 6; i++) { const d = 250 + deg + i * 4; code.push(at(pol(d, 18, K0.lid))); }
  out.code = K.dotsSvg(code, { size: 0.5, tone: "lo" });
  return out;
}
