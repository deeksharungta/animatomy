// The valves, drawn once: the flush valve's flange, seat and overflow tube; the fill valve's riser, body, cap and
// hush tube; the refill tube along the back wall to the overflow's clip; and the supply from the wall's angle stop.
// What moves (the float arm and its lever, the plunger, the trip arm, the chain) is in moving.mjs.
import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D, up, alongY, pipe } from "./model.mjs";

const Z0 = C.Z0, SE = C.SEAT, OV = C.OVER, FI = C.FILL;

// The flush valve's flange on the floor, its three lugs, and the web that joins the overflow tube to the seat.
export function flushBase() {
  const out = [], F = up(SE.x, SE.y, Z0);
  out.push(S(L.solidOf([[0, SE.flange], [4, SE.flange, 1], [6, SE.flange - 3, 1]], F, P), { tone: "hi", crease: "faint" }));
  out.push(D(L.dotsOf(F, 6, SE.flange - 6, 3, P, { phase: 0.9, all: true }), { size: 0.9, tone: "mid" }));
  out.push(S(k.slabOf({ x: OV.x - 9, y: OV.y, w: 18, d: SE.y - OV.y - SE.r, r: 2 }, Z0 + 6, 14, P, 3, 0.6), { tone: "hi", crease: "lo" }));
  return out.join("");
}

