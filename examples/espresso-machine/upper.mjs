import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D, rod, pipe } from "./model.mjs";

// Above and under the deck: the boiler in its band heater, the thermostat, the group head and portafilter,
// the three-way valve that vents into the tray, the cup, and the heater switch Ember holds.
const [gx, gy] = C.G;
const up = (z) => L.frameAlong([gx, gy, z], [0, 0, 1]);
export const SWITCH = { x: -6, y: 39, w: 8, d: 6, r: 1 };
const TA = 0.75;
export const TERM = [91, 95].map((z) => [gx + 22.6 * Math.cos(TA), gy + 22.6 * Math.sin(TA), z]);

export function boiler() {
  const B = C.BOIL, Bd = C.BAND, h = B.z1 - B.z0, b0 = Bd.z0 - B.z0, b1 = Bd.z1 - B.z0;
  // The switch's feed runs down the boiler's far side, so it is drawn before the boiler.
  const out = [k.wireSvg(at([SWITCH.x, SWITCH.y + 3, B.z1 + 2]), at([gx - B.r - 1, gy - 3, C.DECK_Z + C.DECK_H]), { via: [[gx - B.r - 1, gy - 3, B.z1 + 2]].map(at), tone: "lo", size: 0.8 })];
  out.push(S(L.solidOf([[0, 15.5], [2.5, B.r, 1], [b0, B.r], [b0, Bd.r], [b1, Bd.r], [b1, B.r], [h - 2.5, B.r, 1], [h, 15.5]], up(B.z0), P), { tone: "hi", crease: "lo" }));
  out.push(Ln(L.arcOf(up(B.z0), (b0 + b1) / 2, Bd.r, P), { tone: "faint" }));
  out.push(D(Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2 + 0.2; return at([gx + 13 * Math.cos(a), gy + 13 * Math.sin(a), B.z1]); }), { size: 0.55, tone: "mid" }));
  out.push(pipe([[gx - B.r + 1.4, gy, 112], [-40, gy, 112], [-40, 52, 112], [-40, 56, 112]], 1.3, { bend: 4 }));
  out.push(S(rod([gx - B.r + 0.6, gy, 112], [-1, 0, 0], 2.4, 0, 2, 16), { tone: "mid" }));
  return out.join("");
}

// The heater's two terminals stick out of the band in front of its glow, so they are drawn on the front layer.
export const terminals = () => TERM.map(([, , z]) => S(rod([gx + C.BAND.r * Math.cos(TA), gy + C.BAND.r * Math.sin(TA), z], [Math.cos(TA), Math.sin(TA), 0], 1.1, 0, 3.2, 10), { tone: "hi" })).join("");

export function thermostat() {
  const x = gx - 7, y = gy - 9, z = C.BOIL.z1;
  return S(k.cylinder(x, y, 4.2, z, 1.2, P, 28), { tone: "mid" }) + S(k.cylinder(x, y, 3.2, z + 1.2, 2.6, P, 24, 0.4), { tone: "hi" }) +
    S(k.slabOf({ x: x - 2.4, y: y - 0.4, w: 1.2, d: 0.8, r: 0.2 }, z + 3.8, 2.4, P, 2), { tone: "mid" }) + S(k.slabOf({ x: x + 1.2, y: y - 0.4, w: 1.2, d: 0.8, r: 0.2 }, z + 3.8, 2.4, P, 2), { tone: "mid" });
}

export function switchBlock() {
  const z = C.BOIL.z1 - 1;
  return S(k.slabOf(SWITCH, z, 6, P, 3, 0.5), { tone: "mid" }) + D([[SWITCH.x + 1.4, SWITCH.y + SWITCH.d, z + 4.6], [SWITCH.x + SWITCH.w - 1.4, SWITCH.y + SWITCH.d, z + 4.6]].map(at), { size: 0.45 }) +
    S(rod([C.SW.pivot[0], SWITCH.y - 0.4, C.SW.pivot[2]], [0, 1, 0], 1.4, 0, SWITCH.d + 0.8, 14), { tone: "mid" });
}

