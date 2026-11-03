import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D, ringX, ringY } from "./model.mjs";

// The hood, cut away on its front and right: its base moulding, back and left side with a glazed side window,
// turned columns with brass capitals, the cornice and the caddy top with three brass finials.
const H = C.HOOD, Z0 = C.SEAT_Z - 5, Z1 = C.HOOD_TOP;
const L2 = (g, z0, h, d = 2) => [
  S(k.slabOf({ x: H.x - g, y: H.y - g, w: H.w + 2 * g, d: d + g, r: 0.4 }, z0, h, P, 2, 0.3), { tone: "mid" }),
  S(k.slabOf({ x: H.x - g, y: H.y + d, w: 2 + g, d: H.d - d + g, r: 0.4 }, z0, h, P, 2, 0.3), { tone: "mid" }),
].join("");

export function hoodWalls() {
  const out = [L2(0.8, Z0, 2.4)];
  out.push(S(k.slabOf({ x: H.x, y: H.y, w: H.w, d: 2, r: 0.4 }, Z0 + 2.4, Z1 - Z0 - 2.4, P, 2, 0.3), { tone: "mid" }));
  out.push(S(k.slabOf({ x: H.x, y: H.y + 2, w: 2, d: H.d - 2, r: 0.4 }, Z0 + 2.4, Z1 - Z0 - 2.4, P, 2, 0.3), { tone: "mid" }));
  // The side window: a moulded frame, the glass's edge and a glazing bar across it.
  const [y0, y1, z0, z1] = [H.y + 9, H.y + H.d - 7, 168, 202];
  out.push(Ln(ringX(H.x + 2, y0, y1, z0, z1, 1.6) + ringX(H.x + 2, y0 + 1.6, y1 - 1.6, z0 + 1.6, z1 - 1.6, 0.8), { tone: "faint" }));
  out.push(Ln(k.segment([H.x + 2, (y0 + y1) / 2, z0 + 1.6], [H.x + 2, (y0 + y1) / 2, z1 - 1.6], P), { tone: "faint" }));
  out.push(Ln(k.segment([H.x + H.w, H.y + 2, Z0 + 2.4], [H.x + H.w, H.y + 2, Z1], P), { tone: "faint" }));
  return out.join("");
}

// A turned column with a brass base and capital, standing on the hood's base moulding.
const column = (x, y) => {
  const h = Z1 - C.SEAT_Z, F = L.frameAlong([x, y, C.SEAT_Z], [0, 0, 1]);
  const brass = [[0, 2], [0.8, 2], [0.8, 1.6], [1.6, 1.6, 1], [2.4, 1.3, 1], [3, 1.3]];
  const out = [S(L.solidOf(brass, F, P), { tone: "hi", crease: "lo" })];
  out.push(S(L.solidOf([[3, 1.2], [4, 1.15, 1], [h / 2, 1.05, 1], [h - 4, 1, 1], [h - 3, 1]], F, P), { tone: "mid", crease: "none" }));
  out.push(S(L.solidOf([[h - 3, 1.3], [h - 2.4, 1.3, 1], [h - 1.4, 1.7, 1], [h - 0.6, 2], [h, 2]], F, P), { tone: "hi", crease: "lo" }));
  out.push(Ln([h * 0.3, h * 0.55].map((s) => L.arcOf(F, s, 1.05, P)).join(""), { tone: "faint" }));
  return out.join("");
};
export const backColumns = () => column(H.x + H.w - 2.2, H.y + 4.2) + column(H.x + 4.2, H.y + 4.2);
export const frontColumn = () => column(H.x + 4.2, H.y + H.d - 2.4);

// The frieze under the cornice, with a pierced fret drawn as a row of closed slots.
export function frieze() {
  const out = [L2(0.4, Z1 - 7, 7)];
  const slots = [];
  for (let x = H.x + 6; x < H.x + H.w - 4; x += 6) slots.push(ringY(H.y + 2, x, x + 3.6, Z1 - 5.4, Z1 - 1.6, 1));
  for (let y = H.y + 6; y < H.y + H.d - 2; y += 6) slots.push(ringX(H.x + 2, y, y + 3.6, Z1 - 5.4, Z1 - 1.6, 1));
  out.push(Ln(slots.join(""), { tone: "lo" }));
  return out.join("");
}

// The cornice: three projecting steps; then the caddy top, two steps of the back, with the finials' plinths.
export function cornice() {
  const out = [L2(1, Z1, 1.6), L2(2.4, Z1 + 1.6, 2), L2(1.4, Z1 + 3.6, 1.2)];
  const caddy = (g, z0, h) => S(k.slabOf({ x: H.x + 6 + g, y: H.y + 1 + g, w: H.w - 12 - 2 * g, d: 9 - 2 * g, r: 0.6 }, z0, h, P, 3, 0.4), { tone: "mid" });
  out.push(caddy(0, Z1 + 4.8, 3), caddy(1.6, Z1 + 7.8, 2.4), caddy(3, Z1 + 10.2, 1.2));
  out.push(Ln(k.sideSeam({ x: H.x + 6, y: H.y + 1, w: H.w - 12, d: 9, r: 0.6 }, Z1 + 6.3, P, 3), { tone: "faint" }));
  return out.join("");
}

// Brass ball-and-spire finials, each on a little plinth block.
const finial = (x, y, z) => {
  const F = L.frameAlong([x, y, z + 2.4], [0, 0, 1]);
  const prof = [[0, 1.2], [0.6, 1.2], [1, 0.7, 1], [1.4, 1.5, 1], [2.6, 2.1, 1], [3.8, 1.5, 1], [4.4, 0.6, 1], [5.4, 0.9, 1], [6.4, 0.5, 1], [9, 0.15]];
  return S(k.slabOf({ x: x - 1.8, y: y - 1.8, w: 3.6, d: 3.6, r: 0.3 }, z, 2.4, P, 2, 0.3), { tone: "mid" }) +
    S(L.solidOf(prof, F, P), { tone: "hi", crease: "none" });
};
export const finials = (front) => front
  ? finial(H.x + 2.4, H.y + H.d - 2.4, Z1 + 4.8)
  : finial(H.x + 2.4, H.y + 2.4, Z1 + 4.8) + finial(0, H.y + 5.5, Z1 + 11.4) + finial(H.x + H.w - 2.4, H.y + 2.4, Z1 + 4.8);
