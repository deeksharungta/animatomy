// The run's beats, their cameras, the words under the card, and the crew's reach and point-of-work checks.
import { checkReach, checkWork } from "../../kit/reach.mjs";
import { fitView } from "../../kit/steps.mjs";
import { C, P, WIDTH, HEIGHT, at, ROO, PINCH, ROLE } from "./model.mjs";
import { PINS, LENGTH, FREQ, NOTES } from "./tune.mjs";
import { poses } from "./poses.mjs";

const HI = "var(--anatomy-hi)", n = NOTES.length - 1;
const mm = (l) => l.toFixed(0), hz = (f) => Math.round(f).toLocaleString("en-GB");
export const NUM = { pins: PINS.length, fly: C.FLY_PER_CYL * C.CYL_RPM, lo: `${mm(LENGTH[0])} mm tooth rings ${NOTES[0]} at ${hz(FREQ[0])} Hz`, hi: `${mm(LENGTH[n])} mm one ${NOTES[n]} at ${hz(FREQ[n])} Hz` };
export const STEPS = [
  { title: "Meet the crew", who: "Roo and Pinch", color: HI, text: "Two animals run this music box: Roo is its mainspring, and Pinch is the stop on its fly.", points: null, hold: 1 },
  { title: "You wind the key", who: "Roo · spring", color: ROLE.spring, text: `One turn of the key winds the arbor while the click drops into its ${C.RATCHET.teeth} ratchet teeth. Roo crouches as the spring tightens.`, points: [[-144, -26, 18], [-92, 26, 18], [-118, 0, 78], [-150, 6, 52], [-92, -8, 60]], least: 0.27 },
  { title: "Pinch lets go of the fly", who: "Pinch · holding", color: ROLE.holding, text: "You slide the start lever and Pinch opens his claws. The wound spring sets the whole train turning.", points: [[88, -38, 18], [132, -4, 18], [101, -9, 74], [126, -18, 78], [156, 20, 30]], least: 0.27 },
  { title: "Roo turns the barrel", who: "Roo · spring", color: ROLE.spring, text: `His push turns the barrel. Its ${C.RATIO.crown} crown teeth drive the cylinder's ${C.RATIO.pinion}-leaf pinion twice as fast: ${C.CYL_RPM} rpm, one tune a turn.`, points: [[-144, -26, 18], [-58, 22, 26], [-118, 0, 74], [-62, 0, 66]], least: 0.3 },
  { title: "The pins pluck the comb", who: "The comb · 36 teeth", color: HI, text: `Each pin lifts one steel tooth and lets it go, and the tooth rings. ${NUM.pins} pins play "Twinkle, Twinkle, Little Star".`, points: [[-80, 0, 62], [48, 0, 62], [-78, 70, 36], [44, 60, 36]], least: 0.36, pace: 1 },
  { title: "Long teeth sing low", who: "The comb · 36 teeth", color: HI, text: `A tooth's pitch goes as 1/length²: the ${NUM.lo}, the ${NUM.hi}.`, points: [[-80, 22, 40], [44, 18, 46], [-80, 64, 46], [44, 40, 44]], least: 0.33, pace: 1 },
  { title: "The fly keeps the tempo", who: "The fly · governor", color: HI, text: `The train turns the fly ${C.FLY_PER_CYL} times for each cylinder turn. Its air drag grows as speed², so it settles near ${NUM.fly.toLocaleString("en-GB")} rpm.`, points: [[86, -40, 18], [132, 0, 18], [101, -9, 76], [56, 0, 70]], least: 0.28, pace: 1 },
  { title: "The spring runs down", who: "Roo · spring", color: ROLE.spring, text: "In the last quarter turn Roo's push fades. The fly slows, the tune drags, and the last notes come late.", points: [[-144, -26, 18], [-92, 26, 18], [-118, 0, 76], [10, 40, 60]], least: 0.38, pace: 1 },
  { title: "Pinch holds the fly", who: "Pinch · holding", color: ROLE.holding, text: "You slide the lever back, and Pinch closes his claws on the vane, ready for the next wind.", points: [[40, -30, 16], [130, 56, 16], [101, -9, 76], [126, -18, 78], [30, 30, 60]], least: 0.3, hold: 1 },
];
export const FOCUS = ["", "roo", "pinch", "roo", "", "", "", "roo", "pinch"];
export const LIT = ["cyl", "cyl", "cyl", "cyl", "teeth", "teeth", "fly", "cyl", "cyl"];
export const VIEWS = STEPS.map((s) => (s.points ? fitView(s.points.map(at), [WIDTH, HEIGHT], { pad: 18, least: s.least ?? 0.3 }) : [0, 0, WIDTH, HEIGHT]));

