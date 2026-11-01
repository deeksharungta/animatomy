// The pixel eel: no sprite, its body is laid in screen cells along the rig's spine, so it can lie along any
// wire. Belly on one side, fin along the other, a head with one eye, and its crackle as thin lines on top.
export function pxEelCells(c) {
  const { p, n, hw, fin, D, cell } = c.px, N = p.length - 1, cells = {}, zap = {};
  const C = (q) => [q[0] / cell, q[1] / cell];
  const P = p.map(C), R = hw.map((h) => h / cell), F = fin.map((f) => f / cell);
  const xs = P.map((q) => q[0]), ys = P.map((q) => q[1]), m = Math.max(...R) + Math.max(...F) + 3;
  for (let i = Math.floor(Math.min(...xs) - m); i <= Math.max(...xs) + m; i++) for (let j = Math.floor(Math.min(...ys) - m); j <= Math.max(...ys) + m; j++) {
    const q = [i + 0.5, j + 0.5];
    let best = null;
    for (let s = 0; s < N; s++) {
      const d = [P[s + 1][0] - P[s][0], P[s + 1][1] - P[s][1]], L = d[0] * d[0] + d[1] * d[1] || 1;
      const t = Math.max(0, Math.min(1, ((q[0] - P[s][0]) * d[0] + (q[1] - P[s][1]) * d[1]) / L));
      const dist = Math.hypot(P[s][0] + d[0] * t - q[0], P[s][1] + d[1] * t - q[1]);
      if (!best || dist < best.dist) best = { dist, s: s + t };
    }
    const s = Math.round(best.s), r = R[s], side = (q[0] - P[s][0]) * n[s][0] + (q[1] - P[s][1]) * n[s][1];
    if (best.dist <= r) cells[`${i},${j}`] = side < -r * 0.3 && s < N * 0.5 ? "B" : s > 1 && s < 3.2 ? "C" : "F";
    else if (side < 0 && best.dist <= r + F[s]) cells[`${i},${j}`] = "s";
  }
  // The head: a round end a little wider than the neck, with the eye on the upper side.
  const up = n[0][1] < 0 ? n[0] : [-n[0][0], -n[0][1]], h0 = R[0], d = D;
  const H = [P[0][0] + d[0] * h0 * 0.6, P[0][1] + d[1] * h0 * 0.6];
  for (let i = Math.floor(H[0] - h0 * 1.4); i <= H[0] + h0 * 1.4; i++) for (let j = Math.floor(H[1] - h0 * 1.4); j <= H[1] + h0 * 1.4; j++)
    if (Math.hypot(i + 0.5 - H[0], j + 0.5 - H[1]) <= h0 * 1.15) cells[`${i},${j}`] = "F";
  const eye = [Math.floor(H[0] + d[0] * h0 * 0.35 + up[0] * h0 * 0.45), Math.floor(H[1] + d[1] * h0 * 0.35 + up[1] * h0 * 0.45)];
  cells[`${eye[0]},${eye[1]}`] = c.eyes === "shut" ? "K" : "E";
  cells[`${Math.floor(H[0] + d[0] * h0)},${Math.floor(H[1] + d[1] * h0)}`] = "N";
  // The crackle, from the rig's own zap path.
  const pts = (c.dyn.zap ?? "").split("M").filter(Boolean).map((s) => s.split("L").map((q) => C(q.split(",").map(Number))));
  for (const run of pts) for (let k = 1; k < run.length; k++) {
    const [a, b] = [run[k - 1], run[k]], n2 = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) * 2);
    for (let t = 0; t <= n2; t++) zap[`${Math.floor(a[0] + ((b[0] - a[0]) * t) / (n2 || 1))},${Math.floor(a[1] + ((b[1] - a[1]) * t) / (n2 || 1))}`] = "Z";
  }
  // Only the sparks off the body are drawn, so the eel itself stays readable.
  for (const k of Object.keys(zap)) if (cells[k]) delete zap[k];
  return { cells, zap };
}
