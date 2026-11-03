import * as k from "../../kit/iso-kit.mjs";
import * as G from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, Dt } from "./model.mjs";

// The inspection bench: two panelled walls, a bench top, the granite surface plate and the block set's case.
const DK = C.DESK, Z = C.DESK_Z, TOP = C.WALL_TOP;
const byDepth = (pts) => [...pts].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
const onWallY = (y, cx, cz) => G.frameOf([cx, y, cz], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
const onWallX = (x, cy, cz) => G.frameOf([x, cy, cz], [1, 0, 0], [0, -1, 0], [0, 0, 1]);

export function room() {
  const out = [];
  const yb = DK.y, xb = DK.x;
  // Right wall: tall panels with a dado rail; left wall the same.
  out.push(S(k.slabOf({ x: xb, y: yb - 6, w: DK.w, d: 6, r: 0.6 }, Z - 14, TOP - Z + 14, P, 2), { tone: "mid" }));
  const r1 = [], r2 = [];
  for (let x = xb + 36; x < xb + DK.w - 4; x += 36) r1.push(k.segment([x, yb, Z], [x, yb, TOP], P));
  r2.push(k.pathOf([at([xb, yb, Z + 92]), at([xb + DK.w, yb, Z + 92]), at([xb + DK.w, yb - 6, Z + 92])]));
  r2.push(k.pathOf([at([xb, yb, Z + 96]), at([xb + DK.w, yb, Z + 96]), at([xb + DK.w, yb - 6, Z + 96])]));
  r2.push(k.pathOf([at([xb, yb, Z + 250]), at([xb + DK.w, yb, Z + 250]), at([xb + DK.w, yb - 6, Z + 250])]));
  out.push(Ln(r1.join(""), { tone: "faint" }) + Ln(r2.join(""), { tone: "lo" }));
  out.push(S(k.slabOf({ x: xb - 6, y: yb - 6, w: 6, d: DK.d + 6, r: 0.6 }, Z - 14, TOP - Z + 14, P, 2), { tone: "mid" }));
  const s1 = [], s2 = [];
  for (let y = yb + 36; y < yb + DK.d - 4; y += 36) s1.push(k.segment([xb, y, Z], [xb, y, TOP], P));
 for (const dz of [92, 96, 250]) s2.push(k.pathOf([at([xb, yb, Z + dz]), at([xb, yb + DK.d, Z + dz]), at([xb - 6, yb + DK.d, Z + dz])]));
  out.push(Ln(s1.join(""), { tone: "faint" }) + Ln(s2.join(""), { tone: "lo" }));
  out.push(thermometer(yb, 40, 206), clock(xb, 20, 214), shelf(xb));
  return out.join("");
}

// A lab thermometer on the right wall: a gauge lab works at 20 °C, and the pointer says so.
function thermometer(yb, cx, cz) {
  const R = 19, F = onWallY(yb, cx, cz), face = 4;
  const out = [S(G.disc(0, 2.2, R + 2.6, F, P), { tone: "mid" }), S(G.disc(2.2, face, R, F, P), { tone: "hi" })];
  const t = [], big = [];
  for (let i = 0; i <= 40; i++) {
    const a = Math.PI * 1.25 - (i / 40) * Math.PI * 1.5, l = i % 5 ? 2.2 : 3.6;
    (i % 5 ? t : big).push(k.segment([cx + (R - 1.4) * Math.cos(a), yb + face, cz + (R - 1.4) * Math.sin(a)], [cx + (R - 1.4 - l) * Math.cos(a), yb + face, cz + (R - 1.4 - l) * Math.sin(a)], P));
  }
  out.push(Ln(G.circleOf(F, face, R - 1.4, P, 64), { tone: "faint" }), Ln(t.join(""), { tone: "lo" }), Ln(big.join(""), { tone: "mid" }));
  const a20 = Math.PI * 1.25 - (20 / 40) * Math.PI * 1.5;
  out.push(Ln(k.segment([cx - 4 * Math.cos(a20), yb + face + 0.3, cz - 4 * Math.sin(a20)], [cx + (R - 4) * Math.cos(a20), yb + face + 0.3, cz + (R - 4) * Math.sin(a20)], P), { tone: "hi", free: true }));
  out.push(Dt([at([cx, yb + face + 0.4, cz])], { size: 0.8, tone: "hi" }));
  return out.join("");
}

function clock(xb, cy, cz) {
  const R = 15, F = onWallX(xb, cy, cz);
  const out = [S(G.disc(0, 3, R, F, P), { tone: "hi" }), Ln(G.circleOf(F, 3, R - 2.4, P, 48), { tone: "faint" })];
  const ticks = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2, l = i % 3 ? 1.6 : 3;
    ticks.push(k.segment([xb + 3, cy - (R - 2.4) * Math.sin(a), cz + (R - 2.4) * Math.cos(a)], [xb + 3, cy - (R - 2.4 - l) * Math.sin(a), cz + (R - 2.4 - l) * Math.cos(a)], P));
  }
  out.push(Ln(ticks.join(""), { tone: "mid" }));
  out.push(Ln(k.segment([xb + 3.2, cy, cz], [xb + 3.2, cy - 7, cz + 4], P), { tone: "hi", free: "end" }) + Ln(k.segment([xb + 3.2, cy, cz], [xb + 3.2, cy + 2, cz + 11], P), { tone: "hi", free: "end" }));
  out.push(Dt([at([xb + 3.3, cy, cz])], { size: 0.7, tone: "hi" }));
  return out.join("");
}

