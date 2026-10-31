import { C, at } from "./model.mjs";

// Light and heat, in the drawing's own camera. The band heater glows orange on its ribs and warms the boiler
// and the deck around it; steam rises from the hot coffee and puffs out of the vent into the drip tray.
const f = (v) => (Number.isInteger(v) ? v.toFixed(1) : String(+v.toFixed(3)));
const [gx, gy] = C.G;
const G = `vec2(${f(gx)}, ${f(gy)})`;
const DZ = C.DECK_Z + C.DECK_H;

// The boiler's box on screen, in figure units before any zoom: pixels outside it stay empty.
export const HEAT_BOX = (() => {
  const pts = [];
  for (const dx of [-36, 36]) for (const dy of [-36, 36]) for (const z of [DZ, C.BOIL.z1]) pts.push(at([gx + dx, gy + dy, z]));
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)].map((v) => +v.toFixed(1));
})();

export const HEAT = `
uniform float uHeat;
uniform float uLight;
uniform vec4 uBox;
bool cyl(vec3 o, vec3 d, float r, float z0, float z1, out vec3 p) {
  vec2 oc = o.xy - ${G};
  float a = dot(d.xy, d.xy), b = dot(oc, d.xy), c = dot(oc, oc) - r * r, h = b * b - a * c;
  if (h < 0.0) return false;
  p = o + d * ((-b - sqrt(h)) / a);
  return p.z > z0 && p.z < z1;
}
void main() {
  vec2 vb = viewOf(gl_FragCoord.xy);
  if (vb.x < uBox.x || vb.y < uBox.y || vb.x > uBox.z || vb.y > uBox.w) { gl_FragColor = vec4(0.0); return; }
  vec3 V = towardViewer();
  vec3 o = rayOf(vb) + V * 600.0, d = -V, p;
  float g = uHeat * (0.94 + 0.06 * noise2(vec2(uTime * 2.1, 3.0)));
  float px = pixelOf() * 1.4;
  vec3 hot = vec3(0.0), warm = vec3(0.0);
  if (cyl(o, d, ${f(C.BAND.r)}, ${f(C.BAND.z0)}, ${f(C.BAND.z1)}, p)) {
    float k = abs(fract((p.z - ${f(C.BAND.z0)}) / 2.5) - 0.5) * 2.5;
    float m = window(p.z, ${f(C.BAND.z0 + 0.8)}, ${f(C.BAND.z1 - 0.8)}, 0.4);
    hot = vec3(1.0, 0.56, 0.18) * (1.0 - smoothstep(0.3, 0.3 + px, k)) * m * 1.5 * g;
    warm = vec3(1.0, 0.3, 0.06) * (exp(-k * k / 1.6) * 0.5 + 0.2) * m * g;
  } else if (cyl(o, d, ${f(C.BOIL.r)}, ${f(C.BOIL.z0)}, ${f(C.BOIL.z1)}, p)) {
    float above = exp(-max(0.0, p.z - ${f(C.BAND.z1)}) / 5.0), below = exp(-max(0.0, ${f(C.BAND.z0)} - p.z) / 2.5);
    warm = vec3(1.0, 0.34, 0.08) * 0.22 * (p.z > ${f(C.BAND.z1)} ? above : below) * g;
  } else {
    p = o + d * ((o.z - ${f(DZ)}) / -d.z);
    float r = length(p.xy - ${G});
    float on = window(p.x, ${f(C.DECK.x + 2)}, ${f(C.DECK.x + C.DECK.w - 2)}, 2.0) * window(p.y, ${f(C.DECK.y + 2)}, ${f(C.DECK.y + C.DECK.d - 2)}, 2.0);
    warm = vec3(1.0, 0.34, 0.08) * 0.2 * exp(-max(0.0, r - ${f(C.BAND.r)}) / 8.0) * step(${f(C.BAND.r)}, r) * on * g;
  }
  vec3 c = tonemap(hot + warm, 1.3);
  float a = max(c.r, max(c.g, c.b));
  float share = clamp(length(hot) / (length(hot) + length(warm) + 1e-4), 0.0, 1.0);
  vec3 ink = mix(vec3(0.93, 0.5, 0.2), vec3(0.85, 0.27, 0.03), share);
  float al = min(0.9, a * 1.05);
  vec4 col = mix(vec4(c, a), vec4(ink * al, al), uLight);
  float dz = (hash12(gl_FragCoord.xy + fract(uTime) * 61.0) - 0.5) / 255.0 * step(0.004, col.a);
  gl_FragColor = vec4(max(col.rgb + dz, 0.0), col.a);
}`;

export const VENT = [C.SOL.x, C.SOL.y, C.TRAY_Z + 1.2];

export const STEAM = `
uniform float uSteam;
uniform float uPuff;
uniform float uLight;
uniform vec3 uCup;
uniform vec3 uVent;
float plume(vec3 o, vec3 d, vec3 base, float h, float w0, float t) {
  vec2 n = normalize(-d.xy);
  vec3 p = o + d * (dot(base.xy - o.xy, n) / dot(d.xy, n));
  float z = p.z - base.z;
  float u = dot(p.xy - base.xy, vec2(-n.y, n.x));
  float drift = (fbm2(vec2(z * 0.1 - t * 0.5, 1.7)) - 0.5) * z * 0.5;
  float q = (u - drift) / (w0 + max(z, 0.0) * 0.2);
  float wisp = fbm2(vec2(u * 0.3, z * 0.2 - t * 0.9));
  return exp(-q * q * 2.0) * smoothstep(0.0, 3.0, z) * (1.0 - smoothstep(h * 0.45, h, z)) * smoothstep(0.3, 0.75, wisp);
}
void main() {
  vec2 vb = viewOf(gl_FragCoord.xy);
  vec3 V = towardViewer();
  vec3 o = rayOf(vb) + V * 600.0, d = -V;
  float a = plume(o, d, uCup, 24.0, 2.4, uTime) * uSteam + plume(o, d, uVent, 18.0, 1.4, uTime * 1.7) * uPuff;
  vec3 c = tonemap(vec3(0.92, 0.94, 0.97) * a, 1.5);
  float al = min(0.5, a * 0.7);
  gl_FragColor = mix(vec4(c, max(c.r, max(c.g, c.b))), vec4(vec3(0.46, 0.48, 0.52) * al, al), uLight);
}`;
