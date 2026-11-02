import { critter } from "../../kit/critters.mjs";
import { fitView } from "../../kit/steps.mjs";
import { WIDTH, HEIGHT, C, P, at, PIP, MO, ROLE, eventsOf, stateAt } from "./model.mjs";
import { poses } from "./poses.mjs";

const E = eventsOf(C);
const S0 = stateAt(C, E, 0);

// Every paw must land on its handle through the whole stroke and all the way round the crank.
for (let i = 0; i <= 12; i++) {
  const p = poses(C, { ...S0, stroke: (i / 12) * C.SLIDE.stroke, pushV: 1 });
  for (const [paw, short] of Object.entries(critter(PIP, p.pip, P).reach)) if (short > 0.3) console.warn(`Pip's ${paw} paw is ${short.toFixed(1)} short of the grip at ${i}/12 of the stroke`);
}
for (let i = 0; i < 24; i++) {
  const p = poses(C, { ...S0, crank: (i / 24) * Math.PI * 2, t: 1 });
  for (const [paw, short] of Object.entries(critter(MO, p.mo, P).reach)) if (short > 0.3) console.warn(`Mo's ${paw} paw is ${short.toFixed(1)} short of the knob at ${i}/24 of a turn`);
}

// The numbers the captions quote, read off the model's own decisions.
const burst = E.filter((e) => e.kind === "req" && e.tr >= C.REQ[1]);
const before = E.filter((e) => e.t < burst[0].t).at(-1).after;
const refills = E.filter((e) => e.kind === "feed" && e.in && e.t > burst[0].t && e.t < burst.at(-1).t).length;
const passed = burst.filter((e) => e.ok).length, refused = burst.length - passed;
const earlier = E.filter((e) => e.kind === "req" && e.tr < burst[0].tr && e.ok).length;
const span = burst.at(-1).tr - burst[0].tr;
const full = E.filter((e) => e.kind === "feed" && e.in && e.after === C.CAP && e.t > burst.at(-1).t)[0];
if (passed !== before + refills || refused !== 1 || !full) throw new Error("the story no longer matches the model");
const end = stateAt(C, E, C.END);
if (end.n !== C.CAP || end.served !== passed + 1 || end.refused !== 1) throw new Error("the run does not end full");
export const DONE_AT = [0, C.FIRST + 1.5, C.REQ[0] + 1.1, burst.at(-1).tr, burst.at(-1).tr + 1.1, full.td + 0.8];

const word = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight"];
export const STEPS = [
  { title: "Meet the crew", who: "Mo and Pip", color: "var(--anatomy-hi)", text: `Two animals run this rate limiter. Mo turns the feeder that adds tokens; Pip works the slide that spends one per request. The tube holds ${C.CAP}.`, points: null, hold: 1.6 },
  { title: `Mo adds a token every ${C.PERIOD} s`, who: "Mo · sensing", color: ROLE.sensing, text: `One turn of Mo's crank moves the disc one pocket, and a token drops down the chute. The tube is full at ${C.CAP}, so it slides over the top and spills.`, points: [[-44, -30, 96], [-12, -58, 92], [16, -16, 66], [0, 0, 30], [0, 42, 6]] },
  { title: "Pip spends one on a request", who: "Pip · moving", color: ROLE.moving, text: `A request drops through the slot. Pip pushes the slide, the bottom token falls into the flap's cup, and its weight tips the request into Served.`, points: [[-56, 18, 22], [-56, 18, 58], [0, 0, 50], [46, -12, 32], [51, 36, 6], [12, 34, 6]] },
  { title: `A burst of ${burst.length} requests`, who: "Pip · moving", color: ROLE.moving, text: `${word[burst.length][0].toUpperCase() + word[burst.length].slice(1)} requests in ${span} s. Pip spends a token on each: ${before} from the tube and ${refills} Mo adds, so ${passed} get through: ${passed + earlier} passed in all.`, points: [[-56, 18, 22], [-56, 18, 58], [0, -25, 64], [46, -12, 32], [51, 36, 6], [12, 34, 6]] },
  { title: `The ${["", "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth"][burst.length]} is refused`, who: "Pip · moving", color: ROLE.moving, text: "The tube is empty. Pip's slide comes back with nothing, the flap stays back, and the request drops into Refused.", points: [[-50, 18, 22], [-50, 18, 58], [0, 0, 52], [33, -38, 6], [59, -38, 6], [59, -17, 6], [51, 36, 6], [40, -50, 52]] },
  { title: "Mo refills the tube", who: "Mo · sensing", color: ROLE.sensing, text: `Mo never hurries: one token every ${C.PERIOD} s. ${full.td + 0.8 - burst.at(-1).tr > 0 ? `By ${(full.td + 0.8).toFixed(1)} s` : "Soon"} the tube is back to ${C.CAP} of ${C.CAP}, ready for the next burst.`, points: [[-76, -62, 0], [60, 44, 0], [0, -40, 96], [-76, 44, 0], [60, -62, 70]], hold: 2 },
];
export const views = STEPS.map((s) => (s.points ? fitView(s.points.map(at), [WIDTH, HEIGHT], { pad: 22, least: 0.34 }) : [0, 0, WIDTH, HEIGHT]));

export const LABEL = `A token bucket rate limiter built as a token dispenser on a desk, run by two animals. Requests are envelopes that drop through a mail slot in the wall and slide down a chute onto a see-saw flap. Brass tokens sit in a tube that holds ${C.CAP}. Mo the sloth, in glasses, stands on the feeder's plate and turns a crank; each turn moves a disc under the hopper one pocket and drops one token down a chute into the tube, one every ${C.PERIOD} seconds, and when the tube is full the token slides over the top into a spill box. Pip the squirrel stands on a walkway and pushes the coin slide under the tube once for every request; the bottom token falls into the flap's cup and tips the request into the Served tray. When the tube is empty the slide brings nothing, the flap stays back, and the request drops into the Refused bin.`;

export const keys = [
  { mark: "lit", label: "On duty: whoever is doing the work right now" },
  { mark: "raised", label: `Mo, sloth, sensing: turns the feeder, one token every ${C.PERIOD} s` },
  { mark: "raised", label: "Pip, squirrel, moving: pushes the slide that spends one token per request" },
];
export const CAPTION = `A token bucket with capacity ${C.CAP} and a refill rate of one token every ${C.PERIOD} s. Every request needs a token: with tokens in the tube it passes, with none it is refused. A burst of ${burst.length} requests in ${span} s finds ${before} tokens waiting and ${refills} more arriving, so ${passed} pass and ${refused} is refused; then the tube refills at the steady rate.`;
