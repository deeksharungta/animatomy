import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { critter, critterSvg, crewCss, ellipsoidOf } from "../../kit/critters.mjs";
import { kitScript, glScript, crewScript, stepsScript } from "../../scripts/inline-kit.mjs";
import { glCamera } from "../../kit/gl.mjs";
import { STEPS_CSS, stepsHtml, fitView } from "../../kit/steps.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";

const WIDTH = 600;
const HEIGHT = 520;

// World units are about 1.55 mm of the real toaster. Mechanism coordinates are (y, z) on the
// face of the mechanism plate, which stands at x = 56..58 and faces the open +x end.
const C = {
  BODY: { x: -90, y: -48, w: 180, d: 96, r: 14 },
  PAN: 5,
  FLOOR: 12,
  WALL_TOP: 108,
  TOP: 112,
  CUT_Y: -2,
  FACE: 58,
  SLOTS: [-17, 17],
  BREAD: { x0: -52, x1: 24, h: 70, t: 10 },
  BOARDS: [-34, 0, 34],
  BOARD: { x0: -86, x1: 54, z0: 16, z1: 104 },
  FRONT_CUT: 46,
  UP: 72,
  BOTTOM: 21,
  ROD: [63, 14],
  ROD_R: 1.4,
  ROD_Z: [18, 100],
  PIN: { y: 5, x0: 60, x1: 70, r: 1.3 },
  PIV: [-4, 52],
  LEV: [63, 65],
  LEVER: [[2, 1.5], [-20, 1.5], [-20, -1.5], [-2, -1.5], [-2, -22], [11, -22], [11, -21.2], [2, -18.6]],
  STRIP: { y: -42, z: 44.2, len: 22, x0: 59, x1: 65, t: 0.8 },
  MM: 1.4,
  BEND: 0.045,
  SHAFT: [-28, 22],
  STUB: 30,
  CAM_E: 1.4,
  KNOB_TURN: 176,
  KNOB_A0: 0.3,
  KNOB_ARM: 10,
  BOOK: { x: 94, y: -46, w: 20, d: 26, r: 1.5, h: 12 },
  // The live wire's run beside the mains wire, from its terminal on the contact post back toward the cord.
  LIVE: [[69, 22.6, 14.6], [74.6, 17.4, 14.3], [74.6, -12, 14.3], [73.2, -19, 14.3], [69, -27, 14.3], [67.5, -40, 14.3]],
  TERMINAL: [67, 22.4, 16],
};

// Real numbers. A brass-steel strip 40 mm long and 0.5 mm thick bends about 0.045 mm per kelvin at
// its tip (specific deflection about 14e-6 per K). The drawing shows the bend 1.4 units per mm,
// about twice the scale of the body, so it can be seen.
const T0 = 20;
const HEAT = { strip: 230, tauStrip: 165, coolStrip: 75, element: 620, tauElement: 5, bread: 290, tauBread: 55, water: 72 };

const MO = { species: "sloth", name: "Mo", size: 18, role: "sensing", wear: ["glasses",  "stopwatch"] };
const DIG = { species: "mole", name: "Dig", size: 18, role: "holding", wear: ["minerhat"] };
const ROCKY = { species: "raccoon", name: "Rocky", size: 24, role: "sensing", wear: ["glasses",  "pencil"] };
const ROO = { species: "kangaroo", name: "Roo", size: 17, role: "spring", wear: ["sweatband",  "whistle"] };
const VOLTA = { species: "eel", name: "Volta", size: 50, role: "power", wear: ["hardhat"] };

const DESK = { x: -150, y: -96, w: 286, d: 214, r: 6 };
const ROOM_TOP = 165;
const P = k.fitProjection(
  [...k.boxCorners(DESK, -16, 0), [DESK.x, DESK.y - 6, ROOM_TOP], [DESK.x + DESK.w, DESK.y - 6, ROOM_TOP], [DESK.x - 6, DESK.y + DESK.d, ROOM_TOP], [-14, 17, C.UP + C.BREAD.h + 14]],
  WIDTH,
  HEIGHT,
  { pad: 12, azimuth: 45 },
);

const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const Ln = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const K = { ...k, ...L, ellipsoidOf };
const byDepth = (pts) => [...pts].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));

const ngon = (r, n = 8) => Array.from({ length: n }, (_, i) => [r * Math.cos(((i + 0.5) / n) * Math.PI * 2), r * Math.sin(((i + 0.5) / n) * Math.PI * 2)]);
const rodAlong = (o, a, u, r, s0, s1, n = 8) => L.prismOf(L.frameOf(o, a, u, L.cross3(a, u)), ngon(r, n), s0, s1, P);
const alongX = (y, z, r, x0, x1, n = 12) => rodAlong([x0, y, z], [1, 0, 0], [0, 1, 0], r, 0, x1 - x0, n);
const alongY = (x, z, r, y0, y1, n = 10) => rodAlong([x, y0, z], [0, 1, 0], [1, 0, 0], r, 0, y1 - y0, n);
const ringX = (x, y0, y1, z0, z1, rr, n = 6) => {
  const pts = [];
  const arc = (cy, cz, a0) => { for (let i = 0; i <= n; i++) { const t = a0 + (i / n) * (Math.PI / 2); pts.push(at([x, cy + rr * Math.cos(t), cz + rr * Math.sin(t)])); } };
  arc(y1 - rr, z1 - rr, 0); arc(y0 + rr, z1 - rr, Math.PI / 2); arc(y0 + rr, z0 + rr, Math.PI); arc(y1 - rr, z0 + rr, Math.PI * 1.5);
  return k.pathOf(pts, true);
};
const ringY = (y, x0, x1, z0, z1, rr, n = 6) => {
  const pts = [];
  const arc = (cx, cz, a0) => { for (let i = 0; i <= n; i++) { const t = a0 + (i / n) * (Math.PI / 2); pts.push(at([cx + rr * Math.cos(t), y, cz + rr * Math.sin(t)])); } };
  arc(x1 - rr, z1 - rr, 0); arc(x0 + rr, z1 - rr, Math.PI / 2); arc(x0 + rr, z0 + rr, Math.PI); arc(x1 - rr, z0 + rr, Math.PI * 1.5);
  return k.pathOf(pts, true);
};
const circleX = (x, cy, cz, r, n = 40) => k.pathOf(Array.from({ length: n }, (_, i) => at([x, cy + r * Math.cos((i / n) * Math.PI * 2), cz + r * Math.sin((i / n) * Math.PI * 2)])), true);
const circleY = (y, cx, cz, r, n = 40) => k.pathOf(Array.from({ length: n }, (_, i) => at([cx + r * Math.cos((i / n) * Math.PI * 2), y, cz + r * Math.sin((i / n) * Math.PI * 2)])), true);
const voidOf = (d) => `<path class="so-void" d="${d}"/>`;

