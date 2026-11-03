import { k, L, P, at, S, Ln, D, box, seg, rod, turned, circleX, ringY } from "./shapes.mjs";
import { C } from "./model.mjs";

// The 660 MW generator: a hydrogen-tight frame on the deck with its front-top quarter cut away over the core,
// so the laminated stator, its slots and the two-pole rotor show; hydrogen coolers on the end domes, the
// terminal box hung under the deck, and the bearing pedestal at the exciter end.
const { AY, SH } = C, G = C.GEN, W = C.CUT, X = [1, 0, 0], Z = C.DECK_Z;
const on = (x, r, t) => [x, AY + r * Math.cos(t), SH + r * Math.sin(t)];
export const BORE = 17.2, CORE = [W.x0 + 6, W.x1 - 6];

export function genFrame() {
  const out = [], len = G.x1 - G.x0, r = G.r;
  out.push(S(box(G.x0 + 6, AY - 20, Z + 1.2, G.x1 - 6, AY + 20, Z + 8, 0.5, 0.4), { tone: "lo" }));
  for (const x of [G.x0 + 10, G.x1 - 22]) {
    out.push(S(box(x, AY + 14, Z + 1.2, x + 12, AY + 24, SH - 14, 0.5, 0.4), { tone: "mid" }));
    out.push(D([[x + 3, AY + 24, Z + 3], [x + 9, AY + 24, Z + 3]].map(at), { size: 0.5 }));
  }
  const prof = [[0, 9], [2, 9], [2, 18], [4, 22, 1], [7, r - 0.6, 1], [9, r], [len - 9, r], [len - 7, r - 0.6, 1], [len - 4, 22, 1], [len - 2, 18], [len - 2, 9], [len, 9]];
  const F = L.frameAlong([G.x0, AY, SH], X);
  const seams = [12, 22, 34, 46, 58, 70, 80].map((s) => L.arcOf(F, s, r, P)).join("");
  out.push(S(L.solidOf(prof, F, P), { tone: "mid", inner: Ln(seams, { tone: "faint" }) }));
  // Bolt rows on the end-dome flanges.
  for (const s of [9.6, len - 9.6]) out.push(D(L.dotsOf(L.frameAlong([G.x0 + s, AY, SH], X), 0, r + 0.3, 36, P, { fade: [0.04, 0.42] }), { size: 0.45, tone: "mid" }));
  return out.join("");
}

// Hydrogen coolers: a box on each end dome with its water inlet and outlet flanges and lifting lugs.
export function coolers() {
  const out = [];
  for (const x of [G.x0 + 4, G.x1 - 18]) {
    const z0 = SH + 18, z1 = SH + 34;
    out.push(S(box(x, AY - 12, z0, x + 14, AY + 12, z1, 0.6, 0.5), { tone: "mid", inner: Ln(k.sideSeam({ x, y: AY - 12, w: 14, d: 24, r: 0.6 }, z1 - 4, P, 2), { tone: "faint" }) }));
    const fins = [];
    for (let z = z0 + 3; z < z1 - 5; z += 2.2) fins.push(ringY(AY + 12, x + 2, x + 12, z, z + 1, 0.4, 2));
    out.push(Ln(fins.join(""), { tone: "lo" }));
    for (const dy of [-6, 6]) out.push(S(k.cylinder(x + 7, AY + dy, 2, z1, 4, P, 16), { tone: "hi" }) + S(k.cylinder(x + 7, AY + dy, 3, z1 + 4, 1.2, P, 20), { tone: "mid" }));
    out.push(S(box(x + 6, AY + 12, z1 - 3, x + 8, AY + 13.4, z1, 0.2), { tone: "hi" }));
  }
  return out.join("");
}

