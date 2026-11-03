import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { solvePhi, chainLength, psiFor } from "./geo.mjs";

// The rear of a bicycle in a workshop, in millimetres: the rear axle at the origin, x toward the back of the bike,
// y out of the drive side (toward the viewer), z up. An 11-speed 11-32 cassette and a slant-parallelogram derailleur.
export const WIDTH = 640;
export const HEIGHT = 560;
const add = (a, b) => a.map((v, i) => v + b[i]), sub = (a, b) => a.map((v, i) => v - b[i]);
const mul = (a, s) => a.map((v) => v * s), dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const unit = (a) => mul(a, 1 / Math.hypot(...a));
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

const TEETH = [11, 12, 13, 14, 16, 18, 20, 22, 25, 28, 32];
export const C = {
  TEETH,
  PITCH: 12.7,
  R: TEETH.map((n) => 12.7 / (2 * Math.sin(Math.PI / n))),
  Y: TEETH.map((_, i) => 50 - i * 3.74),
  COG_T: 1.6,
  JOCKEY: { n: 11, t: 3.2 },
  RING: { x: -410, z: -70, n: 50, y: 43.5 },
  LINK: 48,
  F: [-15, -18, -14],
  CAGE: 92,
  SPEED: 110,
  SHIFT: 76,
};
C.RJ = 12.7 / (2 * Math.sin(Math.PI / C.JOCKEY.n));
C.RING.r = 12.7 / (2 * Math.sin(Math.PI / C.RING.n));

// The guide pulley's centre over the smallest and the largest cog: below and behind each, 8 mm off its teeth.
const over = (i, a) => [(C.R[i] + C.RJ + 8) * Math.cos(a), C.Y[i], (C.R[i] + C.RJ + 8) * Math.sin(a)];
const Ja = over(0, -60 * Math.PI / 180), Jb = over(10, -70 * Math.PI / 180);
// The parallelogram swings the guide pulley on an arc through both; its fixed pivots hang below the hanger bolt.
const D = sub(Jb, Ja), Dn = unit(D), mid = mul(add(Ja, Jb), 0.5), h = Math.sqrt(C.LINK ** 2 - (Math.hypot(...D) / 2) ** 2);
const hint = [-0.5, 0.8, -0.6], w = unit(sub(hint, mul(Dn, dot(hint, Dn))));
const Cc = add(mid, mul(w, h)), e1 = unit(sub(Ja, Cc)), axis = unit(cross(e1, unit(sub(Jb, Cc))));
C.ARC = { c: Cc, e1, e2: cross(axis, e1), axis, end: Math.acos(dot(e1, unit(sub(Jb, Cc)))) };
C.BK = sub(Cc, C.F);
C.OFF = mul(unit(sub([0, 0, 1], mul(axis, axis[2]))), 6.5);
C.BOLT = [22, 86, -24];
C.BARREL = add(C.BK, [-6, 10, 22]);
C.ANCHOR = 0.42;
C.PAD = 0.12;
C.PSI = TEETH.map((_, i) => psiFor(C, C.Y[i]));
// The chain is a whole, even number of links, long enough that the cage hangs about upright on the 11T cog.
C.LINKS = 2 * Math.floor(chainLength(C, C.PSI[0], 4 * Math.PI / 180, 0) / C.PITCH / 2) + 2;
C.CHAIN = C.LINKS * C.PITCH;
C.PHI = TEETH.map((_, i) => solvePhi(C, C.PSI[i], i));
// Shimano's 11-speed road shifting moves the guide pulley 1.4 mm for each 1 mm of cable: 2.67 mm a click.
C.RATIO = 1.4;

export const ROO = { species: "kangaroo", name: "Roo", size: 28, role: "spring", wear: ["sweatband"] };
export const MO = { species: "sloth", name: "Mo", size: 30, role: "spring", wear: ["glasses"] };
export const ROLE = { spring: "#E93D82" };
// Where the crew stand, from a reach search over every gear: Roo on the B-knuckle's ledge, Mo hanging below the cage.
C.CREW = { roo: { at: [40.5, 79, -78], heading: 75 }, mo: { dx: -14, dy: -2, drop: 24, heading: -30 } };

const VIEW = [[-45, 95, 70], [115, 95, -175], [-45, 5, 70], [115, 5, -175], [-45, 95, -175], [115, 5, 70]];
export const P = k.fitProjection(VIEW, WIDTH, HEIGHT, { pad: 0, azimuth: 55 });
export const at = (p) => k.iso(p, P);
export const S = (paths, style) => k.solidSvg(paths, style);
export const Ln = (d, style) => k.lineSvg(d, style);
export const Dt = (points, style) => k.dotsSvg(points, style);
export const K = { ...k, ...L };
export const V = { add, sub, mul, dot, unit, cross };
