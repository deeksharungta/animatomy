import { k, L, P, at, S, Ln, D, box, seg, rod, insulator, ringY } from "./shapes.mjs";
import { C } from "./model.mjs";

// The 400 kV SF6 live-tank breaker: three poles on the portal, each a support column carrying a T-head with
// two horizontal interrupter chambers. The near pole's right chamber has a window over its contacts and puffer.
// Its gang-operated spring mechanism sits in a cabinet on the portal's front legs, door off, Roo inside.
const CB = C.CB, ST = C.STAND, Z = [0, 0, 1], X = [1, 0, 0];
export const HEAD = ST + 34, AXZ = HEAD + 6;
export function pole(y) {
  const x = CB.x, out = [];
  out.push(S(box(x - 3.4, y - 3.4, ST + 1.2, x + 3.4, y + 3.4, ST + 5, 0.5, 0.4), { tone: "mid" }));
  out.push(D([[x - 2.4, y + 3.4, ST + 3], [x + 2.4, y + 3.4, ST + 3]].map(at), { size: 0.4 }));
  out.push(insulator([x, y, ST + 5], Z, HEAD - ST - 5, { r: 2.6, shed: 4, n: 10, cap: 3.4 }));
  out.push(S(box(x - 4, y - 3.4, HEAD, x + 4, y + 3.4, HEAD + 10, 1, 0.5), { tone: "mid" }));
  out.push(S(k.cylinder(x, y + 4.4, 1.2, HEAD + 3, 2.4, P, 12), { tone: "hi" }));
  return out.join("");
}
// One interrupter chamber along ±x from the head, with its flanges and the terminal pad at the far end.
export function chamber(y, dir) {
  const x = CB.x + dir * 4, out = [], len = CB.half - 2;
  out.push(insulator([x, y, AXZ], [dir, 0, 0], len, { r: 3, shed: 4.2, n: 6, cap: 3.6 }));
  out.push(S(L.disc(len, len + 1.6, 4, L.frameAlong([x, y, AXZ], [dir, 0, 0]), P), { tone: "mid" }));
  out.push(S(box(x + dir * (len + 1.6) - 0.4 + (dir < 0 ? -2.6 : 0), y - 1.8, AXZ - 1.4, x + dir * (len + 1.6) + 0.4 + (dir > 0 ? 2.6 : 0), y + 1.8, AXZ + 1.4, 0.2), { tone: "hi" }));
  return out.join("");
}
export const cbTerm = (y, dir) => [CB.x + dir * (CB.half + 4.6), y, AXZ];

// The window in the near pole's right chamber: a slot on its viewer side over the contact gap.
export const CWIN = { x0: CB.x + 6, x1: CB.x + 14, half: 1.0 };
const near = Math.atan2(L.viewOf(P)[2], L.viewOf(P)[1]);
export function cwinPath(r = 3.1) {
  const y = C.PH[2], pts = [], n = 10, pt = (x, t) => at([x, y + r * Math.cos(t), AXZ + r * Math.sin(t)]);
  for (let j = 0; j <= n; j++) pts.push(pt(CWIN.x0, near - CWIN.half + (2 * CWIN.half * j) / n));
  for (let j = 0; j <= n; j++) pts.push(pt(CWIN.x1, near + CWIN.half - (2 * CWIN.half * j) / n));
  return k.pathOf(pts, true);
}

// The mechanism cabinet: back wall, sides, roof and floor, open to the front.
const M = C.CBM;
export function cabinetBack() {
  const out = [], { x, y, z, w, d, h } = M;
  out.push(S(box(x, y, z, x + w, y + 1, z + h, 0.2), { tone: "mid" }));
  out.push(S(box(x, y, z, x + 1, y + d, z + h, 0.2), { tone: "mid" }));
  out.push(S(box(x, y, z, x + w, y + d, z + 1.2, 0.2), { tone: "lo" }));
  out.push(Ln(ringY(y + 1, x + 3, x + w - 3, z + h - 8, z + h - 4, 0.6, 2), { tone: "lo" }));
  // Struts from the cabinet up to the portal's front legs.
  out.push(S(box(x + 2, y - 1, z + h - 4, x + w - 2, y, z + h - 2, 0.2), { tone: "mid" }));
  return out.join("");
}
export function cabinetFront() {
  const out = [], { x, y, z, w, d, h } = M;
  out.push(S(box(x + w - 1, y, z, x + w, y + d, z + h, 0.2), { tone: "mid" }));
  out.push(S(box(x - 0.6, y - 0.6, z + h, x + w + 0.6, y + d + 0.6, z + h + 1.4, 0.3, 0.3), { tone: "mid" }));
  out.push(S(box(x, y + d - 1, z, x + w, y + d, z + 3, 0.2), { tone: "mid" }));
  out.push(D([[x + w, y + 2, z + 4], [x + w, y + d - 2, z + 4], [x + w, y + 2, z + h - 3], [x + w, y + d - 2, z + h - 3]].map(at), { size: 0.45 }));
  // The drive rod leaves the roof for the portal, where a coupling rod along y turns all three poles.
  out.push(S(rod([x + w / 2, y + 3, z + h + 1.4], Z, 0.8, 0, ST - 2 - z - h - 1.4, 10), { tone: "hi" }));
  return out.join("");
}
export const couplingRod = () => S(rod([CB.x - 7.4, C.PH[0], ST - 3], [0, 1, 0], 0.7, -2, C.PH[2] - C.PH[0] + 9, 10), { tone: "hi" });
void seg; void X;
