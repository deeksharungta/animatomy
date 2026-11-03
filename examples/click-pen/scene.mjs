import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D } from "./model.mjs";

// The room, at a sixth of its size like the desk's props: two panelled walls in a corner and the desk.
const R = C.ROOM, T = 3, seg = (a, b) => k.segment(a, b, P);

export function walls() {
  const back = { x: R.x0 - T, y: R.y0 - T, w: R.x1 - R.x0 + T, d: T, r: 0 }, wall = { x: R.x0 - T, y: R.y0, w: T, d: R.y1 - R.y0, r: 0 };
  // Boards below the rail, square tiles above it, every joint running edge to edge.
  const lines = [], rail = 15, side = R.top - 10, tile = 6.5;
  for (let x = R.x0 + 3.5; x < R.x1 - 1; x += 3.5) lines.push(seg([x, R.y0, 0], [x, R.y0, rail]));
  for (let y = R.y0 + 3.5; y < R.y1 - 1; y += 3.5) lines.push(seg([R.x0, y, 0], [R.x0, y, rail]));
  for (let x = R.x0 + tile; x < R.x1 - 1; x += tile) lines.push(seg([x, R.y0, rail], [x, R.y0, R.top]));
  for (let y = R.y0 + tile; y < R.y1 - 1; y += tile) lines.push(seg([R.x0, y, rail], [R.x0, y, side]));
  for (let z = rail + tile; z < R.top - 0.5; z += tile) lines.push(seg([z < side ? R.x0 : R.x0 - T, R.y0, z], [R.x1, R.y0, z]), ...(z < side - 0.5 ? [seg([R.x0, R.y0, z], [R.x0, R.y1, z])] : []));
  // The tiles' last joints at the walls' open ends.
  lines.push(seg([R.x1 - 0.05, R.y0, rail], [R.x1 - 0.05, R.y0, R.top]), seg([R.x0, R.y1 - 0.05, rail], [R.x0, R.y1 - 0.05, side]));
  // A dado rail along both walls.
  const strip = S(k.slabOf({ x: R.x0, y: R.y0, w: R.x1 - R.x0, d: 1.2, r: 0 }, rail, 1.4, P, 2), { tone: "mid" }) + S(k.slabOf({ x: R.x0, y: R.y0 + 1.2, w: 1.2, d: R.y1 - R.y0 - 1.2, r: 0 }, rail, 1.4, P, 2), { tone: "mid" });
  return S(k.slabOf(back, -R.desk, R.top + R.desk, P), { tone: "lo" }) + S(k.slabOf(wall, -R.desk, side + R.desk, P), { tone: "lo" }) + Ln(lines.join(""), { tone: "faint" }) + strip;
}

// The desk top, its grain running edge to edge, with a lip along its front.
export function desk() {
  const plan = { x: R.x0, y: R.y0, w: R.x1 - R.x0, d: R.y1 - R.y0, r: 0 };
  const grain = [];
  for (let y = R.y0 + 6; y < R.y1 - 3; y += 7) grain.push(k.lineOnTop([R.x0, y], [R.x1, y], 0, P));
  return S(k.slabOf(plan, -R.desk, R.desk, P, 2), { tone: "mid", inner: Ln(grain.join(""), { tone: "faint" }) + Ln(k.segment([R.x0, R.y1, -2.4], [R.x1, R.y1, -2.4], P) + k.segment([R.x1, R.y0, -2.4], [R.x1, R.y1, -2.4], P), { tone: "faint" }) });
}

// A cork board on the back wall: a framed board and four pinned, ruled notes.
export function corkBoard() {
  const y = R.y0, b = { x: -26, z: 20, w: 46, h: 22 };
  const out = [S(k.slabOf({ x: b.x, y, w: b.w, d: 1.6, r: 0.3 }, b.z, b.h, P, 2), { tone: "mid" })];
  out.push(S(k.slabOf({ x: b.x + 1.6, y: y + 1.6, w: b.w - 3.2, d: 0.3, r: 0 }, b.z + 1.6, b.h - 3.2, P, 2), { tone: "lo" }));
  const notes = [[-22, 31, 9, 8.5], [-10, 25, 10, 13], [3, 32, 8, 7.5], [7, 23.5, 10, 7.5]];
  for (const [x, z, w, h] of notes) {
    const yy = y + 1.9;
    const rules = [0.3, 0.5, 0.7].map((f) => seg([x + 1.6, yy + 0.3, z + h * f], [x + w - 1.6, yy + 0.3, z + h * f])).join("");
    out.push(S(k.slabOf({ x, y: yy, w, d: 0.3, r: 0 }, z, h, P, 2), { tone: "hi", inner: Ln(rules, { tone: "faint", free: true }) }));
    out.push(S(L.sphereOf([x + w / 2, yy + 0.9, z + h - 1.2], 0.6, P, { steps: 16 }), { tone: "hi" }));
  }
  return out.join("");
}

// A wall calendar on the side wall: a header band over a grid of days, hung from a pin.
export function calendar() {
  const x = R.x0, y0 = -18, w = 16, z0 = 17, h = 19, hd = 4.5;
  const grid = [];
  for (let i = 1; i < 7; i++) grid.push(seg([x + 0.08, y0 + (w * i) / 7, z0], [x + 0.08, y0 + (w * i) / 7, z0 + h - hd]));
  for (let j = 1; j < 5; j++) grid.push(seg([x + 0.08, y0, z0 + ((h - hd) * j) / 5], [x + 0.08, y0 + w, z0 + ((h - hd) * j) / 5]));
  return S(k.slabOf({ x, y: y0, w: 0.08, d: w, r: 0 }, z0, h - hd, P, 2), { tone: "hi", inner: Ln(grid.join(""), { tone: "faint" }) }) +
    S(k.slabOf({ x, y: y0, w: 0.5, d: w, r: 0 }, z0 + h - hd, hd, P, 2), { tone: "mid" }) + S(L.sphereOf([x + 0.9, y0 + w / 2, z0 + h + 1], 0.6, P, { steps: 16 }), { tone: "hi" });
}
