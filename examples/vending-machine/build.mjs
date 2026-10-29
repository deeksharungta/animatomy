import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { critter, critterSvg, crewCss, ellipsoidOf, subjectDefs } from "../../kit/critters.mjs";
import { kitScript, crewScript, stepsScript } from "../../scripts/inline-kit.mjs";
import { STEPS_CSS, stepsHtml, fitView } from "../../kit/steps.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";

const WIDTH = 600;
const HEIGHT = 680;

// One unit is about 9 mm: the cabinet is 136 x 116 x 196 (about 1.25 x 1.05 x 1.8 m).
const C = {
  CAB: { x0: -60, x1: 76, y0: -64, y1: 52, top: 196 },
  FLOOR: -5,
  COIN: { x: -37, r: 4.5, t: 0.55 },
  SLOT_Z: 163,
  CH_Y: 42.5,
  R0: [-37, 47.5, 118.42],
  R1: [-37, 18, 110.4],
  L0: [-37, 16, 101],
  L1: [-37, 44, 94],
  DIG_Y: 33,
  GATE: { y: 24, z: 122.5, len: 9 },
  CATCH: [-37, 44.4, 16.5],
  PIP: [-37, 41, 6],
  STACK: [-41, 24, 7],
  BOX: { x: -52, y: 14, w: 22, d: 20, r: 1 },
  BOX_TOP: 12,
  TZ: [50, 92, 134],
  COLS: [-12, 16, 42],
  HEL: { r: 9, y0: -46, y1: 32, pitch: 12, lift: 9 },
  SLOTS: [26, 14, 2, -10, -22, -34],
  EDGE: 34,
  BAR: { w: 11, d: 6, h: 14 },
  BAG: { w: 12, d: 6.5, h: 12 },
  WHEEL: { x: 63.5, z: 104, y0: -52, y1: -44, r: 11 },
  BIG: { x: 42, z: 101, r: 8 },
  SMALL: { x: 63.5, z: 104, r: 2 },
  BELT_Y: -54,
  RATIO: 4,
  BIN_Z: 8,
  DROP_Y: 43,
  KEYS: { xs: [-51.5, -47, -42.5], zs: [167, 162.5, 158] },
  PANEL: { x: -55, y: 47, w: 28, d: 5, z0: 146, z1: 190 },
};

const DIG = { species: "mole", name: "Dig", size: 18, role: "sensing" };
const PIP = { species: "squirrel", name: "Pip", size: 20, role: "moving" };
const BUN = { species: "hamster", name: "Bun", size: 10, role: "power" };
const MOCHI = { species: "hamster", name: "Mochi", size: 10, role: "power" };

const ROOM = { x0: -100, x1: 112, y0: -84, y1: 66, top: 210 };
const P = k.fitProjection(
  [[ROOM.x0, ROOM.y1, C.FLOOR - 6], [ROOM.x1, ROOM.y1, C.FLOOR - 6], [ROOM.x1, ROOM.y0, C.FLOOR - 6], [ROOM.x0 - 6, ROOM.y0 - 6, ROOM.top], [ROOM.x1, ROOM.y0 - 6, ROOM.top], [ROOM.x0 - 6, ROOM.y1, ROOM.top]],
  WIDTH,
  HEIGHT,
  { pad: 12, azimuth: 45 },
);

const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const Ln = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const slab = (x0, x1, y0, y1, z0, z1, r = 0.5, steps = 3) => k.slabOf({ x: x0, y: y0, w: x1 - x0, d: y1 - y0, r }, z0, z1 - z0, P, steps);
const voidPath = (pts) => `<path class="so-void" d="${k.pathOf(pts.map(at), true)}"/>`;

