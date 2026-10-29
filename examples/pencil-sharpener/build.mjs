import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { critter, critterSvg, crewCss, ellipsoidOf } from "../../kit/critters.mjs";
import { kitScript, crewScript, stepsScript } from "../../scripts/inline-kit.mjs";
import { STEPS_CSS, stepsHtml, fitView } from "../../kit/steps.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";

const WIDTH = 600;
const HEIGHT = 520;

const C = {
  HOUSE: { x: -50, y: -50, w: 100, d: 100, r: 5 },
  FLOOR: 6,
  WALL_TOP: 130,
  LID_Z: 130,
  LID_H: 6,
  A: [-6, -6],
  PR: 3.5,
  HEX: 3.5 / Math.cos(Math.PI / 6),
  CONE: 18,
  STOP: 74,
  BOTTOM_IN: 92,
  TRAVEL: 52,
  BODY_LEN: 44,
  FERRULE: 8,
  ERASER: 7,
  DECK: { x: -45, y: -45, w: 59, d: 59, r: 2 },
  DECK_Z: 60,
  DECK_H: 4,
  HOLE_R: 11,
  CAR_IN: 9,
  CAR_R: 20,
  CAR_Z: 64,
  CAR_TOP: 70,
  DRAWER: { x: -40, y: -40, w: 55, d: 55, r: 2 },
  DR_TOP: 26,
  WHEEL: { x0: 29, x1: 39, y: -6, z: 74, r: 24 },
  PIN: { x0: 10, x1: 15, r: 4 },
  PIVOT: [-14, -6, 106],
  SHORT: [5.5, -7],
  LONG: [-25.7, -3.9],
  PAD_R: 1.5,
  BOX: { x: -45, y: -10, w: 8, d: 8, r: 1 },
  BOX_Z: 112.5,
  BOX_H: 7.5,
  CLOSE: (14 * Math.PI) / 180,
};

const MO = { species: "sloth", name: "Mo", size: 21, role: "sensing", wear: "cap" };
const BUN = { species: "hamster", name: "Bun", size: 15, role: "power", wear: "band" };
const MOCHI = { species: "hamster", name: "Mochi", size: 15, role: "power", wear: "band" };
const CHOMP = { species: "beaver", name: "Chomp", size: 20, role: "cutting", wear: "goggles" };

const outTop = C.BOTTOM_IN + C.TRAVEL + C.BODY_LEN + C.FERRULE + C.ERASER;
const DESK = { x: -121, y: -116, w: 236, d: 224, r: 6 };
const ROOM_TOP = 175;
const P = k.fitProjection(
  [...k.boxCorners(DESK, -19, -5), [-121, -122, ROOM_TOP], [115, -122, ROOM_TOP], [-121, 30, ROOM_TOP], [C.A[0], C.A[1], outTop]],
  WIDTH,
  HEIGHT,
  { pad: 14, azimuth: 45 },
);

const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const Ln = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const K = { ...k, ...L, ellipsoidOf };
const M = (mat, html) => `<g data-c="mat-${mat}">${html}</g>`;

const ngon = (r, n = 8) => Array.from({ length: n }, (_, i) => [r * Math.cos(((i + 0.5) / n) * Math.PI * 2), r * Math.sin(((i + 0.5) / n) * Math.PI * 2)]);
const rodAlong = (o, a, u, r, s0, s1, n = 8) => L.prismOf(L.frameOf(o, a, u, L.cross3(a, u)), ngon(r, n), s0, s1, P);
const ringYZ = (x, cy, cz, r, n = 64) => k.pathOf(Array.from({ length: n }, (_, i) => at([x, cy + r * Math.cos((i / n) * Math.PI * 2), cz + r * Math.sin((i / n) * Math.PI * 2)])), true);
const ringX = (x, y0, y1, z0, z1, rr) => {
  const pts = [];
  const arc = (cy, cz, a0) => { for (let i = 0; i <= 6; i++) { const t = a0 + (i / 6) * (Math.PI / 2); pts.push(at([x, cy + rr * Math.cos(t), cz + rr * Math.sin(t)])); } };
  arc(y1 - rr, z1 - rr, 0); arc(y0 + rr, z1 - rr, Math.PI / 2); arc(y0 + rr, z0 + rr, Math.PI); arc(y1 - rr, z0 + rr, Math.PI * 1.5);
  return k.pathOf(pts, true);
};
const ringY = (y, x0, x1, z0, z1, rr) => {
  const pts = [];
  const arc = (cx, cz, a0) => { for (let i = 0; i <= 6; i++) { const t = a0 + (i / 6) * (Math.PI / 2); pts.push(at([cx + rr * Math.cos(t), y, cz + rr * Math.sin(t)])); } };
  arc(x1 - rr, z1 - rr, 0); arc(x0 + rr, z1 - rr, Math.PI / 2); arc(x0 + rr, z0 + rr, Math.PI); arc(x1 - rr, z0 + rr, Math.PI * 1.5);
  return k.pathOf(pts, true);
};

