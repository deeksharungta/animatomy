// The parts that move, drawn from the model's state. Serialized into the page, so it uses only K, P, C and S.
export function dynamic(K, P, C, S) {
  const at = (p) => K.iso(p, P), out = {}, X = [1, 0, 0];
  const xc = (i) => i * C.PITCH + C.WALL + (C.PITCH - C.WALL) / 2;
  const sh = C.SHAFT, psi = (S.th * Math.PI) / 4, wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
  const FX = (x) => K.frameOf([x, sh.y, sh.z], X, [0, 1, 0], [0, 0, 1]);
  // A profile round the shaft: r(beta) at the angle beta from +z, turned by psi (+z turns toward -y).
  const profile = (rf, n = 48) => Array.from({ length: n }, (_, i) => { const b = (i / n) * Math.PI * 2, r = rf(wrap(b - psi)); return [-Math.sin(b) * r, Math.cos(b) * r]; });
  const turned = (x0, x1, rf, n, style) => K.solidSvg(cprism(FX(x0), profile(rf, n), 0, x1 - x0), style);
  // A prism of any outline, concave too (a cam, a slotted wheel), seen from its own frame.
  function cprism(F, poly, s0, s1) {
    const az = ((P.azimuth ?? 45) * Math.PI) / 180, el = ((P.elevation ?? 30) * Math.PI) / 180, ll = Math.hypot(1, 1.2);
    const V = [Math.cos(az) * Math.cos(el), Math.sin(az) * Math.cos(el), Math.sin(el)], Lt = [-Math.sin(az) / ll, Math.cos(az) / ll, 1.2 / ll];
    const band = (x) => [0, 0.2, 0.42, 0.62].filter((b) => x >= b).length, n = poly.length, dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    let ar = 0; for (let i = 0; i < n; i++) ar += poly[i][0] * poly[(i + 1) % n][1] - poly[(i + 1) % n][0] * poly[i][1];
    const R = ar < 0 ? [...poly].reverse() : poly, pt = (s, [u, v]) => [0, 1, 2].map((i) => F.o[i] + F.a[i] * s + F.u[i] * u + F.v[i] * v);
    const lo = R.map((q) => K.iso(pt(s0, q), P)), hi = R.map((q) => K.iso(pt(s1, q), P));
    const orient = (pts) => { let a = 0; for (let i = 0; i < pts.length; i++) a += pts[i][0] * pts[(i + 1) % pts.length][1] - pts[(i + 1) % pts.length][0] * pts[i][1]; return K.pathOf(a < 0 ? [...pts].reverse() : pts, true); };
    const bands = [[], [], [], [], []], fill = [], line = [], face = [];
    for (let j = 0; j < n; j++) {
      const [u0, v0] = R[j], [u1, v1] = R[(j + 1) % n], nm = [0, 1, 2].map((i) => F.u[i] * (v1 - v0) - F.v[i] * (u1 - u0)), l = Math.hypot(...nm) || 1;
      face.push(dot(nm, V) / l > 1e-6);
      if (face[j]) { const q = orient([lo[j], lo[(j + 1) % n], hi[(j + 1) % n], hi[j]]); fill.push(q); bands[band(dot(nm, Lt) / l)].push(q); }
    }
    const capHi = dot(F.a, V) > 0, cap = capHi ? hi : lo, far = capHi ? lo : hi, cn = capHi ? F.a : F.a.map((v) => -v);
    fill.push(orient(cap)); bands[band(dot(cn, Lt))].push(orient(cap)); line.push(K.pathOf(cap, true));
    for (let j = 0; j < n; j++) {
      if (face[j]) line.push(K.pathOf([far[j], far[(j + 1) % n]]));
      if (face[j] !== face[(j + n - 1) % n]) line.push(K.pathOf([lo[j], hi[j]]));
    }
    return { fill: fill.join(""), outline: line.join(""), crease: "", top: bands[4].join(""), shades: bands.slice(0, 4).map((b) => b.join("")) };
  }
  const shaft = (x0, x1) => K.solidSvg(K.disc(0, x1 - x0, 1.6, K.frameAlong([x0, sh.y, sh.z], X), P), { tone: "hi" });
  const lobe = (i) => (b) => { const d = Math.abs(wrap(b + (i * Math.PI) / 4)), w = 0.72; return C.CAM.r0 + (C.CAM.r1 - C.CAM.r0) * (d < w ? Math.cos((d / w) * (Math.PI / 2)) ** 2 : 0); };
  const lift = (i) => lobe(i)(wrap(-psi)) - C.CAM.r0;

  // The camshaft: shaft, pillow blocks and one lobed cam per hole, each lobe an eighth of a turn round from the last.
  const gz = C.GUIDE.z, items = [];
  for (const bx of C.BLOCKS) items.push({ x: bx, svg: K.solidSvg(K.slabOf({ x: bx - 3, y: sh.y - 4.5, w: 6, d: 9, r: 0.4 }, C.CEIL + C.BOARD, sh.z - C.CEIL - C.BOARD, P, 2), { tone: "mid" })
    + K.solidSvg(K.disc(-3, 3, 4.5, K.frameAlong([bx, sh.y, sh.z], X), P), { tone: "mid" }) + K.solidSvg(K.cylinder(bx, sh.y, 1, sh.z + 4.2, 2.2, P, 14), { tone: "hi" }) + K.solidSvg(K.cylinder(bx, sh.y, 1.5, sh.z + 6.4, 0.8, P, 16, 0.2), { tone: "hi" }) + K.dotsSvg([at([bx + 3, sh.y - 3, C.CEIL + C.BOARD + 1.4]), at([bx + 3, sh.y + 3, C.CEIL + C.BOARD + 1.4]), at([bx + 3, sh.y, sh.z])], { size: 0.5 }) });
  // The heart cam at the shaft's left end: Knock strikes its rim and it turns the shaft back to zero.
  const H = C.HEART, bc = Math.atan2(-H.dir[0], H.dir[1]), heart = (b) => 1.9 + (H.r - 1.9) * (Math.abs(wrap(b - bc)) / Math.PI);
  items.push({ x: H.x - 3, svg: turned(H.x - 1.5, H.x + 1.5, heart, 72, { tone: "hi", lit: false }) + K.solidSvg(K.disc(1.5, 2.5, 2.2, K.frameAlong([H.x, sh.y, sh.z], X), P), { tone: "mid" }) });
  for (let i = 0; i < C.N; i++) {
    const x = xc(i), foot = sh.z + C.CAM.r0 + lift(i), w = C.CAM.w / 2;
    items.push({ x, svg: turned(x - w, x + w, lobe(i), 56, { tone: "hi" }) + K.solidSvg(K.cylinder(x, sh.y, C.ROD.r, foot, gz - foot, P, 12), { tone: "hi" }) });
  }
  items.sort((a, b) => a.x - b.x);
  let x0 = sh.x0;
  out.cams = items.map((it) => { const s = shaft(x0, it.x) + it.svg; x0 = it.x; return s; }).join("") + shaft(x0, C.X1 + 6);

  // Above the guide bar: each rod's top and its flag. The raised flag names the hole.
  out.flags = Array.from({ length: C.N }, (_, i) => {
    const x = xc(i), top = sh.z + C.CAM.r0 + C.ROD.len + lift(i), F = C.FLAG, up = lift(i) / (C.CAM.r1 - C.CAM.r0);
    return K.solidSvg(K.cylinder(x, sh.y, C.ROD.r, gz + C.GUIDE.h, top - gz - C.GUIDE.h, P, 12), { tone: "hi" })
      + K.solidSvg(K.disc(0, 0.9, F.h / 2, K.frameAlong([x, sh.y + 0.9, top - 1 + F.h / 2], [0, 1, 0]), P), { tone: "hi", lit: up > 0.9 && S.duty === "" })
      + K.lineSvg(K.circleOf(K.frameAlong([x, sh.y + 0.9, top - 1 + F.h / 2], [0, 1, 0]), 0.9, F.h / 2 - 1.2, P), { tone: up > 0.5 ? "mid" : "faint" })
      + K.dotsSvg([at([x, sh.y + 1.8, top - 1 + F.h / 2])], { size: 0.7, tone: up > 0.5 ? "hi" : "mid" });
  }).join("");

  // The counter: the star wheel the drive's pin steps one slot a turn, its detent roller, the pin plate on the drive
  // axle below; outside the post, the bevel pair that turns the drive from Rocky's crank, one turn for one.
  const G = C.GEN, sl = Math.sin(Math.PI / 8), R = G.c * Math.cos(Math.PI / 8), rp = G.c * sl, dz = sh.z - G.c;
  const star = [], hw = 1.45, ri = G.c - rp - 0.9, de = Math.asin(hw / R);
  for (let k = 0; k < 8; k++) {
    const b = Math.PI + Math.PI / 8 + (k * Math.PI) / 4 + psi, e = [-Math.sin(b), Math.cos(b)], nb = [-Math.cos(b), -Math.sin(b)];
    const P2 = (r, s) => [e[0] * r + nb[0] * s, e[1] * r + nb[1] * s];
    star.push(P2(R * Math.cos(de), -hw));
    for (let j = 0; j <= 4; j++) { const f = Math.PI * (j / 4); star.push(P2(ri - Math.sin(f) * hw, -Math.cos(f) * hw)); }
    star.push(P2(R * Math.cos(de), hw));
    for (let j = 1; j < 6; j++) { const bb = b + de + ((Math.PI / 4 - 2 * de) * j) / 6; star.push([-Math.sin(bb) * R, Math.cos(bb) * R]); }
  }
  const a = S.alpha, pin = [sh.y + rp * Math.sin(a), dz + rp * Math.cos(a)];
  const along = (x, y, z, r, len, tone = "hi") => K.solidSvg(K.disc(0, len, r, K.frameAlong([x, y, z], X), P), { tone });
  out.counter = shaft(C.X1 + 6, G.x - G.w / 2) + K.solidSvg(cprism(FX(G.x - G.w / 2), star, 0, G.w), { tone: "hi" }) + along(G.x + G.w / 2, sh.y, sh.z, 3.2, 1.2, "mid")
    + K.dotsSvg([at([G.x + G.w / 2 + 1.2, sh.y, sh.z])], { size: 0.7, tone: "hi" }) + shaft(G.x + G.w / 2 + 1.2, sh.x1)
    + along(G.x + G.w / 2 + 0.3, sh.y, sh.z + R + 1.3, 1.3, 1.6, "mid")
    + along(G.x - G.w / 2 - 0.6, pin[0], pin[1], 1.1, G.w + 1.6) + along(G.x + G.w / 2 + 1, sh.y, dz, rp + 2, 1.4, "mid") + along(G.x + G.w / 2 + 2.4, sh.y, dz, 1.4, C.POST.x - G.x - G.w / 2 - 2.4);
  // The bevel pair: a wheel on the drive axle's end and a pinion on the crank's axle, square to it, teeth turning.
  const B = C.BEVEL, Cr = C.CRANK, Y = [0, 1, 0], FB = K.frameAlong([B.x, sh.y, dz], X), FP = K.frameAlong([Cr.x, Cr.y0, dz], Y);
  const cone = (F, s0, s1, r0, r1, ph) => K.solidSvg(K.lathe([[s0, r0], [s1, r1]], F, P), { tone: "hi" }) + K.lineSvg(K.ribsOf(F, s0 + 0.2, s1 - 0.2, Math.max(r0, r1) - 0.3, 16, P, { phase: ph, r1: Math.min(r0, r1) + 0.2, seams: true }), { tone: "lo" });
  out.bevel = along(C.POST.x + C.POST.w, sh.y, dz, 1.4, B.x - C.POST.x - C.POST.w) + along(C.POST.x + C.POST.w, sh.y, sh.z, 1.6, 2.4, "mid")
    + cone(FB, 0, 2.6, B.r, B.r - 2.2, a) + along(B.x + 2.6, sh.y, dz, 1.3, 0.8, "mid");
  // Rocky's crank on the front end of its axle, turning in the upright plane that faces him.
  const ga = [Cr.x + Cr.r * Math.sin(a), dz + Cr.r * Math.cos(a)], FC = K.frameOf([Cr.x, Cr.y1, dz], Y, X, [0, 0, 1]);
  out.crank = cone(FP, -2.6, 0, B.r - 2.2, B.r, -a) + K.solidSvg(K.disc(0, Cr.y1 - Cr.y0, 1.4, FP, P), { tone: "hi" })
    + K.solidSvg(K.prismOf(FC, [[-2.2, 0], [ga[0] - Cr.x - 1.4 * Math.cos(a), ga[1] - dz + 1.4 * Math.sin(a)], [ga[0] - Cr.x + 1.4 * Math.cos(a), ga[1] - dz - 1.4 * Math.sin(a)], [2.2, 0]], 0, 1.6, P), { tone: "hi" })
    + K.solidSvg(K.disc(0, 1.6, 2.4, K.frameAlong([Cr.x, Cr.y1, dz], Y), P), { tone: "hi" })
    + K.solidSvg(K.disc(1.6, 1.6 + Cr.grip, 1.3, K.frameAlong([ga[0], Cr.y1, ga[1]], Y), P), { tone: "hi" })
    + K.solidSvg(K.sphereOf([ga[0], Cr.y1 + 2.4 + Cr.grip, ga[1]], 1.8, P, { steps: 20 }), { tone: "hi" });
  out.grip = [ga[0], Cr.y1 + 1.6 + Cr.grip / 2, ga[1]];
  return out;
}
