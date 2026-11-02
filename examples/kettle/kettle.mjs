import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { tubePieces, tubeSvg } from "../../kit/tube.mjs";
import { C, P, W, U, TOWARD, at, S, Ln, D, seg, halfDisc, halfRing, inCut, rounded, pin, level } from "./model.mjs";
import { cutSolid } from "./cutsolid.mjs";

// The kettle's back half: the power base, the skirt and its floor, the element plate, the stainless wall,
// the lid and the spout, all cut through the axis by the plane facing the viewer.
const half = (r, z, h, tone = "hi", bevel = 0) => S(k.extrude(halfDisc(r, 48), z, h, P, { bevel }), { tone });
const shell = (r0, r1, z, h, tone = "hi") => S(k.extrude(halfRing(r0, r1, 48), z, h, P, { convex: false }), { tone });
// A ring on a horizontal face, back half only.
const arcTop = (r, z, a0 = 0, a1 = Math.PI) => k.pathOf(Array.from({ length: 41 }, (_, i) => { const t = a0 + (i / 40) * (a1 - a0); return at([r * Math.cos(t), -r * Math.sin(t), z]); }));

export function station() {
  const s = C.STATION, out = [];
  out.push(`<path class="iso-halo" d="${k.pathOf(halfDisc(s.r + 4).map(([x, y]) => k.iso([x, y, 0], P)), true)}"/>`);
  out.push(half(s.r, 0, s.z1, "mid", 0.8));
  out.push(Ln(arcTop(s.r - 6, s.z1) + seg([s.r - 6, 0, s.z1], [s.r, 0, s.z1]) + seg([-s.r + 6, 0, s.z1], [-s.r, 0, s.z1]), { tone: "faint" }));
  // The 360° connector: a ringed post that the kettle's socket drops over.
  out.push(half(9.5, s.z1, 1.2, "mid"), half(7.5, s.z1 + 1.2, 4.2, "hi", 0.4), half(4.2, s.z1 + 5.4, 1.6, "hi"), half(1.6, s.z1 + 7, 1.4, "hi"));
  out.push(Ln(arcTop(5.8, s.z1 + 5.4) + seg([5.8, 0, s.z1 + 5.4], [7.5, 0, s.z1 + 5.4]) + seg([-5.8, 0, s.z1 + 5.4], [-7.5, 0, s.z1 + 5.4]), { tone: "faint" }));
  out.push(D([[44, -30, s.z1], [-20, -50, s.z1], [10, -55, s.z1]].map(at), { size: 0.5 }));
  return out.join("");
}

// The plastic skirt under the element: its floor with the socket, its wall, and the controller housing beside it.
export function skirt() {
  const s = C.SKIRT, out = [];
  out.push(S(k.extrude(halfRing(9.5, s.r1, 48), C.FLOOR, 2, P, { convex: false }), { tone: "mid" }));
  out.push(shell(s.r0, s.r1, s.z0, s.z1 - s.z0, "mid"));
  // Vent slots in the skirt wall, seen from inside, each a closed slot.
  for (const t of [0.35, 0.6, 0.85, 1.1, 1.35]) {
    const r = s.r0 - 0.05, a = [r * Math.cos(t), -r * Math.sin(t)];
    out.push(Ln(k.pathOf([at([a[0], a[1], 16]), at([a[0], a[1], 23]), at([a[0] * 0.985 - 0.9 * Math.sin(t), a[1] * 0.985 - 0.9 * Math.cos(t), 23]), at([a[0] * 0.985 - 0.9 * Math.sin(t), a[1] * 0.985 - 0.9 * Math.cos(t), 16])], true), { tone: "lo" }));
  }
  return out.join("");
}

export function housingBack() {
  const h = C.HOUSE;
  return S(inCut(rounded(h.u0, h.u1, h.z0, h.z1, 2), h.w - 1.5, h.w), { tone: "lo" }) + S(inCut(rounded(C.SPINE.u0, C.SPINE.u1, C.SPINE.z0 - 3, C.SPINE.z1, 1), -7.5, -6), { tone: "lo" });
}

