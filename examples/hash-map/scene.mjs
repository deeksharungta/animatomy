// The room: a panelled back wall with the mail slot the letters come through, a side wall with a notice frame, the
// desk, and the props on it (a postal scale, a rubber stamp on its ink pad, a bundle of letters waiting).
import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D, DESK, WALL_TOP } from "./model.mjs";
import { box, ringY, ringX } from "./helpers.mjs";

export function room() {
  const out = [], back = { x: DESK.x - 6, y: DESK.y - 6, w: DESK.w + 6, d: 6, r: 0.6 }, side = { x: DESK.x - 12, y: DESK.y - 6, w: 6, d: DESK.d + 6, r: 0.6 };
  out.push(S(k.slabOf(back, -16, WALL_TOP + 16, P, 2), { tone: "mid", inner: Ln(k.sideSeam(back, 30, P, 2), { tone: "faint" }) }));
  const yb = DESK.y, panels = [];
  for (let x = DESK.x + 14; x < DESK.x + DESK.w; x += 16) if (Math.abs(x - C.CHUTE.a[0]) > 14) panels.push(k.segment([x, yb, 30], [x, yb, WALL_TOP], P));
  out.push(Ln(panels.join(""), { tone: "faint" }));
  out.push(S(k.slabOf(side, -16, WALL_TOP + 16, P, 2), { tone: "mid", inner: Ln(k.sideSeam(side, 30, P, 2), { tone: "faint" }) }));
  out.push(Ln(Array.from({ length: 6 }, (_, i) => k.segment([DESK.x - 6, DESK.y + 8 + i * 15, 30], [DESK.x - 6, DESK.y + 8 + i * 15, WALL_TOP], P)).join(""), { tone: "faint" }));
  // A picture rail round both walls, under the cornice.
  out.push(S(k.slabOf({ x: DESK.x - 6, y: DESK.y, w: DESK.w + 6, d: 1.2, r: 0.3 }, WALL_TOP - 14, 2.4, P, 2), { tone: "mid" }));
  out.push(S(k.slabOf({ x: DESK.x - 6, y: DESK.y, w: 1.2, d: DESK.d, r: 0.3 }, WALL_TOP - 14, 2.4, P, 2), { tone: "mid" }));
  // The mail slot: a brass frame on the wall, the slot, its hinged flap, four screws.
  const a = C.CHUTE.a;
  out.push(S(k.slabOf({ x: a[0] - 13, y: yb, w: 26, d: 1.6, r: 0.6 }, a[2] - 7, 20, P, 3, 0.4), { tone: "hi" }));
  out.push(`<path class="hm-void" d="${ringY(yb + 1.7, a[0] - 9.5, a[0] + 9.5, a[2] - 1, a[2] + 2.6, 0.8)}"/>`);
  out.push(Ln(ringY(yb + 1.7, a[0] - 11.5, a[0] + 11.5, a[2] - 5.5, a[2] + 11.5, 1.2), { tone: "faint" }));
  out.push(S(L.prismOf(L.frameOf([a[0] - 10, yb + 1.6, a[2] + 3.6], [1, 0, 0], [0, -0.26, -0.97], [0, 0.97, -0.26]), [[0, -0.5], [5, -0.5], [5, 0.5], [0, 0.5]], 0, 20, P), { tone: "hi" }));
  out.push(D([[a[0] - 11, a[2] + 11], [a[0] + 11, a[2] + 11], [a[0] - 11, a[2] - 5], [a[0] + 11, a[2] - 5]].map(([x, z]) => at([x, yb + 1.6, z])), { size: 0.5 }));
  // A framed collection-times notice on the side wall: a frame and its rows of rules.
  const xs = DESK.x - 6, f = { y0: 4, y1: 44, z0: 62, z1: 102 };
  out.push(S(k.slabOf({ x: xs, y: f.y0, w: 1.4, d: f.y1 - f.y0, r: 0.6 }, f.z0, f.z1 - f.z0, P, 2, 0.3), { tone: "hi" }));
  out.push(Ln(ringX(xs + 1.4, f.y0 + 3, f.y1 - 3, f.z0 + 3, f.z1 - 3, 0.8), { tone: "faint" }));
  const rules = [];
  for (let i = 0; i < 6; i++) { const z = f.z1 - 9 - i * 4.4; rules.push(k.segment([xs + 1.4, f.y0 + 6, z], [xs + 1.4, f.y0 + 6 + [24, 18, 22, 15, 20, 12][i], z], P)); }
  out.push(Ln(rules.join(""), { tone: "mid", free: true }));
  return out.join("");
}