// A plan with its own radius at each corner, for walls and plates that are cut on some sides.
const planRing = (x0, y0, x1, y1, [r0, r1, r2, r3], steps = 8) => {
  const out = [];
  const corner = (cx, cy, r, a0) => {
    if (r <= 0) { out.push([cx, cy]); return; }
    for (let i = 0; i <= steps; i++) { const a = ((a0 + (90 * i) / steps) * Math.PI) / 180; out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
  };
  corner(x1 - r0, y0 + r0, r0, -90); corner(x1 - r1, y1 - r1, r1, 0); corner(x0 + r2, y1 - r2, r2, 90); corner(x0 + r3, y0 + r3, r3, 180);
  return out;
};

// Everything that moves is rebuilt from the state by this one function, at build time and in the page.
function dynamic(K, P, C, S) {
  const at = (p) => K.iso(p, P);
  const out = {};
  const cam = K.cameraOf(P);
  const V = [cam.cosA * cam.cosE, cam.sinA * cam.cosE, cam.sinE];
  const Lraw = [-cam.sinA, cam.cosA, 1.2], Ll = Math.hypot(Lraw[0], Lraw[1], Lraw[2]);
  const Lt = Lraw.map((v) => v / Ll);
  const band = (s) => (s >= 0.62 ? 4 : s >= 0.42 ? 3 : s >= 0.2 ? 2 : s >= 0 ? 1 : 0);
  const area = (pts) => { let a = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p[0] * q[1] - q[0] * p[1]; } return a / 2; };
  const orient = (pts) => (area(pts) < 0 ? [...pts].reverse() : pts);
  // A flat part cut from sheet: any outline in the (y, z) plane of the mechanism plate, thickness along x.
  const plateX = (poly, x0, x1) => {
    const ring = area(poly) < 0 ? [...poly].reverse() : poly;
    const n = ring.length;
    const lo = ring.map(([y, z]) => at([x0, y, z])), hi = ring.map(([y, z]) => at([x1, y, z]));
    const buckets = [[], [], [], [], []];
    const seen = [];
    for (let j = 0; j < n; j++) {
      const [y0, z0] = ring[j], [y1, z1] = ring[(j + 1) % n];
      const len = Math.hypot(y1 - y0, z1 - z0) || 1;
      const nm = [0, (z1 - z0) / len, -(y1 - y0) / len];
      const vis = nm[1] * V[1] + nm[2] * V[2] > 1e-6;
      seen.push(vis);
      if (vis) buckets[band(nm[1] * Lt[1] + nm[2] * Lt[2])].push(K.pathOf(orient([lo[j], lo[(j + 1) % n], hi[(j + 1) % n], hi[j]]), true));
    }
    buckets[band(Lt[0])].push(K.pathOf(orient(hi), true));
    const outline = [], crease = [];
    for (let j = 0; j < n; j++) {
      const a = hi[j], b = hi[(j + 1) % n];
      if (seen[j]) { crease.push(K.pathOf([a, b])); outline.push(K.pathOf([lo[j], lo[(j + 1) % n]])); }
      else outline.push(K.pathOf([a, b]));
      const prev = (j - 1 + n) % n;
      if (seen[prev] !== seen[j]) outline.push(K.pathOf([lo[j], hi[j]]));
      else if (seen[prev] && seen[j]) {
        const p = ring[prev], c = ring[j], q = ring[(j + 1) % n];
        const u = [c[0] - p[0], c[1] - p[1]], w = [q[0] - c[0], q[1] - c[1]];
        const cos = (u[0] * w[0] + u[1] * w[1]) / ((Math.hypot(u[0], u[1]) * Math.hypot(w[0], w[1])) || 1);
        if (cos < Math.cos(0.35)) crease.push(K.pathOf([lo[j], hi[j]]));
      }
    }
    const fill = [K.pathOf(orient(hi), true), ...buckets.flat()].join("");
    return { fill, outline: outline.join(""), crease: crease.join(""), top: buckets[4].join(""), shades: buckets.slice(0, 4).map((list) => list.join("")) };
  };

  // Lever (latch): rotate a local point clockwise by phi about the pivot; phi > 0 lifts the tail.
  const [py, pz] = C.PIV;
  const ph = S.phi, cs = Math.cos(ph), sn = Math.sin(ph);
  const lev = ([u, v]) => [py + u * cs + v * sn, pz - u * sn + v * cs];
  const lever = C.LEVER.map(lev);
  const litLever = S.duty === "dig";
  out.lever = `${K.solidSvg(plateX(lever, C.LEV[0], C.LEV[1]), { tone: "hi", lit: litLever })}`;
  out.levFace = (u, v) => { const [y, z] = lev([u, v]); return [C.LEV[1] + 0.2, y, z]; };

  // Browning cam: an eccentric on the knob's shaft. Turning the knob toward dark drops the follower,
  // and the strip's bracket with it, so the strip must curl further before it reaches the hook.
  const camTh = ((S.knob ?? 0) * C.KNOB_TURN * Math.PI) / 180;
  const lift = C.CAM_E * (Math.cos(camTh) - 1);
  out.lift = lift;
  out.camTh = camTh;
  // Bimetal strip: a uniform temperature bends it into a circular arc whose curvature grows with the rise.
  const St = { ...C.STRIP, z: C.STRIP.z + lift };
  const kap = Math.max(1e-6, (2 * C.MM * C.BEND * (S.strip - 20)) / (St.len * St.len));
  const curve = [];
  for (let i = 0; i <= 14; i++) {
    const s = (St.len * i) / 14, th = kap * s;
    curve.push({ y: St.y + Math.sin(th) / kap, z: St.z + (1 - Math.cos(th)) / kap, ny: -Math.sin(th), nz: Math.cos(th) });
  }
  const layer = (o0, o1) => [...curve.map((c) => [c.y + c.ny * o1, c.z + c.nz * o1]), ...[...curve].reverse().map((c) => [c.y + c.ny * o0, c.z + c.nz * o0])];
  const litStrip = S.duty === "";
  out.strip = `${K.solidSvg(plateX(layer(-2 * St.t, -St.t), St.x0, St.x1), { tone: "hi", crease: "lo" })}${K.solidSvg(plateX(layer(-St.t, 0), St.x0, St.x1), { tone: "hi", crease: "lo", lit: litStrip })}`;
  const tip = curve[curve.length - 1];
  out.tip = [tip.y, tip.z];
  const along = (s) => { const th = kap * s; return [St.y + Math.sin(th) / kap, St.z + (1 - Math.cos(th)) / kap]; };
  out.grip = [along(St.len - 0.8), along(St.len - 4)];

  // Upper contact leaf: a spring strip from its post, pressed down by the carriage foot.
  const foot = S.zb - 4;
  const leafZ = Math.min(20.4, Math.max(18.2, foot - 0.4));
  out.leafZ = leafZ;
  out.leaf = `${K.solidSvg(plateX([[21, 20.4], [21, 21.2], [9, leafZ + 0.8], [9, leafZ]], 63, 67), { tone: "hi", crease: "lo" })}`;
  out.spark = S.on ? K.dotsSvg([at([67, 9.6, leafZ - 0.3])], { size: 0.7, tone: "hi" }) : "";

  // Lift spring: an extension spring round the guide rod, from the carriage top to the top bracket.
  const [rx, ry] = C.ROD;
  const z0 = S.zb + 6 + 7, z1 = C.ROD_Z[1];
  const turns = 11, per = 18, R = 3.1;
  const back = [], front = [];
  let runB = [], runF = [];
  for (let i = 0; i <= turns * per; i++) {
    const t = (i / per) * Math.PI * 2;
    const z = z0 + ((z1 - z0) * i) / (turns * per);
    const x = rx + R * Math.cos(t + Math.PI / 4), y = ry + R * Math.sin(t + Math.PI / 4);
    const near = (x - rx) * V[0] + (y - ry) * V[1] >= 0;
    const p = at([x, y, z]);
    if (near) { if (runB.length) { runB.push(p); back.push(runB); runB = []; } runF.push(p); }
    else { if (runF.length) { runF.push(p); front.push(runF); runF = []; } runB.push(p); }
  }
  if (runB.length) back.push(runB);
  if (runF.length) front.push(runF);
  out.springBack = `${K.lineSvg(back.map((r) => K.pathOf(r)).join(""), { tone: "lo" })}`;
  out.springFront = `${K.lineSvg(front.map((r) => K.pathOf(r)).join(""), { tone: "mid" })}`;

  // The browning knob on the end wall, with a pointer lever on its face. The lever sweeps round the back
  // (-y) side of the dial, low at setting 1 (light) and up toward 5 (dark): Rocky lifts it to set darker.
  {
    const [sy, sz] = C.SHAFT;
    const knobF = K.frameOf([90.6, sy, sz], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
    const a = Math.PI + C.KNOB_A0 - camTh;
    const d = [Math.cos(a), Math.sin(a)], n = [-d[1], d[0]];
    const pt = (r, w) => [d[0] * r + n[0] * w, d[1] * r + n[1] * w];
    const arm = [pt(-1.8, -1.2), pt(C.KNOB_ARM, -0.75), pt(C.KNOB_ARM + 0.6, 0), pt(C.KNOB_ARM, 0.75), pt(-1.8, 1.2)];
    const lit = S.duty === "rocky";
    out.knobFace = K.solidSvg(K.solidOf([[0, 5.6], [5, 5.6], [5.8, 4.9, 1]], knobF, P, { steps: 40 }), { tone: "hi", inner: K.lineSvg(K.ribsOf(knobF, 0.4, 4.6, 5.6, 28, P, { phase: 0.2 - camTh / (Math.PI * 2) }), { tone: "faint" }), lit }) + K.solidSvg(K.prismOf(knobF, arm, 5.8, 7.3, P), { tone: "hi", lit });
    // Where Rocky can take hold: the lever's top face, along its length.
    out.knobArm = { o: [90.6 + 7.3, sy, sz], d };
    // The cam and its follower, carrying the strip's bracket.
    const camC = [60, sy + C.CAM_E * Math.sin(camTh), sz + C.CAM_E * Math.cos(camTh)];
    out.cam = K.solidSvg(K.disc(0, 4, 6, K.frameOf(camC, [1, 0, 0], [0, 1, 0], [0, 0, 1]), P, { steps: 40 }), { tone: "hi" }) + K.dotsSvg([at([64, sy, sz])], { size: 0.5, tone: "hi" });
  }
  // Toasting: a darker crust colour laid over the bread as it browns.
  out.brown = Math.min(0.62, S.brown * 0.5);
  out.glow = S.glow;
  return out;
}

function poses(C, S, D) {
  const [ty, tz] = D.tip;
  const [g0, g1] = D.grip;
  const lift = tz - C.STRIP.z;
  const mo = {
    at: [C.STRIP.x1 + 2.8, ty - 3.9, tz - 16.5],
    heading: 40,
    stance: "hang",
    lean: -3,
    look: [-14, 18 - lift],
    paws: { l: [C.STRIP.x1 - 0.4, g0[0], g0[1] + 0.3], r: [C.STRIP.x1 - 0.4, g1[0], g1[1] + 0.3] },
    eyes: S.moEyes,
    hop: 0,
  };
  // Dig leans his belly on the hook's back face and grips its two edges.
  const a = D.levFace(-2, -19.5), b = D.levFace(-2, -20.5);
  const back = Math.max(0, S.phi) * 18;
  const dig = {
    at: [64, a[1] - 4.9, 24],
    heading: 90,
    lean: S.strain ? 14 : back > 0.4 ? 2 : 9,
    look: [-12, 8],
    paws: { l: [C.LEV[0] - 0.1, a[1] - 1.2, a[2]], r: [C.LEV[1] + 0.1, b[1] - 1.2, b[2]] },
    eyes: S.digEyes,
    squash: S.strain ? 0.2 : 0,
  };
  // Rocky, on a stack of books by the end wall, works the browning knob's lever: both paws on it,
  // sliding along it to stay where he can reach as it swings.
  const rAt = [99, -38.8, C.BOOK.h];
  const arm = D.knobArm;
  const sh = [rAt[1] + 2.6, rAt[2] + 10.4];
  const t = Math.max(3.6, Math.min(C.KNOB_ARM - 0.6, (sh[0] - arm.o[1]) * arm.d[0] + (sh[1] - arm.o[2]) * arm.d[1]));
  const on = (r) => [arm.o[0], arm.o[1] + arm.d[0] * r, arm.o[2] + arm.d[1] * r];
  const rocky = {
    at: rAt,
    heading: 96,
    lean: 6 + 6 * Math.min(1, Math.abs(S.knobV ?? 0)),
    look: [0, -4],
    paws: { l: on(t + 0.6), r: on(t - 1) },
    eyes: S.knob > 0.02 && S.knob < 0.73 ? "wide" : "open",
  };
  // Roo stands on the lever knob: she stamps it down, rides it, and the pop throws her up.
  const zs = S.zb + 6;
  const roo = {
    at: [63.5, 56.5, zs + 4.5],
    heading: 120,
    lean: S.hand ? 12 : 2,
    look: [0, S.hand ? -10 : 6],
    squash: S.hand ? 0.38 : S.latched ? 0.12 : 0,
    hop: (S.hop ?? 0) * 1.5,
    eyes: S.hop > 0.5 ? "wide" : S.on ? "open" : S.brown > 0.5 ? "happy" : "open",
  };
  // Volta lies along the live wire with his snout on its terminal. While the contacts are closed his
  // current runs through them into the ribbons, and he crackles with it.
  const volta = {
    path: C.LIVE,
    charge: S.on ? 1 : 0,
    flicker: S.on ? Math.floor((S.stepT ?? 0) * 14) : 0,
    target: S.on ? C.TERMINAL : undefined,
    eyes: S.on ? (S.glow > 0.9 ? "happy" : "wide") : S.brown > 0.5 && S.zb >= C.UP - 0.1 ? "happy" : "shut",
  };
  return { mo, dig, rocky, roo, volta };
}

const REST = { knob: 0, knobT: 0, knobV: 0, zb: C.UP, v: 0, hand: false, phi: 0, latched: false, strip: T0, element: T0, glow: 0, bread: T0, water: 1, brown: 0, hop: 0, hv: 0, on: false, duty: "", moEyes: "shut", digEyes: "open", strain: false, clock: 0, warp: 1, fade: 1, swap: -1, stepT: 0 };
const dyn0 = dynamic(K, P, C, REST);
const pose0 = poses(C, REST, dyn0);

// ---------------------------------------------------------------- scene

function room() {
  const out = [];
  const back = { x: DESK.x, y: DESK.y - 6, w: DESK.w, d: 6, r: 0.6 };
  const side = { x: DESK.x - 6, y: DESK.y - 6, w: 6, d: DESK.d + 6, r: 0.6 };
  out.push((S(k.slabOf(back, -16, ROOM_TOP + 16, P, 2), { tone: "mid" })));
  const yb = DESK.y;
  const hTiles = [], sTiles = [];
  const xe = DESK.x + DESK.w;
  for (let z = 14; z < ROOM_TOP; z += 16) hTiles.push(k.pathOf([at([DESK.x, yb, z]), at([xe, yb, z]), at([xe, yb - 6, z])]));
  for (let i = 1; i < 20; i++) { const x = DESK.x + i * 16; if (x < DESK.x + DESK.w - 1) sTiles.push(k.segment([x, yb, 0], [x, yb, ROOM_TOP], P)); }
  out.push((Ln(hTiles.join("") + sTiles.join(""), { tone: "faint" })));
  out.push((S(k.slabOf(side, -16, ROOM_TOP + 16, P, 2), { tone: "mid" })));
  const hs = [], vs = [];
  const ye = DESK.y + DESK.d;
  for (let z = 14; z < ROOM_TOP; z += 16) hs.push(k.pathOf([at([DESK.x, yb, z]), at([DESK.x, ye, z]), at([DESK.x - 6, ye, z])]));
  for (let i = 1; i < 16; i++) { const y = yb + i * 16; if (y < DESK.y + DESK.d - 1) vs.push(k.segment([DESK.x, y, 0], [DESK.x, y, ROOM_TOP], P)); }
  out.push((Ln(hs.join("") + vs.join(""), { tone: "faint" })));
  // Wall clock: a clock would burn the second batch; the strip doesn't.
  const cx = -40, cz = 136, R = 15;
  out.push((S(L.disc(0, 3, R, L.frameOf([cx, yb, cz], [0, 1, 0], [1, 0, 0], [0, 0, 1]), P), { tone: "hi" })));
  out.push((Ln(circleY(yb + 3, cx, cz, R - 2.4, 48), { tone: "faint" })));
  const ticks = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2, l = i % 3 === 0 ? 3 : 1.6;
    ticks.push(k.segment([cx + (R - 2.4) * Math.sin(a), yb + 3, cz + (R - 2.4) * Math.cos(a)], [cx + (R - 2.4 - l) * Math.sin(a), yb + 3, cz + (R - 2.4 - l) * Math.cos(a)], P));
  }
  out.push((Ln(ticks.join(""), { tone: "mid" })));
  out.push((Ln(k.segment([cx, yb + 3.2, cz], [cx + 7, yb + 3.2, cz + 5], P), { tone: "hi", free: "end" }) + Ln(k.segment([cx, yb + 3.2, cz], [cx - 2, yb + 3.2, cz + 11], P), { tone: "hi", free: "end" })));
  out.push(D([at([cx, yb + 3.3, cz])], { size: 0.7, tone: "hi" }));
  // Wall socket with the plug in it.
  const sx = 104, sz = 34;
  out.push((S(k.slabOf({ x: sx - 11, y: yb, w: 22, d: 2.4, r: 1.6 }, sz - 11, 22, P, 3, 0.4), { tone: "hi" })));
  out.push((Ln(ringY(yb + 2.4, sx - 8, sx + 8, sz - 8, sz + 8, 2), { tone: "faint" })));
  out.push(D([at([sx - 9, yb + 2.4, sz]), at([sx + 9, yb + 2.4, sz])], { size: 0.45 }));
  out.push((S(k.slabOf({ x: sx - 5, y: yb + 2.4, w: 10, d: 7, r: 2 }, sz - 6, 12, P, 3, 0.4), { tone: "hi" })));
  out.push((S(alongY(sx, sz - 3, 2.2, yb + 9.4, yb + 13, 12), { tone: "hi" })));
  return out.join("");
}

