// A wooden spring mousetrap: the numbers, the camera and the crew. World units are half a millimetre (2 units = 1 mm).
//
// Size: Figure (one mechanism, about 70 machine parts, two crew, SVG only: nothing in it glows).
//
// Parts (machine only): base: pine board, end-grain on both ends, chamfer bevel, grain lines, branded label plate with
// three rules and two nails, four felt feet. Hinge: axle wire, two axle staples, two torsion springs (6 coils each),
// their base legs, two leg staples, their hammer hooks. Hammer: U-shaped bail (two arms, crossbar), two eyes on the
// axle. Hold-down bar: wire bar, eye, its staple, its crank tip. Pedal: tin plate, rolled pivot ears, pivot staple,
// catch tab with lip, bait cup with rim, stiffening rib, two corner rivets, stop dimple. Subject: the cheese.
//
// Crew (cast by the motion; the headline is the snap):
// Roo   · kangaroo · spring  · the torsion springs: feet on the springs' base legs, paws on the near spring's hook,
//                               he throws the hammer over 180° · work: the hook on the near arm (r 14) · paws
//                               · space: 30 tall between the bar (y 0) and the near arm (y 36); the hook moves 28
// Pinch · crab     · holding · the pedal's catch: his claws on the bar's tip, holding a tenth of the spring's push
//                               · work: the bar's tip at the catch lip · paws · moves: lets go as the pedal tips 3.4°
// You press the cheese with a pencil, pull the hammer back and lay the bar over: that is "you" in the captions.
import * as k from "../../kit/iso-kit.mjs";

export const WIDTH = 720;
export const HEIGHT = 520;

export const C = {
  BASE: { x: -98, y: -45, w: 196, d: 90, r: 0.6 }, TOP: 18,
  AX: { x: 0, z: 23.4, y: 41 }, WIRE: 1.6, ARM_Y: 28, ARM_L: 76,
  SPRING: { y0: 30, y1: 39, r: 4.6, turns: 6, wire: 1.3, leg: 34, hook: 5.2 },
  BAR: { x: -88, z: 22.4, r: 1.2 }, CROSS_AT: 12,
  PEDAL: { px: 56, pz: 21.6, h: 0.6, tongue: [-10, 0, 6], plate: [0, 42, 20], tab: [-11.2, -10, 4.4], lip: [-15.2, 3.2], cup: [32, 7.5] },
  TRIP: 3.4,
  CREW: { roo: { at: [4, 42, 18], heading: 30, squash: [0.05, 0.5], lean: [20, -40] }, pinch: { at: [40, 10, 18], heading: 30 } },
  // The physics, in SI: two springs, a 1.6 mm steel bail 38 mm long and 28 mm wide.
  PH: { k: 0.0052, tau0: 0.012, rho: 7850, d: 0.0016, L: 0.038, w: 0.028, e: 0.28, drag: 2.5e-9 },
};
// A point on the pedal (u along it from the pivot, v across, s up its normal) when it is tipped psi degrees, bait end down.
export const pedalPt = (C, u, v, s, psi) => {
  const a = (psi * Math.PI) / 180, Q = C.PEDAL;
  return [Q.px + u * Math.cos(a) + s * Math.sin(a), v, Q.pz - u * Math.sin(a) + s * Math.cos(a)];
};
{
  const Q = C.PEDAL;
  C.PMAX = (Math.asin((Q.pz - Q.h - C.TOP) / Q.plate[1]) * 180) / Math.PI;
  // The bar's tip sits under the lip by exactly as much as the lip's edge moves when the pedal tips to the trip angle.
  C.TIP_X = pedalPt(C, Q.lip[0], 0, Q.lip[1], C.TRIP)[0];
  C.ENGAGE = C.TIP_X - pedalPt(C, Q.lip[0], 0, Q.lip[1], 0)[0];
  C.BAR.L = C.TIP_X - C.BAR.x;
  const tipZ = pedalPt(C, -13, 0, Q.lip[1], 0)[2] - C.BAR.r;
  C.PHI_SET = Math.asin((tipZ - C.BAR.z) / C.BAR.L);
  const crossZ = C.BAR.z + C.CROSS_AT * Math.tan(C.PHI_SET) - C.BAR.r - C.WIRE;
  C.TH_SET = Math.PI + Math.asin((C.AX.z - crossZ) / C.ARM_L);
  const top = pedalPt(C, C.ARM_L - Q.px, 0, Q.h, C.PMAX)[2];
  C.TH_REST = Math.asin((top + C.WIRE - C.AX.z) / C.ARM_L);
  C.PHI_REST = Math.PI + Math.asin((C.BAR.z - C.BAR.r) / C.BAR.L);
}

// The hammer's inertia (two arms and a crossbar of wire) and the springs' torque, as functions of its angle.
{
  const H = C.PH, m = (l) => H.rho * Math.PI * (H.d / 2) ** 2 * l;
  H.I = 2 * (m(H.L) * H.L * H.L) / 3 + m(H.w) * H.L * H.L;
}
export const torque = (th) => 2 * (C.PH.tau0 + C.PH.k * (th - C.TH_REST));

// The snap from the set angle, integrated in 1 µs steps: how long it takes and how fast the crossbar lands.
export function snap() {
  let th = C.TH_SET - 0.02, w = 0, t = 0;
  const dt = 1e-6;
  while (th > C.TH_REST) { w -= ((torque(th) + C.PH.drag * w * Math.abs(w)) / C.PH.I) * dt; th += w * dt; t += dt; }
  return { ms: t * 1000, w: -w, v: -w * C.PH.L };
}
// What the catch holds: the crossbar's push on the bar, through the bar's lever.
export const crossForce = () => torque(C.TH_SET) / C.PH.L;
export const catchForce = () => (crossForce() * C.CROSS_AT) / C.BAR.L;

export const ROO = { species: "kangaroo", name: "Roo", size: 34, role: "spring", wear: ["sweatband"] };
export const PINCH = { species: "crab", name: "Pinch", size: 22, role: "holding" };
export const ROLE = { holding: "#E5484D", spring: "#E93D82" };

export const FLOOR = { x: -320, y: -92, w: 600, d: 380, r: 1 };
export const WALL_TOP = 120;
// The camera fits the trap, the bar's landing spot behind it and the wall: the floor runs off the card's edges.
export const P = k.fitProjection(
  [[-222, -92, 0], [128, -92, 0], [-222, 62, 0], [128, 62, 0], [-222, -92, WALL_TOP], [128, -92, WALL_TOP]],
  WIDTH, HEIGHT, { pad: 6, azimuth: 58 },
);
export const at = (p) => k.iso(p, P);
export const S = (paths, style) => k.solidSvg(paths, style);
export const Ln = (d, style) => k.lineSvg(d, style);
export const D = (points, style) => k.dotsSvg(points, style);
export const rad = (d) => (d * Math.PI) / 180;
