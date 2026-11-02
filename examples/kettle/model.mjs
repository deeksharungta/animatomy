import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { tubePieces, tubeSvg } from "../../kit/tube.mjs";

// The figure's numbers: a 1.7 L cordless jug kettle, 2200 W, one world unit to 1.5 mm.
// The kettle is cut in half through its axis by the plane facing the viewer, so the back half shows.
// Local coordinates [u, w, z]: u runs right across the cut, w points at the viewer (the cut is w = 0), z is up.
export const WIDTH = 640;
export const HEIGHT = 600;
const R2 = Math.SQRT1_2;
export const W = ([u, w, z]) => [(u + w) * R2, (w - u) * R2, z];
export const U = [R2, -R2, 0];
export const TOWARD = [R2, R2, 0];

export const C = {
  STATION: { r: 62, z1: 9 },
  FLOOR: 10,
  SKIRT: { r0: 52, r1: 55, z0: 12, z1: 29 },
  PLATE: { r: 50, z0: 29, z1: 32 },
  BODY: { r0: 50, r1: 53, z0: 29, z1: 150 },
  ELEM: { R: 32, r: 2.2, z: 26.6 },
  LID: { z: 150 },
  AREA_CM2: Math.PI * 7.5 * 7.5,
  UNIT_CM: 0.15,
  FILL: 1000,
  HOUSE: { u0: -84, u1: -53, z0: 10, z1: 64, w: -7 },
  SPINE: { u0: -62, u1: -53, z0: 64, z1: 146 },
  GRIP: { u0: -98, u1: -88, z0: 76, z1: 146 },
  ROCK: { pivot: [-84, 40], inner: 8, outer: 14, on: -8, off: 14 },
  BAR: { pivot: [-58, 52], len: 22, trip: -10 },
  DISC: { u: -66, z: 57, r: 5 },
  LEAF: { u0: -60, u1: -77, z: 18, w: -4 },
  BOIL_DRY: { u: -40, w: -5, r: 3.4 },
  TRIPROD: { z: 24.5, u1: -75 },
  SPOUT_TIP: [76, -3.5, 147],
  T0: 20,
  POWER: 2200,
  EFF: 0.92,
  CP: 4.186,
  LATENT: 2257,
  SNAP: 95,
  RESET: 70,
  DRY_TRIP: 140,
  C_PLATE: 300,
  COOL_TAU: 1800,
};
// The water's height above the plate, in world units, for a mass in grams.
export const level = (g) => (g / C.AREA_CM2) / C.UNIT_CM;

export const ROO = { species: "kangaroo", name: "Roo", size: 22, role: "spring" };
export const VOLTA = { species: "eel", name: "Volta", size: 46, role: "power" };
export const MO = { species: "sloth", name: "Mo", size: 20, role: "sensing", wear: ["glasses"] };
export const CRUMB = { species: "mouse", name: "Crumb", size: 13, role: "sensing" };
export const ROLE = { spring: "#E93D82", power: "#F5C518", sensing: "#3E9BDB" };

export const DESK = { x: -104, y: -104, w: 206, d: 206, r: 6 };
export const ROOM_TOP = 206;
export const P = k.fitProjection(
  [...k.boxCorners(DESK, -20, -2), [-110, -110, ROOM_TOP], [102, -110, ROOM_TOP], [-110, 102, ROOM_TOP]],
  WIDTH,
  HEIGHT,
  { pad: 12, azimuth: 45 },
);

export const at = (p) => k.iso(W(p), P);
export const atW = (p) => k.iso(p, P);
export const S = (paths, style) => k.solidSvg(paths, style);
export const Ln = (d, style) => k.lineSvg(d, style);
export const D = (points, style) => k.dotsSvg(points, style);
export const seg = (a, b) => k.segment(W(a), W(b), P);
export const K = { ...k, ...L };

// The back half of a disc, or of a ring, in floor coordinates: angles from the cut round the back.
export const halfDisc = (r, n = 40) => Array.from({ length: n + 1 }, (_, i) => { const t = (i / n) * Math.PI; return W([r * Math.cos(t), -r * Math.sin(t), 0]).slice(0, 2); });
export const halfRing = (r0, r1, n = 40) => [...halfDisc(r1, n), ...halfDisc(r0, n).reverse()];
// A convex polygon drawn in the cut plane [[u, z], …], given thickness back from the cut (w from w0 to w1).
const CUT = L.frameOf([0, 0, 0], TOWARD, U, [0, 0, 1]);
export const inCut = (poly, w0 = -6, w1 = 0) => L.prismOf(CUT, poly, w0, w1, P);
export const rounded = (u0, u1, z0, z1, r = 1.5, n = 4) => {
  const pts = [];
  const arc = (cu, cz, a0) => { for (let i = 0; i <= n; i++) { const t = a0 + (i / n) * (Math.PI / 2); pts.push([cu + r * Math.cos(t), cz + r * Math.sin(t)]); } };
  arc(u1 - r, z1 - r, 0); arc(u0 + r, z1 - r, Math.PI / 2); arc(u0 + r, z0 + r, Math.PI); arc(u1 - r, z0 + r, Math.PI * 1.5);
  return pts;
};
// A round rod along any axis, in world coordinates.
const ngon = (r, n) => Array.from({ length: n }, (_, i) => [r * Math.cos(((i + 0.5) / n) * Math.PI * 2), r * Math.sin(((i + 0.5) / n) * Math.PI * 2)]);
export const rod = (o, a, r, s0, s1, n = 14) => {
  const u = Math.abs(a[2]) > 0.9 ? [1, 0, 0] : [0, 0, 1];
  return L.prismOf(L.frameOf(o, a, u, L.cross3(a, u)), ngon(r, n), s0, s1, P);
};
// A pin through the cut, its round end facing the viewer.
export const pin = (u, z, r, w0 = -6, w1 = 0.6) => rod(W([u, 0, z]), TOWARD, r, w0, w1, 16);
export const pipe = (points, r, { tone = "mid", bend = 3, caps = true } = {}) =>
  tubePieces(L.fillet(points.map(W), bend, 8), r, P, { maxLength: 400, spacing: 1.2, caps }).map((piece) => tubeSvg(piece, { tone })).join("");
