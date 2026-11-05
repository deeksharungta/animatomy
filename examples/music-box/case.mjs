// The wooden case, its front and right walls cut down to a lip so the movement shows: plinth, floor, back and left
// walls with their lining panels, the lid open on two hinges with its stay and the tune card inside it, and the
// cut lips with an inlay band and the lock's escutcheon.
import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, rad } from "./model.mjs";

const S = (paths, style) => k.solidSvg(paths, style);
const Ln = (d, style) => k.lineSvg(d, style);
const D = (pts, style) => k.dotsSvg(pts, style);
const B = C.CASE, T = C.CASE_T, X0 = B.x, X1 = B.x + B.w, Y0 = B.y, Y1 = B.y + B.d, ZT = C.CASE_TOP, ZF = C.CASE_FLOOR;
const OPEN = rad(106), LID = { d: B.d, t: 9 };
const lidU = [0, Math.cos(OPEN), Math.sin(OPEN)], lidV = [0, -Math.sin(OPEN), Math.cos(OPEN)];
const LF = L.frameOf([X0, Y0, ZT], [1, 0, 0], lidU, lidV);
const onLid = (x, u, v = 0) => [x, Y0 + lidU[1] * u + lidV[1] * v, ZT + lidU[2] * u + lidV[2] * v];
const rect = (pts) => k.pathOf(pts.map(at), true);

// The lid, open past upright against its stay: behind everything else in the case.
export function lid() {
  const out = [];
  out.push(S(L.prismOf(LF, [[0, 0], [LID.d, 0], [LID.d, LID.t], [0, LID.t]], 0, B.w, P), { tone: "mid", crease: "lo" }));
  // Inside the lid: a moulded border and the tune card, with its title and six tune lines.
  out.push(Ln(rect([onLid(X0 + 8, 8), onLid(X1 - 8, 8), onLid(X1 - 8, LID.d - 8), onLid(X0 + 8, LID.d - 8)]), { tone: "lo" }));
  const c0 = X0 + 92, c1 = X1 - 92, u0 = 36, u1 = 132;
  out.push(S(L.prismOf(LF, [[u0, -0.6], [u1, -0.6], [u1, 0], [u0, 0]], c0 - X0, c1 - X0, P), { tone: "hi", crease: "faint" }));
  out.push(Ln(rect([onLid(c0 + 5, u0 + 5, -0.6), onLid(c1 - 5, u0 + 5, -0.6), onLid(c1 - 5, u1 - 5, -0.6), onLid(c0 + 5, u1 - 5, -0.6)]), { tone: "faint" }));
  const rules = [k.segment(onLid(c0 + 40, u1 - 16, -0.6), onLid(c1 - 40, u1 - 16, -0.6), P)];
  for (let i = 0; i < 6; i++) { const u = u1 - 30 - i * 12; rules.push(k.segment(onLid(c0 + 16, u, -0.6), onLid(c0 + 70 + (i % 3) * 8, u, -0.6), P), k.segment(onLid(c1 - 34, u, -0.6), onLid(c1 - 16, u, -0.6), P)); }
  out.push(Ln(rules.join(""), { tone: "mid", free: true }));
  out.push(D([onLid(c0 + 8, u1 - 8, -0.6), onLid(c1 - 8, u1 - 8, -0.6), onLid(c0 + 8, u0 + 8, -0.6), onLid(c1 - 8, u0 + 8, -0.6)].map(at), { size: 0.5 }));
  // Hinges on the back edge: knuckles along x, and their screws on the lid.
  for (const x of [X0 + 40, X1 - 40]) {
    out.push(S(L.disc(-10, 10, 2.2, L.frameOf([x, Y0, ZT], [1, 0, 0], [0, 1, 0], [0, 0, 1]), P), { tone: "hi", crease: "lo" }));
    out.push(D([onLid(x - 6, 5, -0.2), onLid(x + 6, 5, -0.2)].map(at), { size: 0.5 }));
  }
  return out.join("");
}

