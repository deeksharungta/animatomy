// The page script, part two: drawing the model, the shader layer, and the run.
export const RUN = `
const stage = document.querySelector(".gg-stage");
const svgs = [...stage.querySelectorAll(":scope > svg")];
const part = (name) => stage.querySelector('[data-part="' + name + '"]');
const el = {}, last = {};
for (const n of ["triggerLow", "triggerHigh", "carriage", "stick", "half", "melt", "meltOut", "ball", "spring", "blob", "rope", "rocker", "volta", "pinch", "roo", "stones"]) el[n] = part(n);
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
const put = (name, html) => { if (last[name] !== html) { last[name] = html; el[name].innerHTML = html; } };
const layer = glLayer({ canvas: stage.querySelector(".gg-gl"), fragment: FRAG, view: SIZE, camera: CAMERA, uniforms: ["uT", "uHeat", "uFlow", "uCur", "uTip", "uFed", "uBall", "uBlob", "uRope", "uBox", "uMelt"], fixed: { uLight: stage.closest("[data-theme]")?.getAttribute("data-theme") === "light" ? 1 : 0 }, maxRatio: 1.5 });
if (layer) stage.setAttribute("data-gl", "");
let view = [...VIEWS[0]];
function paintGL() {
  stage.style.setProperty("--gg-hot", Math.max(0, Math.min(1, (S.T - 60) / 130)).toFixed(3));
  stage.style.setProperty("--gg-cur", Math.min(1, S.cur).toFixed(3));
  if (!layer) return;
  const on = S.T > 45 || S.cur > 0.01 || S.blobT > 40;
  if (!on) { layer.clear(); return; }
  const cam = { uView: [view[2], view[3]], uOrigin: [CAMERA.origin[0] - view[0], CAMERA.origin[1] - view[1]] };
  const box = [GL_BOX[0] - view[0], GL_BOX[1] - view[1], GL_BOX[2] - view[0], GL_BOX[3] - view[1]];
  const a = Math.cbrt(Math.max(0, S.blobV) / 0.838);
  layer.draw({ ...cam, uT: S.T, uHeat: S.heat, uFlow: S.flow, uCur: Math.min(1, S.cur), uTip: C.BLOCK.x0 + S.solid, uFed: S.fed, uBall: S.ball, uBlob: [a, 0.4 * a, S.blobT], uRope: S.rope, uBox: box, uMelt: S.melt }, still.matches ? 0.5 : performance.now() / 1000);
}
const mm = (s) => Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0");
function draw() {
  const D = dynamic(K, P, C, S);
  for (const n of ["triggerLow", "triggerHigh", "carriage", "stick", "half", "melt", "meltOut", "ball", "spring", "blob", "rope", "rocker"]) put(n, D[n]);
  const p = poses(C, S);
  paintCrew("volta", VOLTA, p.volta, S.duty === "volta");
  paintCrew("pinch", PINCH, p.pinch, S.duty === "pinch");
  paintCrew("roo", ROO, p.roo, S.duty === "roo");
  el.stones.toggleAttribute("data-on", S.cur > 0.05);
  paintGL();
  const g = (S.out * C.RHO) / 1000;
  const text = (S.power ? Math.round(S.W) + " W" : "off") + " · " + Math.round(S.T) + " °C" + (S.p > 0.05 ? " · " + S.p.toFixed(1) + " bar" : "") + (g > 0.01 ? " · " + g.toFixed(1) + " g out" : "") + (S.clock > 0.5 ? " · " + mm(S.clock) : "");
  if (readout.textContent !== text) readout.textContent = text;
}
const DONE = [
  () => S.stepT > 0.4,
  () => S.rocker >= 1 && S.stepT > 1.4,
  () => S.T >= 192,
  () => S.u >= C.STROKE - 1e-3 && S.stepT > 0.3,
  () => S.u === 0 && S.grip < 0.05,
  () => S.u >= C.STROKE - 1e-3,
  () => S.ball === 0 && S.rope === 0 && S.u === 0 && S.p === 0,
  () => S.solid < 1 && S.stepT > 1.5,
  () => S.T < 40 && S.blobT < 30,
];
function enter(i, how) {
  beat = i;
  if (i === 0) Object.assign(S, JSON.parse(JSON.stringify(REST)));
  if (i === 1) { S.power = true; S.clock = 0; }
  if (i === 3 || i === 5) S.pull = true;
  if (i === 4 || i === 6) S.pull = false;
  if (i === 8) { S.power = false; S.pull = false; }
  S.stepT = 0;
  lastPose = {};
  draw();
}
STEPS.mountSteps({
  root: document.querySelector("[data-steps]"), svg: svgs, stage, steps: STEP_INFO, views: VIEWS, colors: COLORS, size: SIZE,
  enter, update: (dt) => { step(dt); draw(); }, done: (i) => DONE[i](), advance: step, draw: () => draw(),
  save: () => JSON.parse(JSON.stringify({ S, beat })),
  load: (x) => { Object.assign(S, JSON.parse(JSON.stringify(x.S))); beat = x.beat; lastPose = {}; },
  onView: (v) => { view = v; paintGL(); },
});
`;
