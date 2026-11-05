// A lockstitch sewing machine: the numbers, the camera, the crew. World units are millimetres.
//
// Size: Hero (a dense machine of about 120 parts, four crew mechanisms, five crew, SVG only).
//
// Truth: a domestic flatbed lockstitch machine with a drop-in rotary hook. One turn of the arm shaft is one stitch:
// the needle's 31 mm stroke carries the top thread through two layers of cloth; 2.4 mm after the bottom of the stroke
// the thread flares into a loop, the hook's point takes it, and the hook (geared 2:1, two turns a stitch) carries it
// round the bobbin case so the bobbin thread passes through it. The take-up lever gives thread while the loop grows,
// then pulls it up off the case and sets the knot between the layers. With the needle out of the cloth the feed dog
// rises through the throat plate, draws the cloth back one 4 mm stitch and drops. The motor runs the shaft at 90
// stitches a minute through a 2:1 belt; a stitch takes 0.67 s, so the single stitch plays 25 to 50 times slower.
//
// Parts (machine only, about 130): bed: casting, bevel, four rubber feet, two hinge lugs, bed screws, ruler along the
// front edge, seam, label plate (three rules, two rivets), drawer door with finger recess, pedal socket, extension
// table seam with latch slot, section faces with hatching. Throat plate: needle hole, feed slot, three seam guides with
// a ruler, two screws. The pit: floor, three cast ribs, oil pad, drain, four screws, the post with two webs and four
// base screws, the race ring with its lip and 24 ticks, the bobbin case (rim, latch, tension spring), the bobbin.
// Pillar: back and end walls, front post and sill, reverse lever, cord socket, the wheel's mounting plate. Drive: the
// wheel (two rims, 28 rungs, twelve spokes, hub), axle, post and bearing cap, belt pulley, toothed belt, shaft pulley,
// arm shaft, three bearings, collar, handwheel (knurled rim, five spokes, hub, clutch knob). Arm: back wall with three
// ribs, top cover (screws, three oil holes), front frame, badge, stitch-length dial (ticks, fluted knob), carry handle
// and its bosses, two spool pins and spools, thread guide, bobbin winder (base, post, spindle, bobbin, tyre, latch).
// Head: walls, top cover with stitch chart, face plate off (on the table), take-up slot, tension unit (boss, two discs,
// spring, dial, nut, check spring), stitch selector (dial, fluted knob), take-up lever with its stud, eye, crank,
// counterweight and link, presser bar with spring, collar perch and regulator screw, lifter lever, presser foot (clamp,
// shank, thumbscrew, sole, two toes, perch), needle and clamp, guide under the head, lamp housing and bulb.
// Subject: the cloth, in its own colour (two layers of denim), and the thread stitched into it.
//
// Crew (cast by the motion; the headline is the hook catching the loop):
// Pinch · crab      · holding · the hook: his claw takes the loop at the needle and he carries it round the bobbin case,
//                               then lets go · work: the hook point at the needle, r 16 round the case · paws
//                               · space: a 30 mm race round a 22 mm case, part: two laps a stitch
// Knock · woodpecker · moving  · the needle bar: he flies the needle up and drives it down through the cloth, his beak
//                               its clamp · work: the needle clamp · beak · space: 94 mm under the head, part: 31 mm
// Mo    · sloth     · moving  · the feed dog: hangs from the slot by his claws and draws the cloth back one stitch
//                               · work: the feed slot beside the needle · paws · part: 4 mm back, 2.4 mm up and down
//                               (a squirrel's paws can't reach above its own head; only a sloth's arms reach up
//                               through the plate from under it, so the feed dog is the one long-armed hanger)
// Bun, Mochi · hamsters · power · the motor: they run the wheel whose belt turns the arm shaft · work: the rungs · feet
// You press the foot pedal and guide the cloth: that is "you". The take-up lever is driven by the shaft: no crew.
import * as k from "../../kit/iso-kit.mjs";

export const WIDTH = 760;
export const HEIGHT = 640;
export const TAU = Math.PI * 2;
export const rad = (d) => (d * Math.PI) / 180;