function desk() {
  const grain = [];
  for (let y = DESK.y + 10; y < DESK.y + DESK.d - 8; y += 12) grain.push(k.lineOnTop([DESK.x, y], [DESK.x + DESK.w, y], 0, P));
  return (S(k.slabOf(DESK, -16, 16, P, 6, 1.2), { tone: "mid" }) + Ln(grain.join(""), { tone: "faint" }));
}

function cord() {
  const yb = DESK.y;
  const from = at([60, -48, 3]);
  const to = at([104, yb + 13, 31]);
  return `${k.wireSvg(from, to, { via: [at([60, -62, 1.2]), at([90, -74, 1.2]), at([104, -84, 1.2]), at([104, yb + 13, 1.2])], tone: "lo", size: 1, ends: "to" })}`;
}

function propsBack() {
  const out = [];
  // Jam jar with a gingham lid.
  const [jx, jy] = [-120, -30];
  out.push(`<path class="iso-halo" d="${k.haloOf({ x: jx - 13, y: jy - 13, w: 26, d: 26, r: 13 }, 0, 2, P)}"/>`);
  out.push((S(k.cylinder(jx, jy, 11, 0, 26, P, 40, 0.6), { tone: "hi", inner: Ln(k.sideArc(jx, jy, 11, 4, P, 32) + k.sideArc(jx, jy, 11, 22, P, 32), { tone: "faint" }) })));
  out.push((S(k.cylinder(jx, jy, 11.2, 9, 9, P, 40), { tone: "mid", crease: "none" })));
  out.push((Ln(k.sideArc(jx, jy, 11.2, 11.5, P, 32) + k.sideArc(jx, jy, 11.2, 15.5, P, 32), { tone: "faint" })));
  out.push((S(k.cylinder(jx, jy, 10.2, 26, 5, P, 40, 0.5), { tone: "hi" }) + Ln(k.knurl(jx, jy, 10.2, 26, 31, 40, P, 0.6), { tone: "faint" })));
  return out.join("");
}

function propsFront() {
  const out = [];
  // A plate with yesterday's toast and a butter knife.
  const [px, py] = [-62, 78];
  out.push(`<path class="iso-halo" d="${k.haloOf({ x: px - 30, y: py - 30, w: 60, d: 60, r: 30 }, 0, 2, P)}"/>`);
  out.push((S(k.cylinder(px, py, 26, 0, 1.6, P, 64), { tone: "mid" })));
  out.push((S(k.cylinder(px, py, 30, 1.6, 2, P, 72, 0.6), { tone: "hi" }) + Ln(k.ring(px, py, 21, 3.6, P, 64), { tone: "faint" })));
  const slice = [[px - 16, py - 15], [px + 12, py - 16], [px + 16, py - 11], [px + 16, py + 12], [px - 12, py + 15], [px - 17, py + 10]];
  out.push((S(k.extrude(slice, 3.6, 5, P, { bevel: 0.8 }), { tone: "mid" })));
  out.push((Ln(k.onTop(slice.map(([x, y]) => [px + (x - px) * 0.8, py + (y - py) * 0.8]), 8.6, P, true), { tone: "faint" })));
  out.push((S(k.slabOf({ x: px - 6, y: py - 5, w: 11, d: 8, r: 1.2 }, 8.6, 2.4, P, 3, 0.4), { tone: "hi" })));
  const kf = { x: px + 30, y: py - 4, w: 34, d: 4, r: 2 };
  out.push((S(k.slabOf(kf, 0, 1.2, P, 3, 0.3), { tone: "hi" })));
  out.push((S(k.slabOf({ x: px + 50, y: py - 4.6, w: 20, d: 5.2, r: 2.4 }, 0, 3.2, P, 4, 0.5), { tone: "hi" })));
  out.push(D([at([px + 56, py - 2, 3.2]), at([px + 64, py - 2, 3.2])], { size: 0.45 }));
  // Mug of tea.
  const [mx, my] = [128, 14];
  out.push(`<path class="iso-halo" d="${k.haloOf({ x: mx - 13, y: my - 13, w: 26, d: 26, r: 13 }, 0, 2, P)}"/>`);
  out.push((S(k.cylinder(mx, my, 11, 0, 26, P, 48, 0.5), { tone: "hi", inner: Ln(k.sideArc(mx, my, 11, 3, P, 32), { tone: "faint" }) })));
  out.push(voidOf(k.ring(mx, my, 9.8, 26, P, 48)));
  out.push((S(k.cylinder(mx, my, 9.8, 20, 2, P, 48), { tone: "lo", crease: "none" })));
  out.push((S(L.ringBand(0, 2.4, 3.4, 5.8, L.frameOf([mx + 14, my - 1.2, 13], [0, 1, 0], [1, 0, 0], [0, 0, 1]), P, { steps: 32, hole: [2.4, 3.4] }), { tone: "hi" })));
  return out.join("");
}

// ---------------------------------------------------------------- toaster

