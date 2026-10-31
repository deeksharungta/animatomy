import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { P, at, S, Ln, D, DESK, ROOM_TOP, byDepth, ringY, rod } from "./model.mjs";

// The kitchen around the machine: two tiled walls, a shelf of cups, the counter and a few props, all in the kit's tones.
export function room() {
  const out = [];
  out.push(S(k.slabOf({ x: -102, y: -98, w: 202, d: 6, r: 0.6 }, -19, ROOM_TOP + 19, P, 2), { tone: "mid" }));
  const back = [];
  for (let x = -90; x < 100; x += 16) back.push(k.segment([x, -92, -5], [x, -92, ROOM_TOP], P));
  for (let z = 11; z < ROOM_TOP; z += 16) back.push(k.segment([-96, -92, z], [100, -92, z], P));
  back.push(k.segment([100, -92, -19], [100, -92, ROOM_TOP], P));
  out.push(Ln(back.join(""), { tone: "faint" }));
  out.push(S(k.slabOf({ x: -102, y: -98, w: 6, d: 150, r: 0.6 }, -19, ROOM_TOP + 19, P, 2), { tone: "mid" }));
  const side = [];
  for (let y = -80; y < 52; y += 16) side.push(k.segment([-96, y, -5], [-96, y, ROOM_TOP], P));
  for (let z = 11; z < ROOM_TOP; z += 16) side.push(k.segment([-96, -92, z], [-96, 52, z], P));
  side.push(k.segment([-96, 52, -5], [-96, 52, ROOM_TOP], P));
  out.push(Ln(side.join(""), { tone: "faint" }));
  // A shelf on brackets with three cups upside down on it.
  const shelf = { x: 26, y: -92, w: 66, d: 16, r: 1 };
  for (const x of [33, 82]) out.push(S(k.slabOf({ x, y: -92, w: 3, d: 12, r: 0.4 }, 140, 10, P, 2), { tone: "mid" }));
  out.push(S(k.slabOf(shelf, 150, 3, P, 3, 0.4), { tone: "mid" }));
  out.push(D([[34.5, -91.5, 145], [83.5, -91.5, 145]].map(at), { size: 0.45 }));
  for (const x of byDepth([40, 59, 78], (x) => [x, -84, 0])) {
    out.push(S(k.cylinder(x, -84, 6, 153, 9, P, 32, 0.5), { tone: "hi" }));
    out.push(S(k.cylinder(x, -84, 3.6, 162, 1.2, P, 24), { tone: "hi" }));
    out.push(Ln(k.sideArc(x, -84, 6, 155, P, 20), { tone: "faint" }));
  }
  return out.join("");
}

export function desk() {
  const grain = [];
  for (let y = DESK.y + 10; y < DESK.y + DESK.d - 8; y += 12) grain.push(k.lineOnTop([DESK.x, y], [DESK.x + DESK.w, y], -5, P));
  return S(k.slabOf(DESK, -19, 14, P, 6, 1.2), { tone: "mid" }) + Ln(grain.join(""), { tone: "faint" }) + Ln(k.sideSeam(DESK, -12, P, 6), { tone: "faint" });
}

// Behind the machine on the counter: a bag of beans and a milk jug.
export function propsBack() {
  const out = [];
  const bag = { x: 62, y: -86, w: 22, d: 15, r: 2 };
  out.push(S(k.slabOf(bag, -5, 40, P, 4, 0.6), { tone: "hi" }));
  out.push(S(k.slabOf({ x: bag.x + 1, y: bag.y + 1, w: bag.w - 2, d: bag.d - 2, r: 1.5 }, 35, 6, P, 3, 0.4), { tone: "hi" }));
  out.push(Ln(ringY(bag.y + bag.d, bag.x + 4, bag.x + bag.w - 4, 8, 24, 1.5), { tone: "faint" }));
  out.push(Ln([20, 16, 12].map((z, i) => k.segment([bag.x + 7, bag.y + bag.d, z], [bag.x + 7 + [10, 8, 6][i], bag.y + bag.d, z], P)).join(""), { tone: "mid", free: true }));
  out.push(D([at([bag.x + 12, bag.y + bag.d, 29])], { size: 0.9, tone: "mid" }));
  const [jx, jy] = [84, -44];
  out.push(S(L.solidOf([[0, 9], [4, 9.6, 1], [20, 8.4, 1], [24, 8.8]], L.frameAlong([jx, jy, -5], [0, 0, 1]), P), { tone: "hi", crease: "none" }));
  out.push(`<path class="es-void" d="${k.ring(jx, jy, 8.2, 19, P, 40)}"/>`);
  out.push(S(rod([jx - 9.6, jy, 13], [-1, 0, 0.6], 1.2, 0, 4, 10), { tone: "hi" }));
  return out.join("");
}

// In front of the machine: a tamper standing on a rubber mat, and a spare cup on its saucer.
export function propsFront() {
  const out = [];
  const mat = { x: 62, y: 30, w: 28, d: 28, r: 3 };
  out.push(S(k.slabOf(mat, -5, 1.6, P, 4, 0.4), { tone: "mid" }) + Ln(k.planOutline(k.insetPlan(mat, 3), -3.4, P, 4), { tone: "faint" }));
  out.push(S(k.cylinder(76, 44, 9, -3.4, 4, P, 40, 0.6), { tone: "hi" }));
  out.push(S(L.solidOf([[0, 3], [3, 2.4, 1], [10, 3.2, 1], [15, 4.6, 1], [19, 3.6, 1], [20.5, 0.6]], L.frameAlong([76, 44, 0.6], [0, 0, 1]), P), { tone: "hi", crease: "none" }));
  out.push(Ln(k.knurl(76, 44, 9, -3.4, 0.6, 48, P, 0), { tone: "faint" }));
  out.push(S(k.cylinder(74, 82, 11, -5, 1.6, P, 40, 0.5), { tone: "hi" }));
  out.push(S(L.solidOf([[0, 4], [1, 6, 1], [9, 7.2, 1], [10, 7.4]], L.frameAlong([74, 82, -3.4], [0, 0, 1]), P), { tone: "hi", crease: "none" }));
  out.push(`<path class="es-void" d="${k.ring(74, 82, 6.6, 6.6, P, 40)}"/>`);
  out.push(Ln(k.sideArc(74, 82, 7.2, 3, P, 24), { tone: "faint" }));
  return out.join("");
}
