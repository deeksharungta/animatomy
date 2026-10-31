// The page script, part two: drawing the model, the heat and steam layers, and the run.
export const RUN_SCRIPT = `
const stage = document.querySelector(".es-stage");
const svgs = [...stage.querySelectorAll(":scope > svg")];
const part = (name) => stage.querySelector('[data-part="' + name + '"]');
const el = { rod: part("rod"), spring: part("spring"), cap: part("cap"), coffee: part("coffee"), streams: part("streams"), streamsIn: part("streams-in"), needle: part("needle"), lever: part("lever"), lamp: part("lamp"), ollie: part("ollie"), ember: part("ember"), crumb: part("crumb") };
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
let lastPose = {};
function paintCrew(name, node, spec, pose, duty) {
  const key = JSON.stringify(pose) + duty;
  if (lastPose[name] === key) return;
  lastPose[name] = key;
  CREW.paintCritter(node, CREW.critter(spec, pose, P));
  node.toggleAttribute("data-duty", duty);
}
const heat = glLayer({ canvas: stage.querySelector(".es-heat"), fragment: HEAT, view: SIZE, camera: CAMERA, uniforms: ["uHeat", "uLight", "uBox"], maxRatio: 1.25 });
const steam = glLayer({ canvas: stage.querySelector(".es-steam"), fragment: STEAM, view: SIZE, camera: CAMERA, uniforms: ["uSteam", "uPuff", "uLight", "uCup", "uVent"], maxRatio: 1.25 });
let view = [...VIEWS[0]];
function paintGL() {
  const light = stage.closest("[data-theme]")?.getAttribute("data-theme") === "light" ? 1 : 0;
  const cam = { uView: [view[2], view[3]], uOrigin: [CAMERA.origin[0] - view[0], CAMERA.origin[1] - view[1]] };
  const t = still.matches ? 0.5 : performance.now() / 1000;
  const box = [HEAT_BOX[0] - view[0], HEAT_BOX[1] - view[1], HEAT_BOX[2] - view[0], HEAT_BOX[3] - view[1]];
  if (heat) S.heat > 0.003 ? heat.draw({ ...cam, uHeat: S.heat, uLight: light, uBox: box }, t) : heat.clear();
  const puff = still.matches ? 0 : burst(S.puff, 0.12, 1.1);
  const mist = S.steam * S.fade;
  if (steam) mist + puff > 0.004 ? steam.draw({ ...cam, uSteam: mist, uPuff: puff, uLight: light, uCup: CUP, uVent: VENT }, t) : steam.clear();
}
const mm = (s) => Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0");
function draw() {
  const D = dynamic(K, P, C, S);
  el.rod.setAttribute("transform", K.translateAlong(P, [C.STROKE * Math.sin(S.ph) * S.amp, 0, 0]));
  el.spring.innerHTML = D.spring; el.cap.innerHTML = D.cap; el.needle.innerHTML = D.needle; el.lever.innerHTML = D.lever;
  el.coffee.innerHTML = D.coffee; el.streams.innerHTML = D.streams; el.streamsIn.innerHTML = D.streamsIn;
  el.coffee.style.opacity = S.fade.toFixed(3);
  el.lamp.querySelector(".iso-solid").toggleAttribute("data-lit", S.heat > 0.5);
  const p = poses(C, S);
  paintCrew("ollie", el.ollie, OLLIE, p.ollie, S.duty === "ollie");
  paintCrew("ember", el.ember, EMBER, p.ember, S.duty === "ember");
  paintCrew("crumb", el.crumb, CRUMB, p.crumb, S.duty === "crumb");
  paintGL();
  const word = S.swap >= 0 ? "fresh cup" : S.pump ? (S.head < 1 ? "filling" : S.lift > 0.5 ? "brewing · valve open" : "brewing") : S.p > 0.3 ? "venting" : S.sw > 0.5 ? "heating" : S.g >= C.SHOT ? "done" : S.T >= C.TSET ? "ready" : "cold";
  const text = word + " · " + Math.round(S.T) + " °C · " + S.p.toFixed(1) + " bar · " + Math.round(S.g) + " g" + (S.shotT > 0 ? " · " + mm(S.shotT) : "");
  if (readout.textContent !== text) readout.textContent = text;
}
const DONE = [
  () => S.swap < 0 && S.stepT > 0.3,
  () => S.T >= C.TSET && S.sw < 0.02 && S.stepT > 0.5,
  () => S.p >= 8.5,
  () => S.lift > 0.95 && S.stepT > 0.8,
  () => S.g >= C.SHOT,
  () => S.p < 0.3 && S.puff > 1.4,
  () => S.stepT > 1.5,
];
function enter(i, how) {
  beat = i;
  if (i === 0) Object.assign(S, { ...REST, hold: false, pump: false, g: S.g, steam: S.steam, T: S.T, swap: how === "loop" ? 0 : -1, ph: S.ph });
  if (i === 0 && how !== "loop") Object.assign(S, { g: 0, steam: 0, T: C.T0 });
  if (i === 1) S.hold = true;
  if (i === 2) { S.pump = true; S.head = 0; }
  if (i === 5) S.pump = false;
  S.stepT = 0;
  lastPose = {};
  draw();
}
STEPS.mountSteps({
  root: document.querySelector("[data-steps]"),
  svg: svgs,
  stage,
  steps: STEP_INFO,
  views: VIEWS,
  colors: COLORS,
  size: SIZE,
  enter,
  update: (dt) => { step(dt); draw(); },
  done: (i) => DONE[i](),
  advance: step,
  draw,
  save: () => JSON.parse(JSON.stringify({ S, beat })),
  load: (x) => { Object.assign(S, JSON.parse(JSON.stringify(x.S))); beat = x.beat; lastPose = {}; },
  onView: (v) => { view = v; paintGL(); },
});
`;
