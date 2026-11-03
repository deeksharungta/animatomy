import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D, inY, rectY } from "./model.mjs";
import { LEFT, RIGHT, CORE, CORE_VENT, BREAKER, BARS, SIZES } from "./section.mjs";

const FL = C.FL, Z = C.Z, R = C.RISER;
// A half round (y <= 0) standing on the cope's top, cut by the plane y = 0 like the box.
const half = (r, n = 28) => Array.from({ length: n + 1 }, (_, i) => { const t = Math.PI + (i / n) * Math.PI; return [r * Math.cos(t), r * Math.sin(t)]; });
const up = (x, z) => L.frameOf([x, 0, z], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
const holeTop = (cx, r, z, n = 24) => k.pathOf(half(r, n).map(([x, y]) => at([cx + x, y, z])), true);
const hole = (cx, r, z, n) => `<path class="sc-void sc-hole" d="${holeTop(cx, r, z, n)}"/>`;

// Holes in the cope's top: the vent, the core's vent, and vent holes pricked with a wire over the casting.
export function copeTop() {
  const out = [], z = Z.top;
  out.push(hole(C.VENT.x, 1.2, z, 10), hole(CORE_VENT.x, 1.3, z, 10));
  const pricks = [];
  for (const x of [-33, -24, -19, -8, 6, 13, 20, 27, 34]) for (const y of [-12, -21, -30]) if (Math.hypot(x - R.x, y) > C.SLEEVE.rim + 2.2) pricks.push(`<path class="sc-void sc-hole" d="${k.ring(x, y, 0.55, z, P, 10)}"/>`);
  out.push(pricks.join(""));
  out.push(Ln(BARS.map((b) => k.lineOnTop([b.x0, FL.y0], [b.x0, 0], z, P) + k.lineOnTop([b.x1, FL.y0], [b.x1, 0], z, P)).join(""), { tone: "lo" }));
  return out.join("");
}

// The pouring cup round the sprue and the insulating sleeve round the riser: each a half round on the cope,
// with a bead round its top and its hole on top.
function onCope(cx, r, rim, cls, holeR, steps) {
  const h = Z.cup - Z.top, out = [];
  out.push(`<path class="iso-halo" d="${k.haloOf({ x: cx - r, y: -r, w: 2 * r, d: r, r: r * 0.6 }, Z.top, 1, P)}"/>`);
  out.push(S(L.prismOf(up(cx, Z.top), half(r), 0, h - 2.4, P), { tone: "lo", className: cls }));
  out.push(S(L.prismOf(up(cx, Z.top), half(rim), h - 2.4, h, P), { tone: "lo", className: cls }));
  out.push(hole(cx, holeR, Z.cup, steps));
  return out.join("");
}
export const cup = () => onCope(SIZES.xs, C.CUP.r, C.CUP.rim, "sc-cupsand", C.BASIN.r, 24);
export const sleeve = () => onCope(R.x, C.SLEEVE.r, C.SLEEVE.rim, "sc-sleeve", R.r, 28);

// Is (x, z) inside a closed outline?
const inside = (pts, x, z) => {
  let s = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, zi] = pts[i], [xj, zj] = pts[j];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) s = !s;
  }
  return s;
};
const face = (d, cls) => `<path class="${cls}" d="${d}"/>` + Ln(d, { tone: "mid" });
const off = (pts, x, z) => pts.every(([px, pz], i) => {
  const [qx, qz] = pts[(i + 1) % pts.length], ex = qx - px, ez = qz - pz, t = Math.max(0, Math.min(1, ((x - px) * ex + (z - pz) * ez) / (ex * ex + ez * ez || 1)));
  return Math.hypot(x - px - ex * t, z - pz - ez * t) > 2.4;
});

