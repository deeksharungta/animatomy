import { k, L, P, at, S, Ln, D, box, seg, rod, insulator, cabinet } from "./shapes.mjs";
import { C } from "./model.mjs";

// The 400 kV bay's first two rows: a surge arrester per phase on a tubular stand with its counter, then a
// current transformer per phase, an oil-filled head on a porcelain column. A marshalling kiosk stands beside.
const ST = C.STAND, Z = [0, 0, 1];
const stand = (x, y, top, r = 1.4) => {
  const out = [S(box(x - 3, y - 3, 0, x + 3, y + 3, 1.6, 0.4), { tone: "lo" })];
  out.push(S(k.cylinder(x, y, r, 1.6, top - 3.2, P, 16), { tone: "mid", crease: "none", inner: Ln(k.sideArc(x, y, r, 10, P, 12), { tone: "faint" }) }));
  out.push(S(box(x - 2.6, y - 2.6, top - 1.6, x + 2.6, y + 2.6, top, 0.3), { tone: "mid" }));
  out.push(D([[x - 1.8, y + 2.6, 0.8], [x + 1.8, y + 2.6, 0.8]].map(at), { size: 0.4 }));
  return out.join("");
};
export function arrester(y) {
  const x = C.ARR, top = ST + 40, out = [stand(x, y, ST)];
  out.push(S(box(x + 1.4, y + 2.6, 12, x + 3.4, y + 3.6, 16, 0.3), { tone: "hi" }));
  out.push(insulator([x, y, ST], Z, top - ST, { r: 2, shed: 3.6, n: 14, cap: 2.8 }));
  // The grading ring hangs on three stays below the top cap.
  const F = L.frameAlong([x, y, top - 5], Z);
  out.push(S(L.ringBand(-0.5, 0.5, 6.4, 7.2, F, P), { tone: "hi" }));
  out.push(S(k.cylinder(x, y, 1, top, 2.4, P, 12), { tone: "hi" }));
  return out.join("");
}
export function ct(y) {
  const x = C.CT, out = [stand(x, y, ST - 4, 1.8)];
  out.push(S(box(x - 4, y - 4, ST - 4, x + 4, y + 4, ST + 3, 0.6, 0.4), { tone: "mid" }));
  out.push(D([[x - 3, y + 4, ST + 1.5], [x + 3, y + 4, ST + 1.5]].map(at), { size: 0.4 }));
  out.push(insulator([x, y, ST + 3], Z, 30, { r: 2.6, shed: 4, n: 10, cap: 3.2 }));
  const F = L.frameAlong([x, y, ST + 33], Z);
  out.push(S(L.solidOf([[0, 4], [1, 5.6, 1], [5, 6.2, 1], [8, 5, 1], [9.4, 2.6, 1], [10, 0]], F, P), { tone: "mid", inner: Ln(L.arcOf(F, 1, 5.6, P, { slope: 1.6 }), { tone: "faint" }) }));
  for (const dx of [-1, 1]) out.push(S(rod([x + dx * 5.6, y, ST + 38], [dx, 0, 0], 1.1, 0, 2.6, 12), { tone: "hi" }) + S(box(x + dx * 8.2 - 0.4, y - 1.6, ST + 36.4, x + dx * 8.2 + 0.4, y + 1.6, ST + 39.6, 0.15), { tone: "hi" }));
  out.push(S(k.cylinder(x, y + 2, 1, ST + 41.6, 1.6, P, 12), { tone: "hi" }));
  return out.join("");
}
export const ctTerm = (y, side) => [C.CT + side * 8.6, y, ST + 38];
export const arrTerm = (y) => [C.ARR, y, ST + 42.4];
export const kiosk = () => cabinet(126, -12, 13, 8, 1.2, 24, { louvres: true });

// The breaker's steel: a portal under the three poles, and the cable trays to the kiosk.
export function cbFrame() {
  const x = C.CB.x, out = [];
  for (const y of [C.PH[0] - 8, C.PH[2] + 6]) for (const dx of [-5, 5]) out.push(S(box(x + dx - 1.2, y - 1.2, 0, x + dx + 1.2, y + 1.2, ST - 2, 0.2), { tone: "mid" }) + S(box(x + dx - 2.4, y - 2.4, 0, x + dx + 2.4, y + 2.4, 1.2, 0.3), { tone: "lo" }));
  for (const dx of [-5, 5]) out.push(S(box(x + dx - 1.4, C.PH[0] - 9.4, ST - 2, x + dx + 1.4, C.PH[2] + 7.4, ST, 0.2), { tone: "mid" }));
  out.push(S(box(x - 6.4, C.PH[0] - 9.4, ST, x + 6.4, C.PH[2] + 7.4, ST + 1.2, 0.3), { tone: "mid" }));
  return out.join("");
}
void seg;
