import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D, pipe } from "./model.mjs";
import { INV, floorAt } from "./shell.mjs";
import { TABS, STACK } from "./barrel.mjs";

// The fixed insides: the slide plate the carriage runs on, the trigger's pin boss, the cord with its strain relief
// and clamp, the live and neutral wires to the heater's tabs, and the wire stand under the nose.
const Z = C.ZC, PL = C.PLATE, IN = -C.HW + C.WALL;
export const ZF = INV[5][1];
const wire = (pts, tone = "lo") => k.wireSvg(at(pts[0]), at(pts.at(-1)), { via: pts.slice(1, -1).map(at), tone, size: 0.7 });

export function slidePlate() {
  const out = [];
  for (const x of [PL.x + 1, PL.x + PL.w - 7]) out.push(S(k.slabOf({ x, y: IN, w: 6, d: IN * -1 + PL.y, r: 0.4 }, PL.z - 3, 3, P, 2, 0.3), { tone: "mid" }));
  out.push(S(k.slabOf(PL, PL.z, PL.h, P, 3, 0.3), { tone: "hi" }));
  for (const y of [PL.y, PL.y + PL.d - 1]) out.push(S(k.slabOf({ x: PL.x, y, w: PL.w, d: 1, r: 0.2 }, PL.z + PL.h, 2, P, 2, 0.2), { tone: "hi" }));
  const slot = k.roundedPlan({ x: -86, y: -3, w: 12, d: 6, r: 2.6 }, 6);
  out.push(Ln(k.pathOf(slot.map(([x, y]) => at([x, y, PL.z + PL.h])), true), { tone: "lo" }));
  const screws = [[PL.x + 4, -6], [PL.x + PL.w - 4, -6]];
  out.push(Ln(screws.map(([x, y]) => k.ring(x, y, 1.5, PL.z + PL.h, P, 14)).join(""), { tone: "lo" }) + D(screws.map(([x, y]) => at([x, y, PL.z + PL.h])), { size: 0.5, tone: "mid" }));
  return out.join("");
}

// The boss on the far wall that carries the trigger's pin.
export function pivotBoss() {
  const F = L.frameAlong([C.PIVOT[0], IN, C.PIVOT[1]], [0, 1, 0]);
  return S(L.disc(0, -IN - 4.2, 4.2, F, P, { steps: 28 }), { tone: "mid", crease: "none" }) + Ln(L.circleOf(F, -IN - 4.2, 2, P, 20), { tone: "lo" });
}

// The cord's strain relief at the back of the grip, the cord inside it, and the clamp bridge that grips it.
const RELIEF = { o: [-142.6, 0, 14], d: L.unit3([-1, 0, -0.32]) };
export function cordIn() {
  const out = [S(L.solidOf([[0, 4.4], [2, 4.4], [2, 3.8], [12, 3.0, 1], [16, 2.7]], L.frameAlong(RELIEF.o, RELIEF.d), P), { tone: "mid", crease: "none" })];
  out.push(Ln([4, 6.5, 9, 11.5, 14].map((s) => L.arcOf(L.frameAlong(RELIEF.o, RELIEF.d), s, 3.9 - s * 0.07, P)).join(""), { tone: "lo" }));
  out.push(pipe([[-141, 0, 14.6], [-134, 0, 18], [-126, 0, 21]], 2.4, { tone: "lo", bend: 5, caps: [false, true] }));
  out.push(S(k.slabOf({ x: -133, y: -6, w: 6, d: 12, r: 0.8 }, 22.6, 2.2, P, 2, 0.3), { tone: "hi" }));
  out.push(D([at([-130, -4.4, 24.8]), at([-130, 4.4, 24.8])], { size: 0.55, tone: "lo" }));
  return out.join("");
}
export const RELIEF_TIP = L.add3(RELIEF.o, L.mul3(RELIEF.d, 16));

// The neutral runs along the far corner to the bottom electrode; the live along the floor, where Volta lies, to the top.
export const LIVE = [[-124, -1.2, 21.4], [-123, -9, 30], [-123, -10, 62], [-120, -10, ZF + 0.4], [-60, -10, ZF + 0.4], [-52, -1.6, ZF + 0.4], [-36, -1.6, ZF + 0.4], [-31, -1.6, Z - 24], [-27, -1.6, Z - 16.2], [TABS.live[0] + 1.4, -1.6, STACK.top[1]]];
export const NEUTRAL = [[-124, 1.2, 21.4], [-125, -12, 32], [-125, -12.6, 64], [-121, -12.6, ZF + 0.4], [-44, -12.6, ZF + 0.4], [-28, -12.6, floorAt(-28) + 0.4], [-24, -6.2, Z - 22], [TABS.neutral[0] + 1.4, -4.6, STACK.bot[1]]];
export const neutralWire = () => wire(NEUTRAL);
export const liveWire = () => wire(LIVE);

// The fold-out wire stand under the nose: a U of steel wire clipped under the body, on rubber feet.
const STAND = (s) => [[40, s * 14, 2.2], [27, s * 12, Z - 37.4], [26, s * 6, Z - 37.4], [26, 0, Z - 37.4]];
export function standFar() {
  return S(k.cylinder(40, -14, 2.6, 0, 2.2, P, 18), { tone: "lo" }) + pipe(STAND(-1), 1.1, { tone: "mid", bend: 3, caps: [true, false] }) +
    S(k.slabOf({ x: 23, y: -7, w: 6, d: 7, r: 0.8 }, Z - 37.4, 1.4, P, 2, 0.3), { tone: "mid" });
}
export const standNear = () => S(k.cylinder(40, 14, 2.6, 0, 2.2, P, 18), { tone: "lo" }) + pipe(STAND(1).reverse(), 1.1, { tone: "mid", bend: 3, caps: [false, true] });

// Two stiffening ribs across the grip's inside, short of the wires that run up its back.
export function gripRibs() {
  return [38, 54].map((z) => {
    const xf = -108 + (16 * (z - 4)) / 72 - C.WALL, x0 = -119.5;
    return S(k.slabOf({ x: x0, y: IN, w: xf - x0, d: -3 - IN, r: 0.3 }, z, 1.6, P, 2, 0.2), { tone: "mid" });
  }).join("");
}