function base() {
  const B = C.BODY;
  const out = [`<path class="iso-halo" d="${k.haloOf(B, 0, 6, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(B, 16))) out.push((S(k.cylinder(x, y, 6, 0, 1.2, P, 28), { tone: "mid" }) + S(k.cylinder(x, y, 4.6, 1.2, C.PAN - 1.2, P, 28), { tone: "mid" })));
  const seam = k.sideSeam(B, C.PAN + 3.5, P, 8);
  out.push((S(k.slabOf(B, C.PAN, C.FLOOR - C.PAN, P, 8, 1.2), { tone: "mid", inner: Ln(seam, { tone: "faint" }) })));
  out.push((Ln(k.planOutline(k.insetPlan(B, 4), C.FLOOR, P, 8), { tone: "faint" })));
  // Crumb tray pull on the open end.
  out.push((S(k.slabOf({ x: B.x + B.w - 1, y: -10, w: 4, d: 20, r: 1.4 }, C.PAN + 0.6, 3, P, 3, 0.3), { tone: "hi" })));
  out.push(D([[-80, -40], [80, -40], [-80, 40], [80, 40]].map(([x, y]) => at([x, y, C.FLOOR])), { size: 0.5 }));
  return out.join("");
}

function shellBack() {
  const out = [];
  const wall = [];
  const arc = (cx, cy, r, a0, a1, n = 8) => { const p = []; for (let i = 0; i <= n; i++) { const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180; p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } return p; };
  wall.push(...arc(76, -34, 14, 0, -90), ...arc(-76, -34, 14, -90, -180), [-90, 30], [-88, 30], ...arc(-76, -34, 12, 180, 270), ...arc(76, -34, 12, 270, 360));
  out.push((S(k.extrude(wall, C.FLOOR, C.WALL_TOP - C.FLOOR, P, { convex: false }), { tone: "mid", crease: "faint" })));
  out.push((Ln(k.segment([-88, -34, C.FLOOR], [-88, -34, C.WALL_TOP], P) + k.segment([76, -46, C.FLOOR], [76, -46, C.WALL_TOP], P), { tone: "faint" })));
  // Rating plate riveted inside the back wall.
  out.push((S(k.slabOf({ x: -60, y: -46, w: 26, d: 0.6, r: 0.3 }, 70, 14, P, 2), { tone: "hi" })));
  out.push((Ln([[-57, 80, 16], [-57, 77, 12], [-57, 74, 18]].map(([x, z, w]) => k.segment([x, -45.4, z], [x + w, -45.4, z], P)).join(""), { tone: "mid", free: true })));
  out.push(D([[-58.5, 82], [-35.5, 82], [-58.5, 72], [-35.5, 72]].map(([x, z]) => at([x, -45.4, z])), { size: 0.45 }));
  return out.join("");
}

function topPlate() {
  const out = [];
  const ring = planRing(-90, -48, 56, C.CUT_Y, [0, 0, 0, 14]);
  out.push((S(k.extrude(ring, C.WALL_TOP, C.TOP - C.WALL_TOP, P, { bevel: 0.8 }), { tone: "mid" })));
  const slot = { x: -60, y: C.SLOTS[0] - 7, w: 92, d: 14, r: 4 };
  out.push(voidOf(k.planOutline(slot, C.TOP, P, 6)));
  out.push((Ln(k.planOutline(k.insetPlan(slot, -2.4), C.TOP, P, 6), { tone: "faint" })));
  out.push(D([[-82, -40], [48, -40], [-82, -8], [48, -8]].map(([x, y]) => at([x, y, C.TOP])), { size: 0.5 }));
  return out.join("");
}

function board(y, z1) {
  const B = C.BOARD;
  const out = [];
  const plan = { x: B.x0, y: y - 0.6, w: B.x1 - B.x0, d: 1.2, r: 0.3 };
  const wires = [];
  const face = y + 0.6;
  for (let x = B.x0 + 6; x < B.x1 - 6; x += 5) wires.push(k.segment([x, face, z1], [x + 3, face, B.z0], P));
  out.push((S(k.slabOf(plan, B.z0, z1 - B.z0, P, 2), { tone: "mid", crease: "faint" })));
  out.push(`${Ln(wires.join(""), { tone: "lo" })}`);
  out.push(D([at([B.x0 + 2.5, face, B.z0 + 3]), at([B.x0 + 2.5, face, z1 - 3])], { size: 0.5 }));
  return out.join("");
}

function guards(y) {
  const out = [];
  const bar = (z) => S(alongX(y, z, 0.7, -88, 56, 8), { tone: "mid" });
  const lines = [-60, -36, -12, 12, 36].map((x) => k.segment([x, y, C.BOARD.z0 + 0.7], [x, y, C.BOARD.z1 - 0.7], P)).join("");
  out.push((bar(C.BOARD.z0) + Ln(lines, { tone: "mid" }) + bar(C.BOARD.z1)));
  return out.join("");
}

function rack(y) {
  const plan = { x: -60, y: y - 6, w: 112, d: 12, r: 1.5 };
  const z = C.UP - 1.4;
  return (S(k.slabOf(plan, z, 1.4, P, 3, 0.3), { tone: "hi" }) + Ln(k.planOutline(k.insetPlan(plan, 2.4), C.UP, P, 3), { tone: "faint" }));
}

function breadShape() {
  const { x0, x1, h } = C.BREAD;
  const pts = [];
  const r = 4, cxm = (x0 + x1) / 2, shoulder = h - 16;
  for (let i = 0; i <= 4; i++) { const a = Math.PI + (i / 4) * (Math.PI / 2); pts.push([x0 + r + r * Math.cos(a), r + r * Math.sin(a)]); }
  for (let i = 0; i <= 4; i++) { const a = -Math.PI / 2 + (i / 4) * (Math.PI / 2); pts.push([x1 - r + r * Math.cos(a), r + r * Math.sin(a)]); }
  const half = (x1 - x0) / 2, rise = 16;
  const Rr = (half * half + rise * rise) / (2 * rise);
  const a0 = Math.asin(half / Rr);
  for (let i = 0; i <= 16; i++) { const a = a0 - (i / 16) * 2 * a0; pts.push([cxm + Rr * Math.sin(a), shoulder - (Rr - rise) + Rr * Math.cos(a)]); }
  return pts;
}

function bread(y, extra = "") {
  const { t } = C.BREAD;
  const shape = breadShape();
  const F = L.frameOf([0, y - t / 2, C.UP], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const paths = L.prismOf(F, shape, 0, t, P);
  const cx = (C.BREAD.x0 + C.BREAD.x1) / 2;
  const crust = k.pathOf(shape.map(([x, z]) => at([cx + (x - cx) * 0.9, y + t / 2, C.UP + 3 + (z - 3) * 0.9])), true);
  const holes = [];
  for (let i = 0; i < 26; i++) {
    const u = (i * 0.6180339 + 0.13) % 1, v = (i * 0.7548777 + 0.41) % 1;
    holes.push(at([C.BREAD.x0 + 10 + u * (C.BREAD.x1 - C.BREAD.x0 - 20), y + t / 2, C.UP + 8 + v * (C.BREAD.h - 26)]));
  }
  const inner = Ln(crust, { tone: "faint" });
  return `${S(paths, { tone: "mid", inner })}${D(holes, { size: 0.45, tone: "lo" })}<path class="tz-toast" data-toast d="${paths.fill}" style="opacity:${dyn0.brown}"/>${extra}`;
}

function mechPlate() {
  const out = [];
  const plate = { x: 56, y: -46, w: 2, d: 76, r: 0.5 };
  // The plate has a real window cut in it (a mask), so the heaters' glow behind shows through.
  out.push(`<g mask="url(#tz-win)">${S(k.slabOf(plate, C.FLOOR, 104 - C.FLOOR, P, 2), { tone: "mid" })}</g>`);
  out.push(S(k.slabOf({ x: 56, y: -41, w: 2, d: 16, r: 0.05 }, 46.6, 0.4, P, 1), { tone: "lo" }));
  out.push(S(k.slabOf({ x: 56, y: -41.4, w: 2, d: 0.4, r: 0.05 }, 47, 15, P, 1), { tone: "lo" }));
  out.push(Ln(ringX(C.FACE, -41, -25, 47, 62, 2), { tone: "mid" }));
  out.push(D([[-43, 15], [-43, 100], [27, 100], [27, 15], [-43, 60]].map(([y, z]) => at([C.FACE, y, z])), { size: 0.5 }));
  // Carriage slot, and the window onto the toasting chamber.
  out.push(voidOf(ringX(C.FACE, 12, 16, 18, 86, 2)));
  out.push(([-37, -33, -29].map((y) => S(k.slabOf({ x: C.FACE - 1, y: y - 0.6, w: 1.4, d: 1.2, r: 0.2 }, 47, 15, P, 2), { tone: "mid" })).join("")));
  // Wiring: the lower contact feeds the elements through a grommet in the plate.
  out.push((S(alongX(1, 17, 1.6, C.FACE, C.FACE + 1, 14), { tone: "mid" })));
  return out.join("");
}

function rodStatic(front) {
  const [rx, ry] = C.ROD;
  if (!front) {
    return ([
      S(k.slabOf({ x: C.FACE, y: ry - 5, w: rx - C.FACE + 4, d: 10, r: 1 }, C.ROD_Z[0] - 4, 4, P, 3, 0.4), { tone: "hi" }),
      S(k.slabOf({ x: C.FACE, y: ry - 5, w: rx - C.FACE + 4, d: 10, r: 1 }, C.ROD_Z[1], 4, P, 3, 0.4), { tone: "hi" }),
      D([at([rx + 2.4, ry - 3.4, C.ROD_Z[1] + 4]), at([rx + 2.4, ry + 3.4, C.ROD_Z[1] + 4]), at([rx + 2.4, ry - 3.4, C.ROD_Z[0]]), at([rx + 2.4, ry + 3.4, C.ROD_Z[0]])], { size: 0.45 }),
    ].join(""));
  }
  return (S(k.cylinder(rx, ry, C.ROD_R, C.ROD_Z[0], C.ROD_Z[1] - C.ROD_Z[0], P, 16), { tone: "hi", crease: "none" }));
}

function contacts() {
  const out = [];
  out.push((S(k.slabOf({ x: C.FACE, y: 5, w: 13, d: 18, r: 1 }, C.FLOOR, 3, P, 3, 0.4), { tone: "mid" })));
  out.push((S(k.slabOf({ x: 63, y: 6, w: 4, d: 2.4, r: 0.4 }, 15, 2.6, P, 2), { tone: "hi" }) + S(k.slabOf({ x: 63, y: 7, w: 4, d: 12, r: 0.3 }, 17, 0.8, P, 2), { tone: "hi" })));
  out.push((S(k.slabOf({ x: 63, y: 20, w: 4, d: 2.4, r: 0.4 }, 15, 6.2, P, 2), { tone: "hi" })));
  out.push(D([at([65, 7.2, 17.6]), at([65, 21.2, 21.2])], { size: 0.5, tone: "hi" }));
  // Mains in from the back, out through the switch to the elements.
  out.push(`${k.wireSvg(at([66, -46, 14]), at([67, 22.4, 16]), { via: [at([66, -30, 13.6]), at([71, -20, 13.6]), at([71, 22.4, 13.6])], tone: "lo", size: 0.9, ends: "to" }).replace('class="iso-line"', 'class="iso-line" data-part="wire"')}`);
  out.push(`${k.wireSvg(at([63, 7.2, 16]), at([C.FACE + 1, 1, 17]), { tone: "lo", size: 0.9, ends: "from" }).replace('class="iso-line"', 'class="iso-line" data-part="wire2"')}`);
  return out.join("");
}

function ledge() {
  const plan = { x: C.FACE, y: -19, w: 16, d: 12, r: 1 };
  return (S(k.slabOf(plan, 21, 3, P, 3, 0.4), { tone: "hi" }) + Ln(k.planOutline(k.insetPlan(plan, 2), 24, P, 3), { tone: "faint" })) + D([at([C.FACE + 3, -16, 24]), at([C.FACE + 3, -10, 24])], { size: 0.45 });
}

function pivot() {
  const [py, pz] = C.PIV;
  return (S(alongX(py, pz, 1.1, C.FACE, C.LEV[1] + 1.4, 12), { tone: "hi" }) + S(alongX(py, pz, 2, C.LEV[1], C.LEV[1] + 0.8, 16), { tone: "hi" }));
}

function adjuster() {
  const out = [];
  const [sy, sz] = C.SHAFT;
  // Browning knob shaft, cam and the strip's mounting bracket that rests on it.
  out.push((S(alongX(sy, sz, 1.2, C.FACE, 93, 12), { tone: "hi", crease: "none" })));
  return out.join("");
}

// The cam's follower and the strip's bracket: drawn at the top of the cam, moved by the knob in the page.
function follower() {
  const out = [];
  const [, sz] = C.SHAFT;
  const camTop = sz + C.CAM_E + 6;
  out.push((S(L.prismOf(L.frameOf([C.FACE, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]), [[-45, camTop], [-24, camTop], [-24, camTop + 2], [-45, camTop + 2]], 0, 6, P), { tone: "hi" })));
  out.push((S(alongX(-43, camTop + 1, 0.9, C.FACE, C.FACE + 7, 10), { tone: "hi" })));
  const St = C.STRIP;
  out.push((S(k.slabOf({ x: St.x0 - 0.5, y: St.y - 3, w: St.x1 - St.x0 + 1, d: 5, r: 0.6 }, camTop + 2, St.z - 2 * St.t - camTop - 2, P, 3, 0.3), { tone: "hi" })));
  return out.join("");
}

function book() {
  const B = C.BOOK, out = [];
  const lower = { x: B.x, y: B.y, w: B.w, d: B.d, r: 0.8 };
  const upper = { x: B.x + 1.2, y: B.y + 1.4, w: B.w - 2.6, d: B.d - 2.4, r: 0.8 };
  out.push(`<path class="iso-halo" d="${k.haloOf(lower, 0, 2, P)}"/>`);
  out.push(S(k.slabOf(lower, 0, B.h / 2, P, 3, 0.3), { tone: "mid", inner: Ln(k.sideSeam(k.insetPlan(lower, 0), 3, P, 3), { tone: "faint" }) }));
  out.push(S(k.slabOf(upper, B.h / 2, B.h / 2, P, 3, 0.3), { tone: "hi", inner: Ln(k.sideSeam(k.insetPlan(upper, 0), B.h / 2 + 3, P, 3), { tone: "faint" }) }));
  return out.join("");
}

function clampTop() {
  const St = C.STRIP;
  return (S(k.slabOf({ x: St.x0 - 0.5, y: St.y - 3, w: St.x1 - St.x0 + 1, d: 5, r: 0.6 }, St.z, 2, P, 3, 0.3), { tone: "hi" })) + D([at([St.x1 - 1.4, St.y - 1.6, St.z + 2]), at([St.x1 - 1.4, St.y + 0.6, St.z + 2])], { size: 0.45, tone: "hi" });
}

function stub() {
  const out = [];
  const h = C.STUB - C.FLOOR;
  out.push(S(k.extrude([[88, -34], [90, -34], [90, -16], [88, -16]], C.FLOOR, h, P), { tone: "mid" }));
  out.push(S(k.extrude([[88, -16], [90, -16], [90, 30], [88, 30]], C.FLOOR, 3, P), { tone: "mid" }));
  const [sy, sz] = C.SHAFT;
  out.push((S(L.disc(0, 0.6, 8.6, L.frameOf([90, sy, sz], [1, 0, 0], [0, 1, 0], [0, 0, 1]), P, { steps: 48 }), { tone: "mid" })));
  const ticks = [];
  for (let i = 0; i < 6; i++) {
    const a = Math.PI + C.KNOB_A0 - ((i - 1) * C.KNOB_TURN * Math.PI) / 4 / 180;
    ticks.push(k.segment([90.7, sy + 8.4 * Math.cos(a), sz + 8.4 * Math.sin(a)], [90.7, sy + 6.8 * Math.cos(a), sz + 6.8 * Math.sin(a)], P));
  }
  out.push((Ln(ticks.join(""), { tone: "mid" })));
  return out.join("");
}

function sliderInner() {
  const [rx, ry] = C.ROD;
  const zs = C.UP + 6;
  const out = [];
  out.push((S(k.slabOf({ x: 61, y: 10, w: 6, d: 8, r: 0.8 }, zs - 10, 3, P, 3, 0.3), { tone: "hi" })));
  out.push((S(k.slabOf({ x: 60, y: 3, w: 2.6, d: 6, r: 0.4 }, zs - 3, 6, P, 2), { tone: "hi" })));
  out.push((S(k.slabOf({ x: 59, y: 8, w: 9, d: 12, r: 1.2 }, zs - 7, 14, P, 3, 0.5), { tone: "hi", lit: false })));
  out.push((S(k.cylinder(rx, ry, 2.6, zs + 7, 1.4, P, 20), { tone: "hi" })));
  out.push(D([at([68, 10.4, zs + 4]), at([68, 17.6, zs + 4]), at([68, 10.4, zs - 4]), at([68, 17.6, zs - 4])], { size: 0.45 }));
  out.push((S(alongX(C.PIN.y, zs, C.PIN.r, C.PIN.x0, C.PIN.x1, 14), { tone: "hi" })));
  return out.join("");
}

function sliderOuter() {
  const zs = C.UP + 6;
  // The lever arm leaves the carriage through the long front wall (cut away here) to its knob.
  const knob = { x: 56, y: 50, w: 15, d: 13, r: 3.5 };
  return (S(k.slabOf({ x: 62, y: 20, w: 3, d: 31, r: 0.4 }, zs - 1.5, 3, P, 2, 0.3), { tone: "hi" })) + D([at([65, 22, zs]), at([65, 48, zs])], { size: 0.45 }) + (S(k.slabOf(knob, zs - 4.5, 9, P, 5, 0.8), { tone: "hi", inner: Ln(k.sideSeam(knob, zs, P, 5), { tone: "faint" }) }));
}

// ---------------------------------------------------------------- assemble

const yTop = (x) => at([x, C.SLOTS[0] + C.BREAD.t / 2, C.TOP])[1];
const clipUpper = (() => {
  const a = at([-120, C.SLOTS[0] + C.BREAD.t / 2, C.TOP]), b = at([120, C.SLOTS[0] + C.BREAD.t / 2, C.TOP]);
  return `M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}L${b[0].toFixed(1)} -400L${a[0].toFixed(1)} -400Z`;
})();
const clipLower = (() => {
  const a = at([-120, C.SLOTS[0] + C.BREAD.t / 2, C.TOP]), b = at([120, C.SLOTS[0] + C.BREAD.t / 2, C.TOP]);
  return `M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}L${b[0].toFixed(1)} 1400L${a[0].toFixed(1)} 1400Z`;
})();
void yTop;

const crew = (spec, pose, part, duty = false) => critterSvg(critter(spec, pose, P), { part, duty });
const mv = (name, html) => `<g data-part="${name}">${html}</g>`;

const WIN = ringX(C.FACE, -41, -25, 47, 62, 2);
const parts = [
    `<defs><clipPath id="tz-up"><path d="${clipUpper}"/></clipPath><clipPath id="tz-low"><path d="${clipLower}"/></clipPath></defs>`,
    room(),
    desk(),
    propsBack(),
    cord(),
    base(),
    shellBack(),
    board(C.BOARDS[0], C.BOARD.z1),
    guards(C.SLOTS[0] - 7),
    `<g clip-path="url(#tz-low)">${mv("carriage-b", rack(C.SLOTS[0]) + bread(C.SLOTS[0]))}</g>`,
    guards(C.SLOTS[0] + 7),
    topPlate(),
    `<g clip-path="url(#tz-up)">${mv("carriage-b2", bread(C.SLOTS[0]))}</g>`,
    board(C.BOARDS[1], C.BOARD.z1),
    guards(C.SLOTS[1] - 7),
    mv("carriage-f", rack(C.SLOTS[1]) + bread(C.SLOTS[1])),
    guards(C.SLOTS[1] + 7),
    board(C.BOARDS[2], C.FRONT_CUT),
    "|",
    `<defs><mask id="tz-win" maskUnits="userSpaceOnUse" x="-2000" y="-2000" width="5000" height="5000"><rect x="-2000" y="-2000" width="5000" height="5000" fill="#fff"/><path d="${WIN}" fill="#000"/></mask></defs>`,
    mechPlate(),
    adjuster(),
    mv("cam", dyn0.cam),
    mv("adjust", follower()),
    contacts(),
    mv("leaf", dyn0.leaf),
    mv("spark", dyn0.spark),
    ledge(),
    rodStatic(false),
    mv("spring-back", dyn0.springBack),
    rodStatic(true),
    mv("slider", sliderInner()),
    mv("spring-front", dyn0.springFront),
    mv("lever", dyn0.lever),
    pivot(),
    mv("strip", dyn0.strip),
    mv("clamp", clampTop()),
    crew(DIG, pose0.dig, "dig"),
    crew(MO, pose0.mo, "mo"),
    crew(VOLTA, pose0.volta, "volta"),
    stub(),
    mv("knob", dyn0.knobFace),
    book(),
    crew(ROCKY, pose0.rocky, "rocky"),
    mv("slider-out", sliderOuter()),
    crew(ROO, pose0.roo, "roo"),
    propsFront(),
];
const cut = parts.indexOf("|");
const LABEL = "A two-slice pop-up toaster on a kitchen counter, with its front wall, open end and the front half of its top cut away, run by five animals. Inside, two slices of bread stand between mica boards wound with nichrome ribbon. At the open end the carriage slides on a rod with a lift spring round it. Rocky the raccoon, on a stack of books, lifts the browning knob by its pointer lever; the knob's cam sets the height of a brass and steel bimetal strip. Roo the kangaroo stands on the lever knob and stamps it down, and the carriage's foot closes the contacts. Volta the electric eel lies along the live wire with his snout on its terminal, and crackles while current flows to the heaters. Dig the mole holds the hook that catches the carriage's pin, and Mo the sloth hangs from the strip, which curls as it heats until it pushes the hook's tail and lets the carriage go.";
const backSvg = k.figureSvg({ width: WIDTH, height: HEIGHT, label: LABEL, body: parts.slice(0, cut) });
const frontSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="iso-svg tz-layer" viewBox="0 0 ${WIDTH} ${HEIGHT}" aria-hidden="true">${parts.slice(cut + 1).join("")}</svg>`;

