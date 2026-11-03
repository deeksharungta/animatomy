// The page script, part two: drawing the model, and the run that plays it beat by beat.
export const RUN_SCRIPT = `
const stage = document.querySelector(".wc-stage");
const svg = stage.querySelector("svg");
const part = (name) => svg.querySelector('[data-part="' + name + '"]');
const HTML = ["spring", "interLeaves", "axleLeaves", "click", "key", "brake"];
const SPUN = { barrelT: "barrelTeeth", ratchetT: "ratchetTeeth", interT: "interTeeth", rearT: "rearHub", frontT: "frontHub", worldT: "worldLines", worldT2: "worldProps" };
const CREWS = ["roo", "pinch", "rocky"];
const el = Object.fromEntries([...HTML, ...Object.values(SPUN), ...CREWS].map((n) => [n, part(n)]));
const drum = part("barrelWall").querySelector(".iso-solid");
const readout = document.querySelector("[data-readout]");
let last = {};
const write = (name, key, fn) => { if (last[name] !== key) { last[name] = key; fn(); } };
function draw() {
  const D = drawn(K, P, C, S, Q, M);
  D.worldT2 = D.worldT;
  for (const n of HTML) write(n, D[n], () => { el[n].innerHTML = D[n]; });
  for (const [t, n] of Object.entries(SPUN)) write(n, D[t], () => el[n].setAttribute("transform", D[t]));
  const p = poses(C, S, D, anglesOf(S));
  for (const n of CREWS) write(n + ":c", JSON.stringify(p[n]) + (S.duty === n), () => {
    CREW.paintCritter(el[n], CREW.critter(SPEC[n], p[n], P));
    CREW.setDuty(el[n], S.duty === n);
  });
  write("drum:lit", S.lit, () => drum.toggleAttribute("data-lit", S.lit === "barrel"));
  const turns = S.W.toFixed(1) + " turns";
  const word = S.keyV > 0 ? "winding" : S.brake < 0.5 ? (S.W > 1 ? "braked" : "resting") : S.v > 0.005 ? "running" : "stopped";
  const text = word + " · spring " + turns + " · " + S.D.toFixed(2) + " m · " + S.v.toFixed(2) + " m/s";
  if (readout.textContent !== text) readout.textContent = text;
}
const DONE = [
  () => S.stepT > 0.3 && S.brake <= 0,
  () => S.windT < 0 && S.stepT > 0.3,
  () => S.brake >= 1 && S.stepT > 0.3,
  () => S.v > 0.3,
  () => S.D > 1.1,
  () => S.D > 2.4,
  () => S.v <= 0 && S.D > 1 && S.stepT > 0.4,
];
function enter(i, how) {
  if (i === 0) { S.brakeOff = false; S.D = 0; S.v = 0; S.vMax = 0; S.windT = -1; }
  if (i === 1) S.windT = TARGET.wind;
  if (i === 2) S.brakeOff = true;
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
