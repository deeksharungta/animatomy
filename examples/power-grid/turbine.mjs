import { k, L, P, at, S, Ln, D, box, seg, rod, turned, circleX, ringY } from "./shapes.mjs";
import { C } from "./model.mjs";

// The low-pressure turbine: a double-flow casing whose hood is cut open over its last stages, the bearing
// pedestal and coupling to the generator, and the governor valve chest on the deck in front of it.
const { AY, SH } = C, LP = C.LP, Z = C.DECK_Z, X = [1, 0, 0];
const on = (x, r, t) => [x, AY + r * Math.cos(t), SH + r * Math.sin(t)];
export const LP_CUT = { x0: -252, x1: -210, t0: 0.1, t1: 1.5 };

export function lpCasing() {
  const out = [], { x0, x1, r } = LP;
  out.push(S(box(x0 + 2, AY - r + 4, Z, x1 - 2, AY + r - 6, Z + 1.4, 0.4), { tone: "lo" }));
  // The lower half: a box with stiffening ribs and a horizontal joint flange at the shaft line.
  const ribs = [-248, -234, -220].map((x) => seg([x, AY + r - 4, Z + 1.4], [x, AY + r - 4, SH - 2]));
  out.push(S(box(x0, AY - r + 2, Z + 1.4, x1, AY + r - 4, SH - 2, 0.8, 0.5), { tone: "mid", inner: Ln(ribs.join(""), { tone: "faint" }) }));
  out.push(S(box(x0 - 1.5, AY - r, SH - 2, x1 + 1.5, AY + r - 2, SH, 0.5, 0.4), { tone: "mid" }));
  out.push(D(Array.from({ length: 12 }, (_, i) => at([x0 + 2 + i * 5.2, AY + r - 2, SH - 1])), { size: 0.45, tone: "lo" }));
  // The hood: a half cylinder with end walls, seams over each stage.
  const F = L.frameOf([x0 + 2, AY, SH], X, [0, 1, 0], [0, 0, 1]);
  const half = Array.from({ length: 41 }, (_, i) => [r * Math.cos((i / 40) * Math.PI), r * Math.sin((i / 40) * Math.PI)]);
  const seams = [3, 53].map((s) => L.arcOf(F, s, r, P, { from: 0, to: Math.PI })).join("");
  out.push(S(L.prismOf(F, half, 0, x1 - x0 - 4, P), { tone: "mid", inner: Ln(seams, { tone: "faint" }) }));
  return out.join("");
}
export function lpWindow(r = LP.r + 0.2) {
  const W = LP_CUT, pts = [], n = 16;
  for (let i = 0; i <= n; i++) pts.push(at(on(W.x0, r, W.t0 + ((W.t1 - W.t0) * i) / n)));
  for (let i = 0; i <= n; i++) pts.push(at(on(W.x1, r, W.t1 - ((W.t1 - W.t0) * i) / n)));
  return k.pathOf(pts, true);
}
// Inside the hood: the dark exhaust space, the cut wall at the near end, the inner casing and the shaft.
export function lpInside() {
  const W = LP_CUT, out = [`<path class="pg-void" d="${lpWindow()}"/>`];
  const face = [];
  for (let i = 0; i <= 12; i++) face.push(at(on(W.x1, LP.r, W.t0 + ((W.t1 - W.t0) * i) / 12)));
  for (let i = 12; i >= 0; i--) face.push(at(on(W.x1, LP.r - 1.6, W.t0 + ((W.t1 - W.t0) * i) / 12)));
  out.push(`<path class="iso-shade-2" d="${k.pathOf(face, true)}"/><path class="pg-rim" d="${k.pathOf(face, true)}"/>`);
  out.push(S(turned([W.x0 - 2, AY, SH], X, [[0, 9], [6, 9], [8, 12, 1], [W.x1 - W.x0 - 4, 12], [W.x1 - W.x0 + 2, 9]], { smooth: false }), { tone: "lo" }));
  return out.join("");
}
export function lpRim() {
  return `<path class="pg-rim" d="${lpWindow()}"/>` + D([0.3, 0.8, 1.3].flatMap((t) => [at(on(LP_CUT.x0 - 2, LP.r + 0.3, t)), at(on(LP_CUT.x1 + 2, LP.r + 0.3, t))]), { size: 0.6, tone: "mid" });
}