// The heaters' glow, drawn in the drawing's own camera: nichrome ribbons on the board faces, the
// warm light they throw on the bread, the back wall and the floor. Everything that can stand in
// front of a lit face inside the chamber is modelled here as a box (boards, bread, the top plate),
// so the glow is hidden exactly where the drawing hides those faces. Colour is light, as in Anatomy.
const BOARDS_GL = C.BOARDS.map((y, i) => [y + 0.6, i === 2 ? C.FRONT_CUT : C.BOARD.z1]);
const f1 = (v) => (Number.isInteger(v) ? v.toFixed(1) : String(+v.toFixed(3)));
// The chamber's box on screen (in figure units, before any zoom): pixels outside it stay empty.
const CHAMBER = (() => {
  const pts = [];
  for (const x of [-90, 56]) for (const y of [-48, 34]) for (const z of [12, 112 + 90]) pts.push(at([x, y, z]));
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  return [Math.min(...xs) - 6, Math.min(...ys) - 6, Math.max(...xs) + 6, Math.max(...ys) + 6].map((v) => +v.toFixed(1));
})();
const FRAG = `
uniform float uGlow;
uniform float uBreadZ;
uniform float uLight;
bool boxHit(vec3 o, vec3 d, vec3 lo, vec3 hi, out float s, out vec3 n) {
  vec3 inv = 1.0 / d;
  vec3 t0 = (lo - o) * inv, t1 = (hi - o) * inv;
  vec3 tn = min(t0, t1), tf = max(t0, t1);
  float a = max(max(tn.x, tn.y), tn.z), b = min(min(tf.x, tf.y), tf.z);
  if (a > b || b < 0.0) return false;
  s = a;
  n = a == tn.x ? vec3(1.0, 0.0, 0.0) : a == tn.y ? vec3(0.0, 1.0, 0.0) : vec3(0.0, 0.0, 1.0);
  return true;
}
float crown(float x) { float r = 53.125; return 54.0 - (r - 16.0) + sqrt(max(0.0, r * r - (x + 14.0) * (x + 14.0))); }
uniform vec4 uBox;
void main() {
  vec2 vb = viewOf(gl_FragCoord.xy);
  if (vb.x < uBox.x || vb.y < uBox.y || vb.x > uBox.z || vb.y > uBox.w) { gl_FragColor = vec4(0.0); return; }
  vec3 V = towardViewer();
  vec3 o = rayOf(vb) + V * 600.0;
  vec3 d = -V;
  float best = 1e9, s; vec3 n, nb = vec3(0.0); float kind = 0.0, z1 = 0.0;
  ${BOARDS_GL.map(([y, z]) => `if (boxHit(o, d, vec3(-86.0, ${f1(y - 1.2)}, 16.0), vec3(54.0, ${f1(y)}, ${f1(z)}), s, n) && s < best) { best = s; nb = n; kind = 1.0; z1 = ${f1(z)}; }`).join("\n  ")}
  ${C.SLOTS.map((y) => `if (boxHit(o, d, vec3(-52.0, ${f1(y - 5)}, uBreadZ), vec3(24.0, ${f1(y + 5)}, uBreadZ + 70.0), s, n) && s < best) { vec3 p = o + d * s; if (p.z <= uBreadZ + crown(p.x) + 0.5) { best = s; nb = n; kind = 2.0; } }`).join("\n  ")}
  if (boxHit(o, d, vec3(-90.0, -48.0, 108.0), vec3(56.0, -2.0, 112.0), s, n) && s < best) { vec3 p = o + d * s; bool hole = n.z > 0.5 && p.x > -60.0 && p.x < 32.0 && p.y > -24.0 && p.y < -10.0; if (!hole) { best = s; kind = 3.0; } }
  float sw = (o.y + 46.0) / -d.y; vec3 pw = o + d * sw;
  if (sw < best && pw.x > -88.0 && pw.x < 76.0 && pw.z > 12.0 && pw.z < 108.0) { best = sw; kind = 4.0; }
  float sf = (o.z - 12.0) / -d.z; vec3 pf = o + d * sf;
  if (sf < best && pf.x > -88.0 && pf.x < 56.0 && pf.y > -46.0 && pf.y < 34.0) { best = sf; kind = 5.0; }
  vec3 p = o + d * best;
  float flick = 0.95 + 0.05 * noise2(vec2(uTime * 2.3, p.x * 0.07 + p.z * 0.05));
  float g = uGlow * flick;
  vec3 hot = vec3(0.0), warm = vec3(0.0);
  float px = pixelOf() * 1.4;
  if (kind == 1.0 && nb.y > 0.5) {
    float u = p.x + 80.0 - 3.0 * (z1 - p.z) / (z1 - 16.0);
    float k = abs(fract(u / 5.0 + 0.5) - 0.5) * 5.0;
    float m = window(u, -0.6, 125.6, 0.4) * window(p.z, 16.0, z1, 0.4);
    float core = (1.0 - smoothstep(0.3, 0.3 + px, k)) * m;
    float halo = exp(-k * k / 2.4) * m;
    float mica = window(p.x, -86.0, 54.0, 2.0) * window(p.z, 16.0, z1, 2.0);
    hot = vec3(1.0, 0.58, 0.2) * core * 1.7 * g;
    warm = vec3(1.0, 0.3, 0.06) * (halo * 0.55 + mica * 0.12) * g;
  } else if (kind == 2.0) {
    warm = vec3(1.0, 0.42, 0.12) * (nb.y > 0.5 ? 0.3 : nb.z > 0.5 ? 0.14 : 0.08) * g;
  } else if (kind == 4.0) {
    warm = vec3(1.0, 0.34, 0.08) * 0.18 * g * window(p.x, -86.0, 54.0, 8.0) * window(p.z, 16.0, 104.0, 8.0);
  } else if (kind == 5.0) {
    warm = vec3(1.0, 0.34, 0.08) * 0.14 * g * window(p.x, -86.0, 54.0, 8.0) * window(p.y, -40.0, 34.0, 6.0);
  }
  vec3 c = tonemap(hot + warm, 1.3);
  float a = max(c.r, max(c.g, c.b));
  float coreShare = clamp(length(hot) / (length(hot) + length(warm) + 1e-4), 0.0, 1.0);
  vec3 ink = mix(vec3(0.93, 0.5, 0.2), vec3(0.85, 0.27, 0.03), coreShare);
  float al = min(0.9, a * 1.05);
  vec4 dark = vec4(c, a), light = vec4(ink * al, al);
  vec4 col = mix(dark, light, uLight);
  float dz = (hash12(gl_FragCoord.xy + fract(uTime) * 61.0) - 0.5) / 255.0 * step(0.004, col.a);
  gl_FragColor = vec4(max(col.rgb + dz, 0.0), col.a);
}`;

