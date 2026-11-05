// The page script: the cistern's model (physics.mjs), the drawing of what moves (moving.mjs), the crew's poses
// (poses.mjs) and the run. Everything comes from the constants the build draws with.
import { C, P, WIDTH, HEIGHT, OTTIE, MO } from "./model.mjs";
import { STEPS, VIEWS, FOCUS, WARP } from "./story.mjs";
import { fresh, stepModel } from "./physics.mjs";
import { dynamic } from "./moving.mjs";
import { levers, poses } from "./poses.mjs";

export const PARTS = ["waterBack", "ripples", "swirl", "throat", "arm", "handle", "chain", "float", "inflow", "trickle", "waterFront", "bowl"];

export const liveScript = () => `
const P = ${JSON.stringify(P)}, C = ${JSON.stringify(C)};
const SPEC = ${JSON.stringify({ ottie: OTTIE, mo: MO })};
const STEP_INFO = ${JSON.stringify(STEPS.map(({ title, text, who, hold, pace }) => ({ title, text, who, hold, pace })))};
const VIEWS = ${JSON.stringify(VIEWS.map((v) => v.map((n) => +n.toFixed(2))))};
const COLORS = ${JSON.stringify(STEPS.map((s) => s.color))};
const FOCUS = ${JSON.stringify(FOCUS)}, WARP = ${JSON.stringify(WARP)}, PARTS = ${JSON.stringify(PARTS)};
const K = { iso, pathOf, depthOf, dotsSvg, solidSvg, lineSvg, fadeLineSvg, extrude, cylinder, ...CREW };
const fresh = ${fresh.toString()};
const stepModel = ${stepModel.toString()};
const dynamic = ${dynamic.toString()};
const levers = ${levers.toString()};
const poses = ${poses.toString()};
const stage = document.querySelector(".iso-stage"), svg = stage.querySelector("svg");
const el = {};
for (const n of [...PARTS, "ottie", "mo"]) el[n] = svg.querySelector('[data-part="' + n + '"]');
const readout = document.querySelector("[data-readout]");
const S = fresh(C);
let lastPose = {};
function paintCrew(name, pose, on) {
  const key = JSON.stringify(pose) + on;
  if (lastPose[name] !== key) { lastPose[name] = key; CREW.paintCritter(el[name], CREW.critter(SPEC[name], pose, P)); }
  CREW.setDuty(el[name], on);
}
const fmt = (s) => { const d = Math.floor(s * 10), r = d % 600; return Math.floor(d / 600) + ":" + String(Math.floor(r / 10)).padStart(2, "0") + "." + (r % 10); };
function draw() {
  const q = poses(C, S);
  S.ring = q.L.ring;
  const D = dynamic(K, P, C, S);
  for (const n of PARTS) if (el[n].__d !== D[n]) { el[n].innerHTML = D[n]; el[n].__d = D[n]; }
  paintCrew("ottie", q.ottie, S.duty === "ottie");
  paintCrew("mo", q.mo, S.duty === "mo");
  const vol = (Math.max(0, S.h - C.SEAL) * C.AREA).toFixed(1);
  const word = S.qout > 0.05 ? "flushing · out " + S.qout.toFixed(1) + " L/s" : S.open > 0 ? "filling · in " + (S.qin * 60).toFixed(1) + " L/min" : S.lev > 0 ? "handle down" : "full";
  const text = word + " · tank " + vol + " L" + (S.run ? " · " + fmt(S.clock) : "");
  if (readout.textContent !== text) readout.textContent = text;
}
const DONE = [
  () => S.stepT > 0.3,
  () => !S.push && S.lev < 0.25 && S.hop > 0,
  () => S.paw <= C.STOP + 2 && S.stepT > 0.4,
  () => S.hop === 0,
  () => S.open < 0.45,
  () => S.open === 0 && S.stepT > 0.6,
];
const snap = () => JSON.parse(JSON.stringify(S));
function enter(i, how) {
  if (i === 0) Object.assign(S, fresh(C), { t: S.t, swirl: S.swirl });
  if (i === 1) { S.push = true; S.pushT = 0; S.run = true; S.clock = 0; }
  S.focus = FOCUS[i]; S.warp = WARP[i]; S.stepT = 0;
  draw();
}
STEPS.mountSteps({
  root: document.querySelector("[data-steps]"), svg, stage, steps: STEP_INFO, views: VIEWS, colors: COLORS, size: [${WIDTH}, ${HEIGHT}],
  enter, update: (dt) => { stepModel(C, S, dt); draw(); }, done: (i) => DONE[i](), advance: (dt) => stepModel(C, S, dt), draw, save: snap,
  load: (x) => { Object.assign(S, JSON.parse(JSON.stringify(x))); lastPose = {}; },
});
`;
