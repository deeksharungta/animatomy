// The spring barrel, its cover off: a cup on its own pivot, drawn in two halves round Roo (the wall's far half and
// floor behind him, the near half in front). The cup is round, so it is drawn once; what turns with it (the crown
// teeth and the hook) and what turns with the arbor (ratchet, click, key) are in moving.mjs.
import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, rad } from "./model.mjs";

const S = (paths, style) => k.solidSvg(paths, style);
const Ln = (d, style) => k.lineSvg(d, style);
const B = C.BARREL;
// The wall splits where its outline turns: the near half faces the camera (azimuth ± 90°).
export const SPLIT = [P.azimuth - 90, P.azimuth + 90];
export function sector(r0, r1, a0, a1, n = 48) {
  const pts = [];
  for (let i = 0; i <= n; i++) { const a = rad(a0 + ((a1 - a0) * i) / n); pts.push([B.x + r1 * Math.cos(a), B.y + r1 * Math.sin(a)]); }
  for (let i = n; i >= 0; i--) { const a = rad(a0 + ((a1 - a0) * i) / n); pts.push([B.x + r0 * Math.cos(a), B.y + r0 * Math.sin(a)]); }
  return pts;
}
const arcAt = (r, z, a0, a1, n = 48) => k.pathOf(Array.from({ length: n + 1 }, (_, i) => { const a = rad(a0 + ((a1 - a0) * i) / n); return at([B.x + r * Math.cos(a), B.y + r * Math.sin(a), z]); }));

// Behind Roo: the pivot boss, the cup's floor and the far half of its wall, seen from inside.
export function barrelBack() {
  const out = [`<path class="iso-halo" d="${k.haloOf({ x: B.x - B.r - 2, y: B.y - B.r - 2, w: 2 * B.r + 4, d: 2 * B.r + 4, r: B.r + 2 }, C.ZB, 1, P)}"/>`];
  out.push(S(k.cylinder(B.x, B.y, 6, C.ZB, B.z0 - C.ZB, P, 24), { tone: "mid" }));
  out.push(S(k.cylinder(B.x, B.y, B.r, B.z0, B.floor, P, 96), { tone: "hi", crease: "lo" }));
  out.push(Ln(k.ring(B.x, B.y, B.r - B.wall - 3, B.z0 + B.floor, P, 72) + k.ring(B.x, B.y, 9, B.z0 + B.floor, P, 48), { tone: "faint" }));
  out.push(S(k.extrude(sector(B.r - B.wall, B.r, SPLIT[1], SPLIT[0] + 360, 64), B.z0 + B.floor, B.z1 - B.z0 - B.floor, P, { convex: false }), { tone: "hi", crease: "faint" }));
  out.push(S(k.extrude(sector(B.r - 1.8, B.r, SPLIT[1], SPLIT[0] + 360, 64), B.z1, 0.8, P, { convex: false }), { tone: "hi", crease: "lo" }));
  return out.join("");
}

// In front of Roo: the near half of the wall, its outer face toward the viewer, with a turned groove round it.
export function barrelFront() {
  return S(k.extrude(sector(B.r - B.wall, B.r, SPLIT[0], SPLIT[1], 64), B.z0, B.z1 - B.z0, P, { convex: false }), {
    tone: "hi", crease: "lo", inner: Ln(arcAt(B.r, B.z0 + 4, SPLIT[0] + 2, SPLIT[1] - 2, 64), { tone: "faint" }),
  }) + S(k.extrude(sector(B.r - 1.8, B.r, SPLIT[0], SPLIT[1], 64), B.z1, 0.8, P, { convex: false }), { tone: "hi", crease: "lo" });
}

export { arcAt, L };