// --- the moving parts, rebuilt every frame in the page -------------------------------------------
function dynamic(K, P, C, S) {
  const at = (p) => K.iso(p, P);
  const TAU = Math.PI * 2;
  const out = {};
    const rrect = (w, h, r, n = 3) => {
    const pts = [];
    const corner = (cx, cy, a0) => { for (let i = 0; i <= n; i++) { const t = a0 + (i / n) * (Math.PI / 2); pts.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]); } };
    corner(w / 2 - r, h / 2 - r, 0); corner(-w / 2 + r, h / 2 - r, Math.PI / 2); corner(-w / 2 + r, -h / 2 + r, Math.PI); corner(w / 2 - r, -h / 2 + r, Math.PI * 1.5);
    return pts;
  };
  const ngon = (r, n) => Array.from({ length: n }, (_, i) => [r * Math.cos(((i + 0.5) / n) * TAU), r * Math.sin(((i + 0.5) / n) * TAU)]);
  const disc = (o, n, r, t, steps = 22) => {
    const ref = Math.abs(n[2]) > 0.9 ? [1, 0, 0] : [0, 0, 1];
    const u = K.unit3(K.cross3(ref, n));
    return K.prismOf(K.frameOf(o, n, u, K.cross3(n, u)), ngon(r, steps), -t, t, P);
  };

  // B3's snacks: a bar with a paper band, pitched forward by th about the x axis.
  const bar = (c, th) => {
    const a = [1, 0, 0], u = [0, Math.cos(th), -Math.sin(th)], v = [0, Math.sin(th), Math.cos(th)];
    const F = K.frameOf(c, a, u, v);
    const body = K.prismOf(F, rrect(C.BAR.d, C.BAR.h, 0.8), -C.BAR.w / 2, C.BAR.w / 2, P);
    const Fb = K.frameOf(K.add3(c, K.mul3(v, -0.5)), a, u, v);
    const band = K.prismOf(Fb, rrect(C.BAR.d + 0.4, 4, 0.5), -C.BAR.w / 2 - 0.2, C.BAR.w / 2 + 0.2, P);
    return (K.solidSvg(body, { tone: "hi", crease: "faint" })) + (K.solidSvg(band, { tone: "mid", crease: "faint" }));
  };

  // The coil: a helix about a y axis, split into the half behind its axis and the half in front.
  const H = C.HEL, cx = C.COLS[2], cz = C.TZ[1] + H.lift;
  const turn = (S.phi / TAU) * H.pitch;
  const th0 = Math.PI / 2 + S.phi;
  const back = [], front = [];
  let run = [], near = null;
  const n = Math.ceil(((H.y1 - H.y0) / H.pitch) * 32);
  for (let i = 0; i <= n; i++) {
    const y = H.y0 + ((H.y1 - H.y0) * i) / n;
    const a = th0 - (TAU * (H.y1 - y)) / H.pitch - Math.PI;
    const p = at([cx + H.r * Math.cos(a), y, cz + H.r * Math.sin(a)]);
    const facing = Math.cos(a) * 0.612 + Math.sin(a) * 0.5 > 0;
    if (near === null) near = facing;
    if (facing !== near) { run.push(p); (near ? front : back).push(K.pathOf(run)); run = [p]; near = facing; continue; }
    run.push(p);
  }
  if (run.length > 1) (near ? front : back).push(K.pathOf(run));
  const a0 = th0 - (TAU * (H.y1 - H.y0)) / H.pitch - Math.PI;
  const arm = K.segment([cx, H.y0, cz], [cx + H.r * Math.cos(a0), H.y0, cz + H.r * Math.sin(a0)], P);
  const hub = K.prismOf(K.frameOf([cx, H.y0 - 1.2, cz], [0, 1, 0], [0, 0, 1], [1, 0, 0]), ngon(3, 16), 0, 1.2, P);
  const bolts = [0, 1, 2].map((i) => { const t = S.phi + (i / 3) * TAU; return at([cx + 1.8 * Math.cos(t), H.y0, cz + 1.8 * Math.sin(t)]); });
  const snacks = [];
  C.SLOTS.forEach((y, i) => {
    if (i === 0 && S.snack !== "row") return;
    if (i === 5 && S.refill < 1) return;
    snacks.push(bar([cx, y + turn, C.TZ[1] + C.BAR.h / 2], 0));
  });
  snacks.reverse();
  const wire = (d) => (d ? `<path class="iso-line so-coil" data-tone="mid" data-free="" d="${d}"/>` : "");
  out.b3 = (K.solidSvg(hub, { tone: "hi" }) + wire(arm) + wire(back.join(""))) + K.dotsSvg(bolts, { size: 0.45, tone: "mid" }) + `<g style="opacity:${S.rowFade.toFixed(3)}">${snacks.join("")}</g>` + (wire(front.join("")));

  // The snack that falls, and the one lying in the bin.
  let drop = "";
  if (S.snack === "fall" || S.snack === "landed") drop = bar(S.drop.c, S.drop.th);
  out.drop = `<g style="opacity:${S.dropFade.toFixed(3)}">${drop}</g>`;

  // The coin, in whichever layer it is passing through.
  const c = S.coin;
  out.coinLayer = c.phase === "none" || c.phase === "done" ? "" : c.layer;
  out.coin = c.phase === "none" || c.phase === "done" ? "" : (K.solidSvg(disc(c.p, c.n, C.COIN.r, C.COIN.t), { tone: "hi", lit: S.duty === "" && c.phase !== "carry" && c.phase !== "toss", crease: "faint" }));

  // The gate flap hangs from its bar and swings back toward -y.
  const g = S.gate;
  const dir = [0, -Math.sin(g), -Math.cos(g)];
  const Fg = K.frameOf([C.COIN.x, C.GATE.y, C.GATE.z], dir, [1, 0, 0], K.cross3(dir, [1, 0, 0]));
  out.gate = (K.solidSvg(K.prismOf(Fg, [[-2.2, -0.4], [2.2, -0.4], [2.2, 0.4], [-2.2, 0.4]], 0, C.GATE.len, P), { tone: "hi", lit: S.gate > 0.05 && S.gate < 1.3 }));

  // The cash box's stack of coins.
  const sh = 1.1 * S.stack;
  const [sx, sy, sz] = C.STACK;
  const rims = [];
  for (let i = 1; i < S.stack; i++) rims.push(K.sideArc(sx, sy, C.COIN.r, sz + i * 1.1, P, 20));
  out.stack = (K.solidSvg(K.cylinder(sx, sy, C.COIN.r, sz, sh, P, 28), { tone: "hi" }) + K.lineSvg(rims.join(""), { tone: "faint" }));
  out.stackH = S.stack;

  // The hamster wheel (axis along y), its belt pulley, and the coil's big pulley.
  const W = C.WHEEL;
  const rungs = [], spokes = [];
  for (let i = 0; i < 22; i++) {
    const t = S.wheel + (i / 22) * TAU;
    rungs.push(K.segment([W.x + W.r * Math.cos(t), W.y0, W.z + W.r * Math.sin(t)], [W.x + W.r * Math.cos(t), W.y1, W.z + W.r * Math.sin(t)], P));
  }
  for (let i = 0; i < 6; i++) {
    const t = S.wheel + (i / 6) * TAU + 0.3;
    spokes.push(K.segment([W.x + 2.2 * Math.cos(t), W.y1, W.z + 2.2 * Math.sin(t)], [W.x + W.r * Math.cos(t), W.y1, W.z + W.r * Math.sin(t)], P));
  }
  out.rungs = (K.lineSvg(rungs.join(""), { tone: "mid" }));
  out.spokes = (K.lineSvg(spokes.join(""), { tone: "mid" }));
  const B = C.BIG, by = C.BELT_Y + 1;
  const big = [];
  for (let i = 0; i < 5; i++) {
    const t = S.phi + (i / 5) * TAU;
    big.push(K.segment([B.x + 1.1 * Math.cos(t), by, B.z + 1.1 * Math.sin(t)], [B.x + B.r * Math.cos(t), by, B.z + B.r * Math.sin(t)], P));
  }
  out.pulley = (K.lineSvg(big.join(""), { tone: "mid" }));

  // The keypad's B3 button.
  const press = S.press;
  const depth = 1.2 - 0.8 * press;
  const kx = C.KEYS.xs[2], kz = C.KEYS.zs[1];
  out.button = (K.solidSvg(K.slabOf({ x: kx - 1.7, y: 52, w: 3.4, d: depth, r: 0.5 }, kz - 1.7, 3.4, P, 2), { tone: "hi", lit: S.selected }));
  return out;
}

// --- where the crew stand, from the same state ------------------------------------------------------
function poses(C, S) {
  const TAU = Math.PI * 2;
  const c = S.coin;
  const ease = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

  // Dig stands on his ledge behind the coin rail and feels the coin with both paws.
  const digAt = [-42.5, C.DIG_Y, 114];
  const coinZ = 110.4 + (C.DIG_Y - 18) * (8.02 / 29.5) + 4.66;
  const holding = c.phase === "held";
  const near = c.phase === "rail" && c.p[1] < C.DIG_Y + 9;
  const reach = holding ? 1 : near ? ease((C.DIG_Y + 9 - c.p[1]) / 9) : c.phase === "rail2" ? Math.max(0, 1 - S.coinT * 3) : 0;
  const rest = (s) => [digAt[0] + 2.6, digAt[1] + s * 2.4, digAt[2] + 6.2];
  const grip = (s) => [-38.6, C.DIG_Y + s * 1.5, coinZ + 3.4];
  const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
  const dig = {
    at: digAt,
    heading: 0,
    lean: 6 * reach,
    look: [12, -26 * Math.max(reach, 0.3)],
    paws: { l: mix(rest(1), grip(1), reach), r: mix(rest(-1), grip(-1), reach) },
    eyes: holding ? (S.hold < 0.9 ? "shut" : "happy") : c.phase === "none" || c.phase === "done" || c.phase === "in" ? "shut" : "open",
    hop: holding && S.hold > 0.9 && S.hold < 1.4 ? 1.6 * Math.abs(Math.sin((S.hold - 0.9) * 12)) * Math.exp(-(S.hold - 0.9) * 4) : 0,
  };

  // Pip waits under the second rail, catches the coin, turns and drops it on the stack.
  const pt = S.pt;
  let heading = 90;
  if (pt > 0.2 && pt < 0.9) heading = 90 - 180 * ease((pt - 0.2) / 0.7);
  else if (pt >= 0.9 && pt < 1.4) heading = -90;
  else if (pt >= 1.4 && pt < 2.1) heading = -90 + 180 * ease((pt - 1.4) / 0.7);
  const h = (heading * Math.PI) / 180;
  const f = [Math.cos(h), Math.sin(h), 0], side = [-Math.sin(h), Math.cos(h), 0];
  const lean = pt > 0.9 && pt < 1.3 ? 14 * Math.sin((Math.PI * (pt - 0.9)) / 0.4) : 0;
  const reachOut = 3.4 + lean * 0.06;
  const held = [C.PIP[0] + f[0] * reachOut, C.PIP[1] + f[1] * reachOut, C.CATCH[2] - lean * 0.08];
  const waiting = c.phase === "low" || c.phase === "fall2";
  const carrying = c.phase === "carry";
  const up = waiting || carrying;
  const idle = (s) => [C.PIP[0] + f[0] * 2.6 + side[0] * s * 2.6, C.PIP[1] + f[1] * 2.6 + side[1] * s * 2.6, C.PIP[2] + 8];
  const hold = (s) => [held[0] + side[0] * s * 1.45, held[1] + side[1] * s * 1.45, held[2]];
  const pip = {
    at: C.PIP,
    heading,
    lean,
    look: waiting ? [0, 34] : carrying || c.phase === "toss" ? [0, -12] : [14, 4],
    paws: { l: up ? hold(1) : idle(1), r: up ? hold(-1) : idle(-1) },
    eyes: waiting ? "wide" : pt > 1.15 && pt < 2.6 ? "happy" : "open",
    squash: pt > 0 && pt < 0.2 ? 0.45 * Math.sin((Math.PI * pt) / 0.2) : 0,
    hop: 0,
    held,
    f,
    side,
  };

  // Bun and Mochi run on the bottom of the wheel.
  const W = C.WHEEL;
  const run = Math.min(1, S.omega * 1.4);
  const ham = (offset, phase) => {
    const a = (offset * Math.PI) / 180, R = W.r - 1.4;
    return {
      at: [W.x + R * Math.sin(a), (W.y0 + W.y1) / 2, W.z - R * Math.cos(a)],
      heading: 0,
      stance: "four",
      lean: 4 * run,
      look: [-10, 0],
      stride: { phase: (-S.wheel * W.r) / 4 + phase, amount: 0.13 * run },
      eyes: S.omega < 0.04 ? "shut" : S.omega > 0.9 ? "open" : "wide",
      squash: S.omega < 0.04 ? 0.35 : 0,
      hop: S.wakeT < 0.7 ? 2 * Math.exp(-5 * S.wakeT) * Math.abs(Math.sin(12 * S.wakeT + phase)) : 0,
    };
  };
  return { dig, pip, bun: ham(17, 0.5), mochi: ham(-17, 0) };
}

