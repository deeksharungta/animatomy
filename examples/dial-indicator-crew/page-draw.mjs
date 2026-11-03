import { C, P, model } from "./model.mjs";
import { tools } from "./tools.mjs";
import { REST, dynamic, poses, blockAt } from "./moving.mjs";
import { ROO, MO, PINCH } from "./crew.mjs";
import { STEPS, VIEWS, TAKE_VIEW } from "./story.mjs";

// The page script, part one: the state, the drawing and the model step.
export const DRAW_SCRIPT = `
const P = ${JSON.stringify(P)};
const C = ${JSON.stringify(C)};
const ROO = ${JSON.stringify(ROO)}, MO = ${JSON.stringify(MO)}, PINCH = ${JSON.stringify(PINCH)};
const STEP_INFO = ${JSON.stringify(STEPS.map(({ title, text, who, hold, pace }) => ({ title, text, who, hold, pace })))};
const WANT = ${JSON.stringify(STEPS.map((s) => s.want))};
const VIEWS = ${JSON.stringify(VIEWS.map((v) => v.map((n) => +n.toFixed(2))))};
const TAKE_VIEW = ${JSON.stringify(TAKE_VIEW.map((n) => +n.toFixed(2)))};
const COLORS = ${JSON.stringify(STEPS.map((s) => s.color))};
const K = { iso, pathOf, depthOf, translateAlong, solidSvg, lineSvg, dotsSvg, segment, ...CREW };
const model = ${model.toString()};
const tools = ${tools.toString()};
const blockAt = ${blockAt.toString()};
const dynamic = ${dynamic.toString()};
const poses = ${poses.toString()};
const M = model(C), T = tools(K, P, { O: C.O, U: C.U, N: C.N });
const stage = document.querySelector(".di-stage");
const svgs = [...stage.querySelectorAll(":scope > svg")];
const part = (name) => stage.querySelector('[data-part="' + name + '"]');
const el = {};
for (const n of ["plunger-low", "plunger-in", "cap", "needle", "centre", "crown", "pinion", "hair", "collet", "scale", "lock", "rod-up", "coil-back", "coil-front", "spring", "blocks", "roo", "mo", "pinch"]) el[n] = part(n);
const blockEls = C.BLOCKS.map((_, i) => part("block" + i));
const needleEdge = el.needle.querySelector(".iso-edge");
const springPath = el.spring.querySelector("path");
const readout = document.querySelector("[data-readout]");
const REST = ${JSON.stringify(REST)};
const S = JSON.parse(JSON.stringify(REST));
let lastPose = {};
function paintCrew(name, spec, pose, duty) {
  const node = el[name], key = JSON.stringify(pose) + duty;
  if (lastPose[name] === key) return;
  lastPose[name] = key;
  CREW.paintCritter(node, CREW.critter(spec, pose, P));
  node.toggleAttribute("data-duty", duty);
}
// Only what changed reaches the DOM.
const shown = new Map();
function put(node, name, value) {
  const was = shown.get(node) ?? {};
  if (was[name] === value) return;
  was[name] = value;
  shown.set(node, was);
  if (name === "html") node.innerHTML = value; else node.setAttribute(name, value);
}
let order = "";
function readoutText() {
  const r = M.reading(S.p, S.b + S.ref), h = C.BLOCKS[S.want].toFixed(2) + " mm block";
  return (S.under === S.want && Math.abs(S.p - M.rest(S.want)) < 0.002 ? h : "→ " + h) + " · reads " + M.show(r);
}
function draw() {
  const D = dynamic(K, P, C, M, S, T);
  for (const n of ["plunger-low", "plunger-in", "cap"]) put(el[n], "transform", D.lift);
  for (const n of ["needle", "centre", "crown", "pinion", "hair", "collet", "scale", "lock"]) put(el[n], "transform", D[n]);
  put(el["rod-up"], "html", D.rodUp);
  put(el["coil-back"], "html", D.coilBack);
  put(el["coil-front"], "html", D.coilFront);
  put(springPath, "d", D.spring.d);
  blockEls.forEach((b, i) => put(b, "transform", D.blocks[i]));
  // The blocks are re-stacked far to near as they slide.
  const depth = C.BLOCKS.map((_, i) => { const h = blockAt(C, i, S.s[i]), o = [C.HOME * C.N[0] + (i - 2) * C.LANE * C.U[0] + h[0], C.HOME * C.N[1] + (i - 2) * C.LANE * C.U[1] + h[1], 0]; return [K.depthOf(o, P), i]; });
  const now = depth.sort((a, b) => a[0] - b[0]).map((d) => d[1]).join("");
  if (now !== order) { order = now; for (const ch of now) el.blocks.appendChild(blockEls[+ch]); }
  const q = poses(C, M, S, T);
  paintCrew("roo", ROO, q.roo, S.duty === "roo");
  paintCrew("mo", MO, q.mo, S.duty === "mo");
  paintCrew("pinch", PINCH, q.pinch, S.duty === "pinch");
  put(needleEdge, "data-tone", S.duty ? "hi" : "lit");
  const text = readoutText();
  if (readout.textContent !== text) readout.textContent = text;
}
const ease = (x, to, dt, tau) => to + (x - to) * Math.exp(-dt / tau);
function step(dt) {
  S.t += dt;
  S.stepT += dt;
  const p0 = S.p, b0 = S.b, g0 = S.grip;
  // Zeroing: Pinch lets go, you turn the bezel until its 0 is under the needle, and Pinch clamps it again.
  if (S.zero === 1) { S.gripT = 0; if (S.grip < 0.02) { S.bT = S.b + ((((S.p - S.b) % 1) + 1.5) % 1) - 0.5; S.ref = Math.round(S.p - S.bT); S.zero = 2; } }
  if (S.zero === 2 && Math.abs(S.b - S.bT) < 1e-4) { S.b = S.bT; S.gripT = 1; S.zero = 3; }
  if (S.zero === 3 && S.grip > 0.995) { S.grip = 1; S.zero = 0; S.zeroed = true; }
  S.grip = ease(S.grip, S.gripT, dt, 0.16);
  if (Math.abs(S.grip - S.gripT) < 0.004) S.grip = S.gripT;
  if (S.grip < 0.05) S.b = Math.abs(S.bT - S.b) < 1e-4 ? S.bT : S.b + Math.sign(S.bT - S.b) * Math.min(Math.abs(S.bT - S.b), dt * Math.max(0.04, Math.abs(S.bT - S.b) * 3));
  // A block change: you lift the plunger by its cap, slide the old block out and the new one in, and let go.
  if (S.want !== S.under) {
    const lift = Math.max(S.under >= 0 ? M.rest(S.under) : 0, M.rest(S.want)) + C.CLEAR;
    if (S.p < lift - 0.003) S.p = Math.min(lift, ease(S.p, lift + 0.3, dt, 0.32), S.p + dt * 9);
    else {
      S.p = Math.max(S.p, lift);
      if (S.under >= 0 && S.s[S.under] > 0) S.s[S.under] = Math.max(0, S.s[S.under] - dt * 0.85);
      else { S.under = -1; S.s[S.want] = Math.min(1, S.s[S.want] + dt * 0.85); if (S.s[S.want] >= 1) S.under = S.want; }
    }
  } else {
    // You let go: Roo's push drives the plunger down until the contact point lands on the block.
    const rest = M.rest(S.under);
    if (S.p > rest) S.p = Math.max(rest, ease(S.p, rest - 0.2, dt, 0.12));
  }
  const v = dt > 0 ? (S.p - p0) / dt : 0;
  S.roo = Math.max(0, -v); S.mo = Math.max(0, v);
  S.pinch = dt > 0 ? (Math.abs(S.grip - g0) + Math.abs(S.b - b0) * 4) / dt : 0;
  S.duty = S.pinch > 0.05 ? "pinch" : S.roo > 0.05 ? "roo" : S.mo > 0.05 ? "mo" : "";
  S.idle = S.duty ? 0 : S.idle + dt;
}
const settled = () => S.under === S.want && Math.abs(S.p - M.rest(S.want)) < 1e-4 && S.stepT > 0.3 && !S.duty;
const DONE = WANT.map((_, i) => (i === 0 ? () => S.stepT > 0.3 : i === 1 ? () => S.zeroed && S.zero === 0 && S.stepT > 0.3 && !S.duty : settled));
function enter(i, how) {
  if (i === 0 && how !== "next") Object.assign(S, JSON.parse(JSON.stringify(REST)));
  if (i === 1) { S.zero = 1; S.zeroed = false; }
  S.want = WANT[i];
  S.stepT = 0;
  draw();
}
`;
