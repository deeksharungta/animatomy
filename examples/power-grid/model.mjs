import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";

// The figure's numbers: an 11 kV, 10 MVA, 4-pole turbine-generator set in its hall, about 2.5 cm to the unit.
export const WIDTH = 660;
export const HEIGHT = 480;

export const C = {
  // The grid and the machine (true numbers; everything the captions say is computed from these).
  GRID_HZ: 50, GRID_KV: 11, POLES: 4, MVA: 10, MW_MAX: 10, XS: 1.8, H: 4,
  IF0: 160,          // field current, A, for 11 kV open circuit at 50 Hz
  DROOP: 0.04,       // governor droop: 4 % speed change from no load to full valve
  RAMP: 200 / 60 / 30, // run-up limiter: 200 rpm a minute, in Hz a second
  LOSS: [0.3, 0.15], // windage and friction, MW at 50 Hz (square and linear in speed)
  SLIP_MAX: 0.067, ANGLE_MAX: 10, DV_MAX: 0.05,   // synchro-check limits (IEEE C50.12)
  T_CLOSE: 0.06, T_OPEN: 0.04, T_PROT: 0.06,      // breaker closing and opening times, protection relay time, s
  GAP_VAC: 11,       // vacuum interrupter contact gap, mm
  ARC_V0: 40, ARC_E: 1.5, // air arc: electrode drops (V) and column gradient (V/mm)
  ARC_K: 10000,      // air arc column temperature, K
  // Geometry.
  AY: -10, SH: 42, FLOOR_Y: -120,   // shaft line y and height
  TURB: { x0: -196, x1: -142, r: 22 },
  GEN: { x0: -126, x1: -30, r: 33 },
  GOV: { x: -212, y: -10 }, GOV_TOP: 112, ARM: 12, CPL: -132.6,
  LEVER: { pivot: [-199, -10], valve: -182, z: 90, arm: [13, 17] },
  VALVE: { x: -182, lift: 3.5 },
  RINGS: { x: -12, r: 9 },
  EXC: { x: -24, y: -114, w: 38, d: 30, r: 1 },
  CUB: { x: 28, y: -112, w: 58, d: 56, r: 1 },
  CUB_TOP: 120, PART_Z: 62,
  PHX: [42, 57, 72], CUT: 57, // breaker poles along x; the middle one is cut open
  BOT: { y: -76, z0: 72, z1: 94, r: 4.6 },
  MECH: { x: 64, y: -84, z: 30, arm: 16, sz: 14 },
  DS: { xs: [150, 166, 182], hy: -66, jy: -100, z: 92, base: 70 }, // disconnector poles, hinge and jaw lines
  BLADE: 34, OPEN: 1.35, // blade length (between contacts) and open angle (rad)
  GBX: { x: 140, y: -56, z: 34 },  // operating gearbox and its interlock
  DESK: { z: 46 },
  // Where the crew stand and what they hold.
  MO_X: [-192, -188.6], MO_DROP: 10, MO_HEAD: 0, MO_DY: 0, CRUMB_BACK: 1, CRUMB_TURN: -0.6, TAB_R: 6, TAB_H: 5.5,
  VOLTA_PATH: [[19, 4, 2.6], [19, -16, 2.6], [19, -44, 2.6]], FIELD_TERM: [11.2, 5, 5],
  ROO_HEAD: 120, PINCH_DX: 2.6, PINCH_DY: 0, PINCH_HEAD: 180,
  HATCH: { x0: -108, x1: -58, t0: 0.3, t1: 1.5 }, ROTOR: 22,
  SC: { x: 112, y: 8, r: 10 },
  METERS: [{ x: 126.5, y: 2, r: 3.6, lo: 0, hi: 15 }, { x: 126.5, y: 14, r: 3.6, lo: 45, hi: 55 }],
  GB: { x: 141.5, y: -58.5 }, RY: -69,
  FIELD_M: { x: -9, y: -82.6, z: 67, r: 6 },
};

// Steady load point for the story: the governor setting raised so the valve gives 6 MW at 50 Hz.
export const LOAD_MW = 6;
export const loadPoint = (mw) => {
  const p = mw / C.MVA, e = Math.hypot(1, p * C.XS), d = Math.atan2(p * C.XS, 1);
  return { E: e, delta: (d * 180) / Math.PI, If: C.IF0 * e, I: (mw * 1e6) / (Math.sqrt(3) * C.GRID_KV * 1e3) };
};

