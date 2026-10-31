import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { tubePieces, tubeSvg } from "../../kit/tube.mjs";
import { ellipsoidOf } from "../../kit/critters.mjs";

// The figure's numbers: a single-boiler espresso machine with a vibratory pump, about 2 world units to the cm.
export const WIDTH = 620;
export const HEIGHT = 560;

export const C = {
  FLOOR: 4,
  TOP: 150,
  DECK: { x: -30, y: 18, w: 52, d: 44, r: 2 },
  DECK_Z: 75,
  DECK_H: 4,
  G: [2, 40],
  BOIL: { r: 19, z0: 83, z1: 121 },
  BAND: { r: 19.5, z0: 87, z1: 97 },
  GROUP: { r: 13, z0: 64, z1: 75 },
  PF: { r: 11.5, z0: 55, z1: 64 },
  SPOUT_Z: 49,
  CUP: { r: 8, z0: 10, h: 14 },
  TRAY: { x: -24, y: 20, w: 60, d: 44, r: 2 },
  TRAY_Z: 10,
  TANK: { x: -52, y: -54, w: 36, d: 26, r: 3 },
  TANK_TOP: 146,
  PUMP: { y: -14, z: 18, x0: -12, x1: 16, r: 8 },
  ROD: { x0: 16, x1: 31, r: 1.4 },
  HANDLE: { x: 33, z0: 9, z1: 27, r: 1.5 },
  STROKE: 2.6,
  OPV: { x: 8, y: -14, z0: 34, z1: 42, cage: 50, r: 4 },
  SW: { pivot: [-2, 42, 126], len: 11, on: 1.05, off: 0.3 },
  GAUGE: { x: -40, y: 60, z: 114, r: 11 },
  SOL: { x: 19, y: 40, z0: 65, z1: 75 },
  T0: 20,
  TSET: 93,
  PMAX: 15,
  OPV_P: 9,
  SHOT: 36,
};

export const OLLIE = { species: "otter", name: "Ollie", size: 30, role: "fluid" };
export const EMBER = { species: "fennec", name: "Ember", size: 26, role: "heat" };
export const CRUMB = { species: "mouse", name: "Crumb", size: 16, role: "sensing" };
export const ROLE = { fluid: "#12A594", heat: "#F76B15", sensing: "#3E9BDB" };

export const DESK = { x: -96, y: -92, w: 196, d: 196, r: 6 };
export const ROOM_TOP = 176;
export const P = k.fitProjection(
  [...k.boxCorners(DESK, -19, -5), [-102, -98, ROOM_TOP], [100, -98, ROOM_TOP], [-102, 52, ROOM_TOP], [0, 0, 160]],
  WIDTH,
  HEIGHT,
  { pad: 14, azimuth: 45 },
);

export const at = (p) => k.iso(p, P);
export const S = (paths, style) => k.solidSvg(paths, style);
export const Ln = (d, style) => k.lineSvg(d, style);
export const D = (points, style) => k.dotsSvg(points, style);
export const K = { ...k, ...L, ellipsoidOf };
export const byDepth = (list, key = (x) => x) => list.sort((a, b) => k.depthOf(key(a), P) - k.depthOf(key(b), P));

const ngon = (r, n = 8) => Array.from({ length: n }, (_, i) => [r * Math.cos(((i + 0.5) / n) * Math.PI * 2), r * Math.sin(((i + 0.5) / n) * Math.PI * 2)]);
// A round rod or body along any axis.
export const rod = (o, a, r, s0, s1, n = 16) => {
  const u = Math.abs(a[2]) > 0.9 ? [1, 0, 0] : [0, 0, 1];
  return L.prismOf(L.frameOf(o, a, u, L.cross3(a, u)), ngon(r, n), s0, s1, P);
};
// A pipe through its route, rounded at every corner.
export const pipe = (points, r, { tone = "mid", bend = 3.5, caps = true } = {}) =>
  tubePieces(L.fillet(points, bend, 8), r, P, { maxLength: 400, spacing: 1.2, caps }).map((piece) => tubeSvg(piece, { tone })).join("");
// A rounded-rectangle ring standing in a y plane, for panel grooves and slots.
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
// A circle standing in a y plane (a gauge face, a port on a panel).
export const circleY = (cx, y, cz, r, n = 48) => k.pathOf(Array.from({ length: n }, (_, i) => at([cx + r * Math.cos((i / n) * Math.PI * 2), y, cz + r * Math.sin((i / n) * Math.PI * 2)])), true);
