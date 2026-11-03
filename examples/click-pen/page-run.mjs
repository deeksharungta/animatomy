// The page script, part two: drawing the model, and the run that plays it beat by beat.
export const RUN_SCRIPT = `
const stage = document.querySelector(".pen-stage");
const svg = stage.querySelector("svg");
const part = (name) => svg.querySelector('[data-part="' + name + '"]');
const HTML = ["tipIn", "tipOut", "springBack", "refill", "ink", "tube", "springFront", "lugBack", "finsBack", "rotor", "lugIn", "plunger", "shoulder", "lugFin", "fins", "button"];
const CREWS = ["rocky", "roo"];
const el = Object.fromEntries([...HTML, ...CREWS].map((n) => [n, part(n)]));
const readout = document.querySelector("[data-readout]");
let last = {};
const write = (name, key, fn) => { if (last[name] !== key) { last[name] = key; fn(); } };
function draw() {
  const D = drawn(X, P, C, KC, S, F, PEN);
  for (const n of HTML) write(n, D[n], () => { el[n].innerHTML = D[n]; });
  const p = poses(C, S, D, F);
  for (const n of CREWS) write(n + ":c", JSON.stringify(p[n]) + (S.duty === n), () => {
    CREW.paintCritter(el[n], CREW.critter(SPEC[n], p[n], P));
    CREW.setDuty(el[n], S.duty === n);
  });
  const ball = C.Z0 + S.h - C.REFILL.top - C.REFILL.len, out = -ball;
  const spring = C.SPRING.k * (C.SPRING.L0 - (ball + C.REFILL.collar[0] - C.SPRING.seat));
  const word = S.f < S.zp + 0.05 && S.f < KC.fFar - 0.1 ? "pressed" : out > 0 ? "out" : "in";
  const cam = ((Math.round((S.uc - REST.uc) * 45 + S.clicks * 90) % 360) + 360) % 360;
  const text = word + " · tip " + (out > 0 ? "out " : "in ") + Math.abs(out).toFixed(1) + " mm · cam " + cam + "° · " + spring.toFixed(1) + " N";
  if (readout.textContent !== text) readout.textContent = text;
}
const settled = () => Math.abs(S.hV) < 0.01 && Math.abs(S.uV) < 0.01 && Math.abs(S.f - S.fT) < 1e-6;
const DONE = [() => S.stepT > 0.3, () => settled() && S.stepT > 0.3, () => settled() && S.stepT > 0.3, () => settled() && S.stepT > 0.3, () => settled() && S.stepT > 0.3];
function enter(i, how) {
  if (i === 0) { const c = how === "loop" ? S.clicks + 1 : 0; Object.assign(S, REST); S.clicks = c; }
  S.fT = TARGET[i];
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
