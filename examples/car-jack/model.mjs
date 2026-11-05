// A 2-tonne hydraulic bottle jack lifting the front corner of a car: the numbers, the camera, the crew, the pump's
// linkage and the shared drawing helpers. World units are millimetres, z up. Everything is cut on the plane y = 0,
// like a training cutaway, and the front (y > 0) is removed so the oil, the crew and the car's insides show.
//
// Size: Figure, at the top of its range (one hydraulic circuit, about 80 machine parts, two crew, SVG only).
//
// Truth (drawn a little fat round the crew: the pump bore is 18 mm so Ottie fits it): a 36 mm ram and an 18 mm pump
// plunger, so the ram has 4 times the plunger's area. The socket pivots on a link 36 mm from the plunger and the grip
// is 400 mm further out: a 12.1:1 lever. The car's corner weighs 450 kg on its spring; as the jack lifts the body, the
// spring unloads and the jack takes over, all of it once the suspension has dropped 70 mm and the tyre leaves the
// floor. Then 9.3 kg on the grip holds 450 kg at 43 bar. One 14 mm stroke lifts the ram 3.5 mm; 32 strokes lift it
// 112 mm, and the tyre hangs 42 mm clear of the floor.
//
// Parts (machine only, 80): base: cast base (half), raised bosses, cast name panel with three rules, recessed
// underside, weld bead, delivery, suction and release galleries and risers, two hex plugs with copper washers, the
// delivery valve pocket and its seat, the suction check's pocket, seat, ball, spring and retainer, the intake screen,
// the release needle, packing nut and knurled knob, the cylinder's O-ring. Bottle: reservoir tube, pressure cylinder,
// top nut with wiper seal, filler bung. Ram: hollow ram with U-cup seal, backup ring and wear band, extension screw
// with threads and hex collar, saddle with serrations and the pinch-weld groove. Pump: pump body, gland nut and
// wipers, the plunger's cup seal and crosshead, ear post, link and pins, handle socket and sleeve, handle and grip.
// Subject: the hydraulic oil (amber), in the reservoir, the pump chamber, the galleries and under the ram.
//
// Crew (cast by the motion; the headline is the oil being forced under the ram, stroke by stroke):
// Ottie · otter · fluid   · the pump plunger: he stands in the bore on its cup seal, his feet its face pushing the
//                           oil, his paws on the crosshead the handle's socket drives · work: the cup under his feet
//                           · feet · space: an 18 mm bore he fills (36 tall), part: moves 14
// Pinch · crab  · holding · the delivery check valve: he sits on its seat and holds the car's pressure back; the
//                           pump's push lifts him off it · work: the seat's lip · paws · holds against: the load
// You push the handle and turn the release screw: that is "you" in the captions. The suction valve's ball is pushed
// by the oil and the ram by the oil: no crew.
import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";

export const WIDTH = 640;
export const HEIGHT = 600;
export const rad = (d) => (d * Math.PI) / 180;

export const C = {
  BASE: { x0: -64, x1: 112, y0: -50, z1: 40 },
  TUBE: { r0: 34, r1: 37, z1: 170 }, CYL: { r0: 18, r1: 22, z1: 170 }, NUT: { r1: 39, z0: 170, z1: 186 },
  RAM: { r: 18, bore: 11, len: 160 }, SADDLE: { r: 19, h: 10, groove: 2.4 },
  PUMP: { x: 82, r: 9, body: 17, z1: 56, bottom: 8, gland: 12.5 }, ZP: { top: 62, bot: 48 }, PIN_UP: 17, CROSS: 15,
  EAR: [46, 0, 59], LINK: 16, AB: 36, GRIP: 400, SOCKET: 100,
  POCKET: { x0: 36, x1: 64, z: 14, r: 9, hole: 3.2 },
  SUC: { x: 28, z: 32, check: [50, 60], r: 4, ball: 3 }, DEL_UP: 10,
  REL: { x: -10, z: 20, seat: -27, riser: -31, r: 4, knob: 9 },
  LEVEL0: 150, E0: 2, STROKES: 32, DROOP: 70,
  RAM_D: 36, PL_D: 18, LOAD: 450,
  CREW: { ottie: { dx: 0, y: -1, heading: 45, lean: 0, grip: 3.5 }, pinch: { x: 56.5, y: -3.5, heading: 45 } },
  WHEEL: { x: -450, r: 270, y0: -150, arch: 300 }, STAND: { x: -112 },
  SILL: { x0: -136, x1: 320, y0: -64, z: 211, weld: 14, top: 277 },
};
C.AREA = (C.RAM_D / C.PL_D) ** 2;
C.LEVER = (C.AB + C.GRIP) / C.AB;
C.STROKE = C.ZP.top - C.ZP.bot;
C.RISE = C.STROKE / C.AREA;
C.PUSH = C.LOAD / (C.AREA * C.LEVER);
C.BAR = (C.LOAD * 9.81) / (Math.PI * (C.RAM_D / 2000) ** 2) / 1e5;
C.CC = (Math.PI * (C.PL_D / 20) ** 2 * C.STROKE) / 10;
C.LIFT = C.RISE * C.STROKES;
C.ANN = Math.PI * (C.TUBE.r0 ** 2 - C.CYL.r1 ** 2);

