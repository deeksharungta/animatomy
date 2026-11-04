// The run's beats, their cameras, the words under the card, and the crew's reach and point-of-work checks.
import { checkReach, checkWork } from "../../kit/reach.mjs";
import { fitView } from "../../kit/steps.mjs";
import { C, P, WIDTH, HEIGHT, at, polar, coneR, CHOMP, ROO, ROLE } from "./model.mjs";
import { poses } from "./poses.mjs";

const HI = "var(--anatomy-hi)";
export const STEPS = [
  { title: "Meet the crew", who: "Chomp and Roo", color: HI, text: "Two animals run this mill: Chomp is the outer burr's teeth, and Roo is the spring that holds the cone up to them.", points: null, hold: 1.6 },
  { title: "You tighten the knob", who: "Roo · spring", color: ROLE.spring, text: "Five turns draw the shaft up 2.1 mm. The yoke lifts Roo, Roo lifts the cone, and the gap closes from 1.0 to 0.3 mm.", points: [polar(134, 42, 18), polar(314, 44, 18), [0, 0, 92], polar(45, 30, 20)] },
  { title: "You turn the head", who: "the cone", color: HI, text: "The head's square socket turns the shaft, and the cone's three coarse flutes sweep a corn each round the ring.", points: [polar(135, 46, 60), polar(315, 46, 60), [0, 0, 128], polar(45, 30, 70)] },
  { title: "Chomp cracks the corns", who: "Chomp · cutting", color: ROLE.cutting, text: "Each flute brings its corn to Chomp at the ring's lip. He bites, it splits into four, and the next flute picks a fresh corn off the heap.", points: [polar(300, 45, 82), polar(300, 12, 84), polar(300, 33, 108), polar(330, 18, 92)], least: 0.2 },
  { title: "Roo takes the kick", who: "Roo · spring", color: ROLE.spring, text: "Every crack shoves the cone down about 1 mm. Roo squashes and springs it straight back, so the gap returns to 0.3 mm.", points: [polar(136, 44, 26), polar(136, 18, 26), polar(136, 34, 54), polar(95, 31, 44)], least: 0.2 },
  { title: "Fine pepper falls out", who: "Chomp · cutting", color: ROLE.cutting, text: "The pieces are ground finer down the narrowing gap and fall out of the bottom: about 0.05 g for every corn.", points: [polar(135, 66, 2), polar(315, 66, 2), [0, 0, 70], polar(45, 70, 2)] },
  { title: "Stop, and loosen the knob", who: "Roo · spring", color: ROLE.spring, text: "You stop turning, and five turns back drop the shaft. Roo lowers the cone and the gap opens to 1.0 mm again.", points: [polar(135, 78, 0), polar(315, 78, 0), [0, 0, 232], polar(45, 78, 0)], hold: 1.8 },
];
export const FOCUS = ["", "roo", "", "chomp", "roo", "chomp", "roo"];
export const VIEWS = STEPS.map((s) => (s.points ? fitView(s.points.map(at), [WIDTH, HEIGHT], { pad: 18, least: s.least ?? 0.3 }) : [0, 0, WIDTH, HEIGHT]));

// Reach and the point of work, over both knob settings and a full kick, in every frame each critter is on duty.
const base = { s: 0, kick: 0, bite: 0, idle: 0, t: 0, near: false };
const STATES = [["coarse", base], ["fine", { ...base, s: C.LIFT }], ["mid-tighten", { ...base, s: C.LIFT / 2 }], ["at a crack", { ...base, s: C.LIFT, kick: 2, bite: 1 }], ["half a bite", { ...base, s: C.LIFT, kick: 1, bite: 0.5 }]];
const at3 = (label) => STATES.find(([l]) => l === label)[1];
const crackPoint = (st) => polar(C.CRACK_A, coneR(C.CORN_U) + C.CORN_R + 3.2, C.CONE_Z + st.s - st.kick + C.CORN_U + 1);
const racePoint = (st) => polar(C.ROO_ARM - 9, 30, C.CONE_Z + st.s - st.kick - C.RACE_H);
export function crewChecks() {
  const pc = STATES.map(([l, st]) => [`(${l})`, poses(C, st).chomp]);
  const pr = STATES.map(([l, st]) => [`(${l})`, poses(C, st).roo]);
  const reach = checkReach(CHOMP, pc, P) + checkReach(ROO, pr, P);
  const work = checkWork(CHOMP, pc, P, { end: "bite", work: (l) => crackPoint(at3(l.slice(1, -1))) }) +
    checkWork(ROO, pr, P, { end: "paws", work: (l) => racePoint(at3(l.slice(1, -1))) });
  console.log(`checkReach: ${reach} warnings · checkWork: ${work} warnings`);
  return reach + work;
}

export const LABEL = "A beech pepper mill standing in a saucer on a kitchen counter, its body and its steel burr ring cut in half so the mechanism shows, with a salt shaker, a ramekin, a chopping board and a spice shelf on the tiled wall. A square shaft runs from the knob on the domed head down to a steel cone, the inner burr, inside the ring. Peppercorns lie in a heap on the ring's shoulder, and each of the cone's three coarse flutes carries one round. Chomp the beaver stands on the ring and bites each corn as it reaches him, splitting it. Below the cone, Roo the kangaroo stands on a yoke on the shaft's end and pushes up on the cone's thrust race: he is the spring that holds the cone up into the ring, squashed by every crack. Ground pepper falls out of the bottom into the saucer.";
export const KEYS = [
  { mark: "lit", label: "On duty: whoever is doing the work right now" },
  { mark: "raised", label: "Chomp, beaver, cutting: the outer burr's teeth at the ring's lip" },
  { mark: "raised", label: "Roo, kangaroo, spring: the cone's spring, between the yoke and the thrust race" },
];
export const CAPTION = "A manual pepper mill cut in half. Turning the head turns a square shaft and the steel cone on it; the cone's coarse flutes carry the peppercorns to the outer burr ring, where they crack, and the pieces are ground finer in the narrowing gap between cone and ring before they fall out of the bottom. The knob on top sets the gap: five turns lift the shaft 2.1 mm and close it from 1.0 to 0.3 mm. A spring under the cone lets it give at each crack and pushes it straight back.";
