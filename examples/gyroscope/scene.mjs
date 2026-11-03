import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S_ as S, Ln, Dt, UP, ROOM_TOP } from "./model.mjs";

// ---------------------------------------------------------------- the room, the bench and the props

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
  const fy = -10, fz = 96, fw = 70, fh = 44;
  out.push(S(k.slabOf({ x: B.x, y: fy, w: 2, d: fw, r: 0.4 }, fz, fh, P, 2, 0.4), { tone: "hi" }));
  const face = (y, z) => [B.x + 2, y, z];
  out.push(Ln(k.pathOf([at(face(fy + 4, fz + 4)), at(face(fy + fw - 4, fz + 4)), at(face(fy + fw - 4, fz + fh - 4)), at(face(fy + 4, fz + fh - 4))], true), { tone: "faint" }));
  const curve = [];
  for (let i = 0; i <= 24; i++) { const u = i / 24; curve.push(at(face(fy + 10 + u * (fw - 18), fz + 9 + 28 / (1 + 5 * u)))); }
  out.push(Ln(k.pathOf([at(face(fy + 10, fz + fh - 7)), at(face(fy + 10, fz + 8)), at(face(fy + fw - 7, fz + 8))]), { tone: "lo", free: true }), Ln(k.pathOf(curve), { tone: "mid", free: true }));
  out.push(Ln([0, 1, 2].map((i) => k.pathOf([at(face(fy + 30, fz + fh - 9 - i * 3)), at(face(fy + (i ? 52 : 58), fz + fh - 9 - i * 3))])).join(""), { tone: "faint", free: true }));
  out.push(Dt([[fy + 1.6, fz + 1.6], [fy + fw - 1.6, fz + 1.6], [fy + 1.6, fz + fh - 1.6], [fy + fw - 1.6, fz + fh - 1.6]].map(([y, z]) => at(face(y, z))), { size: 0.45 }));
  return out.join("");
}

export function bench() {
  const out = [S(k.slabOf(B, -14, 14, P, 4, 0.6), { tone: "lo" })];
  const grain = [];
  for (let i = 1; i < 10; i++) grain.push(k.lineOnTop([B.x + 0.2, B.y + (B.d * i) / 10], [B.x + B.w - 0.2, B.y + (B.d * i) / 10], 0, P));
  out.push(Ln(grain.join(""), { tone: "faint" }));
  return out.join("");
}

export function props() {
  const out = [];
  // A wooden case for the gyroscope, its lid seam wrapping the corners, with a handle and two catches.
  const cs = { x: -104, y: -98, w: 44, d: 26, r: 2 };
  out.push(`<path class="iso-halo" d="${k.haloOf(cs, 0, 0.1, P)}" style="filter:blur(3px)"/>`);
  out.push(S(k.slabOf(cs, 0, 20, P, 3, 0.6), { tone: "mid", inner: Ln(k.sideSeam(cs, 14, P, 3), { tone: "faint" }) }));
  for (const x of [cs.x + 10, cs.x + 36]) out.push(S(k.slabOf({ x: x - 2, y: cs.y + cs.d - 0.2, w: 4, d: 1.2, r: 0.3 }, 11, 6, P, 2), { tone: "hi" }));
  out.push(S(k.slabOf({ x: cs.x + 14, y: cs.y + 13, w: 18, d: 4, r: 1.6 }, 20, 2.4, P, 3), { tone: "hi" }));
  // A slotted mass set on its hanger (in front of the machine, so drawn after it).
  const back = out.length;
  const mx = -86, my = 80;
  out.push(`<path class="iso-halo" d="${k.haloOf({ x: mx - 11, y: my - 11, w: 22, d: 22, r: 11 }, 0, 0.1, P)}" style="filter:blur(3px)"/>`);
  out.push(S(k.cylinder(mx, my, 10, 0, 2, P, 40), { tone: "mid" }));
  for (let i = 0; i < 4; i++) {
    const z = 2 + i * 3.4;
    out.push(S(k.cylinder(mx, my, 9.4, z, 3.2, P, 40, 0.4), { tone: "hi" }));
    out.push(Ln(k.lineOnTop([mx + 9.4 * Math.cos(-2.4 + i), my + 9.4 * Math.sin(-2.4 + i)], [mx + 1.4 * Math.cos(-2.4 + i), my + 1.4 * Math.sin(-2.4 + i)], z + 3.2, P), { tone: "faint" }));
  }
  out.push(S(k.cylinder(mx, my, 1, 15.6, 14, P, 12), { tone: "hi", crease: "none" }));
  out.push(Ln(k.pathOf([at([mx, my, 29.6]), at([mx, my, 33]), at([mx + 2, my + 2, 35]), at([mx + 4, my + 4, 33.4])]), { tone: "hi" }), Dt([at([mx + 4, my + 4, 33.4]), at([mx, my, 29.6])], { size: 0.6, tone: "hi" }));
  // A stopwatch lying on the bench, for timing the laps.
  const sx = 88, sy = 48, sr = 11;
  out.push(`<path class="iso-halo" d="${k.haloOf({ x: sx - sr, y: sy - sr, w: sr * 2, d: sr * 2, r: sr }, 0, 0.1, P)}" style="filter:blur(3px)"/>`);
  out.push(S(k.cylinder(sx, sy, sr, 0, 4.5, P, 48, 0.5), { tone: "hi" }));
  out.push(Ln(k.ring(sx, sy, sr - 2, 4.5, P, 48), { tone: "faint" }));
  const t = k.radialTicks(sx, sy, sr - 2, 60, 5, 4.5, [0.8, 1.8], P);
  out.push(Ln(t.minor, { tone: "faint" }), Ln(t.major, { tone: "lo" }));
  out.push(Ln(k.lineOnTop([sx, sy], [sx + 5.5, sy - 5], 4.5, P), { tone: "hi", free: "end" }), Dt([at([sx, sy, 4.5])], { size: 0.7, tone: "hi" }));
  out.push(S(L.solidOf([[0, 1.6], [3, 1.6]], L.frameAlong([sx - sr * 0.71, sy - sr * 0.71, 2.2], [-0.71, -0.71, 0]), P), { tone: "mid" }));
  out.push(S(L.solidOf([[3, 2.2], [5, 2.2, 1], [5.6, 1.4]], L.frameAlong([sx - sr * 0.71, sy - sr * 0.71, 2.2], [-0.71, -0.71, 0]), P), { tone: "hi" }));
  return { back: out.slice(0, back).join(""), front: out.slice(back).join("") };
}

