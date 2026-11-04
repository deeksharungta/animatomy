// The kitchen around the opener, in the kit's own tones: a tiled wall pair, the counter, the socket the cord runs to,
// a saucepan waiting for the soup, two more cans on the counter and a wooden spoon in front.
import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { ellipsoidOf } from "../../kit/critters.mjs";
import { P, at, DESK, ROOM_TOP } from "./model.mjs";

const S = (paths, style) => k.solidSvg(paths, style);
const Ln = (d, style) => k.lineSvg(d, style);
const D = (pts, style) => k.dotsSvg(pts, style);
const up = (x, y, z) => L.frameOf([x, y, z], [0, 0, 1], [1, 0, 0], [0, 1, 0]);

export const SOCKET = { x: -112, y: DESK.y - 6, z: 40 };

export function room() {
  const out = [];
  const yb = DESK.y - 6, xl = DESK.x - 6;
  out.push(S(k.slabOf({ x: DESK.x - 6, y: yb, w: DESK.w + 6, d: 6, r: 0.6 }, -16, ROOM_TOP + 16, P, 2), { tone: "mid" }));
  out.push(S(k.slabOf({ x: xl, y: yb + 6, w: 6, d: DESK.d, r: 0.6 }, -16, ROOM_TOP + 16, P, 2), { tone: "mid" }));
  // Tiles: horizontal joints run the full width and turn the corner; vertical joints stop on the counter and the top.
  const h = [], v = [];
  for (let z = 16; z < ROOM_TOP; z += 18) h.push(k.pathOf([at([DESK.x + DESK.w, yb, z]), at([DESK.x + DESK.w, DESK.y, z]), at([DESK.x, DESK.y, z]), at([DESK.x, DESK.y + DESK.d, z]), at([xl, DESK.y + DESK.d, z])]));
  for (let x = DESK.x + 18; x < DESK.x + DESK.w - 2; x += 18) v.push(k.segment([x, DESK.y, 0], [x, DESK.y, ROOM_TOP], P));
  for (let y = DESK.y + 18; y < DESK.y + DESK.d - 2; y += 18) v.push(k.segment([DESK.x, y, 0], [DESK.x, y, ROOM_TOP], P));
  out.push(Ln(h.join("") + v.join(""), { tone: "faint" }));
  // The socket the cord is plugged into: a faceplate, two screws, the switch rocker and the plug body.
  const s = SOCKET;
  out.push(S(k.slabOf({ x: s.x - 11, y: DESK.y, w: 22, d: 2, r: 1 }, s.z - 11, 22, P, 3, 0.4), { tone: "hi" }));
  out.push(D([[s.x - 8, DESK.y + 2, s.z + 8], [s.x + 8, DESK.y + 2, s.z - 8]].map(at), { size: 0.5 }));
  out.push(S(k.slabOf({ x: s.x + 2, y: DESK.y + 2, w: 6, d: 1.4, r: 0.4 }, s.z + 2, 6, P, 2), { tone: "mid" }));
  out.push(S(k.slabOf({ x: s.x - 8, y: DESK.y + 2, w: 8, d: 6, r: 1.2 }, s.z - 7, 9, P, 3, 0.4), { tone: "hi" }));
  // A shelf bracket with a ladle hanging from its rail.
  out.push(S(k.slabOf({ x: 30, y: DESK.y, w: 70, d: 14, r: 1 }, 132, 4, P, 3, 0.5), { tone: "hi" }));
  out.push(S(k.slabOf({ x: 36, y: DESK.y, w: 4, d: 10, r: 0.6 }, 118, 14, P, 2), { tone: "mid" }) + S(k.slabOf({ x: 90, y: DESK.y, w: 4, d: 10, r: 0.6 }, 118, 14, P, 2), { tone: "mid" }));
  out.push(D([[38, DESK.y + 10, 122], [92, DESK.y + 10, 122]].map(at), { size: 0.5 }));
  for (const [x, hgt] of [[48, 22], [62, 28], [78, 18]]) {
    out.push(S(k.cylinder(x, DESK.y + 7, 5, 136, hgt, P, 24, 0.4), { tone: "hi" }) + S(k.cylinder(x, DESK.y + 7, 5.4, 136 + hgt, 3, P, 24, 0.4), { tone: "mid" }));
  }
  return out.join("");
}