export const MO = { species: "sloth", name: "Mo", size: 16, role: "sensing", wear: ["glasses"] };
export const VOLTA = { species: "eel", name: "Volta", size: 40, role: "power" };
export const CRUMB = { species: "mouse", name: "Crumb", size: 14, role: "sensing" };
export const ROO = { species: "kangaroo", name: "Roo", size: 17, role: "spring", wear: ["sweatband"] };
export const PINCH = { species: "crab", name: "Pinch", size: 11, role: "holding" };
export const ROLE = { sensing: "#3E9BDB", power: "#F5C518", spring: "#E93D82", holding: "#E5484D" };

export const FLOOR = { x: -236, y: -120, w: 446, d: 160, r: 3 };
export const ROOM_TOP = 152;
export const P = k.fitProjection(
  [...k.boxCorners(FLOOR, -12, 0), [FLOOR.x - 6, FLOOR.y - 6, ROOM_TOP], [FLOOR.x + FLOOR.w, FLOOR.y - 6, ROOM_TOP], [FLOOR.x - 6, FLOOR.y + FLOOR.d, ROOM_TOP]],
  WIDTH, HEIGHT, { pad: 10, azimuth: 52 },
);

export const at = (p) => k.iso(p, P);
export const S = (paths, style) => k.solidSvg(paths, style);
export const Ln = (d, style) => k.lineSvg(d, style);
export const D = (points, style) => k.dotsSvg(points, style);
export const K = { ...k, ...L };
export const byDepth = (list, key = (x) => x) => [...list].sort((a, b) => k.depthOf(key(a), P) - k.depthOf(key(b), P));
export const box = (x0, y0, z0, x1, y1, z1, r = 0.4, bevel = 0) => k.slabOf({ x: x0, y: y0, w: x1 - x0, d: y1 - y0, r }, z0, z1 - z0, P, 2, bevel);

const ngon = (r, n) => Array.from({ length: n }, (_, i) => [r * Math.cos(((i + 0.5) / n) * Math.PI * 2), r * Math.sin(((i + 0.5) / n) * Math.PI * 2)]);
// A round rod or body along any axis.
export const rod = (o, a, r, s0, s1, n = 16) => {
  const u = Math.abs(a[2]) > 0.9 ? [1, 0, 0] : [0, 0, 1];
  const v = [a[1] * u[2] - a[2] * u[1], a[2] * u[0] - a[0] * u[2], a[0] * u[1] - a[1] * u[0]];
  return L.prismOf(L.frameOf(o, a, u, v), ngon(r, n), s0, s1, P);
};
// A turned part along any axis from its half-section.
export const turned = (o, a, profile, opts) => L.solidOf(profile, L.frameAlong(o, a), P, opts);
// A circle standing in an x or y plane (a dial, a port, a flange face).
export const circleX = (x, cy, cz, r, n = 40) => k.pathOf(Array.from({ length: n }, (_, i) => at([x, cy + r * Math.cos((i / n) * Math.PI * 2), cz + r * Math.sin((i / n) * Math.PI * 2)])), true);
export const circleY = (cx, y, cz, r, n = 40) => k.pathOf(Array.from({ length: n }, (_, i) => at([cx + r * Math.cos((i / n) * Math.PI * 2), y, cz + r * Math.sin((i / n) * Math.PI * 2)])), true);
// A rounded rectangle standing in a y plane (panel grooves, louvres, doors).
export const ringY = (y, x0, x1, z0, z1, rr, n = 4) => {
  const pts = [];
  const arc = (cx, cz, a0) => { for (let i = 0; i <= n; i++) { const t = a0 + (i / n) * (Math.PI / 2); pts.push(at([cx + rr * Math.cos(t), y, cz + rr * Math.sin(t)])); } };
  arc(x1 - rr, z1 - rr, 0); arc(x0 + rr, z1 - rr, Math.PI / 2); arc(x0 + rr, z0 + rr, Math.PI); arc(x1 - rr, z0 + rr, Math.PI * 1.5);
  return k.pathOf(pts, true);
};
export const ringX = (x, y0, y1, z0, z1, rr, n = 4) => {
  const pts = [];
  const arc = (cy, cz, a0) => { for (let i = 0; i <= n; i++) { const t = a0 + (i / n) * (Math.PI / 2); pts.push(at([x, cy + rr * Math.cos(t), cz + rr * Math.sin(t)])); } };
  arc(y1 - rr, z1 - rr, 0); arc(y0 + rr, z1 - rr, Math.PI / 2); arc(y0 + rr, z0 + rr, Math.PI); arc(y1 - rr, z0 + rr, Math.PI * 1.5);
  return k.pathOf(pts, true);
};
