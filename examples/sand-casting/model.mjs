import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";

// The figure's numbers. One world unit is 5 mm: x along the mould (the ladle at -x), y across it, z up from the floor.
// The near half of the mould (y > 0) is cut away along the plane y = 0, so the gating, the cavity, the core and the
// riser show in section.
export const WIDTH = 640;
export const HEIGHT = 580;
export const MM = 5;

const cx = 28;
export const C = {
  MM,
  BOARD: { x: -70, y: -50, w: 140, d: 50, r: 1 }, // bottom board, z 0..5 (cut at y = 0 with the mould)
  FL: { x0: -60, x1: 60, y0: -40, t: 1.6 }, // flask: inner x, back wall y, wall thickness
  Z: { board: 5, part: 62, top: 74, cup: 98 }, // drag to the parting line, a shallow cope above it, cup and sleeve on top
  CX: cx,
  CAST: { ro: 16, ri: 7, rf: 24, z0: 22, z1: 62, ft: 6 }, // sleeve OD 160, bore 70, flanges OD 240 x 30 mm
  CORE: { r: 7, z0: 14, z1: 70 }, // the core and its prints: 40 mm into the drag and the cope
  RISER: { x: cx + 16, r: 8.5, z0: 62, z1: 98 }, // a 85 mm riser on the top flange, up through the cope and its sleeve
  SLEEVE: { r: 11.5, rim: 12.4 }, // an insulating riser sleeve standing on the cope, 15 mm wall
  CUP: { r: 10.5, rim: 11.6 }, // a sand pouring cup on the cope round the sprue, holding the basin
  // The clamp lugs on the box's right end, at the parting line, and the drag's handle below them that Pinch
  // stands on; his place (at, heading) comes from findPlace in place.mjs.
  CLAMP: { y: -11, lug: 3.4, reach: 5, handle: { x: 8, z: 47.5, y0: -19, y1: -4.5 }, at: [69.6, -12, 48.9], heading: 150 },
  SPRUE: { x: -48, rt: 2.4, rb: 1.64, z0: 15, z1: 90 }, // tapered sprue, 16.4 mm at the choke
  BASIN: { r: 7, z0: 90, z1: 98 }, // pouring basin in the cup, 40 mm deep
  WELL: { x0: -51.5, x1: -44.5, z0: 9, z1: 15 },
  RUN: { x0: -48, x1: cx - 15, z0: 9, z1: 15 }, // runner 30 x 30 mm along the drag floor
  GATE: { x0: cx - 20, x1: cx - 16, z0: 15, z1: 22 }, // ingate up into the bottom flange
  VENT: { x: cx - 20, r: 0.7 },
  CHILL: { x0: cx + 9, x1: cx + 22, z0: 17, z1: 22 }, // a steel chill under the bottom flange's far side
  // The ladle: a teapot ladle on a bail, tilted about trunnions (axis along y) by a worm gear and a handwheel.
  LADLE: { x: -101, rIn: 20, rOut: 30, h: 62, wT: 34, lipU: 35, lipW: 28, flowU: 26, flowH: 54, hookUp: 52 },
  WHEEL: { r: 11, per: 6 }, // the handwheel: one turn tilts the ladle 6 degrees
  BEAM: { x: -101, y0: -100, y1: 18, z: 222 },
  WALL_Y: -100,
  FLOOR: { x: -138, y: -100, w: 222, d: 134, r: 2 },
};

// The physics, in SI units unless named. Plain cast carbon steel, about 0.25 % C.
export const PH = {
  RHO: 7000, // liquid steel, kg/m3
  RHO_S: 7800, // solid steel
  RHO_SAND: 1600,
  CP: 820, // J/kg K, liquid steel
  G: 9.81,
  T_POUR: 1600,
  T_LIQ: 1510,
  T_SOL: 1470,
  T_AMB: 20,
  SHRINK: 0.03, // volume lost as 0.25 % C steel freezes, about 3 %, fed from the riser
  B: 1.26, // Chvorinov constant for steel in silica sand: 2.1 min/cm2 = 1.26 s/mm2
  FLUX: 0.5e6, // W/m2 into the sand while the mould fills
  CD: 0.6, // discharge coefficient of the gating
  WEIR: 0.4, // weir coefficient of the spout lip
  SPOUT_B: 0.04, // spout width, m
  M0: 48, // steel in the ladle at the start, kg
  LADLE_COOL: 0.25, // K/s lost by the ladle
  TAU: 4500, // s, the solid casting's cooling time constant in the sand
  QSTAR: 2.6, // kg/s, the rate the gating is designed for
  TILT_RATE: 14, // deg/s, the fastest you turn the handwheel
};