// --- static scene --------------------------------------------------------------------------------
function room() {
  const out = [];
  const { x0, x1, y0, y1, top } = ROOM;
  out.push((S(slab(x0, x1, y0 - 6, y0, C.FLOOR - 6, top), { tone: "mid" })));
  out.push((Ln(Array.from({ length: Math.floor((x1 - x0 - 12) / 12.5) + 1 }, (_, i) => k.segment([x0 + 8 + i * 12.5, y0, C.FLOOR], [x0 + 8 + i * 12.5, y0, top], P)).join(""), { tone: "faint" })));
  out.push((S(slab(x0 - 6, x0, y0 - 6, y1, C.FLOOR - 6, top), { tone: "mid" })));
  out.push((Ln(Array.from({ length: Math.floor((y1 - y0 - 12) / 12.5) + 1 }, (_, i) => k.segment([x0, y0 + 8 + i * 12.5, C.FLOOR], [x0, y0 + 8 + i * 12.5, top], P)).join(""), { tone: "faint" })));
  const tiles = [];
  for (let y = y0 + 14; y < y1; y += 14) tiles.push(k.lineOnTop([x0, y], [x1, y], C.FLOOR, P));
  for (let x = x0 + 14; x < x1; x += 14) tiles.push(k.lineOnTop([x, y0], [x, y1], C.FLOOR, P));
  out.push((S(slab(x0, x1, y0, y1, C.FLOOR - 6, C.FLOOR, 1, 4), { tone: "mid" }) + Ln(tiles.join(""), { tone: "faint" })));
  // A poster on the back wall.
  const px = 84, pw = 30, pz = 92, ph = 44;
  out.push((S(slab(px, px + pw, y0, y0 + 0.8, pz, pz + ph, 0.3, 2), { tone: "mid", crease: "faint" })));
  out.push((S(slab(px + 4, px + pw - 4, y0 + 0.8, y0 + 1.2, pz + 18, pz + ph - 4, 0.3, 2), { tone: "mid", crease: "none" })));
  out.push((Ln([[pz + 13, 20], [pz + 9, 14], [pz + 5, 17]].map(([z, w]) => k.segment([px + 5, y0 + 0.8, z], [px + 5 + w, y0 + 0.8, z], P)).join(""), { tone: "mid", free: true })));
  out.push((S(L.sphereOf([px + pw / 2, y0 + 1.6, pz + ph - 1.6], 1.2, P, { steps: 16 }), { tone: "hi" })));
  return out.join("");
}

function props() {
  const out = [];
  // A pot plant to the left of the machine.
  const [cx, cy] = [-84, 58];
  out.push((S(k.cylinder(cx, cy, 9, C.FLOOR, 16, P, 40, 0.8), { tone: "hi" }) + Ln(k.sideArc(cx, cy, 9, C.FLOOR + 12, P, 28), { tone: "faint" })));
  out.push(`<path class="so-void" d="${k.ring(cx, cy, 7.8, C.FLOOR + 16, P, 36)}"/>`);
  const leaves = [[0, 0, 30, 6, 3.4], [-5, 2, 24, 5, 2.8], [5, -2, 25, 5.2, 2.8], [2, 5, 21, 4.4, 2.6], [-3, -5, 22, 4.6, 2.6], [0, 0, 38, 4.2, 2.6]];
  const lv = leaves.map(([dx, dy, z, a, b]) => ({ c: [cx + dx, cy + dy, C.FLOOR + z], a, b })).sort((p, q) => k.depthOf(p.c, P) - k.depthOf(q.c, P));
  out.push((lv.map(({ c, a, b }) => S(ellipsoidOf(c, [[a, 0, 0], [0, a, 0], [0, 0, b * 2]], P, { steps: 28 }), { tone: "mid" })).join("")));
  out.push((S(k.cylinder(cx, cy, 1, C.FLOOR + 14, 10, P, 10), { tone: "mid" })));
  return out.join("");
}

function propsRight() {
  const [cx, cy] = [104, -56];
  return (S(k.cylinder(cx, cy, 11, C.FLOOR, 32, P, 44, 0.8), { tone: "hi" }) + Ln(k.sideArc(cx, cy, 11, C.FLOOR + 26, P, 32), { tone: "faint" })) + `<path class="so-void" d="${k.ring(cx, cy, 9.6, C.FLOOR + 32, P, 40)}"/>`;
}

function cabinetBack() {
  const out = [];
  const { x0, x1, y0, y1 } = C.CAB;
  for (const [x, y] of [[x0 + 8, y0 + 8], [x1 - 8, y0 + 8], [x0 + 8, y1 - 8], [x1 - 8, y1 - 8]].sort((a, b) => k.depthOf([...a, 0], P) - k.depthOf([...b, 0], P))) {
    out.push((S(k.cylinder(x, y, 4, C.FLOOR, 5, P, 24), { tone: "mid" })));
  }
  out.push((S(slab(x0, x1, y0, y1, 0, 6, 1, 4), { tone: "mid" })));
  out.push((S(slab(x0, x1, y0, y0 + 5, 6, 190), { tone: "mid" })));
  out.push((S(slab(x0, x0 + 5, y0 + 5, y1, 6, 190), { tone: "mid" })));
  out.push((Ln([60, 102, 144].map((z) => k.segment([x0 + 5, y0 + 5, z], [x0 + 5, y1, z], P)).join(""), { tone: "faint", free: "end" })));
  // The current's wire, from behind the keypad along the back wall to the wheel's bearing.
  out.push(k.wireSvg(at([-31, 47, 158]), at([63.5, -58.2, 109]), { via: [at([-31, -58.2, 158]), at([63.5, -58.2, 158])], tone: "lo", size: 0.9 }).replace('class="iso-line"', 'class="iso-line" data-part="wire"'));
  out.push((S(slab(-30, -27, y0 + 5, -12, 6, 190), { tone: "mid" })));
  return out.join("");
}

