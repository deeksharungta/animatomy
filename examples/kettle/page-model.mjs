import { WIDTH, HEIGHT, C, P, ROO, VOLTA, MO, CRUMB } from "./model.mjs";
import { dynamic, poses } from "./moving.mjs";
import { STEPS, views, rest } from "./story.mjs";
import { STEAM, SPOUT, CUP } from "./shaders.mjs";
import { glCamera } from "../../kit/gl.mjs";

// The page script, part one: the numbers, and the model that heats, boils, trips and boils dry.
// One model drives both halves of the story; the only thing the "break it" half changes is that Mo is asleep,
// so his disc cannot snap. Everything that follows (the water boiling away, the plate overheating,
// the boil-dry cut-out) comes out of the same equations.
export const MODEL_SCRIPT = `
const P = ${JSON.stringify(P)};
const C = ${JSON.stringify(C)};
const ROO = ${JSON.stringify(ROO)}, VOLTA = ${JSON.stringify(VOLTA)}, MO = ${JSON.stringify(MO)}, CRUMB = ${JSON.stringify(CRUMB)};
const STEP_INFO = ${JSON.stringify(STEPS.map(({ title, text, who, hold, pace }) => ({ title, text, who, hold, pace })))};
const VIEWS = ${JSON.stringify(views.map((v) => v.map((n) => +n.toFixed(2))))};
const COLORS = ${JSON.stringify(STEPS.map((s) => s.color))};
const CAMERA = ${JSON.stringify(glCamera(P))};
const STEAM = ${JSON.stringify(STEAM)}, SPOUT = ${JSON.stringify(SPOUT)}, CUP = ${JSON.stringify(CUP)};
const SIZE = [${WIDTH}, ${HEIGHT}];
const K = { iso, pathOf, solidSvg, lineSvg, dotsSvg, extrude, ...CREW };
const dynamic = ${dynamic.toString()};
const poses = ${poses.toString()};
const REST = ${JSON.stringify(rest())};
const S = { ...REST };
// Model seconds per real second, beat by beat: a litre takes almost three minutes to boil, eighteen to boil away.
const WARP = [1, 1, 40, 2, 1, 20, 90, 2, 1];
let beat = 0;
const ease = (v, to, tau, dt) => v + (to - v) * (1 - Math.exp(-dt / tau));
function step(dt) {
  const w = WARP[beat] * dt;
  S.stepT += dt;
  S.clockB += dt;
  const rock0 = S.rock, snap0 = S.snap, dry0 = S.dry, Td0 = S.Td, plate0 = S.plateT;
  S.rock = ease(S.rock, S.want, S.want ? 0.07 : 0.14, dt);
  if (Math.abs(S.rock - S.want) < 0.002) S.rock = S.want;
  const closed = S.rock < 0.5 && !S.bdOpen;
  S.current = ease(S.current, closed ? 1 : 0, 0.08, dt);
  if (S.current < 0.003) S.current = 0;
  if (closed) S.clock += w;
  // Heat, in small model steps: the element's power goes into the water while the plate is wet, into the plate when dry.
  const n = Math.max(1, Math.ceil(w / 0.05)), h = w / n;
  let evap = 0;
  for (let i = 0; i < n; i++) {
    const power = closed ? C.POWER * C.EFF : 0, wet = Math.max(0, Math.min(1, S.g / 15));
    const toWater = power * wet + (S.g > 0 ? Math.max(0, S.plateT - S.T) * 4 * wet : 0);
    if (S.g > 0 && S.T < 100) S.T = Math.min(100, S.T + (toWater * h) / (S.g * C.CP));
    else if (S.g > 0) { const e = Math.min(S.g, (toWater / C.LATENT) * h); S.g -= e; S.lost += e; evap += e / Math.max(h * n, 1e-6); }
    if (!closed && S.g > 0) S.T -= ((S.T - C.T0) / C.COOL_TAU) * h;
    const plateIn = power * (1 - wet) - (S.plateT - C.T0) * 1.2 - (S.g > 0 ? Math.max(0, S.plateT - S.T) * 4 * wet : 0);
    S.plateT = wet > 0.999 ? S.T + (closed ? 6 : 0) : S.plateT + (plateIn * h) / C.C_PLATE;
    // Mo's disc follows the steam that reaches it; it resets once it has cooled.
    S.Td += ((S.T >= 99.9 && S.steam > 0.25 ? 100 : 25 + 0.2 * (S.T - 20)) - S.Td) * (1 - Math.exp(-h / (S.T >= 99.9 && S.steam > 0.25 ? 4 : 40)));
    if (!S.snapped && S.Td >= C.SNAP && !S.asleep) { S.snapped = true; S.want = 1; }
    if (S.snapped && S.Td < C.RESET) S.snapped = false;
    if (!S.bdOpen && S.plateT >= C.DRY_TRIP) S.bdOpen = true;
    if (S.bdOpen && S.plateT < 90) S.bdOpen = false;
  }
  S.steam = ease(S.steam, evap + (S.T > 80 && S.g > 0 ? 0.04 * (S.T - 80) / 20 : 0), 0.4, dt);
  S.snap = ease(S.snap, S.snapped ? 1 : 0, S.snapped ? 0.05 : 0.6, dt);
  S.dry = ease(S.dry, S.bdOpen ? 1 : 0, S.bdOpen ? 0.05 : 0.8, dt);
  S.boil = ease(S.boil, S.T >= 99.9 && closed && S.g > 3 ? 1 : 0, 0.3, dt);
  S.fizz = ease(S.fizz, closed && S.T > 70 && S.g > 3 ? Math.min(1, (S.T - 70) / 25) : 0, 0.4, dt);
  S.haze = ease(S.haze, S.boil > 0.5 && beat >= 5 ? Math.min(1, S.lost / 500) : 0, 1.5, dt);
  S.warm = Math.max(0, Math.min(1, (S.Td - 30) / 65));
  S.hop = Math.max(0, S.hop - dt * 2.5);
  if (S.want === 1 && S.rock < 0.7 && S.rock > rock0 + 1e-4) S.hop = 1;
  const rate = (a, b) => Math.abs(a - b) / Math.max(dt, 1e-3);
  S.duty = rate(S.dry, dry0) > 0.3 || (S.g < 15 && closed && (S.plateT - plate0) / Math.max(w, 1e-3) > 1) ? "crumb"
    : rate(S.snap, snap0) > 0.3 || (!S.asleep && !S.snapped && (S.Td - Td0) / Math.max(w, 1e-3) > 1.5) ? "mo"
    : rate(S.rock, rock0) > 0.3 ? "roo" : S.current > 0.5 ? "volta" : "";
  if (S.swap >= 0) {
    S.swap += dt / 0.8;
    if (S.swap >= 0.5 && S.g < C.FILL) Object.assign(S, { g: C.FILL, T: C.T0, plateT: C.T0, Td: C.T0, lost: 0, clock: 0, haze: 0, snapped: false, bdOpen: false });
    S.fade = Math.abs(Math.cos(Math.PI * Math.min(1, S.swap)));
    if (S.swap >= 1) { S.swap = -1; S.fade = 1; }
  }
}
`;
