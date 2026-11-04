import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D, face, quad, cutFace } from "./model.mjs";
import { halfRev, halfTube, halfRing } from "./halfcut.mjs";

// The barrel's parts, cut at y = 0: the rear bushing, the silicone sleeve and its clamp, the aluminium heater block
// with its PTC stack and straps, and the brass nozzle with the anti-drip ball's seat.
const Z = C.ZC, B = C.BLOCK, N = C.NOZ, SL = C.SLEEVE;
const inner = (x0, x1, r) => S(halfRev([[x0, r], [x1, r]], { inner: true }), { tone: "lo", crease: "none" });

export const bushing = () => halfTube(-131, -128, C.REAR.ri, 11, { tone: "mid" }) + halfTube(-128, C.REAR.x1, C.REAR.ri, C.REAR.ro, { tone: "mid" });

// The silicone sleeve: a flange against the bulkhead, a body round the stick, a wider mouth over the block's spigot.
export function sleeve() {
  const out = [halfTube(SL.x0, SL.x0 + SL.flange, SL.ri, 11, { tone: "mid", strip: "gg-rubber" })];
  out.push(halfTube(SL.x0 + SL.flange, SL.front, SL.ri, SL.r, { tone: "mid", strip: "gg-rubber" }));
  out.push(halfTube(SL.front, SL.x1, B.rs, SL.rf, { tone: "mid", strip: "gg-rubber" }));
  out.push(halfTube(SL.front - 0.4, SL.front, SL.ri, SL.rf, { tone: "mid", inside: false }));
  out.splice(0, out.length, `<g class="gg-rubber">${out.join("")}</g>`);
  // The crimped clamp round its mouth, with the crimp's ear on top.
  out.push(halfTube(-28, -24, SL.rf, SL.rf + 0.8, { tone: "hi", inside: false }));
  out.push(S(k.slabOf({ x: -27.4, y: -3, w: 2.8, d: 3, r: 0.4 }, Z + SL.rf + 0.6, 2.2, P, 2, 0.3), { tone: "hi" }));
  return out.join("");
}

// The block's section: two pieces either side of the bore, which narrows to the nozzle's passage.
const half = (s) => [[-30, Z + s * 8], [-20, Z + s * 8], [-20, Z + s * B.h], [B.x1, Z + s * B.h], [B.x1, Z + s * B.thread], [18, Z + s * B.thread], [18, Z + s * B.pass], [17, Z + s * B.pass], [14, Z + s * B.bore], [-30, Z + s * B.bore]];
export function block() {
  const out = [inner(-30, 14, B.bore), inner(17, 18, B.pass)];
  out.push(S(halfRev([[-30, B.rs], [-20, B.rs]]), { tone: "mid", crease: "none" }));
  out.push(quad([[-20, 0, Z + B.h], [-20, -B.w, Z + B.h], [B.x1, -B.w, Z + B.h], [B.x1, 0, Z + B.h]], [0, 0, 1], "mid", "gg-alu"));
  const hole = [];
  for (let i = 0; i <= 16; i++) { const f = Math.PI / 2 + (i / 16) * Math.PI; hole.push([B.x1, B.thread * Math.cos(f), Z + B.thread * Math.sin(f)]); }
  out.push(quad([[B.x1, 0, Z + B.h], [B.x1, -B.w, Z + B.h], [B.x1, -B.w, Z - B.h], [B.x1, 0, Z - B.h], ...hole.reverse()], [1, 0, 0], "mid", "gg-alu"));
  out.push(cutFace(half(1), "mid", "gg-alu") + cutFace(half(-1), "mid", "gg-alu"));
  // Cast seam and the two screw holes that hold the clamp's top plate.
  out.push(Ln(k.segment([-20, -B.w / 2, Z + B.h], [B.x1, -B.w / 2, Z + B.h], P), { tone: "faint" }));
  out.push(Ln(k.ring(-14, -6, 1.3, Z + B.h, P, 14) + k.ring(20, -6, 1.3, Z + B.h, P, 14), { tone: "lo" }) + D([at([-14, -6, Z + B.h]), at([20, -6, Z + B.h])], { size: 0.45, tone: "lo" }));
  return out.join("");
}

