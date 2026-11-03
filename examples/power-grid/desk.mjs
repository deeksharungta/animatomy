import * as k from "../../kit/iso-kit.mjs";
import { C, P, at, S, Ln, D, box, rod, ringY } from "./model.mjs";

// The synchronising desk in front of the switchgear: a pedestal with a flat top carrying the synchroscope,
// three dark-lamp sockets, a voltmeter and a frequency meter for the generator, and the close and trip buttons.
export const DK = { x: 88, y: -6, w: 44, d: 30, r: 1 };
export const TOPZ = C.DESK.z;
export const SC = C.SC;
export const LAMPS = [[93, 1], [93, 8], [93, 15]].map(([x, y]) => [x, y, TOPZ]);
export const METERS = C.METERS;
export const BUTTONS = [[100, 19.5], [106, 19.5]];

export function desk() {
  const out = [];
  out.push(`<path class="iso-halo" d="${k.haloOf({ x: 94, y: -2, w: 30, d: 22, r: 1 }, 0, 4, P)}"/>`);
  out.push(S(box(94, -2, 0, 124, 20, 3, 0.5, 0.4), { tone: "lo" }));
  out.push(S(box(96, 0, 3, 122, 18, TOPZ - 6, 0.6, 0.5), { tone: "mid", inner: Ln(k.sideSeam({ x: 96, y: 0, w: 26, d: 18, r: 0.6 }, 10, P, 2), { tone: "faint" }) }));
  out.push(Ln(ringY(18, 99, 119, 14, 34, 1), { tone: "faint" }));
  out.push(S(rod([116, 18, 24], [0, 1, 0], 0.9, 0, 1.6, 12), { tone: "hi" }));
  out.push(S(k.slabOf(DK, TOPZ - 6, 6, P, 3, 0.8), { tone: "mid" }));
  // A label plate on the desk's front edge: three rule lines that stand for its engraving.
  const ly = DK.y + DK.d;
  out.push(S(box(98, ly, TOPZ - 5, 118, ly + 0.6, TOPZ - 1, 0.2), { tone: "hi" }));
  out.push(Ln([[100, 114], [100, 110], [100, 112]].map(([a, b], i) => k.segment([a, ly + 0.6, TOPZ - 2 - i * 1.1], [b, ly + 0.6, TOPZ - 2 - i * 1.1], P)).join(""), { tone: "lo", free: true }));
  out.push(D([[99, ly + 0.6, TOPZ - 3], [117, ly + 0.6, TOPZ - 3]].map(at), { size: 0.35 }));
  // The synchroscope: bezel, face, ticks, the in-phase mark at twelve o'clock.
  out.push(S(k.cylinder(SC.x, SC.y, SC.r + 1.4, TOPZ, 1.6, P, 56, 0.4), { tone: "mid" }));
  out.push(S(k.cylinder(SC.x, SC.y, SC.r, TOPZ + 1.6, 0.2, P, 56), { tone: "hi", flat: true }));
  const z = TOPZ + 1.8;
  const t = k.radialTicks(SC.x, SC.y, SC.r - 0.4, 36, 3, z, [1, 2.2], P);
  out.push(Ln(k.ring(SC.x, SC.y, SC.r - 0.4, z, P, 56), { tone: "lo" }) + Ln(t.minor, { tone: "lo" }) + Ln(t.major, { tone: "mid" }));
  out.push(Ln(k.lineOnTop([SC.x, SC.y - SC.r + 0.4], [SC.x, SC.y - SC.r + 3.6], z, P), { tone: "hi" }));
  out.push(Ln(k.ring(SC.x, SC.y - SC.r + 4.6, 1, z, P, 16), { tone: "hi" }));
  // Lamp sockets (the glass domes glow when the voltage across the open breaker is high).
  for (const [x, y] of LAMPS) {
    out.push(S(k.cylinder(x, y, 2.4, TOPZ, 1.2, P, 24, 0.3), { tone: "mid" }));
    out.push(`<g data-lamp>${S(k.cylinder(x, y, 1.6, TOPZ + 1.2, 1.4, P, 20), { tone: "hi" })}</g>`);
  }
  // The meters: bezels, faces and scales.
  for (const m of METERS) {
    out.push(S(k.cylinder(m.x, m.y, m.r + 0.8, TOPZ, 1.2, P, 32, 0.3), { tone: "mid" }));
    const mt = k.radialTicks(m.x, m.y, m.r - 0.3, 10, 5, TOPZ + 1.2, [0.6, 1.2], P, -Math.PI * 0.75, Math.PI * 1.5);
    out.push(Ln(k.ring(m.x, m.y, m.r - 0.3, TOPZ + 1.2, P, 32), { tone: "lo" }) + Ln(mt.minor, { tone: "lo" }) + Ln(mt.major, { tone: "mid" }));
  }
  // Close and trip buttons in their guard collars, and the synchronising key switch.
  for (const [i, [x, y]] of BUTTONS.entries()) {
    out.push(S(k.cylinder(x, y, 2, TOPZ, 0.8, P, 20), { tone: "mid" }) + S(k.cylinder(x, y, 1.3, TOPZ + 0.8, 1, P, 16, 0.2), { tone: i ? "lo" : "hi" }));
  }
  out.push(S(k.cylinder(120, 19.5, 2, TOPZ, 1, P, 20), { tone: "mid" }) + S(box(119.6, 18, TOPZ + 1, 120.4, 21, TOPZ + 2.6, 0.2), { tone: "hi" }));
  return out.join("");
}