function dynamic(K, P, C, S) {
  const at = (p) => K.iso(p, P);
  const out = {};
  const [ax, ay] = C.A;
  const down = [0, 0, -1];
  const cone = 2 + 16 * S.s;
  const leadLen = 0.6 + 4.4 * S.s;
  const woodLen = cone - leadLen;
  const rt = Math.max(0.12, 1 - 0.88 * S.s);
  const bottom = S.bottom;
  const hex = Array.from({ length: 6 }, (_, i) => [ax + C.HEX * Math.cos((i * Math.PI) / 3 + Math.PI / 6), ay + C.HEX * Math.sin((i * Math.PI) / 3 + Math.PI / 6)]);
  const top = bottom + C.BODY_LEN;
  const lead = K.solidOf([[0, 1], [leadLen, rt]], K.frameAlong([ax, ay, bottom - woodLen], down), P, { steps: 20 });
  const wood = K.solidOf([[0, C.PR], [woodLen, 1]], K.frameAlong([ax, ay, bottom], down), P, { steps: 28 });
  const body = K.extrude(hex, bottom, C.BODY_LEN, P, { convex: true });
  const ferrule = K.cylinder(ax, ay, 3.95, top, C.FERRULE, P, 32);
  const eraser = K.cylinder(ax, ay, 3.7, top + C.FERRULE, C.ERASER, P, 32, 0.8);
  const bands = [1.6, 4, 6.4].map((h) => K.sideArc(ax, ay, 3.95, top + h, P, 16)).join("");
  const edges = hex.map(([x, y], i) => (i === 0 || i === 1 ? K.segment([x, y, bottom], [x, y, top], P) : "")).join("");
  const tipZ = bottom - cone;
  const tw = S.spark > 0 && S.spark < 1.6 ? Math.sin((Math.PI * S.spark) / 1.6) : 0;
  let star = "";
  if (tw > 0.02) {
    const c = at([ax, ay, tipZ - 1]), r = 7 * tw, q = r * 0.22;
    const d = `M${c[0]} ${c[1] - r}L${c[0] + q} ${c[1] - q}L${c[0] + r} ${c[1]}L${c[0] + q} ${c[1] + q}L${c[0]} ${c[1] + r}L${c[0] - q} ${c[1] + q}L${c[0] - r} ${c[1]}L${c[0] - q} ${c[1] - q}Z`;
    star = `<g data-c="mat-paper"><path class="crew-patch" d="${d}"/><path class="iso-line" data-tone="mid" d="${d}"/></g>`;
  }
  out.pencil = `<g data-c="mat-graphite">${K.solidSvg(lead, { tone: "hi", crease: "none" })}</g><g data-c="mat-wood">${K.solidSvg(wood, { tone: "hi", crease: "none" })}</g><g data-c="mat-paint">${K.solidSvg(body, { tone: "hi", lit: S.duty === "", crease: "lo" })}</g><g data-c="mat-steel">${K.solidSvg(ferrule, { tone: "mid" })}${K.lineSvg(bands, { tone: "lo" })}</g><g data-c="mat-rubber">${K.solidSvg(eraser, { tone: "mid" })}</g>`;
  out.star = star;

  const g = S.gamma;
  const rot = ([x, z]) => [x * Math.cos(g) + z * Math.sin(g), -x * Math.sin(g) + z * Math.cos(g)];
  const P0 = C.PIVOT;
  const vs = rot(C.SHORT), vl = rot(C.LONG);
  const ngon = (r, n = 8) => Array.from({ length: n }, (_, i) => [r * Math.cos(((i + 0.5) / n) * Math.PI * 2), r * Math.sin(((i + 0.5) / n) * Math.PI * 2)]);
  const bar = (v, w) => {
    const len = Math.hypot(v[0], v[1]);
    const a = [v[0] / len, 0, v[1] / len], u = [0, 1, 0];
    return K.prismOf(K.frameOf(P0, a, u, K.cross3(a, u)), [[-w, -w], [w, -w], [w, w], [-w, w]], -0.8, len, P);
  };
  const along = (o, r, s0, s1, n = 8) => K.prismOf(K.frameOf(o, [0, 1, 0], [1, 0, 0], K.cross3([0, 1, 0], [1, 0, 0])), ngon(r, n), s0, s1, P);
  const pad = [P0[0] + vs[0], P0[1], P0[2] + vs[1]];
  const end = [P0[0] + vl[0], P0[1], P0[2] + vl[1]];
  out.end = end;
  out.crank = `<g data-c="mat-iron">${K.solidSvg(bar(vl, 1), { tone: "hi", lit: S.duty === "mo" })}${K.solidSvg(bar(vs, 0.9), { tone: "hi", lit: S.duty === "mo" })}</g><g data-c="mat-plastic">${K.solidSvg(along(pad, C.PAD_R, -1.7, 1.7, 12), { tone: "hi" })}${K.solidSvg(along(end, 1.7, -1.6, 1.6, 10), { tone: "hi" })}</g>`;
  const btnLow = Math.min(C.BOX_Z - 0.3, Math.max(C.BOX_Z - 1.4, end[2] + 1.7));
  out.button = `<g data-c="mat-plastic">${K.solidSvg(K.slabOf({ x: C.BOX.x + 3, y: C.BOX.y + 2.5, w: 3, d: 3, r: 0.6 }, btnLow, C.BOX_Z - btnLow, P, 3), { tone: "hi", lit: S.on })}</g>`;

  const W = C.WHEEL, wr = W.r;
  const rungs = [], spokes = [];
  for (let i = 0; i < 24; i++) {
    const t = S.wheel + (i / 24) * Math.PI * 2;
    const y = W.y + wr * Math.cos(t), z = W.z + wr * Math.sin(t);
    rungs.push(K.segment([W.x0, y, z], [W.x1, y, z], P));
  }
  for (let i = 0; i < 6; i++) {
    const t = S.wheel + (i / 6) * Math.PI * 2 + 0.26;
    spokes.push(K.segment([W.x0, W.y + 3.5 * Math.cos(t), W.z + 3.5 * Math.sin(t)], [W.x0, W.y + wr * Math.cos(t), W.z + wr * Math.sin(t)], P));
  }
  out.rungs = `<g data-c="mat-iron">${K.lineSvg(rungs.join(""), { tone: "mid" })}</g>`;
  out.spokes = `<g data-c="mat-iron">${K.lineSvg(spokes.join(""), { tone: "mid" })}</g>`;
  const pinF = K.frameAlong([C.PIN.x0, C.A[1], W.z], [1, 0, 0]);
  out.pinion = `<g data-c="mat-brass">${K.lineSvg(K.ribsOf(pinF, 0, C.PIN.x1 - C.PIN.x0, C.PIN.r + 0.02, 14, P, { phase: S.wheel }), { tone: "mid" })}</g>`;

  const teeth = K.radialTicks(ax, ay, C.CAR_R - 0.4, 40, 1000, C.CAR_TOP, [3.4, 3.4], P, S.carrier);
  out.teeth = `<g data-c="mat-brass">${K.lineSvg(teeth.minor + teeth.major, { tone: "mid" })}</g>`;
  out.bolts = K.dotsSvg([0, 1, 2].map((i) => { const t = S.carrier + (i / 3) * Math.PI * 2 + 0.5; return at([ax + 14.5 * Math.sin(t), ay - 14.5 * Math.cos(t), C.CAR_TOP]); }), { size: 0.5, tone: "mid" });

  const chip = (c) => {
    const n = 7, pts = [];
    for (let i = 0; i < n; i++) {
      const t = (i / n) * Math.PI * 2;
      const r = 1.9 * (0.7 + 0.3 * Math.cos(2 * t + c.spin));
      pts.push(at([c.x + r * Math.cos(t + c.spin) * c.u, c.y + r * Math.sin(t + c.spin), c.z + r * Math.cos(t) * c.w]));
    }
    return K.pathOf(pts, true);
  };
  const up = S.chips.filter((c) => c.z > C.DECK_Z + C.DECK_H).map(chip).join("");
  const low = S.chips.filter((c) => c.z < C.DECK_Z).map(chip).join("");
  const chipSvg = (d) => (d ? `<g data-c="mat-wood"><g class="iso-solid"><path class="iso-fill" d="${d}"/><path class="iso-line iso-edge" data-tone="mid" d="${d}"/></g></g>` : "");
  out.chipsUp = chipSvg(up);
  out.chipsLow = chipSvg(low);
  const ph = 1.5 + 7.5 * Math.min(1, S.pile);
  out.pileH = ph;
  out.pile = `<g data-c="mat-wood">${K.solidSvg(K.ellipsoidOf([ax, ay, C.FLOOR + 2], [[19, 0, 0], [0, 19, 0], [0, 0, ph]], P, { steps: 40, clip: { n: [0, 0, 1], d: 0 } }), { tone: "mid" })}</g>`;
  return out;
}