// Wires from the heater terminals down to the deck, and from the thermostat into Ember's switch block.
export function wires() {
  const z = C.BOIL.z1 - 1, d = C.DECK_Z + C.DECK_H;
  const w = (from, to, via) => k.wireSvg(at(from), at(to), { via: via.map(at), tone: "lo", size: 0.8 });
  return TERM.map(([x, y, tz], i) => w([x, y, tz], [x + 2 + i * 2, y + 1 + i, d], [[x + 2 + i * 2, y + 1 + i, tz]])).join("") +
    w([gx - 5.8, gy - 9, z + 6.2], [SWITCH.x + 1, SWITCH.y, z + 4], [[gx - 5.8, gy - 9, z + 8], [SWITCH.x + 1, SWITCH.y - 3, z + 8]]);
}

// The group head under the deck, the portafilter locked into it and its two spouts.
export function group() {
  const G = C.GROUP, F = C.PF;
  const out = [S(L.solidOf([[0, 11.5], [1, G.r, 1], [G.z1 - G.z0, G.r]], up(G.z0), P), { tone: "hi", crease: "none" })];
  out.push(Ln(L.arcOf(up(G.z0), 4, G.r, P) + L.arcOf(up(G.z0), 7.5, G.r, P), { tone: "faint" }));
  out.push(S(rod([gx + G.r - 0.5, gy, 70], [1, 0, 0], 1.6, 0, C.SOL.x - 3 - gx - G.r + 0.5, 12), { tone: "mid" }));
  const handle = L.unit3([0, 1, -0.12]);
  out.push(S(L.solidOf([[0, 2.4], [8, 2, 1], [26, 2.8, 1], [31, 2.4, 1], [32, 1]], L.frameAlong([gx, gy + F.r - 0.5, 60], handle), P), { tone: "hi", crease: "none" }));
  out.push(S(L.solidOf([[0, 8.5], [2.5, F.r, 1], [F.z1 - F.z0, F.r]], up(F.z0), P), { tone: "hi", crease: "none" }));
  out.push(Ln(L.arcOf(up(F.z0), F.z1 - F.z0 - 1.2, F.r, P), { tone: "faint" }));
  out.push(S(k.cylinder(gx, gy, 3.6, C.SPOUT_Z + 3, 3, P, 24), { tone: "mid" }));
  for (const dx of [-2.6, 2.6]) out.push(S(L.solidOf([[0, 0.9], [3, 1.3]], L.frameAlong([gx + dx, gy, C.SPOUT_Z], [0, 0, 1]), P), { tone: "mid" }));
  return out.join("");
}

// The three-way valve beside the group: when the pump stops it vents the puck's pressure down into the tray.
export function solenoid() {
  const s = C.SOL;
  return S(k.slabOf({ x: s.x - 3, y: s.y - 4, w: 6, d: 8, r: 1 }, s.z0, s.z1 - s.z0, P, 3, 0.4), { tone: "mid" }) +
    S(rod([s.x + 3, s.y, 70.5], [1, 0, 0], 3, 0, 5, 24), { tone: "hi" }) +
    D([at([s.x + 8.05, s.y, 70.5])], { size: 0.5, tone: "mid" }) +
    pipe([[s.x, s.y, s.z0], [s.x, s.y, C.TRAY_Z + 1.2]], 1.2, { caps: [false, true] });
}

// The cup on the tray grille, with its handle on the far side; its coffee is drawn by the model.
export const CUP_TOP = C.TRAY_Z + 0.8 + C.CUP.h;
export function cup() {
  const z0 = C.TRAY_Z + 0.8, R = C.CUP.r;
  const out = [S(k.cylinder(gx, gy, R + 3, z0, 1.2, P, 40, 0.4), { tone: "hi" })];
  out.push(pipe([[gx - 5, gy - R + 0.4, z0 + 11], [gx - 5, gy - R - 4.5, z0 + 9], [gx - 5, gy - R - 4.5, z0 + 5], [gx - 5, gy - R + 0.4, z0 + 4]], 1.1, { tone: "hi", bend: 2.4, caps: false }));
  out.push(S(L.solidOf([[0, R - 2], [1.2, R - 0.6, 1], [C.CUP.h, R]], up(z0 + 1.2), P), { tone: "hi", crease: "none" }));
  return out.join("");
}
