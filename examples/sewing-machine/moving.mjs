// What changes each frame, as markup: the wheel's rungs and spokes, the belt's teeth, the handwheel's spokes, the
// crank and its link, the take-up lever (inside and outside the head), the needle (below the plate, and above the
// cloth with its clamp), and the cloth with the stitches in it. Serialized into the page as it stands.
export function dynamic(K, P, C, S) {
  const at = (p) => K.iso(p, P), out = {}, TAU = Math.PI * 2;
  const m = ((S.th % TAU) + TAU) % TAU, N = C.NEEDLE, BT = C.BT, CT = BT + 0.6 + C.CLOTH.t;
  // The wheel: 28 rungs between its rims and six spokes on each rim.
  const W = C.WHEEL, rungs = [], spokes = [];
  for (let i = 0; i < 28; i++) { const t = S.wheel + (i / 28) * TAU; rungs.push(K.pathOf([at([W.x0, W.y + W.r * Math.cos(t), W.z + W.r * Math.sin(t)]), at([W.x1, W.y + W.r * Math.cos(t), W.z + W.r * Math.sin(t)])])); }
  for (const x of [W.x0, W.x1]) for (let i = 0; i < 6; i++) { const t = S.wheel + (i / 6) * TAU + 0.26; spokes.push(K.pathOf([at([x, W.y + 3.4 * Math.cos(t), W.z + 3.4 * Math.sin(t)]), at([x, W.y + (W.r - 1.4) * Math.cos(t), W.z + (W.r - 1.4) * Math.sin(t)])])); }
  out.rungs = K.lineSvg(rungs.join(""), { tone: "mid" });
  out.spokes = K.lineSvg(spokes.join(""), { tone: "mid" });
  // The belt's teeth, running up its near strand as the wheel turns.
  const Q = C.PULL, SH = C.SHAFT, c1 = [W.y, W.z], c2 = [SH.y, SH.z], dd = Math.hypot(c2[0] - c1[0], c2[1] - c1[1]);
  const t0 = Math.atan2(c2[1] - c1[1], c2[0] - c1[0]) + Math.acos((Q.r1 - Q.r2) / dd);
  const a = [c1[0] + Q.r1 * Math.cos(t0), c1[1] + Q.r1 * Math.sin(t0)], b = [c2[0] + Q.r2 * Math.cos(t0), c2[1] + Q.r2 * Math.sin(t0)];
  const run = Math.hypot(b[0] - a[0], b[1] - a[1]), teeth = [], ph = (((-S.wheel * Q.r1) % 5) + 5) % 5;
  for (let s = ph + 1; s < run - 1; s += 5) { const u = s / run, y = a[0] + (b[0] - a[0]) * u, z = a[1] + (b[1] - a[1]) * u; teeth.push(K.pathOf([at([Q.x - 2.6, y + 0.8 * Math.cos(t0), z + 0.8 * Math.sin(t0)]), at([Q.x + 2.6, y + 0.8 * Math.cos(t0), z + 0.8 * Math.sin(t0)])])); }
  out.belt = K.lineSvg(teeth.join(""), { tone: "faint" });
  // The handwheel's five spokes and the shaft pulley's two holes turn with the shaft.
  const HW = C.HAND, hs = [];
  for (let i = 0; i < 5; i++) { const t = S.th + (i / 5) * TAU; hs.push(K.solidSvg(K.prismOf(K.frameOf([HW.x - HW.w + 2, SH.y, SH.z], [Math.cos(t) * 0, Math.cos(t), Math.sin(t)], [1, 0, 0], [0, -Math.sin(t), Math.cos(t)]), [[0, -2], [5, -2], [5, 2], [0, 2]], 7.5, HW.r - 5.5, P), { tone: "mid" })); }
  out.hand = hs.join("");
  // The crank on the shaft's end: a disc with its counterweight, the pin, and the link up to the take-up lever.
  const T = C.TAKE, ang = T.a0 + (T.a1 - T.a0) * K.kin(C, S.th).up;
  const lever = (s) => [T.x, T.y + s * Math.cos(ang), T.z + s * Math.sin(ang)];
  const cr = S.th - 0.9, pin = [SH.x1 + 1, SH.y + 8 * Math.cos(cr), SH.z + 8 * Math.sin(cr)];
  const F = K.frameOf([SH.x1 - 5, SH.y, SH.z], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  out.crank = K.solidSvg(K.disc(0, 5, 11, F, P), { tone: "hi", crease: "lo" }) +
    K.solidSvg(K.prismOf(K.frameOf([SH.x1 - 5, SH.y, SH.z], [1, 0, 0], [0, Math.cos(cr + Math.PI), Math.sin(cr + Math.PI)], [0, -Math.sin(cr + Math.PI), Math.cos(cr + Math.PI)]), [[4, -8], [13, -6], [13, 6], [4, 8]], 0, 5, P), { tone: "mid" }) +
    K.solidSvg(K.disc(0, 4, 1.6, K.frameOf([SH.x1, pin[1], pin[2]], [1, 0, 0], [0, 1, 0], [0, 0, 1]), P), { tone: "hi" });
  const lp = lever(16), dir = [lp[0] - pin[0] - 3, lp[1] - pin[1], lp[2] - pin[2]], dl = Math.hypot(...dir), u = dir.map((v) => v / dl);
  const side = [0, -u[2], u[1]].map((v) => v / (Math.hypot(u[1], u[2]) || 1));
  out.link = K.solidSvg(K.prismOf(K.frameOf([pin[0] + 3, pin[1], pin[2]], u, [1, 0, 0], side), [[-1, -1.8], [1, -1.8], [1, 1.8], [-1, 1.8]], 0, dl, P), { tone: "hi", crease: "lo" });
  // The take-up lever: a bar from its stud through the slot, and its eye, which the thread runs through.
  const nrm = [0, -Math.sin(ang), Math.cos(ang)], LF = K.frameOf([T.x, T.y, T.z], [0, Math.cos(ang), Math.sin(ang)], [1, 0, 0], nrm);
  const bar = (s0, s1) => K.solidSvg(K.prismOf(LF, [[-1.6, -2.4], [1.6, -2.4], [1.6, 2.4], [-1.6, 2.4]], s0, s1, P), { tone: "hi", crease: "lo", lit: S.lit === "take" });
  const sIn = (C.HEAD.y + C.HEAD.d - 4 - T.y) / Math.cos(ang);
  out.takeIn = bar(0, sIn);
  const eye = lever(T.len), EF = K.frameOf(eye, [1, 0, 0], [0, Math.cos(ang), Math.sin(ang)], nrm);
  out.takeOut = bar(sIn, T.len - 2) + K.solidSvg(K.ringBand(-1.6, 1.6, 1.2, 3, EF, P), { tone: "hi", lit: S.lit === "take" });
  out.eye = eye;
  // The needle: its blade and point below the plate, and above the cloth with its shank and the clamp in Knock's beak.
  const k = K.kin(C, S.th), [nx, ny] = C.N, NF = K.frameOf([nx, ny, k.tip], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const prof = [[0, 0.05], [2.4, 0.9], [N.len - 9, 0.9], [N.len - 9, 1.4], [N.len, 1.4]];
  const clip = (s0, s1) => { const r = (s) => { for (let i = 1; i < prof.length; i++) if (s <= prof[i][0]) { const [a0, r0] = prof[i - 1], [a1, r1] = prof[i]; return a1 === a0 ? r1 : r0 + ((r1 - r0) * (s - a0)) / (a1 - a0); } return 1.4; }; return [[s0, r(s0)], ...prof.filter(([s]) => s > s0 && s < s1), [s1, r(s1)]]; };
  const below = Math.min(N.len, BT - C.SKIN - k.tip), above = Math.max(0, CT - k.tip);
  out.needleLow = below > 0.3 ? K.solidSvg(K.solidOf(clip(0, below), NF, P), { tone: "hi", lit: S.lit === "needle" }) : "";
  const top = k.top, cl = { x: nx - 2.6, y: ny - 2.6, w: 5.2, d: 5.2, r: 0.6 };
  out.needleHigh = (above < N.len ? K.solidSvg(K.solidOf(clip(above, N.len), NF, P), { tone: "hi", lit: S.lit === "needle" }) : "") +
    K.solidSvg(K.slabOf(cl, top, N.clamp, P, 2, 0.3), { tone: "mid" }) +
    K.solidSvg(K.disc(0, 3, 1.8, K.frameOf([nx + 2.6, ny, top + 3.5], [1, 0, 0], [0, 1, 0], [0, 0, 1]), P), { tone: "hi" });
  out.needleEye = [nx, ny, k.tip + 2.6];
  // The cloth: two layers of denim, cut at the section, sliding back by the feed; its back hangs over the bed's edge.
  const L0 = C.CLOTH, X = C.CUT.x, Y = C.CUT.y, X2 = C.CUT.x2, Y2 = C.CUT.y2, z0 = BT + 0.6, yA = L0.y0 - S.off, yB = L0.y1 - S.off, edge = C.BED.y;
  const flatA = Math.max(yA, edge), yr = Math.min(yB, Y);
  const poly = yB <= Y2 ? [[L0.x0, flatA], [L0.x1, flatA], [L0.x1, yB], [L0.x0, yB]] : [[L0.x0, flatA], [L0.x1, flatA], [L0.x1, yr], [X2, yr], [X2, Y2], [X, Y2], [X, yB], [L0.x0, yB]];
  let cloth = K.solidSvg(K.extrude(poly, z0, L0.t, P, { convex: false }), { tone: "hi", crease: "lo" });
  if (yA < edge) {
    const DF = K.frameOf([L0.x0, edge, z0 + L0.t], [1, 0, 0], [0, -Math.cos(1.1), -Math.sin(1.1)], [0, -Math.sin(1.1), Math.cos(1.1)]);
    cloth = K.solidSvg(K.prismOf(DF, [[0, -L0.t], [edge - yA, -L0.t], [edge - yA, 0], [0, 0]], 0, L0.x1 - L0.x0, P), { tone: "mid" }) + cloth;
  }
  // The weave: faint lines across the cloth, every 6 mm, moving with it.
  const weave = [];
  for (let v = Math.ceil((flatA + S.off + 1) / 6) * 6; v - S.off < yB - 1; v += 6) { const y = v - S.off; if (y < Y2) weave.push(K.pathOf([at([L0.x0, y, CT]), at([L0.x1, y, CT])])); else { weave.push(K.pathOf([at([L0.x0, y, CT]), at([X, y, CT])])); if (y < Y) weave.push(K.pathOf([at([X2, y, CT]), at([L0.x1, y, CT])])); } }
  out.cloth = cloth + K.lineSvg(weave.join(""), { tone: "lo" });
  // The stitches: the top thread lies between each pair of holes, on the cloth's top.
  const st = [];
  for (let i = 1; i < S.holes.length; i++) {
    const y1 = S.holes[i - 1] - S.off, y2 = S.holes[i] - S.off;
    if (y1 > Y - 1 || y2 < edge + 1) continue;
    st.push(K.pathOf([at([nx, Math.max(edge, y1) + 0.8, CT + 0.15]), at([nx, Math.min(Y, y2) - 0.8, CT + 0.15])]));
  }
  out.stitches = st.length ? `<path class="sm-thread sm-stitch" d="${st.join("")}"/>` : "";
  return out;
}
