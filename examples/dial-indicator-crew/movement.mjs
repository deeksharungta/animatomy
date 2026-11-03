import * as G from "../../kit/lathe.mjs";
import { C, P, K, L, dialFrame, upFrame, S, Ln, Dt } from "./model.mjs";
import { tools } from "./tools.mjs";

// The movement's static parts: the guide rod and its brackets, the middle bridge, the cocks that carry the front
// pivots, the shelves the crew stand on, and the bezel lock's lever.
const T = tools(K, P, { O: C.O, U: C.U, N: C.N });
const PD = C.PLUNGER_D, GD = C.GUIDE, PL = C.PLATE_D;
const jewel = (x, y, d) => Ln(T.circle(x, y, 1.6, d, 20), { tone: "lo" }) + Dt([T.pl(d)(x, y)], { size: 0.55, tone: "hi" });

export function brackets() {
  const out = [];
  // Guide rod brackets from the back plate, and the two pillars the shelves hang from.
  out.push(S(T.boxL(GD.x - 4, GD.x + 4, GD.y0 - 4, GD.y0, PL, GD.d + 3), { tone: "mid" }));
  out.push(S(T.boxL(GD.x - 4, GD.x + 4, GD.y1, GD.y1 + 4, PL, GD.d + 3), { tone: "mid" }));
  out.push(Dt([T.pl(GD.d + 3)(GD.x, GD.y0 - 2), T.pl(GD.d + 3)(GD.x, GD.y1 + 2)], { size: 0.5 }));
  // The guide rail: a slotted bar the spring arm's pin rides in, so the plunger and its rack can't turn.
  const R = C.RAIL, f = T.pl(R.d1), xm = (R.x0 + R.x1) / 2;
  out.push(S(T.boxL(R.x0, R.x1, R.y0, R.y1, R.d0, R.d1), { tone: "mid" }));
  out.push(`<path class="di-window" d="${T.path([f(xm - 0.9, R.y0 + 5), f(xm + 0.9, R.y0 + 5), f(xm + 0.9, R.y1 - 5), f(xm - 0.9, R.y1 - 5)], true)}"/>` + Ln(T.path([f(xm - 0.9, R.y0 + 5), f(xm + 0.9, R.y0 + 5), f(xm + 0.9, R.y1 - 5), f(xm - 0.9, R.y1 - 5)], true), { tone: "lo" }));
  out.push(Dt([f(xm, R.y0 + 2.4), f(xm, R.y1 - 2.4)], { size: 0.55 }));
  return out.join("");
}

// The guide rod: the plunger's arm slides on it so the rack can't turn, and the return spring is coiled round it.
export function guideLow() {
  return S(T.rodAB(L(GD.x, GD.y0, GD.d), L(GD.x, GD.y1, GD.d), GD.r, 14), { tone: "hi", crease: "none" });
}

