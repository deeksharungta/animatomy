import { k, L, P, at, S, Ln, D, box, seg, rod, turned, ringY, cabinet } from "./shapes.mjs";
import { C } from "./model.mjs";

// The exciter end: the slip-ring shaft in its brush-gear housing (front and top off), the field terminal on the
// housing floor, the open field-cable trunking Volta lies in, and the static excitation cubicle it comes from.
const { AY, SH } = C, Z = C.DECK_Z, X = [1, 0, 0], RG = C.RINGS;
export const HOUSE = { x0: -76, x1: -54, y0: AY - 14, y1: AY + 12 };
export const TERM = [-63, AY + 9, Z + 2.6];
export const TRAY = [[-63, AY + 12, Z], [-63, 8, Z], [-41, 8, Z], [-41, -40, Z]];

export function housingBack() {
  const H = HOUSE, out = [];
  out.push(S(box(H.x0, H.y0, Z, H.x1, H.y1, Z + 1.6, 0.4), { tone: "lo" }));
  // The guard behind the rings: a low back panel with a louvre, on the base.
  out.push(S(box(H.x0 + 2, H.y0, Z + 1.6, H.x1 - 2, H.y0 + 1.2, SH + 4, 0.2), { tone: "mid" }));
  out.push(Ln(ringY(H.y0 + 1.2, H.x0 + 5, H.x1 - 5, SH - 6, SH, 0.8, 2), { tone: "lo" }));
  return out.join("");
}
export function housingFront() {
  const H = HOUSE;
  return D([[H.x0 + 2, H.y1, Z + 0.8], [H.x1 - 2, H.y1, Z + 0.8]].map(at), { size: 0.45 });
}
// The slip rings: two bronze rings on an insulated sleeve, and the brush rocker above them.
export function slipRings() {
  const out = [];
  out.push(S(rod([HOUSE.x0, AY, SH], X, 4.2, 0, 24, 20), { tone: "hi" }));
  out.push(S(turned([RG.x - 8, AY, SH], X, [[0, 5], [16, 5]]), { tone: "lo" }));
  for (const x of [RG.x - 6, RG.x + 2]) out.push(S(turned([x, AY, SH], X, [[0, RG.r - 1], [0.5, RG.r], [3.5, RG.r], [4, RG.r - 1]], { smooth: false }), { tone: "hi", crease: "lo" }));
  return out.join("");
}
export function brushGear() {
  const out = [], top = SH + RG.r + 7;
  // Posts from the housing floor to the rocker bar, and a holder over each ring with three brushes.
  for (const y of [AY - 9, AY + 8]) out.push(S(k.cylinder(RG.x - 2, y, 1.2, Z + 1.6, top - Z - 1.6, P, 12), { tone: "mid", crease: "none" }));
  out.push(S(box(RG.x - 3.4, AY - 10, top, RG.x - 0.6, AY + 9, top + 2.2, 0.3), { tone: "mid" }));
  for (const x of [RG.x - 4, RG.x + 4]) {
    out.push(S(box(x - 1.4, AY - 6, SH + RG.r + 0.4, x + 1.4, AY + 6, top, 0.3), { tone: "hi" }));
    out.push(D([-4, 0, 4].map((dy) => at([x + 1.4, AY + dy, SH + RG.r + 3])), { size: 0.45, tone: "lo" }));
  }
  // Copper links from each holder down to the terminal block Volta touches.
  out.push(S(box(TERM[0] - 3, TERM[1] - 2, Z + 1.6, TERM[0] + 3, TERM[1] + 2, Z + 3, 0.3), { tone: "mid" }));
  out.push(`<g class="pg-cu">${S(box(RG.x - 4.6, AY + 6, SH - 2, RG.x - 3.4, AY + 7.2, SH + RG.r + 0.6, 0.15), { tone: "hi" })}${S(box(RG.x - 4.6, AY + 6, Z + 3, RG.x - 3.4, TERM[1] + 1, SH - 2, 0.15), { tone: "hi" })}</g>`);
  return out.join("");
}
// The open trunking along the deck from the cubicle to the terminal: a channel with its lid lifted off.
export function trunking() {
  const out = [];
  out.push(S(box(TRAY[0][0] - 2.5, TRAY[0][1], Z, TRAY[0][0] + 2.5, TRAY[1][1] + 2.5, Z + 1.4, 0.2), { tone: "lo" }));
  out.push(S(box(TRAY[1][0] - 2.5, TRAY[1][1] - 2.5, Z, TRAY[2][0] + 2.5, TRAY[1][1] + 2.5, Z + 1.4, 0.2), { tone: "lo" }));
  out.push(S(box(TRAY[3][0] - 2.5, TRAY[3][1], Z, TRAY[3][0] + 2.5, TRAY[2][1] - 2.5, Z + 1.4, 0.2), { tone: "lo" }));
  out.push(S(box(TRAY[1][0] - 2.5, TRAY[1][1] + 2.5, Z, TRAY[2][0] + 2.5, TRAY[1][1] + 3, Z + 2.6, 0.1), { tone: "mid" }));
  return out.join("");
}
// The static excitation cubicle: thyristor bridges behind louvred doors, fed by its own transformer.
export function excitation() {
  const E = C.EXC;
  return cabinet(E.x, E.y, E.w, E.d, Z, 34, { louvres: true }) + D([[E.x + 2, E.y + E.d, Z + 30], [E.x + E.w - 2, E.y + E.d, Z + 30]].map(at), { size: 0.45 });
}
export { HOUSE as EXC_HOUSE };
void seg; void L;
