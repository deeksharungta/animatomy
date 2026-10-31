import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D, rod, pipe, disc } from "./model.mjs";

// The movement: a back plate with its pillars, the going train's wheels and arbors, the dial's chapter ring,
// the strike train's pin wheel, fly and bell, and the brackets the crew stand on. The front plate is left off.
const Y = C.WHEEL_Y, PY = C.PLATE_Y + 1.2;
const arbor = (x, z, y1, r = 0.55) => S(rod([x, PY, z], [0, 1, 0], r, 0, y1 - PY, 10), { tone: "hi" });
const pinion = (x, z, r) => S(rod([x, Y + 0.7, z], [0, 1, 0], r, 0, 1.6, 14), { tone: "hi" });

export function plate() {
  const out = [S(k.slabOf({ x: -17, y: C.PLATE_Y, w: 34, d: 1.2, r: 0.6 }, 152.5, 48.5, P, 3, 0.3), { tone: "mid" })];
  out.push(D([[-15, PY, 198.5], [15, PY, 198.5], [-15, PY, 154.5], [15, PY, 154.5]].map(at), { size: 0.5, tone: "mid" }));
  out.push(S(k.slabOf({ x: -12, y: C.PLATE_Y, w: 24, d: 1.2, r: 0.4 }, 150, 2.6, P, 2), { tone: "mid" }));
  return out.join("");
}

// The pillars that would hold the missing front plate, and the posts of the dial behind the chapter ring.
export function pillars(front) {
  const list = front ? [[15, 154.5], [15, 198.5]] : [[-15, 154.5], [-15, 198.5]];
  return list.map(([x, z]) => S(rod([x, PY, z], [0, 1, 0], 0.8, 0, 8.6, 12), { tone: "hi" }) + S(rod([x, PY + 8.6, z], [0, 1, 0], 1.1, 0, 0.9, 12), { tone: "hi" })).join("");
}

export function wheels() {
  const { GREAT: G, CENTER: Ce, THIRD: T, ESC: E, BARREL: B } = C;
  const out = [];
  out.push(arbor(T.x, T.z, Y + 3), S(disc(T.x, T.z, T.r, Y), { tone: "hi", crease: "lo" }), pinion(T.x, T.z, 1.8));
  out.push(arbor(E.x, E.z, Y + 2.4), pinion(E.x, E.z, 1.4));
  out.push(arbor(Ce.x, Ce.z, C.DIAL.y + 1.2, 0.7), S(disc(Ce.x, Ce.z, Ce.r, Y), { tone: "hi", crease: "lo" }), pinion(Ce.x, Ce.z, 2.4));
  out.push(arbor(G.x, G.z, C.CRANK.y, 0.8), S(disc(G.x, G.z, G.r, Y), { tone: "hi", crease: "lo" }));
  out.push(S(L.solidOf([[0, B.r + 0.8], [0.6, B.r + 0.8], [0.6, B.r], [B.y1 - B.y0 - 0.6, B.r], [B.y1 - B.y0 - 0.6, B.r + 0.8], [B.y1 - B.y0, B.r + 0.8]], L.frameAlong([G.x, B.y0, G.z], [0, 1, 0]), P), { tone: "hi", crease: "lo" }));
  out.push(Ln([1.6, 2.6, 3.6, 4.6].map((s) => L.arcOf(L.frameAlong([G.x, B.y0, G.z], [0, 1, 0]), s, B.r + 0.05, P)).join(""), { tone: "lo" }));
  return out.join("");
}

// The ratchet and click on the great wheel, which let Hickory wind one way only.
export function click() {
  const G = C.GREAT;
  return S(disc(G.x, G.z, 4.4, Y + 0.7, 0.6), { tone: "mid" }) + S(rod([G.x - 5.4, Y + 1, G.z + 2.6], [0, 1, 0], 0.5, 0, 1, 8), { tone: "hi" });
}

// The chapter ring, standing on its posts in front of the wheels: twelve hour marks and sixty minute ticks.
export function dial() {
  const D0 = C.DIAL, Ce = C.CENTER, F = L.frameAlong([Ce.x, D0.y, Ce.z], [0, 1, 0]);
  const out = [];
  for (const a of [0.6, 2.55, 4.2]) out.push(S(rod([Ce.x + 10 * Math.cos(a), PY + 8.6, Ce.z + 10 * Math.sin(a)], [0, 1, 0], 0.5, 0, D0.y - PY - 8.6, 8), { tone: "mid" }));
  out.push(S(L.ringBand(0, 0.6, D0.r0, D0.r1, F, P, { hole: [0.6, D0.r0] }), { tone: "hi", crease: "lo" }));
  const y = D0.y + 0.62, ticks = [], hours = [];
  for (let i = 0; i < 60; i++) {
    const a = Math.PI / 2 - (i / 60) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
    if (i % 5) ticks.push(k.segment([Ce.x + (D0.r1 - 1) * c, y, Ce.z + (D0.r1 - 1) * s], [Ce.x + (D0.r1 - 0.2) * c, y, Ce.z + (D0.r1 - 0.2) * s], P));
    else hours.push(k.segment([Ce.x + (D0.r0 + 0.4) * c, y, Ce.z + (D0.r0 + 0.4) * s], [Ce.x + (D0.r1 - 0.2) * c, y, Ce.z + (D0.r1 - 0.2) * s], P));
  }
  out.push(Ln(ticks.join(""), { tone: "lo", free: true }) + Ln(hours.join(""), { tone: "hi", free: true }));
  return out.join("");
}