function poses(C, S) {
  const g = S.gamma;
  const rot = ([x, z]) => [x * Math.cos(g) + z * Math.sin(g), -x * Math.sin(g) + z * Math.cos(g)];
  const vl = rot(C.LONG);
  const E = [C.PIVOT[0] + vl[0], C.PIVOT[1], C.PIVOT[2] + vl[1]];
  const mo = {
    at: [E[0] + 0.8, E[1] + 4.2, E[2] - 17.6],
    heading: 0,
    lean: -4,
    look: [-18, 14],
    paws: { l: [E[0] + 2.6, E[1] + 1.1, E[2] - 0.9], r: [E[0] - 0.6, E[1] + 1.1, E[2] - 0.9] },
    eyes: S.closeT < 1.1 ? "wide" : S.moEyes,
    hop: S.closeT < 1.2 ? 2.4 * Math.exp(-4 * S.closeT) * Math.abs(Math.sin(11 * S.closeT)) : 0,
    squash: 0,
  };
  const W = C.WHEEL;
  const run = Math.min(1, S.omega * 1.4);
  const ham = (offset, phase) => {
    const a = (offset * Math.PI) / 180;
    return {
      at: [(W.x0 + W.x1) / 2, W.y + 22.6 * Math.sin(a), W.z - 22.6 * Math.cos(a)],
      heading: 90,
      lean: 12 * run,
      look: [8, 0],
      stride: { phase: (-S.wheel * W.r) / 5 + phase, amount: 0.13 * run },
      eyes: S.omega < 0.04 ? "shut" : S.omega > 0.9 ? "open" : "wide",
      squash: S.omega < 0.04 ? 0.35 : 0,
      hop: S.wakeT < 0.7 ? 2.6 * Math.exp(-5 * S.wakeT) * Math.abs(Math.sin(12 * S.wakeT + phase)) : 0,
    };
  };
  const phi = S.carrier;
  const R = 9.6;
  const chewing = S.cutting;
  const coneMid = S.bottom - (2 + 16 * S.s) * 0.5;
  const cx = C.A[0] + R * Math.cos(phi), cy = C.A[1] + R * Math.sin(phi);
  const chomp = {
    at: [cx, cy, C.CAR_TOP],
    heading: (phi * 180) / Math.PI + 180,
    lean: chewing ? 14 : 4,
    look: [0, Math.max(-10, Math.min(28, (coneMid - (C.CAR_TOP + 12)) * 2.2))],
    eyes: S.s >= 1 ? "happy" : chewing ? "open" : S.omega > 0.2 ? "wide" : "open",
    stride: { phase: (phi * R) / 5, amount: 0.06 * Math.min(1, S.omega) },
  };
  return { mo, bun: ham(-17, 0.5), mochi: ham(17, 0), chomp, E };
}

const state0 = { s: 0, bottom: C.BOTTOM_IN + C.TRAVEL, gamma: 0, wheel: 0.6, carrier: 0.9, omega: 0, on: false, cutting: false, chips: [], pile: 0.3, duty: "", moEyes: "shut", closeT: 9, wakeT: 9, spark: 0 };
const dyn0 = dynamic(K, P, C, state0);
const pose0 = poses(C, state0);

const yCollar = at([C.A[0], C.A[1], C.LID_Z + C.LID_H + 4])[1];

function base() {
  const out = [`<path class="iso-halo" d="${k.haloOf(C.HOUSE, -5, 6, P)}"/>`];
  const feet = k.corners(C.HOUSE, 12).sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
  for (const [x, y] of feet) {
    out.push(M("rubber", S(k.cylinder(x, y, 6.5, -5, 1.6, P, 28), { tone: "mid" }) + S(k.cylinder(x, y, 5, -3.4, 3.4, P, 28), { tone: "mid" })));
  }
  out.push(M("shell", S(k.slabOf(C.HOUSE, 0, C.FLOOR, P, 6, 1.2), { tone: "mid" })));
  out.push(M("shell", Ln(k.lineOnTop([-45, 47], [50, 47], C.FLOOR, P), { tone: "faint" }) + Ln(k.lineOnTop([47, -45], [47, 47], C.FLOOR, P), { tone: "faint" })));
  out.push(D([[44, 44], [44, -38], [-38, 44]].map(([x, y]) => at([x, y, C.FLOOR])), { size: 0.5 }));
  return out.join("");
}

function walls() {
  const out = [];
  const back = { x: -50, y: -50, w: 100, d: 5, r: 0.8 };
  const side = { x: -50, y: -45, w: 5, d: 95, r: 0.8 };
  out.push(M("shell", S(k.slabOf(back, C.FLOOR, C.WALL_TOP - C.FLOOR, P, 3, 0.6), { tone: "mid" })));
  out.push(Ln(k.segment([50, -45, C.FLOOR], [50, -45, C.WALL_TOP], P), { tone: "faint" }));
  out.push(Ln([40, 92].map((z) => k.segment([-45, -45, z], [50, -45, z], P)).join(""), { tone: "faint" }));
  out.push(M("shell", S(k.slabOf(side, C.FLOOR, C.WALL_TOP - C.FLOOR, P, 3, 0.6), { tone: "mid" })));
  out.push(Ln(k.segment([-45, 50, C.FLOOR], [-45, 50, C.WALL_TOP], P), { tone: "faint" }));
  out.push(Ln([40, 92].map((z) => k.segment([-45, -45, z], [-45, 50, z], P)).join(""), { tone: "faint" }));
  const vents = [];
  for (let i = 0; i < 6; i++) vents.push(ringX(-45, 10 + i * 6, 13 + i * 6, 12, 30, 1.5));
  out.push(M("shell", Ln(vents.join(""), { tone: "mid" })));
  out.push(D([[-45, -40, 125], [-45, 45, 125], [-45, 45, 12], [-40, -45, 125], [45, -45, 125], [45, -45, 12]].map(at), { size: 0.5 }));
  out.push(M("paper", S(k.extrude(k.ringOf({ x: 26, y: -45, w: 18, d: 0.8, r: 0.3 }, 3), 99, 10, P), { tone: "hi", crease: "faint" }) + Ln([[28.5, 105.5, 13], [28.5, 103.5, 10], [28.5, 101.5, 12]].map(([x, z, w]) => k.segment([x, -44.2, z], [x + w, -44.2, z], P)).join(""), { tone: "mid", free: true })));
  out.push(D([[27.5, -44.2, 107.8], [42.5, -44.2, 107.8]].map(at), { size: 0.45 }));
  out.push(M("brass", S(k.slabOf({ x: 16, y: -45, w: 8, d: 4, r: 0.8 }, 80, 8, P, 3, 0.4), { tone: "hi" })));
  out.push(D([[18, -41, 88], [22, -41, 88]].map(at), { size: 0.45 }));
  out.push(k.wireSvg(at([-44.6, -9, 116]), at([20, -42, 88]), { via: [at([-44.6, -44.6, 116]), at([20, -44.6, 116])], tone: "lo", size: 0.9 }).replace('class="iso-line"', 'class="iso-line" data-part="wire"'));
  out.push(k.wireSvg(at([20, -41, 82]), at([20, -10, 78.5]), { tone: "lo", size: 0.9 }).replace('class="iso-line"', 'class="iso-line" data-part="wire2"'));
  out.push(M("plastic", S(k.slabOf(C.BOX, C.BOX_Z, C.BOX_H, P, 3, 0.4), { tone: "hi" })));
  out.push(D([[-41, -9.6, C.BOX_Z + 6.2], [-41, -2.4, C.BOX_Z + 6.2]].map(([x, y, z]) => at([x + 3, y + 3.6, z + 1.3])), { size: 0.45 }));
  out.push(Ln(k.planOutline(k.insetPlan(C.BOX, 1.6), C.BOX_Z + C.BOX_H, P, 3), { tone: "faint" }));
  return out.join("");
}

