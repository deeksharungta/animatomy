// The page script, part two: drawing the model, and the run that plays it beat by beat.
export const RUN_SCRIPT = `
const stage = document.querySelector(".db-stage");
const svg = stage.querySelector("svg");
const part = (name) => svg.querySelector('[data-part="' + name + '"]');
const HTML = ["key", "spinOut", "wheel", "nut", "hammer", "head", "hspring", "click", "cspring"];
const CREWS = ["knock", "rocky"];
const el = Object.fromEntries([...HTML, ...CREWS].map((n) => [n, part(n)]));
const gong = part("gong").querySelector(".iso-solid");
const readout = document.querySelector("[data-readout]");
let last = {};
const write = (name, key, fn) => { if (last[name] !== key) { last[name] = key; fn(); } };
function draw() {
  const D = drawn(K, P, C, S, Q, M);
  for (const n of HTML) write(n, D[n], () => { el[n].innerHTML = D[n]; });
  const p = poses(C, S, D);
  for (const n of CREWS) write(n + ":c", JSON.stringify(p[n]) + (S.duty === n), () => {
    CREW.paintCritter(el[n], CREW.critter(SPEC[n], p[n], P));
    CREW.setDuty(el[n], S.duty === n);
  });
  write("gong:lit", S.lit, () => gong.toggleAttribute("data-lit", S.lit === "gong"));
  const deg = ((Math.round(((S.th - C.TH0) * 180) / Math.PI) % 360) + 360) % 360;
  const word = S.jam ? "held" : S.ring > 0.55 ? "ding" : S.a < -0.02 ? "cocking" : S.ring > 0.08 ? "ringing" : "still";
  const text = word + " · key " + deg + "° · " + S.strikes + (S.strikes === 1 ? " ring" : " rings");
  if (readout.textContent !== text) readout.textContent = text;
}
const settled = () => Math.abs(S.aV) < 0.05 && Math.abs(S.a) < 0.01;
const DONE = [
  () => S.stepT > 0.3,
  () => S.th >= S.thT - 1e-6 && S.stepT > 0.3,
  () => S.strikes >= 1 && S.th >= S.thT - 1e-6 && settled(),
  () => S.jam && S.stepT > 1.4,
  () => S.th >= S.thT - 1e-6 && settled() && S.stepT > 0.5,
];
function enter(i, how) {
  if (i === 0) Object.assign(S, REST);
  else { S.thT = C.TH0 + TARGET[i] * C.T; S.om = SPEED[i]; S.jam = false; }
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
