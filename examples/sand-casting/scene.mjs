import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D, byDepth, rod } from "./model.mjs";

const F = C.FLOOR, WY = C.WALL_Y, WT = 228;
// The foundry around the mould: a brick wall with a jib beam, a concrete floor in slabs, and the moulder's tools.
export function room() {
  const out = [S(k.slabOf({ x: F.x, y: WY - 6, w: F.w, d: 6, r: 0.6 }, -14, WT + 14, P, 2), { tone: "mid" })];
  const bricks = [];
  for (let z = 7, row = 0; z < WT; z += 7, row++) {
    bricks.push(k.segment([F.x, WY, z], [F.x + F.w, WY, z], P));
    for (let x = F.x + (row % 2 ? 9 : 0) + 18; x < F.x + F.w; x += 18) bricks.push(k.segment([x, WY, z], [x, WY, Math.min(WT, z + 7)], P));
  }
  for (let x = F.x + 18; x < F.x + F.w; x += 18) bricks.push(k.segment([x, WY, 0], [x, WY, 7], P));
  bricks.push(k.segment([F.x + F.w, WY, -14], [F.x + F.w, WY, WT], P));
  out.push(Ln(bricks.join(""), { tone: "faint" }));
  // A short side wall at the left, tiled lower down where the sand is shovelled.
  out.push(S(k.slabOf({ x: F.x - 6, y: WY - 6, w: 6, d: 92, r: 0.6 }, -14, 140 + 14, P, 2), { tone: "mid" }));
  const side = [];
  for (let z = 7; z < 140; z += 7) side.push(k.segment([F.x, WY, z], [F.x, WY + 86, z], P));
  for (let y = WY + 12; y < WY + 86; y += 18) for (let z = 0; z < 140; z += 7) { const yy = y + ((z / 7) % 2 ? 9 : 0); if (yy < WY + 85) side.push(k.segment([F.x, yy, z], [F.x, yy, Math.min(140, z + 7)], P)); }
  side.push(k.segment([F.x, WY + 86, -14], [F.x, WY + 86, 140], P));
  out.push(Ln(side.join(""), { tone: "faint" }));
  // A wall plate and a knee brace carry the jib beam out over the mould.
  const B = C.BEAM;
  out.push(S(k.slabOf({ x: B.x - 9, y: WY, w: 18, d: 2.4, r: 0.4 }, B.z - 46, 58, P, 2, 0.4), { tone: "mid" }));
  for (const dx of [-3.5, 3.5]) out.push(S(k.slabOf({ x: B.x + dx - 0.6, y: WY + 2.4, w: 1.2, d: 3, r: 0.2 }, B.z - 46, 37, P, 2), { tone: "mid" }));
  out.push(D([[-7, 50], [7, 50], [-7, 4], [7, 4], [-7, -40], [7, -40]].map(([dx, dz]) => at([B.x + dx, WY + 2.4, B.z + dz])), { size: 0.6 }));
  out.push(S(rod([B.x, WY + 2.4, B.z - 40], [B.x, WY + 52, B.z - 3], 1.2, 10), { tone: "mid" }));
  out.push(S(k.slabOf({ x: B.x - 1, y: WY + 2.4, w: 2, d: 3, r: 0.3 }, B.z - 43, 6, P, 2), { tone: "mid" }));
  return out.join("");
}

export function floor() {
  const out = [S(k.slabOf(F, -14, 14, P, 4, 1.2), { tone: "mid" })];
  const joints = [];
  for (let x = F.x + 62; x < F.x + F.w; x += 62) joints.push(k.lineOnTop([x, F.y], [x, F.y + F.d], 0, P));
  for (let y = F.y + 58; y < F.y + F.d; y += 58) joints.push(k.lineOnTop([F.x, y], [F.x + F.w, y], 0, P));
  out.push(Ln(joints.join(""), { tone: "faint" }));
  out.push(Ln(k.sideSeam(F, -5, P, 4), { tone: "faint" }));
  // Spilled moulding sand, swept into a low heap by the wall; and a bed of dry sand under the ladle's path, with
  // the shovel that spread it, for any steel that misses the cup.
  out.push(S(L.solidOf([[0, 16], [2, 15, 1], [5, 11, 1], [7, 6, 1], [8, 0]], L.frameAlong([22, -94, 0], [0, 0, 1]), P), { tone: "lo", crease: "none" }));
  out.push(S(L.solidOf([[0, 19], [1.5, 18, 1], [3.5, 13, 1], [5, 6, 1], [5.6, 0]], L.frameAlong([-100, 4, 0], [0, 0, 1]), P), { tone: "lo", crease: "none" }));
  const bl = L.frameOf([-78, 18, 0.4], L.unit3([-1, 0.25, 0]), L.unit3([0.25, 1, 0]), [0, 0, 1]);
  out.push(S(L.prismOf(bl, [[-3.4, -0.3], [3.4, -0.3], [3, 0.3], [-3, 0.3]], 0, 7, P), { tone: "mid" }));
  out.push(S(rod([-85, 19.8, 0.8], [-106, 25, 6.6], 0.75, 10), { tone: "mid" }));
  out.push(S(L.disc(0, 4, 1.3, L.frameAlong([-106, 25, 6.6], L.unit3([-21, 5.2, 5.8])), P), { tone: "mid" }));
  return out.join("");
}

