import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D } from "./model.mjs";
import { rod, coinRail, holedSlab, screws, ringY, ringX } from "./helpers.mjs";

export const BASE = { x: -76, y: -62, w: 136, d: 106, r: 3 };
const up = [0, 0, 1];

export function base() {
  const out = [`<path class="iso-halo" d="${k.haloOf(BASE, -5, 6, P)}"/>`];
  for (const [x, y] of k.corners(BASE, 10).sort((a, b) => k.depthOf([...a, 0], P) - k.depthOf([...b, 0], P))) out.push(S(k.cylinder(x, y, 5, -5, 5, P, 24), { tone: "mid" }));
  out.push(S(k.slabOf(BASE, 0, C.FLOOR, P, 6, 1.2), { tone: "mid" }) + Ln(k.planOutline(k.insetPlan(BASE, 4), C.FLOOR, P, 6), { tone: "faint" }));
  out.push(screws(BASE, C.FLOOR, 2));
  // The maker's plate, with three rule lines for its engraving.
  const lp = { x: -66, y: 29, w: 30, d: 10, r: 1 };
  out.push(S(k.slabOf(lp, C.FLOOR, 0.8, P, 3, 0.3), { tone: "hi" }) + screws(lp, C.FLOOR + 0.8, 1.6));
  out.push(Ln([31.5, 34, 36.5].map((y, i) => k.lineOnTop([lp.x + 4, y], [lp.x + 4 + [20, 16, 12][i], y], C.FLOOR + 0.8, P)).join(""), { tone: "mid", free: true }));
  return out.join("");
}

// The feeder's stand, plate and hopper: the disc on top turns under the hopper and drops one token per pocket.
export const feederPosts = (front) => [[-56, -62], [18, -62], [-56, -18], [18, -18]]
  .filter(([, y]) => (y > -40) === front)
  .map(([x, y]) => S(k.slabOf({ x, y, w: 4, d: 4, r: 0.6 }, C.FLOOR, C.PLATE_Z - C.FLOOR, P, 2), { tone: "mid" }) + S(k.slabOf({ x: x - 1.5, y: y - 1.5, w: 7, d: 7, r: 0.8 }, C.FLOOR, 1.4, P, 2), { tone: "mid" })).join("");

export function feederPlate() {
  const out = [S(k.slabOf(C.PLATE, C.PLATE_Z, 4, P, 3, 0.6), { tone: "hi" })];
  out.push(screws(C.PLATE, C.PLATE_Z + 4, 2.4));
  out.push(Ln(k.lineOnTop([C.PLATE.x, -22], [-30, -22], C.PLATE_Z + 4, P) + k.lineOnTop([-30, -22], [-30, C.PLATE.y + C.PLATE.d], C.PLATE_Z + 4, P), { tone: "faint" }));
  const [fx, fy] = C.F, z = C.PLATE_Z + 4;
  out.push(S(k.cylinder(fx, fy, C.DISC_R, z, 4, P, 72, 0.6), { tone: "hi" }));
  return out.join("");
}

export function hopper() {
  const out = [];
  for (const x of [-9, 5]) out.push(S(k.slabOf({ x, y: -62, w: 4, d: 4, r: 0.5 }, C.PLATE_Z + 4, C.HOP_TOP - C.PLATE_Z - 4, P, 2), { tone: "mid" }));
  const H = C.HOP;
  out.push(S(k.slabOf(H, C.HOP_Z, C.HOP_TOP - C.HOP_Z, P, 3, 0.6), { tone: "hi", inner: Ln(k.sideSeam(H, C.HOP_Z + 5, P, 3), { tone: "faint" }) }));
  out.push(`<path class="tb-void" d="${k.planOutline(k.insetPlan(H, 1.4), C.HOP_TOP, P, 3)}"/>`);
  out.push(D([[H.x + H.w, H.y + 3, C.HOP_TOP - 3], [H.x + H.w, H.y + H.d - 3, C.HOP_TOP - 3], [H.x + 3, H.y + H.d, C.HOP_TOP - 3], [H.x + H.w - 3, H.y + H.d, C.HOP_TOP - 3]].map(at), { size: 0.5 }));
  // The heap of tokens waiting in the hopper, clipped to its mouth.
  const inner = k.insetPlan(H, 1.4);
  const heap = [[-4, -52, 0], [3.5, -50, 0.8], [-2, -45, 1.6], [4.5, -44, 0.4], [0, -48.5, 2.6]]
    .map(([x, y, dz]) => `<g class="tb-token">${S(k.cylinder(x, y, C.TR, C.HOP_TOP - 4 + dz, C.TH, P, 36, 0.3), { tone: "hi" })}</g>`).join("");
  out.push(`<defs><clipPath id="tb-mouth"><path d="${k.planOutline(inner, C.HOP_TOP, P, 3)}"/></clipPath></defs><g clip-path="url(#tb-mouth)">${heap}</g>`);
  return out.join("");
}

