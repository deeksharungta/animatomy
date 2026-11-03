import { C } from "./model.mjs";
import { LP_CUT } from "./turbine.mjs";
import { CORE } from "./generator.mjs";
import { IPB, WIN } from "./ipb.mjs";

// The flows that carry the idea, drawn as moving colour on one temperature scale (cool blue, white, hot orange),
// each on its own canvas in the painter's order, just after what it runs through. This file has the shared
// library and the flows seen through the cutaways: steam in the LP turbine, hydrogen in the generator's gap,
// and the current in the isolated-phase bus. Every flow is a density m and a temperature T; light inks it on
// paper (or lights it over a dark cavity), dark adds it as light.
export const f = (v) => (Number.isInteger(v) ? v.toFixed(1) : String(+v.toFixed(4)));
export const LIB = `
uniform float uLight, uAmp, uPh, uTemp, uAmp2, uPh2, uTemp2;
vec4 inkFor(vec3 seen, float cover) { vec3 ab = 1.0 - seen; float a = max(max(ab.r, max(ab.g, ab.b)), cover); return vec4(vec3(a) - ab, a); }
vec4 over(vec4 top, vec4 under) { return top + under * (1.0 - top.a); }
// The temperature scale, as seen on paper and as light in the dark.
vec3 heatSeen(float T) {
  vec3 c = mix(vec3(0.13, 0.40, 0.92), vec3(0.47, 0.72, 1.0), smoothstep(0.0, 0.3, T));
  c = mix(c, vec3(0.93, 0.95, 0.98), smoothstep(0.3, 0.5, T));
  c = mix(c, vec3(1.0, 0.76, 0.36), smoothstep(0.5, 0.7, T));
  return mix(c, vec3(1.0, 0.47, 0.1), smoothstep(0.7, 1.0, T));
}
vec3 heatGlow(float T) {
  vec3 c = mix(vec3(0.16, 0.46, 1.0), vec3(0.52, 0.8, 1.0), smoothstep(0.0, 0.3, T));
  c = mix(c, vec3(0.96, 0.95, 0.92), smoothstep(0.3, 0.5, T));
  c = mix(c, vec3(1.0, 0.7, 0.32), smoothstep(0.5, 0.7, T));
  return mix(c, vec3(1.0, 0.42, 0.08), smoothstep(0.7, 1.0, T));
}
// One flow's ink: on paper a saturated stroke (alpha from energy, so ink only grows with the flow); over a dark
// cavity in light, coloured light laid on the dark; in dark, light that adds.
// w lifts the colour toward white: the hottest steam's cores.
vec4 flowInkW(float m, float T, float cave, float w) {
  float e = 1.0 - exp(-1.7 * max(m, 0.0));
  if (uLight < 0.5) { vec3 c = tonemap(mix(heatGlow(T), vec3(1.0), w) * m, 1.3); return vec4(c, max(c.r, max(c.g, c.b))); }
  if (cave > 0.5) { float a = 0.92 * e; return vec4(mix(heatSeen(T), vec3(1.0, 0.97, 0.9), w) * a, a); }
  return inkFor(mix(vec3(1.0), heatSeen(T), smoothstep(0.0, 0.6, e)), 0.0) * smoothstep(0.0, 0.04, e);
}
vec4 flowInk(float m, float T, float cave) { return flowInkW(m, T, cave, 0.0); }
vec4 finish(vec4 c) {
  c.rgb = min(c.rgb, vec3(c.a));
  float n = (hash12(gl_FragCoord.xy + fract(uTime * 0.61) * 91.0) + hash12(gl_FragCoord.yx * 1.37 + fract(uTime * 0.37) * 57.0) - 1.0) / 255.0;
  return max(c + vec4(n) * smoothstep(0.0, 1.5 / 255.0, c.a), 0.0);
}
// Moving threads, like the turbofan's air: thin streamlines in lanes about 1.3 units apart, broken into dashes
// that ride along with the flow. q.x runs along the flow, already advected by the distance travelled, q.y across
// it, in world units. curl bends the lanes and twists them into eddies round cell centres (each twist ends inside
// its own cell, so no seam); where lanes come closer than ~1.4 px they turn into their average, not moire.
float threads(vec2 q, float curl, float px) {
  vec2 cell = floor(q / 8.0), ce = (cell + 0.5 + 0.2 * (vec2(hash12(cell), hash12(cell + 7.3)) - 0.5)) * 8.0, r = q - ce;
  float fall = 1.0 - smoothstep(0.0, 2.9, length(r)), tw = 2.6 * smoothstep(0.7, 2.0, curl) * fall * fall * (hash12(cell + 3.1) > 0.5 ? 1.0 : -1.0);
  q = ce + mat2(cos(tw), sin(tw), -sin(tw), cos(tw)) * r;
  vec2 wq = vec2(q.x * 0.05, q.y * 0.12 + uTime * 0.08);
  float lane = 0.75 * (q.y + curl * 2.8 * (0.7 * noise2(wq) + 0.3 * noise2(wq * 2.3 + 5.1) - 0.5)), id = floor(lane);
  float c0 = 0.28 + 0.44 * hash12(vec2(id, 1.3)), w = mix(0.07, 0.19, hash12(vec2(id, 4.1))), aa = 0.6 * px;
  float line = 1.0 - smoothstep(w - aa, w + aa, abs(fract(lane) - c0));
  float dash = smoothstep(0.4, 0.66, noise2(vec2(q.x * 0.06 + hash12(vec2(id, 9.0)) * 40.0, id * 3.7)));
  return mix(line * (0.55 + 0.45 * hash12(vec2(id, 2.2))), 0.2, smoothstep(0.5, 1.2, px)) * dash;
}
// Ray hits on a cylinder, in the 2D section across its axis: sgn -1 the near hit, +1 the far; -1 when missed.
float cylHit(vec2 o, vec2 d, vec2 c, float r, float sgn) { vec2 oc = o - c; float a = dot(d, d), b = dot(oc, d), h = b * b - a * (dot(oc, oc) - r * r); return h < 0.0 ? -1.0 : (-b + sgn * sqrt(h)) / a; }
float axisDist(vec2 o, vec2 d, vec2 c) { vec2 n = normalize(d), w = c - o; return abs(w.x * n.y - w.y * n.x); }
// The angle round an axis from the side that faces the viewer: near hits stay inside +-pi/2, far from any seam.
float aboutView(vec2 q, vec2 v) { return atan(v.x * q.y - v.y * q.x, dot(v, q)); }
`;
const AX = `vec2(${f(C.AY)}, ${f(C.SH)})`;
const head = `void main() {
  vec2 vb = viewOf(gl_FragCoord.xy);
  vec3 V = towardViewer(), o = rayOf(vb) + V * 900.0, d = -V;
  float px = pixelOf();
  gl_FragColor = vec4(0.0);
  if (uAmp < 0.002) return;`;
