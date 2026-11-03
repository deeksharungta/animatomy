import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { P, at, S, Ln, D, box, seg } from "./model.mjs";

// Shared recipes for the static drawing: round parts on any axis, circles and rounded slots on faces,
// porcelain insulators with their sheds, lattice steel and handrails.
const ngon = (r, n) => Array.from({ length: n }, (_, i) => [r * Math.cos(((i + 0.5) / n) * Math.PI * 2), r * Math.sin(((i + 0.5) / n) * Math.PI * 2)]);
export const frame = (o, a) => {
  const u = Math.abs(a[2]) > 0.9 ? [1, 0, 0] : [0, 0, 1];
  const v = L.unit3(L.cross3(a, u));
  return L.frameOf(o, a, L.unit3(L.cross3(v, a)), v);
};
// A round rod along any axis, from s0 to s1.
export const rod = (o, a, r, s0, s1, n = 14) => L.prismOf(frame(o, a), ngon(r, n), s0, s1, P);
export const rodAB = (a, b, r, n = 12) => { const d = L.sub3(b, a), l = L.len3(d); return L.prismOf(frame(a, L.unit3(d)), ngon(r, n), 0, l, P); };
// A flat bar between two points, w wide across `side` and t thick.
export const barAB = (a, b, side, w, t) => {
  const d = L.unit3(L.sub3(b, a)), l = L.len3(L.sub3(b, a)), v = L.unit3(L.cross3(d, side));
  return L.prismOf(L.frameOf(a, d, side, v), [[-w / 2, -t / 2], [w / 2, -t / 2], [w / 2, t / 2], [-w / 2, t / 2]], 0, l, P);
};
// A turned part from its half-section along an axis.
export const turned = (o, a, profile, opts) => L.solidOf(profile, L.frameAlong(o, a), P, opts);
// Circles and rounded slots standing in an x or a y plane.
export const circleX = (x, cy, cz, r, n = 40) => k.pathOf(Array.from({ length: n }, (_, i) => at([x, cy + r * Math.cos((i / n) * Math.PI * 2), cz + r * Math.sin((i / n) * Math.PI * 2)])), true);
export const circleY = (cx, y, cz, r, n = 40) => k.pathOf(Array.from({ length: n }, (_, i) => at([cx + r * Math.cos((i / n) * Math.PI * 2), y, cz + r * Math.sin((i / n) * Math.PI * 2)])), true);
const slot = (pt, a0, a1, b0, b1, rr, n) => {
  const pts = [], arc = (ca, cb, t0) => { for (let i = 0; i <= n; i++) { const t = t0 + (i / n) * (Math.PI / 2); pts.push(at(pt(ca + rr * Math.cos(t), cb + rr * Math.sin(t)))); } };
  arc(a1 - rr, b1 - rr, 0); arc(a0 + rr, b1 - rr, Math.PI / 2); arc(a0 + rr, b0 + rr, Math.PI); arc(a1 - rr, b0 + rr, Math.PI * 1.5);
  return k.pathOf(pts, true);
};
export const ringY = (y, x0, x1, z0, z1, rr, n = 4) => slot((a, b) => [a, y, b], x0, x1, z0, z1, rr, n);
export const ringX = (x, y0, y1, z0, z1, rr, n = 4) => slot((a, b) => [x, a, b], y0, y1, z0, z1, rr, n);

