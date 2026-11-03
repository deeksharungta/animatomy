import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D, box, rod, turned, byDepth } from "./model.mjs";

// The disconnector: three poles on a steel frame. Each pole is a copper blade that hinges up off a post
// insulator into the jaw on another, and a rotating insulator beside the hinge turns it. A coupling rod
// under the frame ties the three together; the gearbox on the front leg carries the hand crank and the
// interlock that bolts the drive shaft while the breaker is closed. Behind, wall bushings take the
// three phases out of the hall to the step-up transformer and the grid.
const DS = C.DS, Z = [0, 0, 1], X = [1, 0, 0];
export const RY = C.RY, BY = [-62, -60], RUN = [90, 84, 78]; // rotating insulators' line; bar runs' y and heights
const ins = (x, y, z0, z1, sheds = 4) => {
  const prof = [[0, 3.6], [1.4, 3.6], [1.4, 2.2]];
  const h = z1 - z0 - 3, step = h / sheds;
  for (let i = 0; i < sheds; i++) { const s = 1.4 + i * step + step * 0.45; prof.push([s - 0.6, 2.2], [s - 0.2, 3.4, 1], [s + 0.2, 3.4, 1], [s + 0.6, 2.2]); }
  prof.push([z1 - z0 - 1.6, 2.2], [z1 - z0 - 1.6, 3], [z1 - z0, 3]);
  return S(turned([x, y, z0], Z, prof), { tone: "hi" });
};

export function frame() {
  const out = [];
  out.push(`<path class="iso-halo" d="${k.haloOf({ x: 138, y: -106, w: 58, d: 46, r: 2 }, 0, 4, P)}"/>`);
  for (const [x, y] of [[140, -104], [191, -104], [140, -65], [191, -65]]) {
    out.push(S(box(x - 1, y - 1, 0, x + 4, y + 4, 2, 0.3), { tone: "lo" }) + S(box(x, y, 2, x + 3, y + 3, DS.base, 0.3), { tone: "mid" }));
  }
  out.push(S(box(140, -104, DS.base, 194, -96, DS.base + 4, 0.3, 0.3), { tone: "mid" }));
  for (const x of [140, 191]) out.push(S(box(x, -104, DS.base, x + 3, -62, DS.base + 4, 0.3), { tone: "mid" }));
  return out.join("");
}
export function frontChannel() {
  return S(box(140, -70, DS.base, 194, -62, DS.base + 4, 0.3, 0.3), { tone: "mid" }) + D(DS.xs.map((x) => at([x - 4, -62, DS.base + 2])), { size: 0.45 });
}
// Jaw posts at the back with their jaw blocks and copper fingers.
export function jaws() {
  const out = [];
  for (const x of byDepth(DS.xs, (x) => [x, DS.jy, 0])) {
    out.push(ins(x, DS.jy, DS.base + 4, DS.z - 4));
    out.push(S(box(x - 3, DS.jy - 3, DS.z - 4, x + 3, DS.jy + 3, DS.z, 0.4), { tone: "mid" }));
    out.push(`<g class="pg-cu">${S(box(x - 2, DS.jy - 2, DS.z, x - 0.7, DS.jy + 2, DS.z + 5, 0.2), { tone: "hi" })}</g>`);
  }
  return out.join("");
}
export const jawFront = () => DS.xs.map((x) => `<g class="pg-cu">${S(box(x + 0.7, DS.jy - 2, DS.z, x + 2, DS.jy + 2, DS.z + 5, 0.2), { tone: "hi" })}</g>`).join("");
// Hinge posts and the rotating insulators beside them, with their hinge blocks and pins.
export function hinges() {
  const out = [];
  for (const x of byDepth(DS.xs, (x) => [x, DS.hy, 0])) {
    out.push(ins(x - 7, RY, DS.base + 4, DS.z - 3));
    out.push(S(k.cylinder(x - 7, RY, 2, DS.z - 3, 1.2, P, 16), { tone: "mid" }));
    out.push(ins(x, DS.hy, DS.base + 4, DS.z - 4));
    out.push(S(box(x - 3, DS.hy - 3, DS.z - 4, x + 3, DS.hy + 3, DS.z, 0.4), { tone: "mid" }));
    out.push(S(box(x - 2.4, DS.hy - 1.4, DS.z, x - 0.9, DS.hy + 1.4, DS.z + 3.2, 0.2), { tone: "mid" }));
  }
  return out.join("");
}
export const hingeCheek = () => DS.xs.map((x) => S(box(x + 0.9, DS.hy - 1.4, DS.z, x + 2.4, DS.hy + 1.4, DS.z + 3.2, 0.2), { tone: "mid" }) + S(rod([x + 2.4, DS.hy, DS.z + 1.6], X, 0.9, 0, 1, 12), { tone: "hi" })).join("");

