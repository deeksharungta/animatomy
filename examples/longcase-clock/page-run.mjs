// The page script, part two: drawing the model and the run.
export const RUN_SCRIPT = `
const stage = document.querySelector(".lc-stage");
const svg = stage.querySelector("svg");
const part = (name) => svg.querySelector('[data-part="' + name + '"]');
const names = ["great", "center", "third", "pins", "esc", "anchor", "rod", "crutch", "bob", "weight", "cord", "cordUp", "crank", "hands", "hammer", "fly", "hickory", "pinch", "knock"];
const el = Object.fromEntries(names.map((n) => [n, part(n)]));
const readout = document.querySelector("[data-readout]");
let lastPose = {};
function paintCrew(name, node, spec, pose, duty) {
  const key = JSON.stringify(pose) + duty;
  if (lastPose[name] === key) return;
  lastPose[name] = key;
  CREW.paintCritter(node, CREW.critter(spec, pose, P));
  node.toggleAttribute("data-duty", duty);
}
const hms = (t) => (Math.floor(t / 3600) % 12 || 12) + ":" + String(Math.floor(t / 60) % 60).padStart(2, "0") + ":" + String(Math.floor(t) % 60).padStart(2, "0");
function draw() {
  const D = dynamic(K, P, C, S);
  for (const n of ["great", "center", "third", "pins", "esc", "anchor", "rod", "crutch", "cord", "cordUp", "crank", "hands", "hammer", "fly"]) el[n].innerHTML = D[n];
  el.bob.setAttribute("transform", D.bob);
  el.weight.setAttribute("transform", D.weight);
  for (const n of ["weight", "cord", "cordUp", "hands", "rod", "bob"]) el[n].style.opacity = S.fade.toFixed(3);
  const p = poses(C, S, D);
  paintCrew("hickory", el.hickory, HICKORY, p.hickory, S.duty === "hickory");
  paintCrew("pinch", el.pinch, PINCH, p.pinch, S.duty === "pinch");
  paintCrew("knock", el.knock, KNOCK, p.knock, S.duty === "knock");
  const word = S.swap >= 0 ? "run down" : S.winding ? "winding" : S.ring > 0.3 ? "striking one" : S.amp > 0.6 ? (Math.floor(S.ph / Math.PI) % 2 ? "tock" : "tick") : S.amp > 0.05 ? "starting" : S.wt > C.WEIGHT.low + 1 ? "wound" : "stopped";
  const text = word + " · " + hms(S.t) + " · weight " + Math.round(S.wt - C.WEIGHT.low) + " cm up";
  if (readout.textContent !== text) readout.textContent = text;
}
const DONE = [
  () => S.swap < 0 && S.stepT > 0.3,
  () => S.wt >= C.WEIGHT.high && !S.winding && S.stepT > 0.5,
  () => S.t >= ONE - 1,
  () => S.struck && S.ring < 0.2 && S.stepT > 1,
  () => S.stepT > 2.5,
];
function enter(i, how) {
  if (i === 0) Object.assign(S, how === "loop" ? { swap: 0 } : { ...REST, go: false, struck: false, sp: -1, escT: 0, pinBase: 0 });
  if (i === 1) S.winding = true;
  if (i === 2) S.go = true;
  S.stepT = 0;
  lastPose = {};
  draw();
}
STEPS.mountSteps({
  root: document.querySelector("[data-steps]"),
  svg,
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
  save: () => JSON.parse(JSON.stringify(S)),
  load: (x) => { Object.assign(S, JSON.parse(JSON.stringify(x))); lastPose = {}; },
});
`;
