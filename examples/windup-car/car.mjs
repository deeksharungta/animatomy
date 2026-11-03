import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D, faceY, flatY, discY, box, segY, arcPts } from "./model.mjs";
import { panelXZ, rodY } from "./geo.mjs";

const Bd = C.BODY, Wh = C.WHEEL;

// A tyre on a tin hub along y from y0 to y1: rounded shoulders, a hub cap and a ring of pressed holes.
export function wheel(x, y0, y1, face = "near") {
  const w = y1 - y0, r = Wh.r, F = faceY(x, y0, Wh.z);
  const tyre = S(L.solidOf([[0, 12.2], [0.5, 14, 1], [1.5, r, 1], [w - 1.5, r, 1], [w - 0.5, 14, 1], [w, 12.2]], F, P), {
    tone: "mid", crease: "none", inner: k.fadedSvg(L.ribsOf(F, 1.5, w - 1.5, r, 44, P, { fade: [0.12, 0.5], seams: true }), { tone: "lo" }),
  });
  const yF = face === "near" ? y1 : y0;
  const hub = S(discY(x, Wh.z, 11.6, face === "near" ? y1 - 0.8 : y0, face === "near" ? y1 - 0.2 : y0 + 0.6), { tone: "hi", crease: "lo" });
  return tyre + hub + (face === "near" ? S(discY(x, Wh.z, 4.2, yF - 0.2, yF + 1.4), { tone: "hi", crease: "lo" }) : "");
}

export const farWheels = () => wheel(Wh.rearX, Wh.far[0], Wh.far[1], "far") + wheel(Wh.frontX, Wh.far[0], Wh.far[1], "far");

// The far side of the tin body, seen from inside: wheel arches, a door seam and a pressed belt line.
const archR = 17.6;
export function farWall() {
  const a0 = Math.asin((Bd.floor - Wh.z) / archR);
  const arch = (cx) => arcPts(cx, Wh.z, archR, Math.PI - a0, a0, 18);
  const bottom = [[Bd.x0, Bd.floor], ...arch(Wh.rearX), ...arch(Wh.frontX), [Bd.x1, Bd.floor]];
  const outline = [...bottom, [Bd.x1, 22], [60, 28.5], [44, 33], [26, 37], [20, 44], [14, 46], [-38, 46], [-44, 43], [-56, 40], [-62, 35], [Bd.x0, 29]];
  const y = Bd.y0 + 1;
  const belt = "";
  const seams = segY(y, [-22, Bd.floor], [-22, 46]) + segY(y, [10, Bd.floor], [10, 46]);
  const tabs = [-50, -10, 8, 40].map((x) => at([x, y, Bd.floor + 3]));
  return S(panelXZ(outline, Bd.y0, y), { tone: "mid", inner: Ln(belt + seams, { tone: "faint" }) }) + D(tabs, { size: 0.55, tone: "lo" }) +
    S(flatY([[2, 34], [8, 34], [8, 36.4], [2, 36.4]], y, y + 1.2), { tone: "hi" }) + D([at([3, y + 1.2, 35.2]), at([7, y + 1.2, 35.2])], { size: 0.4, tone: "lo" }) +
    S(box(-38, Bd.y0 + 1, 44.6, 14, Bd.y0 + 2.6, 46, 0.3), { tone: "hi" });
}

// The floor tray, the rear panel and the low cut-away front, with the rear and front bumpers.
export function tray() {
  const ribs = [-20, -6, 8, 22].map((yy) => k.segment([Bd.x0 + 1.5, yy, Bd.deck], [Bd.x1 - 1.5, yy, Bd.deck], P)).join("");
  const slot = k.planOutline({ x: 7.4, y: -18.8, w: 5, d: 2.8, r: 1 }, Bd.deck, P, 4);
  return S(box(Bd.x0 + 1.4, Bd.y0, Bd.floor, Bd.x1 - 1.4, Bd.y1, Bd.deck, 0.6, 0.3), { tone: "mid", inner: Ln(ribs, { tone: "faint" }) }) + Ln(slot, { tone: "lo" });
}
export function rearPanel() {
  const x = Bd.x0, inner = Ln(k.segment([x + 1.4, -2, Bd.deck], [x + 1.4, -2, 29], P), { tone: "faint" });
  return S(box(x, Bd.y0, Bd.floor, x + 1.4, Bd.y1, 29, 0.3), { tone: "mid", inner }) +
    D([at([x + 1.4, -24, 25]), at([x + 1.4, 22, 25]), at([x + 1.4, -24, 14]), at([x + 1.4, 22, 14])], { size: 0.5, tone: "lo" });
}
// The nose: a grille panel with a pressed grille and two headlamps, cut off at the hood line.
export function frontLow() {
  const x = Bd.x1 - 1.4, gz = [11, 21];
  const slats = Array.from({ length: 9 }, (_, i) => k.segment([Bd.x1 + 0.8, -12 + i * 3, gz[0]], [Bd.x1 + 0.8, -12 + i * 3, gz[1]], P)).join("");
  const lamp = (yy) => { const F = L.frameAlong([Bd.x1, yy, 17.5], [1, 0, 0]); return S(L.solidOf([[0, 4.4], [1.6, 4.4], [2.4, 3.6, 1], [2.8, 2.2, 1], [3, 0]], F, P), { tone: "hi", crease: "none", inner: Ln(L.arcOf(F, 1.6, 4.4, P), { tone: "faint" }) }); };
  return S(box(x, Bd.y0, Bd.floor, Bd.x1, Bd.y1, 22, 0.3), { tone: "mid" }) +
    S(box(Bd.x1, -14, gz[0], Bd.x1 + 0.8, 14, gz[1], 0.6), { tone: "hi", inner: Ln(slats, { tone: "lo" }) }) + lamp(-22) + lamp(21);
}
// The near side, cut down to a sill between the arches, with its rolled top edge.
export function nearSill() {
  const y0 = Bd.y1 - 1.4, dx = Math.sqrt(archR * archR - (Wh.z - Bd.floor) ** 2);
  const pieces = [[Bd.x0, Wh.rearX - dx], [Wh.rearX + dx, Wh.frontX - dx], [Wh.frontX + dx, Bd.x1]];
  return pieces.map(([x0, x1]) => S(box(x0, y0, Bd.floor, x1, Bd.y1, 13, 0.3, 0.3), { tone: "mid" }) +
    S(L.disc(0, x1 - x0, 0.8, L.frameAlong([x0, Bd.y1 - 0.7, 13], [1, 0, 0]), P), { tone: "hi", crease: "none" })).join("");
}
export function bumpers() {
  const out = [];
  for (const [x, dir] of [[Bd.x0 - 2.6, -1], [Bd.x1 + 2.6, 1]]) {
    for (const yy of [-22, 20]) out.push(S(box(Math.min(x, x - dir * 2.6), yy - 1, 12.4, Math.max(x, x - dir * 2.6), yy + 1, 14.6, 0.3), { tone: "mid" }));
    out.push(S(rodY(x, 13.6, 1.7, Bd.y0 + 4, Bd.y1 - 4), { tone: "hi", crease: "lo" }));
  }
  return out;
}

// The axles: rods through the body, each with a bush where it passes the far wall.
export function axles() {
  return [Wh.rearX, Wh.frontX].map((x) => S(rodY(x, Wh.z, 1.5, Wh.far[1], Wh.near[0]), { tone: "hi", crease: "none" }) +
    S(discY(x, Wh.z, 3, Bd.y0 + 1, Bd.y0 + 2.4), { tone: "mid", crease: "lo" })).join("");
}
