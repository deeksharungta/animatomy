import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { ellipsoidOf } from "../../kit/critters.mjs";

// A token bucket rate limiter as a token dispenser: capacity 5, one token every 2 s, one token per request.
export const WIDTH = 640;
export const HEIGHT = 560;

export const C = {
  CAP: 5, PERIOD: 2, FIRST: 1.2, START: 5, END: 16,
  REQ: [3.0, 4.6, 5.1, 5.6, 6.1, 6.6, 7.1, 7.6],
  TR: 7, TH: 3.6, ZB: 30, ROD_R: 8.6, ROD_TOP: 47,
  BED: { x: -24, y: -13, w: 38, d: 26, r: 1 },
  SLIDE: { x0: -31, x1: 9, y: 10, stroke: 24 },
  KNOB_Y: 11, HANDLE: 8,
  DECK: { x: -72, y: 13.5, w: 70, d: 11, r: 1.5 }, DECK_Z: 22,
  F: [0, -36], DISC_R: 20, POCKET_R: 11, PLATE: { x: -56, y: -62, w: 78, d: 48, r: 1.5 }, PLATE_Z: 62,
  HOLE: [0, -25], HOP: { x: -10, y: -58, w: 20, d: 18, r: 1 }, HOP_Z: 72, HOP_TOP: 92,
  SHAFT: { y: -36, z: 73.5, x0: -35, x1: -17 }, PIN_R: 3.5, CRANK: { x: -33, r: 5 }, KNOB_X: -36.5,
  FEED: { a: [0, -25, 60.5], b: [0, -9.6, 48.4] },
  OVER: { a: [0, 9.6, 48.4], b: [0, 28, 21] },
  SPILL: { x: -8, y: 28, w: 16, d: 14, r: 1 }, BOX_Z: 6, BOX_H: 9,
  PV: [36, -4, 18], FLAP: { u0: -10, u1: 14, x0: 31.4, x1: 50 }, ARM: { x0: 16.6, x1: 31.4, u0: -3.8, u1: 11 }, TILT: 0.26,
  CUP: [24, 4],
  CHUTE: { a: [40, -84, 68], b: [40, -9, 27], w: 13 },
  CASH: { x: 12, y: 13.5, w: 20, d: 20, r: 1 },
  SERVED: { x: 33, y: 16, w: 18, d: 20, r: 1 },
  REFUSED: { x: 33, y: -38, w: 26, d: 21, r: 1 },
  ENV: { l: 14, w: 10, t: 1 },
  FLOOR: 6, PIP_AT: [5, 15], MO_AT: [-42, -30, 66], MO_HEADING: 20,
};

export const PIP = { species: "squirrel", name: "Pip", size: 28, role: "moving" };
export const MO = { species: "sloth", name: "Mo", size: 26, role: "sensing", wear: ["glasses"] };
export const ROLE = { moving: "#46A758", sensing: "#3E9BDB" };

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
export const K = { ...k, ...L, ellipsoidOf };

// Every decision in time order: each feeder token goes in or spills, each request takes a token or is refused.
export function eventsOf(C) {
  const list = [];
  for (let td = C.FIRST; td < C.END + 2; td += C.PERIOD) list.push({ kind: "feed", t: td + 0.6, td });
  for (const tr of C.REQ) list.push({ kind: "req", t: tr + 0.05, tr });
  list.sort((a, b) => a.t - b.t);
  let n = C.START, spill = 0, cash = 0, served = 0, refused = 0;
  for (const e of list) {
    if (e.kind === "feed") { e.in = n < C.CAP; if (e.in) n++; else e.slot = spill++; }
    else { e.ok = n > 0; if (e.ok) { n--; e.slot = cash++; e.tray = served++; } else e.tray = refused++; }
    e.after = n;
  }
  return list;
}

