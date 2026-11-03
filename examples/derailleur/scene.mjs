import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { P, at, S, Ln, Dt } from "./model.mjs";
import { tube } from "./bike.mjs";

const WY = -150;

// The workshop wall behind the bike: a pegboard with a hex key set and a spoke wrench on its hooks.
export function wall() {
  const out = [S(k.slabOf({ x: -600, y: WY - 10, w: 1200, d: 10, r: 0.1 }, -600, 1200, P, 2), { tone: "mid" })];
  out.push(S(L.prismOf(L.frameOf([0, WY, 0], [0, 1, 0], [1, 0, 0], [0, 0, 1]), [[-260, -260], [240, -260], [240, 160], [-260, 160]], 0, 4, P), { tone: "hi" }));
  const holes = [];
  for (let x = -250; x <= 230; x += 20) for (let z = -250; z <= 150; z += 20) holes.push(at([x, WY + 4, z]));
  out.push(Dt(holes, { size: 0.7, tone: "lo" }));
  for (const [x, z] of [[20, 70], [55, 70], [38, -20]]) out.push(tube([[x, WY + 4, z], [x, WY + 22, z], [x, WY + 26, z + 6]], 1.5, "hi", 3));
  for (const [x, len] of [[20, 70], [55, 50]]) {
    out.push(tube([[x, WY + 18, 66], [x, WY + 18, 66 - len], [x + 14, WY + 18, 66 - len]], 2.6, "mid", 3));
  }
  out.push(S(L.prismOf(L.frameOf([38, WY + 18, -32], [0, 1, 0], [1, 0, 0], [0, 0, 1]), Array.from({ length: 8 }, (_, i) => [16 * Math.cos((i / 8) * Math.PI * 2 + 0.39), 16 * Math.sin((i / 8) * Math.PI * 2 + 0.39)]), 0, 3, P), { tone: "mid" }));
  out.push(S(L.disc(0, 3.2, 4, L.frameOf([38, WY + 18, -20], [0, 1, 0], [1, 0, 0], [0, 0, 1]), P), { tone: "lo" }));
  return out.join("");
}
