import { critter } from "../../kit/critters.mjs";
import { checkReach } from "../../kit/reach.mjs";
import { fitView } from "../../kit/steps.mjs";
import { WIDTH, HEIGHT, C, P, K, at, MO, PINCH, KNOCK, ROLE, eventsOf, stateAt } from "./model.mjs";
import { dynamic } from "./moving.mjs";
import { poses } from "./poses.mjs";

const E = eventsOf(C), S0 = stateAt(C, E, 0);
const pose = (o) => { const S = { ...S0, ...o }; return poses(C, S, dynamic(K, P, C, S), { reach: true }); };

// Every paw and the beak must land through the whole stroke, at the cocked hammer and at the strike.
const stroke = Array.from({ length: 9 }, (_, i) => ({ zc: (i / 8) * C.TRAVEL, q: i / 8 }));
checkReach(MO, stroke.map((o) => [`at ${o.zc.toFixed(1)} of the stroke`, pose(o).mo]), P);
checkReach(PINCH, [0, 0.2].map((press) => [`holding the cocked hammer, sear at ${press}`, pose({ ham: C.COCK, cocked: true, press }).pinch]), P);
checkReach(KNOCK, [-0.05, 0, C.COCK / 2, C.COCK].map((ham) => [`with the hammer at ${ham}`, pose({ ham }).knock]), P);

// The numbers the captions quote, read off the model's own key times.
const keys = E.keys, burst = keys.slice(0, 5), lone = keys[5], [f1, f2] = E.fires;
if (E.fires.length !== 2 || f1.after !== 4 || f2.after !== 5) throw new Error("the story no longer matches the model");
const gap = Math.round(((burst.at(-1).release - burst[0].release) / 4) * 1000);
const most = Math.round(Math.max(...burst.slice(0, 4).map((e) => e.cut)) * 1000);
const ms = Math.round(C.WAIT * 1000);
export const DONE_AT = [0, burst[0].release, burst.at(-1).release, f1.at - 0.0235, f1.at + 0.006, f1.at + 0.1, f2.at + 0.1, f2.at + 0.6];

const H = C.HP, B = C.BELL;
export const STEPS = [
  { title: "Meet the crew", who: "Mo, Pinch and Knock", color: "var(--anatomy-hi)", text: `Three animals run this debouncer. Mo hangs on the dashpot's crosshead and is its timer, Pinch holds the hammer cocked, and Knock is the hammer's spring.`, points: null, hold: 1.4 },
  { title: "A key resets the timer", who: "Mo · sensing", color: ROLE.sensing, text: `You press a key and a ball rolls onto the paddle. The rock shaft pushes the crosshead, and Mo, up to ${ms} ms on the scale, and cocks the hammer.`, points: [[-50, -40, 96], [-52, 14, 12], [-36, -10, 58], [14, -9, 104], [10, -14, 40]], pace: 0.12 },
  { title: "Every key starts the wait again", who: "Mo · sensing", color: ROLE.sensing, text: `Four more keys, about ${gap} ms apart. Mo sinks for at most ${most} ms before the next ball sends him back to ${ms}.`, points: [[-50, -40, 96], [-52, 14, 12], [-36, -10, 58], [14, -9, 104], [10, -14, 40]], pace: 0.12 },
  { title: "Quiet: Mo sinks all the way", who: "Mo · sensing", color: ROLE.sensing, text: `No more keys. Mo sinks through the oil at a steady rate and reaches the bottom ${ms} ms after the last one.`, points: [[-38, -10, 56], [14, -9, 104], [-4, -32, 16], [26, -12, 16]], pace: 0.12 },
  { title: "Pinch lets go", who: "Pinch · holding", color: ROLE.holding, text: "At the bottom the trip rod's foot presses the sear, and Pinch's claws slip off the hammer's catch pin.", points: [[20, -20, 14], [36, -8, 16], [24, -24, 34], [34, -12, 34]], pace: 0.05 },
  { title: "Knock rings the bell once", who: "Knock · spring", color: ROLE.spring, text: `Knock, the hammer's spring, strikes the bell. Five keys, one ring, ${ms} ms after the last.`, points: [[12, -2, 6], [B[0] + 10, B[1], 38], [H[0], H[1], H[2] + 4], [16, -16, 32]], pace: 0.12 },
  { title: "A lone key waits too", who: "Mo · sensing", color: ROLE.sensing, text: `One key on its own resets Mo just the same. The bell rings again ${ms} ms later, once.`, points: [[-64, -40, 0], [60, 34, 0], [-46, -82, 98], [14, -10, 104]], pace: 0.14 },
  { title: "Waiting for the next pause", who: "everyone", color: "var(--anatomy-hi)", text: "However fast you type, the bell rings once for each pause, and only after the pause has lasted the full wait.", points: [[-76, -62, 0], [60, 44, 0], [0, -40, 104], [-76, 44, 0], [60, -62, 70]], hold: 2 },
];
export const views = STEPS.map((s) => (s.points ? fitView(s.points.map(at), [WIDTH, HEIGHT], { pad: 22, least: s.pace === 0.05 ? 0.26 : 0.34 }) : [0, 0, WIDTH, HEIGHT]));

export const LABEL = `A debounce timer built as a dashpot doorbell on a desk, run by three animals. Each key you type drops a brass ball through a slot in the wall; it rolls down a rail onto a paddle, which rocks a shaft that pushes a crosshead back to the top of its travel and cocks the bell's hammer, then tips the ball into a bin. Mo the sloth, in glasses, hangs on the crosshead, which sinks through the oil of a glass dashpot at a steady rate, ${ms} ms from top to bottom, read on a scale beside it. Pinch the crab stands on the sear and holds the cocked hammer by its catch pin. Only when the crosshead reaches the bottom does its trip rod press the sear; Pinch lets go, and Knock the woodpecker, the hammer's spring, strikes the bell once. A burst of keys keeps sending Mo back to the top, so the bell rings once, ${ms} ms after the last key.`;

export const keysLegend = [
  { mark: "lit", label: "On duty: whoever is doing the work right now" },
  { mark: "raised", label: `Mo, sloth, sensing: the timer; his weight sinks the crosshead, ${ms} ms top to bottom` },
  { mark: "raised", label: "Pinch, crab, holding: the sear; holds the cocked hammer until the trip" },
  { mark: "raised", label: "Knock, woodpecker, spring: the hammer's spring; strikes the bell" },
];
export const CAPTION = `A debounce with a wait of ${ms} ms. Every event restarts the wait, and the handler runs only when the wait passes with no new event. A burst of ${burst.length} keys about ${gap} ms apart rings the bell once, ${ms} ms after the last key; a lone key rings it once too, ${ms} ms later.`;
