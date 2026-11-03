import { WIDTH, HEIGHT } from "./model.mjs";

// The page script, part two: drawing, the run, and the reader taking over the shifter with the arrow keys.
export const RUN_SCRIPT = `
const stage = document.querySelector(".bk-stage");
const svg = stage.querySelector("svg");
const part = (name) => svg.querySelector('[data-part="' + name + '"]');
const HTML = ["cageIn", "jockeys", "chainDer", "chainCas", "cageOut", "links", "moCaps", "spokesN", "spokesD"];
const CREWS = ["roo", "mo"];
const el = Object.fromEntries([...HTML, ...CREWS].map((n) => [n, part(n)]));
const teeth = C.TEETH.map((_, i) => part("t" + i));
const readout = document.querySelector("[data-readout]"), said = document.querySelector("[data-said]");
let last = {};
const write = (name, key, fn) => { if (last[name] !== key) { last[name] = key; fn(); } };
const words = () => {
  const y = linkage(C, S.psi).J1[1], cable = (C.Y[0] - y) / C.RATIO;
  return "gear " + C.TEETH[S.g] + "T · cable " + Math.max(0, cable).toFixed(1) + " mm · chain on " + C.TEETH[S.cog] + "T";
};
function draw() {
  const D = { ...drawn(K, P, C, S, Q, GG), ...turning(K, P, C, Q, S) };
  for (const n of HTML) write(n, D[n], () => { el[n].innerHTML = D[n]; });
  D.teeth.forEach((t, i) => { teeth[i].innerHTML = t; });
  const p = poses(C, S, D);
  for (const n of CREWS) write(n + ":c", JSON.stringify(p[n]) + (S.duty === n), () => {
    CREW.paintCritter(el[n], CREW.critter(SPEC[n], p[n], P));
    CREW.setDuty(el[n], S.duty === n);
  });
  const text = words();
  if (readout.textContent !== text) readout.textContent = text;
}
const settledPsi = () => Math.abs(S.psi - C.PSI[S.gT]) < 0.0008;
const settledCog = () => S.cog === S.gT && Math.abs(S.pos - S.cog) < 0.02;
const DONE = [
  () => S.stepT > 0.4,
  () => S.g === S.gT && settledPsi() && S.stepT > 0.4,
  () => settledCog(),
  () => S.g === S.gT && settledPsi(),
  () => settledCog(),
  () => S.g === S.gT && settledPsi(),
  () => settledCog() && S.stepT > 0.5,
];
let resuming = false;
function enter(i, how) {
  if (i === 0 && how !== "next" && !resuming) Object.assign(S, { ...REST, s: S.s, cas: S.cas, jock: S.jock });
  resuming = false;
  S.gT = TARGET[i];
  S.clickT = 0.34;
  S.focus = FOCUS[i];
  S.stepT = 0;
  last = {};
  draw();
}
const run = STEPS.mountSteps({
  root: document.querySelector("[data-steps]"), svg, stage, steps: STEP_INFO, views: VIEWS, colors: COLORS, size: SIZE,
  enter, update: (dt) => { step(dt); draw(); }, done: (i) => DONE[i](), advance: step, draw,
  save: () => JSON.parse(JSON.stringify(S)),
  load: (x) => { Object.assign(S, JSON.parse(JSON.stringify(x))); last = {}; },
});
// Take over: the arrow keys click the shifter one index at a time while you keep pedalling. The run pauses, the
// camera pulls back to the whole bike, and Space plays on from the beat it left.
let took = false, frame = 0, prev = 0, onScreen = false;
const still = matchMedia("(prefers-reduced-motion: reduce)");
function idle(now) {
  frame = 0;
  if (run.playing || !onScreen) return;
  const dt = prev ? Math.min(0.05, (now - prev) / 1000) : 0;
  prev = now;
  if (still.matches) { for (let i = 0; i < 300; i++) step(1 / 60); draw(); return; }
  step(dt); draw();
  frame = requestAnimationFrame(idle);
}
const kick = () => { if (!frame) { prev = 0; frame = requestAnimationFrame(idle); } };
new IntersectionObserver((e) => { onScreen = e[e.length - 1].isIntersecting; if (onScreen && took) kick(); }).observe(stage);
function shift(by) {
  if (run.playing) run.toggle();
  run.aim([0, 0, ${WIDTH}, ${HEIGHT}]);
  took = true;
  S.gT = Math.max(0, Math.min(10, S.gT + by));
  S.focus = "any";
  S.stepT = 0;
  said.textContent = "Shifting to the " + C.TEETH[S.gT] + "T cog";
  kick();
}
stage.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); shift(e.key === "ArrowLeft" ? 1 : -1); }
  else if (e.key === " " && run.playing && took) { took = false; resuming = true; run.go(run.index); }
  else if (e.key === "Home") took = false;
});
`;
