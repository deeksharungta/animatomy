// The load: the front corner of a car, cut on the same plane as the jack. The sill is a welded box (the inner sill, the
// reinforcement and the outer skin, cut away) whose flanges meet in the pinch weld the saddle lifts; the wheel arch
// curves over the tyre; the door stands on the sill with its outer skin cut off, so its inner panel, impact beam and
// glass show. Built at rest; the page lifts it with the saddle.
import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D, flatY } from "./model.mjs";

const SL = C.SILL, Z = SL.z, W = Z + SL.weld, T = SL.top, X0 = SL.x0, X1 = SL.x1, YI = SL.y0, WH = C.WHEEL;
// A prism of a (y, z) section running along x from x0 to x1: the car's long pieces.
const run = (sec, x0 = X0, x1 = X1) => L.prismOf(L.frameOf([x0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]), sec, 0, x1 - x0, P);
const box = (y0, y1, z0, z1) => [[y0, z0], [y1, z0], [y1, z1], [y0, z1]];
const hole = (x, y, z, rx, rz = rx) => k.pathOf(Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return at([x + rx * Math.cos(a), y, z + rz * Math.sin(a)]); }), true);
const DX0 = -142, DZ = T + 8, RF = -25.5, PIN = -33;

export function sill() {
  const out = [];
  // Inside the box: the inner sill at the back and the reinforcement in front of it, with its lightening holes,
  // pressed ribs, drain holes, spot welds top and bottom, and the edge of the underseal sprayed up from below.
  out.push(S(run(box(YI, YI + 2.5, W, T)), { tone: "mid" }));
  out.push(S(run(box(RF - 2.5, RF, W + 2.5, T - 2.5)), { tone: "mid", crease: "lo", inner: Ln(k.segment([X0, RF, W + 13], [X1, RF, W + 13], P), { tone: "faint" }) }));
  out.push(`<path class="cj-void" d="${[-110, -40, 30, 100, 170, 240, 300].map((x) => hole(x, RF, (W + T) / 2 + 3, 13, 10)).join("")}"/>`);
  out.push(Ln([-75, -5, 65, 135, 205, 270].map((x) => k.segment([x, RF, W + 2.5], [x, RF, T - 2.5], P)).join(""), { tone: "faint" }));
  const spots = [];
  for (let x = X0 + 8; x < X1; x += 14) spots.push(at([x, RF, W + 6]), at([x, RF, T - 6]));
  out.push(D(spots, { size: 0.5, tone: "lo" }));
  // The box's bottom and top walls, cut through: drain holes in the floor, the step on top with its scuff plate.
  out.push(S(run(box(YI, 0, W, W + 2.5)), { tone: "hi", crease: "lo", inner: Ln(k.lineOnTop([X0, YI + 8], [X1, YI + 8], W + 2.5, P), { tone: "faint" }) }));
  const flange = [];
  for (let x = X0 + 6; x < X1; x += 14) flange.push(at([x, -3, W + 2.5]), at([x + 7, YI + 4, W + 2.5]));
  out.push(D(flange, { size: 0.5, tone: "lo" }));
  out.push(`<path class="cj-void" d="${[-90, 20, 130, 240].map((x) => k.pathOf(Array.from({ length: 20 }, (_, i) => { const a = (i / 20) * Math.PI * 2; return at([x + 6 * Math.cos(a), -12 + 4 * Math.sin(a), W + 2.5]); }), true)).join("")}"/>`);
  out.push(S(run(box(YI, 0, T - 2.5, T)), { tone: "hi", crease: "lo" }));
  out.push(S(run(box(-40, -6, T, T + 1.4), X0 + 20, X1), { tone: "hi", crease: "lo" }));
  out.push(Ln([-34, -28, -22, -16, -10].map((y) => k.lineOnTop([X0 + 20, y], [X1, y], T + 1.4, P)).join(""), { tone: "faint" }));
  // The pinch weld: three flanges spot-welded together, the jacking notches either side of the saddle, underseal.
  out.push(S(run(box(-1.6, 0, Z, W + 1)), { tone: "hi", crease: "lo", inner: Ln(k.segment([X0, 0, Z + 4.5], [X1, 0, Z + 4.5], P), { tone: "faint" }) }));
  const welds = [];
  for (let x = X0 + 10; x < X1; x += 18) if (Math.abs(x) > 24) welds.push(at([x, 0, Z + 9.5]));
  out.push(D(welds, { size: 0.65, tone: "lo" }));
  out.push(`<path class="cj-void" d="${[-46, 46].map((x) => k.pathOf([[x - 4, Z], [x, Z + 4.5], [x + 4, Z]].map(([xx, z]) => at([xx, 0, z])), true)).join("")}"/>`);
  return out.join("");
}