// A shelf on the left wall with the indicator's own box and a spare contact-point tin.
function shelf(xb) {
  const z = 160, out = [];
  out.push(S(k.slabOf({ x: xb, y: 36, w: 34, d: 96, r: 0.8 }, z, 4, P, 2, 0.4), { tone: "mid" }));
  for (const y of [48, 120]) out.push(S(k.slabOf({ x: xb, y: y - 2, w: 22, d: 4, r: 0.6 }, z - 16, 16, P, 2), { tone: "lo" }));
  out.push(S(k.slabOf({ x: xb + 4, y: 46, w: 26, d: 44, r: 1.6 }, z + 4, 18, P, 3, 0.6), { tone: "hi", inner: Ln(k.sideSeam({ x: xb + 4, y: 46, w: 26, d: 44, r: 1.6 }, z + 16, P, 3), { tone: "faint" }) }));
  out.push(Dt([at([xb + 30, 68, z + 12])], { size: 0.6 }));
  out.push(S(k.cylinder(xb + 17, 112, 9, z + 4, 10, P, 36, 0.5), { tone: "hi", inner: Ln(k.sideArc(xb + 17, 112, 9, z + 11, P, 32), { tone: "faint" }) }));
  out.push(Ln(k.ring(xb + 17, 112, 6, z + 14, P, 32), { tone: "faint" }));
  return out.join("");
}

export function desk() {
  const out = [S(k.slabOf(DK, Z - 14, 14, P, 6, 1.2), { tone: "mid" })];
  const grain = [];
  for (let y = DK.y + 12; y < DK.y + DK.d - 6; y += 13) grain.push(k.lineOnTop([DK.x, y], [DK.x + DK.w, y], Z, P));
  out.push(Ln(grain.join(""), { tone: "faint" }));
  return out.join("");
}

// The granite surface plate: a heavy lapped slab with a chamfered edge, levelled on three feet.
export function granite() {
  const g = C.GRANITE, out = [`<path class="iso-halo" d="${k.haloOf(g, Z, 10, P)}"/>`];
  for (const [x, y] of byDepth([[g.x + 30, g.y + 30], [g.x + g.w - 30, g.y + 40], [g.x + 40, g.y + g.d - 30]])) out.push(S(k.cylinder(x, y, 9, Z, 6, P, 28), { tone: "lo" }));
  const seam = k.sideSeam(g, -8, P, 3);
  out.push(S(k.slabOf(g, Z + 6, -Z - 6, P, 3, 1.6), { tone: "mid", inner: Ln(seam, { tone: "faint" }) }));
  out.push(Ln(k.planOutline(k.insetPlan(g, 4), 0, P, 3), { tone: "faint" }));
  // Calibration plate on the near face.
  const y = g.y + g.d, x0 = g.x + 30;
  out.push(S(k.slabOf({ x: x0, y, w: 46, d: 1.2, r: 0.5 }, -30, 16, P, 2, 0.3), { tone: "hi" }));
  const rl = [[6, 30], [6, 22], [6, 34]].map(([a, b], i) => k.segment([x0 + a, y + 1.2, -18 - i * 4], [x0 + b, y + 1.2, -18 - i * 4], P));
  out.push(Ln(rl.join(""), { tone: "lo", free: true }), Dt([at([x0 + 3, y + 1.2, -22]), at([x0 + 43, y + 1.2, -22])], { size: 0.5 }));
  return out.join("");
}

// The block set's wooden case, open on the plate: five empty slots are where the blocks under the dial came from.
export function blockCase() {
  const b = { x: -156, y: 34, w: 70, d: 86, r: 2 }, h = 14, out = [`<path class="iso-halo" d="${k.haloOf(b, 0, 4, P)}"/>`];
  // The lid stands open on its hinges, its lining framed by a felt edge, a hinge each end.
  out.push(S(G.prismOf(G.frameOf([b.x - 3, b.y, h], [0, 1, 0], [1, 0, 0], [0, 0, 1]), [[-1, 0], [3, 0], [3, 48], [-1, 48]], 0, b.d, P), { tone: "mid" }));
  const lf = (y, z) => at([b.x, y, h + z]);
  out.push(Ln(k.pathOf([lf(b.y + 5, 5), lf(b.y + b.d - 5, 5), lf(b.y + b.d - 5, 43), lf(b.y + 5, 43)], true), { tone: "faint" }));
  out.push(S(k.slabOf({ x: b.x, y: b.y + 30, w: 6, d: 26, r: 1 }, h + 18, 12, P, 2, 0.3), { tone: "lo" }));
  out.push(Dt([lf(b.y + 10, 1), lf(b.y + b.d - 10, 1)], { size: 0.6 }));
  out.push(S(k.slabOf(b, 0, h, P, 3, 0.6), { tone: "mid", inner: Ln(k.sideSeam(b, 5, P, 3), { tone: "faint" }) }));
  const tray = k.insetPlan(b, 4);
  out.push(S(k.slabOf(tray, h - 3, 0.01, P, 2), { tone: "lo", crease: "none" }));
  const slots = [];
  for (let i = 0; i < 9; i++) slots.push({ x: tray.x + 4 + i * 6.6, y: tray.y + 6, w: 4.6, d: 30, r: 0.6 }, { x: tray.x + 4 + i * 6.6, y: tray.y + 42, w: 4.6, d: 30, r: 0.6 });
  slots.forEach((s, i) => {
    if (i % 2 === 0 && i < 10) out.push(Ln(k.planOutline(s, h - 3, P, 2), { tone: "lo" }));
    else out.push(`<g class="di-steel">${S(k.slabOf(s, h - 3, 1.6 + (i % 5) * 0.4, P, 2, 0.3), { tone: "hi", crease: "lo" })}</g>`);
  });
  out.push(Dt([at([b.x + 2, b.y + 8, h]), at([b.x + 2, b.y + b.d - 8, h])], { size: 0.5 }));
  return out.join("");
}
