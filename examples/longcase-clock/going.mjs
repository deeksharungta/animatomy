// The parts that move, drawn from the model's state. These functions are serialized into the page too,
// so they use only what is passed in. Angles turn in the movement's x-z plane: 0 points to +x, positive is
// anticlockwise as you face the dial.
export function wheelKit(K, P, C) {
  const at = (p) => K.iso(p, P);
  const pt = (x, z, r, a, y) => [x + r * Math.cos(a), y, z + r * Math.sin(a)];
  const rot = (poly, a) => poly.map(([u, v]) => [u * Math.cos(a) - v * Math.sin(a), u * Math.sin(a) + v * Math.cos(a)]);
  // A prism along y whose section is a convex polygon in x-z.
  const flat = (o, poly, s0, s1) => K.prismOf(K.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]), poly, s0, s1, P);
  // A prism from a to b (both in one y plane) with a section of half-widths w (across, in x-z) and t (along y).
  const bar = (a, b, w, t, tone = "hi", lit = false) => {
    const d = [b[0] - a[0], 0, b[2] - a[2]], len = Math.hypot(d[0], d[2]), u = [d[0] / len, 0, d[2] / len];
    return K.solidSvg(K.prismOf(K.frameOf(a, u, [0, 1, 0], [-u[2], 0, u[0]]), [[-t, -w], [t, -w], [t, w], [-t, w]], 0, len, P), { tone, lit });
  };
  const pin = (o, r, len, tone = "hi") => K.solidSvg(K.disc(0, len, r, K.frameAlong(o, [0, 1, 0]), P), { tone, crease: "lo" });
  // A wheel's four crossings, its hub and its teeth, turned to angle a.
  const wheel = (w, a, { spokes = 4, lit = false } = {}) => {
    const y = w.y, arm = [[1, -0.34], [w.r - 1.4, -0.2], [w.r - 1.4, 0.2], [1, 0.34]], out = [];
    for (let i = 0; i < spokes; i++) out.push(K.solidSvg(flat([w.x, y + 0.14, w.z], rot(arm, a + (i / spokes) * Math.PI * 2 + 0.4), 0, 0.32), { tone: "hi", lit }));
    out.push(K.solidSvg(K.disc(0, 0.62, 1.3, K.frameAlong([w.x, y, w.z], [0, 1, 0]), P), { tone: "hi", crease: "lo" }));
    const teeth = [];
    for (let i = 0; i < w.n; i++) {
      const t = a + (i / w.n) * Math.PI * 2;
      teeth.push(at(pt(w.x, w.z, w.r - 0.55, t, y + 0.61)), at(pt(w.x, w.z, w.r - 0.06, t + Math.PI / w.n, y + 0.61)));
    }
    return out.join("") + K.lineSvg(K.pathOf(teeth, true), { tone: "mid" });
  };
  // The visible front half of a ring round an arbor along y (the page's kit has no arcOf).
  const ae = (P.elevation * Math.PI) / 180, az = (P.azimuth * Math.PI) / 180, phi = Math.atan2(Math.sin(ae), Math.cos(ae) * Math.cos(az));
  const arcY = (x, y, z, r) => K.pathOf(Array.from({ length: 25 }, (_, i) => at(pt(x, z, r, phi - Math.PI / 2 + 0.06 + (i / 24) * (Math.PI - 0.12), y))));
  return { at, pt, rot, flat, bar, pin, wheel, arcY };
}

