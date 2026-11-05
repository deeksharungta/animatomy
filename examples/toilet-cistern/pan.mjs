// The pan the cistern sits on: pedestal and floor-bolt caps, the deck under the tank, the bowl and its rim, the seat
// ring on two hinges, and the bowl's well seen through the seat (its water moves in moving.mjs).
import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D } from "./model.mjs";

const B = C.BOWL, Q = B.ay / B.ax;
// An elliptical frame: radii are measured along x, and y is stretched by the bowl's ratio.
export const oval = (x, y, z, q = Q) => L.frameOf([x, y, z], [0, 0, 1], [1, 0, 0], [0, q, 0]);
// Rings start at the back (-y), so a ring cut open to make a band is joined under the hinges.
export const ovalRing = (x, y, rx, ry, n = 72) => Array.from({ length: n }, (_, i) => { const t = (i / n - 0.25) * Math.PI * 2; return [x + rx * Math.cos(t), y + ry * Math.sin(t)]; });
// The opening in the seat, and the water's well inside the bowl, in plan.
export const OPEN = { x: B.x, y: B.y + 14, rx: 112, ry: 150 };

export function pedestal() {
  const out = [`<path class="iso-halo" d="${k.haloOf({ x: -150, y: 120, w: 300, d: 520, r: 140 }, 0, 1, P)}"/>`];
  const F = oval(0, 360, 0, 1.6);
  out.push(S(L.solidOf([[0, 118], [6, 112, 1], [70, 96, 1], [150, 104, 1], [230, 128, 1], [300, 150]], F, P), { tone: "mid", crease: "faint" }));
  // The floor bolts' caps either side of the foot.
  for (const s of [-1, 1]) {
    const F2 = L.frameOf([s * 108, 300, 0], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
    out.push(S(L.solidOf([[0, 14], [10, 13, 1], [20, 8, 1], [24, 0.1]], F2, P), { tone: "hi", crease: "faint" }));
  }
  return out.join("");
}

// The deck the tank stands on: a platform at the back of the pan, square at the wall, with the tank bolts under it.
export function deck() {
  const out = [], d = C.DECK;
  // Under the platform, the tank bolts come through: rubber washer, steel washer and a wing nut on each.
  for (const x of [-110, 110]) {
    const F = L.frameOf([x, 100, B.z - 30], [0, 0, -1], [1, 0, 0], [0, 1, 0]);
    out.push(S(L.disc(0, 3, 13, F, P), { tone: "lo" }), S(L.disc(3, 5, 11, F, P), { tone: "hi" }), S(L.disc(5, 22, 3.5, F, P), { tone: "hi" }));
    out.push(S(L.solidOf([[5, 6], [12, 6], [13, 4, 1]], F, P), { tone: "hi", crease: "faint" }));
    for (const s of [-1, 1]) out.push(S(k.slabOf({ x: x + (s > 0 ? 5 : -14), y: 98, w: 9, d: 4, r: 1.5 }, B.z - 43, 9, P, 3), { tone: "hi", crease: "faint" }));
  }
  out.push(S(k.slabOf(d, B.z - 30, 30, P, 8, 2), { tone: "mid", crease: "faint", inner: Ln(k.sideSeam(d, B.z - 15, P, 8), { tone: "faint" }) }));
  return out.join("");
}

// The bowl: a curved body from the pedestal up to a rolled rim, then the rim's flat top.
export function bowl() {
  const out = [], F = oval(B.x, B.y, 240);
  out.push(S(L.solidOf([[0, 128], [40, 150, 1], [100, 172, 1], [146, 181, 1], [154, B.ax]], F, P, { fill: "hull" }), { tone: "hi", crease: "faint", inner: Ln(L.arcOf(F, 140, 180.4, P), { tone: "faint" }) }));
  // The rim's top: a flat oval band under the seat.
  out.push(S(k.extrude(ovalRing(B.x, B.y, B.ax, B.ay), B.z - 2, 2, P), { tone: "hi", crease: "faint" }));
  return out.join("");
}

// The seat ring with its hinges at the back: two posts with their bolt caps, and the ring's top groove.
export function seat() {
  const out = [], z = B.z;
  for (const s of [-1, 1]) {
    out.push(S(k.slabOf({ x: s * 70 - 14, y: 222, w: 28, d: 30, r: 8 }, z, 22, P, 4, 0.8), { tone: "hi", crease: "lo" }));
    out.push(D([at([s * 70, 232, z + 22])], { size: 0.8 }));
  }
  out.push(S(k.extrude(ovalRing(B.x, B.y + 6, B.ax - 4, B.ay - 8, 96), z, 14, P), { tone: "hi", crease: "faint" }));
  out.push(Ln(k.onTop(ovalRing(B.x, B.y + 10, B.ax - 30, B.ay - 30, 96), z + 14, P, true), { tone: "faint" }));
  return out.join("");
}

// The seat's opening, the bowl's well seen through it (contours down to the water, the rim's flushing holes),
// all clipped by the opening; the water itself is drawn in moving.mjs inside the same clip.
const opening = () => k.onTop(ovalRing(OPEN.x, OPEN.y, OPEN.rx, OPEN.ry, 96), B.z + 14, P, true);
export const wellClip = () => `<clipPath id="tc-well"><path d="${opening()}"/></clipPath>`;
export function well() {
  const rows = [];
  for (const [f, z] of [[0.97, B.z], [0.84, B.z - 40], [0.7, B.z - 80]]) rows.push(k.onTop(ovalRing(OPEN.x, OPEN.y + 20 * (1 - f), OPEN.rx * f, OPEN.ry * f, 96), z, P, true));
  const holes = ovalRing(OPEN.x, OPEN.y, OPEN.rx - 6, OPEN.ry - 6, 40).map(([x, y]) => at([x, y, B.z - 8]));
  return `<path class="tc-well" d="${opening()}"/><g clip-path="url(#tc-well)">${Ln(rows.join(""), { tone: "faint" })}${D(holes, { size: 0.9, tone: "lo" })}</g>` +
    Ln(opening(), { tone: "lo" });
}
