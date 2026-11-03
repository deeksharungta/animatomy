import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";

// A retractable ballpoint pen standing upright in a lab clamp, in millimetres: its axis is x = y = 0, z up,
// the nose at z = 0. The barrel is cut away over the cam (window A) and over the tip and spring (window B).
export const WIDTH = 600;
export const HEIGHT = 900;
export const DEG = Math.PI / 180;

// The cam, unrolled (see mech.mjs): 45° steps, a 3.2 mm rise a step, 0.28-step lugs in 0.36-step grooves.
export const K = { m: 3.2, wl: 0.28, half: 0.18, notch: 2.35, zpStop: 6.37, zpMin: 0.42, N: 12, thumb: 5, turn: 5, fFar: 8.2 };

export const C = {
  Z0: 99.65, RIB_TOP: 108,
  BAR: { ro: 5.6, ri: 4.8, top: 118, joint: 22, lip: 3.0, clip: [114, 118] },
  WIN_A: [96, 114], WIN_B: [9, 28], GRIP: [30, 56, 6.15],
  RIB_R: 3.2, ROTOR: { r: 2.6, bore: 2.1, len: 8, top: 2.2, lugIn: 1.4, lugOut: 4.6, fin: 3.4 },
  PLUNGER: { r: 2.6, crownIn: 1.4, fin: [0.8, 4.2], shoulder: [8.4, 8.98, 3.7], neck: 18, cap: [18, 22, 3.4] },
  REFILL: { len: 98, top: 6.5, ball: 0.42, cone: 6, coneR: [0.45, 1.05], shank: 0.9, collar: [18, 18.9, 2.5], r: 2.0 },
  SPRING: { seat: 9, r: 1.4, wire: 0.3, turns: 6, L0: 15, k: 0.22 },
  CONE: { nose: 1.6, bore: 1.1, seatR: 2.1 },
  // Rocky stands on window A's lower rim beside the right-hand notch; Roo stands on the nose's seat ring.
  CREW: { rocky: { at: [5.41, -3.79, 96], heading: 60, edge: 85.1 }, roo: { at: [-0.27, 2.97, 9], heading: 30 } },
  NOTCH_H: 2.35, BAND: [94.4, 96, 7.3],
  BENCH: -9,
};

// The world height of the lug's top corner, the button's pocket and the refill's ball, from the cam's state.
export const hW = (h) => C.Z0 + h;
export const ballOf = (h) => C.Z0 + h - C.REFILL.top - C.REFILL.len;

const VIEW = [[-20, -20, C.BENCH - 2], [20, -20, C.BENCH - 2], [-20, 20, C.BENCH - 2], [20, 20, C.BENCH - 2], [-20, -20, 133], [-20, 20, 133], [20, -20, 133]];
export const P = k.fitProjection(VIEW, WIDTH, HEIGHT, { pad: 0, azimuth: 45 });

// The pen's frame: angle 0 faces the viewer, +90° is to the viewer's right.
const tv = k.towardViewer(P);
const FRONT = [tv[0], tv[1], 0];
const side = [-tv[1], tv[0], 0];
const RIGHT = k.iso(side, P)[0] > k.iso([0, 0, 0], P)[0] ? side : [tv[1], -tv[0], 0];
export const PEN = L.frameOf([0, 0, 0], [0, 0, 1], FRONT, RIGHT);
export const ptA = (r, aDeg, z) => L.pointOf(PEN, z, r, aDeg * DEG);
export const radial = (aDeg) => L.radialOf(PEN, aDeg * DEG);
export const tangent = (aDeg) => L.tangentOf(PEN, aDeg * DEG);

// The mechanism's u (in 45° steps) as an angle round the pen: long grooves at 45° + 90°n, notches at 90°n.
export const angleOfU = (u) => (u + 1) * 45;

export const at = (p) => k.iso(p, P);
export const S = (paths, style) => k.solidSvg(paths, style);
export const Ln = (d, style) => k.lineSvg(d, style);
export const D = (points, style) => k.dotsSvg(points, style);
export const KIT = { ...k, ...L };
export const zF = (z) => L.frameOf([0, 0, z], [0, 0, 1], FRONT, RIGHT);
export const turned = (profile, z, opts) => L.solidOf(profile, zF(z), P, opts);
export const ring = (z, r) => L.arcOf(zF(z), 0, r, P);
