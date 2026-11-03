import { fitView } from "../../kit/steps.mjs";
import { checkReach } from "../../kit/reach.mjs";
import { WIDTH, HEIGHT, C, P, K, at, ROO, MO, ROLE } from "./model.mjs";
import * as G from "./geo.mjs";
import { partsKit, chainSvg } from "./moving.mjs";
import { drawn } from "./drawn.mjs";
import { poses } from "./poses.mjs";

export const Q = partsKit(K, P, C);
export const GG = { ...G, chainSvg };
export const rest = () => ({ g: 0, gT: 0, clickT: 0, clicks: 0, psi: C.PSI[0], psiV: 0, s: 0, cog: 0, pos: 0, travel: 0, phi: C.PHI[0], phiV: 0, cas: 0, jock: 0, pedal: 1, stepT: 0, duty: "", focus: "", lit: "cage" });
export const draw0 = (S) => drawn(K, P, C, S, Q, GG);

// Roo's paws must land on the anchor bolt through the whole swing, and Mo's on the jockey bolt at every cage angle.
export function reach() {
  const R = rest(), warn = [];
  for (const [spec, key] of [[ROO, "roo"], [MO, "mo"]]) warn.push(checkReach(spec, C.PSI.map((psi, i) => {
    const S = { ...R, g: i, psi, pos: i, phi: C.PHI[i] };
    return [`${C.TEETH[i]}T`, poses(C, S, draw0(S))[key]];
  }), P));
  if (warn.some(Boolean)) console.warn(warn.join("\n"));
}

// Each beat's cable index target; the beats in between wait for the chain to follow.
export const TARGET = [0, 1, 1, 10, 10, 0, 0];
export const FOCUS = ["", "roo", "mo", "roo", "mo", "roo", "mo"];
const J = (i) => G.linkage(C, C.PSI[i]).J1, j0 = J(0), j10 = J(10);
const der = (j) => [[j[0] - 40, j[1], j[2] - 100], [j[0] + 40, j[1] + 30, j[2] - 100], [C.BOLT[0], C.BOLT[1], C.BOLT[2] + 14], [C.BK[0] + 14, C.BK[1] + 10, C.BK[2]]];
export const STEPS = [
  { title: "Meet the crew", who: "Roo and Mo", color: "var(--anatomy-hi)", text: "Roo is the return spring that throws the derailleur out to the small cogs. Mo is the cage spring that keeps the chain taut.", points: null, hold: 1.4 },
  { title: "You click: the cable pulls Roo in", who: "Roo · spring", color: ROLE.spring, text: "One click pulls 2.67 mm of cable. The parallelogram swings the guide pulley 3.74 mm inboard, squeezing Roo.", points: [...der(j0), [j0[0], j0[1], j0[2] + 30]] },
  { title: "Pedal, and the chain climbs", who: "Mo · spring", color: ROLE.spring, text: "As you pedal, the guide pulley leans the chain onto the 12T. Mo lets the cage swing forward to pay out the extra chain.", points: [[-30, 50, 30], [60, 50, -170], [j0[0] + 30, j0[1] + 20, j0[2] - 120], [-40, 20, -40]] },
  { title: "Nine more clicks", who: "Roo · spring", color: ROLE.spring, text: "Each click pulls the parallelogram one cog further in, against Roo, until the guide pulley sits under the 32T.", points: [...der(j10), ...der(j0)] },
  { title: "The chain follows, cog by cog", who: "Mo · spring", color: ROLE.spring, text: "The chain climbs one cog per shift as you pedal. On the 32T it wraps far more teeth, so the cage swings 58° forward.", points: [[-70, 30, 72], [72, 30, 72], [-90, 40, -160], [80, 70, -150]] },
  { title: "You let go: Roo throws it out", who: "Roo · spring", color: ROLE.spring, text: "Each release lets out 2.67 mm of cable, and Roo kicks the parallelogram back out under the smaller cogs.", points: [...der(j10), ...der(j0)] },
  { title: "Mo takes up the slack", who: "Mo · spring", color: ROLE.spring, text: "The chain drops cog by cog to the 11T. Mo hauls the cage back so the spare chain never goes slack.", points: null, hold: 1.6 },
];
export const views = STEPS.map((s) => (s.points ? fitView(s.points.map(at), [WIDTH, HEIGHT], { pad: 16, least: 0.42 }) : [0, 0, WIDTH, HEIGHT]));

export const LABEL = "The rear of a bicycle in a workshop stand, seen from behind the drive side: an 11-speed 11 to 32 cassette, a 110-link chain and a rear derailleur on the frame's hanger. Roo the kangaroo stands on the derailleur's cable stop with his paws on the cable anchor of its outer link: he is the parallelogram's return spring. Mo the sloth hangs from the bolt of the lower jockey wheel at the bottom of the cage: he is the cage spring that keeps the chain taut.";
export const keys = [
  { mark: "lit", label: "On duty: the one whose part is moving now" },
  { mark: "raised", label: "Roo, kangaroo, spring: the parallelogram's return spring" },
  { mark: "raised", label: "Mo, sloth, spring: the cage spring that keeps the chain taut" },
  { mark: "flat", label: "The chain, in steel: what the derailleur moves" },
];
