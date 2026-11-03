import * as k from "../../kit/iso-kit.mjs";
import * as G from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, Dt } from "./model.mjs";

// Props in the kit's own tones: a tool board with a caliper and a square, a framed certificate, two steel
// parallels and a loupe on the plate, and the details on the magnetic base's right face.
const DK = C.DESK, Z = C.DESK_Z;

// A pegboard on the right wall: a perforated panel on two battens, a vernier caliper and a try square on hooks.
export function toolBoard() {
  const yb = DK.y, x0 = -10, x1 = 104, z0 = 100, z1 = 176, out = [];
  out.push(S(k.slabOf({ x: x0, y: yb, w: x1 - x0, d: 3, r: 0.6 }, Z + z0, z1 - z0, P, 2, 0.4), { tone: "mid" }));
  const holes = [];
  for (let x = x0 + 8; x < x1 - 4; x += 8) for (let z = z0 + 8; z < z1 - 4; z += 8) holes.push(at([x, yb + 3, Z + z]));
  out.push(Dt(holes, { size: 0.45, tone: "lo" }));
  // The caliper: a long beam, the fixed and sliding jaws, the slider's thumb wheel and its scale.
  const y = yb + 3, beam = { x: x0 + 14, w: 66, z: Z + 148, h: 5 };
  out.push(S(k.slabOf({ x: beam.x, y, w: beam.w, d: 1.6, r: 0.4 }, beam.z, beam.h, P, 2), { tone: "hi" }));
  out.push(S(k.slabOf({ x: beam.x, y, w: 5, d: 1.8, r: 0.4 }, beam.z - 20, 20, P, 2), { tone: "hi" }));
  out.push(S(k.slabOf({ x: beam.x + 22, y, w: 12, d: 2.6, r: 0.6 }, beam.z - 20, 27, P, 2, 0.3), { tone: "mid" }));
  out.push(S(G.disc(2.6, 4.2, 2.4, G.frameOf([beam.x + 28, y, beam.z - 3], [0, 1, 0], [1, 0, 0], [0, 0, 1]), P), { tone: "mid" }));
  const t = k.sideTicks(beam.x + 36, beam.x + beam.w - 2, 2, 5, y + 1.6, beam.z + beam.h, [1.2, 2.2], P);
  out.push(Ln(t.minor, { tone: "lo" }), Ln(t.major, { tone: "mid" }));
  out.push(S(k.slabOf({ x: beam.x + 60, y: yb + 3, w: 3, d: 6, r: 0.6 }, beam.z + beam.h, 3, P, 2), { tone: "lo" }));
  // The square: a thick stock and a thin blade, hung from its own hook.
  out.push(S(k.slabOf({ x: x1 - 24, y: yb + 3, w: 3, d: 6, r: 0.6 }, Z + 132, 3, P, 2), { tone: "lo" }));
  out.push(S(k.slabOf({ x: x1 - 30, y, w: 6, d: 4, r: 0.6 }, Z + 104, 28, P, 2, 0.4), { tone: "mid" }));
  out.push(S(k.slabOf({ x: x1 - 24, y, w: 20, d: 1.2, r: 0.3 }, Z + 104, 4, P, 2), { tone: "hi" }));
  return out.join("");
}

// A framed calibration certificate on the left wall: its rule lines stand for the printed text.
export function certificate() {
  const xb = DK.x, y0 = -60, y1 = -10, z0 = Z + 150, z1 = Z + 214, out = [];
  out.push(S(k.slabOf({ x: xb, y: y0, w: 3, d: y1 - y0, r: 0.6 }, z0, z1 - z0, P, 2, 0.4), { tone: "mid" }));
  const f = (y, z) => at([xb + 3, y, z]);
  out.push(Ln(k.pathOf([f(y0 + 4, z0 + 4), f(y1 - 4, z0 + 4), f(y1 - 4, z1 - 4), f(y0 + 4, z1 - 4)], true), { tone: "faint" }));
  const rules = [];
  [[8, 40], [8, 34], [8, 38], [8, 30], [8, 36], [8, 24]].forEach(([a, b], i) => rules.push(k.pathOf([f(y0 + a, z1 - 12 - i * 7), f(y0 + b, z1 - 12 - i * 7)])));
  out.push(Ln(rules.join(""), { tone: "lo", free: true }));
  out.push(S(G.disc(3, 3.8, 4, G.frameOf([xb, y1 - 12, z0 + 10], [1, 0, 0], [0, 1, 0], [0, 0, 1]), P), { tone: "lo" }));
  return out.join("");
}

