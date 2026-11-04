// The room: a boarded floor, two walls with skirting boards, a mouse hole, a socket, and the props on the floor.
import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { P, at, S, Ln, D, FLOOR, WALL_TOP } from "./model.mjs";

const F = FLOOR, X1 = F.x + F.w, Y1 = F.y + F.d, SK = 22;
const BACK = { x: F.x - 6, y: F.y - 6, w: F.w + 6, d: 6, r: 0.5 }, SIDE = { x: F.x - 6, y: F.y, w: 6, d: F.d, r: 0.5 };

export function room() {
  const out = [];
  out.push(S(k.slabOf(BACK, 0, WALL_TOP, P, 2), { tone: "mid" }));
  // Wallpaper stripes on both walls, from the skirting's top to the wall's top.
  const stripes = [];
  for (let x = F.x + 18; x < X1; x += 18) stripes.push(k.segment([x, F.y, SK], [x, F.y, WALL_TOP], P));
  out.push(Ln(stripes.join(""), { tone: "faint" }));
  // Skirting boards with a moulded top edge.
  for (const p of [{ x: F.x, y: F.y, w: F.w, d: 4, r: 0.4 }]) out.push(S(k.slabOf(p, 0, SK, P, 2, 0.5), { tone: "hi", inner: Ln(k.sideSeam(p, SK - 4, P, 2), { tone: "lo" }) }));
  // The mouse hole: an arch through the back skirting into the wall.
  const hx = -40, hy = F.y + 4, hw = 12, hh = 26;
  const arch = [[hx - hw, 0], ...Array.from({ length: 17 }, (_, i) => { const a = Math.PI - (i / 16) * Math.PI; return [hx + hw * Math.cos(a), hh - hw + hw * Math.sin(a)]; }), [hx + hw, 0]];
  out.push(`<path class="mt-void" d="${k.pathOf(arch.map(([x, z]) => at([x, hy, z])), true)}"/>`);
  out.push(Ln(k.pathOf(arch.map(([x, z]) => at([x, hy - 4, z * 0.98]))), { tone: "faint" }));
  // A wall socket on the back wall: a plate with two round pins' holes and a screw.
  const sx = 40, sz = 62, plate = { x: sx - 14, y: F.y - 1.6, w: 28, d: 1.6, r: 1.6 };
  out.push(S(k.slabOf(plate, sz - 14, 28, P, 3, 0.4), { tone: "hi" }));
  const Fs = L.frameAlong([sx, F.y, sz], [0, 1, 0]);
  out.push(Ln(L.circleOf(L.frameAlong([sx, F.y, sz], [0, 1, 0]), 0.1, 8, P), { tone: "lo" }));
  out.push(`<path class="mt-void" d="${L.circleOf(L.frameAlong([sx - 4, F.y + 0.2, sz], [0, 1, 0]), 0, 1.6, P) + L.circleOf(L.frameAlong([sx + 4, F.y + 0.2, sz], [0, 1, 0]), 0, 1.6, P)}"/>`);
  out.push(D([at([sx, F.y + 0.2, sz + 10])], { size: 0.6 }));
  return out.join("") + void Fs;
}

export function floor() {
  const out = [S(k.slabOf(F, -16, 16, P, 2), { tone: "mid" })];
  const lines = [], gap = 28;
  for (let y = F.y + gap, i = 0; y < Y1; y += gap, i++) lines.push(k.lineOnTop([F.x, y], [X1, y], 0, P));
  // Board ends, staggered row by row, each joint running from one board line to the next.
  for (let y = F.y, i = 0; y < Y1 - 1; y += gap, i++) for (let x = F.x + 60 + ((i * 97) % 150); x < X1 - 10; x += 170) lines.push(k.lineOnTop([x, y], [x, Math.min(y + gap, Y1)], 0, P));
  out.push(Ln(lines.join(""), { tone: "lo" }));
  // A few nail heads at the board ends.
  const nails = [];
  for (let y = F.y, i = 0; y < Y1 - 1; y += gap, i++) for (let x = F.x + 60 + ((i * 97) % 150); x < X1 - 10; x += 170) nails.push(at([x + 3, y + 7, 0]), at([x + 3, y + gap - 7, 0]));
  out.push(D(nails, { size: 0.45, tone: "lo" }));
  return out.join("");
}