function drawerBack() {
  const out = [];
  const Dr = C.DRAWER, z0 = C.FLOOR, h = C.DR_TOP - z0;
  out.push(S(k.slabOf(Dr, z0, 2, P, 3, 0.4), { tone: "lo" }));
  out.push(S(k.slabOf({ x: Dr.x, y: Dr.y, w: Dr.w, d: 2, r: 0.5 }, z0 + 2, h - 2, P, 2), { tone: "mid" }));
  out.push(S(k.slabOf({ x: Dr.x, y: Dr.y + 2, w: 2, d: Dr.d - 2, r: 0.5 }, z0 + 2, h - 2, P, 2), { tone: "mid" }));
  return M("plastic", out.join(""));
}

function drawerFront() {
  const out = [];
  const Dr = C.DRAWER, z0 = C.FLOOR, h = C.DR_TOP - z0;
  out.push(S(k.slabOf({ x: Dr.x + Dr.w - 2, y: Dr.y + 2, w: 2, d: Dr.d - 4, r: 0.5 }, z0 + 2, h - 2, P, 2), { tone: "mid" }));
  out.push(S(k.slabOf({ x: Dr.x, y: Dr.y + Dr.d - 2, w: Dr.w, d: 2, r: 0.5 }, z0 + 2, h - 2, P, 2), { tone: "mid" }));
  out.push(Ln(ringY(Dr.y + Dr.d, Dr.x + 4, Dr.x + Dr.w - 4, z0 + 5, z0 + h - 4, 1.5), { tone: "faint" }));
  const pull = { x: Dr.x + 21, y: Dr.y + Dr.d, w: 13, d: 3, r: 1 };
  out.push(S(k.slabOf({ x: pull.x, y: pull.y, w: 2.4, d: 2.4, r: 0.4 }, z0 + 11, 3, P, 2), { tone: "mid" }));
  out.push(S(k.slabOf({ x: pull.x + pull.w - 2.4, y: pull.y, w: 2.4, d: 2.4, r: 0.4 }, z0 + 11, 3, P, 2), { tone: "mid" }));
  out.push(S(k.slabOf({ x: pull.x, y: pull.y + 2.4, w: pull.w, d: 2.2, r: 1 }, z0 + 10.5, 4, P, 3, 0.3), { tone: "mid" }));
  return M("plastic", out.join(""));
}

function deck() {
  const out = [];
  for (const g of [{ x: -45, y: -36, w: 4, d: 3 }, { x: -45, y: -2, w: 4, d: 3 }, { x: -36, y: -45, w: 3, d: 4 }, { x: 0, y: -45, w: 3, d: 4 }]) {
    out.push(M("iron", S(k.slabOf({ ...g, r: 0.5 }, C.DECK_Z - 9, 9, P, 2), { tone: "hi" })));
  }
  out.push(M("steel", S(k.slabOf(C.DECK, C.DECK_Z, C.DECK_H, P, 4, 0.6), { tone: "hi" }) + Ln(k.planOutline(k.insetPlan(C.DECK, 3), C.DECK_Z + C.DECK_H, P, 4), { tone: "faint" })));
  out.push(D(k.corners(C.DECK, 6).map(([x, y]) => at([x, y, C.DECK_Z + C.DECK_H])), { size: 0.5 }));
  out.push(`<path class="so-void" d="${k.ring(C.A[0], C.A[1], C.HOLE_R, C.DECK_Z + C.DECK_H, P, 48)}"/>`);
  const F = L.frameAlong([C.A[0], C.A[1], C.CAR_Z], [0, 0, 1]);
  out.push(M("brass", S(L.ringBand(0, C.CAR_TOP - C.CAR_Z, C.CAR_IN, C.CAR_R, F, P, { hole: [C.CAR_TOP - C.CAR_Z, C.CAR_IN] }), { tone: "hi", crease: "lo" })));
  out.push(`<path class="so-void" d="${k.ring(C.A[0], C.A[1], C.CAR_IN, C.CAR_TOP, P, 48)}"/>`);
  out.push(M("brass", Ln(k.ring(C.A[0], C.A[1], C.CAR_R - 4.2, C.CAR_TOP, P, 64), { tone: "faint" }) + Ln(k.knurl(C.A[0], C.A[1], C.CAR_R, C.CAR_Z, C.CAR_TOP, 60, P, 0), { tone: "faint" })));
  return out.join("");
}

function crankStatic(front) {
  const [px, py, pz] = C.PIVOT;
  if (!front) return M("iron", S(k.slabOf({ x: px - 3, y: py - 3.6, w: 6, d: 1.2, r: 0.4 }, pz - 3, C.LID_Z - pz + 3, P, 2), { tone: "hi" }));
  return M("iron", [
    S(rodAlong([px, py - 3.6, pz], [0, 1, 0], [1, 0, 0], 1.1, 0, 7.2, 10), { tone: "mid" }),
    S(k.slabOf({ x: px - 3, y: py + 2.4, w: 6, d: 1.2, r: 0.4 }, pz - 3, C.LID_Z - pz + 3, P, 2), { tone: "mid" }),
    D([at([px, py + 3.6, pz])], { size: 0.5, tone: "hi" }),
  ].join(""));
}

