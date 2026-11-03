import { C, P } from "./model.mjs";
import { XWIN } from "./xfmr.mjs";
import { BANKS, FANS } from "./cooler.mjs";
import { LIB, f } from "./flows-glsl.mjs";
import { glCamera } from "../../kit/gl.mjs";
import { iso } from "../../kit/iso-kit.mjs";

// The transformer's flows. Oil rises through the winding, warm amber at the top with the top-oil temperature,
// leaves by the top manifolds, falls through the radiator panels cooling to blue, and the pump sends it back to
// the bottom of the tank. The fans under the banks push cooling air up between the panels; it leaves the top
// as a pale blue plume that warms a little and curls apart.
const T = C.TANK, FY = T.y + T.d, W = XWIN, CX = (W.x0 + W.x1) / 2, CY = T.y + T.d / 2;
const head = `void main() {
  vec2 vb = viewOf(gl_FragCoord.xy);
  vec3 V = towardViewer(), o = rayOf(vb) + V * 900.0, d = -V;
  float px = pixelOf();
  gl_FragColor = vec4(0.0);`;

// Seen through the window in the tank's front: two shells of oil round the winding, rising.
export const WINDINGS = LIB + head + `
  if (uAmp < 0.002) return;
  vec3 pw = onWallY(vb, ${f(FY)});
  float mask = window(pw.x, ${f(W.x0)}, ${f(W.x1)}, 0.35 * px) * window(pw.z, ${f(W.z0)}, ${f(W.z1)}, 0.35 * px);
  if (mask < 0.001) return;
  vec2 v = normalize(V.xy), ax = vec2(${f(CX)}, ${f(CY)});
  vec4 ink = vec4(0.0);
  for (int i = 1; i >= 0; i--) {
    float r = 11.0 + float(i) * 1.8, t = cylHit(o.xy, d.xy, ax, r, -1.0);
    if (t < 0.0) continue;
    vec3 q = o + d * t;
    float a = aboutView(q.xy - ax, v), side = smoothstep(1.57, 1.15, abs(a));
    float th = threads(vec2(q.z - uPh, r * a * 1.4 + float(i) * 11.0), 0.5, px);
    float Tb = mix(uTemp - 0.06, 0.4, uTemp2), Tz = mix(Tb, uTemp, smoothstep(${f(W.z0 + 2)}, ${f(W.z1 - 6)}, q.z));
    ink = over(flowInk(uAmp * th * side * mask * (1.0 + 0.3 * float(1 - i)), Tz, 1.0), ink);
  }
  // The oil in the open between the winding and the front plate, rising too, a little cooler.
  vec3 pf = onWallY(vb, ${f(FY - 2.5)});
  float Tf = mix(mix(uTemp - 0.08, 0.4, uTemp2), uTemp - 0.03, smoothstep(${f(W.z0)}, ${f(W.z1)}, pf.z));
  ink = over(flowInk(uAmp * 0.8 * mask * threads(vec2(pf.z - uPh * 0.8, pf.x * 1.1 + 31.0), 0.7, px), Tf, 1.0), ink);
  gl_FragColor = finish(ink);
}`;

// The cooler: oil streaming down each bank's panels (their front ends, and the side of the last bank), and the
// air the fans drive up through them. Everything here lies inside one screen box, so other pixels leave at once.
const R = C.RAD, PY = FY + 18 - 0.4, PX = BANKS[2] + 0.4 + 6 * 1.6 + 0.55, cam = glCamera(P);
const box = [[25, -26, 0], [105, -26, 0], [25, 4, 0], [105, 4, 0], [25, -26, 140], [105, -26, 140], [25, 4, 140], [105, 4, 140]].map((p) => iso(p, P));
const bx = [Math.min(...box.map((p) => p[0])), Math.max(...box.map((p) => p[0]))], by = [Math.min(...box.map((p) => p[1])), Math.max(...box.map((p) => p[1]))];
const fan = (i) => `
    { vec2 pb = project(vec3(${f(FANS[i][0])}, ${f(FANS[i][1])}, 0.0));
      float u = (vb.x - pb.x) / uK, z = -(vb.y - pb.y) / (uK * uCam.w), R = 5.2 + 0.22 * max(z - 55.0, 0.0);
      float h = smoothstep(7.0, 10.0, z) * mix(0.5, 0.16, smoothstep(12.0, 15.0, z)) + smoothstep(52.0, 60.0, z) * 0.84;
      h *= smoothstep(104.0, 66.0, z);
      float th = threads(vec2(z - uPh2, u * 1.3 + ${f(i * 17)}), 0.5 + 2.2 * smoothstep(55.0, 105.0, z), px);
      air += th * h * exp(-pow(u / R, 2.0) * 1.6) * pow(5.2 / R, 0.6); }`;
export const COOLING = LIB + head + `
  if (uAmp < 0.002 && uAmp2 < 0.002) return;
  vec2 full = vb - uOrigin + vec2(${f(cam.origin[0])}, ${f(cam.origin[1])});
  if (full.x < ${f(bx[0])} || full.x > ${f(bx[1])} || full.y < ${f(by[0])} || full.y > ${f(by[1])}) return;
  vec4 ink = vec4(0.0);
  if (uAmp > 0.002) {
    float Tt = uTemp - 0.05, Tb = mix(0.34, 0.1, uAmp2);
    vec3 pf = onWallY(vb, ${f(PY)}), ps = onWallX(vb, ${f(PX)});
    float zw = 0.35 * px, m = 0.0;
    ${BANKS.map((x) => `m += window(pf.x, ${f(x + 0.4)}, ${f(x + 10.95)}, zw) * threads(vec2(-pf.z - uPh, pf.x * 1.6), 0.35, px);`).join("\n    ")}
    float side = window(ps.y, ${f(FY + 2.4)}, ${f(PY)}, zw) * threads(vec2(-ps.z - uPh, ps.y * 1.6 + 5.0), 0.35, px);
    vec4 front = flowInk(uAmp * m * 1.3 * window(pf.z, ${f(R.z[0])}, ${f(R.z[1])}, zw), mix(Tb, Tt, smoothstep(${f(R.z[0] + 2)}, ${f(R.z[1] - 2)}, pf.z)), 0.0);
    ink = over(front, flowInk(uAmp * side * 1.3 * window(ps.z, ${f(R.z[0])}, ${f(R.z[1])}, zw), mix(Tb, Tt, smoothstep(${f(R.z[0] + 2)}, ${f(R.z[1] - 2)}, ps.z)), 0.0));
  }
  if (uAmp2 > 0.002) {
    float air = 0.0;
    ${FANS.map((_, i) => fan(i)).join("")}
    float zc = -(vb.y - project(vec3(${f(FANS[1][0])}, ${f(FANS[1][1])}, 0.0)).y) / (uK * uCam.w);
    ink = over(flowInk(uAmp2 * air * (1.4 + 0.6 * (1.0 - uLight)), mix(0.2, 0.36, smoothstep(30.0, 62.0, zc)), 0.0), ink);
  }
  gl_FragColor = finish(ink);
}`;