// ---------------------------------------------------------------- the power box and the stand's base

export const BOX = { x: 50, y: -98, w: 34, d: 22, h: 20 };
export function powerBox() {
  const out = [], b = BOX, pl = { x: b.x, y: b.y, w: b.w, d: b.d, r: 2 };
  out.push(`<path class="iso-halo" d="${k.haloOf(pl, 0, 0.1, P)}" style="filter:blur(3px)"/>`);
  out.push(S(k.slabOf(pl, 0, b.h, P, 3, 0.6), { tone: "mid", inner: Ln(k.sideSeam(pl, 3, P, 3), { tone: "faint" }) }));
  out.push(Ln(k.planOutline(k.insetPlan(pl, 3), b.h, P, 3), { tone: "faint" }));
  out.push(Dt(k.corners(pl, 1.6).map(([x, y]) => at([x, y, b.h])), { size: 0.45 }));
  // Vent slots and a rating plate on the front face (the one facing +y).
  const fy = b.y + b.d;
  for (let i = 0; i < 5; i++) { const x = b.x + 4 + i * 2.6; out.push(Ln(k.pathOf([at([x, fy, 5]), at([x, fy, 14]), at([x + 1.2, fy, 14]), at([x + 1.2, fy, 5])], true), { tone: "lo" })); }
  const rp = { x: b.x + 19, y: fy, w: 11, d: 0.5, r: 0.3 };
  out.push(S(k.slabOf(rp, 6, 8, P, 2), { tone: "hi" }));
  out.push(Ln([0, 1, 2].map((i) => k.pathOf([at([rp.x + 1.6, fy + 0.5, 11.6 - i * 1.8]), at([rp.x + (i ? 7 : 9.4), fy + 0.5, 11.6 - i * 1.8])])).join(""), { tone: "faint", free: true }));
  out.push(Dt([at([rp.x + 0.8, fy + 0.5, 6.8]), at([rp.x + rp.w - 0.8, fy + 0.5, 13.2])], { size: 0.35 }));
  // The speed knob, knurled, and the toggle switch with its guard.
  const kx = b.x + 10, ky = b.y + 12;
  out.push(S(k.cylinder(kx, ky, 4.4, b.h, 3.4, P, 32, 0.4), { tone: "hi", inner: Ln(k.knurl(kx, ky, 4.4, b.h, b.h + 3.4, 40, P, 0.3), { tone: "faint" }) }));
  out.push(Ln(k.lineOnTop([kx, ky], [kx + 3.2, ky + 2.4], b.h + 3.4, P), { tone: "hi", free: "end" }));
  out.push(S(k.cylinder(b.x + 24, b.y + 12, 2.6, b.h, 1.4, P, 20), { tone: "hi" }));
  return out.join("");
}