function wheelBack() {
  const W = C.WHEEL, y = W.y, z = W.z;
  const out = [];
  out.push(M("brass", S(rodAlong([C.PIN.x0, y, z], [1, 0, 0], [0, 1, 0], C.PIN.r, 0, C.PIN.x1 - C.PIN.x0, 16), { tone: "hi", crease: "lo" })));
  out.push(`<g data-part="pinion">${dyn0.pinion}</g>`);
  out.push(M("iron", S(rodAlong([C.PIN.x1, y, z], [1, 0, 0], [0, 1, 0], 1.2, 0, 3, 8), { tone: "hi" }) + S(k.slabOf({ x: 18, y: y - 4, w: 4, d: 8, r: 0.8 }, C.FLOOR, 76 - C.FLOOR, P, 3, 0.4), { tone: "hi" })));
  out.push(M("steel", S(rodAlong([17.4, y, z], [1, 0, 0], [0, 1, 0], 3.2, 0, 5.2, 12), { tone: "hi" })));
  out.push(D([at([22.6, y, z + 2]), at([22.6, y, z - 2])], { size: 0.45 }));
  out.push(M("iron", S(rodAlong([22.6, y, z], [1, 0, 0], [0, 1, 0], 1.2, 0, W.x0 - 22.6, 8), { tone: "hi" }) + Ln(ringYZ(W.x0, y, z, W.r), { tone: "hi" })));
  out.push(`<g data-part="spokes">${dyn0.spokes}</g>`);
  out.push(M("steel", S(rodAlong([W.x0 - 0.8, y, z], [1, 0, 0], [0, 1, 0], 3.5, 0, 1.6, 12), { tone: "hi" })));
  out.push(`<g data-part="rungs">${dyn0.rungs}</g>`);
  return out.join("");
}

function wheelFront() {
  const W = C.WHEEL, y = W.y, z = W.z;
  const out = [];
  out.push(M("iron", Ln(ringYZ(W.x1, y, z, W.r), { tone: "hi" }) + S(rodAlong([W.x1, y, z], [1, 0, 0], [0, 1, 0], 1.2, 0, 1.6, 8), { tone: "hi" })));
  out.push(M("steel", S(rodAlong([W.x1 + 1.6, y, z], [1, 0, 0], [0, 1, 0], 2.2, 0, 1.6, 12), { tone: "hi" })));
  out.push(D([at([W.x1 + 3.2, y, z])], { size: 0.5, tone: "hi" }));
  return out.join("");
}

function lid() {
  const out = [];
  const [ax, ay] = C.A;
  out.push(M("steel", S(k.cylinder(ax, ay, 6, 117, C.LID_Z - 117, P, 32), { tone: "hi", crease: "none" }) + Ln(k.sideArc(ax, ay, 6, 121, P, 20), { tone: "faint" })));
  const ring = [[-50, -50], [50, -50], [50, -30], [8, -30], [8, 8], [-28, 8], [-28, -30], [-50, -30]];
  out.push(M("shell", S(k.extrude(ring, C.LID_Z, C.LID_H, P, { convex: false }), { tone: "mid", crease: "faint" })));
  out.push(D([[-46, -46], [46, -46], [46, -34], [4, 4], [-24, 4], [-46, -34]].map(([x, y]) => at([x, y, C.LID_Z + C.LID_H])), { size: 0.5 }));
  out.push(M("shell", Ln(k.segment([-50, -38, C.LID_Z + C.LID_H], [50, -38, C.LID_Z + C.LID_H], P), { tone: "faint" })));
  out.push(M("plastic", S(k.cylinder(36, -42, 2.6, C.LID_Z + C.LID_H, 1.2, P, 20), { tone: "hi" })));
  out.push(`<g data-part="led">${S(k.cylinder(36, -42, 1.6, C.LID_Z + C.LID_H + 1.2, 0.8, P, 16), { tone: "hi", lit: true })}</g>`);
  out.push(M("steel", S(k.cylinder(ax, ay, 8, C.LID_Z + C.LID_H, 4, P, 40, 0.5), { tone: "hi" }) + Ln(k.knurl(ax, ay, 8, C.LID_Z + C.LID_H, C.LID_Z + C.LID_H + 4, 48, P, 0), { tone: "faint" })));
  out.push(`<path class="so-void" d="${k.ring(ax, ay, 4.6, C.LID_Z + C.LID_H + 4, P, 32)}"/>`);
  return out.join("");
}

const collarRim = Ln(k.sideArc(C.A[0], C.A[1], 4.7, C.LID_Z + C.LID_H + 4, P, 24), { tone: "lo" });

function room() {
  const out = [];
  out.push(M("wall", S(k.slabOf({ x: -121, y: -122, w: 236, d: 6, r: 0.6 }, -19, ROOM_TOP + 19, P, 2), { tone: "mid" })));
  out.push(M("wall", Ln(Array.from({ length: 19 }, (_, i) => k.segment([-112 + i * 12, -116, -5], [-112 + i * 12, -116, ROOM_TOP], P)).join(""), { tone: "faint" })));
  out.push(M("wall", S(k.slabOf({ x: -127, y: -122, w: 6, d: 152, r: 0.6 }, -19, ROOM_TOP + 19, P, 2), { tone: "mid" })));
  out.push(M("wall", Ln(Array.from({ length: 12 }, (_, i) => k.segment([-121, -108 + i * 12, -5], [-121, -108 + i * 12, ROOM_TOP], P)).join(""), { tone: "faint" })));
  const board = { x: 52, y: -116, w: 56, d: 2, r: 0.6 };
  out.push(M("desk", S(k.slabOf(board, 92, 44, P, 2), { tone: "mid" }) + Ln(ringY(-114, 55, 105, 95, 133, 1.5), { tone: "faint" })));
  const notes = [[58, 112, 16, 14], [78, 104, 14, 18], [94, 116, 10, 12], [60, 98, 12, 10]];
  out.push(M("paper", notes.map(([x, z, w, h]) => S(k.slabOf({ x, y: -114, w, d: 0.5, r: 0.2 }, z, h, P, 2), { tone: "mid" })).join("")));
  out.push(M("plastic", notes.map(([x, z, w, h]) => S(L.sphereOf([x + w / 2, -113.2, z + h - 2], 1.1, P, { steps: 16 }), { tone: "hi" })).join("")));
  return out.join("");
}

function desk() {
  const out = [];
  const grain = [];
  for (let y = DESK.y + 9; y < DESK.y + DESK.d - 8; y += 11) grain.push(k.lineOnTop([DESK.x, y], [DESK.x + DESK.w, y], -5, P));
  out.push(M("desk", S(k.slabOf(DESK, -19, 14, P, 6, 1.2), { tone: "mid" }) + Ln(grain.join(""), { tone: "faint" })));
  return out.join("");
}