function cabinetTop() {
  const out = [];
  const { x0, x1, y0, y1, top } = C.CAB;
  const ring = [[x0, y0], [x1, y0], [x1, -44], [-27, -44], [-27, y1], [x0, y1]];
  out.push((S(k.extrude(ring, 190, top - 190, P, { convex: false }), { tone: "mid", crease: "faint" })));
  out.push((S(slab(-27, x1, 46, y1, 186, top), { tone: "mid" })));
  out.push((S(slab(-21, 70, y1, y1 + 0.6, 188, 194, 0.3, 2), { tone: "mid", crease: "none" })));
  out.push(D([[-24, y1, 191], [73, y1, 191]].map(at), { size: 0.5 }));
  return out.join("");
}

// The control column: cash box, Pip, the two coin rails, Dig, the gate and the panel.
function cashBoxBack() {
  const { x, y, w, d } = C.BOX, z0 = 6, z1 = C.BOX_TOP;
  return ([
    S(slab(x, x + w, y, y + d, z0, z0 + 1), { tone: "mid" }),
    S(slab(x, x + w, y, y + 1.5, z0 + 1, z1), { tone: "mid" }),
    S(slab(x, x + 1.5, y + 1.5, y + d, z0 + 1, z1), { tone: "mid" }),
  ].join(""));
}

function cashBoxFront() {
  const { x, y, w, d } = C.BOX, z0 = 6, z1 = C.BOX_TOP;
  return ([
    S(slab(x + w - 1.5, x + w, y + 1.5, y + d - 1.5, z0 + 1, z1), { tone: "mid" }),
    S(slab(x + 1.5, x + w, y + d - 1.5, y + d, z0 + 1, z1), { tone: "mid" }),
  ].join(""));
}

const beam = (A, B, xs, vs, tone = "hi") => {
  const a = L.unit3(L.sub3(B, A));
  let u = [1, 0, 0], v = L.cross3(a, u), flip = 1;
  if (v[2] < 0) { u = [-1, 0, 0]; v = L.cross3(a, u); flip = -1; }
  const [x0, x1] = flip > 0 ? xs : [-xs[1], -xs[0]];
  const len = L.len3(L.sub3(B, A));
  return (S(L.prismOf(L.frameOf(A, a, u, v), [[x0, vs[0]], [x1, vs[0]], [x1, vs[1]], [x0, vs[1]]], 0, len, P), { tone }));
};

function returnCup() {
  const out = [];
  out.push(beam([-50, 39, 111], [-50, 49, 101], [-2, 2], [-1, 0]));
  out.push(beam([-50, 39, 111], [-50, 49, 101], [1.6, 2.4], [0, 1.6]));
  out.push((S(slab(-55, -45, 45, 55, 94, 101, 1.2, 4), { tone: "hi" })));
  out.push(`<path class="so-void" d="${k.planOutline({ x: -53.5, y: 46.5, w: 7, d: 7, r: 1 }, 101, P, 4)}"/>`);
  return out.join("");
}

const lowFloor = () => beam(C.L0, C.L1, [-2, 2], [-1.2, 0]) + beam([-37, 14.8, 101.3], [-37, 16, 101], [-2, 2], [0, 5]);
const lowLip = () => beam(C.L0, C.L1, [1.6, 2.4], [0, 1.8]);
const upFloor = () => beam(C.R1, C.R0, [-2, 2], [-1.2, 0]);
const upLip = () => beam(C.R1, C.R0, [1.6, 2.4], [0, 1.8]);

function digLedge() {
  return (S(slab(-55, -40, 27, 39, 111, 114, 0.5, 3), { tone: "hi" }) + S(slab(-55, -51, 30, 36, 104, 111, 0.4, 2), { tone: "mid" }));
}

function gateBar() {
  const rod = (o, a, u, r, s0, s1, n) => L.prismOf(L.frameOf(o, a, u, L.cross3(a, u)), Array.from({ length: n }, (_, i) => [r * Math.cos(((i + 0.5) / n) * Math.PI * 2), r * Math.sin(((i + 0.5) / n) * Math.PI * 2)]), s0, s1, P);
  return (S(rod([-55, C.GATE.y, C.GATE.z], [1, 0, 0], [0, 1, 0], 0.7, 0, 25, 8), { tone: "hi" })) + (S(rod([-34, C.GATE.y, C.GATE.z], [1, 0, 0], [0, 1, 0], 1.8, 0, 4, 14), { tone: "hi" }));
}

function channel() {
  return (S(slab(-39.5, -34.5, 37, 38, 126, 146, 0.3, 2), { tone: "hi" }) + S(slab(-39.5, -34.5, 38, 47, 145, 146, 0.3, 2), { tone: "mid" }));
}

function panel() {
  const out = [];
  const Pn = C.PANEL;
  out.push((S(slab(Pn.x, Pn.x + Pn.w, Pn.y, Pn.y + Pn.d, Pn.z0, Pn.z1, 0.6, 3), { tone: "mid" })));
  out.push((S(slab(-53, -29, 52, 52.8, 174, 184, 0.6, 3), { tone: "hi" })));
  out.push(`<g class="so-lcd" data-part="lcd"></g>`);
  for (const [ri, z] of C.KEYS.zs.entries()) {
    for (const [ci, x] of C.KEYS.xs.entries()) {
      if (ri === 1 && ci === 2) { out.push(`<g data-part="button">${dyn0.button}</g>`); continue; }
      out.push((S(k.slabOf({ x: x - 1.7, y: 52, w: 3.4, d: 1.2, r: 0.5 }, z - 1.7, 3.4, P, 2), { tone: "hi" })));
    }
  }
  out.push((S(slab(-40, -34, 52, 52.8, 156, 170, 0.6, 3), { tone: "hi" })));
  out.push(voidPath([[-37.6, 52.8, 158], [-36.4, 52.8, 158], [-36.4, 52.8, 168], [-37.6, 52.8, 168]]));
  out.push(D([[-53.5, 52, 149], [-29, 52, 149], [-53.5, 52, 187], [-29, 52, 187]].map(at), { size: 0.5 }));
  return out.join("");
}

// The product side: three trays of three coils.
function tray(row) {
  const z = C.TZ[row];
  const out = [];
  for (const x of [-26, 52]) out.push((S(slab(x, x + 4, -59, -52, z - 8, z - 2, 0.4, 2), { tone: "mid" })));
  out.push((S(slab(-26, 56, -58, C.EDGE, z - 2, z, 0.8, 3), { tone: "mid" }) + Ln(k.lineOnTop([-26, C.EDGE - 2.5], [56, C.EDGE - 2.5], z, P), { tone: "faint" })));
  if (row === 1) out.push((S(slab(56, 74, -58, -36, z - 2, z, 0.6, 3), { tone: "mid" })));
  return out.join("");
}

function helixSvg(cx, cz, phi) {
  const H = C.HEL, TAU = Math.PI * 2;
  const th0 = Math.PI / 2 + phi;
  const back = [], front = [];
  let run = [], near = null;
  const n = Math.ceil(((H.y1 - H.y0) / H.pitch) * 32);
  for (let i = 0; i <= n; i++) {
    const y = H.y0 + ((H.y1 - H.y0) * i) / n;
    const a = th0 - (TAU * (H.y1 - y)) / H.pitch - Math.PI;
    const p = at([cx + H.r * Math.cos(a), y, cz + H.r * Math.sin(a)]);
    const facing = Math.cos(a) * 0.612 + Math.sin(a) * 0.5 > 0;
    if (near === null) near = facing;
    if (facing !== near) { run.push(p); (near ? front : back).push(k.pathOf(run)); run = [p]; near = facing; continue; }
    run.push(p);
  }
  if (run.length > 1) (near ? front : back).push(k.pathOf(run));
  const a0 = th0 - (TAU * (H.y1 - H.y0)) / H.pitch - Math.PI;
  const arm = k.segment([cx, H.y0, cz], [cx + H.r * Math.cos(a0), H.y0, cz + H.r * Math.sin(a0)], P);
  const wire = (d) => `<path class="iso-line so-coil" data-tone="mid" data-free="" d="${d}"/>`;
  const hub = L.prismOf(L.frameOf([cx, H.y0 - 1.2, cz], [0, 1, 0], [0, 0, 1], [1, 0, 0]), Array.from({ length: 16 }, (_, i) => [3 * Math.cos(((i + 0.5) / 16) * TAU), 3 * Math.sin(((i + 0.5) / 16) * TAU)]), 0, 1.2, P);
  return { back: (S(hub, { tone: "hi" }) + wire(arm) + wire(back.join(""))), front: (wire(front.join(""))) };
}

