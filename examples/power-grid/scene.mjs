import { k, L, P, at, S, Ln, D, box, seg, circleY, ringY, rod, cabinet } from "./shapes.mjs";
import { C, SITE, sitePlan, byDepth } from "./model.mjs";

// The site: a chamfered concrete plinth with expansion joints, a ruler strip and a rating plate on its front,
// the switchyard's kerbed gravel bed, a covered cable trench, a firewall behind the transformer and a few props.
const { x0, x1, y0, y1, ch } = SITE;
export function site() {
  const ring = sitePlan(), out = [];
  out.push(`<path class="iso-halo" d="${k.extrude(sitePlan(-4), -10, 4, P).fill}"/>`);
  const slab = k.extrude(ring, -8, 8, P, { bevel: 1.2 });
  const seam = [];
  for (let i = 0; i < ring.length; i++) { const a = ring[i], b = ring[(i + 1) % ring.length]; seam.push(seg([...a, -3], [...b, -3])); }
  out.push(S(slab, { tone: "lo", inner: Ln(seam.join(""), { tone: "faint" }) }));
  // Expansion joints across the top, edge to edge.
  const j = [];
  for (let x = x0 + ch + 40; x < x1 - ch - 10; x += 74) j.push(seg([x, y0, 0], [x, y1, 0]));
  for (const y of [y0 + ch + 8, y1 - ch - 6]) j.push(seg([x0, y, 0], [x1, y, 0]));
  out.push(Ln(j.join(""), { tone: "faint" }));
  return out.join("");
}

// The ruler strip and rating plate on the plinth's front edge.
export function siteFront() {
  const out = [], fy = y1, z = -1.2;
  out.push(S(box(x0 + ch + 8, fy, -6.4, x1 - ch - 8, fy + 0.5, -1.6, 0.2), { tone: "lo" }));
  const t = [];
  for (let x = x0 + ch + 10, i = 0; x <= x1 - ch - 10; x += 6, i++) t.push(seg([x, fy + 0.5, -1.6], [x, fy + 0.5, i % 5 ? -3 : -4.4]));
  out.push(Ln(t.join(""), { tone: "lo" }));
  const px = -120;
  out.push(S(box(px, fy + 0.5, -6.6, px + 26, fy + 1.1, -1.4, 0.2), { tone: "hi" }));
  out.push(Ln([0, 1, 2].map((i) => seg([px + 3, fy + 1.1, -2.8 - i * 1.2], [px + [20, 15, 18][i], fy + 1.1, -2.8 - i * 1.2])).join(""), { tone: "lo", free: true }));
  out.push(D([[px + 1.4, fy + 1.1, -4], [px + 24.6, fy + 1.1, -4]].map(at), { size: 0.45 }));
  void z;
  return out.join("");
}

// The switchyard's gravel bed: a kerb round a lower inlay, the gravel drawn as a pale field with stone rows.
export const YARD = { x: 102, y: -104, w: 166, d: 128, r: 2 };
export function yard() {
  const out = [S(k.slabOf(YARD, 0, 1.2, P, 3, 0.4), { tone: "lo" })];
  out.push(Ln(k.planOutline(k.insetPlan(YARD, 2), 1.2, P, 3), { tone: "faint" }));
  return out.join("");
}

// The cable trench from the panel to the switchyard, with its cover plates.
export const TRENCH = { x: 12, y: 44, w: 104, d: 7, r: 0.6 };
export function trench() {
  const T = TRENCH, out = [S(k.slabOf(T, 0, 0.8, P, 2, 0.3), { tone: "lo" })];
  const j = [];
  for (let x = T.x + 14; x < T.x + T.w - 4; x += 14) j.push(seg([x, T.y, 0.8], [x, T.y + T.d, 0.8]));
  out.push(Ln(j.join(""), { tone: "faint" }));
  out.push(D(Array.from({ length: 8 }, (_, i) => at([T.x + 7 + i * 14, T.y + 3.5, 0.8])), { size: 0.45, tone: "lo" }));
  return out.join("");
}

// The firewall behind the transformer: precast panels on a footing, with a coping.
export const WALL = { x: -2, y: -100, w: 100, d: 6, h: 104 };
export function firewall() {
  const W = WALL, out = [];
  out.push(S(box(W.x - 1, W.y - 1, 0, W.x + W.w + 1, W.y + W.d + 1, 3, 0.4), { tone: "lo" }));
  const joints = [];
  for (let x = W.x + 20; x < W.x + W.w; x += 20) joints.push(seg([x, W.y + W.d, 3], [x, W.y + W.d, W.h]));
  for (const z of [36, 70]) joints.push(k.sideSeam({ x: W.x, y: W.y, w: W.w, d: W.d, r: 0.3 }, z, P, 2));
  out.push(S(box(W.x, W.y, 3, W.x + W.w, W.y + W.d, W.h, 0.3), { tone: "mid", inner: Ln(joints.join(""), { tone: "faint" }) }));
  out.push(S(box(W.x - 1.2, W.y - 1.2, W.h, W.x + W.w + 1.2, W.y + W.d + 1.2, W.h + 2.4, 0.4, 0.4), { tone: "mid" }));
  // Lifting anchors on each panel.
  out.push(D(Array.from({ length: 5 }, (_, i) => at([W.x + 10 + i * 20, W.y + W.d, W.h - 6])), { size: 0.5, tone: "mid" }));
  return out.join("");
}