// The window in a horizontal cylinder (an x span and an angle span from +y toward +z), from the ray's first hit.
const cutMask = (r, x0, x1, t0, t1) => `
  float t0 = cylHit(o.yz, d.yz, ${AX}, ${f(r)}, -1.0);
  if (t0 < 0.0) return;
  vec3 p0 = o + d * t0;
  float mask = window(p0.x, ${f(x0)}, ${f(x1)}, 0.35 * px) * window(atan(p0.z - ${f(C.SH)}, p0.y - ${f(C.AY)}), ${f(t0)}, ${f(t1)}, 0.35 * px / ${f(r)});
  if (mask < 0.001) return;
  vec2 v = normalize(V.yz);`;

// Steam: in at the middle of the double flow, where the valve's pipe enters, out through both last-stage rows,
// cooling as it expands; three shells through the blade annulus, the nearest on top.
const L = LP_CUT, XC = -231;
export const STEAM = LIB + head + cutMask(C.LP.r + 0.2, L.x0, L.x1, L.t0, L.t1) + `
  vec4 ink = vec4(0.0);
  for (int i = 2; i >= 0; i--) {
    float r = 15.0 + float(i) * 4.6, t = cylHit(o.yz, d.yz, ${AX}, r, -1.0);
    vec3 q = o + d * t;
    float x = q.x - ${f(XC)}, s = sqrt(x * x + 4.0) - 2.0, c = r * aboutView(q.yz - ${AX}, v);
    float curl = 0.4 + 1.6 * smoothstep(12.0, 22.0, s);
    float th = threads(vec2(s - uPh, 0.7 * (c + 0.25 * s) + float(i) * 13.0), curl, px);
    float m = uAmp * th * (1.1 + 0.3 * float(i)) * 1.4, hot = 1.0 - smoothstep(2.0, 22.0, s);
    ink = over(flowInkW(m * mask, mix(0.42, uTemp, hot), 1.0, 0.55 * hot * smoothstep(0.45, 0.9, th)), ink);
  }
  gl_FragColor = finish(ink);
}`;

