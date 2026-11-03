import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S_ as S, Ln, Dt, cordOf } from "./model.mjs";

// ---------------------------------------------------------------- the motor's power supply

// A bench supply with a tachometer: its needle reads the rotor's rpm from the motor's back-EMF, so it is
// drawn live from the same model (needleOf). Front face (+y): meter, speed knob, toggle, pilot lamp, posts.
export const BOX = { x: 28, y: -96, w: 44, d: 26, h: 28, feet: 1.6 };
const fy = BOX.y + BOX.d, z0 = BOX.feet;
export const METER = { x: BOX.x + 12, y: fy + 1, z: z0 + 15, r: 7.2, max: 3000 };
export function supply() {
  const out = [], b = BOX, pl = { x: b.x, y: b.y, w: b.w, d: b.d, r: 2 };
  out.push(`<path class="iso-halo" d="${k.haloOf(pl, 0, 0.1, P)}" style="filter:blur(3px)"/>`);
  for (const [x, y] of k.corners(pl, 3.4)) out.push(S(k.cylinder(x, y, 2.2, 0, z0, P, 20), { tone: "lo" }));
  out.push(S(k.slabOf(pl, z0, b.h, P, 3, 0.6), { tone: "mid", inner: Ln(k.sideSeam(pl, z0 + 3, P, 3), { tone: "faint" }) }));
  out.push(Ln(k.planOutline(k.insetPlan(pl, 3), z0 + b.h, P, 3), { tone: "faint" }));
  out.push(Dt(k.corners(pl, 1.6).map(([x, y]) => at([x, y, z0 + b.h])), { size: 0.45 }));
  // The carry handle on top: two feet and a round bar.
  const zt = z0 + b.h;
  for (const x of [b.x + 10, b.x + b.w - 10]) out.push(S(k.slabOf({ x: x - 1.6, y: b.y + 11, w: 3.2, d: 4, r: 0.6 }, zt, 4, P, 2), { tone: "hi" }));
  out.push(S(L.solidOf([[0, 1.1], [b.w - 17, 1.1]], L.frameAlong([b.x + 8.5, b.y + 13, zt + 4.6], [1, 0, 0]), P), { tone: "hi" }));
  // Vent slots and the rating plate on the side face (+x).
  const sx = b.x + b.w;
  for (let i = 0; i < 6; i++) { const y = b.y + 4 + i * 2.4; out.push(Ln(k.pathOf([at([sx, y, z0 + 8]), at([sx, y, z0 + 20]), at([sx, y + 1.1, z0 + 20]), at([sx, y + 1.1, z0 + 8])], true), { tone: "lo" })); }
  const rp = { x: sx, y: b.y + 19, w: 0.5, d: 5, r: 0.3 };
  out.push(S(k.slabOf(rp, z0 + 9, 9, P, 2), { tone: "hi" }));
  out.push(Ln([0, 1, 2].map((i) => k.pathOf([at([sx + 0.5, rp.y + 0.8, z0 + 16 - i * 2]), at([sx + 0.5, rp.y + (i ? 3.4 : 4.2), z0 + 16 - i * 2])])).join(""), { tone: "faint", free: true }));
  // The tachometer: a bezel, its dial with a tick every 250 rpm (longer every 1000) and a zero stop.
  const M = METER, mF = L.frameAlong([M.x, fy, M.z], [0, 1, 0]);
  out.push(S(L.solidOf([[0, M.r + 1.4], [0.6, M.r + 1.4, 1], [1, M.r + 0.8]], mF, P), { tone: "hi", inner: Ln(L.circleOf(mF, 1, M.r, P, 56), { tone: "lo" }) }));
  const ang = (v) => ((210 - (240 * v) / M.max) * Math.PI) / 180, mp = (r, a) => at([M.x + r * Math.cos(a), M.y, M.z + r * Math.sin(a)]);
  let minor = "", major = "";
  for (let v = 0; v <= M.max; v += 250) (v % 1000 ? (minor += k.pathOf([mp(M.r - 0.8, ang(v)), mp(M.r - 2, ang(v))])) : (major += k.pathOf([mp(M.r - 0.8, ang(v)), mp(M.r - 3, ang(v))])));
  out.push(Ln(minor, { tone: "faint" }), Ln(major, { tone: "lo" }));
  out.push(Dt([mp(M.r - 1.4, ang(-120)), mp(0, 0)], { size: 0.5, tone: "lo" }));
  // The speed knob, knurled, with its pointer, and two binding posts for the motor's leads.
  const kF = L.frameAlong([b.x + 29, fy, z0 + 19], [0, 1, 0]);
  out.push(S(L.disc(0, 3, 4.2, kF, P), { tone: "hi", inner: Ln(L.ribsOf(kF, 0, 3, 4.2, 32, P), { tone: "faint" }) }));
  out.push(Ln(k.segment([b.x + 29, fy + 3, z0 + 19], [b.x + 29 - 2.4, fy + 3, z0 + 22], P), { tone: "hi", free: "end" }), Dt([at([b.x + 29, fy + 3, z0 + 19])], { size: 0.6, tone: "lo" }));
  for (const x of [b.x + 25, b.x + 32]) {
    const pF = L.frameAlong([x, fy, z0 + 6], [0, 1, 0]);
    out.push(S(L.solidOf([[0, 1.8], [1.2, 1.8, 1], [1.6, 1.2], [3.2, 1.2]], pF, P), { tone: "mid" }), S(L.disc(3.2, 4.6, 1.7, pF, P), { tone: "hi", inner: Ln(L.ribsOf(pF, 3.2, 4.6, 1.7, 12, P), { tone: "faint" }) }));
  }
  return out.join("");
}

