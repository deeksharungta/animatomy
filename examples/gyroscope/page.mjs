import { WIDTH, HEIGHT, C, P, physics } from "./model.mjs";
import { dynamic } from "./arm.mjs";
import { forkOf } from "./fork.mjs";
import { rotorOf } from "./rotor.mjs";
import { poses } from "./crewpose.mjs";
import { VOLTA, MO, PINCH, STEPS, VIEWS, REST, PARK, readoutOf } from "./story.mjs";
import { toggle, lamp, needleOf, METER } from "./supply.mjs";

// The page script: the state, the drawing, the model step and the run.
export const PAGE_SCRIPT = `
const P = ${JSON.stringify(P)};
const C = ${JSON.stringify(C)};
const VOLTA = ${JSON.stringify(VOLTA)}, MO = ${JSON.stringify(MO)}, PINCH = ${JSON.stringify(PINCH)};
const STEP_INFO = ${JSON.stringify(STEPS.map(({ title, text, who, hold, pace }) => ({ title, text, who, hold, pace })))};
const VIEWS = ${JSON.stringify(VIEWS.map((v) => v.map((n) => +n.toFixed(2))))};
const COLORS = ${JSON.stringify(STEPS.map((s) => s.color))};
const SWITCH = ${JSON.stringify({ on: toggle(true), off: toggle(false), lampOn: lamp(true), lampOff: lamp(false) })};
const METER = ${JSON.stringify(METER)};
const REST = ${JSON.stringify(REST)}, PARK = ${PARK};
const K = { iso, pathOf, depthOf, cameraOf, solidSvg, lineSvg, dotsSvg, fadedSvg, segment, ...CREW };
const physics = ${physics.toString()};
const PH = physics(C);
const dynamic = ${dynamic.toString()};
const forkOf = ${forkOf.toString()};
const rotorOf = ${rotorOf.toString()};
const needleOf = ${needleOf.toString()};
const poses = ${poses.toString()};
const readoutOf = ${readoutOf.toString()};
const stage = document.querySelector(".gy-stage");
const svgs = [...stage.querySelectorAll(":scope > svg")];
const sortG = stage.querySelector("[data-sort]");
const slot = (name) => stage.querySelector('[data-slot="' + name + '"]');
const NAMES = ["col", "cheekA", "cheekB", "tab", "shelf", "block", "barR", "barC", "pin", "cw", "motor", "rotor", "pinch", "mo", "volta"];
const el = Object.fromEntries(NAMES.map((n) => [n, slot(n)]));
const crewEl = { mo: el.mo.firstElementChild, volta: el.volta.firstElementChild, pinch: el.pinch.firstElementChild };
const sw = stage.querySelector('[data-part="switch"]'), lampEl = stage.querySelector('[data-part="lamp"]'), needle = stage.querySelector('[data-part="needle"]');
const readout = document.querySelector("[data-readout]");
const S = { ...REST };
const shown = new Map();
function put(node, value) { if (shown.get(node) !== value) { shown.set(node, value); node.innerHTML = value; } }
let lastPose = {}, lastOrder = "";
function paintCrew(name, spec, pose, duty) {
  const key = JSON.stringify(pose) + duty;
  if (lastPose[name] === key) return;
  lastPose[name] = key;
  CREW.paintCritter(crewEl[name], CREW.critter(spec, pose, P));
  CREW.setDuty(crewEl[name], duty);
}
function draw() {
  const D = dynamic(K, P, C, S);
  const keys = {};
  for (const [n, it] of Object.entries(D.items)) { put(el[n], it.svg); keys[n] = it.key; }
  const p = poses(C, S, D, MO, PINCH);
  const kd = (q) => K.depthOf([q[0], q[1], 0], P);
  keys.col = kd([0, 0, 0]) - 0.4;
  keys.pinch = Math.max(kd(p.pinch.at), keys.shelf, keys.barC) + 0.01;
  keys.pin = keys.pinch - 0.005;
  keys.mo = Math.max(kd(p.mo.at), keys.barR + 0.01);
  keys.volta = Math.max(keys.barR, keys.block, keys.mo, keys.motor) + 0.02;
  const order = NAMES.slice().sort((a, b) => keys[a] - keys[b]);
  const sig = order.join();
  if (sig !== lastOrder) { lastOrder = sig; for (const n of order) sortG.appendChild(el[n]); }
  paintCrew("mo", MO, p.mo, S.duty === "mo");
  paintCrew("volta", VOLTA, p.volta, S.duty === "volta");
  paintCrew("pinch", PINCH, p.pinch, S.duty === "pinch");
  put(sw, S.motor ? SWITCH.on : SWITCH.off);
  put(lampEl, S.motor ? SWITCH.lampOn : SWITCH.lampOff);
  put(needle, needleOf(K, P, METER, Math.round(PH.rpm(S) / 10) * 10));
  const text = readoutOf(C, PH, S);
  if (readout.textContent !== text) readout.textContent = text;
}
const H = 1 / 600;
function step(dt) {
  S.t += dt; S.stepT += dt; S.rel += dt;
  const gap = S.dT - S.d, v = Math.sign(gap) * Math.min(Math.abs(gap), 9 * dt);
  S.d += v; S.climb = Math.abs(v) > 1e-6;
  if (S.hand) {
    const f = 1 - Math.exp(-dt / 0.45);
    S.th += (0 - S.th) * f; S.ph += (S.phT - S.ph) * f;
  }
  if (S.hand && S.lock === false && Math.abs(S.th) < 0.002 && Math.abs(S.phT - S.ph) < 0.003) Object.assign(S, { th: 0, ph: PARK, hand: false, lock: true });
  const w0 = S.w;
  for (let n = Math.ceil(dt / H), i = 0; i < n; i++) PH.step(S, dt / n, S.warp);
  S.psi += C.SPIN * S.w * 0.03 * dt;
  S.amps = S.motor ? Math.min(1, (S.w - w0) / dt / 40 + 0.2) : 0;
  const moving = !S.lock && (Math.abs(S.phd) > 0.04 || Math.abs(S.thd) > 0.04 || S.hand);
  S.duty = !S.lock && S.rel < 1 ? "pinch" : S.motor && PH.W - S.w > 4 ? "volta" : moving || S.climb ? "mo" : "";
}
function enter(i, how) {
  if (i === 0) Object.assign(S, { ...REST, psi: S.psi, t: S.t });
  const set = [
    {},
    { motor: true, warp: 6 },
    { lock: false, rel: 0, warp: 1 },
    {},
    { dT: C.MO.far },
    { motor: false, warp: 5 },
    {},
    { hand: true, phT: PARK + 2 * Math.PI * Math.ceil((S.ph - PARK) / (2 * Math.PI)), dT: C.MO.near, warp: 60 },
  ][i];
  Object.assign(S, set, { stepT: 0 });
  draw();
}
// Mo hangs beside the rotor: pointing at you the rotor hides him, pointing away the column and counterweight
// do, so a beat about him ends only while the arm lies across the picture.
const across = () => { const cam = K.cameraOf(P); return Math.abs(Math.cos(S.ph) * cam.cosA + Math.sin(S.ph) * cam.sinA) < 0.4; };
const DONE = [
  () => S.stepT > 0.5,
  () => S.w >= PH.W * 0.996,
  () => S.stepT > 3.5,
  () => S.stepT > 6 && across(),
  () => S.d === S.dT && S.stepT > 5 && across(),
  () => PH.rpm(S) < 1900 && across(),
  () => S.th <= -(C.STOP * Math.PI) / 180 + 1e-6 && S.stepT > 1 && across(),
  () => S.lock && S.w === 0 && S.d === S.dT,
];
STEPS.mountSteps({
  root: document.querySelector("[data-steps]"), svg: svgs, stage, steps: STEP_INFO, views: VIEWS, colors: COLORS, size: [${WIDTH}, ${HEIGHT}],
  enter, update: (dt) => { step(dt); draw(); }, done: (i) => DONE[i](), advance: step, draw,
  save: () => JSON.parse(JSON.stringify(S)),
  load: (x) => { Object.assign(S, JSON.parse(JSON.stringify(x))); lastPose = {}; draw(); },
});
`;
