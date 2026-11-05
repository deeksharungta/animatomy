// The run's beats, their cameras, the words under the card, and the crew's reach and point-of-work checks.
import { checkReach, checkWork } from "../../kit/reach.mjs";
import { fitView } from "../../kit/steps.mjs";
import { C, P, WIDTH, HEIGHT, at, xc, NIB, ROCKY, KNOCK, ROLE } from "./model.mjs";
import { planOf, stateAt } from "./timeline.mjs";
import { poses } from "./poses.mjs";

export const E = planOf(C);
const [A, B, G] = E.jobs;
const sum = (J) => J.chars.map((q) => `${q.ch} ${q.v}`).join(" + ");
const filed = C.PREFILL.reduce((a, n) => a + n, 0) + 2;
if (A.h !== B.h || G.h !== A.h || G.cmps.length !== 2 || !G.cmps[1].hit) throw new Error("the story no longer matches the model");
export const NUM = { filed, cmps: G.cmps.length };
export const DONE_AT = [0, A.countEnd, A.slideEnd, E.resets[0].t0 + C.T.reset, B.countEnd, B.slideEnd, G.countEnd, G.pullEnd, E.end];

const HI = "var(--anatomy-hi)", hx = xc(C, A.h);
// The cameras: the whole flag row with Rocky for a count, the ledge from the tray to the hole for filing, the left
// end for Knock, and hole 6 close for the lookup.
const count = [[-12, 12, 108], [C.X1, 12, 108], [-12, 20, 40], [258, 48, 30], [236, 34, 80], [219, 25, 84]];
const file = [[hx - 14, 14, 34], [hx - 4, 12, 108], [258, 48, 30], [250, 30, 62], [200, 40, 30]];
const knock = [[-18, 32, 46], [-18, 2, 88], [36, 12, 110], [36, 30, 40]];
const look = [[hx - 16, 0, 34], [hx + 26, 32, 30], [hx + 26, 18, 66], [hx - 16, 10, 66]];
export const STEPS = [
  { title: "Meet the crew", who: "Rocky, Nib and Knock", color: HI, text: "Three animals run this hash map of eight pigeonholes: Rocky computes each key's hole, Nib files the letters, and Knock zeroes the counter.", points: null, hold: 4.5 },
  { title: `Rocky hashes ${A.key}`, who: "Rocky · sensing", color: ROLE.sensing, text: `Rocky turns the crank once for each unit of every letter: ${sum(A)} = ${A.sum}. Each turn steps the camshaft an eighth, and the raised flag walks to hole ${A.h}.`, points: count, least: 0.5 },
  { title: `Nib files ${A.key} in hole ${A.h}`, who: "Nib · moving", color: ROLE.moving, text: `Nib carries the letter along the ledge to the raised flag and slides it into hole ${A.h}. No searching: the hash said where.`, points: file, least: 0.36 },
  { title: "Knock zeroes the counter", who: "Knock · spring", color: ROLE.spring, text: "A new letter drops in. Knock strikes the heart cam, and the shaft springs round to zero, so every key is counted from the start.", points: knock, least: 0.24, pace: 0.4 },
  { title: `${B.key} lands on hole ${B.h} too`, who: "Rocky · sensing", color: ROLE.sensing, text: `${sum(B)} = ${B.sum}. The flag walks past hole 7, wraps round to 0 and stops at ${B.h}: ${B.sum} mod 8 = ${B.h}. Two keys, one hole.`, points: count, least: 0.5 },
  { title: `Nib chains ${B.key} on top`, who: "Nib · moving", color: ROLE.moving, text: `A collision. Nib files ${B.key} on top of ${A.key} in hole ${B.h}, so the hole now holds a short chain of two letters.`, points: file, least: 0.36 },
  { title: `Looking up ${G.key}`, who: "Rocky · sensing", color: ROLE.sensing, text: `You post a slip asking for ${G.key}. Knock zeroes the counter and Rocky hashes it exactly as before: ${G.sum}, hole ${G.h}.`, points: count, least: 0.5 },
  { title: `Nib checks hole ${G.h} only`, who: "Nib · moving", color: ROLE.moving, text: `Nib goes straight to hole ${G.h} and compares the chain: ${B.key}, no; ${A.key}, yes. ${G.cmps.length} comparisons, not ${filed} letters searched.`, points: look, least: 0.24, pace: 0.6 },
  { title: "Found, and back to zero", who: "Knock · spring", color: ROLE.spring, text: `Nib brings ${A.key} to the tray beside the slip, and Knock zeroes the counter for the next key.`, points: null, hold: 2 },
];
export const VIEWS = STEPS.map((s) => (s.points ? fitView(s.points.map(at), [WIDTH, HEIGHT], { pad: 18, least: s.least ?? 0.3 }) : [0, 0, WIDTH, HEIGHT]));

