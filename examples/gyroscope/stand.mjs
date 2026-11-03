import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S_ as S, Ln, Dt, UP } from "./model.mjs";

// ---------------------------------------------------------------- the column and the swivel's fixed half

export function column() {
  const out = [], Co = C.COL, H = C.HOUSING, Rg = C.RINGS, F = C.FORK;
  out.push(S(k.cylinder(0, 0, Co.r, 18, Co.z1 - 18, P, 32), { tone: "hi", crease: "none" }));
  // A clamp collar on the column, with its thumb screw.
  out.push(S(L.solidOf([[24, 6], [24.6, 6.6, 1], [29.4, 6.6, 1], [30, 6]], L.frameAlong([0, 0, 0], UP), P), { tone: "mid" }));
  const tsF = L.frameAlong([6.4 * 0.71, 6.4 * 0.71, 27], [0.71, 0.71, 0]);
  out.push(S(L.solidOf([[0, 1], [2.4, 1]], tsF, P), { tone: "hi" }), S(L.disc(2.4, 4.6, 2.6, tsF, P), { tone: "hi", inner: Ln(L.ribsOf(tsF, 2.4, 4.6, 2.6, 16, P), { tone: "faint" }) }));
  // The swivel housing: a turned body with a degree ring round its top, ticks every 5°, longer every 30°.
  out.push(S(L.solidOf([[H.z0, Co.r + 1], [H.z0 + 2, H.r - 1, 1], [H.z0 + 4, H.r, 1], [H.z1, H.r]], L.frameAlong([0, 0, 0], UP), P), { tone: "mid" }));
  const t = k.radialTicks(0, 0, H.r - 0.2, 72, 6, H.z1, [0.9, 1.9], P);
  out.push(Ln(t.minor, { tone: "faint" }), Ln(t.major, { tone: "lo" }));
  // The slip rings: three rings on insulating spacers, so current reaches the turning arm.
  for (let i = 0; i < 3; i++) {
    const z = Rg.z0 + i * 2.7;
    out.push(S(k.cylinder(0, 0, Rg.r - 1, z, 1.1, P, 32), { tone: "lo", crease: "none" }));
    out.push(S(k.cylinder(0, 0, Rg.r, z + 1.1, 1.6, P, 32), { tone: "hi" }));
  }
  // The brush block: fixed to the housing, a spring brush on each ring.
  const bb = { x: Rg.r + 1.6, y: -2.6, w: 3, d: 5.2, r: 0.4 };
  out.push(S(k.slabOf(bb, H.z1, Rg.z1 - H.z1, P, 2, 0.3), { tone: "mid" }));
  out.push(Dt([at([bb.x + 1.5, bb.y + 1, Rg.z1]), at([bb.x + 1.5, bb.y + bb.d - 1, Rg.z1])], { size: 0.4 }));
  // The fork plate: turns with the swing, but it is round, so it is drawn once.
  out.push(S(L.solidOf([[F.z0 - 0.4, Rg.r], [F.z0, F.r, 1], [F.z1, F.r]], L.frameAlong([0, 0, 0], UP), P), { tone: "mid" }));
  out.push(Dt([0, 1, 2, 3].map((i) => at([5.8 * Math.cos(0.4 + (i * Math.PI) / 2), 5.8 * Math.sin(0.4 + (i * Math.PI) / 2), F.z1])), { size: 0.45 }));
  return out.join("");
}

// The park post: a rod off the base with a round platform for Pinch, under the parked counterweight half.
export function post(pa) {
  const x = C.POST.r * Math.cos(pa), y = C.POST.r * Math.sin(pa), z1 = C.POST.z1;
  const out = [];
  out.push(S(L.solidOf([[12, 4.4], [13.4, 4.4, 1], [15, 3]], L.frameAlong([x, y, 0], UP), P), { tone: "mid" }));
  out.push(S(k.cylinder(x, y, C.POST.rad - 1.4, 15, z1 - 18, P, 20), { tone: "hi", crease: "none" }));
  // Two platforms: Pinch works from the top one and drops to the lower one, clear of the latch eye's sweep.
  for (const z of [z1, z1 - C.POST.drop]) out.push(S(L.solidOf([[z - 3, 2], [z - 2.4, 5.6, 1], [z, 5.6]], L.frameAlong([x, y, 0], UP), P), { tone: "mid" }), Dt([at([x + 3.6, y + 3.6, z]), at([x - 3.6, y - 3.6, z])], { size: 0.4 }));
  return out.join("");
}
