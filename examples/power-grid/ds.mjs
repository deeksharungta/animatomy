import { k, L, P, at, S, Ln, D, box, seg, rod, insulator, ringY } from "./shapes.mjs";
import { C } from "./model.mjs";

// The 400 kV line disconnector, vertical-break: on a steel frame, each phase has a hinge post, a rotating
// drive insulator beside it and a jaw post. The copper blade hinges up off the hinge post. A coupling tube
// under the frame ties the three drive insulators to the motor drive at the near phase, whose door is off:
// inside, the interlock bolt that Pinch holds goes through the locking disc on the drive shaft.
const DS = C.DS, ST = C.STAND, Z = [0, 0, 1];
export const ROT = DS.hinge + 7, TOP = DS.z - 4;
const LEGS = [DS.hinge - 4, DS.jaw + 4];
export function dsFrame() {
  const out = [], ya = C.PH[0] - 8, yb = C.PH[2] + 6;
  for (const x of LEGS) for (const y of [ya, yb]) out.push(S(box(x - 1.2, y - 1.2, 0, x + 1.2, y + 1.2, ST - 2, 0.2), { tone: "mid" }) + S(box(x - 2.4, y - 2.4, 0, x + 2.4, y + 2.4, 1.2, 0.3), { tone: "lo" }));
  for (const x of LEGS) out.push(S(box(x - 1.4, ya - 1.4, ST - 2, x + 1.4, yb + 1.4, ST, 0.2), { tone: "mid" }));
  out.push(S(box(LEGS[0] - 1.4, ya - 1.4, ST - 3.4, LEGS[1] + 1.4, ya + 1.4, ST - 2, 0.2), { tone: "mid" }));
  return out.join("");
}
export const dsFrameFront = () => S(box(LEGS[0] - 1.4, C.PH[2] + 4.6, ST - 3.4, LEGS[1] + 1.4, C.PH[2] + 7.4, ST - 2, 0.2), { tone: "mid" }) + D(LEGS.map((x) => at([x, C.PH[2] + 7.4, ST - 2.7])), { size: 0.45 });

// One phase's beam, posts and contacts (the blade is drawn live).
export function dsPosts(y) {
  const out = [];
  out.push(S(box(LEGS[0] - 2, y - 2.4, ST, LEGS[1] + 2, y + 2.4, ST + 2, 0.3), { tone: "mid" }));
  out.push(D([DS.hinge, ROT, DS.jaw].map((x) => at([x + 3, y + 2.4, ST + 1])), { size: 0.4 }));
  for (const x of [DS.hinge, DS.jaw]) {
    out.push(insulator([x, y, ST + 2], Z, TOP - ST - 2, { r: 2.2, shed: 3.6, n: 11, cap: 3 }));
    out.push(S(box(x - 3, y - 2.6, TOP, x + 3, y + 2.6, TOP + 2.6, 0.4), { tone: "mid" }));
  }
  out.push(S(k.cylinder(ROT, y, 2.6, ST + 2, 2.2, P, 20), { tone: "mid" }));
  out.push(insulator([ROT, y, ST + 4.2], Z, TOP - ST - 10, { r: 1.8, shed: 3, n: 9, cap: 2.4 }));
  // The hinge cheeks behind the blade root, and the jaw's fingers (back half; the front half is drawn after).
  out.push(S(box(DS.hinge - 2, y - 2.2, TOP + 2.6, DS.hinge + 2, y - 1, DS.z + 2, 0.2), { tone: "mid" }));
  out.push(`<g class="pg-cu">${S(box(DS.jaw - 1, y - 2, TOP + 2.6, DS.jaw + 2.4, y - 0.9, DS.z + 3.2, 0.2), { tone: "hi" })}</g>`);
  return out.join("");
}
export function dsFront(y) {
  return S(box(DS.hinge - 2, y + 1, TOP + 2.6, DS.hinge + 2, y + 2.2, DS.z + 2, 0.2), { tone: "mid" }) + S(rod([DS.hinge, y + 2.2, DS.z], [0, 1, 0], 0.8, 0, 0.8, 12), { tone: "hi" }) +
    `<g class="pg-cu">${S(box(DS.jaw - 1, y + 0.9, TOP + 2.6, DS.jaw + 2.4, y + 2, DS.z + 3.2, 0.2), { tone: "hi" })}</g>`;
}
export const dsHingeTerm = (y) => [DS.hinge - 3, y, TOP + 1.3];
export const dsJawTerm = (y) => [DS.jaw + 3, y, TOP + 1.3];

// The motor drive and interlock cabinet, open to the front, and the drive shaft up to the coupling tube.
const M = C.DSM;
export const SHAFT = { x: M.x + M.w / 2, y: M.y + 3.4 };
export function driveBack() {
  const out = [], { x, y, z, w, d, h } = M;
  out.push(S(box(x, y, z, x + w, y + 1, z + h, 0.2), { tone: "mid" }) + S(box(x, y, z, x + 1, y + d, z + h, 0.2), { tone: "mid" }) + S(box(x, y, z, x + w, y + d, z + 1.2, 0.2), { tone: "lo" }));
  out.push(Ln(ringY(y + 1, x + 2.6, x + w - 2.6, z + 4, z + 7, 0.5, 2), { tone: "lo" }));
  // The motor and gearbox at the back, the drive shaft rising through the roof.
  out.push(S(box(x + 2, y + 1, z + 1.2, x + w - 2, y + 7, z + 5.2, 0.4), { tone: "mid" }));
  out.push(S(rod([SHAFT.x, SHAFT.y, z + 5.2], Z, 0.9, 0, ST - 3.4 - z - 5.2, 12), { tone: "hi", crease: "lo" }));
  // The interlock solenoid on the right wall, the bolt's guide.
  out.push(S(box(x + w - 2.6, SHAFT.y - 1.8, z + 8.6, x + w - 1, SHAFT.y + 1.8, z + 11.8, 0.4), { tone: "mid" }));
  return out.join("");
}
export function driveFront() {
  const out = [], { x, y, z, w, d, h } = M;
  out.push(S(box(x + w - 1, y, z, x + w, y + d, z + h, 0.2), { tone: "mid" }));
  out.push(S(box(x - 0.6, y - 0.6, z + h, x + w + 0.6, y + d + 0.6, z + h + 1.4, 0.3, 0.3), { tone: "mid" }));
  out.push(S(box(x, y + d - 1, z, x + w, y + d, z + 2.4, 0.2), { tone: "mid" }));
  // The hand-crank socket on the right wall: where you would crank it by hand.
  out.push(S(rod([x + w, y + d / 2, z + 9], [1, 0, 0], 1.3, 0, 1.4, 14), { tone: "hi" }) + D([at([x + w + 1.4, y + d / 2, z + 9])], { size: 0.5, tone: "lo" }));
  return out.join("");
}
export const couplingTube = () => S(rod([ROT, C.PH[0] - 4, ST - 4.4], [0, 1, 0], 0.9, 0, C.PH[2] - C.PH[0] + 17.4, 12), { tone: "hi" });
void seg;
