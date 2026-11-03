import { WIDTH, HEIGHT, C, P, MO, PINCH, KNOCK, eventsOf, stateAt } from "./model.mjs";
import { dynamic } from "./moving.mjs";
import { poses } from "./poses.mjs";
import { STEPS, views, DONE_AT } from "./story.mjs";

// The page script: the same model, drawing and poses as the build, and the run.
export const PAGE_SCRIPT = `
const P = ${JSON.stringify(P)};
const C = ${JSON.stringify(C)};
const SPEC = ${JSON.stringify({ mo: MO, pinch: PINCH, knock: KNOCK })};
const STEP_INFO = ${JSON.stringify(STEPS.map(({ title, text, who, hold, pace }) => ({ title, text, who, hold, pace })))};
const VIEWS = ${JSON.stringify(views.map((v) => v.map((n) => +n.toFixed(2))))};
const COLORS = ${JSON.stringify(STEPS.map((s) => s.color))};
const DONE_AT = ${JSON.stringify(DONE_AT)};
const K = { iso, pathOf, segment, ring, sideArc, cylinder, depthOf, solidSvg, lineSvg, dotsSvg, translateAlong, ...CREW };
const eventsOf = ${eventsOf.toString()};
const stateAt = ${stateAt.toString()};
const dynamic = ${dynamic.toString()};
const poses = ${poses.toString()};
const E = eventsOf(C);
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const part = (name) => svg.querySelector('[data-part="' + name + '"]');
const HTML = ["paddle", "lift", "rail", "cup", "pile", "hammer", "hammerFront", "sear", "platform", "rodUp", "piston"];
const MOVED = [["xback", "xhead"], ["xfront", "xhead"], ["push", "push"], ["bell", "bell"]];
const CREWS = ["mo", "pinch", "knock"];
const el = Object.fromEntries([...HTML, ...MOVED.map(([n]) => n), ...CREWS].map((n) => [n, part(n)]));
const pointer = el.xfront.querySelector("[data-lit]");
const readout = document.querySelector("[data-readout]");
const M = { t: 0 };
let last = {};
const write = (key, value, fn) => { if (last[key] !== value) { last[key] = value; fn(); } };
function draw() {
  const S = stateAt(C, E, M.t), D = dynamic(K, P, C, S);
  for (const n of HTML) write(n, D[n], () => { el[n].innerHTML = D[n]; });
  for (const [n, key] of MOVED) write(n + ":t", D[key], () => el[n].setAttribute("transform", D[key]));
  write("lit", S.duty, () => pointer.toggleAttribute("data-lit", S.duty === ""));
  const p = poses(C, S, D);
  for (const n of CREWS) write(n + ":c", JSON.stringify(p[n]) + (S.duty === n), () => {
    CREW.paintCritter(el[n], CREW.critter(SPEC[n], p[n], P));
    CREW.setDuty(el[n], S.duty === n);
  });
  const text = "wait " + Math.round(S.left * 1000) + " ms · keys " + S.landed + " · rings " + S.rings + " · " + M.t.toFixed(2) + " s";
  if (readout.textContent !== text) readout.textContent = text;
}
function step(dt) { M.t = Math.min(C.END, M.t + dt); }
function enter(i) { if (i === 0) M.t = 0; last = {}; draw(); }
window.__dbAt = (t) => { M.t = t; last = {}; draw(); return stateAt(C, E, t).duty; };
STEPS.mountSteps({
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
  load: (x) => { Object.assign(M, x); last = {}; },
});
`;
