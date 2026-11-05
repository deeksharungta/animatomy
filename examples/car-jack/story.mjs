// The run's beats, their cameras, the words under the card, and the crew's reach and point-of-work checks.
import { checkReach, checkWork } from "../../kit/reach.mjs";
import { fitView } from "../../kit/steps.mjs";
import { C, P, WIDTH, HEIGHT, at, OTTIE, PINCH, ROLE } from "./model.mjs";
import { poses } from "./poses.mjs";

const f1 = (n) => n.toFixed(1), kg = f1(C.PUSH), bar = Math.round(C.BAR), mm = f1(C.RISE), lift = Math.round(C.LIFT), clear = Math.round(C.LIFT - C.DROOP);
export const NUM = { kg, bar, mm, lift, cc: f1(C.CC), area: C.AREA.toFixed(0), lever: f1(C.LEVER) };
const HI = "var(--anatomy-hi)", JACK = [[-78, 0, 0], [118, 0, 0], [118, 0, 96], [-78, 0, 230]], CAR = [[-400, 0, 0], [125, 0, 0], [125, 0, 60], [-400, 0, 300], [0, 0, 350]];
// Half strokes done at the end of each beat: down-up-down, up-down-up, to stroke 20, to stroke 32, then none.
export const UT = [0, 3, 6, 40, 64, 64, 64];
export const STEPS = [
  { title: "Meet the crew", who: "Ottie and Pinch", color: HI, text: "Two animals run this bottle jack: Ottie the otter is its pump plunger, and Pinch the crab is the valve that keeps the oil in.", points: JACK, least: 0.5, hold: 1.6 },
  { title: "Ottie pushes the oil", who: "Ottie · fluid", color: ROLE.fluid, text: `You pump the handle. Each push drives Ottie ${C.STROKE} mm down his bore, and his feet force ${NUM.cc} cm³ of oil past Pinch, under the ram.`, points: [[-20, 0, 0], [110, 0, 0], [110, 0, 104], [-20, 0, 104]], least: 0.3 },
  { title: "Pinch holds the car", who: "Pinch · holding", color: ROLE.holding, text: `As Ottie rises he draws fresh oil in through the little ball valve, and Pinch clamps his seat shut: the car's weight presses on him, and none gets back.`, points: [[26, 0, 0], [100, 0, 0], [100, 0, 64], [26, 0, 64]], least: 0.24 },
  { title: "Stroke after stroke", who: "Ottie · fluid", color: ROLE.fluid, text: `Faster now. Each stroke lifts the ram ${mm} mm (it has ${NUM.area} times Ottie's area). The sill rises off the stand while the spring unloads and the tyre stays down.`, points: [[-135, 0, 0], [118, 0, 0], [118, 0, 96], [-135, 0, 300], [24, 0, 300]], least: 0.55 },
  { title: "The tyre leaves the floor", who: "You · the handle", color: HI, text: `Past ${C.DROOP} mm the spring hangs free and the jack takes the whole corner. ${C.STROKES} strokes in all lift the ram ${lift} mm, and the tyre hangs ${clear} mm clear: ${kg} kg on the grip holds ${C.LOAD} kg.`, points: CAR, least: 0.8 },
  { title: "You open the release screw", who: "You · the release screw", color: HI, text: `The needle backs off its seat. The car's weight pushes the oil out from under the ram, round Pinch, back into the reservoir.`, points: [[-86, 0, 0], [30, 0, 0], [30, 0, 90], [-86, 0, 170]], least: 0.32 },
  { title: "The car settles on its stand", who: "You · the release screw", color: HI, text: `The ram sinks ${lift} mm: the tyre lands, the spring takes the weight back and the sill settles on the stand. You close the screw.`, points: CAR, least: 0.8, hold: 2 },
];
export const FOCUS = ["", "ottie", "pinch", "ottie", "ottie", "", ""];
export const VIEWS = STEPS.map((s) => (s.points ? fitView(s.points.map(at), [WIDTH, HEIGHT], { pad: 18, least: s.least ?? 0.3 }) : [0, 0, WIDTH, HEIGHT]));

