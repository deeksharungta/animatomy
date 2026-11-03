import { C, P, model } from "./model.mjs";
import { tools } from "./tools.mjs";
import { dynamic, poses } from "./moving.mjs";
import { REST } from "./figure.mjs";
import { MICE, ROO } from "./crew.mjs";
import { STEPS, VIEWS, TAKE_VIEW } from "./story.mjs";

// The page script, part one: the state, the model step and the drawing.
export const DRAW_SCRIPT = `
const P = ${JSON.stringify(P)};
const C = ${JSON.stringify(C)};
const MICE = ${JSON.stringify(MICE)}, ROO = ${JSON.stringify(ROO)};
const STEP_INFO = ${JSON.stringify(STEPS.map(({ title, text, who, hold, pace }) => ({ title, text, who, hold, pace })))};
const PLANS = ${JSON.stringify(STEPS.map((s) => s.plan))};
const VIEWS = ${JSON.stringify(VIEWS.map((v) => v.map((n) => +n.toFixed(2))))};
const TAKE_VIEW = ${JSON.stringify(TAKE_VIEW.map((n) => +n.toFixed(2)))};
const COLORS = ${JSON.stringify(STEPS.map((s) => s.color))};
const K = { iso, pathOf, depthOf, translateAlong, solidSvg, lineSvg, dotsSvg, segment, cylinder, extrude, ...CREW };
const model = ${model.toString()};
const tools = ${tools.toString()};
const dynamic = ${dynamic.toString()};
const poses = ${poses.toString()};
const M = model(C), T = tools(K, P);
const IN = C.PLUG.x0, OUT = C.KEY.out;
// With the drawer open the bolt can only rise to the desk's underside, so the plug can't turn back past this.
let OPEN_DEG = 90;
for (let a = 90; a >= 0; a -= 0.25) { if (C.BOLT.top - M.boltDrop(a) > C.DESK.z0 - 0.2) break; OPEN_DEG = a; }
const stage = document.querySelector(".pl-stage");
const svgs = [...stage.querySelectorAll(":scope > svg")];
const part = (name) => stage.querySelector('[data-part="' + name + '"]');
const el = {};
for (const n of ["plug-back", "plug", "plug-front", "crank", "key-out", "lever", "eye", "bolt", "drawer", "drawer-b", "roo", "m0", "m1", "m2", "m3", "m4", "driver0", "driver1", "driver2", "driver3", "driver4"]) el[n] = part(n);
const readout = document.querySelector("[data-readout]");
const REST = ${JSON.stringify(REST)};
const fresh = () => ({ ...JSON.parse(JSON.stringify(REST)), kxT: OUT, degT: 0, dT: 0, plan: [], waitT: 0, stepT: 0, trying: false, hot: [] });
const S = fresh();
let lastPose = {};
function paintCrew(name, spec, pose, duty) {
  const node = el[name], key = JSON.stringify(pose) + duty;
  if (lastPose[name] === key) return;
  lastPose[name] = key;
  CREW.paintCritter(node, CREW.critter(spec, pose, P));
  CREW.setDuty(node, duty);
}
const shown = new Map();
function put(node, name, value) {
  const was = shown.get(node) ?? {};
  if (was[name] === value) return;
  was[name] = value;
  shown.set(node, was);
  if (name === "html") node.innerHTML = value; else node.setAttribute(name, value);
}
function readoutText() {
  const inside = Math.max(0, Math.min(C.KEY.len, IN + C.KEY.len - S.kx));
  const state = S.deg > 0.5 && !M.clear(M.pinsAt(S.which, S.kx)) ? "pin 3 binds" : S.d > 0.5 ? "drawer open " + S.d.toFixed(0) + " mm" : M.inKeep(S.deg) ? "locked" : "bolt clear";
  return "key " + (S.which ? "B" : "A") + " · " + inside.toFixed(1) + " mm in · plug " + (S.deg > 0.05 && S.deg < 9.95 ? S.deg.toFixed(1) : S.deg.toFixed(0)) + "° · " + state;
}
function draw() {
  const D = dynamic(K, P, C, M, S, T);
  for (const n of ["plug-back", "plug", "plug-front", "crank", "key-out", "lever", "eye"]) put(el[n], "html", D[n.replace(/-(.)/g, (_, c) => c.toUpperCase())]);
  C.PINS.forEach((_, i) => put(el["driver" + i], "transform", D.drivers[i]));
  put(el.bolt, "transform", D.bolt);
  put(el.drawer, "transform", D.drawer);
  put(el["drawer-b"], "transform", D.drawer);
  const q = poses(C, M, S, T, D);
  MICE.forEach((m, i) => paintCrew("m" + i, m, q["m" + i], S.hot.includes(i)));
  paintCrew("roo", ROO, q.roo, S.duty === "roo");
  const text = readoutText();
  if (readout.textContent !== text) readout.textContent = text;
}
const toward = (x, to, dt, v, k = 7) => { const d = to - x, s = Math.min(Math.abs(d), dt * Math.min(v, Math.abs(d) * k + v * 0.08)); return Math.abs(d) < 1e-4 ? to : x + Math.sign(d) * s; };
function step(dt) {
  S.t += dt; S.stepT += dt;
  const b0 = M.pinsAt(S.which, S.kx), phi0 = M.lever(S.deg);
  const h = S.plan[0];
  if (h) {
    if ("which" in h) { if (S.kx >= OUT - 1e-3) { S.which = h.which; S.plan.shift(); } else S.kxT = OUT; }
    else if ("kx" in h) { S.kxT = h.kx; if (Math.abs(S.kx - h.kx) < 1e-3) S.plan.shift(); }
    else if ("deg" in h) { S.degT = h.deg; if (Math.abs(S.deg - h.deg) < 1e-3 || (S.trying && (S.waitT += dt) > (h.wait ?? 0))) { S.waitT = 0; if (S.trying) S.degT = S.deg; S.plan.shift(); } }
    else if ("d" in h) { S.dT = h.d; if (Math.abs(S.d - h.d) < 1e-3) S.plan.shift(); }
  }
  // The key slides only with the plug square; the plug turns only as far as the pins allow.
  if (S.deg < 0.05) S.kx = toward(S.kx, S.kxT, dt, 18);
  const limit = M.turnLimit(M.pinsAt(S.which, S.kx)), lo = S.d > 0.2 ? OPEN_DEG : 0;
  const goal = Math.max(lo, Math.min(S.degT, limit));
  S.deg = toward(S.deg, goal, dt, goal < S.deg ? 170 : 80, 9);
  S.goal = goal;
  S.trying = S.degT > limit + 0.5 && S.deg >= limit - 0.05 && limit < 90;
  // The drawer moves only with the bolt out of its keep.
  S.slide = !M.inKeep(S.deg);
  if (S.slide) S.d = toward(S.d, S.dT, dt, 24);
  const b1 = M.pinsAt(S.which, S.kx);
  S.v = b1.map((b, i) => (dt > 0 ? (b - b0[i]) / dt : 0));
  S.rooV = dt > 0 ? (Math.abs(M.lever(S.deg) - phi0) / dt) * 57.3 : 0;
  S.aligned = M.clear(b1) && Math.abs(S.kx - IN) < 1e-3;
  const worstPin = M.gaps(b1).reduce((w, g, i, a) => (Math.abs(g) > Math.abs(a[w]) ? i : w), 0);
  S.hot = S.trying ? [worstPin] : S.rooV > 2 ? [] : S.v.map((v, i) => (Math.abs(v) > 0.3 ? i : -1)).filter((i) => i >= 0);
  S.duty = S.trying || S.hot.length ? "mice" : S.rooV > 2 ? "roo" : "";
  S.idle = S.duty ? 0 : S.idle + dt;
}
const moving = () => S.plan.length > 0 || Math.abs(S.kx - S.kxT) > 1e-3 || Math.abs(S.deg - (S.goal ?? S.deg)) > 1e-3 || (S.slide && Math.abs(S.d - S.dT) > 1e-3) || S.duty;
const DONE = PLANS.map((_, i) => () => !moving() && S.stepT > 0.3);
function enter(i, how) {
  if (i === 0 && how !== "next") { const keep = S.t; Object.assign(S, fresh()); S.t = keep; }
  S.plan = JSON.parse(JSON.stringify(PLANS[i]));
  S.stepT = 0; S.waitT = 0;
  draw();
}
`;