// The jib beam, an I-section along y, with the hoist trolley on its bottom flange and the rope down to the hook.
export function beam() {
  const B = C.BEAM, out = [];
  out.push(S(k.slabOf({ x: B.x - 5, y: B.y0, w: 10, d: B.y1 - B.y0, r: 0.3 }, B.z - 9, 1.4, P, 2), { tone: "mid" }));
  out.push(S(k.slabOf({ x: B.x - 0.7, y: B.y0, w: 1.4, d: B.y1 - B.y0, r: 0.2 }, B.z - 7.6, 6.2, P, 2), { tone: "mid" }));
  // Web stiffeners along the jib, on both sides of the web.
  for (const y of [-84, -66, -48, -30]) for (const sx of [-1, 1]) out.push(S(k.slabOf({ x: sx > 0 ? B.x + 0.7 : B.x - 4.6, y: y - 0.5, w: 3.9, d: 1, r: 0.15 }, B.z - 7.6, 6.2, P, 2), { tone: "mid" }));
  out.push(S(k.slabOf({ x: B.x - 5, y: B.y0, w: 10, d: B.y1 - B.y0, r: 0.3 }, B.z - 1.4, 1.4, P, 2, 0.4), { tone: "mid" }));
  out.push(S(k.slabOf({ x: B.x - 6, y: B.y1 - 2, w: 12, d: 2, r: 0.3 }, B.z - 11, 13, P, 2), { tone: "mid" }));
  return out.join("");
}
export function trolley() {
  const B = C.BEAM, out = [], z = B.z - 9;
  for (const side of [-1, 1]) out.push(S(k.slabOf({ x: B.x + side * 6.4 - 0.7, y: -9, w: 1.4, d: 18, r: 0.3 }, z - 14, 16, P, 2), { tone: "mid" }));
  for (const y of [-6, 6]) for (const side of [1]) out.push(S(L.disc(-0.8, 0.8, 2.6, L.frameAlong([B.x + side * 5.5, y, z + 2.4], [1, 0, 0]), P), { tone: "hi" }));
  // The hoist: a drum between two end frames, its motor on the near end.
  out.push(S(L.solidOf([[-11, 0], [-11, 5.5], [11, 5.5], [11, 0]], L.frameAlong([B.x, 0, z - 20], [0, 1, 0]), P), { tone: "mid" }));
  const grooves = [];
  for (let s = -9; s <= 9; s += 1.5) grooves.push(L.arcOf(L.frameAlong([B.x, 0, z - 20], [0, 1, 0]), s, 5.5, P));
  out.push(Ln(grooves.join(""), { tone: "faint" }));
  out.push(S(L.disc(0, 1.6, 8, L.frameAlong([B.x, 11, z - 20], [0, 1, 0]), P), { tone: "mid" }));
  out.push(S(L.solidOf([[0, 0], [0, 6.5], [9, 6.5, 1], [10, 5], [10, 0]], L.frameAlong([B.x, 12.6, z - 20], [0, 1, 0]), P), { tone: "mid" }));
  out.push(Ln(L.ribsOf(L.frameAlong([B.x, 12.6, z - 20], [0, 1, 0]), 0, 8.6, 6.5, 18, P, { seams: true }), { tone: "lo" }));
  return out.join("");
}

