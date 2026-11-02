import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D, DESK, ROOM_TOP } from "./model.mjs";
import { ringY } from "./helpers.mjs";

// The room: a panelled back wall with the mail slot the requests come through, a side wall with a clock.
export function room() {
  const out = [];
  const back = { x: -102, y: -90, w: 178, d: 6, r: 0.6 }, side = { x: -108, y: -90, w: 6, d: 156, r: 0.6 };
  out.push(S(k.slabOf(back, -19, ROOM_TOP + 19, P, 2), { tone: "mid", inner: Ln(k.sideSeam(back, 34, P, 2), { tone: "faint" }) }));
  const panels = [];
  for (let x = -90; x < 76; x += 14) if (Math.abs(x - 40) > 12) panels.push(k.segment([x, -84, -19], [x, -84, ROOM_TOP], P));
  out.push(Ln(panels.join(""), { tone: "faint" }));
  out.push(S(k.slabOf(side, -19, ROOM_TOP + 19, P, 2), { tone: "mid", inner: Ln(k.sideSeam(side, 34, P, 2), { tone: "faint" }) }));
  out.push(Ln([...Array.from({ length: 11 }, (_, i) => k.segment([-102, -78 + i * 14, -19], [-102, -78 + i * 14, ROOM_TOP], P))].join(""), { tone: "faint" }));
  // The mail slot: a frame on the wall, the slot, and a hinged flap over it.
  const { a } = C.CHUTE;
  out.push(S(k.slabOf({ x: a[0] - 11, y: -84, w: 22, d: 1.6, r: 0.6 }, a[2] - 6, 18, P, 3, 0.4), { tone: "hi" }));
  out.push(`<path class="tb-void" d="${ringY(-82.3, a[0] - 7.5, a[0] + 7.5, a[2] - 1, a[2] + 2.4, 0.8)}"/>`);
  out.push(Ln(ringY(-82.3, a[0] - 9.5, a[0] + 9.5, a[2] - 4.5, a[2] + 10.5, 1.2), { tone: "faint" }));
  out.push(S(L.prismOf(L.frameOf([a[0] - 8, -82.4, a[2] + 3.4], [1, 0, 0], [0, -0.26, -0.97], [0, 0.97, -0.26]), [[0, -0.5], [5, -0.5], [5, 0.5], [0, 0.5]], 0, 16, P), { tone: "hi" }));
  out.push(D([[a[0] - 9, -82.4, a[2] + 9.5], [a[0] + 9, -82.4, a[2] + 9.5], [a[0] - 9, -82.4, a[2] - 4], [a[0] + 9, -82.4, a[2] - 4]].map(at), { size: 0.5 }));
  // A wall clock on the side wall.
  const F = L.frameAlong([-102, -30, 96], [1, 0, 0]);
  out.push(S(L.disc(0, 3, 16, F, P), { tone: "hi" }));
  const ticks = [];
  for (let i = 0; i < 12; i++) {
    const t = (i / 12) * Math.PI * 2, r0 = i % 3 ? 12.6 : 11, c = Math.cos(t), s = Math.sin(t);
    ticks.push(k.segment([-99, -30 + r0 * c, 96 + r0 * s], [-99, -30 + 14 * c, 96 + 14 * s], P));
  }
  const rim = Array.from({ length: 64 }, (_, i) => at([-99, -30 + 14 * Math.cos((i / 64) * Math.PI * 2), 96 + 14 * Math.sin((i / 64) * Math.PI * 2)]));
  out.push(Ln(k.pathOf(rim, true), { tone: "faint" }) + Ln(ticks.join(""), { tone: "mid" }));
  out.push(Ln(k.segment([-98.8, -30, 96], [-98.8, -30 + 6, 96 + 5], P), { tone: "hi", free: "end" }) + Ln(k.segment([-98.8, -30, 96], [-98.8, -30 - 1, 96 + 10], P), { tone: "hi", free: "end" }));
  out.push(D([at([-98.6, -30, 96])], { size: 1, tone: "hi" }));
  return out.join("");
}

export function desk() {
  const grain = [];
  for (let y = DESK.y + 9; y < DESK.y + DESK.d - 8; y += 11) grain.push(k.lineOnTop([DESK.x, y], [DESK.x + DESK.w, y], -5, P));
  return S(k.slabOf(DESK, -19, 14, P, 6, 1.2), { tone: "mid" }) + Ln(grain.join(""), { tone: "faint" });
}

// A prop on the desk: a bundle of letters waiting to be sent.
export function propsFront() {
  const out = [];
  const env = { x: -92, y: 44, w: 20, d: 14, r: 0.6 };
  for (let i = 0; i < 4; i++) {
    const p = { ...env, x: env.x + (i % 2) * 1.2, y: env.y + i * 0.8 };
    const z = -5 + i * 1.3;
    out.push(S(k.slabOf(p, z, 1.2, P, 2), { tone: "hi" }));
  }
  const top = { ...env, x: env.x + 1.2, y: env.y + 2.4 }, z = -5 + 4 * 1.3 - 0.1;
  out.push(Ln(k.onTop([[top.x, top.y], [top.x + top.w / 2, top.y + top.d * 0.55], [top.x + top.w, top.y]], z, P), { tone: "faint" }));
  out.push(S(k.slabOf({ x: top.x + 1, y: top.y + top.d / 2 - 1.2, w: top.w - 2, d: 2.4, r: 0.4 }, z, 0.6, P, 2), { tone: "mid" }));
  return out.join("");
}
