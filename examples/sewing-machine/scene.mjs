// The sewing room around the machine, in the kit's own tones: two panelled walls, a shelf of spools, the sewing table,
// a pin cushion and a tape measure behind the machine, and in front the face plate taken off the head, its screws and
// a pair of shears.
import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { P, at, DESK, ROOM_TOP, S, Ln, D } from "./model.mjs";

const up = (x, y, z) => L.frameOf([x, y, z], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
const halo = (plan, h = 1) => `<path class="iso-halo" d="${k.haloOf(plan, 0, h, P)}"/>`;

export function room() {
  const out = [], yb = DESK.y - 6, xl = DESK.x - 6;
  out.push(S(k.slabOf({ x: xl, y: yb, w: DESK.w + 6, d: 6, r: 0.6 }, -16, ROOM_TOP + 16, P, 2), { tone: "mid" }));
  out.push(S(k.slabOf({ x: xl, y: yb + 6, w: 6, d: DESK.d, r: 0.6 }, -16, ROOM_TOP + 16, P, 2), { tone: "mid" }));
  // Tongue-and-groove boards: joints run from the table to a dado rail, panels above it.
  const v = [], h = [];
  for (let x = DESK.x + 14; x < DESK.x + DESK.w - 2; x += 14) v.push(k.segment([x, DESK.y, 0], [x, DESK.y, 120], P));
  for (let y = DESK.y + 14; y < DESK.y + DESK.d - 2; y += 14) v.push(k.segment([DESK.x, y, 0], [DESK.x, y, 120], P));
  for (const z of [120, 126]) h.push(k.pathOf([at([DESK.x + DESK.w, yb, z]), at([DESK.x + DESK.w, DESK.y, z]), at([DESK.x, DESK.y, z]), at([DESK.x, DESK.y + DESK.d, z]), at([xl, DESK.y + DESK.d, z])]));
  out.push(Ln(v.join("") + h.join(""), { tone: "faint" }));
  // A shelf on the left wall on two brackets, with six spools of thread, plain like everything that isn't the cloth.
  const sx = DESK.x, sz = 200;
  out.push(S(k.slabOf({ x: sx, y: -70, w: 22, d: 140, r: 1 }, sz, 5, P, 3, 0.5), { tone: "hi" }));
  for (const y of [-62, 56]) {
    out.push(S(k.slabOf({ x: sx, y, w: 16, d: 5, r: 0.6 }, sz - 22, 22, P, 2), { tone: "mid" }));
    out.push(D([at([sx, y + 2.5, sz - 8])], { size: 0.55 }));
  }
  for (let i = 0; i < 6; i++) {
    const y = -56 + i * 22, F = up(sx + 11, y, sz + 5);
    out.push(S(L.solidOf([[0, 8], [2, 8], [2.4, 6.6], [17.6, 6.6], [18, 8], [20, 8]], F, P, { fill: "hull" }), { tone: i % 2 ? "hi" : "mid", inner: k.fadedSvg(L.ribsOf(F, 2.6, 17.4, 6.6, 18, P, { fade: [0.05, 0.4], seams: true }), { tone: "faint" }) }));
    out.push(Ln(L.arcOf(F, 20, 2, P, { least: -1 }), { tone: "lo" }));
  }
  // A cork board with a paper pattern pinned to it, above the socket.
  const cb = { x0: 132, x1: 196, z0: 150, z1: 206 }, yw = DESK.y;
  out.push(S(k.slabOf({ x: cb.x0, y: yw, w: cb.x1 - cb.x0, d: 3, r: 0.6 }, cb.z0, cb.z1 - cb.z0, P, 2, 0.5), { tone: "mid" }));
  const pp = [[cb.x0 + 8, cb.z0 + 8], [cb.x0 + 40, cb.z0 + 6], [cb.x0 + 44, cb.z1 - 8], [cb.x0 + 10, cb.z1 - 6]];
  out.push(`<path class="iso-solid" d="${k.pathOf(pp.map(([x, z]) => at([x, yw + 3.2, z])), true)}" style="fill:var(--anatomy-face);stroke:var(--anatomy-lo);stroke-width:var(--anatomy-weight)"/>`);
  out.push(Ln(k.pathOf([[cb.x0 + 16, cb.z0 + 16], [cb.x0 + 34, cb.z0 + 14], [cb.x0 + 37, cb.z1 - 16], [cb.x0 + 18, cb.z1 - 14]].map(([x, z]) => at([x, yw + 3.2, z])), true), { tone: "lo", dashed: true }));
  out.push(D([[cb.x0 + 26, yw + 3.4, cb.z1 - 10], [cb.x1 - 12, yw + 3.4, cb.z0 + 30]].map(at), { size: 1, tone: "hi" }));
  out.push(`<path class="iso-solid" d="${k.pathOf([[cb.x1 - 18, cb.z0 + 12], [cb.x1 - 6, cb.z0 + 12], [cb.x1 - 6, cb.z0 + 34], [cb.x1 - 18, cb.z0 + 34]].map(([x, z]) => at([x, yw + 3.2, z])), true)}" style="fill:var(--anatomy-face);stroke:var(--anatomy-lo);stroke-width:var(--anatomy-weight)"/>`);
  // A wall socket for the lamp and motor lead, with its rocker and two screws.
  const s = { x: 178, z: 64 };
  out.push(S(k.slabOf({ x: s.x - 11, y: DESK.y, w: 22, d: 2, r: 1 }, s.z - 11, 22, P, 3, 0.4), { tone: "hi" }));
  out.push(D([[s.x - 8, DESK.y + 2, s.z + 8], [s.x + 8, DESK.y + 2, s.z - 8]].map(at), { size: 0.5 }));
  out.push(S(k.slabOf({ x: s.x + 2, y: DESK.y + 2, w: 6, d: 1.4, r: 0.4 }, s.z + 2, 6, P, 2), { tone: "mid" }));
  out.push(S(k.slabOf({ x: s.x - 8, y: DESK.y + 2, w: 8, d: 6, r: 1.2 }, s.z - 7, 9, P, 3, 0.4), { tone: "hi" }));
  return out.join("");
}

export function desk() {
  const grain = [];
  for (let y = DESK.y + 12; y < DESK.y + DESK.d - 6; y += 13) grain.push(k.lineOnTop([DESK.x, y], [DESK.x + DESK.w, y], 0, P));
  return S(k.slabOf(DESK, -16, 16, P, 4, 1), { tone: "mid", inner: Ln(k.sideSeam(DESK, -4, P, 4), { tone: "faint" }) }) + Ln(grain.join(""), { tone: "faint" });
}

// Behind the machine: a pin cushion with pins, and a tape measure in its round case.
export function propsBack() {
  const out = [];
  const [cx, cy] = [-196, 100];
  out.push(halo({ x: cx - 20, y: cy - 20, w: 40, d: 40, r: 20 }));
  out.push(S(L.solidOf([[0, 15], [6, 15.5], [7, 13]], up(cx, cy, 0), P, { fill: "hull" }), { tone: "mid" }));
  const dome = L.sphereOf([cx, cy, 10], 14, P);
  out.push(S(dome, { tone: "hi", inner: Ln([0.6, 2.2, 3.8, 5.4].map((a) => k.pathOf(Array.from({ length: 13 }, (_, i) => { const t = (i / 12) * Math.PI; return at([cx + 14 * Math.sin(t) * Math.cos(a), cy + 14 * Math.sin(t) * Math.sin(a), 10 + 14 * Math.cos(t)]); }))).join(""), { tone: "faint" }) }));
  for (const [dx, dy, a] of [[-4, 2, 0.3], [3, -5, -0.4], [6, 4, 0.5], [-2, -7, -0.2]]) {
    const b = [cx + dx, cy + dy, 10 + Math.sqrt(Math.max(0, 196 - dx * dx - dy * dy))], t = [b[0] + 9 * Math.sin(a), b[1] + 3, b[2] + 9];
    out.push(Ln(k.segment(b, t, P), { tone: "mid" }) + D([at(b)], { size: 0.35, tone: "mid" }) + D([at(t)], { size: 0.9, tone: "hi" }));
  }
  const T = [150, 104];
  out.push(halo({ x: T[0] - 16, y: T[1] - 16, w: 32, d: 32, r: 16 }));
  out.push(S(L.solidOf([[0, 14], [1, 15, 1], [10, 15, 1], [11, 14]], up(T[0], T[1], 0), P), { tone: "hi", inner: Ln(L.arcOf(up(T[0], T[1], 0), 5.5, 15, P), { tone: "faint" }) }));
  out.push(Ln(k.ring(T[0], T[1], 6, 11, P, 36) + k.ring(T[0], T[1], 10, 11, P, 48), { tone: "lo" }) + D([at([T[0], T[1], 11])], { size: 0.8 }));
  const tk = k.topTicks(T[0] - 40, T[0] - 16, 2.5, 4, T[1] - 3, 0.5, [1.2, 2.4], P);
  out.push(S(k.slabOf({ x: T[0] - 44, y: T[1] - 3, w: 30, d: 6, r: 0.3 }, 0, 0.5, P, 2), { tone: "hi", inner: Ln(tk.minor, { tone: "faint" }) + Ln(tk.major, { tone: "lo" }) }));
  return out.join("");
}

// The foot pedal you press, on the table in front: a base with rubber treads, the rocking top, and its lead.
export function pedal() {
  const out = [], b = { x: -176, y: 92, w: 44, d: 26, r: 4 };
  out.push(`<path class="iso-halo" d="${k.haloOf(k.insetPlan(b, -3), 0, 1, P)}"/>`);
  out.push(k.wireSvg(at([-150, b.y, 2.5]), at([-150, 80, 16]), { via: [at([-150, 86, 1]), at([-150, 81, 6])], tone: "lo", size: 0.9 }));
  out.push(S(k.slabOf(b, 0, 5, P, 4, 0.6), { tone: "mid", inner: Ln(k.sideSeam(b, 2, P, 4), { tone: "faint" }) }));
  const F = L.frameOf([b.x + 4, b.y + 3, 5], [1, 0, 0], [0, 0.97, 0.26], [0, -0.26, 0.97]);
  out.push(S(L.prismOf(F, [[0, 0], [20, 0], [20, 3], [0, 3]], 0, 36, P), { tone: "hi", crease: "lo" }));
  const tr = [], ends = [];
  for (let i = 1; i < 6; i++) { const r = Math.hypot(3.3 * i, 3), a = Math.atan2(3, 3.3 * i), p0 = at(L.pointOf(F, 3, r, a)), p1 = at(L.pointOf(F, 33, r, a)); tr.push(k.pathOf([p0, p1])); ends.push(p0, p1); }
  out.push(Ln(tr.join(""), { tone: "lo" }) + D(ends, { size: 0.45, tone: "lo" }));
  return out.join("");
}

// In front: the face plate, taken off the head and laid on the table with its two screws, and the shears.
export function propsFront() {
  const out = [];
  const fp = { x: 162, y: 6, w: 34, d: 64, r: 6 };
  out.push(halo(fp, 2));
  out.push(S(k.slabOf(fp, 0, 2, P, 6, 0.6), { tone: "hi", inner: Ln(k.planOutline(k.insetPlan(fp, 4), 2, P, 6), { tone: "faint" }) }));
  out.push(D([[fp.x + 17, fp.y + 8, 2], [fp.x + 17, fp.y + fp.d - 8, 2]].map(at), { size: 0.7, tone: "lo" }));
  for (const [x, y] of [[170, 80], [184, 84]]) out.push(S(k.cylinder(x, y, 2.2, 0, 1.6, P, 16), { tone: "hi" }) + D([at([x, y, 1.6])], { size: 0.45, tone: "lo" }));
  // Shears: two blades crossing at a pivot screw, and the two handle loops.
  const F = L.frameOf([-40, 100, 0.8], [0.94, -0.34, 0], [0, 0, 1], [0.34, 0.94, 0]);
  out.push(halo({ x: -84, y: 84, w: 96, d: 34, r: 12 }));
  for (const s of [-1, 1]) {
    const G = L.frameOf(F.o, [0.94 * Math.cos(s * 0.05) + 0.34 * Math.sin(s * 0.05), -0.34 * Math.cos(s * 0.05) + 0.94 * Math.sin(s * 0.05), 0], [0, 0, 1], F.v);
    out.push(S(L.prismOf(G, [[-0.4, -2.4 * s], [0.4, -2.4 * s], [0.4, 0], [-0.4, 0.6 * s]], -2, 46, P), { tone: "hi", crease: "lo" }));
    const c = L.pointOf(G, -24, 0, 0).map((v, i) => v + F.v[i] * 6.5 * s), a = L.pointOf(G, -2, 0, 0), d = L.sub3(c, a), n = L.len3(d) - 5.6;
    out.push(S(L.prismOf(L.frameOf(a, L.unit3(d), [0, 0, 1], L.unit3(L.cross3([0, 0, 1], d))), [[-0.7, -1.8], [0.7, -1.8], [0.7, 1.8], [-0.7, 1.8]], 0, n, P), { tone: "mid" }));
    out.push(S(L.ringBand(-0.8, 0.8, 4, 6.6, L.frameOf(c, [0, 0, 1], [1, 0, 0], [0, 1, 0]), P), { tone: "mid" }));
    out.push(`<path class="iso-halo" d="${k.ring(c[0], c[1], 4, c[2] + 0.8, P, 28)}" style="opacity:.55"/>`);
  }
  out.push(D([at([F.o[0], F.o[1], 2])], { size: 0.9, tone: "lo" }));
  return out.join("");
}
