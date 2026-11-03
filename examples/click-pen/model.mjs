import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";

// A 6:1 cutaway model of a retractable ballpoint, lying on a display stand on a desk. The pen is drawn in the real
// pen's millimetres (one world unit is 1 mm of the pen, 6 mm of the model); the desk and its props at a sixth of their size.
export const WIDTH = 760;
export const HEIGHT = 540;
export const DEG = Math.PI / 180;

// The cam, unrolled (see mech.mjs): 45° steps, a 3.2 mm rise a step, 0.28-step lugs in 0.36-step grooves.
export const K = { m: 3.2, wl: 0.28, half: 0.18, notch: 2.35, zpStop: 6.37, zpMin: 0.42, N: 12, thumb: 5, turn: 5, fFar: 8.2 };

export const C = {
  Z0: 99.65, RIB_TOP: 108,
  // The cam's angle round the pen is turned 45° from the cut, so a held lug sits on a diagonal, clear of the section.
  ROT: 45,
  BAR: { ro: 5.6, ri: 4.8, top: 118, joint: 22, lip: 3.0, clip: [114, 118] },
  WIN_A: [86, 114], WIN_B: [0.8, 28],
  GRIP: [30, 56, 6.15],
  THREAD: { z: [88, 95.4], r: [5.0, 5.3], pitch: 0.74 },
  BAND: [88, 89.6, 6.0],
  RIB_R: 3.2, ROTOR: { r: 2.6, bore: 2.1, len: 8, top: 2.2, lugIn: 1.4, lugOut: 4.6, fin: 3.4 },
  PLUNGER: { r: 2.6, crownIn: 1.4, fin: [0.8, 4.2], shoulder: [8.4, 8.98, 3.7], neck: 18, cap: [18, 22, 3.4] },
  REFILL: { len: 98, top: 6.5, ball: 0.42, cone: 6, coneR: [0.45, 1.05], shank: 0.9, collar: [18, 18.9, 2.5], r: 2.0, ink: 64, plug: 2.2 },
  SPRING: { seat: 9, r: 1.4, wire: 0.3, turns: 6, L0: 15, k: 0.22 },
  CONE: { nose: 1.6, bore: 1.1, seatR: 2.1 },
  // Rocky stands on the upper barrel's far cut edge on the nose side of the held lug; Roo on the nose's far cut edge.
  CREW: { rocky: { notch: 315, r: 4.95, z: 97.4, heading: 140, lean: [4, 8], grip: [[4.5, 0, -0.1], [4, 5, 0.6]] }, roo: { gap: 1.2, heading: 110, lean: 32, paw: [318, 334] } },
  NOTCH_H: 2.35,
  // The section's depth below the axis (mech.mjs, cutDepth): shallow at the tip, deep at the spring, none at the cam.
  DEEP: { d: 2.0, tip: 0.65, ramp: [9, 12.5], back: [85, 88] },
  // Where the model lies: its axis along -x (DIR) at height ZA over the desk, the nose at x = PX, toward you.
  PX: 62, DIR: -1, ZA: 15,
  ROOM: { x0: -80, x1: 74, y0: -30, y1: 34, top: 44, desk: 6 },
};

// The pen's frame: the axis from the nose to the button; angle 0 points up, 90° toward the viewer, 270° away. The half above the
// axis is cut away, so 90° and 270° are the near and far cut edges.
export const PEN = L.frameOf([C.PX, 0, C.ZA], [C.DIR, 0, 0], [0, 0, 1], [0, 1, 0]);
export const ptA = (r, aDeg, z) => L.pointOf(PEN, z, r, aDeg * DEG);
export const radial = (aDeg) => L.radialOf(PEN, aDeg * DEG);
export const tangent = (aDeg) => L.tangentOf(PEN, aDeg * DEG);

// The mechanism's u (in 45° steps) as an angle round the pen: notches at 45° + 90°n, long grooves at 90°n.
export const angleOfU = (u) => (u + 1) * 45 + C.ROT;

const R = C.ROOM;
const VIEW = [[R.x0, R.y1, -R.desk], [R.x1, R.y1, -R.desk], [R.x1, R.y0, -R.desk], [R.x0, R.y0, R.top], [R.x1, R.y0, R.top], [R.x0, R.y1, R.top - 8]];
export const P = k.fitProjection(VIEW, WIDTH, HEIGHT, { pad: 10, azimuth: 60, elevation: 38 });

// The world height of the lug's top corner and of the refill's ball, from the cam's state (mm along the axis).
export const hW = (h) => C.Z0 + h;
export const ballOf = (h) => C.Z0 + h - C.REFILL.top - C.REFILL.len;

export const at = (p) => k.iso(p, P);
export const S = (paths, style) => k.solidSvg(paths, style);
export const Ln = (d, style) => k.lineSvg(d, style);
export const D = (points, style) => k.dotsSvg(points, style);
export const KIT = { ...k, ...L };
export const zF = (z) => L.frameOf(ptA(0, 0, z), PEN.a, PEN.u, PEN.v);
export const turned = (profile, z, opts) => L.solidOf(profile, zF(z), P, opts);
export const ring = (z, r) => L.arcOf(zF(z), 0, r, P);