// The plunger inside the case, with its rack and the spring arm, drawn at p = 0 and moved by the page.
export function plungerIn() {
  const out = [];
  const R = C.RACK;
  out.push(S(G.disc(-84, 84, C.ROD_R, upFrame(0, 0, PD), P), { tone: "hi", crease: "none" }));
  out.push(S(G.disc(-61.6, -58, C.ROD_R + 2, upFrame(0, 0, PD), P), { tone: "mid" }));
  out.push(S(T.boxL(R.x0, -C.ROD_R + 0.6, R.y0, R.y1, R.d0, R.d1), { tone: "mid" }));
  const f = T.pl(R.d1), pts = [f(R.x0, R.y1)];
  for (let y = R.y1; y > R.y0 + 0.6; y -= 1.25) pts.push(f(R.x0, y - 0.15), f(R.x0 - 0.9, y - 0.4), f(R.x0 - 0.9, y - 0.85), f(R.x0, y - 1.1));
  pts.push(f(R.x0, R.y0));
  out.push(`<path class="iso-fill" d="${T.path(pts, true)}"/><path class="iso-line iso-edge" data-tone="mid" d="${T.path(pts, true)}"/>`);
  out.push(Dt([f(R.x0 + 0.8, R.y1 - 3), f(R.x0 + 0.8, R.y0 + 3)], { size: 0.45 }));
  // The spring arm: clamped to the plunger, bored for the guide rod, and long enough for Roo to stand on.
  const A = C.ARM;
  out.push(S(T.boxL(A.x0, -C.ROD_R + 0.4, A.y, A.y + A.t, GD.d - 4, GD.d + 6), { tone: "mid", crease: "lo" }));
  out.push(Dt([T.pl(GD.d + 6)(-C.ROD_R - 2, A.y + A.t / 2)], { size: 0.5 }));
  out.push(S(G.disc(C.RAIL.d1, C.RAIL.d1 + 1.4, 1.2, dialFrame((C.RAIL.x0 + C.RAIL.x1) / 2, A.y + A.t / 2, 0), P), { tone: "hi" }));
  return out.join("");
}

// The middle bridge carries the centre arbor's back pivot in front of the plunger; cocks carry the front pivots.
export function bridge() {
  const out = [];
  const b = K.prismOf(K.frameOf(L(0, 0, -18.6), C.N, C.U, [0, 0, 1]), [[-3.4, -3.6], [62, -14], [65, -7], [3.6, 3.6], [-3.4, 3.4]], 0, 1.6, P);
  out.push(S(b, { tone: "mid" }), jewel(0, 0, -17), Dt([T.pl(-17)(58, -10)], { size: 0.55 }));
  return out.join("");
}

export function cocks() {
  const out = [];
  const [hx, hy] = C.HAIR.at, [cx, cy] = C.PINION;
  // Crown wheel's cock from the left of the case; hairspring wheel's from the upper right.
  out.push(S(K.prismOf(K.frameOf(L(0, 0, -12.4), C.N, C.U, [0, 0, 1]), [[cx - 3, cy - 3], [-64, cy - 9], [-64, cy - 1], [cx + 2.6, cy + 3]], 0, 1.4, P), { tone: "mid" }), jewel(cx, cy, -11));
  out.push(Dt([T.pl(-11)(-60, cy - 5)], { size: 0.55 }));
  out.push(S(K.prismOf(K.frameOf(L(0, 0, -3.2), C.N, C.U, [0, 0, 1]), [[hx - 2.2, hy - 1], [hx + 2.2, hy - 1], [hx + 4.6, 64], [hx - 1.6, 64]], 0, 1.4, P), { tone: "mid" }), jewel(hx, hy, -1.8));
  out.push(Dt([T.pl(-1.8)(hx + 1.5, 60)], { size: 0.55 }));
  return out.join("");
}

// The hairspring's stud: its outer end is pinned here, on a block screwed to the cock.
export const STUD = (() => { const [hx, hy] = C.HAIR.at, r = C.HAIR.spring[1] + 0.6; return [hx + r * Math.cos(0.6), hy + r * Math.sin(0.6)]; })();
export function stud() {
  const [x, y] = STUD;
  return S(T.boxL(x - 1.6, x + 1.6, y - 1.6, y + 1.6, C.HAIR.sd - 1, C.HAIR.sd + 1.6), { tone: "mid" });
}

// Mo's shelf, in front of the hairspring wheel, on a pillar from the back plate; Pinch's shelf low on the right.
export function shelves() {
  const out = [];
  const s = C.SHELF;
  out.push(S(T.boxL(s.x1 - 3, s.x1, s.y - 9, s.y - 1.6, -27, s.d0 + 2), { tone: "mid" }));
  out.push(S(T.boxL(s.x0, s.x1, s.y - 1.6, s.y, s.d0, s.d1), { tone: "mid", crease: "lo" }));
  out.push(Dt([T.pl(s.d1)(s.x0 + 1.4, s.y - 0.8), T.pl(s.d1)(s.x1 - 1.4, s.y - 0.8)], { size: 0.45 }));
  const q = C.LOCKSHELF;
  out.push(S(T.boxL(q.x1 - 3, q.x1, q.y - 9, q.y - 1.6, PL, q.d0 + 2), { tone: "mid" }));
  out.push(S(T.boxL(q.x0, q.x1, q.y - 1.6, q.y, q.d0, q.d1), { tone: "mid", crease: "lo" }));
  return out.join("");
}

