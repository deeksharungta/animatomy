import { fitView } from "../../kit/steps.mjs";
import { checkReach } from "../../kit/reach.mjs";
import { WIDTH, HEIGHT, C, K, P, PEN, KIT, at, ptA } from "./model.mjs";
import * as M from "./mech.mjs";
import { facetKit } from "./facets.mjs";
import { drawn } from "./moving.mjs";
import { poses } from "./poses.mjs";

export const ROCKY = { species: "raccoon", name: "Rocky", size: 10, role: "holding" };
export const ROO = { species: "kangaroo", name: "Roo", size: 15, role: "spring", wear: ["sweatband"] };
export const ROLE = { holding: "#E5484D", spring: "#E93D82" };
export const F = facetKit(KIT, P, PEN);

// The pen at rest with its tip out: a lug in the short notch at 90°, the button resting on it.
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
  const warn = list(ROCKY, "rocky") + list(ROO, "roo");
  if (warn) console.warn(warn);
  return { states, end: S };
}

// Each beat's thumb target: let it rest, press to the bottom, let go; press again, let go.
export const TARGET = [K.fFar, K.zpMin, K.fFar, K.zpMin, K.fFar];
export const FOCUS = ["", "rocky", "roo", "roo", "rocky"];

const CAM = [ptA(5.6, -90, 97), ptA(5.6, 90, 97), ptA(5.6, -90, 112), ptA(5.6, 90, 112), ptA(10, 70, 96)];
const TIP = [ptA(5, -90, -6), ptA(5, 90, -6), ptA(5, -90, 22), ptA(5, 90, 22), ptA(9, -38, 5)];
export const STEPS = [
  { title: "Meet the crew", who: "Rocky and Roo", color: "var(--anatomy-hi)", text: "Up top, Rocky the raccoon is the barrel's short notch: he holds the cam's lug in it. Down at the nose, Roo is the return spring.", points: null, hold: 1.4 },
  { title: "You press; Rocky lets go", who: "Rocky · holding", color: ROLE.holding, text: "The button's sawtooth crown shoves the cam down out of the notch. Below the ribs, a tooth's slope turns it 15°.", points: CAM },
  { title: "Roo pulls the tip in", who: "Roo · spring", color: ROLE.spring, text: "Let go, and Roo pushes the refill back up. The rib's slant turns the cam 30° more, into a long groove, and the tip goes 0.5 mm inside the nose.", points: TIP },
  { title: "Press again; Roo gives", who: "Roo · spring", color: ROLE.spring, text: "The button drives the refill down and the tip out 4.4 mm, squashing Roo. Up top the crown turns the cam another 15°.", points: TIP },
  { title: "Rocky catches the notch", who: "Rocky · holding", color: ROLE.holding, text: "Let go: the slant turns the cam into the next short notch, and Rocky holds it there against Roo. The tip stays 2.5 mm out.", points: CAM, hold: 1 },
];
export const views = STEPS.map((s) => (s.points ? fitView(s.points.map(at), [WIDTH, HEIGHT], { pad: 6, least: s.points === CAM ? 0.15 : 0.26 }) : [0, 0, WIDTH, HEIGHT]));

export const LABEL = "A retractable ballpoint pen held upright in a lab clamp over a notepad, its barrel cut away over the click mechanism and over the nose. Under the button's sawtooth crown, a cam with four lugs rides inside ribs that have long grooves and short notches. Rocky the raccoon stands on the rim of the upper cutaway and holds a lug in its notch. Roo the kangaroo stands on the nose's seat ring, pushing up the refill's collar as its return spring.";

export const keys = [
  { mark: "lit", label: "On duty: the one whose part is moving now" },
  { mark: "raised", label: "Rocky, raccoon, holding: the short notch that keeps the tip out" },
  { mark: "raised", label: "Roo, kangaroo, spring: the return spring under the refill's collar" },
  { mark: "flat", label: "The ink, in blue: what the pen works on" },
];
