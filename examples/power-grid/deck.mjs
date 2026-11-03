import { k, L, P, at, S, Ln, D, box, seg, handrail, rod, rodAB } from "./shapes.mjs";
import { C, byDepth } from "./model.mjs";

// The turbine deck: a concrete table on columns, the generator's terminal box hung under it, a stair down to
// the plinth at its front, handrails and the soleplates the machines sit on.
const DK = C.DECK, Z = C.DECK_Z, T = 5;
export const COLS = [-258, -196, -136, -76, -40].flatMap((x) => [[x, -56], [x, 20]]);
export function deckUnder(cols) {
  const out = cols[0][1] < 0 ? [`<path class="iso-halo" d="${k.haloOf(k.insetPlan(DK, -3), 0, 3, P)}"/>`] : [];
  for (const [x, y] of byDepth(cols, ([x, y]) => [x, y, 0])) {
    out.push(S(box(x - 5, y - 5, 0, x + 5, y + 5, 2, 0.4), { tone: "lo" }));
    out.push(S(box(x - 3.6, y - 3.6, 2, x + 3.6, y + 3.6, Z - T, 0.3), { tone: "mid", inner: Ln(k.sideSeam({ x: x - 3.6, y: y - 3.6, w: 7.2, d: 7.2, r: 0.3 }, 12, P, 2), { tone: "faint" }) }));
    out.push(S(box(x - 4.6, y - 4.6, Z - T - 2, x + 4.6, y + 4.6, Z - T, 0.3), { tone: "mid" }));
  }
  return out.join("");
}
export function deckSlab() {
  const out = [], plan = DK;
  const joints = [-196, -136, -76].map((x) => seg([x, DK.y + DK.d, Z - T], [x, DK.y + DK.d, Z]));
  out.push(S(k.slabOf(plan, Z - T, T, P, 2, 0.6), { tone: "lo", inner: Ln(joints.join("") + k.sideSeam(plan, Z - 1.6, P, 2), { tone: "faint" }) }));
  // Chequer-plate walkway along the front edge with its seams, and the drain channel.
  const walk = { x: DK.x + 2, y: DK.y + DK.d - 12, w: DK.w - 4, d: 10, r: 0.4 };
  out.push(S(k.slabOf(walk, Z, 0.4, P, 2), { tone: "mid" }));
  out.push(Ln(Array.from({ length: 15 }, (_, i) => seg([walk.x + 16 * (i + 1), walk.y, Z + 0.4], [walk.x + 16 * (i + 1), walk.y + walk.d, Z + 0.4])).join(""), { tone: "faint" }));
  out.push(D(Array.from({ length: 30 }, (_, i) => at([walk.x + 4 + i * 8, walk.y + 5, Z + 0.4])), { size: 0.35, tone: "lo" }));
  return out.join("");
}
// Soleplates under each machine's feet, with anchor bolts.
export function soleplates(spans) {
  const out = [];
  for (const [xa, xb, ya, yb] of spans) {
    out.push(S(box(xa, ya, Z, xb, yb, Z + 1.2, 0.3), { tone: "lo" }));
    out.push(D([[xa + 1.4, yb, Z + 0.6], [xb - 1.4, yb, Z + 0.6], [(xa + xb) / 2, yb, Z + 0.6]].map(at), { size: 0.45, tone: "lo" }));
  }
  return out.join("");
}
export function deckRail() {
  const y = DK.y + DK.d - 1;
  return handrail([[DK.x + 2, y], [-58, y]], Z, { gap: 14, h: 10 }) + handrail([[-28 - 1, y - 30], [-28 - 1, DK.y + 2]], Z, { gap: 14, h: 10 });
}
// A stair from the deck's front edge down to the plinth, at its right end.
export const STAIR = { x: -54, y0: 28, y1: 54, w: 10 };
export function stair() {
  const out = [], { x, y0, y1, w } = STAIR, n = 10, run = (y1 - y0) / n, rise = Z / n;
  for (const side of [x, x + w]) out.push(S(stringer(side, y0, y1), { tone: "mid" }));
  const treads = [];
  for (let i = 0; i < n; i++) treads.push([x + 0.6, y0 + run * (i + 0.3), Z - rise * (i + 1)]);
  for (const [tx, ty, tz] of byDepth(treads, (p) => p)) out.push(S(box(tx, ty, tz - 0.5, tx + w - 1.2, ty + run * 0.7, tz, 0.15), { tone: "hi" }));
  out.push(S(box(x - 1, y1 - 1, 0, x + w + 1, y1 + 3, 1, 0.3), { tone: "lo" }));
  for (const side of [x - 0.2, x + w + 0.2]) {
    const a = [side, y0, Z + 10], b = [side, y1, 10];
    out.push(S(rodAB(a, b, 0.4, 8), { tone: "hi" }) + S(k.cylinder(side, y1, 0.45, 0, 10, P, 8), { tone: "hi", crease: "none" }));
  }
  return out.join("");
}
// A stringer: a thin sloped plate, drawn as a prism along the slope.
const stringer = (x, y0, y1) => {
  const a = [x, y0, Z], b = [x, y1, 0], dir = L.unit3(L.sub3(b, a)), l = L.len3(L.sub3(b, a)), u = [1, 0, 0], v = L.unit3(L.cross3(dir, u));
  return L.prismOf(L.frameOf(a, dir, u, v), [[-0.5, -1.6], [0.5, -1.6], [0.5, 1.6], [-0.5, 1.6]], 0, l, P);
};
// Lube oil supply and drain pipes along the deck's back edge, dropping to each bearing pedestal.
export function lubeOil() {
  const out = [], y = DK.y + 4, z = Z + 3;
  out.push(S(rod([DK.x + 8, y, z], [1, 0, 0], 1.3, 0, 200, 12), { tone: "hi" }));
  out.push(S(rod([DK.x + 8, y + 3.4, Z + 1.6], [1, 0, 0], 1.6, 0, 200, 12), { tone: "mid" }));
  for (const x of [-196, -186, -84, -76]) out.push(S(box(x - 1.2, y - 1.6, Z, x + 1.2, y + 1.6, z, 0.2), { tone: "lo" }));
  return out.join("");
}
void rod;
