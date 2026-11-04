// The kitchen around the mill, in the kit's own tones: a tiled corner, a counter, a spice shelf, the saucer the mill
// stands in, a salt shaker, a ramekin and a chopping board with three loose corns on it.
import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, DESK, ROOM_TOP, P, at, sector } from "./model.mjs";

const S = (paths, style) => k.solidSvg(paths, style);
const Ln = (d, style) => k.lineSvg(d, style);
const D = (pts, style) => k.dotsSvg(pts, style);
const up = (x, y, z) => L.frameOf([x, y, z], [0, 0, 1], [1, 0, 0], [0, 1, 0]);

export function room() {
  const out = [];
  const back = { x: DESK.x, y: DESK.y - 6, w: DESK.w, d: 6, r: 0.6 };
  out.push(S(k.slabOf(back, -14, ROOM_TOP + 14, P, 2), { tone: "mid" }));
  const t = [];
  for (let x = DESK.x + 20; x < DESK.x + DESK.w; x += 20) t.push(k.segment([x, DESK.y, 0], [x, DESK.y, ROOM_TOP], P));
  for (let z = 20; z < ROOM_TOP; z += 20) t.push(k.segment([DESK.x, DESK.y, z], [DESK.x + DESK.w, DESK.y, z], P));
  t.push(k.segment([DESK.x + DESK.w, DESK.y, 0], [DESK.x + DESK.w, DESK.y, ROOM_TOP], P));
  out.push(Ln(t.join(""), { tone: "faint" }));
  const side = { x: DESK.x - 6, y: DESK.y - 6, w: 6, d: DESK.d + 6, r: 0.6 };
  out.push(S(k.slabOf(side, -14, ROOM_TOP + 14, P, 2), { tone: "mid" }));
  const u = [];
  for (let y = DESK.y + 20; y < DESK.y + DESK.d; y += 20) u.push(k.segment([DESK.x, y, 0], [DESK.x, y, ROOM_TOP], P));
  for (let z = 20; z < ROOM_TOP; z += 20) u.push(k.segment([DESK.x, DESK.y, z], [DESK.x, DESK.y + DESK.d, z], P));
  u.push(k.segment([DESK.x, DESK.y + DESK.d, 0], [DESK.x, DESK.y + DESK.d, ROOM_TOP], P));
  out.push(Ln(u.join(""), { tone: "faint" }));
  return out.join("") + shelf();
}

// A spice shelf on two brackets, with two jars whose lids and label plates read in the kit's tones.
function shelf() {
  const out = [];
  const y = DESK.y, z = 150;
  for (const x of [24, 86]) out.push(S(k.slabOf({ x: x - 2, y, w: 4, d: 16, r: 0.6 }, z - 22, 22, P, 2), { tone: "mid" }));
  const plank = { x: 12, y, w: 86, d: 26, r: 1.2 };
  out.push(S(k.slabOf(plank, z, 5, P, 3, 0.5), { tone: "mid" }));
  out.push(D([[18, y + 2, z + 5], [92, y + 2, z + 5]].map(at), { size: 0.5 }));
  for (const [x, h] of [[36, 34], [72, 28]]) {
    const cy = y + 13;
    out.push(S(k.cylinder(x, cy, 10, z + 5, h, P, 40), { tone: "hi", crease: "faint" }));
    out.push(S(k.cylinder(x, cy, 10.6, z + 5 + h, 6, P, 40, 0.4), { tone: "mid" }) + Ln(k.knurl(x, cy, 10.6, z + 5 + h, z + 11 + h, 30, P, 0.6), { tone: "faint" }));
    out.push(Ln(k.sideArc(x, cy, 10, z + 5 + h * 0.3, P, 24) + k.sideArc(x, cy, 10, z + 5 + h * 0.75, P, 24), { tone: "faint" }));
  }
  return out.join("");
}

export function desk() {
  const grain = [];
  for (let x = DESK.x + 14; x < DESK.x + DESK.w - 6; x += 16) grain.push(k.lineOnTop([x, DESK.y], [x, DESK.y + DESK.d], 0, P));
  return S(k.slabOf(DESK, -14, 14, P, 6, 1.2), { tone: "mid", inner: "" }) + Ln(grain.join(""), { tone: "faint" });
}

