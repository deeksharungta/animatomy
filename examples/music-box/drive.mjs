// The turning parts' bodies, drawn once at rest (they are round, so turning doesn't change them): the brass
// cylinder and its caps and arbor, the pinion, the 72-tooth wheel, the intermediate train, the endless screw's body,
// the barrel's arbor below the cock, and the comb's base with its screws and steady pins. Teeth, leaves, pins,
// threads and vanes turn in moving.mjs.
import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at } from "./model.mjs";
import { combPlan, alongX } from "./bed.mjs";

const S = (paths, style) => k.solidSvg(paths, style);
const Ln = (d, style) => k.lineSvg(d, style);
const D = (pts, style) => k.dotsSvg(pts, style);
const Y = C.CYL, Mi = C.MID;
export const ringX = (x, cy, cz, r, n = 72) => k.pathOf(Array.from({ length: n }, (_, i) => at([x, cy + r * Math.cos((i / n) * Math.PI * 2), cz + r * Math.sin((i / n) * Math.PI * 2)])), true);

// The cylinder: a brass tube between two caps, the subject in its own colour, with its arbor out to both bridges.
export function cylinder() {
  const out = [];
  out.push(S(L.disc(Y.x0 - 12, Y.x0, 2.5, alongX(0, Y.y, Y.z), P), { tone: "hi" }));
  out.push(`<g class="mb-brass">${S(L.disc(-1.4, 0, Y.r + 0.9, alongX(Y.x0, Y.y, Y.z), P), { tone: "hi", crease: "lo" })}${S(L.disc(0, Y.x1 - Y.x0, Y.r, alongX(Y.x0, Y.y, Y.z), P), { tone: "hi", crease: "lo", inner: Ln(L.arcOf(alongX(Y.x0, Y.y, Y.z), 6, Y.r, P) + L.arcOf(alongX(Y.x0, Y.y, Y.z), Y.x1 - Y.x0 - 6, Y.r, P), { tone: "faint" }) })}</g>`);
  return out.join("");
}
export function cylinderEnd() {
  const out = [], F = alongX(Y.x1, Y.y, Y.z);
  out.push(`<g class="mb-brass">${S(L.disc(0, 1.4, Y.r + 0.9, F, P), { tone: "hi", crease: "lo", inner: Ln(L.circleOf(F, 1.4, Y.r - 4, P) + L.circleOf(F, 1.4, 6, P), { tone: "faint" }) })}</g>`);
  out.push(D(L.dotsOf(F, 1.4, Y.r - 9, 3, P, { phase: 0.5, all: true }), { size: 0.5 }));
  out.push(S(L.disc(1.4, C.POSTR.x - Y.x1, 2.5, F, P), { tone: "hi" }));
  return out.join("");
}

// The pinion on the arbor's left end, over the barrel's crown teeth; its leaves turn in moving.mjs.
export const pinionBody = () => S(L.disc(0, C.PINION.x1 - C.PINION.x0, C.PINION.r - 1, alongX(C.PINION.x0, Y.y, Y.z), P), { tone: "hi", crease: "lo" }) +
  S(L.disc(C.PINION.x1 - C.PINION.x0, C.POSTL.x - C.PINION.x0, 2.5, alongX(C.PINION.x0, Y.y, Y.z), P), { tone: "hi" });

// The 72-tooth wheel on the cylinder's right end: rim, web rings and hub.
export function wheelBody() {
  const W = C.WHEEL, out = [];
  out.push(S(L.disc(0, W.x1 - W.x0, W.r - 0.9, alongX(W.x0, Y.y, Y.z), P), { tone: "hi", crease: "lo" }));
  out.push(Ln(ringX(W.x1, Y.y, Y.z, W.r - 4) + ringX(W.x1, Y.y, Y.z, 8), { tone: "faint" }));
  out.push(S(L.disc(0, 2.4, 5, alongX(W.x1, Y.y, Y.z), P), { tone: "hi" }));
  return out.join("");
}

