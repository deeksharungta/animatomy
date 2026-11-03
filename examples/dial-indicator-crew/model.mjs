import * as k from "../../kit/iso-kit.mjs";
import * as G from "../../kit/lathe.mjs";

export const WIDTH = 640;
export const HEIGHT = 600;

// A plunger dial indicator on a magnetic stand over a granite surface plate. World units are 0.5 mm.
// The indicator has its own frame: X to the right across the dial, Y up, D toward you out of the dial.
// Plate top is z = 0; the plunger's axis meets the plate at the world origin.
const AZ = 45, YAW = -14;
const a = ((AZ + YAW) * Math.PI) / 180;
export const N = [Math.cos(a), Math.sin(a), 0];
export const U = [Math.sin(a), -Math.cos(a), 0];
export const C = {
  N, U,
  PLUNGER_D: -22,
  O: [22 * N[0], 22 * N[1], 143],
  CASE: { rIn: 72, rOut: 76, d0: -38, d1: -3 },
  BACK: { d0: -42, d1: -38 },
  PLATE_D: -35,
  BEZEL: { rOut: 80, d0: -5, d1: 3 },
  SCALE: { rIn: 64, rOut: 73, d: 0 },
  STEM: { r: 8, y0: -76, y1: -112 },
  BUSH: { r: 6, y0: 76, y1: 84 },
  ROD_R: 4,
  TIP0: -142,
  RACK: { x0: -5.6, pitch: -6.0, y0: -46, y1: -12, d0: -25, d1: -19 },
  PINION: [-9.2, -15.0],
  CROWN: { r: 16, d: -15, teeth: 80 },
  HAIR: { at: [14.42, 10.09], r: 16, d: -9, teeth: 80, spring: [2.6, 11, 5.5], sd: -5.5 },
  CENTRE: { r: 1.6, teeth: 8, d0: -17, d1: 2 },
  GUIDE: { x: -13, d: -19, y0: -6, y1: 60, r: 1.6 },
  RAIL: { x0: -34, x1: -29, y0: -12, y1: 60, d0: -22, d1: -18 },
  ARM: { x0: -35, y: -2, t: 3 },
  SHELF: { x0: 9, x1: 33, y: -4, d0: -8, d1: -1 },
  LOCKSHELF: { x0: 16, x1: 44, y: -44, d0: -10, d1: -1 },
  LOCK: { pivot: [50, -30], tail: [32, -36], shoe: [63.5, -36], d: -4 },
  ROO_X: -25, ROO_D: -14, ROO_HEAD: 195, ROO_HAND: 9,
  MO_AT: [22, -5], MO_HEAD: 160,
  PINCH_AT: [34.5, -4], PINCH_HEAD: 160,
  NEEDLE: { tail: -14, tip: 69, d: 2.2 },
  // Gauge blocks, from a metric 87-block set: heights in mm, the first is the reference the dial is zeroed on.
  BLOCKS: [1.0, 1.37, 2.5, 5.0, 9.0],
  BLOCK: { w: 18, l: 70 },
  HOME: 64,
  LANE: 26,
  PRELOAD: 0.5,
  CLEAR: 0.6,
  RANGE: 10,
  MAG: { x: -158, y: -92, w: 100, d: 92, r: 4, h: 104 },
  POST: [-108, -46],
  DESK: { x: -176, y: -136, w: 290, d: 286, r: 6 },
  DESK_Z: -40,
  GRANITE: { x: -166, y: -128, w: 270, d: 270, r: 3 },
  WALL_TOP: 286,
};
export const BEZEL0 = 0.27;

// A point in the indicator's frame, and frames for parts turned on its dial axis or standing upright in it.
export const L = (X, Y, D) => [C.O[0] + X * U[0] + D * N[0], C.O[1] + X * U[1] + D * N[1], C.O[2] + Y];
export const dialFrame = (X, Y, D) => G.frameOf(L(X, Y, D), N, U, [0, 0, 1]);
export const upFrame = (X, Y, D) => G.frameOf(L(X, Y, D), [0, 0, 1], U, N);

// ---------------------------------------------------------------- the measuring model (build and page)

export function model(C) {
  const B = C.BLOCKS;
  // The plunger's travel in, in mm, resting on block i: zeroed on the 1.00 mm block with 0.5 mm of preload.
  const rest = (i) => B[i] - B[0] + C.PRELOAD;
  // The tip, the rack and everything on the plunger move 2 units (1 mm) per mm.
  const tipZ = (p) => 1 + 2 * p;
  // The rack (pitch 0.625 mm) turns the 16-leaf pinion once per 10 mm; the 80-tooth wheel on it turns the
  // 8-leaf centre pinion ten times faster, so the needle turns once per mm: 100 divisions of 0.01 mm.
  // The hairspring wheel (80 teeth) on the centre pinion turns once per 10 mm, the whole range.
  const needle = (p) => -p * Math.PI * 2;
  const crown = (p) => (p / 10) * Math.PI * 2;
  const hair = (p) => (p / 10) * Math.PI * 2;
  // The reading is the needle against the scale's zero, which turns with the bezel; whole turns are counted
  // from the turn you zeroed on.
  const reading = (p, b) => p - b;
  const show = (r) => (r < -0.004 ? "−" : "+") + Math.abs(r).toFixed(2) + " mm";
  return { rest, tipZ, needle, crown, hair, reading, show };
}
export const M = model(C);

// The camera frames the bench, the two walls and the indicator; the desk runs a little past the card.
const D0 = C.DESK;
export const P = k.fitProjection(
  [...k.boxCorners(D0, C.DESK_Z - 14, C.DESK_Z), [D0.x, D0.y - 6, C.WALL_TOP], [D0.x + D0.w, D0.y - 6, C.WALL_TOP], [D0.x - 6, D0.y + D0.d, C.WALL_TOP]],
  WIDTH,
  HEIGHT,
  { pad: 8, azimuth: AZ },
);
export const K = { ...k, ...G };
export const at = (p) => k.iso(p, P);
export const S = (paths, style) => k.solidSvg(paths, style);
export const Ln = (d, style) => k.lineSvg(d, style);
export const Dt = (points, style) => k.dotsSvg(points, style);
