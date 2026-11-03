import { C, K, P, PEN, KIT, S, Ln, D, at, ptA, zF, turned, angleOfU } from "./model.mjs";
import { facetKit } from "./facets.mjs";
import { ribEdge } from "./mech.mjs";

const F = facetKit(KIT, P, PEN), B = C.BAR, [A0, A1] = C.WIN_A;
const back = (step = 3, br = []) => F.sweep(90, 270, step, br);
const uOf = (a) => a / 45 - 1;
// The inside of a tube sits in its own shadow: tilt the bore's faces away from the light so they read deep.
const shadowed = (faces, k = 1.1) => faces.map((f) => ({ ...f, n: [f.n[0], f.n[1], f.n[2] - k] }));
const solid = (faces, style = {}) => S(F.solid(faces), { tone: "hi", crease: "faint", ...style });

// A plain stretch of the barrel tube between two heights, its top ring showing the bore.
export function tube(z0, z1, r = B.ro, tone = "hi", bore = 0) {
  const ring = bore ? Ln(KIT.circleOf(zF(z1), 0, bore, P), { tone: "faint" }) : "";
  return S(turned([[0, r], [z1 - z0, r]], z0), { tone, crease: "none", inner: ring });
}

// The dark bore seen down an open end: the hole the parts below pass through.
export const boreAt = (z, r) => `<path class="iso-shade" data-shade="3" d="${KIT.pathOf(Array.from({ length: 64 }, (_, i) => at(ptA(r, (i / 64) * 360, z))), true)}"/>`;

// Window A, behind the cam: the bore's back half, the barrel wall cut through at ±90°.
export function windowA() {
  const inner = shadowed(F.panel(B.ri, back(), () => A0, () => A1, -1));
  const cuts = [...F.side(90, B.ri, B.ro, A0, A1, A0, A1, -1), ...F.side(270, B.ri, B.ro, A0, A1, A0, A1, 1)];
  return solid(inner, { tone: "mid" }) + solid(cuts, { tone: "hi" });
}

// One cam rib, between two long grooves, with a short notch in the middle of its lower end.
function rib(k, a0, a1) {
  const c = 90 * k, h = K.half * 45, s0 = c - 45 + h, s1 = c + 45 - h, lo = Math.max(a0, s0), hi = Math.min(a1, s1);
  const zb = (a, dir) => C.Z0 + ribEdge(K, uOf(a + dir * 1e-3));
  const angles = F.sweep(lo, hi, 2.5, [c - h, c + h]);
  const faces = [...F.panel(C.RIB_R, angles, zb, () => C.RIB_TOP, -1), ...F.flat(C.RIB_TOP, C.RIB_R, B.ri, angles)];
  const n0 = C.Z0 + K.m * (1 - 2 * K.half), nz = C.Z0 + K.notch;
  if (c - h > lo) faces.push(...F.side(c - h, C.RIB_R, B.ri, n0, nz, n0, nz, 1));
  if (c + h < hi) faces.push(...F.side(c + h, C.RIB_R, B.ri, C.Z0, nz, C.Z0, nz, -1));
  if (s0 >= a0) faces.push(...F.side(s0, C.RIB_R, B.ri, C.Z0, C.RIB_TOP, C.Z0, C.RIB_TOP, -1));
  if (s1 <= a1) faces.push(...F.side(s1, C.RIB_R, B.ri, n0, C.RIB_TOP, n0, C.RIB_TOP, 1));
  // Cut through at the window's edge: the rib's section, its lower end at the notch's ceiling.
  if (a0 > s0) faces.push(...F.side(a0, C.RIB_R, B.ri, nz, C.RIB_TOP, nz, C.RIB_TOP, -1));
  if (a1 < s1) faces.push(...F.side(a1, C.RIB_R, B.ri, nz, C.RIB_TOP, nz, C.RIB_TOP, 1));
  return solid(shadowed(faces, 0.55), { tone: "hi" });
}
export const ribBack = () => rib(2, 90, 270);
export const ribSides = () => rib(1, 90, 270) + rib(3, 90, 270);

