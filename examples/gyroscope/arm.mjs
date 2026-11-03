import { forkOf } from "./fork.mjs";
import { rotorOf } from "./rotor.mjs";

// ---------------------------------------------------------------- what moves (shared by build and page)

// Everything on the swivel, rebuilt from the model's angles: the fork turns with the swing ph, the arm also
// tips by th on the trunnion. Each item comes back with a depth key (planar, larger is nearer) so the page
// can sort the swivel's parts and the crew back to front. The page inlines forkOf and rotorOf beside this.
export function dynamic(K, P, C, S) {
  const cam = K.cameraOf(P), V = [cam.cosA * cam.cosE, cam.sinA * cam.cosE, cam.sinE];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const add = (...vs) => [0, 1, 2].map((i) => vs.reduce((t, v) => t + v[i], 0));
  const mul = (v, s) => [v[0] * s, v[1] * s, v[2] * s];
  const ct = Math.cos(S.th), st = Math.sin(S.th), cp = Math.cos(S.ph), sp = Math.sin(S.ph);
  const dirH = [cp, sp, 0], side = [-sp, cp, 0], dir = [ct * cp, ct * sp, st], up = [-st * cp, -st * sp, ct];
  const O = [0, 0, C.PIVOT_Z];
  const arm = (s, a = 0, h = 0) => add(O, mul(dir, s), mul(side, a), mul(up, h));
  const key = (p) => K.depthOf([p[0], p[1], 0], P);
  const solid = (paths, style) => K.solidSvg(paths, style);
  const line = (d, style) => K.lineSvg(d, style);
  const out = { items: {}, dir, side, up, dirH, arm, O };
  const item = (name, p, svg) => { out.items[name] = { key: key(p), svg }; };
  const facing = dot(side, V) > 0 ? 1 : -1;
  const X = { V, dot, add, mul, dirH, side, dir, up, O, arm, solid, line, item, facing };
  forkOf(K, P, C, S, X);

  // The trunnion block, with the terminal post Volta's tail lies on, and the two halves of the arm bar out of it.
  const Fb = K.frameOf(O, dir, side, up);
  const B = C.BAR, hw = B.w / 2, hh = B.h / 2, F = C.FORK;
  const bar = [[-hw, -hh + 0.4], [-hw + 0.4, -hh], [hw - 0.4, -hh], [hw, -hh + 0.4], [hw, hh - 0.4], [hw - 0.4, hh], [-hw + 0.4, hh], [-hw, hh - 0.4]];
  const Fk = K.frameOf(O, side, dir, up);
  let bk = solid(K.prismOf(Fk, [[-5, -4], [5, -4], [5, 4], [-5, 4]], -F.cheek + 1.6, F.cheek - 1.6, P), { tone: "hi" });
  bk += K.dotsSvg([K.iso(arm(-2.6, 0, 4), P), K.iso(arm(2.6, 0, 4), P)], { size: 0.5, tone: "lo" });
  bk += solid(K.solidOf([[0, 1.4], [1.6, 1.4, 1], [2, 1]], K.frameAlong(arm(-3.4, -2.6, 4), up), P), { tone: "mid" });
  item("block", O, bk);
  // The rotor half: bar, a scale every 10 mm on whichever face you see, the graduated rail Mo climbs.
  let r = solid(K.prismOf(Fb, bar, 5, B.to, P), { tone: "mid", crease: "faint" });
  let minor = "", major = "";
  for (let s = 10; s <= 70; s += 5) {
    const big = s % 10 === 0, a = facing * hw;
    (big ? (major += K.segment(arm(s, a, hh), arm(s, a, hh - 2.6), P)) : (minor += K.segment(arm(s, a, hh), arm(s, a, hh - 1.4), P)));
  }
  r += line(minor, { tone: "faint" }) + line(major, { tone: "lo" });
  const R = C.RAIL, rz = -hh - R.drop;
  for (const s of [R.from - 1.5, R.to + 1.5]) r += solid(K.prismOf(Fb, [[-1, rz], [1, rz], [1, -hh], [-1, -hh]], s - 0.8, s + 0.8, P), { tone: "mid" });
  r += solid(K.solidOf([[0, R.r], [R.to - R.from + 3, R.r]], K.frameAlong(arm(R.from - 1.5, 0, rz), dir), P), { tone: "hi", crease: "none" });
  // Stop collars on the rail at Mo's two stations, each with its set screw.
  for (const s of [C.MO.near - 5, C.MO.far + 4]) r += solid(K.disc(s - 0.7, s + 0.7, 1.6, K.frameAlong(arm(0, 0, rz), dir), P), { tone: "mid" }) + K.dotsSvg([K.iso(arm(s, 0, rz + 1.6), P)], { size: 0.35, tone: "lo" });
  item("barR", arm(B.to / 2), r);
  // The counterweight half: bar, end nut, and the latch lug Pinch grips: a strap down to a cross pin.
  let c = solid(K.prismOf(Fb, bar, B.from, -5, P), { tone: "mid", crease: "faint" });
  let cm = "";
  for (let s = -10; s >= -40; s -= 5) cm += K.segment(arm(s, facing * hw, hh), arm(s, facing * hw, hh - (s % 10 ? 1.4 : 2.6)), P);
  c += line(cm, { tone: "faint" });
  c += solid(K.solidOf([[0, 3.6], [2.4, 3.6]], K.frameAlong(arm(B.from), mul(dir, -1)), P), { tone: "hi" });
  const Lg = C.LUG, lz = -hh - Lg.drop;
  c += solid(K.prismOf(Fb, [[-0.7, lz], [0.7, lz], [0.7, -hh], [-0.7, -hh]], Lg.s - 1.4, Lg.s + 1.4, P), { tone: "mid" });
  c += K.dotsSvg([K.iso(arm(Lg.s, facing * 0.7, -hh - 2), P)], { size: 0.45, tone: "lo" });
  item("barC", arm(B.from / 2), c);
  // The lug's cross pin is its own item, so the page can draw it just behind Pinch's claws.
  const pF = K.frameAlong(arm(Lg.s - 3.6, 0, lz), dir);
  item("pin", arm(Lg.s, 0, lz), solid(K.solidOf([[0, 1], [0.3, 1.3, 1], [0.9, 1.3, 1], [1.2, 0.8], [6, 0.8], [6.3, 1.3, 1], [6.9, 1.3, 1], [7.2, 1]], pF, P), { tone: "hi" }));
  const W = C.CW, cwF = K.frameAlong(arm(W.at + W.len / 2), mul(dir, -1));
  let w = solid(K.solidOf([[0, W.r - 1], [0.8, W.r, 1], [W.len - 0.8, W.r, 1], [W.len, W.r - 1]], cwF, P), { tone: "mid" });
  // A knurled band to grip it by, and a knurled thumb screw that clamps it on the bar.
  w += K.fadedSvg(K.ribsOf(cwF, 4, W.len - 4, W.r, 72, P, { fade: [0.04, 0.42], seams: true }), { tone: "faint" });
  const ts = arm(W.at, 0, W.r - 0.4);
  w += solid(K.solidOf([[0, 1.2], [2.4, 1.2]], K.frameAlong(ts, up), P), { tone: "hi" }) + solid(K.disc(2.4, 4.4, 2.6, K.frameAlong(ts, up), P), { tone: "hi", inner: line(K.ribsOf(K.frameAlong(ts, up), 2.4, 4.4, 2.6, 16, P), { tone: "faint" }) });
  item("cw", arm(W.at), w);
  rotorOf(K, P, C, S, X);
  out.terminal = arm(73, 0, 9.6);
  out.tail = arm(-3.4, -2.6, 6);
  out.facing = facing;
  return out;
}
