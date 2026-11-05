// What changes each frame, as markup: the water (behind the parts and its cut face in front), the swirl into the
// seat, the trip arm and handle, the chain, the float arm with its lever and plunger, the incoming water, and the
// pan's water with its rim jets. Serialized into the page as it stands; K carries the kit and lathe functions.
export function dynamic(K, P, C, S) {
  const at = (p) => K.iso(p, P), out = {}, T = C.TANK, Z0 = C.Z0, h = Z0 + S.h, YW = T.y1 - 0.4;
  const X0 = T.x0 + T.wall, X1 = T.x1 - T.wall, Y0 = T.y0 + T.wall, poly = (pts) => K.pathOf(pts.map(at), true);
  // The water: a tint over the inside walls and floor up to the level (drawn before the parts), the waterline on
  // the walls, and the cut face of the water in front of everything inside.
  out.waterBack = S.h > 0.3 ? `<path class="tc-wb" d="${K.extrude([[X0, Y0], [X1, Y0], [X1, YW], [X0, YW]], Z0, S.h, P).fill}"/>` +
    `<path class="tc-wl" d="${K.pathOf([[X0, YW, h], [X0, Y0, h], [X1, Y0, h]].map(at))}"/>` : "";
  out.waterFront = S.h > 0.3 ? `<path class="tc-wf" d="${poly([[X0, YW, Z0], [X1, YW, Z0], [X1, YW, h], [X0, YW, h]])}"/>` +
    `<path class="tc-wl" d="${K.pathOf([[X0, YW, h], [X1, YW, h]].map(at))}"/>` : "";
  // Ripples on the surface while it moves, drifting with the clock, faded at both ends.
  const rip = [], moving = Math.min(1, Math.abs(S.dh) / 8);
  if (moving > 0.05) for (let i = 0; i < 9; i++) {
    const x = X0 + 30 + ((i * 47 + S.t * 9) % (X1 - X0 - 60)), y = Y0 + 20 + ((i * 61) % (YW - Y0 - 40));
    rip.push(K.fadeLineSvg([at([x - 14, y, h]), at([x, y + 2, h]), at([x + 14, y, h])], { fade: [5, 5], tone: "mid", className: "tc-rip" }));
  }
  out.ripples = `<g opacity="${moving.toFixed(2)}">${rip.join("")}</g>`;
  // The swirl: streaks spiralling in to the seat while the water runs out under Ottie.
  const SE = C.SEAT, sw = [], run = Math.min(1, S.qout / 1.2);
  if (run > 0.03) for (let i = 0; i < 6; i++) {
    const a0 = S.swirl * 2.2 + (i / 6) * Math.PI * 2, pts = [];
    for (let j = 0; j <= 10; j++) { const f = j / 10, r = SE.r + 6 + 46 * (1 - f), a = a0 + f * 1.6; pts.push(at([SE.x + r * Math.cos(a), SE.y + r * Math.sin(a), Z0 + 6 + (SE.top - 6) * f])); }
    sw.push(K.fadeLineSvg(pts, { fade: [8, 6], tone: "mid", className: "tc-rip" }));
  }
  out.swirl = `<g opacity="${run.toFixed(2)}">${sw.join("")}</g>`;
  // The seat's throat shows dark only as Ottie lifts off it; seated, her body closes it.
  out.throat = `<path class="tc-throat" style="opacity:${Math.min(1, S.hop / 8).toFixed(2)}" d="${K.pathOf(Array.from({ length: 40 }, (_, i) => at([SE.x + SE.r * Math.cos((i / 40) * Math.PI * 2), SE.y + SE.r * Math.sin((i / 40) * Math.PI * 2), Z0 + SE.top])), true)}"/>`;

  // The trip arm and the handle turn together about the shaft (along y). a > 0 lifts the arm's end.
  const [px, , pz] = C.SHAFT, a = C.SWING * S.lev, ca = Math.cos(a), sa = Math.sin(a);
  const rot = (p) => { const dx = p[0] - px, dz = p[2] - pz; return [px + dx * ca + dz * sa, p[1], pz - dx * sa + dz * ca]; };
  const E = rot(C.ARM_END), sh = [px, C.SHAFT[1], pz], dir = [E[0] - sh[0], E[1] - sh[1], E[2] - sh[2]], len = Math.hypot(...dir);
  const u = dir.map((v) => v / len), lit = S.lit;
  const rodF = (o, d) => { const w = Math.abs(d[2]) > 0.9 ? [1, 0, 0] : [0, 0, 1], c = [d[1] * w[2] - d[2] * w[1], d[2] * w[0] - d[0] * w[2], d[0] * w[1] - d[1] * w[0]], n = Math.hypot(...c); return K.frameOf(o, d, w, c.map((v) => v / n)); };
  const oct = (r) => Array.from({ length: 10 }, (_, i) => [r * Math.cos(((i + 0.5) / 10) * Math.PI * 2), r * Math.sin(((i + 0.5) / 10) * Math.PI * 2)]);
  const flat = (o, d, w, t, s0, s1) => K.prismOf(rodF(o, d), [[-t, -w], [t, -w], [t, w], [-t, w]], s0, s1, P);
  out.arm = K.solidSvg(K.disc(0, 14, 6, K.frameOf([px, C.SHAFT[1] - 4, pz], [0, 1, 0], [0, 0, 1], [1, 0, 0]), P), { tone: "hi", crease: "lo" }) +
    K.solidSvg(flat(sh, u, 1.4, 5, 0, len + 4), { tone: "hi", crease: "lo" }) +
    K.dotsSvg([0, 1, 2, 3, 4].map((i) => at([sh[0] + u[0] * (len - 8 - i * 9), sh[1] + u[1] * (len - 8 - i * 9), sh[2] + u[2] * (len - 8 - i * 9) + 5.2])), { size: 0.7, tone: "lo" });
  // The handle: a chrome lever on the stub's face, pointing right; you press its end down.
  const hy = T.y1 + 14, H0 = rot([px + 8, hy, pz]), H1 = rot([px + C.HANDLE, hy, pz - 6]), hd = [H1[0] - H0[0], 0, H1[2] - H0[2]], hl = Math.hypot(...hd);
  out.handle = K.solidSvg(K.disc(-1, 7, 7, K.frameOf([px, T.y1 + 13, pz], [0, 1, 0], [0, 0, 1], [1, 0, 0]), P), { tone: "hi", crease: "lo" }) +
    K.solidSvg(K.prismOf(K.frameOf(H0, hd.map((v) => v / hl), [0, 1, 0], [-hd[2] / hl, 0, hd[0] / hl]), [[-3, -4], [3, -4], [3, 4], [-3, 4]], 0, hl, P), { tone: "hi", crease: "lo", lit }) +
    K.lineSvg([0.55, 0.68, 0.81].map((f) => K.pathOf([at([H0[0] + hd[0] * f / 1 - 3 * hd[2] / hl, hy - 3, H0[2] + hd[2] * f + 4 * hd[0] / hl]), at([H0[0] + hd[0] * f - 3 * hd[2] / hl, hy + 3, H0[2] + hd[2] * f + 4 * hd[0] / hl])])).join(""), { tone: "faint" });

  // The chain: from the arm's end to Ottie's ring; slack bows it toward you. A dot for every link.
  const R = S.ring, dd = Math.hypot(E[0] - R[0], E[1] - R[1], E[2] - R[2]), bow = Math.sqrt(Math.max(0, C.CHAIN * C.CHAIN - dd * dd)) * 0.5;
  const ch = [];
  for (let i = 0; i <= 24; i++) { const f = i / 24, b = bow * 4 * f * (1 - f); ch.push([E[0] + (R[0] - E[0]) * f + b * 0.8, E[1] + (R[1] - E[1]) * f + b * 0.6, E[2] + (R[2] - E[2]) * f - b * 0.2]); }
  out.chain = K.lineSvg(K.pathOf(ch.map(at)), { tone: "mid" }) + K.dotsSvg(ch.filter((_, i) => i % 2 === 0).map(at), { size: 0.75, tone: "mid" }) + K.dotsSvg([at(E), at(R)], { size: 1.2, tone: "hi" });

  // The float arm from its pivot to Mo's paws, the short lever behind the pivot, and the plunger it presses.
  const Q = C.PIVOT, th = Math.asin((S.paw - Q[2]) / C.ARM), v = [Math.cos(th), 0, Math.sin(th)], pv = [Q[0], Q[1], Z0 + Q[2]];
  const FI = C.FILL, plTop = pv[2] - 12 * v[2] - 2.5;
  out.float = K.solidSvg(K.cylinder(FI.x, FI.y, 2.6, Z0 + FI.z1 + 8, plTop - Z0 - FI.z1 - 8, P, 14), { tone: "hi" }) +
    K.solidSvg(flat([pv[0] - 13 * v[0], pv[1], pv[2] - 13 * v[2]], v, 2, 2.5, 0, 17), { tone: "mid", crease: "faint" }) +
    K.solidSvg(K.prismOf(rodF(pv, v), oct(2.2), 4, C.ARM + 3, P), { tone: "hi", crease: "faint", lit: false }) +
    K.solidSvg(K.prismOf(rodF(pv, v), [0, 1, 2, 3, 4, 5].map((i) => [4.5 * Math.cos((i / 6) * Math.PI * 2), 4.5 * Math.sin((i / 6) * Math.PI * 2)]), 22, 28, P), { tone: "hi", crease: "lo" }) +
    K.solidSvg(K.prismOf(rodF(pv, v), oct(3.2), C.ARM + 3, C.ARM + 7, P), { tone: "mid", crease: "faint" });

  // The incoming water: bubbles out of the hush tube, and the trickle from the refill tube into the overflow.
  const qi = S.open, bub = [];
  if (qi > 0.02) for (let i = 0; i < 10; i++) {
    const f = (S.t * 0.9 + i / 10) % 1, z = Z0 + 34 + f * Math.max(4, S.h - 34);
    if (z < h - 1) bub.push([...at([FI.x - 13 + 4 * Math.sin(i * 2.3 + f * 6), FI.y + 10 + 4 * f + 3 * Math.cos(i * 1.7), z]), qi * (1 - f) * 0.9 + 0.1]);
  }
  out.inflow = K.dotsSvg(bub, { size: 1, tone: "mid" });
  const OV = C.OVER, top = Z0 + OV.top + 6;
  out.trickle = qi > 0.02 ? `<path class="tc-stream" style="opacity:${Math.min(1, qi * 1.5).toFixed(2)}" d="${K.pathOf([at([OV.x, OV.y - 6, top]), at([OV.x, OV.y - 4, top - 12])])}"/>` : "";

  // The pan's water: its level rises with the flush and falls as the siphon pulls; the rim jets run while it pours.
  const B = C.BOWL, Wy = B.y - 6, wz = B.z - 92 + S.bowl, wr = 62 + S.bowl * 0.6;
  const ring = (rx, ry, z) => Array.from({ length: 48 }, (_, i) => at([B.x + rx * Math.cos((i / 48) * Math.PI * 2), Wy + ry * Math.sin((i / 48) * Math.PI * 2), z]));
  const jets = [], jet = Math.min(1, S.qout / 1.5);
  if (jet > 0.03) for (let i = 0; i < 14; i++) {
    const t = (i / 14) * Math.PI * 2 + S.swirl * 0.4, pts = [];
    for (let j = 0; j <= 6; j++) { const f = j / 6, rx = 128 - (128 - wr) * f, ry = 166 - (166 - wr * 1.25) * f; pts.push(at([B.x + rx * Math.cos(t + f * 0.5), B.y + 14 + (Wy - B.y - 14) * f + ry * Math.sin(t + f * 0.5), B.z - 4 - (B.z - 4 - wz) * f])); }
    jets.push(K.fadeLineSvg(pts, { fade: [4, 7], tone: "mid", className: "tc-rip" }));
  }
  out.bowl = `<g clip-path="url(#tc-well)"><path class="tc-pool" d="${K.pathOf(ring(wr, wr * 1.25, wz), true)}"/>` +
    `<path class="tc-wl" d="${K.pathOf(ring(wr * 0.55, wr * 0.68, wz), true)}"/><g opacity="${jet.toFixed(2)}">${jets.join("")}</g></g>`;
  return out;
}