// Reach and the point of work: Rocky through the whole stroke, Knock at the strike, Nib at the hole's mouth.
export function crewChecks() {
  const S0 = stateAt(C, E, 0);
  const pr = Array.from({ length: 24 }, (_, i) => [`(crank at ${i * 15}°)`, poses(C, { ...S0, alpha: (i * Math.PI) / 12 })]);
  const strikes = E.resets.map((r, i) => [`(reset ${i + 1})`, stateAt(C, E, r.t0 + 0.02)]);
  const winds = E.resets.map((r, i) => [`(winding ${i + 1})`, stateAt(C, E, r.t0 - 0.2)]);
  const slides = [A, B].map((J) => [`(filing ${J.key})`, stateAt(C, E, J.slideEnd - 0.02), J]);
  const cmps = G.cmps.map((q, i) => [`(comparison ${i + 1})`, stateAt(C, E, q.t0 + 0.45), G]);
  // Every fifth of a second Nib holds a letter: picking it up, carrying it, filing it, reading the chain, bringing it home.
  const carry = [];
  for (let t = 0; t < E.end; t += 0.2) { const st = stateAt(C, E, t); if (st.letters.some((l) => l.held)) carry.push([`(holding a letter at ${t.toFixed(1)} s)`, st]); }
  // Nib's point of work: the letter's end at the hole's mouth, where his paws push it in or draw it out.
  const mouth = (J, st) => { const l = st.letters.find((q) => q.held), E2 = C.ENV; return [l.pos[0] + E2.l / 2 - 1.7, Math.max(l.pos[1] - E2.d / 2 + 1, Math.min(l.pos[1] + E2.d / 2 - 0.8, C.Y1 + 1)), l.pos[2] + E2.t]; };
  const reach = checkReach(ROCKY, pr.map(([l, q]) => [l, q.rocky]), P) + checkReach(KNOCK, [...strikes, ...winds].map(([l, s]) => [l, poses(C, s).knock]), P)
    + checkReach(NIB, [...slides, ...cmps, ...carry].map(([l, s]) => [l, poses(C, s).nib]), P);
  const work = checkWork(ROCKY, pr.map(([l, q]) => [l, q.rocky]), P, { end: "paws", work: (l) => pr.find(([m]) => m === l)[1].grip })
    + checkWork(KNOCK, strikes.map(([l, s]) => [l, poses(C, s).knock]), P, { end: "beak", work: (l) => poses(C, strikes.find(([m]) => m === l)[1]).hit })
    + checkWork(NIB, [...slides, ...cmps].map(([l, s, J]) => [l, poses(C, s).nib, J]), P, { end: "paws", work: (l) => { const f = [...slides, ...cmps].find(([m]) => m === l); return mouth(f[2], f[1]); } });
  console.log(`checkReach: ${reach} warnings · checkWork: ${work} warnings`);
  return reach + work;
}

export const LABEL = `A hash map built as a post-office letter-sorting desk. Letters are the keys: they drop through a mail slot in the wall, down a chute into an in-tray. A frame of eight pigeonholes, numbered 0 to 7 in pips on brass plates, stands on a cabinet of drawers. Over the holes runs a camshaft with one lobed cam per hole, each an eighth of a turn round from the last, and each cam lifts a round flag over its hole, above a fascia with the hole's pips. At the right end, Rocky the raccoon, in glasses, reads the key and turns a crank once per unit of each letter (A is 1, Z is 26); through a bevel pair and a pin wheel each turn steps an eight-slot star wheel on the shaft one slot, an eighth of a turn, so the raised flag walks along the row and wraps round after hole 7: the hole is the sum mod 8. Nib the mouse carries the letter along the ledge to the raised flag and slides it in. Knock the woodpecker, on a perch at the left end, strikes a heart cam on the shaft to spring it back to zero before each key. ADA (6) and IDA (14) both land in hole 6 and stack there as a chain; a lookup for ADA hashes to hole 6, and Nib compares only the two letters in it.`;
export const KEYS = [
  { mark: "lit", label: "On duty: whoever is doing the work right now" },
  { mark: "raised", label: "Rocky, raccoon, sensing: the hash; one turn of the crank per unit of each letter" },
  { mark: "raised", label: "Nib, mouse, moving: the sorter; files each letter in its hole, searches only that hole" },
  { mark: "raised", label: "Knock, woodpecker, spring: the reset hammer; springs the counter back to zero" },
];
export const CAPTION = `A hash map with eight buckets. The hash of a key is the sum of its letters (A = 1 … Z = 26) mod 8: the counter's shaft turns an eighth per unit, so going past 7 wraps round to 0. ${A.key} (${A.sum}) and ${B.key} (${B.sum}) both hash to ${A.h}, a collision, so hole ${A.h} keeps them as a chain. A lookup computes the same hash and searches one hole: ${G.cmps.length} comparisons instead of all ${filed} letters.`;
