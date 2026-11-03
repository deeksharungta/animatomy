import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D } from "./model.mjs";
import { rod, ballRail, post, screws } from "./helpers.mjs";

const X = [1, 0, 0], Y = [0, 1, 0], Z = [0, 0, 1];
const disc = (c, axis, r, s0, s1, tone = "hi") => S(L.disc(s0, s1, r, L.frameAlong(c, axis), P), { tone, crease: "lo" });

// The base: a cast plate on four feet, with a maker's plate and a groove round its top.
export function base() {
  const B = C.BASE, out = [`<path class="iso-halo" d="${k.haloOf(B, -5, 6, P)}"/>`];
  for (const [x, y] of k.corners(B, 9).sort((a, b) => k.depthOf([...a, 0], P) - k.depthOf([...b, 0], P))) out.push(S(k.cylinder(x, y, 4.5, -5, 5, P, 24), { tone: "mid" }));
  out.push(S(k.slabOf(B, 0, C.FLOOR, P, 6, 1.2), { tone: "mid" }) + Ln(k.planOutline(k.insetPlan(B, 4), C.FLOOR, P, 6), { tone: "faint" }) + screws(B, C.FLOOR, 2));
  const lp = { x: 30, y: 18, w: 24, d: 10, r: 1 };
  out.push(S(k.slabOf(lp, C.FLOOR, 0.8, P, 3, 0.3), { tone: "hi" }) + screws(lp, C.FLOOR + 0.8, 1.6));
  out.push(Ln([21, 23.5, 26].map((y, i) => k.lineOnTop([lp.x + 4, y], [lp.x + 4 + [16, 12, 9][i], y], C.FLOOR + 0.8, P)).join(""), { tone: "mid", free: true }));
  // A spirit level on the base: the dashpot only keeps its time standing level.
  const lv = { x: -14, y: 17, w: 20, d: 6, r: 1.2 }, vz = C.FLOOR + 2.2;
  out.push(S(k.slabOf(lv, C.FLOOR, 2.2, P, 3, 0.4), { tone: "hi" }) + screws(lv, vz, 1.4));
  out.push(`<path class="db-void" d="${k.planOutline({ x: lv.x + 4, y: lv.y + 1.6, w: 12, d: 2.8, r: 1.4 }, vz, P, 4)}"/>`);
  out.push(Ln(k.planOutline({ x: lv.x + 9, y: lv.y + 2, w: 2.4, d: 2, r: 1 }, vz, P, 4), { tone: "mid" }) + Ln(k.lineOnTop([lv.x + 8.2, lv.y + 1.6], [lv.x + 8.2, lv.y + 4.4], vz, P) + k.lineOnTop([lv.x + 12.2, lv.y + 1.6], [lv.x + 12.2, lv.y + 4.4], vz, P), { tone: "lo" }));
  return out.join("");
}

// The ball rail from the wall slot down to the paddle, on a stand at its lower end.
export function rail() {
  const r = ballRail(C.RAIL.a, C.RAIL.b, 6, { ties: 4 });
  const b = C.RAIL.b;
  return { back: post(b[0] - 7, b[1], C.FLOOR, b[2] + 3, 2.6) + r.back, front: r.front };
}

// The rock shaft in three pedestals, and the paddle's rest stop.
export function shaft() {
  const out = [];
  for (const x of [-53, -32, -12]) {
    out.push(S(k.slabOf({ x: x - 2, y: -3.5, w: 4, d: 7, r: 0.5 }, C.FLOOR, C.RS.z - C.FLOOR, P, 2), { tone: "mid" }) + S(k.slabOf({ x: x - 3.5, y: -5, w: 7, d: 10, r: 0.6 }, C.FLOOR, 1.4, P, 2), { tone: "mid" }));
    out.push(disc([x, C.RS.y, C.RS.z], X, 3.6, -2, 2, "mid") + D([at([x - 2, 3.3, C.FLOOR + 1.4]), at([x + 2, -3.3, C.FLOOR + 1.4])], { size: 0.4 }));
  }
  out.push(S(rod([-56, C.RS.y, C.RS.z], X, 1.3, 0, 46), { tone: "hi" }));
  out.push(post(C.PAD_X, 10.6, C.FLOOR, 13.4, 2.2) + disc([C.PAD_X, 10.6, 13.4], Z, 1.8, 0, 0.8, "lo"));
  return out.join("");
}

// The dashpot: a cast foot, a glass cylinder of oil between two caps on four tie rods, and the rod's gland.
const TIES = [45, 135, 225, 315].map((d) => [C.DP[0] + 10.6 * Math.cos((d * Math.PI) / 180), C.DP[1] + 10.6 * Math.sin((d * Math.PI) / 180)]);
const tie = (front) => TIES.filter(([x, y]) => (x - C.DP[0] + y - C.DP[1] > 0) === front)
  .map(([x, y]) => S(k.cylinder(x, y, 0.8, C.Z_BOT, C.Z_TOP - C.Z_BOT, P, 12), { tone: "hi" })).join("");