function propsBack() {
  const out = [];
  const [cx, cy] = [80, -72];
  const pencils = [[cx - 4, cy - 2, 52, "paint"], [cx + 3, cy - 4, 44, "role-holding"], [cx + 1, cy + 4, 58, "paint"]];
  out.push(M("plastic", S(k.cylinder(cx, cy, 13, -5, 27, P, 48, 0.6), { tone: "hi" })));
  out.push(`<path class="so-void" d="${k.ring(cx, cy, 11.6, 22, P, 48)}"/>`);
  for (const [x, y, h] of pencils.sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P))) {
    const hex = Array.from({ length: 6 }, (_, i) => [x + 3 * Math.cos((i * Math.PI) / 3 + Math.PI / 6), y + 3 * Math.sin((i * Math.PI) / 3 + Math.PI / 6)]);
    out.push(M("paint", S(k.extrude(hex, 6, h - 12, P), { tone: "hi" })));
    out.push(M("steel", S(k.cylinder(x, y, 3.2, h - 6, 4, P, 20), { tone: "hi" })));
    out.push(M("rubber", S(k.cylinder(x, y, 3, h - 2, 4, P, 20, 0.5), { tone: "hi" })));
  }
  out.push(M("plastic", Ln(k.sideArc(cx, cy, 13, 18, P, 32), { tone: "faint" })));
  const book = { x: -104, y: 52, w: 46, d: 36, r: 2 };
  out.push(M("paper", S(k.slabOf(book, -5, 2.6, P, 3, 0.4), { tone: "mid" })));
  out.push(M("paper", Ln(Array.from({ length: 6 }, (_, i) => k.lineOnTop([book.x + 6, book.y + 7 + i * 5], [book.x + book.w, book.y + 7 + i * 5], -2.4, P)).join(""), { tone: "faint" })));
  out.push(M("rubber", Ln(k.lineOnTop([book.x + 6, book.y], [book.x + 6, book.y + book.d], -2.4, P), { tone: "mid" })));
  out.push(D(Array.from({ length: 7 }, (_, i) => at([book.x + 2.6, book.y + 4 + i * 4.6, -2.4])), { size: 0.6, tone: "mid" }));
  return out.join("");
}

function propsFront() {
  const e = { x: 64, y: 58, w: 22, d: 12, r: 2.5 };
  return M("rubber", S(k.slabOf(e, -5, 7, P, 4, 0.8), { tone: "hi" }) + Ln(k.sideSeam(e, -1, P, 4), { tone: "faint" }));
}

const crew = (spec, pose, part, duty = false) => critterSvg(critter(spec, pose, P), { part, duty });
const chompPose = pose0.chomp;
const chompFront = (chompPose.at[0] - C.A[0]) + (chompPose.at[1] - C.A[1]) >= 0;

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "An electric pencil sharpener on a desk, with its front walls and the front of its lid cut away, run by cartoon animals. A pencil cup, a notebook and an eraser sit beside it, and a cork board hangs on the wall. A pencil comes down through the throat collar. Mo the sloth, in a blue cap, hangs from the switch lever; the pencil pushes the lever's short arm aside, which lifts Mo and the long arm up onto a microswitch. Two hamsters in yellow headbands run in a wire wheel whose pinion turns the cutter carrier's crown teeth. Chomp the beaver, in violet goggles, stands on the carrier and gnaws round the pencil as it turns, cutting the cone. Shavings drop through the deck into a drawer.",
  body: [
    `<defs><clipPath id="pencil-up"><rect x="-200" y="-400" width="1000" height="${(yCollar + 400).toFixed(1)}"/></clipPath><clipPath id="pencil-low"><rect x="-200" y="${yCollar.toFixed(1)}" width="1000" height="2000"/></clipPath></defs>`,
    room(),
    desk(),
    propsBack(),
    base(),
    walls(),
    drawerBack(),
    `<g data-part="pile">${dyn0.pile}</g>`,
    `<g data-part="chips-low">${dyn0.chipsLow}</g>`,
    drawerFront(),
    deck(),
    `<g data-part="teeth">${dyn0.teeth}</g>`,
    `<g data-part="bolts">${dyn0.bolts}</g>`,
    crankStatic(false),
    `<g data-part="crank">${dyn0.crank}</g>`,
    crankStatic(true),
    `<g data-part="button">${dyn0.button}</g>`,
    crew(MO, pose0.mo, "mo"),
    `<g data-part="c-back">${chompFront ? "" : crew(CHOMP, chompPose, "chomp", true)}</g>`,
    `<g data-part="pencil-low" clip-path="url(#pencil-low)">${dyn0.pencil}</g>`,
    `<g data-part="c-front">${chompFront ? crew(CHOMP, chompPose, "chomp", true) : ""}</g>`,
    `<g data-part="chips-up">${dyn0.chipsUp}</g>`,
    wheelBack(),
    crew(MOCHI, pose0.mochi, "mochi"),
    crew(BUN, pose0.bun, "bun"),
    wheelFront(),
    lid(),
    `<g data-part="pencil-up" clip-path="url(#pencil-up)">${dyn0.pencil}</g>`,
    collarRim,
    `<g data-part="star">${dyn0.star}</g>`,
    propsFront(),
  ],
});

for (const g of [0, C.CLOSE, 0.323]) {
  const p = poses(C, { ...state0, gamma: g });
  const c = critter(MO, p.mo, P);
  for (const [paw, short] of Object.entries(c.reach)) if (short > 0.3) console.warn(`Mo's ${paw === "l" ? "left" : "right"} paw is ${short.toFixed(1)} short of the lever at ${((g * 180) / Math.PI).toFixed(0)}°`);
}

const STEPS = [
  { title: "Meet the crew", who: "Mo, Bun, Mochi and Chomp", color: "var(--anatomy-hi)", text: "Inside this electric sharpener, four animals do every job. Mo hangs on the switch lever, Bun and Mochi doze in the motor wheel, and Chomp waits on the cutter carrier.", points: null, dwell: 2.6 },
  { title: "A pencil goes in", who: "the pencil", color: "var(--anatomy-hi)", text: "The pencil slides down through the throat collar until its point meets the switch lever's short arm.", points: [[C.A[0], C.A[1], 150], [C.A[0], C.A[1], 92], [-42, -6, 100], [8, 8, 136]] },
  { title: "Mo gets lifted onto the switch", who: "Mo · sensing", color: "#3E9BDB", text: "The pencil pushes the short arm aside. The lever pivots, the long arm swings up with Mo hanging on it, and its end presses the microswitch. The light comes on and current runs to the motor.", points: [[-46, -10, 124], [-46, 4, 78], [-8, -6, 112], [-6, -6, 92]], dwell: 2.2 },
  { title: "Bun and Mochi start running", who: "Bun and Mochi · power", color: "#F5C518", text: "Woken by the current, the hamsters sprint. Their wheel is the motor, and the pinion on its axle turns the crown teeth of the cutter carrier.", points: [[28, -30, 50], [40, 18, 98], [8, -6, 70], [14, 10, 70]] },
  { title: "Chomp gnaws a point", who: "Chomp · cutting", color: "#8E4EC6", text: "Chomp rides the turning carrier round the pencil and gnaws the wood into a cone. Each lap takes a thin curl off, so the point grows a little every time round.", points: [[C.A[0] - 20, C.A[1] - 20, 64], [C.A[0] + 20, C.A[1] + 20, 64], [C.A[0], C.A[1], 100]] },
  { title: "Shavings fall into the drawer", who: "Chomp · cutting", color: "#8E4EC6", text: "The curls drop through the hole in the deck into the drawer below. When the cone reaches 18 mm on this 7 mm pencil, the point is done.", points: [[-40, -40, 6], [16, 16, 26], [C.A[0], C.A[1], 82], [-30, 15, 6]] },
  { title: "Let go: switch off, wheel coasts", who: "everyone", color: "var(--anatomy-hi)", text: "Out comes a sharp pencil. The lever drops, the switch opens, the hamsters skid to a stop and Mo goes back to his nap.", points: [[-50, -50, -5], [50, 50, 0], [C.A[0], C.A[1], 150]], dwell: 2.2 },
];
const views = STEPS.map((step) => (step.points ? fitView(step.points.map(at), [WIDTH, HEIGHT], { pad: 18, least: 0.34 }) : [0, 0, WIDTH, HEIGHT]));

