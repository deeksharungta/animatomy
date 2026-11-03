import { k, L, P, at, S, Ln, D, box, seg, rod, turned, insulator, ringX, circleY, cabinet } from "./shapes.mjs";
import { C } from "./model.mjs";

// The 800 MVA, 22/400 kV step-up transformer: a stiffened tank on a bunded foundation, a window cut in its
// front over the first limb (oil, core and the copper winding), the cover with its bolted rim, the HV turrets
// and three 400 kV bushings, the conservator with its Buchholz relay and breather, and the tap changer's drive.
const T = C.TANK, [Z0, Z1] = C.TANK_Z, FY = T.y + T.d;
export const XWIN = { x0: 15, x1: 39, z0: 13, z1: 50 };

export function foundation() {
  const out = [S(box(T.x - 8, T.y - 8, 0, T.x + T.w + 8, FY + 26, 1.4, 0.6, 0.4), { tone: "lo" })];
  out.push(Ln(k.planOutline({ x: T.x - 6, y: T.y - 6, w: T.w + 12, d: T.d + 30, r: 0.6 }, 1.4, P, 2), { tone: "faint" }));
  for (const y of [T.y + 8, FY - 8]) out.push(S(box(T.x - 2, y - 2, 1.4, T.x + T.w + 2, y + 2, Z0, 0.3), { tone: "mid" }));
  return out.join("");
}
export function tank() {
  const out = [], ribs = [];
  for (let x = T.x + 30; x < T.x + T.w; x += 12) ribs.push(seg([x, FY, Z0], [x, FY, Z1]));
  out.push(S(k.slabOf(T, Z0, Z1 - Z0, P, 3, 0.6), { tone: "mid", inner: Ln(ribs.join("") + k.sideSeam(T, Z0 + 4, P, 3), { tone: "faint" }) }));
  // Vertical stiffeners on the +x end, and the bolted cover rim.
  for (const y of [T.y + 10, T.y + 22, T.y + 34]) out.push(S(box(T.x + T.w, y - 0.8, Z0 + 2, T.x + T.w + 1.6, y + 0.8, Z1 - 2, 0.2), { tone: "mid" }));
  out.push(S(k.slabOf(k.insetPlan(T, -1.2), Z1, 1.8, P, 3, 0.5), { tone: "mid" }));
  const rim = [];
  for (let x = T.x + 2; x < T.x + T.w - 1; x += 4) rim.push(at([x, FY + 1.2, Z1 + 0.9]));
  for (let y = T.y + 2; y < FY; y += 4) rim.push(at([T.x + T.w + 1.2, y, Z1 + 0.9]));
  out.push(D(rim, { size: 0.4, tone: "lo" }));
  out.push(S(box(T.x + 44, FY, Z0 + 6, T.x + 58, FY + 0.6, Z0 + 12, 0.2), { tone: "hi" }));
  out.push(Ln([0, 1, 2].map((i) => seg([T.x + 46, FY + 0.6, Z0 + 10.6 - i * 1.6], [T.x + [56, 52, 54][i], FY + 0.6, Z0 + 10.6 - i * 1.6])).join(""), { tone: "lo", free: true }));
  return out.join("");
}
// The window: a rectangular cut in the front plate with its recess walls, and what the oil holds behind it.
export const xwinPath = () => k.pathOf([[XWIN.x0, FY, XWIN.z0], [XWIN.x1, FY, XWIN.z0], [XWIN.x1, FY, XWIN.z1], [XWIN.x0, FY, XWIN.z1]].map(at), true);
export function xInside() {
  const W = XWIN, out = [`<path class="pg-void pg-oil" d="${xwinPath()}"/>`];
  const cx = (W.x0 + W.x1) / 2, cy = T.y + T.d / 2;
  // The core: the back yoke plate, the limb and the top and bottom yokes, in stepped laminations.
  out.push(S(box(W.x0 - 4, cy - 6, Z0 + 4, W.x1 + 4, cy - 3, Z1 - 4, 0.2), { tone: "lo", inner: Ln([Z0 + 12, Z1 - 12].map((z) => seg([W.x0 - 4, cy - 3, z], [W.x1 + 4, cy - 3, z])).join(""), { tone: "faint" }) }));
  out.push(S(box(W.x0 - 4, cy - 5, Z0 + 4, W.x1 + 4, cy + 5, Z0 + 10, 0.3), { tone: "mid" }));
  // The winding: HV outside the LV, copper discs with spacer sticks between them; the limb shows above it.
  const turns = [], Fw = L.frameAlong([cx, cy, Z0 + 11], [0, 0, 1]);
  for (let s = 1.2; s < 26; s += 1.2) turns.push(L.arcOf(Fw, s, 10.4, P));
  out.push(`<g class="pg-cu">${S(L.solidOf([[0, 10.4], [27, 10.4]], Fw, P), { tone: "hi", crease: "lo", inner: Ln(turns.join(""), { tone: "lo" }) + Ln(L.ribsOf(Fw, 0.6, 26.4, 10.45, 16, P), { tone: "faint" }) })}</g>`);
  out.push(S(box(cx - 6, cy - 4, Z0 + 38, cx + 6, cy + 4, Z1 - 10, 0.3), { tone: "mid", inner: Ln([cx - 3, cx, cx + 3].map((x) => seg([x, cy + 4, Z0 + 38], [x, cy + 4, Z1 - 10])).join(""), { tone: "faint" }) }));
  out.push(S(box(W.x0 - 4, cy - 5, Z1 - 10, W.x1 + 4, cy + 5, Z1 - 4, 0.3), { tone: "mid" }));
  out.push(S(L.disc(27, 28.2, 11.6, Fw, P), { tone: "lo" }) + S(L.disc(-1.2, 0, 11.6, Fw, P), { tone: "lo" }));
  return out.join("");
}
export function xRim() {
  const W = XWIN, out = [`<path class="pg-rim" d="${xwinPath()}"/>`];
  // The recess walls: the plate's thickness at the bottom and the right edge.
  out.push(`<path class="iso-shade" data-shade="1" d="${k.pathOf([[W.x0, FY, W.z0], [W.x1, FY, W.z0], [W.x1, FY - 1.2, W.z0], [W.x0, FY - 1.2, W.z0]].map(at), true)}"/>`);
  out.push(D([[W.x0 - 1.4, FY, W.z0 - 1.4], [W.x1 + 1.4, FY, W.z0 - 1.4], [W.x0 - 1.4, FY, W.z1 + 1.4], [W.x1 + 1.4, FY, W.z1 + 1.4]].map(at), { size: 0.55, tone: "mid" }));
  return out.join("");
}