// The overflow tube: a plastic standpipe with its rim, water-line ticks on its face and the refill tube's clip.
export function overflow() {
  const out = [], F = up(OV.x, OV.y, Z0 + 6), h = OV.top - 6;
  const ticks = [], sF = L.frameOf([OV.x, OV.y, 0], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  for (let z = Z0 + 60; z <= Z0 + 136; z += 8) ticks.push(L.arcOf(sF, z, OV.r + 0.3, P, { from: 0.9, to: z === Z0 + C.FULL ? 2.5 : 1.5 }));
  out.push(S(L.solidOf([[0, OV.r + 2], [6, OV.r + 2], [8, OV.r, 1], [h, OV.r]], F, P), { tone: "hi", crease: "faint", inner: Ln(ticks.join(""), { tone: "mid", free: true }) }));
  out.push(S(L.ringBand(h, h + 3, OV.r - 2, OV.r + 1.5, F, P), { tone: "hi", crease: "lo" }));
  out.push(`<path class="tc-void" d="${k.ring(OV.x, OV.y, OV.r - 2, Z0 + OV.top + 3, P, 36)}"/>`);
  out.push(S(k.slabOf({ x: OV.x - 4, y: OV.y - OV.r - 5, w: 8, d: 7, r: 1.5 }, Z0 + OV.top - 10, 14, P, 3, 0.4), { tone: "mid", crease: "faint" }));
  return out.join("");
}

// The seat ring Ottie stands on, and the dark throat under her when she lifts.
export function seatRing() {
  const out = [], F = up(SE.x, SE.y, Z0 + 6);
  out.push(S(L.ringBand(0, SE.top - 6, SE.r, SE.r + 5, F, P, {}), { tone: "hi", crease: "lo" }));
  out.push(Ln(k.ring(SE.x, SE.y, SE.r + 2.5, Z0 + SE.top, P, 48), { tone: "faint" }));
  return out.join("");
}

// The fill valve: inner locknut (tank.mjs), riser, the valve body with its pivot ears, cap and three screws,
// the refill nipple at its back and the hush tube that carries the incoming water down under the surface.
export function fillValve() {
  const out = [], F = up(FI.x, FI.y, Z0 + 11);
  out.push(S(L.solidOf([[0, 9], [FI.z0 - 18, 9], [FI.z0 - 14, 12, 1], [FI.z0 - 11, 12]], F, P), { tone: "hi", crease: "faint", inner: Ln([40, 80].map((s) => L.arcOf(F, s, 9.1, P)).join(""), { tone: "faint" }) }));
  out.push(S(k.cylinder(FI.x - 13, FI.y, 4, Z0 + 36, FI.z0 - 36, P, 16), { tone: "hi" }));
  out.push(S(k.cylinder(FI.x - 13, FI.y, 5, Z0 + 32, 4, P, 16), { tone: "mid" }));
  const B = up(FI.x, FI.y, Z0 + FI.z0);
  out.push(S(L.solidOf([[0, FI.r - 3], [3, FI.r, 1], [FI.z1 - FI.z0 - 4, FI.r], [FI.z1 - FI.z0, FI.r - 2, 1]], B, P), { tone: "hi", crease: "faint", inner: Ln(L.arcOf(B, 10, FI.r + 0.1, P), { tone: "faint" }) }));
  out.push(S(L.disc(FI.z1 - FI.z0, FI.z1 - FI.z0 + 4, FI.r + 1, B, P), { tone: "hi", crease: "lo" }));
  out.push(D(L.dotsOf(B, FI.z1 - FI.z0 + 4, FI.r - 4, 3, P, { phase: 0.3, all: true }), { size: 0.8, tone: "mid" }));
  out.push(Ln(k.knurl(FI.x, FI.y, FI.r + 1, Z0 + FI.z1, Z0 + FI.z1 + 4, 28, P), { tone: "faint" }));
  out.push(S(k.cylinder(FI.x, FI.y, 6, Z0 + FI.z1 + 4, 4, P, 20), { tone: "mid" }));
  // The pivot ears on the body's right, and the pin through them.
  for (const dy of [-6, 4]) out.push(S(k.slabOf({ x: FI.x + 10, y: FI.y + dy, w: 7, d: 2, r: 0.4 }, Z0 + FI.z1 - 2, C.PIVOT[2] - FI.z1 + 6, P, 2), { tone: "mid" }));
  out.push(S(L.disc(-8, 8, 1.6, alongY(C.PIVOT[0], FI.y, Z0 + C.PIVOT[2]), P), { tone: "hi" }));
  out.push(S(k.cylinder(FI.x, FI.y - FI.r - 4, 3, Z0 + FI.z0 + 14, 9, P, 12), { tone: "hi" }));
  return out.join("");
}

// The refill tube: from the nipple up the back wall, along it, and down into the overflow's clip.
export const REFILL = [[FI.x, FI.y - FI.r - 4, Z0 + FI.z0 + 23], [FI.x, 36, Z0 + 204], [OV.x - 6, 36, Z0 + 204], [OV.x, OV.y - OV.r - 1, Z0 + OV.top + 10], [OV.x, OV.y - 6, Z0 + OV.top + 6]];
export function refill() {
  const out = [pipe(REFILL, 3.2, { tone: "hi", bend: 14 })];
  for (const x of [-120, -20]) out.push(S(k.slabOf({ x: x - 4, y: C.TANK.y0 + C.TANK.wall, w: 8, d: 13, r: 1.5 }, Z0 + 199, 10, P, 3, 0.4), { tone: "mid", crease: "faint" }));
  return out.join("");
}

// The supply: chrome angle stop on the back wall with its escutcheon and oval handle, the braided hose up to the
// fill valve's shank, and the shank's coupling nut under the tank.
export function supply() {
  const out = [], x = FI.x, z = 200, W = alongY(x, 0, z);
  out.push(S(L.solidOf([[0, 32], [2, 32, 1], [8, 18, 1], [12, 14]], W, P), { tone: "hi", crease: "faint" }));
  out.push(S(L.disc(12, 34, 11, W, P), { tone: "hi", crease: "lo" }));
  out.push(S(L.solidOf([[34, 11], [38, 8, 1], [44, 8]], W, P), { tone: "hi" }));
  out.push(S(k.slabOf({ x: x - 5, y: 42, w: 10, d: 6, r: 2 }, z - 26, 52, P, 3, 0.6), { tone: "hi", crease: "lo" }));
  out.push(S(k.cylinder(x, 26, 8, z + 8, 16, P, 20), { tone: "hi" }));
  out.push(S(k.extrude([0, 1, 2, 3, 4, 5].map((i) => [x + 10 * Math.cos((i / 6) * Math.PI * 2), 26 + 10 * Math.sin((i / 6) * Math.PI * 2)]), z + 24, 10, P), { tone: "hi", crease: "lo" }));
  const hose = [[x, 26, z + 34], [x, 26, z + 70], [x, 74, C.TANK.z0 - 60], [x, 74, C.TANK.z0 - 34]];
  out.push(pipe(hose, 5.5, { tone: "mid", bend: 40 }));
  const sh = up(x, 74, C.TANK.z0 - 34);
  out.push(S(k.extrude([0, 1, 2, 3, 4, 5].map((i) => [x + 13 * Math.cos((i / 6) * Math.PI * 2), 74 + 13 * Math.sin((i / 6) * Math.PI * 2)]), C.TANK.z0 - 34, 14, P), { tone: "hi", crease: "lo" }));
  out.push(S(L.disc(14, 34, 10, sh, P), { tone: "hi", inner: Ln([20, 26].map((s) => L.arcOf(sh, s, 10.1, P)).join(""), { tone: "faint" }) }));
  return out.join("");
}