// The saucer the mill stands in: a floor with a turned groove, and a rim split round the mill.
const SA = C.SAUCER;
export function saucerBack() {
  const out = [`<path class="iso-halo" d="${k.haloOf({ x: -SA.r1, y: -SA.r1, w: 2 * SA.r1, d: 2 * SA.r1, r: SA.r1 }, 0, 8, P)}"/>`];
  out.push(S(k.cylinder(0, 0, SA.r0, 0, SA.floor, P, 96), { tone: "lo" }));
  out.push(Ln(k.ring(0, 0, 61, SA.floor, P, 96), { tone: "faint" }));
  out.push(S(k.extrude(sector(SA.r0, SA.r1, 135, 315, 48), 0, SA.h, P, { convex: false }), { tone: "mid" }));
  return out.join("");
}
export function saucerFront() {
  return S(k.extrude(sector(SA.r0, SA.r1, -45, 135, 48), 0, SA.h, P, { convex: false }), { tone: "mid", inner: Ln(k.sideArc(0, 0, SA.r1, 3.5, P, 64), { tone: "faint" }) });
}

// A salt shaker with a domed, pierced cap; a ramekin; a chopping board with a hanging hole and three loose corns.
export function propsBack() {
  const out = [];
  const [sx, sy] = [74, -72];
  out.push(`<path class="iso-halo" d="${k.haloOf({ x: sx - 18, y: sy - 18, w: 36, d: 36, r: 18 }, 0, 6, P)}"/>`);
  out.push(S(k.cylinder(sx, sy, 17, 0, 58, P, 56), { tone: "hi", crease: "faint" }) + Ln(k.sideArc(sx, sy, 17, 12, P, 40), { tone: "faint" }));
  out.push(S(L.solidOf([[0, 17.6], [6, 17.6], [9, 15, 1], [12, 9, 1], [13.2, 0]], up(sx, sy, 58), P), { tone: "mid" }));
  const holes = [[0, 0], [5, 0], [-5, 0], [0, 5], [0, -5]].map(([dx, dy]) => at([sx + dx, sy + dy, 58 + 12.4]));
  out.push(D(holes, { size: 0.8, tone: "lo" }));
  return out.join("");
}
export function propsFront() {
  const out = [];
  const board = { x: -112, y: 18, w: 56, d: 82, r: 6 };
  out.push(`<path class="iso-halo" d="${k.haloOf(board, 0, 4, P)}"/>`);
  out.push(S(k.slabOf(board, 0, 5, P, 6, 0.8), { tone: "mid", inner: Ln(k.sideSeam(board, 2.5, P, 6), { tone: "faint" }) }));
  out.push(`<path class="so-void" d="${k.ring(-84, 30, 4.5, 5, P, 32)}"/>`);
  const g = [];
  for (let y = board.y + 16; y < board.y + board.d - 5; y += 11) g.push(k.lineOnTop([board.x, y], [board.x + board.w, y], 5, P));
  out.push(Ln(g.join(""), { tone: "faint" }));
  const corns = [[-80, 76], [-70, 84], [-76, 92]].map(([x, y]) => [x, y, 5 + C.CORN_R]);
  out.push(`<g class="pg-corn">${corns.map((c) => S(L.sphereOf(c, C.CORN_R, P, { steps: 20 }), { tone: "hi" })).join("")}</g>`);
  const [rx, ry] = [80, 52];
  out.push(`<path class="iso-halo" d="${k.haloOf({ x: rx - 22, y: ry - 22, w: 44, d: 44, r: 22 }, 0, 5, P)}"/>`);
  out.push(S(L.solidOf([[0, 15], [2, 17, 1], [16, 21, 1], [18, 21.4]], up(rx, ry, 0), P), { tone: "hi" }));
  out.push(`<path class="so-void" d="${k.ring(rx, ry, 19.4, 18, P, 48)}"/>` + Ln(k.ring(rx, ry, 19.4, 18, P, 48), { tone: "lo" }));
  const bowl = [[-6, -4], [3, -7], [8, 2], [-2, 5], [-9, 6], [6, 10], [1, -1]].map(([dx, dy], i) => [rx + dx, ry + dy, 6.5 + C.CORN_R + (i === 6 ? 6 : 0)]);
  out.push(`<g class="pg-corn">${bowl.sort((a, b) => k.depthOf(a, P) - k.depthOf(b, P)).map((c) => S(L.sphereOf(c, C.CORN_R, P, { steps: 20 }), { tone: "hi" })).join("")}</g>`);
  return out.join("");
}