// The intermediate train: arbor, the 12-leaf pinion under the wheel and the 50-tooth wheel that drives the screw.
export function midTrain() {
  const out = [];
  out.push(S(L.disc(0, Mi.x1 - Mi.x0, 1.6, alongX(Mi.x0, Mi.y, Mi.z), P), { tone: "hi" }));
  out.push(S(L.disc(C.WHEEL.x0 - Mi.x0, C.WHEEL.x1 - Mi.x0, Mi.pin - 0.6, alongX(Mi.x0, Mi.y, Mi.z), P), { tone: "hi", crease: "lo" }));
  out.push(S(L.disc(Mi.wx0 - Mi.x0, Mi.wx1 - Mi.x0, Mi.wr - 0.6, alongX(Mi.x0, Mi.y, Mi.z), P), { tone: "hi", crease: "lo" }));
  out.push(Ln(ringX(Mi.wx1, Mi.y, Mi.z, Mi.wr - 3.5), { tone: "faint" }));
  out.push(S(L.disc(Mi.wx1 - Mi.x0, Mi.wx1 - Mi.x0 + 1.6, 3, alongX(Mi.x0, Mi.y, Mi.z), P), { tone: "hi" }));
  return out.join("");
}

// The endless screw's body on its arbor, up to the cock.
export const wormBody = () => {
  const W = C.WORM;
  return S(k.cylinder(W.x, W.y, 1, C.ZB + 6, C.GOV.z - C.ZB - 6, P, 16), { tone: "hi" }) + S(k.cylinder(W.x, W.y, W.r, W.z0, W.z1 - W.z0, P, 24), { tone: "hi", crease: "lo" });
};

// The barrel's arbor from its floor to the cock.
// The barrel's arbor from its floor to the cock, with the hub the spring's inner end hooks to: Roo's paws hold it.
export function arborLow() {
  const B = C.BARREL, A = C.ARBOR, f = B.z0 + B.floor, out = [];
  out.push(S(k.cylinder(B.x, B.y, A.r, f, C.COCK.z - f, P, 24), { tone: "hi", crease: "lo" }));
  out.push(S(k.cylinder(B.x, B.y, A.hub, f + A.hubZ[0], A.hubZ[1] - A.hubZ[0], P, 40, 0.4), { tone: "hi", crease: "lo", inner: Ln(k.sideArc(B.x, B.y, A.hub, f + A.hubZ[0] + 3, P, 40) + k.sideArc(B.x, B.y, A.hub, f + A.hubZ[1] - 3, P, 40), { tone: "faint" }) }));
  out.push(Ln(k.ring(B.x, B.y, A.r + 0.8, f + A.hubZ[1], P, 24), { tone: "faint" }));
  return out.join("");
}

// The comb's base: one steel plate over the bed, six screws along it and two steady pins at its ends.
export function combBase() {
  const M = C.COMB, out = [], z = M.z;
  out.push(S(k.extrude(combPlan(0), z - M.base, M.base, P, { convex: false }), { tone: "hi", crease: "lo" }));
  const xs = [-66, -42, -18, 6, 24, 36], yAt = (x) => M.back - 6;
  out.push(Ln(xs.map((x) => k.ring(x, yAt(x), 2.2, z, P, 18)).join(""), { tone: "lo" }) + D(xs.map((x) => at([x, yAt(x), z])), { size: 0.6 }));
  out.push(Ln(xs.map((x) => k.lineOnTop([x - 1.55, yAt(x) - 1.55], [x + 1.55, yAt(x) + 1.55], z, P)).join(""), { tone: "mid" }));
  out.push(S(k.cylinder(-74, M.back - 3, 1, z, 0.8, P, 12), { tone: "mid" }) + S(k.cylinder(40, M.back - 3, 1, z, 0.8, P, 12), { tone: "mid" }));
  return out.join("");
}
