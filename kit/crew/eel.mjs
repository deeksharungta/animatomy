import { iso, depthOf } from "../iso-kit.mjs";
import { TAU } from "./shapes.mjs";
import { RAD, n1, pt, sub, add, len, unit, rng, curve } from "./draw.mjs";
import { shd } from "./parts.mjs";
import { ART } from "./cast.mjs";
import { defs, softShape } from "./paint.mjs";
import { PROPS, headSvg, collarSvg } from "./head.mjs";
import { CACHE, tr } from "./pieces.mjs";

// ---------- the eel: a body along a world path
export const ramp = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
// A path when the pose gives none: straight along the heading through `at`, with a gentle wave.
export function eelPath(pose, size) {
  const at = pose.at ?? [0, 0, 0];
  const h = (pose.heading ?? 0) * RAD, fw = [Math.cos(h), Math.sin(h)], side = [-fw[1], fw[0]];
  const ph = (pose.stride?.phase ?? 0) * TAU, amp = size * (0.035 + (pose.stride?.amount ?? 0) * 0.3);
  return Array.from({ length: 17 }, (_, i) => {
    const u = i / 16, wave = Math.sin(u * TAU * 1.2 + ph) * amp * ramp(0, 0.3, u);
    if (pose.stance === "hang") return [at[0] + fw[0] * wave, at[1] + fw[1] * wave, at[2] + size * (0.55 - u)];
    return [at[0] + fw[0] * size * (0.5 - u) + side[0] * wave, at[1] + fw[1] * size * (0.5 - u) + side[1] * wave, at[2]];
  });
}
// Distance along a world polyline to a point, carrying on past its end along the last segment.
export function walker(path) {
  const d = [0];
  for (let i = 1; i < path.length; i++) d.push(d[i - 1] + Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1], path[i][2] - path[i - 1][2]));
  return (s) => {
    let i = 1;
    while (i < path.length - 1 && d[i] < s) i++;
    const a = path[i - 1], b = path[i], t = (s - d[i - 1]) / (d[i] - d[i - 1] || 1);
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  };
}
export const ribbon = (L, R) => `M${L.map(pt).join("L")}L${[...R].reverse().map(pt).join("L")}Z`;
export function eelPieces(sp, mirror, eyes, role, wear) {
  const key = `${sp}|path|${mirror}|${eyes}|${role}|${wear.join(",")}`;
  if (CACHE.has(key)) return CACHE.get(key);
  const H = ART[sp].path.head;
  const out = { defs: defs(sp) };
  out.head = headSvg(sp, H, { eyes, front: true, mirror, wear, role }) + collarSvg(H.collar) + softShape(sp, H.pectoral, "dark", 0.85);
  CACHE.set(key, out);
  return out;
}
// pose: { path: world points from the snout back, at/heading when there is no path, eyes, charge 0..1,
// flicker (any number; each whole step redraws the sparks), target: a world point the snout arcs to }.
export function eelCritter(spec, pose, P) {
  const sp = spec.species, A = ART[sp].path;
  const size = spec.size ?? 40;
  const path = pose.path?.length > 1 ? pose.path : eelPath(pose, size);
  const W = walker(path);
  const mid = W(size / 2);
  const zpx = Math.abs(iso([mid[0], mid[1], mid[2] + 1], P)[1] - iso(mid, P)[1]);
  const k = (size * zpx) / 100;
  const s0 = (A.head.len * size) / 100, N = 36;
  const p = [], n = [], hw = [], fin = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    p.push(iso(W(s0 + (size - s0) * t), P));
    const w = A.width * (t < 0.42 ? 1 - (0.1 * t) / 0.42 : 0.9 * (1 - ((t - 0.42) / 0.58) ** 1.5)) + 0.25;
    hw.push(w * k);
    fin.push(A.fin * k * ramp(0.1, 0.32, t) * (1 - 0.4 * ramp(0.9, 1, t)));
  }
  for (let i = 0; i <= N; i++) {
    const tg = unit(sub(p[Math.min(N, i + 1)], p[Math.max(0, i - 1)]));
    let nv = [tg[1], -tg[0]];
    if (i ? nv[0] * n[i - 1][0] + nv[1] * n[i - 1][1] < 0 : nv[1] > 0) nv = [-nv[0], -nv[1]];
    n.push(nv);
  }
  const at = (i, f) => add(p[i], n[i], hw[i] * f);
  const span = (a, b, f) => Array.from({ length: b - a + 1 }, (_, j) => at(a + j, f));
  const tip = add(p[N], unit(sub(p[N], p[N - 1])), hw[N] * 1.5);
  const outline = [...span(0, N, 1), [...tip, 1], ...span(0, N, -1).reverse()];
  const finEdge = (i) => add(p[i], n[i], -(hw[i] + fin[i]));
  const f0 = Math.round(N * 0.1);
  const dyn = {};
  dyn.body = curve(outline).d;
  dyn.shade = shd(dyn.body, 0, hw[0] * 0.6);
  dyn.under = ribbon(span(0, N, -0.15), span(0, N, -1));
  dyn.lit = ribbon(span(0, N - 4, 0.15), span(0, N - 4, 0.8));
  const b1 = Math.round(N * 0.45);
  dyn.belly = ribbon(span(0, b1, -0.98), Array.from({ length: b1 + 1 }, (_, j) => at(j, -(1 - 0.6 * (1 - j / b1)))));
  dyn.gloss = ribbon(span(0, Math.round(N * 0.8), 0.5), span(0, Math.round(N * 0.8), 0.62));
  dyn.fin = ribbon(Array.from({ length: N - f0 + 1 }, (_, j) => finEdge(f0 + j)).concat([tip]), span(f0, N, -0.9).concat([tip]));
  let rays = "";
  for (let i = f0 + 1; i < N; i += 2) rays += `M${pt(at(i, -0.95))}L${pt(finEdge(i))}`;
  dyn.rays = rays;
  // The head: drawn facing left with its neck at the origin, turned to point back along the first stretch of path.
  const snout = iso(W(0), P);
  let D = sub(snout, p[0]);
  D = len(D) > 1e-6 ? unit(D) : unit(sub(p[0], p[1]));
  const mirror = D[0] > 0;
  const rot = Math.atan2(D[1], D[0]) / RAD + (mirror ? 0 : 180);
  dyn.head = `${tr(p[0][0], p[0][1])} rotate(${n1(rot)}) scale(${n1(mirror ? -k * 100 : k * 100) / 100} ${n1(k * 100) / 100})`;
  // Charge: sparks off the body and a crackle down its middle, redrawn whenever `flicker` steps on.
  const charge = Math.max(0, Math.min(1, pose.charge ?? 0));
  let zap = "";
  if (charge > 0) {
    const r = rng(Math.floor(pose.flicker ?? 0) * 7919 + 13);
    for (let i = 1; i < N - 2; i += 3) {
      if (r() > charge * 0.85) continue;
      const side = r() < 0.5 ? 1 : -1;
      let q = at(i, side * 0.9);
      zap += `M${pt(q)}`;
      for (let j = 0; j < 3; j++) { q = add(add(q, n[i], side * hw[0] * (0.35 + r() * 0.3)), unit(sub(p[i + 1], p[i])), hw[0] * (r() - 0.5) * 0.8); zap += `L${pt(q)}`; }
    }
    zap += `M${pt(p[0])}` + p.slice(1, N - 2).map((q, i) => `L${pt(add(q, n[i + 1], hw[i + 1] * (r() - 0.5) * 0.7))}`).join("");
    if (pose.target) {
      const T = iso(pose.target, P);
      zap += `M${pt(snout)}`;
      for (let j = 1; j <= 3; j++) { const q = add(snout, sub(T, snout), j / 3); zap += `L${pt(j < 3 ? add(q, [r() - 0.5, r() - 0.5], hw[0] * 0.7) : q)}`; }
    }
    dyn.charge = dyn.body;
  } else dyn.charge = "";
  dyn.zap = zap;
  dyn.zapGlow = zap;
  const eyes = pose.eyes ?? "open";
  const wear = [].concat(spec.wear ?? []).filter((w) => PROPS[w]);
  const S = eelPieces(sp, mirror, eyes, spec.role, wear);
  const xs = outline.map((q) => q[0]).concat([snout[0] - hw[0] * 1.4, snout[0] + hw[0] * 1.4]);
  const ys = outline.map((q) => q[1]).concat([snout[1] - hw[0] * 2.4, snout[1] + hw[0] * 1.4]);
  return {
    name: spec.name ?? sp, species: sp, role: spec.role, size, stance: "path", hang: false, front: true, mirror, eyes,
    key: `${sp}|path|${mirror}|${eyes}`, S, dyn, reach: {}, depth: depthOf(mid, P), anchor: p[0],
    box: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)], lines: { ray: k * 0.14, glow: Math.max(1, hw[0] * 0.55), core: Math.max(0.4, hw[0] * 0.17) },
  };
}