// The bezel lock: a lever on a pivot screw; its shoe, at the case wall, presses the bezel's skirt.
export function lockPivot() {
  const [px, py] = C.LOCK.pivot;
  return S(G.disc(-27, C.LOCK.d - 1, 1.5, dialFrame(px, py, 0), P), { tone: "mid", crease: "none" });
}
void jewel;

// The lock lever, drawn at rest (clamped) and turned about its pivot by the page.
export function lockLever() {
  const L = C.LOCK, f = T.pl(L.d + 1.2);
  const [px, py] = L.pivot, [tx, ty] = L.tail, [sx, sy] = L.shoe;
  const lever = K.prismOf(K.frameOf(T.L(0, 0, L.d), C.N, C.U, [0, 0, 1]), [[tx - 1, ty - 1.6], [px, py - 2.4], [sx, sy - 1.6], [sx, sy + 1.6], [px, py + 2.4], [tx - 1, ty + 1.6]], 0, 1.2, P);
  return S(lever, { tone: "mid" }) + Dt([f(px, py)], { size: 0.6, tone: "hi" });
}

// The movement's frame: a shaped plate behind the train on four pillars, and the plunger's two bushings.
export function frame() {
  const out = [];
  const outline = [[-52, -44], [46, -44], [58, -30], [58, 30], [44, 46], [-40, 46], [-56, 30], [-56, -30]];
  out.push(S(K.prismOf(K.frameOf(T.L(0, 0, -29), C.N, C.U, [0, 0, 1]), outline, 0, 2, P), { tone: "mid" }));
  const f = T.pl(-27), slot = (x0, y0, x1, y1, r) => {
    const pts = [];
    for (const [cx, cy, a0] of [[x1 - r, y0 + r, -90], [x1 - r, y1 - r, 0], [x0 + r, y1 - r, 90], [x0 + r, y0 + r, 180]]) for (let i = 0; i <= 6; i++) { const a = ((a0 + i * 15) * Math.PI) / 180; pts.push(f(cx + r * Math.cos(a), cy + r * Math.sin(a))); }
    return T.path(pts, true);
  };
  // Lightening windows through the frame, and a stamped rim round its edge.
  const win = slot(26, 24, 48, 38, 4) + slot(-50, -38, -32, -22, 4) + slot(46, -22, 54, 14, 3) + slot(-52, -8, -44, 24, 3);
  out.push(`<path class="di-window" d="${win}"/>` + Ln(win, { tone: "lo" }));
  out.push(Ln(T.path(outline.map(([x, y]) => f(x * 0.94, y * 0.93)), true), { tone: "faint" }));
  for (const [x, y] of [[-46, -38], [50, -38], [50, 24], [-46, 38], [36, 40]]) out.push(S(G.disc(-27, -21, 2.2, dialFrame(x, y, 0), P), { tone: "mid", crease: "none" }), Ln(T.circle(x, y, 2.2, -21, 20), { tone: "lo" }), Dt([T.pl(-21)(x, y)], { size: 0.5 }));
  for (const y of [-70, 62]) out.push(S(T.boxL(-8, 8, y, y + 8, PD - 7, PD + 7), { tone: "mid" }), Dt([T.pl(PD + 7)(-5, y + 4), T.pl(PD + 7)(5, y + 4)], { size: 0.5 }));
  return out.join("");
}
