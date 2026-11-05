// A Swiss-style cylinder music box: the numbers, the camera, the crew and the spring. World units are millimetres.
//
// Size: Figure, at the top of its range (one movement, about 80 machine parts, two crew, SVG only).
//
// Truth: a spring motor drives a 40 mm brass cylinder pinned with "Twinkle, Twinkle, Little Star" (tune.mjs).
// The barrel's 24 crown teeth turn the cylinder's 12-leaf pinion, so the cylinder turns twice for each barrel turn:
// one tune a turn, 5 rpm, a crotchet every 0.75 s. Each pin lifts one tooth of a 36-tooth steel comb (18 notes, two
// teeth to a note so a repeated note alternates between them) and lets it go;
// the tooth rings at a pitch set by its free length, f ∝ 1/L² (G3 196 Hz on the 39 mm tooth, C6 1047 Hz on the
// 17 mm one). The cylinder's 72-tooth wheel drives a 12-leaf pinion, whose 50-tooth wheel turns a single-start
// endless screw: the fly turns 300 times per cylinder turn, 1,500 rpm, and its air drag (∝ ω²) holds the tempo.
// One turn of the key winds the spring one turn: two plays of the tune; the last quarter turn sags and drags.
//
// Parts (machine only, 80): case: plinth, floor, back and left walls with lining panels, cut lips of the front and
// right walls, inlay band, escutcheon, lid with two hinges, a stay and the tune card. Bedplate: plate, eight screws,
// comb bed with two ribs and the maker's plate. Motor: barrel cup, 24 crown teeth, hook, arbor, pillar, barrel cock
// with two screws, ratchet (16 teeth), click with its screw and spring, key (shank, bow). Cylinder: brass shell, two
// end caps, arbor, 46 tune pins, pinion (12 leaves), left bridge with cap and two screws, right bridge with two
// bearings, caps and screws, 72-tooth wheel with web and four holes. Comb: base with six screws and two steady pins,
// 18 teeth, three lead weights under the bass. Governor: 12-leaf pinion, intermediate arbor, 50-tooth wheel, bearing
// post, endless screw and its foot pivot, governor pillar and cock, endstone with two screws, the fly (boss, two
// vanes). Start lever with knob, guide and pivot. Subject: the brass cylinder, in its own colour.
//
// Crew (cast by the motion; nothing else in the movement moves on its own):
// Roo   · kangaroo · spring  · the mainspring: feet on the barrel's hook, paws on the arbor; he pushes the barrel
//                              round while the click holds the arbor · work: the barrel hook at the wall · feet
//                              · space: a 44 mm barrel, part: one turn per two tunes, squash from the wind
// Pinch · crab     · holding · the stop: his claws close on the fly's vane against the wound spring, and open to
//                              start · work: the vane's tip · paws · space: the governor cock, part: the vane
// You wind the key and slide the start lever. The pins pluck the teeth, but the cylinder is driven by the barrel's
// teeth and each tooth by its pin, so neither moves on its own and neither gets a critter: the comb gets close-ups.
import * as k from "../../kit/iso-kit.mjs";

export const WIDTH = 640;
export const HEIGHT = 580;
export const TAU = Math.PI * 2;
export const rad = (d) => (d * Math.PI) / 180;

export const ZB = 16;
export const C = {
  ZB, AZ: 58, EL: 40, CASE: { x: -168, y: -54, w: 316, d: 148, r: 3 }, CASE_T: 8, CASE_FLOOR: 10, CASE_TOP: 82, LIP: 22,
  BED: { x: -150, y: -40, w: 278, d: 116, r: 5 },
  BARREL: { x: -118, y: 0, r: 22, z0: 18, z1: 28.5, wall: 1.6, floor: 1.5, teeth: 24, toothH: 2.4, pitchR: 20 },
  ARBOR: { r: 3.5, top: 56, hub: 6, hubZ: [4, 21] }, COCK: { z: 49, h: 4, x0: -152, w: 9 },
  RATCHET: { z: 53, h: 2.5, r: 9, teeth: 16 }, KEY: { z0: 55.5, z1: 63, bow: [63, 77], w: 18, t: 2.4 },
  CYL: { x0: -80, x1: 48, r: 20, y: 0, z: 40, pin: 1.2 },
  PINION: { x0: -100.5, x1: -95.5, r: 10, leaves: 12 },
  POSTL: { x: -92, w: 6 }, POSTR: { x: 56, w: 6 },
  WHEEL: { x0: 50, x1: 53, r: 22, teeth: 72 },
  MID: { y: -21.5, z: 26.5, x0: 48, x1: 114, pin: 3.7, leaves: 12, wx0: 100, wx1: 102, wr: 9.5, teeth: 50 },
  POSTM: { x: 108, w: 6 },
  WORM: { x: 101, y: -9.5, r: 2.5, z0: 21, z1: 32, top: 72 },
  GOV: { x: 114, y: -22, w: 12, d: 18, z: 52, h: 4 },
  FLY: { z0: 59, z1: 69, r: 15, boss: 3 },
  COMB: { x0: -77.3, n: 36, pitch: 3.3, tipY: 20.8, z: 40, t: 1.6, base: 5, back: 70, toothW: 2.6 },
  LEVER: { x: 112, y: 40, z: 20, len: 28, tilt: 16, gap: 9 },
  RATIO: { crown: 24, pinion: 12, wheel: 72, mid: 12, worm: 50 },
  CYL_RPM: 5, BEATS: 16, OFFSET: 0.5, TIP: -0.035,
};
C.BARREL_W = (C.CYL_RPM / 2) * (TAU / 60);
C.FLY_PER_CYL = (C.RATIO.wheel / C.RATIO.mid) * C.RATIO.worm;
export const toothX = (i) => C.COMB.x0 + C.COMB.toothW / 2 + 0.35 + i * C.COMB.pitch;

// The spring's torque in units of the friction it must beat: rises fast off the stop, nearly flat after a quarter
// turn. The fly's drag goes as ω², so the speed is √ of the torque left over. 1 at full wind.
export const torque = (w) => 1 + 2.2 * (1 - Math.exp(-Math.max(0, w) / 0.08));
export const speedOf = (w) => Math.sqrt(Math.max(0, torque(w) - 1) / (torque(1) - 1));

// The crew. Spots come from a reach search at both ends of the wind and round the barrel's turn (kept as numbers).
export const ROO = { species: "kangaroo", name: "Roo", size: 28, role: "spring", wear: ["sweatband"] };
export const PINCH = { species: "crab", name: "Pinch", size: 18, role: "holding" };
export const ROLE = { spring: "#E93D82", holding: "#E5484D" };
C.PLACE = {
  roo: { r: 11, psi0: 340, turn: 0, lean: 5, squash: [0.05, 0.3], chest: 14, spread: 15 },
  pinch: { at: [118.9, -16, C.GOV.z + C.GOV.h], heading: 160, lean: 6, claw: [2, 5] },
  fly: rad(-20),
};

export const DESK = { x: -196, y: -100, w: 372, d: 222, r: 3 };
export const ROOM_TOP = 260;
const LID = [[C.CASE.x, -90, 226], [C.CASE.x + C.CASE.w, -90, 226]];
const FRAME = { x: C.CASE.x - 14, y: C.CASE.y, w: C.CASE.w + 26, d: C.CASE.d + 30, r: 0 };
export const P = k.fitProjection(
  [...k.boxCorners(FRAME, -8, 0), ...LID],
  WIDTH, HEIGHT, { pad: 8, azimuth: C.AZ, elevation: C.EL },
);
export const at = (p) => k.iso(p, P);
