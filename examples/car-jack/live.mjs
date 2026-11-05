// The page script: the jack's model (the pump stroke, the two check valves, the ram and the car on the oil, the
// release), the drawing and the run. Every number comes from the constants the build draws with.
import { C, P, WIDTH, HEIGHT, OTTIE, PINCH } from "./model.mjs";
import { STEPS, VIEWS, FOCUS, UT } from "./story.mjs";
import { dynamic } from "./moving.mjs";
import { poses } from "./poses.mjs";

export const START = { u: 0, uT: 0, zp: C.ZP.top, vz: 0, e: C.E0, level: C.LEVEL0, gate: 0, strain: 0, ball: 0, rel: 0, relT: 0, flow: { del: 0, suc: 0, ret: 0 }, ph: { del: 0, suc: 0, ret: 0 }, idle: 0, done: false, lit: "ram", duty: "" };

export const liveScript = () => `
const P = ${JSON.stringify(P)}, C = ${JSON.stringify(C)};
const SPEC = ${JSON.stringify({ ottie: OTTIE, pinch: PINCH })};
const STEP_INFO = ${JSON.stringify(STEPS.map(({ title, text, who, hold, pace }) => ({ title, text, who, hold, pace })))};
const VIEWS = ${JSON.stringify(VIEWS.map((v) => v.map((n) => +n.toFixed(2))))};
const COLORS = ${JSON.stringify(STEPS.map((s) => s.color))};
const FOCUS = ${JSON.stringify(FOCUS)}, UT = ${JSON.stringify(UT)}, START = ${JSON.stringify(START)};
const K = { iso, pathOf, depthOf, dotsSvg, solidSvg, lineSvg, fadedSvg, extrude, ...CREW };
const dynamic = ${dynamic.toString()};
const poses = ${poses.toString()};
const stage = document.querySelector(".iso-stage"), svg = stage.querySelector("svg");
const part = (n) => svg.querySelector('[data-part="' + n + '"]');
const PARTS = ["res", "cyl", "cham", "beads", "ball", "needle", "knob", "link", "socket", "sleeve", "handle", "cup", "cross"];
const el = {};
for (const n of [...PARTS, "ram", "body", "liner", "wheel", "ottie", "pinch"]) el[n] = part(n);
const ramSolid = el.ram.querySelectorAll(".iso-solid")[1];
const readout = document.querySelector("[data-readout]");
const AR = Math.PI * (C.RAM_D / 2) ** 2, AP = Math.PI * (C.PL_D / 2) ** 2, SINK = 26;
// The handle speeds up stroke by stroke: 1.24 s for the first, 0.4 s from the twenty-fourth on.
const HALF = (u) => Math.max(0.2, 0.62 - 0.0175 * Math.floor(u / 2));
// The jack's share of the corner's weight: it grows as the spring unloads, all of it once the tyre is off the floor.
const loadOf = (e) => C.LOAD * Math.min(1, Math.max(0, (e - C.E0) / C.DROOP));
const fresh = () => JSON.parse(JSON.stringify(START));
const S = { ...fresh(), stepT: 0, focus: "" };
const ease = (v, t, dt, tau) => v + (t - v) * (1 - Math.exp(-dt / tau));
// The plunger's height for u half strokes done: even half strokes go down from the top, odd ones come back up.
// How far the plunger has pushed down in all, over u half strokes: the oil sent under the ram, exactly.
const downOf = (u) => { const n = Math.floor(u); return C.STROKE * (Math.ceil(n / 2) + (n % 2 === 0 ? (1 - Math.cos(Math.PI * (u - n))) / 2 : 0)); };
const zpOf = (u) => { const n = Math.floor(u), f = u - n, s = (1 - Math.cos(Math.PI * f)) / 2; return n % 2 === 0 ? C.ZP.top - C.STROKE * s : C.ZP.bot + C.STROKE * s; };
function step(dt) {
  S.stepT += dt;
  const z0 = S.zp, g0 = S.gate;
  const u0 = S.u;
  S.u = Math.min(S.uT, S.u + dt / HALF(S.u));
  S.zp = zpOf(S.u);
  S.vz = S.u === S.uT ? 0 : (S.zp - z0) / Math.max(dt, 1e-3);
  // Down: the oil Ottie pushes lifts Pinch off his seat and goes under the ram. Up: the ball valve opens instead.
  if (S.rel < 0.05) S.e += (downOf(S.u) - downOf(u0)) / C.AREA;
  S.gate = ease(S.gate, S.vz < -1 ? 1 : 0, dt, 0.06);
  S.ball = ease(S.ball, S.vz > 1 ? 1 : 0, dt, 0.06);
  S.gateV = Math.abs(S.gate - g0) / Math.max(dt, 1e-3);
  const loaded = S.e > C.E0 + 0.01;
  S.strain = ease(S.strain, loaded && S.gate < 0.5 ? 1 : 0, dt, 0.12);
  // The release: the needle backs out, and the load pushes the oil back until the sill lands on the stand.
  S.rel = ease(S.rel, S.relT, dt, 0.35);
  if (Math.abs(S.rel - S.relT) < 0.004) S.rel = S.relT;
  const sink = loaded && S.rel > 0.05 ? Math.min(S.e - C.E0, SINK * S.rel * Math.sqrt(Math.max(0.2, loadOf(S.e) / C.LOAD)) * dt) : 0;
  S.e -= sink;
  if (S.relT > 0 && S.e <= C.E0 + 0.01 && S.stepT > 0.6 && S.landT === undefined) S.landT = 0;
  if (S.landT !== undefined) { S.landT += dt; if (S.landT > 0.5) { S.relT = 0; } }
  S.level = C.LEVEL0 - (AR * (S.e - C.E0) - AP * (C.ZP.top - S.zp)) / C.ANN;
  S.flow.del = S.vz < -1 ? Math.min(1, -S.vz / 15) : 0;
  S.flow.suc = S.vz > 1 ? Math.min(1, S.vz / 15) : 0;
  S.flow.ret = sink > 0 ? Math.min(1, S.rel * 1.4) : 0;
  S.ph.del += 30 * S.flow.del * dt; S.ph.suc += 30 * S.flow.suc * dt; S.ph.ret += 24 * S.flow.ret * dt;
  const moving = { ottie: Math.abs(S.vz) > 1.5, pinch: Math.abs(S.vz) > 1.5 };
  S.duty = S.focus && moving[S.focus] ? S.focus : "";
  S.lit = S.duty ? "" : S.rel > 0.02 || S.relT > 0 ? "needle" : "ram";
  S.idle = Math.abs(S.vz) > 0.5 || sink > 0 ? 0 : S.idle + dt;
  S.done = S.u >= 16;
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
  for (const n of PARTS) if (el[n].__d !== D[n]) { el[n].innerHTML = D[n]; el[n].__d = D[n]; }
  const lift = translateAlong(P, [0, 0, S.e - C.E0]);
  el.ram.setAttribute("transform", translateAlong(P, [0, 0, S.e]));
  el.body.setAttribute("transform", lift); el.liner.setAttribute("transform", lift);
  el.wheel.setAttribute("transform", translateAlong(P, [0, 0, Math.max(0, S.e - C.E0 - C.DROOP)]));
  ramSolid.toggleAttribute("data-lit", S.lit === "ram");
  const q = poses(C, S);
  paintCrew("ottie", q.ottie, S.duty === "ottie");
  paintCrew("pinch", q.pinch, S.duty === "pinch");
  const f = loadOf(S.e) / C.LOAD, n = Math.min(C.STROKES, Math.ceil(S.u / 2 - 1e-6));
  const text = (S.landT !== undefined ? "on the stand" : S.rel > 0.02 ? "releasing" : "stroke " + n + "/" + C.STROKES) + " · ram +" + Math.round(S.e - C.E0) + " mm · " + Math.round(C.BAR * f) + " bar · grip " + (S.vz < -1 ? C.PUSH * f : 0).toFixed(1) + " kg";
  if (readout.textContent !== text) readout.textContent = text;
}
const DONE = [
  () => S.stepT > 0.3,
  () => S.u === S.uT && S.stepT > 0.2,
  () => S.u === S.uT && S.strain > 0.95,
  () => S.u === S.uT,
  () => S.u === S.uT && S.stepT > 0.4,
  () => S.rel === 1 && S.e < C.E0 + C.LIFT - 20,
  () => S.e <= C.E0 + 0.01 && S.rel === 0 && S.relT === 0,
];
const snap = () => JSON.parse(JSON.stringify(S));
function enter(i, how) {
  if (i === 0) { Object.assign(S, fresh()); S.landT = undefined; }
  S.uT = UT[i];
  if (i === 5) { S.relT = 1; S.landT = undefined; }
  S.focus = FOCUS[i]; S.stepT = 0;
  draw();
}
STEPS.mountSteps({
  root: document.querySelector("[data-steps]"), svg, stage, steps: STEP_INFO, views: VIEWS, colors: COLORS, size: [${WIDTH}, ${HEIGHT}],
  enter, update: (dt) => { step(dt); draw(); }, done: (i) => DONE[i](), advance: step, draw, save: snap,
  load: (x) => { Object.assign(S, JSON.parse(JSON.stringify(x))); lastPose = {}; },
});
`;
