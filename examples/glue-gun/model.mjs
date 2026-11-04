import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { tubePieces, tubeSvg } from "../../kit/tube.mjs";

// A 230 V hot glue gun for 11.2 mm sticks, standing on its wire stand on a craft bench, in millimetres. The stick's
// axis runs along x at y = 0, z = ZC, the nozzle toward +x. The near clamshell half (y > 0) is taken off, and the
// round parts in the barrel (sleeve, block, nozzle, the glue in them) are cut by the plane y = 0.
export const WIDTH = 680;
export const HEIGHT = 500;
const ZC = 112;

export const C = {
  ZC,
  R: 5.6,                                   // the stick's radius
  HW: 17, WALL: 2.2,                        // the clamshell's half width and wall
  // The side outline [x, z, corner radius], clockwise from the top of the rear face; the trigger slot runs -90..-68.
  OUT: [[-128, ZC + 19, 12], [-20, ZC + 19, 30], [36, ZC + 14, 6], [36, ZC - 22, 8], [-40, ZC - 36, 30], [-68, ZC - 36, 0], [-90, ZC - 36, 0], [-92, ZC - 36, 6], [-108, 4, 6], [-146, 4, 7], [-128, 70, 10]],
  SLOT: [-90, -68], SLOT_Y: 5,
  REAR: { x0: -128, x1: -119, ri: 6.1, ro: 9.4 },
  RIBS: [[-118, -116], [-62, -60]],
  PLATE: { x: -116, y: -9, w: 54, d: 20, r: 0.6, z: ZC - 21, h: 1 },
  CARR: { x0: -101, x1: -83, y: 7, z0: ZC - 20, z1: ZC - 9.4 },
  STROKE: 10,
  PIVOT: [-80, ZC - 32], ARM: 20, SWING: 14.5, XR0: -172, BLOB_X: 64,
  SLEEVE: { x0: -60, x1: -22, flange: 3, r: 9, ri: 5.6, front: -30, rf: 10.4 },
  BLOCK: { x0: -20, x1: 26, h: 12, w: 12, spigot: -30, rs: 8, bore: 5.8, cone: [16, 18.5], pass: 2, thread: 5 },
  STACK: { x0: -14, x1: 20, w: 7 },
  NOZ: { x0: 18, x1: 58, seat: 30, step: 42, ball: 2.4, chamber: 2.8, orifice: 1.0, lift: 1.4 },
  BOX: { x: 50, y: -20, w: 42, d: 40, r: 1.5, z: ZC - 14 },
  STRIP: { x: -178, y: -38, z: 0 },
  ZF: ZC - 33.8,
  PIN: [-93.5, 8, 0, -90, -94],
  ROO_AT: [-76, 7.5, 180, 0.75],
  // The heater and the glue: 230 V across PTC stones whose resistance rises tenfold every 24 K past 175 °C.
  V: 230, R0: 529, TB: 175, DECADE: 24, CAP: 75, LOSS: 0.105, T0: 22,
  MELT: 0.016, J_MM: 37.4, AREA: 98.5, RHO: 0.95,
  FORCE: 60, CRACK: 0.3, MU0: 20, L_ORI: 16, PFULL: 6.1,
  BLOB_TAU: 30,
};

export const PINCH = { species: "crab", name: "Pinch", size: 13, role: "moving" };
export const ROO = { species: "kangaroo", name: "Roo", size: 14, role: "spring" };
export const VOLTA = { species: "eel", name: "Volta", size: 26, role: "power" };
export const ROLE = { power: "#F5C518", moving: "#46A758", spring: "#E93D82" };

export const BENCH = { x: -184, y: -44, w: 310, d: 86, r: 4 };
export const WALL_Y = -50;
export const ROOM_TOP = 150;
export const P = k.fitProjection(
  [[-184, -50, 0], [-184, 42, 0], [126, 42, 0], [126, -50, 0], [-184, -50, ROOM_TOP], [126, -50, ROOM_TOP], [-184, 42, -16], [126, 42, -16]],
  WIDTH, HEIGHT, { pad: 14, azimuth: 66 },
);

