import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D, rod, pipe, box, faceY } from "./model.mjs";

// What stands on and off the back plate: the bell on its stand, the back cock that carries the pendulum's
// suspension, and the two brackets off the plate's left edge that Knock and Rocky stand on.
const PY = C.PLATE.y + 1.2;

export function backcock() {
  const Pn = C.PEND;
  const out = [S(box(-1.8, Pn.y + 0.4, 195.5, 1.8, C.PLATE.y, 202.6, 0.3, 0.2), { tone: "mid" })];
  out.push(D([[-1, C.PLATE.y, 201.6], [1, C.PLATE.y, 201.6]].map(at), { size: 0.4, tone: "lo" }));
  // The suspension chops: the brass block the spring hangs from, sitting on the cock's top.
  out.push(S(box(-1.1, Pn.y - 0.6, 202.6, 1.1, Pn.y + 0.6, 203.6, 0.2), { tone: "hi" }));
  out.push(S(rod([0, Pn.y, 203.6], [0, 0, 1], 0.35, 0, 0.7, 8), { tone: "hi" }));
  return out.join("");
}

// The bell, dome up, on a stand that rises off the plate's top edge and comes down onto its crown.
export function bell() {
  const B = C.BELL, top = B.z + 2.3;
  const out = [S(box(B.x - 1.6, C.PLATE.y, C.PLATE.z1, B.x + 1.6, PY, C.PLATE.z1 + 1.2, 0.2), { tone: "mid" })];
  out.push(pipe([[B.x, C.PLATE.y + 0.6, C.PLATE.z1 + 1.2], [B.x, C.PLATE.y + 0.6, top + 2.2], [B.x, B.y, top + 2.2], [B.x, B.y, top + 0.6]], 0.5, { tone: "mid", bend: 1.4 }));
  const F = L.frameAlong([B.x, B.y, B.z - 3.6], [0, 0, 1]);
  const prof = [[0, B.r], [0.3, B.r + 0.15, 1], [0.9, B.r - 0.05, 1], [2, B.r - 0.4, 1], [3.2, B.r - 1.2, 1], [4.4, B.r - 2.5, 1], [5.4, B.r - 4, 1], [5.9, 0.6]];
  const lip = L.arcOf(F, 0.3, B.r + 0.15, P), band = L.arcOf(F, 2, B.r - 0.4, P, { slope: -0.45 });
  out.push(S(L.solidOf(prof, F, P), { tone: "hi", crease: "none", inner: Ln(lip + band, { tone: "faint" }) }));
  out.push(S(L.disc(0, 0.6, 0.9, L.frameAlong([B.x, B.y, top], [0, 0, 1]), P), { tone: "mid" }));
  return out.join("");
}

// A bracket off the plate's right edge: a shelf on a web, screwed to the plate's edge.
const shelf = (z, y0, y1) => {
  const x0 = C.PLATE.x1, x1 = 25.5;
  return S(box(x0, y0, z - 4, x0 + 1.2, y0 + 1.4, z, 0.2), { tone: "mid" }) +
    S(box(x0, y0, z, x1, y1, z + 1.2, 0.4, 0.3), { tone: "mid" }) +
    D([at([x0 + 1.4, y1 - 1.2, z + 1.2]), at([x1 - 1.4, y1 - 1.2, z + 1.2])], { size: 0.45, tone: "lo" });
};
export const perches = () => shelf(C.PERCH.knock[2] - 1.2, C.PLATE.y, -20) + shelf(C.PERCH.rocky[2] - 1.2, C.PLATE.y, -15.5);