const live = `
const P = ${JSON.stringify(P)};
const C = ${JSON.stringify(C)};
const MO = ${JSON.stringify(MO)}, BUN = ${JSON.stringify(BUN)}, MOCHI = ${JSON.stringify(MOCHI)}, CHOMP = ${JSON.stringify(CHOMP)};
const STEP_INFO = ${JSON.stringify(STEPS.map(({ title, text, who, dwell }) => ({ title, text, who, dwell })))};
const VIEWS = ${JSON.stringify(views.map((v) => v.map((n) => +n.toFixed(2))))};
const COLORS = ${JSON.stringify(STEPS.map((step) => step.color))};
const K = { iso, pathOf, extrude, cylinder, slabOf, segment, sideArc, radialTicks, solidSvg, lineSvg, dotsSvg, ...CREW };
const dynamic = ${dynamic.toString()};
const poses = ${poses.toString()};
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const part = (name) => svg.querySelector('[data-part="' + name + '"]');
const el = { pile: part("pile"), chipsLow: part("chips-low"), teeth: part("teeth"), bolts: part("bolts"), crank: part("crank"), button: part("button"), cBack: part("c-back"), cFront: part("c-front"), pencilLow: part("pencil-low"), pencilUp: part("pencil-up"), chipsUp: part("chips-up"), pinion: part("pinion"), spokes: part("spokes"), rungs: part("rungs"), led: part("led"), wire: part("wire"), wire2: part("wire2"), mo: part("mo"), bun: part("bun"), mochi: part("mochi"), star: part("star") };
let chomp = part("chomp");
const readout = document.querySelector("[data-readout]");
const FRESH = { s: 0, d: 0, target: 0, bottom: C.BOTTOM_IN + C.TRAVEL, gamma: 0, omega: 0, on: false, cutting: false, chips: [], duty: "", moEyes: "shut", fade: 1, swap: -1, still: 9, closeT: 9, wakeT: 9, spark: 0, stepT: 0 };
const S = { ...FRESH, wheel: 0.6, carrier: 0.9, pile: 0.3 };
const PITCH = 18;
const snaps = [];
let lastPose = {};
const rnd = (() => { let seed = 7; return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; })();
function contactGamma() {
  const cone = 2 + 16 * S.s, leadLen = 0.6 + 4.4 * S.s, woodLen = cone - leadLen, rt = Math.max(0.12, 1 - 0.88 * S.s);
  const tip = S.bottom - cone, z = C.PIVOT[2] + C.SHORT[1];
  let r = 0;
  if (z >= S.bottom) r = C.PR;
  else if (z >= S.bottom - woodLen) r = 1 + (C.PR - 1) * (z - (S.bottom - woodLen)) / woodLen;
  else if (z >= tip) r = rt + (1 - rt) * (z - tip) / leadLen;
  const limit = C.A[0] - r - C.PAD_R - C.PIVOT[0];
  if (r === 0 || C.SHORT[0] <= limit) return 0;
  const R = Math.hypot(C.SHORT[0], C.SHORT[1]), phi = Math.atan2(-C.SHORT[1], C.SHORT[0]);
  return Math.max(0, Math.acos(Math.max(-1, Math.min(1, limit / R))) - phi);
}
function step(dt) {
  S.stepT += dt;
  S.d = S.d + (S.target - S.d) * (1 - Math.exp(-dt / 0.45));
  if (Math.abs(S.d - S.target) < 0.002) S.d = S.target;
  S.bottom = C.BOTTOM_IN + (1 - S.d) * C.TRAVEL;
  const want = contactGamma();
  const prevG = S.gamma;
  S.gamma = want >= S.gamma ? want : S.gamma + (want - S.gamma) * (1 - Math.exp(-dt / 0.1));
  if (Math.abs(S.gamma - want) < 1e-4) S.gamma = want;
  const wasOn = S.on;
  S.on = S.gamma > C.CLOSE;
  if (S.on && !wasOn) S.closeT = 0; else S.closeT += dt;
  const prevO = S.omega;
  S.omega = S.omega + ((S.on ? 1 : 0) - S.omega) * (1 - Math.exp(-dt / (S.on ? 0.45 : 0.8)));
  if (!S.on && S.omega < 0.004) S.omega = 0;
  if (S.on && S.omega > 0.996) S.omega = 1;
  if (prevO === 0 && S.omega > 0) S.wakeT = 0; else S.wakeT += dt;
  S.wheel += S.omega * 1.3 * Math.PI * 2 * dt;
  S.carrier -= S.omega * 1.3 * Math.PI * 2 * dt * (C.PIN.r / PITCH);
  const before = S.s;
  if (S.omega > 0.3 && S.d > 0.97 && S.s < 1) S.s = Math.min(1, S.s + dt * 0.16 * S.omega);
  S.cutting = S.s > before;
  if (S.cutting) {
    if (rnd() < dt * 26) {
      const a = S.carrier + (rnd() - 0.5) * 0.6, r = 1.6 + rnd() * 1.5;
      S.chips.push({ x: C.A[0] + r * Math.cos(a), y: C.A[1] + r * Math.sin(a), z: S.bottom - 6 - rnd() * 4, vx: Math.cos(a) * (2 + rnd() * 4), vy: Math.sin(a) * (2 + rnd() * 4), vz: 4 + rnd() * 6, spin: rnd() * 6, u: 0.5 + rnd() * 0.5, w: 0.3 + rnd() * 0.5 });
    }
  }
  const pileTop = C.FLOOR + 2 + 1.5 + 7.5 * Math.min(1, S.pile);
  for (const c of S.chips) {
    c.vz -= 120 * dt; c.x += c.vx * dt; c.y += c.vy * dt; c.z += c.vz * dt; c.spin += dt * 3;
    const dx = c.x - C.A[0], dy = c.y - C.A[1], rr = Math.hypot(dx, dy);
    if (rr > 7.5) { c.x = C.A[0] + (dx / rr) * 7.5; c.y = C.A[1] + (dy / rr) * 7.5; c.vx *= -0.3; c.vy *= -0.3; }
  }
  const landed = S.chips.filter((c) => c.z <= pileTop).length;
  if (landed) { S.chips = S.chips.filter((c) => c.z > pileTop); S.pile = Math.min(1, S.pile + landed * 0.004); }
  const dg = Math.abs(S.gamma - prevG) / Math.max(dt, 1e-3), dO = Math.abs(S.omega - prevO) / Math.max(dt, 1e-3);
  let duty = "";
  if (dg > 0.15) duty = "mo";
  else if (dO > 0.25 && S.omega > 0.02) duty = "squad";
  else if (S.cutting) duty = "chomp";
  S.duty = duty;
  S.still = dg > 0.02 ? 0 : S.still + dt;
  S.moEyes = S.gamma > 0.05 ? "open" : S.still > 1.2 ? "shut" : "open";
  if (S.s >= 1 && S.d < 0.2) S.spark += dt; 
  if (S.swap >= 0) {
    S.swap += dt / 0.8;
    if (S.swap >= 0.5 && S.s > 0) { S.s = 0; S.spark = 0; }
    S.fade = Math.abs(Math.cos(Math.PI * Math.min(1, S.swap)));
    if (S.swap >= 1) { S.swap = -1; S.fade = 1; }
  }
}
function paintCrew(name, node, spec, pose, duty) {
  const key = JSON.stringify(pose) + duty;
  if (lastPose[name] === key) return;
  lastPose[name] = key;
  CREW.paintCritter(node, CREW.critter(spec, pose, P));
  node.toggleAttribute("data-duty", duty);
}
function draw() {
  const D = dynamic(K, P, C, S);
  el.pencilLow.innerHTML = D.pencil; el.pencilUp.innerHTML = D.pencil; el.star.innerHTML = D.star;
  el.pencilLow.style.opacity = el.pencilUp.style.opacity = S.fade.toFixed(3);
  el.crank.innerHTML = D.crank; el.button.innerHTML = D.button;
  el.teeth.innerHTML = D.teeth; el.bolts.innerHTML = D.bolts; el.pinion.innerHTML = D.pinion;
  el.spokes.innerHTML = D.spokes; el.rungs.innerHTML = D.rungs;
  el.chipsUp.innerHTML = D.chipsUp; el.chipsLow.innerHTML = D.chipsLow;
  if (Math.abs((el.pile.__h ?? 0) - D.pileH) > 0.1) { el.pile.innerHTML = D.pile; el.pile.__h = D.pileH; }
  el.led.querySelector(".iso-solid").toggleAttribute("data-lit", S.on);
  el.wire.toggleAttribute("data-flow", S.on); el.wire2.toggleAttribute("data-flow", S.on);
  const p = poses(C, S);
  paintCrew("mo", el.mo, MO, p.mo, S.duty === "mo");
  paintCrew("bun", el.bun, BUN, p.bun, S.duty === "squad");
  paintCrew("mochi", el.mochi, MOCHI, p.mochi, S.duty === "squad");
  const front = (p.chomp.at[0] - C.A[0]) + (p.chomp.at[1] - C.A[1]) >= 0;
  const host = front ? el.cFront : el.cBack;
  if (chomp.parentNode !== host) host.appendChild(chomp);
  paintCrew("chomp", chomp, CHOMP, p.chomp, S.duty === "chomp");
  const cone = 2 + 16 * S.s;
  const word = S.swap >= 0 ? "new pencil" : S.cutting ? "cutting" : S.on ? (S.s >= 1 ? "sharp" : "motor on") : S.omega > 0 ? "coasting" : S.d > 0.02 && S.target === 1 ? "going in" : S.s >= 1 ? "sharp" : "ready";
  const text = word + " · cone " + cone.toFixed(1) + " of 18 mm";
  if (readout.textContent !== text) readout.textContent = text;
}
const DONE = [
  () => S.swap < 0,
  () => S.gamma > 0.02,
  () => S.on && S.closeT > 1.1,
  () => S.omega > 0.97 && S.stepT > 0.6,
  () => S.s >= 0.62,
  () => S.s >= 1 && S.chips.length === 0 && S.stepT > 0.8,
  () => S.omega === 0 && S.d < 0.01 && S.gamma === 0 && S.spark > 1.7,
];
const snap = () => JSON.parse(JSON.stringify({ ...S, chips: [] }));
function enter(i, how) {
  if ((how === "back" || how === "jump-back") && snaps[i]) { Object.assign(S, JSON.parse(JSON.stringify(snaps[i]))); lastPose = {}; S.stepT = 0; draw(); return; }
  if (i === 0) {
    Object.assign(S, { ...FRESH, wheel: S.wheel, carrier: S.carrier, pile: S.pile, chips: [], s: how === "loop" ? 1 : 0, bottom: C.BOTTOM_IN + C.TRAVEL, swap: how === "loop" ? 0 : -1, spark: how === "loop" ? 9 : 0 });
  }
  if (i === 1) S.target = 1;
  if (i === 6) S.target = 0;
  S.stepT = 0;
  snaps[i] = snap();
  draw();
}
STEPS.mountSteps({
  root: document.querySelector("[data-steps]"),
  svg,
  stage,
  steps: STEP_INFO,
  views: VIEWS,
  colors: COLORS,
  size: [${WIDTH}, ${HEIGHT}],
  enter,
  update: (dt) => { step(dt); draw(); },
  done: (i) => DONE[i](),
});
`;

