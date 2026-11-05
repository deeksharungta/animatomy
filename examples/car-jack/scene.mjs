// The garage around the jack, in the kit's own tones: a concrete floor with saw-cut joints, a block wall behind with a
// pegboard of spanners, a side wall with a socket, and a bottle of jack oil on the floor.
import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { P, at, S, Ln, D, FLOOR, WALL_TOP } from "./model.mjs";

const F = FLOOR, X1 = F.x + F.w, Y1 = F.y + F.d;
const up = (x, y, z) => L.frameOf([x, y, z], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
const onBack = (x, z, dy = 0) => at([x, F.y + dy, z]);

export function room() {
  const out = [];
  out.push(S(k.slabOf({ x: F.x - 6, y: F.y - 6, w: F.w + 6, d: 6, r: 0.5 }, -10, WALL_TOP + 10, P, 2), { tone: "mid" }));
  out.push(S(k.slabOf({ x: F.x - 6, y: F.y, w: 6, d: F.d, r: 0.5 }, -10, WALL_TOP + 10, P, 2), { tone: "mid" }));
  // Block courses: bed joints run the length of both walls and turn the corner; perpends stagger course by course.
  const h = [], v = [], CO = 40, BL = 80;
  for (let z = CO; z < WALL_TOP; z += CO) h.push(k.pathOf([at([X1, F.y, z]), at([F.x, F.y, z]), at([F.x, Y1, z])]));
  for (let z = 0, i = 0; z < WALL_TOP - 1; z += CO, i++) {
    const z1 = Math.min(WALL_TOP, z + CO);
    for (let x = F.x + 30 + (i % 2) * (BL / 2); x < X1 - 4; x += BL) v.push(k.segment([x, F.y, z], [x, F.y, z1], P));
    for (let y = F.y + 30 + (i % 2) * (BL / 2); y < Y1 - 4; y += BL) v.push(k.segment([F.x, y, z], [F.x, y, z1], P));
  }
  out.push(Ln(h.join("") + v.join(""), { tone: "faint" }));
  for (const p of [{ x: F.x, y: F.y, w: F.w, d: 4, r: 0.4 }, { x: F.x, y: F.y + 4, w: 4, d: F.d - 4, r: 0.4 }]) out.push(S(k.slabOf(p, 0, 14, P, 2, 0.5), { tone: "hi", inner: Ln(k.sideSeam(p, 10, P, 2), { tone: "faint" }) }));
  // A pegboard on the back wall: a board on four stand-offs, a grid of holes, and three spanners on their hooks.
  const pb = { x0: 120, x1: 250, z0: 120, z1: 230 };
  out.push(S(k.slabOf({ x: pb.x0, y: F.y, w: pb.x1 - pb.x0, d: 3, r: 0.6 }, pb.z0, pb.z1 - pb.z0, P, 2, 0.4), { tone: "hi" }));
  const holes = [];
  for (let x = pb.x0 + 10; x < pb.x1 - 4; x += 12) for (let z = pb.z0 + 10; z < pb.z1 - 4; z += 12) holes.push(onBack(x, z, 3));
  out.push(D(holes, { size: 0.4, tone: "faint" }));
  out.push(D([[pb.x0 + 4, pb.z0 + 4], [pb.x1 - 4, pb.z0 + 4], [pb.x0 + 4, pb.z1 - 4], [pb.x1 - 4, pb.z1 - 4]].map(([x, z]) => onBack(x, z, 3)), { size: 0.55, tone: "mid" }));
  [[146, 26, 7], [178, 34, 8], [212, 40, 9.5]].forEach(([x, len, w]) => out.push(spanner(x, 212, len * 2.2, w)));
  // The socket on the side wall: a faceplate with its switch and screws.
  const sy = -40, sz = 70;
  out.push(S(k.slabOf({ x: F.x, y: sy - 14, w: 2.4, d: 28, r: 1.6 }, sz - 14, 28, P, 3, 0.4), { tone: "hi" }));
  out.push(S(k.slabOf({ x: F.x + 2.4, y: sy + 3, w: 1.6, d: 7, r: 0.5 }, sz - 4, 9, P, 2), { tone: "mid" }));
  out.push(D([[F.x + 2.4, sy - 10, sz + 10], [F.x + 2.4, sy + 10, sz - 10]].map(at), { size: 0.5 }));
  return out.join("");
}

// A combination spanner hanging by its ring end from a peg: a shank with an open jaw at the bottom.
function spanner(x, z, len, w) {
  const y = F.y + 3, out = [];
  const shank = [[x - w * 0.32, z - w * 0.7], [x + w * 0.32, z - w * 0.7], [x + w * 0.28, z - len + w], [x - w * 0.28, z - len + w]];
  out.push(S(L.prismOf(L.frameOf([0, y, 0], [0, 1, 0], [1, 0, 0], [0, 0, 1]), shank, 0, 1.2, P), { tone: "hi" }));
  const ring = L.frameOf([x, y, z], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  out.push(S(L.ringBand(0, 1.4, w * 0.4, w * 0.75, ring, P), { tone: "hi", crease: "lo" }));
  out.push(S(L.disc(0, 4, 1.2, L.frameOf([x, y - 0.5, z + w * 0.42], [0, 1, 0], [1, 0, 0], [0, 0, 1]), P), { tone: "mid" }));
  const jaw = L.frameOf([x, y, z - len + w * 0.4], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  out.push(S(L.prismOf(jaw, [[-w * 0.85, -w * 0.2], [-w * 0.3, -w * 0.9], [w * 0.3, -w * 0.9], [w * 0.85, -w * 0.2], [w * 0.5, w * 0.6], [-w * 0.5, w * 0.6]], 0, 1.4, P), { tone: "hi", crease: "lo" }));
  out.push(`<path class="cj-void" d="${k.pathOf([[-w * 0.3, -w * 0.95], [-w * 0.26, -w * 0.1], [w * 0.26, -w * 0.1], [w * 0.3, -w * 0.95]].map(([u, v]) => at(L.pointOf(jaw, 1.45, 0, 0).map((c, i) => c + [u, 0, v][i]))), true)}"/>`);
  return out.join("");
}

export function floor() {
  const out = [S(k.slabOf(F, -10, 10, P, 2), { tone: "mid", inner: Ln(k.sideSeam(F, -4, P, 2), { tone: "faint" }) })];
  // Saw-cut joints in the slab, a painted bay line near the front, and a floor drain's grate.
  const cuts = [k.lineOnTop([F.x, -200], [X1, -200], 0, P), k.lineOnTop([170, F.y], [170, Y1], 0, P), k.lineOnTop([-260, F.y], [-260, Y1], 0, P)];
  out.push(Ln(cuts.join(""), { tone: "lo" }));
  out.push(Ln(k.planOutline({ x: F.x, y: 52, w: F.w, d: 8, r: 0 }, 0, P, 1), { tone: "faint" }));
  const g = { x: 150, y: -120, w: 44, d: 44, r: 2 };
  out.push(S(k.slabOf(g, 0, 0.6, P, 2), { tone: "lo" }));
  out.push(Ln(Array.from({ length: 6 }, (_, i) => k.lineOnTop([g.x + 6 + i * 6.4, g.y + 5], [g.x + 6 + i * 6.4, g.y + g.d - 5], 0.6, P)).join(""), { tone: "faint", free: true }));
  out.push(D(k.corners(g, 3).map(([x, y]) => at([x, y, 0.6])), { size: 0.45 }));
  return out.join("");
}

// Behind the jack: a bottle of jack oil by the wall, with its cap, a ribbed grip band and a blank label.
export function propsBack() {
  const out = [], [bx, by] = [210, -240], B = up(bx, by, 0);
  out.push(`<path class="iso-halo" d="${k.haloOf({ x: bx - 30, y: by - 30, w: 60, d: 60, r: 30 }, 0, 1, P)}"/>`);
  out.push(S(L.solidOf([[0, 23], [2, 25, 1], [92, 25, 1], [104, 18, 1], [110, 10], [116, 9]], B, P), { tone: "hi", inner: Ln(L.arcOf(B, 30, 25, P) + L.arcOf(B, 74, 25, P), { tone: "lo" }) }));
  out.push(Ln([62, 54, 46].map((z, i) => L.arcOf(B, z, 25, P, { from: 0.4 + i * 0.12, to: 1.9 - i * 0.2 })).join(""), { tone: "lo", free: true }));
  const cap = up(bx, by, 116);
  out.push(S(L.disc(0, 14, 11, cap, P), { tone: "mid", inner: k.fadedSvg(L.ribsOf(cap, 0, 14, 11, 36, P, { fade: [0.05, 0.45] }), { tone: "lo" }) }));
  out.push(Ln(L.arcOf(cap, 14, 8, P, { least: -1 }), { tone: "faint" }));
  return out.join("");
}

