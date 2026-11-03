import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D, rod, faceY } from "./model.mjs";

// What hangs in the trunk: the pendulum's lenticular bob with its rating nut, drawn at rest and moved by the page,
// and the two brass-cased weights on their pulleys, drawn at the top of their travel.
export function bob() {
  const Pn = C.PEND, z = Pn.z - Pn.len, r = Pn.bob, F = faceY(0, Pn.y - 1.5, z);
  const lens = [[0, 0.6], [0.25, r * 0.55, 1], [0.7, r * 0.86, 1], [1.2, r * 0.98, 1], [1.5, r], [1.8, r * 0.98, 1], [2.3, r * 0.86, 1], [2.75, r * 0.55, 1], [3, 0.6]];
  const out = [S(L.solidOf(lens, F, P), { tone: "hi", crease: "none", inner: Ln(L.arcOf(F, 1.5, r, P, { least: -1 }), { tone: "faint" }) })];
  // The rod runs on through the bob to a threaded tail; the rating nut on it sets the clock's rate.
  out.push(S(rod([0, Pn.y, z - r + 0.4], [0, 0, 1], 0.3, -3.6, 0, 10), { tone: "hi" }));
  out.push(S(L.solidOf([[0, 0.9], [0.2, 1.05], [1.2, 1.05], [1.4, 0.9]], L.frameAlong([0, Pn.y, z - r - 2.4], [0, 0, 1]), P), { tone: "mid", crease: "lo", inner: k.fadedSvg(L.ribsOf(L.frameAlong([0, Pn.y, z - r - 2.4], [0, 0, 1]), 0.2, 1.2, 1.05, 18, P, { fade: [0.1, 0.5] }), { tone: "lo" }) }));
  out.push(Ln([0.2, 0.7].map((s) => L.arcOf(L.frameAlong([0, Pn.y, z - r - 3.6], [0, 0, 1]), s, 0.3, P)).join(""), { tone: "lo" }));
  return out.join("");
}

// A weight: a brass case with a turned cap and base, its hook, and the pulley in its stirrup above.
export function weight(side) {
  const W = C.WEIGHT, x = side * (-C.GREAT.x + C.BARREL.r + W.pulley), y = -23.1, z = W.high, h = W.h;
  const F = L.frameAlong([x, y, z], [0, 0, 1]);
  const out = [];
  out.push(S(L.solidOf([[0, W.r - 0.5], [0.4, W.r - 0.1, 1], [1.4, W.r], [1.4, W.r - 0.15], [h - 1.4, W.r - 0.15], [h - 1.4, W.r], [h - 0.6, W.r - 0.3, 1], [h, W.r - 1.4, 1], [h + 0.5, 0.8]], F, P),
    { tone: "hi", crease: "lo", inner: Ln([h * 0.33, h * 0.66].map((s) => L.arcOf(F, s, W.r - 0.15, P)).join(""), { tone: "faint" }) }));
  // The hook through the cap, the stirrup's two cheeks and the pulley wheel with its groove.
  const pc = [x, y, z + h + 4.1];
  out.push(S(rod([x, y, z + h + 0.4], [0, 0, 1], 0.32, 0, 1.6, 8), { tone: "mid" }));
  out.push(S(L.prismOf(L.frameOf([x, y - 1.05, z + h + 2], [0, 1, 0], [1, 0, 0], [0, 0, 1]), [[-0.8, 0], [0.8, 0], [0.8, 2.8], [0, 3.4], [-0.8, 2.8]], 0, 0.3, P), { tone: "mid" }));
  out.push(S(L.solidOf([[0, W.pulley + 0.25], [0.3, W.pulley + 0.25], [0.5, W.pulley - 0.3, 1], [0.9, W.pulley - 0.3, 1], [1.1, W.pulley + 0.25], [1.4, W.pulley + 0.25]], faceY(pc[0], y - 0.7, pc[2]), P), { tone: "hi", crease: "lo" }));
  out.push(S(L.prismOf(L.frameOf([x, y + 0.75, z + h + 2], [0, 1, 0], [1, 0, 0], [0, 0, 1]), [[-0.8, 0], [0.8, 0], [0.8, 2.8], [0, 3.4], [-0.8, 2.8]], 0, 0.3, P), { tone: "mid" }));
  out.push(D([at([x, y + 1.06, pc[2]])], { size: 0.5, tone: "lo" }));
  return out.join("");
}
