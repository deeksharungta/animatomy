import { C, at } from "./model.mjs";
import { k, L } from "./shapes.mjs";
import { LP_CUT } from "./turbine.mjs";
import { CORE } from "./generator.mjs";
import { IPB, WIN } from "./ipb.mjs";
import { XWIN } from "./xfmr.mjs";
import { BANKS, FANS } from "./cooler.mjs";
import { arrTerm, ctTerm } from "./bay.mjs";
import { cbTerm } from "./breaker.mjs";
import { dsHingeTerm, dsJawTerm } from "./ds.mjs";
import { clampOf } from "./gantry.mjs";
import { f } from "./flows-glsl.mjs";

// The current's path through the 400 kV bay, in the order it flows (bushing, arrester, CT, breaker, disconnector,
// up the dropper to the gantry, out on the line), each span sampled as the same parabola gantry.mjs draws.
const BZ = C.GANTRY.z - 12;
const sagged = (a, b, sag, n = 4) => Array.from({ length: n + 1 }, (_, i) => { const t = i / n, p = L.lerp3(a, b, t); p[2] -= sag * 4 * t * (1 - t); return p; });
export const currentPaths = () => C.PH.map((y) => [
  sagged([C.HVB.x, y, C.HVB.z1 + 1], arrTerm(y), 4), sagged(arrTerm(y), ctTerm(y, -1), 2.4), sagged(ctTerm(y, 1), cbTerm(y, -1), 1.6),
  sagged(cbTerm(y, 1), dsHingeTerm(y), 1.2), sagged(clampOf(y), dsJawTerm(y), -3).reverse(), sagged(clampOf(y), [C.GANTRY.x + 64, y - 4, BZ - 30], 4),
]);
// GLSL: the glow of every conductor segment, its distance from the axis in world units and its place along the path.
export function currentGlsl() {
  const calls = [];
  currentPaths().forEach((spans) => {
    let s = 0;
    for (const pts of spans) for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1], len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
      calls.push(`cur = max(cur, curSeg(vb, vec3(${a.map(f)}), vec3(${b.map(f)}), ${f(s)}));`);
      s += len;
    }
  });
  return { calls: calls.join("\n    "), fn: `
float curSeg(vec2 vb, vec3 a, vec3 b, float s0) {
  vec2 pa = project(a), ab = project(b) - pa, w = vb - pa;
  float u = clamp(dot(w, ab) / dot(ab, ab), 0.0, 1.0), r = length(w - ab * u) / uK;
  if (r > 7.0) return 0.0;
  float pulse = 0.4 + 0.6 * smoothstep(-0.2, 0.9, sin((s0 + u * length(b - a) - uCurPh) * 0.3));
  return exp(-pow(r / 0.95, 6.0)) * pulse + (1.0 - uLight) * 0.35 * exp(-pow(r / 2.4, 2.0));
}` };
}

// The SVG fallback: dashed strokes along each flow in its colours, faded by the same envelopes and run along by
// the same phases (the page writes stroke-dashoffset on the group, which the strokes inherit).
const path = (pts, cls) => `<path class="pg-fbf pg-fbf-${cls}" d="${k.pathOf(pts.map(at))}"/>`;
const around = (x, r, t) => [x, C.AY + r * Math.cos(t), C.SH + r * Math.sin(t)];
const range = (a, b, n) => Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n);
const group = (name, body, clip) => `<g class="pg-fb pg-fbg" data-part="fb-${name}"${clip ? ` clip-path="url(#${clip})"` : ""} style="opacity:0">${body}</g>`;
function steamFb() {
  const out = [], XC = -231;
  for (const t of range(LP_CUT.t0 + 0.2, LP_CUT.t1 - 0.2, 4)) for (const dir of [-1, 1]) {
    const strand = (s0, s1) => range(s0, s1, 8).map((s) => around(XC + dir * s, 20, t - (0.45 * s) / 20));
    out.push(path(strand(0, 9), "hot"), path(strand(9, 24), "pale"));
  }
  return out.join("");
}
function h2Fb() {
  const out = [], XM = (CORE[0] + CORE[1]) / 2, half = (C.CUT.x1 - C.CUT.x0) / 2;
  for (const t of range(C.CUT.t0 + 0.2, C.CUT.t1 - 0.2, 4)) for (const dir of [-1, 1]) out.push(path(range(half, 0, 10).map((s) => around(XM + dir * s, 15.6, t + (0.03 * s))), "cool"));
  return out.join("");
}
const busFb = () => `<path class="pg-fbf pg-fbf-cur pg-fbf-bus" d="${k.pathOf([[WIN.x0 - 2, IPB.ys[2], IPB.z], [WIN.x1 + 2, IPB.ys[2], IPB.z]].map(at))}"/>`;
function windingsFb() {
  const out = [], y = C.TANK.y + C.TANK.d - 2.5, zm = (XWIN.z0 + XWIN.z1) / 2;
  for (const x of range(XWIN.x0 + 2, XWIN.x1 - 2, 5)) out.push(path([[x, y, XWIN.z0 + 1], [x, y, zm]], "warm"), path([[x, y, zm], [x, y, XWIN.z1 - 1]], "hot"));
  return out.join("");
}
function radFb() {
  const out = [], [z0, z1] = C.RAD.z, y = C.TANK.y + C.TANK.d + 18 - 0.4;
  for (const x of BANKS) for (const dx of [2.2, 5.6, 9]) out.push(path([[x + dx, y, z1 - 1], [x + dx, y, (z0 + z1) / 2]], "warm"), path([[x + dx, y, (z0 + z1) / 2], [x + dx, y, z0 + 1]], "cool"));
  return out.join("");
}
function airFb() {
  const out = [], e = [Math.sin((50 * Math.PI) / 180), -Math.cos((50 * Math.PI) / 180)];
  for (const [x, y] of FANS) for (const u0 of [-2.6, 0, 2.6]) out.push(path(range(56, 100, 12).map((z) => { const u = u0 * (1 + (z - 56) / 30) + 1.4 * Math.sin(z * 0.2 + u0); return [x + u * e[0], y + u * e[1], z]; }), "air"));
  return out.join("");
}
const curFb = () => currentPaths().flat().map((pts) => path(pts, "cur")).join("");
// One fallback per canvas slot, drawn in that slot's place in the painter's order (inside its window's clip).
export const FALLBACK = {
  bus: () => group("bus", busFb(), "pg-ipb"),
  lp: () => group("steam", steamFb(), "pg-lp"),
  gen: () => group("h2", h2Fb(), "pg-gen"),
  xw: () => group("oil", windingsFb(), "pg-xw"),
  cool: () => group("rad", radFb()) + group("wind", airFb()),
  arcs: () => group("cur", curFb()),
};
