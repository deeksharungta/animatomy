import { STEAM, HYDROGEN, BUS } from "./flows-glsl.mjs";
import { WINDINGS, COOLING } from "./flows-glsl2.mjs";

// The page script, the flows: one canvas per slot in the painter's order, each driven by the model. Every level
// rides an envelope with an attack and a decay, and every flow's travel is integrated here, so a change of speed
// never jumps the pattern. Without WebGL the same levels and travel drive the SVG fallback's dashed strokes.
export const FLOW_SCRIPT = `
const FLOWS = ${JSON.stringify({ bus: BUS, lp: STEAM, gen: HYDROGEN, xw: WINDINGS, cool: COOLING })};
const FLOW_UNI = ["uAmp", "uPh", "uTemp", "uAmp2", "uPh2", "uTemp2"];
const LIGHT = stage.closest("[data-theme]")?.getAttribute("data-theme") === "light" ? 1 : 0;
const flowGL = {};
for (const n of Object.keys(FLOWS)) {
  const cv = stage.querySelector(".pg-flow-" + n);
  flowGL[n] = cv && glLayer({ canvas: cv, fragment: FLOWS[n], view: SIZE, camera: CAMERA, uniforms: FLOW_UNI, fixed: { uLight: LIGHT }, maxRatio: 1.25 });
}
const I_FULL = (C.MW * 1e6) / (Math.sqrt(3) * C.HV_KV * 1e3);
const fenv = { steam: 0, h2: 0, warm: 0, oil: 0, air: 0, cur: 0, oilT: 0.55, pumpT: 0, steamT: 0.82 };
const ph = { steam: 0, h2: 0, oil: 0, air: 0, cur: 0 };
const fbEl = Object.fromEntries(["steam", "h2", "bus", "oil", "rad", "wind", "cur"].map((n) => [n, part("fb-" + n)]));
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const ease = (k, to, up, down, dt) => { fenv[k] = still.matches ? to : fenv[k] + (to - fenv[k]) * (1 - Math.exp(-dt / (to > fenv[k] ? up : down))); if (Math.abs(fenv[k] - to) < 1e-4) fenv[k] = to; };
// What each flow is, from the model: steam by the valve's lift, hydrogen by the rotor's fans (speed), oil by the
// pump and, before it starts, by the top oil's own warmth, air by the fans, current by the amps on the line.
function flowTargets() {
  const lift = clamp01(S.lift), warm = clamp01((S.top - C.AMB - 3) / 25);
  return {
    steam: clamp01(lift / 0.03) * (0.35 + 0.65 * Math.sqrt(lift)), h2: clamp01(S.f / 50), warm: clamp01(Math.hypot(S.P, S.Q) / C.MVA),
    oil: Math.max(S.pump, 0.45 * warm), air: S.pump, cur: Math.min(1.2, ampsHV() / I_FULL),
    oilT: 0.55 + 0.33 * clamp01((S.top - C.AMB) / 45), pumpT: S.pump, steamT: 0.82 + 0.13 * lift,
  };
}
function paintFlows(dt, cam, t) {
  const to = flowTargets();
  for (const k of ["steam", "h2", "oil", "air"]) ease(k, to[k], 0.35, 0.6, dt);
  ease("cur", to.cur, 0.15, 0.1, dt);
  for (const k of ["warm", "oilT", "pumpT", "steamT"]) ease(k, to[k], 0.5, 0.5, dt);
  if (!still.matches) {
    ph.steam += dt * (5 + 200 * (fenv.steamT - 0.82)); ph.h2 += dt * (3 + 10 * fenv.h2); ph.oil += dt * (1.5 + 6 * fenv.oil);
    ph.air += dt * (4 + 14 * fenv.air); ph.cur += dt * (6 + 16 * Math.min(1, fenv.cur));
  }
  const u = {
    bus: [fenv.cur, ph.cur, 0, 0, 0, 0], lp: [fenv.steam, ph.steam, fenv.steamT, 0, 0, 0], gen: [fenv.h2, ph.h2, fenv.warm, 0, 0, 0],
    xw: [fenv.oil, ph.oil, fenv.oilT, 0, 0, fenv.pumpT], cool: [fenv.oil, ph.oil, fenv.oilT, fenv.air, ph.air, 0],
  };
  for (const n of Object.keys(u)) {
    const L = flowGL[n], v = u[n];
    if (!L) continue;
    if (v[0] + v[3] > 0.002) L.draw({ ...cam, uAmp: v[0], uPh: v[1], uTemp: v[2], uAmp2: v[3], uPh2: v[4], uTemp2: v[5] }, t);
    else L.clear();
  }
  // The fallback: each group's opacity is its flow's level, its dashes run with its phase.
  const fb = { steam: [fenv.steam, ph.steam], h2: [fenv.h2, ph.h2], bus: [fenv.cur, ph.cur], oil: [fenv.oil, ph.oil], rad: [fenv.oil, ph.oil], wind: [fenv.air, ph.air], cur: [fenv.cur, ph.cur] };
  for (const [n, [a, p]] of Object.entries(fb)) {
    const g = fbEl[n];
    if (!g) continue;
    g.style.opacity = Math.min(1, a * 1.2).toFixed(3);
    g.style.strokeDashoffset = (-p * 0.6).toFixed(2);
  }
}
`;
