import { glCamera } from "../../kit/gl.mjs";
import { WIDTH, HEIGHT, C, P, model } from "./model.mjs";
import { REST, dynamic, poses } from "./moving.mjs";
import { VOLTA, PIP, MO, STEPS, VIEWS, readoutOf } from "./story.mjs";

// The lamp's light, in the drawing's own camera. It is steady, so the page redraws it only when the lamp or the
// camera changes.
const GLOW = `
uniform float uLamp;
uniform vec3 uLampP;
uniform float uLight;
void main() {
  vec2 vb = viewOf(gl_FragCoord.xy);
  vec2 q = (vb - project(uLampP)) / uK;
  float r = length(q);
  float g = uLamp * (exp(-r * r / 40.0) * 1.3 + exp(-r * r / 420.0) * 0.38 + exp(-r / 34.0) * 0.1);
  vec3 c = tonemap(vec3(1.0, 0.84, 0.52) * g, 1.4);
  float a = max(c.r, max(c.g, c.b));
  float al = min(0.82, a * 0.95);
  vec3 ink = mix(vec3(0.98, 0.72, 0.28), vec3(0.93, 0.55, 0.12), clamp(r / 30.0, 0.0, 1.0));
  vec4 col = mix(vec4(c, a), vec4(ink * al, al), uLight);
  float dz = (hash12(gl_FragCoord.xy) - 0.5) / 255.0 * step(0.004, col.a);
  gl_FragColor = vec4(max(col.rgb + dz, 0.0), col.a);
}`;

const CAMERA = glCamera(P);