// Plinth, floor and the two full walls, seen from inside.
export function caseBack() {
  const out = [`<path class="iso-halo" d="${k.haloOf(k.insetPlan(B, -5), 0, 1, P)}"/>`];
  out.push(S(k.slabOf(k.insetPlan(B, -2), 0, 5, P, 3, 0.6), { tone: "lo", inner: Ln(k.sideSeam(k.insetPlan(B, -2), 2.5, P, 3), { tone: "faint" }) }));
  out.push(S(k.slabOf({ x: X0 + T, y: Y0 + T, w: B.w - T, d: B.d - T, r: 1 }, 5, ZF - 5, P, 2), { tone: "mid" }));
  out.push(S(k.slabOf({ x: X0, y: Y0, w: B.w, d: T, r: 0.3 }, 5, ZT - 5, P, 2, 0.5), { tone: "mid" }));
  out.push(S(k.slabOf({ x: X0, y: Y0 + T, w: T, d: B.d - T, r: 0.3 }, 5, ZT - 5, P, 2, 0.5), { tone: "mid" }));
  // Lining panels on the inside faces, and the stay's bracket screwed to the left wall.
  const yi = Y0 + T, xi = X0 + T;
  // Wood grain on the inside faces, running the length of each board and turning the inside corner.
  const grain = [14, 19, 26, 31, 39, 44, 52, 57, 63, 70, 76].map((z) => k.pathOf([[X1, Y0, z], [X1, yi, z], [xi, yi, z], [xi, Y1, z], [X0, Y1, z]].map(at)));
  out.push(Ln(grain.join(""), { tone: "faint" }));
  out.push(S(k.slabOf({ x: xi, y: yi + 14, w: 2, d: 10, r: 0.4 }, ZT - 16, 10, P, 2), { tone: "hi" }));
  out.push(D([at([xi + 2, yi + 17, ZT - 9]), at([xi + 2, yi + 21, ZT - 9])], { size: 0.45 }));
  const stay0 = [xi + 2, yi + 19, ZT - 11], stay1 = onLid(xi + 1, 70, 0);
  out.push(k.wireSvg(at(stay0), at(stay1), { tone: "mid", size: 0.7 }));
  // Corner screws in the floor.
  out.push(D([[xi + 5, yi + 5], [X1 - 5, yi + 5], [xi + 5, Y1 - 5], [X1 - 5, Y1 - 5]].map(([x, y]) => at([x, y, ZF])), { size: 0.5 }));
  return out.join("");
}

// The cut-down right wall: a lip with its section top, behind the start lever.
export const rightLip = () => S(k.slabOf({ x: X1 - T, y: Y0 + T, w: T, d: B.d - 2 * T, r: 0.6 }, 5, C.LIP - 5, P, 2, 0.4), { tone: "mid" });

// The cut-down front wall, the inlay band round both lips and the lock's escutcheon.
export function frontLip() {
  const out = [], z = C.LIP;
  out.push(S(k.slabOf({ x: X0 + T, y: Y1 - T, w: B.w - T, d: T, r: 0.6 }, 5, z - 5, P, 2, 0.4), { tone: "mid" }));
  const band = [[X0 + T, Y1, 13], [X1, Y1, 13], [X1, Y0 + T, 13]], band2 = band.map(([x, y]) => [x, y, 16]);
  out.push(Ln(k.pathOf(band.map(at)) + k.pathOf(band2.map(at)), { tone: "faint" }));
  out.push(Ln(k.segment([X0 + T, Y1, 13], [X0 + T, Y1, 16], P) + k.segment([X1, Y0 + T, 13], [X1, Y0 + T, 16], P), { tone: "faint" }));
  const e = (dx, dz) => [-12 + dx, Y1 + 0.1, 11 + dz];
  out.push(Ln(k.pathOf(Array.from({ length: 24 }, (_, i) => { const t = (i / 24) * Math.PI * 2; return at(e(4 * Math.cos(t), 6 * Math.sin(t))); }), true), { tone: "lo" }));
  out.push(Ln(k.segment(e(0, 1.5), e(0, -2.5), P), { tone: "mid" }) + D([at(e(0, 1.6)), at(e(0, -2.5))], { size: 0.55, tone: "mid" }));
  return out.join("");
}
export const LID_EDGE = () => [onLid(X0, LID.d, 0), onLid(X1, LID.d, LID.t)];
