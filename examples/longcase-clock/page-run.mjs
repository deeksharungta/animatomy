// The page script, part two: drawing the model, and the run that plays it beat by beat.
export const RUN_SCRIPT = `
const stage = document.querySelector(".lc-stage");
const svg = stage.querySelector("svg");
const part = (name) => svg.querySelector('[data-part="' + name + '"]');
const HTML = ["great", "sgreat", "center", "third", "esc", "anchor", "pins", "lock", "warn", "fly", "hammer", "tail", "lever", "lifting", "rod", "cord", "cordUp", "greatCoils", "sgreatCoils", "key", "hands"];
const MOVED = ["bob", "weight", "sweight"];
const CREWS = ["plumb", "pinch", "rocky", "knock"];
const FADED = ["rod", "bob", "weight", "sweight", "cord", "cordUp", "greatCoils", "sgreatCoils", "hands", "plumb"];
const el = Object.fromEntries([...HTML, ...MOVED, ...CREWS].map((n) => [n, part(n)]));
const readout = document.querySelector("[data-readout]");
let last = {};
const write = (name, key, fn) => { if (last[name] !== key) { last[name] = key; fn(); } };
const hms = (t) => (Math.floor(t / 3600) % 12 || 12) + ":" + String(Math.floor(t / 60) % 60).padStart(2, "0") + ":" + String(Math.floor(t) % 60).padStart(2, "0");
function draw() {
  const D = drawn(S);
  for (const n of HTML) write(n, D[n], () => { el[n].innerHTML = D[n]; });
  for (const n of MOVED) write(n, D[n], () => el[n].setAttribute("transform", D[n]));
  for (const n of FADED) write(n + ":o", S.fade, () => { el[n].style.opacity = S.fade.toFixed(3); });
  const p = poses(C, S, D);
  for (const n of CREWS) write(n + ":c", JSON.stringify(p[n]) + (S.duty === n), () => {
    CREW.paintCritter(el[n], CREW.critter(SPEC[n], p[n], P));
    CREW.setDuty(el[n], S.duty === n);
  });
  const word = S.swap >= 0 ? "eight days on" : S.winding ? "winding" : S.sp >= 0 && S.sp < 1 ? "striking one" : S.ring > 0.3 ? "one" : S.amp > 0.6 ? (Math.floor(S.ph / Math.PI) % 2 ? "tock" : "tick") : S.amp > 0.05 ? "starting" : S.wt > C.WEIGHT.low + 1 ? "wound" : "stopped";
  const text = word + " · " + hms(S.t) + " · weight " + Math.round(S.wt - C.WEIGHT.low) + " cm up";
  if (readout.textContent !== text) readout.textContent = text;
}
const DONE = [
  () => S.swap < 0 && S.stepT > 0.3,
  () => S.wt >= C.WEIGHT.high && !S.winding && S.stepT > 0.5,
  () => S.t >= C.T0 + 4,
  () => S.t >= C.ONE - 1,
  () => S.sp > 0.06,
  () => S.hit && S.ring < 0.7,
  () => S.locked && S.stepT > 0.8,
  () => S.stepT > 3,
];
function enter(i, how) {
  if (i === 0) Object.assign(S, how === "loop" ? { swap: 0 } : { ...REST });
  if (i === 1) S.winding = true;
  if (i === 2) S.go = true;
  S.focus = FOCUS[i];
  S.stepT = 0;
  last = {};
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
  load: (x) => { Object.assign(S, JSON.parse(JSON.stringify(x))); last = {}; },
});
`;