export const toggle = (on) => S(L.solidOf([[0, 0.7], [5, 0.5], [5.6, 0.9, 1], [6.4, 0.6]], L.frameAlong([BOX.x + 24, BOX.y + 12, BOX.h + 1.4], on ? [0.5, 0.5, 0.71] : [-0.5, -0.5, 0.71]), P), { tone: "hi" });
export const lamp = (on) => S(k.cylinder(BOX.x + 28, BOX.y + 4, 1.6, BOX.h, 1.2, P, 16), { tone: "hi", lit: on });

export function base() {
  const out = [];
  out.push(`<path class="iso-halo" d="${k.haloOf({ x: -44, y: -44, w: 88, d: 88, r: 44 }, 0, 0.1, P)}" style="filter:blur(5px)"/>`);
  for (let i = 0; i < 3; i++) {
    const a = Math.PI / 4 + (i * 2 * Math.PI) / 3, x = 34 * Math.cos(a), y = 34 * Math.sin(a);
    out.push(S(L.solidOf([[0, 4.8], [1, 5.2, 1], [3, 4.6]], L.frameAlong([x, y, 0], UP), P), { tone: "mid" }));
  }
  out.push(S(L.solidOf([[3, 39], [4, 40, 1], [9, 39.4, 1], [12, 36]], L.frameAlong([0, 0, 0], UP), P), { tone: "mid" }));
  out.push(Ln(k.ring(0, 0, 32, 12, P, 72) + k.ring(0, 0, 21, 12, P, 64), { tone: "faint" }));
  // The levelling screws' knurled heads stand through the base over each foot.
  for (let i = 0; i < 3; i++) {
    const a = Math.PI / 4 + (i * 2 * Math.PI) / 3, x = 30 * Math.cos(a), y = 30 * Math.sin(a);
    out.push(S(k.cylinder(x, y, 3.2, 12, 3, P, 24, 0.3), { tone: "hi", inner: Ln(k.knurl(x, y, 3.2, 12, 15, 24, P, 0.3), { tone: "faint" }) }));
  }
  // A name plate on the base's top, and a bubble level at the back.
  const np = { x: 9, y: 13, w: 16, d: 7, r: 0.8 };
  out.push(S(k.slabOf(np, 12, 0.6, P, 2, 0.3), { tone: "hi" }));
  out.push(Ln([0, 1, 2].map((i) => k.lineOnTop([np.x + 2.5, np.y + 2 + i * 1.5], [np.x + (i ? 11 : 13.5), np.y + 2 + i * 1.5], 12.6, P)).join(""), { tone: "faint", free: true }));
  out.push(Dt([at([np.x + 1, np.y + 1, 12.6]), at([np.x + np.w - 1, np.y + np.d - 1, 12.6])], { size: 0.4 }));
  out.push(S(k.cylinder(-18, -18, 4, 12, 2, P, 28, 0.3), { tone: "hi" }), Ln(k.ring(-18, -18, 2.2, 14, P, 24), { tone: "lo" }), Dt([at([-17.4, -18.6, 14])], { size: 0.9, tone: "lo" }));
  out.push(S(L.solidOf([[12, 11], [14, 10.4, 1], [18, 8]], L.frameAlong([0, 0, 0], UP), P), { tone: "mid" }));
  return out.join("");
}

// The power cable: out of the box's front, along the bench to a gland in the base.
export function cable() {
  const a = Math.atan2(BOX.y + BOX.d, BOX.x + 8);
  const g = [40.2 * Math.cos(a), 40.2 * Math.sin(a), 6];
  const pts = [[BOX.x + 8, BOX.y + BOX.d + 1.5, 4], [BOX.x + 8, BOX.y + BOX.d + 8, 1.2], [g[0] + 9 * Math.cos(a), g[1] + 9 * Math.sin(a), 1.2], [g[0] + 3.4 * Math.cos(a), g[1] + 3.4 * Math.sin(a), 6]];
  const out = [S(L.solidOf([[0, 2], [2, 2]], L.frameAlong([BOX.x + 8, BOX.y + BOX.d, 4], [0, 1, 0]), P), { tone: "hi" })];
  for (let i = 0; i < pts.length - 1; i++) {
    const p = pts[i], q = pts[i + 1], d = [q[0] - p[0], q[1] - p[1], q[2] - p[2]], l = Math.hypot(...d);
    out.push(S(L.solidOf([[0, 1], [l, 1]], L.frameAlong(p, d.map((x) => x / l)), P), { tone: "lo", crease: "none" }));
    if (i) out.push(S(L.sphereOf(p, 1, P, { steps: 16 }), { tone: "lo" }));
  }
  out.push(S(L.solidOf([[0, 2.2], [3.2, 2.2, 1], [3.6, 1.6]], L.frameAlong([g[0] + 3.4 * Math.cos(a), g[1] + 3.4 * Math.sin(a), 6], [-Math.cos(a), -Math.sin(a), 0]), P), { tone: "hi" }));
  return out.join("");
}
