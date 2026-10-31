import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { P, at, S, Ln, D, FLOOR, WALL_TOP, ringY, rod } from "./model.mjs";

// The hall the clock stands in: panelled walls with a dado rail, floorboards, a framed picture and a side table.
export function room() {
  const out = [];
  out.push(S(k.slabOf({ x: -60, y: -50, w: 110, d: 6, r: 0.6 }, -10, WALL_TOP + 10, P, 2), { tone: "mid" }));
  out.push(S(k.slabOf({ x: -60, y: -44, w: 6, d: 90, r: 0.6 }, -10, WALL_TOP + 10, P, 2), { tone: "mid" }));
  const lines = [];
  for (const z of [90, 96]) lines.push(k.segment([-54, -44, z], [50, -44, z], P), k.segment([-54, -44, z], [-54, 46, z], P));
  for (let x = -34; x < 30; x += 26) lines.push(ringY(-44, x, x + 20, 12, 80, 2));
  lines.push(k.segment([50, -44, -10], [50, -44, WALL_TOP], P), k.segment([-54, 46, -10], [-54, 46, WALL_TOP], P));
  out.push(Ln(lines.join(""), { tone: "faint" }));
  out.push(S(k.slabOf({ x: -54, y: -44, w: 104, d: 1.2, r: 0.3 }, 92, 3, P, 2), { tone: "mid" }) + S(k.slabOf({ x: -54, y: -44, w: 1.2, d: 90, r: 0.3 }, 92, 3, P, 2), { tone: "mid" }));
  // A framed picture: a moulded frame, a mount, and three hills on the print.
  out.push(S(k.slabOf({ x: 16, y: -44, w: 30, d: 1.6, r: 0.4 }, 136, 38, P, 2, 0.3), { tone: "hi" }));
  out.push(Ln(ringY(-42.4, 19, 43, 139, 171, 0.8) + ringY(-42.4, 22, 40, 143, 167, 0.4), { tone: "faint" }));
  out.push(Ln(k.pathOf([[22, 150], [27, 157], [31, 152], [35, 159], [40, 151]].map(([x, z]) => at([x, -42.4, z]))), { tone: "mid", free: true }));
  out.push(k.wireSvg(at([21, -43, 174]), at([41, -43, 174]), { via: [at([31, -43.6, 182])], tone: "lo", size: 0.6 }));
  return out.join("");
}

export function floor() {
  const boards = [];
  for (let x = FLOOR.x + 12; x < FLOOR.x + FLOOR.w; x += 12) boards.push(k.lineOnTop([x, FLOOR.y], [x, FLOOR.y + FLOOR.d], 0, P));
  return S(k.slabOf(FLOOR, -10, 10, P, 6, 1), { tone: "mid" }) + Ln(boards.join(""), { tone: "faint" }) + Ln(k.sideSeam(FLOOR, -5, P, 6), { tone: "faint" });
}

// A small round side table with a candlestick and a book on it.
export function table() {
  const [x, y] = [-36, 26];
  const out = [];
  for (const [dx, dy] of [[-8, -8], [8, -8], [-8, 8], [8, 8]].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P))) {
    out.push(S(rod([x + dx, y + dy, 0], [0, 0, 1], 1.2, 0, 62, 12), { tone: "mid" }));
  }
  out.push(S(k.cylinder(x, y, 15, 62, 2.4, P, 48, 0.5), { tone: "hi" }) + Ln(k.sideArc(x, y, 15, 63.2, P, 32), { tone: "faint" }));
  const book = { x: x - 10, y: y - 2, w: 14, d: 10, r: 0.6 };
  out.push(S(k.slabOf(book, 64.4, 2.6, P, 3, 0.3), { tone: "mid" }) + Ln(k.lineOnTop([book.x + 2, book.y], [book.x + 2, book.y + book.d], 67, P), { tone: "faint" }));
  out.push(S(k.cylinder(x + 6, y - 4, 4, 64.4, 1.4, P, 32, 0.3), { tone: "hi" }));
  out.push(S(L.solidOf([[0, 1.4], [2, 1, 1], [9, 0.9, 1], [10, 1.6, 1], [11.5, 1.2]], L.frameAlong([x + 6, y - 4, 65.8], [0, 0, 1]), P), { tone: "hi", crease: "none" }));
  out.push(S(k.cylinder(x + 6, y - 4, 0.7, 77.3, 7, P, 16), { tone: "hi" }));
  out.push(D([at([x + 6, y - 4, 84.6])], { size: 0.5, tone: "lo" }));
  return out.join("");
}
