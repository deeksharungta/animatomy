// The cast-iron bedplate and everything fixed to it: the comb bed, the barrel's pillar and cock, the cylinder's two
// bridges, the governor's bearing post, pillar and cock with its endstone, and the start lever's guide.
import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, ZB, toothX } from "./model.mjs";
import { LENGTH } from "./tune.mjs";

const S = (paths, style) => k.solidSvg(paths, style);
const Ln = (d, style) => k.lineSvg(d, style);
const D = (pts, style) => k.dotsSvg(pts, style);
const alongX = (x, y, z) => L.frameOf([x, y, z], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
const up = (x, y, z) => L.frameOf([x, y, z], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
const M = C.COMB;

// The comb's outline in plan: a straight back edge and a front edge along the teeth's roots (convex, so one prism).
export function combPlan(inset = 0) {
  const x1 = M.x0 + M.n * M.pitch + 0.7, root = (i) => M.tipY + LENGTH[i >> 1] + inset;
  const pts = [[M.x0 + inset, M.back - inset], [x1 - inset, M.back - inset], [x1 - inset, root(M.n - 1)]];
  for (let i = M.n - 1; i >= 0; i--) pts.push([toothX(i), root(i)]);
  pts.push([M.x0 + inset, root(0) + (root(0) - root(1)) * 0.5]);
  return pts;
}

export function bedplate() {
  const B = C.BED, out = [`<path class="iso-halo" d="${k.haloOf(k.insetPlan(B, -3), C.CASE_FLOOR, 1, P)}"/>`];
  out.push(S(k.slabOf(B, C.CASE_FLOOR, ZB - C.CASE_FLOOR, P, 5, 0.8), { tone: "lo", inner: Ln(k.sideSeam(B, ZB - 2.5, P, 5), { tone: "faint" }) }));
  out.push(Ln(k.planOutline(k.insetPlan(B, 4), ZB, P, 5), { tone: "faint" }));
  // Eight screws into the case floor, each in a counterbore ring.
  const scr = [[-144, -30], [-60, -30], [40, -30], [122, -30], [-144, 70], [-90, 72], [60, 70], [122, 70]];
  out.push(Ln(scr.map(([x, y]) => k.ring(x, y, 1.6, ZB, P, 16)).join(""), { tone: "faint" }) + D(scr.map(([x, y]) => at([x, y, ZB])), { size: 0.55 }));
  // The maker's plate on the bedplate's front left: a thin brass-free plate, its rules and two rivets.
  const np = { x: -140, y: 38, w: 44, d: 26, r: 2 };
  out.push(S(k.slabOf(np, ZB, 0.8, P, 3, 0.3), { tone: "hi", crease: "faint" }));
  out.push(Ln(k.planOutline(k.insetPlan(np, 2.4), ZB + 0.8, P, 3), { tone: "faint" }));
  out.push(Ln([[44, 46], [50, 52], [56, 52]].map(([y, x1], i) => k.lineOnTop([np.x + 8 + i * 4, y], [np.x + x1 - 16 + (i === 0 ? 8 : 0), y], ZB + 0.8, P)).join(""), { tone: "mid", free: true }));
  out.push(D([[np.x + 5, np.y + np.d / 2], [np.x + np.w - 5, np.y + np.d / 2]].map(([x, y]) => at([x, y, ZB + 0.8])), { size: 0.55 }));
  return out.join("");
}

// The comb bed: a boss cast up from the bedplate under the comb's base, with two ribs and the maker's plate.
export function combBed() {
  const out = [], z1 = M.z - M.base, plan = combPlan(1.2);
  out.push(S(k.extrude(plan, ZB, z1 - ZB, P), { tone: "mid", crease: "lo" }));
  const yb = M.back - 1.2, xa = M.x0 + 1.2, xb = M.x0 + M.n * M.pitch + 0.7 - 1.2;
  // A recessed panel cast into the bed's face, a fillet line along its foot, and the screws that hold it down.
  out.push(Ln(k.pathOf([[xa + 5, yb, ZB + 4], [xb - 5, yb, ZB + 4], [xb - 5, yb, z1 - 4], [xa + 5, yb, z1 - 4]].map(at), true), { tone: "lo" }));
  out.push(Ln(k.pathOf([[xa, yb, ZB + 1.6], [xb, yb, ZB + 1.6], [xb, M.tipY + LENGTH[LENGTH.length - 1] + 1.2, ZB + 1.6]].map(at)), { tone: "faint" }));
  out.push(D([[xa + 2.4, yb, ZB + 1.6], [xb - 2.4, yb, ZB + 1.6], [xa + 2.4, yb, z1 - 2.4], [xb - 2.4, yb, z1 - 2.4]].map(at), { size: 0.55 }));
  const pl = { x: -30, w: 22 };
  out.push(S(k.slabOf({ x: pl.x, y: yb, w: pl.w, d: 0.8, r: 0.3 }, 25, 10, P, 2), { tone: "hi", crease: "faint" }));
  out.push(Ln([31, 28.5].map((z, i) => k.segment([pl.x + 4, yb + 0.8, z], [pl.x + pl.w - 4 - i * 5, yb + 0.8, z], P)).join(""), { tone: "mid", free: true }));
  out.push(D([[pl.x + 1.8, yb + 0.8, 30], [pl.x + pl.w - 1.8, yb + 0.8, 30]].map(at), { size: 0.4 }));
  return out.join("");
}

// The barrel's pillar at its left and the cock that reaches over to carry the arbor's top and the click.
export function barrelPillar() {
  const Ck = C.COCK, out = [];
  out.push(S(k.slabOf({ x: Ck.x0 - 2, y: -7, w: Ck.w + 4, d: 14, r: 1 }, ZB, 3, P, 3, 0.4), { tone: "mid" }));
  out.push(S(k.slabOf({ x: Ck.x0, y: -4.5, w: Ck.w, d: 9, r: 1 }, ZB, Ck.z - ZB, P, 3, 0.4), { tone: "mid" }));
  out.push(D([[Ck.x0 - 0.5, -5.5], [Ck.x0 - 0.5, 5.5]].map(([x, y]) => at([x, y, ZB + 3])), { size: 0.45 }));
  return out.join("");
}
export function barrelCock() {
  const Ck = C.COCK, Bz = C.BARREL, out = [];
  const plan = { x: Ck.x0, y: -4.5, w: Bz.x + 8 - Ck.x0, d: 9, r: 4 };
  out.push(S(k.slabOf(plan, Ck.z, Ck.h, P, 4, 0.5), { tone: "hi", crease: "lo", inner: Ln(k.sideSeam(plan, Ck.z + 1.5, P, 4), { tone: "faint" }) }));
  out.push(D([[Ck.x0 + 3, -2], [Ck.x0 + 3, 2]].map(([x, y]) => at([x, y, Ck.z + Ck.h])), { size: 0.55 }));
  // The click's pivot screw and the click spring's stud, on the cock's top.
  out.push(S(k.cylinder(Bz.x - 13, 2, 1.6, Ck.z + Ck.h, 0.8, P, 16), { tone: "mid" }) + D([at([Bz.x - 13, 2, Ck.z + Ck.h + 0.8])], { size: 0.4 }));
  return out.join("");
}

// The cylinder's left bridge, beside the pinion, with its bearing cap and two screws.
export function bridgeLeft() {
  const B = C.POSTL, out = [], top = C.CYL.z + 5;
  out.push(S(k.slabOf({ x: B.x - 3, y: -10, w: B.w + 6, d: 20, r: 1 }, ZB, 3, P, 3, 0.4), { tone: "mid" }));
  out.push(D([[B.x - 1.5, -8], [B.x - 1.5, 8], [B.x + B.w + 1.5, -8], [B.x + B.w + 1.5, 8]].map(([x, y]) => at([x, y, ZB + 3])), { size: 0.45 }));
  out.push(S(k.slabOf({ x: B.x, y: -6, w: B.w, d: 12, r: 1 }, ZB, top - ZB, P, 3, 0.4), { tone: "mid" }));
  out.push(S(k.slabOf({ x: B.x - 0.6, y: -7, w: B.w + 1.2, d: 14, r: 1.2 }, top, 3, P, 3, 0.4), { tone: "hi", inner: Ln(k.sideSeam({ x: B.x - 0.6, y: -7, w: B.w + 1.2, d: 14, r: 1.2 }, top + 1, P, 3), { tone: "faint" }) }));
  out.push(D([[B.x + B.w / 2, -4.6], [B.x + B.w / 2, 4.6]].map(([x, y]) => at([x, y, top + 3])), { size: 0.5 }));
  out.push(S(L.disc(0, 1.2, 4, alongX(B.x + B.w, 0, C.CYL.z), P), { tone: "hi" }));
  return out.join("");
}

// The right bridge carries the cylinder's arbor and the intermediate arbor; the post beyond carries its far end.
export function bridgeRight() {
  const B = C.POSTR, Mi = C.MID, out = [], top = C.CYL.z + 5;
  out.push(S(k.slabOf({ x: B.x - 3, y: -36, w: B.w + 6, d: 46, r: 1 }, ZB, 3, P, 3, 0.4), { tone: "mid" }));
  out.push(S(k.extrude([[B.x, -32], [B.x + B.w, -32], [B.x + B.w, 6], [B.x, 6]], ZB, Mi.z + 5 - ZB, P), { tone: "mid", crease: "lo" }));
  out.push(S(k.slabOf({ x: B.x, y: -6, w: B.w, d: 12, r: 1 }, Mi.z + 5, top - Mi.z - 5, P, 3, 0.4), { tone: "mid" }));
  out.push(S(k.slabOf({ x: B.x - 0.6, y: -7, w: B.w + 1.2, d: 14, r: 1.2 }, top, 3, P, 3, 0.4), { tone: "hi" }));
  out.push(D([[B.x + B.w / 2, -4.6], [B.x + B.w / 2, 4.6]].map(([x, y]) => at([x, y, top + 3])), { size: 0.5 }));
  out.push(D([[B.x - 1.5, -34], [B.x - 1.5, 8], [B.x + B.w + 1.5, -34], [B.x + B.w + 1.5, 8]].map(([x, y]) => at([x, y, ZB + 3])), { size: 0.45 }));
  for (const [y, z] of [[0, C.CYL.z], [Mi.y, Mi.z]]) out.push(S(L.disc(0, 1.2, 3.6, alongX(B.x + B.w, y, z), P), { tone: "hi" }));
  return out.join("");
}
export function postMid() {
  const B = C.POSTM, Mi = C.MID, out = [];
  out.push(S(k.slabOf({ x: B.x - 2, y: Mi.y - 8, w: B.w + 4, d: 16, r: 1 }, ZB, 2.4, P, 3, 0.4), { tone: "mid" }));
  out.push(S(k.slabOf({ x: B.x, y: Mi.y - 5, w: B.w, d: 10, r: 1 }, ZB, Mi.z + 5 - ZB, P, 3, 0.4), { tone: "mid" }));
  out.push(S(L.disc(0, 1.2, 3.4, alongX(B.x + B.w, Mi.y, Mi.z), P), { tone: "hi" }));
  return out.join("");
}

// The governor: the endless screw's foot pivot, the pillar, the cock over the screw and its endstone.
export function govFoot() {
  const W = C.WORM;
  return S(k.cylinder(W.x, W.y, 4, ZB, 3, P, 20, 0.3), { tone: "mid" }) + S(k.cylinder(W.x, W.y, 1.6, ZB + 3, 3, P, 16), { tone: "hi" });
}
export function govPillar() {
  const G = C.GOV, out = [];
  out.push(S(k.slabOf({ x: G.x, y: G.y - 2, w: G.w + 2, d: G.d + 4, r: 1 }, ZB, 3, P, 3, 0.4), { tone: "mid" }));
  const pp = { x: G.x + 2, y: G.y, w: G.w - 2, d: G.d, r: 1 };
  out.push(S(k.slabOf(pp, ZB, G.z - ZB, P, 3, 0.4), { tone: "mid", inner: Ln(k.sideSeam(pp, ZB + 8, P, 3) + k.sideSeam(pp, G.z - 6, P, 3), { tone: "faint" }) }));
  out.push(D([[G.x + G.w, G.y + G.d / 2, G.z - 3], [G.x + G.w, G.y + G.d / 2, ZB + 11]].map(at), { size: 0.5 }));
  out.push(D([[G.x + 1, G.y - 1], [G.x + G.w + 1, G.y + G.d + 1]].map(([x, y]) => at([x, y, ZB + 3])), { size: 0.45 }));
  return out.join("");
}
export function govCock() {
  const G = C.GOV, W = C.WORM, out = [], z = G.z + G.h;
  const plan = { x: W.x - 6, y: G.y, w: G.x + G.w - (W.x - 6), d: G.d, r: 4 };
  out.push(S(k.slabOf(plan, G.z, G.h, P, 4, 0.5), { tone: "hi", crease: "lo", inner: Ln(k.sideSeam(plan, G.z + 1.5, P, 4), { tone: "faint" }) }));
  out.push(D([[G.x + G.w - 3, G.y + 3], [G.x + G.w - 3, G.y + G.d - 3]].map(([x, y]) => at([x, y, z])), { size: 0.5 }));
  out.push(S(k.cylinder(W.x, W.y, 3.6, z, 1, P, 20, 0.3), { tone: "mid" }) + D([[W.x - 2.6, W.y], [W.x + 2.6, W.y]].map(([x, y]) => at([x, y, z + 1])), { size: 0.4 }));
  return out.join("");
}

// The control plate at the bedplate's right: two slots, the start lever's (it tips, in moving.mjs) and the
// change lever's, which stands at Repeat; the pivot pins under the plate show at its ends.
export function leverPlate() {
  const V = C.LEVER, out = [], pl = { x: V.x - 8, y: V.y - 14, w: V.gap + 16, d: 28, r: 2 }, z = V.z;
  out.push(S(k.slabOf({ ...pl, x: pl.x + 2, w: pl.w - 4, y: pl.y + 3, d: pl.d - 6 }, ZB, z - ZB - 1.5, P, 3), { tone: "mid" }));
  out.push(S(k.slabOf(pl, z - 1.5, 1.5, P, 3, 0.4), { tone: "hi", crease: "lo" }));
  for (const x of [V.x, V.x + V.gap]) out.push(`<path class="mb-void" d="${k.pathOf([[x - 1.6, V.y - 9], [x + 1.6, V.y - 9], [x + 1.6, V.y + 9], [x - 1.6, V.y + 9]].map(([a, b]) => at([a, b, z])), true)}"/>`);
  out.push(D([[pl.x + 2.4, pl.y + 2.4], [pl.x + pl.w - 2.4, pl.y + 2.4], [pl.x + 2.4, pl.y + pl.d - 2.4], [pl.x + pl.w - 2.4, pl.y + pl.d - 2.4]].map(([x, y]) => at([x, y, z])), { size: 0.5 }));
  out.push(D([[V.x - 4, V.y - 8], [V.x - 4, V.y + 8]].map(([x, y]) => at([x, y, z])), { size: 0.75, tone: "mid" }));
  return out.join("");
}
export function changeLever() {
  const V = C.LEVER, x = V.x + V.gap, t = 10 * Math.PI / 180, top = [x, V.y + Math.sin(t) * 22, V.z + Math.cos(t) * 22];
  const F = L.frameOf([x, V.y, V.z], [0, Math.sin(t), Math.cos(t)], [1, 0, 0], [0, Math.cos(t), -Math.sin(t)]);
  return S(L.prismOf(F, [[-1, -1], [1, -1], [1, 1], [-1, 1]], 0, 22, P), { tone: "hi", crease: "lo" }) + S(L.sphereOf([top[0], top[1] + 2.4 * Math.sin(t), top[2] + 2.4 * Math.cos(t)], 2.8, P), { tone: "hi" });
}
export { alongX, up };
