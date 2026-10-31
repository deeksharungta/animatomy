import { critter } from "../../kit/critters.mjs";
import { fitView } from "../../kit/steps.mjs";
import { WIDTH, HEIGHT, C, P, K, at, HICKORY, PINCH, KNOCK, ROLE } from "./model.mjs";
import { dynamic, poses } from "./moving.mjs";

// The clock stopped with its weight run down, at eight seconds to one: the state every run starts from.
export const rest = () => ({ t: C.T0, wt: C.WEIGHT.low, crank: 0.4, winding: false, great: 0, center: 0, third: 0, esc: 0, th: 0, amp: 0, ph: 0, beat: 0, pins: 0, ham: C.HAMMER.rest, hamV: 0, ring: 0, fly: 0, strike: 0, duty: "", stepT: 0, swap: -1, fade: 1 });

// Every paw and the beak must land through the crank's whole turn, the pendulum's swing and the hammer's stroke.
const short = (spec, pose, what) => { for (const [paw, d] of Object.entries(critter(spec, pose, P).reach)) if (d > 0.3) console.warn(`${spec.name}'s ${paw} is ${d.toFixed(1)} short of ${what}`); };
for (let i = 0; i < 12; i++) {
  const S = { ...rest(), crank: (i / 12) * Math.PI * 2, winding: true };
  short(HICKORY, poses(C, S, dynamic(K, P, C, S)).hickory, `the crank at ${i}/12 of a turn`);
}
for (const th of [-0.045, 0, 0.045]) { const S = { ...rest(), th, amp: 1 }; short(PINCH, poses(C, S, dynamic(K, P, C, S)).pinch, `the pallets at ${th}`); }
for (const ham of [C.HAMMER.back, C.HAMMER.rest, C.HAMMER.hit]) { const S = { ...rest(), ham }; short(KNOCK, poses(C, S, dynamic(K, P, C, S)).knock, `the hammer at ${ham}`); }

const { ESC: E, GREAT: G, BELL: B, HAMMER: H } = C;
export const STEPS = [
  { title: "Meet the crew", who: "Hickory, Pinch and Knock", color: "var(--anatomy-hi)", text: "Three animals run this clock: Hickory winds it, Pinch keeps its beat, Knock strikes the hours. It has stopped at eight seconds to one.", points: null, hold: 1.6 },
  { title: "Hickory winds the clock", who: "Hickory · power", color: ROLE.power, text: "Hickory turns the crank about four times. The cord winds onto the barrel and lifts the weight 92 cm up the case.", points: [[G.x - 12, -6, C.SEAT_Z], [G.x + 6, -9, 168], [-2, -17, 128], [-2, -17, 162]] },
  { title: "Pinch keeps the beat", who: "Pinch · holding", color: ROLE.holding, text: "Pinch rocks the anchor and the pendulum starts to swing. Each swing her claws let the escape wheel go half a tooth: one second, tick, tock.", points: [[E.x - 9, -21, 184], [E.x + 9, -16, 198], [E.x, -29, 202], [0, -9.5, 162]] },
  { title: "Knock strikes one", who: "Knock · spring", color: ROLE.spring, text: "At one o'clock the striking train is let go. A pin on the pin wheel lifts Knock back, then lets him fall, and he strikes the bell once.", points: [[-27, -18, 186], [B.x + 6, B.y, B.z + 6], [H.x, H.y, 184], [-25, -17, 206]] },
  { title: "Tick, tock", who: "everyone", color: "var(--anatomy-hi)", text: "Back to ticking. A swing there and back takes two seconds, and the weight will take eight days to sink down the case again.", points: [[-28, -38, 0], [28, -4, 0], [0, -20, 222]], hold: 2 },
];
export const views = STEPS.map((s) => (s.points ? fitView(s.points.map(at), [WIDTH, HEIGHT], { pad: 18, least: 0.28 }) : [0, 0, WIDTH, HEIGHT]));

export const LABEL = "An eight-day longcase clock in a panelled hall, with the front and right side of its trunk and hood cut away, run by three animals. A brass movement stands on the seatboard behind a chapter ring with blued steel hands. Hickory the mouse stands on the seatboard and turns the winding crank, which winds the cord onto the barrel and lifts the weight up the trunk. Pinch the crab sits on a cock in front of the escape wheel, her claws on the anchor's pallets, rocking with the long pendulum that swings behind the movement. Knock the woodpecker clings to a perch beside the bell and is the hammer: at the hour a pin wheel lifts him back and lets him go, and his beak strikes the bell.";

export const keys = [
  { mark: "lit", label: "On duty: whoever is doing the work right now" },
  { mark: "raised", label: "Hickory, mouse, power: winds the weight up with the crank" },
  { mark: "raised", label: "Pinch, crab, holding: her claws are the anchor's pallets" },
  { mark: "raised", label: "Knock, woodpecker, spring: is the hammer that strikes the bell" },
];