// The PTC stack under the block: mica, the top electrode, two ceramic stones in their frame, the bottom electrode,
// mica again and the steel clamp plate, all held up by two spring-steel straps.
export const STACK = { mica: [Z - 12.5, Z - 12], top: [Z - 13.3, Z - 12.5], stone: [Z - 15.9, Z - 13.3], bot: [Z - 16.7, Z - 15.9], mica2: [Z - 17.2, Z - 16.7], plate: [Z - 18.6, Z - 17.2] };
export const STONES = [[-10, 0], [6, 16]];
export const TABS = { live: [-23, -2.6, STACK.top[0]], neutral: [-21, -5.4, STACK.bot[0]] };
const layer = (x0, x1, [z0, z1], tone, cls) => S(k.slabOf({ x: x0, y: -C.STACK.w, w: x1 - x0, d: C.STACK.w, r: 0.2 }, z0, z1 - z0, P, 1), { tone, crease: "none", className: cls });
export function stack() {
  const s = { ...C.STACK, ...STACK }, out = [];
  out.push(layer(s.x0 - 1, s.x1 + 1, s.plate, "mid") + layer(s.x0, s.x1, s.mica2, "hi"));
  out.push(layer(TABS.neutral[0], s.x1, s.bot, "hi", "gg-brass"));
  for (const [a, b] of [[s.x0, STONES[0][0]], [STONES[0][1], STONES[1][0]], [STONES[1][1], s.x1]]) out.push(layer(a, b, s.stone, "lo"));
  out.push(`<g data-part="stones">${STONES.map(([a, b]) => layer(a, b, s.stone, "mid", "gg-stone")).join("")}</g>`);
  out.push(layer(TABS.live[0], s.x1, s.top, "hi", "gg-brass") + layer(s.x0, s.x1, s.mica, "hi"));
  // The two straps: over the block's top, cut ends at the section, and under the clamp plate.
  for (const x of [-8, 10]) {
    out.push(quad([[x, 0, Z + B.h + 0.5], [x, -B.w - 0.5, Z + B.h + 0.5], [x + 4, -B.w - 0.5, Z + B.h + 0.5], [x + 4, 0, Z + B.h + 0.5]], [0, 0, 1], "hi"));
    out.push(cutFace([[x, Z + B.h], [x + 4, Z + B.h], [x + 4, Z + B.h + 0.5], [x, Z + B.h + 0.5]], "hi"));
    out.push(cutFace([[x, s.plate[0] - 0.5], [x + 4, s.plate[0] - 0.5], [x + 4, s.plate[0]], [x, s.plate[0]]], "hi"));
  }
  // Rivets where each lead is crimped to its electrode's tab.
  out.push(D([at([TABS.live[0] + 1.4, -1.6, s.top[1]]), at([TABS.neutral[0] + 1.4, -4.6, s.bot[1]])], { size: 0.55, tone: "lo" }));
  return out.join("");
}

// A ceramic post that carries the block's front off the floor.
export const post = (zf) => S(k.cylinder(20, -7.6, 2.6, zf, STACK.plate[0] - 0.5 - zf, P, 24), { tone: "hi" }) + Ln(k.sideArc(20, -7.6, 2.6, zf + 4, P, 16), { tone: "faint" });

// The nozzle: a threaded shank in the block, a hex flange, a cone to the tip; inside, the passage, the ball's
// chamber with its seat, and the orifice.
const NOUT = [[18, 5], [26, 5], [26, 8.5], [32, 8.5], [32, 6], [34, 6], [34, 6, 1], [43, 4.8, 1], [52, 3.2], [58, 2.2]];
const NIN = [[18, B.pass], [N.seat, B.pass], [N.seat, N.chamber], [N.step, N.chamber], [N.step, N.orifice], [58, N.orifice]];
export const glueR = (x) => (x < 14 ? B.bore : x < 17 ? B.bore + ((B.pass - B.bore) * (x - 14)) / 3 : x < N.seat ? B.pass : x < N.step ? N.chamber : N.orifice);
export function nozzle() {
  return `<g class="gg-brass">${nozzleParts()}</g>`;
}
function nozzleParts() {
  const out = [inner(N.seat, N.step, N.chamber), inner(18, N.seat, B.pass), inner(N.step, 58, N.orifice)];
  out.push(S(halfRev(NOUT.slice(2).map(([x, r]) => [x, r])), { tone: "hi", crease: "none", className: "gg-brass" }));
  const sec = (s) => [...NOUT.map(([x, r]) => [x, Z + s * r]), ...NIN.slice().reverse().map(([x, r]) => [x, Z + s * r])];
  out.push(cutFace(sec(1), "hi", "gg-brass") + cutFace(sec(-1), "hi", "gg-brass") + halfRing(58, N.orifice, 2.2, "hi", 16));
  // The thread's crests along the shank, and the hex's flats on the flange.
  const crest = [];
  for (let x = 18.6; x < 25.6; x += 1) for (const s of [1, -1]) crest.push(k.segment([x, 0, Z + s * 5], [x + 0.5, 0, Z + s * 4.3], P));
  out.push(Ln(crest.join(""), { tone: "lo" }));
  return out.join("");
}

// A section face whose closing edge (where it meets the copy behind the front face) carries no stroke.
const open = (pts) => {
  const d = k.pathOf(pts.map(([x, z]) => at([x, 0, z])), true), t = L.toneOf([0, 1, 0], P), sh = ["", "", "", ""];
  if (t < 4) sh[t] = d;
  return S({ fill: d, outline: k.pathOf(pts.map(([x, z]) => at([x, 0, z]))), crease: "", top: t === 4 ? d : "", shades: sh }, { tone: "hi", crease: "none" });
};
// The nozzle beyond the housing's front face, drawn again after it: the cone, its section and the tip.
export function nozzleOut() {
  const r36 = 6 + ((4.8 - 6) * 2) / 9, o = [[36, r36], [43, 4.8], [52, 3.2], [58, 2.2]], i = [[36, N.chamber], [N.step, N.chamber], [N.step, N.orifice], [58, N.orifice]];
  const sec = (s) => [...o.map(([x, r]) => [x, Z + s * r]), ...i.slice().reverse().map(([x, r]) => [x, Z + s * r])];
  return `<g class="gg-brass">${inner(36, N.step, N.chamber) + inner(N.step, 58, N.orifice) + S(halfRev(o), { tone: "hi", crease: "none" }) +
    open(sec(1)) + open(sec(-1)) + halfRing(58, N.orifice, 2.2, "hi", 16)}</g>`;
}