// The copper: risers from the breaker's lower terminals, three nested runs to the hinges, and the bars from the
// jaws through the wall bushings.
const BK = [-97, -95];
export function barsIn() {
  const cu = [], { PHX, BOT } = C;
  PHX.forEach((x, i) => {
    const z = RUN[i], tx = 92 + 5 * i;
    cu.push(S(box(x - 1, BK[0], BOT.z0 - 3, x + 1, BOT.y - 4, BOT.z0, 0.2), { tone: "hi" }));
    cu.push(S(box(x - 1, BK[0], BOT.z0 - 3, x + 1, BK[1], z + 2, 0.2), { tone: "hi" }));
    cu.push(S(box(x - 1, BK[0], z - 2, tx + 1, BK[1], z + 2, 0.2), { tone: "hi" }));
  });
  return `<g class="pg-cu">${cu.join("")}</g>`;
}
export function barsOut() {
  const cu = [], { PHX } = C;
  PHX.forEach((x, i) => {
    const z = RUN[i], to = DS.xs[i], tx = 92 + 5 * i;
    // Outside: forward to the hinge line, then along to the pole, up to its hinge, and a tab into the block.
    cu.push(S(box(tx - 1, BK[0], z - 2, tx + 1, BY[1], z + 2, 0.2), { tone: "hi" }));
    cu.push(S(box(tx - 1, BY[0], z - 2, to + 6, BY[1], z + 2, 0.2), { tone: "hi" }));
    if (z < DS.z - 2) cu.push(S(box(to + 4, BY[0], z - 2, to + 6, BY[1], DS.z - 2, 0.2), { tone: "hi" }));
    cu.push(S(box(to + 3, DS.hy - 1, DS.z - 4, to + 6, BY[1], DS.z - 2, 0.2), { tone: "hi" }));
  });
  return `<g class="pg-cu">${cu.join("")}</g>`;
}
export function barsUp() {
  const { PHX, BOT } = C;
  return `<g class="pg-cu">${PHX.map((x) => S(box(x - 1, BOT.y - 1, BOT.z1 + 3, x + 1, BOT.y + 1, C.CUB_TOP, 0.2), { tone: "hi" })).join("")}</g>`;
}
export function wallBushings() {
  const out = [S(box(142, C.FLOOR_Y, 80, 192, C.FLOOR_Y + 2, 104, 0.4, 0.4), { tone: "mid" })];
  out.push(D([[144, C.FLOOR_Y + 2, 82], [190, C.FLOOR_Y + 2, 82], [144, C.FLOOR_Y + 2, 102], [190, C.FLOOR_Y + 2, 102]].map(at), { size: 0.5 }));
  for (const x of DS.xs) {
    const prof = [[0, 5.5], [1.5, 5.5], [1.5, 2.6]];
    for (const s of [4, 7, 10]) prof.push([s - 0.6, 2.6], [s - 0.2, 4.4, 1], [s + 0.2, 4.4, 1], [s + 0.6, 2.6]);
    prof.push([12, 2.6], [12, 1.2], [14.6, 1.2]);
    out.push(S(turned([x, C.FLOOR_Y + 2, DS.z - 2], [0, 1, 0], prof), { tone: "hi" }));
  }
  return out.join("");
}
// The gearbox on the front leg, the drive shaft up to the bell crank, and the interlock's housing.
const GB = C.GB;
export function gearbox() {
  const out = [], { x, y } = GB, z = C.GBX.z;
  out.push(S(box(x - 4.5, -62, z - 6, x + 4.5, -55, z + 6, 0.5, 0.4), { tone: "mid" }));
  out.push(D([[x - 3, -55, z - 4.5], [x + 3, -55, z - 4.5], [x - 3, -55, z + 4.5], [x + 3, -55, z + 4.5]].map(at), { size: 0.45 }));
  out.push(S(k.cylinder(x, y, 1.2, z + 6, DS.base - 4 - z - 6, P, 14), { tone: "hi", crease: "none" }));
  out.push(S(box(x - 2.5, -67, DS.base - 4, x + 3, -56, DS.base, 0.3), { tone: "mid" }));
  out.push(S(box(146, -61, z + 1, 154, -54, z + 11, 0.5, 0.4), { tone: "mid" }));
  out.push(D([[147.5, -54, z + 9], [152.5, -54, z + 9]].map(at), { size: 0.45 }));
  return out.join("");
}
