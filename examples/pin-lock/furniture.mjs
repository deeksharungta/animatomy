import { C, P, K, at, S, Ln, Dt } from "./model.mjs";
import { T } from "./cylinder.mjs";

// The desk section the lock is fitted in, cut through the keyway: everything here keeps y < 0.
const B = C.BOARD, D = C.DESK, H = C.HOUSING;
const voidOn = (pts) => `<path class="pl-void" d="${T.onCut(pts)}"/>` + Ln(T.onCut(pts), { tone: "lo" });
// Wood end grain on a cut face: a few faint growth rings, each running edge to edge of the face.
const rings = (x0, x1, z0, z1, n) => {
  const out = [];
  for (let i = 1; i <= n; i++) { const z = z0 + ((z1 - z0) * i) / (n + 1), bow = (z1 - z0) * 0.08; out.push(T.onCut([[x0, z], [(x0 + x1) / 2, z + bow], [x1, z]], 0.03, false)); }
  return Ln(out.join(""), { tone: "faint" });
};

// The base board on the bench, the desk's cheek at the back and the rail under the drawer.
export function base() {
  const b = { x: -98, y: -60, w: 122, d: 72, r: 2 }, out = [`<path class="iso-halo" d="${K.haloOf(b, C.BENCH_Z, 8, P)}"/>`];
  out.push(S(K.slabOf(b, C.BENCH_Z, C.BASE_Z - C.BENCH_Z, P, 3, 0.6), { tone: "lo", inner: Ln(K.sideSeam(b, C.BENCH_Z + 4, P, 3), { tone: "faint" }) }));
  for (const [x, y] of [[-91, 5], [17, 5]]) out.push(Ln(K.ring(x, y, 2.2, C.BASE_Z, P, 16), { tone: "lo" }), Dt([at([x, y, C.BASE_Z])], { size: 0.5 }));
  // A brass label plate on the base's top, three rule lines for its engraving.
  const lp = { x: -34, y: 1, w: 30, d: 8, r: 1 };
  out.push(S(K.slabOf(lp, C.BASE_Z, 0.6, P, 3), { tone: "mid", crease: "none" }), Ln(K.planOutline(K.insetPlan(lp, 1.2), C.BASE_Z + 0.6, P, 3), { tone: "faint" }));
  out.push(Ln([[4, 26], [4, 20], [4, 23]].map(([a, b2], i) => K.lineOnTop([lp.x + a, lp.y + 3 + i * 2], [lp.x + b2, lp.y + 3 + i * 2], C.BASE_Z + 0.6, P)).join(""), { tone: "lo", free: true }));
  return out.join("");
}

export function cheek() {
  const out = [S(T.box(D.x0, D.x1, D.y0 - 10, D.y0, C.BASE_Z, D.z1), { tone: "mid", crease: "lo" })];
  // The drawer runner screwed along the cheek.
  out.push(S(T.box(D.x0 + 4, D.x1 - 8, D.y0, B.y0 + 8, -50, -46), { tone: "lo" }));
  out.push(Dt([at([D.x0 + 20, B.y0 + 8, -48]), at([D.x0 + 60, B.y0 + 8, -48])], { size: 0.5 }));
  return out.join("");
}

export function rail() {
  const out = [S(T.box(D.x0, D.x1, D.y0, 0, -68, -52), { tone: "mid", crease: "lo" })];
  out.push(rings(D.x0, D.x1, -68, -52, 2));
  return out.join("");
}

