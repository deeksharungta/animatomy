import * as k from "../../kit/iso-kit.mjs";
import { C, P, at, S_ as S, Ln, Dt, ROOM_TOP } from "./model.mjs";

// ---------------------------------------------------------------- the room and the bench

const B = C.BENCH, TOP = ROOM_TOP;
export function room() {
  const out = [];
  out.push(S(k.slabOf({ x: B.x, y: B.y - 6, w: B.w, d: 6, r: 0.6 }, -14, TOP + 14, P, 2), { tone: "mid" }));
  const yb = B.y, xe = B.x + B.w, ye = B.y + B.d, h = [], v = [];
  for (let z = 16; z < TOP; z += 16) h.push(k.pathOf([at([B.x, yb, z]), at([xe, yb, z]), at([xe, yb - 6, z])]));
  for (let x = B.x + 16; x < xe - 1; x += 16) v.push(k.segment([x, yb, 0], [x, yb, TOP], P));
  out.push(Ln(h.join("") + v.join(""), { tone: "faint" }));
  out.push(S(k.slabOf({ x: B.x - 6, y: B.y - 6, w: 6, d: B.d + 6, r: 0.6 }, -14, TOP + 14, P, 2), { tone: "mid" }));
  const hs = [], vs = [];
  for (let z = 16; z < TOP; z += 16) hs.push(k.pathOf([at([B.x, yb, z]), at([B.x, ye, z]), at([B.x - 6, ye, z])]));
  for (let y = yb + 16; y < ye - 1; y += 16) vs.push(k.segment([B.x, y, 0], [B.x, y, TOP], P));
  out.push(Ln(hs.join("") + vs.join(""), { tone: "faint" }));
  // A framed chart on the side wall: the precession law, drawn as a curve of lap time against spin.
  const fy = -24, fz = 88, fw = 70, fh = 44;
  out.push(S(k.slabOf({ x: B.x, y: fy, w: 2, d: fw, r: 0.4 }, fz, fh, P, 2, 0.4), { tone: "hi" }));
  const face = (y, z) => [B.x + 2, y, z];
  out.push(Ln(k.pathOf([at(face(fy + 4, fz + 4)), at(face(fy + fw - 4, fz + 4)), at(face(fy + fw - 4, fz + fh - 4)), at(face(fy + 4, fz + fh - 4))], true), { tone: "faint" }));
  const curve = [];
  for (let i = 0; i <= 24; i++) { const u = i / 24; curve.push(at(face(fy + 10 + u * (fw - 18), fz + 9 + 28 / (1 + 5 * u)))); }
  out.push(Ln(k.pathOf([at(face(fy + 10, fz + fh - 7)), at(face(fy + 10, fz + 8)), at(face(fy + fw - 7, fz + 8))]), { tone: "lo", free: true }), Ln(k.pathOf(curve), { tone: "mid", free: true }));
  out.push(Ln([0, 1, 2].map((i) => k.pathOf([at(face(fy + 30, fz + fh - 9 - i * 3)), at(face(fy + (i ? 52 : 58), fz + fh - 9 - i * 3))])).join(""), { tone: "faint", free: true }));
  out.push(Dt([[fy + 1.6, fz + 1.6], [fy + fw - 1.6, fz + 1.6], [fy + 1.6, fz + fh - 1.6], [fy + fw - 1.6, fz + fh - 1.6]].map(([y, z]) => at(face(y, z))), { size: 0.45 }));
  // The wall socket the power supply is plugged into, its plate screwed to the wall.
  const so = { x: 72, y: yb, w: 12, d: 1.2, r: 0.6 };
  out.push(S(k.slabOf(so, 12, 12, P, 3, 0.4), { tone: "hi" }));
  out.push(Dt([at([so.x + 6, yb + 1.2, 22.6]), at([so.x + 6, yb + 1.2, 13.4])], { size: 0.4 }));
  out.push(S(k.slabOf({ x: so.x + 2.6, y: yb + 1.2, w: 6.8, d: 3.4, r: 1 }, 14.6, 6.8, P, 3), { tone: "mid" }));
  return out.join("");
}

export function bench() {
  const out = [S(k.slabOf(B, -14, 14, P, 4, 0.6), { tone: "lo" })];
  const grain = [];
  for (let i = 1; i < 10; i++) grain.push(k.lineOnTop([B.x + 0.2, B.y + (B.d * i) / 10], [B.x + B.w - 0.2, B.y + (B.d * i) / 10], 0, P));
  out.push(Ln(grain.join(""), { tone: "faint" }));
  // Two drawers in the bench's front, each with its seam and a bar pull.
  const fy = B.y + B.d;
  for (const x0 of [B.x + 24, B.x + 112]) {
    out.push(Ln(k.pathOf([at([x0, fy, -2.4]), at([x0 + 72, fy, -2.4]), at([x0 + 72, fy, -11.6]), at([x0, fy, -11.6])], true), { tone: "faint" }));
    out.push(S(k.slabOf({ x: x0 + 28, y: fy, w: 16, d: 1.6, r: 0.6 }, -7.8, 1.6, P, 3), { tone: "hi" }));
    out.push(Dt([at([x0 + 3, fy, -4.6]), at([x0 + 69, fy, -4.6])], { size: 0.4 }));
  }
  return out.join("");
}