// The page script, part one: the state, the drawing and the model step.
export const DRAW_SCRIPT = `
const P = ${JSON.stringify(P)};
const C = ${JSON.stringify(C)};
const VOLTA = ${JSON.stringify(VOLTA)}, PIP = ${JSON.stringify(PIP)}, MO = ${JSON.stringify(MO)};
const STEP_INFO = ${JSON.stringify(STEPS.map(({ title, text, who, hold, pace }) => ({ title, text, who, hold, pace })))};
const TARGETS = ${JSON.stringify(STEPS.map((s) => s.to))};
const VIEWS = ${JSON.stringify(VIEWS.map((v) => v.map((n) => +n.toFixed(2))))};
const COLORS = ${JSON.stringify(STEPS.map((s) => s.color))};
const CAMERA = ${JSON.stringify(CAMERA)};
const GLOW = ${JSON.stringify(GLOW)};
const K = { iso, pathOf, depthOf, cameraOf, solidSvg, dotsSvg, ...CREW };
const model = ${model.toString()};
const dynamic = ${dynamic.toString()};
const poses = ${poses.toString()};
const M = model(C);
const stage = document.querySelector(".sn-stage");
const svgs = [...stage.querySelectorAll(":scope > svg")];
const part = (name) => stage.querySelector('[data-part="' + name + '"]');
const orbit = stage.querySelector("[data-orbit]");
const el = { back: part("orbit-back"), front: part("orbit-front"), bar: part("bar"), gears: part("gears"), handle: part("handle"), lowA: part("low-a"), lowB: part("low-b"), pipA: part("pip-a"), pipB: part("pip-b"), mount: part("mount"), crank: part("crank"), crankH: part("crank-h"), moSlot: part("mo-slot"), globe: part("globe"), land: part("land"), night: part("night"), london: part("london"), pip: part("pip"), mo: part("mo"), volta: part("volta") };
const readout = document.querySelector("[data-readout]");
const REST = ${JSON.stringify(REST)};
const S = { ...REST };
let lastPose = {};
function paintCrew(name, node, spec, pose, duty) {
  const key = JSON.stringify(pose) + duty;
  if (lastPose[name] === key) return;
  lastPose[name] = key;
  CREW.paintCritter(node, CREW.critter(spec, pose, P));
  node.toggleAttribute("data-duty", duty);
}
const glow = glLayer({ canvas: stage.querySelector(".sn-gl"), fragment: GLOW, view: [${WIDTH}, ${HEIGHT}], camera: CAMERA, uniforms: ["uLamp", "uLampP", "uLight"], maxRatio: 1.25 });
let view = VIEWS[0] ? [...VIEWS[0]] : [0, 0, ${WIDTH}, ${HEIGHT}];
const still = matchMedia("(prefers-reduced-motion: reduce)");
let glKey = "", width = 0;
new ResizeObserver((entries) => { width = entries[0].contentRect.width; paintGL(); }).observe(stage);
function paintGL() {
  if (!glow) return;
  const light = stage.closest("[data-theme]")?.getAttribute("data-theme") === "light" ? 1 : 0;
  const key = view.map((v) => v.toFixed(2)).join(" ") + " " + S.lamp.toFixed(3) + " " + light + " " + width;
  if (key === glKey) return;
  glKey = key;
  const cam = { uView: [view[2], view[3]], uOrigin: [CAMERA.origin[0] - view[0], CAMERA.origin[1] - view[1]] };
  S.lamp > 0.002 ? glow.draw({ ...cam, uLamp: S.lamp, uLampP: C.LAMP, uLight: light }, 0) : glow.clear();
}
const readoutOf = ${readoutOf.toString()};
// Only what changed reaches the DOM: a paused globe turning in place leaves the arm and its gears alone.
const shown = new Map();
function put(node, name, value) {
  const was = shown.get(node) ?? {};
  if (was[name] === value) return;
  was[name] = value;
  shown.set(node, was);
  if (name === "html") node.innerHTML = value; else node.setAttribute(name, value);
}
function draw() {
  const D = dynamic(K, P, C, M, S);
  const host = D.armFront ? el.front : el.back;
  if (orbit.parentNode !== host) host.appendChild(orbit);
  const [first, second] = D.armFront ? [el.gears, el.handle] : [el.handle, el.gears];
  if (first.parentNode !== el.lowA) { el.lowA.appendChild(first); el.lowB.appendChild(second); }
  put(el.bar, "html", D.bar);
  put(el.gears, "html", D.gears);
  put(el.handle, "html", D.handle);
  const t = "translate(" + D.globeShift[0].toFixed(2) + " " + D.globeShift[1].toFixed(2) + ")";
  for (const g of [el.mount, el.crank, el.globe]) put(g, "transform", t);
  put(el.crankH, "html", D.crank);
  put(el.land, "d", D.land);
  put(el.night, "d", D.night);
  put(el.night, "style", "--sn-lamp:" + D.lamp);
  put(el.london, "cx", D.london ? D.london[0].toFixed(2) : "-999");
  put(el.london, "cy", D.london ? D.london[1].toFixed(2) : "-999");
  const p = poses(C, M, S, D);
  // Pip stands in front of the globe's post or behind it, whichever is true from the camera.
  const pipNear = K.depthOf(p.pip.at, P) > K.depthOf([D.G[0], D.G[1], 30], P);
  const slot = pipNear ? el.pipB : el.pipA;
  if (el.pip.parentNode !== slot) slot.appendChild(el.pip);
  paintCrew("pip", el.pip, PIP, p.pip, S.duty === "pip");
  paintCrew("mo", el.mo, MO, p.mo, S.duty === "mo");
  paintCrew("volta", el.volta, VOLTA, p.volta, S.duty === "volta");
  paintGL();
  const text = readoutOf(C, M, S.day);
  if (readout.textContent !== text) readout.textContent = text;
}
const DONE = TARGETS.map((to, i) => () => (i === 1 ? S.lamp === 1 && S.stepT > 0.6 : S.day === S.target && S.stepT > 0.4));
function step(dt) {
  S.t += dt;
  S.stepT += dt;
  S.lamp += (S.lampT - S.lamp) * (1 - Math.exp(-dt / 0.35));
  if (Math.abs(S.lampT - S.lamp) < 0.001) S.lamp = S.lampT;
  const gap = S.target - S.day;
  // Pip hurries between seasons and slows into each; on Mo's beat the date keeps time with the globe's turns.
  const lock = S.lock && Math.abs(gap) < 3.5;
  const speed = lock ? C.TURN / (2 * Math.PI) : Math.max(1.5, Math.min(30, Math.abs(gap) * 3));
  const v = Math.sign(gap) * Math.min(Math.abs(gap), speed * dt);
  S.day += v;
  if (Math.abs(S.target - S.day) < 0.01) S.day = S.target;
  S.walk = Math.abs(v) > 1e-4;
  if (S.turning) S.spin += (lock ? C.TURN : C.SPIN) * dt;
  S.duty = Math.abs(S.lamp - S.lampT) > 0.01 ? "volta" : S.walk ? "pip" : S.turning && S.lamp > 0.5 ? "mo" : "";
}
function enter(i) {
  if (i === 0) Object.assign(S, { ...REST, spin: S.spin });
  Object.assign(S, { lampT: i >= 1 ? 1 : 0, turning: i >= 3, target: TARGETS[i], lock: i === 4, stepT: 0 });
  draw();
}
`;
