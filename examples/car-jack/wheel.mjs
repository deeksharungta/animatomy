// The car's front wheel, cut on the section plane 75 mm outboard of its centre: the tyre's tread ring in section with
// the air inside it, the inner sidewall beyond, the brake disc and caliper, the wheel's spokes, hub and nuts, and the
// rim's barrel in section. Built at rest on the floor; the page lifts it once the suspension has dropped.
import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D } from "./model.mjs";

const W = C.WHEEL, X = W.x, Z = W.r, TAU = Math.PI * 2;
const pt = (r, a, y) => at([X + r * Math.cos(a), y, Z + r * Math.sin(a)]);
const ring = (r0, r1, y, n = 96) => {
  const o = [], i = [];
  for (let j = 0; j <= n; j++) { const a = (j / n) * TAU; o.push(pt(r1, a, y)); i.push(pt(r0, -a, y)); }
  return k.pathOf(o, true) + (r0 > 0 ? k.pathOf(i, true) : "");
};
const flat = (d, shade, tone) => `<g class="iso-solid"><path class="iso-fill" d="${d}" fill-rule="evenodd"/><path class="iso-shade" data-shade="${shade}" d="${d}" fill-rule="evenodd"/><path class="iso-line iso-edge" data-tone="${tone}" d="${d}"/></g>`;
const poly = (pts, y) => k.pathOf(pts.map(([r, a]) => pt(r, a, y)), true);

// The arch's liner behind the tyre, part of the body: drawn first, lifted with the car.
export function liner() {
  const a0 = -0.24, a1 = Math.PI + 0.24, pts = [];
  for (let j = 0; j <= 48; j++) pts.push([W.arch, a0 + ((a1 - a0) * j) / 48]);
  for (let j = 48; j >= 0; j--) pts.push([W.arch - 18, a0 + ((a1 - a0) * j) / 48]);
  return `<g class="cj-cave">${flat(poly(pts, W.y0 + 10), 1, "lo")}</g>`;
}

export function wheel() {
  const out = [`<path class="iso-halo" d="${k.haloOf({ x: X - 120, y: W.y0, w: 240, d: 150, r: 40 }, 0, 1, P)}"/>`];
  // The tyre: tread shoulders rounding into its sidewall, tread blocks across its face and grooves round it.
  const F = L.frameOf([X, W.y0, Z], [0, 1, 0], [1, 0, 0], [0, 0, 1]), len = -W.y0;
  const tread = k.fadedSvg(L.ribsOf(F, 24, len, W.r, 72, P, { fade: [0.05, 0.45], seams: "first" }), { tone: "lo" });
  const grooves = [52, 88, 124].map((s) => L.arcOf(F, s, W.r, P)).join("");
  out.push(`<g class="cj-rubber">${S(L.solidOf([[0, W.r - 52], [9, W.r - 14, 1], [24, W.r, 1], [len, W.r]], F, P), { tone: "mid", crease: "lo", inner: tread + Ln(grooves, { tone: "lo" }) })}</g>`);
  // Cut open: the air inside the tyre, the sidewall's inside beyond it, and the tread blocks' grooves in section.
  out.push(`<g class="cj-cave">${flat(ring(0, W.r - 17, 0), 0, "lo")}${flat(ring(W.r - 70, W.r - 22, W.y0 + 4), 1, "lo")}</g>`);
  // The brake disc with its vented edge and the caliper riding it, behind the wheel's face.
  out.push(flat(ring(70, 138, -96), 2, "mid") + Ln(ring(0, 104, -96), { tone: "faint" }));
  const cal = [[96, 0.32], [150, 0.3], [150, 0.86], [96, 0.88]];
  out.push(flat(poly(cal, -82), 1, "mid") + D([[123, 0.42], [123, 0.76]].map(([r, a]) => pt(r, a, -82)), { size: 0.7 }));
  // The wheel's face: five spokes from the hub to the rim, four nuts on their circle, the centre cap.
  const spokes = [];
  for (let j = 0; j < 5; j++) { const a = (j / 5) * TAU + 0.3; spokes.push(poly([[56, a - 0.42], [182, a - 0.2], [182, a + 0.2], [56, a + 0.42]], -30)); }
  out.push(flat(spokes.join(""), 3, "mid"));
  out.push(flat(ring(0, 60, -30), 3, "mid") + Ln(ring(0, 42, -30), { tone: "faint" }));
  out.push(D([0, 1, 2, 3].map((j) => pt(30, (j / 4) * TAU + 0.6, -29)), { size: 1.4, tone: "mid" }) + flat(ring(0, 13, -29), 2, "mid"));
  // The rim in section: its barrel, the bead seat and the flange lip the tyre's bead sits on.
  out.push(flat(ring(184, 198, 0), 3, "hi") + `<g class="cj-rubber">${flat(ring(198, W.r - 52, 0), 1, "lo")}${flat(ring(W.r - 17, W.r, 0.05), 2, "mid")}</g>`);
  out.push(D([0, 1, 2, 3, 4, 5, 6, 7].map((j) => pt(191, (j / 8) * TAU + 0.2, 0)), { size: 0.5, tone: "lo" }));
  const slots = [];
  for (let j = 0; j < 40; j++) { const a = (j / 40) * TAU; slots.push(poly([[W.r - 0.4, a - 0.012], [W.r - 6, a - 0.012], [W.r - 6, a + 0.012], [W.r - 0.4, a + 0.012]], 0)); }
  out.push(`<path class="cj-void" d="${slots.join("")}"/>`);
  return out.join("");
}