// The whole machine at model time t, from the decisions alone.
export function stateAt(C, E, t) {
  const cl = (v) => Math.max(0, Math.min(1, v));
  const ease = (v) => { const x = cl(v); return x * x * (3 - 2 * x); };
  const lerp = (a, b, s) => a.map((v, i) => v + (b[i] - v) * s);
  const out = { t, fly: [], cupTok: [], pocket: null, env: [], spill: 0, cash: 0, served: 0, refused: 0, passed: 0, denied: 0, n: C.START };
  let lift = 0, stroke = 0, flap = 0, pushV = 0, inFlight = 0;
  for (const e of E) {
    if (e.t <= t) { out.n = e.after; if (e.kind === "req") e.ok ? out.passed++ : out.denied++; }
    if (e.kind === "feed") {
      const s = t - e.td;
      if (s < 0) continue;
      const A = C.FEED.a, B = C.FEED.b;
      if (s < 0.15) out.fly.push({ slot: "feed", p: [A[0], A[1], A[2] + 5 * (1 - s / 0.15)], n: [0, 0, 1] });
      else if (s < 0.6) out.fly.push({ slot: "feed", p: lerp(A, B, ((s - 0.15) / 0.45) ** 2), n: [0, 0.6, 0.8] });
      else if (e.in && s < 0.8) { inFlight++; out.fly.push({ slot: "in", p: [0, lerp([B[1]], [0], ease((s - 0.6) / 0.12))[0], B[2] - 0.6], drop: (s - 0.6) / 0.2, n: [0, 0, 1] }); }
      else if (!e.in && s < 0.85) out.fly.push({ slot: "over", p: lerp([B[0], B[1], B[2] - 0.4], C.OVER.a, (s - 0.6) / 0.25), n: [0, 0, 1] });
      else if (!e.in && s < 1.25) out.fly.push({ slot: "over", p: lerp(C.OVER.a, C.OVER.b, ((s - 0.85) / 0.4) ** 1.5), n: [0, -0.81, 0.58] });
      else if (!e.in && s < 1.45) out.fly.push({ slot: "over", p: lerp(C.OVER.b, [C.SPILL.x + 8 + (e.slot % 2 ? 2 : -2), C.SPILL.y + 7, C.BOX_Z + 1.2 + Math.floor(e.slot / 2) * C.TH], ease((s - 1.25) / 0.2)), n: [0, 0, 1] });
      else if (!e.in) out.spill++;
    } else {
      const s = t - e.tr;
      if (s < 0) continue;
      const st = s < 0.05 ? 0 : s < 0.25 ? ease((s - 0.05) / 0.2) : s < 0.3 ? 1 : s < 0.5 ? 1 - ease((s - 0.3) / 0.2) : 0;
      if (s < 0.5) { stroke = Math.max(stroke, st); pushV = s < 0.3 ? 1 : -1; }
      if (e.ok && s >= 0.05 && s < 0.48) lift = s < 0.42 ? 1 : 1 - (s - 0.42) / 0.06;
      if (e.ok) {
        if (s >= 0.05 && s < 0.25) out.pocket = { x: C.SLIDE.stroke * st };
        else if (s >= 0.25 && s < 0.5) out.cupTok.push({ fall: ease((s - 0.25) / 0.25) });
        else if (s >= 0.5 && s < 0.95) out.cupTok.push({ fall: 1 });
        else if (s >= 0.95 && s < 1.15) out.cupTok.push({ fall: 1, out: ease((s - 0.95) / 0.2) });
        else if (s >= 1.15) out.cash++;
        const f = s < 0.5 ? 0 : s < 0.6 ? ease((s - 0.5) / 0.1) : s < 0.95 ? 1 : 1 - ease((s - 0.95) / 0.15);
        flap = Math.max(flap, f);
      }
      // The envelope: down the chute, onto the flap, off its front (served) or back (refused) end.
      if (s < 0.75) out.env.push({ seg: "chute", u: (s / 0.75) ** 2 });
      else if (s < 1.05) out.env.push({ seg: e.ok ? "served" : "refused", u: ease((s - 0.75) / 0.3), i: e.tray });
      else if (e.ok) out.served++; else out.refused++;
    }
  }
  out.stack = out.n - inFlight;
  out.lift = lift * C.TH;
  out.stroke = stroke * C.SLIDE.stroke;
  out.flap = flap;
  out.tilt = C.TILT * (1 - 2 * flap);
  out.crank = Math.PI * t;
  out.disc = 0.2 * Math.PI + (Math.PI * t) / 4;
  out.duty = t <= 0 ? "" : stroke > 0.01 ? "pip" : "mo";
  out.pushV = stroke > 0.01 ? pushV : 0;
  return out;
}