// Props: a cable drum on chocks, two oil drums for the transformer, and a lamp mast by the panel.
export function drum(x, y) {
  const out = [], F = L.frameAlong([x, y - 6, 9], [0, 1, 0]);
  out.push(S(box(x - 6, y - 7, 0, x - 3, y + 7, 2.4, 0.3), { tone: "lo" }) + S(box(x + 3, y - 7, 0, x + 6, y + 7, 2.4, 0.3), { tone: "lo" }));
  out.push(S(L.disc(0, 1, 9, F, P), { tone: "mid" }));
  out.push(S(L.disc(1, 11, 5.6, F, P), { tone: "lo" }));
  const turns = [];
  for (let s = 1.8; s < 11; s += 1.3) turns.push(L.arcOf(F, s, 5.6, P));
  out.push(Ln(turns.join(""), { tone: "faint" }));
  out.push(S(L.disc(11, 12, 9, F, P), { tone: "mid", inner: Ln(L.circleOf(F, 12, 2, P), { tone: "lo" }) }));
  out.push(D(L.dotsOf(F, 12, 6.8, 8, P, { all: true }), { size: 0.45 }));
  return out.join("");
}
export function oilDrum(x, y) {
  const out = [S(k.cylinder(x, y, 4, 0, 13, P, 32), { tone: "mid", crease: "none", inner: Ln([4.4, 8.6].map((z) => k.sideArc(x, y, 4, z, P, 24)).join(""), { tone: "lo" }) })];
  out.push(Ln(k.ring(x, y, 3.2, 13, P, 32), { tone: "faint" }) + S(k.cylinder(x + 1.8, y - 1.2, 0.8, 13, 0.6, P, 12), { tone: "hi" }));
  return out.join("");
}
export function mast(x, y) {
  const out = [S(box(x - 2.4, y - 2.4, 0, x + 2.4, y + 2.4, 1.6, 0.4), { tone: "lo" })];
  out.push(S(k.cylinder(x, y, 0.9, 1.6, 64, P, 12), { tone: "hi", crease: "none" }));
  out.push(S(rod([x, y, 64], [0, 1, 0], 0.6, 0, 6, 8), { tone: "hi" }));
  out.push(S(box(x - 2.6, y + 5, 61.6, x + 2.6, y + 9, 64.6, 0.6), { tone: "mid" }));
  out.push(Ln(ringY(y + 9, x - 2, x + 2, 62.1, 64.1, 0.5, 2), { tone: "lo" }));
  return out.join("");
}
// A rack of hydrogen and carbon-dioxide bottles for the generator's gas system: a frame, a chain rail and a manifold.
export function bottles(x, y) {
  const out = [S(box(x - 2, y - 4, 0, x + 40, y + 4, 1.2, 0.4), { tone: "lo" })];
  for (const dx of [0, 38]) out.push(S(box(x + dx - 1, y - 3.4, 1.2, x + dx + 1, y - 1.4, 26, 0.2), { tone: "mid" }));
  out.push(S(box(x - 1, y - 3.4, 22, x + 39, y - 1.4, 23.4, 0.2), { tone: "mid" }));
  for (let i = 0; i < 6; i++) {
    const cx = x + 4 + i * 6, F = L.frameAlong([cx, y, 1.2], [0, 0, 1]);
    out.push(S(L.solidOf([[0, 2.6], [17, 2.6, 1], [19, 1.8, 1], [20, 0.9], [21.4, 0.9]], F, P), { tone: i < 4 ? "hi" : "mid", inner: Ln(k.sideArc(cx, y, 2.6, 15, P, 20), { tone: "faint" }) }));
  }
  out.push(S(rod([x + 2, y, 24.2], [1, 0, 0], 0.5, 0, 36, 8), { tone: "hi" }));
  out.push(S(box(x + 41, y - 3, 6, x + 46, y + 3, 16, 0.4), { tone: "mid" }) + D([at([x + 46, y, 13])], { size: 0.5, tone: "hi" }));
  return out.join("");
}
export const props = () => [bottles(-250, 40), drum(150, 38), oilDrum(92, 24), oilDrum(100, 29), mast(-30, 46)];
export { circleY, cabinet, byDepth, C };
