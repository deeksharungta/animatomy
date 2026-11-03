import * as k from "../../kit/iso-kit.mjs";
import { C, P, at, S, Ln, D, rod } from "./model.mjs";

// The moulding box: a bottom board on battens, the drag and a shallow cope rammed full of sand, cut at y = 0.
const FL = C.FL, Z = C.Z, x0 = FL.x0 - FL.t, x1 = FL.x1 + FL.t, y0 = FL.y0 - FL.t;
const sand = { x: FL.x0, y: FL.y0, w: FL.x1 - FL.x0, d: -FL.y0, r: 0.2 };
export const slab = (x, y, w, d, z, h, tone = "mid", bevel = 0.3) => S(k.slabOf({ x, y, w, d, r: Math.min(0.6, w / 3, d / 3) }, z, h, P, 2, bevel), { tone });

export function board() {
  const out = [], B = C.BOARD;
  out.push(`<path class="iso-halo" d="${k.haloOf({ x: -72, y: -52, w: 146, d: 52, r: 2 }, 0, 5, P)}"/>`);
  for (const x of [-64, -4, 56]) out.push(slab(x, -50, 6, 50, 0, 2.2, "lo"));
  out.push(S(k.slabOf(B, 2.2, 2.8, P, 2, 0.4), { tone: "lo", inner: Ln(k.sideSeam(B, 3.6, P, 2), { tone: "faint" }) }));
  out.push(Ln([-35, 25].map((x) => k.lineOnTop([x, B.y], [x, 0], 5, P)).join(""), { tone: "faint" }));
  // Nails through the board into each batten, in a row along it.
  const nails = [];
  for (const x of [-61, -1, 59]) for (const y of [-46, -36, -26, -16, -6]) nails.push(at([x, y, 5]));
  out.push(D(nails, { size: 0.4, tone: "lo" }));
  return out.join("");
}

// One flask: the rims round its open ends, its back wall, the end walls (cut at y = 0) and the sand.
function flask(z0, z1, part) {
  const out = [], rims = [z0, z1 - 2.6];
  for (const z of rims) out.push(slab(x0 - 2.2, y0 - 2, x1 - x0 + 4.4, 2, z, 2.6));
  out.push(S(k.slabOf({ x: x0, y: y0, w: x1 - x0, d: FL.t, r: 0.2 }, z0, z1 - z0, P, 2), { tone: "mid" }));
  out.push(S(k.slabOf({ x: x0, y: y0, w: FL.t, d: -y0, r: 0.2 }, z0, z1 - z0, P, 2), { tone: "mid" }));
  out.push(S(k.slabOf(sand, z0, z1 - z0, P, 2), { tone: "lo", className: `sc-sand sc-${part}` }));
  out.push(S(k.slabOf({ x: FL.x1, y: y0, w: FL.t, d: -y0, r: 0.2 }, z0, z1 - z0, P, 2), { tone: "mid" }));
  // The right end: its rims, a rib at each side running rim to rim, and bolts where the rims meet the ribs.
  for (const z of rims) out.push(slab(x1, y0 - 2, 2.2, -y0 + 2, z, 2.6));
  for (const y of [-38.2, -1.6]) out.push(slab(x1, y - 0.7, 1.8, 1.4, z0 + 2.6, z1 - z0 - 5.2));
  const bolts = [];
  for (const y of [-38.2, -1.6]) for (const z of rims) bolts.push(at([x1 + 2.2, y, z + 1.3]));
  out.push(D(bolts, { size: 0.5 }));
  return out.join("");
}
export const drag = () => flask(Z.board, Z.part, "drag");
export const cope = () => flask(Z.part, Z.top, "cope");

// The right end's fittings: the pin lugs and the clamp lugs at the parting line, the drag's handle (Pinch's
// footing), the cope's handle, the pin, and the flask's number plate.
export function endFittings() {
  const out = [], xe = x1, CL = C.CLAMP, L = CL.lug;
  // The number plate, riveted to the drag's end, with three cast lines.
  const py0 = -31, py1 = -15, pz0 = 16, pz1 = 28;
  out.push(slab(xe, py0, 0.8, py1 - py0, pz0, pz1 - pz0, "mid", 0.2));
  const plate = [[py0 + 1.2, pz0 + 1.2], [py1 - 1.2, pz0 + 1.2], [py1 - 1.2, pz1 - 1.2], [py0 + 1.2, pz1 - 1.2]];
  out.push(Ln(k.pathOf(plate.map(([y, z]) => at([xe + 0.8, y, z])), true), { tone: "faint" }));
  out.push(Ln([[-18, 24.4], [-21, 22], [-24, 19.6]].map(([b, z]) => k.segment([xe + 0.8, -28, z], [xe + 0.8, b, z], P)).join(""), { tone: "lo", free: true }));
  out.push(D([[py0 + 0.6, pz0 + 0.6], [py1 - 0.6, pz0 + 0.6], [py0 + 0.6, pz1 - 0.6], [py1 - 0.6, pz1 - 0.6]].map(([y, z]) => at([xe + 0.8, y, z])), { size: 0.4 }));
  // Lugs: the drag's sit flush under the parting line, the cope's on it. Pin lugs at the back, clamp lugs nearer.
  for (const [y, w, d] of [[-37, 7, 6], [CL.y - 2.6, CL.reach + 2.4, 5.2]]) {
    out.push(slab(xe, y, w, d, Z.part - L, L));
    out.push(slab(xe, y, w, d, Z.part, L));
  }
  // The flask pin through the pin lugs, with its head and a cotter under the drag's lug.
  const px = xe + 4, py = -34;
  out.push(S(k.cylinder(px, py, 1.2, Z.part - L - 6, 6, P, 16), { tone: "hi" }));
  out.push(S(k.slabOf({ x: px - 1.9, y: py - 0.35, w: 3.8, d: 0.7, r: 0.2 }, Z.part - L - 3.2, 0.8, P, 2), { tone: "hi" }));
  out.push(S(k.cylinder(px, py, 1.2, Z.part + L, 3.4, P, 16), { tone: "hi" }));
  out.push(S(k.cylinder(px, py, 2, Z.part + L + 3.4, 1.4, P, 16, 0.3), { tone: "hi" }));
  // A groove across the cope's clamp lug where the claw bears.
  out.push(Ln(k.lineOnTop([xe + CL.reach, CL.y - 2.6], [xe + CL.reach, CL.y + 2.6], Z.part + L, P), { tone: "faint" }));
  // The drag's handle: two arms off the end wall and a round bar between them.
  const H = CL.handle;
  for (const y of [H.y0, H.y1]) out.push(slab(xe, y - 1, H.x + 1, 2, H.z - 2, 4));
  out.push(S(rod([xe + H.x, H.y0 - 1.2, H.z], [xe + H.x, H.y1 + 1.2, H.z], 1.4, 14), { tone: "mid" }));
  // The cope's handle, a smaller one between the pin and the clamp.
  for (const y of [-28, -18]) out.push(slab(xe, y - 0.8, 6, 1.6, Z.part + 3.8, 3.2));
  out.push(S(rod([xe + 5.2, -29, Z.part + 5.4], [xe + 5.2, -17, Z.part + 5.4], 1.1, 12), { tone: "mid" }));
  return out.join("");
}
