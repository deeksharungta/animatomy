import { WIDTH, HEIGHT, C, P, OLLIE, EMBER, CRUMB } from "./model.mjs";
import { dynamic, poses } from "./moving.mjs";
import { STEPS, views, rest } from "./story.mjs";
import { HEAT, STEAM, HEAT_BOX, VENT } from "./shaders.mjs";
import { glCamera } from "../../kit/gl.mjs";
import { CUP_TOP } from "./upper.mjs";

// The page script, part one: the numbers, and the model that heats, pumps and pours.
export const MODEL_SCRIPT = `
const P = ${JSON.stringify(P)};
const C = ${JSON.stringify(C)};
const OLLIE = ${JSON.stringify(OLLIE)}, EMBER = ${JSON.stringify(EMBER)}, CRUMB = ${JSON.stringify(CRUMB)};
const STEP_INFO = ${JSON.stringify(STEPS.map(({ title, text, who, hold, pace }) => ({ title, text, who, hold, pace })))};
const VIEWS = ${JSON.stringify(views.map((v) => v.map((n) => +n.toFixed(2))))};
const COLORS = ${JSON.stringify(STEPS.map((s) => s.color))};
const CAMERA = ${JSON.stringify(glCamera(P))};
const HEAT = ${JSON.stringify(HEAT)}, STEAM = ${JSON.stringify(STEAM)};
const HEAT_BOX = ${JSON.stringify(HEAT_BOX)}, VENT = ${JSON.stringify(VENT)}, CUP = [${C.G[0]}, ${C.G[1]}, ${CUP_TOP - 2}];
const SIZE = [${WIDTH}, ${HEIGHT}];
const K = { iso, pathOf, segment, ring, cylinder, solidSvg, lineSvg, dotsSvg, translateAlong, ...CREW };
const dynamic = ${dynamic.toString()};
const poses = ${poses.toString()};
const REST = ${JSON.stringify(rest())};
const S = { ...REST, hold: false, pump: false };
// Model seconds per real second, beat by beat: the boiler takes four minutes to heat, the shot about 28 s.
const WARP = [1, 60, 0.5, 1, 3, 1, 1];
let beat = 0;
const ease = (v, to, tau, dt) => v + (to - v) * (1 - Math.exp(-dt / tau));
function step(dt) {
  const w = WARP[beat] * dt;
  S.stepT += dt;
  S.clock += w;
  const sw0 = S.sw, lift0 = S.lift;
  S.sw = ease(S.sw, S.hold ? 1 : 0, 0.16, dt);
  if (Math.abs(S.sw - (S.hold ? 1 : 0)) < 0.003) S.sw = S.hold ? 1 : 0;
  S.heat = ease(S.heat, S.sw > 0.5 ? 1 : 0, S.sw > 0.5 ? 0.7 : 0.9, dt);
  if (S.heat < 0.003) S.heat = 0;
  if (S.sw > 0.5) S.T = Math.min(C.TSET, S.T + 0.3 * w);
  // The thermostat snaps at the set point and knocks the switch back out of Ember's paws.
  if (S.T >= C.TSET && S.hold) S.hold = false;
  S.amp = ease(S.amp, S.pump ? 1 : 0, 0.25, dt);
  if (!S.pump && S.amp < 0.01) S.amp = 0;
  S.ph += Math.PI * 2 * 2.2 * dt * S.amp;
  const n = Math.max(1, Math.ceil(w / 0.01)), h = w / n;
  for (let i = 0; i < n; i++) {
    const q = S.pump ? 8 * Math.max(0, 1 - S.p / C.PMAX) * S.amp : 0;
    if (S.head < 1) { S.head = Math.min(1, S.head + (q * h) / 4); S.p = 0.6 * S.head * S.amp; continue; }
    const puck = 0.148 * S.p, opv = S.p > C.OPV_P ? 4 * (S.p - C.OPV_P) : 0;
    S.p = Math.max(0, S.p + ((q - puck - opv) / 0.6) * h);
    if (!S.pump) S.p *= Math.exp(-h / 0.15);
    S.flow = puck;
    S.g += puck * 0.95 * h;
    S.T = Math.max(88, S.T - 0.05 * puck * h);
  }
  if (!S.pump && S.p < 0.05) { S.p = 0; S.flow = 0; }
  if (S.pump) S.shotT += w;
  if (S.g >= C.SHOT && S.pump) { S.pump = false; S.puff = 0; }
  S.puff += dt;
  S.lift = ease(S.lift, Math.max(0, Math.min(1, (S.p - 8.6) / 0.5)), 0.12, dt);
  if (S.lift < 0.003) S.lift = 0;
  S.steam = ease(S.steam, S.g > 2 ? Math.min(1, S.g / 20) : 0, 1.5, dt);
  const dsw = Math.abs(S.sw - sw0) / Math.max(dt, 1e-3), dl = Math.abs(S.lift - lift0) / Math.max(dt, 1e-3);
  const rising = S.lift > lift0;
  S.duty = dl > 0.4 && rising ? "crumb" : S.amp > 0.3 || (!S.pump && S.p > 0.3) ? "ollie" : dsw > 0.3 || (S.heat > 0.5 && S.T < C.TSET) ? "ember" : "";
  if (S.swap >= 0) {
    S.swap += dt / 0.8;
    if (S.swap >= 0.5 && S.g > 0) { S.g = 0; S.steam = 0; S.T = C.T0; S.head = 0; S.shotT = 0; S.clock = 0; }
    S.fade = Math.abs(Math.cos(Math.PI * Math.min(1, S.swap)));
    if (S.swap >= 1) { S.swap = -1; S.fade = 1; }
  }
}
`;
