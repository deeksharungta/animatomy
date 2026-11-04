// The page script, part two: drawing the model, the heat layer, and the run.
export const RUN_SCRIPT = `
const stage = document.querySelector(".si-stage");
const svgs = [...stage.querySelectorAll(":scope > svg")];
const part = (name) => stage.querySelector('[data-part="' + name + '"]');
const el = {};
const coilEl = part("coil");
for (const n of ["rodA", "rodB", "rodC", "rodD", "springBack", "springFront", "stub", "rocker", "volta", "ember", "roo"]) el[n] = part(n);
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
let lastPose = {};
function paintCrew(name, spec, pose, duty) {
  const key = JSON.stringify(pose) + duty;
  if (lastPose[name] === key) return;
  lastPose[name] = key;
  CREW.paintCritter(el[name], CREW.critter(spec, pose, P));
  CREW.setDuty(el[name], duty);
}
const heat = glLayer({ canvas: stage.querySelector(".si-heat"), fragment: HEAT, view: SIZE, camera: CAMERA, uniforms: ["uT", "uQ", "uQH", "uTH", "uCur", "uFlow", "uLight", "uBox"], maxRatio: 1.5 });
if (heat) stage.setAttribute("data-gl", "");
const light = stage.closest("[data-theme]")?.getAttribute("data-theme") === "light" ? 1 : 0;
let view = [...VIEWS[0]], flow = { x: 0, v: 0 };
function paintGL(dt) {
  if (!heat) return;
  const q = S.q.reduce((m, v) => Math.max(m, Math.abs(v)), 0) + S.qh.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
  flow.x = flow.x + ((q > 0.6 ? 1 : q / 0.6) - flow.x) * (1 - Math.exp(-(dt || 0.016) / 0.35));
  const cam = { uView: [view[2], view[3]], uOrigin: [CAMERA.origin[0] - view[0], CAMERA.origin[1] - view[1]] };
  const box = [HEAT_BOX[0] - view[0], HEAT_BOX[1] - view[1], HEAT_BOX[2] - view[0], HEAT_BOX[3] - view[1]];
  const t = still.matches ? 0.5 : performance.now() / 1000;
  if (flow.x > 0.003 || S.cur > 0.003) heat.draw({ ...cam, uT: S.T, uQ: S.q, uQH: S.qh, uTH: S.TH, uCur: S.cur, uFlow: flow.x, uLight: light, uBox: box }, t);
  else heat.clear();
}
const mm = (s) => Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0");
function draw(dt) {
  const D = dynamic(K, P, C, S);
  const move = K.translateAlong(P, [S.u, 0, 0]);
  for (const n of ["rodA", "rodB", "rodC", "rodD"]) el[n].setAttribute("transform", move);
  el.springBack.innerHTML = D.springBack; el.springFront.innerHTML = D.springFront; el.stub.innerHTML = D.stub; el.rocker.innerHTML = D.rocker;
  const p = poses(C, S);
  paintCrew("volta", VOLTA, p.volta, S.duty === "volta");
  paintCrew("roo", ROO, p.roo, S.duty === "roo");
  paintCrew("ember", EMBER, p.ember, S.duty === "ember");
  paintGL(dt);
  coilEl.toggleAttribute("data-on", S.cur > 0.5);
  const point = S.T[S.T.length - 1];
  const word = !S.power ? (point > 40 ? "off · cooling" : "off") : S.held ? "heater on · 60 W" : "contacts open · heater off";
  const text = word + " · tip " + Math.round(point) + " °C · slug " + Math.round(S.slug) + " °C" + (S.clock > 0 ? " · " + mm(S.clock) : "");
  if (readout.textContent !== text) readout.textContent = text;
}
const DONE = [
  () => S.stepT > 0.4,
  () => S.rocker > 0.98 && S.stepT > 1.4,
  () => S.slug >= 366,
  () => !S.held && S.u <= -C.TRAVEL + 0.02 && S.cur === 0 && S.stepT > 0.6,
  () => S.held && S.u >= -0.02 && S.stepT > 0.6,
  () => S.cycles - S.cyc0 >= 3 && S.held && S.u >= -0.02 && !(S.grabT > 0),
  () => S.T[S.T.length - 1] < 45,
];
function enter(i, how) {
  beat = i;
  if (i === 0) Object.assign(S, JSON.parse(JSON.stringify(REST)));
  if (i === 1) { S.power = true; S.clock = 0; }
  if (i === 5) S.cyc0 = S.cycles;
  if (i === 6) S.power = false;
  S.stepT = 0;
  lastPose = {};
  draw(0);
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
  update: (dt) => { step(dt); draw(dt); },
  done: (i) => DONE[i](),
  advance: step,
  draw: () => draw(0.5),
  save: () => JSON.parse(JSON.stringify({ S, beat })),
  load: (x) => { Object.assign(S, JSON.parse(JSON.stringify(x.S))); beat = x.beat; lastPose = {}; },
  onView: (v) => { view = v; paintGL(0); },
});
`;
