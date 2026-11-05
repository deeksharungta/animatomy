// The comb and the tune pinned on the cylinder: "Twinkle, Twinkle, Little Star" (traditional, public domain), the
// first two phrases in C, the melody in the upper octave over a broken-chord accompaniment in quavers.
// Each tooth's free length comes from its pitch: a steel reed of one thickness rings at f ∝ 1/L², so L ∝ 1/√f.
import { C, TAU, toothX } from "./model.mjs";

export const NOTES = ["G3", "A3", "B3", "C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5", "D5", "E5", "F5", "G5", "A5", "B5", "C6"];
const SEMI = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 };
export const freqOf = (name) => 440 * 2 ** ((SEMI[name[0]] + 12 * (+name[1] - 4)) / 12);
export const FREQ = NOTES.map(freqOf);
export const L_TOP = 17;
export const LENGTH = FREQ.map((f) => L_TOP * Math.sqrt(FREQ[FREQ.length - 1] / f));
export const toothOf = (name) => NOTES.indexOf(name);

// Melody, one note per crotchet (beats 0..15; the bar's last note held two beats), then the accompaniment in quavers.
const MELODY = [["C5", 0], ["C5", 1], ["G5", 2], ["G5", 3], ["A5", 4], ["A5", 5], ["G5", 6], ["F5", 8], ["F5", 9], ["E5", 10], ["E5", 11], ["D5", 12], ["D5", 13], ["C5", 14], ["C6", 14]];
const CHORD = { C: ["C4", "G4", "E4", "G4"], F: ["C4", "A4", "F4", "A4"], G: ["G3", "D4", "B3", "D4"] };
const HARMONY = ["C", "C", "F", "C", "F", "C", "G", "C"];
const ACC = [];
HARMONY.forEach((ch, half) => CHORD[ch].forEach((n, q) => { const b = half * 2 + q / 2; if (b < 15.5) ACC.push([n, b]); }));
// The melody is doubled an octave down; a note already sounding on that beat isn't pinned twice. Each note has two
// teeth side by side, and its pins take them in turn, so a repeated note always finds a tooth that has settled.
const OCT = { C5: "C4", G5: "G4", A5: "A4", F5: "F4", E5: "E4", D5: "D4", C6: "C5" };
const ALL = [...MELODY, ...MELODY.filter(([n]) => n !== "C6").map(([n, b]) => [OCT[n], b]), ...ACC];
const SEEN = new Set(), COUNT = {};
export const PINS = ALL.filter(([n, b]) => !SEEN.has(n + b) && SEEN.add(n + b)).sort((p, q) => p[1] - q[1])
  .map(([n, b]) => { const c = (COUNT[n] = (COUNT[n] ?? -1) + 1); return { tooth: 2 * toothOf(n) + (c % 2), beat: b, note: n }; });

// Where a pin sits on the cylinder (radians, in the cylinder's frame): it lets its tooth go at the comb's tip when
// the cylinder has turned to beat + OFFSET.
export const pinAngle = (beat) => C.TIP - ((beat + C.OFFSET) / C.BEATS) * TAU;
// Beats played by a cylinder that has turned phi radians from the start.
export const beatOf = (phi) => (phi / TAU) * C.BEATS - C.OFFSET;
// The page gets the comb and the tune with the rest of the constants.
const TEETH = Array.from({ length: C.COMB.n }, (_, t) => t);
Object.assign(C, { TUNE: PINS.map(({ tooth, beat }) => ({ tooth, beat })), LEN: TEETH.map((t) => +LENGTH[t >> 1].toFixed(2)), TX: TEETH.map((t) => +toothX(t).toFixed(2)), FREQ: FREQ.map((f) => +f.toFixed(1)), NOTES });
