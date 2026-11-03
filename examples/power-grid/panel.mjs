import { k, P, at, S, Ln, D, box, seg, rod, circleY, ringY } from "./shapes.mjs";
import { C } from "./model.mjs";

// The synchronising panel where you stand: a cubicle facing you with the synchroscope, the incoming and
// running voltmeters and frequency meters, the two synchronising lamps, and the breaker's close and trip keys.
const PN = C.PANEL, FY = PN.y + PN.d, Z1 = 36;
export const SC = { x: PN.x + 11, z: 24, r: 4.2 };
export const METERS = [{ x: PN.x + 4, z: 30, r: 2.4, lo: 0, hi: 25 }, { x: PN.x + 18, z: 30, r: 2.4, lo: 45, hi: 55 }];
export const LAMPS = [[PN.x + 5, FY + 0.6, 22], [PN.x + 17, FY + 0.6, 22]];
export const KEYS = [[PN.x + 7, FY, 14], [PN.x + 15, FY, 14]];

export function panel() {
  const out = [], { x, y, w, d } = PN;
  out.push(S(box(x - 1, y - 1, 0, x + w + 1, y + d + 1, 2, 0.4), { tone: "lo" }));
  out.push(S(k.slabOf({ x, y, w, d, r: 0.6 }, 2, Z1 - 2, P, 2, 0.5), { tone: "mid", inner: Ln(k.sideSeam({ x, y, w, d, r: 0.6 }, 9, P, 2), { tone: "faint" }) }));
  out.push(S(box(x - 0.8, y - 0.8, Z1, x + w + 0.8, y + d + 0.8, Z1 + 1.4, 0.3, 0.3), { tone: "mid" }));
  // Instrument bezels, the synchroscope's dial and its twelve o'clock mark.
  const bez = [circleY(SC.x, FY, SC.z, SC.r + 0.8, 40), ...METERS.map((m) => circleY(m.x, FY, m.z, m.r + 0.5, 32))].join("");
  out.push(Ln(bez, { tone: "lo" }) + Ln([circleY(SC.x, FY, SC.z, SC.r, 40), ...METERS.map((m) => circleY(m.x, FY, m.z, m.r, 32))].join(""), { tone: "faint" }));
  const ticks = [];
  for (let i = 0; i < 24; i++) { const t = (i / 24) * Math.PI * 2, l = i % 6 ? 0.6 : 1.1; ticks.push(seg([SC.x + SC.r * Math.sin(t), FY, SC.z + SC.r * Math.cos(t)], [SC.x + (SC.r - l) * Math.sin(t), FY, SC.z + (SC.r - l) * Math.cos(t)])); }
  out.push(Ln(ticks.join(""), { tone: "mid" }) + Ln(seg([SC.x, FY, SC.z + SC.r], [SC.x, FY, SC.z + SC.r - 1.6]), { tone: "hi" }));
  for (const m of METERS) {
    const mt = [];
    for (let i = 0; i <= 8; i++) { const t = -Math.PI * 0.7 + (Math.PI * 1.4 * i) / 8, l = i % 4 ? 0.5 : 0.9; mt.push(seg([m.x + m.r * Math.sin(t), FY, m.z + m.r * Math.cos(t)], [m.x + (m.r - l) * Math.sin(t), FY, m.z + (m.r - l) * Math.cos(t)])); }
    out.push(Ln(mt.join(""), { tone: "lo" }));
  }
  // Lamp holders and domes, the two keys, a mimic strip with its terminal dots.
  for (const [lx, ly, lz] of LAMPS) out.push(S(rod([lx, FY, lz], [0, 1, 0], 1.6, 0, 0.6, 16), { tone: "mid" }) + S(rod([lx, ly, lz], [0, 1, 0], 1.1, 0, 0.8, 14), { tone: "hi" }));
  for (const [kx, ky, kz] of KEYS) out.push(S(rod([kx, ky, kz], [0, 1, 0], 1.4, 0, 1, 16), { tone: "mid" }) + S(rod([kx, ky + 1, kz], [0, 1, 0], 0.5, 0, 1.4, 10), { tone: "hi" }));
  out.push(S(box(x + 2, FY, 5, x + w - 2, FY + 0.4, 9, 0.2), { tone: "hi" }));
  out.push(Ln(seg([x + 3, FY + 0.4, 7], [x + w - 3, FY + 0.4, 7]), { tone: "lo" }) + D([[x + 3, FY + 0.4, 7], [x + w - 3, FY + 0.4, 7], [x + 11, FY + 0.4, 7]].map(at), { size: 0.55, tone: "mid" }));
  out.push(Ln(ringY(FY, x + 2, x + w - 2, 2.6, 4.2, 0.5, 2), { tone: "faint" }));
  return out.join("");
}

// The pointer and the two meter needles, drawn live. Inlined into the page: uses only its arguments.
export function dials(K, P, C, S, T) {
  const PN = C.PANEL, FY = PN.y + PN.d + 0.1, SC = { x: PN.x + 11, z: 24, r: 4.2 };
  const M = [{ x: PN.x + 4, z: 30, r: 2.4, lo: 0, hi: 25 }, { x: PN.x + 18, z: 30, r: 2.4, lo: 45, hi: 55 }];
  const a = S.ptr, tip = [SC.x + (SC.r - 0.6) * Math.sin(a), FY, SC.z + (SC.r - 0.6) * Math.cos(a)], tail = [SC.x - 1.2 * Math.sin(a), FY, SC.z - 1.2 * Math.cos(a)];
  const needle = (m, v) => { const f = Math.max(0, Math.min(1, (v - m.lo) / (m.hi - m.lo))), t = -Math.PI * 0.7 + Math.PI * 1.4 * f; return T.seg([m.x, FY, m.z], [m.x + (m.r - 0.5) * Math.sin(t), FY, m.z + (m.r - 0.5) * Math.cos(t)]); };
  return T.Ln(T.seg(tail, tip), { tone: "hi", free: "tip" }) + T.D([T.at([SC.x, FY, SC.z])], { size: 0.7, tone: "hi" }) +
    T.Ln(needle(M[0], S.E * C.LV_KV) + needle(M[1], S.f), { tone: "mid", free: "tip" }) + T.D(M.map((m) => T.at([m.x, FY, m.z])), { size: 0.45, tone: "mid" });
}
