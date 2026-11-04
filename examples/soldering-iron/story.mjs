import { fitView } from "../../kit/steps.mjs";
import { checkReach, checkWork } from "../../kit/reach.mjs";
import { WIDTH, HEIGHT, C, P, at, VOLTA, EMBER, ROO, ROLE } from "./model.mjs";
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

// Every paw on its handle and every working end at its point of work, over each critter's duty: Volta while the
// current first flows, Roo as he snaps the rod open, Ember as she presses it shut and holds it while the coil heats.
const poseAt = (u, o = {}) => poses(C, { ...rest(), u, held: u === 0, power: true, cur: 1, slug: 300, TH: 300, ...o });
const TOP = C.BOARD.z + C.BOARD.h;
const ROD = [0, -0.5, -1, -1.5, -2];
const rooDuty = ROD.map((u) => [`snapping open at ${u} mm`, poseAt(u, { rodV: -2 }).roo]);
const emberDuty = ROD.map((u) => [`pressing shut at ${u} mm`, poseAt(u, { rodV: 2 }).ember]).concat([["holding shut", poseAt(0, { TH: 400, slug: 368 }).ember]]);
// Roo's paws on the collar's lug face, Ember's on the contact bridge's back face, wherever the rod is.
const uOf = (w) => (w.includes(" at ") ? +w.split(" at ")[1].split(" ")[0] : 0);
const rooWork = (w) => [C.COLLAR.x1 + uOf(w), 7.4, C.ZC - 3.6];
const emberWork = (w) => [C.BRIDGE.x0 + uOf(w), 4, C.ZC - 2.5];
// The eel's working end is its snout, the head of its path, on the live terminal at the near leaf's foot.
const voltaDuty = [["switched on", poseAt(0, { TH: C.T0 }).volta], ["warming", poseAt(0, { TH: 50 }).volta]].map(([w, p]) => [w, { ...p, bite: p.path[0] }]);
export const reachWarnings = checkReach(ROO, rooDuty, P) + checkReach(EMBER, emberDuty, P);
export const workWarnings =
  checkWork(ROO, rooDuty, P, { end: "paws", work: rooWork }) +
  checkWork(EMBER, emberDuty, P, { end: "paws", work: emberWork }) +
  checkWork(VOLTA, voltaDuty, P, { end: "bite", work: [C.CONTACT_X + 0.4, C.CONTACTS[1], TOP + 0.4] });

const F = FACTS;
export const STEPS = [
  { title: "Meet the crew", who: "Volta, Ember and Roo", color: "var(--anatomy-hi)", text: "Three animals run this soldering iron: Volta on the live wire, Ember pressing the contacts shut, and Roo, the switch's spring, pushing them apart.", points: null, hold: 1.6 },
  { title: "You switch on, Volta carries it", who: "Volta · power", color: ROLE.power, text: "While the tip is cold, the magnet clings to the slug at its back and Ember presses the contact bridge shut against Roo's spring. Current runs from Volta through the contacts into the heater's nichrome coil.", points: [[-62, -7, 44], [-28, 8, 44], [-62, 0, 62], [-1, 0, 58]] },
  { title: "Ember keeps the heat on", who: "Ember · heat", color: ROLE.heat, text: `As long as Ember holds the contacts shut, the coil heats, and the heat flows into the tip's copper core and on to the point. The slug reaches 370 °C in about ${F.warm} seconds.`, points: [[-44, 8, 44], [93, 0, 42], [-44, 0, 62], [93, 0, 62]] },
  { title: "Roo snaps the contacts open", who: "Roo · spring", color: ROLE.spring, text: "At 370 °C the slug passes its Curie point and the magnet lets go. Without it Ember can't hold out: Roo's spring overpowers her and snaps the rod back 2 mm, and the heater goes off.", points: [[-44, -5, 44], [-44, 8, 44], [-2, 6, 60], [4, 0, 58]] },
  { title: "Ember presses them shut again", who: "Ember · heat", color: ROLE.heat, text: "The point gives a little heat to the air. At 364 °C the slug is magnetic again: the magnet pulls, Ember pushes the contacts shut against Roo, squeezing him up small, and the heater comes back on.", points: [[-44, 8, 44], [4, -2, 44], [-44, 0, 60], [4, 0, 60]] },
  { title: "On and off, at 370 °C", who: "Ember · heat", color: ROLE.heat, text: `Ember and Roo push the contacts to and fro. Holding temperature, the heater is on about ${F.duty}% of the time: ${F.watts} W, just what the tip loses to the air. The point stays near ${F.point} °C.`, points: [[-44, 0, 42], [42, 0, 42], [-44, 0, 64], [42, 0, 64]] },
  { title: "Switch off and let it cool", who: "everyone", color: "var(--anatomy-hi)", text: `You switch off at the wall. The heat drains from the point into the air, and in about ${F.cool} minutes the tip is cool enough to touch.`, points: null, hold: 2 },
];
export const views = STEPS.map((s) => (s.points ? fitView(s.points.map(at), [WIDTH, HEIGHT], { pad: 22, least: 0.28 }) : [0, 0, WIDTH, HEIGHT]));

export const LABEL = "A soldering iron with a magnetic temperature switch, lying in its stand on a workbench, cut in half along its length so its insides show, run by three animals. The tip's copper core runs from a chisel point back into the heater, where a nichrome coil wound on a ceramic former surrounds it, and ends in a small slug of magnetic alloy. Behind the slug, in the handle, a magnet on a sliding rod clings to the heater's back while the slug is below 370 °C; the rod carries a contact bridge that closes two contacts. Ember the fennec fox stands behind the bridge with her paws on it, pressing it onto the contacts so the coil heats, and Roo the kangaroo, braced on the rod's collar, is the coil spring that overpowers her and snaps the contacts open when the magnet lets go. Volta the electric eel lies along the live wire with his snout on the near contact. The cord runs to a switched socket on a pegboard wall; a solder spool, a tin of tip tinner and a small circuit board sit on the bench.";

export const keys = [
  { mark: "lit", label: "On duty: whoever is doing the work right now" },
  { mark: "raised", label: "Volta, electric eel, power: the live wire, snout on the contact" },
  { mark: "raised", label: "Ember, fennec fox, heat: presses the contacts shut to keep the heater on" },
  { mark: "raised", label: "Roo, kangaroo, spring: the spring that snaps the contacts open" },
];