// The desk top over the drawer: the keep, a pocket under a steel plate, is where the bolt goes up.
export function deskTop() {
  const out = [], k0 = C.BOLT.x0 + 0.4, k1 = C.BOLT.x1 - 0.4;
  // The keep plate under the desk, cut in two by the bolt's hole, with its screws; the desk drawn over it.
  for (const [x0, x1] of [[k0, k0 + 3.5], [k1 - 3.5, k1]]) out.push(S(T.box(x0, x1, -14, 0, D.z0 - 1, D.z0), { tone: "hi", crease: "none" }));
  out.push(S(T.box(D.x0, D.x1, D.y0, 0, D.z0, D.z1), { tone: "mid", crease: "lo" }));
  out.push(rings(D.x0, D.x1, D.z0 + 4, D.z1, 3));
  out.push(voidOn([[k0, D.z0], [k1, D.z0], [k1, D.z0 + 4], [k0, D.z0 + 4]]));
  // The desk's leather writing inlay, set in a groove, and the grain of the top running out to its edges.
  const inlay = { x: D.x0 + 8, y: D.y0 + 8, w: D.x1 - D.x0 - 16, d: -D.y0 - 8, r: 0 };
  out.push(Ln(K.planOutline(inlay, D.z1, P, 2), { tone: "lo" }) + Ln(K.planOutline(K.insetPlan(inlay, 1.5), D.z1, P, 2), { tone: "faint" }));
  out.push(Ln([D.y0 + 3, D.y0 + 5.5].map((y) => K.lineOnTop([D.x0, y], [D.x1, y], D.z1, P)).join(""), { tone: "faint" }));
  // The desk's front edge: a rounded nosing line along the top.
  out.push(Ln(K.segment([D.x1, D.y0, D.z1 - 2], [D.x1, 0, D.z1 - 2], P), { tone: "faint" }));
  return out.join("");
}

// The drawer: its far side and bottom, and the front board in three pieces round the cylinder's housing.
export function drawerBack() {
  const out = [S(T.box(D.x0 + 2, B.x0, B.y0, B.y0 + 8, -46, 22), { tone: "mid", crease: "lo" })];
  out.push(S(T.box(D.x0 + 2, B.x0, B.y0, 0, -46, -42), { tone: "lo", crease: "none" }));
  // What the lock keeps: a notebook and a pencil in the drawer.
  const nb = { x: -82, y: -34, w: 34, d: 24, r: 1 };
  out.push(S(K.slabOf(nb, -42, 4, P, 2, 0.4), { tone: "hi", inner: Ln(K.sideSeam(nb, -40.6, P, 2), { tone: "faint" }) }));
  out.push(Ln(K.lineOnTop([nb.x + 4, nb.y], [nb.x + 4, nb.y + nb.d], -38, P), { tone: "lo" }));
  const pen = { o: [-79, -6, -36.4], a: [1, 0, 0], u: [0, 1, 0], v: [0, 0, 1] };
  out.push(S(T.body(pen, T.circle(0, 0, 1.6, 6), 0, 30), { tone: "mid", crease: "lo" }), S(T.body(pen, T.circle(0, 0, 1.6, 6), 30, 31.5), { tone: "lo", crease: "none" }));
  return out.join("");
}
export function boardBehind() {
  return S(T.box(B.x0, B.x1, B.y0, -H.r, -H.r, H.top), { tone: "mid" }) + S(T.box(B.x0, B.x1, B.y0, 0, B.z0, -H.r), { tone: "mid", crease: "lo" }) + rings(B.x0, B.x1, B.z0, -H.r, 3);
}
export function boardTop() {
  const out = [S(T.box(B.x0, B.x1, B.y0, 0, H.top, B.z1), { tone: "mid", crease: "lo" }), rings(B.x0, B.x1, H.top, B.z1, 1)];
  // The drawer front's moulded panel: a groove round its face, running into the cut at both ends.
  const g = [[0, B.z1 - 5], [B.y0 + 5, B.z1 - 5], [B.y0 + 5, B.z0 + 5], [0, B.z0 + 5]].map(([y, z]) => at([B.x1, y, z]));
  out.push(Ln(K.pathOf(g), { tone: "lo" }));
  // The drawer's pull, a turned knob on the front face, off to one side of the lock.
  const F = K.frameOf([B.x1, -34, 8], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  out.push(S(K.solidOf([[0, 3.4], [0.8, 3.4], [4, 1.8, 1], [6.5, 3.9, 1], [9, 4.2, 1], [10.6, 2.6, 1], [11, 0]], F, P), { tone: "mid" }));
  return out.join("");
}
