// The page script: the same schedule, drawing and poses as the build, and the run.
import { WIDTH, HEIGHT, C, P, NIB, ROCKY, KNOCK } from "./model.mjs";
import { planOf, stateAt } from "./timeline.mjs";
import { dynamic } from "./moving.mjs";
import { envelope } from "./letters.mjs";
import { poses } from "./poses.mjs";
import { STEPS, VIEWS, DONE_AT } from "./story.mjs";

// Which slot of the painter's order a moving letter is drawn in: the chute, the tray, a hole, or Nib's paws.
export function slotOf(C, l) {
  const T = C.TRAY, p = l.pos;
  if (l.slope) return "chuteL";
  if (!l.held && p[0] > T.x && p[0] < T.x + T.w && p[1] > T.y && p[1] < T.y + T.d && p[2] < C.TOP + 8) return "trayL";
  if (p[1] <= C.Y1 + 1) return "hole" + Math.max(0, Math.min(C.N - 1, Math.floor(p[0] / C.PITCH)));
  return "carry";
}
export const SLOTS = ["chuteL", "trayL", "carry", ...Array.from({ length: C.N }, (_, i) => "hole" + i)];

export const PAGE_SCRIPT = `
const P = ${JSON.stringify(P)}, C = ${JSON.stringify(C)};
const SPEC = ${JSON.stringify({ nib: NIB, rocky: ROCKY, knock: KNOCK })};
const STEP_INFO = ${JSON.stringify(STEPS.map(({ title, text, who, hold, pace }) => ({ title, text, who, hold, pace })))};
const VIEWS = ${JSON.stringify(VIEWS.map((v) => v.map((n) => +n.toFixed(2))))};
const COLORS = ${JSON.stringify(STEPS.map((s) => s.color))};
const DONE_AT = ${JSON.stringify(DONE_AT)};
const SLOTS = ${JSON.stringify(SLOTS)};
const K = { iso, pathOf, segment, ring, cylinder, slabOf, depthOf, solidSvg, lineSvg, dotsSvg, ...CREW };
const planOf = ${planOf.toString()};
const stateAt = ${stateAt.toString()};
const dynamic = ${dynamic.toString()};
const envelope = ${envelope.toString()};
const poses = ${poses.toString()};
const slotOf = ${slotOf.toString()};
const E = planOf(C);
const stage = document.querySelector(".iso-stage"), svg = stage.querySelector("svg");
const part = (n) => svg.querySelector('[data-part="' + n + '"]');
const el = {};
for (const n of ["cams", "flags", "counter", "bevel", "crank", "nib", "rocky", "knock", ...SLOTS]) el[n] = part(n);
const readout = document.querySelector("[data-readout]");
const M = { t: 0 };
const END = stateAt(C, E, E.end);
let ghostOn = false, lastPose = {}, last = {};
const write = (name, html) => { if (last[name] !== html) { el[name].innerHTML = html; last[name] = html; } };
function paintCrew(name, pose, on) {
  const key = JSON.stringify(pose) + on;
  if (lastPose[name] === key) return;
  lastPose[name] = key;
  CREW.paintCritter(el[name], CREW.critter(SPEC[name], pose, P));
  CREW.setDuty(el[name], on);
}
const SLOPE = (() => { const a = C.CHUTE.a, b = C.CHUTE.b, d = [0, b[1] - a[1], b[2] - a[2]], l = Math.hypot(...d), u = d.map((v) => v / l); return { u, v: [0, -u[2], u[1]] }; })();
function lettersHtml(S, cls) {
  const out = Object.fromEntries(SLOTS.map((s) => [s, ""]));
  for (const l of S.letters) out[slotOf(C, l)] += (cls ? '<g class="' + cls + '">' : "") + envelope(K, P, C, l.pos, l.kind, l.slope ? SLOPE : null) + (cls ? "</g>" : "");
  return out;
}
function readoutText(S) {
  const r = S.read;
  if (!r) return "8 holes · hole = letter sum mod 8";
  const verb = r.kind === "put" ? "put " : "get ";
  if (r.count < r.sum) return verb + r.key + " · " + (r.vals.join(" + ") || "0") + " → " + r.count + " · hole " + (r.count % 8);
  if (r.kind === "put") return verb + r.key + " · " + r.sum + " mod 8 = " + r.h + (r.filed ? " · filed in " + r.h : "");
  return verb + r.key + " · hole " + r.h + " · " + r.cmps + (r.cmps === 1 ? " comparison" : " comparisons") + (r.found ? " · found" : "");
}
function draw() {
  const S = stateAt(C, E, M.t), D = dynamic(K, P, C, S), Lh = lettersHtml(S), G = ghostOn ? lettersHtml(END, "hm-ghost") : null;
  for (const n of ["cams", "flags", "counter", "bevel", "crank"]) write(n, D[n]);
  for (const s of SLOTS) write(s, (G ? G[s] : "") + Lh[s]);
  const q = poses(C, S);
  paintCrew("rocky", q.rocky, S.duty === "rocky");
  paintCrew("nib", q.nib, S.duty === "nib");
  paintCrew("knock", q.knock, S.duty === "knock");
  const text = readoutText(S);
  if (readout.textContent !== text) readout.textContent = text;
}
function step(dt) { M.t = Math.min(E.end, M.t + dt); }
function enter(i, how) {
  if (i === 0) { M.t = 0; if (how === "loop") { ghostOn = true; setTimeout(() => { ghostOn = false; draw(); }, 900); } }
  lastPose = {};
  draw();
}
window.__hmViews = VIEWS;
window.__hmFit = (pts) => STEPS.fitView(pts.map((p) => iso(p, P)), [${WIDTH}, ${HEIGHT}], { pad: 6, least: 0.05 });
window.__hmAt = (t) => { M.t = t; lastPose = {}; draw(); return stateAt(C, E, t); };
window.__hmRun = STEPS.mountSteps({
  root: document.querySelector("[data-steps]"), svg, stage, steps: STEP_INFO, views: VIEWS, colors: COLORS, size: [${WIDTH}, ${HEIGHT}],
  enter, update: (dt) => { step(dt); draw(); }, done: (i) => M.t >= DONE_AT[i] - 1e-6, advance: step, draw,
  save: () => ({ ...M }), load: (x) => { Object.assign(M, x); lastPose = {}; },
});
`;
