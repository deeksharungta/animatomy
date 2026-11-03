import { C } from "./model.mjs";
import { LAMPS } from "./panel.mjs";
import { CWIN, AXZ } from "./breaker.mjs";
import { currentGlsl } from "./flows-geo.mjs";

// Light and heat the machine gives off, in the drawing's own camera: the synchronising lamps, the SF6 arc in the
// near breaker chamber (seen only through its window), the air arcs that follow the disconnector's blades with
// copper sparks flying off, and the blades' tips and jaws glowing as they cool after an arc. The arcs are
// blue-white, and the current on the 400 kV conductors is a pale yellow glow with the amps, pulses running out.
const f = (v) => (Number.isInteger(v) ? v.toFixed(1) : String(+v.toFixed(3)));
const DS = C.DS, Y = C.PH[2], CUR = currentGlsl();
export const GLOW = `
uniform float uLamp, uSF, uAir, uHeat, uOpen, uGapX, uGap, uLight, uCur, uCurPh;${CUR.fn}
float segDist(vec3 o, vec3 d, vec3 a, vec3 b) {
  vec3 u = b - a, w = o - a;
  float bb = dot(d, u), cc = dot(u, u), dd = dot(d, w), ee = dot(u, w);
  float tc = clamp((ee - bb * dd) / max(cc - bb * bb, 1e-5), 0.0, 1.0);
  return length(w + (bb * tc - dd) * d - tc * u);
}
float ptDist(vec3 o, vec3 d, vec3 p) { vec3 w = p - o; return length(w - dot(w, d) * d); }
vec4 inkFor(vec3 seen, float cover) { vec3 ab = 1.0 - seen; float a = max(max(ab.r, max(ab.g, ab.b)), cover); return vec4(vec3(a) - ab, a); }
vec4 over(vec4 top, vec4 under) { return top + under * (1.0 - top.a); }
// The chamber's window: the ray's first hit on the porcelain, inside the slot, lets the arc show.
float windowMask(vec3 o, vec3 d) {
  vec2 oc = o.yz - vec2(${f(Y)}, ${f(AXZ)});
  float a = dot(d.yz, d.yz), b = dot(oc, d.yz), c = dot(oc, oc) - 9.61, h = b * b - a * c;
  if (h < 0.0) return 0.0;
  vec3 p = o + d * ((-b - sqrt(h)) / a);
  vec3 v = towardViewer();
  float t = atan(p.z - ${f(AXZ)}, p.y - ${f(Y)}) - atan(v.z, v.y);
  return window(p.x, ${f(CWIN.x0 + 0.5)}, ${f(CWIN.x1 - 0.5)}, 0.4) * window(t, -0.9, 0.9, 0.08);
}
vec3 bladeTip(float y) { return vec3(${f(DS.hinge)} + cos(uOpen) * ${f(C.BLADE)}, y, ${f(DS.z)} + sin(uOpen) * ${f(C.BLADE)}); }
void main() {
  vec2 vb = viewOf(gl_FragCoord.xy);
  vec3 V = towardViewer();
  vec3 o = rayOf(vb) + V * 900.0, d = -V;
  float px = pixelOf();
  float lamp = 0.0;
  ${LAMPS.map(([x, y, z]) => `lamp += exp(-pow(ptDist(o, d, vec3(${f(x)}, ${f(y + 1)}, ${f(z)})) / 1.3, 2.0));`).join("\n  ")}
  lamp *= uLamp;
  // The SF6 arc: a tight column between the contact faces, seen through the window.
  float sf = 0.0;
  if (uSF > 0.002) {
    float r = segDist(o, d, vec3(uGapX - uGap * 0.5, ${f(Y)}, ${f(AXZ)}), vec3(uGapX + uGap * 0.5, ${f(Y)}, ${f(AXZ)}));
    sf = uSF * (exp(-r * r / 0.5) + 0.4 * exp(-r * r / 4.0)) * windowMask(o, d);
  }
  // Air arcs from each jaw to its rising blade tip, bowed up by their own heat, copper droplets flying off.
  float air = 0.0, core = 0.0, spark = 0.0, heat = 0.0;
  for (int i = 0; i < 3; i++) {
    float y = ${f(C.PH[0])} + float(i) * ${f(C.PH[1] - C.PH[0])};
    vec3 j = vec3(${f(DS.jaw)}, y, ${f(DS.z + 2)}), t = bladeTip(y);
    if (uAir > 0.002) {
      float l = length(t - j), wob = noise2(vec2(uTime * 9.0, float(i) * 7.0)) - 0.5;
      vec3 m = (j + t) * 0.5 + vec3(wob * 1.6, 0.0, 2.0 + l * 0.4);
      float r = min(segDist(o, d, j, m), segDist(o, d, m, t));
      float fl = 0.8 + 0.2 * noise2(vec2(uTime * 31.0, float(i)));
      core += exp(-r * r / max(0.2, 1.4 * px * px)) * fl;
      air += (exp(-r * r / 2.0) + 0.3 * exp(-r * r / 20.0)) * fl;
      for (int k = 0; k < 5; k++) {
        float seed = float(i * 5 + k), age = fract(uTime * 1.2 + hash12(vec2(seed, 3.1)));
        vec3 v = vec3(hash12(vec2(seed, 1.0)) - 0.5, hash12(vec2(seed, 2.0)) - 0.3, hash12(vec2(seed, 5.0)) + 0.6) * 14.0;
        vec3 p = j + v * age - vec3(0.0, 0.0, 22.0 * age * age);
        spark += exp(-pow(ptDist(o, d, p) / max(0.45, 1.3 * px), 2.0)) * (1.0 - age) * smoothstep(0.0, 0.08, age);
      }
    }
    if (uHeat > 0.002) heat += exp(-pow(ptDist(o, d, j) / 1.4, 2.0)) + exp(-pow(ptDist(o, d, t) / 1.2, 2.0));
  }
  // The current: every conductor from the bushings to the line, and each blade while it carries it.
  float cur = 0.0;
  if (uCur > 0.002) {
    ${CUR.calls}
    for (int i = 0; i < 3; i++) { float y = ${f(C.PH[0])} + float(i) * ${f(C.PH[1] - C.PH[0])}; cur = max(cur, curSeg(vb, vec3(${f(DS.hinge)}, y, ${f(DS.z)}), bladeTip(y), 0.0)); }
    vec2 e = min(vb, uView - vb) / (uView.x / uCanvas.x);
    cur *= uCur * smoothstep(2.0, 14.0, min(e.x, e.y));
  }
  air *= uAir; core *= uAir; spark *= smoothstep(0.0, 0.3, uAir); heat *= uHeat;
  // Dark: light adds. Light: one ink per kind of light, stacked; the hot metal follows one blackbody ramp.
  vec3 warm = vec3(1.0, 0.62, 0.22), violet = vec3(0.5, 0.74, 1.0), copper = vec3(1.0, 0.5, 0.12), glowC = mix(vec3(0.7, 0.08, 0.0), vec3(1.0, 0.55, 0.12), clamp(heat, 0.0, 1.0));
  vec3 add = tonemap(warm * lamp * 1.4 + vec3(1.0, 0.95, 0.85) * smoothstep(0.6, 1.0, lamp) + violet * (sf + air) * 1.2 + vec3(1.0) * (core * 1.2 + smoothstep(0.5, 1.2, sf)) + copper * spark + glowC * heat * 1.3 + vec3(1.0, 0.86, 0.45) * cur * 0.85, 1.2);
  vec4 dark = vec4(add, max(add.r, max(add.g, add.b)));
  float el = 1.0 - exp(-2.2 * lamp), ea = 1.0 - exp(-1.8 * (air + sf)), ec = 1.0 - exp(-2.0 * (core + smoothstep(0.6, 1.4, sf))), eh = 1.0 - exp(-2.0 * heat);
  vec4 lampInk = inkFor(mix(vec3(1.0), mix(vec3(0.98, 0.62, 0.16), vec3(1.0, 0.95, 0.8), smoothstep(0.7, 0.98, el)), smoothstep(0.02, 0.5, el)), 0.9 * smoothstep(0.6, 0.95, el)) * smoothstep(0.0, 0.08, el);
  vec4 arcInk = inkFor(mix(vec3(1.0), vec3(0.24, 0.52, 1.0), smoothstep(0.02, 0.6, ea)), 0.0) * smoothstep(0.0, 0.06, ea);
  vec4 coreInk = inkFor(vec3(0.93, 0.97, 1.0), 0.92) * ec;
  vec4 curInk = vec4(vec3(1.0, 0.93, 0.6), 1.0) * 0.6 * (1.0 - exp(-2.0 * cur));
  vec4 heatInk = inkFor(mix(vec3(1.0), mix(vec3(0.75, 0.12, 0.02), vec3(1.0, 0.6, 0.15), smoothstep(0.4, 0.9, eh)), smoothstep(0.02, 0.5, eh)), 0.0) * smoothstep(0.0, 0.08, eh);
  vec4 sparkInk = vec4(vec3(1.0, 0.48, 0.08), 1.0) * min(0.8, spark);
  vec4 light = over(sparkInk, over(coreInk, over(arcInk, over(heatInk, over(curInk, lampInk)))));
  light.rgb = min(light.rgb, vec3(light.a));
  vec4 col = mix(dark, light, uLight);
  float n = (hash12(gl_FragCoord.xy + fract(uTime) * 61.0) - 0.5) / 255.0 * smoothstep(0.0, 1.5 / 255.0, col.a);
  gl_FragColor = vec4(max(col.rgb + n, 0.0), max(col.a + n, 0.0));
}`;
