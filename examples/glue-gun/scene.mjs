import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D, BENCH, WALL_Y, ROOM_TOP, byDepth, pipe } from "./model.mjs";

// The craft bench round the gun: a pegboard wall, the bench top and a silicone mat, a switched power strip,
// a carton of spare sticks, a ruler, and the plywood box being glued, all in the kit's own tones.
const FACE = WALL_Y + 6;
export const STRIP = C.STRIP;
export const MAT = { x: -150, y: -28, w: 194, d: 62, r: 3 };

export function room() {
  const out = [S(k.slabOf({ x: BENCH.x, y: WALL_Y, w: BENCH.w, d: 6, r: 0.6 }, -16, ROOM_TOP + 16, P, 2), { tone: "mid" })];
  out.push(Ln([30, 144].map((z) => k.sideSeam({ x: BENCH.x, y: WALL_Y, w: BENCH.w, d: 6, r: 0.6 }, z, P, 2)).join(""), { tone: "faint" }));
  const peg = { x: -176, w: 294, z0: 52, z1: 138 };
  out.push(S(k.slabOf({ x: peg.x, y: FACE, w: peg.w, d: 2, r: 0.4 }, peg.z0, peg.z1 - peg.z0, P, 2, 0.3), { tone: "hi" }));
  const holes = [];
  for (let x = peg.x + 8; x < peg.x + peg.w - 4; x += 8) for (let z = peg.z0 + 8; z < peg.z1 - 4; z += 8) holes.push(at([x, FACE + 2, z]));
  out.push(D(holes, { size: 0.42, tone: "lo" }));
  out.push(hooks(FACE + 2));
  // A skirting board along the foot of the wall, and the wall socket the strip is plugged into.
  out.push(S(k.slabOf({ x: BENCH.x, y: FACE, w: BENCH.w, d: 1.6, r: 0.3 }, 0, 8, P, 2, 0.3), { tone: "mid" }));
  const sock = { x: -172, y: FACE + 1.6, w: 16, d: 1.4, r: 1.2 };
  out.push(S(k.slabOf(sock, 14, 16, P, 3, 0.3), { tone: "hi" }) + D([at([sock.x + 3, sock.y + 1.4, 28]), at([sock.x + 13, sock.y + 1.4, 28])], { size: 0.45, tone: "lo" }));
  out.push(S(k.slabOf({ x: -167, y: sock.y + 1.4, w: 6, d: 6, r: 1 }, 17, 9, P, 3, 0.4), { tone: "mid" }));
  // A roll of masking tape and a coil of craft wire on hooks.
  for (const [x, z] of [[-150, 120], [96, 116]]) out.push(pipe([[x, FACE + 2, z], [x, FACE + 7, z], [x, FACE + 8.5, z + 3]], 0.7, { tone: "mid", bend: 1.4 }));
  const TF = L.frameAlong([-150, FACE + 7, 112], [0, 1, 0]);
  out.push(S(L.solidOf([[0, 8.6], [5, 8.6]], TF, P), { tone: "hi", crease: "none" }) + S(L.disc(5, 5.2, 8.6, TF, P), { tone: "hi" }) + Ln(L.circleOf(TF, 5.2, 5.4, P), { tone: "lo" }));
  const coil = [];
  for (let i = 0; i <= 40; i++) { const a = (i / 40) * Math.PI * 2 + Math.PI / 2; coil.push([96 + 7 * Math.cos(a), FACE + 7.6, 109 + 7 * Math.sin(a)]); }
  out.push(pipe(coil, 0.9, { tone: "lo", bend: 1, caps: false }));
  return out.join("");
}

