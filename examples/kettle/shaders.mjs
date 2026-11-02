import { C, W } from "./model.mjs";

// Steam, in the drawing's own camera: a plume from the spout's mouth while the water boils, and in the
// second half a haze that builds over the worktop as the litre boils away. Water vapour itself is clear;
// what shows is the mist it condenses into a little way out of the spout, so the plume starts a few units up.
export const SPOUT = W(C.SPOUT_TIP);
// Steam that has run down the tube escapes round the cup over Mo's disc.
export const CUP = W([C.DISC.u, -3, C.DISC.z - 6]);

export const STEAM = `
uniform float uSteam;
uniform float uHaze;
uniform float uLight;
uniform vec3 uSpout;
uniform float uCup;
uniform vec3 uCupAt;
float plume(vec3 o, vec3 d, vec3 base, float h, float w0, float spread, float t) {
  vec2 n = normalize(-d.xy);
  vec3 p = o + d * (dot(base.xy - o.xy, n) / dot(d.xy, n));
  float z = p.z - base.z;
  float u = dot(p.xy - base.xy, vec2(-n.y, n.x));
  float drift = (fbm2(vec2(z * 0.06 - t * 0.4, 1.7)) - 0.5) * z * 0.6 + z * 0.18;
  float q = (u - drift) / (w0 + max(z, 0.0) * spread);
  float wisp = fbm2(vec2(u * 0.08, z * 0.05 - t * 0.5));
  return exp(-q * q * 2.0) * smoothstep(1.0, 9.0, z) * (1.0 - smoothstep(h * 0.4, h, z)) * (0.35 + 0.65 * smoothstep(0.15, 0.85, wisp));
}
void main() {
  vec2 vb = viewOf(gl_FragCoord.xy);
  vec3 V = towardViewer();
  vec3 o = rayOf(vb) + V * 600.0, d = -V;
  float a = plume(o, d, uSpout, 90.0, 2.2, 0.32, uTime) * uSteam;
  float hz = plume(o, d, uSpout + vec3(-30.0, 30.0, 6.0), 170.0, 26.0, 0.7, uTime * 0.5) * 0.55;
  a += plume(o, d, uCupAt, 12.0, 2.4, 0.35, uTime * 1.3) * uCup;
  a = clamp(a + hz * uHaze, 0.0, 1.0);
  vec3 c = tonemap(vec3(0.92, 0.94, 0.97) * a * 0.8, 1.5);
  // On paper the cloud is light grey, its crown paler and its underside a little darker; alpha 1 - exp(-density k).
  float al = (1.0 - exp(-a * 2.8)) * 0.85;
  vec3 ink = mix(vec3(0.66, 0.70, 0.76), vec3(0.84, 0.87, 0.90), smoothstep(0.1, 0.7, a));
  gl_FragColor = mix(vec4(c, max(c.r, max(c.g, c.b))), vec4(ink * al, al), uLight);
}`;
