// The page script: the mill's model (knob, head, flutes, cracks, the cone's kick, the falling pepper), the drawing,
// and the run. Everything the model computes comes from the same constants the build draws with.
import { C, P, WIDTH, HEIGHT, CHOMP, ROO } from "./model.mjs";
import { STEPS, VIEWS, FOCUS } from "./story.mjs";
import { dynamic } from "./dynamic.mjs";
import { poses } from "./poses.mjs";

export const liveScript = () => `
const P = ${JSON.stringify(P)}, C = ${JSON.stringify(C)};
const SPEC = ${JSON.stringify({ chomp: CHOMP, roo: ROO })};
const STEP_INFO = ${JSON.stringify(STEPS.map(({ title, text, who, hold, pace }) => ({ title, text, who, hold, pace })))};
const VIEWS = ${JSON.stringify(VIEWS.map((v) => v.map((n) => +n.toFixed(2))))};
const COLORS = ${JSON.stringify(STEPS.map((s) => s.color))};
const FOCUS = ${JSON.stringify(FOCUS)};
const K = { iso, pathOf, depthOf, dotsSvg, solidSvg, lineSvg, fadedSvg, ...CREW };
const dynamic = ${dynamic.toString()};
const poses = ${poses.toString()};
const stage = document.querySelector(".iso-stage"), svg = stage.querySelector("svg");
const part = (n) => svg.querySelector('[data-part="' + n + '"]');
const el = {};
for (const n of ["pile", "frags", "corns-back", "corns-front", "shaft-low", "shaft-mid", "shaft-high", "cone-body", "balls", "race", "dust-back", "dust-front", "head-ribs", "knob-ribs", "pin", "pointer", "yoke", "tip", "knob", "chomp", "roo"]) el[n] = part(n);
const readout = document.querySelector("[data-readout]");
const TAU = Math.PI * 2, DEG = 180 / Math.PI;
const rnd = (() => { let seed = 11; return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; })();
const fresh = () => ({ s: 0, sT: 0, ds: 0, kick: 0, kv: 0, phi: 1.2, omega: 0, wT: 0, knob: 0, flutes: [0, 1, 2].map(() => ({ has: true, grow: 1 })), frags: [], dust: [], credit: 0, pile: 0.15, grams: 0, corns: 0, beat: 0, bite: 0, idle: 0, t: 0, near: false, lit: "", duty: "", focus: "", stepT: 0 });
const S = fresh();
const coneR = (u) => { const T = C.CONE; for (let i = 1; i < T.length; i++) if (u <= T[i][0]) return T[i - 1][1] + ((T[i][1] - T[i - 1][1]) * (u - T[i - 1][0])) / (T[i][0] - T[i - 1][0]); return T[T.length - 1][1]; };
const passed = (a0, a1, mark) => { const n = Math.ceil((a1 - mark) / 360); return a1 < mark + 360 * n && mark + 360 * n <= a0; };
function step(dt) {
  S.t += dt; S.stepT += dt;
  const s0 = S.s;
  S.s += (S.sT - S.s) * (1 - Math.exp(-dt / 0.9));
  if (Math.abs(S.s - S.sT) < 0.01) S.s = S.sT;
  S.ds = (S.s - s0) / Math.max(dt, 1e-3);
  S.knob = -(S.s / C.LIFT) * C.TURNS * TAU;
  S.omega += (S.wT - S.omega) * (1 - Math.exp(-dt / 0.45));
  if (S.wT === 0 && S.omega < 0.01) S.omega = 0;
  if (S.wT === 1 && S.omega > 0.995) S.omega = 1;
  const p0 = S.phi;
  S.phi -= S.omega * C.SPIN * TAU * dt;
  const zcb = C.CONE_Z + S.s - S.kick;
  S.near = false;
  for (let i = 0; i < C.FLUTES; i++) {
    const f = S.flutes[i], a0 = p0 * DEG + i * 120, a1 = S.phi * DEG + i * 120;
    if (f.has && f.grow < 1) f.grow = Math.min(1, f.grow + dt * 2.2);
    if (f.has && passed(a0 + 25, a1 + 25, C.CRACK_A)) S.near = true;
    if (f.has && f.grow >= 1 && passed(a0, a1, C.CRACK_A)) {
      f.has = false; S.corns++; S.grams += C.GRAM; S.beat++; S.bite = 1; S.kv += 75;
      const r = coneR(C.CORN_U) + C.CORN_R, a = C.CRACK_A / DEG;
      for (let j = 0; j < 4; j++) S.frags.push({ x: r * Math.cos(a), y: r * Math.sin(a), z: zcb + C.CORN_U, vz: 10 + 20 * rnd(), spin: rnd() * 6, size: 2 + rnd(), a: a + (j - 1.5) * 0.12 });
    } else if (!f.has && passed(a0, a1, C.REFILL_A)) { f.has = true; f.grow = 0; }
  }
  S.kv += (-256 * S.kick - 32 * S.kv) * dt; S.kick += S.kv * dt;
  if (S.kick < 0) { S.kick = 0; S.kv = Math.max(0, S.kv); }
  if (S.kick < 0.005 && Math.abs(S.kv) < 0.05) { S.kick = 0; S.kv = 0; }
  S.bite = Math.max(0, S.bite - dt * 2.4);
  for (const c of S.frags) {
    c.vz -= 220 * dt; c.z += c.vz * dt; c.spin += dt * 4;
    const r = coneR(c.z - zcb) + 2.5; c.x = r * Math.cos(c.a); c.y = r * Math.sin(c.a);
  }
  const gone = S.frags.filter((c) => c.z < C.RING.z1 - 10).length;
  if (gone) { S.frags = S.frags.filter((c) => c.z >= C.RING.z1 - 10); S.credit += gone * 9; }
  while (S.credit >= 1 && rnd() < dt * 60) {
    S.credit -= 1;
    const a = rnd() * TAU, r = 27.5 + rnd() * 1.5, x = r * Math.cos(a), y = r * Math.sin(a);
    S.dust.push({ x, y, z: C.RING.z0 - 2, vz: -10 - 10 * rnd(), front: (x + y) * 0.707 > 2 });
  }
  const top = C.Z0 + 2 + 9 * Math.min(1, S.pile);
  for (const d of S.dust) { d.vz -= 260 * dt; d.z += d.vz * dt; }
  const landed = S.dust.filter((d) => d.z <= top).length;
  if (landed) { S.dust = S.dust.filter((d) => d.z > top); S.pile = Math.min(1, S.pile + landed * 0.0016); }
  const moving = { chomp: S.omega > 0.2, roo: Math.abs(S.ds) > 0.12 || S.omega > 0.2 };
  S.duty = S.focus && moving[S.focus] ? S.focus : "";
  S.lit = S.duty ? "" : "cone";
  S.idle = S.omega > 0.05 || Math.abs(S.ds) > 0.05 ? 0 : S.idle + dt;
}
let lastPose = {};
function paintCrew(name, pose, on) {
  const key = JSON.stringify(pose) + on;
  if (lastPose[name] === key) return;
  lastPose[name] = key;
  CREW.paintCritter(el[name], CREW.critter(SPEC[name], pose, P));
  CREW.setDuty(el[name], on);
}
const shift = (dz) => translateAlong(P, [0, 0, dz]);
function draw() {
  const D = dynamic(K, P, C, S);
  for (const [n, k] of [["frags", "frags"], ["corns-back", "cornsBack"], ["corns-front", "cornsFront"], ["shaft-low", "shaftLow"], ["shaft-mid", "shaftMid"], ["shaft-high", "shaftHigh"], ["cone-body", "cone"], ["balls", "balls"], ["dust-back", "dustBack"], ["dust-front", "dustFront"], ["head-ribs", "headRibs"], ["knob-ribs", "knobRibs"], ["pin", "pin"], ["pointer", "pointer"]]) el[n].innerHTML = D[k];
  if (Math.abs((el.pile.__h ?? -1) - D.pileH) > 0.08) { el.pile.innerHTML = D.pile; el.pile.__h = D.pileH; }
  el.yoke.setAttribute("transform", shift(S.s));
  el.race.setAttribute("transform", shift(S.s - S.kick));
  el.tip.setAttribute("transform", shift(S.s));
  const q = poses(C, S);
  paintCrew("chomp", q.chomp, S.duty === "chomp");
  paintCrew("roo", q.roo, S.duty === "roo");
  const gap = (C.GAP0 - C.TAPER * (S.s - S.kick)) / 2;
  const text = "gap " + gap.toFixed(2) + " mm · " + S.corns + (S.corns === 1 ? " corn · " : " corns · ") + S.grams.toFixed(2) + " g";
  if (readout.textContent !== text) readout.textContent = text;
}
const DONE = [
  () => S.stepT > 0.2,
  () => S.s === S.sT && S.stepT > 0.4,
  () => S.omega > 0.97 && S.stepT > 1,
  () => S.beat >= 3,
  () => S.beat >= 3,
  () => S.beat >= 3 && S.stepT > 1.5,
  () => S.omega === 0 && S.s === 0 && S.frags.length === 0 && S.dust.length === 0 && S.kick === 0,
];
const snap = () => JSON.parse(JSON.stringify(S));
function enter(i, how) {
  if (i === 0) { const keep = { phi: S.phi, pile: S.pile, flutes: S.flutes }; Object.assign(S, fresh(), how === "loop" ? keep : {}); }
  if (i === 1) S.sT = C.LIFT;
  if (i === 2) S.wT = 1;
  if (i === 6) { S.wT = 0; S.sT = 0; }
  S.focus = FOCUS[i]; S.stepT = 0; S.beat = 0;
  draw();
}
STEPS.mountSteps({
  root: document.querySelector("[data-steps]"), svg, stage, steps: STEP_INFO, views: VIEWS, colors: COLORS, size: [${WIDTH}, ${HEIGHT}],
  enter, update: (dt) => { step(dt); draw(); }, done: (i) => DONE[i](), advance: step, draw, save: snap,
  load: (x) => { Object.assign(S, JSON.parse(JSON.stringify(x))); lastPose = {}; },
});
`;