// Brackets off the plate: a cock just behind the escape wheel for Pinch, a perch by the hammer for Knock.
export const COCK = { x: 0.4, w: 5.2, top: 185 };
export const PERCH = { x: -26, y: -20, w: 5, d: 5, top: 194 };
export function brackets() {
  const out = [];
  out.push(S(k.slabOf({ x: COCK.x, y: PY, w: COCK.w, d: 2.8, r: 0.5 }, COCK.top - 2, 2, P, 3, 0.3), { tone: "mid" }));
  out.push(S(k.slabOf({ x: PERCH.x + 4, y: C.PLATE_Y, w: 4, d: PERCH.d + 1, r: 0.4 }, PERCH.top - 6, 3, P, 2), { tone: "mid" }));
  out.push(S(k.slabOf({ x: PERCH.x, y: PERCH.y, w: PERCH.w, d: PERCH.d, r: 0.6 }, PERCH.top - 3, 3, P, 3, 0.3), { tone: "mid" }));
  return out.join("");
}

// The strike train: the pin wheel's disc, the fly's arbor, the hammer's cock, and the bell on its standard.
export function strike() {
  const { PINS: N, FLY: F, HAMMER: H, BELL: B } = C;
  const out = [arbor(N.x, N.z, Y + 1.4), S(disc(N.x, N.z, N.r, Y), { tone: "hi", crease: "lo" })];
  out.push(arbor(F.x, F.z, Y + 3.2, 0.45));
  out.push(S(k.slabOf({ x: H.x - 1.4, y: C.PLATE_Y, w: 2.8, d: H.y - C.PLATE_Y - 0.6, r: 0.4 }, H.z - 1.6, 3.2, P, 2), { tone: "mid" }));
  out.push(pipe([[B.x, PY - 0.6, 200.5], [B.x, PY - 0.6, 212], [B.x, B.y, 212], [B.x, B.y, B.z + 3.4]], 0.5, { tone: "mid", bend: 1.4 }));
  out.push(S(L.solidOf([[0, B.r], [0.6, B.r - 0.2, 1], [3, B.r - 1, 1], [5.4, B.r - 3, 1], [6.6, 1.4, 1], [7, 0.6]], L.frameAlong([B.x, B.y, B.z - 3.6], [0, 0, 1]), P), { tone: "hi", crease: "none" }));
  return out.join("");
}

// The pendulum's brass bob, drawn at rest and moved by the page, and the weight drawn at the top of its travel.
export function bob() {
  const Pn = C.PEND, z = Pn.z - Pn.len;
  return S(L.solidOf([[0, Pn.bob - 2.4], [0.9, Pn.bob, 1], [1.8, Pn.bob - 2.4]], L.frameAlong([C.ESC.x, Pn.y - 0.9, z], [0, 1, 0]), P), { tone: "hi", crease: "none" }) +
    S(rod([C.ESC.x, Pn.y, z - Pn.bob - 0.4], [0, 0, 1], 0.9, 0, 1.6, 12), { tone: "mid" });
}

export function weight() {
  const W = C.WEIGHT, x = C.GREAT.x + C.BARREL.r, y = (C.BARREL.y0 + C.BARREL.y1) / 2, z = W.high;
  return S(L.solidOf([[0, W.r - 0.6], [0.8, W.r, 1], [W.h - 0.8, W.r, 1], [W.h, W.r - 0.6]], L.frameAlong([x, y, z], [0, 0, 1]), P), { tone: "hi", crease: "none" }) +
    Ln([4, W.h - 4].map((s) => L.arcOf(L.frameAlong([x, y, z], [0, 0, 1]), s, W.r, P)).join(""), { tone: "faint" }) +
    pipe([[x - 1, y, z + W.h], [x - 1, y, z + W.h + 1.4], [x + 1, y, z + W.h + 1.4], [x + 1, y, z + W.h]], 0.35, { tone: "mid", bend: 0.8, caps: false });
}
