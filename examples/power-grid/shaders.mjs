import { C } from "./model.mjs";

// Light the machine gives off, in the drawing's own camera: the synchronising lamps, the vacuum arc inside the cut
// interrupter (seen only through its window) and the air arcs and copper sparks at the disconnector's blades.
const f = (v) => (Number.isInteger(v) ? v.toFixed(1) : String(+v.toFixed(3)));
const B = C.BOT, W = { z0: B.z0 + 4, z1: B.z1 - 4, t0: -0.1, t1: 1.9 };
const DS = C.DS;
export const GLOW = `
uniform float uLamp, uVac, uAir, uOpen, uGapZ, uGap, uLight;
float segDist(vec3 o, vec3 d, vec3 a, vec3 b) {
  vec3 u = b - a, w = o - a;
  float bb = dot(d, u), cc = dot(u, u), dd = dot(d, w), ee = dot(u, w);
  float den = max(cc - bb * bb, 1e-5);
  float tc = clamp((ee - bb * dd) / den, 0.0, 1.0);
  float sc = bb * tc - dd;
  return length(w + sc * d - tc * u);
}
float ptDist(vec3 o, vec3 d, vec3 p) { vec3 w = p - o; return length(w - dot(w, d) * d); }
vec4 inkFor(vec3 seen, float cover) { vec3 ab = 1.0 - seen; float a = max(max(ab.r, max(ab.g, ab.b)), cover); return vec4(vec3(a) - ab, a); }
vec4 over(vec4 top, vec4 under) { return top + under * (1.0 - top.a); }
// The interrupter's window: the ray's first hit on the ceramic, inside the cut, lets the arc show.
float windowMask(vec3 o, vec3 d) {
  vec2 oc = o.xy - vec2(${f(C.CUT)}, ${f(B.y)});
  float a = dot(d.xy, d.xy), b = dot(oc, d.xy), c = dot(oc, oc) - ${f(B.r * B.r)}, h = b * b - a * c;
  if (h < 0.0) return 0.0;
  vec3 p = o + d * ((-b - sqrt(h)) / a);
  float t = atan(p.y - ${f(B.y)}, p.x - ${f(C.CUT)});
  return window(p.z, ${f(W.z0 + 0.4)}, ${f(W.z1 - 0.4)}, 0.4) * window(t, ${f(W.t0 + 0.08)}, ${f(W.t1 - 0.08)}, 0.06);
}
vec3 bladeTip(float x) { return vec3(x, ${f(DS.hy)} - cos(uOpen) * ${f(C.BLADE)}, ${f(DS.z + 1.6)} + sin(uOpen) * ${f(C.BLADE)}); }
void main() {
  vec2 vb = viewOf(gl_FragCoord.xy);
  vec3 V = towardViewer();
  vec3 o = rayOf(vb) + V * 900.0, d = -V;
  float px = pixelOf();
  // Lamps: three small glass domes, a warm body and a pale filament core.
  float lamp = 0.0;
  ${[1, 8, 15].map((y) => `lamp += exp(-pow(ptDist(o, d, vec3(93.0, ${f(y)}, ${f(C.DESK.z + 2)})) / 1.5, 2.0));`).join("\n  ")}
  lamp *= uLamp;
  // The vacuum arc: a diffuse column between the contact faces, seen through the window.
  float vac = 0.0;
  if (uVac > 0.002) {
    float r = segDist(o, d, vec3(${f(C.CUT)}, ${f(B.y)}, uGapZ - uGap * 0.5), vec3(${f(C.CUT)}, ${f(B.y)}, uGapZ + uGap * 0.5));
    vac = uVac * (exp(-r * r / 1.6) + 0.35 * exp(-r * r / 9.0)) * windowMask(o, d);
  }
  // Air arcs from each jaw to its blade, bowed up by their own heat, with copper droplets flying off.
  float air = 0.0, core = 0.0, spark = 0.0;
  if (uAir > 0.002) {
    for (int i = 0; i < 3; i++) {
      float x = ${f(DS.xs[0])} + float(i) * ${f(DS.xs[1] - DS.xs[0])};
      vec3 j = vec3(x, ${f(DS.jy)}, ${f(DS.z + 4.5)}), t = bladeTip(x);
      float l = length(t - j), wob = noise2(vec2(uTime * 9.0, float(i) * 7.0)) - 0.5;
      vec3 m = (j + t) * 0.5 + vec3(wob * 0.8, 0.0, 1.2 + l * 0.45);
      float r = min(segDist(o, d, j, m), segDist(o, d, m, t));
      float fl = 0.8 + 0.2 * noise2(vec2(uTime * 31.0, float(i)));
      core += exp(-r * r / max(0.12, 1.4 * px * px)) * fl;
      air += (exp(-r * r / 1.2) + 0.3 * exp(-r * r / 12.0)) * fl;
      for (int k = 0; k < 5; k++) {
        float seed = float(i * 5 + k), age = fract(uTime * 1.3 + hash12(vec2(seed, 3.1)));
        vec3 v = vec3(hash12(vec2(seed, 1.0)) - 0.5, hash12(vec2(seed, 2.0)) * 0.8 + 0.2, hash12(vec2(seed, 5.0)) + 0.6) * 9.0;
        vec3 p = j + v * age - vec3(0.0, 0.0, 14.0 * age * age);
        spark += exp(-pow(ptDist(o, d, p) / max(0.35, 1.3 * px), 2.0)) * (1.0 - age) * smoothstep(0.0, 0.08, age);
      }
    }
    air *= uAir; core *= uAir; spark *= smoothstep(0.0, 0.3, uAir);
  }
  // Dark: light adds. Light: one ink per kind of light, stacked.
  vec3 warm = vec3(1.0, 0.62, 0.22), violet = vec3(0.55, 0.5, 1.0), copper = vec3(1.0, 0.5, 0.12);
  vec3 add = tonemap(warm * lamp * 1.4 + vec3(1.0, 0.95, 0.85) * smoothstep(0.6, 1.0, lamp) + violet * (vac + air) * 1.2 + vec3(1.0) * (core * 1.2 + smoothstep(0.5, 1.2, vac)) + copper * spark, 1.2);
  vec4 dark = vec4(add, max(add.r, max(add.g, add.b)));
  float el = 1.0 - exp(-2.2 * lamp), ea = 1.0 - exp(-1.8 * (air + vac)), ec = 1.0 - exp(-2.0 * (core + smoothstep(0.6, 1.4, vac)));
  vec4 lampInk = inkFor(mix(vec3(1.0), mix(vec3(0.98, 0.62, 0.16), vec3(1.0, 0.95, 0.8), smoothstep(0.7, 0.98, el)), smoothstep(0.02, 0.5, el)), 0.9 * smoothstep(0.6, 0.95, el)) * smoothstep(0.0, 0.08, el);
  vec4 arcInk = inkFor(mix(vec3(1.0), vec3(0.42, 0.34, 0.95), smoothstep(0.02, 0.6, ea)), 0.0) * smoothstep(0.0, 0.06, ea);
  vec4 coreInk = inkFor(vec3(0.94, 0.95, 1.0), 0.92) * ec;
  vec4 sparkInk = vec4(vec3(1.0, 0.48, 0.08), 1.0) * min(0.8, spark);
  vec4 light = over(sparkInk, over(coreInk, over(arcInk, lampInk)));
  light.rgb = min(light.rgb, vec3(light.a));
  vec4 col = mix(dark, light, uLight);
  float n = (hash12(gl_FragCoord.xy + fract(uTime) * 61.0) - 0.5) / 255.0 * smoothstep(0.0, 1.5 / 255.0, col.a);
  gl_FragColor = vec4(max(col.rgb + n, 0.0), max(col.a + n, 0.0));
}`;
