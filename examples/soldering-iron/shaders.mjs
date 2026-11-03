import { C, at } from "./model.mjs";
import { NODES } from "./thermal.mjs";

// Heat and current on the cut plane y = 0, in the drawing's own camera. Heat flows as strands that drift
// from the coil in toward the axis through the ceramic, then along the copper core to the point, each strand
// coloured by the temperature where it is (cool blue, through pale, to hot orange) and as strong as the heat
// flowing there. While current runs, the coil's turns glow a pale yellow.
const f = (v) => (Number.isInteger(v) ? v.toFixed(1) : String(+v.toFixed(3)));
const N = NODES.x.length, H = C.HEAT, Z = f(C.ZC);

export const HEAT_BOX = (() => {
  const pts = [];
  for (const x of [-1, 94]) for (const z of [C.ZC - 8, C.ZC + 8]) pts.push(at([x, 0, z]));
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  return [Math.min(...xs) - 2, Math.min(...ys) - 2, Math.max(...xs) + 2, Math.max(...ys) + 2].map((v) => +v.toFixed(1));
})();

const tipR = () => {
  const T = C.TIP, parts = [`if (x < ${f(T[0][0])}) return ${f(C.TIP_R)};`];
  for (let i = 1; i < T.length; i++) {
    const [a, ra] = T[i - 1], [b, rb] = T[i];
    parts.push(`if (x < ${f(b)}) return ${f(ra)} + (${f(rb - ra)}) * (x - ${f(a)}) / ${f(b - a)};`);
  }
  return `float tipR(float x) { ${parts.join(" ")} return 0.0; }`;
};

export const HEAT = `
uniform float uT[${N}];
uniform float uQ[${N}];
uniform float uQH[${N}];
uniform float uTH;
uniform float uCur;
uniform float uFlow;
uniform float uLight;
uniform vec4 uBox;
${tipR()}
vec3 rampDark(float t) {
  vec3 cold = vec3(0.25, 0.55, 1.0), pale = vec3(0.92, 0.94, 1.0), warm = vec3(1.0, 0.62, 0.22), hot = vec3(1.0, 0.42, 0.08);
  vec3 c = mix(cold, pale, smoothstep(20.0, 140.0, t));
  c = mix(c, warm, smoothstep(140.0, 260.0, t));
  return mix(c, hot, smoothstep(260.0, 380.0, t));
}
vec3 rampLight(float t) {
  vec3 cold = vec3(0.12, 0.42, 0.95), pale = vec3(0.66, 0.62, 0.78), warm = vec3(0.98, 0.78, 0.2), hot = vec3(1.0, 0.93, 0.55);
  vec3 c = mix(cold, pale, smoothstep(20.0, 140.0, t));
  c = mix(c, warm, smoothstep(140.0, 270.0, t));
  return mix(c, hot, smoothstep(280.0, 380.0, t));
}
void main() {
  vec2 vb = viewOf(gl_FragCoord.xy);
  if (uFlow < 0.002 && uCur < 0.002) { gl_FragColor = vec4(0.0); return; }
  if (vb.x < uBox.x || vb.y < uBox.y || vb.x > uBox.z || vb.y > uBox.w) { gl_FragColor = vec4(0.0); return; }
  vec3 p = onWallY(vb, 0.0);
  float x = p.x, dz = abs(p.z - ${Z}), px = pixelOf() / uCam.w;
  float tx = 0.0, qx = 0.0, qh = 0.0;
  for (int i = 0; i < ${N}; i++) {
    float xi = ${f(C.SLUG[0])} + float(i) * ${f(C.NODE)} + ${f(C.NODE / 2)};
    float w = max(0.0, 1.0 - abs(x - xi) / ${f(C.NODE)});
    tx += w * uT[i]; qx += w * uQ[i]; qh += w * uQH[i];
  }
  float t = uTime;
  // Along the copper: strands drifting toward the point, as strong as the heat flowing past.
  float r = tipR(x);
  float inTip = window(x, ${f(C.SLUG[0])}, 92.0, 0.5) * (1.0 - smoothstep(r - 0.55 - px, r - 0.3, dz));
  float n = noise2(vec2((x - t * 9.0 * sign(qx)) * 0.32, dz * 2.4 + 3.1));
  float strand = smoothstep(0.5, 0.78, n) * (0.35 + 0.65 * smoothstep(0.0, 0.25, fract((x - t * 9.0 * sign(qx)) / 7.0 + n * 0.6)));
  float flowA = (1.0 - exp(-abs(qx) / 3.5)) * inTip * strand * smoothstep(0.0, 8.0, x - ${f(C.SLUG[0])});
  // Through the ceramic: strands drifting in from the coil to the copper.
  float inCer = window(x, ${f(H.x0 + 0.8)}, ${f(H.x1 - 0.8)}, 0.5) * window(dz, ${f(H.cer[0] + 0.15)}, ${f(H.coil)}, 0.2);
  float m = noise2(vec2(x * 1.6 + 7.0, (dz + t * 1.6) * 0.9));
  float radA = (1.0 - exp(-abs(qh) / 0.35)) * inCer * smoothstep(0.45, 0.72, m);
  float hot = mix(tx, uTH, inCer);
  // The coil's turns, glowing while current runs through them.
  float k = abs(fract((x - ${f(H.x0 + 1.6)}) / ${f(H.pitch)} + 0.5) - 0.5) * ${f(H.pitch)};
  float turn = exp(-(k * k + (dz - ${f(H.coil)}) * (dz - ${f(H.coil)})) / 0.12) * window(x, ${f(H.x0 + 1.2)}, ${f(H.x1 - 1.2)}, 0.4);
  float cur = uCur * (0.85 + 0.15 * noise2(vec2(t * 6.0, x * 0.3))) * (turn + 0.25 * exp(-(dz - ${f(H.coil)}) * (dz - ${f(H.coil)}) / 0.5) * window(x, ${f(H.x0 + 1.2)}, ${f(H.x1 - 1.2)}, 0.4));
  float a = clamp((flowA + radA) * uFlow, 0.0, 1.0);
  vec3 dark = rampDark(hot) * a + vec3(1.0, 0.92, 0.55) * cur;
  vec3 cd = tonemap(dark, 1.4);
  vec4 colD = vec4(cd, max(cd.r, max(cd.g, cd.b)));
  float al = min(0.88, a * 0.95);
  vec4 heatL = vec4(rampLight(hot) * al, al);
  float ac = min(0.9, cur * 0.9);
  vec4 curL = vec4(vec3(0.98, 0.84, 0.18) * ac, ac);
  vec4 colL = curL + heatL * (1.0 - curL.a);
  vec4 col = mix(colD, colL, uLight);
  col.rgb = min(col.rgb, vec3(col.a));
  float dn = (hash12(gl_FragCoord.xy + fract(uTime) * 61.0) - 0.5) / 255.0 * smoothstep(0.0, 1.5 / 255.0, col.a);
  gl_FragColor = vec4(max(col.rgb + dn, 0.0), max(col.a + dn, 0.0));
}`;
