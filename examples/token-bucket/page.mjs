import { WIDTH, HEIGHT, C, P, PIP, MO, eventsOf, stateAt } from "./model.mjs";
import { dynamic } from "./moving.mjs";
import { poses } from "./poses.mjs";
import { STEPS, views, DONE_AT } from "./story.mjs";

// The page script: the same model, drawing and poses as the build, and the run.
export const PAGE_SCRIPT = `
const P = ${JSON.stringify(P)};
const C = ${JSON.stringify(C)};
const PIP = ${JSON.stringify(PIP)}, MO = ${JSON.stringify(MO)};
const STEP_INFO = ${JSON.stringify(STEPS.map(({ title, text, who, hold, pace }) => ({ title, text, who, hold, pace })))};
const VIEWS = ${JSON.stringify(views.map((v) => v.map((n) => +n.toFixed(2))))};
const COLORS = ${JSON.stringify(STEPS.map((s) => s.color))};
const DONE_AT = ${JSON.stringify(DONE_AT)};
const K = { iso, pathOf, segment, ring, cylinder, depthOf, solidSvg, lineSvg, dotsSvg, translateAlong, ...CREW };
const eventsOf = ${eventsOf.toString()};
const stateAt = ${stateAt.toString()};
const dynamic = ${dynamic.toString()};
const poses = ${poses.toString()};
const E = eventsOf(C);
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const part = (name) => svg.querySelector('[data-part="' + name + '"]');
const names = ["disc", "pinion", "crank", "feed", "stack", "pocket", "over", "flap", "cash-fly", "cash", "spill", "served-pile", "refused-pile", "env", "slide", "handle", "mo", "pip"];
const el = Object.fromEntries(names.map((n) => [n, part(n)]));
const readout = document.querySelector("[data-readout]");
const M = { t: 0 };
let ghostOn = false;
const END = stateAt(C, E, C.END);
let lastPose = {}, last = {};
function paintCrew(name, node, spec, pose, duty) {
  const key = JSON.stringify(pose) + duty;
  if (lastPose[name] === key) return;
  lastPose[name] = key;
  CREW.paintCritter(node, CREW.critter(spec, pose, P));
  CREW.setDuty(node, duty);
}
const write = (name, html) => { if (last[name] !== html) { el[name].innerHTML = html; last[name] = html; } };
function draw() {
  const S = stateAt(C, E, M.t);
  const D = dynamic(K, P, C, S);
  const G = ghostOn ? dynamic(K, P, C, END) : null;
  const ghost = (key) => (G ? '<g class="tb-ghost">' + G[key] + "</g>" : "");
  for (const [name, key] of [["disc", "disc"], ["pinion", "pinion"], ["crank", "crank"], ["feed", "feed"], ["stack", "stack"], ["pocket", "pocket"], ["over", "over"], ["flap", "flap"], ["cash-fly", "cashFly"], ["env", "env"]]) write(name, D[key]);
  for (const [name, key] of [["cash", "cash"], ["spill", "spill"], ["served-pile", "servedPile"], ["refused-pile", "refusedPile"]]) write(name, ghost(key) + D[key]);
  const shift = K.translateAlong(P, [S.stroke, 0, 0]);
  el.slide.setAttribute("transform", shift);
  el.handle.setAttribute("transform", shift);
  const p = poses(C, S);
  paintCrew("mo", el.mo, MO, p.mo, S.duty === "mo");
  paintCrew("pip", el.pip, PIP, p.pip, S.duty === "pip");
  const text = S.n + " of " + C.CAP + " tokens · passed " + S.passed + " · refused " + S.denied + " · " + M.t.toFixed(1) + " s";
  if (readout.textContent !== text) readout.textContent = text;
}
function step(dt) { M.t = Math.min(C.END, M.t + dt); }
function enter(i, how) {
  if (i === 0) { M.t = 0; if (how === "loop") { ghostOn = true; setTimeout(() => { ghostOn = false; draw(); }, 900); } }
  lastPose = {};
  draw();
}
// A hook for checks: draw the model at any time.
window.__tbAt = (t) => { M.t = t; lastPose = {}; draw(); return stateAt(C, E, t).duty; };
const RUN = STEPS.mountSteps({
  root: document.querySelector("[data-steps]"),
  svg,
  stage,
  steps: STEP_INFO,
  views: VIEWS,
  colors: COLORS,
  size: [${WIDTH}, ${HEIGHT}],
  enter,
  update: (dt) => { step(dt); draw(); },
  done: (i) => M.t >= DONE_AT[i] - 1e-6,
  advance: step,
  draw,
  save: () => ({ ...M }),
  load: (x) => { Object.assign(M, x); lastPose = {}; },
});
`;
