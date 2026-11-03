// The parts that move, drawn from the model's state; serialized into the page, so they use only their arguments.
export function partsKit(K, P) {
  const at = (p) => K.iso(p, P);
  const face = (x, y, z) => K.frameOf([x, y, z], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const flat = (poly, y0, y1) => K.prismOf(face(0, 0, 0), poly, y0, y1, P);
  const rot = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
  const bar = (a, b, w0, w1, y0, y1) => {
    const d = [b[0] - a[0], b[1] - a[1]], len = Math.hypot(d[0], d[1]), n = [-d[1] / len, d[0] / len];
    return flat([[a[0] + n[0] * w0, a[1] + n[1] * w0], [b[0] + n[0] * w1, b[1] + n[1] * w1], [b[0] - n[0] * w1, b[1] - n[1] * w1], [a[0] - n[0] * w0, a[1] - n[1] * w0]], y0, y1);
  };
  // The screen matrix that turns the x-z plane at y by angle a about (cx, cz).
  const spin = (cx, y, cz, a) => {
    const o = at([cx, y, cz]), ex = at([cx + 1, y, cz]), ez = at([cx, y, cz + 1]);
    const A = [ex[0] - o[0], ex[1] - o[1], ez[0] - o[0], ez[1] - o[1]], det = A[0] * A[3] - A[2] * A[1];
    const c = Math.cos(a), s = Math.sin(a);
    const R = [A[0] * c + A[2] * s, A[1] * c + A[3] * s, -A[0] * s + A[2] * c, -A[1] * s + A[3] * c];
    const m = [(R[0] * A[3] - R[2] * A[1]) / det, (R[1] * A[3] - R[3] * A[1]) / det, (-R[0] * A[2] + R[2] * A[0]) / det, (-R[1] * A[2] + R[3] * A[0]) / det];
    const e = o[0] - (m[0] * o[0] + m[2] * o[1]), f = o[1] - (m[1] * o[0] + m[3] * o[1]);
    const r = (v) => Math.round(v * 10000) / 10000;
    return "matrix(" + [m[0], m[1], m[2], m[3], e, f].map(r).join(" ") + ")";
  };
  return { at, face, flat, rot, bar, spin };
}

export function drawn(K, P, C, S, Q, M) {
  const out = {}, A = M.anglesOf(S), B = C.BARREL, solid = K.solidSvg, line = K.lineSvg, at = Q.at;
  out.barrelT = Q.spin(B.x, B.yF, B.z, A.barrel);
  out.coverT = Q.spin(B.x, B.yF + 0.4, B.z, A.barrel);
  out.ratchetT = Q.spin(B.x, C.RATCHET.y1, B.z, A.arbor);
  out.interT = Q.spin(C.INTER.x, C.INTER.yW + 0.6, C.INTER.z, A.inter);
  out.rearT = Q.spin(C.WHEEL.rearX, C.WHEEL.near[1] - 0.2, C.WHEEL.z, A.axle);
  out.frontT = Q.spin(C.WHEEL.frontX, C.WHEEL.near[1] - 0.2, C.WHEEL.z, A.axle);
  out.worldT = K.translateAlong(P, [-S.roll, 0, 0]);
  // The mainspring from its hook in the barrel wall in to the arbor: wound tight round the arbor, let down against the wall.
  const Sp = C.SPRING, turns = Sp.coils + S.W, p = 0.35 + 0.95 * S.W, n = Math.ceil(turns * 56), pts = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n, r = Sp.rIn + (Sp.rOut - Sp.rIn) * Math.pow(1 - u, p), a = A.barrel - u * turns * 2 * Math.PI;
    pts.push(at([B.x + r * Math.cos(a), Sp.y, B.z + r * Math.sin(a)]));
  }
  const hook = (rr) => at([B.x + rr * Math.cos(A.barrel), Sp.y, B.z + rr * Math.sin(A.barrel)]);
  out.spring = line(K.pathOf(pts), { tone: "hi" }) + line(K.pathOf([hook(Sp.rOut), hook(B.drum - 0.8)]), { tone: "hi" }) + K.dotsSvg([hook(B.drum - 0.8), pts[n]], { size: 0.7, tone: "hi" });
  // Pressed ribs on the drum's inner wall, from its back to its mouth: the floor Roo treads, turning with it.
  const az = ((P.azimuth ?? 45) * Math.PI) / 180, el = ((P.elevation ?? 30) * Math.PI) / 180, V = [Math.cos(az) * Math.cos(el), Math.sin(az) * Math.cos(el), Math.sin(el)], ri = B.drum - 0.8, ribs = [];
  for (let i = 0; i < B.ribs; i++) {
    const t = A.barrel + (i / B.ribs) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t);
    const alpha = Math.max(0, Math.min(1, (-(c * V[0] + s * V[2]) - 0.08) / 0.3));
    if (alpha > 0.02) ribs.push({ d: K.pathOf([at([B.x + ri * c, B.yF + 0.4, B.z + ri * s]), at([B.x + ri * c, B.y1, B.z + ri * s])]), alpha });
  }
  out.drumRibs = K.fadedSvg(ribs, { tone: "lo" });
  // The pinions' leaves, turning with their arbors.
  const leaves = (x, z, r, y0, y1, count, a) => K.fadedSvg(K.ribsOf(Q.face(x, y0, z), 0, y1 - y0, r, count, P, { phase: a, fade: [0.08, 0.5] }), { tone: "lo" });
  out.interLeaves = leaves(C.INTER.x, C.INTER.z, C.INTER.pin - 0.3, C.INTER.yP0 + 1.6, C.INTER.yP1, C.INTER.np, A.inter);
  out.axleLeaves = leaves(C.WHEEL.rearX, C.WHEEL.z, C.AXPIN.r - 0.3, C.AXPIN.y0, C.AXPIN.y1, C.AXPIN.n, A.axle);
  // The click: it rides up each ratchet tooth's ramp as you wind and drops behind its steep face.
  const Ck = C.CLICK, Rt = C.RATCHET, psi = Ck.psi, u = M.clickOf(C, A.arbor), rr = Rt.root + (Rt.r - Rt.root) * Math.min(1, u / 0.96) + 0.25;
  const tipAt = (rad) => [B.x + rad * Math.cos(psi), B.z + rad * Math.sin(psi)];
  const angOf = (q) => Math.atan2(q[1] - Ck.pivot[1], q[0] - Ck.pivot[0]);
  const tip = tipAt(rr), arm = [tip[0] - Ck.pivot[0], tip[1] - Ck.pivot[1]];
  const t0 = [Ck.tail[0] - Ck.pivot[0], Ck.tail[1] - Ck.pivot[1]];
  const tv = Q.rot(t0, angOf(tip) - angOf(tipAt(Rt.root + 0.25))), tail = [Ck.pivot[0] + tv[0], Ck.pivot[1] + tv[1]];
  out.click = solid(Q.bar(Ck.pivot, tip, 1.3, 0.7, Ck.y0, Ck.y1), { tone: "hi" }) + solid(Q.bar(Ck.pivot, tail, 1.3, 1, Ck.y0, Ck.y1), { tone: "hi" }) +
    solid(K.disc(0, 0.6, 1.9, Q.face(Ck.pivot[0], Ck.y1, Ck.pivot[1]), P), { tone: "hi", crease: "lo" });
  const mid = [Ck.pivot[0] + arm[0] * 0.55, Ck.pivot[1] + arm[1] * 0.55], y = Ck.y1 + 0.1, anchor = [Ck.pivot[0] + 3.4, y, Ck.pivot[1] + 4.4];
  out.click += line(K.pathOf([anchor, [Ck.pivot[0] + 0.4, y, Ck.pivot[1] + 4.6], [mid[0], y, mid[1] + 1.1]].map(at)), { tone: "mid" }) + K.dotsSvg([at(anchor)], { size: 0.6, tone: "lo" });
  out.clickTail = [tail[0], Ck.y1 + 0.6, tail[1]];
  out.clickU = u;
  // The key: a butterfly bow on the arbor's end, turned by you.
  const Ky = C.KEY, ka = A.arbor, ur = [Math.cos(ka), 0, Math.sin(ka)], ua = [-Math.sin(ka), 0, Math.cos(ka)];
  const F = K.frameOf([B.x, Ky.y0 + 1.6, B.z], ua, ur, [0, 1, 0]);
  const lobe = (c) => Array.from({ length: 14 }, (_, i) => [c * 6.2 + 4.4 * Math.cos((i / 14) * Math.PI * 2), 5.6 + 4 * Math.sin((i / 14) * Math.PI * 2)]);
  const neck = [[-2.4, 0], [2.4, 0], [3.2, 4], [-3.2, 4]];
  const near = K.depthOf(ua, P) - K.depthOf([0, 0, 0], P) > 0 ? 1 : -1;
  const hole = (c) => K.pathOf(Array.from({ length: 16 }, (_, i) => { const rr = c * 6.6 + 1.5 * Math.cos((i / 16) * Math.PI * 2), o = 0.62 * near; return at([B.x + ur[0] * rr + ua[0] * o, Ky.y0 + 7.2 + 1.5 * Math.sin((i / 16) * Math.PI * 2), B.z + ur[2] * rr + ua[2] * o]); }), true);
  out.key = solid(K.disc(0, 2, 2.6, Q.face(B.x, Ky.y0, B.z), P), { tone: "hi", crease: "lo" }) + solid(K.prismOf(F, neck, -0.6, 0.6, P), { tone: "hi" }) +
    [-1, 1].map((c) => solid(K.prismOf(F, lobe(c), -0.6, 0.6, P), { tone: "hi", inner: line(hole(c), { tone: "lo" }) })).join("");
  // The brake lever: it turns on its stud; its shoe bears on the barrel's drum until it swings off.
  const Bk = C.BRAKE, ang = Bk.swing * S.brake, piv = Bk.pivot;
  const turn = (p) => { const v = Q.rot([p[0] - piv[0], p[1] - piv[1]], ang); return [piv[0] + v[0], piv[1] + v[1]]; };
  const grip = turn(Bk.grip), lo = turn(Bk.tail), sh = Bk.shoe;
  const lx = (z) => piv[0] + ((Bk.tail[0] - piv[0]) * (piv[1] - z)) / (piv[1] - Bk.tail[1]) - 0.9;
  const pad = [[sh[0] + 0.25, sh[1] - 3], [sh[0] - 0.2, sh[1] + 3], [lx(sh[1] + 3.6), sh[1] + 3.6], [lx(sh[1] - 3.6), sh[1] - 3.6]].map(turn);
  out.brake = solid(Q.flat(pad, Bk.y0 - 0.6, Bk.y1 + 0.6), { tone: "mid" }) + solid(Q.bar(turn(piv), lo, 1.2, 1, Bk.y0, Bk.y1), { tone: "hi" }) + solid(Q.bar(turn([Bk.grip[0], Bk.grip[1] + 3]), turn([Bk.grip[0] + 0.2, Bk.grip[1] - 4.5]), 1.6, 1.6, Bk.y0 - 0.3, Bk.y1 + 0.3), { tone: "mid" }) +
    solid(K.disc(0, 0.6, 1.8, Q.face(piv[0], Bk.y1, piv[1]), P), { tone: "hi", crease: "lo" });
  out.grip = [turn([Bk.grip[0] + 0.6, Bk.grip[1] + 1.2]), turn([Bk.grip[0] + 0.8, Bk.grip[1] - 2.4])].map(([x, z]) => [x, Bk.y1 + 0.5, z]);
  return out;
}
