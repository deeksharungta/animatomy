// Drawing helpers shared by the build and the page. Inlined into the page, so they use only their arguments.
export function tools(K, P) {
  const at = (p) => K.iso(p, P);
  const r = (d) => (d * Math.PI) / 180;
  const a = r(P.azimuth ?? 45), e = r(P.elevation ?? 30);
  const V = [Math.cos(a) * Math.cos(e), Math.sin(a) * Math.cos(e), Math.sin(e)];
  const nl = Math.hypot(Math.sin(a), Math.cos(a), 1.2), Lt = [-Math.sin(a) / nl, Math.cos(a) / nl, 1.2 / nl];
  const dot = (p, q) => p[0] * q[0] + p[1] * q[1] + p[2] * q[2];
  const unit = (p) => { const l = Math.hypot(p[0], p[1], p[2]) || 1; return [p[0] / l, p[1] / l, p[2] / l]; };
  const band = (s) => (s >= 0.62 ? 4 : s >= 0.42 ? 3 : s >= 0.2 ? 2 : s >= 0 ? 1 : 0);
  const area = (pts) => pts.reduce((s, p, i) => { const q = pts[(i + 1) % pts.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0);
  const wind = (pts) => (area(pts) < 0 ? [...pts].reverse() : pts);
  const path = (pts, closed) => K.pathOf(pts, closed);
  const W = (F, s, x, y) => [F.o[0] + F.a[0] * s + F.u[0] * x + F.v[0] * y, F.o[1] + F.a[1] * s + F.u[1] * x + F.v[1] * y, F.o[2] + F.a[2] * s + F.u[2] * x + F.v[2] * y];
  // A prism of any outline (convex or not) in the frame's (u, v) plane, from s0 to s1 along a, shaded like the kit's.
  function body(F, ring, s0, s1) {
    const g = area(ring) < 0 ? [...ring].reverse() : ring, n = g.length;
    const c0 = g.map(([x, y]) => at(W(F, s0, x, y))), c1 = g.map(([x, y]) => at(W(F, s1, x, y)));
    const capUp = dot(F.a, V) >= 0, top = capUp ? c1 : c0, bot = capUp ? c0 : c1;
    const capN = capUp ? F.a : [-F.a[0], -F.a[1], -F.a[2]];
    const nrm = g.map(([x0, y0], j) => { const [x1, y1] = g[(j + 1) % n]; return unit([F.u[0] * (y1 - y0) - F.v[0] * (x1 - x0), F.u[1] * (y1 - y0) - F.v[1] * (x1 - x0), F.u[2] * (y1 - y0) - F.v[2] * (x1 - x0)]); });
    const face = nrm.map((m) => dot(m, V) > 1e-9);
    const buckets = [[], [], [], [], []], fill = [path(wind(top), true)], outline = [], crease = [];
    buckets[band(dot(capN, Lt))].push(path(top, true));
    for (let j = 0; j < n; j++) if (face[j]) { const q = [top[j], top[(j + 1) % n], bot[(j + 1) % n], bot[j]]; buckets[band(dot(nrm[j], Lt))].push(path(q, true)); fill.push(path(wind(q), true)); }
    // Runs of edges by whether their side faces the viewer: the cap's edge where it doesn't, the far rim where it does.
    const start = face.findIndex((f, j) => f !== face[(j + n - 1) % n]);
    if (start < 0) { (face[0] ? outline : outline).push(path(face[0] ? bot : top, true)); if (face[0]) crease.push(path(top, true)); }
    else for (let i = 0, j = start; i < n;) {
      const f = face[j], run = [j];
      while (i < n && face[j] === f) { j = (j + 1) % n; run.push(j); i++; }
      (f ? outline : outline).push(path(run.map((m) => (f ? bot : top)[m])));
      if (f) crease.push(path(run.map((m) => top[m])));
      outline.push(path([top[j], bot[j]]));
    }
    for (let j = 0; j < n; j++) {
      const p = (j + n - 1) % n, d0 = [g[j][0] - g[p][0], g[j][1] - g[p][1]], d1 = [g[(j + 1) % n][0] - g[j][0], g[(j + 1) % n][1] - g[j][1]];
      const c = (d0[0] * d1[0] + d0[1] * d1[1]) / (Math.hypot(d0[0], d0[1]) * Math.hypot(d1[0], d1[1]) || 1);
      if (face[j] && face[p] && c < 0.94) crease.push(path([top[j], bot[j]]));
    }
    return { fill: fill.join(""), outline: outline.join(""), crease: crease.join(""), top: buckets[4].join(""), shades: buckets.slice(0, 4).map((b) => b.join("")) };
  }
  // The plug's frame turned `deg` with its top toward the viewer: a into the lock, u across (the cut's normal), v up.
  const plugF = (deg, o = [0, 0, 0]) => { const c = Math.cos(r(deg)), s = Math.sin(r(deg)); return { o, a: [-1, 0, 0], u: [0, c, -s], v: [0, s, c] }; };
  // Outlines in a frame's plane: half discs on the kept (−u) or front (+u) side, circles, rectangles.
  const arc = (cx, cy, rad, a0, a1, n) => Array.from({ length: n + 1 }, (_, i) => { const t = r(a0 + ((a1 - a0) * i) / n); return [cx + rad * Math.cos(t), cy + rad * Math.sin(t)]; });
  const half = (rad, side = -1, n = 24) => (side < 0 ? arc(0, 0, rad, 90, 270, n) : arc(0, 0, rad, -90, 90, n));
  const circle = (cx, cy, rad, n = 28) => arc(cx, cy, rad, 0, 360 - 360 / n, n - 1);
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  // An axis-aligned box in world coordinates.
  const box = (x0, x1, y0, y1, z0, z1) => body({ o: [0, 0, Math.min(z0, z1)], a: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] }, rect(Math.min(x0, x1), Math.min(y0, y1), Math.max(x0, x1), Math.max(y0, y1)), 0, Math.abs(z1 - z0));
  // A flat outline lying in a frame's plane at depth s, as a screen path.
  const flat = (F, s, pts, closed = true) => path(pts.map(([x, y]) => at(W(F, s, x, y))), closed);
  // The section plane y = 0 as a frame (x right, z up) facing the viewer.
  const CUT = { o: [0, 0, 0], a: [0, 1, 0], u: [1, 0, 0], v: [0, 0, 1] };
  const onCut = (pts, y = 0.02, closed = true) => path(pts.map(([x, z]) => at([x, y, z])), closed);
  return { at, V, Lt, dot, unit, W, body, plugF, arc, half, circle, rect, box, flat, CUT, onCut, faces: (F) => dot(F.u, V) > 0,
    S: (p, o) => K.solidSvg(p, o), Ln: (d, o) => K.lineSvg(d, o), D: (pts, o) => K.dotsSvg(pts, o) };
}
