// The ladle on its bail, drawn at the model's tilt and hook height. Inlined into the page, so it reads only its
// arguments: K (the kit and lathe), P, C and the state S.
export function ladle(K, P, C, S) {
  const Lg = C.LADLE, th = (S.th * Math.PI) / 180, zt = S.hook, x = Lg.x;
  const at = (p) => K.iso(p, P);
  const Sv = (paths, o) => K.solidSvg(paths, o);
  const Ln = (d, o) => K.lineSvg(d, o);
  const o = [x, 0, zt], a = [Math.sin(th), 0, Math.cos(th)], u = [Math.cos(th), 0, -Math.sin(th)], v = [0, 1, 0];
  const F = K.frameOf(o, a, u, v);
  const pt = (uu, vv, s) => [x + uu * u[0] + s * a[0], vv, zt + uu * u[2] + s * a[2]];
  const yA = (yy) => K.frameOf([x, yy, zt], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const rodY = (cx, cz, r, y0, y1) => K.disc(y0, y1, r, K.frameOf([cx, 0, cz], [0, 1, 0], [1, 0, 0], [0, 0, 1]), P);
  const bar = (p0, p1, w, d) => { // a flat bar between two points in a y plane, w wide in x-z and d deep in y
    const dx = p1[0] - p0[0], dz = p1[2] - p0[2], len = Math.hypot(dx, dz), ax = [dx / len, 0, dz / len];
    return K.prismOf(K.frameOf(p0, ax, [-ax[2], 0, ax[0]], [0, 1, 0]), [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]], 0, len, P);
  };
  const back = [], body = [], front = [];
  // A row of rivets round the shell, fading out toward its sides (how much each faces the viewer, by depth).
  const rivets = (s, r, n) => {
    const c = pt(0, 0, s), d0 = K.depthOf(c, P), list = [];
    const facing = Array.from({ length: n }, (_, i) => { const t = (i / n) * Math.PI * 2; return [pt(r * Math.cos(t), r * Math.sin(t), s), K.depthOf(pt(Math.cos(t), Math.sin(t), s), P) - d0]; });
    const most = Math.max(...facing.map(([, f]) => f));
    for (const [p, f] of facing) { const q = Math.max(0, Math.min(1, (f / most - 0.04) / 0.38)); if (q > 0.02) list.push([...at(p), q * q * (3 - 2 * q)]); }
    return list;
  };
  // The hook block hangs from two rope falls; the hook goes through the bail's eye.
  const zb = zt + Lg.hookUp, B = C.BEAM, drum = B.z - 29;
  // The two rope falls, drawn in the back layer before the hoist's drum, which they hang behind.
  const ropes = [];
  for (const yy of [-3.4, 3.4]) ropes.push(Sv(K.prismOf(K.frameOf([x - 5.6, yy, zb + 16], [0, 0, 1], [1, 0, 0], [0, 1, 0]), [[-0.45, -0.45], [0.45, -0.45], [0.45, 0.45], [-0.45, 0.45]], 0, drum - zb - 16, P), { tone: "mid" }));
  back.push(Sv(K.disc(-2.2, 2.2, 5.8, K.frameOf([x, 0, zb + 14], [0, 1, 0], [1, 0, 0], [0, 0, 1]), P), { tone: "mid" }));
  back.push(Sv(K.prismOf(K.frameOf([x, 0, zb + 7], [0, 0, 1], [1, 0, 0], [0, 1, 0]), [[-7, -3.2], [7, -3.2], [7, 3.2], [-7, 3.2]], 0, 6, P), { tone: "mid" }));
  back.push(K.dotsSvg([at([x - 5, 3.2, zb + 10]), at([x + 5, 3.2, zb + 10])], { size: 0.5 }));
  back.push(Sv(K.disc(0, 4, 1.4, K.frameOf([x, 0, zb + 3], [0, 0, 1], [1, 0, 0], [0, 1, 0]), P), { tone: "hi" }));
  // The bail: two arms from the trunnions to a crosshead, with an eye for the hook.
  back.push(Sv(bar([x, -41, zt], [x, -41, zb], 5, 2), { tone: "mid" }));
  back.push(Sv(rodY(x, zt, 3.4, -41, -30), { tone: "mid" }));
  // The ladle: a steel shell with its refractory lining hidden inside, two bands, a lid and a teapot spout.
  // A foot ring under the bottom, for setting the ladle down.
  body.push(Sv(K.ringBand(-Lg.wT - 2.6, -Lg.wT, 19, 23, F, P), { tone: "lo" }));
  body.push(Sv(K.solidOf([[-Lg.wT, 27], [-Lg.wT + 0.6, 29.4, 1], [-Lg.wT + 2, 30], [26, 30], [26, 31.4], [28, 31.4]], F, P), { tone: "mid" }));
  const phi = Math.atan2(0.866, 0.5 * Math.cos(th)), on = (r, t, s) => pt(r * Math.cos(t), r * Math.sin(t), s);
  body.push(Ln(K.segment(on(30, phi - 0.7, -21), on(30, phi - 0.7, 26), P), { tone: "faint" }));
  body.push(K.dotsSvg([-19, -15, -11, -7, -3, 1, 9.5, 13.5, 17.5, 21.5, 25].map((ss) => at(on(30.1, phi - 0.66, ss))), { size: 0.38 }));
  for (const s of [-22, 6]) {
    body.push(Sv(K.ringBand(s, s + 2.2, 29.9, 31, F, P), { tone: "mid" }));
    body.push(K.dotsSvg(rivets(s + 1.1, 31, 44), { size: 0.38 }));
  }
  body.push(Sv(K.disc(28, 29.6, 30.4, F, P), { tone: "mid" }));
  body.push(Sv(K.ringBand(29.6, 30.2, 15.4, 17, F, P), { tone: "mid" }));
  body.push(Sv(K.disc(29.6, 31.6, 5, F, P), { tone: "mid" }));
  body.push(Sv(K.ringBand(31.6, 33.2, 2.2, 3.4, K.frameOf(pt(0, 0, 33), u, v, a), P), { tone: "hi" }));
  const lidDots = [];
  for (let i = 0; i < 12; i++) { const t = (i / 12) * Math.PI * 2; lidDots.push(pt(26 * Math.cos(t), 26 * Math.sin(t), 29.6)); }
  body.push(K.dotsSvg(lidDots.filter((p) => p[1] * 0.866 + (p[0] - x) * 0.5 > -14).map(at), { size: 0.5 }));
  // On the side you see: a weld seam between the bands, and a capacity plate riveted to the shell.
  const plate = [];
  for (let i = 0; i <= 4; i++) { const t = phi + 0.05 + (i / 4) * 0.36; plate.push([30.6 * Math.cos(t), 30.6 * Math.sin(t)]); }
  plate.push([29.9 * Math.cos(phi + 0.41), 29.9 * Math.sin(phi + 0.41)], [29.9 * Math.cos(phi + 0.05), 29.9 * Math.sin(phi + 0.05)]);
  body.push(Sv(K.prismOf(F, plate, -17, -8, P), { tone: "mid" }));
  body.push(Ln([[-10, 0.3], [-12.4, 0.24], [-14.8, 0.16]].map(([s, w]) => K.segment(on(30.7, phi + 0.12, s), on(30.7, phi + 0.12 + w, s), P)).join(""), { tone: "lo", free: true }));
  body.push(K.dotsSvg([on(30.7, phi + 0.09, -9), on(30.7, phi + 0.37, -9), on(30.7, phi + 0.09, -16), on(30.7, phi + 0.37, -16)].map(at), { size: 0.4 }));
  // Two lifting handles on the lid, each two posts and a bar; and the lid's hinge at the back, two knuckles on a pin.
  const box = (u0, u1, v0, v1, s0, s1) => Sv(K.prismOf(F, [[u0, v0], [u1, v0], [u1, v1], [u0, v1]], s0, s1, P), { tone: "mid" });
  for (const sv of [-1, 1]) {
    for (const uu of [-7, 5]) body.push(box(uu, uu + 2, sv * 21 - 1, sv * 21 + 1, 29.6, 34));
    body.push(box(-7.4, 7.4, sv * 21 - 0.9, sv * 21 + 0.9, 34, 35.4));
  }
  for (const vv of [-12, 8]) body.push(box(-30.6, -26.6, vv, vv + 4, 29.6, 31.6));
  body.push(Sv(K.disc(-12.6, 12.6, 1, K.frameOf(pt(-28.6, 0, 30.6), v, u, a), P), { tone: "hi" }));
  const sp = [[29.4, -3.6], [34.4, -2.6], [34.4, 2.6], [29.4, 3.6]];
  body.push(Sv(K.prismOf(F, sp, -14, 26, P), { tone: "mid" }));
  body.push(Sv(K.prismOf(F, [[29.4, -4.2], [37.4, -3], [37.4, 3], [29.4, 4.2]], 26, 28.4, P), { tone: "mid" }));
  const mouth = [[31.4, -1.8], [35.8, -1.4], [35.8, 1.4], [31.4, 1.8]].map(([uu, vv]) => at(pt(uu, vv, 28.42)));
  body.push(`<path class="sc-mouth" d="${K.pathOf(mouth, true)}"/>`);
  // The near trunnion carries the worm wheel in its case; the worm below it turns on the handwheel's shaft.
  front.push(Sv(rodY(x, zt, 3.4, 30, 34), { tone: "mid" }));
  front.push(Sv(K.disc(34, 39, 13, yA(0), P), { tone: "mid", inner: "" }));
  front.push(Sv(K.ringBand(37.6, 39, 13, 14, yA(0), P), { tone: "mid" }));
  const ticks = [];
  for (let d = 0; d <= 90; d += 10) {
    const t = (d * Math.PI) / 180, r0 = d % 30 ? 11 : 10;
    ticks.push(K.segment([x + r0 * Math.sin(t), 39, zt + r0 * Math.cos(t)], [x + 12.6 * Math.sin(t), 39, zt + 12.6 * Math.cos(t)], P));
  }
  front.push(Ln(ticks.join(""), { tone: "lo" }));
  front.push(K.dotsSvg([0.9, 2.5, 4.1, 5.6].map((t) => at([x + 11.8 * Math.cos(t), 39, zt - 11.8 * Math.sin(t)])), { size: 0.5 }));
  front.push(Sv(K.disc(39, 40.4, 3.6, yA(0), P), { tone: "hi" }));
  front.push(Ln(K.segment([x, 40.4, zt], [x + 9.6 * Math.sin(th), 40.4, zt + 9.6 * Math.cos(th)], P), { tone: "hi", free: "end" }));
  front.push(K.dotsSvg([at([x, 40.4, zt])], { size: 0.9, tone: "hi" }));
  const wz = zt - 13, wy = 36.5, ax = K.frameOf([x, wy, wz], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  front.push(Sv(K.solidOf([[-15, 0], [-15, 3.6], [-13, 4.4], [9, 4.4], [11, 3.6], [11, 0]], ax, P), { tone: "mid" }));
  front.push(Sv(K.disc(-21, -15, 0.9, ax, P), { tone: "hi" }));
  // The handwheel: rim, five spokes and a hub, turned by you; one turn tips the ladle 6 degrees.
  const wx = x - 21, R = C.WHEEL.r, ang = S.wheel * Math.PI * 2;
  const wf = K.frameOf([wx, wy, wz], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  const spokes = [];
  for (let i = 0; i < 5; i++) {
    const t = ang + (i / 5) * Math.PI * 2;
    spokes.push([Math.cos(t), Math.sin(t)]);
  }
  const pts = (c) => [wx, wy + c[0], wz + c[1]];
  const sorted = spokes.slice().sort((p, q) => p[0] - q[0]);
  // A spoke is a bar in the wheel's own (y-z) plane, w wide in that plane and d deep along the axle (x).
  const spoke = (p0, p1, w, d) => {
    const v = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]], len = Math.hypot(...v), u = v.map((a) => a / len);
    return K.prismOf(K.frameOf(p0, u, [0, -u[2], u[1]], [1, 0, 0]), [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]], 0, len, P);
  };
  for (const c of sorted) front.push(Sv(spoke(pts([c[0] * 1.6, c[1] * 1.6]), pts([c[0] * (R - 0.6), c[1] * (R - 0.6)]), 1.1, 0.9), { tone: "hi" }));
  front.push(Sv(K.disc(-1.4, 1.4, 2.2, wf, P), { tone: "hi" }));
  const ring = (dx, r) => K.pathOf(Array.from({ length: 48 }, (_, i) => at([wx + dx, wy + r * Math.cos((i / 48) * Math.PI * 2), wz + r * Math.sin((i / 48) * Math.PI * 2)])), true);
  const annulus = (dx, cls) => '<path class="' + cls + '" fill-rule="evenodd" d="' + ring(dx, R + 0.4) + ring(dx, R - 1.1) + '"/>' + Ln(ring(dx, R + 0.4) + ring(dx, R - 1.1), { tone: "hi" });
  front.push('<g class="iso-solid sc-rim">' + annulus(-0.8, "iso-shade sc-rim-back") + annulus(0.8, "iso-top") + "</g>");
  const kn = [wx, wy + spokes[0][0] * (R - 0.3), wz + spokes[0][1] * (R - 0.3)];
  front.push(Sv(K.disc(-6, -0.8, 0.9, K.frameOf(kn, [1, 0, 0], [0, 1, 0], [0, 0, 1]), P), { tone: "hi" }));
  front.push(Sv(bar([x, 41, zt], [x, 41, zb], 5, 2), { tone: "mid" }));
  front.push(Sv(K.prismOf(K.frameOf([x, -43, zb], [0, 1, 0], [1, 0, 0], [0, 0, 1]), [[-3, -1], [3, -1], [3, 3.4], [-3, 3.4]], 0, 86, P), { tone: "mid" }));
  front.push(K.dotsSvg([4, 14, 24, 34, 44].map((dz) => at([x, 42, zt + dz])), { size: 0.5 }));
  // The eye on the crosshead that the crane's hook goes through.
  front.push(Sv(K.ringBand(-1, 1, 1.4, 3, K.frameOf([x, 0, zb + 5.6], [0, 1, 0], [1, 0, 0], [0, 0, 1]), P), { tone: "hi" }));
  // The lip, where the steel leaves, in world space for the stream.
  const lip = pt(Lg.lipU, 0, Lg.lipW);
  return { back: back.join(""), body: body.join(""), front: front.join(""), ropes: ropes.join(""), lip };
}