// The spark where the contacts meet: a short blue-white flash each time they close or open.
const SPARK = `
uniform float uSpark;
uniform vec3 uSparkP;
uniform float uLight;
void main() {
  vec2 vb = viewOf(gl_FragCoord.xy);
  float r = length(vb - project(uSparkP)) / uK;
  vec2 q = (vb - project(uSparkP)) / uK;
  float star = exp(-abs(q.x) * 2.2 - q.y * q.y * 3.0) + exp(-abs(q.y) * 2.2 - q.x * q.x * 3.0);
  float g = (exp(-r * r / 0.5) * 1.6 + exp(-r * r / 9.0) * 0.45 + star * 0.35 * exp(-r * r / 14.0)) * uSpark;
  vec3 c = tonemap(vec3(0.72, 0.84, 1.0) * g, 1.6);
  float a = max(c.r, max(c.g, c.b));
  float al = min(0.85, a);
  gl_FragColor = mix(vec4(c, a), vec4(vec3(0.16, 0.34, 0.86) * al, al), uLight);
}`;

// ---------------------------------------------------------------- model (shared by the build check and the page)

function model(C, H, T0) {
  const [py, pz] = C.PIV;
  const rot = (u, v, ph) => [py + u * Math.cos(ph) + v * Math.sin(ph), pz - u * Math.sin(ph) + v * Math.cos(ph)];
  const local = (y, z, ph) => { const wy = y - py, wz = z - pz; return [wy * Math.cos(ph) - wz * Math.sin(ph), wy * Math.sin(ph) + wz * Math.cos(ph)]; };
  const poly = C.LEVER;
  const inside = (p) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [yi, zi] = poly[i], [yj, zj] = poly[j]; if ((zi > p[1]) !== (zj > p[1]) && p[0] < ((yj - yi) * (p[1] - zi)) / (zj - zi) + yi) c = !c; } return c; };
  const segDist = (p, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1]; const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / (dx * dx + dz * dz))); return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dz); };
  const hits = (zs, ph) => { const p = local(C.PIN.y, zs, ph); if (inside(p)) return true; for (let i = 0; i < poly.length; i++) if (segDist(p, poly[i], poly[(i + 1) % poly.length]) < C.PIN.r) return true; return false; };
  // Smallest turn of the hook that keeps it clear of the pin as the pin comes down past its nose.
  const camPhi = (zs) => {
    const p0 = local(C.PIN.y, zs, 0);
    if (p0[1] < -22 || !hits(zs, 0)) return 0;
    let a = 0, b = 0.6;
    for (let i = 0; i < 24; i++) { const m = (a + b) / 2; if (hits(zs, m)) a = m; else b = m; }
    return b;
  };
  // Where the hook's underside is above the pin, or null once the nose has swung past it.
  const holdZ = (ph) => {
    const u = (C.PIN.y - py + 22 * Math.sin(ph)) / Math.cos(ph);
    if (u > 11) return null;
    return pz - u * Math.sin(ph) - 22 * Math.cos(ph);
  };
  // Turn of the hook needed to keep its tail above the strip's tip.
  const tailPhi = (ty, tz) => {
    const f = (ph) => { const v = (ty - py + 1.5 * Math.sin(ph)) / Math.cos(ph); if (v > 0 || v < -20) return -1; return tz - (pz - v * Math.sin(ph) - 1.5 * Math.cos(ph)); };
    if (f(0) <= 0) return 0;
    let a = 0, b = 0.6;
    for (let i = 0; i < 24; i++) { const m = (a + b) / 2; if (f(m) > 0) a = m; else b = m; }
    return b;
  };
  const tipOf = (T, knob = 0) => {
    const St = C.STRIP;
    const lift = C.CAM_E * (Math.cos((knob * C.KNOB_TURN * Math.PI) / 180) - 1);
    const kap = Math.max(1e-6, (2 * C.MM * C.BEND * (T - 20)) / (St.len * St.len));
    return [St.y + Math.sin(kap * St.len) / kap, St.z + lift + (1 - Math.cos(kap * St.len)) / kap];
  };
  function step(S, dt) {
    S.stepT += dt;
    const sim = dt * S.warp;
    const phPrev = S.phi;
    const topPrev = S.zb + 6 + C.PIN.r;
    // Carriage: a hand pushes the lever, or the lift spring pulls up.
    if (S.hand) {
      S.zb += (C.BOTTOM - S.zb) * (1 - Math.exp(-dt / 0.22));
      if (Math.abs(S.zb - C.BOTTOM) < 0.02) S.zb = C.BOTTOM;
      S.v = 0;
    } else {
      S.v += 2600 * dt;
      S.zb += S.v * dt;
      if (S.zb >= C.UP) {
        if (S.v > 120) { S.hv = Math.max(S.hv, S.v * 0.7); S.hop = Math.max(S.hop, 0.01); }
        S.zb = C.UP; S.v = S.v > 120 ? -S.v * 0.18 : 0;
      }
    }
    // Hook: Dig keeps it closed; the pin cams it open on the way down; the strip lifts its tail.
    const relax = S.phi * Math.exp(-dt / 0.07);
    // Rocky's knob.
    const kPrev = S.knob;
    S.knob += (S.knobT - S.knob) * (1 - Math.exp(-dt / 0.55));
    if (Math.abs(S.knobT - S.knob) < 0.002) S.knob = S.knobT;
    S.knobV = (S.knob - kPrev) / Math.max(dt, 1e-3);
    const tip = tipOf(S.strip, S.knob);
    S.phi = Math.max(relax < 1e-4 ? 0 : relax, S.hand ? camPhi(S.zb + 6) : 0, tailPhi(tip[0], tip[1]));
    // Swept test: a pin that was below the hook's underside last frame can't pass through it this frame.
    const hz = holdZ(S.phi);
    const pinTop = S.zb + 6 + C.PIN.r;
    const under = hz !== null && topPrev <= hz + 0.05;
    if (under && pinTop > hz) { S.zb = hz - C.PIN.r - 6; S.v = 0; }
    S.latched = under && !S.hand && S.zb + 6 + C.PIN.r >= hz - 0.05;
    // Bread hops off the rack when the carriage hits its top stop.
    if (S.hop > 0) { S.hv -= 6300 * dt; S.hop += S.hv * dt; if (S.hop <= 0) { S.hop = 0; S.hv = 0; } }
    // Switch, heaters and the strip.
    // Switch: the carriage's foot presses the leaf onto the lower contact near the bottom of its travel.
    const leafZ = Math.min(20.4, Math.max(18.2, S.zb - 4.4));
    S.on = leafZ <= 18.3;
    S.element += ((S.on ? H.element : T0) - S.element) * (1 - Math.exp(-sim / H.tauElement));
    S.glow = Math.max(0, Math.min(1, (S.element - 380) / 220));
    const stripTo = S.on ? H.strip : T0;
    S.strip += (stripTo - S.strip) * (1 - Math.exp(-sim / (S.on ? H.tauStrip : H.coolStrip)));
    // Bread surface: dries at 100 °C while its water goes, then browns.
    const breadTo = S.on ? H.bread : T0;
    let nb = S.bread + (breadTo - S.bread) * (1 - Math.exp(-sim / H.tauBread));
    if (nb > 100 && S.water > 0) { S.water = Math.max(0, S.water - sim / H.water); nb = 100; }
    S.bread = nb;
    S.brown = Math.min(1.2, S.brown + Math.max(0, S.bread - 105) * sim * 0.000155);
    if (S.on) S.clock += sim;
    // Who is on duty: whoever's part is moving now.
    const dph = Math.abs(S.phi - phPrev) / Math.max(dt, 1e-3);
    const tipNow = tipOf(S.strip, S.knob);
    const tipSpeed = Math.hypot(tipNow[0] - tip[0], tipNow[1] - tip[1]) / Math.max(dt, 1e-3);
    let duty = "";
    if (tipSpeed > 0.55) duty = "mo";
    else if (Math.abs(S.knobV) > 0.02) duty = "rocky";
    else if (dph > 0.05) duty = "dig";
    else if (S.hand || (S.zb < C.UP - 0.2 && !S.latched)) duty = "roo";
    else if (S.on && S.glow > 0 && S.glow < 0.97) duty = "volta";
    else if (S.latched) duty = "dig";
    S.duty = duty;
    S.strain = S.latched && S.phi < 0.01;
    S.moEyes = S.strip > 120 ? "wide" : S.strip > 35 ? "open" : "shut";
    S.digEyes = S.phi > 0.03 && !S.hand ? "wide" : S.latched ? "open" : !S.on && S.zb >= C.UP - 0.1 && S.brown > 0.5 ? "happy" : "open";
    return S;
  }
  return { step, tipOf, tailPhi, camPhi, holdZ };
}

