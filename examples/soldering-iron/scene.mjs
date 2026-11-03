import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D, BENCH, WALL_Y, ROOM_TOP, byDepth, pipe } from "./model.mjs";

// The bench around the iron: a pegboard wall with the switched socket, the bench top, the stand, and a solder
// spool, a tin of tip tinner and a small circuit board, all in the kit's own tones.
const FACE = WALL_Y + 6;

export function room() {
  const out = [S(k.slabOf({ x: BENCH.x, y: WALL_Y, w: BENCH.w, d: 6, r: 0.6 }, -16, ROOM_TOP + 16, P, 2), { tone: "mid" })];
  out.push(Ln([30, 90].map((z) => k.segment([BENCH.x, FACE, z], [BENCH.x + BENCH.w, FACE, z], P)).join(""), { tone: "faint" }));
  const peg = { x: -112, w: 224, z0: 40, z1: 136 };
  out.push(S(k.slabOf({ x: peg.x, y: FACE, w: peg.w, d: 2, r: 0.4 }, peg.z0, peg.z1 - peg.z0, P, 2, 0.3), { tone: "hi" }));
  const holes = [];
  for (let x = peg.x + 8; x < peg.x + peg.w - 4; x += 8) for (let z = peg.z0 + 8; z < peg.z1 - 4; z += 8) holes.push(at([x, FACE + 2, z]));
  out.push(D(holes, { size: 0.42, tone: "lo" }));
    return out.join("");
}

// A switched power strip on the bench, its own cord to the wall, and the iron's plug in its first outlet.
// The rocker is drawn by the model.
export function socket() {
  const W = C.SOCKET, T = W.z + 10, box = { x: W.x, y: W.y, w: 46, d: 16, r: 3 }, out = [];
  out.push(pipe([[W.x + 4, W.y, 4], [W.x + 4, WALL_Y + 14, 4], [W.x + 4, WALL_Y + 6, 4]], 2, { tone: "lo", bend: 6 }));
  out.push(S(k.slabOf(box, W.z, 10, P, 5, 0.8), { tone: "hi" }) + Ln(k.sideSeam(box, W.z + 3, P, 5), { tone: "faint" }));
  for (const x of [W.x + 9, W.x + 22]) out.push(Ln(k.ring(x, W.y + 8, 4.4, T, P, 28), { tone: "lo" }) + D([at([x - 1.6, W.y + 8, T]), at([x + 1.6, W.y + 8, T])], { size: 0.5, tone: "lo" }));
  out.push(S(k.slabOf({ x: W.x + 33, y: W.y + 3, w: 9, d: 10, r: 1 }, T, 0.8, P, 3), { tone: "mid" }));
  out.push(D([at([W.x + 3, W.y + 3, T]), at([W.x + 43, W.y + 13, T])], { size: 0.5 }));
  return out.join("");
}
// The plug in the first outlet, drawn after the rocker.
export const plug = () => S(k.slabOf({ x: C.SOCKET.x + 4, y: C.SOCKET.y + 3, w: 10, d: 10, r: 2 }, C.SOCKET.z + 10, 9, P, 4, 0.6), { tone: "mid" }) +
  Ln(k.sideSeam({ x: C.SOCKET.x + 4, y: C.SOCKET.y + 3, w: 10, d: 10, r: 2 }, C.SOCKET.z + 15, P, 4), { tone: "faint" });

// The cord from the plug across the bench and into the iron's strain relief.
export const cordOut = () => pipe([[C.SOCKET.x + 9, C.SOCKET.y + 8, 25], [C.SOCKET.x + 9, C.SOCKET.y + 8, 30], [-168, -28, 26], [-170, -10, 2.5], [-176, 0, 6], [-172, 0, 44], [-162, 0, C.ZC], [-152, 0, C.ZC]], 2.5, { tone: "lo", bend: 10, caps: [true, false] });
export const cordIn = () => pipe([[-152, 0, C.ZC], [-70, 0, C.ZC], [-64.5, 0, 47.2], [-63.6, 0, 47.2]], 2.5, { tone: "lo", bend: 6, caps: [false, false] });

export function bench() {
  const grain = [];
  for (let y = BENCH.y + 12; y < BENCH.y + BENCH.d - 6; y += 14) grain.push(k.lineOnTop([BENCH.x, y], [BENCH.x + BENCH.w, y], 0, P));
  return S(k.slabOf(BENCH, -16, 16, P, 6, 1.2), { tone: "mid" }) + Ln(grain.join(""), { tone: "faint" }) + Ln(k.sideSeam(BENCH, -8, P, 6), { tone: "faint" });
}

