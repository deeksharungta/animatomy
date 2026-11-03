import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, Dt } from "./model.mjs";
import { tube } from "./bike.mjs";
import { partsKit } from "./moving.mjs";

const Q = partsKit({ ...k, ...L }, P, C);
const slot = (c, a, r) => { const F = L.frameAlong(c, a); return Ln(k.pathOf([L.pointOf(F, 0, r, 0.4), L.pointOf(F, 0, r, 0.4 + Math.PI)].map(at)), { tone: "lo" }); };
const hexOn = (c, a, r) => { const F = L.frameAlong(c, a); return Ln(k.pathOf(Array.from({ length: 6 }, (_, i) => at(L.pointOf(F, 0, r, i * 1.0472 + 0.2))), true), { tone: "lo" }); };

// The B-knuckle: the body from the hanger bolt back to the parallelogram's fixed pivots, the B-tension screw, the
// high and low limit screws, Roo's spring seat on the lower pivot, and the cable stop with its barrel adjuster.
export function bKnuckle() {
  const A = C.ARC.axis, Bk = C.BK, o = C.OFF, B = C.BOLT, out = [];
  // Roo's seat: a cup on an arm cast below the lower pivot, its rim under his feet.
  const r = C.CREW.roo.at, foot = [r[0], r[1], r[2] - 2.4];
  out.push(S(Q.bar3([Bk[0] - o[0], Bk[1] - o[1] + 3, Bk[2] - o[2]], [foot[0], foot[1], foot[2] - 1], 3.4, 2.4, [0, 0, 1]), { tone: "mid" }));
  out.push(S(L.disc(0, 2.4, 9, L.frameAlong(foot, [0, 0, 1]), P), { tone: "hi", crease: "lo", inner: Ln(L.circleOf(L.frameAlong(foot, [0, 0, 1]), 2.4, 6.4, P), { tone: "faint" }) }));
  out.push(S(L.disc(0, 9, 10, L.frameAlong([B[0], B[1] - 9, B[2]], [0, 1, 0]), P), { tone: "mid", crease: "lo" }));
  // The knuckle's body, a forged bar with a pocket milled in its outer face and two rivets on the pocket's floor.
  const b1 = [Bk[0], Bk[1] + 4, Bk[2]], dn = L.unit3(L.sub3(b1, B)), u = L.unit3(L.cross3(dn, [0, 1, 0])), v = L.cross3(dn, u);
  const face = (s, r) => L.add3(L.add3(L.add3(B, L.mul3(dn, s)), L.mul3(u, r)), L.mul3(v, -6));
  const len = L.len3(L.sub3(b1, B)), pocket = [[10, -5], [len - 12, -5], [len - 12, 5], [10, 5]].map(([s, r]) => at(face(s, r)));
  out.push(S(Q.bar3(B, b1, 8.5, 6, [0, 1, 0]), { tone: "mid", inner: Ln(k.pathOf(pocket, true), { tone: "faint" }) }));
  out.push(Dt([at(face(16, 0)), at(face(len - 18, 0))], { size: 0.6, tone: "lo" }));
  for (const s of [1, -1]) out.push(S(Q.discA(Bk.map((v, i) => v + o[i] * s), A, 4.6, -6, 6), { tone: "mid", crease: "lo", inner: Ln(L.circleOf(L.frameAlong(Bk.map((v, i) => v + o[i] * s), A), 6, 2.6, P), { tone: "faint" }) }));
  // The hanger bolt, a 5 mm hex socket in its head, and the B-tension screw bearing on the hanger's tab.
  out.push(S(L.disc(0, 3, 6, L.frameAlong(B, [0, 1, 0]), P), { tone: "hi", crease: "lo", inner: hexOn([B[0], B[1] + 3, B[2]], [0, 1, 0], 2.6) }));
  const bt = [B[0] + 8, B[1] - 4, B[2] - 7], btA = [0.2, 0, 0.98];
  out.push(S(L.disc(0, 5, 2.2, L.frameAlong(bt, btA), P), { tone: "hi", crease: "lo", inner: slot(L.add3(bt, L.mul3(btA, 5)), btA, 1.6) }));
  // The limit screws, side by side in the knuckle's face: H above, L below.
  const mid = B.map((v, i) => v + (Bk[i] - v) * 0.55);
  for (const dz of [-4.5, 4.5]) {
    const c = [mid[0] + 2, mid[1] + 6, mid[2] + dz];
    out.push(S(L.disc(0, 3.4, 2, L.frameAlong(c, [0, 1, 0]), P), { tone: "hi", crease: "lo", inner: slot([c[0], c[1] + 3.4, c[2]], [0, 1, 0], 1.5) }));
  }
  const bar = C.BARREL, bd = [-0.6, 0.1, 0.8];
  out.push(S(Q.bar3([bar[0] - 3, bar[1], bar[2] - 6], [mid[0], mid[1] + 2, mid[2]], 3, 3, [0, 1, 0]), { tone: "mid" }));
  out.push(S(L.disc(-7, 0, 4.2, L.frameAlong(bar, bd), P), { tone: "hi", crease: "lo", inner: Ln(L.ribsOf(L.frameAlong(bar, bd), -6.5, -0.5, 4.2, 18, P, { seams: true }), { tone: "faint" }) }));
  return out.join("");
}

// The outer cable housing from the chainstay's stop, looping back to the barrel adjuster, a ferrule on each end;
// the bare inner cable runs forward from the stop along the chainstay to the guide under the bottom bracket.
export const STOP = [-96, 60, -32];
export function housing() {
  const b = C.BARREL, d = [-0.6, 0.1, 0.8], end = b.map((v, i) => v + d[i] * 4.5), sd = [1, 0.04, -0.12], guide = [-386, 24, -96];
  return S(L.prismOf(L.frameOf(guide, [0, 1, 0], [1, 0, 0], [0, 0, 1]), [[-12, -4], [12, -4], [10, 4], [-10, 4]], -6, 6, P), { tone: "mid" }) +
    Ln(k.pathOf([at([guide[0] + 12, guide[1], guide[2] + 1]), at([STOP[0] - 6, STOP[1], STOP[2] + 0.7])]), { tone: "hi" }) +
    Dt([at([guide[0] + 12, guide[1], guide[2] + 1])], { size: 0.7, tone: "lo" }) +
    S(Q.bar3([STOP[0] + 3, STOP[1], STOP[2] + 4], [STOP[0] + 3, STOP[1], STOP[2] + 11], 3, 4, [1, 0, 0]), { tone: "mid" }) +
    S(L.disc(-6, 6, 3.2, L.frameAlong(STOP, sd), P), { tone: "mid", crease: "lo" }) +
    S(L.disc(6, 9, 2.8, L.frameAlong(STOP, sd), P), { tone: "hi", crease: "lo" }) +
    tube([[STOP[0] + 9, STOP[1] + 0.4, STOP[2] - 1.1], [-30, 66, -42], [end[0] - 20, end[1] + 2, end[2] + 30], end], 2.4, "lo", 10) +
    S(L.disc(0, 4.5, 2.8, L.frameAlong(b, d), P), { tone: "hi", crease: "lo" });
}
