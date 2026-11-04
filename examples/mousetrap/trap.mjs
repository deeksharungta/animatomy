// The trap's parts that never move: the pine base and its grain, the printed label, the staples and the axle.
import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D } from "./model.mjs";
import { wireOf, bendOf } from "./wire.mjs";

const K = { ...k, ...L };
const B = C.BASE, T = C.TOP, X1 = B.x + B.w, Y1 = B.y + B.d;

// A polyline clipped to a rectangle on a face: runs that end exactly on the rectangle's edges.
function clipped(points, inside, edge) {
  const runs = [];
  let run = [];
  for (let i = 0; i < points.length; i++) {
    const p = points[i], q = points[i - 1];
    if (inside(p)) {
      if (!run.length && q) run.push(edge(q, p));
      run.push(p);
    } else if (run.length) { run.push(edge(p, q)); runs.push(run); run = []; }
  }
  if (run.length > 1) runs.push(run);
  return runs;
}
const cut = (a, b, f) => { let lo = 0, hi = 1; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; f(a.map((v, j) => v + (b[j] - v) * m)) ? (hi = m) : (lo = m); } return a.map((v, j) => v + (b[j] - v) * hi); };

export function base() {
  const out = [`<path class="iso-halo" d="${k.haloOf(B, 0, T, P)}"/>`];
  out.push(S(k.slabOf(B, 0, T, P, 3, 0.8), { tone: "mid" }));
  // Grain: gently waving lines along the board, edge to edge, on the top and the near side.
  const grain = [];
  for (let i = 0; i < 9; i++) {
    const y0 = B.y + 6 + i * 9.8, ph = i * 1.7;
    grain.push(k.onTop(Array.from({ length: 41 }, (_, j) => { const x = B.x + (j / 40) * B.w; return [x, y0 + 1.6 * Math.sin(x / 34 + ph) + 0.6 * Math.sin(x / 9 + ph * 2)]; }), T, P));
  }
  const side = [5.5, 11.5].map((z) => k.fadeLineSvg(Array.from({ length: 41 }, (_, j) => { const x = B.x + 6 + (j / 40) * (B.w - 12); return at([x, Y1, z + 0.8 * Math.sin(x / 26 + z)]); }), { fade: [10, 10], tone: "faint" })).join("");
  // A knot in the pine, its rings drawn round it on the top.
  for (const [a, b] of [[3.2, 1.8], [5.6, 3.2], [8.4, 4.6]]) grain.push(k.onTop(Array.from({ length: 33 }, (_, j) => { const t = (j / 32) * Math.PI * 2; return [-54 + a * Math.cos(t), -22 + b * Math.sin(t)]; }), T, P, true));
  // End grain on the +x end: the growth rings of the log the board was sawn from.
  const inFace = (p) => p[1] > B.y + B.r && p[1] < Y1 - B.r && p[2] > 0 && p[2] < T;
  for (let r = 22; r <= 120; r += 7) {
    const ring = Array.from({ length: 721 }, (_, j) => { const a = (j / 720) * Math.PI * 2; return [X1, -26 + r * Math.cos(a), -34 + r * Math.sin(a)]; });
    for (const run of clipped(ring, inFace, (p, q) => cut(q, p, (m) => !inFace(m)))) grain.push(k.pathOf(run.map(at)));
  }
  out.push(Ln(grain.join(""), { tone: "faint" }) + side + Ln(k.segment([X1, Y1, 0.2], [X1, Y1, T - 0.2], P), { tone: "lo" }));
  return out.join("");
}

// The label printed on the board: a ruled panel with three lines of type and the maker's round mark.
export function label() {
  const plan = { x: 6, y: 3, w: 28, d: 17, r: 1.2 }, z = T + 0.02;
  const rules = [[10, 8, 30], [10, 12, 27], [10, 16, 22]].map(([x0, y, x1]) => k.lineOnTop([x0 + 6, y], [x1, y], z, P)).join("");
  return Ln(k.planOutline(plan, z, P, 3), { tone: "lo" }) + Ln(rules, { tone: "lo", free: true }) + Ln(k.ring(11.5, 11.5, 3.2, z, P, 24), { tone: "lo" }) + D([at([11.5, 11.5, z])], { size: 0.6, tone: "mid" });
}

// A staple: a U of wire driven into the wood, its bridge at height h, straddling a point along x or y.
export function staple(x, y, h, half, along = "y", r = 0.8) {
  const p = (s, z) => (along === "y" ? [x, y + s, z] : [x + s, y, z]);
  const pts = bendOf([p(-half, T - 0.4), p(-half, h), p(half, h), p(half, T - 0.4)], 1.2, 3);
  return wireOf(K, P, pts, r, { tone: "hi", ends: false }) + D([at(p(-half, T)), at(p(half, T))], { size: 0.45, tone: "mid" });
}

// The axle the hammer and springs turn on, in three pieces so each coil can wrap its own.
export const axle = (y0, y1) => wireOf(K, P, [[C.AX.x, y0, C.AX.z], [C.AX.x, y1, C.AX.z]], C.WIRE, { tone: "hi", ends: y0 < -40 || y1 > 40 });
export const axleStaples = () => [-21, 21].map((y) => staple(0, y, C.AX.z + C.WIRE + 0.8, 3.4, "x")).join("");
// The hammer's eyes: loops of the bail's wire round the axle.
export const eye = (y) => S(L.ringBand(-1.6, 1.6, C.WIRE, C.WIRE + 1.9, L.frameAlong([0, y, C.AX.z], [0, 1, 0]), P), { tone: "hi" });
// The hold-down bar's staple at the far end, with the bar's eye looped round its bridge.
export const barStaple = () => staple(C.BAR.x, 0, C.BAR.z, 4.6, "y") + S(L.ringBand(-1.3, 1.3, 1.0, 2.6, L.frameAlong([C.BAR.x, 0, C.BAR.z], [0, 1, 0]), P), { tone: "hi" });
// The pedal's pivot staple: its bridge runs through the pedal's two rolled ears.
export const pedalStaple = () => staple(C.PEDAL.px, 0, C.PEDAL.pz, 23, "y", 0.9);
// The staples that pin each spring's base leg to the board.
export const legStaple = (side) => staple(28, side * C.SPRING.y1, C.AX.z - C.SPRING.r + 1.4, 2.6, "y", 0.7);
// The pedal's hinge: its edge rolled into a tube round the staple's bridge.
export const pedalRoll = () => S(L.disc(-17, 17, 1.7, L.frameAlong([C.PEDAL.px, 0, C.PEDAL.pz], [0, 1, 0]), P), { tone: "hi", inner: Ln(L.arcOf(L.frameAlong([C.PEDAL.px, 0, C.PEDAL.pz], [0, 1, 0]), 0, 1.7, P), { tone: "faint" }) });
