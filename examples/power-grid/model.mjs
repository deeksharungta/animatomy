import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";

// The figure's numbers: a 660 MW, 22 kV, two-pole turbo-generator, its 22/400 kV step-up transformer and
// the 400 kV bay that puts it on the grid. World units are about 10 cm, with the switchyard drawn compact.
export const WIDTH = 760;
export const HEIGHT = 450;

export const C = {
  // The grid and the machine (true numbers; every caption is computed from these).
  GRID_HZ: 50, LV_KV: 22, HV_KV: 400, POLES: 2, MVA: 776, MW: 660, PF: 0.85,
  MW_VALVE: 706,     // turbine shaft power with the governor valve wide open, MW
  LOSS: [36, 10],    // no-load steam: windage and friction, MW at 50 Hz (square and linear in speed)
  XS: 1.8, H: 3.5,   // synchronous reactance (per unit) and inertia constant (s) of the shaft line
  IF0: 1600,         // field current for 22 kV open circuit at 50 Hz, A
  DROOP: 0.04, RAMP: 300 / 60 / 60, // governor droop; run-up at 300 rpm a minute, in Hz a second
  SLIP_MAX: 0.067, ANGLE_MAX: 10, DV_MAX: 0.05,   // synchro-check limits (IEEE C50.12)
  T_CLOSE: 0.055, T_OPEN: 0.022, T_PROT: 0.1,     // SF6 breaker closing and opening, arc protection, s
  T_DS: 6, FLASH: 0.6, // disconnector motor drive: blades from closed to open, s; blade angle (rad) at which the arc flashes over
  ARC_V0: 40, ARC_E: 1.5, ARC_K: 10000,           // air arc: electrode drops (V), column gradient (V/mm), temperature (K)
  // The step-up transformer's heat (IEC 60076-7 top-oil model).
  AMB: 20, LOSS_NL: 0.35, LOSS_LL: 1.6, R: 1.6 / 0.35, RISE: 52, RISE_OFF: 2.3, TAU: [150, 90], PUMP_ON: 45, PUMP_LS: 30, PUMPS: 4,
  // Geometry: the turbine deck and the shaft line.
  DECK: { x: -268, y: -62, w: 240, d: 90, r: 1 }, DECK_Z: 30, AY: -18, SH: 58,
  LP: { x0: -262, x1: -200, r: 30 }, GEN: { x0: -178, x1: -88, r: 26 }, ROTOR: 14,
  CUT: { x0: -166, x1: -100, t0: -0.05, t1: 1.62 },  // the generator's cutaway: x span and angles from +y toward +z
  RINGS: { x: -66, r: 7 },
  VALVE: { x: -228, y: 20, z: 30, r: 7, lift: 7 },  // governor valve chest on the deck, stroke in units
  EXC: { x: -50, y: -58, w: 18, d: 16, r: 0.8 },        // static excitation cubicle on the deck's front corner
  // The step-up transformer and its cooler.
  TANK: { x: 12, y: -66, w: 70, d: 44, r: 2 }, TANK_Z: [6, 56], RAD: { y0: -22, y1: -4, xs: [18, 34, 50, 66], w: 12, z: [14, 52] },
  PUMP: { x: 102, y: -8, z: 18, r: 16, w: 6 },
  HVB: { x: 74, ys: [-58, -44, -30], z0: 56, z1: 122 },
  // The 400 kV bay: phases along x, one row per phase.
  PH: [-58, -44, -30], LIVE: 80, STAND: 30,
  ARR: 112, CT: 136, CB: { x: 166, half: 14, z: 78 }, DS: { hinge: 196, jaw: 224, z: 80 }, GANTRY: { x: 264, ys: [-84, -4], z: 150 },
  BLADE: 28, OPEN: Math.PI / 2,
  CBM: { x: 159, y: -22, z: 1.4, w: 14, d: 10, h: 24 },  // the breaker's spring mechanism cabinet, under the front pole
  DSM: { x: 196, y: -22, z: 1.4, w: 15, d: 11, h: 22 },   // the disconnector's motor drive and interlock, at the front pole
  PANEL: { x: -14, y: 34, w: 22, d: 7 },                // the synchronising panel where you stand
  // Where the crew stand, from the reach search: offsets from their handle and a heading.
  AT: { ollie: [0.5, 1, 60], roo: [0, 0, 64], pinch: [-4, 2, 0] },
  VOLTA_PATH: [[-63, -6.5, 32.9], [-63, 8, 32.9], [-41, 8, 32.9], [-41, -40, 32.9]], FIELD_TERM: [-63, -9.2, 33],
};

export const OLLIE = { species: "otter", name: "Ollie", size: 22, role: "fluid" };
export const VOLTA = { species: "eel", name: "Volta", size: 30, role: "power" };
export const BUN = { species: "hamster", name: "Bun", size: 10, role: "power" };
export const MOCHI = { species: "hamster", name: "Mochi", size: 10, role: "power" };
export const ROO = { species: "kangaroo", name: "Roo", size: 15, role: "spring", wear: ["sweatband"] };
export const PINCH = { species: "crab", name: "Pinch", size: 15, role: "holding" };
export const ROLE = { fluid: "#12A594", power: "#F5C518", spring: "#E93D82", holding: "#E5484D" };

// The site slab: a chamfered plinth under everything.
export const SITE = { x0: -284, x1: 272, y0: -112, y1: 56, ch: 24 };
export const sitePlan = (g = 0) => {
  const { x0, x1, y0, y1, ch } = SITE;
  return [[x0 + ch - g, y0 - g], [x1 - ch + g, y0 - g], [x1 + g, y0 + ch - g], [x1 + g, y1 - ch + g], [x1 - ch + g, y1 + g], [x0 + ch - g, y1 + g], [x0 - g, y1 - ch + g], [x0 - g, y0 + ch - g]];
};
export const P = k.fitProjection(
  [...sitePlan().map(([x, y]) => [x, y, -8]), [C.GANTRY.x, C.GANTRY.ys[0], C.GANTRY.z + 8], [C.GANTRY.x, C.GANTRY.ys[1], C.GANTRY.z + 8], [SITE.x0, -40, 60]],
  WIDTH, HEIGHT, { pad: 14, azimuth: 50 },
);

export const at = (p) => k.iso(p, P);
export const S = (paths, style) => k.solidSvg(paths, style);
export const Ln = (d, style) => k.lineSvg(d, style);
export const D = (points, style) => k.dotsSvg(points, style);
export const K = { ...k, ...L };
export const depth = (p) => k.depthOf(p, P);
export const byDepth = (list, key = (x) => x) => [...list].sort((a, b) => depth(key(a)) - depth(key(b)));
export const box = (x0, y0, z0, x1, y1, z1, r = 0.4, bevel = 0) => k.slabOf({ x: x0, y: y0, w: x1 - x0, d: y1 - y0, r }, z0, z1 - z0, P, 2, bevel);
export const seg = (a, b) => k.segment(a, b, P);