export function desk() {
  const grain = [];
  for (let y = DESK.y + 10; y < DESK.y + DESK.d - 6; y += 12) grain.push(k.lineOnTop([DESK.x, y], [DESK.x + DESK.w, y], 0, P));
  return S(k.slabOf(DESK, -16, 16, P, 6, 1.2), { tone: "mid" }) + Ln(grain.join(""), { tone: "faint" });
}

// In front of the cabinet: a postal scale (base, column, pan, and a dial on its front with ticks and needle).
export function propsBack() {
  const out = [], b = { x: 66, y: 52, w: 13, d: 12, r: 1.2 }, cx = b.x + b.w / 2, cy = b.y + b.d / 2, yf = b.y + b.d;
  out.push(S(k.slabOf(b, 0, 9, P, 3, 0.6), { tone: "mid", inner: Ln(k.sideSeam(b, 2, P, 3), { tone: "faint" }) }) + S(k.cylinder(cx, cy, 1.4, 9, 6, P, 14), { tone: "mid" }));
  out.push(S(k.cylinder(cx, cy, 7, 15, 1.2, P, 40, 0.3), { tone: "hi" }) + Ln(k.ring(cx, cy, 5.4, 16.2, P, 40), { tone: "faint" }));
  const F = L.frameAlong([cx, yf, 4.8], [0, 1, 0]), ticks = [];
  out.push(S(L.disc(0, 0.6, 3.4, F, P), { tone: "hi" }));
  for (let i = 0; i < 9; i++) { const a = Math.PI * (0.15 + (0.7 * i) / 8), r0 = i % 4 ? 2.4 : 1.9; ticks.push(k.segment([cx - Math.cos(a) * r0, yf + 0.6, 4.8 + Math.sin(a) * r0], [cx - Math.cos(a) * 2.9, yf + 0.6, 4.8 + Math.sin(a) * 2.9], P)); }
  out.push(Ln(ticks.join(""), { tone: "mid", free: true }) + Ln(k.segment([cx, yf + 0.7, 4.8], [cx - 1.6, yf + 0.7, 6.6], P), { tone: "hi", free: "end" }) + D([at([cx, yf + 0.7, 4.8])], { size: 0.5, tone: "hi" }));
  return out.join("");
}

// In front: a bundle of letters tied with tape, and a rubber stamp beside its ink pad.
export function propsFront() {
  const out = [], env = { x: -22, y: 52, w: 16, d: 12, r: 0.6 };
  for (let i = 0; i < 4; i++) out.push(`<g class="hm-env">${S(k.slabOf({ ...env, x: env.x + (i % 2) * 1, y: env.y + i * 0.6 }, i * 1.3, 1.2, P, 2), { tone: "hi" })}</g>`);
  const top = { ...env, x: env.x + 1, y: env.y + 1.8 }, z = 4 * 1.3 - 0.1;
  out.push(Ln(k.onTop([[top.x, top.y], [top.x + top.w / 2, top.y + top.d * 0.45], [top.x + top.w, top.y]], z, P), { tone: "faint" }));
  out.push(S(k.slabOf({ x: top.x + top.w / 2 - 1.2, y: env.y - 0.4, w: 2.4, d: env.d + 2.4, r: 0.3 }, z, 0.5, P, 2), { tone: "mid" }));
  const pad = { x: 34, y: 53, w: 14, d: 10, r: 1 };
  out.push(S(k.slabOf(pad, 0, 2.4, P, 3, 0.4), { tone: "lo" }) + S(k.slabOf(k.insetPlan(pad, 1.4), 2.4, 0.4, P, 3), { tone: "mid" }));
  out.push(box(52, 55, 0, 9, 6, 3, "mid", 0.6) + S(k.cylinder(56.5, 58, 1.4, 3, 6, P, 14), { tone: "mid" }) + S(L.sphereOf([56.5, 58, 11], 3, P, { steps: 24 }), { tone: "hi" }));
  return out.join("");
}
