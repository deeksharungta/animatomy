// A close-coupled toilet cistern: the numbers, the camera, the crew and the water's physics. World units are millimetres.
//
// Size: Figure, at the top of its range (one mechanism, about 75 machine parts, two crew, SVG only: nothing glows).
//
// Truth: a 6 L cistern on a close-coupled pan. The tank's inside is 400 × 153 mm, so each millimetre of level is
// 61 mL: the 98 mm between the full line and the flush valve's seat is the 6 L flush. The 2" (51 mm) seat passes
// Q = Cd·A·√(2g(h + head)) with Cd 0.6 and 140 mm of head below it: about 2.8 L/s at first, empty in about 3 s.
// The fill valve passes 9 L/min (0.15 L/s); a fifth goes down the refill tube into the overflow to top up the pan's
// seal, so the tank refills in about a minute, slower at the end as the float arm closes it. The flush plays slowed
// five times, the refill sped up; the readout keeps the real clock.
//
// Parts (machine only, about 75): tank: floor slab, back wall, left and right walls, the front wall's corner stub,
// the hatched cut faces, the lid's ledge, the lid (off, leaning on the wall) with its locating lip and two ribs, the
// moulded water line, a date stamp with three rules and a ringed mark, two wall-fixing screws on rubber washers, the
// rating label outside, the plugged side-handle hole, two tank bolts inside on rubber and steel washers. Flush valve:
// flange, three lugs, the web, seat ring and throat, overflow tube with its foot, rim and water-line ticks, the refill
// clip. Trip lever: chrome rose, hex nut, handle with grip ribs, hub, trip arm with five holes, the lift chain and its
// ring. Fill valve: locknut and washer, riser with two rings, valve body, knurled cap and three screws, the plunger,
// its lever, two pivot ears and the pin, float arm, adjusting nut, end nut, refill nipple, hush tube and its foot,
// refill tube with two clips. Supply: angle stop, escutcheon, oval handle, outlet nut, braided hose, coupling nut
// and shank. Pan: platform with two rubber washers, washers and wing nuts under it, bowl, rim, the flushing holes,
// pedestal, two floor-bolt caps, seat ring, two hinges. Subject: the water (tank, swirl, refill trickle, pan).
//
// Crew (cast by the motion; the headline is the flush valve opening):
// Ottie · otter · fluid   · the flush valve's flapper: she sits on the seat and plugs it; the chain lifts her off and
//                            she floats there, holding the valve open, sinking with the falling water back onto it
//                            · work: the seat (51 mm) · feet · space: 68 tall over the seat, part: lifts 60
// Mo    · sloth · sensing · the float: he hangs from the end of the float arm; as the water falls his weight pulls
//                            the arm down and opens the fill valve, as it rises he floats and lifts it shut
//                            · work: the float arm's end · paws · space: 64 tall in the tank, part: rises 82
// You press the handle and let it go: that is "you" in the captions. The chain, plunger and refill flow are pushed
// by other parts: no crew.
import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { tubePieces, tubeSvg } from "../../kit/tube.mjs";

export const WIDTH = 680;
export const HEIGHT = 600;
export const rad = (d) => (d * Math.PI) / 180;

