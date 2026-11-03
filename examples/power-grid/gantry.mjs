import { k, L, P, at, S, Ln, D, box, seg, rod, rodAB, insulator, lattice } from "./shapes.mjs";
import { C } from "./model.mjs";
import { tubePieces, tubeSvg } from "../../kit/tube.mjs";
import { arrTerm, ctTerm } from "./bay.mjs";
import { cbTerm } from "./breaker.mjs";
import { dsHingeTerm, dsJawTerm } from "./ds.mjs";

// The 400 kV landing gantry: two lattice columns on pad footings, a lattice beam across the three phases,
// earth-wire peaks, and a tension string of cap-and-pin discs per phase where the line comes in. The current
// path is the subject: every jumper and span from the bushing tops to the line is drawn in copper.
const GA = C.GANTRY, BZ = GA.z - 12, W = 6;
export function gantryColumn(y) {
  const out = [S(box(GA.x - 6, y - 6, 0, GA.x + 6, y + 6, 3, 0.6, 0.4), { tone: "lo" })];
  out.push(S(box(GA.x - 4, y - 4, 3, GA.x + 4, y + 4, 4.4, 0.3), { tone: "mid" }));
  out.push(lattice(GA.x, y, 4.4, GA.z, W));
  out.push(S(rod([GA.x, y, GA.z], [0, 0, 1], 0.7, 0, 12, 10), { tone: "hi" }) + S(k.cylinder(GA.x, y, 1.6, GA.z + 12, 1, P, 12), { tone: "mid" }));
  return out.join("");
}
// The beam: four chords along y with lacing on the two faces you see.
export function gantryBeam() {
  const out = [], [ya, yb] = GA.ys, h = W / 2, lace = [];
  for (const [dx, z] of [[-h, BZ], [h, BZ], [-h, GA.z], [h, GA.z]]) out.push(S(box(GA.x + dx - 0.6, ya, z - 0.6, GA.x + dx + 0.6, yb, z + 0.6, 0.15), { tone: "mid" }));
  const step = 6;
  for (let y = ya + 3; y + step <= yb - 3; y += step) {
    lace.push(seg([GA.x + h, y, BZ], [GA.x + h, y + step / 2, GA.z]), seg([GA.x + h, y + step / 2, GA.z], [GA.x + h, y + step, BZ]));
    lace.push(seg([GA.x - h, y, GA.z], [GA.x + h, y + step / 2, GA.z]), seg([GA.x + h, y + step / 2, GA.z], [GA.x - h, y + step, GA.z]));
  }
  out.push(Ln(lace.join(""), { tone: "lo" }));
  return out.join("");
}
// Tension strings: a yoke plate on the beam, the disc string along +x, and the dead-end clamp.
export const clampOf = (y) => [GA.x + 15, y, BZ - 1];
export function string(y) {
  const out = [], a = [GA.x + h3(), y, BZ - 1];
  out.push(S(box(GA.x + 2.4, y - 1.6, BZ - 2.6, GA.x + 4, y + 1.6, BZ + 0.6, 0.2), { tone: "mid" }));
  const F = L.frameAlong(a, [1, 0, 0]), discs = 5, pitch = 2.1;
  out.push(S(rod(a, [1, 0, 0], 0.5, 0, 11, 10), { tone: "mid" }));
  for (let i = 0; i < discs; i++) out.push(S(L.solidOf([[0.2 + i * pitch, 0.6], [0.6 + i * pitch, 3, 1], [1.2 + i * pitch, 2.2, 1], [1.6 + i * pitch, 0.6]], F, P), { tone: "hi" }));
  out.push(S(box(GA.x + 14, y - 1.2, BZ - 2.4, GA.x + 16, y + 1.2, BZ + 0.4, 0.3), { tone: "mid" }));
  return out.join("");
}
const h3 = () => 4;

// Sagging spans: a jumper drawn as a chain of short rods, its lowest point `sag` below the chord's middle.
const span = (a, b, sag, r = 0.7, n = 14) => {
  const pts = Array.from({ length: n + 1 }, (_, i) => { const t = i / n, p = L.lerp3(a, b, t); p[2] -= sag * 4 * t * (1 - t); return p; });
  return tubePieces(pts, r, P, { maxLength: 400 }).map((piece) => tubeSvg(piece, { tone: "hi" })).join("");
};
// Per phase: bushing top to arrester, arrester to CT, CT to breaker, breaker to disconnector, jaw to gantry.
export function jumpers(i) {
  const y = C.PH[i], top = [C.HVB.x, y, C.HVB.z1 + 1];
  const parts = [span(top, arrTerm(y), 4), span(arrTerm(y), ctTerm(y, -1), 2.4), span(ctTerm(y, 1), cbTerm(y, -1), 1.6), span(cbTerm(y, 1), dsHingeTerm(y), 1.2)];
  return `<g class="pg-cu">${parts.join("")}</g>`;
}
export const dropper = (i) => `<g class="pg-cu">${span(clampOf(C.PH[i]), dsJawTerm(C.PH[i]), -3)}</g>`;
export const lineSpan = (i) => `<g class="pg-cu">${span(clampOf(C.PH[i]), [GA.x + 64, C.PH[i] - 4, BZ - 30], 4, 0.7, 10)}</g>`;
export const terms = () => D(C.PH.flatMap((y) => [arrTerm(y), ctTerm(y, -1), ctTerm(y, 1), cbTerm(y, -1), cbTerm(y, 1), dsHingeTerm(y), dsJawTerm(y)]).map(at), { size: 0.5, tone: "mid" });
void insulator;
