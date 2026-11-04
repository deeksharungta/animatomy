// The page script: the opener's model (the press, the pierce, the switch, the motor, the gears, the can and its cut,
// the free lid, Roo's throw, the coast), the drawing, and the run. Everything comes from the constants the build
// draws with.
import { C, P, WIDTH, HEIGHT, CHOMP, BUN, MOCHI, ROO } from "./model.mjs";
import { STEPS, VIEWS, FOCUS } from "./story.mjs";
import { dynamic } from "./dynamic.mjs";
import { poses } from "./poses.mjs";

export const liveScript = () => `
const P = ${JSON.stringify(P)}, C = ${JSON.stringify(C)};
const SPEC = ${JSON.stringify({ chomp: CHOMP, bun: BUN, mochi: MOCHI, roo: ROO })};
const STEP_INFO = ${JSON.stringify(STEPS.map(({ title, text, who, hold, pace }) => ({ title, text, who, hold, pace })))};
const VIEWS = ${JSON.stringify(VIEWS.map((v) => v.map((n) => +n.toFixed(2))))};
const COLORS = ${JSON.stringify(STEPS.map((s) => s.color))};
const FOCUS = ${JSON.stringify(FOCUS)};
const K = { iso, pathOf, depthOf, dotsSvg, solidSvg, lineSvg, fadedSvg, cylinder, ...CREW };
const dynamic = ${dynamic.toString()};
const poses = ${poses.toString()};
const stage = document.querySelector(".iso-stage"), svg = stage.querySelector("svg");
const part = (n) => svg.querySelector('[data-part="' + n + '"]');
const el = {};
for (const n of ["lever-in", "lever-out", "plunger", "rungs", "spokes", "pinion", "gear", "holes", "feed", "label", "cut", "code", "lid", "chomp", "bun", "mochi", "roo", "led", "wire1", "wire2"]) el[n] = part(n);
const readout = document.querySelector("[data-readout]");
const cans = svg.querySelectorAll("[data-can]");
const TAU = Math.PI * 2;
const fresh = () => ({ lev: 0, levT: 0, levV: 0, held: true, on: false, omega: 0, cut: 0, pierced: false, free: false, cutting: false, drop: 0, throwT: 9, idle: 0, t: 0, stepT: 0, duty: "", focus: "", lit: "lever", swap: -1, fade: 1, dLev: 0 });
const S = { ...fresh(), wheel: 0.4, gear: 0.2, can: 0.3 };
function step(dt) {
  S.t += dt; S.stepT += dt;
  const l0 = S.lev;
  if (S.held) {
    S.lev += (S.levT - S.lev) * (1 - Math.exp(-dt / (S.levT === 1 ? 0.25 : 0.55)));
    if (Math.abs(S.lev - S.levT) < 0.002) S.lev = S.levT;
    S.levV = 0;
  } else {
    // Roo's throw: a stiff spring with the lever's stop at the top.
    S.levV += (-260 * S.lev - 16 * S.levV) * dt; S.lev += S.levV * dt;
    if (S.lev < 0) { S.lev = 0; S.levV = -0.25 * S.levV; }
    if (S.lev < 0.002 && Math.abs(S.levV) < 0.05) { S.lev = 0; S.levV = 0; }
    S.throwT += dt;
  }
  S.dLev = (S.lev - l0) / Math.max(dt, 1e-3);
  if (S.lev >= 0.985 && !S.pierced) S.pierced = true;
  S.on = S.lev >= 0.97;
  const target = S.on ? 1 : 0;
  S.omega += (target - S.omega) * (1 - Math.exp(-dt / (S.on ? 0.35 : 0.9)));
  if (!S.on && S.omega < 0.01) S.omega = 0;
  if (S.on && S.omega > 0.995) S.omega = 1;
  const wg = S.omega * C.WHEEL_RPS * 0.5 * TAU;
  S.wheel -= 2 * wg * dt;
  S.gear += wg * dt;
  const pinched = S.pierced && S.lev > 0.95 && !S.free;
  const dc = pinched ? (wg * C.FEED.r / C.CAN.bead) * dt : 0;
  S.can += dc;
  S.cutting = dc > 0;
  if (S.cutting) { S.cut += dc; if (S.cut >= TAU) { S.cut = TAU; S.free = true; S.held = false; S.throwT = 0; } }
  S.drop += ((S.free ? 0.8 : 0) - S.drop) * (1 - Math.exp(-dt / 0.12));
  const moving = { roo: Math.abs(S.dLev) > 0.08, chomp: S.cutting || (S.focus === "chomp" && Math.abs(S.dLev) > 0.02), squad: S.omega > 0.04 };
  S.duty = S.focus && moving[S.focus] ? S.focus : "";
  S.lit = S.duty ? "" : "lever";
  S.idle = S.omega > 0.02 || Math.abs(S.dLev) > 0.01 ? 0 : S.idle + dt;
  if (S.swap >= 0) {
    S.swap += dt / 0.9;
    if (S.swap >= 0.5 && S.cut > 0) { S.cut = 0; S.pierced = false; S.free = false; S.drop = 0; }
    S.fade = Math.abs(Math.cos(Math.PI * Math.min(1, S.swap)));
    if (S.swap >= 1) { S.swap = -1; S.fade = 1; }
  }
}
let lastPose = {};
function paintCrew(name, pose, on) {
  const key = JSON.stringify(pose) + on;
  if (lastPose[name] === key) return;
  lastPose[name] = key;
  CREW.paintCritter(el[name], CREW.critter(SPEC[name], pose, P));
  CREW.setDuty(el[name], on);
}
function draw() {
  const D = dynamic(K, P, C, S);
  for (const [n, k] of [["lever-in", "leverIn"], ["lever-out", "leverOut"], ["plunger", "plunger"], ["rungs", "rungs"], ["spokes", "spokes"], ["pinion", "pinion"], ["gear", "gear"], ["holes", "holes"], ["feed", "feed"], ["label", "label"], ["cut", "cut"], ["code", "code"]]) el[n].innerHTML = D[k];
  el.lid.setAttribute("transform", translateAlong(P, [0, 0, -S.drop]));
  for (const c of cans) c.style.opacity = S.fade.toFixed(3);
  el.led.querySelector(".iso-solid").toggleAttribute("data-lit", S.on);
  el.wire1.toggleAttribute("data-flow", S.on); el.wire2.toggleAttribute("data-flow", S.on);
  const q = poses(C, S);
  paintCrew("chomp", q.chomp, S.duty === "chomp");
  paintCrew("bun", q.bun, S.duty === "squad");
  paintCrew("mochi", q.mochi, S.duty === "squad");
  paintCrew("roo", q.roo, S.duty === "roo");
  const word = S.swap >= 0 ? "new can" : S.free ? (S.omega > 0 ? "lid free · coasting" : "lid free") : S.cutting ? "cutting" : S.on ? "motor on" : S.lev > 0.01 ? "pressing" : "lever up";
  const rpm = Math.round(S.omega * C.WHEEL_RPS * 30);
  const text = word + " · feed gear " + rpm + " rpm · cut " + Math.round((S.cut / TAU) * C.CUT_LEN) + " of " + C.CUT_LEN + " mm";
  if (readout.textContent !== text) readout.textContent = text;
}
const DONE = [
  () => S.swap < 0 && S.stepT > 0.2,
  () => S.lev === S.levT,
  () => S.pierced && S.lev === 1 && S.stepT > 0.5,
  () => S.omega > 0.97 && S.stepT > 1.2,
  () => S.cut >= TAU * 0.5,
  () => S.free && S.drop > 0.75,
  () => S.lev === 0 && S.levV === 0 && S.throwT > 0.6,
  () => S.omega === 0 && S.stepT > 0.6,
];
const snap = () => JSON.parse(JSON.stringify(S));
function enter(i, how) {
  if (i === 0) { const keep = { wheel: S.wheel, gear: S.gear, can: S.can }; Object.assign(S, fresh(), keep); if (how === "loop") { S.cut = TAU; S.free = true; S.pierced = true; S.drop = 0.8; S.swap = 0; } }
  if (i === 1) S.levT = 0.9;
  if (i === 2) S.levT = 1;
  S.focus = FOCUS[i]; S.stepT = 0;
  draw();
}
STEPS.mountSteps({
  root: document.querySelector("[data-steps]"), svg, stage, steps: STEP_INFO, views: VIEWS, colors: COLORS, size: [${WIDTH}, ${HEIGHT}],
  enter, update: (dt) => { step(dt); draw(); }, done: (i) => DONE[i](), advance: step, draw, save: snap,
  load: (x) => { Object.assign(S, JSON.parse(JSON.stringify(x))); lastPose = {}; },
});
`;
