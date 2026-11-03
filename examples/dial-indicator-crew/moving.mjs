import { C, M, P, K } from "./model.mjs";
import { tools } from "./tools.mjs";

// ---------------------------------------------------------------- what moves (shared by build and page)

// Where block i sits at slide share s: from its home in the row in front, straight back along its lane to the
// plunger's line, then sideways under the plunger. Returns the world offset from its home.
export function blockAt(C, i, s) {
  const lane = (i - 2) * C.LANE, e = (x) => x * x * (3 - 2 * x);
  const back = Math.min(1, s * 2), side = Math.max(0, s * 2 - 1);
  const n = -C.HOME * e(back), u = -lane * e(side);
  return [n * C.N[0] + u * C.U[0], n * C.N[1] + u * C.U[1], 0];
}
export const blockHome = (C, i) => { const lane = (i - 2) * C.LANE; return [C.HOME * C.N[0] + lane * C.U[0], C.HOME * C.N[1] + lane * C.U[1], 0]; };

export function dynamic(K, P, C, M, S, T) {
  const out = {};
  const p = S.p, up = 2 * p;
  out.lift = K.translateAlong(P, [0, 0, up]);
  out.needle = T.turnAbout(0, 0, C.NEEDLE.d, M.needle(p));
  out.centre = T.turnAbout(0, 0, -7, M.needle(p));
  out.crown = T.turnAbout(C.PINION[0], C.PINION[1], C.CROWN.d + 0.5, M.crown(p));
  out.pinion = T.turnAbout(C.PINION[0], C.PINION[1], C.RACK.d1, M.crown(p));
  const [hx, hy] = C.HAIR.at, w = M.hair(p);
  out.hair = T.turnAbout(hx, hy, C.HAIR.d + 0.5, w);
  out.collet = T.turnAbout(hx, hy, C.HAIR.sd, w);
  out.scale = T.turnAbout(0, 0, C.SCALE.d, -S.b * Math.PI * 2);
  out.lock = T.turnAbout(C.LOCK.pivot[0], C.LOCK.pivot[1], C.LOCK.d, (1 - S.grip) * 0.09);
  // The hairspring: its outer end pinned at the stud, its inner end in the collet, wound by the wheel's turn.
  const [r0, r1] = C.HAIR.spring, turns = 6 - 0.6 / (Math.PI * 2);
  out.spring = T.spiral(hx, hy, r0, r1, turns, C.HAIR.sd + 0.4, w, 0);
  // The guide rod above the arm and the return spring round it, from the arm's top to the top bracket.
  const G = C.GUIDE, top = C.ARM.y + C.ARM.t + up;
  out.armTop = top;
  out.rodUp = K.solidSvg(T.rodAB(T.L(G.x, top, G.d), T.L(G.x, G.y1, G.d), G.r, 14), { tone: "hi", crease: "none" });
  const a = T.L(G.x, 0, G.d), z0 = C.O[2] + top + 0.4, z1 = C.O[2] + G.y1 - 0.4, h = T.helix(a[0], a[1], z0, z1, 3.6, 7);
  const ends = [T.at([a[0] + 3.6, a[1], z0]), T.at([a[0] + 3.6, a[1], z1])];
  out.coilBack = K.lineSvg(h.back, { tone: "mid" });
  out.coilFront = K.lineSvg(h.front, { tone: "hi" }) + K.dotsSvg(ends, { size: 0.7, tone: "hi" });
  out.blocks = C.BLOCKS.map((_, i) => K.translateAlong(P, blockAt(C, i, S.s[i])));
  return out;
}

// Crew poses, from the same state that moves the parts.
export function poses(C, M, S, T) {
  const G = C.GUIDE, up = 2 * S.p, top = C.ARM.y + C.ARM.t + up;
  const headU = (Math.atan2(C.U[1], C.U[0]) * 180) / Math.PI;
  // Roo stands on the spring arm and braces on the fixed guide rail: his legs are the return spring.
  const strain = Math.max(0, Math.min(1, S.p / 9));
  const hand = top + C.ROO_HAND, R = C.RAIL;
  const roo = {
    at: T.L(C.ROO_X, top, C.ROO_D),
    heading: headU + C.ROO_HEAD,
    lean: 4 + 8 * strain,
    squash: 0.12 + 0.3 * strain,
    look: [0, 6],
    paws: { l: T.L(R.x1, hand + 1, R.d1 + 0.4), r: T.L(R.x1, hand - 1, R.d1 + 0.4) },
    eyes: S.roo > 0.05 ? "wide" : S.p > 2 ? "open" : "happy",
    tailSway: -0.3,
  };
  // Mo stands on his shelf and holds the hairspring's collet pin: he is the spring's steady pull.
  const [hx, hy] = C.HAIR.at, w = M.hair(S.p), rp = C.HAIR.spring[0] - 0.8;
  const pin = [hx + rp * Math.cos(w), hy + rp * Math.sin(w)];
  const mo = {
    at: T.L(C.MO_AT[0], C.SHELF.y, C.MO_AT[1]),
    heading: headU + C.MO_HEAD,
    lean: 6,
    look: [0, 14],
    paws: { l: T.L(pin[0], pin[1] + 0.5, C.HAIR.sd + 3), r: T.L(pin[0] + 0.4, pin[1] - 0.6, C.HAIR.sd + 3) },
    eyes: S.mo > 0.05 ? "open" : S.idle > 3 ? "shut" : "open",
  };
  // Pinch is the bezel lock's spring: he pinches the lever's tail; letting go frees the bezel.
  const L = C.LOCK, open = 1 - S.grip;
  const tl = [L.tail[0], L.tail[1] - open * 1.8];
  const pinch = {
    at: T.L(C.PINCH_AT[0], C.LOCKSHELF.y, C.PINCH_AT[1]),
    heading: headU + C.PINCH_HEAD,
    paws: { l: T.L(tl[0] - 1.2, tl[1] + 0.9 + open * 2.4, L.d + 1.2), r: T.L(tl[0] + 1.2, tl[1] - 0.9 - open * 1.2, L.d + 1.2) },
    eyes: S.pinch > 0.05 ? "wide" : "open",
  };
  return { roo, mo, pinch };
}

export const REST = { p: C.PRELOAD, b: 0.27, bT: 0.27, grip: 1, gripT: 1, s: C.BLOCKS.map((_, i) => (i === 0 ? 1 : 0)), under: 0, want: 0, zero: 0, ref: 0, roo: 0, mo: 0, pinch: 0, idle: 0, t: 0, stepT: 0, duty: "" };
export const T0 = tools(K, P, { O: C.O, U: C.U, N: C.N });
export const dyn0 = dynamic(K, P, C, M, REST, T0);
export const pose0 = poses(C, M, REST, T0);
