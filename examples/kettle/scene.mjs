import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { P, W, S, Ln, D, DESK, ROOM_TOP, atW } from "./model.mjs";
import { tubePieces, tubeSvg } from "../../kit/tube.mjs";

// The kitchen around the kettle: two tiled walls with a socket, the worktop, a tea tin, a mug and a spoon,
// all in the kit's tones.
const WX = -110, WY = -110;
export function room() {
  const out = [];
  out.push(S(k.slabOf({ x: WX, y: WY, w: 212, d: 6, r: 0.6 }, -20, ROOM_TOP + 20, P, 2), { tone: "mid" }));
  const back = [];
  for (let x = WX + 22; x < 102; x += 18) back.push(k.segment([x, WY + 6, -2], [x, WY + 6, ROOM_TOP], P));
  for (let z = 16; z < ROOM_TOP; z += 18) back.push(k.segment([WX + 6, WY + 6, z], [102, WY + 6, z], P));
  back.push(k.segment([102, WY + 6, -20], [102, WY + 6, ROOM_TOP], P));
  out.push(Ln(back.join(""), { tone: "faint" }));
  out.push(S(k.slabOf({ x: WX, y: WY, w: 6, d: 212, r: 0.6 }, -20, ROOM_TOP + 20, P, 2), { tone: "mid" }));
  const side = [];
  for (let y = WY + 22; y < 102; y += 18) side.push(k.segment([WX + 6, y, -2], [WX + 6, y, ROOM_TOP], P));
  for (let z = 16; z < ROOM_TOP; z += 18) side.push(k.segment([WX + 6, WY + 6, z], [WX + 6, 102, z], P));
  side.push(k.segment([WX + 6, 102, -20], [WX + 6, 102, ROOM_TOP], P));
  out.push(Ln(side.join(""), { tone: "faint" }));
  // The socket on the side wall, with its switch and the plug in it.
  const sk = { x: WX + 6, y: -64, w: 3, d: 24, r: 1 };
  out.push(S(k.slabOf(sk, 26, 24, P, 3, 0.4), { tone: "hi" }));
  out.push(S(k.slabOf({ x: WX + 9, y: -60, w: 2.4, d: 5, r: 0.6 }, 34, 9, P, 2), { tone: "mid" }));
  out.push(S(k.slabOf({ x: WX + 9, y: -52, w: 8, d: 10, r: 1.2 }, 31, 14, P, 3, 0.4), { tone: "hi" }));
  out.push(D([[WX + 9, -62.5, 28.5], [WX + 9, -42.5, 47.5]].map((p) => k.iso(p, P)), { size: 0.5, tone: "lo" }));
  return out.join("");
}

export function desk() {
  const grain = [];
  for (let y = DESK.y + 14; y < DESK.y + DESK.d - 10; y += 14) grain.push(k.lineOnTop([DESK.x, y], [DESK.x + DESK.w, y], -2, P));
  return S(k.slabOf(DESK, -20, 18, P, 6, 1.2), { tone: "mid" }) + Ln(grain.join(""), { tone: "faint" }) + Ln(k.sideSeam(DESK, -14, P, 6), { tone: "faint" });
}

// The power cord: from the plug, down the wall, across the worktop, into the back of the base.
export function cord() {
  const route = [[WX + 13, -47, 31], [WX + 13, -47, 3], [WX + 18, -47, -0.4], [-80, -47, -0.4], ...[W([-14, -58, -0.4]), W([-14, -59, 3.5])].map(([x, y, z]) => [x, y, z])];
  const pieces = tubePieces(L.fillet(route, 4, 8), 1.4, P, { maxLength: 400, spacing: 1.2, caps: [false, true] });
  return pieces.map((p) => tubeSvg(p, { tone: "mid" })).join("");
}

// Back on the worktop: a tea tin. In front: a mug waiting with a tea bag's tag over its rim, and a spoon.
export function propsBack() {
  const out = [];
  const [tx, ty] = [56, -82];
  out.push(S(k.cylinder(tx, ty, 14, -2, 30, P, 48, 0.6), { tone: "hi" }));
  out.push(S(k.cylinder(tx, ty, 14.6, 28, 6, P, 48, 0.6), { tone: "hi" }));
  out.push(S(k.cylinder(tx, ty, 4, 34, 1.4, P, 24, 0.3), { tone: "mid" }));
  out.push(Ln(k.sideArc(tx, ty, 14, 8, P, 40) + k.sideArc(tx, ty, 14, 22, P, 40), { tone: "faint" }));
  return out.join("");
}

export function propsFront() {
  const out = [];
  const [mx, my] = [62, 50];
  out.push(`<path class="iso-halo" d="${k.ring(mx, my, 15, -2, P, 40)}"/>`);
  out.push(S(L.solidOf([[0, 9], [1.2, 11, 1], [26, 12, 1], [28, 12.2]], L.frameAlong([mx, my, -2], [0, 0, 1]), P), { tone: "hi", crease: "none" }));
  out.push(`<path class="kt-void" d="${k.ring(mx, my, 10.8, 26, P, 48)}"/>`);
  out.push(tubePieces(L.fillet([[mx - 11.4, my + 4, 21], [mx - 18, my + 6, 19], [mx - 18, my + 6, 9], [mx - 11.6, my + 4, 7]], 3, 8), 1.6, P, { maxLength: 400, spacing: 1.2, caps: false }).map((p) => tubeSvg(p, { tone: "hi" })).join(""));
  // The tea bag's string over the rim and its paper tag hanging down the near side.
  out.push(k.wireSvg(k.iso([mx + 5, my + 1, 26], P), k.iso([mx + 12.9, my + 1.5, 20], P), { via: [[mx + 12.3, my + 1.5, 28.4]].map((p) => k.iso(p, P)), tone: "lo", size: 0.6, ends: "from" }));
  out.push(S(k.slabOf({ x: mx + 12.4, y: my - 2, w: 0.8, d: 7, r: 0.2 }, 13, 7, P, 2), { tone: "hi" }));
  // A teaspoon lying on the worktop.
  out.push(S(L.prismOf(L.frameOf([mx - 34, my + 22, -2], [0, 0, 1], [0.8, -0.6, 0], [0.6, 0.8, 0]), [[-14, -0.9], [0, -0.9], [0, 0.9], [-14, 0.9]], 0, 0.8, P), { tone: "hi" }));
  out.push(S(k.extrude(Array.from({ length: 20 }, (_, i) => { const t = (i / 20) * Math.PI * 2; return [mx - 34 + 4.2 * Math.cos(t) * 0.8 + 2.6 * Math.sin(t) * 0.6 + 3.4 * 0.8, my + 22 - 4.2 * Math.cos(t) * 0.6 + 2.6 * Math.sin(t) * 0.8 - 3.4 * 0.6]; }), -2, 1.4, P), { tone: "hi" }));
  void atW;
  return out.join("");
}
