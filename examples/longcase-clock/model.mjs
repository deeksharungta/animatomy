import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { tubePieces, tubeSvg } from "../../kit/tube.mjs";

// The figure's numbers: an eight-day striking longcase clock with a seconds pendulum, in centimetres.
// x runs left to right across the dial, y from the back of the case to the front, z up.
export const WIDTH = 540;
export const HEIGHT = 680;

export const C = {
  PLINTH: { x: -26, y: -38, w: 52, d: 32, r: 1 },
  PLINTH_Z: 24,
  TRUNK: { x: -22, y: -36, w: 44, d: 28, r: 1 },
  HOOD: { x: -27, y: -38, w: 54, d: 34, r: 1 },
  WAIST_Z: 140,
  SEAT_Z: 151,
  HOOD_TOP: 214,
  // The movement: a back plate, its pillars and the wheels between where the front plate would be.
  PLATE: { x0: -18, x1: 18, z0: 153, z1: 200, y: -27 },
  FRONT_Y: -17.2,
  // The going train, on the left: great wheel and barrel, centre, third and escape wheel.
  GREAT: { x: -6, z: 161.9, r: 8.5, n: 96, y: -19.8 },
  CENTER: { x: 0, z: 170, r: 7.2, n: 80, y: -23.2, pin: 1.6 },
  THIRD: { x: -4.3, z: 177.45, r: 6.8, n: 78, y: -21.2, pin: 1.4 },
  ESC: { x: 0, z: 184.6, r: 6, n: 30, y: -23.4, pin: 1.1 },
  ANCHOR: { z: 193.3, span: 0.5, y: -22.9 },
  // The strike train, on the right: great wheel, pin wheel, locking wheel, warning wheel and fly.
  SGREAT: { x: 6, z: 161.9, r: 8.5, n: 78, y: -19.8 },
  PINS: { x: 11.1, z: 170.6, r: 6.2, n: 64, y: -22.4, pin: 1.6, count: 8, at: 5.2 },
  LOCK: { x: 9.6, z: 177.7, r: 4.6, n: 48, y: -20.8, pin: 1.1, at: 3.6, catch: 1.22 },
  WARN: { x: 12.2, z: 182.5, r: 3.6, n: 40, y: -22.6, pin: 0.9 },
  FLY: { x: 11.5, z: 186.7, y: -21, vane: 3, pin: 0.7 },
  BARREL: { r: 3.4, y0: -25.8, y1: -20.4 },
  // The locking lever (Rocky's): its bar runs right over the locking wheel to a tail past the plate's edge,
  // and its lifting arm hangs under the hour pin on the centre wheel, which presses it down before the hour.
  LEVER: { x: 6.5, z: 182.2, tail: 21, y: -19.3, lift: 0.13, arm: [-3.3, -7.2] },
  HOURPIN: { r: 6.66, a: 0.89 },
  HAMMER: { x: 17.5, z: 175, len: 28.6, y: -18.2, rest: 0.135, back: -0.05, hit: 0.158 },
  BELL: { x: 6.5, y: -21.5, z: 206.5, r: 5.5 },
  // The pendulum hangs behind the back plate from its suspension spring; the crutch takes it from the anchor.
  PEND: { y: -29.5, z: 199.5, len: 99.4, bob: 8, amp: 0.045 },
  // Two weights on pulleys: the going weight on the right, the strike weight on the left.
  WEIGHT: { r: 3.4, h: 22, low: 26, high: 94, pulley: 1.5 },
  DIAL: { y: -13, r0: 7, r1: 9.2 },
  // The brackets off the plate's right edge that Knock and Rocky stand on: where their feet go.
  PERCH: { knock: [22, -23.5, 197.2], rocky: [22.5, -20, 177.6] },
  T0: 12 * 3600 + 59 * 60 + 50,
};
C.ONE = 13 * 3600;

export const PLUMB = { species: "sloth", name: "Mo", size: 14, role: "power" };
export const PINCH = { species: "crab", name: "Pinch", size: 12, role: "holding" };
export const ROCKY = { species: "raccoon", name: "Rocky", size: 10, role: "holding" };
export const KNOCK = { species: "woodpecker", name: "Knock", size: 14, role: "spring" };
export const ROLE = { power: "#F5C518", holding: "#E5484D", spring: "#E93D82" };

export const FLOOR = { x: -54, y: -44, w: 104, d: 90, r: 4 };
export const WALL_TOP = 236;
export const P = k.fitProjection(
  [...k.boxCorners(FLOOR, -10, 0), [-60, -50, WALL_TOP], [50, -50, WALL_TOP], [-60, 46, WALL_TOP]],
  WIDTH,
  HEIGHT,
  { pad: 12, azimuth: 45 },
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
// A disc standing in the movement: its arbor runs front to back along y.
export const faceY = (x, y, z) => L.frameAlong([x, y, z], [0, 1, 0]);
export const disc = (x, z, r, y0, t = 0.7) => L.disc(0, t, r, faceY(x, y0, z), P);
export const ring = (x, z, r0, r1, y0, t = 0.6) => L.ringBand(0, t, r0, r1, faceY(x, y0, z), P, { hole: [t, r0] });
// A circle standing in a y plane, centred at (x, z).
export const circleY = (cx, y, cz, r, n = 48) => k.pathOf(Array.from({ length: n }, (_, i) => at([cx + r * Math.cos((i / n) * Math.PI * 2), y, cz + r * Math.sin((i / n) * Math.PI * 2)])), true);
const rounded = (pt, x0, x1, z0, z1, rr) => {
  const pts = [];
  const arc = (cx, cz, a0) => { for (let i = 0; i <= 6; i++) { const t = a0 + (i / 6) * (Math.PI / 2); pts.push(at(pt(cx + rr * Math.cos(t), cz + rr * Math.sin(t)))); } };
  arc(x1 - rr, z1 - rr, 0); arc(x0 + rr, z1 - rr, Math.PI / 2); arc(x0 + rr, z0 + rr, Math.PI); arc(x1 - rr, z0 + rr, Math.PI * 1.5);
  return k.pathOf(pts, true);
};
// A rounded rectangle on a y face (x across) or an x face (y across).
export const ringY = (y, x0, x1, z0, z1, rr) => rounded((a, z) => [a, y, z], x0, x1, z0, z1, rr);
export const ringX = (x, y0, y1, z0, z1, rr) => rounded((a, z) => [x, a, z], y0, y1, z0, z1, rr);
// A box from two opposite corners.
export const box = (x0, y0, z0, x1, y1, z1, r = 0.3, bevel = 0) => k.slabOf({ x: x0, y: y0, w: x1 - x0, d: y1 - y0, r }, z0, z1 - z0, P, 2, bevel);