// Run the whole cycle once at build time: when does it trip, how hot, how brown?
const Mdl = model(C, HEAT, T0);
{
  const S = { ...REST, knobT: 0.5 };
  for (let i = 0; i < 180; i++) Mdl.step(S, 1 / 60);
  S.hand = true;
  for (let i = 0; i < 60; i++) Mdl.step(S, 1 / 60);
  S.hand = false;
  for (let i = 0; i < 60; i++) Mdl.step(S, 1 / 60);
  if (!S.latched) console.warn("the hook did not catch the carriage");
  if (!S.on) console.warn("the carriage did not close the contacts");
  S.warp = 1;
  let n = 0;
  while (S.latched && n++ < 60 * 400) Mdl.step(S, 1 / 60);
  console.log(`trips after ${(S.clock / 60) | 0}:${String(Math.round(S.clock % 60)).padStart(2, "0")} toasting, strip ${S.strip.toFixed(0)} °C, toast browning ${S.brown.toFixed(2)}, hook at ${((S.phi * 180) / Math.PI).toFixed(1)}°`);
  for (let i = 0; i < 60; i++) Mdl.step(S, 1 / 60);
  if (Math.abs(S.zb - C.UP) > 0.01) console.warn("the carriage did not reach the top");
}

// Reach check: every paw on its handle at rest, latched and at the moment of the trip.
for (const [T, knob, down] of [[20, 0, false], [20, 0.1, false], [20, 0.2, false], [20, 0.3, false], [20, 0.4, false], [20, 0.5, false], [20, 0.5, true], [80, 0.5, true], [120, 0.5, true], [170, 0.5, true]]) {
  const tip = Mdl.tipOf(T, knob);
  const phi = Mdl.tailPhi(tip[0], tip[1]);
  const st = { ...REST, strip: T, phi, knob, zb: down ? C.BOTTOM + 1.5 : C.UP, latched: down, on: down };
  const d = dynamic(K, P, C, st);
  const p = poses(C, st, d);
  for (const [name, spec, pose] of [["Mo", MO, p.mo], ["Dig", DIG, p.dig], ["Rocky", ROCKY, p.rocky]]) {
    const c = critter(spec, pose, P);
    for (const [paw, short] of Object.entries(c.reach)) if (short > 0.3) console.warn(`${name}'s ${paw === "l" ? "left" : "right"} paw is ${short.toFixed(1)} short at ${T} °C, knob ${knob}`);
  }
}

const ROLE = { sensing: "#3E9BDB", holding: "#E5484D", spring: "#E93D82", power: "#F5C518" };
const STEPS = [
  { title: "Meet the crew", who: "Rocky, Roo, Dig, Volta and Mo", color: "var(--anatomy-hi)", text: "Five animals run this toaster: Rocky on the browning knob, Roo on the lever, Dig on the hook, Volta on the live wire and Mo on the strip.", points: null, hold: 1.6 },
  { title: "Rocky sets the browning", who: "Rocky · sensing", color: ROLE.sensing, text: "Rocky lifts the knob's lever toward dark. Its cam drops the strip's bracket, so the strip must curl further, and stay hot longer, before it trips.", points: [[96, -30, 14], [96, -30, 30], [110, -40, 0], [58, -44, 26], [58, -20, 50], [70, -46, 46]] },
  { title: "Roo stamps the lever down", who: "Roo · spring", color: ROLE.spring, text: "Roo jumps on the lever knob. The carriage slides down, stretching the lift spring; its pin knocks Dig's hook aside and its foot closes the contacts.", points: [[64, 14, 96], [64, 14, 18], [64, 62, 24], [64, 62, 104], [64, -14, 56]] },
  { title: "Dig holds it down", who: "Dig · holding", color: ROLE.holding, text: "The spring pulls back up, but Dig has swung the hook back over the pin, and it stops there. The carriage is held at the bottom.", points: [[64, -18, 24], [64, 22, 14], [64, -4, 56], [68, 14, 36]] },
  { title: "Volta powers the heaters", who: "Volta · power", color: ROLE.power, text: "With the contacts closed, Volta's current runs through them into the nichrome ribbons, which glow at about 600 °C.", points: [[76, 24, 12], [76, -22, 12], [66, 22, 24], [-40, 17, 40], [40, 34, 46], [58, -40, 62]] },
  { title: "Mo feels the heat", who: "Mo · sensing", color: ROLE.sensing, text: "Brass grows more than steel when hot, so the strip curls up, lifting Mo toward the hook's tail. The bread dries, then browns.", points: [[60, -44, 28], [60, -44, 66], [66, -16, 58], [70, -20, 24]] },
  { title: "Mo trips the hook", who: "Mo · sensing", color: ROLE.sensing, text: "The strip pushes the hook's tail up. The hook swings off the pin, and Dig can't hold it against Mo.", points: [[60, -44, 28], [60, -26, 62], [66, 6, 58], [66, 6, 22]] },
  { title: "Pop!", who: "Roo · spring", color: ROLE.spring, text: "The spring yanks the carriage up in a fifth of a second and throws Roo with it. The contacts spark open and the ribbons go dark.", points: [[-52, 17, 150], [24, 17, 140], [64, 62, 84], [64, 62, 120], [64, 14, 18]] },
  { title: "Cool down", who: "everyone", color: "var(--anatomy-hi)", text: "The strip cools and straightens, lowering Mo. Rocky lowers the lever again. The strip timed the toast with the same heat that browned it.", points: [[-90, -48, 0], [110, 48, 0], [-14, 17, 150], [64, 62, 90]], hold: 2 },
];
const views = STEPS.map((step) => (step.points ? fitView(step.points.map(at), [WIDTH, HEIGHT], { pad: 22, least: 0.32 }) : [0, 0, WIDTH, HEIGHT]));
const CAMERA = glCamera(P);