// Reach and the point of work: Roo all the way round the barrel at no wind, half and full wind; Pinch on the vane.
export function crewChecks() {
  const B = C.BARREL, d2r = Math.PI / 180, list = [];
  for (let i = 0; i < 48; i++) for (const wnd of [0, 0.5, 1]) list.push([`(barrel at ${(i * 7.5).toFixed(1)}°, wind ${wnd})`, poses(C, { tb: i / 48, wnd, run: true, t: 0, idle: 0 }).roo]);
  const hook = (l, p) => { const a = (C.PLACE.roo.psi0 + parseFloat(l.slice(11))) * d2r, r = C.PLACE.roo.r + 1.8; return [B.x + r * Math.cos(a), B.y + r * Math.sin(a), p.at[2]]; };
  const held = [["(holding the fly)", poses(C, { tb: 0, wnd: 1, grip: 1, flyRpm: 0, t: 0, idle: 0 }).pinch]];
  const reach = checkReach(ROO, list, P) + checkReach(PINCH, held, P);
  const work = checkWork(ROO, list, P, { end: "feet", work: hook }) + checkWork(PINCH, held, P, { end: "paws", work: poses(C, { tb: 0, wnd: 1, grip: 1 }).tip });
  console.log(`checkReach: ${reach} warnings · checkWork: ${work} warnings`);
  return reach + work;
}

export const LABEL = `A Swiss-style cylinder music box on a parlour table, its lid open with the tune card inside and its front and right walls cut down so the movement shows. On a cast-iron bedplate: at the left, an open spring barrel whose crown teeth drive a pinion on the brass cylinder's arbor; the cylinder, pinned with "Twinkle, Twinkle, Little Star", turns against a steel comb of 18 teeth, long and low at the left, short and high at the right; at the right, a 72-tooth wheel drives the governor's train up to an endless screw and the fly on top. Roo the kangaroo stands in the barrel with his feet on its hook and his paws on the arbor: he is the mainspring, and as he pushes the barrel round he turns with it. Pinch the crab stands on the governor's cock with his claws on the fly's vane: he is the stop that holds the wound spring back until the lever is slid.`;
export const KEYS = [
  { mark: "lit", label: "On duty: whoever is doing the work right now" },
  { mark: "raised", label: "Roo, kangaroo, spring: the mainspring, pushing the barrel round against the arbor" },
  { mark: "raised", label: "Pinch, crab, holding: the stop, his claws on the fly's vane until you start it" },
];
export const CAPTION = `A cylinder music box, shown one step at a time. One turn of the key winds the mainspring one turn; the click holds the arbor, so the spring can only turn the barrel. The barrel's ${C.RATIO.crown} crown teeth drive the cylinder's ${C.RATIO.pinion}-leaf pinion, so the cylinder turns twice, once per play of the tune, at ${C.CYL_RPM} rpm. Its ${PINS.length} pins each lift one tooth of the steel comb and let it go; a tooth's pitch goes as one over its length squared, from ${NOTES[0]} (${hz(FREQ[0])} Hz) on the ${mm(LENGTH[0])} mm tooth to ${NOTES[n]} (${hz(FREQ[n])} Hz) on the ${mm(LENGTH[n])} mm one. The cylinder's wheel drives a train that turns a fly ${C.FLY_PER_CYL} times per cylinder turn; its air drag grows as the square of its speed, which holds the tempo near a crotchet every 0.75 s until the spring's last quarter turn, when the tune slows and stops.`;
