import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D, faceY, discY, box, circleY } from "./model.mjs";
import { rodY } from "./geo.mjs";

const Bd = C.BODY, Wh = C.WHEEL;
export const archR = 17.6;

// A tyre on a tin hub along y from y0 to y1: rounded shoulders, a tread, a sidewall bead and a hub cap.
export function wheel(x, y0, y1, face = "near") {
  const w = y1 - y0, r = Wh.r, F = faceY(x, y0, Wh.z);
  const tyre = S(L.solidOf([[0, 12.2], [0.5, 14, 1], [1.5, r, 1], [w - 1.5, r, 1], [w - 0.5, 14, 1], [w, 12.2]], F, P), {
    tone: "mid", crease: "none", inner: k.fadedSvg(L.ribsOf(F, 1.5, w - 1.5, r, 44, P, { fade: [0.12, 0.5], seams: true }), { tone: "lo" }),
  });
  const yF = face === "near" ? y1 : y0;
  const bead = face === "near" ? Ln(circleY(x, y1, Wh.z, 13.2, 56), { tone: "faint" }) : "";
  const hub = S(discY(x, Wh.z, 11.6, face === "near" ? y1 - 0.8 : y0, face === "near" ? y1 - 0.2 : y0 + 0.6), { tone: "hi", crease: "lo" });
  const cap = face === "near" ? S(discY(x, Wh.z, 4.2, yF - 0.2, yF + 1.4), { tone: "hi", crease: "lo" }) + D([at([x, yF + 1.4, Wh.z])], { size: 0.6, tone: "lo" }) : "";
  return tyre + bead + hub + cap;
}
export const farWheels = () => wheel(Wh.rearX, Wh.far[0], Wh.far[1], "far") + wheel(Wh.frontX, Wh.far[0], Wh.far[1], "far");

