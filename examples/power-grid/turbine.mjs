import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D, box, rod, turned, circleY } from "./model.mjs";

// The steam turbine: a split casing (HP and LP sections) bolted at its horizontal joint, the control valve on top
// fed by the steam pipe from the back wall, and the governor column on the front pedestal.
const { AY, SH } = C;
const X = [1, 0, 0];
const half = (r, up, n = 24) => Array.from({ length: n + 1 }, (_, i) => { const t = (up ? -Math.PI / 2 : Math.PI / 2) + (i / n) * Math.PI; return [r * Math.cos(t), r * Math.sin(t)]; });
const casing = (x0, x1, r, z, up) => L.prismOf(L.frameOf([x0, AY, z], X, [0, 0, 1], [0, -1, 0]), half(r, up), 0, x1 - x0, P);
const SECT = [[-196, -172, 17], [-172, -142, C.TURB.r]];
export const HP_TOP = SH + 3 + 17;

export function turbineLow() {
  const out = [];
  out.push(`<path class="iso-halo" d="${k.haloOf({ x: -228, y: AY - 30, w: 98, d: 60, r: 3 }, 0, 6, P)}"/>`);
  out.push(S(box(-228, AY - 30, 0, -130, AY + 30, 6, 1, 0.6), { tone: "lo" }));
  out.push(D([[-224, AY + 30, 4], [-180, AY + 30, 4], [-134, AY + 30, 4]].map(at), { size: 0.55 }));
  // Holding-down bolts along the baseplate's top, and the oil drain from the pedestal along its front edge.
  out.push(D([-194, -182, -170, -158, -146, -136].map((x) => at([x, AY + 26, 6])), { size: 0.6, tone: "mid" }));
  out.push(S(rod([-198, AY + 17, 9], [1, 0, 0], 1.1, 0, 52, 12), { tone: "mid" }) + S(box(-147, AY + 15, 6, -143, AY + 19, 11, 0.3), { tone: "mid" }));
  // The front pedestal carries the thrust bearing and the governor's drive.
  out.push(S(box(-226, AY - 14, 6, -198, AY + 14, SH + 4, 1, 0.6), { tone: "mid", inner: Ln(k.sideSeam({ x: -226, y: AY - 14, w: 28, d: 28, r: 1 }, SH - 6, P, 2), { tone: "faint" }) }));
  out.push(D([[-222, AY + 14, 12], [-202, AY + 14, 12], [-198, AY + 10, 12], [-198, AY - 10, 12]].map(at), { size: 0.5 }));
  // On the pedestal's face: the oil sight glass, the speed pickup's box and its rating plate.
  out.push(S(rod([-206, AY + 14, 28], [0, 1, 0], 2.6, 0, 1.2, 24), { tone: "mid" }) + Ln(circleY(-206, AY + 15.2, 28, 1.6, 24), { tone: "lo" }));
  out.push(S(box(-221, AY + 14, 26, -213, AY + 17, 32, 0.4), { tone: "mid" }) + D([at([-217, AY + 17, 29])], { size: 0.6, tone: "hi" }));
  out.push(S(box(-221, AY + 14, 14, -205, AY + 14.6, 20, 0.2), { tone: "hi" }));
  out.push(Ln([[-219, -209], [-219, -213], [-219, -211]].map(([a, b], i) => k.segment([a, AY + 14.6, 18.6 - i * 1.3], [b, AY + 14.6, 18.6 - i * 1.3], P)).join(""), { tone: "lo", free: true }));
  // Support paws under the joint flange, then the lower halves of both sections.
  for (const x of [-190, -150]) out.push(S(box(x - 3, AY + 18, 6, x + 3, AY + 26, SH, 0.4), { tone: "mid" }));
  for (const [x0, x1, r] of SECT) out.push(S(casing(x0, x1, r, SH, false), { tone: "mid" }));
  return out.join("");
}

