// The bed, cut open at its front right so the hook pit shows: the casting on its rubber feet, the section faces, the
// pit's floor, the hook's pedestal and race, the bobbin case with its tension spring, and the skin and throat plate
// over the pit, notched where the section passes the needle hole and the feed slots.
import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D } from "./model.mjs";

const B = C.BED, X = C.CUT.x, Y = C.CUT.y, BT = C.BT, zf = C.FOOT;
const up = (x, y, z) => L.frameOf([x, y, z], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
// A plan with only its left (or right) corners rounded: x0..x1 by y0..y1.
function plan(x0, y0, x1, y1, r, rounded) {
  const pts = [], arc = (cx, cy, a0) => { for (let i = 0; i <= 6; i++) { const a = a0 + (i / 6) * (Math.PI / 2); pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } };
  const c = { br: [x1, y0, -Math.PI / 2], tr: [x1, y1, 0], tl: [x0, y1, Math.PI / 2], bl: [x0, y0, Math.PI] };
  for (const key of ["bl", "br", "tr", "tl"]) {
    const [x, y, a] = c[key];
    if (rounded.includes(key)) arc(x + (key.includes("l") ? r : -r), y + (key.startsWith("b") ? r : -r), a); else pts.push([x, y]);
  }
  return pts;
}
// The notched skin over the pit: the section steps back left of the needle so the hook's race shows; the needle
// hole and the feed slot open at its edge.
const SLOTS = [[98.8, 101.2, 8.8], [115.5, 118.5, -6]], X2 = C.CUT.x2, Y2 = C.CUT.y2;
function notched(x0, y0, x1) {
  const pts = [[x0, y0], [x1, y0], [x1, Y]];
  for (const [a, b, yy] of [...SLOTS].reverse()) pts.push([b, Y], [b, yy], [a, yy], [a, Y]);
  pts.push([X2, Y], [X2, Y2], [x0, Y2]);
  return pts;
}
export const ringX = (x, cy, cz, r, n = 72) => k.pathOf(Array.from({ length: n }, (_, i) => at([x, cy + r * Math.cos((i / n) * Math.PI * 2), cz + r * Math.sin((i / n) * Math.PI * 2)])), true);

export function bedBack() {
  const out = [`<path class="iso-halo" d="${k.haloOf(k.insetPlan(B, -6), 0, 2, P)}"/>`];
  for (const x of [-150, -40]) out.push(S(L.disc(0, 14, 4, L.frameOf([x - 7, B.y - 2, 30], [1, 0, 0], [0, 1, 0], [0, 0, 1]), P), { tone: "hi" }));
  for (const [x, y] of k.corners(B, 14)) out.push(S(k.cylinder(x, y, 7, 0, zf, P, 24), { tone: "lo" }));
  // The left of the bed, whole; its right face is the section through a rib where the pit's front was cut away.
  const A = plan(B.x, B.y, X, B.y + B.d, B.r, ["bl", "tl"]);
  const hatch = [];
  for (let s = 6; s < 120; s += 6) {
    const p0 = [X, Y + s, zf], p1 = [X, Y, zf + s];
    const clip = (p, q) => { const t0 = Math.max(0, (p[1] - (B.y + B.d)) / (p[1] - q[1])), t1 = Math.min(1, (BT - p[2]) / (q[2] - p[2])); return t1 > t0 ? [L.lerp3(p, q, t0), L.lerp3(p, q, t1)] : null; };
    const seg = clip(p0, p1);
    if (seg) hatch.push(k.pathOf(seg.map(at)));
  }
  out.push(S(k.extrude(A, zf, BT - zf, P, { bevel: 1 }), { tone: "mid", inner: Ln(hatch.join(""), { tone: "faint" }) }));
  out.push(Ln(k.pathOf([[X, Y, zf], [X, B.y + B.d, zf], [X, B.y + B.d, BT], [X, Y, BT]].map(at), true), { tone: "lo" }));
  out.push(Ln(k.ringSeam(A, zf + 8, P), { tone: "faint" }));
  // The bed's ruler along its front edge, and the accessory drawer's door in its face, with a finger recess.
  const t = k.topTicks(B.x + 14, X - 4, 5, 2, B.y + B.d, BT, [-1.6, -3.2], P);
  out.push(Ln(t.minor, { tone: "faint" }) + Ln(t.major, { tone: "lo" }));
  const fy = B.y + B.d, door = [[-40, 12], [30, 12], [30, 46], [-40, 46]];
  out.push(Ln(k.pathOf(door.map(([x, z]) => at([x, fy, z])), true) + k.pathOf([[-37, 15], [27, 15], [27, 43], [-37, 43]].map(([x, z]) => at([x, fy, z])), true), { tone: "lo" }));
  out.push(`<path class="iso-halo" d="${k.pathOf([[-10, 40], [0, 40], [0, 43], [-10, 43]].map(([x, z]) => at([x, fy, z])), true)}" style="opacity:.8"/>`);
  out.push(D([[-37, fy, 29], [27, fy, 29]].map(at), { size: 0.5 }));
  // The pedal's socket on the bed's front.
  out.push(S(k.slabOf({ x: -156, y: fy, w: 12, d: 2, r: 1 }, 10, 12, P, 3, 0.3), { tone: "hi" }) + D([at([-150, fy + 2, 16])], { size: 0.9, tone: "lo" }));
  // The back block behind the pit, the pit's floor, and its left wall face.
  out.push(S(k.extrude(plan(X, B.y, B.x + B.w, -40, B.r, ["br"]), zf, BT - zf, P, { bevel: 1 }), { tone: "mid" }));
  out.push(S(k.extrude(plan(X, -40, B.x + B.w, B.y + B.d, B.r, ["tr"]), zf, 4, P), { tone: "lo" }));
  // Cast ribs across the pit's floor, an oil pad and a drain hole.
  for (const y of [-24, 60]) out.push(S(k.slabOf({ x: X + 2, y, w: B.x + B.w - X - 4, d: 2.4, r: 0.4 }, zf + 4, 3, P, 2), { tone: "mid" }));
  out.push(S(k.slabOf({ x: 136, y: -21.6, w: 2.4, d: 81.6, r: 0.4 }, zf + 4, 3, P, 2), { tone: "mid" }));
  const pad = { x: 118, y: 36, w: 18, d: 12, r: 2 };
  out.push(S(k.slabOf(pad, zf + 4, 1.2, P, 3), { tone: "mid", inner: Ln(k.planOutline(k.insetPlan(pad, 2), zf + 5.2, P, 3), { tone: "faint" }) }));
  out.push(`<path class="iso-halo" d="${k.ring(70, 50, 3, zf + 4, P, 20)}" style="opacity:.8"/>` + Ln(k.ring(70, 50, 3, zf + 4, P, 20), { tone: "lo" }));
  out.push(D([[64, -34], [140, -34], [140, 70], [66, 72]].map(([x, y]) => at([x, y, zf + 4])), { size: 0.5 }));
  // The label plate on the bed's front.
  const lp = [-120, B.y + B.d, 22];
  out.push(Ln(k.pathOf([[lp[0], lp[1], lp[2]], [lp[0] + 60, lp[1], lp[2]], [lp[0] + 60, lp[1], lp[2] + 16], [lp[0], lp[1], lp[2] + 16]].map(at), true), { tone: "lo" }));
  out.push(Ln([12, 8.5, 5].map((dz, i) => k.segment([lp[0] + 8, lp[1], lp[2] + dz], [lp[0] + 52 - i * 10, lp[1], lp[2] + dz], P)).join(""), { tone: "lo", free: true }));
  out.push(D([[lp[0] + 3, lp[1], lp[2] + 8], [lp[0] + 57, lp[1], lp[2] + 8]].map(at), { size: 0.5 }));
  // The extension table's seam on the bed's top, its two latch slots, and two spare bobbins and a seam ripper on it.
  out.push(Ln(k.pathOf([[-86, -60], [30, -60], [30, 64], [-86, 64]].map(([x, y]) => at([x, y, BT])), true), { tone: "faint" }));
  out.push(`<path class="iso-halo" d="${k.pathOf([[-20, 64], [-8, 64], [-8, 60], [-20, 60]].map(([x, y]) => at([x, y, BT])), true)}" style="opacity:.8"/>`);
  for (const [x, y] of [[-40, 30], [-26, 40]]) out.push(S(L.solidOf([[0, 5], [1, 5], [1.2, 3.4], [6.8, 3.4], [7, 5], [8, 5]], L.frameOf([x, y, BT + 5], [1, 0, 0], [0, 1, 0], [0, 0, 1]), P, { fill: "hull" }), { tone: "hi" }));
  const R = L.frameOf([4, 30, BT + 1.2], [0.8, 0.6, 0], [0, 0, 1], [-0.6, 0.8, 0]);
  out.push(S(L.disc(0, 18, 1.2, R, P), { tone: "mid", crease: "lo" }) + S(L.disc(-1, 0, 1.6, R, P), { tone: "hi" }));
  out.push(S(L.disc(-26, -1, 2.4, R, P), { tone: "hi", inner: k.fadedSvg(L.ribsOf(R, -25, -2, 2.4, 10, P, { fade: [0.05, 0.4], seams: true }), { tone: "faint" }) }));
  // Bed screws along the top's back edge.
  out.push(D([[-160, -64], [-60, -64], [30, -64], [130, -64]].map(([x, y]) => at([x, y, BT])), { size: 0.55 }));
  return out.join("");
}

// The hook's pedestal on the pit floor, and the race ring Pinch walks round, with its index ticks.
export function pit() {
  const out = [], [bx, by] = C.B, H = C.HOOK;
  out.push(S(L.solidOf([[0, 8], [2.5, 8], [3, 3.6], [H.race - zf - 9, 3.6], [H.race - zf - 7, 6], [H.race - zf - 4, 6]], up(bx, by, zf + 4), P, { fill: "hull" }), { tone: "mid" }));
  // Two webs brace the post to its base.
  for (const a of [0.2, 2.6]) out.push(S(L.prismOf(L.frameOf([bx + 3.4 * Math.cos(a), by + 3.4 * Math.sin(a), zf + 6.5], [Math.cos(a), Math.sin(a), 0], [0, 0, 1], [-Math.sin(a), Math.cos(a), 0]), [[0, -0.8], [16, -0.8], [16, 0.8], [0, 0.8]].map(([u, v], i) => [u, v]), 0, 4, P), { tone: "mid" }));
  out.push(D([0.4, 2.0, 3.6, 5.2].map((a) => at([bx + 6.5 * Math.cos(a), by + 6.5 * Math.sin(a), zf + 6.5])), { size: 0.5 }));
  out.push(S(L.ringBand(0, 2, H.caseR + 1, 22, up(bx, by, H.race), P), { tone: "hi", crease: "lo" }));
  out.push(S(L.ringBand(2, 2.8, 20.8, 22, up(bx, by, H.race), P), { tone: "mid" }));
  const ticks = [];
  for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2, r1 = i % 6 ? 20 : 18.5; ticks.push(k.pathOf([at([bx + 22 * Math.cos(a), by + 22 * Math.sin(a), H.race + 2]), at([bx + r1 * Math.cos(a), by + r1 * Math.sin(a), H.race + 2])])); }
  out.push(Ln(ticks.join(""), { tone: "lo" }));
  out.push(D([[bx - 18, by + 7], [bx + 7, by + 18]].map(([x, y]) => at([x, y, H.race + 2])), { size: 0.5 }));
  return out.join("");
}

