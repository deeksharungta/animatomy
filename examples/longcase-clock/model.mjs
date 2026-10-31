import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { tubePieces, tubeSvg } from "../../kit/tube.mjs";

// The figure's numbers: an eight-day longcase clock with a seconds pendulum, in centimetres.
export const WIDTH = 540;
export const HEIGHT = 660;

export const C = {
  PLINTH: { x: -26, y: -38, w: 52, d: 32, r: 1 },
  PLINTH_Z: 22,
  TRUNK: { x: -22, y: -36, w: 44, d: 28, r: 1 },
  HOOD: { x: -27, y: -38, w: 54, d: 34, r: 1 },
  SEAT_Z: 151,
  HOOD_TOP: 214,
  PLATE_Y: -27,
  WHEEL_Y: -21,
  GREAT: { x: -6, z: 160, r: 8.5, n: 84 },
  CENTER: { x: 0, z: 174, r: 7.5, n: 72 },
  THIRD: { x: 7, z: 181, r: 7, n: 64 },
  ESC: { x: 3, z: 189, r: 4, n: 30 },
  ANCHOR_Z: 197,
  PALLET: 1.6,
  PEND: { y: -29.5, z: 199, len: 99.4, bob: 8 },
  BARREL: { r: 3.4, y0: -19.5, y1: -14 },
  WEIGHT: { r: 4, h: 22, low: 46, high: 138 },
  DIAL: { y: -9.5, r0: 8, r1: 12 },
  CRANK: { y: -7, r: 1.5 },
  BELL: { x: -8, y: -21, z: 206, r: 5.5 },
  HAMMER: { x: -16, y: -19, z: 195, len: 10.4, rest: 0.07, back: -0.32, hit: 0.2 },
  PINS: { x: -13, z: 186, r: 3.6, n: 8 },
  FLY: { x: 12, z: 199 },
  T0: 12 * 3600 + 59 * 60 + 52,
};

export const HICKORY = { species: "mouse", name: "Hickory", size: 14, role: "power" };
export const PINCH = { species: "crab", name: "Pinch", size: 16, role: "holding" };
export const KNOCK = { species: "woodpecker", name: "Knock", size: 14, role: "spring" };
export const ROLE = { power: "#F5C518", holding: "#E5484D", spring: "#E93D82" };

export const FLOOR = { x: -54, y: -44, w: 104, d: 90, r: 4 };
export const WALL_TOP = 228;
export const P = k.fitProjection(
  [...k.boxCorners(FLOOR, -10, 0), [-60, -50, WALL_TOP], [50, -50, WALL_TOP], [-60, 46, WALL_TOP], [0, -20, 222]],
  WIDTH,
  HEIGHT,
  { pad: 14, azimuth: 45 },
);

export const at = (p) => k.iso(p, P);
export const S = (paths, style) => k.solidSvg(paths, style);
export const Ln = (d, style) => k.lineSvg(d, style);
export const D = (points, style) => k.dotsSvg(points, style);
export const K = { ...k, ...L };
export const byDepth = (list, key = (x) => x) => list.sort((a, b) => k.depthOf(key(a), P) - k.depthOf(key(b), P));

const ngon = (r, n = 8) => Array.from({ length: n }, (_, i) => [r * Math.cos(((i + 0.5) / n) * Math.PI * 2), r * Math.sin(((i + 0.5) / n) * Math.PI * 2)]);
// A round rod or body along any axis.
export const rod = (o, a, r, s0, s1, n = 16) => {
  const u = Math.abs(a[2]) > 0.9 ? [1, 0, 0] : [0, 0, 1];
  return L.prismOf(L.frameOf(o, a, u, L.cross3(a, u)), ngon(r, n), s0, s1, P);
};
export const pipe = (points, r, { tone = "mid", bend = 2, caps = true } = {}) =>
  tubePieces(L.fillet(points, bend, 8), r, P, { maxLength: 400, spacing: 0.8, caps }).map((piece) => tubeSvg(piece, { tone })).join("");
// A wheel standing in the movement: a thin disc whose arbor runs front to back along y.
export const disc = (x, z, r, y0, t = 0.7) => L.disc(0, t, r, L.frameAlong([x, y0, z], [0, 1, 0]), P);
// A circle standing in a y plane, centred at (x, z).
export const circleY = (cx, y, cz, r, n = 48) => k.pathOf(Array.from({ length: n }, (_, i) => at([cx + r * Math.cos((i / n) * Math.PI * 2), y, cz + r * Math.sin((i / n) * Math.PI * 2)])), true);
export const ringY = (y, x0, x1, z0, z1, rr) => {
  const pts = [];
  const arc = (cx, cz, a0) => { for (let i = 0; i <= 6; i++) { const t = a0 + (i / 6) * (Math.PI / 2); pts.push(at([cx + rr * Math.cos(t), y, cz + rr * Math.sin(t)])); } };
  arc(x1 - rr, z1 - rr, 0); arc(x0 + rr, z1 - rr, Math.PI / 2); arc(x0 + rr, z0 + rr, Math.PI); arc(x1 - rr, z0 + rr, Math.PI * 1.5);
  return k.pathOf(pts, true);
};
export const ringX = (x, y0, y1, z0, z1, rr) => {
  const pts = [];
  const arc = (cy, cz, a0) => { for (let i = 0; i <= 6; i++) { const t = a0 + (i / 6) * (Math.PI / 2); pts.push(at([x, cy + rr * Math.cos(t), cz + rr * Math.sin(t)])); } };
  arc(y1 - rr, z1 - rr, 0); arc(y0 + rr, z1 - rr, Math.PI / 2); arc(y0 + rr, z0 + rr, Math.PI); arc(y1 - rr, z0 + rr, Math.PI * 1.5);
  return k.pathOf(pts, true);
};