export const at = (p) => k.iso(p, P);
export const S = (paths, style) => k.solidSvg(paths, style);
export const Ln = (d, style) => k.lineSvg(d, style);
export const D = (points, style) => k.dotsSvg(points, style);
export const byDepth = (list, key = (x) => x) => list.sort((a, b) => k.depthOf(key(a), P) - k.depthOf(key(b), P));
export const AX = L.frameOf([0, 0, ZC], [1, 0, 0], [0, 0, 1], [0, 1, 0]);
export const pipe = (points, r, { tone = "mid", bend = 3.5, caps = true, rings } = {}) =>
  tubePieces(L.fillet(points, bend, 8), r, P, { maxLength: 600, spacing: 1.2, caps, rings }).map((piece) => tubeSvg(piece, { tone })).join("");

// A flat face in the plane y = const from (x, z) points, toned by its normal.
export function face(pts, y = 0, { tone = "mid", normal = [0, 1, 0], cls = "", lit = false } = {}) {
  const d = k.pathOf(pts.map(([x, z]) => at([x, y, z])), true), t = L.toneOf(normal, P), shades = ["", "", "", ""];
  if (t < 4) shades[t] = d;
  return S({ fill: d, outline: d, crease: "", top: t === 4 ? d : "", shades }, { tone, crease: "none", className: cls || undefined, lit });
}
export const cutFace = (pts, tone = "mid", cls = "") => face(pts, 0, { tone, cls });
// A flat face from world points with the tone its normal earns.
export function quad(pts, normal, tone = "mid", cls = "") {
  const d = k.pathOf(pts.map(at), true), t = L.toneOf(normal, P), shades = ["", "", "", ""];
  if (t < 4) shades[t] = d;
  return S({ fill: d, outline: d, crease: "", top: t === 4 ? d : "", shades }, { tone, crease: "none", className: cls || undefined });
}

// A sharp polygon with a radius at each corner, sampled into points.
export function roundPoly(verts, per = 8) {
  const out = [], n = verts.length;
  for (let i = 0; i < n; i++) {
    const [px, pz] = verts[(i + n - 1) % n], [x, z, r] = verts[i], [nx, nz] = verts[(i + 1) % n];
    if (!r) { out.push([x, z]); continue; }
    const a = norm([px - x, pz - z]), b = norm([nx - x, nz - z]), cos = a[0] * b[0] + a[1] * b[1];
    const half = Math.acos(Math.max(-1, Math.min(1, cos))) / 2, tl = r / Math.tan(half);
    const p0 = [x + a[0] * tl, z + a[1] * tl], p1 = [x + b[0] * tl, z + b[1] * tl];
    const bis = norm([a[0] + b[0], a[1] + b[1]]), cd = r / Math.sin(half), c = [x + bis[0] * cd, z + bis[1] * cd];
    let a0 = Math.atan2(p0[1] - c[1], p0[0] - c[0]), a1 = Math.atan2(p1[1] - c[1], p1[0] - c[0]);
    let da = a1 - a0;
    while (da > Math.PI) da -= 2 * Math.PI;
    while (da < -Math.PI) da += 2 * Math.PI;
    for (let j = 0; j <= per; j++) out.push([c[0] + r * Math.cos(a0 + (da * j) / per), c[1] + r * Math.sin(a0 + (da * j) / per)]);
  }
  return out;
}
const norm = ([x, z]) => { const l = Math.hypot(x, z) || 1; return [x / l, z / l]; };

// The same corners moved t inward (the outline is clockwise in x, z), each radius shrunk or grown to match.
export function inset(verts, t) {
  const n = verts.length, lines = [];
  for (let i = 0; i < n; i++) {
    const [x0, z0] = verts[i], [x1, z1] = verts[(i + 1) % n], d = norm([x1 - x0, z1 - z0]), nIn = [-d[1], d[0]];
    lines.push({ p: [x0 - nIn[0] * t, z0 - nIn[1] * t], d });
  }
  return verts.map(([, , r], i) => {
    const A = lines[(i + n - 1) % n], B = lines[i], den = A.d[0] * B.d[1] - A.d[1] * B.d[0];
    if (Math.abs(den) < 1e-9) return [B.p[0], B.p[1], 0];
    const s = ((B.p[0] - A.p[0]) * B.d[1] - (B.p[1] - A.p[1]) * B.d[0]) / den;
    const turn = A.d[0] * B.d[1] - A.d[1] * B.d[0];
    return [A.p[0] + A.d[0] * s, A.p[1] + A.d[1] * s, r ? Math.max(0.6, r + (turn < 0 ? -t : t)) : 0];
  });
}
C.TONE_Y = L.toneOf([0, 1, 0], P);
C.VIEW = L.viewOf(P);
C.LIGHT = L.lightOf(P);
