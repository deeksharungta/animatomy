// The run's beats, their cameras, the words under the card, and the crew's reach and point-of-work checks. Every
// number in the captions comes from running the page's own model here, in real time.
import { checkReach, checkWork } from "../../kit/reach.mjs";
import { fitView } from "../../kit/steps.mjs";
import { C, P, WIDTH, HEIGHT, at, OTTIE, MO, ROLE } from "./model.mjs";
import { fresh, stepModel } from "./physics.mjs";
import { poses, levers } from "./poses.mjs";

// One flush in real time, 1 ms steps: when Ottie seals, what ran out, when Mo shuts the valve.
const RUN = (() => {
  const S = { ...fresh(C), push: true, run: true }, dt = 0.001;
  let sealed = 0, peak = 0;
  while (!sealed && S.clock < 30) { stepModel(C, S, dt); peak = Math.max(peak, S.qout); if (S.clock > 1 && S.hop === 0) sealed = S.clock; }
  const out = S.out;
  while (S.open > 0 && S.clock < 300) stepModel(C, S, dt);
  return { sealed, out, peak, full: S.clock };
})();
export const NUM = { flush: RUN.sealed.toFixed(1), litres: RUN.out.toFixed(1), peak: RUN.peak.toFixed(1), refill: Math.round(RUN.full) };

const HI = "var(--anatomy-hi)";
// The cistern itself, with a sliver of the pan under it: the opening and closing cameras, so the crew read on a phone.
const TANK = [[-214, 15, 404], [214, 15, 404], [-214, 192, 400], [214, 192, 400], [-214, 15, 742], [214, 192, 742], [0, 250, 380]];
const OT = [[10, 70, 414], [90, 170, 414], [54, 118, 530], [100, 140, 690], [-10, 60, 560]];
export const STEPS = [
  { title: "Meet the crew", who: "Ottie and Mo", color: HI, text: "Two animals run this cistern: Ottie is the flush valve's flapper, sitting on its seat, and Mo is the float that works the fill valve.", points: TANK, least: 0.3, hold: 1.6 },
  { title: "You press the handle", who: "Ottie · fluid", color: ROLE.fluid, text: "The trip arm swings up and its chain lifts Ottie off the seat. Water rushes out under her, slowed five times.", points: OT, pace: 0.2 },
  { title: "Mo drops with the water", who: "Mo · sensing", color: ROLE.sensing, text: `The water falls and Mo's weight pulls the float arm down. Its short end lifts the plunger: the fill valve opens.`, points: [[-200, 40, 414], [-200, 60, 640], [10, 80, 560], [-10, 80, 470], [-150, 180, 414]], pace: 0.2 },
  { title: "Ottie sinks and seals", who: "Ottie · fluid", color: ROLE.fluid, text: `Ottie rides down with the falling water and lands back on the seat, sealing it: ${NUM.litres} L went out in ${NUM.flush} s.`, points: OT, least: 0.26, pace: 0.2 },
  { title: "The water lifts Mo", who: "Mo · sensing", color: ROLE.sensing, text: "The fill valve pours water in through the hush tube, and a share down the refill tube to the pan. Mo floats up as it rises.", points: [[-200, 40, 414], [-200, 60, 640], [60, 60, 580], [10, 120, 470], [-150, 180, 414]] },
  { title: "Mo shuts the valve", who: "Mo · sensing", color: ROLE.sensing, text: `At the water line his float arm presses the plunger home and the flow stops: full again ${NUM.refill} s after you pressed.`, points: TANK, least: 0.3, hold: 2 },
];
export const FOCUS = ["", "ottie", "mo", "ottie", "mo", "mo"];
export const WARP = [1, 1, 1, 1, 8, 5];
export const VIEWS = STEPS.map((s) => (s.points ? fitView(s.points.map(at), [WIDTH, HEIGHT], { pad: 18, least: s.least ?? 0.3 }) : [0, 0, WIDTH, HEIGHT]));

// Reach and the point of work: Ottie's paws on the ring through the lift and the float, her feet on the seat when
// it is shut; Mo's paws on the arm's end from the stop to shut.
export function crewChecks() {
  const st = (o) => ({ ...fresh(C), ...o });
  const hops = [0, 12, 24, 36, C.HOP].map((hop) => [`(lifted ${hop} mm)`, poses(C, st({ hop, lift: hop > 0 ? 1 : 0 })).ottie]);
  const seated = [0, 0.4, 0.8].map((lev) => [`(seated, handle ${lev})`, poses(C, st({ hop: 0, lev })).ottie]);
  const paws = [C.STOP, 95, 110, 125, 140, 150, C.SHUT].map((paw) => [`(arm's end at ${paw})`, poses(C, st({ paw })).mo]);
  const tipAt = (l) => levers(C, st({ paw: parseFloat(l.slice(14)) })).tip;
  const ringAt = (l) => levers(C, st({ hop: parseFloat(l.slice(8)) })).ring;
  const reach = checkReach(OTTIE, [...hops, ...seated], P) + checkReach(MO, paws, P);
  const work = checkWork(OTTIE, seated, P, { end: "feet", work: [C.SEAT.x, C.SEAT.y, C.Z0 + C.SEAT.top] }) +
    checkWork(OTTIE, hops, P, { end: "l", work: ringAt }) +
    checkWork(MO, paws, P, { end: "paws", work: tipAt });
  console.log(`checkReach: ${reach} warnings · checkWork: ${work} warnings`);
  return reach + work;
}

export const LABEL = `A close-coupled toilet in a tiled bathroom corner, its cistern's lid lifted off and leaning on the wall, and the cistern's front wall cut away so its inside shows, full of water, the one thing drawn in its own colour, pale blue. In the middle of the floor is the flush valve's seat with an overflow tube behind it, and Ottie the otter sits on the seat: she is the flapper. A chain hangs from a trip arm on the handle's shaft down to a ring in her paws. On the left a fill valve stands on a riser fed by a braided hose from an angle stop on the wall; its float arm reaches into the tank and Mo the sloth, in glasses, hangs from its end: he is the float. Press the handle and the chain lifts Ottie, the water runs out under her into the pan in about ${NUM.flush} seconds, Mo sinks with it and opens the fill valve, Ottie sinks back onto the seat, and the water lifts Mo until his arm shuts the valve.`;
export const KEYS = [
  { mark: "lit", label: "On duty: whoever is doing the work right now" },
  { mark: "raised", label: "Ottie, otter, fluid: the flush valve's flapper, on the seat; the chain lifts her and she floats" },
  { mark: "raised", label: "Mo, sloth, sensing: the float, hanging from the float arm; his height opens and shuts the fill valve" },
  { mark: "raised", label: "The water, in its own colour: about 6 L above the seat when full" },
];
export const CAPTION = `A toilet cistern holds about 6 L above its flush valve. Pressing the handle swings a trip arm up, and its chain lifts the flapper off the 51 mm seat. The flapper is buoyant, so it floats open, sinking with the level as the water runs out at up to ${NUM.peak} L/s and settling back onto the seat at the bottom: ${NUM.litres} L in ${NUM.flush} s. As the water falls, the float drops and its arm lifts the fill valve's plunger, so water runs in at 9 L/min, a fifth of it down the refill tube to top up the pan's seal. The rising water lifts the float until its arm presses the plunger home at the water line, ${NUM.refill} s after the press. The refill plays sped up; the readout keeps the real clock.`;
