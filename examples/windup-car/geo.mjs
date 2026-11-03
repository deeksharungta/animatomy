import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { P, at, faceY } from "./model.mjs";

const area2 = (pts) => pts.reduce((s, p, i) => { const q = pts[(i + 1) % pts.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0);
const oriented = (pts) => (area2(pts) < 0 ? [...pts].reverse() : pts);

// A thin panel of any outline (concave too) in the x-z plane from y0 to y1: its face at y1 and the edges facing the viewer.
export function panelXZ(poly, y0, y1) {
  const n = poly.length, ccw = area2(poly) > 0, view = L.viewOf(P);
  const F = poly.map(([x, z]) => at([x, y1, z])), B = poly.map(([x, z]) => at([x, y0, z]));
  const fill = [k.pathOf(oriented(F), true), k.pathOf(oriented(B), true)];
  const shades = ["", "", "", ""], facing = [];
  shades[Math.min(3, L.toneOf([0, 1, 0], P))] += k.pathOf(oriented(F), true);
  for (let i = 0; i < n; i++) {
    const a = poly[i], b = poly[(i + 1) % n], dx = b[0] - a[0], dz = b[1] - a[1], len = Math.hypot(dx, dz) || 1;
    const nrm = ccw ? [dz / len, 0, -dx / len] : [-dz / len, 0, dx / len];
    facing.push(L.dot3(nrm, view) > 1e-6);
    if (!facing[i]) continue;
    const j = (i + 1) % n, quad = k.pathOf(oriented([F[i], F[j], B[j], B[i]]), true);
    fill.push(quad);
    shades[Math.min(3, L.toneOf(nrm, P))] += quad;
  }
  let outline = k.pathOf(F, true), crease = "";
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    if (facing[i]) { outline += k.pathOf([B[i], B[j]]); crease += k.pathOf([F[i], F[j]]); }
    if (facing[i] !== facing[(i + n - 1) % n]) outline += k.pathOf([F[i], B[i]]);
  }
  return { fill: fill.join(""), outline, crease, top: "", shades };
}

// A gear's teeth as one ring of small prisms round the origin of the x-z plane, at angle 0, from y0 to y1.
export function teethPaths(n, root, tip, y0, y1, { cx = 0, cz = 0, w = 0.42 } = {}) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, s = (Math.PI * 2) / n;
    const pt = (r, t) => [cx + r * Math.cos(t), cz + r * Math.sin(t)];
    out.push(L.prismOf(faceY(0, 0, 0), [pt(root - 0.4, a - s * w), pt(tip, a - s * w * 0.45), pt(tip, a + s * w * 0.45), pt(root - 0.4, a + s * w)], y0, y1, P));
  }
  return out;
}

// A ratchet's teeth: a steep face and a long ramp each, so the click rides up one way and locks the other.
export function ratchetPaths(n, root, tip, y0, y1, cx, cz) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, s = (Math.PI * 2) / n;
    const pt = (r, t) => [cx + r * Math.cos(t), cz + r * Math.sin(t)];
    out.push(L.prismOf(faceY(0, 0, 0), [pt(root - 0.5, a), pt(root, a), pt(tip, a + s * 0.96), pt(root - 0.5, a + s * 0.96)], y0, y1, P));
  }
  return out;
}

// A cylinder along y (rods, axles, bumpers), from y0 to y1 at (x, z).
export const rodY = (x, z, r, y0, y1) => L.disc(0, y1 - y0, r, L.frameAlong([x, y0, z], [0, 1, 0]), P);

// The screen matrix that turns the x-z plane at y by angle a about (cx, cz): A·R·A⁻¹ about the axis point.
export function spinMatrix(cx, y, cz, a, Pr = P) {
  const o = k.iso([cx, y, cz], Pr), ex = k.iso([cx + 1, y, cz], Pr), ez = k.iso([cx, y, cz + 1], Pr);
  const A = [[ex[0] - o[0], ez[0] - o[0]], [ex[1] - o[1], ez[1] - o[1]]];
  const det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
  const Ai = [[A[1][1] / det, -A[0][1] / det], [-A[1][0] / det, A[0][0] / det]];
  const c = Math.cos(a), s = Math.sin(a), R = [[c, -s], [s, c]];
  const mul = (X, Y) => [[X[0][0] * Y[0][0] + X[0][1] * Y[1][0], X[0][0] * Y[0][1] + X[0][1] * Y[1][1]], [X[1][0] * Y[0][0] + X[1][1] * Y[1][0], X[1][0] * Y[0][1] + X[1][1] * Y[1][1]]];
  const M = mul(mul(A, R), Ai);
  const e = o[0] - (M[0][0] * o[0] + M[0][1] * o[1]), f = o[1] - (M[1][0] * o[0] + M[1][1] * o[1]);
  const r = (v) => Math.round(v * 10000) / 10000;
  return `matrix(${r(M[0][0])} ${r(M[1][0])} ${r(M[0][1])} ${r(M[1][1])} ${r(e)} ${r(f)})`;
}
