import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D, box, rod, turned, ringY, circleY } from "./model.mjs";

// The generator: a 4-pole machine in a round frame on its bedplate, its inspection hatch off so the rotor shows,
// an air cooler and the terminal box on top, then the slip-ring end with its brush gear and the field leads.
const { AY, SH } = C, G = C.GEN, X = [1, 0, 0];
const F = L.frameOf([0, AY, SH], X, [0, 0, 1], [0, 1, 0]);
const on = (x, r, t) => [x, AY + r * Math.sin(t), SH + r * Math.cos(t)];
const HATCH = C.HATCH, ROTOR = C.ROTOR;
export const BORE = 24.5;

export function generator() {
  const out = [];
  out.push(`<path class="iso-halo" d="${k.haloOf({ x: G.x0 - 6, y: AY - 38, w: G.x1 - G.x0 + 12, d: 76, r: 3 }, 0, 6, P)}"/>`);
  out.push(S(box(G.x0 - 6, AY - 38, 0, G.x1 + 6, AY + 38, 6, 1, 0.6), { tone: "lo" }));
  out.push(D([[G.x0 - 2, AY + 38, 4], [-78, AY + 38, 4], [G.x1 + 2, AY + 38, 4]].map(at), { size: 0.55 }));
  for (const x of [G.x0 + 10, G.x1 - 22]) {
    out.push(S(box(x, AY + 20, 6, x + 12, AY + 34, 22, 0.5, 0.4), { tone: "mid" }));
    out.push(D([[x + 3, AY + 34, 8], [x + 9, AY + 34, 8]].map(at), { size: 0.5 }));
  }
  const len = G.x1 - G.x0, r = G.r;
  const prof = [[0, 13], [3, 13], [3, 24], [5, 28, 1], [8, r - 1, 1], [10, r], [len - 10, r], [len - 8, r - 1, 1], [len - 5, 28, 1], [len - 3, 24], [len - 3, 13], [len, 13]];
  const Fg = L.frameAlong([G.x0, AY, SH], X);
  const seams = [16, 40, 56, 80].map((s) => L.arcOf(Fg, s, r, P)).join("");
  out.push(S(L.solidOf(prof, Fg, P), { tone: "mid", inner: Ln(seams, { tone: "faint" }) }));
  // The air cooler and the terminal box on top, with lifting lugs.
  out.push(S(box(-106, AY - 18, SH + r - 4, -68, AY + 18, SH + r + 12, 0.8, 0.6), { tone: "mid" }));
  const slots = [];
  for (let x = -102; x < -72; x += 5) slots.push(ringY(AY + 18, x, x + 2.6, SH + r - 1, SH + r + 9, 0.8, 2));
  out.push(Ln(slots.join(""), { tone: "lo" }));
  out.push(Ln(k.planOutline({ x: -104, y: AY - 16, w: 34, d: 32, r: 0.8 }, SH + r + 12, P, 2), { tone: "faint" }));
  out.push(D([[-102, AY - 14], [-72, AY - 14], [-102, AY + 14], [-72, AY + 14], [-87, AY + 14]].map(([x, y]) => at([x, y, SH + r + 12])), { size: 0.45 }));
  for (const x of [-98, -78]) out.push(S(k.cylinder(x, AY, 2.4, SH + r + 12, 2, P, 20), { tone: "mid" }) + S(k.cylinder(x, AY, 3.4, SH + r + 14, 1, P, 24), { tone: "hi" }));
  out.push(S(box(-56, AY - 12, SH + r - 4, -38, AY + 6, SH + r + 6, 0.6, 0.5), { tone: "mid" }));
  out.push(D([[-54, AY + 6, SH + r + 4], [-40, AY + 6, SH + r + 4]].map(at), { size: 0.5 }));
  for (const x of [-116, -46]) out.push(S(box(x - 1.2, AY + 26, SH + 20, x + 1.2, AY + 30, SH + 26, 0.4), { tone: "hi" }));
  // Bolts round the end shield at the slip-ring end, and the rating plate on the bedplate's front.
  const Fe = L.frameAlong([G.x1 - 3, AY, SH], X);
  out.push(D(L.dotsOf(Fe, 0, 26, 16, P, { all: true }), { size: 0.5, tone: "mid" }));
  out.push(S(box(-100, AY + 38, 1, -80, AY + 38.6, 5, 0.2), { tone: "hi" }));
  out.push(Ln([[-98, -86], [-98, -90], [-98, -84]].map(([a, b], i) => k.segment([a, AY + 38.6, 4 - i * 1.1], [b, AY + 38.6, 4 - i * 1.1], P)).join(""), { tone: "lo", free: true }));
  return out.join("");
}

