import { critter } from "../../kit/critters.mjs";
import { fitView } from "../../kit/steps.mjs";
import { WIDTH, HEIGHT, C, P, K, at, ROCKY, MO, KNOCK, ROLE } from "./model.mjs";
import { dynamic, poses } from "./moving.mjs";

// The clock stopped with its weight run down, at eight seconds to one: the state every run starts from.
export const rest = () => ({ t: C.T0, wt: C.WEIGHT.low, crank: 0.4, winding: false, great: 0, center: 0, third: 0, esc: 0, th: 0, amp: 0, ph: 0, beat: 0, pins: 0, ham: C.HAMMER.rest, hamV: 0, ring: 0, fly: 0, strike: 0, duty: "", stepT: 0, swap: -1, fade: 1 });

// Every paw and the beak must land through the crank's whole turn, the pendulum's swing and the hammer's stroke.
const short = (spec, pose, what) => { for (const [paw, d] of Object.entries(critter(spec, pose, P).reach)) if (d > 0.3) console.warn(`${spec.name}'s ${paw} is ${d.toFixed(1)} short of ${what}`); };
for (let i = 0; i < 12; i++) {
  const S = { ...rest(), crank: (i / 12) * Math.PI * 2, winding: true };
  short(ROCKY, poses(C, S, dynamic(K, P, C, S)).rocky, `the crank at ${i}/12 of a turn`);
}
for (const th of [-0.045, 0, 0.045]) { const S = { ...rest(), th, amp: 1 }; short(MO, poses(C, S, dynamic(K, P, C, S)).mo, `the pendulum rod at ${th}`); }
for (const ham of [C.HAMMER.back, C.HAMMER.rest, C.HAMMER.hit]) { const S = { ...rest(), ham }; short(KNOCK, poses(C, S, dynamic(K, P, C, S)).knock, `the hammer at ${ham}`); }

const { ESC: E, GREAT: G, BELL: B, HAMMER: H } = C;
export const STEPS = [
  { title: "Meet the crew", who: "Rocky, Mo and Knock", color: "var(--anatomy-hi)", text: "Three animals run this clock: Rocky winds it, Mo swings with the pendulum, Knock strikes the hours. It has stopped at eight seconds to one.", points: null, hold: 1.6 },
  { title: "Rocky winds the clock", who: "Rocky · power", color: ROLE.power, text: "Rocky turns the crank about four times. The cord winds onto the barrel and lifts the weight 92 cm up the case.", points: [[G.x - 12, -6, C.SEAT_Z], [G.x + 6, -9, 168], [-2, -17, 128], [-2, -17, 162]] },
  { title: "Mo keeps time", who: "Mo · sensing", color: ROLE.sensing, text: "Mo rocks the pendulum into its swing and rides it, two seconds there and back. Each swing the anchor lets the escape wheel go half a tooth: one second, tick, tock.", points: [[E.x - 9, -29, 112], [E.x + 9, -29, 140], [E.x - 6, -21, 184], [E.x + 6, -21, 196]] },
  { title: "Knock strikes one", who: "Knock · spring", color: ROLE.spring, text: "At one o'clock the striking train is let go. A pin on the pin wheel lifts Knock back, then lets him fall, and he strikes the bell once.", points: [[-27, -18, 186], [B.x + 6, B.y, B.z + 6], [H.x, H.y, 184], [-25, -17, 206]] },
  { title: "Tick, tock", who: "everyone", color: "var(--anatomy-hi)", text: "Back to ticking. A swing there and back takes two seconds, and the weight will take eight days to sink down the case again.", points: [[-28, -38, 0], [28, -4, 0], [0, -20, 222]], hold: 2 },
];
export const views = STEPS.map((s) => (s.points ? fitView(s.points.map(at), [WIDTH, HEIGHT], { pad: 18, least: 0.28 }) : [0, 0, WIDTH, HEIGHT]));

export const LABEL = "An eight-day longcase clock in a panelled hall, with the front and right side of its trunk and hood cut away, run by three animals. A brass movement stands on the seatboard behind a chapter ring with blued steel hands. Rocky the raccoon stands on the seatboard and turns the winding crank, which winds the cord onto the barrel and lifts the weight up the trunk. Mo the sloth, in glasses, hangs from the long pendulum's rod in the trunk and swings with it, while the anchor at the top lets the escape wheel go a little at each swing. Knock the woodpecker clings to a perch beside the bell and is the hammer: at the hour a pin wheel lifts him back and lets him go, and his beak strikes the bell.";

export const keys = [
  { mark: "lit", label: "On duty: whoever is doing the work right now" },
  { mark: "raised", label: "Rocky, raccoon, power: winds the weight up with the crank" },
  { mark: "raised", label: "Mo, sloth, sensing: swings with the pendulum, one second a swing" },
  { mark: "raised", label: "Knock, woodpecker, spring: is the hammer that strikes the bell" },
];
