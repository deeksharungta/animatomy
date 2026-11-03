// The derailleur and chain as pure functions of the model's numbers, serialized into the page too.

// The parallelogram turned to psi: the guide pulley's centre J1 and the P-knuckle above it.
export function linkage(C, psi) {
  const A = C.ARC, J1 = [0, 1, 2].map((i) => A.c[i] + C.LINK * (Math.cos(psi) * A.e1[i] + Math.sin(psi) * A.e2[i]));
  return { J1, P: [J1[0] - C.F[0], J1[1] - C.F[1], J1[2] - C.F[2]] };
}

export function psiFor(C, y) {
  let a = -0.3, b = C.ARC.end + 0.3;
  for (let i = 0; i < 40; i++) { const m = (a + b) / 2; if (linkage(C, m).J1[1] > y) a = m; else b = m; }
  return (a + b) / 2;
}

export function lerpCog(C, pos, key) {
  const i = Math.max(0, Math.min(9, Math.floor(pos))), f = Math.max(0, Math.min(1, pos - i));
  return C[key][i] + (C[key][i + 1] - C[key][i]) * f;
}

// The straight run between two circles the chain wraps, in the x-z plane; s is +1 for anticlockwise.
export function tangent(c1, r1, s1, c2, r2, s2) {
  const D = [c2[0] - c1[0], c2[1] - c1[1]], L = Math.hypot(D[0], D[1]), k = s2 * r2 - s1 * r1, b = Math.atan2(D[1], D[0]);
  let best = null;
  for (const sg of [1, -1]) {
    const f = b + sg * Math.acos(Math.max(-1, Math.min(1, k / L))), n = [Math.cos(f), Math.sin(f)], d = [n[1], -n[0]];
    const pts = [[c1[0] - s1 * r1 * n[0], c1[1] - s1 * r1 * n[1]], [c2[0] - s2 * r2 * n[0], c2[1] - s2 * r2 * n[1]]];
    if (d[0] * D[0] + d[1] * D[1] > 0) return pts;
    best = best || pts;
  }
  // Overlapping circles have no crossing run; the solver only passes through such angles on its way.
  return best;
}

// The closed chain: chainring, lower jockey, guide jockey, the cog it is on; straight runs and arcs, in travel order.
export function chainLoop(C, psi, phi, pos) {
  const { J1 } = linkage(C, psi), J2 = [J1[0] - C.CAGE * Math.sin(phi), J1[1], J1[2] - C.CAGE * Math.cos(phi)];
  const circles = [
    { c: [C.RING.x, C.RING.z], r: C.RING.r, s: 1, y: C.RING.y, der: false },
    { c: [J2[0], J2[2]], r: C.RJ, s: 1, y: J1[1], der: true },
    { c: [J1[0], J1[2]], r: C.RJ, s: -1, y: J1[1], der: true },
    { c: [0, 0], r: lerpCog(C, pos, "R"), s: 1, y: lerpCog(C, pos, "Y"), der: false },
  ];
  const runs = circles.map((a, i) => { const b = circles[(i + 1) % 4]; return tangent(a.c, a.r, a.s, b.c, b.r, b.s); });
  const segs = [];
  circles.forEach((a, i) => {
    const t0 = runs[(i + 3) % 4][1], t1 = runs[i][0], a0 = Math.atan2(t0[1] - a.c[1], t0[0] - a.c[0]), a1 = Math.atan2(t1[1] - a.c[1], t1[0] - a.c[0]);
    const T = Math.PI * 2, wrap = a.s > 0 ? ((a1 - a0) % T + T) % T : -(((a0 - a1) % T + T) % T);
    // A wrap that has come all the way round is the chain leaving the guide pulley's teeth: it bends the other way.
    const sweep = Math.abs(wrap) > 5.5 ? wrap - Math.sign(wrap) * T : wrap;
    segs.push({ arc: true, c: a.c, r: a.r, a0, sweep, y: a.y, len: Math.abs(sweep) * a.r, der: a.der });
    const b = circles[(i + 1) % 4], [p, q] = runs[i];
    segs.push({ arc: false, p, q, y0: a.y, y1: b.y, len: Math.hypot(q[0] - p[0], q[1] - p[1]), der: a.der || b.der });
  });
  return { segs, J1, J2, total: segs.reduce((s, g) => s + g.len, 0) };
}

export function chainLength(C, psi, phi, pos) {
  return chainLoop(C, psi, phi, pos).total;
}

// The cage spring turns the cage until the chain is taut: the angle at which the loop is exactly the chain's length.
export function solvePhi(C, psi, pos) {
  let a = -0.8, b = 1.5;
  for (let i = 0; i < 36; i++) { const m = (a + b) / 2; if (chainLength(C, psi, m, pos) > C.CHAIN) a = m; else b = m; }
  return (a + b) / 2;
}

// A point s along the loop, in 3D, and whether the derailleur holds that stretch.
export function pointAt(loop, s) {
  for (const g of loop.segs) {
    if (s <= g.len) {
      const f = g.len ? s / g.len : 0;
      if (g.arc) { const a = g.a0 + g.sweep * f; return { p: [g.c[0] + g.r * Math.cos(a), g.y, g.c[1] + g.r * Math.sin(a)], der: g.der }; }
      return { p: [g.p[0] + (g.q[0] - g.p[0]) * f, g.y0 + (g.y1 - g.y0) * f, g.p[1] + (g.q[1] - g.p[1]) * f], der: g.der };
    }
    s -= g.len;
  }
  return pointAt(loop, 0);
}