// The stand: a cast base on rubber feet with a label plate and a sponge tray, and two V-rests.
const BASE = { x: -114, y: -22, w: 224, d: 44, r: 6 };
export function standBase() {
  const out = [`<path class="iso-halo" d="${k.haloOf(BASE, 0, 10, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(BASE, 8), ([x, y]) => [x, y, 0])) out.push(S(k.cylinder(x, y, 4.2, 0, 3, P, 20), { tone: "lo" }));
  out.push(S(k.slabOf(BASE, 3, 7, P, 6, 1.2), { tone: "mid" }) + Ln(k.planOutline(k.insetPlan(BASE, 4), 10, P, 6), { tone: "faint" }));
  const plate = { x: -70, w: 36 };
  out.push(S(k.slabOf({ x: plate.x, y: 22, w: plate.w, d: 0.6, r: 0.3 }, 4.4, 4.4, P, 2), { tone: "hi" }));
  out.push(Ln([7.6, 6.4, 5.2].map((z, i) => k.segment([plate.x + 4, 22.6, z], [plate.x + 4 + [22, 16, 19][i], 22.6, z], P)).join(""), { tone: "mid", free: true }));
  out.push(D([at([plate.x + 1.6, 22.6, 6.6]), at([plate.x + plate.w - 1.6, 22.6, 6.6])], { size: 0.45 }));
  const tray = { x: 52, y: -17, w: 54, d: 34, r: 3 };
  out.push(S(k.slabOf(tray, 10, 3.4, P, 4, 0.5), { tone: "hi" }));
  const sponge = k.insetPlan(tray, 2.4);
  out.push(S(k.slabOf(sponge, 11, 3.8, P, 4, 0.6), { tone: "hi" }));
  const pores = [];
  for (let i = 0; i < 90; i++) pores.push(at([sponge.x + 2 + ((i * 37) % 47), sponge.y + 2 + ((i * 23) % 26), 14.8]));
  out.push(D(pores, { size: 0.42, tone: "faint" }) + Ln(k.lineOnTop([sponge.x + 24, sponge.y], [sponge.x + 24, sponge.y + sponge.d], 14.8, P), { tone: "faint" }));
  out.push(D(k.corners(BASE, 3).map(([x, y]) => at([x, y, 10])), { size: 0.5 }));
  return out.join("");
}

// A V-rest: a post, a yoke and two prongs whose inner faces touch the iron 45° below its axis.
const prong = (x, rIron, side) => {
  const c = rIron * Math.SQRT1_2, zc = C.ZC - c, w = 2.8;
  const base = zc - (c - 1.2) - 2.6, poly = [[1.2, base], [c + 3.4, base], [c + 3.4, zc + 1.6], [c + 2.2, zc + 2.2], [1.2, zc - (c - 1.2)]];
  return S(L.prismOf(L.frameOf([x - w / 2, 0, 0], [1, 0, 0], [0, side, 0], [0, 0, 1]), poly, 0, w, P), { tone: "hi" });
};
const rest = (x, rIron) => {
  const c = rIron * Math.SQRT1_2, yb = C.ZC - c - (c - 1.2) - 2.6;
  return { yb, c };
};
export function restBack(x, rIron) {
  const { yb, c } = rest(x, rIron);
  return S(k.cylinder(x, 0, 6.4, 10, 1.4, P, 32, 0.4), { tone: "mid" }) + D([0.6, 2.7, 4.8].map((a) => at([x + 4.6 * Math.cos(a), 4.6 * Math.sin(a), 11.4])), { size: 0.5 }) +
    S(k.cylinder(x, 0, 3.2, 11.4, yb - 4 - 11.4, P, 24, 0.4), { tone: "mid" }) +
    S(k.slabOf({ x: x - 1.4, y: -(c + 3.4), w: 2.8, d: 2 * (c + 3.4), r: 0.6 }, yb - 4, 4, P, 3, 0.3), { tone: "mid" }) + prong(x, rIron, -1);
}
export const restFront = (x, rIron) => prong(x, rIron, 1) + D([at([x + 1.4, rest(x, rIron).c + 1.8, rest(x, rIron).yb - 2])], { size: 0.45 });

// A block of spare tips on the stand's base, in front of the iron.
export function spareTips() {
  const out = [];
  const blk = { x: -80, y: 4, w: 36, d: 14, r: 2 };
  out.push(S(k.slabOf(blk, 10, 6, P, 4, 0.6), { tone: "mid" }) + Ln(k.sideSeam(blk, 13, P, 4), { tone: "faint" }));
  for (const [i, x] of [-73, -62, -51].entries()) {
    out.push(Ln(k.ring(x, 11, 4.6, 16, P, 28), { tone: "lo" }));
    const h = [15, 18, 12][i];
    out.push(S(L.solidOf([[0, 3.6], [h - 12, 3.6], [h - 9, 3.2, 1], [h - 3, 1.6, 1], [h, 0.9], [h + 0.4, 0]], L.frameAlong([x, 11, 16], [0, 0, 1]), P), { tone: "hi", crease: "none" }));
    out.push(Ln(L.arcOf(L.frameAlong([x, 11, 16], [0, 0, 1]), 2, 3.6, P), { tone: "faint" }));
  }
  return out.join("");
}

// Props on the bench: the solder spool on its peg, the tin of tinner, and a small board waiting to be soldered.
export function propsBack() {
  const [sx, sy] = [112, -46], out = [];
  out.push(S(k.cylinder(sx, sy, 16, 0, 2, P, 48, 0.5), { tone: "hi" }));
  out.push(S(k.cylinder(sx, sy, 12.6, 2, 17, P, 48), { tone: "hi" }));
  out.push(Ln([5, 8, 11, 14, 17].map((z) => k.sideArc(sx, sy, 12.6, z, P, 32)).join(""), { tone: "faint" }));
  out.push(S(k.cylinder(sx, sy, 16, 19, 2, P, 48, 0.5), { tone: "hi" }) + Ln(k.ring(sx, sy, 5, 21, P, 28), { tone: "mid" }));
  out.push(S(k.cylinder(sx, sy, 3.4, 21, 6, P, 20, 0.3), { tone: "mid" }));
  out.push(pipe([[sx - 12.4, sy + 3, 9.5], [sx - 22, sy + 14, 9.5], [sx - 30, sy + 22, 0.6]], 0.6, { tone: "mid", bend: 6 }));
  return out.join("");
}

export function propsFront() {
  const out = [S(k.cylinder(118, 40, 11, 0, 7, P, 40), { tone: "hi" }), S(k.cylinder(118, 40, 11.4, 7, 2.2, P, 40, 0.5), { tone: "hi" })];
  out.push(Ln(k.ring(118, 40, 7.4, 9.2, P, 32), { tone: "faint" }) + Ln(k.sideArc(118, 40, 11, 3.5, P, 32), { tone: "faint" }));
  const pcb = { x: -98, y: 32, w: 54, d: 30, r: 1.5 };
  for (const [x, y] of byDepth(k.corners(pcb, 3.5), ([x, y]) => [x, y, 0])) out.push(S(k.cylinder(x, y, 1.6, 0, 4, P, 16), { tone: "mid" }));
  out.push(S(k.slabOf(pcb, 4, 1.6, P, 3, 0.3), { tone: "mid" }));
  out.push(S(k.slabOf({ x: -88, y: 38, w: 16, d: 8, r: 0.6 }, 5.6, 2.2, P, 2, 0.3), { tone: "lo" }));
  const pins = [];
  for (let i = 0; i < 6; i++) pins.push(at([-86.5 + i * 2.6, 47, 5.6]), at([-86.5 + i * 2.6, 37, 5.6]));
  out.push(D(pins, { size: 0.5, tone: "hi" }));
  out.push(S(L.solidOf([[0, 1.4], [1.4, 1.9, 1], [7.6, 1.9, 1], [9, 1.4]], L.frameAlong([-64, 44, 7.6], [1, 0, 0]), P), { tone: "hi", crease: "none" }));
  out.push(Ln([2.6, 4.2, 5.8].map((s) => L.arcOf(L.frameAlong([-64, 44, 7.6], [1, 0, 0]), s, 1.9, P)).join(""), { tone: "lo" }));
  out.push(D([at([-67, 44, 5.6]), at([-52, 44, 5.6]), at([-60, 54, 5.6]), at([-54, 54, 5.6])], { size: 0.8, tone: "hi" }));
  return out.join("");
}
