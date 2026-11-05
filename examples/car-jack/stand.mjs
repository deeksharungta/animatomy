// The axle stand, set under the pinch weld as a safety, cut in half on the same plane as the jack: two pressed-steel
// legs behind a square column, the notched ratchet bar in it, the locking pawl and its lever, and the saddle whose slot
// holds the weld. At rest the weld sits in it; the jack lifts the car clear of it and lowers it back.
import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D } from "./model.mjs";

const X = C.STAND.x, TOP = C.SILL.z, COL = { z0: 40, z1: 150, w: 15 }, BAR = 9;
const half = (x, w, y0 = -w) => ({ x: x - w, y: y0, w: 2 * w, d: -y0, r: 0.6 });

// One leg: a channel from its foot on the floor up to the column's back, with a foot pad.
function leg(deg) {
  const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a), foot = [X + 52 * c, 52 * s, 0], top = [X + 12 * c, 12 * s, 88];
  const ax = L.unit3(L.sub3(top, foot)), side = [-s, c, 0], F = L.frameOf(foot, ax, side, L.cross3(ax, side));
  return S(L.prismOf(F, [[-6, -2], [6, -2], [6, 2], [-6, 2]], 4, L.len3(L.sub3(top, foot)), P), { tone: "mid", crease: "lo" }) +
    S(k.slabOf({ x: foot[0] - 10, y: foot[1] - 10, w: 20, d: 20, r: 4 }, 0, 4, P, 3, 0.4), { tone: "mid" }) + D([at([foot[0], foot[1], 4])], { size: 0.55 });
}

export function stand() {
  const out = [`<path class="iso-halo" d="${k.haloOf({ x: X - 60, y: -60, w: 120, d: 60, r: 30 }, 0, 1, P)}"/>`];
  out.push(leg(225), leg(300));
  // The column: a square tube cut through, its wall and hollow, a weld bead at the legs and the collar on top.
  const col = half(X, COL.w);
  out.push(S(k.slabOf(col, COL.z0, COL.z1 - COL.z0, P, 2, 0.5), { tone: "hi", crease: "lo", inner: Ln(k.sideSeam(col, 92, P, 2), { tone: "faint" }) }));
  out.push(`<path class="cj-void" d="${k.pathOf([[X - COL.w + 2.5, COL.z0 + 3], [X + COL.w - 2.5, COL.z0 + 3], [X + COL.w - 2.5, COL.z1], [X - COL.w + 2.5, COL.z1]].map(([x, z]) => at([x, 0, z])), true)}"/>`);
  out.push(S(k.slabOf(half(X, COL.w + 2.5), COL.z1 - 8, 8, P, 2, 0.5), { tone: "mid", crease: "lo" }));
  out.push(D([[X + COL.w, -6, 120], [X + COL.w, -10, 70]].map(at), { size: 0.6 }));
  // The ratchet bar, its teeth down the cut face, rising out of the column to the saddle.
  const bar = half(X, BAR);
  out.push(S(k.slabOf(bar, COL.z0 + 20, TOP - 4 - COL.z0 - 20, P, 2, 0.4), { tone: "hi", crease: "lo" }));
  const teeth = [];
  for (let z = COL.z1 + 11; z < TOP - 14; z += 5) teeth.push(k.pathOf([at([X + BAR - 0.2, 0, z]), at([X + BAR - 2.6, 0, z + 2.2]), at([X + BAR - 0.2, 0, z + 4.4])]));
  out.push(Ln(teeth.join(""), { tone: "lo" }));
  // The pawl: a bracket on the collar, its pivot pin, the tongue in a tooth and the release lever with its knob.
  const bx = X + COL.w + 2.5;
  out.push(S(k.slabOf({ x: bx, y: -10, w: 8, d: 10, r: 1 }, COL.z1 - 6, 12, P, 2, 0.4), { tone: "mid", crease: "lo" }));
  out.push(S(L.disc(0, 12, 2, L.frameOf([bx + 4, -12, COL.z1], [0, 1, 0], [1, 0, 0], [0, 0, 1]), P), { tone: "hi" }));
  out.push(S(L.prismOf(L.frameOf([bx + 8, -6, COL.z1 - 2], [0, 1, 0], [1, 0, 0], [0, 0, 1]), [[0, -2], [30, -12], [30, -7], [0, 3]], -2, 0, P), { tone: "hi", crease: "lo" }));
  out.push(S(L.sphereOf([bx + 40, -7, COL.z1 - 11.5], 3.4, P), { tone: "hi" }));
  // The saddle: a cradle cut through its slot, the weld's place between its two cheeks.
  out.push(S(k.slabOf(half(X, 16), TOP - 4, 4, P, 2, 0.4), { tone: "hi", crease: "lo" }));
  out.push(S(k.slabOf({ x: X - 16, y: -14, w: 32, d: 11.6, r: 1 }, TOP, 6, P, 2, 0.4), { tone: "hi", crease: "lo" }));
  return out.join("");
}
