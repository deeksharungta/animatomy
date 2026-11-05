// A hash map as a post-office letter-sorting frame: the numbers, the camera and the crew. World units are about a
// millimetre at the scale of a desk model.
//
// Size: Figure, near the top of its range (one mechanism, about 75 machine parts, three crew, SVG only).
//
// Truth: the map has 8 buckets (pigeonholes 0 to 7). The hash of a key is the sum of its letters (A = 1 … Z = 26)
// mod 8: the counter's shaft turns one eighth per unit, so a full turn is 8 and the mod is the shaft going round.
// ADA = 1 + 4 + 1 = 6 and IDA = 9 + 4 + 1 = 14, and 14 mod 8 = 6: the two keys collide and chain in hole 6. A lookup
// hashes the key the same way and searches that one hole: two comparisons, not every letter in the frame.
//
// Parts (machine only): cabinet: carcass, plinth, four feet, six drawer fronts with pulls and card holders, moulded
// end panel, maker's plate with three rules, brass edge strip, rubber runner along the ledge. Frame: back panel,
// floor board, top board, two side panels, seven dividers, eight pip plates, brass index strip. Camshaft: shaft, three
// pillow blocks with oil cups, eight lobed cams, eight follower rods, guide bar on two posts, fascia with eight pip
// plates, eight round flags. Counter: heart cam, eight-slot star wheel, detent roller on its spring arm, pin plate
// with its pin on the drive axle, two bearing posts, bevel wheel and pinion, crank axle on its pedestal, crank arm and
// grip. Feed: mail slot in the wall, chute with rivets, chute post, in-tray on four legs. Subject: the letters (and
// the lookup slip).
//
// Crew (cast by the motion; the headline is the letter going into the hole the hash names):
// Nib   · mouse      · moving  · the sorter: carries each letter from the tray to its hole and slides it in, and
//                                 on a lookup checks only that hole · work: the letter's end at the hole's mouth · paws
//                                 · space: a 22 mm hole, 24 tall; walks up to 230 along the ledge
// Rocky · raccoon    · sensing · the hash: reads each letter of the key and turns the crank once per unit; each turn
//                                 steps the star wheel one slot · work: the crank's grip · paws · moves: a 9 circle
// Knock · woodpecker · spring  · the reset hammer: strikes the heart cam and the shaft springs back to zero
//                                 · work: the heart cam's rim · beak
// You post the letters and the lookup slip through the slot: that is "you" in the captions.
import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";

export const WIDTH = 760;
export const HEIGHT = 560;

export const C = {
  N: 8, PITCH: 22, WALL: 1.4, Y0: -8, Y1: 14, TOP: 30, RAIL: 36, CEIL: 54, BOARD: 3,
  SHAFT: { y: 12, z: 72, x0: -16, x1: 208 }, CAM: { r0: 3, r1: 12, w: 4 }, ROD: { r: 0.9, len: 15 },
  GUIDE: { z: 86, h: 2 }, FLAG: { h: 8 },
  HEART: { x: -12, r: 7.5, dir: [1, -0.55] }, BLOCKS: [0, 88, 179],
  GEN: { x: 197, w: 3, c: 14 }, CRANK: { x: 232, y0: 15.5, y1: 26, r: 4.5, grip: 4 }, BEVEL: { x: 226, r: 4.4 }, POST: { x: 204, w: 2.4 }, POST2: 220,
  CAB: { x: -26, y: -10, w: 284, d: 60, r: 1.5 },
  ENV: { l: 16, d: 13, t: 1.2 }, SLIP: { l: 12, d: 8, t: 0.8 },
  TRAY: { x: 240, y: 30, w: 18, d: 18, r: 1, z: 36 }, CHUTE: { a: [249, -28.4, 100], b: [249, 34, 41], w: 16 },
  GRIP: { lean: [-4, 2], ahead: 2.5, side: 1.4, z: 8 }, NIB_PATH: [[237.5, 46], [212, 42], [192, 17.5], [-6, 17.5]], STAND_DX: 11.5,
  PREFILL: [1, 2, 0, 1, 2, 1, 0, 1],
  JOBS: [{ kind: "put", key: "ADA" }, { kind: "put", key: "IDA" }, { kind: "get", key: "ADA" }],
  T: { start: 0.5, drop: 1.0, reset: 0.55, wind: 0.3, stroke: 0.34, gap: 0.5, pick: 0.5, walk: 40, back: 60, slide: 0.9, cmp: 1.0, pull: 0.9, put: 0.6, tail: 0.8 },
  PLACE: { rocky: { at: [217, 22, 34], heading: 30 }, knock: { at: [-18, 26, 56], heading: 300 } },
};
C.X1 = C.N * C.PITCH + C.WALL;
C.FLOOR = C.RAIL;
export const xc = (C, i) => i * C.PITCH + C.WALL + (C.PITCH - C.WALL) / 2;
export const valueOf = (ch) => ch.charCodeAt(0) - 64;

export const NIB = { species: "mouse", name: "Nib", size: 24, role: "moving" };
export const ROCKY = { species: "raccoon", name: "Rocky", size: 38, role: "sensing", wear: ["glasses"] };
export const KNOCK = { species: "woodpecker", name: "Knock", size: 21, role: "spring" };
export const ROLE = { moving: "#46A758", sensing: "#3E9BDB", spring: "#E93D82" };

export const DESK = { x: -34, y: -30, w: 300, d: 96, r: 4 };
export const WALL_TOP = 116;
export const P = k.fitProjection(
  [...k.boxCorners(DESK, -12, 0), [DESK.x - 6, DESK.y - 6, WALL_TOP], [DESK.x + DESK.w, DESK.y - 6, WALL_TOP], [DESK.x - 6, DESK.y + DESK.d, WALL_TOP]],
  WIDTH, HEIGHT, { pad: 12, azimuth: 52 },
);
export const at = (p) => k.iso(p, P);
export const S = (paths, style) => k.solidSvg(paths, style);
export const Ln = (d, style) => k.lineSvg(d, style);
export const D = (points, style) => k.dotsSvg(points, style);
export const K = { ...k, ...L };