export function dashpotBack() {
  const [x, y] = C.DP, foot = { x: x - 12, y: y - 12, w: 24, d: 24, r: 2 };
  return S(k.slabOf(foot, C.FLOOR, 8, P, 4, 0.6), { tone: "mid", inner: Ln(k.sideSeam(foot, C.FLOOR + 3, P, 4), { tone: "faint" }) }) + screws(foot, C.FLOOR + 8, 2)
    + S(k.cylinder(x, y, C.CAP_R, C.FLOOR + 8, C.Z_BOT - C.FLOOR - 8, P, 56, 0.5), { tone: "hi" }) + tie(false)
    + disc([x, y + 12, C.FLOOR + 4.5], Y, 1.1, 0, 1.6, "mid") + disc([x, y + 13.6, C.FLOOR + 4.5], Y, 2.2, 0, 2.2) + Ln(L.ribsOf(L.frameAlong([x, y + 13.6, C.FLOOR + 4.5], Y), 0, 2.2, 2.22, 14, P, { seams: true }), { tone: "mid" })
    + `<g class="db-oil">${S(k.cylinder(x, y, C.GLASS_R - 0.4, C.Z_BOT, C.OIL - C.Z_BOT, P, 48), { tone: "lo", crease: "none" })}</g>`;
}
export function dashpotFront() {
  const [x, y] = C.DP;
  return `<g class="db-glass">${S(k.cylinder(x, y, C.GLASS_R, C.Z_BOT, C.Z_TOP - C.Z_BOT, P, 48), { tone: "hi", crease: "none" })}</g>`
    + Ln(k.sideArc(x, y, C.GLASS_R, C.OIL, P), { tone: "mid" }) + tie(true)
    + S(k.cylinder(x, y, C.CAP_R, C.Z_TOP, 4, P, 56, 0.5), { tone: "hi" }) + D(TIES.map(([tx, ty]) => at([tx, ty, C.Z_TOP + 4])), { size: 0.7, tone: "hi" })
    + S(k.cylinder(x, y, 4, C.Z_TOP + 4, 4, P, 32, 0.4), { tone: "hi" }) + Ln(k.ring(x, y, 2.4, C.Z_TOP + 8, P, 24), { tone: "mid" });
}

// The pushrod, drawn at rest and lifted by the page, and the two guide eyes it slides in.
export function pushrod() {
  const [x, y] = C.PUSH, z0 = C.ZC0 - C.PUSH_L;
  return S(k.cylinder(x, y, 1.1, z0 + 1, C.PUSH_L - 1, P, 14), { tone: "hi" }) + S(k.cylinder(x, y, 2, z0, 1.2, P, 20), { tone: "mid" }) + S(k.cylinder(x, y, 2.2, C.ZC0 - 1.2, 1.2, P, 20), { tone: "mid" });
}
export function guides() {
  const [x, y] = C.PUSH, out = [];
  for (const z of [C.Z_BOT - 2.2, C.Z_TOP + 1]) {
    out.push(S(k.slabOf({ x: x + 1.6, y: y - 1.3, w: 3.6, d: 2.6, r: 0.3 }, z, 2.2, P, 2), { tone: "mid" }));
    out.push(S(L.ringBand(0, 2.2, 1.2, 2.6, L.frameAlong([x, y, z], Z), P), { tone: "hi" }));
  }
  return out.join("");
}

