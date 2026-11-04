import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { tubePieces, tubeSvg } from "../../kit/tube.mjs";

// A 60 W Curie-point soldering iron lying in its stand, in millimetres. The iron's axis runs along x at
// y = 0, z = ZC, its tip toward +x. Everything round on the iron is cut by the plane y = 0 and its near half
// taken away; the switch rod, magnet, spring and wires inside are drawn whole.
export const WIDTH = 640;
export const HEIGHT = 470;

export const C = {
  ZC: 52,
  // The tip: the Curie slug at its back, then the copper shank and the chisel point.
  SLUG: [0.4, 6.4],
  TIP: [[6.4, 3.6], [62, 3.6], [66, 3.4, 1], [80, 2.1, 1], [88, 1.3, 1], [91.4, 0.85], [92, 0]],
  TIP_R: 3.6,
  // The heater round the tip's back half: ceramic former, nichrome coil, mica wrap, stainless sheath.
  HEAT: { x0: 0, x1: 40, cer: [3.8, 4.7], coil: 5.0, wire: 0.3, pitch: 1.1, mica: [5.35, 5.7], sheath: [5.85, 6.4] },
  CAP: [-1.2, 0],
  BARREL: { x0: 6, x1: 50, r: [6.6, 7.4] },
  NUT: { x0: -2, x1: 6, r: 9.6 },
  HANDLE: { x0: -68, x1: -4, r: [12, 14.5] },
  WALL: { x0: -4, x1: -2 },
  GRIP: { x0: -126, x1: -68, r: [10, 13.2] },
  TAIL: { x0: -152, x1: -126 },
  BOARD: { x: -62, y: -7.5, w: 57.5, d: 15.5, r: 1, z: 42.9, h: 1.6 },
  // The switch: a rod carrying the magnet, the spring collar and the contact bridge, sliding 2 mm.
  TRAVEL: 2,
  ROD: { x0: -51, x1: -7, r: 1.1 },
  MAGNET: { x0: -5.6, x1: -1.5, r: 3.2 },
  CUP: { x0: -9, x1: -5.6, r: 3.6 },
  BULK: { x0: -13, x1: -11 },
  COLLAR: { x0: -28.5, x1: -27, r: 4.8 },
  BRIDGE: { x0: -35.6, x1: -34.6, r: 5 },
  CONTACT_X: -34.6,
  CONTACTS: [-4.2, 3.6],
  SOCKET: { x: -184, y: -50, z: 0 },
  POST: [-5.4, 3.8],
  ROO_AT: [-24.5, 7.5, 150],
  PINCH_AT: [-7, 6, -20],
  GUIDE: { x0: -53, x1: -47 },
  TERM: { x0: -61, x1: -54 },
  // Heat: a 1-D copper rod of nodes coupled to the heater along the heater's length.
  NODE: 4,
  WATTS: 60,
  T0: 22,
  CURIE: 370,
  REGRAB: 364,
  K_CU: 390,
  RHO_C: 3.45e6,
  H_AIR: 26,
  C_HEAT: 5,
  G_HEAT: 4.5,
  G_SHELL: 0.024,
};

export const VOLTA = { species: "eel", name: "Volta", size: 24, role: "power" };
export const PINCH = { species: "crab", name: "Pinch", size: 9, role: "holding" };
export const ROO = { species: "kangaroo", name: "Roo", size: 12, role: "spring" };
export const ROLE = { power: "#F5C518", holding: "#E5484D", spring: "#E93D82" };

export const BENCH = { x: -205, y: -70, w: 345, d: 138, r: 4 };
export const WALL_Y = -76;
export const ROOM_TOP = 150;
export const P = k.fitProjection(
  [[-186, -52, 0], [-186, -30, 0], [-100, 64, 0], [124, 52, 0], [124, -60, 0], [100, -40, 30], [96, 0, 60], [-150, 0, 68], [-60, -20, 80]],
  WIDTH,
  HEIGHT,
  { pad: 18, azimuth: 60 },
);

export const at = (p) => k.iso(p, P);
export const S = (paths, style) => k.solidSvg(paths, style);
export const Ln = (d, style) => k.lineSvg(d, style);
export const D = (points, style) => k.dotsSvg(points, style);
export const byDepth = (list, key = (x) => x) => list.sort((a, b) => k.depthOf(key(a), P) - k.depthOf(key(b), P));

// A frame on the iron's axis, and a turned solid along it from a profile in x.
export const AX = L.frameOf([0, 0, C.ZC], [1, 0, 0], [0, 0, 1], [0, 1, 0]);
export const along = (x, a = [1, 0, 0], y = 0, z = C.ZC) => L.frameAlong([x, y, z], a);
export const turned = (profile, x = 0) => L.solidOf(profile.map(([s, r, f]) => (f ? [s - x, r, 1] : [s - x, r])), along(x), P);
const ngon = (r, n) => Array.from({ length: n }, (_, i) => [r * Math.cos(((i + 0.5) / n) * Math.PI * 2), r * Math.sin(((i + 0.5) / n) * Math.PI * 2)]);
export const rod = (o, a, r, s0, s1, n = 16) => {
  const u = Math.abs(a[2]) > 0.9 ? [1, 0, 0] : [0, 0, 1];
  return L.prismOf(L.frameOf(o, a, u, L.cross3(a, u)), ngon(r, n), s0, s1, P);
};
export const pipe = (points, r, { tone = "mid", bend = 3.5, caps = true, rings } = {}) =>
  tubePieces(L.fillet(points, bend, 8), r, P, { maxLength: 600, spacing: 1.2, caps, rings }).map((piece) => tubeSvg(piece, { tone })).join("");
// A closed outline in the cut plane y = 0, as a flat face.
export const cutFace = (pts, tone = "mid", cls = "") => {
  const d = k.pathOf(pts.map(([x, z]) => at([x, 0, z])), true), t = L.toneOf([0, 1, 0], P), shades = ["", "", "", ""];
  if (t < 4) shades[t] = d;
  return S({ fill: d, outline: d, crease: "", top: t === 4 ? d : "", shades }, { tone, crease: "none", className: cls || undefined });
};
// A circle standing in an x plane (a bore, a disc face seen from +x).
export const circleX = (x, r, n = 40, y = 0, z = C.ZC) => k.pathOf(Array.from({ length: n }, (_, i) => at([x, y + r * Math.cos((i / n) * Math.PI * 2), z + r * Math.sin((i / n) * Math.PI * 2)])), true);