// A cabinet: a box on a plinth with a door outline, hinges, a handle and a louvre panel on the face toward +y.
export function cabinet(x, y, w, d, z0, h, { louvres = true, face = "y" } = {}) {
  const out = [S(box(x - 0.6, y - 0.6, z0, x + w + 0.6, y + d + 0.6, z0 + 1.6, 0.3), { tone: "lo" })];
  out.push(S(k.slabOf({ x, y, w, d, r: 0.5 }, z0 + 1.6, h - 1.6, P, 2, 0.5), { tone: "mid", inner: Ln(k.sideSeam({ x, y, w, d, r: 0.5 }, z0 + h - 3, P, 2), { tone: "faint" }) }));
  out.push(S(box(x - 0.8, y - 0.8, z0 + h, x + w + 0.8, y + d + 0.8, z0 + h + 1.2, 0.3), { tone: "mid" }));
  if (face === "y") {
    const fy = y + d;
    out.push(Ln(ringY(fy, x + 1.4, x + w - 1.4, z0 + 3, z0 + h - 4.4, 0.8), { tone: "lo" }));
    out.push(S(rod([x + w - 3, fy, z0 + h * 0.55], [0, 1, 0], 0.6, 0, 1.2, 8), { tone: "hi" }));
    out.push(D([[x + 2.4, fy, z0 + 6], [x + 2.4, fy, z0 + h - 7]].map(at), { size: 0.55, tone: "mid" }));
    if (louvres) { const lv = []; for (let z = z0 + 5; z < z0 + 5 + Math.min(10, h * 0.35); z += 2.4) lv.push(ringY(fy, x + 4, x + w - 5, z, z + 1, 0.45, 2)); out.push(Ln(lv.join(""), { tone: "lo" })); }
  } else {
    const fx = x + w;
    out.push(Ln(ringX(fx, y + 1.4, y + d - 1.4, z0 + 3, z0 + h - 4.4, 0.8), { tone: "lo" }));
    out.push(S(rod([fx, y + 3, z0 + h * 0.55], [1, 0, 0], 0.6, 0, 1.2, 8), { tone: "hi" }));
    out.push(D([[fx, y + d - 2.4, z0 + 6], [fx, y + d - 2.4, z0 + h - 7]].map(at), { size: 0.55, tone: "mid" }));
  }
  return out.join("");
}

// A porcelain or silicone insulator standing (or lying) along `a`: flanged ends and `n` alternating sheds.
export function insulator(o, a, len, { r = 2, shed = 3.6, n = 8, cap = 3, tone = "hi" } = {}) {
  const prof = [[0, cap + 0.6], [1.4, cap + 0.6], [1.4, r]];
  const h = len - 2.8, step = h / n;
  for (let i = 0; i < n; i++) { const s = 1.4 + i * step + step * 0.5, R = i % 2 ? shed * 0.82 : shed; prof.push([s - step * 0.32, r], [s - step * 0.12, R], [s + step * 0.06, R], [s + step * 0.26, r]); }
  prof.push([len - 1.4, r], [len - 1.4, cap + 0.6], [len, cap + 0.6]);
  return S(turned(o, a, prof, { smooth: false }), { tone });
}

// A lattice column of four angle chords with zig-zag lacing on its two visible faces.
export function lattice(x, y, z0, z1, w, { tone = "mid" } = {}) {
  const out = [], h = w / 2, step = w * 1.1, lace = [];
  for (const [dx, dy] of [[-h, -h], [h, -h], [-h, h], [h, h]]) out.push(S(box(x + dx - 0.6, y + dy - 0.6, z0, x + dx + 0.6, y + dy + 0.6, z1, 0.15), { tone }));
  for (let z = z0; z + step <= z1 + 0.01; z += step) {
    lace.push(seg([x - h, y + h, z], [x + h, y + h, z + step / 2]), seg([x + h, y + h, z + step / 2], [x - h, y + h, z + step]));
    lace.push(seg([x + h, y + h, z], [x + h, y - h, z + step / 2]), seg([x + h, y - h, z + step / 2], [x + h, y + h, z + step]));
    lace.push(seg([x - h, y + h, z], [x + h, y + h, z]), seg([x + h, y - h, z], [x + h, y + h, z]));
  }
  out.push(Ln(lace.join(""), { tone: "lo" }));
  return out.join("");
}

// A handrail along a polyline at deck height z: posts every `gap`, a top rail and a knee rail.
export function handrail(points, z, { gap = 14, h = 11 } = {}) {
  const out = [], posts = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i], b = points[i + 1], l = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(l / gap));
    for (let j = 0; j <= n; j++) if (j < n || i === points.length - 2) posts.push([a[0] + ((b[0] - a[0]) * j) / n, a[1] + ((b[1] - a[1]) * j) / n]);
  }
  for (const [x, y] of posts) out.push(S(k.cylinder(x, y, 0.45, z, h, P, 8), { tone: "hi", crease: "none" }));
  for (const zz of [z + h, z + h * 0.5]) for (let i = 0; i < points.length - 1; i++) out.push(S(rodAB([...points[i], zz], [...points[i + 1], zz], 0.4, 8), { tone: "hi" }));
  return out.join("");
}
export { k, L, P, at, S, Ln, D, box, seg };