// Two hardened steel parallels and a folding loupe, on the plate between the block case and the stand.
export function platePropsFront() {
  const out = [];
  for (const [y, h] of [[96, 8], [108, 8]]) {
    const pl = { x: -86, y, w: 60, d: 5, r: 0.5 };
    out.push(`<path class="iso-halo" d="${k.haloOf(pl, 0, 2, P)}"/>`, S(k.slabOf(pl, 0, h, P, 2, 0.4), { tone: "hi", inner: Ln(k.sideSeam(pl, h - 1.4, P, 2), { tone: "faint" }) }));
  }
  const [lx, ly] = [-30, 64];
  out.push(`<path class="iso-halo" d="${k.haloOf({ x: lx - 12, y: ly - 12, w: 24, d: 24, r: 12 }, 0, 2, P)}"/>`);
  out.push(S(k.cylinder(lx, ly, 11, 0, 4, P, 40, 0.5), { tone: "mid" }));
  out.push(S(k.cylinder(lx, ly, 8, 4, 9, P, 40, 0.5), { tone: "hi", inner: Ln(k.sideArc(lx, ly, 8, 8, P, 32), { tone: "faint" }) }));
  out.push(Ln(k.ring(lx, ly, 6, 13, P, 40), { tone: "lo" }));
  return out.join("");
}

// The magnetic base's right face: a rating plate, the V-groove's end in the sole, and four screws.
export function baseFace() {
  const M = C.MAG, x = M.x + M.w, out = [];
  const f = (y, z) => at([x, y, z]), g = (y, z) => at([x + 1, y, z]);
  const y0 = M.y + 20, y1 = M.y + M.d - 20;
  out.push(S(k.slabOf({ x, y: y0, w: 1, d: y1 - y0, r: 0.5 }, 62, 26, P, 2, 0.3), { tone: "hi" }));
  const rules = [[6, 40], [6, 30], [6, 36]].map(([a, b], i) => k.pathOf([g(y0 + a, 80 - i * 6), g(y0 + b, 80 - i * 6)]));
  out.push(Ln(rules.join(""), { tone: "lo", free: true }));
  const yc = M.y + M.d / 2;
  out.push(`<path class="di-window" d="${k.pathOf([f(yc - 16, 0), f(yc, 14), f(yc + 16, 0)], true)}"/>` + Ln(k.pathOf([f(yc - 16, 0), f(yc, 14), f(yc + 16, 0)], true), { tone: "lo" }));
  out.push(Dt([f(M.y + 8, 98), f(M.y + M.d - 8, 98), f(M.y + 8, 22), f(M.y + M.d - 8, 22)], { size: 0.55 }));
  return out.join("");
}

// A double socket on the right wall, low by the bench, its plates screwed on.
export function socket() {
  const yb = DK.y, x0 = 70, out = [];
  out.push(S(k.slabOf({ x: x0, y: yb, w: 40, d: 3, r: 1 }, Z + 18, 20, P, 2, 0.4), { tone: "hi" }));
  for (const cx of [x0 + 10, x0 + 30]) out.push(Ln(G.circleOf(G.frameOf([cx, yb + 3, Z + 28], [0, 1, 0], [1, 0, 0], [0, 0, 1]), 0, 5.5, P, 32), { tone: "lo" }), Dt([at([cx - 2, yb + 3, Z + 29]), at([cx + 2, yb + 3, Z + 29]), at([cx, yb + 3, Z + 25.5])], { size: 0.6, tone: "lo" }));
  out.push(Dt([at([x0 + 20, yb + 3, Z + 34]), at([x0 + 20, yb + 3, Z + 22])], { size: 0.5 }));
  return out.join("");
}
