import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln } from "./model.mjs";

// The hood's glazed door, swung open on its hinges at the hood's front left corner: two stiles, a bottom rail and a
// deep top rail whose arch frames the dial, the glass's bead round the opening, the hinges and a small brass knob.
const H = C.HOOD, HINGE = [H.x + 0.6, H.y + H.d + 0.4], OPEN = (100 * Math.PI) / 180;
const W = 40, T = 1.8, Z0 = C.SEAT_Z + 0.4, Z1 = C.HOOD_TOP - 1, ARCH = 182, R = (W - 6) / 2;
const dir = [Math.cos(OPEN), Math.sin(OPEN)], inward = [Math.sin(OPEN), -Math.cos(OPEN)];
const on = (u, z, off = 0) => [HINGE[0] + u * dir[0] + off * inward[0], HINGE[1] + u * dir[1] + off * inward[1], z];
const slab = (u0, u1, o0, o1, z0, z1) => L.prismOf(L.frameOf(on(0, z0), [0, 0, 1], [dir[0], dir[1], 0], [inward[0], inward[1], 0]), [[u0, o0], [u1, o0], [u1, o1], [u0, o1]], 0, z1 - z0, P);
const path = (pts, close = false) => k.pathOf(pts.map(([u, z, o]) => at(on(u, z, o ?? 0.03))), close);

export function hoodDoor() {
  const out = [];
  out.push(S(slab(0, 3, -T, 0, Z0, Z1), { tone: "mid" }), S(slab(W - 3, W, -T, 0, Z0, Z1), { tone: "mid" }));
  out.push(S(slab(3, W - 3, -T, 0, Z0, Z0 + 4), { tone: "mid" }));
  out.push(S(slab(3, W - 3, -T, 0, ARCH, Z1), { tone: "mid" }));
  // The arch cut in the top rail, and the glazing bead that follows the opening round.
  const arch = Array.from({ length: 33 }, (_, i) => { const a = Math.PI - (i / 32) * Math.PI; return [W / 2 + R * Math.cos(a), ARCH + 0.02 + R * 0.62 * Math.sin(a)]; });
  out.push(Ln(path(arch), { tone: "lo" }));
  const bead = arch.map(([u, z]) => [W / 2 + (u - W / 2) * 0.95, ARCH + (z - ARCH) * 0.88]);
  out.push(Ln(path([[3.85, Z0 + 4], ...bead, [W - 3.85, Z0 + 4]]), { tone: "faint" }));
  // Hinges on the hinge stile and a knob on the far one.
  for (const z of [Z0 + 6, Z1 - 8]) out.push(S(slab(0, 2.4, 0, 0.25, z, z + 5), { tone: "lo" }));
  out.push(S(L.solidOf([[0, 0.5], [0.8, 0.4], [1.2, 0.9, 1], [1.8, 0.9, 1], [2.1, 0.3]], L.frameAlong(on(W - 1.5, (Z0 + ARCH) / 2, 0), [inward[0], inward[1], 0]), P), { tone: "hi", crease: "none" }));
  return out.join("");
}
