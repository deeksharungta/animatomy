import { fitView } from "../../kit/steps.mjs";
import { checkReach } from "../../kit/reach.mjs";
import { WIDTH, HEIGHT, C, P, K, at, ROO, MO, ROLE } from "./model.mjs";
import * as G from "./geo.mjs";
import { partsKit, chainSvg } from "./moving.mjs";
import { drawn } from "./drawn.mjs";
import { turning } from "./turning.mjs";
import { poses } from "./poses.mjs";

export const Q = partsKit(K, P, C);
export const GG = { ...G, chainSvg };
export const rest = () => ({ g: 0, gT: 0, clickT: 0, clicks: 0, psi: C.PSI[0], psiV: 0, s: 0, cog: 0, pos: 0, travel: 0, phi: C.PHI[0], phiV: 0, cas: 0, jock: 0, pedal: 1, stepT: 0, duty: "", focus: "", lit: "cage" });
export const draw0 = (S) => ({ ...drawn(K, P, C, S, Q, GG), ...turning(K, P, C, Q, S) });

// Roo's paws must land on the link's pin at every gear; Mo's on his two pegs at every cage angle, including the ones
// on the way, when the guide pulley has moved and the chain hasn't followed yet.
export function reach() {
  const R = rest(), pose = (psi, pos, g) => { const S = { ...R, g, psi, pos, phi: G.solvePhi(C, psi, pos) }; return poses(C, S, draw0(S)); };
  const n = checkReach(ROO, C.PSI.map((psi, i) => [`${C.TEETH[i]}T`, pose(psi, i, i).roo]), P) +
    checkReach(MO, C.PSI.flatMap((psi, i) => C.PSI.map((_, j) => [`with the pulley at ${C.TEETH[i]}T and the chain on ${C.TEETH[j]}T`, pose(psi, j, i).mo])), P);
  if (n) console.warn(`${n} reach warnings`);
}

// Each beat's cable index target; the beats in between wait for the chain to follow.
export const TARGET = [0, 1, 1, 10, 10, 0, 0];
export const FOCUS = ["", "roo", "mo", "roo", "mo", "roo", "mo"];
const J = (i) => G.linkage(C, C.PSI[i]).J1, R = C.CREW.roo.at;
// The camera for Roo's beats: the B-knuckle, his seat and the parallelogram at gear i; for Mo's, the cage and his pegs.
const der = (i) => { const j = J(i); return [[j[0], j[1], j[2] + 14], [C.BOLT[0], C.BOLT[1], C.BOLT[2] + 8], [R[0] - 10, R[1], R[2] - 6], [R[0] + 10, R[1], R[2] + 36]]; };
const cage = (i) => { const j = J(i), f = C.PHI[i]; return [[j[0] + 44, j[1], j[2] + 8], [j[0] - 92 * Math.sin(f) - 26, j[1], j[2] - 92 * Math.cos(f) - 26], [j[0] + 40, j[1] + 14, j[2] - 64], [j[0], j[1], j[2] + 30]]; };
export const STEPS = [
  { title: "Meet the crew", who: "Roo and Mo", color: "var(--anatomy-hi)", text: "Roo is the return spring that throws the derailleur out to the small cogs. Mo is the cage spring that keeps the chain taut.", points: null, hold: 1.4 },
  { title: "You click: the cable squeezes Roo", who: "Roo · spring", color: ROLE.spring, text: "One click pulls 2.67 mm of cable. The parallelogram swings the guide pulley 3.74 mm inboard, and its pin presses Roo down.", points: [...der(0), ...der(1)] },
  { title: "Pedal, and the chain climbs", who: "Mo · spring", color: ROLE.spring, text: "As you pedal, the guide pulley leans the chain onto the 12T. The cage swings forward to pay out chain, pulling Mo's arm.", points: [...cage(0), ...cage(1)] },
  { title: "Nine more clicks", who: "Roo · spring", color: ROLE.spring, text: "Each click pulls the parallelogram one cog further in, squeezing Roo lower, until the guide pulley sits under the 32T.", points: [...der(1), ...der(10)] },
  { title: "The chain follows, cog by cog", who: "Mo · spring", color: ROLE.spring, text: `The chain climbs one cog per shift as you pedal. On the 32T it wraps far more teeth, so the cage swings ${Math.round((C.PHI[10] - C.PHI[0]) * 180 / Math.PI)}° forward and Mo is stretched wide.`, points: [...cage(10), [-30, 12, -40], [40, 12, -40]] },
  { title: "You let go: Roo throws it out", who: "Roo · spring", color: ROLE.spring, text: "Each release lets out 2.67 mm of cable, and Roo stands up and kicks the pin back out under the smaller cogs.", points: [...der(10), ...der(0)] },
  { title: "Mo takes up the slack", who: "Mo · spring", color: ROLE.spring, text: "The chain drops cog by cog to the 11T. Mo hauls the cage's tab back to his anchor, so the spare chain never goes slack.", points: null, hold: 1.6 },
];
export const views = STEPS.map((s) => (s.points ? fitView(s.points.map(at), [WIDTH, HEIGHT], { pad: 18, least: 0.3 }) : [0, 0, WIDTH, HEIGHT]));

export const LABEL = "The rear of a bicycle in a repair stand in a workshop, seen from behind the drive side, with a bench and a pegboard of tools behind it: an 11-speed 11 to 32 cassette, a 110-link chain and a rear derailleur on the frame's hanger. Roo the kangaroo stands on a seat on the derailleur's fixed knuckle and pushes up on a pin on its outer link: he is the parallelogram's return spring, squeezed as the cable pulls. Mo the sloth hangs with one paw on the ring of a strap from an anchor peg on the moving knuckle and the other hooked over a peg on the cage's tab: he is the cage spring, stretched as the cage swings forward to take up chain.";
export const keys = [
  { mark: "lit", label: "On duty: the one whose part is moving now" },
  { mark: "raised", label: "Roo, kangaroo, spring: the parallelogram's return spring, between the knuckle and the link" },
  { mark: "raised", label: "Mo, sloth, spring: the cage spring, between the anchor peg and the cage's tab" },
  { mark: "flat", label: "The chain, in steel: what the derailleur moves" },
];
