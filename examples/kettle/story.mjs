import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { critter } from "../../kit/critters.mjs";
import { fitView } from "../../kit/steps.mjs";
import { WIDTH, HEIGHT, C, P, at, ROO, VOLTA, MO, CRUMB, ROLE } from "./model.mjs";
import { dynamic, poses } from "./moving.mjs";

// The kettle full and cold, switch off: the state every run starts from.
export const rest = () => ({
  g: C.FILL, T: C.T0, plateT: C.T0, Td: C.T0, rock: 1, want: 1, snapped: false, snap: 0, bdOpen: false, dry: 0,
  asleep: false, stamp: false, hop: 0, current: 0, steam: 0, boil: 0, fizz: 0, haze: 0, clock: 0, clockB: 0,
  warm: 0, duty: "", swap: -1, fade: 1, stepT: 0, lost: 0,
});

// Every paw must land on its handle in every pose the run passes through.
const K = { ...k, ...L };
const reach = (spec, pose, what) => { for (const [paw, short] of Object.entries(critter(spec, pose, P).reach ?? {})) if (short > 0.3) console.warn(`${spec.name}'s ${paw} paw is ${short.toFixed(1)} short ${what}`); };
for (const snap of [0, 0.5, 1]) for (const rock of [0, 1]) {
  const S = { ...rest(), snap, rock }, p = poses(C, S, dynamic(K, P, C, S));
  reach(MO, p.mo, `of the trip bar at snap ${snap}, rocker ${rock}`);
}
for (const dry of [0, 0.25, 0.5, 0.75, 1]) { const S = { ...rest(), dry }, p = poses(C, S, dynamic(K, P, C, S)); reach(CRUMB, p.crumb, `of the boil-dry leaf at ${dry}`); }

const v = (...pts) => pts;
export const STEPS = [
  { title: "Meet the crew", who: "Roo, Volta, Mo and Crumb", color: "var(--anatomy-hi)", text: "Four animals run this kettle: Roo on the switch, Volta on the live wire, Mo on the steam switch and Crumb on the boil-dry cut-out.", points: null, hold: 1.6 },
  { title: "Roo switches it on", who: "Roo · spring", color: ROLE.spring, text: "Roo stamps the paddle down. The toggle spring holds it there, and the link rod lifts the leaf onto its contact.", points: v([-106, 0, 28], [-54, 0, 28], [-54, 0, 68], [-106, 0, 68]) },
  { title: "Volta heats the water", who: "Volta · power", color: ROLE.power, text: "2.2 kW runs from the connector along Volta into the element under the plate. A litre goes from 20 °C to 100 °C in under three minutes.", points: v([-64, 0, 9], [14, 0, 9], [14, -12, 36], [-64, -12, 36]) },
  { title: "Steam finds Mo", who: "Mo · sensing", color: ROLE.sensing, text: "At the boil, steam runs down the tube into Mo's cup. When his disc passes 95 °C it snaps and he drops with the trip bar.", points: v([-86, 0, 28], [-50, 0, 28], [-50, -3, 84], [-86, 0, 84]) },
  { title: "The spring throws it off", who: "Roo · spring", color: ROLE.spring, text: "The bar's finger pushes the inner arm over centre, the toggle spring throws the paddle up with Roo on it, and the leaf drops.", points: v([-106, 0, 16], [-54, 0, 16], [-54, 0, 68], [-106, 0, 68]) },
  { title: "Again, and Mo dozes off", who: "Mo · sensing", color: ROLE.sensing, text: "Ten minutes later Roo switches it on again. The water boils, the steam pours onto Mo, and Mo is fast asleep. His disc never snaps.", points: v([-104, 0, 28], [-52, 0, 28], [-52, -3, 76], [-104, 0, 76]) },
  { title: "It boils, and boils", who: "Volta · power", color: ROLE.power, text: "Nothing switches it off. 2.2 kW boils away nearly a gram a second: the litre is gone as steam in about eighteen minutes.", points: null },
  { title: "Crumb cuts the power", who: "Crumb · sensing", color: ROLE.sensing, text: "With no water on it, the plate heats fast. At 140 °C the boil-dry disc snaps, its plunger pushes Crumb's leaf off its contact, and the power stops.", points: v([-60, 0, 12], [-20, 0, 12], [-20, -6, 40], [-60, -6, 40]) },
  { title: "Mo wakes, too late", who: "Mo · sensing", color: ROLE.sensing, text: "The clunk wakes Mo. His disc is still hot, so it snaps at once and the switch flips off, onto an empty, dry kettle.", points: v([-106, 0, 16], [-52, 0, 16], [-52, 0, 70], [-106, 0, 70]), hold: 1.6 },
];
export const views = STEPS.map((s) => (s.points ? fitView(s.points.map(at), [WIDTH, HEIGHT], { pad: 14, least: 0.24 }) : [0, 0, WIDTH, HEIGHT]));

export const LABEL = "A cordless electric kettle on a kitchen worktop, cut in half through its middle so the back half shows, run by four animals. The kettle stands on its power base, a litre of water in it. Roo the kangaroo stands on the switch paddle at the foot of the handle and stamps it down to switch the kettle on. Volta the electric eel lies along the live wire in the base, from the connector to the switch contacts, and crackles while current flows to the element under the plate. Mo the sloth, in glasses, hangs from the trip bar under the steam switch in the handle; steam runs down a tube onto its disc, and when the disc snaps the bar drops and the switch flips off. Crumb the mouse holds the boil-dry contacts together under the plate. In the second half Mo falls asleep, the water boils away as steam, and Crumb's boil-dry cut-out stops the power.";

export const keys = [
  { mark: "lit", label: "On duty: whoever is doing the work right now" },
  { mark: "raised", label: "Roo, kangaroo, spring: stamps the switch on, rides it off" },
  { mark: "raised", label: "Volta, electric eel, power: carries the current to the element" },
  { mark: "raised", label: "Mo, sloth, sensing: the steam switch. Flaw on file: dozes off" },
  { mark: "raised", label: "Crumb, mouse, sensing: holds the boil-dry contacts together" },
];
