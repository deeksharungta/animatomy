// The drive, drawn once at rest: the wheel's rims, hub and axle on its post, the belt pulley and the toothed belt up
// to the shaft pulley, the arm shaft in its three bearings, the handwheel's rim and hub; and on the top cover the
// spool pins and spools, the thread guide and the bobbin winder. What turns is redrawn each frame in moving.mjs.
import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D } from "./model.mjs";
import { ringX } from "./bed.mjs";

const W = C.WHEEL, Q = C.PULL, SH = C.SHAFT, HW = C.HAND, BT = C.BT, TOP = C.TOP;
const alongX = (x, y, z) => L.frameOf([x, y, z], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
const up = (x, y, z) => L.frameOf([x, y, z], [0, 0, 1], [1, 0, 0], [0, 1, 0]);

// The belt: two straight runs tangent to both pulleys, in the plane x = Q.x.
export function beltRuns() {
  const c1 = [W.y, W.z], c2 = [SH.y, SH.z], d = Math.hypot(c2[0] - c1[0], c2[1] - c1[1]);
  const base = Math.atan2(c2[1] - c1[1], c2[0] - c1[0]), a = Math.acos((Q.r1 - Q.r2) / d);
  return [1, -1].map((s) => { const t = base + s * a; return [[Q.x, c1[0] + Q.r1 * Math.cos(t), c1[1] + Q.r1 * Math.sin(t)], [Q.x, c2[0] + Q.r2 * Math.cos(t), c2[1] + Q.r2 * Math.sin(t)]]; });
}

// Behind the wheel: the belt, both pulleys and the far rim.
export function wheelBack() {
  const out = [];
  out.push(S(L.disc(0, 6, Q.r1, alongX(Q.x - 3, W.y, W.z), P), { tone: "mid", crease: "lo", inner: Ln(ringX(Q.x + 3, W.y, W.z, Q.r1 - 3), { tone: "faint" }) }));
  out.push(S(L.disc(0, 6, Q.r2, alongX(Q.x - 3, SH.y, SH.z), P), { tone: "mid", crease: "lo" }));
  for (const [a, b] of beltRuns()) out.push(S(L.prismOf(L.frameOf(a, L.unit3(L.sub3(b, a)), [1, 0, 0], L.unit3(L.cross3([1, 0, 0], L.sub3(b, a)))), [[-2.6, -0.8], [2.6, -0.8], [2.6, 0.8], [-2.6, 0.8]], 0, L.len3(L.sub3(b, a)), P), { tone: "lo" }));
  out.push(S(L.disc(0, W.x0 - Q.x + 3, 2.2, alongX(Q.x + 3, W.y, W.z), P), { tone: "hi" }));
  out.push(Ln(ringX(W.x0, W.y, W.z, W.r) + ringX(W.x0, W.y, W.z, W.r - 1.4), { tone: "hi" }));
  return out.join("");
}

// In front of the hamsters: the near rim, the hub, the axle's end and the post it turns in.
export function wheelFront() {
  const out = [];
  out.push(S(L.disc(0, W.x1 - W.x0, 3.4, alongX(W.x0, W.y, W.z), P), { tone: "hi" }));
  out.push(Ln(ringX(W.x1, W.y, W.z, W.r) + ringX(W.x1, W.y, W.z, W.r - 1.4), { tone: "hi" }));
  out.push(S(L.disc(0, 6, 2.2, alongX(W.x1, W.y, W.z), P), { tone: "hi" }));
  const px = W.x1 + 6;
  out.push(S(k.slabOf({ x: px, y: W.y - 6, w: 5, d: 12, r: 1 }, BT, W.z + 6 - BT, P, 3, 0.4), { tone: "mid" }));
  out.push(S(k.slabOf({ x: px - 3, y: W.y - 10, w: 11, d: 20, r: 1 }, BT, 3, P, 3, 0.4), { tone: "mid" }));
  out.push(D([[px - 1.5, W.y - 8], [px - 1.5, W.y + 8]].map(([x, y]) => at([x, y, BT + 3])), { size: 0.5 }));
  out.push(S(k.slabOf({ x: px - 0.6, y: W.y - 7, w: 6.2, d: 14, r: 1.2 }, W.z + 6, 3, P, 3, 0.4), { tone: "hi" }));
  out.push(D([[px + 2.5, W.y - 4.6], [px + 2.5, W.y + 4.6]].map(([x, y]) => at([x, y, W.z + 9])), { size: 0.5 }));
  return out.join("");
}

// The arm shaft, its bearings, and the handwheel's rim and hub (its spokes turn).
export function handBack() {
  const out = [], F = alongX(HW.x - HW.w, SH.y, SH.z);
  out.push(S(L.ringBand(0, HW.w, HW.r - 6, HW.r, F, P), { tone: "hi", crease: "lo", inner: k.fadedSvg(L.ribsOf(F, 0.6, HW.w - 0.6, HW.r, 72, P, { fade: [0.05, 0.45], seams: true }), { tone: "faint" }) }));
  out.push(S(L.disc(0, HW.w - 2, 8, F, P), { tone: "mid" }));
  out.push(S(L.disc(-6, 0, 6, F, P), { tone: "hi", inner: k.fadedSvg(L.ribsOf(F, -5.6, -0.4, 6, 24, P, { fade: [0.05, 0.4], seams: true }), { tone: "faint" }) }));
  return out.join("");
}
export function shaft() {
  const out = [];
  out.push(S(L.disc(0, SH.x1 - SH.x0, SH.r, alongX(SH.x0, SH.y, SH.z), P), { tone: "hi" }));
  for (const x of [-40, 30]) {
    out.push(S(k.slabOf({ x: x - 5, y: -36, w: 10, d: SH.y + 36 - 2, r: 1 }, SH.z - 6, 12, P, 3, 0.4), { tone: "mid" }));
    out.push(S(L.disc(0, 10, 6, alongX(x - 5, SH.y, SH.z), P), { tone: "hi", crease: "lo" }));
    out.push(D([at([x, SH.y, SH.z + 6])], { size: 0.5 }));
  }
  out.push(S(L.disc(0, 4, 6, alongX(-162, SH.y, SH.z), P), { tone: "hi", crease: "lo" }));
  out.push(S(L.ringBand(0, 2, SH.r, 5, alongX(-146, SH.y, SH.z), P), { tone: "mid" }));
  return out.join("");
}

// On the top cover: two spool pins with spools, the thread guide and the bobbin winder.
export const SPOOL = [10, -6, TOP];
export const GUIDE = [44, 12, TOP + 8];
export function topParts() {
  const out = [];
  for (const [x, y] of [[-34, -6], [SPOOL[0], SPOOL[1]]]) {
    const F = up(x, y, TOP);
    out.push(`<path class="iso-halo" d="${k.ring(x, y, 9, TOP, P, 32)}"/>`);
    const spool = S(L.solidOf([[0, 8.5], [2, 8.5], [2.4, 6.4], [21.6, 6.4], [22, 8.5], [24, 8.5]], F, P, { fill: "hull" }), { tone: x < 0 ? "mid" : "hi", inner: k.fadedSvg(L.ribsOf(F, 2.6, 21.4, 6.4, 20, P, { fade: [0.05, 0.4], seams: true }), { tone: "faint" }) });
    out.push(x < 0 ? spool : `<g class="sm-wound">${spool}</g>`);
    out.push(S(L.disc(24, 30, 1.1, F, P), { tone: "hi" }) + Ln(L.arcOf(F, 24, 3, P, { least: -1 }), { tone: "lo" }));
  }
  out.push(S(k.cylinder(GUIDE[0], GUIDE[1], 1.4, TOP, 6, P, 12), { tone: "hi" }));
  out.push(S(L.ringBand(-1, 1, 1.4, 3, L.frameOf(GUIDE, [0, 1, 0], [1, 0, 0], [0, 0, 1]), P), { tone: "hi" }));
  // The bobbin winder: base, spindle, a bobbin on it, the rubber tyre and the latch.
  const wb = { x: -150, y: 0, w: 34, d: 14, r: 2 };
  out.push(S(k.slabOf(wb, TOP, 3, P, 3, 0.5), { tone: "mid" }) + D(k.corners(wb, 2.4).map(([x, y]) => at([x, y, TOP + 3])), { size: 0.45 }));
  const G = alongX(-148, 7, TOP + 9);
  out.push(S(k.slabOf({ x: -126, y: 3, w: 4, d: 8, r: 0.6 }, TOP + 3, 9, P, 2), { tone: "mid" }));
  out.push(S(L.disc(0, 24, 1.2, G, P), { tone: "hi" }));
  out.push(S(L.disc(2, 14, 5.5, G, P), { tone: "hi", inner: Ln(L.circleOf(G, 8, 5.5, P), { tone: "faint" }) }));
  out.push(S(L.disc(-2, 2, 6, G, P), { tone: "lo", inner: k.fadedSvg(L.ribsOf(G, -1.6, 1.6, 6, 18, P, { fade: [0.05, 0.4], seams: true }), { tone: "faint" }) }));
  out.push(S(k.slabOf({ x: -120, y: 9, w: 10, d: 3, r: 0.6 }, TOP + 3, 2, P, 2), { tone: "hi" }));
  return out.join("");
}
