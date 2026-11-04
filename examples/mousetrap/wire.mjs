// Bent steel wire, drawn as round rods (a ten-sided prism per leg) with a ball at every bend and at both ends.
// Pure and serialized into the page as it stands, so it uses only K (the kit and lathe on the page) and P.
export function wireOf(K, P, pts, r, { tone = "hi", n = 10, ends = true, cls = "" } = {}) {
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const len = (a) => Math.hypot(a[0], a[1], a[2]);
  const unit = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const ring = Array.from({ length: n }, (_, i) => [r * Math.cos(((i + 0.5) / n) * Math.PI * 2), r * Math.sin(((i + 0.5) / n) * Math.PI * 2)]);
  const items = [];
  const style = { tone, className: cls || undefined };
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], d = sub(b, a), l = len(d);
    if (l < 1e-3) continue;
    const ax = unit(d), u = unit(cross(ax, Math.abs(ax[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0])), v = cross(ax, u);
    const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
    items.push([K.depthOf(mid, P), K.solidSvg(K.prismOf(K.frameOf(a, ax, u, v), ring, 0, l, P), style)]);
  }
  pts.forEach((p, i) => {
    const end = i === 0 ? 0 : i === pts.length - 1 ? 1 : -1;
    if (end >= 0 && !(Array.isArray(ends) ? ends[end] : ends)) return;
    items.push([K.depthOf(p, P) + 0.01, K.solidSvg(K.sphereOf(p, r, P, { steps: 20 }), style)]);
  });
  return items.sort((a, b) => a[0] - b[0]).map((x) => x[1]).join("");
}

// Round every corner of a polyline with a bend of radius R (clamped to half the shorter leg), n points per bend.
export function bendOf(pts, R, n = 4) {
  const out = [pts[0]];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const len = (a) => Math.hypot(a[0], a[1], a[2]);
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i], a = sub(pts[i - 1], p), b = sub(pts[i + 1], p), la = len(a), lb = len(b);
    const ua = a.map((x) => x / la), ub = b.map((x) => x / lb);
    const cos = ua[0] * ub[0] + ua[1] * ub[1] + ua[2] * ub[2], half = Math.acos(Math.max(-1, Math.min(1, cos))) / 2;
    const cut = Math.min(R / Math.tan(half || 1e-6), la / 2, lb / 2);
    const s = p.map((x, k) => x + ua[k] * cut), e = p.map((x, k) => x + ub[k] * cut);
    // A quadratic through the corner is close enough to an arc at these sizes.
    for (let j = 0; j <= n; j++) {
      const t = j / n, q = (1 - t) * (1 - t), w = 2 * t * (1 - t), z = t * t;
      out.push([0, 1, 2].map((k) => q * s[k] + w * p[k] + z * e[k]));
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}