const live = `
const P = ${JSON.stringify(P)};
const C = ${JSON.stringify(C)};
const HEAT = ${JSON.stringify(HEAT)};
const MO = ${JSON.stringify(MO)}, DIG = ${JSON.stringify(DIG)}, ROCKY = ${JSON.stringify(ROCKY)}, ROO = ${JSON.stringify(ROO)}, VOLTA = ${JSON.stringify(VOLTA)};
const STEP_INFO = ${JSON.stringify(STEPS.map(({ title, text, who, hold, pace }) => ({ title, text, who, hold, pace })))};
const VIEWS = ${JSON.stringify(views.map((v) => v.map((n) => +n.toFixed(2))))};
const COLORS = ${JSON.stringify(STEPS.map((step) => step.color))};
const CAMERA = ${JSON.stringify(CAMERA)};
const FRAG = ${JSON.stringify(FRAG)};
const SPARK = ${JSON.stringify(SPARK)};
const K = { iso, pathOf, cameraOf, solidSvg, lineSvg, dotsSvg, translateAlong, segment, ...CREW };
const dynamic = ${dynamic.toString()};
const poses = ${poses.toString()};
const model = ${model.toString()};
const MDL = model(C, HEAT, ${T0});
const stage = document.querySelector(".tz-stage");
const svgs = [...stage.querySelectorAll(":scope > svg")];
const part = (name) => stage.querySelector('[data-part="' + name + '"]');
const el = { cb: part("carriage-b"), cb2: part("carriage-b2"), cf: part("carriage-f"), slider: part("slider"), out: part("slider-out"), leaf: part("leaf"), spark: part("spark"), sb: part("spring-back"), sf: part("spring-front"), lever: part("lever"), strip: part("strip"), mo: part("mo"), dig: part("dig"), rocky: part("rocky"), roo: part("roo"), volta: part("volta"), wire: part("wire"), wire2: part("wire2"), cam: part("cam"), adjust: part("adjust"), clamp: part("clamp"), knob: part("knob") };
const toasts = [...stage.querySelectorAll("[data-toast]")];
const readout = document.querySelector("[data-readout]");
const REST = ${JSON.stringify(REST)};
const S = { ...REST };
// The heat is slowed while the carriage goes down and latches, so it comes on in Volta's own beat.
const WARP = [1, 1, 0.1, 0.1, 2, 30, 30, 1, 60];
let lastPose = {};
function paintCrew(name, node, spec, pose, duty) {
  const key = JSON.stringify(pose) + duty;
  if (lastPose[name] === key) return;
  lastPose[name] = key;
  CREW.paintCritter(node, CREW.critter(spec, pose, P));
  node.toggleAttribute("data-duty", duty);
}
// The glow and the spark, in the same camera as the drawing, following the run's zoom.
const glow = glLayer({ canvas: stage.querySelector(".tz-gl"), fragment: FRAG, view: [${WIDTH}, ${HEIGHT}], camera: CAMERA, uniforms: ["uGlow", "uBreadZ", "uLight", "uBox"], maxRatio: 1.25 });
const spark = glLayer({ canvas: stage.querySelector(".tz-spark"), fragment: SPARK, view: [${WIDTH}, ${HEIGHT}], camera: CAMERA, uniforms: ["uSpark", "uSparkP", "uLight"], maxRatio: 1.25 });
const BOX = ${JSON.stringify(CHAMBER)};
if (glow) stage.setAttribute("data-gl", "");
let view = VIEWS[0] ? [...VIEWS[0]] : [0, 0, ${WIDTH}, ${HEIGHT}];
let sparkAge = 9, wasOn = false, leafZ = 20.4;
const still = matchMedia("(prefers-reduced-motion: reduce)");
function paintGL() {
  const light = stage.closest("[data-theme]")?.getAttribute("data-theme") === "light" ? 1 : 0;
  const cam = { uView: [view[2], view[3]], uOrigin: [CAMERA.origin[0] - view[0], CAMERA.origin[1] - view[1]] };
  const t = still.matches ? 0.5 : performance.now() / 1000;
  const box = [BOX[0] - view[0], BOX[1] - view[1], BOX[2] - view[0], BOX[3] - view[1]];
  if (glow) S.glow > 0.002 ? glow.draw({ ...cam, uGlow: S.glow, uBreadZ: S.zb + S.hop, uLight: light, uBox: box }, t) : glow.clear();
  const flash = still.matches ? 0 : burst(sparkAge, 0.05, 0.14);
  if (spark) flash > 0.003 ? spark.draw({ ...cam, uSpark: flash, uSparkP: [67, 9.6, leafZ - 0.3], uLight: light }, t) : spark.clear();
}
const mm = (s) => Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0");
function draw() {
  const D = dynamic(K, P, C, S);
  const dz = S.zb - C.UP;
  const t = K.translateAlong(P, [0, 0, dz]);
  const tb = K.translateAlong(P, [0, 0, dz + S.hop]);
  for (const g of [el.cb, el.cb2, el.cf]) {
    g.setAttribute("transform", tb);
    const rk = g.firstElementChild;
    if (g !== el.cb2 && rk) rk.setAttribute("transform", K.translateAlong(P, [0, 0, -S.hop]));
  }
  el.slider.setAttribute("transform", t); el.out.setAttribute("transform", t);
  const tl = K.translateAlong(P, [0, 0, D.lift]);
  el.adjust.setAttribute("transform", tl); el.clamp.setAttribute("transform", tl);
  el.lever.innerHTML = D.lever; el.strip.innerHTML = D.strip; el.leaf.innerHTML = D.leaf; el.spark.innerHTML = D.spark;
  el.sb.innerHTML = D.springBack; el.sf.innerHTML = D.springFront;
  if (el.cam.__th !== D.camTh || el.knob.__duty !== S.duty) { el.cam.innerHTML = D.cam; el.knob.innerHTML = D.knobFace; el.cam.__th = D.camTh; el.knob.__duty = S.duty; }
  for (const n of toasts) n.style.opacity = D.brown.toFixed(3);
  for (const g of [el.cb, el.cb2, el.cf]) g.style.opacity = S.fade.toFixed(3);
  el.wire.toggleAttribute("data-flow", S.on); el.wire2.toggleAttribute("data-flow", S.on);
  leafZ = D.leafZ;
  const p = poses(C, S, D);
  paintCrew("mo", el.mo, MO, p.mo, S.duty === "mo");
  paintCrew("dig", el.dig, DIG, p.dig, S.duty === "dig");
  paintCrew("rocky", el.rocky, ROCKY, p.rocky, S.duty === "rocky");
  paintCrew("roo", el.roo, ROO, p.roo, S.duty === "roo");
  paintCrew("volta", el.volta, VOLTA, p.volta, S.duty === "volta");
  paintGL();
  const word = S.swap >= 0 ? "fresh bread" : Math.abs(S.knobV) > 0.02 ? "setting the browning" : S.hand ? "going down" : S.on ? (S.duty === "mo" && S.phi > 0.02 ? "tripping" : "toasting") : S.zb < C.UP - 0.5 ? (S.latched ? "held down" : "pop!") : S.strip > 30 ? "cooling" : S.brown > 0.5 ? "toast is up" : "ready";
  const text = word + " · browning " + (1 + 4 * S.knob * ${(C.KNOB_TURN / 176).toFixed(3)}).toFixed(1) + " · strip " + Math.round(S.strip) + " °C · " + mm(S.clock);
  if (readout.textContent !== text) readout.textContent = text;
}
const DONE = [
  () => S.swap < 0 && S.stepT > 0.3,
  () => S.knob === S.knobT && S.stepT > 0.5,
  () => S.zb <= C.BOTTOM + 0.05 && S.phi < 0.002 && S.stepT > 0.5,
  () => S.latched && S.stepT > 0.6,
  () => S.on && S.glow > 0.97,
  () => S.phi > 0.0005,
  () => !S.latched,
  () => S.zb >= C.UP && S.v === 0 && S.hop === 0 && S.stepT > 0.9,
  () => S.strip < 28 && S.glow === 0 && S.phi === 0 && S.knob === 0 && S.stepT > 1.2,
];
const snap = () => JSON.parse(JSON.stringify(S));
let stepIndex = 0;
function step(dt) {
  S.warp += (WARP[stepIndex] - S.warp) * (1 - Math.exp(-dt / 0.35));
  MDL.step(S, dt);
  if (S.on !== wasOn) { sparkAge = 0; wasOn = S.on; }
  sparkAge += dt;
  if (S.swap >= 0) {
    S.swap += dt / 0.9;
    if (S.swap >= 0.5 && S.brown > 0) { S.brown = 0; S.water = 1; S.bread = 20; S.clock = 0; }
    S.fade = Math.abs(Math.cos(Math.PI * Math.min(1, S.swap)));
    if (S.swap >= 1) { S.swap = -1; S.fade = 1; }
  }
}
function enter(i, how) {
  stepIndex = i;
  if (i === 0) Object.assign(S, { ...REST, strip: S.strip, element: S.element, brown: S.brown, swap: how === "loop" || S.brown > 0 ? 0 : -1 });
  if (i === 1) S.knobT = 0.5;
  if (i === 2) S.hand = true;
  if (i === 3) S.hand = false;
  if (i === 8) S.knobT = 0;
  S.stepT = 0;
  draw();
}
STEPS.mountSteps({
  root: document.querySelector("[data-steps]"),
  svg: svgs,
  stage,
  steps: STEP_INFO,
  views: VIEWS,
  colors: COLORS,
  size: [${WIDTH}, ${HEIGHT}],
  enter,
  update: (dt) => { step(dt); draw(); },
  done: (i) => DONE[i](),
  advance: step,
  save: () => ({ S: snap(), stepIndex, wasOn, sparkAge }),
  load: (x) => { Object.assign(S, JSON.parse(JSON.stringify(x.S))); stepIndex = x.stepIndex; wasOn = x.wasOn; sparkAge = 9; lastPose = {}; draw(); },
  onView: (v) => { view = v; paintGL(); },
});
`;

const keys = [
  { mark: "lit", label: "On duty: whoever is doing the work right now" },
  { mark: "raised", label: "Rocky, raccoon, sensing: sets the browning knob" },
  { mark: "raised", label: "Roo, kangaroo, spring: stamps the lever down and rides the pop" },
  { mark: "raised", label: "Dig, mole, holding: keeps the hook closed over the carriage pin" },
  { mark: "raised", label: "Volta, electric eel, power: carries the current from the cord to the heaters" },
  { mark: "raised", label: "Mo, sloth, sensing: rides the bimetal strip as it curls" },
];

const css = `${crewCss()}${STEPS_CSS}
.so-void{fill:var(--anatomy-halo);opacity:.55;stroke:var(--anatomy-lo);stroke-width:var(--anatomy-weight)}
.tz-toast{fill:#000;stroke:none}
.tz-stage{position:relative;touch-action:pan-y;overflow:hidden}
.tz-stage>svg,.tz-stage>canvas{display:block;width:100%;height:auto}
.tz-stage>.tz-layer{position:absolute;inset:0;height:100%!important;pointer-events:none}
.iso[data-theme="dark"] .tz-stage>canvas,.iso:not([data-theme]) .tz-stage>canvas{mix-blend-mode:screen}
.tz-stage:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:6px}`;

const body = `<style>${css}</style>` + k.plateHtml({
  fig: "Fig 1",
  title: "Pop-up toaster, staffed",
  hint: "Plays on its own, on a loop",
  readout: "ready · browning 1.0 · strip 20 °C · 0:00",
  keys,
  caption:
    "A pop-up toaster with its front, open end and half its top cut away, playing one toast from start to finish. It has no eye for colour: a bimetal strip by the heaters warms with the toast and curls until it trips the hook that holds the carriage down. The browning knob's cam sets how far the strip must curl. A clock would burn a second batch in an already hot toaster; the strip, already warm, trips sooner, so the toast comes out about the same. The strip's bend is drawn about twice its real size. Many newer toasters swap the strip for an electronic timer and an electromagnet, but the hold-and-release is the same.",
  body: `<div class="iso-stage tz-stage" tabindex="0" role="group" aria-label="Pop-up toaster, playing on a loop: Space pauses, Home starts again">${backSvg}<canvas class="tz-layer tz-gl" aria-hidden="true"></canvas>${frontSvg}<canvas class="tz-layer tz-spark" aria-hidden="true"></canvas></div>${stepsHtml(STEPS)}`,
});

const file = theme === "light" ? "toaster-light.html" : "toaster.html";
writeFileSync(join(HERE, file), k.pageHtml({ title: "Pop-up toaster, staffed", theme, body, script: kitScript() + glScript() + crewScript() + stepsScript() + live, width: 680 }));
console.log("wrote", file);