function snackSvg(row, col, y) {
  const cx = C.COLS[col], z = C.TZ[row];
  if (row === 1) {
    const b = C.BAR;
    return (S(slab(cx - b.w / 2, cx + b.w / 2, y - b.d / 2, y + b.d / 2, z, z + b.h, 0.8, 3), { tone: "hi" })) + (S(slab(cx - b.w / 2 - 0.2, cx + b.w / 2 + 0.2, y - b.d / 2 - 0.2, y + b.d / 2 + 0.2, z + 3.5, z + 7.5, 0.9, 3), { tone: "mid" }));
  }
  const g = C.BAG;
  return (S(slab(cx - g.w / 2, cx + g.w / 2, y - g.d / 2, y + g.d / 2, z, z + g.h, 2.2, 4), { tone: "hi" })) + (S(slab(cx - g.w / 2 - 0.3, cx + g.w / 2 + 0.3, y - 1, y + 1, z + g.h, z + g.h + 1.6, 0.4, 2), { tone: "mid" }));
}

function shelf(row) {
  const out = [tray(row)];
  const z = C.TZ[row];
  for (let col = 0; col < 3; col++) {
    const cx = C.COLS[col];
    if (row === 1 && col === 2) {
      out.push(driveBack());
      out.push(`<g data-part="b3">${dyn0.b3}</g>`);
      continue;
    }
    out.push((S(slab(cx - 5, cx + 5, -58, -49, z, z + 13, 1, 3), { tone: "hi" })));
    out.push(D([at([cx + 2.5, -49, z + 10])], { size: 0.55, tone: "mid" }));
    const h = helixSvg(cx, z + C.HEL.lift, 0);
    out.push(h.back);
    for (const y of [...C.SLOTS].reverse()) out.push(snackSvg(row, col, y));
    out.push(h.front);
  }
  return out.join("");
}

// B3's drive: the coil's shaft and big pulley, the belt, the wheel's axle and bearings.
const rodY = (x, z, r, y0, y1, n = 12) => L.prismOf(L.frameOf([x, y0, z], [0, 1, 0], [0, 0, 1], [1, 0, 0]), Array.from({ length: n }, (_, i) => [r * Math.cos(((i + 0.5) / n) * Math.PI * 2), r * Math.sin(((i + 0.5) / n) * Math.PI * 2)]), 0, y1 - y0, P);
function beltPath() {
  const B = C.BIG, Sm = C.SMALL, y = C.BELT_Y;
  const dx = Sm.x - B.x, dz = Sm.z - B.z, d = Math.hypot(dx, dz);
  const base = Math.atan2(dz, dx), off = Math.acos((B.r - Sm.r) / d);
  const pt = (c, r, t) => [c.x + r * Math.cos(t), y, c.z + r * Math.sin(t)];
  const arc = (c, r, t0, t1, n = 24) => Array.from({ length: n + 1 }, (_, i) => at(pt(c, r, t0 + ((t1 - t0) * i) / n)));
  const top = base + off, bottom = base - off;
  const pts = [...arc(B, B.r, top, bottom + Math.PI * 2, 40), ...arc(Sm, Sm.r, bottom, top, 12)];
  return k.pathOf(pts, true);
}
function driveBack() {
  const out = [];
  const B = C.BIG, y = C.BELT_Y;
  out.push((S(slab(B.x - 3, B.x + 3, -59, -56, B.z - 4, B.z + 4, 0.5, 2), { tone: "mid" })));
  out.push((S(slab(C.SMALL.x - 3, C.SMALL.x + 3, -59, -56, C.SMALL.z - 4, C.SMALL.z + 5, 0.5, 2), { tone: "mid" })));
  out.push((S(rodY(B.x, B.z, 1.1, -56, y - 1), { tone: "hi" })));
  out.push((S(L.prismOf(L.frameOf([B.x, y - 1, B.z], [0, 1, 0], [0, 0, 1], [1, 0, 0]), Array.from({ length: 40 }, (_, i) => [B.r * Math.cos(((i + 0.5) / 40) * Math.PI * 2), B.r * Math.sin(((i + 0.5) / 40) * Math.PI * 2)]), 0, 2, P), { tone: "hi" })));
  out.push((S(rodY(B.x, B.z, 1.1, y + 1, C.HEL.y0 - 1.2), { tone: "hi" })));
  out.push(`<g data-part="pulley">${dyn0.pulley}</g>`);
  out.push((S(rodY(C.SMALL.x, C.SMALL.z, 1, -56, y - 1), { tone: "hi" })));
  out.push((S(rodY(C.SMALL.x, C.SMALL.z, C.SMALL.r, y - 1, y + 1, 14), { tone: "hi" })));
  out.push((S(rodY(C.SMALL.x, C.SMALL.z, 1, y + 1, -40), { tone: "hi" })));
  out.push((`<path class="iso-line so-belt" data-tone="hi" d="${beltPath()}"/>`));
  return out.join("");
}

function wheelBack() {
  const W = C.WHEEL;
  const ring = (y) => k.pathOf(Array.from({ length: 64 }, (_, i) => at([W.x + W.r * Math.cos((i / 64) * Math.PI * 2), y, W.z + W.r * Math.sin((i / 64) * Math.PI * 2)])), true);
  return (Ln(ring(W.y0), { tone: "hi" })) + `<g data-part="rungs">${dyn0.rungs}</g>`;
}

function wheelFront() {
  const W = C.WHEEL;
  const ring = (y) => k.pathOf(Array.from({ length: 64 }, (_, i) => at([W.x + W.r * Math.cos((i / 64) * Math.PI * 2), y, W.z + W.r * Math.sin((i / 64) * Math.PI * 2)])), true);
  const out = [];
  out.push((Ln(ring(W.y1), { tone: "hi" })));
  out.push(`<g data-part="spokes">${dyn0.spokes}</g>`);
  out.push((S(rodY(W.x, W.z, 2.2, W.y1, W.y1 + 1.4, 14), { tone: "hi" })));
  out.push((S(slab(W.x - 2, W.x + 2, -41, -38, 92, W.z + 3, 0.5, 2), { tone: "hi" })));
  out.push(D([at([W.x, -38, W.z])], { size: 0.5, tone: "hi" }));
  return out.join("");
}

function binBack() {
  return ([
    S(slab(-18, 54, 18, 52, 6, C.BIN_Z, 1, 3), { tone: "mid" }),
    S(slab(-18, 54, 18, 20, C.BIN_Z, 20), { tone: "mid" }),
    S(slab(-18, -16, 20, 52, C.BIN_Z, 20), { tone: "mid" }),
  ].join(""));
}

function binFront() {
  return (S(slab(52, 54, 20, 52, C.BIN_Z, 20), { tone: "mid" }) + S(slab(-16, 52, 50, 52, C.BIN_Z, 12.5), { tone: "mid" }));
}