// The conservator: a long drum on two brackets above the cover, its Buchholz pipe and relay, and the breather.
const CV = { x0: 16, x1: 66, y: T.y + 4, z: Z1 + 22, r: 7 };
export function conservator() {
  const out = [], F = L.frameAlong([CV.x0, CV.y, CV.z], [1, 0, 0]), len = CV.x1 - CV.x0;
  for (const x of [CV.x0 + 8, CV.x1 - 8]) out.push(S(box(x - 1, CV.y - 3, Z1 + 1.8, x + 1, CV.y + 3, CV.z - CV.r + 1, 0.2), { tone: "mid" }));
  out.push(S(L.solidOf([[0, 4], [1, CV.r - 1, 1], [2.4, CV.r, 1], [len - 2.4, CV.r, 1], [len - 1, CV.r - 1, 1], [len, 4]], F, P), { tone: "mid", inner: Ln([16, 34].map((s) => L.arcOf(F, s, CV.r, P)).join(""), { tone: "faint" }) }));
  out.push(Ln(circleY(CV.x1 - 10, CV.y + CV.r - 0.2, CV.z, 1.6, 20), { tone: "lo" }) + D([at([CV.x1 - 10, CV.y + CV.r, CV.z])], { size: 0.6, tone: "hi" }));
  // Buchholz pipe from the drum's underside down to the cover, with the relay box on it.
  const bx = 44;
  out.push(S(rod([bx, CV.y, CV.z - CV.r + 0.4], [0, 0, -1], 1.2, 0, CV.z - CV.r - Z1 - 1.4, 12), { tone: "hi" }));
  out.push(S(box(bx - 2.4, CV.y - 2.4, Z1 + 7, bx + 2.4, CV.y + 2.4, Z1 + 12, 0.4), { tone: "mid" }) + D([at([bx, CV.y + 2.4, Z1 + 9.5])], { size: 0.5, tone: "hi" }));
  // The silica-gel breather hangs off the drum's end on its pipe.
  out.push(S(rod([CV.x0 + 2, CV.y + 3, CV.z - 3], [0, 0, -1], 0.6, 0, 20, 8), { tone: "hi" }) + S(k.cylinder(CV.x0 + 2, CV.y + 3, 1.6, CV.z - 30, 7, P, 16), { tone: "hi", crease: "none" }));
  return out.join("");
}
// The tap changer's motor drive cabinet on the +x end.
export const oltc = () => cabinet(T.x + T.w + 1.6, T.y + 4, 6, 12, Z0 + 2, 22, { face: "x" });

// HV turrets and the three 400 kV bushings, the neutral bushing at the far corner.
export function bushing(y) {
  const { x, z0, z1 } = C.HVB, out = [];
  out.push(S(k.cylinder(x, y, 4.6, z0 + 1.8, 5, P, 28), { tone: "mid", crease: "none" }) + S(k.cylinder(x, y, 5.8, z0 + 6.8, 1.2, P, 28), { tone: "mid" }));
  out.push(insulator([x, y, z0 + 8], [0, 0, 1], z1 - z0 - 12, { r: 2.4, shed: 4.2, n: 16, cap: 3.4 }));
  out.push(S(k.cylinder(x, y, 3, z1 - 4, 2.6, P, 24), { tone: "mid" }) + S(k.cylinder(x, y, 1.2, z1 - 1.4, 2.4, P, 14), { tone: "hi" }));
  return out.join("");
}
export const neutral = () => S(k.cylinder(T.x + 6, T.y + 6, 2.4, Z1 + 1.8, 3, P, 20), { tone: "mid" }) + insulator([T.x + 6, T.y + 6, Z1 + 4.8], [0, 0, 1], 12, { r: 1.2, shed: 2.2, n: 4, cap: 1.8 });
void ringX; void turned;
