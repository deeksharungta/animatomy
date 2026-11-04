// The mill's static drawing: the body and burr ring in half section, the heap of corns, the parts that only slide
// up and down (yoke, race and cone, built at rest and moved with a transform), the top bushing, the head and knob.
import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, CONE, P, at, polar, sector, rad } from "./model.mjs";

const S = (paths, style) => k.solidSvg(paths, style);
const Ln = (d, style) => k.lineSvg(d, style);
const D = (pts, style) => k.dotsSvg(pts, style);
const up = (z) => L.frameOf([0, 0, z], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
const byDepth = (list) => list.sort((a, b) => k.depthOf(a[0], P) - k.depthOf(b[0], P)).map((x) => x[1]).join("");
const arcAt = (r, z, a0, a1, n = 40) => k.pathOf(Array.from({ length: n + 1 }, (_, i) => at(polar(a0 + ((a1 - a0) * i) / n, r, z))));
const bar = (a, r0, r1, wd, z, h) => {
  const u = [Math.cos(rad(a)), Math.sin(rad(a))], v = [-u[1], u[0]];
  const p = (r, s) => [u[0] * r + v[0] * s, u[1] * r + v[1] * s];
  return k.extrude([p(r0, -wd), p(r1, -wd), p(r1, wd), p(r0, wd)], z, h, P);
};

// The far half of the beech body, its two section faces square to the eye, with the grain running up them.
export function bodyBack() {
  const out = [S(k.extrude(sector(C.R_IN, C.R_OUT, 135, 315), C.Z0, C.TOP - C.Z0, P, { convex: false }), { tone: "mid", crease: "faint" })];
  const grain = [];
  for (const a of [135, 315]) for (const r of [46.5, 49.5, 53]) grain.push(k.segment(polar(a, r, C.WIN0), polar(a, r, C.WIN1), P));
  out.push(Ln(grain.join(""), { tone: "faint" }));
  // Turning marks left in the bore by the lathe, each running from section face to section face.
  const marks = [14, 26, 38, 96, 110, 124, 138, 152].map((z) => arcAt(C.R_IN, z, 135, 315, 60)).join("");
  out.push(Ln(marks, { tone: "faint" }));
  // The section's inner edges, where the cut faces turn into the bore: the marks above end on them.
  out.push(Ln([135, 315].map((a) => k.segment(polar(a, C.R_IN, C.WIN0), polar(a, C.R_IN, C.WIN1), P)).join(""), { tone: "lo" }));
  // The key slot the yoke's back arm rides in, a closed groove in the bore.
  const slot = [];
  for (let i = 0; i <= 6; i++) slot.push(at(polar(C.ARMS[1] - 4 + (8 * i) / 6, C.R_IN, C.WIN0 + 4)));
  for (let i = 6; i >= 0; i--) slot.push(at(polar(C.ARMS[1] - 4 + (8 * i) / 6, C.R_IN, C.RET.z0 - 2)));
  out.push(Ln(k.pathOf(slot, true), { tone: "lo" }));
  return out.join("");
}

// The steel retainer plate and the outer burr ring, cut in half, with the ring's internal teeth on its far bore.
export function ringBack() {
  const R = C.RING, T = C.RET, out = [];
  out.push(S(k.extrude(sector(T.rIn, C.R_IN, 135, 315), T.z0, T.z1 - T.z0, P, { convex: false }), { tone: "mid" }));
  out.push(S(k.extrude(sector(R.rIn, C.R_IN, 135, 315), R.z0, R.z1 - R.z0, P, { convex: false }), { tone: "hi", crease: "lo" }));
  // The bore's bottom edge as one stroke, so the facets' edges don't read as a dashed line.
  out.push(Ln(arcAt(R.rIn, R.z0, 135, 315, 90), { tone: "mid" }));
  const teeth = [];
  for (let a = 142.5; a < 310; a += 7.5) teeth.push(k.segment(polar(a, R.rIn, R.z0), polar(a, R.rIn, R.z1), P));
  out.push(Ln(teeth.join(""), { tone: "lo" }));
  out.push(Ln(arcAt(R.rIn + 2.2, R.z1, 135, 315) + arcAt(C.R_IN - 2, R.z1, 135, 315), { tone: "faint" }));
  // On each section face: the teeth cut in the bore, the shoulder pressed into the retainer, a dowel hole, the screw.
  const sec = [];
  for (const a of [135, 315]) {
    const zig = [];
    for (let i = 0; i <= 16; i++) zig.push(at(polar(a, R.rIn + (i % 2 ? 1.6 : 0), R.z0 + (i * (R.z1 - R.z0)) / 16)));
    sec.push(k.pathOf(zig));
    sec.push(k.pathOf([at(polar(a, C.R_IN - 4, R.z0)), at(polar(a, C.R_IN - 4, R.z0 + 4)), at(polar(a, C.R_IN, R.z0 + 4))]));
    for (const [r, z] of [[37, 74], [37, 61]]) sec.push(k.pathOf(Array.from({ length: 24 }, (_, i) => { const t = (i / 24) * Math.PI * 2; return at(polar(a, r + 1.6 * Math.cos(t), z + 1.6 * Math.sin(t))); }), true));
    sec.push(k.pathOf([at(polar(a, 36.6, T.z0)), at(polar(a, 36.6, T.z1))]) + k.pathOf([at(polar(a, 38.4, T.z0)), at(polar(a, 38.4, T.z1))]));
  }
  out.push(Ln(sec.join(""), { tone: "lo" }));
  out.push(D([150, 210, 270].map((a) => at(polar(a, C.R_IN - 6.5, R.z1))), { size: 0.5 }));
  return out.join("");
}

// The heap of corns waiting on the ring's back-left shoulder, packed in two layers against the bore.
export const HEAP = (() => {
  const list = [];
  const r0 = C.CORN_R, z0 = C.RING.z1 + r0;
  for (let a = 158; a <= 246; a += 11) list.push(polar(a, 38.5, z0));
  for (let a = 168; a <= 236; a += 12) list.push(polar(a, 33, z0 + 0.2));
  for (let a = 163; a <= 241; a += 11.5) list.push(polar(a, 37, z0 + 7.4));
  for (let a = 152; a <= 172; a += 10) list.push(polar(a, 40.5, z0 + 7.6));
  for (let a = 174; a <= 232; a += 11.5) list.push(polar(a, 38, z0 + 14.6));
  for (let a = 186; a <= 222; a += 12) list.push(polar(a, 39.5, z0 + 21.8));
  return list;
})();
// Pepper that missed the pile, scattered on the saucer inside the foot.
export const spill = () => `<g class="pg-dust">${D(Array.from({ length: 40 }, (_, i) => { const a = i * 2.39996, r = 30 + ((i * 7) % 12); return at(polar((a * 180) / Math.PI, r, C.Z0)); }), { size: 0.6, tone: "mid" })}</g>`;
export const heap = () => `<g class="pg-corn">${byDepth(HEAP.map((c) => [c, S(L.sphereOf(c, C.CORN_R, P, { steps: 20 }), { tone: "hi" })]))}</g>`;

// The spring yoke, keyed in the body so it never turns: hub, three arms, Roo's foot pad and the end nut under it.
export function yoke() {
  const Y = C.YOKE_Z, out = [];
  const hex = Array.from({ length: 6 }, (_, i) => [4.6 * Math.cos((i * Math.PI) / 3), 4.6 * Math.sin((i * Math.PI) / 3)]);
  out.push(S(k.extrude(hex, Y - 9.5, 4, P), { tone: "mid" }));
  out.push(S(k.cylinder(0, 0, 5.6, Y - 5.5, 0.8, P, 24), { tone: "hi" }));
  const arms = C.ARMS.map((a) => [polar(a, 20, Y), S(bar(a, 4, C.ARM_R, 3, Y - 2.6, 2.6), { tone: "mid" })]);
  out.push(byDepth(arms));
  out.push(S(k.cylinder(0, 0, 6.4, Y - 4.7, 4.7, P, 32, 0.4), { tone: "mid" }));
  out.push(D(C.ARMS.map((a) => at(polar(a, C.ARM_R - 3, Y))), { size: 0.5 }));
  const pad = [C.PLACE.roo.at[0], C.PLACE.roo.at[1], Y];
  out.push(S(k.cylinder(pad[0], pad[1], 5.2, Y, 0.8, P, 28), { tone: "lo" }));
  return out.join("");
}

// The thrust race under the cone (it doesn't turn; the cone runs on its balls), and the inner burr cone itself.
export const race = () => S(L.ringBand(0, C.RACE_H, C.RACE[0], C.RACE[1], up(C.CONE_Z - C.RACE_H), P), { tone: "mid" });
export const cone = () => S(L.solidOf(CONE, up(C.CONE_Z), P), { tone: "hi", crease: "lo" });

// The top bushing: a hub on two arms screwed to the bore, keeping the shaft upright.
export function bushing() {
  const out = [byDepth([180, 270].map((a) => [polar(a, 25, C.BUSH + 4), S(bar(a, 6, C.R_IN, 2.2, C.BUSH + 2, 3.6), { tone: "mid" })]))];
  out.push(D([180, 270].map((a) => at(polar(a, C.R_IN - 4, C.BUSH + 5.6))), { size: 0.5 }));
  out.push(S(k.cylinder(0, 0, 7, C.BUSH, 8, P, 32, 0.4), { tone: "mid" }));
  return out.join("");
}

// The near bands the window leaves: a sill at the foot and the collar under the head, each with two turned beads.
export function bandsFront() {
  const out = [];
  const band = (z0, z1, beads) => S(k.extrude(sector(C.R_IN, C.R_OUT, -45, 135), z0, z1 - z0, P, { convex: false }), { tone: "mid", inner: Ln(beads.map((z) => k.sideArc(0, 0, C.R_OUT, z, P, 64)).join(""), { tone: "faint" }) });
  out.push(band(C.Z0, C.WIN0, []));
  out.push(band(C.WIN1, C.TOP, [C.WIN1 + 5, C.WIN1 + 13]));
  return out.join("");
}

// The steel bearing ring and the turned head with its grip ribs (drawn live), then the knob and the shaft's tip.
export const HEAD = [[0, 57], [3, 57], [3, 56.4], [16, 55], [20, 52, 1], [24, 46, 1], [27, 36, 1], [29, 22, 1], [30, 12]];
export const KNOB = [[0, 11], [10, 11], [12, 9.5, 1], [14.5, 6, 1], [15.5, 3]];
export function head() {
  const out = [S(k.cylinder(0, 0, 57, C.TOP, C.HEAD_Z - C.TOP, P, 96), { tone: "hi", crease: "lo" })];
  out.push(S(L.solidOf(HEAD, up(C.HEAD_Z), P), { tone: "mid", inner: Ln(L.arcOf(up(C.HEAD_Z), 20, 52, P, { slope: -0.75 }) + L.arcOf(up(C.HEAD_Z), 27, 36, P, { slope: -3.3 }), { tone: "faint" }) }));
  return out.join("");
}
export function knob() {
  const t = k.radialTicks(0, 0, 16.6, 24, 6, C.KNOB_Z, [1.4, 2.6], P);
  return S(k.cylinder(0, 0, 17, C.HEAD_Z + 30, C.KNOB_Z - C.HEAD_Z - 30, P, 64, 0.4), { tone: "hi" }) + Ln(t.minor, { tone: "lo" }) + Ln(t.major, { tone: "mid" }) + D([0, 90, 180, 270].map((a) => at(polar(a + 45, 14.5, C.KNOB_Z))), { size: 0.5 }) + S(L.solidOf(KNOB, up(C.KNOB_Z), P), { tone: "hi", crease: "lo" });
}
export function tip() {
  const z = C.KNOB_Z + 15;
  return S(k.cylinder(0, 0, 2.3, z, 4, P, 20, 0.3), { tone: "hi" }) + Ln([1.2, 2.4].map((h) => k.sideArc(0, 0, 2.3, z + h, P, 12)).join(""), { tone: "lo" });
}
