import { k, L, P, at, S, Ln, D, box, seg, rod, circleX } from "./shapes.mjs";
import { C, byDepth } from "./model.mjs";
import { TBOX } from "./generator.mjs";

// The 22 kV isolated-phase bus: one welded aluminium enclosure per phase from the generator's terminal box to
// the transformer's LV turret, on steel portals, with bolted joint bands, an expansion bellows near the
// transformer and an inspection window on the near phase that shows the conductor on its post insulators.
export const IPB = { x0: TBOX.x1, x1: 2, ys: [-52, -44, -36], z: 19, r: 3.2, cond: 1.7 };
export const WIN = { x0: -64, x1: -36, half: 1.05 };
const X = [1, 0, 0], bands = [-78, -56, -14], bellows = [-6, -2];
const nearAngle = Math.atan2(...(() => { const v = L.viewOf(P); return [v[2], v[1]]; })());

export function portals() {
  const out = [];
  for (const x of [-84, -46, -10]) {
    const ya = IPB.ys[0] - 7, yb = IPB.ys[2] + 7, top = IPB.z - IPB.r - 1;
    for (const y of [ya, yb]) out.push(S(box(x - 1, y - 1, 0, x + 1, y + 1, top, 0.2), { tone: "mid" }) + S(box(x - 2, y - 2, 0, x + 2, y + 2, 0.8, 0.2), { tone: "lo" }));
    out.push(S(box(x - 1.2, ya - 1, top - 1.6, x + 1.2, yb + 1, top, 0.2), { tone: "mid" }));
  }
  return out.join("");
}
// One phase: the enclosure in sections, its bands and bellows, flanges at both ends. The near phase gets the window.
export function phase(i) {
  const y = IPB.ys[i], out = [], { x0, x1, z, r } = IPB;
  const cuts = [x0, ...bellows.slice(0, 1), x1];
  out.push(S(rod([x0, y, z], X, r, 0, bellows[0] - x0, 28), { tone: "hi", crease: "lo", inner: Ln(bands.map((x) => L.arcOf(L.frameAlong([x, y, z], X), 0, r, P)).join(""), { tone: "lo" }) }));
  for (const x of bands) out.push(S(L.disc(-0.7, 0.7, r + 0.7, L.frameAlong([x, y, z], X), P), { tone: "mid" }));
  const conv = [];
  for (let s = 0.4; s < bellows[1] - bellows[0]; s += 0.8) conv.push(L.arcOf(L.frameAlong([bellows[0] + s, y, z], X), 0, r + 0.4, P));
  out.push(S(rod([bellows[0], y, z], X, r + 0.5, 0, bellows[1] - bellows[0], 24), { tone: "mid", inner: Ln(conv.join(""), { tone: "lo" }) }));
  out.push(S(rod([bellows[1], y, z], X, r, 0, x1 - bellows[1], 24), { tone: "hi", crease: "lo" }));
  out.push(S(L.disc(-1.2, 0, r + 1.6, L.frameAlong([x1, y, z], X), P), { tone: "mid" }) + D(L.dotsOf(L.frameAlong([x1 - 1.2, y, z], X), 0, r + 1, 8, P, { fade: [0.04, 0.42] }), { size: 0.4 }));
  out.push(S(L.disc(0, 1.2, r + 1.6, L.frameAlong([x0, y, z], X), P), { tone: "mid" }));
  void cuts;
  return out.join("");
}
// The window in the near phase's enclosure: a slot on its viewer side, a void, and the conductor inside.
export function windowPath(i = 2, r = IPB.r + 0.05) {
  const y = IPB.ys[i], { z } = IPB, pts = [], n = 10;
  const pt = (x, t) => at([x, y + r * Math.cos(t), z + r * Math.sin(t)]);
  for (let j = 0; j <= n; j++) pts.push(pt(WIN.x0, nearAngle - WIN.half + (2 * WIN.half * j) / n));
  for (let j = 0; j <= n; j++) pts.push(pt(WIN.x1, nearAngle + WIN.half - (2 * WIN.half * j) / n));
  return k.pathOf(pts, true);
}
export function windowInside(i = 2) {
  const y = IPB.ys[i], { z, cond } = IPB, out = [`<path class="pg-void" d="${windowPath(i)}"/>`];
  for (const x of [WIN.x0 + 7, WIN.x1 - 7]) out.push(S(k.cylinder(x, y, 0.9, z - IPB.r + 0.4, IPB.r - cond - 0.4, P, 12), { tone: "lo", crease: "none" }));
  out.push(`<g class="pg-cu">${S(rod([WIN.x0 - 2, y, z], X, cond, 0, WIN.x1 - WIN.x0 + 4, 20), { tone: "hi", crease: "lo" })}</g>`);
  return out.join("") + `<path class="pg-rim" d="${windowPath(i)}"/>`;
}
// The transformer's LV turret: a box on the tank's -x face with three flanged spouts.
export function turret() {
  const out = [S(box(IPB.x1, IPB.ys[0] - 8, 9, 12, IPB.ys[2] + 8, 29, 0.5, 0.4), { tone: "mid" })];
  out.push(Ln(IPB.ys.map((y) => circleX(IPB.x1, y, IPB.z, IPB.r + 1, 24)).join(""), { tone: "lo" }));
  return out.join("");
}
export const phasesBack = () => byDepth([0, 1], (i) => [-40, IPB.ys[i], IPB.z]).map(phase).join("");
void seg;