// Props, all in the kit's tones: a sand riddle, a rammer leaning on the wall, the pyrometer lance on its hooks,
// and the next mould, closed and clamped, waiting its turn.
export function props() {
  const out = [];
  const [rx, ry] = [56, 19], rid = L.frameAlong([rx, ry, 0], [0, 0, 1]);
  out.push(S(L.ringBand(0, 7, 13, 14.4, rid, P), { tone: "mid" }));
  out.push(`<path class="sc-mesh" d="${L.circleOf(rid, 5, 13, P, 48)}"/>`);
  const holes = [];
  for (let i = -6; i <= 6; i++) for (let j = -6; j <= 6; j++) if (Math.hypot(i, j) * 2.2 < 11.6) holes.push(at([rx + i * 2.2, ry + j * 2.2, 5]));
  out.push(D(holes, { size: 0.45, tone: "lo" }));
  out.push(S(rod([77, WY + 1, 0.5], [79, WY + 13, 150], 1.3), { tone: "mid" }));
  out.push(S(k.cylinder(77, WY + 1, 4.2, 0, 7, P, 24, 0.5), { tone: "mid" }));
  out.push(S(L.disc(0, 6, 2.2, L.frameAlong([79.1, WY + 13.4, 150], L.unit3([2, 12, 150])), P), { tone: "mid" }));
  for (const x of [14, 58]) out.push(S(k.slabOf({ x: x - 1, y: WY, w: 2, d: 4, r: 0.3 }, 131, 3, P, 2), { tone: "mid" }));
  out.push(S(rod([6, WY + 3, 134.6], [74, WY + 3, 134.6], 0.8, 10), { tone: "mid" }));
  out.push(S(L.disc(0, 9, 1.8, L.frameAlong([74, WY + 3, 134.6], [1, 0, 0]), P), { tone: "hi" }));
  out.push(S(L.disc(0, 12, 1.6, L.frameAlong([-6, WY + 3, 134.6], [1, 0, 0]), P), { tone: "mid" }));
  return out.join("");
}
export function nextMould() {
  const out = [], M = { x: 40, y: -96, w: 34, d: 30, r: 0.4 };
  out.push(`<path class="iso-halo" d="${k.haloOf(M, 0, 4, P)}"/>`);
  out.push(S(k.slabOf({ ...M, x: M.x - 2, y: M.y - 2, w: M.w + 4, d: M.d + 4 }, 0, 3, P, 2, 0.4), { tone: "lo" }));
  out.push(S(k.slabOf(M, 3, 24, P, 2, 0.4), { tone: "mid", inner: Ln(k.sideSeam(M, 25, P, 2), { tone: "faint" }) }));
  out.push(S(k.slabOf(M, 27, 20, P, 2, 0.4), { tone: "mid", inner: Ln(k.sideSeam(M, 29, P, 2), { tone: "faint" }) }));
  out.push(Ln(k.planOutline(k.insetPlan(M, 1.4), 47, P, 2), { tone: "faint" }));
  out.push(`<path class="sc-void sc-hole" d="${k.ring(M.x + 7, M.y + 15, 3.4, 47, P, 24)}"/><path class="sc-void sc-hole" d="${k.ring(M.x + 25, M.y + 15, 3.8, 47, P, 24)}"/>`);
  for (const y of [M.y + 6, M.y + 24]) out.push(S(k.slabOf({ x: M.x + M.w, y: y - 2, w: 4, d: 4, r: 0.4 }, 22, 10, P, 2, 0.3), { tone: "mid" }));
  out.push(D([[M.x + M.w + 4, M.y + 6, 27], [M.x + M.w + 4, M.y + 24, 27]].map(at), { size: 0.6 }));
  // Corner ribs and a handle on each half's front.
  for (const [z0, z1] of [[3, 27], [27, 47]]) for (const x of [M.x + 1.2, M.x + M.w - 2.6]) out.push(S(k.slabOf({ x, y: M.y + M.d, w: 1.4, d: 1.2, r: 0.2 }, z0, z1 - z0, P, 2), { tone: "mid" }));
  for (const z of [14, 38]) {
    for (const x of [M.x + 8, M.x + 26]) out.push(S(k.slabOf({ x: x - 0.8, y: M.y + M.d, w: 1.6, d: 3.4, r: 0.3 }, z - 1.4, 2.8, P, 2), { tone: "mid" }));
    out.push(S(rod([M.x + 7, M.y + M.d + 3.4, z], [M.x + 27, M.y + M.d + 3.4, z], 0.9, 10), { tone: "mid" }));
  }
  return out.join("");
}
// The crane's pendant, hanging on its cable from the hoist: your hand on the crane.
export function pendant() {
  const B = C.BEAM, x = B.x + 13, y = 16, z = 126, out = [];
  out.push(S(rod([x, y, B.z - 26], [x, y, z + 14], 0.4, 8), { tone: "mid" }));
  out.push(S(k.slabOf({ x: x - 2.6, y: y - 2, w: 5.2, d: 4, r: 1 }, z, 14, P, 4, 0.4), { tone: "mid" }));
  out.push(D([[x + 2.6, y - 0.6, z + 10.5], [x + 2.6, y - 0.6, z + 7], [x + 2.6, y - 0.6, z + 3.5]].map(at), { size: 0.9, tone: "hi" }));
  return out.join("");
}
