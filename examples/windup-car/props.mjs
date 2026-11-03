import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { P, at, S, Ln, D, box } from "./model.mjs";

const halo = (x, y, w, d, r) => `<path class="iso-halo" d="${k.haloOf({ x, y, w, d, r }, 0, 0.5, P)}"/>`;

// A stack of wooden blocks, each with a sunk panel on top; every prop is in the drawing's own tones.
export function blocks(x, y) {
  const s = 18, out = [halo(x - 3, y - 3, s * 2 + 8, s + 6, 4)];
  const cube = (cx, cy, z) => {
    const plan = { x: cx, y: cy, w: s, d: s, r: 1 };
    return S(k.slabOf(plan, z, s, P, 3, 0.8), { tone: "mid", inner: Ln(k.planOutline(k.insetPlan(plan, 3.5), z + s, P, 3), { tone: "faint" }) });
  };
  out.push(cube(x, y, 0), cube(x + s + 2, y, 0), cube(x + 13, y + 1, s));
  return out.join("");
}
// A rubber ball with two seams round it.
export function ball(x, y) {
  const r = 17, c = [x, y, r];
  return halo(x - r, y - r, 2 * r, 2 * r, r) +
    S(L.sphereOf(c, r, P), { tone: "hi", inner: Ln(L.arcOf(L.frameAlong(c, [0.3, 0.5, 0.8]), 0, r, P) + L.arcOf(L.frameAlong(c, [0.9, -0.3, 0.2]), 0, r, P), { tone: "faint" }) });
}
// A picture book lying shut, its page edges showing round its sides.
export function book(x, y) {
  const plan = { x, y, w: 56, d: 40, r: 1.2 };
  const pages = [2.2, 4.4, 6.6].map((z) => k.sideSeam(plan, z, P, 3)).join("");
  return halo(x - 2, y - 2, 60, 44, 2) + S(k.slabOf(plan, 0, 9, P, 3, 0.5), { tone: "mid", inner: Ln(pages, { tone: "faint" }) }) +
    S(k.slabOf({ x: x + 9, y: y + 7, w: 32, d: 26, r: 0.8 }, 9, 0.5, P, 3), { tone: "hi" });
}
// A planked toy box with corner battens, a lid with a lip, strap hinges and a wooden grip.
export function toyBox(x, y) {
  const w = 60, d = 32, h = 30, plan = { x, y, w, d, r: 1 };
  const planks = k.sideSeam(plan, 10, P, 3) + k.sideSeam(plan, 20, P, 3);
  const batten = (bx, by) => S(box(bx, by, 0, bx + 4, by + 4, h, 0.4, 0.3), { tone: "hi" });
  const lid = { x: x - 2, y: y - 2, w: w + 4, d: d + 4, r: 1.6 };
  return halo(x - 3, y - 3, w + 6, d + 6, 3) + S(k.slabOf(plan, 0, h, P, 3, 0.4), { tone: "mid", inner: Ln(planks, { tone: "faint" }) }) +
    batten(x + w - 4, y + d - 4) + batten(x, y + d - 4) + batten(x + w - 4, y) +
    S(k.slabOf(lid, h, 4, P, 3, 0.6), { tone: "hi", inner: Ln(k.planOutline(k.insetPlan(lid, 6), h + 4, P, 3), { tone: "faint" }) }) +
    [x + 16, x + w - 16].map((hx) => S(box(hx - 2, y - 2.6, h - 6, hx + 2, y - 2, h + 2, 0.2), { tone: "hi" })).join("") +
    S(box(x + w / 2 - 8, y + d, 21, x + w / 2 + 8, y + d + 2.4, 24, 0.6, 0.3), { tone: "hi" }) + D([at([x + w / 2 - 5.5, y + d + 2.4, 22.5]), at([x + w / 2 + 5.5, y + d + 2.4, 22.5])], { size: 0.45, tone: "lo" });
}
// Two wooden skittles on their flat feet: a turned belly, a waist ring and a round head.
export function skittles(x, y) {
  const one = (cx, cy) => {
    const F = L.frameAlong([cx, cy, 0], [0, 0, 1]);
    return halo(cx - 6, cy - 6, 12, 12, 6) + S(L.solidOf([[0, 0], [0, 3.6], [0.6, 4, 1], [7, 5.9, 1], [14, 3.4, 1], [16.6, 2.6, 1], [17.4, 2.9], [18.2, 2.9], [19, 2.7, 1], [22, 3.5, 1], [25.4, 2.1, 1], [26.6, 0]], F, P), { tone: "hi", crease: "none", inner: Ln(L.arcOf(F, 17.4, 2.9, P) + L.arcOf(F, 18.2, 2.9, P), { tone: "faint" }) });
  };
  return one(x, y) + one(x + 16, y + 7);
}
// Three glass marbles, each with a swirl.
export function marbles(x, y) {
  return [[0, 0, 4.4], [11, 4, 4], [5, 12, 3.6]].map(([dx, dy, r]) => { const c = [x + dx, y + dy, r]; return S(L.sphereOf(c, r, P), { tone: "hi", inner: Ln(L.arcOf(L.frameAlong(c, [0.5, 0.2, 0.84]), 0, r, P), { tone: "faint" }) }); }).join("");
}
// The car's own box, set down on its lid: a card tray with its walls, and the card insert the car lay in.
export function carBox(x, y) {
  const w = 50, d = 24, h = 10, t = 1.1, lid = { x: x - 3, y: y - 2, w: w + 2, d: d + 2, r: 0.6 };
  const out = [halo(x - 4, y - 3, w + 6, d + 6, 3), S(k.slabOf(lid, 0, 2.4, P, 2, 0.3), { tone: "mid", inner: Ln(k.sideSeam(lid, 1.2, P, 2), { tone: "faint" }) })];
  const z = 2.4, wall = (x0, y0, x1, y1) => S(box(x0, y0, z + 1, x1, y1, z + h, 0.2), { tone: "mid" });
  out.push(S(box(x, y, z, x + w, y + d, z + 1, 0.4), { tone: "lo" }), wall(x, y, x + w, y + t), wall(x, y, x + t, y + d));
  out.push(S(box(x + 4, y + 4, z + 1, x + w - 4, y + d - 4, z + 5, 0.6, 0.3), { tone: "hi", inner: Ln(k.planOutline({ x: x + 8, y: y + 8, w: w - 16, d: d - 16, r: 2.4 }, z + 5, P, 4), { tone: "faint" }) }));
  out.push(wall(x + w - t, y, x + w, y + d), wall(x, y + d - t, x + w, y + d));
  return out.join("");
}
