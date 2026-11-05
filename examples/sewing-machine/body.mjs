// The machine's shell, its covers off: the pillar's back and end walls and the frame of its front (the motor's
// window), the arm's back wall, top cover and front frame (its cover off, so the shaft shows), and the head's walls
// with the face plate removed, the take-up lever's slot in its front, the stitch-length dial and the badge.
import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D } from "./model.mjs";

const BT = C.BT, TOP = C.TOP, H = C.HEAD;
const box = (x0, y0, z0, x1, y1, z1, tone = "mid", r = 0.6, inner = "") => S(k.slabOf({ x: x0, y: y0, w: x1 - x0, d: y1 - y0, r }, z0, z1 - z0, P, 2, 0.4), { tone, inner });
const screws = (pts, size = 0.55) => D(pts.map(at), { size });

// Behind the wheel: the pillar's back wall and its end wall, with the cord socket and its plug.
export function pillarBack() {
  const out = [];
  out.push(box(-166, -46, BT, -90, -42, 200));
  out.push(box(-166, -42, BT, -162, 26, 200));
  out.push(box(-162, -38, 70, -158, -24, 84, "hi", 1));
  // The wheel's mounting plate on the back wall, with four screws.
  out.push(box(-152, -42, 92, -122, -40, 140, "hi", 1) + screws([[-149, -40, 95], [-125, -40, 95], [-149, -40, 137], [-125, -40, 137]], 0.5));
  out.push(screws([[-158, -36, 82], [-158, -26, 72]], 0.5));
  return out.join("");
}

// The front frame round the motor's window: two posts, a sill and the plate the arm sits on.
export function pillarFront() {
  const out = [];
  out.push(box(-166, 22, BT, -158, 26, 200, "hi"));
  out.push(box(-158, 22, BT, -90, 26, BT + 8, "hi"));
  out.push(screws([[-162, 26, BT + 6], [-162, 26, 192], [-94, 26, BT + 4]]));
  // The reverse lever on the post, on its stud, and its return spring's anchor.
  out.push(S(L.prismOf(L.frameOf([-162, 26, 176], [0.45, 0, -0.89], [0, 1, 0], [0.89, 0, 0.45]), [[0, -1.6], [3, -1.6], [3, 1.6], [0, 1.6]], 0, 16, P), { tone: "mid", crease: "lo" }));
  out.push(S(L.disc(0, 3, 2.6, L.frameOf([-162, 26, 176], [0, 1, 0], [1, 0, 0], [0, 0, 1]), P), { tone: "hi" }));
  return out.join("");
}

// The arm's back wall and the pillar's top, behind the shaft.
export function upperBack() {
  const out = [];
  out.push(box(-166, -40, 200, H.x + 2, -36, TOP - 6));
  out.push(box(-166, -36, 200, -162, 20, TOP - 6));
  out.push(box(-90, -36, 200, H.x, 20, 204, "lo"));
  // Ribs cast inside the back wall, one each side of the middle bearing.
  for (const x of [-60, -20, 20]) out.push(box(x, -36, 204, x + 3, -30, TOP - 6, "mid", 0.3));
  return out.join("");
}

