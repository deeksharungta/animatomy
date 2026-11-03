import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D, DESK, ROOM_TOP } from "./model.mjs";

// The room: a panelled back wall with the round slot the balls come through, and a side wall with a clock.
export function room() {
  const out = [];
  const back = { x: -102, y: -90, w: 178, d: 6, r: 0.6 }, side = { x: -108, y: -90, w: 6, d: 156, r: 0.6 };
  out.push(S(k.slabOf(back, -19, ROOM_TOP + 19, P, 2), { tone: "mid", inner: Ln(k.sideSeam(back, 34, P, 2), { tone: "faint" }) }));
  const panels = [];
  for (let x = -90; x < 76; x += 14) panels.push(k.segment([x, -84, -19], [x, -84, ROOM_TOP], P));
  out.push(Ln(panels.join(""), { tone: "faint" }));
  out.push(S(k.slabOf(side, -19, ROOM_TOP + 19, P, 2), { tone: "mid", inner: Ln(k.sideSeam(side, 34, P, 2), { tone: "faint" }) }));
  out.push(Ln(Array.from({ length: 11 }, (_, i) => -78 + i * 14).map((y) => (Math.abs(y - C.RAIL.a[1]) < 11 ? k.segment([-102, y, -19], [-102, y, C.RAIL.a[2] - 8], P) + k.segment([-102, y, C.RAIL.a[2] + 12], [-102, y, ROOM_TOP], P) : k.segment([-102, y, -19], [-102, y, ROOM_TOP], P))).join(""), { tone: "faint" }));
  // The slot: a square plate on the side wall with a round mouth and a collar round it.
  const [, ay, az] = C.RAIL.a, X = [1, 0, 0];
  out.push(S(k.slabOf({ x: -102, y: ay - 10, w: 1.6, d: 20, r: 0.6 }, az - 8, 20, P, 3, 0.4), { tone: "hi" }));
  out.push(`<path class="db-void" d="${L.circleOf(L.frameAlong([-100.3, ay, az + 2.4], X), 0, 5.2, P)}"/>`);
  out.push(S(L.ringBand(0, 1.6, 5.2, 6.6, L.frameAlong([-100.4, ay, az + 2.4], X), P), { tone: "hi" }));
  out.push(D([[-100.4, ay - 8, az + 10], [-100.4, ay + 8, az + 10], [-100.4, ay - 8, az - 6], [-100.4, ay + 8, az - 6]].map(at), { size: 0.5 }));
  // A wall clock on the side wall.
  const F = L.frameAlong([-102, -40, 96], [1, 0, 0]);
  out.push(S(L.disc(0, 3, 16, F, P), { tone: "hi" }));
  const ticks = [];
  for (let i = 0; i < 12; i++) {
    const t = (i / 12) * Math.PI * 2, r0 = i % 3 ? 12.6 : 11, c = Math.cos(t), s = Math.sin(t);
    ticks.push(k.segment([-99, -40 + r0 * c, 96 + r0 * s], [-99, -40 + 14 * c, 96 + 14 * s], P));
  }
  const rim = Array.from({ length: 64 }, (_, i) => at([-99, -40 + 14 * Math.cos((i / 64) * Math.PI * 2), 96 + 14 * Math.sin((i / 64) * Math.PI * 2)]));
  out.push(Ln(k.pathOf(rim, true), { tone: "faint" }) + Ln(ticks.join(""), { tone: "mid" }));
  out.push(Ln(k.segment([-98.8, -40, 96], [-98.8, -34, 101], P), { tone: "hi", free: "end" }) + Ln(k.segment([-98.8, -40, 96], [-98.8, -41, 106], P), { tone: "hi", free: "end" }));
  out.push(D([at([-98.6, -40, 96])], { size: 1, tone: "hi" }));
  return out.join("");
}

export function desk() {
  const grain = [];
  for (let y = DESK.y + 9; y < DESK.y + DESK.d - 8; y += 11) grain.push(k.lineOnTop([DESK.x, y], [DESK.x + DESK.w, y], -5, P));
  return S(k.slabOf(DESK, -19, 14, P, 6, 1.2), { tone: "mid" }) + Ln(grain.join(""), { tone: "faint" });
}

// A keyboard on the desk: you type on it, and every key sends a ball.
export function keyboard() {
  const kb = { x: -94, y: -4, w: 24, d: 64, r: 2 }, z = -5, out = [`<path class="iso-halo" d="${k.haloOf(kb, z, 1, P)}"/>`];
  out.push(S(k.slabOf(kb, z, 3.4, P, 4, 0.6), { tone: "mid" }));
  const keys = [];
  for (let c = 0; c < 4; c++) for (let r = 0; r < 13; r++) if (c < 3 || r < 2 || r > 9) keys.push({ x: kb.x + 2.4 + c * 5, y: kb.y + 2.6 + r * 4.6, w: 4, d: 3.8, r: 0.6 });
  keys.push({ x: kb.x + 17.4, y: kb.y + 11.8, w: 4, d: 36.4, r: 0.6 });
  keys.sort((a, b) => k.depthOf([a.x, a.y, 0], P) - k.depthOf([b.x, b.y, 0], P));
  for (const key of keys) out.push(S(k.slabOf(key, z + 3.4, 1.3, P, 2, 0.3), { tone: "hi" }));
  return out.join("");
}