export function turbineHigh() {
  const out = [];
  const fl = { x: -197, y: AY - C.TURB.r - 4, w: 56, d: 2 * C.TURB.r + 8, r: 1 };
  out.push(S(k.slabOf(fl, SH, 3, P, 2, 0.4), { tone: "mid" }));
  const bolts = [];
  for (let x = -193; x <= -144; x += 7) bolts.push([x, fl.y + fl.d - 1.6, SH + 3]);
  for (let y = fl.y + 3; y < fl.y + fl.d - 2; y += 7) bolts.push([-144, y, SH + 3]);
  out.push(D(bolts.map(at), { size: 0.6, tone: "mid" }));
  for (const [x0, x1, r] of SECT) out.push(S(casing(x0, x1, r, SH + 3, true), { tone: "mid" }));
  // Stiffening ribs round the upper halves, and the lifting lugs on top.
  for (const [x, r] of [[-188, 17], [-180, 17], [-164, C.TURB.r], [-156, C.TURB.r], [-148, C.TURB.r]]) out.push(S(casing(x, x + 1.4, r + 0.8, SH + 3, true), { tone: "mid" }));
  for (const x of [-168, -146]) out.push(S(box(x - 1, AY - 1.2, SH + 3 + C.TURB.r - 0.5, x + 1, AY + 1.2, SH + 3 + C.TURB.r + 4, 0.3), { tone: "hi" }));
  // Thrust-bearing housing between pedestal and casing, and the shaft gland at the LP end.
  out.push(S(turned([-204, AY, SH], X, [[0, 9], [8, 9]]), { tone: "mid" }));
  out.push(S(turned([-142, AY, SH], X, [[0, 7], [3, 7], [3, 4.5], [16, 4.5]]), { tone: "hi" }));
  out.push(S(turned([-137, AY, SH], X, [[0, 6], [0.6, 10], [2, 10], [2, 9.6], [2.4, 9.6], [2.4, 10], [3.8, 10], [4.4, 6]]), { tone: "mid" }));
  // The control valve: body, bonnet with its studs, and the steam pipe from the back wall with its flanges.
  const vx = C.VALVE.x;
  out.push(S(box(vx - 9, C.FLOOR_Y, 62, vx + 9, C.FLOOR_Y + 2, 80, 0.4, 0.4), { tone: "mid" }));
  out.push(D([[vx - 7, C.FLOOR_Y + 2, 64], [vx + 7, C.FLOOR_Y + 2, 64], [vx - 7, C.FLOOR_Y + 2, 78], [vx + 7, C.FLOOR_Y + 2, 78]].map(at), { size: 0.5 }));
  out.push(S(rod([vx, C.FLOOR_Y + 2, 71], [0, 1, 0], 5.4, 0, 2, 24), { tone: "mid" }));
  out.push(S(rod([vx, C.FLOOR_Y + 4, 71], [0, 1, 0], 3.2, 0, C.AY - 4 - C.FLOOR_Y - 4, 18), { tone: "mid", inner: Ln([-80, -40].map((y) => L.arcOf(L.frameAlong([vx, y, 71], [0, 1, 0]), 0, 3.2, P)).join(""), { tone: "faint" }) }));
  out.push(S(rod([vx, AY - 12, 71], [0, 1, 0], 5, 0, 2, 20), { tone: "mid" }));
  // The steam pressure gauge on its siphon, and the stop valve's handwheel.
  out.push(S(k.cylinder(vx, -60, 0.8, 74, 8, P, 10), { tone: "mid", crease: "none" }));
  out.push(S(rod([vx, -61.2, 86], [0, 1, 0], 4, 0, 2.2, 28), { tone: "mid" }));
  out.push(Ln(circleY(vx, -59, 86, 3.2, 32), { tone: "lo" }) + Ln(k.segment([vx, -59, 86], [vx + 2.2, -59, 87.8], P), { tone: "hi", free: "end" }));
  out.push(S(turned([vx, -96, 71], [0, 0, 1], [[0, 5.2], [1.6, 6, 1], [7, 6, 1], [8.6, 5.2]]), { tone: "mid" }));
  out.push(S(k.cylinder(vx, -96, 1, 79.6, 6, P, 12), { tone: "mid" }));
  out.push(S(turned([vx, -96, 85.6], [0, 0, 1], [[0, 0], [0, 6], [1.2, 6]]), { tone: "hi" }));
  out.push(Ln(k.ring(vx, -96, 3, 86.8, P, 24), { tone: "lo" }));
  out.push(S(turned([vx, AY, HP_TOP - 1], [0, 0, 1], [[0, 4.5], [2, 6, 1], [8, 7, 1], [13, 5.5, 1], [15, 4.5]]), { tone: "hi" }));
  out.push(S(k.cylinder(vx, AY, 5.6, HP_TOP + 14, 2, P, 28, 0.4), { tone: "mid" }));
  out.push(D(Array.from({ length: 6 }, (_, i) => { const a = (i / 6) * Math.PI * 2 + 0.3; return at([vx + 4.4 * Math.cos(a), AY + 4.4 * Math.sin(a), HP_TOP + 16]); }), { size: 0.5 }));
  out.push(S(k.cylinder(vx, AY, 2.6, HP_TOP + 16, 4, P, 20), { tone: "mid" }));
  out.push(Ln(k.sideArc(vx, AY, 2.6, HP_TOP + 18, P, 16), { tone: "faint" }));
  return out.join("");
}

// The governor: a gear case on the pedestal, the tall spindle housing, and the fulcrum post whose
// sliding block is the speed changer.
export function governorBase() {
  const { x, y } = C.GOV;
  const out = [];
  out.push(S(k.cylinder(x, y, 7, SH + 4, 3, P, 32, 0.4), { tone: "mid" }));
  out.push(S(k.cylinder(x, y, 5, SH + 7, 9, P, 28, 0.4), { tone: "hi" }));
  out.push(D(Array.from({ length: 6 }, (_, i) => { const a = (i / 6) * Math.PI * 2; return at([x + 6 * Math.cos(a), y + 6 * Math.sin(a), SH + 7]); }), { size: 0.45 }));
  out.push(S(k.cylinder(x, y, 2.4, SH + 16, 66 - SH, P, 18), { tone: "mid", crease: "none" }));
  // The fulcrum post rises from the thrust-bearing housing.
  const fx = C.LEVER.pivot[0], fy = AY + 5.5;
  out.push(S(box(fx - 3, fy - 3, SH + 9, fx + 3, fy + 3, SH + 12, 0.4), { tone: "mid" }));
  out.push(S(k.cylinder(fx, fy, 1.5, SH + 12, 100 - SH - 12, P, 14), { tone: "mid", crease: "none" }));
  out.push(D([[fx - 2, fy + 3, SH + 11], [fx + 2, fy + 3, SH + 11]].map(at), { size: 0.4 }));
  return out.join("");
}
export function governorCap() {
  const { x, y } = C.GOV;
  return S(k.cylinder(x, y, 3, C.GOV_TOP, 3, P, 20, 0.4), { tone: "mid" }) + S(k.cylinder(x, y, 1.6, C.GOV_TOP + 3, 4, P, 16), { tone: "hi" }) + Ln(k.knurl(x, y, 1.6, C.GOV_TOP + 3, C.GOV_TOP + 7, 12, P, 0.2), { tone: "lo" });
}
