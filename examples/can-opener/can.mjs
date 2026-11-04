// The can, the one thing in its own colours: a red paper label on a tinplate body, tomato soup inside. A notch is cut
// out of its rim on the side nearest the opener (from 136° to 171°, down to the soup) so the feed gear under the
// double seam and the lid's cut show. Drawn back to front: the body, the far half of the rim seen from inside, the
// soup, the lid, then the near half of the rim. What turns with the can (label seam, panel, code dots, the cut) is
// in dynamic.mjs.
import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, polar, sector } from "./model.mjs";

const S = (paths, style) => k.solidSvg(paths, style);
const Ln = (d, style) => k.lineSvg(d, style);
const K = C.CAN, N = C.NOTCH, RIN = K.r - K.wall;
const up = (z) => L.frameOf([K.x, K.y, z], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
const arcAt = (r, z, a0, a1, n = 60) => k.pathOf(Array.from({ length: n + 1 }, (_, i) => at(polar(a0 + ((a1 - a0) * i) / n, r, z))));
// The lid outline: the whole disc, less the notch's sector outside r 31.
export const lidRing = () => {
  const pts = [], n = 120;
  for (let i = 0; i <= n; i++) { const a = N.a1 + ((360 - (N.a1 - N.a0)) * i) / n; pts.push(polar(a, RIN, 0).slice(0, 2)); }
  for (let i = 0; i <= 20; i++) { const a = N.a0 + ((N.a1 - N.a0) * i) / 20; pts.push(polar(a, N.r, 0).slice(0, 2)); }
  return pts;
};

export function canLow() {
  const out = [`<path class="iso-halo" d="${k.haloOf({ x: K.x - 42, y: K.y - 42, w: 84, d: 84, r: 42 }, 0, 1, P)}"/>`];
  out.push(S(L.solidOf([[0, K.r - 1], [1.2, K.r + 1.2, 1], [K.bottom - K.z0, K.r + 1.2]], up(K.z0), P, { fill: "hull" }), { tone: "hi", crease: "lo" }));
  out.push(S(k.cylinder(K.x, K.y, K.r, K.bottom, N.z0 - K.bottom, P, 96), { tone: "hi", crease: "none", inner: Ln([13].map((z) => k.sideArc(K.x, K.y, K.r, z, P, 48)).join(""), { tone: "faint" }) }));
  out.push(`<g class="co-label">${S(k.cylinder(K.x, K.y, K.r + 0.15, 16, 86, P, 96), { tone: "hi", crease: "lo", inner: Ln([20, 98].map((z) => k.sideArc(K.x, K.y, K.r + 0.15, z, P, 48)).join(""), { tone: "lo" }) })}</g>`);
  return out.join("");
}

// The far half of the rim band and double seam, seen from inside; its cut face at 171° shows the seam's section.
export function farShell() {
  const out = [];
  out.push(S(k.extrude(sector(RIN, K.r, N.a1, 330, 64), N.z0, K.beadZ - N.z0, P, { convex: false }), { tone: "hi", crease: "faint" }));
  out.push(S(k.extrude(sector(RIN, K.bead, N.a1, 330, 64), K.beadZ, K.top - K.beadZ, P, { convex: false }), { tone: "hi", crease: "lo" }));
  // The seam's layers on the section face: body hook, cover hook and the lid's curl, folded into each other.
  const sec = [[[RIN + 0.3, 111], [K.bead - 0.5, 111]], [[RIN + 0.3, 113.5], [K.bead - 0.5, 113.5]], [[K.r, K.beadZ], [K.r, K.top - 0.5]]];
  out.push(Ln(sec.map(([a, b]) => k.segment(polar(N.a1, a[0], a[1]), polar(N.a1, b[0], b[1]), P)).join(""), { tone: "lo" }));
  return out.join("");
}

export function soup() {
  return `<g class="co-soup">${S(k.extrude(k.circleRing(K.x, K.y, RIN, 96), N.z0 - 0.4, 0.4, P), { tone: "hi", crease: "none" })}</g>` +
    Ln(arcAt(RIN, N.z0, N.a0, N.a1) + arcAt(K.r, N.z0, N.a0, N.a1), { tone: "mid" });
}

// The lid: a flat panel at 112 inside the seam, with two expansion rings and a centre emboss.
export function lidStatic() {
  const out = [];
  out.push(S(k.extrude(lidRing(), K.lid - 0.6, 0.6, P, { convex: false }), { tone: "hi", crease: "none" }));
  out.push(Ln(k.ring(K.x, K.y, 27, K.lid, P, 96) + k.ring(K.x, K.y, 20, K.lid, P, 72) + k.ring(K.x, K.y, 12, K.lid, P, 48), { tone: "faint" }));
  return out.join("");
}

// The near half of the rim: band and seam, outer faces toward the viewer, ending on the notch at 118°.
export function nearShell() {
  const out = [];
  out.push(S(k.extrude(sector(RIN, K.r, 326, N.a0 + 360, 64), N.z0, K.beadZ - N.z0, P, { convex: false }), { tone: "hi", crease: "faint" }));
  out.push(S(k.extrude(sector(RIN, K.bead, 326, N.a0 + 360, 64), K.beadZ, K.top - K.beadZ, P, { convex: false }), { tone: "hi", crease: "lo", inner: Ln(arcAt(K.bead, 113, 330, N.a0 + 360, 80), { tone: "faint" }) }));
  return out.join("");
}