export const OTTIE = { species: "otter", name: "Ottie", size: 36, role: "fluid" };
export const PINCH = { species: "crab", name: "Pinch", size: 18, role: "holding" };
export const ROLE = { fluid: "#12A594", holding: "#E5484D" };

export const FLOOR = { x: -680, y: -300, w: 940, d: 380, r: 1 };
export const WALL_TOP = 460;
// The whole figure: the car's front corner, its wheel and the jack; the floor and walls run off the card.
export const P = k.fitProjection(
  [[-500, 40, 0], [150, 40, 0], [150, -60, 0], [-500, -150, 360], [150, -64, 360]],
  WIDTH, HEIGHT, { pad: 4, azimuth: 60 },
);
export const at = (p) => k.iso(p, P);
export const S = (paths, style) => k.solidSvg(paths, style);
export const Ln = (d, style) => k.lineSvg(d, style);
export const D = (pts, style) => k.dotsSvg(pts, style);

// The back half of a ring (or disc, r0 = 0) round a vertical axis at (cx, 0), as a floor outline for extrude.
export function half(r0, r1, cx = 0, n = 40) {
  const pts = [];
  for (let i = 0; i <= n; i++) { const a = Math.PI + (Math.PI * i) / n; pts.push([cx + r1 * Math.cos(a), r1 * Math.sin(a)]); }
  if (r0 > 0) for (let i = n; i >= 0; i--) { const a = Math.PI + (Math.PI * i) / n; pts.push([cx + r0 * Math.cos(a), r0 * Math.sin(a)]); }
  return pts;
}
export const halfSolid = (r0, r1, z0, z1, cx = 0) => k.extrude(half(r0, r1, cx), z0, z1 - z0, P, { convex: r0 === 0 });
// A frame whose axis runs along +x through (x, 0, z), u up, v back: half-turned parts on the section plane.
export const alongX = (x, z, y = 0) => L.frameOf([x, y, z], [1, 0, 0], [0, 0, 1], [0, -1, 0]);
// A flat face on the section plane (y = 0): a polygon in (x, z), drawn as a solid with its own tone and edge.
export function flatY(poly, { shade = 2, tone = "mid", y = 0, cls = "" } = {}) {
  const d = k.pathOf(poly.map(([x, z]) => at([x, y, z])), true);
  return `<g class="iso-solid${cls ? " " + cls : ""}"><path class="iso-fill" d="${d}"/><path class="iso-shade" data-shade="${shade}" d="${d}"/><path class="iso-line iso-edge" data-tone="${tone}" d="${d}"/></g>`;
}
// A channel along an axis-aligned polyline in (x, z), r wide each side, as one outline (square corners).
export function channel(pts, r) {
  const L1 = [], R1 = [];
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const d0 = i > 0 ? norm([p[0] - a[0], p[1] - a[1]]) : norm([b[0] - p[0], b[1] - p[1]]);
    const d1 = i < pts.length - 1 ? norm([b[0] - p[0], b[1] - p[1]]) : d0;
    const n0 = [-d0[1], d0[0]], n1 = [-d1[1], d1[0]], m = norm([n0[0] + n1[0], n0[1] + n1[1]]), s = r / Math.max(0.3, m[0] * n0[0] + m[1] * n0[1]);
    L1.push([p[0] + m[0] * s, p[1] + m[1] * s]); R1.push([p[0] - m[0] * s, p[1] - m[1] * s]);
  }
  return [...L1, ...R1.reverse()];
}
const norm = (v) => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };

// The pump linkage for a plunger at feet height zp: the pin A on top of it, the socket's pivot B on the link from
// the ear pin C, and the socket's unit direction from B through A (the handle carries on that way).
export function linkage(C, zp) {
  const A = [C.PUMP.x, 0, zp + C.PIN_UP], E = C.EAR;
  const dx = A[0] - E[0], dz = A[2] - E[2], d = Math.hypot(dx, dz);
  const a = (C.AB * C.AB - C.LINK * C.LINK + d * d) / (2 * d), h = Math.sqrt(Math.max(0, C.AB * C.AB - a * a));
  const mx = A[0] - (a * dx) / d, mz = A[2] - (a * dz) / d;
  const B = [mx - (h * dz) / d, 0, mz + (h * dx) / d];
  const u = [(A[0] - B[0]) / C.AB, 0, (A[2] - B[2]) / C.AB];
  return { A, B, u };
}
