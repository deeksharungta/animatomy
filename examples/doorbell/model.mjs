import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { tubePieces, tubeSvg } from "../../kit/tube.mjs";
import { hitAngle } from "./mech.mjs";

// A twist doorbell on the inside of a front door, in millimetres. The door's inside face is y = 0, x runs
// across it, z up; the spindle's axis is x = 0, z = 0, and the door is cut away for x > 0 through that axis.
export const WIDTH = 600;
export const HEIGHT = 560;
const DEG = Math.PI / 180;

export const C = {
  DOOR: { t: 44 },
  PLATE: { x0: -44, x1: 54, z0: -42, z1: 104, r: 13, t: 4 },
  BOSS: { r: 8, y1: 9 },
  SPIN: { half: 3, y0: -60, y1: 18.6 },
  WHEEL: { y: 10, t: 4, root: 9.5, tip: 15, n: 6, steep: 0.02, hub: 5 },
  NUT: { y: 14.4, r: 4.6, h: 3.8 },
  GONG: { z: 60, y: 13, R: 38, H: 26, s1: 25.2 },
  HAM: { tailLen: 20, tilt: 17 * DEG, y: 14.8, t: 3, head: 4.5, rest: 2, tailR: 11.5, tailA: 10 * DEG, headA: -40 * DEG, K: 900, damp: 7, bounce: 0.35 },
  SPRING: { at: 0.4, post: 39, r: 1.9, turns: 6 },
  CLICK: { len: 19, tipA: 250 * DEG, y: 14.8, t: 3, tail: [-6.5, -9] },
  CSPRING: { at: 0.3, post: 9, r: 1.3, turns: 6 },
  KEY: { y: -66, len: 19, w: 6.4, t: 5 },
  ROSE: { r: 22, t: 4 },
  SHELF: { x0: -42, x1: -18, z: -22, y1: 27 },
  // Knock clings to the hammer's stem, f of the way up it; Rocky stands on the bracket below the click.
  CREW: { knock: { f: 0.55, dx: -4, dy: 2, dz: -2, heading: -15 }, rocky: { at: [-32, 19, -22], heading: 40 } },
  // The hammer's tail and the click lie in front of the wheel; a pin at each tip reaches back onto the teeth.
  PIN: 1.1,
  RING_TAU: 1.8,
};

// Derived geometry: the hammer's tail tip rests clear of the root, its head 2 mm off the gong's rim.
const H = C.HAM, G = C.GONG;
const tail = [H.tailR * Math.cos(H.tailA), H.tailR * Math.sin(H.tailA)];
// The tail leans back from upright, so a ramp pushes its tip outward and it falls away from the steep face.
H.pivot = [tail[0] + H.tailLen * Math.sin(H.tilt), tail[1] - H.tailLen * Math.cos(H.tilt)];
const headR = G.R + H.head + H.rest;
const head = [headR * Math.cos(H.headA), G.z + headR * Math.sin(H.headA)];
H.tail = [tail[0] - H.pivot[0], tail[1] - H.pivot[1]];
H.arm = [head[0] - H.pivot[0], head[1] - H.pivot[1]];
const Ck = C.CLICK, cTip = [C.WHEEL.root * Math.cos(Ck.tipA), C.WHEEL.root * Math.sin(Ck.tipA)];
// The click trails the wheel: its pivot sits up the tangent, away from where the teeth carry its tip.
const up = [Math.sin(Ck.tipA), -Math.cos(Ck.tipA)];
Ck.pivot = [cTip[0] + Ck.len * up[0], cTip[1] + Ck.len * up[1]];
Ck.arm = [cTip[0] - Ck.pivot[0], cTip[1] - Ck.pivot[1]];
C.T = (2 * Math.PI) / C.WHEEL.n;
C.HIT = hitAngle(C);
// At rest the click sits at the foot of a ramp, just in front of the next steep face, and the tail is clear.
C.TH0 = Ck.tipA - 0.98 * C.T;

export const KNOCK = { species: "woodpecker", name: "Knock", size: 26, role: "spring" };
export const ROCKY = { species: "raccoon", name: "Rocky", size: 24, role: "holding" };
export const ROLE = { holding: "#E5484D", spring: "#E93D82" };

const VIEW = [[-72, -74, -48], [66, -74, -48], [-72, 34, -48], [66, 34, -48], [-72, -74, 106], [66, -74, 106], [-72, 34, 106], [66, 34, 106]];
export const P = k.fitProjection(VIEW, WIDTH, HEIGHT, { pad: 0, azimuth: 45 });

export const at = (p) => k.iso(p, P);
export const S = (paths, style) => k.solidSvg(paths, style);
export const Ln = (d, style) => k.lineSvg(d, style);
export const D = (points, style) => k.dotsSvg(points, style);
export const K = { ...k, ...L };

// A frame on an axis along y through (x, y, z): angle 0 points to +x, angles turn toward +z.
export const faceY = (x, y, z) => L.frameOf([x, y, z], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
export const flatY = (x, y, z, poly, y0, y1) => L.prismOf(faceY(x, y, z), poly, y0, y1, P);
export const discY = (x, z, r, y0, y1) => L.disc(0, y1 - y0, r, faceY(x, y0, z), P);
export const box = (x0, y0, z0, x1, y1, z1, r = 0.3, bevel = 0) => k.slabOf({ x: x0, y: y0, w: x1 - x0, d: y1 - y0, r }, z0, z1 - z0, P, 2, bevel);
export const circleY = (cx, y, cz, r, n = 48) => k.pathOf(Array.from({ length: n }, (_, i) => at([cx + r * Math.cos((i / n) * 2 * Math.PI), y, cz + r * Math.sin((i / n) * 2 * Math.PI)])), true);

// A rounded rectangle in the x-z plane, as a polygon and as a closed line on a y face.
export const roundRect = (x0, x1, z0, z1, rr, n = 6) => {
  const pts = [];
  const arc = (cx, cz, a0) => { for (let i = 0; i <= n; i++) { const t = a0 + (i / n) * (Math.PI / 2); pts.push([cx + rr * Math.cos(t), cz + rr * Math.sin(t)]); } };
  arc(x1 - rr, z1 - rr, 0); arc(x0 + rr, z1 - rr, Math.PI / 2); arc(x0 + rr, z0 + rr, Math.PI); arc(x1 - rr, z0 + rr, Math.PI * 1.5);
  return pts;
};
export const ringY = (y, x0, x1, z0, z1, rr) => k.pathOf(roundRect(x0, x1, z0, z1, rr).map(([x, z]) => at([x, y, z])), true);

export const pipe = (points, r, { tone = "mid", bend = 2 } = {}) =>
  tubePieces(L.fillet(points, bend, 8), r, P, { maxLength: 400, spacing: 0.8 }).map((piece) => tubeSvg(piece, { tone })).join("");
