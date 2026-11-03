import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D } from "./model.mjs";

// The display stand the model lies on: a bevelled base plate on four feet, a label plate, and two V-blocks that
// cradle the barrel (one under the grip), each split into the flank behind the pen and the flank in front of it.
const BASE = { x: -38, y: -13, w: 70, d: 26, r: 2.4 }, BZ = 2.2, BH = 3, TOP = BZ + BH;
const BLOCKS = [[42, C.GRIP[2]], [76, C.BAR.ro]].map(([s, r]) => ({ x: C.PX + C.DIR * s - 3, r }));
const W = 8.5, HIGH = C.ZA - 1.4;

// One flank of a V-block in the plane across the pen (y, z), extruded 6 along the axis; side -1 far, +1 near.
function flank({ x, r }, side) {
  const v0 = C.ZA - r * Math.SQRT2, rise = HIGH - v0;
  const poly = [[0, TOP], [W * side, TOP], [W * side, HIGH], [rise * side, HIGH], [0, v0]];
  const F = L.frameOf([x, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  const cap = D([at([x + 3, 6.6 * side, HIGH])], { size: 0.5, tone: "lo" });
  return S(L.prismOf(F, poly, 0, 6, P), { tone: "mid" }) + cap;
}
export const blocksBack = () => BLOCKS.map((b) => flank(b, -1)).join("");
export const blocksFront = () => BLOCKS.map((b) => flank(b, 1)).join("");

export function base() {
  const feet = k.corners(BASE, 5).sort((a, b) => k.depthOf([...a, 0], P) - k.depthOf([...b, 0], P));
  const out = [`<path class="iso-halo" d="${k.haloOf(BASE, 0, BZ + BH, P)}"/>`];
  for (const [x, y] of feet) out.push(S(k.cylinder(x, y, 2.2, 0, BZ, P, 24), { tone: "lo" }));
  const groove = Ln(k.planOutline(k.insetPlan(BASE, 2.2), TOP, P, 4), { tone: "faint" });
  out.push(S(k.slabOf(BASE, BZ, BH, P, 6, 0.8), { tone: "lo", inner: groove }));
  out.push(D(k.corners(BASE, 4.4).map(([x, y]) => at([x, y, TOP])), { size: 0.5, tone: "mid" }));
  // A scale along the front edge in the real pen's millimetres (6 mm of the model each), every fifth mark long.
  const scale = { x: -34, y: 10.4, w: 62, d: 1.6, r: 0.2 }, sz = TOP + 0.2;
  const ticks = k.topTicks(scale.x + 1, scale.x + scale.w - 1, 1, 5, scale.y, sz, [0.6, 1.2], P, "x");
  out.push(S(k.slabOf(scale, TOP, 0.2, P, 2), { tone: "hi", inner: Ln(ticks.minor, { tone: "lo" }) + Ln(ticks.major, { tone: "mid" }) }));
  // The label plate, three engraved rule lines and two screws, on the strip in front of the pen.
  const plate = { x: -10, y: 6.2, w: 26, d: 3.8, r: 0.5 }, pz = TOP + 0.4;
  const rules = [[1.1, 16], [1.9, 21], [2.7, 12]].map(([dy, w]) => k.lineOnTop([plate.x + 3, plate.y + dy], [plate.x + 3 + w, plate.y + dy], pz, P)).join("");
  out.push(S(k.slabOf(plate, TOP, 0.4, P, 3, 0.1), { tone: "hi", inner: Ln(rules, { tone: "mid", free: true }) }));
  out.push(D([at([plate.x + 1.4, plate.y + plate.d / 2, pz]), at([plate.x + plate.w - 1.4, plate.y + plate.d / 2, pz])], { size: 0.45, tone: "lo" }));
  return out.join("");
}