// --- first frame -----------------------------------------------------------------------------------
const FRESH_COIN = { phase: "none", p: [C.COIN.x, 62, C.SLOT_Z], n: [1, 0, 0], v: 0, vz: 0, layer: "front" };
const state0 = { phi: 0, wheel: 0.4, omega: 0, snack: "row", drop: { c: [42, 34, 99], th: 0 }, refill: 1, rowFade: 1, dropFade: 1, coin: FRESH_COIN, gate: 0, stack: 5, press: 0, selected: false, duty: "", hold: 0, pt: 0, coinT: 0, wakeT: 9 };
const dyn0 = dynamic({ ...k, ...L, ellipsoidOf }, P, C, state0);
const pose0 = poses(C, state0);
const crew = (spec, pose, part, duty = false) => critterSvg(critter(spec, pose, P), { part, duty });
const layer = (name) => `<g data-part="coin-${name}" class="so-subject"></g>`;

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "A snack vending machine in a hallway, with its front glass, right side and top cut away, run by cartoon animals. In the control column on the left, a softly glowing coin drops behind the keypad panel and rolls down a rail into the paws of Dig the mole, who feels it and lets it through a gate. It rolls down a second rail and drops to Pip the squirrel, who stacks it in the cash box. Three trays hold three spiral coils of snacks each. The middle-right coil, B3, is driven by a belt from a wire wheel where two hamsters run; one turn of the coil pushes the front snack off the tray into the bin at the bottom.",
  body: [
    `<defs>${subjectDefs()}</defs>`,
    room(),
    props(),
    cabinetBack(),
    cashBoxBack(),
    `<g data-part="stack">${dyn0.stack}</g>`,
    layer("box"),
    cashBoxFront(),
    layer("pipback"),
    crew(PIP, pose0.pip, "pip"),
    layer("pipfront"),
    returnCup(),
    lowFloor(),
    layer("low"),
    lowLip(),
    digLedge(),
    crew(DIG, pose0.dig, "dig"),
    gateBar(),
    `<g data-part="gate">${dyn0.gate}</g>`,
    upFloor(),
    layer("rail"),
    upLip(),
    layer("channel"),
    panel(),
    layer("front"),
    binBack(),
    shelf(2),
    shelf(1),
    wheelBack(),
    crew(MOCHI, pose0.mochi, "mochi"),
    crew(BUN, pose0.bun, "bun"),
    wheelFront(),
    `<g data-part="drop">${dyn0.drop}</g>`,
    binFront(),
    shelf(0),
    cabinetTop(),
    propsRight(),
  ],
});

// Reach checks: Dig's paws on the coin, Pip's paws on the coin while he turns.
{
  const held = { ...state0, coin: { ...FRESH_COIN, phase: "held", p: [C.COIN.x, C.DIG_Y, 120] }, hold: 0.5 };
  const c = critter(DIG, poses(C, held).dig, P);
  for (const [paw, short] of Object.entries(c.reach)) if (short > 0.3) console.warn(`Dig's ${paw} paw is ${short.toFixed(1)} short of the coin`);
  for (const pt of [0.1, 0.5, 1.0, 1.1]) {
    const s = { ...state0, coin: { ...FRESH_COIN, phase: "carry" }, pt };
    const p = critter(PIP, poses(C, s).pip, P);
    for (const [paw, short] of Object.entries(p.reach)) if (short > 0.3) console.warn(`Pip's ${paw} paw is ${short.toFixed(1)} short at t=${pt}`);
  }
}

const ROLE = { sensing: "#3E9BDB", moving: "#46A758", power: "#F5C518" };
const STEPS = [
  { title: "Meet the crew", who: "Dig, Pip, Bun and Mochi", color: "var(--anatomy-hi)", text: "Four animals run this snack machine: Dig on the coin rail, Pip at the cash box, Bun and Mochi in the wheel.", points: null, hold: 1.6 },
  { title: "A coin goes in", who: "the coin", color: "var(--anatomy-hi)", text: "A coin drops in behind the keypad and rolls down the rail into Dig's paws.", points: [[-56, 54, 186], [-28, 62, 150], [-37, 47.5, 108], [-50, 27, 134], [-37, 18, 108]] },
  { title: "Dig checks the coin", who: "Dig · sensing", color: ROLE.sensing, text: "Dig feels its size, thickness and metal, as a validator's coils do. It's good, so the gate opens: CREDIT 1.00.", points: [[-56, 52, 186], [-29, 52, 172], [-50, 27, 110], [-34, 42, 110], [-37, 16, 98]] },
  { title: "Pip stashes it", who: "Pip · moving", color: ROLE.moving, text: "The coin rolls down a second rail to Pip, who catches it, turns and stacks it in the cash box.", points: [[-37, 44, 100], [-53, 14, 4], [-30, 46, 4], [-30, 34, 30], [-46, 47, 30]] },
  { title: "You press B3, the hamsters run", who: "Bun and Mochi · power", color: ROLE.power, text: "Current runs down the wire to the wheel. Bun and Mochi run, and the belt turns coil B3 once for every four laps.", points: [[52, -52, 90], [75, -44, 117], [33, -56, 91], [50, -6, 106], [36, -6, 92]] },
  { title: "The snack drops into the bin", who: "the snack", color: "var(--anatomy-hi)", text: "One full turn pushes the front bar off the tray and into the bin. A cam switch cuts the current.", points: [[48, 40, 108], [36, 26, 92], [-18, 52, 6], [54, 52, 6], [54, 18, 22], [-53, 52, 184], [-29, 52, 174]], hold: 2 },
];
const views = STEPS.map((step) => (step.points ? fitView(step.points.map(at), [WIDTH, HEIGHT], { pad: 18, least: 0.34 }) : [0, 0, WIDTH, HEIGHT]));

