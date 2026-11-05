// What turns each frame, as markup: the barrel's crown teeth and hook, the arbor's ratchet, click and key, the pinion
// leaves, the cylinder's pins, the wheel's teeth and holes, the intermediate train's teeth, the endless screw's
// thread, the fly and the start lever. Serialized into the page as it stands; K carries the kit and lathe functions.
// S.tb is the barrel's turns, S.al the arbor's angle; the cylinder turns twice per barrel turn and the fly 300 times
// per cylinder turn.
export function moving(K, P, C, S) {
  const at = (p) => K.iso(p, P), out = {}, TAU = Math.PI * 2, d2r = Math.PI / 180;
  const B = C.BARREL, Y = C.CYL, beta = S.tb * TAU, phi = 2 * beta;
  const V = [Math.cos(P.azimuth * d2r) * Math.cos(P.elevation * d2r || 0.5236), Math.sin(P.azimuth * d2r) * Math.cos(P.elevation * d2r || 0.5236), 0.5];
  const near = (a) => { const m = (((a / d2r - (P.azimuth - 90)) % 360) + 360) % 360; return m < 180; };
  const box = (r0, r1, a, half, z0, h) => {
    const t = [-Math.sin(a), Math.cos(a)], rr = [Math.cos(a), Math.sin(a)];
    const pts = [[r0, -half], [r1, -half], [r1, half], [r0, half]].map(([r, s]) => [B.x + r * rr[0] + s * t[0], B.y + r * rr[1] + s * t[1]]);
    return K.solidSvg(K.extrude(pts, z0, h, P), { tone: "hi", crease: "lo" });
  };
  // Crown teeth round the barrel's rim, split into the far half (behind Roo) and the near half (in front).
  const back = [], front = [];
  for (let i = 0; i < B.teeth; i++) {
    const a = beta + (i / B.teeth) * TAU, dep = K.depthOf([B.x + B.r * Math.cos(a), B.y + B.r * Math.sin(a), B.z1], P);
    (near(a) ? front : back).push([dep, box(B.r - 1.8, B.r, a, 1.35, B.z1 + 0.8, B.toothH)]);
  }
  const sorted = (l) => l.sort((p, q) => p[0] - q[0]).map((p) => p[1]).join("");
  const hookA = (C.PLACE.roo.psi0 * d2r) + beta;
  // The barrel's hook: a stud in the floor that Roo's heels brace against, the spring's outer end.
  const hr = C.PLACE.roo.r + 1.8, hk = [B.x + hr * Math.cos(hookA), B.y + hr * Math.sin(hookA)];
  out.crownBack = sorted(back) + K.solidSvg(K.cylinder(hk[0], hk[1], 1.5, B.z0 + B.floor, 3.2, P, 16), { tone: "hi", crease: "lo" }) + box(hr + 1, B.r - B.wall, hookA, 1, B.z0 + B.floor, 1);
  out.crownFront = sorted(front);

  // The arbor's top: upper post, the 16-tooth ratchet, the click riding its teeth, its spring, and the key.
  const R = C.RATCHET, al = S.al, rk = (a) => { const f = ((((a - al) / TAU) * R.teeth) % 1 + 1) % 1; return R.r - 1.6 * f; };
  const tooth = [];
  for (let i = 0; i < R.teeth * 4; i++) { const a = (i / (R.teeth * 4)) * TAU; tooth.push([B.x + rk(a) * Math.cos(a), B.y + rk(a) * Math.sin(a)]); }
  const piv = [B.x - 13, 2.5], ca = 2.62, rn = rk(ca) - 0.2;
  const nose = [B.x + rn * Math.cos(ca), B.y + rn * Math.sin(ca)];
  const dx = nose[0] - piv[0], dy = nose[1] - piv[1], ln = Math.hypot(dx, dy), nx = -dy / ln, ny = dx / ln;
  const click = [[piv[0] + nx * 1.4, piv[1] + ny * 1.4], [nose[0] + nx * 0.3, nose[1] + ny * 0.3], [nose[0] - nx * 0.3, nose[1] - ny * 0.3], [piv[0] - nx * 1.4, piv[1] - ny * 1.4]];
  const zc = C.COCK.z + C.COCK.h, Kk = C.KEY;
  out.ratchet = K.solidSvg(K.cylinder(B.x, B.y, C.ARBOR.r, zc, R.z - zc, P, 24), { tone: "hi" }) +
    K.solidSvg(K.extrude(tooth, R.z, R.h, P, { convex: false }), { tone: "hi", crease: "lo" }) +
    K.solidSvg(K.extrude(click, R.z, R.h, P), { tone: "mid", crease: "lo" }) +
    K.lineSvg(K.pathOf([[B.x - 17, -2.5, zc + 1], [B.x - 15, 0.5, zc + 1.2], [(piv[0] + nose[0]) / 2 - nx * 0.85, (piv[1] + nose[1]) / 2 - ny * 0.85, R.z + R.h]].map(at)), { tone: "mid" }) +
    K.dotsSvg([at([B.x - 17, -2.5, zc + 1]), at([piv[0], piv[1], R.z + R.h])], { size: 0.5, tone: "mid" }) +
    K.solidSvg(K.cylinder(B.x, B.y, 2.2, R.z + R.h, Kk.z1 - R.z - R.h, P, 20), { tone: "hi" });
  const KF = K.frameOf([B.x, B.y, Kk.bow[0]], [-Math.sin(al), Math.cos(al), 0], [Math.cos(al), Math.sin(al), 0], [0, 0, 1]);
  const w = Kk.w / 2, h = Kk.bow[1] - Kk.bow[0];
  out.key = K.solidSvg(K.prismOf(KF, [[-2.4, -1], [2.4, -1], [3.4, h * 0.2], [w - 1, h * 0.3], [w, h * 0.55], [w - 1.4, h * 0.85], [w - 4, h], [-w + 4, h], [-w + 1.4, h * 0.85], [-w, h * 0.55], [-w + 1, h * 0.3], [-3.4, h * 0.2]], -Kk.t / 2, Kk.t / 2, P), { tone: "hi", crease: "lo" }) +
    K.dotsSvg([at(K.pointOf(KF, Kk.t / 2, 0, 0).map((v, i) => v + [0, 0, h * 0.62][i]))], { size: 0.9, tone: "lo" });

  // Leaves, teeth and pins: ribs on the turning bodies, at their angles.
  const fx = (x, y, z) => K.frameOf([x, y, z], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  const teeth = (F, len, r, n, phase, tone = "lo") => K.fadedSvg(K.ribsOf(F, 0, len, r, n, P, { phase, fade: [0.05, 0.35], seams: true }), { tone });
  out.pinion = teeth(fx(C.PINION.x0, Y.y, Y.z), C.PINION.x1 - C.PINION.x0, C.PINION.r - 1, C.PINION.leaves, phi, "mid");
  out.wheel = teeth(fx(C.WHEEL.x0, Y.y, Y.z), C.WHEEL.x1 - C.WHEEL.x0, C.WHEEL.r - 0.9, C.WHEEL.teeth, phi);
  const holes = [];
  for (let i = 0; i < 4; i++) { const t = phi + (i / 4) * TAU + 0.4; holes.push(K.pathOf(Array.from({ length: 20 }, (_, j) => { const u = (j / 20) * TAU; return at([C.WHEEL.x1, Y.y + 13 * Math.cos(t) + 4 * Math.cos(u), Y.z + 13 * Math.sin(t) + 4 * Math.sin(u)]); }), true)); }
  out.holes = `<path class="mb-void" d="${holes.join("")}"/>`;
  const Mi = C.MID, pm = -phi * (C.RATIO.wheel / C.RATIO.mid);
  out.midPin = teeth(fx(C.WHEEL.x0, Mi.y, Mi.z), C.WHEEL.x1 - C.WHEEL.x0, Mi.pin - 0.6, Mi.leaves, pm);
  out.midWheel = teeth(fx(Mi.wx0, Mi.y, Mi.z), Mi.wx1 - Mi.wx0, Mi.wr - 0.6, Mi.teeth, pm);
  const fly = C.PLACE.fly - phi * C.FLY_PER_CYL, Wm = C.WORM;
  out.thread = K.fadedSvg(K.ribsOf(K.frameOf([Wm.x, Wm.y, Wm.z0], [0, 0, 1], [1, 0, 0], [0, 1, 0]), 0, Wm.z1 - Wm.z0, Wm.r, 2, P, { phase: fly, twist: 5 * TAU, fade: [0.05, 0.4] }), { tone: "mid" });
  // The cylinder's pins: one dot where each pin stands out of the brass, on the side the camera sees.
  const pins = [];
  for (const p of C.TUNE) {
    const a = C.TIP - ((p.beat + C.OFFSET) / C.BEATS) * TAU + phi, n = [0, Math.cos(a), Math.sin(a)];
    const face = n[1] * V[1] + n[2] * V[2] + n[0] * V[0];
    if (face > 0.12) pins.push(at([C.TX[p.tooth], Y.y + (Y.r + 0.6) * n[1], Y.z + (Y.r + 0.6) * n[2]]));
  }
  out.pins = K.dotsSvg(pins, { size: 0.85, tone: "mid" });

  // The fly: a boss and two vanes; spinning, the vanes fade into the drum they sweep.
  const F = C.FLY, spin = Math.min(1, S.flyRpm / 1500);
  const vane = (a) => K.solidSvg(K.prismOf(K.frameOf([Wm.x, Wm.y, F.z0], [-Math.sin(a), Math.cos(a), 0], [Math.cos(a), Math.sin(a), 0], [0, 0, 1]), [[F.boss, 0], [F.r, 0], [F.r, F.z1 - F.z0], [F.boss, F.z1 - F.z0]], -0.4, 0.4, P), { tone: "hi", crease: "lo", lit: S.lit === "fly" });
  const va = [fly, fly + Math.PI].sort((a, b) => K.depthOf([Wm.x + Math.cos(a), Wm.y + Math.sin(a), 0], P) - K.depthOf([Wm.x + Math.cos(b), Wm.y + Math.sin(b), 0], P));
  out.fly = K.solidSvg(K.cylinder(Wm.x, Wm.y, 0.9, C.GOV.z + C.GOV.h, F.z1 + 3 - C.GOV.z - C.GOV.h, P, 12), { tone: "hi" }) +
    `<g opacity="${(1 - 0.82 * spin).toFixed(2)}">${vane(va[0])}${K.solidSvg(K.cylinder(Wm.x, Wm.y, F.boss, F.z0 - 1, F.z1 - F.z0 + 2, P, 20), { tone: "hi" })}${vane(va[1])}</g>` +
    (spin > 0.02 ? `<g class="mb-blur" opacity="${(0.7 * spin).toFixed(2)}"><g opacity="0.25">${K.solidSvg(K.cylinder(Wm.x, Wm.y, F.r, F.z0, F.z1 - F.z0, P, 48), { tone: "faint", crease: "none" })}</g>${K.lineSvg(K.ring(Wm.x, Wm.y, F.r, F.z0, P, 48) + K.ring(Wm.x, Wm.y, F.r, F.z1, P, 48), { tone: S.lit === "fly" ? "lit" : "mid" })}</g>` : "");
  // The start lever: a rod tipping in its slot from Stop (back) to Play (forward), with a ball knob.
  const Lv = C.LEVER, tl = (-Lv.tilt + 2 * Lv.tilt * S.lever) * d2r, dir = [0, Math.sin(tl), Math.cos(tl)];
  const LF = K.frameOf([Lv.x, Lv.y, Lv.z], dir, [1, 0, 0], [0, Math.cos(tl), -Math.sin(tl)]);
  out.lever = K.solidSvg(K.prismOf(LF, [[-1.1, -1.1], [1.1, -1.1], [1.1, 1.1], [-1.1, 1.1]], 0, Lv.len, P), { tone: "hi", crease: "lo" }) +
    K.solidSvg(K.sphereOf([Lv.x, Lv.y + dir[1] * (Lv.len + 2.6), Lv.z + dir[2] * (Lv.len + 2.6)], 3.4, P), { tone: "hi" });
  return out;
}
