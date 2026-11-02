// The page script: the live model, the drawing and the run. Every function it needs is inlined as source.
import { clamp, kin, turn, prismY, prismZ, notchRing, capTop, capOutline, capZ } from "./model.mjs";
import { tools } from "./tools.mjs";
import { magazine } from "./mag.mjs";
import { cap } from "./cap.mjs";
import { dynamic, poses } from "./head.mjs";

export function pageScript({ P, C, ROO, PIP, STEPS, views, FRESH, WIDTH, HEIGHT }) {
  const fns = [clamp, kin, turn, prismY, prismZ, notchRing, capTop, capOutline, capZ, tools, magazine, cap, dynamic, poses].map((f) => f.toString()).join("\n");
  return `
const P = ${JSON.stringify(P)};
const C = ${JSON.stringify(C)};
const ROO = ${JSON.stringify(ROO)}, PIP = ${JSON.stringify(PIP)};
const STEP_INFO = ${JSON.stringify(STEPS.map(({ title, text, who, hold, pace }) => ({ title, text, who, hold, pace })))};
const VIEWS = ${JSON.stringify(views.map((v) => v.map((n) => +n.toFixed(2))))};
const COLORS = ${JSON.stringify(STEPS.map((s) => s.color))};
const K = { iso, pathOf, extrude, segment, ringSeam, depthOf, solidSvg, lineSvg, dotsSvg, ...CREW };
${fns}
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const part = (name) => svg.querySelector('[data-part="' + name + '"]');
const el = { leaf: part("leaf"), paper: part("paper"), stapleOut: part("staple-out"), capBack: part("cap-back"), mag: part("mag"), capFront: part("cap-front"), roo: part("roo"), pip: part("pip") };
const readout = document.querySelector("[data-readout]");
const FRESH = ${JSON.stringify(FRESH)};
const S = { ...FRESH };
let lastPose = {}, lastKey = "";
function step(dt) {
  S.stepT += dt;
  const po = S.paperO;
  S.paperO += (S.paperT - S.paperO) * (1 - Math.exp(-dt / 0.5));
  if (Math.abs(S.paperO - S.paperT) < 0.02) S.paperO = S.paperT;
  const p0 = S.p;
  // The legs push through the notes and fold against the anvil, so the drive goes slower than the swing.
  const vmax = S.p > C.GAP + 0.25 && S.pT > S.p ? 2.4 : 22;
  const v = Math.max(-22, Math.min(vmax, (S.pT - S.p) * 4.5));
  S.p += v * dt;
  if (Math.abs(S.p - S.pT) < 0.01) S.p = S.pT;
  S.pressing = S.p > p0 + 1e-4;
  S.lifting = S.p < p0 - 1e-4;
  const kk = kin(C, S);
  if (kk.d > 0 && !S.driven) { S.driven = true; S.n -= 1; S.g = 0; S.dd = 0; }
  if (S.driven) S.dd = Math.max(S.dd, kk.d);
  const g0 = S.g;
  if (S.driven && kk.b > 6.4 && S.g < 1) S.g = Math.min(1, S.g + dt / 0.9);
  S.hop = S.p < p0 - 1e-4 && S.p < C.GAP ? Math.min(1, (p0 - S.p) / Math.max(dt, 1e-3) / 18) : S.hop * Math.exp(-dt / 0.15);
  if (S.hop < 0.01) S.hop = 0;
  const dp = Math.abs(S.p - p0) / Math.max(dt, 1e-3);
  S.duty = S.g > g0 ? "pip" : dp > 0.3 ? "roo" : "";
  if (S.swap >= 0) {
    S.swap += dt / 0.8;
    if (S.swap >= 0.5 && S.driven) { S.driven = false; S.dd = 0; }
    S.fade = Math.abs(Math.cos(Math.PI * Math.min(1, S.swap)));
    if (S.swap >= 1) { S.swap = -1; S.fade = 1; }
  }
}
function paint(name, node, spec, pose, duty) {
  const key = JSON.stringify(pose) + duty;
  if (lastPose[name] === key) return;
  lastPose[name] = key;
  CREW.paintCritter(node, CREW.critter(spec, pose, P));
  node.toggleAttribute("data-duty", duty);
}
function draw() {
  const key = [S.p, S.paperO, S.g, S.n, S.dd, S.driven, S.duty, S.fade].map((x) => typeof x === "number" ? x.toFixed(3) : x).join("|");
  let D;
  if (key !== lastKey) {
    lastKey = key;
    D = dynamic(K, P, C, S);
    el.leaf.innerHTML = D.leaf; el.paper.innerHTML = D.paper; el.stapleOut.innerHTML = D.stapleOut;
    el.capBack.innerHTML = D.capBack; el.mag.innerHTML = D.mag; el.capFront.innerHTML = D.capFront;
    el.paper.style.opacity = el.stapleOut.style.opacity = S.fade.toFixed(3);
  } else D = { k: kin(C, S), follower: draw.follower };
  draw.follower = D.follower;
  const p = poses(C, S, D);
  paint("roo", el.roo, ROO, p.roo, S.duty === "roo");
  paint("pip", el.pip, PIP, p.pip, S.duty === "pip");
  const kk = D.k;
  const word = S.swap >= 0 ? "new notes" : S.duty === "pip" ? "feeding" : kk.d > 0 && S.pressing ? (kk.d > 2 ? "clinching" : "driving") : S.pressing ? "pressing" : S.lifting ? "lifting" : S.p >= C.GAP + C.B0 - 0.01 ? "clinched" : S.p > 0 ? "holding" : S.paperO > 0 && S.paperO < C.OUT ? (S.paperT === 0 ? "notes going in" : "notes coming out") : S.driven ? "stapled" : "ready";
  const text = word + " · head down " + S.p.toFixed(1) + " of " + (C.GAP + C.B0).toFixed(1) + " mm · " + S.n + " staples";
  if (readout.textContent !== text) readout.textContent = text;
}
const DONE = [
  () => S.swap < 0 && S.stepT > 0.4,
  () => S.paperO < 0.01,
  () => S.p >= C.GAP + 0.3,
  () => kin(C, S).d >= 2.0,
  () => kin(C, S).d >= C.ZS - C.ZP - C.WIRE - 0.01,
  () => S.g >= 1 && S.stepT > 0.6,
  () => S.p === 0 && S.hop === 0,
  () => S.paperO >= C.OUT - 0.01 && S.stepT > 1,
];
const snap = () => JSON.parse(JSON.stringify(S));
function enter(i, how) {
  if (i === 0) Object.assign(S, { ...FRESH, n: S.n, driven: how === "loop" ? S.driven : false, dd: how === "loop" ? S.dd : 0, swap: how === "loop" ? 0 : -1 });
  if (i === 1) S.paperT = 0;
  if (i === 2) S.pT = C.GAP + C.B0;
  if (i === 5) S.pT = C.GAP + 0.15;
  if (i === 6) S.pT = 0;
  if (i === 7) S.paperT = C.OUT;
  S.stepT = 0;
  draw();
}
STEPS.mountSteps({
  root: document.querySelector("[data-steps]"),
  svg, stage, steps: STEP_INFO, views: VIEWS, colors: COLORS, size: [${WIDTH}, ${HEIGHT}],
  enter, update: (dt) => { step(dt); draw(); }, done: (i) => DONE[i](), advance: step, draw,
  save: snap, load: (x) => { Object.assign(S, JSON.parse(JSON.stringify(x))); lastPose = {}; lastKey = ""; },
});
`;
}