// The cutaway: its outline on the frame, used as a void and as the clip for what shows inside.
export function genWindow(r = G.r + 0.2) {
  const pts = [], n = 20;
  for (let i = 0; i <= n; i++) pts.push(at(on(W.x0, r, W.t0 + ((W.t1 - W.t0) * i) / n)));
  for (let i = 0; i <= n; i++) pts.push(at(on(W.x1, r, W.t1 - ((W.t1 - W.t0) * i) / n)));
  return k.pathOf(pts, true);
}
// Inside: the dark bore, the core's back surface with its slots and vent ducts, and the cut face at the near
// end, where the frame, the core back and the slotted teeth show in section.
export function genInside() {
  const out = [`<path class="pg-void" d="${genWindow()}"/>`];
  const Fb = L.frameAlong([W.x0, AY, SH], X);
  const ducts = [], slots = [];
  for (let i = 0, x = CORE[0]; i <= 12; i++, x = CORE[0] + ((CORE[1] - CORE[0]) * i) / 12) ducts.push(k.pathOf(Array.from({ length: 49 }, (_, i) => at(on(x, BORE, W.t1 + ((W.t0 + Math.PI * 2 - W.t1) * i) / 48)))));
  // The cut's two long faces: the core and frame in section along the length.
  for (const t of [W.t0, W.t1]) {
    const q = [on(W.x0, BORE, t), on(W.x1, BORE, t), on(W.x1, G.r, t), on(W.x0, G.r, t)].map(at);
    out.push(`<path class="iso-shade" data-shade="${t > 1 ? 3 : 1}" d="${k.pathOf(q, true)}"/><path class="pg-rim" d="${k.pathOf(q, true)}"/>`);
  }
  for (let i = 0; i < 36; i++) { const t = (i / 36) * Math.PI * 2; const a = on(CORE[0], BORE, t), b = on(CORE[1], BORE, t); if (Math.sin(t) < 0.2 && Math.cos(t) < 0.6) slots.push(seg(a, b)); }
  out.push(Ln(ducts.join(""), { tone: "faint" }) + Ln(slots.join(""), { tone: "lo" }));
  const face = [];
  for (let i = 0; i <= 16; i++) face.push(at(on(W.x0, G.r, W.t0 + ((W.t1 - W.t0) * i) / 16)));
  for (let i = 16; i >= 0; i--) face.push(at(on(W.x0, BORE, W.t0 + ((W.t1 - W.t0) * i) / 16)));
  out.push(`<path class="iso-shade-2" d="${k.pathOf(face, true)}"/>`);
  const lam = [], teeth = [];
  for (let rr = BORE + 3.6; rr < G.r - 1.5; rr += 1.4) lam.push(k.pathOf(Array.from({ length: 17 }, (_, i) => at(on(W.x0 + 0.05, rr, W.t0 + ((W.t1 - W.t0) * i) / 16)))));
  for (let i = 1; i < 12; i++) { const t = W.t0 + ((W.t1 - W.t0) * i) / 12; teeth.push(seg(on(W.x0 + 0.05, BORE, t), on(W.x0 + 0.05, BORE + 3.4, t))); }
  out.push(Ln(lam.join(""), { tone: "faint" }) + Ln(teeth.join(""), { tone: "lo" }));
  out.push(Ln(k.pathOf(Array.from({ length: 17 }, (_, i) => at(on(W.x0 + 0.05, G.r - 1.4, W.t0 + ((W.t1 - W.t0) * i) / 16)))), { tone: "lo" }));
  out.push(`<path class="pg-rim" d="${k.pathOf(face, true)}"/>`);
  return out.join("");
}
// The end windings: the stator bars bent out of the core ends into a cone, seen from inside.
export function endWindings() {
  const out = [];
  for (const [xa, xb] of [[W.x0 + 0.05, CORE[0]]]) {
    const bars = [];
    for (let i = 0; i < 30; i++) { const t = (i / 30) * Math.PI * 2, f = Math.cos(t) < 0.5 && Math.sin(t) < 0.4; if (f) bars.push(seg(on(xa, BORE, t), on(xb, BORE, t + 0.22))); }
    out.push(Ln(bars.join(""), { tone: "lo" }));
  }
  return out.join("");
}
// The rotor: a forged body between its retaining rings, the shaft running through to both bearings.
export function rotor() {
  const R = C.ROTOR, out = [];
  out.push(S(rod([W.x0 - 2, AY, SH], X, 6, 0, W.x1 - W.x0 + 4, 24), { tone: "hi" }));
  const Fr = L.frameAlong([CORE[0] - 6, AY, SH], X), len = CORE[1] - CORE[0] + 12;
  const prof = [[0, 6.5], [0, R], [5.4, R + 1.2, 1], [6, R], [len - 6, R], [len - 5.4, R + 1.2, 1], [len, R], [len, 6.5]];
  out.push(S(L.lathe(prof, Fr, P, { smooth: false }), { tone: "hi", crease: "lo", inner: Ln([6, len - 6].map((s) => L.arcOf(Fr, s, R, P)).join(""), { tone: "lo" }) }));
  return out.join("");
}
export function genRim() {
  return `<path class="pg-rim" d="${genWindow()}"/>` + D([0.2, 0.8, 1.4].flatMap((t) => [at(on(W.x0 - 2, G.r + 0.3, t)), at(on(W.x1 + 2, G.r + 0.3, t))]), { size: 0.6, tone: "mid" });
}

// The terminal box under the deck: the line terminals leave its +x face into the isolated-phase bus.
export const TBOX = { x0: -118, x1: -98, y0: -58, y1: -30, z0: 12, z1: Z - 5 };
export function terminalBox() {
  const T = TBOX, out = [];
  out.push(S(box(T.x0, T.y0, T.z0, T.x1, T.y1, T.z1, 0.5, 0.4), { tone: "mid", inner: Ln(seg([T.x0 + 10, T.y1, T.z0], [T.x0 + 10, T.y1, T.z1]), { tone: "faint" }) }));
  out.push(D([[T.x0 + 2, T.y1, T.z0 + 2], [T.x1 - 2, T.y1, T.z0 + 2], [T.x0 + 8, T.y1, T.z0 + 2], [T.x0 + 12, T.y1, T.z0 + 2]].map(at), { size: 0.45 }));
  out.push(Ln(circleX(T.x1, (T.y0 + T.y1) / 2, T.z0 + 4, 1.2, 16), { tone: "lo" }));
  return out.join("");
}
void rod; void turned;
