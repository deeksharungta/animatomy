import { WIDTH, HEIGHT, C, P, PLUMB, PINCH, ROCKY, KNOCK } from "./model.mjs";
import { wheelKit, going } from "./going.mjs";
import { strike } from "./strike.mjs";
import { poses } from "./poses.mjs";
import { STEPS, views, rest } from "./story.mjs";

// The page script, part one: the numbers, and the model that winds, ticks and strikes.
export const MODEL_SCRIPT = `
const P = ${JSON.stringify(P)};
const C = ${JSON.stringify(C)};
const SPEC = ${JSON.stringify({ plumb: PLUMB, pinch: PINCH, rocky: ROCKY, knock: KNOCK })};
const STEP_INFO = ${JSON.stringify(STEPS.map(({ title, text, who, hold, pace }) => ({ title, text, who, hold, pace })))};
const VIEWS = ${JSON.stringify(views.map((v) => v.map((n) => +n.toFixed(2))))};
const COLORS = ${JSON.stringify(STEPS.map((s) => s.color))};
const FOCUS = ["", "plumb", "plumb", "pinch", "rocky", "knock", "rocky", ""];
const SIZE = [${WIDTH}, ${HEIGHT}];
const K = { iso, pathOf, segment, solidSvg, lineSvg, dotsSvg, translateAlong, ...CREW };
const wheelKit = ${wheelKit.toString()};
const going = ${going.toString()};
const strike = ${strike.toString()};
const poses = ${poses.toString()};
const W = wheelKit(K, P, C);
const drawn = (S) => ({ ...going(K, P, C, S, W), ...strike(K, P, C, S, W) });
const REST = ${JSON.stringify(rest())};
const S = { ...REST };
const ease = (v, to, tau, dt) => v + (to - v) * (1 - Math.exp(-dt / tau));
const TURN = Math.PI * 2, RUN = TURN - 0.5;
function step(dt) {
  S.stepT += dt;
  // Winding: two turns of the key a second wind each cord onto its barrel; through the pulley the weight rises half as far.
  if (S.winding) {
    const da = TURN * 2 * dt, rise = (C.BARREL.r * da) / 2;
    S.crank -= da;
    S.wt = Math.min(C.WEIGHT.high, S.wt + rise);
    S.swt = Math.min(C.WEIGHT.high, S.swt + rise);
    if (S.wt >= C.WEIGHT.high && S.swt >= C.WEIGHT.high) S.winding = false;
  }
  // The pendulum: one second a swing. Each swing the anchor lets the escape wheel go half a tooth, and the clock gains a second.
  S.amp = ease(S.amp, S.go && S.wt > C.WEIGHT.low + 1 ? 1 : 0, 0.9, dt);
  const before = Math.floor(S.ph / Math.PI);
  S.ph += Math.PI * dt * (S.amp > 0.002 ? 1 : 0);
  S.th = C.PEND.amp * S.amp * Math.sin(S.ph);
  if (Math.floor(S.ph / Math.PI) > before && S.amp > 0.6) { S.escT -= TURN / (2 * C.ESC.n); S.t += 1; }
  S.esc = ease(S.esc, S.escT, 0.035, dt);
  S.third = -S.esc / 8;
  S.center = REST.center + S.esc / 60;
  S.great = -S.center / 12;
  // At one o'clock the hour pin slips off the lifting arm, the lever drops, and the strike train runs one blow.
  if (S.t >= C.ONE && S.sp < 0 && !S.locked) S.sp = 0;
  const lv = S.lever;
  S.lever = ease(S.lever, S.sp >= 0 ? 0 : C.LEVER.lift, 0.06, dt);
  S.leverV = Math.abs(S.lever - lv) / Math.max(dt, 1e-6);
  if (S.sp >= 0 && S.sp < 1 && S.lever < 0.02) {
    S.sp = Math.min(1, S.sp + dt / 2.2);
    const u = S.sp * S.sp * (3 - 2 * S.sp);
    S.lock = REST.lock - u * RUN;
    S.pins = REST.pins + (u * RUN) / 8;
    S.sgreat = -S.pins / 9.75;
    S.warn = -4 * (S.lock - REST.lock);
    S.fly = -2.5 * S.warn;
    if (S.sp < 0.7) S.ham = C.HAMMER.rest + (C.HAMMER.back - C.HAMMER.rest) * (S.sp / 0.7);
    else if (S.hamV === 0 && !S.hit) S.hamV = 0.001;
    if (S.sp >= 1) S.locked = true;
  }
  if (S.hamV !== 0) {
    S.hamV += (-60 * (S.ham - C.HAMMER.rest) - 4 * S.hamV) * dt;
    S.ham += S.hamV * dt;
    if (S.ham >= C.HAMMER.hit) { S.ham = C.HAMMER.hit; S.hamV = -0.35 * Math.abs(S.hamV); S.ring = 1; S.hit = true; }
    if (S.hit && Math.abs(S.hamV) < 0.02 && Math.abs(S.ham - C.HAMMER.rest) < 0.004) { S.hamV = 0; S.ham = C.HAMMER.rest; }
  }
  S.ring *= Math.exp(-dt / 0.9);
  // On duty: the beat's critter while its part moves; when nothing moves the escape wheel takes the lit accent.
  const moving = {
    plumb: S.winding || S.amp > 0.1,
    pinch: S.amp > 0.1,
    rocky: S.leverV > 0.01 || (S.sp >= 0.9 && S.stepT < 1.6),
    knock: (S.sp >= 0 && S.sp < 1) || S.ring > 0.1,
  };
  S.duty = S.focus && moving[S.focus] ? S.focus : "";
  S.lit = S.duty ? "" : "esc";
  if (S.swap >= 0) {
    S.swap += dt / 0.9;
    if (S.swap >= 0.5 && S.wt > C.WEIGHT.low) Object.assign(S, { ...REST, swap: S.swap, escT: S.escT, esc: S.esc });
    S.fade = Math.abs(Math.cos(Math.PI * Math.min(1, S.swap)));
    if (S.swap >= 1) { S.swap = -1; S.fade = 1; }
  }
}
`;
