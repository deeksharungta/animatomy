import * as k from "../../kit/iso-kit.mjs";
import * as G from "../../kit/lathe.mjs";

export const WIDTH = 720;
export const HEIGHT = 560;

// A drawer lock on a locksmith's cutaway demonstrator. World units are millimetres.
// x runs along the plug's axis (the key goes in toward −x), y across the drawer (the cut is the plane y = 0 and
// everything sectioned keeps y < 0), z up; the plug's axis is the x axis. Drawer parts are drawn with the drawer shut.
export const C = {
  PLUG: { r: 6.5, x0: 2.5, x1: -33 },
  COLLAR: { r: 11, x0: 0, x1: 2.5 },
  HOUSING: { r: 8.5, half: 5, top: 24.5, x0: 0, x1: -33 },
  PINS: [-3.5, -8.5, -13.5, -18.5, -23.5],
  PIN_R: 1.5, BORE_R: 1.55, CHAMBER_TOP: 21, DRIVER: 5,
  REST: -0.4, TOL: 0.12, BIND: 1.5,
  KEY: { half: 1.1, bottom: -4, top: 3.4, len: 31, out: 40, bow: 11 },
  KEYWAY: { half: 1.15, bottom: -4.3, top: 3.7 },
  // Cut depths 0–6, 0.45 mm apart; the lock is pinned to key A. Key B differs at pin 3, cut three steps deeper.
  CUT: [3.0, 0.45],
  KEYS: [[3, 6, 2, 5, 1], [3, 6, 5, 5, 1]],
  CRANK: { r: 6, pin: 1.5, x0: -35.5, x1: -37.5, disc: 9.5, d0: -33, d1: -35.5 },
  LEVER: { px: -53.5, pz: -3.1, under: 1.4, front: 18, contact: 16, rear: 14, back: 15 },
  BOLT: { x0: -65, x1: -70, half: 8, bottom: -11, top: 41.5 },
  BOARD: { x0: -19, x1: 0, z0: -50, z1: 36, y0: -44 },
  CASE: { x0: -19, x1: -76, z0: -16, z1: 35, y0: -13 },
  DESK: { x0: -88, x1: 6, z0: 38, z1: 54, y0: -52 },
  POST: { x: -49, r: 1.6, z0: 1.2, z1: 33 },
  OPEN: 30,
  MOUSE: { size: 7, headings: [30, 100, 30, 120, 80], side: [1, -1, 1, -1, -1], hand: [0.42, 0.3, 0.42, 0.3, 0.3] },
  ROO: { size: 16, xi: 7, heading: 120, paw: [0.6, 1.2], hand: 7 },
  BENCH: { x: -112, y: -66, w: 196, d: 96, r: 4 },
  BENCH_Z: -78,
  BASE_Z: -70,
  WALL_TOP: 74,
};

// The model, shared by the build and the page: it uses only C.
export function model(C) {
  const R = C.PLUG.r, K = C.KEY;
  const cut = (d) => C.CUT[0] - C.CUT[1] * d;
  const uOf = C.PINS.map((x) => C.PLUG.x0 - x);
  // Key pins: each as long as the plug's radius above its cut on key A.
  const pinLen = C.KEYS[0].map((d) => R - cut(d));
  // The top edge of key `which` at u mm from the shoulder: V cuts with a 1.2 mm root and 50° flanks, a tip ramp.
  function edge(which, u) {
    if (u < 0 || u > K.len) return -Infinity;
    let h = Math.min(K.top, K.top - Math.max(0, u - (K.len - 3)) * 1.8);
    C.KEYS[which].forEach((d, i) => { h = Math.min(h, cut(d) + Math.max(0, Math.abs(u - uOf[i]) - 0.6) * 1.2); });
    return h;
  }
  // Where each key pin's tip sits: on the key edge under it, or on the bore's ledge with no key there.
  function pinsAt(which, kx) {
    return C.PINS.map((x) => {
      const u = kx - x;
      return Math.max(C.REST, edge(which, u - 0.5), edge(which, u), edge(which, u + 0.5));
    });
  }
  // A pin stack is clear when the gap between its key pin and driver sits on the shear line.
  const gaps = (bottoms) => bottoms.map((b, i) => b + pinLen[i] - R);
  const clear = (bottoms) => gaps(bottoms).every((g) => Math.abs(g) < C.TOL);
  const turnLimit = (bottoms) => (clear(bottoms) ? 90 : C.BIND);
  // The crank pin rises as the plug turns; it lifts the lever's front arm, whose rear arm pulls the bolt down.
  const crankTop = (deg) => -C.CRANK.r * Math.cos((deg * Math.PI) / 180) + C.CRANK.pin;
  function lever(deg) {
    const L = C.LEVER, lift = crankTop(deg) - crankTop(0);
    let phi = 0;
    for (let i = 0; i < 8; i++) phi = Math.atan((crankTop(deg) - L.pz + L.under / Math.cos(phi)) / L.contact);
    return lift <= 0 ? 0 : Math.max(0, phi);
  }
  const boltDrop = (deg) => C.LEVER.rear * Math.sin(lever(deg));
  const KEEP = C.DESK.z0 + 3.5 - C.BOLT.top;
  const inKeep = (deg) => C.BOLT.top - boltDrop(deg) > C.DESK.z0;
  return { cut, uOf, pinLen, edge, pinsAt, gaps, clear, turnLimit, crankTop, lever, boltDrop, inKeep, KEEP };
}
export const M = model(C);

// The camera frames the bench and both walls; the cut face (normal +y) faces the viewer.
const B = C.BENCH;
export const AZ = 60;
export const P = k.fitProjection(
  [...k.boxCorners(B, C.BENCH_Z - 10, C.BENCH_Z), [B.x, B.y, C.WALL_TOP], [B.x + B.w, B.y, C.WALL_TOP], [B.x, B.y + B.d, C.WALL_TOP]],
  WIDTH, HEIGHT, { pad: 6, azimuth: AZ },
);
export const K = { ...k, ...G };
export const at = (p) => k.iso(p, P);
export const S = (paths, style) => k.solidSvg(paths, style);
export const Ln = (d, style) => k.lineSvg(d, style);
export const Dt = (points, style) => k.dotsSvg(points, style);