// The wheel arch over the tyre: the wing's cut edge with its turned-in lip, ending on the sill.
export function arch() {
  const a0 = -0.24, a1 = Math.PI + 0.24, pts = [];
  for (let j = 0; j <= 64; j++) { const a = a0 + ((a1 - a0) * j) / 64; pts.push([WH.x + WH.arch * Math.cos(a), WH.r + WH.arch * Math.sin(a)]); }
  for (let j = 64; j >= 0; j--) { const a = a0 + ((a1 - a0) * j) / 64; pts.push([WH.x + (WH.arch + 14) * Math.cos(a), WH.r + (WH.arch + 14) * Math.sin(a)]); }
  return flatY(pts, { shade: 3, tone: "hi" });
}

// The door: its bottom hem with drain slots and seal, the inner panel with access holes and a speaker, the
// side-impact beam on its brackets, the glass in its channel, and the lock's rod; it runs up off the card.
export function door() {
  const out = [], top = T + 220;
  out.push(S(run(box(PIN - 2.5, PIN, DZ, top), DX0, X1), { tone: "mid", crease: "lo", inner: Ln(k.segment([DX0, PIN, DZ + 30], [X1, PIN, DZ + 30], P), { tone: "faint" }) }));
  out.push(`<path class="cj-void" d="${hole(-30, PIN, DZ + 84, 40, 26) + hole(110, PIN, DZ + 90, 48, 30) + hole(230, PIN, DZ + 60, 22)}"/>`);
  out.push(Ln(hole(230, PIN, DZ + 60, 28), { tone: "lo" }) + D([-90, -10, 70, 150, 230, 300].map((x) => at([x, PIN, DZ + 12])), { size: 0.5, tone: "lo" }));
  out.push(S(run(box(-14, -11, DZ + 120, top), DX0 + 14, X1), { tone: "hi", crease: "faint" }));
  out.push(S(run(box(-17, -8, DZ + 112, DZ + 120), DX0 + 14, X1), { tone: "mid", crease: "lo" }));
  const a = [DX0 + 30, -20, DZ + 40], b = [X1 - 10, -20, DZ + 104];
  out.push(S(L.disc(0, L.len3(L.sub3(b, a)), 7, L.frameAlong(a, L.unit3(L.sub3(b, a))), P), { tone: "hi", crease: "lo" }));
  for (const p of [a, b]) out.push(S(k.slabOf({ x: p[0] - 10, y: PIN, w: 20, d: 10, r: 1 }, p[2] - 12, 24, P, 2, 0.4), { tone: "mid" }));
  out.push(Ln(k.segment([292, -24, DZ + 18], [292, -24, DZ + 76], P), { tone: "mid" }) + D([at([292, -24, DZ + 18]), at([292, -24, DZ + 76])], { size: 0.6 }));
  out.push(S(run(box(-30, 0, DZ - 4, DZ + 4), DX0, X1), { tone: "hi", crease: "lo" }));
  out.push(`<path class="cj-void" d="${[-60, 60, 180, 290].map((x) => k.pathOf([[x - 9, DZ - 2], [x + 9, DZ - 2], [x + 9, DZ + 1], [x - 9, DZ + 1]].map(([xx, z]) => at([xx, 0, z])), true)).join("")}"/>`);
  out.push(S(run(box(-24, -12, DZ - 6.6, DZ - 4), DX0, X1), { tone: "lo" }));
  return out.join("");
}