// The crosshead, drawn at the bottom of its travel and moved by the page: beam, rod clamp, Mo's grab bar, trip rod.
export function crossheadBack() {
  const B = C.BEAM, z = C.ZC0, out = [];
  out.push(S(k.slabOf({ x: B.x0, y: B.y - 2, w: B.x1 - B.x0, d: 4, r: 0.8 }, z, B.h, P, 3, 0.4), { tone: "hi", inner: Ln(k.sideSeam({ x: B.x0, y: B.y - 2, w: B.x1 - B.x0, d: 4, r: 0.8 }, z + 1.5, P, 3), { tone: "faint" }) }));
  out.push(S(k.cylinder(C.DP[0], C.DP[1], 3, z - 1, B.h + 2, P, 24, 0.3), { tone: "hi" }) + D([at([C.DP[0], C.DP[1], z + B.h + 1])], { size: 0.8, tone: "hi" }));
  out.push(D([-28, -10, 8, 18].map((x2) => at([x2, B.y + 2, z + 1.5])), { size: 0.4 }));
  const [mx] = C.MO_BAR;
  out.push(S(k.slabOf({ x: mx - 1.5, y: B.y + 2, w: 3, d: 8, r: 0.4 }, z, B.h, P, 2), { tone: "hi" }));
  out.push(S(rod([mx - 5, -10, z + 1.5], X, 1, 0, 10), { tone: "hi" }) + disc([mx - 5.2, -10, z + 1.5], X, 1.6, 0, 1) + disc([mx + 4.2, -10, z + 1.5], X, 1.6, 0, 1));
  const [tx, ty] = C.TRIP;
  out.push(S(k.slabOf({ x: tx - 2, y: B.y + 2, w: 4, d: ty - B.y, r: 0.5 }, z, B.h, P, 2), { tone: "hi" }));
  out.push(S(k.cylinder(tx, ty, 1, z - C.FOOT_F + 1.4, C.FOOT_F - 1.4, P, 14), { tone: "hi" }) + S(k.cylinder(tx, ty, 1.8, z - C.FOOT_F, 1.4, P, 20), { tone: "hi" }));
  out.push(S(k.cylinder(tx, ty, 2.3, z - C.COLLAR_K - 2.4, 2.4, P, 20, 0.3), { tone: "mid" }) + D([at([tx + 1.6, ty + 1.6, z - C.COLLAR_K - 1.2])], { size: 0.4 }));
  return out.join("");
}
export const crossheadFront = () => S(k.slabOf({ x: 12.4, y: C.BEAM.y + 2, w: 1.6, d: 9.6, r: 0.3 }, C.ZC0 + 1, 1, P, 2), { tone: "hi" })
  + S(L.prismOf(L.frameOf([12.4, -8.5, C.ZC0 + 1.5], Y, X, Z), [[0, -0.5], [-3, 0], [0, 0.5]], -0.5, 0.5, P), { tone: "hi", lit: true });

// The ruler: a strip on its post, ticked every 20 ms up to the wait, with a long tick every 100 ms.
export function ruler() {
  const [x, y] = C.RULER, strip = { x: x - 1.6, y: y + 1.2, w: 3.2, d: 0.8, r: 0.2 }, z0 = C.ZC0 - 1, z1 = C.ZC0 + C.TRAVEL + 4;
  const ticks = [];
  for (let m = 0; m <= 300; m += 20) { const z = C.ZC0 + 1.5 + (C.TRAVEL * m) / 300, len = m % 100 ? 1.2 : 2.2; ticks.push(k.segment([x - 1.6, y + 2, z], [x - 1.6 + len, y + 2, z], P)); }
  return post(x, y, C.FLOOR, z1 + 2, 2.4) + S(k.slabOf(strip, z0, z1 - z0, P, 2), { tone: "hi" }) + Ln(ticks.join(""), { tone: "mid" })
    + S(k.slabOf({ x: x + 1.2, y: C.TRIP[1] - 1.2, w: C.TRIP[0] - x - 2.6, d: 2.4, r: 0.4 }, 59, 1.6, P, 2), { tone: "mid" });
}
export const tripEye = () => S(L.ringBand(0, 2.4, 1.1, 2.4, L.frameAlong([C.TRIP[0], C.TRIP[1], 58.6], Z), P), { tone: "hi" });

// The hammer's post and pin, the bell on its stud, the sear's stud and Knock's perch.
export function bellSide() {
  const [hx, hy, hz] = C.HP, [bx, by, bz] = C.BELL, out = [];
  out.push(post(hx, -26, C.FLOOR, hz + 3, 3) + S(rod([hx, -27.5, hz], Y, 1, 0, hy + 29.5), { tone: "hi" }));
  out.push(post(bx, by, C.FLOOR, bz, 1.6, "hi"));
  return out.join("");
}
export function bell() {
  const [bx, by, bz] = C.BELL, F = L.frameAlong([bx, by, bz], Z), R = C.BELL_R;
  return S(L.lathe([[0, R], [0.6, R - 0.25, 1], [1.8, R - 1.4, 1], [3.8, R - 2.8, 1], [6.6, R - 3.5, 1], [9.4, R - 3.7, 1], [11.6, R - 4.4, 1], [12.9, R - 5.7, 1], [13.4, 1.3]], F, P), { tone: "hi" })
    + Ln(k.sideArc(bx, by, R - 1.7, bz + 2.4, P), { tone: "faint" }) + S(k.cylinder(bx, by, 1.4, bz + 13.4, 1.8, P, 6), { tone: "mid" }) + D([at([bx, by, bz + 15.2])], { size: 0.6, tone: "hi" });
}
export const searStud = () => post(C.SEAR.x, C.SEAR.y + 3.5, C.FLOOR, C.SEAR.z + 1.4, 1.6) + S(rod([C.SEAR.x, C.SEAR.y + 1.5, C.SEAR.z], Y, 0.8, 0, 2), { tone: "hi" });
export const perch = (p) => post(p[0], p[1], C.FLOOR, p[2] - 1.2, 1.4) + S(k.slabOf({ x: p[0] - 3.5, y: p[1] - 3, w: 7, d: 6, r: 0.6 }, p[2] - 1.2, 1.2, P, 2, 0.3), { tone: "hi" });