// Window B, round the nose: the cone's bore widening from the spring seat up to the barrel's.
const [B0, B1] = C.WIN_B;
export const coneR = (z) => (z >= B.joint ? B.ro : C.CONE.nose + ((B.ro - C.CONE.nose) * z) / B.joint);
export const boreR = (z) => (z >= B.joint ? B.ri : C.CONE.seatR + ((B.ri - C.CONE.seatR) * (z - B0)) / (B.joint - B0));
export function windowB() {
  const zs = [B0, 9, 13, 17.5, B.joint, B1], inner = [], cut = [];
  const angles = back(4);
  for (let j = 0; j + 1 < zs.length; j++) {
    const [z0, z1] = [zs[j], zs[j + 1]], dr = (boreR(z1) - boreR(z0)) / (z1 - z0);
    for (let i = 0; i + 1 < angles.length; i++) {
      const [a, b] = [angles[i], angles[i + 1]], m = (a + b) / 2, rad = KIT.radialOf(PEN, (m * Math.PI) / 180);
      inner.push({ pts: [ptA(boreR(z0), a, z0), ptA(boreR(z0), b, z0), ptA(boreR(z1), b, z1), ptA(boreR(z1), a, z1)], n: [-rad[0], -rad[1], dr] });
    }
  }
  for (const [a, sign] of [[90, -1], [270, 1]]) {
    const pts = [...zs.map((z) => ptA(boreR(z), a, z)), ...zs.slice().reverse().map((z) => ptA(coneR(z), a, z))];
    cut.push({ pts, n: KIT.mul3(KIT.tangentOf(PEN, (a * Math.PI) / 180), sign) });
  }
  return solid(shadowed(inner), { tone: "mid" }) + solid(cut, { tone: "hi" });
}

// The nose below the window: a tapered cone with a steel bushing at its tip and the seat ring on top.
export function nose() {
  const r5 = coneR(B0);
  const cone = S(turned([[0.8, C.CONE.nose + 0.13], [B0, r5]], 0), { tone: "hi", crease: "none", inner: Ln(KIT.circleOf(zF(B0), 0, C.CONE.bore + 0.6, P), { tone: "faint" }) });
  const bush = S(turned([[0, 1.25], [0.25, 1.6, 1], [0.8, 1.72]], 0), { tone: "mid", crease: "none" });
  return bush + cone + boreAt(B0, C.CONE.bore);
}

// The metal centre band where the upper and lower barrels screw together: a ledge round window A's floor.
export function centreBand() {
  const [z0, z1, r] = C.BAND, F2 = zF(z0);
  return S(turned([[0, B.ro], [0.3, r, 1], [z1 - z0, r]], z0), { tone: "mid", crease: "none", inner: Ln(KIT.arcOf(F2, 0.9, r, P), { tone: "faint" }) }) + boreAt(z1, B.ri);
}

// The pocket clip down the back of the barrel: a sprung steel strip from the clip ring, a ball at its foot.
export function clip() {
  const a = -112, w = 7, angles = F.sweep(a - w, a + w, 2), [z0, z1] = [84, 116], r0 = B.ro + 0.5, r1 = r0 + 0.7;
  const faces = [...F.panel(r1, angles, () => z0, () => z1, 1), ...F.side(a - w, r0, r1, z0, z1, z0, z1, -1), ...F.side(a + w, r0, r1, z0, z1, z0, z1, 1)];
  return solid(faces, { tone: "mid" }) + S(KIT.sphereOf(ptA(r1 - 0.2, a, z0 + 0.6), 1.2, P), { tone: "hi" });
}

// The rubber grip: a sleeve with nine shallow rings, between two plain stretches of barrel.
export function grip() {
  const [g0, g1, r] = C.GRIP, F2 = zF(g0);
  const rings = Array.from({ length: 9 }, (_, i) => KIT.arcOf(F2, 4 + i * 2.25, r, P)).join("");
  return S(turned([[0, r - 0.35], [0.8, r, 1], [g1 - g0 - 0.8, r, 1], [g1 - g0, r - 0.35]], g0), { tone: "mid", crease: "none", inner: Ln(rings, { tone: "faint" }) });
}

// The top: a band, the clip ring and the lip the button's shoulder stops under, seen from above.
export function topBand() {
  const [c0, c1] = B.clip;
  const ringBand = S(turned([[0, B.ro + 0.45], [c1 - c0, B.ro + 0.45]], c0), { tone: "mid", crease: "none", inner: Ln(KIT.arcOf(zF(c0), 1.4, B.ro + 0.45, P) + KIT.arcOf(zF(c0), c1 - c0 - 1.4, B.ro + 0.45, P), { tone: "faint" }) });
  return ringBand + S(KIT.ringBand(0, 0.01, B.lip, B.ro + 0.45, zF(B.top), P), { tone: "hi", crease: "none" }) + boreAt(B.top, B.lip);
}

export const parts = { tube, windowA, ribBack, ribSides, windowB, nose, grip, topBand, boreAt };
export const ANGLE_OF = angleOfU;
export const DOTS = D;