// A pegboard hook holding a steel rule.
function hooks(y) {
  const out = [];
  for (const [x, z] of [[-110, 128]]) out.push(pipe([[x, y, z], [x, y + 5, z], [x, y + 6.5, z + 3]], 0.7, { tone: "mid", bend: 1.4 }));
  const rule = { x: -113, w: 6 };
  out.push(S(k.slabOf({ x: rule.x, y: y + 4, w: rule.w, d: 0.8, r: 0.3 }, 58, 74, P, 2), { tone: "hi" }));
  const minor = [], major = [];
  for (let i = 0, z = 62; z < 124; z += 2, i++) (i % 5 ? minor : major).push(k.segment([rule.x, y + 4.8, z], [rule.x + (i % 5 ? 1.6 : 2.8), y + 4.8, z], P));
  out.push(Ln(minor.join(""), { tone: "lo" }) + Ln(major.join(""), { tone: "mid" }));
  return out.join("");
}

export function bench() {
  const grain = [];
  for (let y = BENCH.y + 12; y < BENCH.y + BENCH.d - 6; y += 14) grain.push(k.lineOnTop([BENCH.x, y], [BENCH.x + BENCH.w, y], 0, P));
  const out = [S(k.slabOf(BENCH, -16, 16, P, 6, 1.2), { tone: "mid" }), Ln(grain.join(""), { tone: "faint" }), Ln(k.sideSeam(BENCH, -8, P, 6), { tone: "faint" })];
  out.push(S(k.slabOf(MAT, 0, 0.8, P, 4, 0.3), { tone: "hi" }));
  const grid = [];
  for (let x = MAT.x + 10; x < MAT.x + MAT.w - 4; x += 10) grid.push(k.lineOnTop([x, MAT.y], [x, MAT.y + MAT.d], 0.8, P));
  for (let y = MAT.y + 11; y < MAT.y + MAT.d - 4; y += 11) grid.push(k.lineOnTop([MAT.x, y], [MAT.x + MAT.w, y], 0.8, P));
  out.push(Ln(grid.join(""), { tone: "faint" }));
  return out.join("");
}

// A switched power strip on the bench; its rocker is drawn by the model.
export function strip() {
  const W = STRIP, T = W.z + 10, box = { x: W.x, y: W.y, w: 50, d: 17, r: 3 }, out = [];
  out.push(pipe([[W.x + 4, W.y, 4], [W.x + 4, FACE + 12, 4], [-164, FACE + 12, 4], [-164, FACE + 6, 10], [-164, FACE + 6, 17]], 2, { tone: "lo", bend: 4, caps: [true, false] }));
  out.push(S(k.slabOf(box, W.z, 10, P, 5, 0.8), { tone: "hi" }) + Ln(k.sideSeam(box, W.z + 3, P, 5), { tone: "faint" }));
  for (const x of [W.x + 10, W.x + 24]) out.push(Ln(k.ring(x, W.y + 8.5, 4.4, T, P, 28), { tone: "lo" }) + D([at([x - 1.6, W.y + 8.5, T]), at([x + 1.6, W.y + 8.5, T])], { size: 0.5, tone: "lo" }));
  out.push(S(k.slabOf({ x: W.x + 36, y: W.y + 3.5, w: 9, d: 10, r: 1 }, T, 0.8, P, 3), { tone: "mid" }));
  out.push(D([at([W.x + 3, W.y + 3, T]), at([W.x + 47, W.y + 14, T])], { size: 0.5 }));
  return out.join("");
}
const PLUG = { x: STRIP.x + 5, y: STRIP.y + 3.5, w: 10, d: 10, r: 2 };
export const plug = () => S(k.slabOf(PLUG, STRIP.z + 10, 9, P, 4, 0.6), { tone: "mid" }) + Ln(k.sideSeam(PLUG, STRIP.z + 15, P, 4), { tone: "faint" });
// The cord from the plug across the bench to the gun's strain relief at the back of the grip.
export const CORD_END = [-147, 0, 13];
export const cord = () => pipe([[PLUG.x + 5, PLUG.y + 5, 19], [PLUG.x + 5, PLUG.y + 5, 24], [-162, -26, 20], [-160, -8, 2.4], [-156, 0, 2.4], [-158, 0, 9], [CORD_END[0] - 4, 0, CORD_END[2]]], 2.4, { tone: "lo", bend: 8, caps: [true, false] });
