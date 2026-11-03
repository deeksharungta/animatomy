import { k, L, P, at, S, Ln, D, box, seg, rod, rodAB, circleY, ringY } from "./shapes.mjs";
import { C } from "./model.mjs";

// Parts that hold parts, added where the 4x pass found plain faces: the LP hood's relief diaphragms and
// lifting lugs, the transformer cover's manholes, pressure relief valve and thermometer pockets, the stator
// water manifolds under the generator, and the cooler's header valves.
const { AY, SH } = C, Z = C.DECK_Z, T = C.TANK, Z1 = C.TANK_Z[1], FY = T.y + T.d;
const up = [0, 0, 1];

// Two atmospheric relief diaphragms on the hood's crown: a ring flange with a bolt circle and a dished cover.
export function hoodTop() {
  const out = [], r = C.LP.r;
  for (const x of [-252, -214]) {
    const F = L.frameAlong([x, AY - 6, SH + r - 1.6], up);
    out.push(S(L.solidOf([[0, 5.4], [1.8, 5.4], [1.8, 4.6], [2.6, 4.2, 1], [3.2, 2.6, 1], [3.5, 0]], F, P), { tone: "mid" }));
    out.push(D(L.dotsOf(F, 1.8, 4.9, 10, P, { all: true }), { size: 0.4, tone: "lo" }));
  }
  for (const x of [-258, -208]) out.push(S(box(x - 1, AY - 1.6, SH + r - 3, x + 1, AY + 1.6, SH + r + 2.4, 0.3), { tone: "mid" }) + D([at([x + 1, AY, SH + r + 1.2])], { size: 0.5, tone: "lo" }));
  return out.join("");
}

// The transformer cover: two bolted manholes, the pressure relief valve, and the oil and winding thermometer pockets.
export function coverParts() {
  const out = [], z = Z1 + 1.8;
  for (const [x, y] of [[28, -40], [52, -34]]) {
    out.push(S(k.cylinder(x, y, 4.6, z, 0.8, P, 28), { tone: "mid" }) + D(Array.from({ length: 10 }, (_, i) => { const t = (i / 10) * Math.PI * 2; return at([x + 3.8 * Math.cos(t), y + 3.8 * Math.sin(t), z + 0.8]); }), { size: 0.35, tone: "lo" }));
    out.push(S(box(x - 1.6, y - 0.4, z + 0.8, x + 1.6, y + 0.4, z + 2, 0.2), { tone: "hi" }));
  }
  out.push(S(k.cylinder(62, -54, 2.2, z, 3, P, 20), { tone: "mid" }) + S(k.cylinder(62, -54, 3.2, z + 3, 1.2, P, 24), { tone: "hi" }) + S(k.cylinder(62, -54, 1, z + 4.2, 1.4, P, 12), { tone: "hi" }));
  for (const [x, y] of [[40, -26], [46, -26]]) out.push(S(k.cylinder(x, y, 1.2, z, 2.4, P, 14), { tone: "hi" }) + S(k.cylinder(x, y, 1.6, z + 2.4, 0.8, P, 16), { tone: "mid" }));
  // Capillary tubes from the pockets down the front to the cooler control cabinet.
  out.push(S(rodAB([40, -24.4, z + 1.2], [40, FY + 0.6, z + 1.2], 0.25, 6), { tone: "lo" }) + S(rodAB([40, FY + 0.6, z + 1.2], [40, FY + 0.6, 40], 0.25, 6), { tone: "lo" }));
  return out.join("");
}
// The cooler control cabinet on the tank's front, between the window and the first radiator bank.
export function coolerCabinet() {
  const x0 = 39.6, x1 = 43.4, z0 = 20, z1 = 40, out = [];
  out.push(S(box(x0, FY, z0, x1, FY + 4, z1, 0.4, 0.4), { tone: "mid" }));
  out.push(Ln(ringY(FY + 4, x0 + 0.6, x1 - 0.6, z0 + 1.4, z1 - 1.4, 0.4, 2), { tone: "lo" }) + D([at([x1 - 1, FY + 4, (z0 + z1) / 2])], { size: 0.45, tone: "hi" }));
  return out.join("");
}

// Stator water: a supply and a return manifold along the frame's foot, with a riser to each end winding.
export function statorWater() {
  const out = [], G = C.GEN, y = AY + 26, z = Z + 6;
  for (const [dz, r] of [[0, 1.4], [3.6, 1.1]]) {
    out.push(S(rod([G.x0 + 8, y, z + dz], [1, 0, 0], r, 0, G.x1 - G.x0 - 16, 12), { tone: "hi" }));
    for (const x of [G.x0 + 8, G.x1 - 8]) out.push(S(L.disc(-0.6, 0, r + 0.9, L.frameAlong([x, y, z + dz], [1, 0, 0]), P), { tone: "mid" }));
  }
  for (const x of [G.x0 + 16, G.x1 - 16]) out.push(S(rodAB([x, y, z + 3.6], [x, y, Z + 18], 0.8, 10), { tone: "hi" }) + S(L.disc(0, 1, 1.8, L.frameAlong([x, y, Z + 18], up), P), { tone: "mid" }));
  for (const x of [-150, -116]) out.push(S(box(x - 1.2, y - 1.6, Z + 1.2, x + 1.2, y + 1.6, z - 1.4, 0.2), { tone: "lo" }));
  return out.join("");
}

// Butterfly valves where each radiator bank's manifolds meet the tank, with their handles.
export function headerValves() {
  const out = [];
  for (const x of [44, 57, 70]) for (const z of [C.RAD.z[1] + 1.5, C.RAD.z[0] - 1.5]) {
    const F = L.frameAlong([x + 5.5, FY + 0.6, z], [0, 1, 0]);
    out.push(S(L.disc(0, 1.2, 2.2, F, P), { tone: "mid" }) + S(box(x + 5.2, FY + 0.8, z + 2.2, x + 5.8, FY + 1.4, z + 3.4, 0.15), { tone: "hi" }));
  }
  return out.join("");
}
// On the firewall's face: a cable ladder on brackets, two bulkhead lamps and the deluge valve's cabinet.
export function wallParts() {
  const out = [], y = -94, x0 = 2, x1 = 94, z = 82;
  for (const x of [x0 + 4, 48, x1 - 4]) out.push(S(box(x - 0.6, y, z - 1.6, x + 0.6, y + 5, z, 0.15), { tone: "mid" }));
  for (const dy of [0, 4.4]) out.push(S(box(x0, y + dy, z, x1, y + dy + 0.6, z + 2.4, 0.15), { tone: "mid" }));
  const rungs = [];
  for (let x = x0 + 3; x < x1 - 1; x += 3) rungs.push(seg([x, y + 0.6, z + 0.4], [x, y + 4.4, z + 0.4]));
  out.push(Ln(rungs.join(""), { tone: "lo" }));
  for (const x of [20, 76]) {
    out.push(S(box(x - 2.4, y, 92, x + 2.4, y + 1.2, 96, 0.4), { tone: "mid" }) + S(rod([x, y + 1.2, 94], [0, 1, 0], 1.6, 0, 1.6, 16), { tone: "hi" }));
    out.push(Ln(circleY(x, y + 2.8, 94, 1.1, 16), { tone: "lo" }));
  }
  out.push(S(box(4, y, 4, 14, y + 4, 22, 0.4, 0.4), { tone: "mid" }) + Ln(ringY(y + 4, 5, 13, 6, 20, 0.5, 2), { tone: "lo" }) + D([at([12, y + 4, 13])], { size: 0.45, tone: "hi" }));
  return out.join("");
}
