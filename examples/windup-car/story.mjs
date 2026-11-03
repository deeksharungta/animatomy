import { fitView } from "../../kit/steps.mjs";
import { checkReach } from "../../kit/reach.mjs";
import { WIDTH, HEIGHT, C, P, K, at, ROO, PINCH, ROCKY, ROLE } from "./model.mjs";
import * as M from "./mech.mjs";
import { partsKit, drawn } from "./moving.mjs";
import { poses } from "./poses.mjs";

export const Q = partsKit(K, P);
export const rest = () => ({ aA: 1.3, W: C.PH.W0 ?? C.PH.Ws, windT: -1, keyV: 0, brake: 0, brakeOff: false, brakeV: 0, v: 0, vMax: 0, D: 0, roll: 0, stepT: 0, duty: "", focus: "", lit: "barrel" });
export const draw0 = (S) => drawn(K, P, C, S, Q, M);
export const pose = (S) => { const D = draw0(S); return poses(C, S, D, M.anglesOf(S)); };

// The whole run, simulated once: how far the car goes and its top speed, for the captions and the loop.
export function simulate() {
  const S = rest();
  S.windT = C.PH.full;
  for (let i = 0; i < 4000 && S.windT > 0; i++) M.stepModel(S, 0.01, C);
  S.brakeOff = true;
  let t = 0;
  for (let i = 0; i < 60000 && (S.v > 0 || t < 1); i++, t += 0.005) M.stepModel(S, 0.005, C);
  return { D: S.D, vMax: S.vMax, t, Wend: S.W };
}
export const RUN = simulate();
C.PH.W0 = RUN.Wend;
C.WORLD.period = (RUN.D * 1000) / Math.max(1, Math.round((RUN.D * 1000) / 620));

// Every paw must land at rest, mid-wind, with the brake off and while running.
export function reach() {
  const R = rest(), states = [["at rest", R], ["winding", { ...R, aA: -2.2, W: 2, keyV: 1 }], ["brake off", { ...R, W: 3, brake: 1 }], ["running", { ...R, W: 1.5, brake: 1, v: 0.4, aA: -9 }]];
  let warn = 0;
  for (const [spec, key] of [[PINCH, "pinch"], [ROCKY, "rocky"]]) warn += checkReach(spec, states.map(([label, S]) => [label, pose(S)[key]]), P);
  return warn;
}

const turns = (C.PH.full - RUN.Wend).toFixed(1), m = RUN.D.toFixed(1), top = RUN.vMax.toFixed(2);
export const TARGET = { wind: C.PH.full };
export const FOCUS = ["", "pinch", "rocky", "roo", "roo", "roo", "roo"];
const B = C.BARREL;
const car = [[-66, -34, 0], [66, -34, 0], [-66, 42, 0], [66, 42, 0], [-64, -33, 40], [64, -33, 37], [B.x, -17, B.z + B.drum + 22]];
export const STEPS = [
  { title: "Meet the crew", who: "Roo, Pinch and Rocky", color: "var(--anatomy-hi)", text: "Inside the tin car: Roo treads the spring barrel, Pinch works the click on the key's ratchet, Rocky holds the brake.", points: null, hold: 1.4 },
  { title: "You wind; Pinch's click ticks", who: "Pinch · holding", color: ROLE.holding, text: `You turn the key ${turns} turns. The arbor coils the spring tight round itself, and each ratchet tooth lifts Pinch's click and drops it: tick.`, points: [[B.x, 46, B.z], [6, 27, 10], [B.x - 8, 20, 38], [B.x, -12, B.z + 16], [B.x - 16, -12, B.z - 16]] },
  { title: "Rocky lets the brake off", who: "Rocky · holding", color: ROLE.holding, text: "The wound spring pulls the barrel, but Rocky's shoe holds its drum. You flick the stop tab and he swings it clear.", points: [[B.x, -16, B.z + B.drum + 20], [22, -10, 8], [2, -18, 6], [B.x - 10, -14, B.z]] },
  { title: "Roo treads the barrel round", who: "Roo · spring", color: ROLE.spring, text: "Now the spring uncoils. Its outer end hooks the barrel wall, so the whole barrel turns, and Roo treads it round.", points: [[B.x - 18, -14, B.z - 18], [B.x + 18, -14, B.z - 18], [B.x, -17, B.z + B.drum + 22]] },
  { title: "Gears speed it up", who: "Roo · spring", color: ROLE.spring, text: "The barrel's 48 teeth turn a 12-leaf pinion; its 40-tooth wheel turns the axle's 10. Each barrel turn spins the wheels 16 times.", points: [[B.x + 6, -24, B.z + 18], [-58, -30, 0], [-42, 42, 0], [-58, 40, 30], [-26, -30, 46]] },
  { title: "Off across the floor", who: "Roo · spring", color: ROLE.spring, text: `The tyres push on the floor and the car runs, up to ${top} m/s while the spring is tight.`, points: car },
  { title: "The spring runs down", who: "Roo · spring", color: ROLE.spring, text: `As the coils loosen the push fades. After ${m} m it can't beat the friction, and the car rolls to a stop.`, points: null, hold: 1.6 },
];
export const views = STEPS.map((s) => (s.points ? fitView(s.points.map(at), [WIDTH, HEIGHT], { pad: 18, least: 0.36 }) : [0, 0, WIDTH, HEIGHT]));

export const LABEL = "A tinplate wind-up roadster on a wooden floor, its near side, nose and roof cut away. The key on its near side turns an arbor that runs into an open spring barrel, where a blued steel mainspring coils between the arbor and the barrel wall. The barrel's teeth drive a pinion and wheel, which drive a pinion on the rear axle. Roo the kangaroo stands on top of the barrel and treads it round; Pinch the crab holds the click on the arbor's ratchet; Rocky the raccoon holds the brake lever whose shoe bears on the barrel's drum.";

export const keys = [
  { mark: "lit", label: "On duty: the one whose part is moving now" },
  { mark: "raised", label: "Roo, kangaroo, spring: the mainspring's push on the barrel" },
  { mark: "raised", label: "Pinch, crab, holding: the click that stops the key unwinding" },
  { mark: "raised", label: "Rocky, raccoon, holding: the brake on the barrel" },
  { mark: "flat", label: "The mainspring, in blued steel" },
];