// The element: a sheathed heater bent into a ring and brazed under the plate, with its cold tail and terminal.
export function element() {
  const E = C.ELEM, pts = [];
  for (let i = 0; i <= 40; i++) { const t = (i / 40) * 2.78; pts.push([E.R * Math.cos(t), -E.R * Math.sin(t), E.z]); }
  pts.push([-40, -12, E.z], [-44, -12, E.z]);
  const tube = tubePieces(L.fillet(pts.map(W), 3, 6), E.r, P, { maxLength: 400, spacing: 1.2, caps: [true, false] }).map((p) => tubeSvg(p, { tone: "hi" })).join("");
  const term = L.prismOf(L.frameOf(W([-44, -12, 20]), [0, 0, 1], U, TOWARD), [[-1.6, -1.6], [1.6, -1.6], [1.6, 1.6], [-1.6, 1.6]], 0, E.z - 20 + 1.6, P);
  return tube + S(term, { tone: "mid" });
}

export function plate() {
  const p = C.PLATE;
  return half(p.r, p.z0, p.z1 - p.z0, "hi") + Ln(arcTop(p.r - 5, p.z1) + seg([p.r - 5, 0, p.z1], [p.r, 0, p.z1]) + seg([-p.r + 5, 0, p.z1], [-p.r, 0, p.z1]), { tone: "faint" });
}

// The stainless wall, a trim band where it meets the skirt, and an engraved litre scale inside.
export function wall() {
  const b = C.BODY, out = [];
  out.push(shell(C.SKIRT.r1 - 0.5, C.SKIRT.r1 + 0.6, 28, 3, "mid"));
  out.push(shell(b.r0, b.r1, b.z0, b.z1 - b.z0, "hi"));
  // The rolled bead at the rim and the seam where the wall is sealed to the plate, each running cut to cut.
  out.push(Ln(arcTop(b.r0, 33) + arcTop(b.r0, 146), { tone: "faint" }));
  // The litre scale: ticks every 0.25 L from 0.5 to 1.7 L, a long one each half litre, hanging off one engraved line.
  const t = 1.95, r = b.r0 - 0.05, zOf = (ml) => C.PLATE.z1 + level(ml);
  const ticks = [k.pathOf([at([r * Math.cos(t), -r * Math.sin(t), zOf(500)]), at([r * Math.cos(t), -r * Math.sin(t), zOf(1700)])])];
  for (const ml of [500, 750, 1000, 1250, 1500, 1700]) ticks.push(arcTop(r, zOf(ml), t, t + (ml % 500 === 0 || ml === 1700 ? 0.085 : 0.05)));
  out.push(Ln(ticks.join(""), { tone: "mid" }));
  return out.join("");
}

export function lid() {
  const out = [half(51, C.LID.z, 3.4, "hi", 0.6), half(42, C.LID.z + 3.4, 2.6, "hi", 0.4), half(8, C.LID.z + 6, 3, "mid", 0.3)];
  out.push(S(pin(-49, C.LID.z + 2, 2.2, -8, 0.4), { tone: "mid" }));
  // The lid's silicone seal under its rim, and its steam vent slots on the dome.
  out.push(Ln(arcTop(46, C.LID.z + 3.4), { tone: "faint" }));
  out.push(D([12, 20, 28].map((u) => at([u, -14, C.LID.z + 6])), { size: 0.6, tone: "lo" }));
  return out.join("");
}

// The spout, cut in half: its moulding, the channel, and the limescale filter across its mouth.
export function spout() {
  const outer = [[53, 112], [61, 115], [80, 143], [79, 148], [53, 150]];
  const out = [S(cutSolid(outer, [[[55.5, 122], [60, 123], [75, 143.5], [74, 146.5], [55.5, 147]]], -7, 0), { tone: "hi" })];
  out.push(S(inCut([[53, 121], [55.5, 121], [55.5, 147.5], [53, 147.5]], -7, -0.2), { tone: "mid" }));
  const holes = [];
  for (let z = 124; z <= 145; z += 3) for (const u of [54.25]) holes.push(at([u, -0.2, z]));
  out.push(D(holes, { size: 0.55, tone: "lo" }));
  return out.join("");
}
