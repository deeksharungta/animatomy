import { C, P, K, at, S, Ln, Dt } from "./model.mjs";
import { T } from "./cylinder.mjs";

// The locksmith's bench: two walls, a pegboard of key blanks, the bench top, a pinning kit and tweezers.
const B = C.BENCH, Z = C.BENCH_Z, TOP = C.WALL_TOP;

export function walls() {
  const out = [];
  out.push(S(K.slabOf({ x: B.x, y: B.y - 6, w: B.w, d: 6, r: 0.6 }, Z - 10, TOP - Z + 10, P, 2), { tone: "mid" }));
  out.push(S(K.slabOf({ x: B.x - 6, y: B.y - 6, w: 6, d: B.d + 6, r: 0.6 }, Z - 10, TOP - Z + 10, P, 2), { tone: "mid" }));
  // Tongue-and-groove boards on both walls, and a dado rail round them.
  const v = [];
  for (let x = B.x + 22; x < B.x + B.w - 4; x += 22) v.push(K.segment([x, B.y, Z], [x, B.y, TOP], P));
  for (let y = B.y + 22; y < B.y + B.d - 4; y += 22) v.push(K.segment([B.x, y, Z], [B.x, y, TOP], P));
  out.push(Ln(v.join(""), { tone: "faint" }));
  const dz = Z + 34;
  out.push(Ln(K.pathOf([at([B.x + B.w, B.y - 6, dz]), at([B.x + B.w, B.y, dz]), at([B.x, B.y, dz]), at([B.x, B.y + B.d, dz]), at([B.x - 6, B.y + B.d, dz])]), { tone: "lo" }));
  out.push(pegboard());
  return out.join("");
}

// A pegboard on the back wall with five key blanks hung on hooks.
function pegboard() {
  const x0 = 20, x1 = 78, z0 = -56, z1 = 40, y = B.y, out = [];
  out.push(S(T.box(x0, x1, y, y + 2, z0, z1), { tone: "mid", crease: "lo" }));
  const holes = [];
  for (let x = x0 + 5; x < x1 - 2; x += 6) for (let z = z0 + 5; z < z1 - 2; z += 6) holes.push(at([x, y + 2, z]));
  out.push(Dt(holes, { size: 0.42, tone: "lo" }));
  for (const [x, y2] of [[x0 + 3, z0 + 3], [x1 - 3, z0 + 3], [x0 + 3, z1 - 3], [x1 - 3, z1 - 3]]) out.push(Dt([at([x, y + 2, y2])], { size: 0.55, tone: "mid" }));
  [[30, 26], [40, 26], [50, 26], [60, 26], [70, 26], [36, -8], [56, -8]].forEach(([x, z], i) => out.push(blank(x, y + 2, z, i)));
  return out.join("");
}
function blank(x, y, z, i) {
  const hook = S(K.disc(0, 4, 0.6, K.frameAlong([x, y, z + 3], [0, 1, 0]), P), { tone: "lo", crease: "none" });
  const F = { o: [x, y + 3.2, z], a: [0, 1, 0], u: [1, 0, 0], v: [0, 0, 1] };
  const len = 22 + (i % 3) * 3;
  const head = [...T.arc(0, 0, 4.6, -40, 220, 18)], bl = [[-1.6, -3], [1.6, -3], [1.6, -3 - len], [-0.4, -3 - len - 1.6], [-1.6, -3 - len + 1]];
  const hole = K.pathOf(T.circle(0, 1.4, 1.1, 14).map(([u, v]) => T.at(T.W(F, 0.8, u, v))), true);
  return hook + S(T.body(F, bl, 0, 0.8), { tone: "mid", crease: "none" }) + S(T.body(F, head, 0, 0.8), { tone: "mid", crease: "none", inner: `<path class="iso-fill" d="${hole}"/>` + Ln(hole, { tone: "lo" }) });
}

export function bench() {
  const out = [S(K.slabOf(B, Z - 10, 10, P, 4, 1.2), { tone: "mid" })];
  const g = [];
  for (let y = B.y + 14; y < B.y + B.d - 4; y += 15) g.push(K.lineOnTop([B.x, y], [B.x + B.w, y], Z, P));
  out.push(Ln(g.join(""), { tone: "faint" }));
  return out.join("");
}

// A pinning kit: a tray of numbered compartments of key pins and drivers, its lid hinged open behind.
export function pinKit() {
  const k = { x: 34, y: -62, w: 44, d: 28, r: 1.5 }, h = 7, out = [`<path class="iso-halo" d="${K.haloOf(k, Z, 4, P)}"/>`];
  out.push(S(T.box(k.x, k.x + k.w, k.y - 2, k.y, Z + h, Z + h + 30), { tone: "mid", crease: "lo" }));
  // The lid's pin chart: a card of rule lines, one row per pin number.
  const card = [[k.x + 5, Z + h + 5], [k.x + k.w - 5, Z + h + 5], [k.x + k.w - 5, Z + h + 26], [k.x + 5, Z + h + 26]].map(([x, z]) => at([x, k.y + 0.1, z]));
  out.push(Ln(K.pathOf(card, true), { tone: "lo" }), Ln([0, 1, 2, 3, 4].map((r) => K.segment([k.x + 9, k.y + 0.1, Z + h + 9 + r * 3.6], [k.x + 9 + 20 + (r % 3) * 5, k.y + 0.1, Z + h + 9 + r * 3.6], P)).join(""), { tone: "faint", free: true }));
  out.push(S(K.slabOf(k, Z, h, P, 3, 0.5), { tone: "mid", inner: Ln(K.sideSeam(k, Z + 2.5, P, 3), { tone: "faint" }) }));
  const t = K.insetPlan(k, 2), cols = 6, rows = 3, cw = t.w / cols, rh = t.d / rows, walls = [], pins = [];
  out.push(S(K.slabOf(t, Z + h - 2, 0.01, P, 2), { tone: "lo", crease: "none" }));
  for (let c = 1; c < cols; c++) walls.push(K.lineOnTop([t.x + c * cw, t.y], [t.x + c * cw, t.y + t.d], Z + h, P));
  for (let r = 1; r < rows; r++) walls.push(K.lineOnTop([t.x, t.y + r * rh], [t.x + t.w, t.y + r * rh], Z + h, P));
  out.push(Ln(walls.join(""), { tone: "lo" }) + Ln(K.planOutline(t, Z + h, P, 2), { tone: "lo" }));
  for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) for (let n = 0; n < 4; n++) pins.push(at([t.x + c * cw + 2 + (n % 2) * 3.4 + r * 0.6, t.y + r * rh + 3 + Math.floor(n / 2) * 4, Z + h - 1.6]));
  out.push(Dt(pins, { size: 0.5, tone: "hi" }));
  return out.join("");
}

// Tweezers lying on the bench, two sprung blades joined at the back.
export function tweezers() {
  const z = Z + 0.8, out = [];
  for (const [y0, y1] of [[-16, -12.6], [-16, -19.4]]) out.push(S(T.box(36, 38, y0 - 1, y0 + 1, Z, z), { tone: "hi", crease: "none" }), S(K.extrude([[38, y0 - 1], [82, y1 - 0.5], [82, y1 + 0.5], [38, y0 + 1]], Z, 0.8, P), { tone: "hi", crease: "none" }));
  return out.join("");
}
