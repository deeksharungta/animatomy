import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D, cutFace } from "./model.mjs";
import { halfRev, halfTube, halfSolid, halfRing, ringArc, knurlFar } from "./halfcut.mjs";

// The iron's shell, cut in half along its axis: the cord's strain relief, the rubber grip, the switch chamber,
// the knurled nut, and the barrel that holds the tip.
const Z = C.ZC;
const ribs = (xs, r, tone = "faint") => Ln(xs.map((x) => ringArc(x, r)).join(""), { tone });

export function tail() {
  // The rubber strain relief: a solid taper round the cord, ringed so it flexes.
  const T = C.TAIL, prof = [[T.x0, 5.2], [T.x0 + 10, 7.2], [T.x1, 10.4]], rc = 2.6;
  const out = [S(halfRev(prof), { tone: "mid", crease: "none" })];
  out.push(cutFace([...prof.map(([x, r]) => [x, Z + r]), [T.x1, Z + rc], [T.x0, Z + rc]], "mid"));
  out.push(cutFace([[T.x0, Z - rc], [T.x1, Z - rc], ...prof.slice().reverse().map(([x, r]) => [x, Z - r])], "mid"));
  out.push(halfRing(T.x1, rc, 10.4, "mid"));
  out.push(Ln([3, 7, 11, 15, 19].map((d) => { const x = T.x0 + d, r = d < 10 ? 5.2 + d * 0.2 : 7.2 + (d - 10) * 0.2; return ringArc(x, r); }).join(""), { tone: "lo" }));
  return out.join("");
}

export function grip() {
  const G = C.GRIP, [ri, ro] = G.r;
  const out = [halfTube(G.x0, G.x1, ri, ro, { tone: "mid", end: true })];
  out.push(ribs(Array.from({ length: 13 }, (_, i) => G.x0 + 6 + i * 4), ro, "lo"));
  out.push(ribs([G.x0 + 2, G.x1 - 2], ro, "faint"));
  return out.join("");
}

export function chamber() {
  const H = C.HANDLE, [ri, ro] = H.r;
  return halfTube(H.x0, H.x1, ri, ro, { tone: "mid", end: false }) + ribs([H.x0 + 3, H.x1 - 3], ro, "faint") +
    D([at([H.x0 + 8, 0, Z + 13.2]), at([H.x1 - 8, 0, Z + 13.2]), at([H.x0 + 8, 0, Z - 13.2]), at([H.x1 - 8, 0, Z - 13.2])], { size: 0.55, tone: "lo" });
}

// The front wall of the chamber, the heater's rear cap inside it, and the nut that holds the barrel.
export function front() {
  const W = C.WALL, N = C.NUT, H = C.HEAT;
  const out = [halfTube(W.x0, W.x1, H.sheath[1], C.HANDLE.r[1], { tone: "mid", inside: false })];
  out.push(halfTube(N.x0, 0, H.sheath[1], N.r, { tone: "hi", inside: false, end: false }));
  out.push(halfTube(0, N.x1, C.BARREL.r[1], N.r, { tone: "hi", inside: false }));
  out.push(knurlFar(N.x0 + 0.8, N.x1 - 0.8, N.r));
  return out.join("");
}

// Inside the nut and barrel, inner layer first: the tip and its slug, the ceramic former with the nichrome coil
// in it, the mica wrap, the stainless sheath and its two end caps, then the barrel and its nose.
export function barrelInside() {
  const B = C.BARREL;
  return S(halfRev([[C.HEAT.x1 + 0.6, B.r[0]], [B.x1, B.r[0]]], { inner: true }), { tone: "mid", crease: "none" }) +
    S(halfRev([[B.x1, 4.4], [B.x1 + 2.6, 4.4]], { inner: true }), { tone: "mid", crease: "none" });
}

export function tip() {
  const s = C.SLUG;
  return `<g class="si-tip">${halfSolid(C.TIP, { tone: "hi" })}</g>` + halfSolid([[s[0], C.TIP_R], [s[1], C.TIP_R]], { tone: "mid" }) +
    Ln(k.segment([s[1], 0, Z + C.TIP_R], [s[1], 0, Z - C.TIP_R], P), { tone: "lo" });
}

export function heater() {
  const H = C.HEAT, out = [];
  out.push(halfTube(H.x0, H.x1, H.cer[0], H.cer[1], { tone: "hi", inside: false, strip: "si-cer" }));
  const turns = [];
  for (let x = H.x0 + 1.6; x < H.x1 - 1.2; x += H.pitch) turns.push(at([x, 0, Z + H.coil]), at([x, 0, Z - H.coil]));
  out.push(cutFace([[H.x0, Z + H.cer[1]], [H.x1, Z + H.cer[1]], [H.x1, Z + H.mica[0]], [H.x0, Z + H.mica[0]]], "lo"));
  out.push(cutFace([[H.x0, Z - H.mica[0]], [H.x1, Z - H.mica[0]], [H.x1, Z - H.cer[1]], [H.x0, Z - H.cer[1]]], "lo"));
  out.push(`<g data-part="coil">${D(turns, { size: 0.62, tone: "hi" })}</g>`);
  out.push(halfTube(H.x0, H.x1, H.mica[0], H.mica[1], { tone: "hi", inside: false }));
  out.push(halfTube(H.x0, H.x1 + 0.6, H.sheath[0], H.sheath[1], { tone: "mid", inside: false, end: false }));
  out.push(halfTube(H.x1, H.x1 + 0.6, C.TIP_R + 0.15, H.sheath[0], { tone: "mid", inside: false }));
  out.push(halfRing(H.x1 + 0.6, H.sheath[0], H.sheath[1], "mid"));
  // The rear cap the magnet is pulled against, and the coil's two leads leaving it.
  out.push(halfTube(C.CAP[0], C.CAP[1], 0, H.sheath[1], { tone: "mid", inside: false, end: false }));
  return out.join("");
}

export function barrel() {
  const B = C.BARREL;
  const out = [halfTube(B.x0, B.x1, B.r[0], B.r[1], { tone: "mid", inside: false, end: false })];
  out.push(halfTube(B.x1, B.x1 + 2.6, 4.4, B.r[1], { tone: "mid", inside: false }));
  out.push(ribs([B.x0 + 4, B.x1 - 3], B.r[1], "faint"));
  out.push(D([at([B.x1 - 8, 0, Z + B.r[1] - 0.4]), at([B.x1 - 8, 0, Z - B.r[1] + 0.4])], { size: 0.5, tone: "lo" }));
  return out.join("");
}

export const ironBack = () => [tail(), grip(), chamber()].join("");
export const ironFront = () => [barrelInside(), tip(), heater(), barrel(), front()].join("");
