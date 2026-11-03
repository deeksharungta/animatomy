import * as k from "../../kit/iso-kit.mjs";
import * as G from "../../kit/lathe.mjs";
import { C, P, K, L, at, S, Ln, Dt } from "./model.mjs";
import { tools } from "./tools.mjs";

// The magnetic stand: a switchable magnetic base, a post, a swivel clamp, an arm, a fine-adjust knuckle
// and the clevis that holds the indicator by the lug on its back.
const T = tools(K, P, { O: C.O, U: C.U, N: C.N });
const M = C.MAG, [px, py] = C.POST;
const up = (x, y, z) => G.frameOf([x, y, z], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
const CLAMP_Z = 250, POST_TOP = 310;
export const ARM = { from: [px + 10, py + 6, CLAMP_Z], knuckle: L(0, 56, -72), clevis: L(0, 9, -54) };

export function magBase() {
  const out = [`<path class="iso-halo" d="${k.haloOf(M, 0, 12, P)}"/>`];
  out.push(S(k.slabOf(M, 0, M.h, P, 3, 1.2), { tone: "mid", inner: Ln(k.sideSeam(M, 6, P, 3) + k.sideSeam(M, M.h - 9, P, 3), { tone: "faint" }) }));
  out.push(Dt([[M.x + 8, 16], [M.x + 8, M.h - 16], [M.x + M.w - 8, 16], [M.x + M.w - 8, M.h - 16]].map(([x, z]) => at([x, M.y + M.d, z])), { size: 0.55 }));
  // The brass strip that splits the base into two poles, proud of each face.
  const mx = M.x + M.w / 2;
  out.push(S(k.slabOf({ x: mx - 4, y: M.y - 0.8, w: 8, d: M.d + 1.6, r: 0.4 }, 0, M.h, P, 2), { tone: "hi", crease: "lo" }));
  out.push(Ln(k.planOutline(k.insetPlan(M, 5), M.h, P, 3), { tone: "faint" }));
  out.push(Dt([[M.x + 8, M.y + 8], [M.x + M.w - 8, M.y + 8], [M.x + 8, M.y + M.d - 8], [M.x + M.w - 8, M.y + M.d - 8]].map(([x, y]) => at([x, y, M.h])), { size: 0.55 }));
  // ON/OFF knob on the near face: a knurled disc with a pointer bar, and its two marks.
  const ky = M.y + M.d, kx = M.x + 28, kz = 54;
  const F = G.frameOf([kx, ky, kz], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  out.push(S(G.disc(0, 1.6, 24, F, P), { tone: "mid" }), Ln(G.circleOf(F, 1.6, 21, P, 64), { tone: "faint" }));
  out.push(S(G.disc(1.6, 3, 17, F, P), { tone: "lo" }));
  out.push(S(G.disc(3, 11, 14, F, P), { tone: "mid" }), K.fadedSvg(G.ribsOf(F, 3, 11, 14, 48, P, { fade: [0.1, 0.55] }), { tone: "lo" }));
  out.push(S(T.barAB([kx - 10, ky + 11, kz - 7], [kx + 10, ky + 11, kz + 7], [0, 1, 0], 4.4, 3.2), { tone: "hi" }));
  out.push(Dt([at([kx - 15, ky + 1.6, kz + 15]), at([kx + 15, ky + 1.6, kz + 15])], { size: 0.9, tone: "mid" }));
  // Threaded boss, hex nut and the post.
  out.push(S(k.cylinder(px, py, 14, M.h, 6, P, 36, 0.5), { tone: "mid" }));
  out.push(S(G.prismOf(up(px, py, M.h + 6), [0, 1, 2, 3, 4, 5].map((i) => [11 * Math.cos((i / 6) * 6.283 + 0.3), 11 * Math.sin((i / 6) * 6.283 + 0.3)]), 0, 7, P), { tone: "mid" }));
  out.push(S(k.cylinder(px, py, 6, M.h + 13, CLAMP_Z - 12 - M.h - 13, P, 28), { tone: "hi", crease: "none", inner: Ln(k.sideArc(px, py, 6, 160, P, 20), { tone: "faint" }) }));
  return out.join("");
}

export function postTop() {
  const out = [];
  // Swivel clamp: a block on the post, cross-drilled for the arm, with a knurled lock knob.
  out.push(S(k.slabOf({ x: px - 12, y: py - 12, w: 24, d: 24, r: 3 }, CLAMP_Z - 12, 24, P, 3, 0.6), { tone: "mid", inner: Ln(k.sideSeam({ x: px - 12, y: py - 12, w: 24, d: 24, r: 3 }, CLAMP_Z, P, 3), { tone: "faint" }) }));
  out.push(Dt([at([px - 7, py - 7, CLAMP_Z + 12]), at([px + 7, py + 7, CLAMP_Z + 12])], { size: 0.5 }));
  out.push(S(k.cylinder(px, py, 6, CLAMP_Z + 12, POST_TOP - CLAMP_Z - 12, P, 28), { tone: "hi", crease: "none" }));
  out.push(S(k.cylinder(px, py, 7, POST_TOP, 3, P, 28, 0.4), { tone: "mid" }));
  const kF = G.frameOf([px - 12, py + 2, CLAMP_Z + 2], [-1, 0, 0], [0, 1, 0], [0, 0, 1]);
  out.push(S(G.disc(0, 4, 3, kF, P), { tone: "mid" }), S(G.disc(4, 12, 8, kF, P), { tone: "mid" }), K.fadedSvg(G.ribsOf(kF, 4, 12, 8, 32, P, { fade: [0.1, 0.55] }), { tone: "lo" }));
  return out.join("");
}

export function arm() {
  const out = [];
  const { from, knuckle, clevis } = ARM;
  out.push(S(T.rodAB(from, knuckle, 4, 18), { tone: "hi", crease: "none" }));
  out.push(S(T.ball(knuckle, 8), { tone: "mid" }));
  // The fine-adjust screw on top of the knuckle.
  const fF = up(knuckle[0], knuckle[1], knuckle[2] + 6);
  out.push(S(G.disc(0, 6, 2.4, fF, P), { tone: "mid" }), S(G.disc(6, 14, 6, fF, P), { tone: "mid" }), K.fadedSvg(G.ribsOf(fF, 6, 14, 6, 28, P, { fade: [0.1, 0.55] }), { tone: "lo" }));
  out.push(S(T.rodAB([knuckle[0], knuckle[1], knuckle[2] - 4], clevis, 3, 14), { tone: "hi", crease: "none" }));
  return out.join("");
}

// The clevis round the lug: a cheek each side, the bolt through the lug and a knurled nut on the near side.
export function clevis(side) {
  const out = [];
  const x = side > 0 ? 4 : -6;
  out.push(S(T.boxL(x, x + 2, -2, 16, -62, -46), { tone: "mid" }));
  if (side < 0) {
    const F = G.frameOf(L(-6, 2, -54), C.U.map((v) => -v), [0, 0, 1], C.N);
    out.push(S(G.disc(0, 4, 3.6, F, P), { tone: "mid" }), S(G.disc(4, 9, 6.5, F, P), { tone: "mid" }), K.fadedSvg(G.ribsOf(F, 4, 9, 6.5, 28, P, { fade: [0.1, 0.55] }), { tone: "lo" }));
    out.push(Dt([at(L(-15, 2, -54))], { size: 0.6, tone: "hi" }));
  }
  return out.join("");
}
