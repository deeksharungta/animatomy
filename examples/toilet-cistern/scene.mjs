// The bathroom around the cistern, in the kit's own tones: a tiled corner, a tiled floor, a paper roll on its holder,
// the cistern's lid leaning on the wall where you put it down, and a brush in its pot.
import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { P, at, S, Ln, D, ROOM } from "./model.mjs";

const up = (x, y, z) => L.frameOf([x, y, z], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
const alongX = (x, y, z) => L.frameOf([x, y, z], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
const TILE = 150, DADO = 1200;

export function room() {
  const out = [], { x0, x1, y1, top } = ROOM;
  out.push(S(k.slabOf({ x: x0 - 12, y: -12, w: x1 - x0 + 12, d: 12, r: 0.5 }, -20, top + 20, P, 2), { tone: "mid" }));
  out.push(S(k.slabOf({ x: x0 - 12, y: 0, w: 12, d: y1, r: 0.5 }, -20, top + 20, P, 2), { tone: "mid" }));
  // Tiles: the courses run round the corner and end on the floor and the wall tops; the joints stop on both.
  const h = [], v = [];
  for (let z = TILE; z < top; z += TILE) h.push(k.pathOf([at([x1, -12, z]), at([x1, 0, z]), at([x0, 0, z]), at([x0, y1, z]), at([x0 - 12, y1, z])]));
  for (let x = x0 + TILE; x < x1 - 4; x += TILE) v.push(k.segment([x, 0, 0], [x, 0, top], P));
  for (let y = TILE; y < y1 - 4; y += TILE) v.push(k.segment([x0, y, 0], [x0, y, top], P));
  out.push(Ln(h.join("") + v.join(""), { tone: "faint" }));
  // A skirting tile course along both walls, proud of the tiles.
  out.push(S(k.slabOf({ x: x0, y: 0, w: x1 - x0, d: 6, r: 0.5 }, 0, 70, P, 2), { tone: "mid" }));
  out.push(S(k.slabOf({ x: x0, y: 6, w: 6, d: y1 - 6, r: 0.5 }, 0, 70, P, 2), { tone: "mid" }));
  out.push(rollHolder(), shelf());
  return out.join("");
}

// A small shelf on two brackets right of the cistern, with a potted plant and a pump bottle of soap.
function shelf() {
  const out = [], z = 790;
  for (const x of [262, 378]) out.push(S(k.slabOf({ x: x - 3, y: 0, w: 6, d: 70, r: 0.6 }, z - 40, 40, P, 2), { tone: "mid" }), D([at([x, 0.5, z - 30])], { size: 0.7 }));
  out.push(S(k.slabOf({ x: 240, y: 0, w: 160, d: 90, r: 2 }, z, 8, P, 3, 0.8), { tone: "hi", crease: "lo" }));
  const pot = up(290, 44, z + 8);
  out.push(S(L.solidOf([[0, 22], [44, 28], [46, 30, 1], [52, 30]], pot, P, { fill: "hull" }), { tone: "hi", crease: "faint", inner: Ln(L.arcOf(pot, 44, 28.1, P), { tone: "faint" }) }));
  for (const [dx, dy, h, r] of [[-8, -4, 70, 7], [6, 4, 86, 6], [10, -8, 60, 6], [-4, 8, 78, 5]]) out.push(S(L.solidOf([[0, 1.5], [h * 0.5, r, 1], [h, 0.1, 1]], L.frameOf([290 + dx, 44 + dy, z + 50], [dx * 0.012, dy * 0.012, 1], [1, 0, 0], [0, 1, 0]), P), { tone: "mid", crease: "faint" }));
  const b = up(354, 40, z + 8);
  out.push(S(L.solidOf([[0, 16], [60, 16], [66, 9, 1], [72, 5]], b, P), { tone: "hi", crease: "faint", inner: Ln(L.arcOf(b, 22, 16.1, P) + L.arcOf(b, 46, 16.1, P), { tone: "faint" }) }));
  out.push(S(k.cylinder(354, 40, 3, z + 80, 14, P, 12), { tone: "hi" }), S(k.slabOf({ x: 352, y: 38, w: 18, d: 4, r: 1 }, z + 94, 5, P, 2), { tone: "hi" }));
  return out.join("");
}

// The paper roll on a chrome holder screwed to the left wall: rose, arm, spindle, the roll and its loose sheet.
function rollHolder() {
  const out = [], x = ROOM.x0, y = 420, z = 640;
  out.push(S(L.disc(0, 6, 30, alongX(x, y, z), P), { tone: "hi", crease: "lo" }));
  out.push(D(L.dotsOf(alongX(x, y, z), 6, 22, 2, P, { phase: 1.57, all: true }), { size: 0.6 }));
  out.push(S(k.slabOf({ x: x + 6, y: y - 8, w: 60, d: 16, r: 6 }, z - 8, 16, P, 4, 0.6), { tone: "hi", crease: "lo" }));
  out.push(S(L.disc(0, 120, 9, L.frameOf([x + 56, y + 8, z], [0, 1, 0], [0, 0, 1], [1, 0, 0]), P), { tone: "hi" }));
  const F = L.frameOf([x + 56, y + 12, z], [0, 1, 0], [0, 0, 1], [1, 0, 0]);
  out.push(S(L.solidOf([[0, 52], [1.5, 54, 1], [96, 54], [97.5, 52, 1]], F, P), { tone: "hi", crease: "faint", inner: Ln([24, 48, 72].map((s) => L.arcOf(F, s, 54, P)).join(""), { tone: "faint" }) }));
  out.push(S(L.disc(97.5, 98, 21, F, P), { tone: "mid" }));
  // The loose sheet hangs from the roll's front, perforations across it.
  out.push(S(k.extrude([[x + 110, y + 14], [x + 110.6, y + 14], [x + 110.6, y + 106], [x + 110, y + 106]], z - 150, 150, P), { tone: "hi", inner: Ln([z - 50, z - 120].map((zz) => k.segment([x + 110.6, y + 14, zz], [x + 110.6, y + 106, zz], P)).join(""), { tone: "faint", dashed: true }) }));
  return out.join("");
}

export function floor() {
  const out = [], { x0, x1, y1 } = ROOM, g = [];
  out.push(S(k.slabOf({ x: x0, y: 0, w: x1 - x0, d: y1, r: 0.5 }, -20, 20, P, 2), { tone: "mid" }));
  for (let y = TILE; y < y1 - 4; y += TILE) g.push(k.lineOnTop([x0, y], [x1, y], 0, P));
  for (let x = x0 + TILE; x < x1 - 4; x += TILE) g.push(k.lineOnTop([x, 0], [x, y1], 0, P));
  out.push(Ln(g.join(""), { tone: "faint" }));
  return out.join("");
}

// The cistern's lid, lifted off and leaning on the back wall right of the pan: its underside toward you, with the
// locating lip that sits inside the tank's ledge and two stiffening ribs.
export function lid() {
  const out = [], x = 250, w = 190, tilt = 0.24, len = 460, t = 22, n = [0, Math.cos(tilt), Math.sin(tilt)];
  const F = L.frameOf([x, 6 + len * Math.sin(tilt), 0], [0, -Math.sin(tilt), Math.cos(tilt)], [1, 0, 0], n);
  out.push(`<path class="iso-halo" d="${k.haloOf({ x: x - 6, y: 100, w: w + 12, d: 40, r: 8 }, 0, 1, P)}"/>`);
  const box = (u0, u1, v0, v1, s0, s1) => L.prismOf(F, [[u0, v0], [u1, v0], [u1, v1], [u0, v1]], s0, s1, P);
  out.push(S(box(0, w, 0, t, 0, len), { tone: "hi", crease: "lo" }));
  out.push(S(box(12, w - 12, t, t + 6, 12, len - 12), { tone: "hi", crease: "faint" }));
  for (const u of [62, w - 66]) out.push(S(box(u, u + 4, t + 6, t + 9, 30, len - 30), { tone: "mid", crease: "faint" }));
  return out.join("");
}

// A brush in its pot on the floor, right of the pan: the pot, its rim, the handle and the knob.
export function brush() {
  const out = [], x = 330, y = 340, F = up(x, y, 0);
  out.push(`<path class="iso-halo" d="${k.haloOf({ x: x - 56, y: y - 56, w: 112, d: 112, r: 56 }, 0, 1, P)}"/>`);
  out.push(S(L.solidOf([[0, 44], [3, 48, 1], [120, 52], [124, 54, 1], [130, 54]], F, P, { fill: "hull" }), { tone: "hi", crease: "faint", inner: Ln(L.arcOf(F, 20, 48.6, P), { tone: "faint" }) }));
  out.push(`<path class="iso-halo" d="${k.ring(x, y, 48, 130, P, 48)}" style="opacity:.9"/>`);
  out.push(S(k.cylinder(x + 6, y - 4, 7, 130, 230, P, 20), { tone: "hi" }));
  out.push(S(L.sphereOf([x + 6, y - 4, 366], 13, P), { tone: "hi" }));
  return out.join("");
}
