import { C, K, P, KIT, S, Ln, D, at, ptA, zF, turned } from "./model.mjs";
import { shell, thread, rings, F } from "./shell.mjs";
import { ribEdge } from "./mech.mjs";

const B = C.BAR, T = C.THREAD, [g0, g1, gr] = C.GRIP, [b0, b1, br] = C.BAND, CUT_TOP = C.WIN_A[1];
const uOf = (a) => (a - C.ROT) / 45 - 1;
const solid = (faces, style = {}) => S(F.solid(faces), { tone: "hi", crease: "faint", ...style });
const coneR = (z) => C.CONE.nose + 0.145 + ((B.ro - C.CONE.nose - 0.145) * (z - 0.8)) / (B.joint - 0.8);

// The lower barrel, nose to spigot: the tip's bore, the spring's seat, the cone widening to the barrel, and the
// male thread that screws into the upper barrel.
const lower = shell(
  [[0.8, C.CONE.bore], [C.SPRING.seat, C.CONE.bore], [C.SPRING.seat, C.CONE.seatR], [B.joint, B.ri], [T.z[1], B.ri]],
  [[0.8, coneR(0.8)], [9, coneR(9)], [16, coneR(16)], [B.joint, B.ro], [b1, B.ro], [b1, T.r[1]], ...thread(b1 + 0.01, T.z[1], T.r, T.pitch, T.z[0])],
);
// The upper barrel over the spigot (its female thread), holding the ribs; the centre band sits on the lower barrel.
const upper = shell([...thread(b1, T.z[1], T.r, T.pitch, T.z[0]), [T.z[1], B.ri], [CUT_TOP, B.ri]], [[b1, B.ro], [CUT_TOP, B.ro]]);
const band = shell([[b0, B.ro], [b1, B.ro]], [[b0, B.ro], [b0 + 0.4, br], [b1 - 0.4, br], [b1, B.ro + 0.15]], { tone: "mid", step: 3 });
// The rubber grip sleeve over the lower barrel, nine shallow rings round it.
const gripRings = Array.from({ length: 9 }, (_, i) => g0 + 4 + i * 2.25);
const grip = shell([[g0, B.ro], [g1, B.ro]], [[g0, B.ro], [g0 + 0.9, gr], [g1 - 0.9, gr], [g1, B.ro]], { tone: "mid", skin: Ln(rings(gripRings, gr), { tone: "faint" }) });

export const backs = () => upper.back + band.back + grip.back + lower.back;
export const fronts = () => lower.front + upper.front + band.front + grip.front;

// One cam rib on the upper barrel's far half, between two long grooves, with a short notch in the middle of its
// lower end: the notch the held lug sits in.
function rib(c) {
  const h = K.half * 45, s0 = c - 45 + h, s1 = c + 45 - h;
  const zb = (a, dir) => C.Z0 + ribEdge(K, uOf(a + dir * 1e-3));
  const angles = F.sweep(s0, s1, 2.5, [c - h, c + h]);
  const faces = [...F.panel(C.RIB_R, angles, zb, () => C.RIB_TOP, -1), ...F.under(C.RIB_R, B.ri, angles, zb)];
  const n0 = C.Z0 + K.m * (1 - 2 * K.half), nz = C.Z0 + K.notch;
  faces.push(...F.side(c - h, C.RIB_R, B.ri, n0, nz, n0, nz, 1), ...F.side(c + h, C.RIB_R, B.ri, C.Z0, nz, C.Z0, nz, -1));
  faces.push(...F.side(s0, C.RIB_R, B.ri, C.Z0, C.RIB_TOP, C.Z0, C.RIB_TOP, -1), ...F.side(s1, C.RIB_R, B.ri, n0, C.RIB_TOP, n0, C.RIB_TOP, 1));
  return solid(faces.map((f) => ({ ...f, s: [f.n[0], f.n[1], f.n[2] - 0.55] })), { tone: "hi" });
}
export const ribs = () => rib(225) + rib(135);

// The steel bushing at the very tip, the refill's ball passing through its bore.
export const bushing = () => S(turned([[0, 1.25], [0.25, 1.6, 1], [0.8, 1.72]], 0), { tone: "mid", crease: "none" });

// The clip ring: a band round the top of the barrel, two rolled edges, the barrel's bore dark inside it.
export function topBand() {
  const [c0, c1] = B.clip, r = B.ro + 0.45;
  const lines = KIT.arcOf(zF(c0), 1.4, r, P) + KIT.arcOf(zF(c0), c1 - c0 - 1.4, r, P);
  return S(turned([[0, r], [c1 - c0, r]], c0), { tone: "mid", crease: "none", inner: Ln(lines, { tone: "faint" }) });
}

// The pocket clip down the near side: a sprung steel strip from under the clip ring, a ball at its foot, a rivet.
export function clip() {
  const a = 102, w = 8, angles = F.sweep(a - w, a + w, 2), [z0, z1] = [97, 116.5], r0 = B.ro + 0.5, r1 = r0 + 0.7;
  const faces = [...F.panel(r1, angles, () => z0, () => z1, 1), ...F.side(a - w, r0, r1, z0, z1, z0, z1, -1), ...F.side(a + w, r0, r1, z0, z1, z0, z1, 1), ...F.flat(z0, r0, r1, angles, -1)];
  const ridge = Ln(KIT.pathOf([at(ptA(r1, a, z0 + 2.4)), at(ptA(r1, a, z1 - 3))]), { tone: "faint" });
  return solid(faces, { tone: "mid", inner: ridge }) + S(KIT.sphereOf(ptA(r1 - 0.1, a, z0 + 0.7), 1.25, P), { tone: "hi" }) + D([at(ptA(r1, a, 112.5))], { size: 0.55, tone: "lo" });
}

// The barrel's bore past the upper cut, dark where the plunger goes into the clip ring.
export const boreAt = (z, r) => `<path class="iso-shade" data-shade="3" d="${KIT.pathOf(Array.from({ length: 64 }, (_, i) => at(ptA(r, (i / 64) * 360, z))), true)}"/>`;
