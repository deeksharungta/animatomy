import { fitView } from "../../kit/steps.mjs";
import { checkReach, checkWork } from "../../kit/reach.mjs";
import { WIDTH, HEIGHT, C, P, K, at, ROO, PINCH, ROCKY, ROLE } from "./model.mjs";
import * as M from "./mech.mjs";
import { partsKit, drawn } from "./moving.mjs";
import { poses } from "./poses.mjs";

export const Q = partsKit(K, P);
// At rest the barrel's hook, with Roo on it, is at the bottom.
export const rest = () => ({ aA: 1.3 + Math.PI / 2, W: C.PH.W0 ?? C.PH.Ws, windT: -1, keyV: 0, back: 0, backV: 0, brake: 0, brakeOff: false, brakeV: 0, v: 0, vMax: 0, D: 0, roll: 0, stepT: 0, duty: "", focus: "", lit: "barrel" });
export const draw0 = (S) => drawn(K, P, C, S, Q, M);
export const pose = (S) => { const D = draw0(S); return poses(C, S, D, M.anglesOf(S)); };

// The whole run, simulated once: how far the car goes and its top speed, for the captions and the loop.
export function simulate() {
  const S = rest();
  S.windT = C.PH.full;
  for (let i = 0; i < 4000 && (S.windT > 0 || S.back > 0); i++) M.stepModel(S, 0.01, C);
  const wound = S.W;
  S.brakeOff = true;
  let t = 0;
  for (let i = 0; i < 60000 && (S.v > 0 || t < 1); i++, t += 0.005) M.stepModel(S, 0.005, C);
  return { D: S.D, vMax: S.vMax, t, Wend: S.W, wound };
}
export const RUN = simulate();
C.PH.W0 = RUN.Wend;
C.WORLD.period = (RUN.D * 1000) / Math.max(1, Math.round((RUN.D * 1000) / 620));

// One loop simulated (wind, flick the tab, run, brake again): each critter's duty frames, while its own part moves.
function duties() {
  const S = rest(), R = C.CREW.roo, out = { roo: [], pinch: [], rocky: [] }, dt = 1 / 30;
  const foot = [C.BARREL.x, R.y, C.BARREL.z - (C.BARREL.drum - 0.8 - R.lug)];
  const phases = [["winding", () => (S.windT = C.PH.full), () => S.windT < 0 && S.back <= 0], ["running", () => (S.brakeOff = true), () => S.v <= 0 && S.D > 1], ["braking", () => (S.brakeOff = false), () => S.brake <= 0]];
  for (const [name, start, end] of phases) {
    start();
    for (let i = 0; i < 1200 && !(i > 3 && end()); i++) {
      M.stepModel(S, dt, C);
      const p = pose(S), D = draw0(S), tag = `${name} at ${(i * dt).toFixed(2)} s`;
      if (S.keyV > 0 || S.backV > 0) out.pinch.push([tag, p.pinch, D.clickTip]);
      if (Math.abs(S.brakeV) > 0.05) out.rocky.push([tag, p.rocky, D.shoe]);
      if (S.v > 0.01) out.roo.push([tag, p.roo, foot]);
    }
  }
  return out;
}

// Every paw lands, at rest and through every duty frame, and each critter's working end is at its point of work.
export function checks() {
  const R = rest(), still = [["at rest", R], ["wound, braked", { ...R, W: C.PH.full }], ["run down", { ...R, W: 0.3, brake: 1, D: 4 }]], F = duties();
  let reach = 0, work = 0;
  for (const [spec, key, end] of [[ROO, "roo", "feet"], [PINCH, "pinch", "paws"], [ROCKY, "rocky", "paws"]]) {
    const frames = F[key].map(([label, p]) => [label, p]), point = Object.fromEntries(F[key].map(([label, , w]) => [label, w]));
    reach += checkReach(spec, [...still.map(([label, S]) => [label, pose(S)[key]]), ...frames], P);
    work += checkWork(spec, frames, P, { end, work: (label) => point[label] });
  }
  return { reach, work, frames: Object.fromEntries(Object.entries(F).map(([k, v]) => [k, v.length])) };
}

