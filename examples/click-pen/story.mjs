import { fitView } from "../../kit/steps.mjs";
import { checkReach } from "../../kit/reach.mjs";
import { WIDTH, HEIGHT, C, K, P, PEN, KIT, at, ptA } from "./model.mjs";
import * as M from "./mech.mjs";
import { facetKit } from "./facets.mjs";
import { drawn } from "./moving.mjs";
import { poses } from "./poses.mjs";

export const ROCKY = { species: "raccoon", name: "Rocky", size: 8.4, role: "holding" };
export const ROO = { species: "kangaroo", name: "Roo", size: 8.2, role: "spring" };
export const ROLE = { holding: "#E5484D", spring: "#E93D82" };
export const F = facetKit(KIT, P, PEN);

// The pen at rest with its tip out: a lug in each short notch, the button resting on them.
export function rest() {
  const S = { f: K.fFar, fT: K.fFar, uc: 1.17, h: 0, zp: 0, hV: 0, uV: 0, stepT: 0, clicks: 0, duty: "", focus: "", lit: "button" };
  M.stepModel(S, 0.4, K);
  return { ...S, hV: 0, uV: 0, stepT: 0 };
}
export const draw0 = (S) => drawn(KIT, P, C, K, S, F, PEN);

// Play a press or a release on the model alone, keeping every state on the way.
function stroke(S, fT) {
  const list = [];
  S.fT = fT;
  for (let i = 0; i < 300; i++) { M.stepModel(S, 0.01, K); if (i % 6 === 0) list.push({ ...S }); }
  return list;
}

// Every claw and paw must land through two whole clicks: out, pressed, in, pressed, out again.
export function reach() {
  const S = rest(), states = [{ ...S }, ...stroke(S, K.zpMin), ...stroke(S, K.fFar), ...stroke(S, K.zpMin), ...stroke(S, K.fFar)];
  const list = (spec, key) => checkReach(spec, states.map((s, i) => [`${key} ${i} h ${s.h.toFixed(2)} uc ${s.uc.toFixed(2)}`, poses(C, s, draw0(s), F)[key]]), P);
  list(ROCKY, "rocky");
  list(ROO, "roo");
  return { states, end: S };
}

// Each beat's thumb target: let it rest, press to the bottom, let go; press again, let go.
export const TARGET = [K.fFar, K.zpMin, K.fFar, K.zpMin, K.fFar];
export const FOCUS = ["", "rocky", "roo", "roo", "rocky"];

const up = (p, dz) => [p[0], p[1], p[2] + dz];
const CAM = [ptA(5.6, 90, 94), ptA(5.6, 270, 94), ptA(5.6, 90, 106), ptA(5.6, 270, 106), up(ptA(5, 270, 97.4), 9.5), ptA(6, 180, 100)];
const TIP = [ptA(1.6, 180, -3), ptA(5.6, 90, 23), ptA(5.6, 270, 23), up(ptA(3.4, 270, 12), 8.5), ptA(5.6, 180, 10)];
export const STEPS = [
  { title: "Meet the crew", who: "Rocky and Roo", color: "var(--anatomy-hi)", text: "In the cam, Rocky the raccoon is a short notch: he holds a lug back against the spring. At the nose, Roo is the return spring behind the refill's collar.", points: null, hold: 1.4 },
  { title: "You press; Rocky lets go", who: "Rocky · holding", color: ROLE.holding, text: "The button's sawtooth crown shoves the cam out of Rocky's paws. Past the ribs, a tooth's slope turns it 15°.", points: CAM },
  { title: "Roo pulls the tip in", who: "Roo · spring", color: ROLE.spring, text: "Let go, and Roo shoves the refill back. The rib's slant turns the cam 30° more, into a long groove, and the tip goes 0.5 mm inside the nose.", points: TIP },
  { title: "Press again; Roo gives", who: "Roo · spring", color: ROLE.spring, text: "The button drives the refill forward and the tip out 4.4 mm, squashing Roo. In the cam the crown turns it another 15°.", points: TIP },
  { title: "Rocky catches the notch", who: "Rocky · holding", color: ROLE.holding, text: "Let go: the slant turns the next lug round into Rocky's paws, and he holds it there against Roo. The tip stays 2.5 mm out.", points: CAM, hold: 1 },
];
export const views = STEPS.map((s) => (s.points ? fitView(s.points.map(at), [WIDTH, HEIGHT], { pad: 8, least: 0.13 }) : [0, 0, WIDTH, HEIGHT]));

export const LABEL = "A 6:1 cutaway model of a retractable ballpoint lying on a display stand on a desk, its barrel cut in half along its length so the refill, spring, threads, ribs and cam show. A notebook with a written line, a pen cup holding the real pen, sticky notes, an eraser and a ruler sit round it. Rocky the raccoon stands on the barrel's far cut edge by the cam and pulls a lug back into its notch. Roo the kangaroo stands on the nose's far cut edge and pushes the refill's collar as its return spring.";

export const keys = [
  { mark: "lit", label: "On duty: the one whose part is moving now" },
  { mark: "raised", label: "Rocky, raccoon, holding: the short notch that keeps the tip out" },
  { mark: "raised", label: "Roo, kangaroo, spring: the return spring behind the refill's collar" },
  { mark: "flat", label: "The ink, in blue: what the pen works on" },
];