// The bobbin case: a cup with its rim, the latch, the tension spring and its screw, and the bobbin's wound top.
export function bobbin() {
  const out = [], [bx, by] = C.B, H = C.HOOK, F = up(bx, by, H.race + 2);
  out.push(S(L.solidOf([[0, H.caseR - 1], [1, H.caseR, 1], [H.top - H.race - 3.5, H.caseR, 1], [H.top - H.race - 3, H.caseR + 0.6], [H.top - H.race - 2, H.caseR + 0.6]], F, P), { tone: "hi", inner: Ln(L.arcOf(F, 3, H.caseR, P), { tone: "faint" }) }));
  out.push(`<path class="iso-halo" d="${k.ring(bx, by, H.caseR - 1.5, H.top, P, 48)}" style="opacity:.8"/>`);
  out.push(`<g class="sm-wound">${S(L.disc(H.top - H.race - 5, H.top - H.race - 2.4, 5.5, F, P), { tone: "mid", inner: Ln(L.arcOf(F, H.top - H.race - 3.6, 5.5, P), { tone: "faint" }) })}</g>`);
  out.push(S(L.disc(H.top - H.race - 2.4, H.top - H.race - 2, 2.4, F, P), { tone: "hi" }));
  // The tension spring along the case's side facing the needle, and its screw.
  const a0 = 0.1, a1 = -0.75, sp = Array.from({ length: 10 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / 9; return at([bx + (H.caseR + 0.7) * Math.cos(a), by + (H.caseR + 0.7) * Math.sin(a), H.race + 7]); });
  out.push(Ln(k.pathOf(sp), { tone: "mid" }) + D([sp[0], sp[9]], { size: 0.5, tone: "hi" }));
  const latch = [bx + (H.caseR + 0.6) * Math.cos(0.7), by + (H.caseR + 0.6) * Math.sin(0.7)];
  out.push(S(k.slabOf({ x: latch[0] - 2, y: latch[1] - 1, w: 4, d: 2, r: 0.4 }, H.top - 3, 3, P, 2), { tone: "mid" }));
  return out.join("");
}
export const SLOT = [108, C.CUT.y];

// The skin over the pit, the throat plate and its seam-guide lines; notched at the needle hole and the feed slots.
export function skin() {
  const out = [], Q = C.PLATE, x1 = B.x + B.w;
  out.push(S(k.extrude(notched(X, -40, x1), BT - C.SKIN, C.SKIN, P, { convex: false }), { tone: "mid" }));
  out.push(S(k.extrude(notched(Q.x, Q.y, Q.x + Q.w), BT, 0.6, P, { convex: false }), { tone: "hi", crease: "lo" }));
  const guides = [], z = BT + 0.6;
  for (const x of [126, 131, 136]) guides.push(k.lineOnTop([x, Q.y], [x, Y], z, P));
  out.push(Ln(guides.join(""), { tone: "lo" }));
  const t = k.topTicks(Q.y + 4, Y - 2, 2, 5, 136, z, [1.5, 3], P, "y");
  out.push(Ln(t.minor, { tone: "faint" }) + Ln(t.major, { tone: "lo" }));
  out.push(D([[Q.x + 5, Q.y + 5], [Q.x + Q.w - 5, Q.y + 5]].map(([x, y]) => at([x, y, z])), { size: 0.6, tone: "lo" }));
  return out.join("");
}