export function desk() {
  const out = [];
  const grain = [];
  for (let y = DESK.y + 12; y < DESK.y + DESK.d - 6; y += 14) grain.push(k.lineOnTop([DESK.x, y], [DESK.x + DESK.w, y], 0, P));
  out.push(S(k.slabOf(DESK, -16, 16, P, 4, 1), { tone: "mid", inner: Ln(k.sideSeam(DESK, -4, P, 4), { tone: "faint" }) }) + Ln(grain.join(""), { tone: "faint" }));
  return out.join("");
}

// Behind the opener: the saucepan and two more cans, drawn plain, like everything that isn't the subject.
export function propsBack() {
  const out = [];
  const [px, py] = [80, -48];
  out.push(`<path class="iso-halo" d="${k.haloOf({ x: px - 25, y: py - 25, w: 50, d: 50, r: 25 }, 0, 1, P)}"/>`);
  out.push(S(L.solidOf([[0, 21], [2, 23, 1], [34, 23], [35, 24]], up(px, py, 0), P, { fill: "hull" }), { tone: "hi", inner: Ln(L.arcOf(up(px, py, 0), 28, 23, P), { tone: "faint" }) }));
  out.push(`<path class="co-void" d="${k.ring(px, py, 22, 35, P, 64)}"/>`);
  out.push(S(k.slabOf({ x: px - 62, y: py - 3, w: 40, d: 6, r: 3 }, 28, 4, P, 3, 0.4), { tone: "mid" }));
  out.push(D([[px - 25, py, 32], [px - 29, py, 32]].map(at), { size: 0.5 }));
  out.push(`<path class="co-void" d="${k.ring(px - 57, py, 2.2, 32, P, 20)}"/>`);
    return out.join("");
}

export function propsFront() {
  const out = [];
  const a = [-0.8, 0.6, 0], u = [0, 0, 1], v = [0.6, 0.8, 0];
  const F = L.frameOf([46, 64, 1.6], a, u, v);
  out.push(`<path class="iso-halo" d="${k.haloOf({ x: -16, y: 62, w: 66, d: 36, r: 12 }, 0, 1, P)}"/>`);
  out.push(S(L.prismOf(F, [[-1.4, -3], [1.4, -3], [1.4, 3], [-1.4, 3]], 0, 64, P), { tone: "hi", crease: "lo" }));
  out.push(D([at(L.pointOf(F, 6, 1.5, 0))], { size: 0.7, tone: "mid" }));
  const c = L.pointOf(F, 74, 0, 0);
  // A flat tin waiting its turn, plain, beside the spoon.
  const T = up(96, 44, 0);
  out.push(`<path class="iso-halo" d="${k.haloOf({ x: 70, y: 18, w: 52, d: 52, r: 26 }, 0, 1, P)}"/>`);
  out.push(S(L.solidOf([[0, 23.4], [28.5, 23.4]], T, P, { fill: "hull" }), { tone: "hi", inner: Ln([2.5, 9, 19, 26].map((s) => L.arcOf(T, s, 23.4, P)).join(""), { tone: "faint" }) }));
  out.push(Ln(k.ring(96, 44, 20.5, 28.5, P, 56) + k.ring(96, 44, 13, 28.5, P, 48), { tone: "faint" }));
  out.push(S(ellipsoidOf([c[0], c[1], 2.6], [[-8.8, 6.6, 0], [4.2, 5.6, 0], [0, 0, 2.6]], P, { steps: 32 }), { tone: "hi" }));
  return out.join("");
}
