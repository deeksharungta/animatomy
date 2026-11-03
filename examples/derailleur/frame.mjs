import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, Dt, V } from "./model.mjs";
import { tube } from "./bike.mjs";
import { partsKit } from "./moving.mjs";

const Q = partsKit({ ...k, ...L }, P, C);
const DY = 66;

// The frame's drive side: the chainstay forward to the bottom bracket, the seatstay up to the seat tube,
// both welded to the dropout the axle sits in; the hanger hangs below it to the derailleur's bolt.
export function stays() {
  return tube([[6, DY + 3, -6], [-420, 46, -64]], 9, "mid", 0) + tube([[2, DY + 3, 10], [-250, 52, 360]], 7.5, "mid", 0);
}
export function dropout() {
  const poly = [[-16, -10], [-10, 14], [14, 18], [26, 4], [30, -18], [20, -30], [6, -24]];
  const out = [S(Q.polyY(poly, DY, DY + 6), { tone: "mid" })];
  out.push(S(Q.polyY([[12, -20], [30, -18], [30, -32], [18, -34]], DY + 6, DY + 10), { tone: "mid" }));
  out.push(S(L.solidOf([[0, 9], [3, 9], [4, 7.5, 1], [7, 7]], L.frameAlong([0, DY + 6, 0], [0, 1, 0]), P), { tone: "hi", crease: "none" }));
  out.push(S(L.disc(0, 2, 4.5, L.frameAlong([0, DY + 13, 0], [0, 1, 0]), P), { tone: "mid", crease: "lo" }));
  return out.join("");
}

// The B-knuckle: the body from the hanger bolt back to the parallelogram's fixed pivots, the B-tension and limit
// screws, and the cable stop with its barrel adjuster, whose top is a flat ledge.
export function bKnuckle() {
  const A = C.ARC.axis, Bk = C.BK, o = C.OFF, B = C.BOLT, out = [];
  out.push(S(L.disc(0, 9, 10, L.frameAlong([B[0], B[1] - 9, B[2]], [0, 1, 0]), P), { tone: "mid", crease: "lo" }));
  out.push(S(Q.bar3(B, [Bk[0], Bk[1] + 4, Bk[2]], 8.5, 6, [0, 1, 0]), { tone: "mid" }));
  for (const s of [1, -1]) out.push(S(Q.discA(Bk.map((v, i) => v + o[i] * s), A, 4.6, -6, 6), { tone: "mid", crease: "lo" }));
  out.push(S(L.disc(0, 3, 6, L.frameAlong([B[0], B[1], B[2]], [0, 1, 0]), P), { tone: "hi", crease: "lo" }));
  out.push(Ln(k.pathOf([at([B[0] - 6, B[1] + 3, B[2]]), at([B[0] + 6, B[1] + 3, B[2]])]), { tone: "lo" }));
  // The B-tension screw, bearing on the hanger's tab behind the bolt.
  out.push(S(L.disc(0, 5, 2.2, L.frameAlong([B[0] + 8, B[1] - 4, B[2] - 7], [0.2, 0, 0.98]), P), { tone: "hi", crease: "lo" }));
  const mid = B.map((v, i) => v + (Bk[i] - v) * 0.55);
  for (const dz of [-4, 4]) out.push(S(L.disc(0, 3.4, 2, L.frameAlong([mid[0] + 2, mid[1] + 6, mid[2] + dz], [0, 1, 0]), P), { tone: "hi", crease: "lo" }));
  // The ledge Roo stands on: a flat arm off the knuckle's foot, with two screws and a web beneath.
  const r = C.CREW.roo.at;
  out.push(S(Q.polyY([[r[0] - 10, r[2] - 9], [r[0] - 10, r[2] - 2], [r[0] + 2, r[2] - 2]], 81, 83), { tone: "mid" }));
  out.push(S(Q.bar3([Bk[0] + 2, r[1] + 1, r[2] - 1.3], [r[0] + 12, r[1] + 1, r[2] - 1.3], 1.3, 8.5, [0, 0, 1]), { tone: "mid" }));
  out.push(Dt([at([r[0] + 8, r[1] + 5, r[2]]), at([r[0] + 8, r[1] - 3, r[2]])], { size: 0.5, tone: "lo" }));
  const bar = C.BARREL;
  out.push(S(Q.bar3([bar[0] - 3, bar[1], bar[2] - 6], [mid[0], mid[1] + 2, mid[2]], 3, 3, [0, 1, 0]), { tone: "mid" }));
  out.push(S(L.disc(-7, 0, 4.2, L.frameAlong(bar, [-0.6, 0.1, 0.8]), P), { tone: "hi", crease: "lo", inner: Ln(L.ribsOf(L.frameAlong(bar, [-0.6, 0.1, 0.8]), -6.5, -0.5, 4.2, 18, P, { seams: true }), { tone: "faint" }) }));
  return out.join("");
}

// The outer cable housing from the chainstay's stop, looping back to the barrel adjuster.
export function housing() {
  const b = C.BARREL, d = [-0.6, 0.1, 0.8], end = b.map((v, i) => v + d[i] * 7);
  return S(L.disc(0, 6, 3.2, L.frameAlong([-96, DY - 2, -26], [1, 0.04, -0.12]), P), { tone: "mid", crease: "lo" }) +
    tube([[-90, DY - 1.8, -26.7], [-30, DY + 4, -36], [end[0] - 20, end[1] + 2, end[2] + 30], end], 2.4, "lo", 10);
}
