// The page script, part one: the trap's model (pencil, pedal, catch, hammer, bar), the drawing and the run.
// Every number comes from the same constants the build draws with; the snap runs in model time, slowed on screen.
import { C, P, WIDTH, HEIGHT, ROO, PINCH, torque, pedalPt } from "./model.mjs";
import { STEPS, VIEWS, TAKE_VIEW, START, NUM } from "./story.mjs";
import { dynamic } from "./moving.mjs";
import { poses } from "./poses.mjs";
import { wireOf, bendOf } from "./wire.mjs";
import { takeScript } from "./take.mjs";

export const liveScript = () => `
const P = ${JSON.stringify(P)}, C = ${JSON.stringify(C)}, NUM = ${JSON.stringify(NUM)};
const SPEC = ${JSON.stringify({ roo: ROO, pinch: PINCH })};
const STEP_INFO = ${JSON.stringify(STEPS.map(({ title, text, who, hold, pace }) => ({ title, text, who, hold, pace })))};
const VIEWS = ${JSON.stringify(VIEWS.map((v) => v.map((n) => +n.toFixed(2))))}, TAKE_VIEW = ${JSON.stringify(TAKE_VIEW.map((n) => +n.toFixed(2)))};
const COLORS = ${JSON.stringify(STEPS.map((s) => s.color))};
const START = ${JSON.stringify(START)};
const K = { iso, pathOf, depthOf, dotsSvg, solidSvg, lineSvg, ...CREW };
const torque = ${torque.toString().replace(/C\.PH/g, "C.PH")};
const pedalPt = ${pedalPt.toString()};
const wireOf = ${wireOf.toString()};
const bendOf = ${bendOf.toString()};
const dynamic = ${dynamic.toString()};
const poses = ${poses.toString()};
const stage = document.querySelector(".iso-stage"), svg = stage.querySelector("svg");
const el = {};
for (const n of ["springFar", "springNear", "armFar", "armNear", "cross", "bar", "plate", "tab", "cheese", "pencil", "roo", "pinch"]) el[n] = svg.querySelector('[data-part="' + n + '"]');
const readout = document.querySelector("[data-readout]");
const SLOW = 1 / NUM.slow, G = 9.81, LB = C.BAR.L / 2000, ARM = C.PH.L;
const fresh = () => ({ ...START, set: true, free: false, barFree: false, hand: false, thT: C.TH_SET, penT: 400, psiT: 0, gripT: 1, barT: null, slow: 1, tm: 0, landed: false, hitV: 0, snapMs: 0, stepT: 0, layT: -1 });
const S = fresh();
window.__mt = { S, C, P, iso };
// The bar rides on the crossbar while the crossbar is under it: the least angle that clears it.
function barFloor(th) {
  const xc = C.ARM_L * Math.cos(th), zc = C.AX.z + C.ARM_L * Math.sin(th), dx = xc - C.BAR.x;
  if (dx < 3 || dx > C.BAR.L) return -9;
  return Math.atan((zc + C.WIRE + C.BAR.r - C.BAR.z) / dx);
}
function release() { S.set = false; S.free = true; S.barFree = true; S.gripT = 0; S.slow = SLOW; S.tm = 0; S.landed = false; }
function physics(md) {
  const n = Math.ceil(md / 2e-5), h = md / n;
  for (let i = 0; i < n; i++) {
    if (S.free) {
      S.w -= ((torque(S.th) + C.PH.drag * S.w * Math.abs(S.w)) / C.PH.I) * h; S.th += S.w * h;
      if (S.th <= C.TH_REST) {
        if (!S.landed) { S.landed = true; S.hitV = -S.w * ARM; S.snapMs = S.tm * 1000; S.psi = C.PMAX; S.slow = Math.max(S.slow, 1 / 25); S.penT = 400; }
        S.th = C.TH_REST; S.w = -S.w * C.PH.e;
        if (Math.abs(S.w) < 4) { S.w = 0; S.free = false; }
      }
    }
    if (S.barFree) {
      const f = barFloor(S.th);
      if (S.phi <= f + 1e-6 && S.free) { S.pw = Math.max(S.pw, (f - S.phi) / h); S.phi = f; }
      S.pw -= ((3 * G) / (2 * LB)) * Math.cos(S.phi) * h; S.phi += S.pw * h;
      if (S.phi >= C.PHI_REST) { S.phi = C.PHI_REST; S.pw = -S.pw * 0.05; if (Math.abs(S.pw) < 6) { S.pw = 0; if (!S.free) S.barFree = false; } }
    }
    S.tm += h;
  }
}
function step(dt) {
  S.stepT += dt;
  const ease = (v, t, tau) => v + (t - v) * (1 - Math.exp(-dt / tau));
  S.pen = ease(S.pen, S.penT, S.penT > 100 ? 0.6 : 0.3); if (Math.abs(S.pen - S.penT) < 0.05) S.pen = S.penT;
  const g0 = S.grip; S.grip = ease(S.grip, S.gripT, 0.14); if (Math.abs(S.grip - S.gripT) < 0.01) S.grip = S.gripT;
  S.gripV = Math.abs(S.grip - g0) / Math.max(dt, 1e-3);
  const p0 = S.psi;
  if (S.set) {
    if (S.pen < 0.5) S.psi = Math.min(S.psiT, S.psi + dt * (S.rate || 1.4));
    else S.psi = ease(S.psi, 0, 0.4);
    S.strain = Math.max(0, Math.min(1, S.psi / C.TRIP));
    if (S.psi >= C.TRIP) release();
  } else if (!S.landed || S.hand || S.layT >= 0) S.psi = ease(S.psi, S.psiT, 0.4);
  S.psiV = Math.abs(S.psi - p0) / Math.max(dt, 1e-3);
  const t0 = S.th;
  if (S.hand) { S.th = ease(S.th, S.thT, 0.45); if (Math.abs(S.th - S.thT) < 0.002) S.th = S.thT; S.landed = false; }
  if (S.layT >= 0) lay(dt);
  if (S.free || S.barFree) physics(dt * S.slow);
  S.thV = Math.abs(S.th - t0) / Math.max(dt, 1e-3);
  const roo = S.thV > 0.05, pinch = S.gripV > 0.4 || (S.set && S.psiV > 0.05);
  S.duty = pinch ? "pinch" : roo ? "roo" : "";
  S.lit = !S.duty;
  S.idle = S.duty ? 0 : S.idle + dt;
}
// You lay the bar over: it swings from where it fell, over the top, down onto the crossbar; then Pinch takes its tip.
function lay(dt) {
  S.layT += dt;
  const u = Math.min(1, S.layT / 1.6), e = u * u * (3 - 2 * u);
  S.phi = C.PHI_REST + (C.PHI_SET - C.PHI_REST) * e; S.psiT = 0;
  if (u >= 1 && S.gripT === 0) S.gripT = 1;
  if (S.gripT === 1 && S.grip > 0.97) { S.layT = -1; S.hand = false; S.th = C.TH_SET; S.thT = C.TH_SET; S.set = true; S.slow = 1; S.strain = 0; S.psi = 0; }
}
let lastPose = {};
function paintCrew(name, pose, on) {
  const key = JSON.stringify(pose) + on;
  if (lastPose[name] === key) return;
  lastPose[name] = key;
  CREW.paintCritter(el[name], CREW.critter(SPEC[name], pose, P));
  CREW.setDuty(el[name], on);
}
function readoutText() {
  const deg = Math.round((S.th * 180) / Math.PI);
  if (S.set) return "set · spring " + torque(S.th).toFixed(3) + " N·m · catch " + Math.round(S.strain * 100) + "% tipped";
  if (S.free || S.barFree) return (S.tm * 1000).toFixed(1) + " ms · hammer " + deg + "° · " + Math.abs(S.w * ARM).toFixed(1) + " m/s · ×1/" + Math.round(1 / S.slow);
  if (S.hand || S.layT >= 0) return "setting · hammer " + deg + "° · spring " + torque(S.th).toFixed(3) + " N·m";
  return "sprung in " + S.snapMs.toFixed(1) + " ms · hit at " + S.hitV.toFixed(1) + " m/s";
}
function draw() {
  const D = dynamic(K, P, C, S);
  for (const n of ["springFar", "springNear", "armFar", "armNear", "cross", "bar", "plate", "tab", "cheese", "pencil"]) if (el[n].__d !== D[n]) { el[n].innerHTML = D[n]; el[n].__d = D[n]; }
  const q = poses(C, S);
  paintCrew("roo", q.roo, S.duty === "roo");
  paintCrew("pinch", q.pinch, S.duty === "pinch");
  const text = readoutText();
  if (readout.textContent !== text) readout.textContent = text;
}
const DONE = [
  () => S.stepT > 0.3,
  () => !S.set,
  () => S.grip < 0.05 && S.th < C.TH_SET - 0.3,
  () => !S.free && !S.barFree,
  () => S.th === S.thT && S.stepT > 0.5,
  () => S.set && S.grip === 1 && S.psi < 0.01,
];
function enter(i, how) {
  if (i === 0) { const keep = how === "loop" ? {} : {}; Object.assign(S, fresh(), keep); }
  if (i === 1) { S.penT = 0; S.psiT = C.TRIP + 0.6; }
  if (i === 3) { S.slow = SLOW; }
  if (i === 4) { S.slow = 1; S.penT = 400; S.hand = true; S.thT = C.TH_SET + 0.03; S.psiT = 0; }
  if (i === 5) { S.layT = 0; S.gripT = 0; }
  S.stepT = 0; S.rate = 0;
  draw();
}
${takeScript()}
`;