export const C = {
  // The tank: outside, wall and floor thickness, and the inside floor's height (Z0). Levels are millimetres above Z0.
  TANK: { x0: -210, x1: 210, y0: 15, y1: 188, z0: 400, z1: 726, wall: 10, floor: 14 },
  Z0: 414, FULL: 128, SEAL: 30, AREA: 0.0612,
  STUB: { x0: 158, z0: 654 },
  // The flush valve: seat centre and radii, its top, the overflow tube's centre, radius and top.
  SEAT: { x: 54, y: 118, r: 25.5, flange: 40, top: 25 },
  OVER: { x: 54, y: 56, r: 14, top: 152 },
  // The trip lever: its shaft through the stub (along y), the arm's end over the seat, the swing and the chain.
  SHAFT: [176, 170, 682], ARM_END: [58, 122, 682], SWING: 0.6, HANDLE: 62, CHAIN: 152,
  // The fill valve: riser, body and the float arm's pivot; the arm's length; the paws' height when shut and at the stop.
  RING: [0, 8, 46], FILL: { x: -172, y: 74, r: 15, z0: 150, z1: 178 }, PIVOT: [-160, 74, 186], ARM: 140, SHUT: 158, STOP: 76, FLOAT: 30, BAND: 10,
  // The physics: discharge coefficient, seat area (m²), head below the seat (m), fill flow (L/s), share to the pan.
  CD: 0.6, A: Math.PI * 0.0255 ** 2, HEAD: 0.14, QIN: 0.15, BOWL_SHARE: 0.2, HOP: 60, SINK: 0.62, HOP_FULL: 16,
  // The pan: deck under the tank, bowl centre and half-axes at the rim, rim height.
  DECK: { x: -150, y: 30, w: 300, d: 200, r: 30 }, BOWL: { x: 0, y: 446, ax: 182, ay: 232, z: 396 },
};
C.VOL = (h) => Math.max(0, h - C.SEAL) * C.AREA;

export const OTTIE = { species: "otter", name: "Ottie", size: 68, role: "fluid" };
export const MO = { species: "sloth", name: "Mo", size: 64, role: "sensing", wear: ["glasses"] };
export const ROLE = { fluid: "#12A594", sensing: "#3E9BDB" };

export const ROOM = { x0: -330, x1: 460, y1: 820, top: 880 };
export const P = k.fitProjection(
  [[-300, 0, ROOM.top], [360, 0, ROOM.top], [-300, 330, 330], [-40, 690, 330], [360, 120, 330]],
  WIDTH, HEIGHT, { pad: 4, azimuth: 56 },
);
export const at = (p) => k.iso(p, P);
export const S = (paths, style) => k.solidSvg(paths, style);
export const Ln = (d, style) => k.lineSvg(d, style);
export const D = (points, style) => k.dotsSvg(points, style);

// A round rod or body along any axis, and a pipe or hose through its route, rounded at every corner.
const ngon = (r, n = 8) => Array.from({ length: n }, (_, i) => [r * Math.cos(((i + 0.5) / n) * Math.PI * 2), r * Math.sin(((i + 0.5) / n) * Math.PI * 2)]);
export const rod = (o, a, r, s0, s1, n = 16) => {
  const u = Math.abs(a[2]) > 0.9 ? [1, 0, 0] : [0, 0, 1];
  return L.prismOf(L.frameOf(o, a, u, L.cross3(a, u)), ngon(r, n), s0, s1, P);
};
export const pipe = (points, r, { tone = "mid", bend = 6, caps = true } = {}) =>
  tubePieces(L.fillet(points, bend, 8), r, P, { maxLength: 400, spacing: 1.2, caps }).map((piece) => tubeSvg(piece, { tone })).join("");
export const up = (x, y, z) => L.frameOf([x, y, z], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
export const alongX = (x, y, z) => L.frameOf([x, y, z], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
export const alongY = (x, y, z) => L.frameOf([x, y, z], [0, 1, 0], [0, 0, 1], [1, 0, 0]);
// A circle standing in a y plane, or lying in an x plane.
export const circleY = (cx, y, cz, r, n = 48) => k.pathOf(Array.from({ length: n }, (_, i) => at([cx + r * Math.cos((i / n) * Math.PI * 2), y, cz + r * Math.sin((i / n) * Math.PI * 2)])), true);
// The chain: from the arm's end to Ottie's ring, 6 mm slack at rest. Where Ottie and Mo stand from their part.
C.CHAIN = Math.hypot(C.ARM_END[0] - C.SEAT.x - C.RING[0], C.ARM_END[1] - C.SEAT.y - C.RING[1], C.ARM_END[2] - (C.Z0 + C.SEAT.top + C.RING[2])) + 6;
C.PLACE = { ottie: { at: [0, 0], heading: 71, lean: 4 }, mo: { at: [-3, 0, -46], heading: 56, lean: 0, grip: [8, 1] } };
