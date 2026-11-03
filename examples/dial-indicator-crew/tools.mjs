// Drawing helpers shared by the build and the page. Inlined into the page, so they use only their arguments.
// F is the indicator's frame { O, U, N }: X along U, Y up, D along N toward you.
export function tools(K, P, F) {
  const at = (p) => K.iso(p, P);
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const L = (X, Y, D) => [F.O[0] + X * F.U[0] + D * F.N[0], F.O[1] + X * F.U[1] + D * F.N[1], F.O[2] + Y];
  const ngon = (r, n) => Array.from({ length: n }, (_, i) => [r * Math.cos(((i + 0.5) / n) * Math.PI * 2), r * Math.sin(((i + 0.5) / n) * Math.PI * 2)]);
  const frame = (o, a) => { const u = Math.abs(a[2]) > 0.9 ? [1, 0, 0] : [0, 0, 1]; const v = norm(cross(a, u)); return K.frameOf(o, a, norm(cross(v, a)), v); };
  // The dial plane as a screen map: a point (x, y) of a plane at depth D lands at o(D) + A·(x, y).
  const o0 = at(L(0, 0, 0)), ex = at(L(1, 0, 0)), ey = at(L(0, 1, 0));
  const A = [ex[0] - o0[0], ex[1] - o0[1], ey[0] - o0[0], ey[1] - o0[1]];
  const pl = (D) => { const o = at(L(0, 0, D)); return (x, y) => [o[0] + A[0] * x + A[2] * y, o[1] + A[1] * x + A[3] * y]; };
  const path = (pts, closed) => pts.map((q, i) => (i ? "L" : "M") + q[0].toFixed(2) + " " + q[1].toFixed(2)).join("") + (closed ? "Z" : "");
  const circle = (cx, cy, r, D, n = 48) => { const f = pl(D); return path(Array.from({ length: n }, (_, i) => f(cx + r * Math.cos((i / n) * 6.2832), cy + r * Math.sin((i / n) * 6.2832))), true); };
  // The SVG matrix that turns a drawing in the dial plane by `turn` radians (counter-clockwise from the front)
  // about its own centre (cx, cy) in the plane at depth D: A · R · A⁻¹ about the centre's screen point.
  const det = A[0] * A[3] - A[1] * A[2];
  const turnAbout = (cx, cy, D, turn) => {
    const c = Math.cos(turn), s = Math.sin(turn);
    const RA = [c * A[3] - s * -A[1], s * A[3] + c * -A[1], c * -A[2] - s * A[0], s * -A[2] + c * A[0]].map((v) => v / det);
    const m = [A[0] * RA[0] + A[2] * RA[1], A[1] * RA[0] + A[3] * RA[1], A[0] * RA[2] + A[2] * RA[3], A[1] * RA[2] + A[3] * RA[3]];
    const q = pl(D)(cx, cy);
    return "matrix(" + [m[0], m[1], m[2], m[3], q[0] - m[0] * q[0] - m[2] * q[1], q[1] - m[1] * q[0] - m[3] * q[1]].map((v) => v.toFixed(4)).join(" ") + ")";
  };
  // A toothed outline: n teeth between the root and tip radii, four points a tooth.
  const teeth = (cx, cy, r0, r1, n, D) => {
    const f = pl(D), pts = [], w = Math.PI / n;
    for (let i = 0; i < n; i++) {
      const b = (i / n) * Math.PI * 2;
      for (const [da, r] of [[-w * 0.5, r0], [-w * 0.24, r1], [w * 0.24, r1], [w * 0.5, r0]]) pts.push(f(cx + r * Math.cos(b + da), cy + r * Math.sin(b + da)));
    }
    return path(pts, true);
  };
  // A flat spiral (the hairspring) from radius r0 to r1 over `turns`, its inner end turned `wind` radians.
  const spiral = (cx, cy, r0, r1, turns, D, wind, a0 = 0) => {
    const f = pl(D), pts = [], n = Math.ceil(turns * 40);
    for (let i = 0; i <= n; i++) {
      const t = i / n, r = r0 + (r1 - r0) * t;
      const ang = a0 - t * turns * Math.PI * 2 + wind * (1 - t);
      pts.push(f(cx + r * Math.cos(ang), cy + r * Math.sin(ang)));
    }
    return { d: path(pts), start: pts[0], end: pts[pts.length - 1] };
  };
  return {
    at, L, pl, A, path, circle, turnAbout, teeth, spiral, cross, norm,
    S: (paths, o) => K.solidSvg(paths, o),
    Ln: (d, o) => K.lineSvg(d, o),
    D: (pts, o) => K.dotsSvg(pts, o),
    seg: (a, b) => K.segment(a, b, P),
    // A round rod between two world points.
    rodAB: (a, b, r, n = 14) => { const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], l = Math.hypot(d[0], d[1], d[2]); return K.prismOf(frame(a, norm(d)), ngon(r, n), 0, l, P); },
    // A flat bar between two points, `w` wide across `side` and `t` thick.
    barAB: (a, b, side, w, t) => { const d = norm([b[0] - a[0], b[1] - a[1], b[2] - a[2]]), l = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]); const v = norm(cross(d, side)); return K.prismOf(K.frameOf(a, d, side, v), [[-w / 2, -t / 2], [w / 2, -t / 2], [w / 2, t / 2], [-w / 2, t / 2]], 0, l, P); },
    // A box in the indicator's frame: X, Y and D spans.
    boxL: (x0, x1, y0, y1, d0, d1) => K.prismOf(K.frameOf(L(x0, y0, d0), [0, 0, 1], F.U, F.N), [[0, 0], [x1 - x0, 0], [x1 - x0, d1 - d0], [0, d1 - d0]], 0, y1 - y0, P),
    ball: (c, r) => K.sphereOf(c, r, P, { steps: 24 }),
    // A coil spring round a vertical axis at world (x, y), split into the half behind its axis and the half in front.
    helix: (x, y, z0, z1, r, turns) => {
      const back = [], front = [], n = Math.ceil(turns * 24), V = [Math.cos(((P.azimuth ?? 45) * Math.PI) / 180), Math.sin(((P.azimuth ?? 45) * Math.PI) / 180)];
      let run = [], near = null;
      for (let i = 0; i <= n; i++) {
        const t = (i / n) * turns * Math.PI * 2, p = [x + r * Math.cos(t), y + r * Math.sin(t), z0 + ((z1 - z0) * i) / n];
        const f = Math.cos(t) * V[0] + Math.sin(t) * V[1] > 0;
        if (near === null) near = f;
        if (f !== near) { run.push(at(p)); (near ? front : back).push(K.pathOf(run)); run = [at(p)]; near = f; continue; }
        run.push(at(p));
      }
      if (run.length > 1) (near ? front : back).push(K.pathOf(run));
      return { back: back.join(""), front: front.join("") };
    },
  };
}
