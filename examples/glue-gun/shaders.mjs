import { C, at } from "./model.mjs";
import { STACK, STONES } from "./barrel.mjs";

// Heat and glue on the section plane y = 0, in the drawing's camera. The stones glow with the current through
// them; heat rises from them through the block's section as strands coloured by temperature; the melt in the bore
// glows by its temperature and, while the stick pushes, streams toward the tip, faster where the channel narrows;
// the rope and the blob on the lid cool from orange through pale to blue as they set.
const f = (v) => (Number.isInteger(v) ? v.toFixed(1) : String(+v.toFixed(3)));
const Z = C.ZC, B = C.BLOCK, N = C.NOZ;

export const BOX = (() => {
  const pts = [[-34, 0, Z - 22], [82, 0, C.BOX.z - 4], [82, 0, Z + 14], [-34, 0, Z + 14], [82, 16, C.BOX.z], [82, -16, C.BOX.z]].map(at);
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  return [Math.min(...xs) - 2, Math.min(...ys) - 2, Math.max(...xs) + 2, Math.max(...ys) + 2].map((v) => +v.toFixed(1));
})();

export const FRAG = `
uniform float uT, uHeat, uFlow, uCur, uTip, uFed, uBall, uRope, uMelt, uLight;
uniform vec3 uBlob;
uniform vec4 uBox;
float glueR(float x) {
  if (x < 14.0) return ${f(B.bore)};
  if (x < 17.0) return ${f(B.bore)} + (${f(B.pass - B.bore)}) * (x - 14.0) / 3.0;
  if (x < ${f(N.seat)}) return ${f(B.pass)};
  if (x < ${f(N.step)}) return ${f(N.chamber)};
  return ${f(N.orifice)};
}
vec3 ramp(float t, float light) {
  vec3 cold = mix(vec3(0.25, 0.55, 1.0), vec3(0.14, 0.44, 0.95), light);
  vec3 pale = mix(vec3(0.92, 0.94, 1.0), vec3(0.6, 0.6, 0.82), light);
  vec3 warm = mix(vec3(1.0, 0.66, 0.24), vec3(0.98, 0.64, 0.16), light);
  vec3 hot = mix(vec3(1.0, 0.44, 0.1), vec3(0.94, 0.34, 0.05), light);
  vec3 c = mix(cold, pale, smoothstep(25.0, 75.0, t));
  c = mix(c, warm, smoothstep(75.0, 135.0, t));
  return mix(c, hot, smoothstep(135.0, 190.0, t));
}
vec4 ink(vec3 c, float a) { a = clamp(a, 0.0, 0.92); return vec4(c * a, a); }
vec4 over(vec4 top, vec4 under) { return top + under * (1.0 - top.a); }
void main() {
  vec2 vb = viewOf(gl_FragCoord.xy);
  if (vb.x < uBox.x || vb.y < uBox.y || vb.x > uBox.z || vb.y > uBox.w) { gl_FragColor = vec4(0.0); return; }
  vec3 p = onWallY(vb, 0.0);
  float x = p.x, dz = p.z - ${f(Z)}, az = abs(dz), px = pixelOf() / uCam.w, t = uTime;
  vec4 col = vec4(0.0);
  // The stones: current through them, as a pale yellow glow.
  float st = 0.0;
  ${STONES.map(([a, b]) => `st = max(st, window(x, ${f(a)}, ${f(b)}, 0.7 * px) * window(p.z, ${f(STACK.stone[0])}, ${f(STACK.stone[1])}, 0.7 * px));`).join("\n  ")}
  float cur = uCur * st * (0.82 + 0.18 * noise2(vec2(x * 0.7, t * 5.0)));
  // Heat rising from the stones through the block's section toward the bore.
  float inBlock = window(x, ${f(B.x0 + 0.6)}, ${f(B.x1 - 0.6)}, 0.7 * px) * window(az, glueR(x) + 0.5, ${f(B.h - 0.5)}, 0.7 * px) * step(dz, 0.0);
  inBlock += window(x, ${f(B.x0 + 0.6)}, ${f(B.x1 - 0.6)}, 0.7 * px) * window(az, glueR(x) + 0.5, ${f(B.h - 0.5)}, 0.7 * px) * step(0.0, dz) * 0.55;
  inBlock *= 1.0 - window(x, 17.5, 26.5, 0.7 * px) * (1.0 - smoothstep(5.0 - 0.7 * px, 5.0 + 0.7 * px, az));
  float rise = (${f(B.h)} - dz) / ${f(2 * B.h)};
  float wav = x * 1.6 + 2.4 * noise2(vec2(x * 0.22 + 3.0, p.z * 0.2 - t * 0.9));
  float strand = smoothstep(0.55, 1.0, sin(wav)) * (0.35 + 0.65 * smoothstep(0.2, 0.9, 0.5 + 0.5 * sin((p.z - t * 7.0) * 0.55 + x * 0.35)));
  float heatA = inBlock * strand * (0.25 + 0.75 * uHeat) * smoothstep(0.02, 0.2, uHeat) * smoothstep(30.0, 60.0, uT) * 0.62;
  float tb = uT + 18.0 * uHeat * clamp(rise, 0.0, 1.0);
  // The melt: hot glue in the bore, the passage, the chamber and the orifice, streaming while it flows.
  float r = glueR(x);
  float melt = window(x, uTip - 1.0, 58.0, 0.6 * px) * (1.0 - smoothstep(r - 0.4 - 0.7 * px, r - 0.4 + 0.7 * px, az));
  vec2 bc = vec2(${f(N.seat + 1.33)} + uBall, 0.0);
  melt *= smoothstep(${f(N.ball)} - 0.7 * px, ${f(N.ball)} + 0.7 * px, length(vec2(x, dz) - bc));
  float speed = pow(${f(B.bore)} / max(r, 0.8), 2.0);
  float s = x - uFed * speed;
  float fl = smoothstep(0.5, 0.9, noise2(vec2(s * 0.3, dz * 2.4 / max(r, 1.0))));
  float molten = smoothstep(85.0, 150.0, uT);
  float meltA = melt * molten * (0.2 + 0.5 * uFlow * fl + 0.12 * uMelt * smoothstep(uTip + 6.0, uTip - 1.0, x));
  float tm = uT - 6.0 * smoothstep(${f(N.seat)}, 58.0, x);
  // The rope from the tip and the blob on the lid, cooling as they set.
  vec2 q0 = vec2(58.4, ${f(Z)}), q1 = vec2(${f(C.BLOB_X - 1)}, ${f(Z - 2)}), q2 = vec2(${f(C.BLOB_X)}, ${f(C.BOX.z)} + uBlob.y * 0.9);
  float dr = 1e3;
  for (int i = 0; i <= 12; i++) { float u = float(i) / 12.0; vec2 b = (1.0 - u) * (1.0 - u) * q0 + 2.0 * u * (1.0 - u) * q1 + u * u * q2; dr = min(dr, length(vec2(x, p.z) - b)); }
  float rope = uRope * (1.0 - smoothstep(0.75 * uRope - 0.7 * px, 0.75 * uRope + 0.7 * px, dr)) * 0.8;
  vec3 b0 = onFloor(vb, ${f(C.BOX.z)} + uBlob.y * 0.3);
  float br = length(b0.xy - vec2(${f(C.BLOB_X)}, 0.0)) / max(uBlob.x, 0.01);
  float blob = (1.0 - smoothstep(0.62, 0.92, br)) * smoothstep(0.6, 2.0, uBlob.x) * smoothstep(32.0, 70.0, uBlob.z) * 0.6;
  col = over(ink(ramp(uBlob.z, uLight), blob), col);
  col = over(ink(ramp(tb, uLight), heatA), col);
  col = over(ink(ramp(tm, uLight), meltA), col);
  col = over(ink(ramp(uT - 8.0, uLight), rope), col);
  col = over(ink(mix(vec3(1.0, 0.9, 0.5), vec3(0.98, 0.8, 0.16), uLight), cur * 0.9), col);
  if (uLight < 0.5) { vec3 c = tonemap(col.rgb * 1.3, 1.2); col = vec4(c, max(c.r, max(c.g, c.b))); }
  col.rgb = min(col.rgb, vec3(col.a));
  float dn = (hash12(gl_FragCoord.xy + fract(uTime) * 61.0) - 0.5) / 255.0 * smoothstep(0.0, 1.5 / 255.0, col.a);
  gl_FragColor = vec4(max(col.rgb + dn, 0.0), max(col.a + dn, 0.0));
}`;