// The floor tray: pressed ribs, the slots the body's tabs fold through, the stop tab's slot and drain holes.
export function tray() {
  const ribs = [-26, -19, -12, -5, 2, 9, 16, 23].map((yy) => k.segment([Bd.x0 + 1.5, yy, Bd.deck], [Bd.x1 - 1.5, yy, Bd.deck], P)).join("");
  const slot = (x, y, w, d) => k.planOutline({ x, y, w, d, r: Math.min(w, d) / 2 - 0.05 }, Bd.deck, P, 4);
  const slots = slot(8.4, -18.8, 15, 2.8) + [-56, -24, 24, 52].map((x) => slot(x - 2.6, Bd.y0 + 1.6, 5.2, 1.4)).join("");
  const holes = [[-30, 14], [-30, -26], [30, 14], [30, 0]].map(([x, y]) => k.ring(x, y, 1.3, Bd.deck, P, 16)).join("");
  return S(box(Bd.x0 + 1.4, Bd.y0, Bd.floor, Bd.x1 - 1.4, Bd.y1, Bd.deck, 0.6, 0.3), { tone: "mid", inner: Ln(ribs, { tone: "faint" }) }) + Ln(slots + holes, { tone: "lo" });
}
export function rearPanel() {
  const x = Bd.x0, inner = Ln(k.segment([x + 1.4, -2, Bd.deck], [x + 1.4, -2, 29], P), { tone: "faint" });
  return S(box(x, Bd.y0, Bd.floor, x + 1.4, Bd.y1, 29, 0.3), { tone: "mid", inner }) +
    D([at([x + 1.4, -24, 25]), at([x + 1.4, 22, 25]), at([x + 1.4, -24, 14]), at([x + 1.4, 22, 14])], { size: 0.5, tone: "lo" });
}
// The nose: a finned radiator with its header tank and cap, the grille panel and two headlamps, cut at the hood line.
export function frontLow() {
  const x = Bd.x1 - 1.4, gz = [11, 21];
  const slats = Array.from({ length: 9 }, (_, i) => k.segment([Bd.x1 + 0.8, -12 + i * 3, gz[0]], [Bd.x1 + 0.8, -12 + i * 3, gz[1]], P)).join("");
  const lamp = (yy) => { const F = L.frameAlong([Bd.x1, yy, 17.5], [1, 0, 0]); return S(L.solidOf([[0, 4.4], [1.6, 4.4], [2.4, 3.6, 1], [2.8, 2.2, 1], [3, 0]], F, P), { tone: "hi", crease: "none", inner: Ln(L.arcOf(F, 1.6, 4.4, P), { tone: "faint" }) }); };
  const fins = Array.from({ length: 21 }, (_, i) => k.segment([57.4, -20 + i * 2, 24], [60.6, -20 + i * 2, 24], P)).join("");
  const radiator = S(box(57, -21, Bd.deck, 61, 21, 24, 0.4), { tone: "mid", inner: Ln(fins, { tone: "faint" }) }) +
    S(box(56.4, -22.4, 24, 61.6, 22.4, 27, 1, 0.4), { tone: "hi" }) + S(L.disc(0, 1.6, 2, L.frameAlong([59, 0, 27], [0, 0, 1]), P), { tone: "hi", crease: "lo" });
  return radiator + S(box(x, Bd.y0, Bd.floor, Bd.x1, Bd.y1, 22, 0.3), { tone: "mid", inner: Ln(k.segment([Bd.x1, Bd.y0 + 2, 9.6], [Bd.x1, Bd.y1 - 2, 9.6], P), { tone: "faint" }) }) +
    S(box(Bd.x1, -14, gz[0], Bd.x1 + 0.8, 14, gz[1], 0.6), { tone: "hi", inner: Ln(slats, { tone: "lo" }) }) + lamp(-22) + lamp(21) +
    D([at([Bd.x1 + 0.8, -13, gz[1] - 1]), at([Bd.x1 + 0.8, 13, gz[1] - 1])], { size: 0.45, tone: "lo" });
}
// The near side, cut down to a sill between the arches, with its rolled top edge and a ribbed running board.
export function nearSill() {
  const y0 = Bd.y1 - 1.4, dx = Math.sqrt(archR * archR - (Wh.z - Bd.floor) ** 2);
  const pieces = [[Bd.x0, Wh.rearX - dx], [Wh.rearX + dx, Wh.frontX - dx], [Wh.frontX + dx, Bd.x1]];
  const [b0, b1] = pieces[1], ribs = [b0 + 4, b0 + 10, b0 + 16, b0 + 22, b0 + 28, b0 + 34, b0 + 40].filter((x) => x < b1 - 3);
  const board = S(box(b0 + 1, Bd.y1, 9.4, b1 - 1, Bd.y1 + 4.4, 10.6, 0.6, 0.2), { tone: "hi", inner: Ln(ribs.map((x) => k.segment([x, Bd.y1 + 0.6, 10.6], [x, Bd.y1 + 3.8, 10.6], P)).join("") + k.planOutline({ x: b0 + 1.4, y: Bd.y1 + 0.6, w: b1 - b0 - 2.8, d: 3.2, r: 0.4 }, 10.6, P, 3), { tone: "faint" }) });
  return pieces.map(([x0, x1]) => S(box(x0, y0, Bd.floor, x1, Bd.y1, 13, 0.3, 0.3), { tone: "mid" }) +
    S(L.disc(0, x1 - x0, 0.8, L.frameAlong([x0, Bd.y1 - 0.7, 13], [1, 0, 0]), P), { tone: "hi", crease: "none" })).join("") + board +
    D([at([b0 + 3, Bd.y1, 11]), at([b1 - 3, Bd.y1, 11])], { size: 0.45, tone: "lo" });
}
export function bumpers() {
  const out = [];
  for (const [x, dir] of [[Bd.x0 - 2.6, -1], [Bd.x1 + 2.6, 1]]) {
    for (const yy of [-22, 20]) out.push(S(box(Math.min(x, x - dir * 2.6), yy - 1, 12.4, Math.max(x, x - dir * 2.6), yy + 1, 14.6, 0.3), { tone: "mid" }) + D([at([x - dir * 1.3, yy, 14.6])], { size: 0.4, tone: "lo" }));
    out.push(S(rodY(x, 13.6, 1.7, Bd.y0 + 4, Bd.y1 - 4), { tone: "hi", crease: "lo" }));
  }
  return out;
}

// The axles: rods through the body, each with a bush in the far wall and a washer each side of the near wheel.
export function axles() {
  return [Wh.rearX, Wh.frontX].map((x) => S(rodY(x, Wh.z, 1.5, Wh.far[1], Wh.near[0]), { tone: "hi", crease: "none" }) +
    S(discY(x, Wh.z, 3, Bd.y0 + 1, Bd.y0 + 2.4), { tone: "mid", crease: "lo" }) + S(discY(x, Wh.z, 2.6, Bd.y1 - 2.4, Bd.y1 - 1.4), { tone: "hi", crease: "lo" }) +
    S(discY(x, Wh.z, 2.8, Wh.near[0] - 0.8, Wh.near[0]), { tone: "hi", crease: "lo" })).join("");
}

// The exhaust: a pressed tail pipe under the rear, held by a strap to the tray.
export function exhaust() {
  return S(L.disc(0, 18, 1.4, L.frameAlong([Bd.x0 - 6, 24, 5.6], [1, 0, 0]), P), { tone: "hi", crease: "lo" }) +
    S(box(Bd.x0 + 7, 22.6, 4, Bd.x0 + 9, 25.4, Bd.floor, 0.2), { tone: "mid" });
}
