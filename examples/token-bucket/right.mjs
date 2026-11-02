import * as k from "../../kit/iso-kit.mjs";
import { C, P, at, S, Ln, D } from "./model.mjs";
import { rod, chute, openBox } from "./helpers.mjs";

// The request side: the chute from the mail slot, the flap's pivot, and the trays and boxes things land in.
export const refusedBox = () => openBox(C.REFUSED, C.FLOOR, 7);
export const servedBox = () => openBox(C.SERVED, C.FLOOR, 4.5);
export const cashBox = () => openBox(C.CASH, C.FLOOR, 11);
export const spillBox = () => openBox(C.SPILL, C.FLOOR, C.BOX_H);

export function pivot() {
  const [, py, pz] = C.PV;
  const left = { x: C.BED.x + C.BED.w, y: py - 2.5, w: 2.4, d: 5, r: 0.4 };
  const right = { x: 51, y: py - 2.5, w: 3, d: 5, r: 0.4 };
  return S(k.slabOf(left, pz - 5, 7.5, P, 2), { tone: "mid" }) + S(k.slabOf(right, C.FLOOR, pz + 2.5 - C.FLOOR, P, 2, 0.3), { tone: "mid" })
    + S(k.slabOf({ x: 49.5, y: py - 4.5, w: 6, d: 9, r: 0.6 }, C.FLOOR, 1.2, P, 2), { tone: "mid" })
    + S(rod([16.4, py, pz], [1, 0, 0], 1.1, 0, 34.6, 12), { tone: "hi" })
    + [C.ARM.x0 + 1, C.FLAP.x1 - 3].map((x) => S(rod([x, py, pz], [1, 0, 0], 1.9, 0, 2, 16), { tone: "mid" })).join("")
    + D([at([54, py, pz]), at([52.5, py + 2.5, C.FLOOR + 1.2]), at([52.5, py - 2.5, C.FLOOR + 1.2])], { size: 0.5, tone: "mid" });
}

// The request chute hangs from the wall under the slot and rests on a bracket at its lower end.
export function chuteSupport() {
  const { a, b, w } = C.CHUTE;
  const post = { x: 27.5, y: -14, w: 3, d: 3, r: 0.4 };
  const zTop = b[2] + ((a[2] - b[2]) * (b[1] + 12.5)) / (b[1] - a[1]) - 1.2;
  return S(k.slabOf(post, C.FLOOR, zTop - C.FLOOR, P, 2), { tone: "mid" })
    + S(k.slabOf({ x: post.x, y: -14, w: b[0] - w / 2 - 1.2 - post.x, d: 3, r: 0.4 }, zTop - 2.4, 2.4, P, 2), { tone: "mid" });
}
export const requestChute = () => chute(C.CHUTE.a, C.CHUTE.b, C.CHUTE.w, { lip: 3 });