// The bearing pedestal between turbine and generator, the shaft and the coupling guard.
export function pedestal(xa, xb) {
  const out = [];
  out.push(S(box(xa, AY - 12, Z, xb, AY + 12, SH - 5, 0.6, 0.5), { tone: "mid", inner: Ln(k.sideSeam({ x: xa, y: AY - 12, w: xb - xa, d: 24, r: 0.6 }, SH - 12, P, 2), { tone: "faint" }) }));
  out.push(S(turned([xa - 0.5, AY, SH], X, [[0, 8], [1.2, 9], [xb - xa - 0.2, 9], [xb - xa + 1, 8]], { smooth: false }), { tone: "mid" }));
  out.push(D([[xa + 2, AY + 12, Z + 3], [xb - 2, AY + 12, Z + 3]].map(at), { size: 0.5 }));
  out.push(S(k.cylinder((xa + xb) / 2, AY + 4, 1, SH + 8, 5, P, 12), { tone: "hi" }));
  out.push(Ln(circleX(xb + 0.6, AY, SH, 4.6, 28), { tone: "lo" }));
  return out.join("");
}
export const shaft = (xa, xb, r = 4.4) => S(rod([xa, AY, SH], X, r, 0, xb - xa, 20), { tone: "hi", crease: "lo" });

// The governor valve chest: a pedestal, the body with its outlet into the casing, the bonnet, the yoke whose
// two pillars carry the crosshead guides, and the closing spring can on top. The steam main rises from below.
const V = C.VALVE;
export const YOKE = { z0: Z + 20, z1: Z + 46, dx: 7.5, rest: Z + 28 };
export function valveBack() {
  const out = [], { x, y } = V, z0 = Z;
  out.push(S(k.cylinder(x, y, 5, 0, Z - 5, P, 24), { tone: "mid", crease: "none" }));
  out.push(S(k.cylinder(x, y, 7, Z - 5.6, 1.2, P, 28), { tone: "mid" }));
  out.push(S(box(x - 8, y - 7, z0, x + 8, y + 7, z0 + 2, 0.5), { tone: "lo" }));
  // Outlet to the casing's front: a short pipe along -y with flanges.
  out.push(S(rod([x, y - 6, z0 + 10], [0, -1, 0], 3.6, 0, 9, 18), { tone: "hi" }));
  out.push(S(L.disc(8, 9.2, 5.4, L.frameAlong([x, y - 6, z0 + 10], [0, -1, 0]), P), { tone: "mid" }));
  return out.join("");
}
export function valveBody() {
  const out = [], { x, y, r } = V, z0 = Z + 2;
  const prof = [[0, r - 1], [1.2, r], [10, r, 1], [12, r - 1.4, 1], [14, 4.6], [16, 4.6], [16, 6], [18, 6]];
  out.push(S(turned([x, y, z0], [0, 0, 1], prof, { smooth: false }), { tone: "mid", inner: Ln(k.sideArc(x, y, r, z0 + 6, P, 24), { tone: "faint" }) }));
  out.push(D(Array.from({ length: 6 }, (_, i) => { const t = (i / 6) * Math.PI * 2 + 0.3; return at([x + 5.2 * Math.cos(t), y + 5.2 * Math.sin(t), z0 + 18]); }), { size: 0.45 }));
  return out.join("");
}
// The yoke's back pillar and guides (drawn before Ollie and the crosshead) and the spring can above.
export function yokeBack() {
  const { x, y } = V, out = [];
  for (const dx of [-YOKE.dx, YOKE.dx]) out.push(S(box(x + dx - 1, y - 1.6, YOKE.z0, x + dx + 1, y + 1.6, YOKE.z1, 0.3), { tone: "mid", inner: Ln(seg([x + dx - 1, y + 1.6, YOKE.rest - 2], [x + dx - 1, y + 1.6, YOKE.rest + V.lift + 3]), { tone: "faint" }) }));
  return out.join("");
}
export function springCan() {
  const { x, y } = V, z = YOKE.z1, out = [];
  out.push(S(box(x - YOKE.dx - 2, y - 2.6, z, x + YOKE.dx + 2, y + 2.6, z + 2, 0.4, 0.4), { tone: "mid" }));
  out.push(S(k.cylinder(x, y, 5.6, z + 2, 12, P, 32), { tone: "mid", crease: "none", inner: Ln([z + 6, z + 10].map((zz) => k.sideArc(x, y, 5.6, zz, P, 24)).join(""), { tone: "faint" }) }));
  out.push(S(k.cylinder(x, y, 6.2, z + 14, 1.4, P, 32), { tone: "mid" }) + D(Array.from({ length: 6 }, (_, i) => { const t = (i / 6) * Math.PI * 2; return at([x + 5.2 * Math.cos(t), y + 5.2 * Math.sin(t), z + 15.4]); }), { size: 0.45 }));
  out.push(Ln(ringY(y + 5.6, x - 1.6, x + 1.6, z + 5, z + 11, 0.6, 2), { tone: "lo" }));
  return out.join("");
}