// Hydrogen: blown by the rotor's fans in at both ends of the air gap, along it toward the middle and out through
// the core's ducts, swirled round by the rotor; cool blue from the coolers, warming with the load.
const G = C.CUT, XM = (CORE[0] + CORE[1]) / 2;
export const HYDROGEN = LIB + head + cutMask(C.GEN.r + 0.2, G.x0, G.x1, G.t0, G.t1) + `
  vec4 ink = vec4(0.0);
  for (int i = 1; i >= 0; i--) {
    float r = 15.0 + float(i) * 1.5, t = cylHit(o.yz, d.yz, ${AX}, r, -1.0);
    vec3 q = o + d * t;
    float a = atan(q.z - ${f(C.SH)}, q.y - ${f(C.AY)});
    float inGap = window(a, ${f(G.t0)}, ${f(G.t1)}, 0.35 * px / r) * window(q.x, ${f(G.x0)}, ${f(G.x1)}, 0.35 * px);
    float dx = q.x - ${f(XM)}, s = 2.0 - sqrt(dx * dx + 9.0), c = r * aboutView(q.yz - ${AX}, v);
    float th = threads(vec2(s - uPh, c - 0.3 * s + float(i) * 9.0), 0.45, px);
    float T = 0.1 + uTemp * 0.28 * smoothstep(-30.0, -4.0, s);
    ink = over(flowInk(uAmp * th * inGap * mask * (1.1 + 0.4 * float(i)), T, 1.0), ink);
  }
  gl_FragColor = finish(ink);
}`;

// The current in the bus: the conductor's own light through the window, brighter with the amps, with slow pulses
// running toward the transformer.
const Y = IPB.ys[2], AXB = `vec2(${f(Y)}, ${f(IPB.z)})`;
export const BUS = LIB + head + `
  float t0 = cylHit(o.yz, d.yz, ${AXB}, ${f(IPB.r + 0.05)}, -1.0);
  if (t0 < 0.0) return;
  vec3 p0 = o + d * t0;
  float mask = window(p0.x, ${f(WIN.x0)}, ${f(WIN.x1)}, 0.35 * px) * window(aboutView(p0.yz - ${AXB}, normalize(V.yz)), ${f(-WIN.half)}, ${f(WIN.half)}, 0.35 * px / ${f(IPB.r)});
  float r = axisDist(o.yz, d.yz, ${AXB});
  float pulse = 0.4 + 0.6 * smoothstep(-0.2, 0.9, sin((p0.x - uPh) * 0.3));
  float m = uAmp * mask * (exp(-pow(r / ${f(IPB.cond + 0.2)}, 8.0)) * 0.9 * pulse + (1.0 - uLight) * 0.5 * exp(-pow(r / 2.8, 2.0)));
  vec3 c = tonemap(vec3(1.0, 0.86, 0.45) * m, 1.4);
  gl_FragColor = finish(uLight > 0.5 ? vec4(vec3(1.0, 0.93, 0.6), 1.0) * 0.6 * (1.0 - exp(-2.0 * m)) : vec4(c, max(c.r, max(c.g, c.b))));
}`;
