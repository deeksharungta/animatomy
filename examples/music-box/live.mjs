// The page script: the music box's model (the wind, the stop, the spring's push through the train, the pins and
// the ringing teeth, the fly, the run-down), the drawing, and the run. Everything comes from the constants the
// build draws with.
import { C, P, WIDTH, HEIGHT, ROO, PINCH, torque, speedOf } from "./model.mjs";
import { STEPS, VIEWS, FOCUS, LIT } from "./story.mjs";
import { moving } from "./moving.mjs";
import { teethOf } from "./teeth.mjs";
import { poses } from "./poses.mjs";

export const START = { tb: 0, tb0: 0, al: 0, wnd: 0, windTo: 0, wound: false, run: false, ramp: 0, grip: 1, gripT: 1, lever: 0, leverT: 0, stopping: false, flyRpm: 0, t: 0, stepT: 0, idle: 9, winding: false, lit: "cyl", litTeeth: false, note: -1 };

export const liveScript = () => `
const P = ${JSON.stringify(P)}, C = ${JSON.stringify(C)};
const SPEC = ${JSON.stringify({ roo: ROO, pinch: PINCH })};
const STEP_INFO = ${JSON.stringify(STEPS.map(({ title, text, who, hold, pace }) => ({ title, text, who, hold, pace })))};
const VIEWS = ${JSON.stringify(VIEWS.map((v) => v.map((n) => +n.toFixed(2))))};
const COLORS = ${JSON.stringify(STEPS.map((s) => s.color))}, FOCUS = ${JSON.stringify(FOCUS)}, LIT = ${JSON.stringify(LIT)};
const K = { iso, pathOf, depthOf, dotsSvg, solidSvg, lineSvg, fadedSvg, cylinder, extrude, slabOf, ring, ...CREW };
const torque = ${torque.toString()};
const speedOf = ${speedOf.toString()};
const moving = ${moving.toString()};
const teethOf = ${teethOf.toString()};
const poses = ${poses.toString()};
const stage = document.querySelector(".iso-stage"), svg = stage.querySelector("svg");
const part = (n) => svg.querySelector('[data-part="' + n + '"]');
const el = {};
for (const n of ["crownBack", "crownFront", "ratchet", "key", "pinion", "wheel", "holes", "midPin", "midWheel", "thread", "pins", "fly", "lever", "teeth", "roo", "pinch"]) el[n] = part(n);
const slot = { back: svg.querySelector('[data-slot="rooBack"]'), front: svg.querySelector('[data-slot="rooFront"]') };
const cyl = part("cyl").querySelectorAll(".iso-solid");
const readout = document.querySelector("[data-readout]");
const TAU = Math.PI * 2, N = C.COMB.n, LIFT = 0.8, RING = 1.4, WIN = 0.2;
const TAUS = C.LEN.map((l) => 0.35 + 0.9 * (l / C.LEN[0]) ** 2);
const fresh = () => (${JSON.stringify(START)});
const S = { ...fresh(), lift: new Array(N).fill(0), amp: new Array(N).fill(0), focus: "", duty: "" };
const beatAt = (tb) => 32 * (tb - S.tb0) - C.OFFSET;
function pluck(b0, b1) {
  // Every pin whose beat the cylinder passed this step lets its tooth go; the ones about to arrive lift theirs.
  for (const p of C.TUNE) {
    const k = Math.ceil((b0 - p.beat) / 16 - 1e-9), b = p.beat + 16 * k;
    if (b > b0 && b <= b1 && b < 32) { S.amp[p.tooth] = RING; if (p.tooth >= 20) S.note = p.tooth >> 1; }
  }
  S.lift.fill(0);
  if (!S.run) return;
  for (const p of C.TUNE) {
    const k = Math.ceil((b1 - p.beat) / 16 - 1e-9), b = p.beat + 16 * k, gap = b - b1;
    if (b < 32 && gap >= 0 && gap < WIN) S.lift[p.tooth] = Math.max(S.lift[p.tooth], LIFT * (1 - gap / WIN));
  }
}
function step(dt) {
  S.t += dt; S.stepT += dt;
  const l0 = S.lever, g0 = S.grip;
  S.lever += (S.leverT - S.lever) * (1 - Math.exp(-dt / 0.16));
  if (Math.abs(S.lever - S.leverT) < 0.002) S.lever = S.leverT;
  if (S.stopping && S.lever < 0.1) S.gripT = 1;
  if (S.leverT === 1 && S.lever > 0.9) S.gripT = 0;
  S.grip = Math.max(0, Math.min(1, S.grip + (S.gripT > S.grip ? dt / 0.4 : S.gripT < S.grip ? -dt / 0.35 : 0)));
  // The key: one turn winds the spring one turn; the arbor turns with it and the click rides the ratchet.
  let dw = S.windTo > 0 ? Math.max(0, Math.min(S.windTo - S.wnd, 0.28 * dt)) : 0;
  if (S.windTo > 0 && S.windTo - S.wnd - dw < 1e-6) { dw = S.windTo - S.wnd; S.wnd = S.windTo; S.windTo = 0; S.wound = true; } else S.wnd += dw;
  S.al += dw * TAU; S.winding = dw > 0;
  if (!S.run && S.grip < 0.15 && S.lever > 0.9 && S.wnd > 0) S.run = true;
  const b0 = beatAt(S.tb);
  let w = 0;
  if (S.run) {
    S.ramp += (1 - S.ramp) * (1 - Math.exp(-dt / 0.12));
    for (let i = 0; i < 4; i++) {
      // The spring's push, held to a speed by the fly's drag: barrel turns per second at this wind.
      const h = dt / 4, v = (C.BARREL_W / TAU) * speedOf(S.wnd) * S.ramp, d = Math.min(S.wnd, v * h);
      S.tb += d; S.wnd -= d; w = v;
      if (S.wnd < 2e-4) { S.tb += S.wnd; S.wnd = 0; S.run = false; S.ramp = 0; w = 0; if (Math.abs(S.tb - Math.round(S.tb)) < 1e-5) S.tb = Math.round(S.tb); break; }
    }
  }
  S.flyRpm = w * 2 * 60 * C.FLY_PER_CYL;
  pluck(b0, beatAt(S.tb));
  for (let i = 0; i < N; i++) { S.amp[i] *= Math.exp(-dt / TAUS[i]); if (S.amp[i] < 0.02) S.amp[i] = 0; }
  const moved = { roo: S.winding || w > 0.002, pinch: S.grip !== g0 || (S.lever !== l0 && S.focus === "pinch") };
  S.duty = S.focus && moved[S.focus] ? S.focus : "";
  S.lit = S.duty ? "" : LIT[S.beat] ?? "cyl";
  S.litTeeth = S.lit === "teeth";
  S.idle = S.duty ? 0 : S.idle + dt;
}
let lastPose = {}, side = "";
function paintCrew(name, pose, on) {
  const key = JSON.stringify(pose) + on;
  if (lastPose[name] !== key) { lastPose[name] = key; CREW.paintCritter(el[name], CREW.critter(SPEC[name], pose, P)); }
  CREW.setDuty(el[name], on);
}
function draw() {
  const D = moving(K, P, C, S);
  for (const n of ["crownBack", "crownFront", "ratchet", "key", "pinion", "wheel", "holes", "midPin", "midWheel", "thread", "pins", "fly", "lever"]) el[n].innerHTML = D[n];
  el.teeth.innerHTML = teethOf(K, P, C, S);
  for (const c of cyl) c.toggleAttribute("data-lit", S.lit === "cyl");
  // Roo is drawn behind the arbor while the barrel carries him round its far half, in front of it otherwise.
  const psi = ((C.PLACE.roo.psi0 + S.tb * 360) % 360 + 360) % 360, far = psi > P.azimuth + 90 + 6 && psi < P.azimuth + 270;
  const want = far ? "back" : "front";
  if (want !== side) { slot[want].appendChild(el.roo); side = want; }
  const q = poses(C, S);
  paintCrew("roo", q.roo, S.duty === "roo");
  paintCrew("pinch", q.pinch, S.duty === "pinch");
  const rpm = S.flyRpm / C.FLY_PER_CYL, word = S.winding ? "winding" : S.run ? (S.note >= 0 ? C.NOTES[S.note] + " " + Math.round(C.FREQ[S.note]) + " Hz" : "playing") : S.wnd > 0 ? "held" : "run down";
  const text = word + " · cylinder " + rpm.toFixed(1) + " rpm · fly " + Math.round(S.flyRpm).toLocaleString("en-GB") + " rpm · spring " + S.wnd.toFixed(2) + " turn";
  if (readout.textContent !== text) readout.textContent = text;
}
const DONE = [
  () => S.stepT > 0.3,
  () => S.wound,
  () => S.run && S.ramp > 0.9,
  () => beatAt(S.tb) >= 5.5,
  () => beatAt(S.tb) >= 13.5,
  () => beatAt(S.tb) >= 21.5,
  () => beatAt(S.tb) >= 27.5,
  () => !S.run && S.wnd === 0 && S.stepT > 0.4,
  () => S.grip >= 1 && S.lever === 0 && S.stepT > 0.6,
];
const snap = () => JSON.parse(JSON.stringify(S));
function enter(i) {
  if (i === 1) { S.windTo = Math.min(1, S.wnd + 1); S.wound = false; S.tb0 = S.tb; S.note = -1; S.stopping = false; }
  if (i === 2) S.leverT = 1;
  if (i === 8) { S.leverT = 0; S.stopping = true; }
  S.beat = i; S.focus = FOCUS[i]; S.stepT = 0;
  draw();
}
STEPS.mountSteps({
  root: document.querySelector("[data-steps]"), svg, stage, steps: STEP_INFO, views: VIEWS, colors: COLORS, size: [${WIDTH}, ${HEIGHT}],
  enter, update: (dt) => { step(dt); draw(); }, done: (i) => DONE[i](), advance: step, draw, save: snap,
  load: (x) => { Object.assign(S, JSON.parse(JSON.stringify(x))); lastPose = {}; },
});
`;
