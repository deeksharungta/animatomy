import { fitView } from "../../kit/steps.mjs";
import { checkReach, checkWork } from "../../kit/reach.mjs";
import { WIDTH, HEIGHT, C, P, at, PINCH, ROO, ROLE } from "./model.mjs";
import { rest, simStep } from "./sim.mjs";
import { poses } from "./crew.mjs";

// The numbers the captions quote, measured on the model itself.
export const FACTS = (() => {
  // Play the story's own actions: warm to 192 °C, two pulls, then let the new stick melt; then switch off.
  const S = { ...rest(C), power: true, rocker: 1 }, dt = 1 / 60;
  let t = 0;
  while (S.T < 192 && t < 900) { simStep(S, C, 0.05, 0.05); t += 0.05; }
  const warm = t, hot = Math.round(S.T), idle = Math.round(S.W);
  let lo = 999, hi = 0;
  const run = (secs, w = 1) => { for (let i = 0; i < secs / dt; i++) { simStep(S, C, dt, w * dt); lo = Math.min(lo, S.T); hi = Math.max(hi, S.W); } };
  for (let k = 0; k < 2; k++) { S.pull = true; run(1.6); S.pull = false; run(2.6); }
  while (S.solid > 1) run(0.5, 5);
  const lo2 = lo, hi2 = hi;
  S.power = false;
  let cool = 0;
  while (S.T > 40 && cool < 8000) { simStep(S, C, 0.5, 0.5); cool += 0.5; }
  const Rh = (8 * C.MU0 * C.L_ORI * 1e-3) / (Math.PI * Math.pow(C.NOZ.orifice * 1e-3, 4));
  const v = (((C.FORCE / (C.AREA * 1e-6)) - C.CRACK * 1e5) / Rh) / (C.AREA * 1e-9);
  return { warm, hot, idle, lo: Math.round(lo2), peak: Math.round(hi2), cool: Math.round(cool / 60),
    pull: +(C.STROKE / v).toFixed(1), grams: +((C.STROKE * C.AREA * C.RHO) / 1000).toFixed(2), cold: Math.round((C.V * C.V) / C.R0) };
})();


// Every paw on its handle, and Pinch's claws and Roo's paws at their points of work, at both ends of the stroke.
const at3 = (u, grip) => poses(C, { ...rest(C), u, grip, power: true });
const ENDS = [[0, "at rest"], [C.STROKE / 2, "mid-stroke"], [C.STROKE, "at full stroke"]];
export const reachWarnings =
  checkReach(PINCH, ENDS.map(([u, w]) => [w, at3(u, 1).pinch]), P) + checkReach(ROO, ENDS.map(([u, w]) => [w, at3(u, 0).roo]), P) +
  checkWork(PINCH, ENDS.map(([u, w]) => [w, at3(u, 1).pinch]), P, { end: "paws", work: (l, p) => p.paws.l }) +
  checkWork(ROO, ENDS.map(([u, w]) => [w, at3(u, 0).roo]), P, { end: "paws", work: (l, p) => p.paws.l });

const F = FACTS, Z = C.ZC;
export const STEPS = [
  { title: "Meet the crew", who: "Volta, Pinch and Roo", color: "var(--anatomy-hi)", text: "Three animals run this glue gun: Volta on the heater's live wire, Pinch on the feed carriage, Roo as its return spring.", points: null, hold: 1.6 },
  { title: "You switch on, Volta carries it", who: "Volta · power", color: ROLE.power, text: `Current runs through Volta to the two PTC stones under the block. Cold, they take about ${F.cold} W.`, points: [[-58, -2, Z - 34], [-12, 0, Z - 34], [-12, 0, Z - 4], [-58, 0, Z - 4]] },
  { title: "The stones turn themselves down", who: "Volta · power", color: ROLE.power, text: `The block and the old glue in its bore warm up. Past 175 °C the stones' resistance climbs tenfold every 24 °C, so after about ${Math.round(F.warm / 60)} minutes the block settles near ${F.hot} °C on about ${F.idle} W.`, points: [[-36, 0, Z - 34], [30, 0, Z - 34], [30, 0, Z + 14], [-36, 0, Z + 14]] },
  { title: "You pull, Pinch bites", who: "Pinch · moving", color: ROLE.moving, text: `The trigger pushes the carriage 10 mm. Pinch's claws close on the stick and drive it into the silicone sleeve.`, points: [[-104, 0, Z - 22], [-60, 0, Z - 22], [-104, 0, Z + 8], [-60, 12, Z + 6]] },
  { title: "Roo throws the carriage back", who: "Roo · spring", color: ROLE.spring, text: "You let go. Roo pushes the carriage back to its stop; Pinch opens his claws and slides back along the stick, which stays put.", points: [[-104, 0, Z - 22], [-58, 0, Z - 22], [-58, 10, Z - 6], [-104, 10, Z - 6]] },
  { title: "The stick is the piston", who: "the glue", color: "var(--anatomy-hi)", text: `Pull again. Sealed in the sleeve, the solid stick pushes the melt ahead of it at ${C.PFULL} bar; the ball lifts and ${F.grams} g of glue runs out in ${F.pull} s.`, points: [[-24, 0, Z - 14], [70, 0, C.BOX.z - 2], [70, 0, Z + 10], [-24, 0, Z + 12]] },
  { title: "No drip", who: "the nozzle", color: "var(--anatomy-hi)", text: "You let go and the pressure falls. A spring pushes the steel ball back onto its seat, and the flow stops at the tip.", points: [[26, 0, Z - 8], [58, 0, Z - 8], [58, 0, Z + 8], [26, 0, Z + 8]], least: 0.15 },
  { title: "More current for the melt", who: "Volta · power", color: ROLE.power, text: `The new stick melts in the bore and takes its heat from the block. As the block dips to about ${F.lo} °C the stones' resistance falls, and Volta carries up to ${F.peak} W.`, points: [[-46, 0, Z - 34], [30, 0, Z - 34], [30, 0, Z + 14], [-46, 0, Z + 14]] },
  { title: "Switch off and let it cool", who: "everyone", color: "var(--anatomy-hi)", text: `You switch off at the strip. The bead on the lid sets in a minute; the block takes about ${F.cool} minutes to cool.`, points: null, hold: 2 },
];
export const views = STEPS.map((s) => (s.points ? fitView(s.points.map(at), [WIDTH, HEIGHT], { pad: 22, least: s.least ?? 0.3 }) : [0, 0, WIDTH, HEIGHT]));

export const LABEL = "A hot glue gun standing on its wire stand on a craft bench, its near clamshell half taken off and its barrel cut along its length, run by three animals. A glue stick enters at the back and runs over a sliding carriage, where Pinch the crab grips it, through a silicone sleeve into an aluminium heater block with two PTC heating stones under it, and the melt runs on through a brass nozzle with a spring-loaded ball onto the lid of a plywood box. Roo the kangaroo stands between the carriage and a bulkhead as its return spring; Volta the electric eel lies along the live wire to the heater. The trigger pivots below the carriage. A power strip, a carton of sticks, loose sticks and a steel rule are on the bench, and a pegboard wall is behind.";

export const keys = [
  { mark: "lit", label: "On duty: whoever is doing the work right now" },
  { mark: "raised", label: "Volta, electric eel, power: the live wire to the heater" },
  { mark: "raised", label: "Pinch, crab, moving: the feed claw that drives the stick" },
  { mark: "raised", label: "Roo, kangaroo, spring: the carriage's return spring" },
];