const PI = Math.PI;
const m = (u) => (u * MM) / 1000;
const area = (r) => PI * m(r) ** 2;
// Volumes and surfaces of the mould's cavities, from the drawing's own sizes.
const cs = C.CAST, ft = cs.ft, hc = cs.z1 - cs.z0;
const vCast = area(cs.ro) * m(hc) - area(cs.ri) * m(hc) + 2 * (area(cs.rf) - area(cs.ro)) * m(ft);
const aCast = 2 * PI * m(cs.ro) * m(hc - 2 * ft) + 2 * 2 * PI * m(cs.rf) * m(ft) + 2 * (area(cs.rf) - area(cs.ri)) + 2 * (area(cs.rf) - area(cs.ro)) + 2 * PI * m(cs.ri) * m(hc);
const vRiser = area(C.RISER.r) * m(C.RISER.z1 - C.RISER.z0);
const aRiser = 2 * PI * m(C.RISER.r) * m(C.RISER.z1 - C.RISER.z0); // the lid insulates the top; the bottom is on the casting
const box = (b, d) => m(b.x1 - b.x0) * m(b.z1 - b.z0) * m(d);
const vGate = box(C.WELL, 7) + box(C.RUN, 6) + box(C.GATE, 4);
const aGate = 2 * (m(C.RUN.x1 - C.RUN.x0) * (m(6) + m(6))) + 0.004;
export const GEO = {
  vCast, aCast, mCast: (vCast / aCast) * 1000, // modulus, mm
  vRiser, aRiser, mRiser: (vRiser / aRiser) * 1000,
  vGate, aGate, mGate: (vGate / aGate) * 1000,
  vMould: vGate + vCast + vRiser,
  aWet: aCast + aRiser + aGate,
  aRiserTop: area(C.RISER.r),
  aBasin: area(C.BASIN.r),
  hBasin: m(C.BASIN.z1 - C.BASIN.z0),
  aChoke: area(C.SPRUE.rb),
  hSprue: m(C.SPRUE.z1 - C.RUN.z0),
  aTop: area(cs.rf) - area(cs.ri), // the casting's top face, under the cope
  vCore: area(C.CORE.r) * m(hc),
};
// What holds the cope down by its own weight: its sand (less the riser and core print), the steel flask, the cup and
// the sleeve on top. Flask: 8 mm walls, two rims, three bars, lugs and handles, about 18 kg.
const cupV = area(C.CUP.r) * m(C.Z.cup - C.Z.top) - GEO.aBasin * GEO.hBasin;
const sleeveV = (area(C.SLEEVE.r) - area(C.RISER.r)) * m(C.Z.cup - C.Z.top);
const sandV = m(C.FL.x1 - C.FL.x0) * m(-C.FL.y0 * 2) * m(C.Z.top - C.Z.part) - (area(C.RISER.r) + area(C.CORE.r)) * m(C.Z.top - C.Z.part);
GEO.copeKg = sandV * PH.RHO_SAND + 18 + cupV * PH.RHO_SAND + sleeveV * 480;
GEO.copeW = GEO.copeKg * PH.G;
GEO.tsCast = PH.B * GEO.mCast ** 2; // s, Chvorinov
GEO.tsRiser = PH.B * GEO.mRiser ** 2;
GEO.tsGate = PH.B * GEO.mGate ** 2;

export const PINCH = { species: "crab", name: "Pinch", size: 32, role: "holding" };
export const OLLIE = { species: "otter", name: "Ollie", size: 22, role: "fluid" };
export const ROLE = { holding: "#E5484D", fluid: "#12A594" };

const top = 228;
export const P = k.fitProjection(
  [...k.boxCorners(C.FLOOR, -14, 0), [C.FLOOR.x, C.WALL_Y, top], [C.FLOOR.x + C.FLOOR.w, C.WALL_Y, top], [C.FLOOR.x, C.FLOOR.y + C.FLOOR.d, 0], [C.FLOOR.x + C.FLOOR.w, C.FLOOR.y + C.FLOOR.d, 0]],
  WIDTH, HEIGHT, { pad: 12, azimuth: 60 },
);
export const at = (p) => k.iso(p, P);
export const S = (paths, style) => k.solidSvg(paths, style);
export const Ln = (d, style) => k.lineSvg(d, style);
export const D = (points, style) => k.dotsSvg(points, style);
export const K = { ...k, ...L };
export const byDepth = (list, key = (x) => x) => list.sort((a, b) => k.depthOf(key(a), P) - k.depthOf(key(b), P));
// A closed polygon of (x, z) points standing in the plane y.
export const inY = (pts, y = 0) => k.pathOf(pts.map(([x, z]) => at([x, y, z])), true);
export const rectY = (x0, x1, z0, z1, y = 0) => inY([[x0, z0], [x1, z0], [x1, z1], [x0, z1]], y);
// A round rod between two points.
const ngon = (r, n) => Array.from({ length: n }, (_, i) => [r * Math.cos(((i + 0.5) / n) * PI * 2), r * Math.sin(((i + 0.5) / n) * PI * 2)]);
export const rod = (a, b, r, n = 14) => {
  const d = L.sub3(b, a), len = L.len3(d), ax = L.unit3(d);
  const u = Math.abs(ax[2]) > 0.9 ? [1, 0, 0] : [0, 0, 1];
  const v = L.unit3(L.cross3(ax, u)), uu = L.cross3(v, ax);
  return L.prismOf(L.frameOf(a, ax, uu, v), ngon(r, n), 0, len, P);
};
