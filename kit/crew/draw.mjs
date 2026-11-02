// ---------- drawing
export const RAD = Math.PI / 180;
export const n1 = (v) => { const r = Math.round(v * 10) / 10; return Object.is(r, -0) ? "0" : String(r); };
export const pt = (p) => `${n1(p[0])},${n1(p[1])}`;
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
export const add = (a, b, t = 1) => [a[0] + b[0] * t, a[1] + b[1] * t];
export const len = (a) => Math.hypot(a[0], a[1]);
export const unit = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l]; };
export const rotp = ([x, y], a, [cx, cy] = [0, 0]) => { const c = Math.cos(a), s = Math.sin(a), dx = x - cx, dy = y - cy; return [cx + dx * c - dy * s, cy + dx * s + dy * c]; };

export function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A smooth curve through points (Catmull-Rom as cubic Béziers). A third element marks a corner.
export function curve(pts, closed = true, steps = 8) {
  const n = pts.length;
  const at = (i) => pts[closed ? ((i % n) + n) % n : Math.max(0, Math.min(n - 1, i))];
  const segs = [];
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    const c1 = p1[2] ? p1 : [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = p2[2] ? p2 : [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    segs.push([p1, c1, c2, p2]);
  }
  const d = `M${pt(pts[0])}` + segs.map((s) => `C${pt(s[1])} ${pt(s[2])} ${pt(s[3])}`).join("") + (closed ? "Z" : "");
  const poly = [];
  for (const [a, b, c, e] of segs) {
    for (let j = 0; j < steps; j++) {
      const t = j / steps, u = 1 - t;
      poly.push([u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * e[0], u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * e[1]]);
    }
  }
  if (!closed) poly.push(pts[n - 1]);
  return { d, poly };
}

export const area = (poly) => { let s = 0; for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length]; s += a[0] * b[1] - b[0] * a[1]; } return s / 2; };
export function inside(poly, x, y) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}
export const bounds = (poly) => poly.reduce((b, [x, y]) => [Math.min(b[0], x), Math.min(b[1], y), Math.max(b[2], x), Math.max(b[3], y)], [1e9, 1e9, -1e9, -1e9]);

export function resample(poly, gap, closed = true) {
  const out = [];
  let carry = 0;
  const n = poly.length;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const a = poly[i], b = poly[(i + 1) % n];
    const l = len(sub(b, a));
    let t = carry;
    while (t < l) { out.push(add(a, sub(b, a), t / l)); t += gap; }
    carry = t - l;
  }
  return out;
}

// Fur along an edge: short strokes that start just inside and lean with the coat's flow.
// Returns three paths split by how the edge faces the light.
export function tufts(poly, { len: L = 2, gap = 1.5, flow = [0.35, 1], lean = 0.55, seed = 1, light = [-0.6, -0.8], only = null }) {
  const r = rng(seed);
  const sgn = area(poly) > 0 ? 1 : -1;
  const pts = resample(poly, gap);
  const out = { lit: "", mid: "", shade: "" };
  const fl = unit(flow);
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], q = pts[(i + 1) % pts.length], o = pts[(i - 1 + pts.length) % pts.length];
    const t = unit(sub(q, o));
    const nrm = [t[1] * sgn, -t[0] * sgn];
    if (only && !only(p, nrm)) continue;
    const l = L * (0.65 + 0.7 * r());
    const dir = unit(add(nrm, fl, lean));
    const b = add(p, nrm, -l * 0.55);
    const tip = add(b, dir, l * 1.25);
    const c = add(add(b, dir, l * 0.6), [-dir[1], dir[0]], (r() - 0.5) * l * 0.5);
    const lit = nrm[0] * light[0] + nrm[1] * light[1];
    const key = lit > 0.3 ? "lit" : lit < -0.35 ? "shade" : "mid";
    out[key] += `M${pt(b)}Q${pt(c)} ${pt(tip)}`;
  }
  return out;
}

// Hair strands inside a shape, along the coat's flow.
export function strands(poly, { count = 60, len: L = 4, flow = [0.35, 1], seed = 7, light = [-0.6, -0.8] }) {
  const r = rng(seed);
  const [x0, y0, x1, y1] = bounds(poly);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, w = x1 - x0, h = y1 - y0;
  const fl = unit(flow);
  const out = { lit: "", shade: "" };
  let tries = 0, made = 0;
  while (made < count && tries < count * 8) {
    tries++;
    const x = x0 + r() * w, y = y0 + r() * h;
    if (!inside(poly, x, y)) continue;
    made++;
    const l = L * (0.6 + 0.8 * r());
    const bend = (r() - 0.5) * 0.6;
    const d = unit(add(fl, [-fl[1], fl[0]], bend));
    const a = [x, y], b = add(a, d, l), c = add(add(a, d, l * 0.5), [-d[1], d[0]], bend * l * 0.4);
    const side = ((x - cx) / w) * light[0] + ((y - cy) / h) * light[1];
    out[side > 0.12 && r() < 0.8 ? "lit" : "shade"] += `M${pt(a)}Q${pt(c)} ${pt(b)}`;
  }
  return out;
}

// A limb outline around a centreline with a width at each point; round at both ends.
export function limb(cl, ws) {
  const left = [], right = [];
  for (let i = 0; i < cl.length; i++) {
    const t = unit(sub(cl[Math.min(cl.length - 1, i + 1)], cl[Math.max(0, i - 1)]));
    const nrm = [-t[1], t[0]];
    left.push(add(cl[i], nrm, ws[i] / 2));
    right.push(add(cl[i], nrm, -ws[i] / 2));
  }
  const t0 = unit(sub(cl[1], cl[0])), t1 = unit(sub(cl[cl.length - 1], cl[cl.length - 2]));
  const tip = add(cl[cl.length - 1], t1, ws[ws.length - 1] * 0.45);
  const root = add(cl[0], t0, -ws[0] * 0.45);
  return [root, ...left, tip, ...right.reverse()];
}

// Two-bone reach: shoulder to target, elbow bent toward `bend`.
export function reach2(S, T, l1, l2, bend = [0.4, 1]) {
  let d = sub(T, S);
  let dist = len(d);
  const max = l1 + l2 - 0.01, min = Math.abs(l1 - l2) + 0.5;
  const short = Math.max(0, dist - (l1 + l2));
  if (dist > max) { d = unit(d); T = add(S, d, max); dist = max; }
  if (dist < min) { d = unit(d); T = add(S, d, min); dist = min; }
  const phi = Math.atan2(T[1] - S[1], T[0] - S[0]);
  const a = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + dist * dist - l2 * l2) / (2 * l1 * dist))));
  const e1 = [S[0] + l1 * Math.cos(phi + a), S[1] + l1 * Math.sin(phi + a)];
  const e2 = [S[0] + l1 * Math.cos(phi - a), S[1] + l1 * Math.sin(phi - a)];
  const score = (e) => (e[0] - S[0]) * bend[0] + (e[1] - S[1]) * bend[1];
  return { E: score(e1) >= score(e2) ? e1 : e2, W: T, short };
}