// The cut plane: cavities as voids, the core in its own sand with its rod, the cope bars, the chill and the
// sleeve cut through, the facing sand round every cavity and the backing sand's grain.
export function section() {
  const out = [], sl = C.SLEEVE;
  out.push(`<path class="sc-facing" d="${inY(LEFT)}${inY(RIGHT)}${inY(CORE)}"/>`);
  // The backing sand's grain, kept clear of the cavities, the core, the bars and the walls.
  const grains = [], clear = (x, z) => [LEFT, RIGHT, CORE].every((p) => !inside(p, x, z) && off(p, x, z));
  const cupIn = (x, z) => z > Z.top + 1.2 && z < Z.cup - 1.2 && Math.abs(x - SIZES.xs) < C.CUP.r - 1.2;
  for (let x = FL.x0 + 2.2, i = 0; x < FL.x1 - 1.6; x += 3.6, i++) for (let z = Z.board + 2.2; z < Z.cup - 1.2; z += 3.6) {
    const gx = x + ((i * 7 + Math.round(z) * 3) % 5) * 0.32 - 0.6, gz = z + ((i * 3 + Math.round(z)) % 3) * 0.4;
    const box = gz < Z.top - 1.2 && Math.abs(gz - Z.part) > 1 && BARS.every((b) => gx < b.x0 - 1.2 || gx > b.x1 + 1.2 || gz < b.z0 - 1.2);
    if ((box || cupIn(gx, gz)) && clear(gx, gz)) grains.push(at([gx, 0, gz]));
  }
  out.push(D(grains, { size: 0.3, tone: "faint" }));
  // The sleeve's wall, cut: a pale fibrous ring.
  for (const s of [-1, 1]) out.push(face(rectY(R.x + s * R.r, R.x + s * sl.r, Z.top, Z.cup - 2.4) + rectY(R.x + s * R.r, R.x + s * sl.rim, Z.cup - 2.4, Z.cup), "sc-sleevecut"));
  out.push(`<path class="sc-void" d="${inY(LEFT)}"/><path class="sc-void" d="${inY(RIGHT)}"/>`);
  out.push(`<path class="sc-void" d="${rectY(CORE_VENT.x - CORE_VENT.r, CORE_VENT.x + CORE_VENT.r, C.CORE.z1, CORE_VENT.z1)}"/>`);
  // Vent holes pricked down toward the casting, stopping short of it, in the cut.
  for (const x of [13, 17]) out.push(`<path class="sc-void" d="${rectY(x - 0.45, x + 0.45, Z.part + 2.4, Z.top)}"/>`);
  out.push(face(inY(CORE), "sc-core"));
  const cg = [];
  for (let x = SIZES.iL + 1.2; x < SIZES.iR - 0.6; x += 2.4) for (let z = C.CORE.z0 + 1.6; z < C.CORE.z1 - 0.6; z += 2.4) if (Math.abs(x - CORE_VENT.x) > 1.6 && Math.abs(Math.abs(x - CORE_VENT.x) - 4) > 1) cg.push(at([x + ((z * 7) % 1.2) - 0.6, 0, z]));
  out.push(D(cg, { size: 0.35, tone: "lo" }));
  // Two core irons: wires rammed into the core to stiffen it, cut along their length.
  for (const s of [-1, 1]) out.push(face(rectY(CORE_VENT.x + s * 4 - 0.35, CORE_VENT.x + s * 4 + 0.35, C.CORE.z0 + 3, C.CORE.z1 - 3), "sc-bar"));
  out.push(`<path class="sc-void" d="${rectY(CORE_VENT.x - CORE_VENT.r, CORE_VENT.x + CORE_VENT.r, CORE_VENT.z0, C.CORE.z1)}"/>`);
  for (const b of BREAKER) out.push(face(inY(b), "sc-core"));
  for (const b of BARS) out.push(face(rectY(b.x0, b.x1, b.z0, b.z1), "sc-bar"));
  // A steel chill rammed in under the bottom flange's far side, so it freezes before the riser.
  const ch = C.CHILL;
  out.push(face(rectY(ch.x0, ch.x1, ch.z0, ch.z1), "sc-bar"));
  return out.join("");
}
// The outlines of the cavities, drawn over the steel so the steel always ends on a line.
export function outlines() {
  const ln = (pts) => `<path class="sc-cavity" d="${inY(pts)}"/>`;
  return ln(LEFT) + ln(RIGHT) + ln(CORE);
}
