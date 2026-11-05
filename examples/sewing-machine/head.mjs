// The head's fixed parts: the take-up lever's pivot stud, the presser bar with its spring and regulator screw, the
// lifter lever, the presser foot (shank, thumbscrew, sole and toes) with Knock's perch on its shank, the tension unit
// on the front face, and the thread guide under the head.
import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { springAlong } from "../../kit/spring.mjs";
import { C, P, at, S, Ln, D } from "./model.mjs";

const PB = C.PRESS, H = C.HEAD, T = C.TAKE, TOP = C.TOP, CT = C.BT + 0.6 + C.CLOTH.t;
const alongX = (x, y, z) => L.frameOf([x, y, z], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
const up = (x, y, z) => L.frameOf([x, y, z], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
const box = (x0, y0, z0, x1, y1, z1, tone = "hi") => S(k.slabOf({ x: x0, y: y0, w: x1 - x0, d: y1 - y0, r: 0.4 }, z0, z1 - z0, P, 2, 0.3), { tone });
export const PERCH = [PB.x, 0.8, 66];
export const TENSION = [84, H.y + H.d, 214];
export const UNDER = [106, H.y + H.d + 1, H.z0 - 1];

// Inside the head, behind the presser bar: the pivot stud the take-up lever swings on.
export function headInside() {
  const out = [];
  out.push(S(k.slabOf({ x: T.x - 7, y: H.y + 4, w: 14, d: T.y - H.y - 6, r: 1 }, T.z - 7, 14, P, 3, 0.4), { tone: "mid" }));
  out.push(S(L.disc(0, 12, 3.6, alongX(T.x - 6, T.y, T.z), P), { tone: "hi", crease: "lo" }));
  out.push(D([at([T.x + 6, T.y, T.z])], { size: 0.6, tone: "lo" }));
  return out.join("");
}

// The presser bar from the top cover down through the head, its spring and the lifter lever on the back wall.
export function presserBar() {
  const out = [], sp = springAlong([PB.x, PB.y, 196], [PB.x, PB.y, 246], 4.4, 9, P);
  out.push(Ln(sp.back, { tone: "lo" }));
  out.push(S(L.disc(0, TOP + 6 - 76, PB.r, up(PB.x, PB.y, 76), P), { tone: "hi" }));
  out.push(Ln(sp.front, { tone: "mid" }) + D(sp.ends, { size: 0.6, tone: "mid" }));
  out.push(S(L.disc(0, 4, 5, up(PB.x, PB.y, 192), P), { tone: "mid" }));
  out.push(S(L.disc(0, 5, 4, up(PB.x, PB.y, TOP), P), { tone: "hi", inner: k.fadedSvg(L.ribsOf(up(PB.x, PB.y, TOP), 0.4, 4.6, 4, 18, P, { fade: [0.05, 0.4], seams: true }), { tone: "faint" }) }));
  // The lifter: a cam lever on a stud under the bar's collar.
  out.push(S(L.prismOf(L.frameOf([PB.x + 4, -26, 186], [0.3, 0, -0.95], [0, 1, 0], [0.95, 0, 0.3]), [[-1.4, -2], [1.4, -2], [1.4, 2], [-1.4, 2]], 0, 26, P), { tone: "mid" }));
  out.push(S(L.disc(0, 3, 3, L.frameOf([PB.x + 2, -27.5, 186], [0, 1, 0], [1, 0, 0], [0, 0, 1]), P), { tone: "hi" }));
  return out.join("");
}

// The presser foot on the cloth: clamp, shank, thumbscrew, sole and two toes; and Knock's perch on the shank.
export function presserFoot() {
  const out = [], x = PB.x, y = PB.y;
  out.push(S(L.disc(0, 6, 4, up(x, y, 72), P), { tone: "hi" }));
  out.push(box(x - 3, y - 3, CT + 2, x + 3, y + 3, 72));
  out.push(S(L.disc(0, 5, 2.2, alongX(x + 3, y, 69), P), { tone: "mid", inner: k.fadedSvg(L.ribsOf(alongX(x + 3, y, 69), 1, 5, 2.2, 14, P, { fade: [0.05, 0.4], seams: true }), { tone: "faint" }) }));
  out.push(box(x - 6, y - 4, CT, x + 6, y + 3, CT + 2));
  for (const s of [-1, 1]) {
    const x0 = s < 0 ? x - 5.4 : x + 1.8;
    out.push(S(k.slabOf({ x: x0, y: y + 3, w: 3.6, d: 9.5, r: 0.6 }, CT, 1.4, P, 3, 0.3), { tone: "hi", crease: "lo" }));
    out.push(S(L.prismOf(L.frameOf([x0, y + 12.5, CT], [0, 0.6, 0.8], [1, 0, 0], [0, -0.8, 0.6]), [[0, 0], [3.6, 0], [3.6, 1.4], [0, 1.4]], 0, 3, P), { tone: "hi" }));
  }
  out.push(Ln(k.lineOnTop([x - 6, y - 1], [x + 6, y - 1], CT + 2, P), { tone: "faint" }));
  out.push(box(x - 3, -2.2, PERCH[2] - 1.6, x + 3, 3.4, PERCH[2], "mid"));
  return out.join("");
}
// The collar on the presser bar where Knock perches with the needle up, with its ledge and set screw.
export function collarPerch() {
  const out = [], x = PB.x, y = PB.y, z = PERCH[2] + C.NEEDLE.stroke;
  out.push(S(L.disc(0, 4, 4.2, up(x, y, z - 4), P), { tone: "mid", crease: "lo" }));
  out.push(box(x - 3, y + 2, z - 1.6, x + 3, 3.4, z, "mid"));
  out.push(D([at([x + 4.2, y, z - 2])], { size: 0.55, tone: "lo" }));
  return out.join("");
}

// The tension unit on the head's front: boss, two discs, the spring, the numbered dial and the nut; and the guides.
export function tension() {
  const out = [], F = L.frameOf(TENSION, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  out.push(S(L.disc(0, 2, 5, F, P), { tone: "mid" }));
  out.push(S(L.disc(2, 2.8, 7, F, P), { tone: "hi", crease: "lo" }));
  out.push(S(L.disc(3.8, 4.6, 7, F, P), { tone: "hi", crease: "lo" }));
  const sp = springAlong(L.pointOf(F, 4.6, 0, 0), L.pointOf(F, 9, 0, 0), 2.6, 4, P);
  out.push(S(L.disc(4.6, 9, 1.2, F, P), { tone: "hi" }) + Ln(sp.back + sp.front, { tone: "mid" }) + D(sp.ends, { size: 0.5, tone: "mid" }));
  out.push(S(L.disc(9, 11, 6.5, F, P), { tone: "mid", inner: k.fadedSvg(L.ribsOf(F, 9.3, 10.7, 6.5, 30, P, { fade: [0.05, 0.4], seams: true }), { tone: "faint" }) }));
  const ticks = [];
  for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2, r1 = i % 5 ? 5.2 : 4.2; ticks.push(k.pathOf([L.pointOf(F, 11, 6.3, a), L.pointOf(F, 11, r1, a)].map(at))); }
  out.push(Ln(ticks.join(""), { tone: "lo" }));
  out.push(S(L.disc(11, 13, 2.6, F, P), { tone: "hi" }));
  // The check spring's wire, from the boss out to its hook, and the guide under the head.
  out.push(Ln(k.pathOf([L.pointOf(F, 1, 5, 0.3), L.pointOf(F, 3.3, 9, 0.6), L.pointOf(F, 3.3, 10.5, 0.2)].map(at)), { tone: "mid" }) + D([at(L.pointOf(F, 3.3, 10.5, 0.2)), at(L.pointOf(F, 1, 5, 0.3))], { size: 0.5, tone: "mid" }));
  out.push(S(k.slabOf({ x: UNDER[0] - 3, y: UNDER[1] - 1, w: 6, d: 2, r: 0.4 }, UNDER[2] - 0.5, 1.5, P, 2), { tone: "hi" }));
  out.push(S(L.ringBand(-0.6, 0.6, 0.8, 1.8, L.frameOf([UNDER[0], UNDER[1] + 2.5, UNDER[2]], [0, 0, 1], [1, 0, 0], [0, 1, 0]), P), { tone: "hi" }));
  return out.join("");
}
// The stitch selector on the head's front: a fluted knob over a dial ring with its index.
export function selector() {
  const out = [], F = L.frameOf([80, TENSION[1], 176], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  out.push(S(L.disc(0, 1, 11, F, P), { tone: "mid" }));
  const ticks = [];
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2, r1 = i % 3 ? 9.2 : 8; ticks.push(k.pathOf([L.pointOf(F, 1, 10.6, a), L.pointOf(F, 1, r1, a)].map(at))); }
  out.push(Ln(ticks.join(""), { tone: "lo" }));
  out.push(S(L.disc(1, 7, 6.5, F, P), { tone: "hi", inner: k.fadedSvg(L.ribsOf(F, 1.4, 6.6, 6.5, 24, P, { fade: [0.05, 0.4], seams: true }), { tone: "faint" }) }));
  out.push(S(L.disc(7, 8, 4, F, P), { tone: "hi" }) + D([at(L.pointOf(F, 8, 2.6, Math.PI / 2))], { size: 0.6, tone: "lo" }));
  return out.join("");
}
export const DISC = (s, r, a) => L.pointOf(L.frameOf(TENSION, [0, 1, 0], [1, 0, 0], [0, 0, 1]), s, r, a);
