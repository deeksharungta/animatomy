// The run's beats, their cameras, the words under the card, and the crew's reach and point-of-work checks.
import { checkReach, checkWork } from "../../kit/reach.mjs";
import { fitView } from "../../kit/steps.mjs";
import { C, P, WIDTH, HEIGHT, at, leverAt, CHOMP, BUN, MOCHI, ROO, ROLE } from "./model.mjs";
import { poses } from "./poses.mjs";

const HI = "var(--anatomy-hi)";
export const STEPS = [
  { title: "Meet the crew", who: "Chomp, Bun, Mochi and Roo", color: HI, text: "Four animals run this can opener: Chomp is the cutter, Bun and Mochi are the motor, and Roo is the lever's return spring.", points: null, hold: 1.6 },
  { title: "You press the lever", who: "Roo · spring", color: ROLE.spring, text: "The lever tips down on its pivot. The pad under it squashes Roo, its return spring, and lowers Chomp's shoe toward the lid.", points: [[-52, 4, 94], [-26, 26, 94], [-42, 14, 140], [4, 18, 132]] },
  { title: "Chomp bites through the lid", who: "Chomp · cutting", color: ROLE.cutting, text: "At the bottom of the press his teeth punch through just inside the rim. Now the rim is pinched between Chomp and the feed gear.", points: [[-10, 24, 100], [10, -2, 96], [6, 6, 134], [-8, 2, 92]], least: 0.2 },
  { title: "Bun and Mochi start the motor", who: "Bun and Mochi · power", color: ROLE.power, text: "The lever has closed the switch and current wakes the hamsters. Their 20-tooth pinion turns the 40-tooth gear: the feed shaft turns at 36 rpm.", points: [[-100, -28, 38], [-52, 22, 40], [-56, 0, 126], [-98, 28, 102]] },
  { title: "The feed gear walks the can round", who: "Chomp · cutting", color: ROLE.cutting, text: "The feed gear's teeth grip under the rim and drag it past Chomp at 30 mm a second. He slices a groove through the lid as it goes by.", points: [[-8, 22, 96], [80, 0, 104], [40, -40, 118], [40, 40, 100]] },
  { title: "Round to where he started", who: "Chomp · cutting", color: ROLE.cutting, text: "After one turn, 214 mm in 8.3 s, the groove meets the hole it started from. The lid is free and drops onto its own edge.", points: [[-8, 22, 96], [80, 0, 104], [40, -40, 118], [40, 40, 100]] },
  { title: "Roo throws the lever up", who: "Roo · spring", color: ROLE.spring, text: "With no rim to pinch, nothing holds the lever down. Roo springs back to full height, lifts Chomp's teeth clear and lets the switch open.", points: [[-52, 4, 94], [36, 12, 148], [-34, 26, 94], [4, 18, 100]] },
  { title: "The motor coasts to a stop", who: "Bun and Mochi · power", color: ROLE.power, text: "No current: the hamsters slow down, and the gears and the can stop. The lid lies loose in the can, ready to lift off.", points: [[-100, -28, 38], [-52, 22, 40], [-98, 28, 102], [40, -40, 120], [-30, 30, 60]], least: 0.4, hold: 2 },
];
export const FOCUS = ["", "roo", "chomp", "squad", "chomp", "chomp", "roo", "squad"];
export const VIEWS = STEPS.map((s) => (s.points ? fitView(s.points.map(at), [WIDTH, HEIGHT], { pad: 18, least: s.least ?? 0.3 }) : [0, 0, WIDTH, HEIGHT]));

