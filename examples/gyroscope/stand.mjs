import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S_ as S, Ln, Dt, UP, cordOf } from "./model.mjs";

// ---------------------------------------------------------------- the plinth, the turned base and the column

const PL = C.PLINTH, BA = C.BASE;
export function base() {
  const out = [], pl = { x: PL.x, y: PL.y, w: PL.w, d: PL.d, r: PL.r };
  out.push(`<path class="iso-halo" d="${k.haloOf(k.insetPlan(pl, -4), 0, 0.1, P)}" style="filter:blur(5px)"/>`);
  // Four levelling feet: a rubber pad, a hex nut and a knurled screw head standing proud at each corner.
  for (const [x, y] of k.corners(pl, 7)) {
    out.push(S(k.cylinder(x, y, 5.4, 0, 1.6, P, 28), { tone: "lo" }), S(L.solidOf([[1.6, 2.2], [PL.z0, 2.2]], L.frameAlong([x, y, 0], UP), P), { tone: "mid" }));
  }
  // The cast-iron plinth: a heavy bevelled slab, a groove round its top and a rule line round its sides.
  out.push(S(k.slabOf(pl, PL.z0, PL.z1 - PL.z0, P, 6, 1.2), { tone: "mid", inner: Ln(k.sideSeam(pl, PL.z0 + 2.4, P, 6), { tone: "faint" }) }));
  out.push(Ln(k.planOutline(k.insetPlan(pl, 4), PL.z1, P, 6), { tone: "faint" }));
  for (const [x, y] of k.corners(pl, 7)) {
    out.push(S(k.cylinder(x, y, 3, PL.z1, 2.4, P, 24, 0.3), { tone: "hi", inner: Ln(k.knurl(x, y, 3, PL.z1, PL.z1 + 2.4, 24, P, 0.3), { tone: "faint" }) }));
    out.push(Dt([at([x, y, PL.z1 + 2.4])], { size: 0.5, tone: "lo" }));
  }
  // A ruler along the front edge of the top, millimetres to the column's centre.
  const fy = PL.y + PL.d - 6, t = k.topTicks(PL.x + 14, PL.x + PL.w - 14, 2.5, 4, fy, PL.z1, [1.1, 2.2], P, "x");
  out.push(S(k.slabOf({ x: PL.x + 12, y: fy - 3, w: PL.w - 24, d: 3, r: 0.3 }, PL.z1, 0.4, P, 2), { tone: "hi", inner: "" }));
  out.push(Ln(t.minor, { tone: "faint" }), Ln(t.major, { tone: "lo" }));
  // The label plate on the front face, with its rule lines and two screws.
  const ly = PL.y + PL.d, lp = { x: -14, y: ly, w: 28, d: 0.5, r: 0.3 };
  out.push(S(k.slabOf(lp, 6.6, 6.4, P, 2), { tone: "hi" }));
  out.push(Ln([0, 1, 2].map((i) => k.pathOf([at([lp.x + 3, ly + 0.5, 11.4 - i * 1.7]), at([lp.x + (i ? 18 : 24), ly + 0.5, 11.4 - i * 1.7])])).join(""), { tone: "faint", free: true }));
  out.push(Dt([at([lp.x + 1.3, ly + 0.5, 9.8]), at([lp.x + lp.w - 1.3, ly + 0.5, 9.8])], { size: 0.4 }));
  // A bubble level let into the top at the back corner.
  const bx = PL.x + 14, by = PL.y + 14;
  out.push(S(k.cylinder(bx, by, 5, PL.z1, 1.6, P, 28, 0.3), { tone: "hi" }), Ln(k.ring(bx, by, 3.2, PL.z1 + 1.6, P, 28) + k.ring(bx, by, 1.4, PL.z1 + 1.6, P, 20), { tone: "lo" }), Dt([at([bx + 0.4, by - 0.4, PL.z1 + 1.6])], { size: 1, tone: "lo" }));
  // The turned base with its bolt circle, and the column's foot.
  out.push(S(L.solidOf([[BA.z0, BA.r], [BA.z0 + 1, BA.r + 0.6, 1], [BA.z1 - 1.4, BA.r, 1], [BA.z1, BA.r - 1.6]], L.frameAlong([0, 0, 0], UP), P), { tone: "hi" }));
  out.push(Dt(Array.from({ length: 8 }, (_, i) => at([21.6 * Math.cos((i * Math.PI) / 4 + 0.4), 21.6 * Math.sin((i * Math.PI) / 4 + 0.4), BA.z1])), { size: 0.55, tone: "lo" }));
  out.push(Ln(k.ring(0, 0, 18, BA.z1, P, 64), { tone: "faint" }));
  out.push(S(L.solidOf([[BA.z1, 10], [BA.z1 + 2, 9.4, 1], [BA.z1 + 6, 6], [BA.z1 + 8, C.COL.r + 0.6]], L.frameAlong([0, 0, 0], UP), P), { tone: "mid" }));
  // The lead's gland on the base, and the mains cable's gland in the plinth's side.
  out.push(S(L.solidOf([[0, 1.8], [1.6, 1.8, 1], [2.2, 1.2]], L.frameAlong([9.6, 3, BA.z1], UP), P), { tone: "hi" }));
  out.push(S(L.solidOf([[0, 2.6], [3, 2.6, 1], [3.6, 1.8]], L.frameAlong([PL.x + PL.w, 18, 9.6], [1, 0, 0]), P), { tone: "hi" }));
  return out.join("");
}

