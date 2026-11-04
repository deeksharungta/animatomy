// An electric can opener: the numbers, the camera, the crew and the lever's kinematics. World units are millimetres.
//
// Size: Figure, at the top of its range (one mechanism, about 70 machine parts, four crew, SVG only).
//
// Truth: a 300×407 food can (76 mm across, 110 mm tall) hangs by its rim between the feed gear under the double seam
// and the cutter on the lid just inside it. The motor turns 72 rpm here (hamsters), a 20:40 spur pair halves it to
// 36 rpm on the feed shaft, and the 16 mm feed gear drags the 80 mm bead round at 30 mm/s: one turn of the can in
// 8.3 s. The cut runs at r = 34 mm, 3 mm inside the countersink wall, 214 mm round. The lever turns 8.9° on its pivot; the cutter drops 15.7 mm.
//
// Parts (machine only, 72): housing: four feet, floor plate, back wall, left wall, front face plate, top cap, corner
// trim, two seams, eight screws, vent slots, rating plate with three rules and two rivets, cord grommet, power cord,
// LED and bezel. Front: shaft boss, bushing, lever slot with rubber stop, can guide ledge, two face screws. Drive:
// hamster wheel (two rims, 24 rungs, 6 spokes a side, hub), axle, two bearing posts with caps, pinion (20 teeth),
// spur gear (40 teeth, web, four lightening holes, hub, set screw), feed shaft, collar, feed gear (24 teeth, nut).
// Lever: bar, pivot bracket on the back wall, pivot pin, E-clip, handle paddle with grip ribs, spring pad, switch
// tab, cutter hanger, cutter shoe with two screws. Switch: microswitch body, plunger, two terminals, bracket.
// Spring seat: shelf, post, foot. Wires: cord to switch, switch to motor terminal, terminal block.
// Subject: the can (label in its own colour, tomato soup inside), with seams, lid, expansion rings and the cut.
//
// Crew (cast by the motion; the headline is the lid being cut):
// Chomp · beaver   · cutting · the cutter: his teeth slice the lid just inside the rim as the can turns past
//                               · work: the cut point on the lid, r 34 at 176° · bite
//                               · space: a 10×10 shoe beside the rim, part: drops 15.7 onto the lid
// Bun, Mochi · hamsters · power · the motor: they run the wheel whose pinion turns the feed shaft
//                               · work: the wheel's bottom rungs · feet · space: a 28 mm wheel, part: turns 72 rpm
// Roo   · kangaroo · spring  · the lever's return spring, between the spring shelf and the pad under the lever
//                               · work: the pad on its stem under the lever at x −42 · paws
//                               · space: 18.6 from shelf to pad at rest, part: the pad drops 8.6 on the press
// You press the lever: that is "you" in the captions, never a critter. The feed gear is driven by gears: no crew.
import * as k from "../../kit/iso-kit.mjs";

export const WIDTH = 600;
export const HEIGHT = 560;
export const rad = (d) => (d * Math.PI) / 180;

export const C = {
  HOUSE: { x: -104, y: -28, w: 88, d: 56, r: 6 }, FLOOR: 6, PLATE: 4, TOP: 160, WALL: 4,
  CAN: { x: 40, y: 0, r: 38, wall: 0.9, z0: 6, bead: 40, beadZ: 110, top: 116, lid: 112, bottom: 10 },
  NOTCH: { a0: 136, a1: 171, z0: 104, r: 31 },
  CUT_R: 34, CUT_A: 176, CUT_LEN: 214,
  FEED: { x0: -4.5, x1: 1.5, r: 8, z: 102, teeth: 24 },
  SHAFT: { r: 2.5, x0: -66, x1: -4.5 },
  GEAR: { x0: -60, x1: -56, r: 20, teeth: 40 },
  PIN: { x0: -61, x1: -53, r: 10, teeth: 20, z: 72 },
  WHEEL: { x0: -97, x1: -85, r: 28, z: 72 },
  POSTS: [{ x: -67, w: 4 }, { x: -81, w: 4 }],
  PIVOT: [-96, 12, 128], THETA: 0.156, LEVER: { x0: -101, x1: 31, y: 12, w: 3, t: 2.5 },
  HANDLE: { x0: 14, x1: 34, w: 8 },
  SHOE: { x: -10, y: 10, w: 9, d: 9, z: 102, h: 2 },
  HANGER: { x0: -6, x1: -3, y0: 9.5, y1: 12.5 },
  SHELF: { x: -48, y: 5, w: 16, d: 17, z: 96, h: 4 }, PAD: { x: -42, y: 15, z: 110, r: 4 },
  ROO_X: -36, SWITCH: { x: -88, y: 8, w: 9, d: 8, z: 116, h: 7 },
  CAN_RPM: 60 * (30.16 / 40) / (2 * Math.PI), WHEEL_RPS: 1.2,
};

// The crew. Sizes and spots come from a reach search over both ends of the lever's travel (scratch, kept as numbers).
export const CHOMP = { species: "beaver", name: "Chomp", size: 26, role: "cutting" };
export const BUN = { species: "hamster", name: "Bun", size: 17, role: "power", wear: ["sweatband"] };
export const MOCHI = { species: "hamster", name: "Mochi", size: 17, role: "power", wear: ["sweatband"] };
export const ROO = { species: "kangaroo", name: "Roo", size: 28, role: "spring", wear: ["sweatband"] };
export const ROLE = { cutting: "#8E4EC6", power: "#F5C518", spring: "#E93D82" };
C.PLACE = { chomp: { at: [-3, 14, 104], heading: 0, lean: 25 }, roo: { at: [-40, 13, 100], heading: 75 } };

export const DESK = { x: -150, y: -78, w: 258, d: 166, r: 3 };
export const ROOM_TOP = 178;
export const P = k.fitProjection(
  [...k.boxCorners(DESK, -16, 0), [DESK.x, DESK.y - 6, ROOM_TOP], [DESK.x + DESK.w, DESK.y - 6, ROOM_TOP], [DESK.x - 6, DESK.y + DESK.d, ROOM_TOP]],
  WIDTH, HEIGHT, { pad: 10, azimuth: 58 },
);
export const at = (p) => k.iso(p, P);
export const polar = (a, r, z, c = [C.CAN.x, C.CAN.y]) => [c[0] + r * Math.cos(rad(a)), c[1] + r * Math.sin(rad(a)), z];

// The lever turns about a pin along y. Every part on it is given where it sits with the lever pressed (lev = 1);
// leverAt moves it to any lever position. THETA up at rest, 0 pressed.
export function leverAt(C, lev, p) {
  const a = C.THETA * (1 - lev), [px, , pz] = C.PIVOT;
  const dx = p[0] - px, dz = p[2] - pz;
  return [px + dx * Math.cos(a) - dz * Math.sin(a), p[1], pz + dx * Math.sin(a) + dz * Math.cos(a)];
}

// An annular sector round the can's axis from angle a0 to a1 (degrees), for the notched parts of the can.
export function sector(r0, r1, a0, a1, n = 48) {
  const pts = [];
  for (let i = 0; i <= n; i++) { const a = rad(a0 + ((a1 - a0) * i) / n); pts.push([C.CAN.x + r1 * Math.cos(a), C.CAN.y + r1 * Math.sin(a)]); }
  for (let i = n; i >= 0; i--) { const a = rad(a0 + ((a1 - a0) * i) / n); pts.push([C.CAN.x + r0 * Math.cos(a), C.CAN.y + r0 * Math.sin(a)]); }
  return pts;
}