// Reach and the point of work over the lever's travel, in every frame each critter is on duty.
const base = { lev: 0, wheel: 0, omega: 0, cutting: false, free: false, idle: 0, t: 0, throwT: 9 };
const LEVS = [["up", 0], ["a third down", 0.33], ["two thirds down", 0.66], ["at the lid", 0.95], ["pressed", 1]];
export function crewChecks() {
  const pr = LEVS.map(([l, lev]) => [`(${l})`, poses(C, { ...base, lev }).roo]);
  const pc = LEVS.map(([l, lev]) => [`(${l})`, poses(C, { ...base, lev, cutting: lev === 1 }).chomp]);
  const cutting = [["(cutting)", poses(C, { ...base, lev: 1, cutting: true, t: 0.3 }).chomp], ["(cutting, mid-chew)", poses(C, { ...base, lev: 1, cutting: true, t: 0.07 }).chomp]];
  const ham = [0, 0.7, 2.1].map((w) => poses(C, { ...base, wheel: w, omega: 1 }));
  const cutPoint = [C.CAN.x + C.CUT_R * Math.cos((C.CUT_A * Math.PI) / 180), C.CAN.y + C.CUT_R * Math.sin((C.CUT_A * Math.PI) / 180), C.CAN.lid - 0.6];
  const padPoint = (l) => leverAt(C, LEVS.find(([n]) => `(${n})` === l)[1], [C.PAD.x - 2, C.PAD.y, C.PAD.z]);
  const rung = (p) => [p.at[0], p.at[1] * (C.WHEEL.r / (C.WHEEL.r - 1.2)), C.WHEEL.z + (p.at[2] - C.WHEEL.z) * (C.WHEEL.r / (C.WHEEL.r - 1.2))];
  const reach = checkReach(CHOMP, [...pc, ...cutting], P) + checkReach(ROO, pr, P);
  const work = checkWork(CHOMP, cutting, P, { end: "bite", work: cutPoint }) +
    checkWork(ROO, pr, P, { end: "l", work: padPoint }) +
    checkWork(BUN, ham.map((q, i) => [`(frame ${i})`, q.bun]), P, { end: "feet", work: (l, p) => rung(p) }) +
    checkWork(MOCHI, ham.map((q, i) => [`(frame ${i})`, q.mochi]), P, { end: "feet", work: (l, p) => rung(p) });
  console.log(`checkReach: ${reach} warnings · checkWork: ${work} warnings`);
  return reach + work;
}

export const LABEL = "An electric can opener on a kitchen counter, with its right side panel off so the mechanism shows, and a can of tomato soup hanging from its cutting head by the rim. A notch is cut out of the can's rim beside the opener so the feed gear under the rim and the lid's cut show. A tiled wall stands behind with a socket and a shelf, and a saucepan, two more cans and a wooden spoon sit on the counter. Inside the housing two hamsters run in a wheel whose pinion turns a large gear on the feed shaft; the shaft comes out through the face plate to the small toothed feed gear under the can's rim. A long lever pivots at the back of the housing and runs out through a slot in the face plate to a handle over the can. Roo the kangaroo stands on a shelf under the lever with his paws on a pad beneath it: he is the lever's return spring. Chomp the beaver stands on a shoe that hangs from the lever beside the rim, and his teeth are the cutter: pressed down, they bite through the lid just inside the rim, and as the feed gear turns the can, he cuts a groove all the way round.";
export const KEYS = [
  { mark: "lit", label: "On duty: whoever is doing the work right now" },
  { mark: "raised", label: "Chomp, beaver, cutting: the cutter, his teeth on the lid just inside the rim" },
  { mark: "raised", label: "Bun and Mochi, hamsters, power: the motor, running the wheel that turns the gears" },
  { mark: "raised", label: "Roo, kangaroo, spring: the lever's return spring, under the pad" },
];
export const CAPTION = "An electric can opener with its side panel off, shown one step at a time. Pressing the lever tips it on its pivot: the cutter pierces the lid just inside the rim, the rim is pinched between the cutter and the toothed feed gear, and the switch closes. The motor turns the feed gear through a 2:1 gear pair, and the gear drags the can round by its rim at 30 mm/s, so the cutter slices the lid all the way round in one 8.3 s turn. Once the lid is free nothing holds the lever down, and its return spring throws it up, which lifts the cutter and opens the switch.";