export function going(K, P, C, S, W) {
  const out = {};
  const { GREAT: G, CENTER: Ce, THIRD: T, ESC: E } = C;
  out.great = W.wheel(G, S.great);
  out.center = W.wheel(Ce, S.center) + W.pin(W.pt(Ce.x, Ce.z, C.HOURPIN.r, S.center + C.HOURPIN.a, Ce.y + 0.6), 0.42, 1.4);
  out.third = W.wheel(T, S.third);
  // The escape wheel: thirty hooked teeth on a rim, crossed out to its hub; it steps half a tooth each swing.
  const esc = [K.solidSvg(K.ringBand(0, 0.5, E.r - 2.2, E.r - 1.4, K.frameAlong([E.x, E.y, E.z], [0, 1, 0]), P, { hole: [0.5, E.r - 2.2] }), { tone: "hi", crease: "lo", lit: S.lit === "esc" })];
  for (let i = 0; i < 3; i++) esc.push(K.solidSvg(W.flat([E.x, E.y + 0.06, E.z], W.rot([[0.9, -0.35], [E.r - 2, -0.25], [E.r - 2, 0.25], [0.9, 0.35]], S.esc + (i / 3) * Math.PI * 2), 0, 0.38), { tone: "hi" }));
  const tooth = [[E.r - 1.5, 0.32], [E.r, -0.38], [E.r - 0.15, -0.62], [E.r - 1.5, -0.3]];
  for (let i = 0; i < E.n; i++) esc.push(K.solidSvg(W.flat([E.x, E.y, E.z], W.rot(tooth, S.esc - (i / E.n) * Math.PI * 2), 0, 0.5), { tone: "hi" }));
  esc.push(K.solidSvg(K.disc(0, 0.55, 1.1, K.frameAlong([E.x, E.y, E.z], [0, 1, 0]), P), { tone: "hi", crease: "lo" }));
  out.esc = esc.join("");
  // The anchor rocks with the pendulum: a hub, two arms, and a pallet at each arm's end.
  const A = C.ANCHOR, piv = [E.x, A.y, A.z], s = Math.sin(A.span), c = Math.cos(A.span), tip = [E.r * s, E.z + E.r * c - A.z];
  const loc = (u, v) => { const [a, b] = W.rot([[u, v]], S.th)[0]; return [E.x + a, A.y, A.z + b]; };
  const anchor = [];
  for (const side of [-1, 1]) {
    anchor.push(W.bar(loc(side * 0.6, -0.4), loc(side * (tip[0] + 0.5), tip[1] + 1.6), 0.55, 0.32));
    anchor.push(K.solidSvg(W.flat(loc(0, 0).map((v, i) => (i === 1 ? A.y - 0.64 : v)), W.rot([[side * (tip[0] - 0.55), tip[1]], [side * (tip[0] + 0.45), tip[1] + 0.4], [side * (tip[0] + 0.9), tip[1] + 1.9], [side * (tip[0] - 0.2), tip[1] + 1.9]], S.th), 0, 0.64), { tone: "hi", lit: S.lit === "anchor" }));
  }
  anchor.push(K.solidSvg(K.disc(0, 0.7, 1.5, K.frameAlong([E.x, A.y - 0.7, A.z], [0, 1, 0]), P), { tone: "hi", crease: "lo" }));
  out.anchor = anchor.join("");
  out.tips = [-1, 1].map((side) => loc(side * tip[0], tip[1]));
  out.arms = [-1, 1].map((side) => loc(side * (tip[0] * 0.55), tip[1] * 0.5 + 0.6));
  // The pendulum: a flat steel rod from the suspension spring, the bob, the rating nut below it.
  const Pn = C.PEND, sx = Math.sin(S.th), cz = Math.cos(S.th);
  out.rod = K.solidSvg(K.prismOf(K.frameOf([E.x, Pn.y, Pn.z], [sx, 0, -cz], [cz, 0, sx], [0, 1, 0]), [[-0.4, -0.2], [0.4, -0.2], [0.4, 0.2], [-0.4, 0.2]], 0, Pn.len, P), { tone: "hi" });
  out.bob = K.translateAlong(P, [Pn.len * sx, 0, Pn.len * (1 - cz)]);
  // The weights ride their pulleys; each cord runs down from its barrel, round the pulley and back up to the seatboard.
  const cords = (x, side, wt, up) => {
    const top = wt + C.WEIGHT.h + 4.1, a = x + side * C.BARREL.r, b = a + side * 2 * C.WEIGHT.pulley;
    return up ? K.lineSvg(K.segment([a, -23.1, C.SEAT_Z], [a, -23.1, x < 0 ? G.z : C.SGREAT.z], P), { tone: "hi" })
      : K.lineSvg(K.segment([a, -23.1, C.SEAT_Z - 1.5], [a, -23.1, top], P) + K.segment([b, -23.1, C.SEAT_Z - 1.5], [b, -23.1, top], P), { tone: "hi" });
  };
  out.weight = K.translateAlong(P, [0, 0, S.wt - C.WEIGHT.high]);
  out.sweight = K.translateAlong(P, [0, 0, S.swt - C.WEIGHT.high]);
  out.cord = cords(G.x, -1, S.wt, false) + cords(C.SGREAT.x, 1, S.swt, false);
  out.cordUp = cords(G.x, -1, S.wt, true) + cords(C.SGREAT.x, 1, S.swt, true);
  out.grip = [G.x - C.BARREL.r - C.WEIGHT.pulley, -23.1, S.wt + C.WEIGHT.h + 15.6];
  // The cord wound on each barrel: one turn of cord per coil, eight and a half when fully wound.
  const coils = (x, wt) => {
    const n = Math.round(((wt - C.WEIGHT.low) * 2) / (2 * Math.PI * C.BARREL.r)), arcs = [];
    for (let i = 0; i < n; i++) arcs.push(W.arcY(x, C.BARREL.y0 + 0.7 + 0.42 * i, G.z, C.BARREL.r + 0.05));
    return K.lineSvg(arcs.join(""), { tone: "lo" });
  };
  out.greatCoils = coils(G.x, S.wt);
  out.sgreatCoils = coils(C.SGREAT.x, S.swt);
  // The crank key you wind with, on each winding square, and the hands in blued steel.
  const key = (x) => {
    const h = W.pt(x, G.z, 3.4, S.crank, -11);
    return W.pin([x, -13.8, G.z], 1, 2.2, "mid") + K.solidSvg(W.flat([x, -11.6, G.z], W.rot([[-0.9, -0.8], [3.4, -0.55], [3.4, 0.55], [-0.9, 0.8]], S.crank), 0, 0.6), { tone: "hi" }) + W.pin(h, 0.62, 2.2);
  };
  out.key = key(G.x) + key(C.SGREAT.x);
  const hy = C.DIAL.y + 0.7, hand = (a, len, w, y) => K.solidSvg(W.flat([Ce.x, y, Ce.z], W.rot([[-1.6, -w], [len - 1.4, -w * 0.4], [len, 0], [len - 1.4, w * 0.4], [-1.6, w]], a), 0, 0.3), { tone: "hi" });
  const mins = (S.t / 60) % 60, hours = (S.t / 3600) % 12;
  out.hands = `<g class="lc-hand">${hand(Math.PI / 2 - (hours / 12) * Math.PI * 2, 5.2, 0.85, hy)}${hand(Math.PI / 2 - (mins / 60) * Math.PI * 2, 8.6, 0.5, hy + 0.35)}</g>` + K.dotsSvg([W.at([Ce.x, hy + 0.7, Ce.z])], { size: 0.9, tone: "hi" });
  return out;
}
