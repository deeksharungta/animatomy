import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { P, at, S_ as S, Ln, Dt } from "./model.mjs";

// ---------------------------------------------------------------- the props on the bench

const K_RIBS = (F) => Ln(L.ribsOf(F, 1.6, 8.4, 2, 10, P, { seams: true }), { tone: "faint" });
const halo = (pl) => `<path class="iso-halo" d="${k.haloOf(pl, 0, 0.1, P)}" style="filter:blur(3px)"/>`;
export function props() {
  const out = [];
  // A wooden case for the gyroscope, its lid seam wrapping the corners, with a handle and two catches.
  const cs = { x: -98, y: -94, w: 44, d: 26, r: 2 };
  out.push(halo(cs), S(k.slabOf(cs, 0, 20, P, 3, 0.6), { tone: "mid", inner: Ln(k.sideSeam(cs, 14, P, 3), { tone: "faint" }) }));
  for (const x of [cs.x + 10, cs.x + 36]) out.push(S(k.slabOf({ x: x - 2, y: cs.y + cs.d - 0.2, w: 4, d: 1.2, r: 0.3 }, 11, 6, P, 2), { tone: "hi" }));
  out.push(S(k.slabOf({ x: cs.x + 14, y: cs.y + 13, w: 18, d: 4, r: 1.6 }, 20, 2.4, P, 3), { tone: "hi" }));
  out.push(Dt(k.corners(cs, 2.4).map(([x, y]) => at([x, y, 20])), { size: 0.4 }));
  // A stack of three manuals by the side wall, page edges ruled on their two open faces, an oil can on top.
  let z = 0;
  for (const [x, y, w, d, h] of [[-98, -46, 30, 22, 5], [-97, -45, 27, 20, 4], [-96.4, -44, 26, 18.4, 4.4]]) {
    const bk = { x, y, w, d, r: 0.6 };
    out.push(S(k.slabOf(bk, z, h, P, 2, 0.4), { tone: z ? "hi" : "mid" }));
    out.push(Ln(k.sideSeam(bk, z + h * 0.33, P, 2) + k.sideSeam(bk, z + h * 0.66, P, 2), { tone: "faint" }));
    z += h;
  }
  const oF = L.frameAlong([-86, -36, z], [0, 0, 1]);
  out.push(S(L.solidOf([[0, 4.6], [5, 4.6, 1], [7.4, 2.6, 1], [8.4, 1.2]], oF, P), { tone: "mid", inner: Ln(L.arcOf(oF, 2.4, 4.6, P), { tone: "faint" }) }));
  out.push(S(L.solidOf([[0, 0.9], [13, 0.4]], L.frameAlong([-85.4, -35.4, z + 7.6], [0.62, 0.62, 0.48]), P), { tone: "hi" }));
  out.push(S(L.solidOf([[0, 1.4], [3, 1.4]], L.frameAlong([-86, -36, z + 8.2], [0, 0, 1]), P), { tone: "hi" }));
  const back = out.length;
  // A slotted mass set on its hanger, each slot cut to the hanger's rod.
  const mx = -62, my = 52;
  out.push(halo({ x: mx - 11, y: my - 11, w: 22, d: 22, r: 11 }), S(k.cylinder(mx, my, 10, 0, 2, P, 40), { tone: "mid" }));
  for (let i = 0; i < 4; i++) {
    const z = 2 + i * 3.4;
    out.push(S(k.cylinder(mx, my, 9.4, z, 3.2, P, 40, 0.4), { tone: "hi" }));
    out.push(Ln(k.lineOnTop([mx + 9.4 * Math.cos(-2.4 + i), my + 9.4 * Math.sin(-2.4 + i)], [mx + 1.4 * Math.cos(-2.4 + i), my + 1.4 * Math.sin(-2.4 + i)], z + 3.2, P), { tone: "faint" }));
  }
  out.push(S(k.cylinder(mx, my, 1, 15.6, 14, P, 12), { tone: "hi", crease: "none" }));
  out.push(Ln(k.pathOf([at([mx, my, 29.6]), at([mx, my, 33]), at([mx + 2, my + 2, 35]), at([mx + 4, my + 4, 33.4])]), { tone: "hi" }), Dt([at([mx + 4, my + 4, 33.4]), at([mx, my, 29.6])], { size: 0.6, tone: "hi" }));
  // A stopwatch lying on the bench, for timing the laps: crown, two pushers and a sub-dial.
  const sx = -22, sy = 74, sr = 11;
  out.push(halo({ x: sx - sr, y: sy - sr, w: sr * 2, d: sr * 2, r: sr }), S(k.cylinder(sx, sy, sr, 0, 4.5, P, 48, 0.5), { tone: "hi" }));
  out.push(Ln(k.ring(sx, sy, sr - 2, 4.5, P, 48) + k.ring(sx + 3.2, sy - 3.2, 2.4, 4.5, P, 24), { tone: "faint" }));
  const t = k.radialTicks(sx, sy, sr - 2, 60, 5, 4.5, [0.8, 1.8], P);
  out.push(Ln(t.minor, { tone: "faint" }), Ln(t.major, { tone: "lo" }));
  out.push(Ln(k.lineOnTop([sx, sy], [sx - 5.5, sy + 5], 4.5, P), { tone: "hi", free: "end" }), Dt([at([sx, sy, 4.5])], { size: 0.7, tone: "hi" }));
  const cw = [-0.71, -0.71, 0], cF = L.frameAlong([sx + sr * cw[0], sy + sr * cw[1], 2.2], cw);
  out.push(S(L.solidOf([[0, 1.6], [3, 1.6]], cF, P), { tone: "mid" }), S(L.solidOf([[3, 2.2], [5, 2.2, 1], [5.6, 1.4]], cF, P), { tone: "hi" }));
  for (const a of [-2.6, -1.6]) out.push(S(L.solidOf([[0, 1], [2.4, 1], [2.8, 1.2]], L.frameAlong([sx + sr * Math.cos(a), sy + sr * Math.sin(a), 2.2], [Math.cos(a), Math.sin(a), 0]), P), { tone: "hi" }));
  // An open lab notebook: two pages on a card cover, ruled, with a sketch of the arm's tilt and a pencil.
  const nb = { x: 44, y: 44, w: 42, d: 28, r: 1 };
  out.push(halo(nb), S(k.slabOf(nb, 0, 0.8, P, 2), { tone: "mid" }));
  for (const [x0, x1] of [[nb.x + 1, nb.x + 20.6], [nb.x + 21.4, nb.x + nb.w - 1]]) {
    const pg = { x: x0, y: nb.y + 1, w: x1 - x0, d: nb.d - 2, r: 0.4 };
    out.push(S(k.slabOf(pg, 0.8, 1.2, P, 2), { tone: "hi" }));
    out.push(Ln(Array.from({ length: 8 }, (_, i) => k.lineOnTop([x0 + 0.1, pg.y + 4 + i * 2.6], [x1 - 0.1, pg.y + 4 + i * 2.6], 2, P)).join(""), { tone: "faint" }));
  }
  const sk = Array.from({ length: 13 }, (_, i) => at([nb.x + 24 + i * 1.3, nb.y + 20 - 7 * Math.exp(-i / 4) * Math.cos(i * 0.9), 2]));
  out.push(Ln(k.pathOf(sk), { tone: "lo", free: true }));
  out.push(Dt([0, 1, 2, 3, 4, 5].map((i) => at([nb.x + 21, nb.y + 3 + i * 4.4, 2])), { size: 0.55, tone: "lo" }));
  const pF = L.frameAlong([nb.x + 4, nb.y + 24, 3.2], [0.94, -0.34, 0]);
  out.push(S(L.solidOf([[0, 0.2], [3, 1.1], [24, 1.1]], pF, P, { steps: 6 }), { tone: "hi" }), S(L.disc(24, 26.4, 1.15, pF, P), { tone: "mid" }));
  // A screwdriver for the counterweight's thumb screw, and the spare fine-trim weight beside the masses.
  const dF = L.frameAlong([-66, 12, 2], [0.3, 0.954, 0]);
  out.push(S(L.solidOf([[0, 1.6], [1, 2, 1], [9, 2, 1], [10, 1.4]], dF, P), { tone: "mid", inner: K_RIBS(dF) }), S(L.solidOf([[10, 0.6], [19, 0.6], [20, 0.3]], dF, P), { tone: "hi" }));
  out.push(S(L.solidOf([[0, 6], [0.6, 6.4, 1], [5.4, 6.4, 1], [6, 6]], L.frameAlong([-50, 76, 0], [0, 0, 1]), P), { tone: "mid", inner: Ln(L.ribsOf(L.frameAlong([-50, 76, 0], [0, 0, 1]), 1.4, 4.6, 6.4, 40, P, { seams: true }), { tone: "faint" }) }));
  out.push(Ln(k.ring(-50, 76, 1.8, 6, P, 20), { tone: "lo" }));
  // A toy gyroscope on its pedestal tower, the bench-top cousin of the big one: cage ring, disc and axle.
  const gx = 70, gy = 32, ga = [0.2, -0.12, 0.97], gF = L.frameAlong([gx, gy, 0], [0, 0, 1]);
  out.push(halo({ x: gx - 6, y: gy - 6, w: 12, d: 12, r: 6 }), S(L.solidOf([[0, 5], [1.2, 5, 1], [1.8, 3.6]], gF, P), { tone: "mid" }));
  out.push(S(L.solidOf([[1.8, 1.4], [9, 0.9, 1], [10.6, 1.6, 1], [11.4, 0.6]], gF, P), { tone: "hi" }));
  const c0 = [gx + ga[0] * 8.6, gy + ga[1] * 8.6, 11.4 + ga[2] * 8.6], aF = L.frameAlong(c0, ga), rF = L.frameAlong(c0, [0.68, 0.73, -0.02]);
  out.push(S(L.ringBand(-0.7, 0.7, 7.6, 8.6, rF, P), { tone: "hi" }));
  out.push(S(L.solidOf([[-8.6, 0.45], [10.4, 0.45], [11.2, 0.9]], aF, P), { tone: "mid" }));
  out.push(S(L.solidOf([[-0.9, 5.2], [-0.5, 6, 1], [0.5, 6, 1], [0.9, 5.2]], aF, P), { tone: "hi", inner: Ln(L.arcOf(aF, 0, 6, P), { tone: "faint" }) }));
  return { back: out.slice(0, back).join(""), front: out.slice(back).join("") };
}
