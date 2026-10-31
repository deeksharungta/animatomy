import * as k from "../../kit/iso-kit.mjs";
import { C, P, at, S, Ln, D, rod, ringX, ringY, circleY } from "./model.mjs";

// The case: a base on feet, the back and left walls, the front panels left of the cut, the deck the boiler sits on, and the drip tray.
const BASE = { x: -60, y: -60, w: 120, d: 126, r: 5 };

export function base() {
  const out = [`<path class="iso-halo" d="${k.haloOf(BASE, -5, 6, P)}"/>`];
  for (const [x, y] of k.corners(BASE, 12).sort((a, b) => k.depthOf([...a, 0], P) - k.depthOf([...b, 0], P))) {
    out.push(S(k.cylinder(x, y, 6.5, -5, 1.6, P, 28), { tone: "mid" }) + S(k.cylinder(x, y, 5, -3.4, 3.4, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(BASE, 0, C.FLOOR, P, 6, 1.2), { tone: "mid" }));
  out.push(Ln(k.lineOnTop([-56, 62], [56, 62], C.FLOOR, P) + k.lineOnTop([56, -56], [56, 62], C.FLOOR, P), { tone: "faint" }));
  out.push(D([[52, -52], [52, 58], [-52, 58], [26, -36]].map(([x, y]) => at([x, y, C.FLOOR])), { size: 0.5 }));
  return out.join("");
}

export function walls() {
  const out = [];
  out.push(S(k.slabOf({ x: -60, y: -60, w: 120, d: 4, r: 0.8 }, C.FLOOR, C.TOP - C.FLOOR, P, 3, 0.6), { tone: "mid" }));
  out.push(Ln([40, 100].map((z) => k.segment([-56, -56, z], [60, -56, z], P)).join("") + k.segment([60, -56, C.FLOOR], [60, -56, C.TOP], P), { tone: "faint" }));
  out.push(S(k.slabOf({ x: -60, y: -56, w: 4, d: 71, r: 0.8 }, C.FLOOR, C.DECK_Z - C.FLOOR, P, 3, 0.6), { tone: "mid" }));
  out.push(S(k.slabOf({ x: -60, y: -56, w: 4, d: 116, r: 0.8 }, C.DECK_Z, C.TOP - C.DECK_Z, P, 3, 0.6), { tone: "mid" }));
  out.push(Ln([40, 100].map((z) => k.segment([-56, -56, z], [-56, z < C.DECK_Z ? 15 : 60, z], P)).join(""), { tone: "faint" }));
  out.push(Ln(Array.from({ length: 5 }, (_, i) => ringX(-56, -2 + i * 6, 1 + i * 6, 14, 34, 1.4)).join(""), { tone: "mid" }));
  // On the back wall: the mains inlet, its cable up to the control box, and the box with its lid screws and label.
  const box = { x: 20, y: -56, w: 28, d: 7, r: 1 };
  out.push(S(k.slabOf({ x: 42, y: -56, w: 12, d: 3, r: 0.6 }, 16, 9, P, 3, 0.4), { tone: "mid" }) + S(k.slabOf({ x: 44.5, y: -53, w: 7, d: 1, r: 0.4 }, 17.5, 6, P, 3, 0.2), { tone: "hi" }));
  out.push(k.wireSvg(at([48, -53, 25]), at([40, -49, 92]), { via: [[48, -51, 60], [40, -51, 70]].map(at), tone: "lo", size: 0.9 }));
  out.push(S(k.slabOf(box, 92, 30, P, 3, 0.6), { tone: "hi" }) + Ln(ringY(-49, 23, 45, 96, 118, 1.2), { tone: "faint" }));
  out.push(Ln([[26, 112, 13], [26, 109, 10], [26, 106, 12]].map(([x, z, w]) => k.segment([x, -49, z], [x + w, -49, z], P)).join(""), { tone: "mid", free: true }));
  out.push(D([[22, -49, 120], [46, -49, 120], [22, -49, 94], [46, -49, 94]].map(at), { size: 0.5 }));
  out.push(D([[-56, -52, 146], [-56, 56, 146], [-56, -52, 8], [-52, -56, 146], [56, -56, 146], [56, -56, 8]].map(at), { size: 0.5 }));
  return out.join("");
}

// The top strip over the tank, with the tank's lid poking through.
export function top() {
  const out = [S(k.slabOf({ x: -60, y: -60, w: 120, d: 30, r: 1 }, C.TOP, 4, P, 3, 0.5), { tone: "mid" })];
  const T = C.TANK;
  out.push(S(k.slabOf({ x: T.x + 2, y: T.y + 2, w: T.w - 4, d: T.d - 4, r: 2 }, C.TOP + 4, 3, P, 4, 0.6), { tone: "hi" }));
  out.push(S(k.slabOf({ x: T.x + 13, y: T.y + 10, w: 10, d: 6, r: 2 }, C.TOP + 7, 2.4, P, 4, 0.4), { tone: "hi" }));
  out.push(D([[-56, -56], [56, -56], [56, -34], [-10, -34]].map(([x, y]) => at([x, y, C.TOP + 4])), { size: 0.5 }));
  return out.join("");
}

// The upper front panel, left of the cut: the pressure gauge, its bezel and ticks.
export function frontUpper() {
  const out = [S(k.slabOf({ x: -56, y: 56, w: 30, d: 4, r: 0.6 }, C.DECK_Z + C.DECK_H, C.TOP - C.DECK_Z - C.DECK_H, P, 2, 0.4), { tone: "mid" })];
  const g = C.GAUGE;
  out.push(S(rod([g.x, g.y, g.z], [0, 1, 0], g.r + 1.6, 0, 2.4, 48), { tone: "hi" }));
  out.push(`<path class="es-face" d="${circleY(g.x, g.y + 2.45, g.z, g.r, 48)}"/>`);
  const ticks = [];
  for (let b = 0; b <= 16; b++) {
    const a = Math.PI * 1.25 - (b / 16) * Math.PI * 1.5, r0 = b % 2 ? g.r - 1.6 : g.r - 2.8;
    if (b !== 9) ticks.push(k.segment([g.x + r0 * Math.cos(a), g.y + 2.5, g.z + r0 * Math.sin(a)], [g.x + (g.r - 0.4) * Math.cos(a), g.y + 2.5, g.z + (g.r - 0.4) * Math.sin(a)], P));
  }
  out.push(Ln(circleY(g.x, g.y + 2.5, g.z, g.r - 0.4, 48), { tone: "lo" }) + Ln(ticks.join(""), { tone: "mid" }));
  const a9 = Math.PI * 1.25 - (9 / 16) * Math.PI * 1.5;
  out.push(Ln(k.segment([g.x + (g.r - 3.4) * Math.cos(a9), g.y + 2.5, g.z + (g.r - 3.4) * Math.sin(a9)], [g.x + (g.r - 0.4) * Math.cos(a9), g.y + 2.5, g.z + (g.r - 0.4) * Math.sin(a9)], P), { tone: "hi" }));
  out.push(Ln(ringY(60, -52, -30, 84, 98, 1.5), { tone: "faint" }));
  out.push(Ln([[-47, 93, 12], [-47, 90, 9], [-47, 87, 11]].map(([x, z, w]) => k.segment([x, 60, z], [x + w, 60, z], P)).join(""), { tone: "mid", free: true }));
  out.push(D([[-53, 60, 146], [-29, 60, 146], [-53, 60, 82], [-29, 60, 82]].map(at), { size: 0.5 }));
  return out.join("");
}

// The lower front panel: the power and brew rockers, and the heater lamp.
export function frontLower() {
  const out = [S(k.slabOf({ x: -56, y: 11, w: 30, d: 4, r: 0.6 }, C.FLOOR, C.DECK_Z - C.FLOOR, P, 2, 0.4), { tone: "mid" })];
  for (const x of [-50, -40]) {
    out.push(S(k.slabOf({ x, y: 15, w: 7, d: 1.6, r: 0.6 }, 52, 11, P, 3, 0.3), { tone: "mid" }));
    out.push(S(k.slabOf({ x: x + 1.2, y: 16.6, w: 4.6, d: 1.4, r: 0.6 }, 57, 5, P, 3, 0.3), { tone: "hi" }));
  }
  out.push(S(rod([-32, 15, 57.5], [0, 1, 0], 2.2, 0, 1.4, 20), { tone: "mid" }));
  out.push(`<g data-part="lamp">${S(rod([-32, 16.4, 57.5], [0, 1, 0], 1.4, 0, 1, 16), { tone: "hi" })}</g>`);
  out.push(D([[-53, 15, 72], [-29, 15, 72], [-53, 15, 8], [-29, 15, 8]].map(at), { size: 0.5 }));
  return out.join("");
}

// The deck under the boiler: a bracket plate the group head hangs through.
export function deck() {
  const z = C.DECK_Z + C.DECK_H;
  return S(k.slabOf(C.DECK, C.DECK_Z, C.DECK_H, P, 4, 0.6), { tone: "mid" }) +
    Ln(k.planOutline(k.insetPlan(C.DECK, 3), z, P, 4), { tone: "faint" }) +
    D(k.corners(C.DECK, 5).map(([x, y]) => at([x, y, z])), { size: 0.5 });
}

export function trayBack() {
  const T = C.TRAY;
  return S(k.slabOf(T, C.FLOOR, C.TRAY_Z - C.FLOOR, P, 3, 0.5), { tone: "mid" }) +
    S(k.slabOf(k.insetPlan(T, 2), C.TRAY_Z, 0.8, P, 3, 0.2), { tone: "hi" }) +
    Ln(Array.from({ length: 9 }, (_, i) => k.lineOnTop([T.x + 2, T.y + 6 + i * 4], [T.x + T.w - 2, T.y + 6 + i * 4], C.TRAY_Z + 0.8, P)).join(""), { tone: "faint" });
}