export function column() {
  const out = [], Co = C.COL, H = C.HOUSING, Rg = C.RINGS;
  out.push(S(k.cylinder(0, 0, Co.r, Co.z0 + 8, Co.z1 - Co.z0 - 8, P, 32), { tone: "hi", crease: "none" }));
  // A clamp collar on the column, with its thumb screw.
  out.push(S(L.solidOf([[40, 6.4], [40.6, 7, 1], [45.4, 7, 1], [46, 6.4]], L.frameAlong([0, 0, 0], UP), P), { tone: "mid" }));
  const tsF = L.frameAlong([6.8 * 0.71, 6.8 * 0.71, 43], [0.71, 0.71, 0]);
  out.push(S(L.solidOf([[0, 1], [2.4, 1]], tsF, P), { tone: "hi" }), S(L.disc(2.4, 4.6, 2.6, tsF, P), { tone: "hi", inner: Ln(L.ribsOf(tsF, 2.4, 4.6, 2.6, 16, P), { tone: "faint" }) }));
  // The lead from the slip-ring brushes: out of the housing, down the column in two clips, into the base.
  const lead = [[8.2, 3, 95.8], [8.2, 3, 92], [Co.r + 1.2, 3, 86], [Co.r + 1.2, 3, 30], [9.6, 3, BA.z1 + 2.2]];
  out.push(cordOf(lead, 0.8));
  for (const z of [72, 46]) out.push(S(L.solidOf([[z - 1.4, Co.r + 0.5], [z + 1.4, Co.r + 0.5]], L.frameAlong([0, 0, 0], UP), P), { tone: "mid" }), S(L.disc(0, 1.4, 1.4, L.frameAlong([Co.r + 1.2, 3, z - 0.7], UP), P), { tone: "mid" }));
  out.push(S(L.solidOf([[0, 1.4], [1.2, 1.4]], L.frameAlong([8.2, 3, 97], [0, 0, -1]), P), { tone: "hi" }));
  // The swivel housing: a turned body with a degree ring round its top, ticks every 5°, longer every 30°.
  out.push(S(L.solidOf([[H.z0, Co.r + 1], [H.z0 + 2, H.r - 1, 1], [H.z0 + 4, H.r, 1], [H.z1, H.r]], L.frameAlong([0, 0, 0], UP), P), { tone: "mid", inner: Ln(L.arcOf(L.frameAlong([0, 0, 0], UP), H.z0 + 6.6, H.r, P), { tone: "faint" }) }));
  const t = k.radialTicks(0, 0, H.r - 0.2, 72, 6, H.z1, [1, 2.2], P);
  out.push(Ln(t.minor, { tone: "faint" }), Ln(t.major, { tone: "lo" }));
  // The slip rings: three rings on insulating spacers, so current reaches the turning arm.
  for (let i = 0; i < 3; i++) {
    const z = Rg.z0 + i * 2.7;
    out.push(S(k.cylinder(0, 0, Rg.r - 1, z, 1.1, P, 32), { tone: "lo", crease: "none" }));
    out.push(S(k.cylinder(0, 0, Rg.r, z + 1.1, 1.6, P, 32), { tone: "hi" }));
  }
  // The brush block: fixed to the housing, a spring brush on each ring, a terminal screw for each lead.
  const bb = { x: Rg.r + 1.2, y: -2.6, w: 3, d: 5.2, r: 0.4 };
  out.push(S(k.slabOf(bb, H.z1, Rg.z1 - H.z1 - 0.6, P, 2, 0.3), { tone: "mid" }));
  out.push(Dt([0, 1, 2].map((i) => at([bb.x + bb.w, 0, Rg.z0 + 1.9 + i * 2.7])), { size: 0.45, tone: "lo" }));
  out.push(Dt([at([bb.x + 1.5, bb.y + 1, Rg.z1 - 0.6]), at([bb.x + 1.5, bb.y + bb.d - 1, Rg.z1 - 0.6])], { size: 0.4 }));
  // The fork plate turns with the swing, but it is round, so it is drawn once; its screws turn with the fork.
  const F = C.FORK;
  out.push(S(L.solidOf([[F.z0 - 0.4, Rg.r], [F.z0, F.r, 1], [F.z1, F.r]], L.frameAlong([0, 0, 0], UP), P), { tone: "mid" }));
  return out.join("");
}
