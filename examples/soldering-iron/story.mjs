import { fitView } from "../../kit/steps.mjs";
import { checkReach } from "../../kit/reach.mjs";
import { WIDTH, HEIGHT, C, P, at, VOLTA, PINCH, ROO, ROLE } from "./model.mjs";
import { NODES, heatRun, coldState } from "./thermal.mjs";
import { poses } from "./moving.mjs";

// The iron cold and switched off at the wall: the state every run starts from.
export const rest = () => ({ ...coldState(), u: 0, power: false, rocker: 0, cur: 0, rodV: 0, t: 0, stepT: 0, clock: 0, duty: "", slug: C.T0, cycles: 0, swap: -1 });

// The numbers the captions quote, measured on the model itself: time to the first release, the share of time
// the heater is on once it is holding, the power that replaces, and the point's temperature.
export const FACTS = (() => {
  const S = coldState();
  let t = 0;
  while (S.held && t < 400) { heatRun(S, NODES, C, 0.1, true); t += 0.1; }
  const warm = Math.round(t / 5) * 5;
  heatRun(S, NODES, C, 120, true);
  const on0 = S.onT, r0 = S.runT;
  let lo = 999, hi = 0;
  for (let i = 0; i < 2400; i++) { heatRun(S, NODES, C, 0.1, true); lo = Math.min(lo, S.T.at(-1)); hi = Math.max(hi, S.T.at(-1)); }
  const duty = (S.onT - on0) / (S.runT - r0);
  let cool = 0;
  while (S.T.at(-1) > 45 && cool < 3000) { heatRun(S, NODES, C, 1, false); cool += 1; }
  return { warm, duty: Math.round(duty * 100), watts: Math.round(duty * C.WATTS), point: Math.round((lo + hi) / 2), cool: Math.round(cool / 60) };
})();

// Every paw on its handle, at both ends of the rod's travel, held and let go.
const poseAt = (u, held) => poses(C, { ...rest(), u, held, power: true, cur: 1, slug: 300 });
const REACH = [[0, true, "held"], [-C.TRAVEL, false, "let go"]];
export const reachWarnings =
  checkReach(ROO, REACH.map(([u, h, w]) => [w, poseAt(u, h).roo]), P) + checkReach(PINCH, REACH.map(([u, h, w]) => [w, poseAt(u, h).pinch]), P);

const F = FACTS;
export const STEPS = [
  { title: "Meet the crew", who: "Volta, Pinch and Roo", color: "var(--anatomy-hi)", text: "Three animals run this soldering iron: Volta on the live wire, Pinch on the magnet, Roo on the switch spring.", points: null, hold: 1.6 },
  { title: "You switch on, Volta carries it", who: "Volta · power", color: ROLE.power, text: "While the tip is cold, Pinch holds the magnet to the slug at its back, so the contacts are closed. Current runs from Volta through them into the heater's nichrome coil.", points: [[-62, -7, 44], [-28, 6, 44], [-62, 0, 62], [-1, 0, 58]] },
  { title: "The heat runs down the copper", who: "the tip", color: "var(--anatomy-hi)", text: `The coil heats its ceramic former, and the heat flows into the tip's copper core and on to the point. The slug reaches 370 °C in about ${F.warm} seconds.`, points: [[-2, 0, 42], [93, 0, 42], [-2, 0, 62], [93, 0, 62]] },
  { title: "Roo snaps the contacts open", who: "Roo · spring", color: ROLE.spring, text: "At 370 °C the slug passes its Curie point and stops being magnetic. Pinch loses his grip, Roo pushes the rod back 2 mm, and the heater goes off.", points: [[-38, -5, 44], [-36, 6, 44], [-6, 6, 60], [0, 0, 58]] },
  { title: "Pinch grabs again", who: "Pinch · holding", color: ROLE.holding, text: "The point gives a little heat to the air. At 364 °C the slug is magnetic again: Pinch pulls the magnet back in against Roo and the contacts close.", points: [[-16, 4, 44], [2, -2, 44], [-16, 0, 60], [2, 0, 60]] },
  { title: "On and off, at 370 °C", who: "Volta · power", color: ROLE.power, text: `Holding temperature, the heater is on about ${F.duty}% of the time: ${F.watts} W, just what the tip loses to the air. The point stays near ${F.point} °C.`, points: [[-40, 0, 42], [42, 0, 42], [-40, 0, 64], [42, 0, 64]] },
  { title: "Switch off and let it cool", who: "everyone", color: "var(--anatomy-hi)", text: `You switch off at the wall. The heat drains from the point into the air, and in about ${F.cool} minutes the tip is cool enough to touch.`, points: null, hold: 2 },
];
export const views = STEPS.map((s) => (s.points ? fitView(s.points.map(at), [WIDTH, HEIGHT], { pad: 22, least: 0.28 }) : [0, 0, WIDTH, HEIGHT]));

export const LABEL = "A soldering iron with a magnetic temperature switch, lying in its stand on a workbench, cut in half along its length so its insides show, run by three animals. The tip's copper core runs from a chisel point back into the heater, where a nichrome coil wound on a ceramic former surrounds it, and ends in a small slug of magnetic alloy. Behind the slug, in the handle, a magnet on a sliding rod is held against the heater's back by Pinch the crab; the rod carries a contact bridge that closes two contacts, and a coil spring, which Roo the kangaroo is, pushes it back when the magnet lets go. Volta the electric eel lies along the live wire to the contacts. The cord runs to a switched socket on a pegboard wall; a solder spool, a tin of tip tinner and a small circuit board sit on the bench.";

export const keys = [
  { mark: "lit", label: "On duty: whoever is doing the work right now" },
  { mark: "raised", label: "Volta, electric eel, power: the live wire to the switch" },
  { mark: "raised", label: "Pinch, crab, holding: the magnet's grip on the slug" },
  { mark: "raised", label: "Roo, kangaroo, spring: the spring that opens the switch" },
];