// Reach and the point of work: Ottie through the whole stroke (feet on the plunger face, paws on the pin), Pinch on
// his seat while it holds, at rest and straining.
export function crewChecks() {
  const base = { zp: C.ZP.top, vz: 0, idle: 0, done: false, gate: 0, strain: 0 };
  const zs = Array.from({ length: 7 }, (_, i) => C.ZP.bot + (C.STROKE * i) / 6);
  const po = zs.flatMap((zp) => [[`(feet at ${zp.toFixed(1)}, pushing)`, poses(C, { ...base, zp, vz: -20 }).ottie], [`(feet at ${zp.toFixed(1)}, rising)`, poses(C, { ...base, zp, vz: 20 }).ottie]]);
  const pp = [0, 0.5, 1].map((s) => [`(strain ${s})`, poses(C, { ...base, strain: s }).pinch]);
  const face = (l) => [C.PUMP.x + C.CREW.ottie.dx, C.CREW.ottie.y, parseFloat(l.slice(9))];
  const reach = checkReach(OTTIE, po, P) + checkReach(PINCH, pp, P);
  const work = checkWork(OTTIE, po, P, { end: "feet", work: face }) + checkWork(PINCH, pp, P, { end: "paws", work: poses(C, base).lip, near: 2.5 });
  console.log(`checkReach: ${reach} warnings · checkWork: ${work} warnings`);
  return reach + work;
}

export const LABEL = `A hydraulic bottle jack on a garage floor lifting the front corner of a car by the pinch weld under its sill. Jack and car are cut on one plane like a training model: the tyre and wheel show in section under the wheel arch, the sill box shows its reinforcement, and the door has its outer skin off. An axle stand stands under the weld beside the jack. The jack's oil is drawn amber, in the reservoir round the cylinder, under the ram and in the passages through the base. Ottie the otter stands in the pump's bore on its cup seal, gripping the crosshead the handle drives: he is the pump plunger, and his feet push the oil. Pinch the crab sits in a pocket in the base with his claws over the delivery passage: he is the check valve that keeps the oil under the ram. Each stroke lifts the ram ${mm} mm; ${C.STROKES} strokes lift it ${lift} mm, until the tyre hangs ${clear} mm off the floor, then the release screw lets the car down onto its stand.`;
export const KEYS = [
  { mark: "lit", label: "On duty: whoever is doing the work right now" },
  { mark: "raised", label: "Ottie, otter, fluid: the pump plunger, pushing the oil with his feet" },
  { mark: "raised", label: "Pinch, crab, holding: the delivery check valve, holding the oil under the ram" },
  { mark: "flat", label: "Hydraulic oil, the one thing in its own colour" },
];
export const CAPTION = `A bottle jack trades distance for force twice. The handle is a ${NUM.lever}:1 lever on the pump plunger, and the ram has ${NUM.area} times the plunger's area, so ${kg} kg on the grip makes the ${bar} bar that holds a ${C.LOAD} kg corner on a ${C.RAM_D} mm ram. The price is travel: each ${C.STROKE} mm plunger stroke moves ${NUM.cc} cm³ of oil and lifts the ram only ${mm} mm, so it takes ${C.STROKES} strokes to lift ${lift} mm. For the first ${C.DROOP} mm the car's spring unloads onto the jack and the tyre stays down; after that the jack holds the whole corner and the tyre leaves the floor. On each down stroke the plunger pushes oil past the delivery check valve; on the up stroke that valve shuts under the load and the suction valve lets fresh oil in from the reservoir. Opening the release screw connects the cylinder to the reservoir, and the car's weight pushes the oil back. The pump bore is drawn a little wide so the otter fits it.`;
