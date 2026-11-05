// The page script: the machine's model (the pedal, the motor, the shaft, the holes and the feed, a fresh piece of
// cloth each loop), the drawing, and the run. Everything comes from the constants the build draws with.
import { C, P, WIDTH, HEIGHT, KNOCK, PINCH, MO, BUN, MOCHI, kin, ease } from "./model.mjs";
import { STEPS, VIEWS, FOCUS } from "./story.mjs";
import { dynamic } from "./moving.mjs";
import { threads } from "./thread.mjs";
import { poses } from "./poses.mjs";

export const liveScript = () => `
const P = ${JSON.stringify(P)}, C = ${JSON.stringify(C)};
const SPEC = ${JSON.stringify({ knock: KNOCK, pinch: PINCH, mo: MO, bun: BUN, mochi: MOCHI })};
const STEP_INFO = ${JSON.stringify(STEPS.map(({ title, text, who, hold, pace }) => ({ title, text, who, hold, pace })))};
const VIEWS = ${JSON.stringify(VIEWS.map((v) => v.map((n) => +n.toFixed(2))))};
const COLORS = ${JSON.stringify(STEPS.map((s) => s.color))};
const FOCUS = ${JSON.stringify(FOCUS)};
const ease = ${ease.toString()};
const kin = ${kin.toString()};
const K = { iso, pathOf, depthOf, dotsSvg, solidSvg, lineSvg, fadedSvg, cylinder, slabOf, extrude, ...CREW, kin, ease };
const dynamic = ${dynamic.toString()};
const threads = ${threads.toString()};
const poses = ${poses.toString()};
const stage = document.querySelector(".iso-stage"), svg = stage.querySelector("svg");
const part = (n) => svg.querySelector('[data-part="' + n + '"]');
const el = {};
for (const n of ["rungs", "spokes", "belt", "hand", "crank", "link", "takeOut", "needleLow", "needleHigh", "cloth", "stitches", "top", "low", "knock", "pinch", "mo", "bun", "mochi"]) el[n] = part(n);
const slots = { back: svg.querySelector('[data-slot="pinchBack"]'), front: svg.querySelector('[data-slot="pinchFront"]') }, AZ = (P.azimuth * Math.PI) / 180;
const readout = document.querySelector("[data-readout]");
const TAU = Math.PI * 2, W = (TAU * C.SPM) / 60, PIERCE = Math.acos(2 * (C.BT + 0.6 - C.NEEDLE.low) / C.NEEDLE.stroke - 1);
// The feed so far: whole feeds plus the one under way, so the cloth only ever moves back.
const fed = (th) => { const F = C.FEED, u = th - F[1], c = Math.floor(u / TAU), f = u - c * TAU; return c + ease(Math.min(1, f / (F[2] - F[1]))); };
const fresh = () => ({ holes: [], base: S.th, off: 0, swap: -1, fade: 1 });
const S = { th: 0, omega: 0, wheel: 0.3, t: 0, idle: 9, stepT: 0, run: false, brake: -1, focus: "", duty: "", lit: "needle", cyc: 0, h0: 0 };
Object.assign(S, fresh());
function step(dt) {
  S.t += dt; S.stepT += dt;
  if (S.run) S.omega += (1 - S.omega) * (1 - Math.exp(-dt / 0.25));
  else if (S.brake >= 0) {
    const d = S.brake - S.th;
    S.omega = Math.min(S.omega, Math.sqrt(2 * 11 * Math.max(0, d)) / W);
    if (d < 1e-3 || S.omega < 0.004) { S.th = S.brake; S.omega = 0; S.brake = -1; }
  }
  const th0 = S.th, dth = S.omega * W * dt;
  S.th += S.brake >= 0 ? Math.min(dth, S.brake - S.th) : dth;
  S.wheel -= (S.th - th0) / 2;
  // A hole each time the needle's point goes through the cloth.
  if (Math.floor((S.th - PIERCE) / TAU) > Math.floor((th0 - PIERCE) / TAU)) S.holes.push(C.N[1] + S.off);
  S.off = C.SL * (fed(S.th) - fed(S.base));
  S.idle = S.omega > 0.02 ? 0 : S.idle + dt;
  const mv = S.omega > 0.04;
  const moving = { squad: mv, knock: mv, pinch: mv, mo: mv };
  S.duty = S.focus && moving[S.focus] ? S.focus : "";
  S.lit = S.duty ? "" : "needle";
  if (S.swap >= 0) {
    S.swap += dt / 0.9;
    if (S.swap >= 0.5 && S.holes.length) { S.holes = []; S.base = S.th; S.off = 0; }
    S.fade = Math.abs(Math.cos(Math.PI * Math.min(1, S.swap)));
    if (S.swap >= 1) { S.swap = -1; S.fade = 1; }
  }
}
let lastPose = {}, lastSlot = "";
function paintCrew(name, pose, on) {
  const key = JSON.stringify(pose) + on;
  if (lastPose[name] === key) return;
  lastPose[name] = key;
  CREW.paintCritter(el[name], CREW.critter(SPEC[name], pose, P));
  CREW.setDuty(el[name], on);
}
function draw() {
  const D = dynamic(K, P, C, S), q = poses(C, S, kin), T = threads(K, P, C, S, C.ROUTE, D, q);
  for (const n of ["rungs", "spokes", "belt", "hand", "crank", "link", "takeOut", "needleLow", "needleHigh", "cloth", "stitches"]) el[n].innerHTML = D[n];
  el.top.innerHTML = T.top; el.low.innerHTML = T.low;
  el.cloth.style.opacity = el.stitches.style.opacity = S.fade.toFixed(3);
  // Pinch walks round the case: behind it, between it and the plate, or out in front of the section.
  const slot = (q.pinch.at[0] - C.B[0]) * Math.cos(AZ) + (q.pinch.at[1] - C.B[1]) * Math.sin(AZ) > 0 ? "front" : "back";
  if (slot !== lastSlot) { slots[slot].appendChild(el.pinch); lastSlot = slot; }
  paintCrew("knock", q.knock, S.duty === "knock");
  paintCrew("pinch", q.pinch, S.duty === "pinch");
  paintCrew("mo", q.mo, S.duty === "mo");
  paintCrew("bun", q.bun, S.duty === "squad");
  paintCrew("mochi", q.mochi, S.duty === "squad");
  const k = kin(C, S.th), m = ((S.th % TAU) + TAU) % TAU, psi = (m - C.CATCH + TAU) % TAU;
  const word = S.omega === 0 ? (S.holes.length > 1 ? "seam done" : "ready") : psi < C.RELEASE - C.CATCH ? "loop on the hook" : k.lift > 0.5 ? "feeding" : k.tip < C.BT ? "needle down" : "needle up";
  const n = Math.max(0, S.holes.length - 1);
  const text = word + " · " + Math.round(S.omega * C.SPM) + " stitches/min · " + n + " stitch" + (n === 1 ? "" : "es") + " · " + n * C.SL + " mm sewn";
  if (readout.textContent !== text) readout.textContent = text;
}
const DONE = [
  () => S.swap < 0 && S.stepT > 0.2,
  () => S.th - S.cyc >= 1.3,
  () => S.th - S.cyc >= Math.PI,
  () => S.th - S.cyc >= C.CATCH + 0.2,
  () => S.th - S.cyc >= C.CATCH + 1.2,
  () => S.th - S.cyc >= C.FEED[2],
  () => S.holes.length >= S.h0 + 11,
  () => S.omega === 0 && S.stepT > 0.6,
];
const snap = () => JSON.parse(JSON.stringify(S));
function enter(i, how) {
  if (i === 0) { S.run = false; S.brake = -1; if (how === "loop") S.swap = 0; }
  if (i === 1) { S.run = true; S.cyc = S.th; }
  if (i === 6) S.h0 = S.holes.length;
  if (i === 7) { S.run = false; S.brake = TAU * Math.ceil((S.th + 3.6) / TAU); }
  S.focus = FOCUS[i]; S.stepT = 0;
  draw();
}
STEPS.mountSteps({
  root: document.querySelector("[data-steps]"), svg, stage, steps: STEP_INFO, views: VIEWS, colors: COLORS, size: [${WIDTH}, ${HEIGHT}],
  enter, update: (dt) => { step(dt); draw(); }, done: (i) => DONE[i](), advance: step, draw, save: snap,
  load: (x) => { Object.assign(S, JSON.parse(JSON.stringify(x))); lastPose = {}; },
});
`;