const turns = (RUN.wound - RUN.Wend).toFixed(1), m = RUN.D.toFixed(1), top = RUN.vMax.toFixed(2);
export const TARGET = { wind: C.PH.full };
export const FOCUS = ["", "pinch", "rocky", "roo", "roo", "roo", "roo"];
const B = C.BARREL, Bk = C.BRAKE, Pn = C.CREW.pinch.at, Rk = C.CREW.rocky.at;
const car = [[-66, -34, 0], [66, -34, 0], [-66, 42, 0], [66, 42, 0], [-64, -33, 60], [64, -33, 30], [B.x, -17, B.z + B.drum + 8]];
const drum = [[B.x - 20, B.y1, B.z - 20], [B.x + 20, B.y1, B.z - 20], [B.x - 20, B.yT, B.z + 20], [B.x + 20, B.y1, B.z + 20]];
export const STEPS = [
  { title: "Meet the crew", who: "Roo, Pinch and Rocky", color: "var(--anatomy-hi)", text: "Inside the tin car: Roo is the mainspring, braced from the barrel wall's hook to the arbor; Pinch is the click on the key's ratchet; Rocky is the brake.", points: null, hold: 1.4 },
  { title: "You wind; Pinch's click ticks", who: "Pinch · holding", color: ROLE.holding, text: `You turn the key ${turns} turns and the arbor winds Roo tight. Each tooth lifts Pinch's click; his claws snap shut behind it, so the key can't spin back.`, points: [[B.x, 46, B.z], [Pn[0] + 8, Pn[1] + 4, Pn[2] - 2], [B.x - 10, 22, B.z + 10], [B.x, -8, B.z + 18], [B.x - 12, -8, B.z - 18]] },
  { title: "You flick the stop tab", who: "Rocky · holding", color: ROLE.holding, text: "Rocky pressed the brake's shoe on the drum while you wound. The tab under the car swings the lever, and he eases the shoe off.", points: [[Bk.end[0] + 2, -17, Bk.end[1] + 4], [Rk[0] + 6, -10, Rk[2] + 24], [Bk.stop[0] - 2, -18, 2], [B.x + 4, -8, B.z - 16], [Rk[0] + 8, -6, 8]] },
  { title: "Roo pushes the barrel round", who: "Roo · spring", color: ROLE.spring, text: "Pinch's click holds the arbor, so Roo's push goes into the wall's hook: his legs drive it round, and the barrel turns with him in it.", points: drum },
  { title: "Gears speed it up", who: "Roo · spring", color: ROLE.spring, text: "The barrel's 48 teeth turn a 12-leaf pinion; its 40-tooth wheel turns the axle's 10. Each barrel turn spins the wheels 16 times.", points: [[B.x + 6, -12, B.z + 20], [B.x + 4, -10, B.z - 20], [-58, -30, 0], [-42, 42, 0], [-58, 40, 30], [-40, -30, 50]] },
  { title: "Off across the floor", who: "Roo · spring", color: ROLE.spring, text: `The tyres push on the floor and the car runs, up to ${top} m/s while the spring is tight.`, points: car },
  { title: "The spring runs down", who: "Roo · spring", color: ROLE.spring, text: `As the turns run out Roo straightens and his push fades. After ${m} m it can't beat the friction, and the car rolls to a stop.`, points: null, hold: 1.6 },
];
export const views = STEPS.map((s) => (s.points ? fitView(s.points.map(at), [WIDTH, HEIGHT], { pad: 18, least: 0.36 }) : [0, 0, WIDTH, HEIGHT]));

export const LABEL = "A tinplate wind-up coupe on a boarded floor in front of a panelled wainscot, its near side, nose and roof cut away; a book, wooden blocks and skittles stand along the skirting behind it, and its own box and some marbles lie in front. The key on its near side turns an arbor through a ratchet into an open spring barrel, where a blued steel mainspring coils between the arbor and the barrel wall. The barrel's teeth drive a pinion and wheel, which drive a pinion on the rear axle. Roo the kangaroo is the mainspring: he crouches inside the barrel with his feet on the hook pressed into its wall and his forepaws on the arbor where the spring's inner end hooks it, and turns with the barrel as he pushes. Pinch the crab, on a shelf folded out of the motor's front strap, has his claws on the click's tip where it drops into the ratchet's teeth. Rocky the raccoon, on the tray, presses the brake lever's lined shoe onto the barrel's drum; its tail pokes out under the car as the stop tab.";

export const keys = [
  { mark: "lit", label: "On duty: the one whose part is moving now" },
  { mark: "raised", label: "Roo, kangaroo, spring: the mainspring, braced from the wall's hook to the arbor" },
  { mark: "raised", label: "Pinch, crab, holding: the click, his claws catching each ratchet tooth" },
  { mark: "raised", label: "Rocky, raccoon, holding: the brake, pressing its shoe on the drum" },
  { mark: "flat", label: "The mainspring, in blued steel" },
];