// The crank's shaft and bearing, and the pinion that turns the disc's crown teeth.
export const shaftFar = () => S(rod([C.SHAFT.x0 + 1, C.SHAFT.y, C.SHAFT.z], [1, 0, 0], 1.2, 0, 7), { tone: "hi" });
export function bearing() {
  const b = { x: -28, y: C.SHAFT.y - 3, w: 4, d: 6, r: 0.6 };
  return S(k.slabOf(b, C.PLATE_Z + 4, C.SHAFT.z + 3 - C.PLATE_Z - 4, P, 2, 0.3), { tone: "mid" }) + D([at([-24, C.SHAFT.y, C.SHAFT.z])], { size: 0.9, tone: "hi" })
    + S(rod([-24, C.SHAFT.y, C.SHAFT.z], [1, 0, 0], 1.2, 0, 1.2), { tone: "hi" }) + D([at([-26, C.SHAFT.y + 3, C.PLATE_Z + 6]), at([-26, C.SHAFT.y + 3, C.SHAFT.z + 1.5])], { size: 0.45 });
}
export const pinionBody = () => S(rod([C.SHAFT.x1 - 6, C.SHAFT.y, C.SHAFT.z], [1, 0, 0], C.PIN_R, 0, 6, 24), { tone: "hi", crease: "none" });

// The slideway: a bed with two rails; the coin slide runs between them under the tube.
export function bed() {
  const B = C.BED, top = C.ZB;
  // An inspection cover on the front, held by four screws, and louvres on the end.
  const cover = ringY(B.y + B.d, B.x + 22, B.x + B.w - 6, C.FLOOR + 4, top - 9, 1.2);
  const louvres = [0, 1, 2, 3].map((i) => ringX(B.x + B.w, B.y + 6 + i * 4.2, B.y + 8.4 + i * 4.2, C.FLOOR + 5, top - 10, 1)).join("");
  return S(k.slabOf(B, C.FLOOR, top - C.FLOOR, P, 3, 0.6), { tone: "mid", inner: Ln(k.sideSeam(B, top - 6, P, 3), { tone: "faint" }) })
    + Ln(cover, { tone: "faint" }) + Ln(louvres, { tone: "lo" })
    + D([[B.x + 24, B.y + B.d, C.FLOOR + 6], [B.x + B.w - 8, B.y + B.d, C.FLOOR + 6], [B.x + 24, B.y + B.d, top - 11], [B.x + B.w - 8, B.y + B.d, top - 11]].map(at), { size: 0.5 });
}
export const rail = (front) => {
  const p = { x: C.BED.x, y: front ? 10 : -13, w: C.BED.w, d: 3, r: 0.4 };
  return S(k.slabOf(p, C.ZB, C.TH, P, 2, 0.3), { tone: "hi" }) + D([-20, -8, 4].map((x) => at([x, p.y + 1.5, C.ZB + C.TH])), { size: 0.45 });
};

// The walkway Pip pushes from.
export function deck() {
  const Dk = C.DECK, z = C.DECK_Z, treads = [];
  for (let x = Dk.x + 5; x < Dk.x + Dk.w - 2; x += 5) treads.push(k.lineOnTop([x, Dk.y], [x, Dk.y + Dk.d], z, P));
  return S(k.slabOf(Dk, C.FLOOR, z - C.FLOOR, P, 3, 0.5), { tone: "mid", inner: Ln(k.sideSeam(Dk, z - 3, P, 3), { tone: "faint" }) }) + Ln(treads.join(""), { tone: "faint" })
    + D([-66, -50, -34, -18].map((x) => at([x, Dk.y + Dk.d, z - 6])), { size: 0.5 });
}

// The tube: a collar on the rails, four guide rods and the bridge plate the chutes run onto.
export const collar = () => S(L.ringBand(0, 1.4, C.TR + 0.6, 10.6, L.frameAlong([0, 0, C.ZB + C.TH], up), P), { tone: "hi" });
const RODS = [35, 145, 215, 325].map((d) => [C.ROD_R * Math.cos((d * Math.PI) / 180), C.ROD_R * Math.sin((d * Math.PI) / 180)]);
export const rods = (front) => RODS.filter(([x, y]) => (x + y > 0) === front)
  .map(([x, y]) => S(k.cylinder(x, y, 0.9, C.ZB + C.TH + 1.4, C.ROD_TOP - C.ZB - C.TH - 1.4, P, 12), { tone: "hi" })).join("");
export const bridge = () => holedSlab({ x: -9.6, y: -9.6, w: 19.2, d: 19.2, r: 1.6 }, C.ROD_TOP, 1.4, [0, 0, C.TR + 0.6]) + screws({ x: -9.6, y: -9.6, w: 19.2, d: 19.2 }, C.ROD_TOP + 1.4, 1.6);

// The scale beside the tube: a tick at every token's height, the long one at the capacity.
export function ruler() {
  const p = { x: 8, y: -13, w: 3, d: 3, r: 0.3 }, z0 = C.ZB + C.TH, z1 = C.ROD_TOP + 3;
  const ticks = [];
  for (let i = 2; i <= C.CAP; i++) ticks.push(k.segment([11, -10, C.ZB + i * C.TH], [11, i === C.CAP ? -12.4 : -11.3, C.ZB + i * C.TH], P));
  return S(k.slabOf(p, z0, z1 - z0, P, 2), { tone: "mid" }) + Ln(ticks.join(""), { tone: "hi" });
}

export const feedChute = () => coinRail(C.FEED.a, C.FEED.b, 9, { ties: 2 });
export function overChute() {
  const b = C.OVER.b;
  return S(rod([b[0], b[1] - 3, C.FLOOR], up, 0.9, 0, b[2] + 3.6 - C.FLOOR), { tone: "mid" }) + coinRail(C.OVER.a, b, 9);
}