const live = `
const P = ${JSON.stringify(P)};
const C = ${JSON.stringify(C)};
const DIG = ${JSON.stringify(DIG)}, PIP = ${JSON.stringify(PIP)}, BUN = ${JSON.stringify(BUN)}, MOCHI = ${JSON.stringify(MOCHI)};
const STEP_INFO = ${JSON.stringify(STEPS.map(({ title, text, who, hold, pace }) => ({ title, text, who, hold, pace })))};
const VIEWS = ${JSON.stringify(views.map((v) => v.map((n) => +n.toFixed(2))))};
const COLORS = ${JSON.stringify(STEPS.map((step) => step.color))};
const K = { iso, pathOf, extrude, cylinder, slabOf, segment, sideArc, solidSvg, lineSvg, dotsSvg, ...CREW };
const dynamic = ${dynamic.toString()};
const poses = ${poses.toString()};
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const part = (name) => svg.querySelector('[data-part="' + name + '"]');
const el = { b3: part("b3"), drop: part("drop"), gate: part("gate"), stack: part("stack"), rungs: part("rungs"), spokes: part("spokes"), pulley: part("pulley"), button: part("button"), lcd: part("lcd"), wire: part("wire"), dig: part("dig"), pip: part("pip"), bun: part("bun"), mochi: part("mochi") };
const layers = {};
for (const name of ["box", "pipback", "pipfront", "low", "rail", "channel", "front"]) layers[name] = part("coin-" + name);
const readout = document.querySelector("[data-readout]");
const TAU = Math.PI * 2;
const RATE = 1.3 * TAU;
const G = 420;
const upZ = (y) => C.R1[2] + (y - C.R1[1]) * ((C.R0[2] - C.R1[2]) / (C.R0[1] - C.R1[1])) + 4.66;
const lowZ = (y) => C.L0[2] + (y - C.L0[1]) * ((C.L1[2] - C.L0[2]) / (C.L1[1] - C.L0[1])) + 4.64;
const freshCoin = () => ({ phase: "none", p: [C.COIN.x, 62, C.SLOT_Z], n: [1, 0, 0], v: 0, vz: 0, layer: "front", from: null, tt: 0 });
const FRESH = { phi: 0, omega: 0, on: false, snack: "row", drop: { c: [C.COLS[2], C.EDGE, C.TZ[1] + C.BAR.h / 2], th: 0, t: 0 }, landT: 0, refill: 1, rowFade: 1, dropFade: 1, gate: 0, press: -1, pressT: 0, selected: false, credit: 0, msg: "INSERT COIN", duty: "", hold: 0, pt: 0, coinT: 0, wakeT: 9, swap: -1, stepT: 0 };
const S = { ...FRESH, coin: freshCoin(), wheel: 0.4, stack: 5 };
const snaps = [];
let lastPose = {}, lastMsg = "";
const ease = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
function stepCoin(dt) {
  const c = S.coin;
  S.coinT += dt;
  const at = (phase, layer) => { c.phase = phase; c.layer = layer; S.coinT = 0; };
  if (c.phase === "in") {
    c.p[1] = Math.max(C.CH_Y, c.p[1] - 34 * dt);
    c.layer = c.p[1] > 52.6 ? "front" : "channel";
    if (c.p[1] <= C.CH_Y) { at("drop", "channel"); c.vz = 0; }
  } else if (c.phase === "drop") {
    c.vz += G * dt; c.p[2] -= c.vz * dt;
    if (c.p[2] <= upZ(C.CH_Y)) { c.p[2] = upZ(C.CH_Y); at("rail", "rail"); c.v = 10; }
  } else if (c.phase === "rail" || c.phase === "rail2") {
    const stop = c.phase === "rail" ? C.DIG_Y : C.R1[1] - 0.6;
    const left = c.p[1] - stop;
    c.v = Math.min(c.phase === "rail" ? Math.max(6, left * 6) : 40, c.v + 70 * dt);
    c.p[1] = Math.max(stop, c.p[1] - c.v * dt);
    c.p[2] = upZ(Math.max(C.R1[1], c.p[1]));
    if (c.p[1] <= stop + 0.01) {
      if (c.phase === "rail") { at("held", "rail"); S.hold = 0; }
      else { at("fall1", "low"); c.vz = 0; }
    }
  } else if (c.phase === "held") {
    S.hold += dt;
    if (S.hold > 0.9) S.gate = Math.min(1.35, S.gate + dt * 3.4);
    if (S.hold > 1 && S.credit === 0) { S.credit = 1; S.msg = "CREDIT 1.00"; }
    if (S.hold > 1.45) { at("rail2", "rail"); c.v = 4; }
  } else if (c.phase === "fall1") {
    c.vz += G * dt; c.p[2] -= c.vz * dt; c.p[1] -= 2 * dt;
    if (c.p[2] <= lowZ(c.p[1])) { c.p[2] = lowZ(c.p[1]); at("low", "low"); c.v = 6; }
  } else if (c.phase === "low") {
    c.v = Math.min(40, c.v + 70 * dt);
    c.p[1] += c.v * dt;
    c.p[2] = lowZ(Math.min(C.L1[1], c.p[1]));
    if (c.p[1] >= C.CATCH[1]) { c.p[1] = C.CATCH[1]; at("fall2", "pipfront"); c.vz = c.v * 0.2; }
  } else if (c.phase === "fall2") {
    c.vz += G * dt; c.p[2] -= c.vz * dt;
    if (c.p[2] <= C.CATCH[2]) { c.p[2] = C.CATCH[2]; at("carry", "pipfront"); S.pt = 0; }
  }
  if (c.phase === "carry" || c.phase === "toss" || (c.phase === "done" && S.pt < 3)) S.pt += dt;
  if (c.phase === "carry") {
    const p = poses(C, S).pip;
    c.p = [...p.held]; c.n = [...p.side];
    const bodyDepth = K.dot3 ? 0 : 0;
    const depth = (q) => (q[0] * 0.707 + q[1] * 0.707) * 0.866 + q[2] * 0.5;
    c.layer = depth(c.p) >= depth([C.PIP[0], C.PIP[1], C.PIP[2] + 9]) ? "pipfront" : "pipback";
    if (S.pt >= 1.05) { c.phase = "toss"; c.from = [...c.p]; c.nFrom = [...c.n]; c.tt = 0; c.layer = "box"; }
  } else if (c.phase === "toss") {
    c.tt = Math.min(1, c.tt + dt / 0.38);
    const to = [C.STACK[0], C.STACK[1], C.STACK[2] + 1.1 * S.stack + C.COIN.t];
    const t = ease(c.tt);
    c.p = c.from.map((v, i) => v + (to[i] - v) * t);
    c.p[2] += 3 * Math.sin(Math.PI * c.tt);
    const nn = c.nFrom.map((v, i) => v * (1 - t) + [0, 0, 1][i] * t);
    const len = Math.hypot(...nn) || 1;
    c.n = nn.map((v) => v / len);
    if (c.tt >= 1) { c.phase = "done"; S.stack = Math.min(14, S.stack + 1); }
  }
}
function stepVend(dt) {
  if (S.press >= 0) {
    S.pressT += dt;
    S.press = S.pressT < 0.12 ? S.pressT / 0.12 : Math.max(0, 1 - (S.pressT - 0.25) / 0.15);
    if (S.pressT > 0.12 && !S.selected) { S.selected = true; S.msg = "B3  1.00"; }
    if (S.pressT > 0.7 && S.credit > 0) { S.credit = 0; S.msg = "VENDING"; S.on = true; }
    if (S.pressT > 0.7) S.press = -1;
  }
  const before = S.omega;
  if (S.on && S.phi >= TAU - 0.24) S.on = false;
  S.omega = S.omega + ((S.on ? 1 : 0) - S.omega) * (1 - Math.exp(-dt / (S.on ? 0.35 : 0.12)));
  if (!S.on && S.omega < 0.01) { S.omega = 0; if (S.phi > TAU - 0.3) S.phi = TAU; }
  if (S.on && S.omega > 0.995) S.omega = 1;
  if (before === 0 && S.omega > 0) S.wakeT = 0; else S.wakeT += dt;
  S.wheel -= S.omega * RATE * dt;
  S.phi = Math.min(TAU, S.phi + (S.omega * RATE * dt) / C.RATIO);
  const front = C.SLOTS[0] + (S.phi / TAU) * C.HEL.pitch;
  if (S.snack === "row" && front >= C.EDGE) { S.snack = "fall"; S.drop = { c: [C.COLS[2], C.EDGE, C.TZ[1] + C.BAR.h / 2], th: 0, t: 0 }; }
  if (S.snack === "fall") {
    const d = S.drop, T = 0.62;
    d.t = Math.min(T, d.t + dt);
    const z0 = C.TZ[1] + C.BAR.h / 2, zEnd = C.BIN_Z + C.BAR.d / 2, g = (2 * (z0 - zEnd)) / (T * T);
    d.c = [C.COLS[2], C.DROP_Y - (C.DROP_Y - C.EDGE) * Math.exp(-d.t / 0.1), z0 - 0.5 * g * d.t * d.t];
    d.th = (Math.PI / 2) * ease(d.t / T);
    if (d.t >= T) { S.snack = "landed"; S.landT = 0; }
  } else if (S.snack === "landed") {
    S.landT += dt;
    const b = S.landT < 0.3 ? 1.6 * Math.sin((Math.PI * S.landT) / 0.3) : 0;
    S.drop.c = [C.COLS[2], C.DROP_Y, C.BIN_Z + C.BAR.d / 2 + b];
    S.drop.th = Math.PI / 2;
    if (S.omega === 0 && S.landT > 0.3 && S.msg !== "ENJOY!") { S.msg = "ENJOY!"; S.selected = false; }
  }
}
function step(dt) {
  S.stepT += dt;
  stepCoin(dt);
  stepVend(dt);
  const c = S.coin;
  let duty = "";
  if (c.phase === "held" || (c.phase === "rail" && c.p[1] < C.DIG_Y + 6)) duty = "dig";
  else if (c.phase === "carry" || c.phase === "toss" || (c.phase === "done" && S.pt < 2.1) || c.phase === "fall2") duty = "pip";
  else if (S.omega > 0.02) duty = "squad";
  S.duty = duty;
  if (S.swap >= 0) {
    S.swap += dt / 0.9;
    if (S.swap >= 0.5 && S.snack !== "row") {
      Object.assign(S, { phi: 0, snack: "row", refill: 1, msg: "INSERT COIN", gate: 0, credit: 0, selected: false, coin: freshCoin(), pt: 9 });
    }
    S.rowFade = S.dropFade = Math.abs(Math.cos(Math.PI * Math.min(1, S.swap)));
    if (S.swap >= 1) { S.swap = -1; S.rowFade = S.dropFade = 1; }
  }
}
function paintCrew(name, node, spec, pose, duty) {
  const key = JSON.stringify(pose) + duty;
  if (lastPose[name] === key) return;
  lastPose[name] = key;
  CREW.paintCritter(node, CREW.critter(spec, pose, P));
  node.toggleAttribute("data-duty", duty);
}
const lcdAt = iso([-41, 52.85, 177.6], P);
function draw() {
  const D = dynamic(K, P, C, S);
  el.b3.innerHTML = D.b3; el.drop.innerHTML = D.drop; el.gate.innerHTML = D.gate;
  el.rungs.innerHTML = D.rungs; el.spokes.innerHTML = D.spokes; el.pulley.innerHTML = D.pulley; el.button.innerHTML = D.button;
  if (el.stack.__n !== D.stackH) { el.stack.innerHTML = D.stack; el.stack.__n = D.stackH; }
  for (const [name, node] of Object.entries(layers)) { const html = name === D.coinLayer ? D.coin : ""; if (html || node.__full) { node.innerHTML = html; node.__full = !!html; } }
  if (lastMsg !== S.msg) { lastMsg = S.msg; el.lcd.innerHTML = faceTextSvg(sideMatrix([-41, 52.85], 177.6, P, "left"), S.msg, { size: 3.3, anchor: "middle", tone: "hi" }); }
  el.wire.toggleAttribute("data-flow", S.on);
  const p = poses(C, S);
  paintCrew("dig", el.dig, DIG, (({ at, heading, lean, look, paws, eyes, hop }) => ({ at, heading, lean, look, paws, eyes, hop }))(p.dig), S.duty === "dig");
  paintCrew("pip", el.pip, PIP, (({ at, heading, lean, look, paws, eyes, squash, hop }) => ({ at, heading, lean, look, paws, eyes, squash, hop }))(p.pip), S.duty === "pip");
  paintCrew("bun", el.bun, BUN, p.bun, S.duty === "squad");
  paintCrew("mochi", el.mochi, MOCHI, p.mochi, S.duty === "squad");
  const c = S.coin;
  const word = S.swap >= 0 ? "restocking" : S.snack === "landed" ? "enjoy" : S.snack === "fall" ? "dropping" : S.on ? "vending B3" : c.phase === "held" ? "checking coin" : c.phase === "none" || c.phase === "done" ? (S.credit ? "choose a snack" : "insert coin") : "coin in";
  const text = word + " · credit " + S.credit.toFixed(2) + " · " + S.stack + " coins banked";
  if (readout.textContent !== text) readout.textContent = text;
}
const DONE = [
  () => S.swap < 0 && S.stepT > 0.3,
  () => S.coin.phase === "held",
  () => S.credit === 1 && S.coin.phase === "low" && S.coin.p[1] > 26,
  () => S.coin.phase === "done" && S.pt >= 2.25,
  () => S.on && C.SLOTS[0] + (S.phi / TAU) * C.HEL.pitch >= 30 && S.omega > 0.97,
  () => S.snack === "landed" && S.omega === 0 && S.msg === "ENJOY!" && S.stepT > 1.2,
];
const snap = () => JSON.parse(JSON.stringify(S));
function enter(i, how) {
  if (how === "back" && snaps[i]) { Object.assign(S, JSON.parse(JSON.stringify(snaps[i]))); lastPose = {}; lastMsg = ""; S.stepT = 0; draw(); return; }
  if (i === 0) {
    if (how === "loop") { S.swap = 0; S.on = false; }
    else Object.assign(S, { ...JSON.parse(JSON.stringify(FRESH)), coin: freshCoin(), wheel: S.wheel, stack: S.stack, pt: 9 });
  }
  if (i === 1 && (S.coin.phase === "none" || S.coin.phase === "done")) { S.coin = freshCoin(); S.coin.phase = "in"; S.pt = 9; }
  if (i === 4 && S.press < 0 && !S.selected) { S.press = 0; S.pressT = 0; }
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
  advance: step,
  save: snap,
  load: (x) => { Object.assign(S, JSON.parse(JSON.stringify(x))); lastPose = {}; lastMsg = ""; },
});
`;

