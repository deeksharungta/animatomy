import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";

// A debounce timer as a dashpot doorbell: every key drops a ball that resets the timer; the bell rings 300 ms after the last one.
export const WIDTH = 640;
export const HEIGHT = 560;

const RS = { y: 0, z: 22 }, A = 0.5, LIFT_L = 20, ZC0 = 80;
export const C = {
  FLOOR: 6, BASE: { x: -64, y: -40, w: 124, d: 74, r: 3 },
  RS: { ...RS, x0: -58, x1: 2 }, A, LIFT_L, PAD_L: 12, LIFT_X: -18, PAD_X: -46,
  PUSH: [-18, -17.6], PUSH_L: ZC0 - (RS.z - LIFT_L * Math.sin(A) + 1.2), TRAVEL: 2 * LIFT_L * Math.sin(A),
  DP: [-4, -20], GLASS_R: 9, CAP_R: 12, Z_BOT: 18, Z_TOP: 62, OIL: 57, ROD: 46, PISTON_H: 4,
  ZC0, BEAM: { x0: -34, x1: 27, y: -20, h: 3 }, MO_BAR: [-31, -20], RULER: [10, -11],
  TRIP: [24, -8], COLLAR_K: 56.5, FOOT_F: 66,
  HP: [32, -4, 40], TAIL: 8, STEM: 18, COCK: 0.45, PIN_AT: 7, CATCH_Y: -21, HEAD_R: 2.4,
  BELL: [39.8, -9.2, 21], BELL_R: 7.6,
  SEAR: { x: 21, y: -8, py: -23, z: 14.3, left: 3, arm: 3, right: 9, plat: 6.5 },
  RAIL: { a: [-100, 8.5, 72], b: [-51, 8.5, 29.5] }, BALL_R: 3.6, BIN: { x: -58, y: 17, w: 24, d: 15, r: 1 },
  PERCH: [18, 0, 10],
  WAIT: 0.3, ROLL: 0.23, KEYS: [0.25, 0.38, 0.5, 0.63, 0.74, 1.5], END: 2.6,
};

export const MO = { species: "sloth", name: "Mo", size: 20, role: "sensing", wear: ["glasses"] };
export const PINCH = { species: "crab", name: "Pinch", size: 16, role: "holding" };
export const KNOCK = { species: "woodpecker", name: "Knock", size: 17, role: "spring" };
export const ROLE = { sensing: "#3E9BDB", holding: "#E5484D", spring: "#E93D82" };

export const DESK = { x: -96, y: -84, w: 172, d: 150, r: 6 };
export const ROOM_TOP = 126;
export const P = k.fitProjection(
  [...k.boxCorners(DESK, -19, -5), [-102, -90, ROOM_TOP], [76, -90, ROOM_TOP], [-102, 60, ROOM_TOP]],
  WIDTH, HEIGHT, { pad: 14, azimuth: 45 },
);
export const at = (p) => k.iso(p, P);
export const S = (paths, style) => k.solidSvg(paths, style);
export const Ln = (d, style) => k.lineSvg(d, style);
export const D = (points, style) => k.dotsSvg(points, style);
export const K = { ...k, ...L };

// Where each key's ball is at its landing, release and firing: the timer restarts at every release.
export function eventsOf(C) {
  const keys = C.KEYS.map((t, i) => ({ i, land: t, release: t + 0.06 }));
  const fires = [];
  keys.forEach((e, i) => { const next = keys[i + 1]; const due = e.release + C.WAIT; if (!next || next.release > due) fires.push({ at: due, after: i }); else e.cut = next.release - e.release; });
  return { keys, fires };
}

// The whole machine at model time t, from the key times alone.
export function stateAt(C, E, t) {
  const cl = (v) => Math.max(0, Math.min(1, v));
  const ease = (v) => { const x = cl(v); return x * x * (3 - 2 * x); };
  let q = 0, zc = 0, lastRel = -1, keys = 0, rings = 0, fired = null, cocked = false, cockAt = -1;
  const balls = [];
  for (const e of E.keys) {
    const s = t - e.land;
    if (s >= -C.ROLL && s < 0) balls.push({ seg: "rail", u: ((s + C.ROLL) / C.ROLL) ** 2 });
    if (s < 0) continue;
    keys++;
    const qe = s < 0.03 ? ease(s / 0.03) : s < 0.06 ? 1 : 1 - ease((s - 0.06) / 0.06);
    q = Math.max(q, qe);
    if (s < 0.1) balls.push({ seg: "cup", u: s < 0.04 ? 0 : (s - 0.04) / 0.06 });
    else if (s < 0.24) balls.push({ seg: "spill", u: ease((s - 0.1) / 0.14), i: keys - 1 });
    if (s >= 0.03) { lastRel = e.release; if (cockAt < 0 || cockAt < e.land) cockAt = e.land + 0.025; }
  }
  const pile = balls.filter((b) => b.seg === "spill").length;
  const binned = keys - balls.filter((b) => b.seg !== "rail").length;
  for (const f of E.fires) if (t >= f.at) { rings++; fired = f; }
  // The crosshead: pushed up by the rod while the shaft is rocked, then sinking at a steady rate through the oil.
  const push = C.TRAVEL * (Math.sin(-C.A + 2 * C.A * q) + Math.sin(C.A)) / (2 * Math.sin(C.A));
  const sink = lastRel < 0 ? 0 : C.TRAVEL * cl(1 - (t - lastRel) / C.WAIT);
  zc = Math.max(push, Math.min(C.TRAVEL, sink));
  if (t < (E.keys[0].land + 0.03)) zc = push;
  const left = lastRel < 0 ? 0 : C.WAIT * cl(1 - (t - lastRel) / C.WAIT);
  // The hammer: cocked by the collar near the top, held by Pinch, released when the foot presses the sear.
  const lastFire = fired ? fired.at : -1;
  cocked = cockAt > 0 && t >= cockAt && cockAt > lastFire;
  const collar = Math.asin(cl((C.ZC0 + zc - C.COLLAR_K + 0.8 - C.HP[2]) / C.TAIL));
  const sf = lastFire < 0 ? 9 : t - lastFire;
  const swing = sf < 0.025 ? C.COCK * (1 - ease(sf / 0.025)) : sf < 0.07 ? -0.05 * Math.sin(((sf - 0.025) / 0.045) * Math.PI) : 0;
  const ham = cocked ? Math.max(C.COCK, collar) : Math.max(collar, swing);
  const press = cl((1.5 - zc) / 1.5);
  const ring = sf < 0.6 ? Math.exp(-sf * 7) : 0;
  const moving = q > 0.001 || (lastRel > 0 && t - lastRel < C.WAIT && t >= lastRel);
  const duty = (cocked && zc < 1.5) || sf < 0.01 ? "pinch" : sf < 0.09 ? "knock" : moving ? "mo" : "";
  return { t, q, zc, left, keys: binned, landed: keys, rings, ham, press, ring, cocked, balls, pile, duty, sinceFire: sf };
}
