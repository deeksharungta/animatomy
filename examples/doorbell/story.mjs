import { fitView } from "../../kit/steps.mjs";
import { checkReach } from "../../kit/reach.mjs";
import { WIDTH, HEIGHT, C, P, K, at, KNOCK, ROCKY, ROLE } from "./model.mjs";
import * as M from "./mech.mjs";
import { partsKit, drawn } from "./moving.mjs";
import { poses } from "./poses.mjs";

export const Q = partsKit(K, P, C);
export const rest = () => ({ th: C.TH0, thT: C.TH0, om: 0, thV: 0, a: 0, aV: 0, c: M.contactOf(C, C.CLICK.pivot, C.CLICK.arm, C.TH0, -0.5, 0.05), cV: 0, ring: 0, strikes: 0, jam: false, stepT: 0, duty: "", focus: "", lit: "gong" });
export const draw0 = (S) => drawn(K, P, C, S, Q, M);

// Every paw and the beak must land through the hammer's whole swing and the click's whole lift.
export function reach() {
  const R = rest(), list = (spec, key, states) => checkReach(spec, states.map(([label, a, c]) => {
    const S = { ...R, a, c, jam: label === "jammed" };
    return [label, poses(C, S, draw0(S))[key]];
  }), P);
  const swing = [["cocked", -0.2, -0.3], ["at rest", 0, R.c], ["on the gong", C.HIT, R.c], ["jammed", 0, 0]];
  const warn = list(KNOCK, "knock", swing) + list(ROCKY, "rocky", swing);
  if (warn) console.warn(warn);
}

// Each beat's twist, in teeth from rest: cock to the tooth's tip, strike, back to the click, then a whole turn.
export const TARGET = [0, 0.95, 1.25, 0.5, 6];
export const SPEED = [0, 0.8, 0.8, 0.5, 3];
export const FOCUS = ["", "knock", "knock", "rocky", "knock"];

export const STEPS = [
  { title: "Meet the crew", who: "Knock and Rocky", color: "var(--anatomy-hi)", text: "Behind the door, Knock is the hammer and its spring, his beak its head. Rocky holds the click on the star wheel.", points: null, hold: 1.4 },
  { title: "You twist; a tooth cocks Knock", who: "Knock · spring", color: ROLE.spring, text: "The key turns a square spindle through the door. A tooth's ramp pushes the hammer's tail out, swinging Knock back against his spring.", points: [[-16, 14, -18], [46, 14, -22], [44, 20, 44], [-6, 30, 26]] },
  { title: "Knock strikes the gong", who: "Knock · spring", color: ROLE.spring, text: "The tail drops off the tooth's steep face. The spring throws the head onto the rim, it bounces clear, and the gong rings: ding.", points: [[-10, 20, -18], [46, 14, -22], [46, 20, 46], [14, 16, 46]] },
  { title: "Rocky holds", who: "Rocky · holding", color: ROLE.holding, text: "You twist back. A steep face jams on the click Rocky holds, so the wheel can't turn back and drive the hammer into the gong.", points: [[-46, 22, -28], [18, 14, -18], [-40, 22, 8], [18, 14, 16]], pace: 0.6 },
  { title: "One turn, six rings", who: "Knock · spring", color: ROLE.spring, text: "Twist on, briskly: each of the six teeth cocks and drops the hammer once, so one full turn rings the gong six times.", points: null, hold: 1.6 },
];
export const views = STEPS.map((s) => (s.points ? fitView(s.points.map(at), [WIDTH, HEIGHT], { pad: 16, least: 0.34 }) : [0, 0, WIDTH, HEIGHT]));

export const LABEL = "A twist doorbell on the inside of a front door, the door cut away through the key's spindle so the key outside shows. A square spindle turns a six-toothed star wheel on the bell's cast base plate. Knock the woodpecker clings to the hammer's stem and is the hammer and its spring: his beak follows the ball head at the rim of the brass gong. Rocky the raccoon, on a bracket below, holds the tail of the click whose pin rides the wheel's teeth.";

export const keys = [
  { mark: "lit", label: "On duty: the one whose part is moving now" },
  { mark: "raised", label: "Knock, woodpecker, spring: the hammer, its spring and its head" },
  { mark: "raised", label: "Rocky, raccoon, holding: the click that stops the wheel turning back" },
  { mark: "flat", label: "The gong, in brass: what the bell works on" },
];
