import { WIDTH, HEIGHT, C, P, HICKORY, PINCH, KNOCK } from "./model.mjs";
import { dynamic, poses } from "./moving.mjs";
import { STEPS, views, rest } from "./story.mjs";

// The page script, part one: the numbers, and the model that winds, ticks and strikes.
export const MODEL_SCRIPT = `
const P = ${JSON.stringify(P)};
const C = ${JSON.stringify(C)};
const HICKORY = ${JSON.stringify(HICKORY)}, PINCH = ${JSON.stringify(PINCH)}, KNOCK = ${JSON.stringify(KNOCK)};
const STEP_INFO = ${JSON.stringify(STEPS.map(({ title, text, who, hold, pace }) => ({ title, text, who, hold, pace })))};
const VIEWS = ${JSON.stringify(views.map((v) => v.map((n) => +n.toFixed(2))))};
const COLORS = ${JSON.stringify(STEPS.map((s) => s.color))};
const SIZE = [${WIDTH}, ${HEIGHT}];
const K = { iso, pathOf, segment, solidSvg, lineSvg, dotsSvg, translateAlong, ...CREW };
const dynamic = ${dynamic.toString()};
const poses = ${poses.toString()};
const REST = ${JSON.stringify(rest())};
const S = { ...REST, go: false, struck: false, sp: -1, escT: 0, pinBase: 0 };
const ONE = 13 * 3600;
const ease = (v, to, tau, dt) => v + (to - v) * (1 - Math.exp(-dt / tau));
function step(dt) {
  S.stepT += dt;
  // Winding: four and a bit turns of the crank wind the cord onto the barrel and lift the weight.
  if (S.winding) {
    const da = Math.PI * 2 * 0.9 * dt;
    S.crank += da; S.great -= da;
    S.wt = Math.min(C.WEIGHT.high, S.wt + C.BARREL.r * da);
    if (S.wt >= C.WEIGHT.high) S.winding = false;
  }
  // The pendulum: a seconds pendulum, two seconds there and back. Each swing lets the escape wheel go half a tooth.
  S.amp = ease(S.amp, S.go && S.wt > C.WEIGHT.low + 1 ? 1 : 0, 0.9, dt);
  const before = Math.floor(S.ph / Math.PI);
  S.ph += Math.PI * dt * (S.amp > 0.002 ? 1 : 0);
  S.th = 0.045 * S.amp * Math.sin(S.ph);
  if (Math.floor(S.ph / Math.PI) > before && S.amp > 0.6) { S.escT -= (Math.PI * 2) / (2 * C.ESC.n); S.t += 1; }
  S.esc = ease(S.esc, S.escT, 0.035, dt);
  S.third = S.esc / 7.5; S.center = -((S.t % 3600) / 3600) * Math.PI * 2;
  // At one o'clock the strike train runs: a pin draws the hammer back, lets it go, and it rings the bell.
  if (S.t >= ONE && !S.struck && S.sp < 0) S.sp = 0;
  if (S.sp >= 0 && S.sp < 1) {
    S.sp = Math.min(1, S.sp + dt / 1.3);
    S.pins = S.pinBase + (S.sp * Math.PI * 2) / C.PINS.n;
    S.fly += 34 * dt * Math.sin(Math.PI * S.sp);
    if (S.sp < 0.7) S.ham = C.HAMMER.rest + (C.HAMMER.back - C.HAMMER.rest) * (S.sp / 0.7);
    else if (S.hamV === 0 && S.ham < C.HAMMER.rest) S.hamV = 4.2;
    if (S.sp >= 1) S.struck = true;
  }
  if (S.hamV !== 0) {
    S.hamV += (-60 * (S.ham - C.HAMMER.rest) - 4 * S.hamV) * dt;
    S.ham += S.hamV * dt;
    if (S.ham >= C.HAMMER.hit) { S.ham = C.HAMMER.hit; S.hamV = -0.35 * Math.abs(S.hamV); S.ring = 1; }
    if (Math.abs(S.hamV) < 0.02 && Math.abs(S.ham - C.HAMMER.rest) < 0.004) { S.hamV = 0; S.ham = C.HAMMER.rest; }
  }
  S.ring *= Math.exp(-dt / 0.9);
  S.duty = S.winding ? "hickory" : (S.sp >= 0 && S.sp < 1) || S.ring > 0.3 ? "knock" : S.amp > 0.1 ? "pinch" : "";
  if (S.swap >= 0) {
    S.swap += dt / 0.9;
    if (S.swap >= 0.5 && S.wt > C.WEIGHT.low) Object.assign(S, { ...REST, swap: S.swap, go: false, struck: false, sp: -1, escT: S.escT, esc: S.esc, pins: S.pins, pinBase: S.pins, fly: S.fly });
    S.fade = Math.abs(Math.cos(Math.PI * Math.min(1, S.swap)));
    if (S.swap >= 1) { S.swap = -1; S.fade = 1; }
  }
}
`;