// The hatch opening: its outline on the frame, used as a void and as the clip for what shows inside.
export function hatchPath(r = G.r + 0.2) {
  const H = HATCH, pts = [], n = 16;
  for (let i = 0; i <= n; i++) pts.push(at(on(H.x0, r, H.t0 + ((H.t1 - H.t0) * i) / n)));
  for (let i = 0; i <= n; i++) pts.push(at(on(H.x1, r, H.t1 - ((H.t1 - H.t0) * i) / n)));
  return k.pathOf(pts, true);
}
// Inside the hatch: the dark bore, the laminated core's cut face at the near end, and the rotor body.
export function hatchInside() {
  const H = HATCH, out = [`<path class="pg-void" d="${hatchPath()}"/>`];
  const face = [];
  for (let i = 0; i <= 12; i++) face.push(at(on(H.x0, G.r, H.t0 + ((H.t1 - H.t0) * i) / 12)));
  for (let i = 12; i >= 0; i--) face.push(at(on(H.x0, BORE, H.t0 + ((H.t1 - H.t0) * i) / 12)));
  out.push(`<path class="iso-shade-2" d="${k.pathOf(face, true)}"/>`);
  const lam = [];
  for (let rr = BORE + 2; rr < G.r - 1; rr += 2) lam.push(k.pathOf(Array.from({ length: 13 }, (_, i) => at(on(H.x0 + 0.1, rr, H.t0 + ((H.t1 - H.t0) * i) / 12)))));
  out.push(Ln(lam.join(""), { tone: "faint" }) + `<path class="pg-rim" d="${k.pathOf(face, true)}"/>`);
  out.push(S(L.solidOf([[0, ROTOR], [H.x1 - H.x0 + 8, ROTOR]], L.frameAlong([H.x0 - 4, AY, SH], X), P), { tone: "hi", crease: "lo" }));
  return out.join("");
}
export function hatchRim() {
  return `<path class="pg-rim" d="${hatchPath()}"/>` + D([0.38, 0.9, 1.42].flatMap((t) => [at(on(HATCH.x0 - 2, G.r + 0.3, t)), at(on(HATCH.x1 + 2, G.r + 0.3, t))]), { size: 0.6, tone: "mid" });
}