const keys = [
  { mark: "lit", label: "On duty: whoever is doing the work right now" },
  { mark: "raised", label: "Dig, mole, sensing: feels every coin on the coin rail" },
  { mark: "raised", label: "Pip, squirrel, moving: catches coins and stacks them in the cash box" },
  { mark: "raised", label: "Bun and Mochi, hamsters, power: run the wheel that turns coil B3" },
];

const css = `${crewCss()}${STEPS_CSS}
.so-void{fill:var(--anatomy-halo);opacity:.55;stroke:var(--anatomy-lo);stroke-width:var(--anatomy-weight)}
.so-coil{stroke-width:.95px}
.so-belt{stroke-width:1.6px}
.so-lcd .iso-face-text{font-weight:600;letter-spacing:.08em}
.iso-stage{touch-action:pan-y;cursor:pointer;overflow:hidden}
.iso-stage:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:6px}`;

const body = `<style>${css}</style>` + k.plateHtml({
  fig: "Fig 1",
  title: "Vending machine, staffed",
  hint: "Plays on its own, on a loop",
  readout: "insert coin · credit 0.00 · 5 coins banked",
  keys,
  caption:
    "A snack vending machine with its front glass, right side and top cut away, shown one step at a time. A coin rolls down the coin rail past a validator and through a gate into the cash box; pressing B3 sends current to that coil's motor, which turns the spiral coil exactly once, pushing the front snack off the tray and into the bin.",
  body: `<div class="iso-stage" tabindex="0" role="group" aria-label="Vending machine, step by step: arrow keys move between steps, Space plays or pauses">${svg.replace('<g class="so-lcd" data-part="lcd"></g>', `<g class="so-lcd" data-part="lcd">${k.faceTextSvg(k.sideMatrix([-41, 52.85], 177.6, P, "left"), "INSERT COIN", { size: 3.3, anchor: "middle", tone: "hi" })}</g>`)}</div>${stepsHtml(STEPS)}`,
});

const file = theme === "light" ? "vending-machine-light.html" : "vending-machine.html";
writeFileSync(join(HERE, file), k.pageHtml({ title: "Vending machine, staffed", theme, body, script: kitScript() + crewScript() + stepsScript() + live, width: 680 }));
console.log("wrote", file);
