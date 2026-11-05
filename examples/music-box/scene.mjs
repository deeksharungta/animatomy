// The parlour round the music box, in the kit's own tones: two panelled walls with a dado rail and a skirting, a
// framed picture, the table top, a candlestick behind the box and a folio of sheet music and a spare key in front.
import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { P, at, DESK, ROOM_TOP } from "./model.mjs";

const S = (paths, style) => k.solidSvg(paths, style);
const Ln = (d, style) => k.lineSvg(d, style);
const D = (pts, style) => k.dotsSvg(pts, style);
const up = (x, y, z) => L.frameOf([x, y, z], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
const YB = DESK.y - 6, XL = DESK.x - 6, X1 = DESK.x + DESK.w, Y1 = DESK.y + DESK.d;

export function room() {
  const out = [];
  out.push(S(k.slabOf({ x: XL, y: YB, w: DESK.w + 6, d: 6, r: 0.6 }, -14, ROOM_TOP + 14, P, 2), { tone: "mid" }));
  out.push(S(k.slabOf({ x: XL, y: YB + 6, w: 6, d: DESK.d, r: 0.6 }, -14, ROOM_TOP + 14, P, 2), { tone: "mid" }));
  // Wallpaper stripes above the dado rail, boarding below it; both turn the corner.
  const v = [];
  for (let x = DESK.x + 12; x < X1 - 2; x += 12) v.push(k.segment([x, DESK.y, 104], [x, DESK.y, ROOM_TOP], P));
  for (let y = DESK.y + 12; y < Y1 - 2; y += 12) v.push(k.segment([DESK.x, y, 104], [DESK.x, y, ROOM_TOP], P));
  for (let x = DESK.x + 30; x < X1 - 2; x += 30) v.push(k.segment([x, DESK.y, 22], [x, DESK.y, 96], P));
  for (let y = DESK.y + 30; y < Y1 - 2; y += 30) v.push(k.segment([DESK.x, y, 22], [DESK.x, y, 96], P));
  out.push(Ln(v.join(""), { tone: "faint" }));
  // Dado rail and skirting: thin slabs along both walls, meeting in the corner.
  for (const [z, h, d] of [[96, 8, 3], [0, 22, 2.4]]) {
    out.push(S(k.slabOf({ x: DESK.x, y: DESK.y, w: DESK.w, d, r: 0.4 }, z, h, P, 2), { tone: "hi", crease: "lo" }));
    out.push(S(k.slabOf({ x: DESK.x, y: DESK.y + d, w: d, d: DESK.d - d, r: 0.4 }, z, h, P, 2), { tone: "hi", crease: "lo" }));
  }
  // A framed engraving on the left wall: frame, mount, picture and the cord to its hook.
  const fy = 10, fz = 150, fw = 64, fh = 50;
  out.push(S(k.slabOf({ x: DESK.x, y: fy, w: 4, d: fw, r: 0.6 }, fz, fh, P, 2, 0.4), { tone: "hi", crease: "lo" }));
  out.push(Ln(k.pathOf([[DESK.x + 4, fy + 6, fz + 6], [DESK.x + 4, fy + fw - 6, fz + 6], [DESK.x + 4, fy + fw - 6, fz + fh - 6], [DESK.x + 4, fy + 6, fz + fh - 6]].map(at), true), { tone: "lo" }));
  out.push(Ln(k.pathOf([[DESK.x + 4, fy + 12, fz + 12], [DESK.x + 4, fy + fw - 12, fz + 12], [DESK.x + 4, fy + fw - 12, fz + fh - 12], [DESK.x + 4, fy + 12, fz + fh - 12]].map(at), true), { tone: "faint" }));
  const hills = [];
  for (let i = 0; i <= 16; i++) { const y = fy + 12 + (i / 16) * (fw - 24); hills.push(at([DESK.x + 4, y, fz + 20 + 6 * Math.sin(i * 0.7) + 3 * Math.cos(i * 1.9)])); }
  out.push(Ln(k.pathOf(hills), { tone: "faint", free: true }));
  out.push(Ln(k.pathOf([[DESK.x + 4, fy + 8, fz + fh], [DESK.x + 1, fy + fw / 2, fz + fh + 16], [DESK.x + 4, fy + fw - 8, fz + fh]].map(at)), { tone: "lo" }));
  out.push(D([at([DESK.x + 1, fy + fw / 2, fz + fh + 16])], { size: 0.9, tone: "mid" }));
  return out.join("");
}

export function desk() {
  const grain = [];
  for (let x = DESK.x + 16; x < X1 - 6; x += 16) grain.push(k.lineOnTop([x, DESK.y], [x, Y1], 0, P));
  return S(k.slabOf(DESK, -14, 14, P, 4, 1), { tone: "mid", inner: Ln(k.sideSeam(DESK, -4, P, 4), { tone: "faint" }) }) + Ln(grain.join(""), { tone: "faint" });
}

// Behind the box: a brass candlestick with a cold candle, drawn plain like everything that isn't the subject.
export function propsBack() {
  const out = [], [cx, cy] = [-186, 44];
  out.push(`<path class="iso-halo" d="${k.haloOf({ x: cx - 18, y: cy - 18, w: 36, d: 36, r: 18 }, 0, 1, P)}"/>`);
  out.push(S(L.solidOf([[0, 15], [2, 15, 1], [3, 12], [5, 6, 1], [9, 4], [44, 3.2], [46, 5, 1], [50, 7], [52, 7]], up(cx, cy, 0), P, { fill: "hull" }), { tone: "hi", crease: "lo" }));
  out.push(S(k.cylinder(cx, cy, 4.4, 52, 34, P, 28, 0.3), { tone: "hi" }));
  out.push(Ln(k.rise([cx, cy, 86], 86, 90, P), { tone: "lo" }));
  out.push(D([at([cx, cy, 90])], { size: 0.6, tone: "lo" }));
  return out.join("");
}

// In front: a folio of sheet music with its staves, and the spare winding key lying on it.
export function propsFront() {
  const out = [], F = { x: 40, y: 104, w: 120, d: 20, r: 1 };
  out.push(`<path class="iso-halo" d="${k.haloOf(k.insetPlan(F, -3), 0, 1, P)}"/>`);
  out.push(S(k.slabOf(F, 0, 3, P, 2, 0.4), { tone: "hi", crease: "lo" }));
  const st = [];
  for (const y0 of [F.y + 4, F.y + 12]) for (let i = 0; i < 5; i++) st.push(k.lineOnTop([F.x + 8, y0 + i * 1.1], [F.x + F.w - 8, y0 + i * 1.1], 3, P));
  out.push(Ln(st.join(""), { tone: "faint", free: true }));
  out.push(D([[64, 108.4], [78, 107.3], [92, 106.2], [122, 115.5], [136, 116.6]].map(([x, y]) => at([x, y, 3])), { size: 0.7, tone: "lo" }));
  const K = L.frameOf([118, 110, 4.4], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  out.push(S(L.disc(0, 22, 1.4, K, P), { tone: "hi" }));
  out.push(S(L.prismOf(K, [[-7, -1], [7, -1], [7, 1], [-7, 1]], 22, 26, P), { tone: "hi", crease: "lo" }));
  return out.join("");
}