// The slip-ring end: the bearing pedestal, the shaft, two slip rings, the brush post and holders.
export const BRUSH = { x: 7, y: AY + 15 };
export function slipRings() {
  const out = [];
  out.push(S(box(-30, AY - 20, 0, 2, AY + 20, 6, 0.8, 0.5), { tone: "lo" }));
  out.push(S(box(-26, AY - 12, 6, -14, AY + 12, SH - 6, 0.8, 0.5), { tone: "mid" }));
  out.push(S(turned([-27, AY, SH], X, [[0, 8], [1.5, 9.5], [12.5, 9.5], [14, 8]]), { tone: "mid" }));
  out.push(D([[-24, AY + 12, 10], [-16, AY + 12, 10]].map(at), { size: 0.5 }));
  out.push(S(rod([-14, AY, SH], X, 4, 0, 18, 18), { tone: "hi" }));
  for (const x of [C.RINGS.x, C.RINGS.x + 7]) out.push(S(turned([x, AY, SH], X, [[0, C.RINGS.r - 1], [0.6, C.RINGS.r], [3.4, C.RINGS.r], [4, C.RINGS.r - 1]]), { tone: "hi", crease: "lo" }));
  return out.join("");
}
export function brushGear() {
  const out = [], { x, y } = BRUSH, top = SH + C.RINGS.r + 8;
  out.push(S(box(x - 4, y - 4, 0, x + 4, y + 4, 8, 0.5, 0.4), { tone: "mid" }));
  out.push(S(k.cylinder(x, y, 1.8, 8, top - 8, P, 16), { tone: "mid", crease: "none" }));
  out.push(Ln([14, 22, 30, 38].map((z) => k.sideArc(x, y, 1.8, z, P, 12)).join(""), { tone: "faint" }));
  // Brush holders hang from the rocker arm, their carbon brushes pressed onto the rings' tops.
  for (const rx of [C.RINGS.x + 2, C.RINGS.x + 9]) {
    out.push(S(box(rx - 1.6, AY - 2.5, SH + C.RINGS.r, rx + 1.6, AY + 2.5, top + 2, 0.3), { tone: "hi" }));
    out.push(S(rod([rx, AY + 2.5, top - 3], [0, 1, 0], 0.7, 0, 1.2, 10), { tone: "lo" }));
  }
  out.push(S(box(C.RINGS.x - 2, AY - 4.5, top, x + 2, AY - 2.5, top + 3, 0.4), { tone: "mid" }));
  out.push(S(box(x - 2, AY - 4.5, top, x + 2, y + 2, top + 3, 0.4), { tone: "mid" }));
  out.push(D([[x - 3, y + 4, 6], [x + 3, y + 4, 6]].map(at), { size: 0.5 }));
  return out.join("");
}

// The excitation cubicle against the back wall: louvres, a field ammeter and the door.
export function exciter() {
  const E = C.EXC, fy = E.y + E.d, out = [];
  out.push(S(k.slabOf(E, 0, 96, P, 2, 0.6), { tone: "mid" }));
  out.push(Ln(ringY(fy, E.x + 3, E.x + E.w - 3, 4, 92, 1.2), { tone: "faint" }));
  const lv = [];
  for (let z = 10; z < 34; z += 4) lv.push(ringY(fy, E.x + 8, E.x + E.w - 8, z, z + 1.6, 0.7, 2));
  out.push(Ln(lv.join(""), { tone: "lo" }));
  out.push(S(rod([E.x + E.w - 7, fy, 60], [0, 1, 0], 1, 0, 2, 10), { tone: "hi" }));
  const m = C.FIELD_M;
  out.push(S(box(m.x - 7, fy, m.z - 9, m.x + 7, m.y, m.z + 9, 0.4), { tone: "hi" }));
  const tk = Array.from({ length: 11 }, (_, i) => { const q = -Math.PI * 0.75 + (Math.PI * 1.5 * i) / 10, l = i % 5 ? 0.9 : 1.6; return k.segment([m.x + (m.r - 0.2) * Math.sin(q), m.y, m.z + (m.r - 0.2) * Math.cos(q)], [m.x + (m.r - 0.2 - l) * Math.sin(q), m.y, m.z + (m.r - 0.2 - l) * Math.cos(q)], P); });
  out.push(Ln(circleY(m.x, m.y, m.z, m.r - 0.2, 40), { tone: "lo" }) + Ln(tk.join(""), { tone: "mid" }) + D([at([m.x, m.y, m.z])], { size: 0.7, tone: "hi" }));
  // The field cable leaves through the gland plate at the foot of the door.
  out.push(S(box(E.x + E.w - 2, fy, 0, E.x + E.w + 12, fy + 4, 3, 0.3), { tone: "mid" }));
  return out.join("");
}