const keys = [
  { mark: "lit", label: "On duty: whoever is doing the work right now" },
  { mark: "raised", label: "Mo, sloth, sensing: hangs on the switch lever" },
  { mark: "raised", label: "Bun and Mochi, hamsters, power: run the motor wheel" },
  { mark: "raised", label: "Chomp, beaver, cutting: gnaws the point as the carrier turns" },
];

const css = `${crewCss()}${STEPS_CSS}
.so-void{fill:var(--anatomy-halo);opacity:.55;stroke:var(--anatomy-lo);stroke-width:var(--anatomy-weight)}
.iso-stage{touch-action:pan-y;cursor:pointer;overflow:hidden}
.iso-stage:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:6px}`;

const body = `<style>${css}</style>` + k.plateHtml({
  fig: "Fig 1",
  title: "Pencil sharpener, staffed",
  hint: "Next, Back, or the arrow keys",
  readout: "ready · cone 2.0 of 18 mm",
  keys,
  caption:
    "An electric pencil sharpener with its front walls off, shown one step at a time. The pencil swings the switch lever onto a microswitch, the hamsters' wheel turns the cutter carrier through a pinion and crown teeth, Chomp cuts an 18 mm cone on a 7 mm pencil as the carrier turns, and the shavings fall into the drawer.",
  body: `<div class="iso-stage" tabindex="0" role="group" aria-label="Pencil sharpener, step by step: arrow keys move between steps, Space plays or pauses">${svg}</div>${stepsHtml(STEPS)}`,
});

const file = theme === "light" ? "pencil-sharpener-light.html" : "pencil-sharpener.html";
writeFileSync(join(HERE, file), k.pageHtml({ title: "Pencil sharpener, staffed", theme, body, script: kitScript() + crewScript() + stepsScript() + live, width: 680 }));
console.log("wrote", file);
