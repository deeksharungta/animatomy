import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D, ptA } from "./model.mjs";
import { F } from "./story.mjs";

const Z = C.BENCH, WX = -34, WY = -66, E = 60, TOP = 160;
const seg = (a, b) => k.segment(a, b, P);
const vert = (x, y, z0, z1, r, tone = "hi") => S(L.solidOf([[0, r], [z1 - z0, r]], L.frameOf([x, y, z0], [0, 0, 1], [1, 0, 0], [0, 1, 0]), P), { tone, crease: "none" });

// Two walls in the corner behind the bench, tiled, every joint running edge to edge.
export function walls() {
  const out = [S(k.slabOf({ x: WX - 2, y: WY - 2, w: 2, d: E - WY + 2, r: 0 }, Z, TOP - Z, P), { tone: "lo" }), S(k.slabOf({ x: WX, y: WY - 2, w: E - WX, d: 2, r: 0 }, Z, TOP - Z, P), { tone: "lo" })];
  const rows = [], cols = [];
  for (let z = Z + 15; z < TOP; z += 15) rows.push(seg([WX, WY, z], [WX, E, z]), seg([WX, WY, z], [E, WY, z]));
  for (let t = WY + 15; t < E; t += 15) cols.push(seg([WX, t, Z], [WX, t, TOP]));
  for (let t = WX + 15; t < E; t += 15) cols.push(seg([t, WY, Z], [t, WY, TOP]));
  return out.join("") + Ln(rows.join("") + cols.join(""), { tone: "faint" });
}

// The bench top, with a skirting strip along both walls.
export function bench() {
  const grain = [-48, -30, -12, 8, 26, 44].map((y) => seg([WX, y, Z], [E, y, Z])).join("");
  return S(k.slabOf({ x: WX, y: WY, w: E - WX, d: E - WY, r: 0 }, Z - 6, 6, P), { tone: "mid", inner: Ln(grain, { tone: "faint" }) }) +
    S(k.slabOf({ x: WX, y: WY, w: 1.4, d: E - WY, r: 0 }, Z, 5, P), { tone: "mid" }) + S(k.slabOf({ x: WX + 1.4, y: WY, w: E - WX - 1.4, d: 1.4, r: 0 }, Z, 5, P), { tone: "mid" });
}

// The notepad under the nib: ruled lines across it, a spiral of wire rings along its top edge.
export function notepad() {
  const p = { x: -11, y: -12, w: 28, d: 34, r: 0.8 }, z1 = Z + 1.2;
  const rules = Array.from({ length: 8 }, (_, i) => seg([p.x + 5 + i * 3.2, p.y, z1], [p.x + 5 + i * 3.2, p.y + p.d, z1])).join("");
  const rings = Array.from({ length: 9 }, (_, i) => L.arcOf(L.frameOf([p.x + 1.6, p.y + 3 + i * 4, z1], [0, 1, 0], [1, 0, 0], [0, 0, 1]), 0, 1.3, P, { least: -1 })).join("");
  return S(k.slabOf(p, Z, 1.2, P, 3), { tone: "hi", inner: Ln(rules, { tone: "faint" }) }) + Ln(rings, { tone: "mid" });
}

// What the pen wrote: a line of ink across the pad, the one thing on it in the ink's own colour.
export function writing() {
  const z = Z + 1.21, pts = Array.from({ length: 40 }, (_, i) => { const t = i / 39; return at([4 + t * 2, -10 + t * 24, z + 0 * t]).map((v, j) => v + (j ? Math.sin(t * 19) * 1.1 : 0)); });
  return `<g class="pen-ink-line">${k.lineSvg(k.pathOf(pts), { tone: "hi", free: true })}</g>`;
}

// A steel rule on the bench, millimetre ticks hanging from its edge.
export function ruler() {
  const p = { x: 20, y: -34, w: 5, d: 40, r: 0.3 }, z1 = Z + 0.8;
  const ticks = k.topTicks(p.y + 2, p.y + p.d - 2, 2, 5, p.x + p.w, z1, [-1, -2], P, "y");
  return S(k.slabOf(p, Z, 0.8, P, 2), { tone: "hi", inner: Ln(ticks.minor, { tone: "lo" }) + Ln(ticks.major, { tone: "mid", free: true }) });
}

// The retort stand: a cast base on four feet, its rod, a boss head with a thumbscrew, and the clamp arm.
const ROD = [-24, 0], ARM_Z = 44;
export function stand() {
  const base = { x: -32, y: -17, w: 18, d: 34, r: 2 };
  const out = [`<path class="iso-halo" d="${k.haloOf(base, Z, 3, P)}"/>`, S(k.slabOf(base, Z, 3.4, P, 6, 0.8), { tone: "lo" })];
  out.push(D(k.corners(base, 3).map(([x, y]) => at([x, y, Z + 3.4])), { size: 0.5, tone: "mid" }));
  out.push(vert(ROD[0], ROD[1], Z + 3.4, Z + 5.2, 3.2, "mid"), vert(ROD[0], ROD[1], Z + 5.2, 146, 1.6));
  out.push(S(k.slabOf({ x: ROD[0] - 3, y: ROD[1] - 3, w: 6, d: 6, r: 0.6 }, ARM_Z - 4, 8, P, 2, 0.4), { tone: "mid" }));
  const fx = L.frameOf([ROD[0] + 3, ROD[1], ARM_Z + 2], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  out.push(S(L.solidOf([[0, 0.9], [2.6, 0.9], [2.6, 2], [3.6, 2]], fx, P), { tone: "hi", crease: "none" }));
  out.push(S(L.solidOf([[0, 1.2], [ROD[0] * -1 - 10.5, 1.2]], L.frameOf([ROD[0] + 3, ROD[1], ARM_Z - 1.5], [1, 0, 0], [0, 1, 0], [0, 0, 1]), P), { tone: "hi", crease: "none" }));
  return out.join("");
}

// The clamp's two jaws round the grip, lined with cork; the back half before the pen, the front after.
function jaw(a0, a1) {
  const angles = F.sweep(a0, a1, 4), z0 = ARM_Z - 3.2, z1 = ARM_Z + 3.2, r0 = C.GRIP[2], r1 = r0 + 1.6;
  const faces = [...F.panel(r1, angles, () => z0, () => z1, 1), ...F.flat(z1, r0, r1, angles), ...F.side(a0, r0, r1, z0, z1, z0, z1, -1), ...F.side(a1, r0, r1, z0, z1, z0, z1, 1)];
  return S(F.solid(faces), { tone: "mid" });
}
export const jawBack = () => jaw(100, 260) + S(k.slabOf({ x: -9.5, y: ROD[1] - 2, w: 3, d: 4, r: 0.4 }, ARM_Z - 3.2, 6.4, P, 2), { tone: "mid" });
export const jawFront = () => jaw(-80, 80) + D([at(ptA(C.GRIP[2] + 1.6, 0, ARM_Z))], { size: 0.55, tone: "lo" });
