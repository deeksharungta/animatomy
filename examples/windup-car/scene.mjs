import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D, box } from "./model.mjs";

// The room: a boarded floor running off the card, a skirting board and a papered wall behind. The boards
// run along the car's path, so only their butt joints, the wall's stripes and the toys move past.
const FL = { x0: -900, x1: 900, y0: -112, y1: 420 }, BW = 31, WALL = FL.y0;
const rows = Array.from({ length: Math.floor((FL.y1 - FL.y0) / BW) }, (_, i) => FL.y0 + i * BW);

export function floor() {
  const seams = rows.slice(1).map((y) => k.segment([FL.x0, y, 0], [FL.x1, y, 0], P)).join("");
  return S(box(FL.x0, FL.y0, -4, FL.x1, FL.y1, 0, 0.01), { tone: "lo", inner: Ln(seams, { tone: "faint" }) });
}
export function wall() {
  return S(box(FL.x0, WALL - 6, 0, FL.x1, WALL, 220, 0.01), { tone: "lo" }) +
    S(box(FL.x0, WALL, 0, FL.x1, WALL + 3, 13, 0.01, 0.4), { tone: "mid", inner: Ln(k.segment([FL.x0, WALL + 3, 9], [FL.x1, WALL + 3, 9], P), { tone: "faint" }) });
}

// What scrolls: repeated every period so the run can loop without a jump.
function joints(x0) {
  const T = C.WORLD.period;
  const out = [];
  rows.forEach((y, i) => {
    for (const f of [0.13, 0.63]) {
      const x = x0 + ((f + (i * 0.37) % 1) % 1) * T;
      out.push(k.segment([x, y, 0], [x, y + BW, 0], P));
    }
  });
  return out.join("");
}
function stripes(x0) {
  const out = [], T = C.WORLD.period;
  for (let x = x0; x < x0 + T; x += 25) out.push(k.segment([x, WALL, 13], [x, WALL, 220], P));
  return Ln(out.join(""), { tone: "faint" });
}

// Toys on the floor behind the car: a stack of wooden blocks, a ball and a picture book.
function blocks(x, y) {
  const s = 18, out = [`<path class="iso-halo" d="${k.haloOf({ x: x - 3, y: y - 3, w: s * 2 + 8, d: s + 6, r: 4 }, 0, 0.5, P)}"/>`];
  const cube = (cx, cy, z) => {
    const plan = { x: cx, y: cy, w: s, d: s, r: 1 };
    return S(k.slabOf(plan, z, s, P, 3, 0.8), { tone: "mid", inner: Ln(k.planOutline(k.insetPlan(plan, 3.5), z + s, P, 3), { tone: "faint" }) });
  };
  out.push(cube(x, y, 0), cube(x + s + 2, y, 0), cube(x + 13, y + 1, s));
  return out.join("");
}
function ball(x, y) {
  const r = 17, c = [x, y, r];
  return `<path class="iso-halo" d="${k.haloOf({ x: x - r, y: y - r, w: 2 * r, d: 2 * r, r }, 0, 0.5, P)}"/>` +
    S(L.sphereOf(c, r, P), { tone: "hi", inner: Ln(L.arcOf(L.frameAlong(c, [0.3, 0.5, 0.8]), 0, r, P) + L.arcOf(L.frameAlong(c, [0.9, -0.3, 0.2]), 0, r, P), { tone: "faint" }) });
}
function book(x, y) {
  const plan = { x, y, w: 80, d: 54, r: 1.5 };
  const pages = [3, 6, 9].map((z) => k.segment([x + 80, y + 3, z], [x + 80, y + 51, z], P)).join("");
  return S(k.slabOf(plan, 0, 12, P, 3, 0.6), { tone: "mid", inner: Ln(pages, { tone: "faint" }) }) +
    S(k.slabOf({ x: x + 12, y: y + 9, w: 46, d: 34, r: 1 }, 12, 0.6, P, 3), { tone: "hi" });
}

const copies = () => [-1, 0, 1, 2].map((n) => n * C.WORLD.period - C.WORLD.period / 2);
export const worldLines = () => copies().map((x0) => Ln(joints(x0), { tone: "faint" }) + stripes(x0)).join("");
export const worldProps = () => copies().map((x0) => book(x0 + 30, -104) + blocks(x0 + 250, -106) + ball(x0 + 430, -84)).join("");
