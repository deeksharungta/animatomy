import { fitView } from "../../kit/steps.mjs";
import { checkReach } from "../../kit/reach.mjs";
import { WIDTH, HEIGHT, C, P, K, at, PLUMB, PINCH, ROCKY, KNOCK, ROLE } from "./model.mjs";
import { wheelKit, going } from "./going.mjs";
import { strike } from "./strike.mjs";
import { poses } from "./poses.mjs";

const W = wheelKit(K, P, C);
export const drawn = (S) => ({ ...going(K, P, C, S, W), ...strike(K, P, C, S, W) });

// The clock stopped with its weights run down at ten seconds to one, in warning: the hour pin has pressed
// the lifting arm down, so the lever is up and the warning pin rests on its flag.
export const rest = () => {
  const t = C.T0, center = -((t % 3600) / 3600) * Math.PI * 2;
  return {
    t, wt: C.WEIGHT.low, swt: C.WEIGHT.low, crank: 0, winding: false, go: false, center, great: -center / 12, third: 0, esc: 0, escT: 0,
    th: 0, amp: 0, ph: 0, pins: 0.646, sgreat: 0, lock: C.LOCK.catch - 0.5, warn: 0, fly: 0, ham: C.HAMMER.rest, hamV: 0, ring: 0, hit: false,
    lever: C.LEVER.lift, sp: -1, locked: false, duty: "", lit: "esc", focus: "", stepT: 0, swap: -1, fade: 1,
  };
};

// Every paw and the beak must land through the winding, the swing, the lever's travel and the hammer's stroke.
export function reach(X) {
  const R = rest(), pose = (S) => poses(C, S, drawn(S), X);
  const list = (spec, key, states) => checkReach(spec, states.map(([label, S]) => [label, pose({ ...R, ...S })[key]]), P);
  return list(PLUMB, "plumb", [["run down", {}], ["half wound", { wt: (C.WEIGHT.low + C.WEIGHT.high) / 2, winding: true }], ["wound", { wt: C.WEIGHT.high }]]) +
    list(PINCH, "pinch", [-C.PEND.amp, 0, C.PEND.amp].map((th) => [`with the anchor at ${th}`, { th, amp: 1 }])) +
    list(ROCKY, "rocky", [["with the lever up", {}], ["with the lever down", { lever: 0 }]]) +
    list(KNOCK, "knock", [C.HAMMER.back, C.HAMMER.rest, C.HAMMER.hit].map((ham) => [`with the hammer at ${ham}`, { ham }]));
}

const { ESC: E, GREAT: G, BELL: B, HAMMER: H, LOCK: Lk, LEVER: Lv, WEIGHT: Wt } = C;
const top = Wt.high + Wt.h + 6;
export const STEPS = [
  { title: "Meet the crew", who: "Mo, Pinch, Rocky and Knock", color: "var(--anatomy-hi)", text: "Four animals are this clock's forces: Mo is the weight's pull, Pinch the anchor, Rocky the locking lever and Knock the hammer. It has stopped at ten seconds to one.", points: null, hold: 1.6 },
  { title: "You wind the clock", who: "Mo · power", color: ROLE.power, text: "Turn by turn the key winds each cord onto its barrel. The going weight, with Mo hanging on its cord, rises 68 cm.", points: [[G.x - 12, -23, Wt.low], [G.x - 12, -23, top], [G.x + 4, -14, 168], [-2, -14, 150]] },
  { title: "Mo pulls", who: "Mo · power", color: ROLE.power, text: "You start the pendulum. Mo's weight on the cord turns the barrel, and the wheels pass his pull up to the escape wheel.", points: [[G.x - 12, -23, top - 12], [G.x - 12, -23, top + 4], [-8, -20, 152], [6, -20, 190]] },
  { title: "Pinch lets go each second", who: "Pinch · holding", color: ROLE.holding, text: "Pinch's claws are the pallets. Each one-second swing he lets the escape wheel go half a tooth, and catches it again.", points: [[E.x - 8, -21, 180], [E.x + 8, -21, 180], [E.x - 6, -21, 198], [E.x + 6, -21, 198]] },
  { title: "One o'clock lets Rocky go", who: "Rocky · holding", color: ROLE.holding, text: "For five minutes the hour pin has held the lever up. Now it slips off, the lever drops, and the strike train runs.", points: [[Lv.x - 3, -20, 172], [Lv.tail + 4, -20, 172], [Lv.x - 3, -20, 192], [Lv.tail + 4, -18, 188]], pace: 0.5 },
  { title: "Knock strikes one", who: "Knock · spring", color: ROLE.spring, text: "A pin on the pin wheel draws the hammer back. It slips off, and Knock, the hammer's spring, strikes the bell.", points: [[B.x - 2, B.y, B.z + 6], [H.x, -20, 172], [H.x + 8, -20, 210], [B.x + 4, B.y, 198]], pace: 0.5 },
  { title: "Rocky catches the train", who: "Rocky · holding", color: ROLE.holding, text: "One turn of the locking wheel later its pin comes round, and Rocky's hook catches it: one blow for one o'clock.", points: [[Lk.x - 5, -20, 172], [Lv.tail + 4, -20, 172], [Lk.x - 5, -20, 190], [Lv.tail + 4, -18, 190]], pace: 0.5 },
  { title: "Tick, tock", who: "everyone", color: "var(--anatomy-hi)", text: "Back to ticking: the 99.4 cm pendulum swings once a second, and the weights take eight days to sink down the trunk again.", points: [[-28, -38, 0], [28, -4, 0], [0, -20, 230]], hold: 2 },
];
export const views = STEPS.map((s) => (s.points ? fitView(s.points.map(at), [WIDTH, HEIGHT], { pad: 18, least: 0.26 }) : [0, 0, WIDTH, HEIGHT]));

export const LABEL = "An eight-day longcase clock in a panelled hall, its trunk door open and the front and right side of its trunk and hood cut away, run by four animals who are its forces. Mo the sloth hangs on the going weight's cord above its pulley and is the weight's pull. Pinch the crab stands on the anchor at the top of the movement and his claws are its pallets, which let the escape wheel go half a tooth each second. Rocky the raccoon, on a bracket at the plate's edge, holds the tail of the strike train's locking lever. Knock the woodpecker, on the bracket above, is the hammer's spring: his beak follows the hammer to the bell.";

export const keys = [
  { mark: "lit", label: "On duty: the one whose part is moving now" },
  { mark: "raised", label: "Mo, sloth, power: the going weight's pull on its cord" },
  { mark: "raised", label: "Pinch, crab, holding: the anchor, his claws its pallets" },
  { mark: "raised", label: "Rocky, raccoon, holding: the strike train's locking lever" },
  { mark: "raised", label: "Knock, woodpecker, spring: the hammer's spring and head" },
];