export const C = {
  BED: { x: -178, y: -78, w: 324, d: 156, r: 10 }, FOOT: 4, BT: 56, SKIN: 4,
  N: [100, 10], CUT: { x: 58, y: 13, x2: 94, y2: -8 },
  PLATE: { x: 72, y: -30, w: 68, d: 43, r: 2 },
  PILLAR: { x: -166, y: -46, w: 76, d: 72, r: 8 }, TOP: 262,
  ARM: { x: -90, y: -40, w: 152, d: 60, z0: 200 },
  HEAD: { x: 62, y: -46, w: 76, d: 72, r: 6, z0: 150 },
  SHAFT: { y: -10, z: 228, r: 3.2, x0: -168, x1: 110 },
  WHEEL: { x0: -150, x1: -124, y: -10, z: 116, r: 32 }, PULL: { x: -156, r1: 14, r2: 7 },
  HAND: { x: -172, r: 40, w: 10 },
  NEEDLE: { len: 38, low: 44, stroke: 31, clamp: 7 },
  TAKE: { x: 124, y: -24, z: 230, len: 60, a0: -0.38, a1: 0.3 },
  PRESS: { x: 100, y: -4, r: 2.6, foot: 58 },
  HOOK: { r: 16, z: 47, race: 41, caseR: 11, top: 51 },
  CLOTH: { x0: 30, x1: 124, y0: -50, y1: 70, t: 1.6 },
  SL: 4, SPM: 90, CATCH: Math.PI + 0.56, RELEASE: Math.PI + 0.56 + 0.8 * Math.PI, SET: TAU + rad(40),
  FEED: [rad(325), rad(340), rad(440), rad(455)],
  ROUTE: { spool: [15.6, -3, 274], guide: [44, 12, 270], disc0: [80, 29.3, 221], disc1: [84, 29.3, 207.4], check: [94.3, 29.3, 216.1], under: [106, 29.5, 149] },
};
// The hook's centre sits in front of the needle and left of it, out in the section, so its race shows beside the
// bobbin case; the needle is on its rim, 40° round from the back.
C.PHI_N = -0.7;
C.B = [C.N[0] - C.HOOK.r * Math.cos(C.PHI_N), C.N[1] - C.HOOK.r * Math.sin(C.PHI_N)];
C.PERCH = [C.PRESS.x, 0.8, 66];
// Pinch's walk round the race, every 5° of the hook: how far his body trails its point (degrees) and how far out it
// stands. Found by a reach search with his claws on the point all the way round and his body clear of the plate's
// edge at the catch; he faces one way and walks sideways, as crabs do.
C.CRAB = { h: 345, D: [-20,-15,-15,-15,-15,-15,-15,-15,-15,-15,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-5,-5,-5,-5,-5,0,0,0,0,0,5,5,5,5,5,5,5,5,5,10,10,10,10,10,10,10,10,10,10,5,5,5,5,5,0,-5,-10,-15,-20,-25,-25,-25,-20,-20,-20,-20,-20,-20,-20],
  R: [15,15,15,15,15,15,15,15,16,16,17,17,17,17,17,17,17,17,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,17,17,17,17,16,16,16,15,15,15,15,15,15,14,14,14,14,13,13,13,13,13,13,13,13,13,14,14,14,15] };
C.SLOT = [117, C.CUT.y];

// The shaft's kinematics: needle height, take-up eye, hook angle and feed, all from the shaft angle th (0 = needle top).
export const ease = (u) => { const v = Math.max(0, Math.min(1, u)); return v * v * (3 - 2 * v); };
export function kin(C, th) {
  const N = C.NEEDLE, m = ((th % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI), deg = (m * 180) / Math.PI;
  const tip = N.low + (N.stroke * (1 + Math.cos(m))) / 2;
  // Take-up: lowest at 290° (the loop at its biggest), highest at 20°; the feed dog rises, pushes back and drops.
  const up = deg < 20 ? 0.5 + 0.5 * Math.cos(Math.PI * (1 - (deg + 70) / 90)) : deg < 290 ? 0.5 + 0.5 * Math.cos((Math.PI * (deg - 20)) / 270) : 0.5 - 0.5 * Math.cos((Math.PI * (deg - 290)) / 90);
  const F = C.FEED, mm = m < F[0] - 0.3 ? m + 2 * Math.PI : m;
  const lift = mm < F[0] ? 0 : mm < F[1] ? ease((mm - F[0]) / (F[1] - F[0])) : mm < F[2] ? 1 : mm < F[3] ? 1 - ease((mm - F[2]) / (F[3] - F[2])) : 0;
  const push = mm < F[1] ? 0 : mm < F[2] ? ease((mm - F[1]) / (F[2] - F[1])) : mm < F[3] ? 1 : 1 - ease((mm - F[3]) / (F[0] + 2 * Math.PI - F[3]));
  return { tip, top: tip + N.len, up, lift, push, hook: 2 * (th - C.CATCH) };
}

export const KNOCK = { species: "woodpecker", name: "Knock", size: 26, role: "moving" };
export const PINCH = { species: "crab", name: "Pinch", size: 15, role: "holding" };
export const MO = { species: "sloth", name: "Mo", size: 20, role: "moving" };
export const BUN = { species: "hamster", name: "Bun", size: 20, role: "power", wear: ["sweatband"] };
export const MOCHI = { species: "hamster", name: "Mochi", size: 20, role: "power", wear: ["sweatband"] };
export const ROLE = { holding: "#E5484D", moving: "#46A758", power: "#F5C518" };

export const DESK = { x: -214, y: -104, w: 420, d: 226, r: 3 };
export const ROOM_TOP = 296;
export const P = k.fitProjection(
  [...k.boxCorners(DESK, -16, 0), [DESK.x, DESK.y - 6, ROOM_TOP], [DESK.x + DESK.w, DESK.y - 6, ROOM_TOP], [DESK.x - 6, DESK.y + DESK.d, ROOM_TOP]],
  WIDTH, HEIGHT, { pad: 10, azimuth: 50 },
);
export const at = (p) => k.iso(p, P);
export const S = (paths, style) => k.solidSvg(paths, style);
export const Ln = (d, style) => k.lineSvg(d, style);
export const D = (points, style) => k.dotsSvg(points, style);
