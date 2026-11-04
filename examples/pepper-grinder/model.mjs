// A manual pepper mill: the numbers, the camera and the crew. World units are half a millimetre (2 units = 1 mm).
//
// Size: Figure (one mechanism, about 60 machine parts, two crew, SVG only: nothing in it glows).
//
// Parts (machine only, 62): base: saucer floor, saucer rim, felt foot band, body far half, body near foot band,
// body near top band, two turned bead grooves, end-grain rings on both section faces, two key slots, label plate
// with three rules and two pins. Head: steel bearing ring, domed head, 40 grip ribs, seam band, square drive socket
// (hidden), knob, knob knurl, knob dome, shaft thread tip, top washer. Mechanism: square shaft, top bushing spider
// (bridge plate, two screws), outer burr ring (half section) with 24 internal teeth, its chamfer, retainer plate with
// three screws, two key lugs, inner burr cone with 36 fine flutes, three coarse feed flutes, collar, thrust race,
// six race balls, spring yoke hub, three yoke arms, foot pad, end nut, cross pin, washer. Subject: peppercorns (heap,
// three in the flutes, fragments, ground pepper, the pile).
//
// Crew (cast by the motion; the headline is the corn cracking):
// Chomp · beaver   · cutting · the outer burr's teeth at the ring's lip, cracks each corn a flute brings round
//                               · work: the corn's crack point above the ring's lip (angle 300°, the corn's outer face) · bite
//                               · space: 15 wide on the ring's top face, part: a corn every 0.4 s, his bite dips 3 units
// Roo   · kangaroo · spring  · the spring between the yoke and the cone's thrust race; takes each crack's kick
//                               · work: the thrust race's rim under the cone (r 30, angle 125° to 143°) · paws
//                               · space: 15.5 tall between yoke and race, part: rises 4.2 with the knob, dips 2 per crack
// You turn the head and the knob: that is "you" in the captions, never a critter.
import * as k from "../../kit/iso-kit.mjs";

export const WIDTH = 600;
export const HEIGHT = 600;

export const C = {
  R_OUT: 56, R_IN: 44, Z0: 3, TOP: 180, WIN0: 5, WIN1: 162, BUSH: 146,
  RING: { z0: 52, z1: 84, rIn: 29 }, RET: { z0: 46, z1: 52, rIn: 31 },
  CONE_Z: 44, YOKE_Z: 28, RACE_H: 2.5, RACE: [18, 31.5],
  ARMS: [134, 254], ARM_R: 41, ROO_ARM: 134,
  SHAFT: 2.6, HEAD_Z: 182, KNOB_Z: 213.4,
  CRACK_A: 300, CORN_R: 4.5, CORN_U: 48, FLUTES: 3, REFILL_A: 150,
  LIFT: 4.2, GAP0: 2.0, TAPER: 1 / 3, TURNS: 5,
  GRAM: 0.05, SPIN: 0.85,
  SAUCER: { r0: 66, r1: 76, h: 8, floor: 3 },
};
// The inner burr's half-section, from its underside up: skirt, fine zone (taper 1/3), coarse feed zone, collar.
export const CONE = [[0, 29.67], [20, 23], [56, 10], [60, 7, 1], [63, 5.5]];
C.CONE = CONE;
// Where the crew stand, from findPlace over both knob settings and a full kick (scratch search, kept as numbers).
C.PLACE = {
  chomp: { at: [14, -27.44], heading: 90, lean: 10 },
  roo: { at: [-24.31, 23.18], heading: 345, lean: 0, squash: 0.05 },
};
export const coneR = (u) => {
  for (let i = 1; i < CONE.length; i++) if (u <= CONE[i][0]) { const [a, ra] = CONE[i - 1], [b, rb] = CONE[i]; return ra + ((rb - ra) * (u - a)) / (b - a); }
  return CONE[CONE.length - 1][1];
};

export const DESK = { x: -118, y: -112, w: 224, d: 222, r: 1 };
export const ROOM_TOP = 232;
export const P = k.fitProjection(
  [...k.boxCorners(DESK, -14, 0), [DESK.x, DESK.y - 6, ROOM_TOP], [DESK.x + DESK.w, DESK.y - 6, ROOM_TOP], [DESK.x - 6, DESK.y + DESK.d, ROOM_TOP], [0, 0, 232]],
  WIDTH, HEIGHT, { pad: 12, azimuth: 45 },
);
export const at = (p) => k.iso(p, P);
export const rad = (d) => (d * Math.PI) / 180;
export const polar = (a, r, z) => [r * Math.cos(rad(a)), r * Math.sin(rad(a)), z];

export const CHOMP = { species: "beaver", name: "Chomp", size: 20, role: "cutting" };
export const ROO = { species: "kangaroo", name: "Roo", size: 23, role: "spring", wear: ["sweatband"] };
export const ROLE = { cutting: "#8E4EC6", spring: "#E93D82" };

// An annular sector on the floor from angle a0 to a1 (degrees), for half-sectioned turned parts.
export function sector(r0, r1, a0, a1, n = 40) {
  const pts = [];
  for (let i = 0; i <= n; i++) { const a = rad(a0 + ((a1 - a0) * i) / n); pts.push([r1 * Math.cos(a), r1 * Math.sin(a)]); }
  for (let i = n; i >= 0; i--) { const a = rad(a0 + ((a1 - a0) * i) / n); pts.push([r0 * Math.cos(a), r0 * Math.sin(a)]); }
  return pts;
}