// The arm's front frame and top cover: oil holes, screws, a badge plate and the stitch-length dial.
export function upperFront() {
  const out = [], y1 = 20;
  out.push(box(-166, 16, 200, H.x, y1, 208, "hi"));
  out.push(box(-166, 16, 250, H.x, y1, TOP - 6, "hi"));
  out.push(box(-166, 16, 208, -146, y1, 250, "hi"));
  out.push(box(H.x - 8, 16, 208, H.x, y1, 250, "hi"));
  const top = { x: -168, y: -42, w: H.x + 168, d: 64, r: 4 };
  out.push(S(k.slabOf(top, TOP - 6, 6, P, 4, 1), { tone: "hi", inner: Ln(k.sideSeam(top, TOP - 3, P, 4), { tone: "faint" }) }));
  out.push(screws([[-160, -36], [-160, 16], [-96, -36], [-96, 16], [50, -36], [50, 16]].map(([x, y]) => [x, y, TOP])));
  for (const x of [-70, -10, 40]) out.push(`<path class="iso-halo" d="${k.ring(x, -6, 1.6, TOP, P, 16)}"/>` + Ln(k.ring(x, -6, 1.6, TOP, P, 16), { tone: "lo" }));
  // Badge plate on the top strip: a frame and three rules.
  const bx = -60, bz = 251;
  out.push(Ln(k.pathOf([[bx, y1, bz], [bx + 56, y1, bz], [bx + 56, y1, bz + 4], [bx, y1, bz + 4]].map(at), true), { tone: "lo" }));
  out.push(Ln(k.segment([bx + 4, y1, bz + 2], [bx + 40, y1, bz + 2], P), { tone: "lo", free: true }));
  // Stitch-length dial on the left post: a disc, 0–4 mm ticks and a pointer knob.
  const F = L.frameOf([-156, y1, 229], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  out.push(S(L.disc(0, 1, 8, F, P), { tone: "mid" }));
  const ticks = [];
  for (let i = 0; i <= 8; i++) { const a = Math.PI * (0.9 - (i / 8) * 0.8), r1 = i % 2 ? 6.4 : 5.4; ticks.push(k.pathOf([L.pointOf(F, 1, 7.6, a), L.pointOf(F, 1, r1, a)].map(at))); }
  out.push(Ln(ticks.join(""), { tone: "lo" }));
  const G = L.frameOf(L.pointOf(F, 1, 0, 0), [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  out.push(S(L.disc(0, 4, 3, G, P), { tone: "hi", inner: k.fadedSvg(L.ribsOf(G, 0, 4, 3, 16, P, { fade: [0.05, 0.4], seams: true }), { tone: "faint" }) }));
  out.push(Ln(k.pathOf([L.pointOf(G, 4, 0, 0), L.pointOf(G, 4, 2.8, Math.PI * 0.5)].map(at)), { tone: "lo" }));
  // The carry handle, folded flat on the top cover between its two pivot bosses.
  const z = TOP + 1.6, seg = (a, b) => { const d = L.sub3(b, a), n = L.len3(d); return S(L.prismOf(L.frameOf(a, L.unit3(d), [0, 0, 1], L.unit3(L.cross3([0, 0, 1], d))), [[-1.6, -2.2], [1.6, -2.2], [1.6, 2.2], [-1.6, 2.2]], 0, n, P), { tone: "hi", crease: "lo" }); };
  for (const x of [-110, -52]) out.push(S(L.disc(0, 6, 4, L.frameOf([x, -34, z], [0, 1, 0], [1, 0, 0], [0, 0, 1]), P), { tone: "mid" }));
  out.push(seg([-110, -28, z], [-110, 2, z]) + seg([-52, -28, z], [-52, 2, z]) + seg([-112.2, 4, z], [-49.8, 4, z]));
  return out.join("");
}

// The head's back wall and bottom plate (behind the crank, take-up lever and presser bar).
export function headBack() {
  const out = [];
  out.push(box(H.x, H.y, H.z0, H.x + H.w, H.y + 4, TOP - 6));
  out.push(box(H.x, H.y + 4, H.z0, H.x + H.w, H.y + H.d - 4, H.z0 + 4, "lo"));
  out.push(screws([[H.x + H.w, H.y + 6, H.z0 + 10], [H.x + H.w, H.y + 6, TOP - 14]]));
  // The lamp under the head's back: a housing, its bulb and the switch.
  const F = L.frameOf([H.x + 30, H.y + 14, H.z0], [0, 0, -1], [1, 0, 0], [0, 1, 0]);
  out.push(S(L.solidOf([[0, 9], [6, 9, 1], [8, 7]], F, P), { tone: "mid" }));
  out.push(S(L.sphereOf([H.x + 30, H.y + 14, H.z0 - 10], 5, P), { tone: "hi" }));
  return out.join("");
}

// The head's front wall, its top cover and the screws where the face plate came off.
export function headFront() {
  const out = [], y0 = H.y + H.d - 4, y1 = H.y + H.d, T = C.TAKE;
  out.push(box(H.x, y0, H.z0, H.x + H.w, y1, TOP - 6, "hi"));
  // The take-up lever's slot: a dark opening in the face the lever swings in.
  const slot = [[T.x - 2.6, 206], [T.x + 2.6, 206], [T.x + 2.6, 250], [T.x - 2.6, 250]].map(([x, z]) => at([x, y1, z]));
  out.push(`<path class="iso-halo" d="${k.pathOf(slot, true)}" style="opacity:.9"/>` + Ln(k.pathOf(slot, true), { tone: "lo" }));
  const top = { x: H.x, y: H.y, w: H.w, d: H.d, r: H.r };
  out.push(S(k.slabOf(top, TOP - 6, 6, P, 4, 1), { tone: "hi", inner: Ln(k.sideSeam(top, TOP - 3, P, 4), { tone: "faint" }) }));
  // The stitch chart on the head's top: a plate, three rows of stitches and two rivets.
  const sc = [[H.x + 12, H.y + 30], [H.x + 50, H.y + 30], [H.x + 50, H.y + 62], [H.x + 12, H.y + 62]];
  out.push(Ln(k.pathOf(sc.map(([x, y]) => at([x, y, TOP])), true), { tone: "lo" }));
  for (const [i, y] of [36, 44, 52].entries()) out.push(Ln(Array.from({ length: 5 - i }, (_, j) => k.lineOnTop([H.x + 17 + j * 6, H.y + y + (j % 2) * 2], [H.x + 21 + j * 6, H.y + y + ((j + 1) % 2) * 2], TOP, P)).join(""), { tone: "lo", free: true }));
  out.push(screws([[H.x + 14, H.y + 32, TOP], [H.x + 48, H.y + 60, TOP]], 0.5));
  out.push(screws([[H.x + H.w, y1 - 6, H.z0 + 10], [H.x + H.w, y1 - 6, TOP - 14], [H.x + 6, y1, H.z0 + 6], [H.x + 6, y1, TOP - 12]]));
  return out.join("");
}