// The toggle (down is off) with its guard, and the pilot lamp, lit while the motor runs.
const TG = [BOX.x + 39, fy, z0 + 20];
export const toggle = (on) => S(L.solidOf([[0, 1.6], [1, 1.6]], L.frameAlong(TG, [0, 1, 0]), P), { tone: "mid" }) + S(L.solidOf([[0, 0.6], [4.6, 0.45], [5.2, 0.8, 1], [6, 0.5]], L.frameAlong([TG[0], TG[1] + 1, TG[2]], on ? [0, 0.6, 0.8] : [0, 0.6, -0.8]), P), { tone: "hi" });
export const lamp = (on) => S(L.disc(0, 1.4, 1.6, L.frameAlong([BOX.x + 39, fy, z0 + 7], [0, 1, 0]), P), { tone: "hi", lit: on });
// The tachometer's needle at an rpm, inlined into the page and drawn each frame.
export function needleOf(K, P, M, rpm) {
  const a = ((210 - (240 * Math.min(rpm, M.max)) / M.max) * Math.PI) / 180, p = (r, t) => K.iso([M.x + r * Math.cos(t), M.y + 0.2, M.z + r * Math.sin(t)], P);
  return K.lineSvg(K.pathOf([p(-1.6, a), p(M.r - 1.2, a)]), { tone: "lit", free: true }) + K.dotsSvg([p(0, 0)], { size: 0.9, tone: "hi" });
}

// The leads: from the posts down to the bench and into the plinth's gland; the mains cord to the wall socket.
export function cables() {
  const by = BOX.y + BOX.d, pl = C.PLINTH;
  const lead = [[BOX.x + 25, by + 4.6, z0 + 6], [BOX.x + 25, by + 8, 1.2], [BOX.x + 25, 6, 1.2], [pl.x + pl.w + 8, 18, 1.2], [pl.x + pl.w + 3.6, 18, 9.6]];
  const mains = [[BOX.x + BOX.w + 0.4, BOX.y + 6, 6], [BOX.x + BOX.w + 4, BOX.y + 6, 1.2], [BOX.x + BOX.w + 6, C.BENCH.y + 3, 1.2], [BOX.x + BOX.w + 6, C.BENCH.y + 3, 14.6]];
  return cordOf(lead, 1) + cordOf(mains, 1.1);
}
