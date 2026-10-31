// The Animatomy crew. Each animal is a painted illustration on a 2D rig: authored shapes facing left,
// standing on y = 0 and about 100 units tall, filled with soft gradients, fur at the edges and strands
// inside, no outlines. critter(spec, pose, P) places one in the figure's camera: it faces left or right
// by its heading, shows its back when it walks away, leans, hops, looks up and down, and reaches its paws
// to points in the world. critterSvg draws it at build time and paintCritter updates it each frame.
import { iso, depthOf, pathOf } from "./iso-kit.mjs";
import { frameAlong, viewOf, lightOf, pointOf, hullOf, add3, mul3, unit3, len3, cross3, dot3 } from "./lathe.mjs";

const TAU = Math.PI * 2;

// ---------- an ellipsoid for machine parts (eggs, domes, piles), in kit solid form
const BANDS = [0, 0.2, 0.42, 0.62];

export function ellipsoidOf(centre, [a, b, c], P, { steps = 32, clip = null, bands = null, shade0 = true } = {}) {
  const bc = cross3(b, c), ca = cross3(c, a), ab = cross3(a, b);
  const det = dot3(a, bc);
  const inv = (w) => [dot3(bc, w) / det, dot3(ca, w) / det, dot3(ab, w) / det];
  const Vu = unit3(inv(viewOf(P)));
  const Lu = unit3(inv(lightOf(P)));
  const map = (u) => iso(add3(centre, add3(add3(mul3(a, u[0]), mul3(b, u[1])), mul3(c, u[2]))), P);
  const circle = (axis, h) => {
    const F = frameAlong([0, 0, 0], axis), r = Math.sqrt(Math.max(0, 1 - h * h));
    return Array.from({ length: steps }, (_, i) => pointOf(F, h, r, (i / steps) * TAU));
  };
  let Nu = null, Hc = 0;
  if (clip) {
    const raw = [dot3(a, clip.n), dot3(b, clip.n), dot3(c, clip.n)];
    const k = len3(raw);
    Nu = mul3(raw, 1 / k);
    Hc = (clip.d ?? 0) / k;
  }
  const inside = (u) => !Nu || dot3(u, Nu) >= Hc - 1e-9;
  const rim = circle(Vu, 0);
  const cut = Nu ? circle(Nu, Hc) : [];
  const outline = pathOf(hullOf([...rim.filter(inside), ...cut].map(map)), true);
  const capOf = (t) => {
    if (t == null || t >= 1) return "";
    if (t <= -1) return outline;
    const pts = rim.filter((u) => dot3(u, Lu) >= t && inside(u));
    for (const u of circle(Lu, t)) if (dot3(u, Vu) >= -1e-9 && inside(u)) pts.push(u);
    for (const u of cut) if (dot3(u, Vu) >= -1e-9 && dot3(u, Lu) >= t) pts.push(u);
    if (dot3(Vu, Lu) > t && inside(Vu)) pts.push(Vu);
    return pts.length > 2 ? pathOf(hullOf(pts.map(map)), true) : "";
  };
  const bs = bands ?? BANDS.slice(1);
  return { fill: outline, outline, crease: "", top: "", shades: [shade0 ? outline : "", capOf(bs[0]), capOf(bs[1]), capOf(bs[2])], seamless: true };
}

// ---------- drawing
const RAD = Math.PI / 180;
const n1 = (v) => { const r = Math.round(v * 10) / 10; return Object.is(r, -0) ? "0" : String(r); };
const pt = (p) => `${n1(p[0])},${n1(p[1])}`;
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const add = (a, b, t = 1) => [a[0] + b[0] * t, a[1] + b[1] * t];
const len = (a) => Math.hypot(a[0], a[1]);
const unit = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l]; };
const rotp = ([x, y], a, [cx, cy] = [0, 0]) => { const c = Math.cos(a), s = Math.sin(a), dx = x - cx, dy = y - cy; return [cx + dx * c - dy * s, cy + dx * s + dy * c]; };

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A smooth curve through points (Catmull-Rom as cubic Béziers). A third element marks a corner.
function curve(pts, closed = true, steps = 8) {
  const n = pts.length;
  const at = (i) => pts[closed ? ((i % n) + n) % n : Math.max(0, Math.min(n - 1, i))];
  const segs = [];
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    const c1 = p1[2] ? p1 : [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = p2[2] ? p2 : [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    segs.push([p1, c1, c2, p2]);
  }
  const d = `M${pt(pts[0])}` + segs.map((s) => `C${pt(s[1])} ${pt(s[2])} ${pt(s[3])}`).join("") + (closed ? "Z" : "");
  const poly = [];
  for (const [a, b, c, e] of segs) {
    for (let j = 0; j < steps; j++) {
      const t = j / steps, u = 1 - t;
      poly.push([u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * e[0], u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * e[1]]);
    }
  }
  if (!closed) poly.push(pts[n - 1]);
  return { d, poly };
}

const area = (poly) => { let s = 0; for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length]; s += a[0] * b[1] - b[0] * a[1]; } return s / 2; };
function inside(poly, x, y) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}
const bounds = (poly) => poly.reduce((b, [x, y]) => [Math.min(b[0], x), Math.min(b[1], y), Math.max(b[2], x), Math.max(b[3], y)], [1e9, 1e9, -1e9, -1e9]);

function resample(poly, gap, closed = true) {
  const out = [];
  let carry = 0;
  const n = poly.length;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const a = poly[i], b = poly[(i + 1) % n];
    const l = len(sub(b, a));
    let t = carry;
    while (t < l) { out.push(add(a, sub(b, a), t / l)); t += gap; }
    carry = t - l;
  }
  return out;
}

// Fur along an edge: short strokes that start just inside and lean with the coat's flow.
// Returns three paths split by how the edge faces the light.
function tufts(poly, { len: L = 2, gap = 1.5, flow = [0.35, 1], lean = 0.55, seed = 1, light = [-0.6, -0.8], only = null }) {
  const r = rng(seed);
  const sgn = area(poly) > 0 ? 1 : -1;
  const pts = resample(poly, gap);
  const out = { lit: "", mid: "", shade: "" };
  const fl = unit(flow);
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], q = pts[(i + 1) % pts.length], o = pts[(i - 1 + pts.length) % pts.length];
    const t = unit(sub(q, o));
    const nrm = [t[1] * sgn, -t[0] * sgn];
    if (only && !only(p, nrm)) continue;
    const l = L * (0.65 + 0.7 * r());
    const dir = unit(add(nrm, fl, lean));
    const b = add(p, nrm, -l * 0.55);
    const tip = add(b, dir, l * 1.25);
    const c = add(add(b, dir, l * 0.6), [-dir[1], dir[0]], (r() - 0.5) * l * 0.5);
    const lit = nrm[0] * light[0] + nrm[1] * light[1];
    const key = lit > 0.3 ? "lit" : lit < -0.35 ? "shade" : "mid";
    out[key] += `M${pt(b)}Q${pt(c)} ${pt(tip)}`;
  }
  return out;
}

// Hair strands inside a shape, along the coat's flow.
function strands(poly, { count = 60, len: L = 4, flow = [0.35, 1], seed = 7, light = [-0.6, -0.8] }) {
  const r = rng(seed);
  const [x0, y0, x1, y1] = bounds(poly);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, w = x1 - x0, h = y1 - y0;
  const fl = unit(flow);
  const out = { lit: "", shade: "" };
  let tries = 0, made = 0;
  while (made < count && tries < count * 8) {
    tries++;
    const x = x0 + r() * w, y = y0 + r() * h;
    if (!inside(poly, x, y)) continue;
    made++;
    const l = L * (0.6 + 0.8 * r());
    const bend = (r() - 0.5) * 0.6;
    const d = unit(add(fl, [-fl[1], fl[0]], bend));
    const a = [x, y], b = add(a, d, l), c = add(add(a, d, l * 0.5), [-d[1], d[0]], bend * l * 0.4);
    const side = ((x - cx) / w) * light[0] + ((y - cy) / h) * light[1];
    out[side > 0.12 && r() < 0.8 ? "lit" : "shade"] += `M${pt(a)}Q${pt(c)} ${pt(b)}`;
  }
  return out;
}

// A limb outline around a centreline with a width at each point; round at both ends.
function limb(cl, ws) {
  const left = [], right = [];
  for (let i = 0; i < cl.length; i++) {
    const t = unit(sub(cl[Math.min(cl.length - 1, i + 1)], cl[Math.max(0, i - 1)]));
    const nrm = [-t[1], t[0]];
    left.push(add(cl[i], nrm, ws[i] / 2));
    right.push(add(cl[i], nrm, -ws[i] / 2));
  }
  const t0 = unit(sub(cl[1], cl[0])), t1 = unit(sub(cl[cl.length - 1], cl[cl.length - 2]));
  const tip = add(cl[cl.length - 1], t1, ws[ws.length - 1] * 0.45);
  const root = add(cl[0], t0, -ws[0] * 0.45);
  return [root, ...left, tip, ...right.reverse()];
}

// Two-bone reach: shoulder to target, elbow bent toward `bend`.
function reach2(S, T, l1, l2, bend = [0.4, 1]) {
  let d = sub(T, S);
  let dist = len(d);
  const max = l1 + l2 - 0.01, min = Math.abs(l1 - l2) + 0.5;
  const short = Math.max(0, dist - (l1 + l2));
  if (dist > max) { d = unit(d); T = add(S, d, max); dist = max; }
  if (dist < min) { d = unit(d); T = add(S, d, min); dist = min; }
  const phi = Math.atan2(T[1] - S[1], T[0] - S[0]);
  const a = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + dist * dist - l2 * l2) / (2 * l1 * dist))));
  const e1 = [S[0] + l1 * Math.cos(phi + a), S[1] + l1 * Math.sin(phi + a)];
  const e2 = [S[0] + l1 * Math.cos(phi - a), S[1] + l1 * Math.sin(phi - a)];
  const score = (e) => (e[0] - S[0]) * bend[0] + (e[1] - S[1]) * bend[1];
  return { E: score(e1) >= score(e2) ? e1 : e2, W: T, short };
}

// ---------- the cast
// The crew, drawn facing left, standing on y = 0, about 100 units tall (y down).
// Each species has `up` (sitting or standing, paws free) and `four` (on all fours, in profile).
const sh = (pts, dx, dy) => pts.map(([x, y, c]) => (c ? [x + dx, y + dy, c] : [x + dx, y + dy]));
const shd = (d, dx, dy) => d.replace(/(-?[\d.]+),(-?[\d.]+)/g, (_, x, y) => `${+(+x + dx).toFixed(2)},${+(+y + dy).toFixed(2)}`);
// A hind foot pointing left: heel at x = heel, toes at x = -l.
const footPts = (l, w, heel = 2.5) => [[heel, 0.4], [heel * 0.8, -w * 0.8], [-l * 0.3, -w], [-l * 0.78, -w * 0.82], [-l, -w * 0.38], [-l * 0.92, w * 0.18], [-l * 0.3, w * 0.25]];
const toeClaws = (l, w, n, cl) => Array.from({ length: n }, (_, i) => { const y = -w * 0.62 + (w * 0.7 * i) / Math.max(1, n - 1); return `M${-l * 0.96},${y.toFixed(2)}Q${(-l - cl * 0.6).toFixed(2)},${(y - cl * 0.05).toFixed(2)} ${(-l - cl).toFixed(2)},${(y + cl * 0.4).toFixed(2)}`; }).join("");
const toeLines = (l, w) => `M${-l * 0.95},${(-w * 0.5).toFixed(2)}L${(-l * 0.72).toFixed(2)},${(-w * 0.55).toFixed(2)}M${-l * 0.97},${(-w * 0.1).toFixed(2)}L${(-l * 0.72).toFixed(2)},${(-w * 0.2).toFixed(2)}`;
const leg = (hip, l1, l2, w, bend, x, foot, offset, far = false, tone) => ({ hip, l1, l2, w, bend, foot: { x, ...foot }, offset, far, tone });

const HAMSTER_HEAD_UP = {
  pivot: [-8, -56],
  pts: [[-38, -62], [-37, -68], [-33, -76], [-24, -83], [-12, -86], [0, -84], [9, -77], [12, -67], [8, -58], [-2, -52], [-14, -49], [-26, -51], [-34, -55]],
  strands: 45, flow: [1, 0.25], tuft: 1.4,
  marks: [
    { pts: [[-36.5, -60], [-34, -67], [-26, -69], [-16, -64], [-11, -55], [-19, -50.5], [-29, -52]], tone: "belly" },
    { pts: [[-9, -63], [-2, -68], [5, -63], [3, -55], [-5, -53]], tone: "dark", op: 0.5 },
    { pts: [[-30, -79], [-20, -84], [-8, -83], [-14, -77], [-24, -75]], tone: "dark", op: 0.35 },
  ],
  eye: { at: [-22, -71.5], rx: 4.3, ry: 4.8, rot: -12 },
  nose: [[-39.6, -63.6], [-37.4, -66.2], [-34.8, -64.6], [-36.6, -61.6]],
  mouth: "M-37.4,-61.4Q-36.6,-58.6 -33.6,-58",
  whiskers: { at: [-33.5, -62], n: 7, from: 150, to: 212, len: 19 },
  ears: {
    near: { pts: [[-4, -83], [-4, -91], [1, -96.5], [8, -95], [11, -88], [7, -81]], inner: [[-1, -84.5], [-0.5, -90.5], [3, -94], [7.5, -91.5], [8, -86], [5, -83]] },
    far: { pts: [[-21, -84], [-21, -90], [-16, -94], [-10, -91], [-9, -85]], inner: [[-19, -86], [-18.5, -89.5], [-15, -91.5], [-11.5, -89], [-11.5, -86]] },
  },
};

const SLOTH_HEAD = {
  pivot: [-6, -60],
  pts: [[-32, -70], [-31, -77], [-26, -84], [-16, -89], [-4, -89], [6, -84], [10, -75], [8, -66], [0, -60], [-12, -58], [-24, -60], [-30, -64]],
  strands: 40, flow: [0.6, 1], tuft: 2.6,
  marks: [
    { pts: [[-26, -84], [-14, -90], [-1, -88], [-5, -82], [-17, -81]], tone: "dark", op: 0.45 },
    { pts: [[-31.5, -68], [-31, -77], [-25, -83], [-15, -84], [-8.5, -78], [-8, -68], [-14, -62], [-24, -61.5]], tone: "mark", soft: false },
    { pts: [[-28, -76], [-21, -79.5], [-11, -78], [-3, -74.5], [-7, -71], [-18, -71.5], [-26, -72.5]], tone: "dark" },
  ],
  eye: { at: [-20, -75.2], rx: 2.3, ry: 2.5, rot: -8 },
  nose: [[-33.4, -69.4], [-31.6, -72.4], [-28.2, -71.8], [-28.6, -68.4], [-31, -67.2]],
  mouth: "M-31.6,-66.4Q-26,-62.8 -18.6,-65.2",
};

const ART = {
  hamster: {
    colors: { fur: "#C98446", belly: "#F4E8D8", dark: "#8A4F27", skin: "#E5A9A1", mark: "#F4E8D8", eye: "#120b07", nose: "#D88F8B", claw: "#F5EEE6", whisker: "#FFFBF4" },
    coat: { flow: [0.3, 1], tuft: 1.6, gap: 0.9, tw: 0.55, strand: 4.5, sw: 0.4 },
    up: {
      pivot: [2, -6], box: [-58, -100, 40, 4], shadow: [0, 38, 6.5],
      body: {
        pts: [[-20, 0], [-30, -7], [-35, -20], [-34, -34], [-28, -46], [-18, -55], [-4, -60], [10, -58], [22, -50], [31, -37], [35, -22], [33, -9], [24, -1], [4, 1]],
        strands: 80,
        marks: [{ pts: [[-17, -1], [-29, -9], [-32, -23], [-29, -37], [-21, -47], [-11, -43], [-8, -28], [-9, -11]], tone: "belly", front: true }],
        ao: [[-15, -48, 15, 6]],
      },
      collar: { d: "M-30,-47.8Q-14,-41.5 3,-50", w: 1.3, tag: [-19.5, -43.4, 1.7] },
      head: HAMSTER_HEAD_UP,
      arms: { near: [-22, -44], far: [-15, -47], l1: 8.5, l2: 8.5, w: [9, 6, 4.2], bend: [0.45, 1], rest: { near: [-31, -36], far: [-29, -39] }, paw: { len: 5.5, w: 4.2, tone: "skin", toes: 4 } },
      feet: { near: { at: [-13, 0], pts: footPts(13.5, 3.8, 3), tone: "skin", toes: toeLines(13.5, 3.8) }, far: { at: [-22, -1.2], pts: footPts(11, 3.2, 2), tone: "skin" } },
    },
    four: {
      pivot: [0, -30], box: [-76, -64, 46, 4], shadow: [-8, 46, 6.5],
      body: {
        pts: [[-30, -12], [-40, -24], [-40, -40], [-28, -52], [-6, -58], [16, -56], [32, -48], [42, -34], [42, -20], [34, -9], [16, -6], [-4, -6], [-20, -8]],
        strands: 90, flow: [1, 0.3],
        marks: [{ pts: [[-30, -11], [-16, -7], [4, -6.5], [22, -7], [34, -11], [22, -17], [0, -16], [-18, -17]], tone: "belly" }],
        ao: [[-31, -31, 9, 14]],
      },
      collar: { d: "M-29,-49Q-35,-32 -28,-15", w: 1.3, tag: [-32.6, -20, 1.7] },
      head: {
        pivot: [-30, -34],
        pts: [[-70, -25], [-68.5, -32], [-62, -41], [-50, -49], [-36, -52], [-25, -46], [-21, -34], [-24, -22], [-36, -14], [-50, -13], [-62, -16], [-68, -20]],
        strands: 45, flow: [1, 0.2], tuft: 1.4,
        marks: [
          { pts: [[-69, -22], [-65, -30], [-54, -31], [-42, -25], [-36, -16], [-50, -14], [-62, -16]], tone: "belly" },
          { pts: [[-34, -38], [-27, -41], [-23, -34], [-26, -26], [-33, -27]], tone: "dark", op: 0.5 },
        ],
        eye: { at: [-51, -37], rx: 4, ry: 4.5, rot: -6 },
        nose: [[-72, -26.5], [-69.6, -29.6], [-67, -27.6], [-69, -24.6]],
        mouth: "M-69.4,-23.6Q-67.6,-20.6 -64.6,-20.2",
        whiskers: { at: [-64.5, -25], n: 7, from: 155, to: 210, len: 19 },
        ears: {
          near: { pts: [[-36, -49], [-36, -56.5], [-30, -61.5], [-24, -59], [-22.5, -51.5]], inner: [[-33.5, -51], [-33.5, -56], [-29.5, -59], [-25.5, -56.5], [-25, -52.5]] },
          far: { pts: [[-44, -51], [-43.5, -57], [-39, -60], [-34.5, -56]], inner: [[-42.5, -52.5], [-42, -56], [-39, -58], [-36.5, -55.5]] },
        },
      },
      legs: [
        leg([24, -24], 9, 9, [15, 7, 4.6], [-1, 0.25], 22, { pts: footPts(10.5, 3.2), tone: "skin" }, 0.55, true),
        leg([-22, -22], 8, 8, [11, 6, 4], [1, 0.15], -28, { pts: footPts(8, 2.8, 2), tone: "skin" }, 0.1, true),
        leg([20, -22], 9, 9, [15, 7, 4.6], [-1, 0.25], 16, { pts: footPts(10.5, 3.2), tone: "skin" }, 0.05),
        leg([-24, -20], 8, 8, [11, 6, 4], [1, 0.15], -34, { pts: footPts(8, 2.8, 2), tone: "skin" }, 0.6),
      ],
    },
  },

  mouse: {
    colors: { fur: "#9A6A44", belly: "#F1ECE3", dark: "#5C3C24", skin: "#E8B3AC", mark: "#F1ECE3", eye: "#0e0907", nose: "#E09A96", whisker: "#F7F2EA" },
    coat: { flow: [0.3, 1], tuft: 1.3, gap: 0.85, tw: 0.5, strand: 4, sw: 0.38 },
    up: {
      pivot: [2, -6], box: [-62, -100, 100, 4], shadow: [14, 42, 6],
      body: {
        pts: [[-14, 0], [-22, -8], [-25, -20], [-24, -32], [-20, -42], [-12, -50], [0, -53], [12, -50], [22, -41], [28, -28], [29, -14], [25, -4], [14, 0], [0, 1]],
        strands: 60,
        marks: [{ pts: [[-12, -1], [-20, -9], [-23, -20], [-22, -32], [-17, -41], [-10, -37], [-8, -24], [-8, -10]], tone: "belly", front: true }],
        ao: [[-12, -45, 12, 5]],
      },
      collar: { d: "M-24,-44Q-10,-38.5 4,-46.5", w: 1.2, tag: [-14, -41, 1.6] },
      head: {
        pivot: [-6, -49],
        pts: [[-41, -57], [-38, -61], [-30, -66], [-20, -71], [-8, -73], [2, -70], [8, -62], [7, -53], [0, -47], [-10, -46], [-22, -49], [-33, -53]],
        strands: 36, flow: [1, 0.15], tuft: 1.2,
        marks: [{ pts: [[-37, -54], [-26, -52.5], [-14, -48.5], [-8, -47], [-20, -46.6], [-32, -51]], tone: "belly" }],
        eye: { at: [-20, -63], rx: 4.5, ry: 4.7, rot: -14 },
        nose: [[-43, -57.5], [-41, -59.6], [-38.8, -58.4], [-40.4, -55.8]],
        mouth: "M-40.6,-55.6Q-39,-53.2 -35.6,-52.6",
        whiskers: { at: [-36, -56], n: 8, from: 152, to: 214, len: 22 },
        ears: {
          near: { pts: [[-4, -70], [-6, -80], [-3, -90], [4, -96], [12, -94], [15, -86], [12, -76], [6, -69]], inner: [[-1.5, -72], [-3, -80], [-0.5, -88], [4.5, -92.5], [10, -91], [12, -85], [9.5, -77], [5, -72]], tuft: 0.7 },
          far: { pts: [[-16, -71], [-18, -80], [-15, -88], [-9, -90], [-5, -84], [-5, -75]], inner: [[-14.5, -73], [-16, -80], [-13.5, -86], [-9, -87.5], [-6.5, -83], [-6.5, -76]] },
        },
      },
      arms: { near: [-15, -40], far: [-10, -43], l1: 7.5, l2: 7.5, w: [7, 5, 3.4], bend: [0.45, 1], rest: { near: [-26, -34], far: [-24, -37] }, paw: { len: 4.6, w: 3.4, tone: "skin", toes: 4 } },
      feet: { near: { at: [-10, 0], pts: footPts(16, 3, 3), tone: "skin", toes: toeLines(16, 3) }, far: { at: [-17, -1.2], pts: footPts(13, 2.6, 2), tone: "skin" } },
      tail: { pivot: [24, -6], back: "over", tone: "skin", line: { cl: [[22, -6], [40, -2.5], [60, -1.5], [78, -2.5], [92, -6], [98, -11]], w: [5.5, 3.6, 2.8, 2.1, 1.4, 0.8], rings: true } },
    },
    four: {
      pivot: [0, -26], box: [-74, -66, 106, 4], shadow: [6, 50, 6],
      body: {
        pts: [[-28, -12], [-36, -22], [-36, -34], [-26, -44], [-8, -48], [12, -47], [28, -41], [38, -30], [39, -18], [32, -9], [16, -6], [-4, -6], [-18, -8]],
        strands: 70, flow: [1, 0.3],
        marks: [{ pts: [[-28, -11], [-14, -7], [4, -6.5], [22, -7], [32, -10], [20, -14], [0, -14], [-18, -15]], tone: "belly" }],
        ao: [[-28, -28, 8, 12]],
      },
      collar: { d: "M-27,-42Q-32,-28 -26,-15", w: 1.2, tag: [-30, -19, 1.6] },
      head: {
        pivot: [-30, -30],
        pts: [[-70, -26], [-66, -30], [-58, -36], [-46, -42], [-34, -44], [-24, -38], [-22, -28], [-28, -19], [-40, -16], [-54, -18], [-64, -22]],
        strands: 34, flow: [1, 0.15], tuft: 1.2,
        marks: [{ pts: [[-66, -23], [-56, -21], [-44, -18], [-36, -17.5], [-48, -16.4], [-60, -19]], tone: "belly" }],
        eye: { at: [-48, -34], rx: 4.2, ry: 4.4, rot: -10 },
        nose: [[-72, -26.5], [-70, -28.8], [-67.6, -27.4], [-69.4, -24.8]],
        mouth: "M-69.6,-24.6Q-68,-22 -64.6,-21.6",
        whiskers: { at: [-64.5, -25], n: 8, from: 155, to: 214, len: 22 },
        ears: {
          near: { pts: [[-34, -42], [-36, -52], [-33, -61], [-26, -65], [-19, -62], [-17, -53], [-21, -44]], inner: [[-32, -44], [-33.5, -52], [-31, -59], [-26, -62], [-21, -59.5], [-19.5, -53], [-22.5, -46]], tuft: 0.7 },
          far: { pts: [[-42, -43], [-44, -52], [-41, -59], [-35, -60], [-33, -52]], inner: [[-41, -45], [-42.5, -52], [-40, -57], [-36, -57.5], [-34.5, -52]] },
        },
      },
      legs: [
        leg([24, -20], 9, 9, [12, 6, 3.6], [-1, 0.25], 24, { pts: footPts(13, 2.6), tone: "skin" }, 0.55, true),
        leg([-22, -20], 7, 7, [9, 5, 3.2], [1, 0.15], -26, { pts: footPts(7, 2.4, 1.5), tone: "skin" }, 0.1, true),
        leg([20, -18], 9, 9, [12, 6, 3.6], [-1, 0.25], 16, { pts: footPts(13, 2.6), tone: "skin" }, 0.05),
        leg([-24, -18], 7, 7, [9, 5, 3.2], [1, 0.15], -32, { pts: footPts(7, 2.4, 1.5), tone: "skin" }, 0.6),
      ],
      tail: { pivot: [36, -14], tone: "skin", line: { cl: [[34, -14], [54, -8], [74, -5], [92, -6], [104, -12]], w: [5, 3.2, 2.4, 1.6, 0.8], rings: true } },
    },
  },

  squirrel: {
    colors: { fur: "#B2552A", belly: "#F4EADB", dark: "#5E2A13", skin: "#4A3A33", mark: "#EAD6BE", eye: "#0b0705", nose: "#2B1E18", claw: "#2A1F1A", whisker: "#2B201A" },
    coat: { flow: [0.3, 1], tuft: 1.5, gap: 0.9, tw: 0.55, strand: 4.5, sw: 0.4 },
    up: {
      pivot: [2, -6], box: [-40, -108, 56, 4], shadow: [8, 36, 6],
      body: {
        pts: [[-14, 0], [-20, -10], [-22, -24], [-20, -38], [-14, -50], [-4, -58], [6, -58], [14, -50], [20, -36], [24, -20], [24, -8], [18, -1], [4, 1]],
        strands: 55,
        marks: [{ pts: [[-12, -1], [-18, -10], [-20, -24], [-18, -37], [-12, -48], [-6, -42], [-5, -26], [-6, -10]], tone: "belly", front: true }],
        ao: [[-10, -52, 10, 4]],
      },
      collar: { d: "M-20,-52Q-7,-47 6,-55", w: 1.2, tag: [-12, -49.4, 1.6] },
      head: {
        pivot: [-4, -56],
        pts: [[-34, -62], [-31, -67], [-24, -73], [-14, -78], [-4, -79], [5, -75], [9, -67], [7, -58], [0, -53], [-10, -53], [-22, -56], [-30, -59]],
        strands: 34, flow: [1, 0.2], tuft: 1.3,
        marks: [{ pts: [[-31, -59.5], [-22, -58], [-12, -55.5], [-6, -54], [-14, -53], [-26, -56]], tone: "belly" }],
        eye: { at: [-15, -68.5], rx: 3.8, ry: 4.1, rot: -14, ring: 1.4 },
        nose: [[-35.5, -62.5], [-33.6, -64.6], [-31.4, -63.4], [-33, -61]],
        mouth: "M-33.8,-60.8Q-32.4,-58.4 -29.4,-57.8",
        whiskers: { at: [-29.5, -61], n: 6, from: 152, to: 210, len: 15, opacity: 0.6, width: 0.3 },
        ears: {
          near: { pts: [[-2, -75], [-1.5, -84], [2, -93, 1], [6.5, -84], [8, -74]], inner: [[0.5, -76], [0.8, -83], [2.4, -89], [5, -83], [5.6, -76]], brush: { at: [2, -92], len: 8, n: 9, spread: 50, tilt: 10 } },
          far: { pts: [[-10, -76], [-10, -84], [-7, -91, 1], [-3, -84], [-3, -77]], inner: [[-8.5, -77], [-8.5, -83], [-7, -88], [-5, -83], [-4.8, -78]], brush: { at: [-7, -90], len: 7, n: 7, spread: 45, tilt: 5 } },
        },
      },
      arms: { near: [-13, -44], far: [-8, -47], l1: 9.5, l2: 9.5, w: [6.5, 4.6, 3.2], bend: [0.45, 1], tone: "fur", rest: { near: [-23, -38], far: [-21, -41] }, paw: { len: 4.8, w: 3.2, tone: "skin", toes: 4, claws: 4, clawLen: 1.6 } },
      feet: { near: { at: [-8, 0], pts: footPts(18, 3, 3), tone: "skin", toes: toeLines(18, 3), claws: toeClaws(18, 3, 4, 2), clawW: 0.4 }, far: { at: [-14, -1.4], pts: footPts(15, 2.6, 2), tone: "skin" } },
      tail: {
        pivot: [20, -8], back: "over",
        pts: [[16, -4], [28, -8], [42, -14], [50, -28], [53, -46], [50, -64], [42, -82], [30, -96], [16, -103], [4, -100], [-1, -91], [4, -84], [12, -88], [22, -84], [30, -70], [33, -52], [31, -36], [26, -24], [18, -14]],
        strands: 70, flow: [0.2, -1], tuft: 3.4, gap: 0.7, lean: 0.15, tw: 0.6, strandLen: 7,
      },
    },
    four: {
      pivot: [0, -26], box: [-66, -84, 100, 4], shadow: [10, 52, 6],
      body: {
        pts: [[-26, -14], [-34, -24], [-32, -36], [-20, -44], [0, -47], [18, -44], [30, -36], [36, -24], [34, -12], [24, -6], [6, -6], [-12, -9]],
        strands: 60, flow: [1, 0.3],
        marks: [{ pts: [[-26, -13], [-12, -8], [6, -6.5], [22, -7], [30, -11], [18, -16], [0, -16], [-16, -17]], tone: "belly" }],
        ao: [[-26, -30, 7, 11]],
      },
      collar: { d: "M-23,-44Q-28,-30 -22,-17", w: 1.2, tag: [-26, -21, 1.6] },
      head: {
        pivot: [-26, -34],
        pts: [[-62, -30], [-59, -35], [-52, -41], [-42, -46], [-32, -46], [-24, -40], [-22, -30], [-28, -22], [-40, -19], [-52, -22], [-58, -26]],
        strands: 30, flow: [1, 0.2], tuft: 1.3,
        marks: [{ pts: [[-59, -27], [-50, -24.5], [-40, -21.5], [-34, -20.5], [-42, -19.6], [-54, -22.6]], tone: "belly" }],
        eye: { at: [-43, -36], rx: 3.8, ry: 4, rot: -12, ring: 1.4 },
        nose: [[-63.5, -30.5], [-61.6, -32.6], [-59.4, -31.4], [-61, -29]],
        mouth: "M-61.6,-28.8Q-60,-26.4 -57,-25.8",
        whiskers: { at: [-57.5, -29], n: 6, from: 155, to: 210, len: 15, opacity: 0.6, width: 0.3 },
        ears: {
          near: { pts: [[-30, -44], [-30, -53], [-27, -62, 1], [-23, -53], [-22, -44]], inner: [[-28.5, -46], [-28.4, -52], [-27, -58], [-25, -52], [-24.4, -46]], brush: { at: [-27, -61], len: 8, n: 9, spread: 50, tilt: 10 } },
          far: { pts: [[-36, -45], [-36, -53], [-33, -60, 1], [-30, -52], [-30, -46]], inner: [[-35, -47], [-34.8, -52], [-33.2, -57], [-31.6, -52], [-31.4, -47]], brush: { at: [-33, -59], len: 7, n: 7, spread: 45, tilt: 5 } },
        },
      },
      legs: [
        leg([22, -20], 10, 11, [13, 6, 3.4], [-1, 0.25], 22, { pts: footPts(15, 2.6), tone: "skin" }, 0.55, true),
        leg([-20, -20], 8, 8, [8, 4.6, 3], [1, 0.15], -24, { pts: footPts(6.5, 2.2, 1.5), tone: "skin" }, 0.1, true),
        leg([18, -18], 10, 11, [13, 6, 3.4], [-1, 0.25], 14, { pts: footPts(15, 2.6), tone: "skin" }, 0.05),
        leg([-22, -18], 8, 8, [8, 4.6, 3], [1, 0.15], -30, { pts: footPts(6.5, 2.2, 1.5), tone: "skin" }, 0.6),
      ],
      tail: {
        pivot: [32, -30],
        pts: [[28, -32], [40, -44], [54, -58], [68, -72], [82, -80], [94, -78], [99, -68], [92, -58], [78, -52], [64, -42], [50, -30], [36, -22]],
        strands: 55, flow: [1, -0.6], tuft: 3.2, gap: 0.7, lean: 0.2, tw: 0.6, strandLen: 7,
      },
    },
  },

  beaver: {
    colors: { fur: "#6E4527", belly: "#8C6040", dark: "#3A2516", skin: "#45392F", mark: "#8E6A50", eye: "#0b0705", nose: "#1E1612", claw: "#D9CCBA", whisker: "#E7DED2", teeth: "#E08A2E" },
    coat: { flow: [0.3, 1], tuft: 1.8, gap: 0.9, tw: 0.6, strand: 5, sw: 0.45 },
    up: {
      pivot: [2, -6], box: [-46, -96, 78, 4], shadow: [12, 46, 7],
      body: {
        pts: [[-18, 0], [-28, -8], [-33, -22], [-32, -38], [-26, -50], [-16, -58], [-2, -62], [12, -60], [24, -52], [32, -38], [35, -22], [32, -8], [22, 0], [2, 1]],
        strands: 85,
        marks: [{ pts: [[-16, -1], [-27, -10], [-30, -24], [-28, -38], [-21, -48], [-12, -42], [-10, -26], [-10, -10]], tone: "belly", front: true, op: 0.8 }],
        ao: [[-14, -57, 14, 5]],
      },
      collar: { d: "M-30,-54Q-14,-48 4,-57", w: 1.4, tag: [-19, -51.2, 1.8] },
      head: {
        pivot: [-10, -58],
        pts: [[-37, -66], [-36, -72], [-31, -79], [-21, -84], [-9, -85], [1, -81], [5, -72], [3, -62], [-5, -56], [-17, -55], [-28, -57.5], [-34, -61]],
        strands: 40, flow: [1, 0.3], tuft: 1.6,
        marks: [{ pts: [[-37, -64], [-35, -72], [-27, -74], [-20, -67], [-21, -59], [-30, -58]], tone: "mark" }],
        eye: { at: [-21, -75.5], rx: 2.4, ry: 2.6, rot: -10 },
        nose: [[-39, -69], [-37, -73], [-33, -72.4], [-33.2, -68.8], [-36.4, -67.4]],
        teeth: "M-35.4,-62.4L-31.2,-62.4L-31.6,-56.4Q-33.3,-55.4 -35,-56.4Z", teethLine: "M-33.3,-62.2L-33.3,-55.8",
        mouth: "M-36,-63Q-31,-63.6 -26.5,-61.2",
        whiskers: { at: [-31, -66], n: 6, from: 160, to: 215, len: 13, opacity: 0.5 },
        ears: {
          near: { pts: [[-3, -79], [-3, -85], [1, -88.5], [5.5, -86], [6, -80]], inner: [[-1, -80.5], [-1, -84.5], [1.5, -86.5], [4, -84.5], [4, -81]] },
          far: { pts: [[-15, -82], [-14, -87.5], [-10, -89], [-7.5, -85]] },
        },
      },
      arms: { near: [-24, -46], far: [-18, -49], l1: 9, l2: 9, w: [10, 7, 4.6], bend: [0.45, 1], rest: { near: [-33, -38], far: [-31, -41] }, paw: { len: 5.6, w: 4.4, tone: "skin", toes: 4, claws: 4, clawLen: 1.8 } },
      feet: { near: { at: [-14, 0], pts: footPts(20, 4.4, 4), tone: "skin", toes: toeLines(20, 4.4), claws: toeClaws(20, 4.4, 4, 2.2) }, far: { at: [-22, -1.4], pts: footPts(16, 3.6, 3), tone: "skin" } },
      tail: { pivot: [24, -4], back: "over", tone: "skin", pts: [[22, -4], [32, -9.5], [50, -11.5], [66, -8.5], [73, -3], [67, 2], [48, 3], [30, 1]], tufts: false, strands: 0, scales: 3.2 },
    },
    four: {
      pivot: [0, -30], box: [-70, -62, 98, 4], shadow: [12, 58, 7],
      body: {
        pts: [[-30, -12], [-40, -22], [-42, -36], [-32, -50], [-12, -58], [12, -58], [32, -50], [44, -36], [46, -20], [38, -9], [18, -5], [-4, -5], [-20, -8]],
        strands: 90, flow: [1, 0.3],
        marks: [{ pts: [[-30, -11], [-16, -6], [4, -5.5], [24, -6], [38, -10], [24, -15], [0, -15], [-18, -16]], tone: "belly", op: 0.8 }],
        ao: [[-31, -32, 8, 13]],
      },
      collar: { d: "M-29,-48Q-34,-32 -28,-17", w: 1.4, tag: [-32, -21, 1.8] },
      head: {
        pivot: [-32, -32],
        pts: [[-67, -28], [-66, -34], [-61, -41], [-51, -46], [-39, -47], [-30, -42], [-27, -32], [-31, -22], [-43, -18], [-56, -19], [-63, -23]],
        strands: 36, flow: [1, 0.25], tuft: 1.6,
        marks: [{ pts: [[-67, -26], [-65, -34], [-57, -35], [-51, -28], [-53, -20], [-61, -20]], tone: "mark" }],
        eye: { at: [-49, -38], rx: 2.3, ry: 2.5, rot: -8 },
        nose: [[-69, -31], [-67, -35], [-63, -34.4], [-63.2, -30.8], [-66.4, -29.4]],
        teeth: "M-65.4,-24.4L-61.2,-24.4L-61.6,-18.4Q-63.3,-17.4 -65,-18.4Z", teethLine: "M-63.3,-24.2L-63.3,-17.8",
        mouth: "M-66,-25Q-61,-25.6 -56.5,-23.2",
        whiskers: { at: [-61, -28], n: 6, from: 160, to: 215, len: 13, opacity: 0.5 },
        ears: {
          near: { pts: [[-35, -44], [-35, -50], [-31, -53.5], [-26.5, -51], [-26, -45]], inner: [[-33, -45.5], [-33, -49.5], [-30.5, -51.5], [-28, -49.5], [-28, -46]] },
          far: { pts: [[-41, -46], [-40, -51], [-36, -52.5], [-33.5, -48.5]] },
        },
      },
      legs: [
        leg([30, -22], 10, 10, [16, 8, 5], [-1, 0.25], 30, { pts: footPts(16, 3.6, 3), tone: "skin", toes: toeLines(16, 3.6) }, 0.55, true),
        leg([-24, -20], 8, 8, [11, 6, 4], [1, 0.15], -30, { pts: footPts(7, 3, 1.5), tone: "skin", claws: toeClaws(7, 3, 4, 1.6) }, 0.1, true),
        leg([26, -20], 10, 10, [16, 8, 5], [-1, 0.25], 22, { pts: footPts(16, 3.6, 3), tone: "skin", toes: toeLines(16, 3.6) }, 0.05),
        leg([-26, -18], 8, 8, [11, 6, 4], [1, 0.15], -36, { pts: footPts(7, 3, 1.5), tone: "skin", claws: toeClaws(7, 3, 4, 1.6) }, 0.6),
      ],
      tail: { pivot: [44, -10], tone: "skin", pts: [[38, -14], [56, -16.5], [76, -16.5], [92, -12.5], [97, -7], [91, -2.5], [72, -1.5], [54, -3.5], [38, -8]], tufts: false, strands: 0, scales: 3.2 },
    },
  },

  sloth: {
    colors: { fur: "#8B7A66", belly: "#A79680", dark: "#3A2E25", skin: "#5A4A3D", mark: "#ECE1D1", eye: "#0b0705", nose: "#241B16", claw: "#D8C9B2", whisker: "#E8E0D2" },
    coat: { flow: [0.25, 1], tuft: 3, gap: 1, tw: 0.7, strand: 7, sw: 0.5 },
    up: {
      pivot: [2, -8], box: [-48, -94, 34, 4], shadow: [0, 36, 6],
      body: {
        pts: [[-20, 0], [-28, -10], [-31, -24], [-29, -40], [-22, -52], [-10, -60], [4, -61], [16, -55], [25, -42], [29, -26], [28, -10], [20, -1], [2, 1]],
        strands: 90, lean: 0.9,
        marks: [{ pts: [[-18, -2], [-26, -12], [-28, -26], [-24, -42], [-16, -50], [-10, -40], [-9, -24], [-10, -8]], tone: "belly", front: true, op: 0.75 }],
        ao: [[-12, -58, 14, 5]],
      },
      collar: { d: "M-25,-56Q-10,-50.5 7,-59", w: 1.3, tag: [-14, -53, 1.7] },
      head: SLOTH_HEAD,
      arms: { near: [-20, -48], far: [-14, -51], hang: { near: [-2, -56], far: [3, -58] }, l1: 24, l2: 24, w: [9, 6.5, 4.8], bend: [0.3, 1], tone: "fur", rest: { near: [-27, -14], far: [-23, -18] }, paw: { len: 5.6, w: 4.6, tone: "fur", toes: 3, claws: 3, clawLen: 8, clawW: 0.9 } },
      feet: { near: { at: [-14, 0], pts: footPts(10, 4, 4), tone: "fur", claws: toeClaws(10, 4, 3, 5.5), clawW: 0.8 }, far: { at: [-22, -1.4], pts: footPts(8, 3.4, 3), tone: "fur", claws: toeClaws(8, 3.4, 3, 4.5), clawW: 0.7 } },
    },
    four: {
      pivot: [0, -30], box: [-76, -82, 44, 4], shadow: [-12, 52, 6.5],
      body: {
        pts: [[-28, -16], [-36, -28], [-32, -42], [-18, -50], [2, -52], [20, -48], [32, -38], [36, -24], [30, -14], [14, -10], [-6, -10], [-20, -12]],
        strands: 80, lean: 0.9, flow: [0.6, 1],
        marks: [{ pts: [[-26, -15], [-12, -11], [8, -10.5], [26, -13], [20, -18], [0, -19], [-18, -19]], tone: "belly", op: 0.7 }],
        ao: [[-28, -38, 8, 10]],
      },
      collar: { d: "M-26,-50Q-33,-36 -26,-22", w: 1.3, tag: [-30, -26, 1.7] },
      head: { ...SLOTH_HEAD, pivot: [-30, -40], pts: sh(SLOTH_HEAD.pts, -30, 26), marks: SLOTH_HEAD.marks.map((m) => ({ ...m, pts: sh(m.pts, -30, 26) })), eye: { ...SLOTH_HEAD.eye, at: [-50, -49.2] }, nose: sh(SLOTH_HEAD.nose, -30, 26), mouth: shd(SLOTH_HEAD.mouth, -30, 26) },
      legs: [
        leg([22, -30], 12, 12, [12, 7, 5], [-1, 0.2], 20, { pts: footPts(9, 3.6, 3), tone: "fur", claws: toeClaws(9, 3.6, 3, 5), clawW: 0.8 }, 0.55, true),
        leg([-22, -36], 18, 18, [10, 6.5, 4.8], [1, 0.3], -52, { pts: footPts(7, 3.6, 2), tone: "fur", claws: toeClaws(7, 3.6, 3, 7), clawW: 0.9 }, 0.1, true),
        leg([18, -28], 12, 12, [12, 7, 5], [-1, 0.2], 12, { pts: footPts(9, 3.6, 3), tone: "fur", claws: toeClaws(9, 3.6, 3, 5), clawW: 0.8 }, 0.05),
        leg([-26, -34], 18, 18, [10, 6.5, 4.8], [1, 0.3], -60, { pts: footPts(7, 3.6, 2), tone: "fur", claws: toeClaws(7, 3.6, 3, 7), clawW: 0.9 }, 0.6),
      ],
    },
  },

  mole: {
    colors: { fur: "#3B3641", belly: "#4C4652", dark: "#211E25", skin: "#E6A6A1", mark: "#4C4652", eye: "#050404", nose: "#D78A87", claw: "#F4E9DD", whisker: "#E9E2DA" },
    coat: { flow: [0.3, 1], tuft: 0.8, gap: 0.9, tw: 0.45, strand: 3, sw: 0.35 },
    up: {
      pivot: [2, -6], box: [-52, -78, 40, 4], shadow: [0, 36, 6],
      body: {
        pts: [[-16, 0], [-24, -10], [-27, -24], [-26, -38], [-20, -50], [-10, -58], [2, -60], [14, -55], [22, -44], [26, -28], [25, -12], [18, -2], [2, 1]],
        strands: 40,
        ao: [[-10, -53, 12, 4]],
      },
      collar: { d: "M-25,-49.5Q-9,-43.5 9,-52", w: 1.4, tag: [-14, -45.6, 1.8] },
      head: {
        pivot: [-4, -56],
        pts: [[-41, -61.5], [-35, -65.5], [-25, -70], [-13, -74], [-1, -74], [8, -69], [12, -60], [8, -54], [-4, -52], [-18, -54], [-31, -57.5], [-39, -59.5]],
        strands: 28, flow: [1, 0.2], tuft: 0.7,
        under: [],
        eye: { at: [-21, -67], rx: 0.9, ry: 0.85 },
        snout: [[-48.5, -62.2], [-47, -64.2], [-42.5, -64.2], [-38.5, -63.2], [-38.5, -59.8], [-42.5, -59.2], [-47, -60]],
        nose: [[-50.4, -62], [-49, -64.2], [-47.2, -63.6], [-47.2, -60.2], [-49.2, -59.6]],
        whiskers: { at: [-41.5, -61], n: 5, from: 160, to: 215, len: 8, opacity: 0.6 },
      },
      arms: { near: [-22, -40], far: [-16, -44], l1: 8.5, l2: 8.5, w: [10, 8, 6.5], bend: [0.6, 1], rest: { near: [-26, -30], far: [-24, -34] }, paw: { len: 11, w: 11, tone: "skin", toes: 5, claws: 5, clawLen: 4.4, clawW: 1.1 } },
      feet: { near: { at: [-12, 0], pts: footPts(10, 3, 2.5), tone: "skin", claws: toeClaws(10, 3, 4, 1.6) }, far: { at: [-18, -1.2], pts: footPts(8, 2.6, 2), tone: "skin" } },
      tail: { pivot: [20, -6], back: "over", tone: "dark", pts: [[20, -6], [28, -9], [34, -7], [33, -3], [26, -1.5], [20, -2]], strands: 0, tuft: 0.8 },
    },
    four: {
      pivot: [0, -22], box: [-80, -46, 52, 4], shadow: [-10, 52, 6],
      body: {
        pts: [[-30, -10], [-38, -20], [-36, -32], [-24, -40], [-4, -43], [16, -41], [30, -34], [38, -24], [36, -12], [26, -5], [6, -4], [-16, -6]],
        strands: 45, flow: [1, 0.2],
        ao: [[-28, -24, 7, 9]],
      },
      collar: { d: "M-27,-38Q-32,-24 -27,-10", w: 1.4, tag: [-31, -14, 1.8] },
      head: {
        pivot: [-30, -24],
        pts: [[-63, -20.5], [-57, -25.5], [-46, -32], [-34, -37], [-26, -33], [-22, -24], [-26, -14], [-38, -11], [-52, -13.5], [-61, -17]],
        strands: 26, flow: [1, 0.15], tuft: 0.7,
        eye: { at: [-45, -27], rx: 0.9, ry: 0.85 },
        snout: [[-70.5, -21], [-69, -23], [-64.5, -23], [-60.5, -22], [-60.5, -18.2], [-64.5, -17.6], [-69, -18.4]],
        nose: [[-72.4, -20.6], [-71, -22.8], [-69.2, -22.2], [-69.2, -18.8], [-71.2, -18.2]],
        whiskers: { at: [-63.5, -19.5], n: 5, from: 160, to: 215, len: 8, opacity: 0.6 },
      },
      legs: [
        leg([24, -16], 7, 6, [12, 7, 4], [-1, 0.25], 24, { pts: footPts(8, 2.6), tone: "skin" }, 0.55, true),
        leg([-24, -18], 6, 6, [11, 8, 6.5], [1, 0.3], -34, { pts: [[3, 1], [2, -4], [-4, -6.5], [-10, -5.6], [-13, -2], [-10, 1.2], [-2, 1.6]], tone: "skin", claws: "M-12.6,-4.6Q-15.6,-4.8 -16.6,-2.6M-13.4,-2.6Q-16.6,-2.4 -17.2,0M-13,-0.6Q-16,0 -16.4,2.6M-11.6,1Q-14,2 -14,4.2", clawW: 0.9 }, 0.1, true),
        leg([20, -14], 7, 6, [12, 7, 4], [-1, 0.25], 16, { pts: footPts(8, 2.6), tone: "skin" }, 0.05),
        leg([-28, -16], 6, 6, [11, 8, 6.5], [1, 0.3], -42, { pts: [[3, 1], [2, -4], [-4, -6.5], [-10, -5.6], [-13, -2], [-10, 1.2], [-2, 1.6]], tone: "skin", claws: "M-12.6,-4.6Q-15.6,-4.8 -16.6,-2.6M-13.4,-2.6Q-16.6,-2.4 -17.2,0M-13,-0.6Q-16,0 -16.4,2.6M-11.6,1Q-14,2 -14,4.2", clawW: 0.9 }, 0.6),
      ],
      tail: { pivot: [36, -14], tone: "dark", pts: [[35, -16], [43, -18], [48, -14], [45, -10], [36, -10]], strands: 0, tuft: 0.8 },
    },
  },

  kangaroo: {
    colors: { fur: "#B27A4C", belly: "#EAD9C2", dark: "#4E331F", skin: "#D9A39A", mark: "#E9D7C1", eye: "#0b0705", nose: "#241912", claw: "#2C2019", whisker: "#E9DFD2" },
    coat: { flow: [0.3, 1], tuft: 1.2, gap: 0.9, tw: 0.5, strand: 4, sw: 0.38 },
    up: {
      pivot: [6, -6], box: [-40, -108, 78, 4], shadow: [16, 46, 6],
      body: {
        pts: [[-8, -6], [-13, -18], [-15, -32], [-13, -46], [-9, -58], [-4, -66], [4, -68], [10, -62], [14, -50], [22, -38], [31, -24], [33, -12], [26, -3], [10, -1]],
        strands: 60,
        marks: [{ pts: [[-6, -7], [-12, -18], [-14, -32], [-12, -46], [-8, -56], [-3, -50], [-2, -34], [-2, -16]], tone: "belly", front: true }],
        ao: [[-4, -64, 7, 3]],
      },
      collar: { d: "M-9,-62Q-1,-57.5 8.5,-63.5", w: 1.2, tag: [-2, -58.6, 1.5] },
      head: {
        pivot: [-2, -66],
        pts: [[-34, -71], [-33, -76], [-26, -81], [-15, -84.5], [-4, -84], [4, -80], [6, -72], [2, -66], [-6, -63.5], [-17, -64.5], [-27, -66.5], [-32, -68]],
        strands: 30, flow: [1, 0.25], tuft: 1.1,
        marks: [{ pts: [[-33, -70.4], [-28, -70.2], [-18, -67.4], [-10, -65.4], [-22, -65.6], [-30, -68]], tone: "mark" }],
        eye: { at: [-12.5, -78], rx: 2.7, ry: 2.9, rot: -10 },
        nose: [[-35.6, -73.6], [-34.6, -77], [-31, -77.2], [-30.2, -73.8], [-32.8, -72]],
        mouth: "M-33.4,-71.4Q-30.6,-69.4 -26.4,-69.4",
        whiskers: { at: [-30, -73.4], n: 4, from: 160, to: 205, len: 8, opacity: 0.45 },
        ears: {
          near: { pts: [[0, -80], [-1.5, -90], [0, -100], [4, -107, 1], [7.5, -98], [8.5, -88], [6, -80]], inner: [[1.8, -82], [1.2, -90], [2.4, -98], [4.2, -103], [6, -96], [6.4, -88], [4.8, -82]] },
          far: { pts: [[-9, -82], [-11, -92], [-9.5, -100], [-6.5, -104, 1], [-3.5, -96], [-2.5, -86]], inner: [[-7.6, -84], [-9.2, -92], [-8, -99], [-6.6, -101], [-4.8, -95], [-4.2, -87]] },
        },
      },
      arms: { near: [-10, -50], far: [-6, -53], l1: 8, l2: 8, w: [6.5, 4.6, 3.2], bend: [0.45, 1], rest: { near: [-18, -40], far: [-16, -43] }, paw: { len: 4.4, w: 3, tone: "dark", toes: 4, claws: 4, clawLen: 1.4 } },
      feet: { near: { at: [6, 0], pts: footPts(30, 4, 8), tone: "dark", toes: toeLines(30, 4) }, far: { at: [0, -1.4], pts: footPts(26, 3.4, 6), tone: "dark" } },
      tail: { pivot: [24, -14], back: "over", pts: [[18, -28], [30, -20], [44, -11], [60, -5], [76, -2], [78, 1.5], [60, 2], [40, 1], [24, -4], [14, -12]], strands: 30, tuft: 1.2, flow: [1, 0.3] },
    },
    four: {
      pivot: [6, -28], box: [-62, -86, 92, 4], shadow: [10, 54, 6],
      body: {
        pts: [[-22, -20], [-28, -32], [-24, -44], [-12, -52], [6, -54], [22, -50], [34, -40], [40, -26], [38, -12], [28, -4], [10, -4], [-8, -10]],
        strands: 60, flow: [1, 0.3],
        marks: [{ pts: [[-22, -19], [-12, -12], [6, -8], [24, -6], [32, -10], [18, -16], [0, -18], [-14, -24]], tone: "belly" }],
        ao: [[-20, -38, 6, 10]],
      },
      collar: { d: "M-20,-48Q-25,-38 -20,-27", w: 1.2, tag: [-23.4, -30, 1.5] },
      head: {
        pivot: [-22, -40],
        pts: [[-57, -38], [-56, -43], [-49, -48], [-38, -51.5], [-27, -51], [-19, -47], [-17, -39], [-21, -33], [-29, -30.5], [-40, -31.5], [-50, -33.5], [-55, -35]],
        strands: 28, flow: [1, 0.25], tuft: 1.1,
        marks: [{ pts: [[-56, -38.4], [-51, -38], [-41, -35], [-33, -33], [-45, -33.4], [-53, -36]], tone: "mark" }],
        eye: { at: [-35.5, -45], rx: 2.7, ry: 2.9, rot: -10 },
        nose: [[-58.6, -40.6], [-57.6, -44], [-54, -44.2], [-53.2, -40.8], [-55.8, -39]],
        mouth: "M-56.4,-38.4Q-53.6,-36.4 -49.4,-36.4",
        whiskers: { at: [-53, -40.4], n: 4, from: 160, to: 205, len: 8, opacity: 0.45 },
        ears: {
          near: { pts: [[-23, -47], [-24.5, -57], [-23, -67], [-19, -74, 1], [-15.5, -65], [-14.5, -55], [-17, -47]], inner: [[-21.2, -49], [-21.8, -57], [-20.6, -65], [-18.8, -70], [-17, -63], [-16.6, -55], [-18.2, -49]] },
          far: { pts: [[-32, -49], [-34, -59], [-32.5, -67], [-29.5, -71, 1], [-26.5, -63], [-25.5, -53]], inner: [[-30.6, -51], [-32.2, -59], [-31, -66], [-29.6, -68], [-27.8, -62], [-27.2, -54]] },
        },
      },
      legs: [
        leg([26, -18], 9, 9, [18, 8, 5], [-1, 0.2], 18, { pts: footPts(24, 3.6, 6), tone: "dark" }, 0.55, true),
        leg([-16, -28], 10, 10, [8, 4.6, 3], [1, 0.15], -24, { pts: footPts(5, 2.4, 1.5), tone: "dark" }, 0.1, true),
        leg([22, -16], 9, 9, [18, 8, 5], [-1, 0.2], 12, { pts: footPts(24, 3.6, 6), tone: "dark" }, 0.05),
        leg([-18, -26], 10, 10, [8, 4.6, 3], [1, 0.15], -30, { pts: footPts(5, 2.4, 1.5), tone: "dark" }, 0.6),
      ],
      tail: { pivot: [36, -24], pts: [[36, -26], [50, -17], [68, -9], [84, -4], [87, -0.5], [70, 0.5], [50, -2], [38, -10]], strands: 26, tuft: 1.2, flow: [1, 0.3] },
    },
  },

  fennec: {
    colors: { fur: "#E0BC8A", belly: "#F7EFE3", dark: "#2B211A", skin: "#ECBFB2", mark: "#FBF7F0", eye: "#140d08", nose: "#1A1310", claw: "#3a2c22", whisker: "#3a2c22" },
    coat: { flow: [0.3, 1], tuft: 1.4, gap: 0.9, tw: 0.5, strand: 4.5, sw: 0.38 },
    up: {
      pivot: [2, -6], box: [-40, -104, 60, 4], shadow: [8, 34, 6],
      body: {
        pts: [[-12, 0], [-18, -10], [-20, -24], [-18, -38], [-13, -48], [-6, -54], [4, -54], [12, -46], [18, -32], [22, -18], [22, -7], [16, -1], [2, 1]],
        strands: 50,
        marks: [{ pts: [[-10, -1], [-16, -10], [-18, -24], [-16, -37], [-11, -46], [-5, -40], [-4, -24], [-5, -8]], tone: "belly", front: true }],
        ao: [[-8, -50, 10, 4]],
      },
      collar: { d: "M-17,-48Q-5,-43 7,-50", w: 1.2, tag: [-8, -45.4, 1.6] },
      head: {
        pivot: [-4, -52],
        pts: [[-34, -58], [-31, -61], [-24, -64], [-16, -68], [-8, -69], [0, -66], [4, -60], [2, -53], [-4, -50], [-14, -51], [-24, -53], [-31, -56]],
        strands: 26, flow: [1, 0.2], tuft: 1.1,
        marks: [
          { pts: [[-33, -57.5], [-26, -58], [-18, -56], [-10, -52], [-16, -51], [-27, -54]], tone: "mark" },
          { pts: [[-20, -57], [-12, -60], [-4, -58], [-6, -52], [-14, -52]], tone: "mark", op: 0.9 },
        ],
        lines: [{ d: "M-18.6,-60.6Q-21.4,-57.6 -25.4,-56.8", tone: "dark", w: 0.9, op: 0.8 }],
        eye: { at: [-16, -62.6], rx: 3, ry: 3.2, rot: -14 },
        nose: [[-36, -58.6], [-34.4, -60.6], [-32, -60], [-32.4, -57.6], [-34.6, -57]],
        mouth: "M-34,-56.8Q-31,-55.2 -27,-55.6",
        whiskers: { at: [-30, -58], n: 5, from: 160, to: 210, len: 13, opacity: 0.5, width: 0.3 },
        ears: {
          near: { pts: [[-2, -66], [-4, -78], [-2, -90], [2, -100, 1], [8, -90], [10, -78], [8, -66]], inner: [[0, -68], [-1.5, -78], [0, -88], [2.4, -95], [6, -88], [7.4, -78], [6, -69]], tuft: 0.8 },
          far: { pts: [[-12, -68], [-16, -79], [-15, -90], [-11, -98, 1], [-6, -88], [-4, -77], [-5, -69]], inner: [[-11, -70], [-14, -79], [-13, -88], [-11, -93], [-7.6, -87], [-6.4, -78], [-7, -71]] },
        },
      },
      arms: { near: [-12, -42], far: [-7, -45], l1: 9, l2: 9, w: [6, 4.2, 3], bend: [0.45, 1], rest: { near: [-20, -34], far: [-18, -37] }, paw: { len: 4.4, w: 3, tone: "fur", toes: 4, claws: 4, clawLen: 1.2, clawW: 0.3 } },
      feet: { near: { at: [-8, 0], pts: footPts(15, 3, 3), tone: "fur", toes: toeLines(15, 3) }, far: { at: [-14, -1.2], pts: footPts(12, 2.6, 2), tone: "fur" } },
      tail: {
        pivot: [16, -6], back: "over",
        pts: [[14, -6], [26, -6], [38, -8], [48, -14], [54, -24], [52, -32], [46, -30], [40, -22], [30, -15], [18, -12]],
        strands: 30, tuft: 2.4, gap: 0.8, lean: 0.3, flow: [1, -0.4],
        marks: [{ pts: [[49, -17], [54, -23], [53, -31], [48, -30.5], [47, -24]], tone: "dark", op: 0.85 }],
      },
    },
    four: {
      pivot: [0, -36], box: [-64, -90, 82, 4], shadow: [4, 46, 5.5],
      body: {
        pts: [[-28, -26], [-34, -34], [-30, -44], [-16, -48], [4, -48], [20, -46], [30, -40], [34, -30], [30, -24], [18, -22], [0, -22], [-16, -24]],
        strands: 45, flow: [1, 0.3],
        marks: [{ pts: [[-28, -25], [-14, -22.5], [2, -22], [18, -22.5], [28, -25], [16, -28], [0, -28], [-16, -29]], tone: "belly" }],
        ao: [[-27, -40, 6, 8]],
      },
      collar: { d: "M-24,-52Q-30,-44 -24,-36", w: 1.2, tag: [-28, -39, 1.6] },
      head: {
        pivot: [-28, -40],
        pts: [[-60, -44], [-56, -47], [-48, -50], [-40, -54], [-32, -55], [-24, -51], [-22, -44], [-26, -38], [-36, -37], [-48, -39], [-56, -41]],
        strands: 24, flow: [1, 0.2], tuft: 1.1,
        marks: [{ pts: [[-59, -43], [-52, -43], [-44, -41], [-36, -38], [-44, -38], [-54, -40.5]], tone: "mark" }],
        lines: [{ d: "M-43,-46Q-46,-43.6 -50,-43", tone: "dark", w: 0.9, op: 0.8 }],
        eye: { at: [-41, -48], rx: 2.8, ry: 3, rot: -10 },
        nose: [[-62, -44.8], [-60.4, -46.8], [-58, -46.2], [-58.4, -43.8], [-60.6, -43.2]],
        mouth: "M-60,-43Q-57,-41.4 -53,-41.8",
        whiskers: { at: [-56, -44], n: 5, from: 160, to: 210, len: 13, opacity: 0.5, width: 0.3 },
        ears: {
          near: { pts: [[-30, -52], [-32, -64], [-30, -76], [-26, -86, 1], [-20, -76], [-18, -64], [-20, -52]], inner: [[-28.4, -54], [-30, -64], [-28.4, -74], [-26, -81], [-22, -74], [-20.6, -64], [-22, -55]], tuft: 0.8 },
          far: { pts: [[-38, -53], [-41, -64], [-40, -74], [-36, -82, 1], [-31, -73], [-29, -62], [-30, -53]], inner: [[-37, -55], [-39.4, -64], [-38.4, -72], [-36, -77], [-32.6, -71], [-31.4, -63], [-32, -55]] },
        },
      },
      legs: [
        leg([24, -34], 15, 17, [12, 5, 3.4], [-1, 0.25], 24, { pts: footPts(9, 2.6), tone: "fur" }, 0.55, true),
        leg([-22, -34], 15, 15, [8, 4.4, 3], [1, 0.15], -24, { pts: footPts(6, 2.4, 1.5), tone: "fur" }, 0.1, true),
        leg([20, -32], 15, 17, [12, 5, 3.4], [-1, 0.25], 16, { pts: footPts(9, 2.6), tone: "fur" }, 0.05),
        leg([-24, -32], 15, 15, [8, 4.4, 3], [1, 0.15], -30, { pts: footPts(6, 2.4, 1.5), tone: "fur" }, 0.6),
      ],
      tail: {
        pivot: [30, -34],
        pts: [[30, -36], [42, -34], [56, -30], [68, -26], [76, -22], [74, -16], [64, -17], [50, -20], [38, -24], [30, -28]],
        strands: 30, tuft: 2.4, gap: 0.8, lean: 0.3, flow: [1, 0.2],
        marks: [{ pts: [[68, -24.5], [75.6, -21.6], [73.6, -16.4], [67, -17.4], [66, -21]], tone: "dark", op: 0.85 }],
      },
    },
  },

  raccoon: {
    colors: { fur: "#8C8378", belly: "#B5ADA2", dark: "#2B2724", skin: "#3A3430", mark: "#EFEBE4", eye: "#0b0807", nose: "#151210", claw: "#cbbfb0", whisker: "#F2EEE8" },
    coat: { flow: [0.3, 1], tuft: 1.9, gap: 0.85, tw: 0.6, strand: 5, sw: 0.45 },
    up: {
      pivot: [2, -6], box: [-44, -90, 74, 4], shadow: [10, 42, 6.5],
      body: {
        pts: [[-18, 0], [-26, -9], [-30, -22], [-29, -36], [-24, -47], [-14, -55], [0, -58], [13, -54], [23, -44], [29, -30], [30, -15], [26, -4], [14, 1], [-2, 1]],
        strands: 90,
        marks: [{ pts: [[-16, -1], [-24, -10], [-27, -23], [-26, -36], [-20, -45], [-13, -39], [-11, -24], [-12, -9]], tone: "belly", front: true, op: 0.8 }],
        ao: [[-12, -52, 13, 5]],
      },
      collar: { d: "M-27,-49Q-12,-43.5 4,-52", w: 1.3, tag: [-16, -46, 1.7] },
      head: {
        pivot: [-6, -54],
        pts: [[-36, -61], [-33, -64], [-26, -68], [-17, -73], [-6, -75], [4, -72], [9, -64], [6, -56], [-2, -51], [-14, -51], [-26, -54], [-33, -58]],
        strands: 36, flow: [1, 0.2], tuft: 1.4,
        marks: [
          { pts: [[-34, -62], [-28, -66], [-20, -68.5], [-11, -71.5], [-4, -71.5], [-9, -67.5], [-18, -65], [-27, -62.5]], tone: "mark" },
          { pts: [[-34, -59], [-28, -58], [-20, -56], [-14, -53], [-24, -54], [-31, -56.5]], tone: "mark" },
          { pts: [[-30.5, -62.6], [-23, -66.4], [-14, -66.6], [-6, -63.4], [-8, -58.6], [-16, -59.2], [-25, -60]], tone: "dark", soft: false },
        ],
        eye: { at: [-16, -63], rx: 2.6, ry: 2.7, rot: -10 },
        nose: [[-38, -61], [-36.4, -63.2], [-34, -62.6], [-34.4, -59.8], [-36.6, -59.2]],
        mouth: "M-35.8,-58.8Q-32.4,-56.8 -28,-57.2",
        whiskers: { at: [-31, -59], n: 5, from: 155, to: 210, len: 12, opacity: 0.7 },
        ears: {
          near: { pts: [[-4, -71], [-5, -79], [-1, -84], [5, -83], [8, -77], [5, -70]], inner: [[-2.4, -72.4], [-3, -78.6], [0, -82], [4.4, -81], [6, -76.6], [3.8, -72]], innerTone: "mark", tuft: 1 },
          far: { pts: [[-16, -73], [-17, -80], [-13, -84], [-8, -81], [-8, -74]], inner: [[-14.6, -74], [-15.2, -79.4], [-12.6, -82], [-9.6, -80], [-9.6, -75]], innerTone: "mark" },
        },
      },
      arms: { near: [-20, -42], far: [-14, -45], l1: 9.5, l2: 9.5, w: [8, 5.6, 4], bend: [0.45, 1], rest: { near: [-29, -34], far: [-27, -37] }, paw: { len: 5.4, w: 3.8, tone: "skin", toes: 5, claws: 5, clawLen: 1.4, clawW: 0.35 } },
      feet: { near: { at: [-12, 0], pts: footPts(17, 3.6, 4), tone: "skin", toes: toeLines(17, 3.6) }, far: { at: [-20, -1.3], pts: footPts(14, 3, 3), tone: "skin" } },
      tail: {
        pivot: [22, -8], back: "over",
        pts: [[20, -8], [34, -8], [48, -10], [60, -14], [68, -20], [66, -26], [56, -24], [44, -20], [32, -16], [20, -14]],
        strands: 30, tuft: 2.2, gap: 0.8, lean: 0.3, flow: [1, -0.2],
        marks: [
          { pts: [[30, -7.6], [35, -7.8], [34.4, -17], [29.4, -16.4]], tone: "dark", soft: false },
          { pts: [[42, -9.2], [47, -10], [46, -20.4], [41, -19.4]], tone: "dark", soft: false },
          { pts: [[54, -12], [58.4, -14], [57, -23.4], [52.6, -22]], tone: "dark", soft: false },
          { pts: [[63, -17], [68.6, -20.6], [66, -26.4], [61.4, -25]], tone: "dark", soft: false },
        ],
      },
    },
    four: {
      pivot: [0, -30], box: [-70, -58, 90, 4], shadow: [6, 54, 6.5],
      body: {
        pts: [[-30, -14], [-38, -24], [-36, -36], [-24, -46], [-4, -52], [16, -54], [32, -48], [40, -36], [40, -22], [32, -12], [14, -10], [-8, -10], [-22, -11]],
        strands: 90, flow: [1, 0.35],
        marks: [{ pts: [[-30, -13], [-16, -10.5], [4, -10], [22, -10.5], [34, -14], [20, -18], [0, -18], [-18, -19]], tone: "belly", op: 0.8 }],
        ao: [[-30, -30, 7, 11]],
      },
      collar: { d: "M-26,-44Q-31,-30 -25,-17", w: 1.3, tag: [-29, -21, 1.7] },
      head: {
        pivot: [-30, -28],
        pts: [[-64, -26], [-60, -30], [-52, -35], [-42, -40], [-32, -41], [-24, -36], [-22, -27], [-28, -19], [-40, -17], [-52, -19], [-60, -23]],
        strands: 34, flow: [1, 0.2], tuft: 1.4,
        marks: [
          { pts: [[-56, -31], [-48, -35.5], [-38, -37.5], [-32, -36], [-40, -34.5], [-50, -33]], tone: "mark" },
          { pts: [[-62, -24.5], [-56, -24], [-48, -22], [-42, -19], [-52, -19.6], [-59, -22]], tone: "mark" },
          { pts: [[-58, -28], [-50, -32.5], [-40, -33], [-32, -30], [-34, -25.5], [-44, -25.5], [-53, -26.5]], tone: "dark", soft: false },
        ],
        eye: { at: [-43, -30], rx: 2.4, ry: 2.5, rot: -8 },
        nose: [[-66, -26.4], [-64.4, -28.6], [-62, -28], [-62.4, -25.2], [-64.6, -24.6]],
        mouth: "M-63.8,-24.2Q-60.4,-22.2 -56,-22.6",
        whiskers: { at: [-59, -24.5], n: 5, from: 155, to: 210, len: 12, opacity: 0.7 },
        ears: {
          near: { pts: [[-30, -38], [-31, -46], [-27, -51], [-21, -50], [-18, -44], [-21, -38]], inner: [[-28.6, -39.4], [-29.4, -45.4], [-26.4, -49], [-22, -48.4], [-20, -44], [-22.4, -39.6]], innerTone: "mark", tuft: 1 },
          far: { pts: [[-38, -40], [-39, -47], [-35, -50], [-31, -47], [-31, -41]] },
        },
      },
      legs: [
        leg([28, -28], 11, 11, [14, 7, 4.6], [-1, 0.25], 28, { pts: footPts(13, 3, 3), tone: "skin" }, 0.55, true),
        leg([-24, -24], 9, 10, [10, 6, 4], [1, 0.15], -30, { pts: footPts(8, 2.8, 2), tone: "skin", claws: toeClaws(8, 2.8, 4, 1.2) }, 0.1, true),
        leg([24, -26], 11, 11, [14, 7, 4.6], [-1, 0.25], 20, { pts: footPts(13, 3, 3), tone: "skin" }, 0.05),
        leg([-26, -22], 9, 10, [10, 6, 4], [1, 0.15], -36, { pts: footPts(8, 2.8, 2), tone: "skin", claws: toeClaws(8, 2.8, 4, 1.2) }, 0.6),
      ],
      tail: {
        pivot: [38, -28],
        pts: [[38, -30], [50, -30], [64, -28], [76, -24], [84, -20], [82, -14], [70, -15], [56, -18], [44, -22], [36, -24]],
        strands: 30, tuft: 2.2, gap: 0.8, lean: 0.3, flow: [1, 0.2],
        marks: [
          { pts: [[47, -30.4], [52, -30], [51, -19.6], [46.4, -21]], tone: "dark", soft: false },
          { pts: [[60, -28.6], [65, -27.6], [63.6, -16.8], [58.8, -17.6]], tone: "dark", soft: false },
          { pts: [[72, -25.4], [77, -23.6], [75, -14.6], [70.4, -15.2]], tone: "dark", soft: false },
          { pts: [[80, -21.6], [84.6, -19.6], [82.6, -14], [78.6, -14.4]], tone: "dark", soft: false },
        ],
      },
    },
  },

  otter: {
    colors: { fur: "#5E4330", belly: "#A68A6E", dark: "#2E2018", skin: "#3A2C24", mark: "#D9C8B2", eye: "#0a0705", nose: "#18110D", claw: "#d4c6b4", whisker: "#EDE6DA" },
    coat: { flow: [0.3, 1], tuft: 0.9, gap: 0.85, tw: 0.45, strand: 4, sw: 0.36 },
    up: {
      pivot: [2, -6], box: [-38, -90, 72, 4], shadow: [14, 40, 5.5],
      body: {
        pts: [[-11, 0], [-16, -10], [-18, -24], [-17, -38], [-14, -50], [-12, -60], [-9, -67], [3, -68], [9, -61], [14, -48], [20, -30], [21, -12], [15, -2], [2, 1]],
        strands: 50,
        marks: [{ pts: [[-10, -2], [-15, -12], [-17, -26], [-16, -40], [-13, -54], [-10, -64], [-5, -52], [-4, -30], [-5, -12]], tone: "belly", front: true, op: 0.85 }],
        ao: [[-5, -64, 8, 3]],
      },
      collar: { d: "M-14,-60Q-3,-55 9,-61.5", w: 1.2, tag: [-6, -57.4, 1.6] },
      head: {
        pivot: [-4, -64],
        pts: [[-29, -70], [-29, -75], [-23, -79], [-13, -81.5], [-2, -81], [6, -77], [8, -70], [4, -64], [-4, -61.5], [-15, -62], [-23, -64.5], [-28, -67]],
        strands: 24, flow: [1, 0.2], tuft: 0.8,
        marks: [
          { pts: [[-28.5, -68], [-23, -66], [-14, -64], [-6, -62], [-15, -62.4], [-24, -65]], tone: "mark" },
          { pts: [[-28, -73], [-24, -74.5], [-19, -72], [-19.6, -67.4], [-25, -67]], tone: "belly", op: 0.6 },
        ],
        eye: { at: [-14, -74.5], rx: 2.3, ry: 2.4, rot: -6 },
        nose: [[-31.4, -73.6], [-30.4, -76], [-27, -76.2], [-26.4, -73.4], [-28.8, -72]],
        mouth: "M-29.4,-70.8Q-27,-68.6 -22.4,-68.8",
        whiskers: { at: [-24, -71], n: 9, from: 145, to: 220, len: 17, opacity: 0.85 },
        ears: {
          near: { pts: [[0, -75], [0.4, -79.4], [3.6, -80.4], [5.8, -77.4], [4.2, -74]], tuft: 0.5 },
        },
      },
      arms: { near: [-12, -48], far: [-7, -51], l1: 8, l2: 8, w: [6.5, 4.6, 3.4], bend: [0.45, 1], rest: { near: [-21, -40], far: [-19, -43] }, paw: { len: 4.6, w: 3.4, tone: "skin", toes: 5, claws: 5, clawLen: 1, clawW: 0.3 } },
      feet: { near: { at: [-8, 0], pts: footPts(16, 3.4, 3), tone: "skin", toes: toeLines(16, 3.4) }, far: { at: [-14, -1.2], pts: footPts(13, 3, 2), tone: "skin" } },
      tail: { pivot: [14, -10], back: "over", pts: [[10, -20], [24, -11], [38, -6], [54, -3], [66, -1], [68, 1.5], [54, 2], [36, 1], [20, -1], [8, -6]], strands: 20, tuft: 0.8, flow: [1, 0.2] },
    },
    four: {
      pivot: [0, -26], box: [-70, -46, 100, 4], shadow: [12, 58, 6],
      body: {
        pts: [[-34, -14], [-40, -22], [-36, -32], [-22, -38], [0, -42], [20, -40], [34, -34], [42, -24], [40, -14], [30, -9], [10, -8], [-12, -9], [-26, -10]],
        strands: 50, flow: [1, 0.25],
        marks: [{ pts: [[-34, -13], [-20, -9.5], [0, -8.5], [20, -9], [34, -12], [20, -15], [0, -15], [-20, -16]], tone: "belly", op: 0.8 }],
        ao: [[-33, -26, 6, 9]],
      },
      collar: { d: "M-31,-36Q-36,-24 -30,-11", w: 1.2, tag: [-34, -15, 1.6] },
      head: {
        pivot: [-34, -24],
        pts: [[-63, -23], [-63, -27.5], [-56, -31], [-46, -33.5], [-37, -34], [-30, -30], [-28, -23], [-32, -17.5], [-42, -16], [-53, -17], [-60, -19.5]],
        strands: 22, flow: [1, 0.15], tuft: 0.8,
        marks: [{ pts: [[-63, -22], [-56, -20], [-48, -18], [-40, -16.5], [-50, -16.8], [-58, -19.5]], tone: "mark" }],
        eye: { at: [-49, -29], rx: 2.3, ry: 2.5, rot: -8 },
        nose: [[-65.6, -25.4], [-64, -27.4], [-61.6, -27], [-61.6, -24.4], [-63.8, -23.8]],
        mouth: "M-63.6,-23.2Q-61,-21.4 -56.8,-21.6",
        whiskers: { at: [-59.5, -24], n: 8, from: 150, to: 215, len: 16, opacity: 0.8 },
        ears: {
          near: { pts: [[-35, -29], [-35, -33], [-32, -34], [-30, -31.4], [-31.4, -28.6]], tuft: 0.5 },
        },
      },
      legs: [
        leg([30, -20], 7, 7, [12, 6, 4], [-1, 0.25], 30, { pts: footPts(12, 3, 3), tone: "skin" }, 0.55, true),
        leg([-26, -18], 6, 6, [9, 5, 3.6], [1, 0.15], -30, { pts: footPts(7, 2.6, 2), tone: "skin" }, 0.1, true),
        leg([26, -18], 7, 7, [12, 6, 4], [-1, 0.25], 22, { pts: footPts(12, 3, 3), tone: "skin" }, 0.05),
        leg([-28, -16], 6, 6, [9, 5, 3.6], [1, 0.15], -36, { pts: footPts(7, 2.6, 2), tone: "skin" }, 0.6),
      ],
      tail: { pivot: [40, -16], pts: [[36, -30], [52, -22], [70, -13], [86, -7], [96, -4], [96, -1], [84, -1.5], [66, -4], [50, -8], [36, -12]], strands: 20, tuft: 0.8, flow: [1, 0.2] },
    },
  },

  crab: {
    colors: { fur: "#C4533B", belly: "#E9B994", dark: "#7A2E20", skin: "#3A2620", mark: "#F0C9A6", eye: "#0a0606", claw: "#2a1a14" },
    coat: { shell: true, flow: [0, 1], tuft: 0, gap: 1, tw: 0.4, strand: 3, sw: 0.3 },
    up: {
      pivot: [0, -20], box: [-56, -74, 50, 4], shadow: [0, 46, 7],
      body: {
        pts: [[-34, -36], [-32, -46], [-24, -54], [-10, -58], [6, -58], [20, -54], [30, -46], [32, -36], [26, -28], [12, -24], [-6, -24], [-22, -27]],
        marks: [
          { pts: [[-30, -34], [-18, -28], [0, -26], [18, -28], [28, -34], [14, -30.5], [0, -30], [-16, -31]], tone: "belly", op: 0.85 },
          { pts: [[-12, -50], [-6, -53], [-2, -50], [-7, -47.5]], tone: "dark", op: 0.45 },
          { pts: [[8, -50.5], [13, -52.5], [17, -49], [12, -47]], tone: "dark", op: 0.45 },
          { pts: [[-2, -44], [3, -45.5], [6, -42], [1, -40.5]], tone: "dark", op: 0.35 },
        ],
        under: [
          { cl: [[22, -32], [36, -38], [46, -20], [50, -2]], w: [4, 3.4, 2.6, 1.4], tone: "dark" },
          { cl: [[14, -30], [28, -34], [36, -18], [38, -1]], w: [4, 3.4, 2.6, 1.4], tone: "dark" },
          { cl: [[-18, -32], [-30, -36], [-38, -18], [-40, -1]], w: [4, 3.4, 2.6, 1.4], tone: "dark" },
        ],
        over: [
          { cl: [[24, -30], [40, -32], [50, -14], [54, 0]], w: [4.6, 4, 3, 1.6] },
          { cl: [[16, -28], [30, -28], [38, -12], [40, 0]], w: [4.6, 4, 3, 1.6] },
          { cl: [[8, -27], [18, -24], [24, -10], [24, 1]], w: [4.6, 4, 3, 1.6] },
          { cl: [[-14, -28], [-26, -28], [-32, -12], [-34, 0]], w: [4.6, 4, 3, 1.6] },
        ],
      },
      collar: { d: "M-30,-36Q-20,-31 -10,-31", w: 1.2, tag: [-20, -32.6, 1.6] },
      head: {
        pivot: [-20, -54],
        pts: [[-30, -52], [-27, -57], [-20, -59], [-13, -57], [-12, -52], [-20, -50]],
        lines: [
          { d: "M-24,-56Q-26,-62 -25,-67", tone: "fur", w: 1.6 },
          { d: "M-16,-57Q-15,-63 -14,-68", tone: "fur", w: 1.6, front: true },
        ],
        eye: { at: [-25, -68.4], rx: 2, ry: 2.2 },
        eyeFar: { at: [-14, -69.2], rx: 1.9, ry: 2.1 },
        mouth: "M-30,-44Q-27,-42 -23,-43",
      },
      arms: { near: [-26, -38], far: [-20, -40], l1: 9, l2: 10, w: [5, 5, 4.6], bend: [0.3, 1], tone: "fur", rest: { near: [-38, -40], far: [-36, -44] }, paw: { len: 15, w: 9, pincer: true, tone: "fur" } },
    },
  },

  // An electric eel has no limbs: its body lies along a path in the world (pose.path, head first) and is
  // drawn in screen space each frame. Units are 1% of its length; the head is drawn like the others' heads.
  eel: {
    colors: { fur: "#4B4A3A", belly: "#E59A3A", dark: "#2B2A21", skin: "#6E6A52", mark: "#F0C27A", eye: "#120d08", nose: "#1d1b14" },
    coat: { shell: true, flow: [0, 1], tuft: 0, gap: 1, tw: 0.4, strand: 3, sw: 0.3 },
    path: {
      width: 4.6, fin: 2.4,
      head: {
        len: 15.6,
        pts: [[2.5, -4.7], [-3, -5.1], [-8.5, -4.8], [-12.4, -3.6], [-15, -1.7], [-15.6, 0.3], [-14.6, 2.3], [-11, 3.5], [-5.5, 4.3], [0, 4.7], [2.5, 4.6]],
        marks: [{ pts: [[-13.6, 1.8], [-9, 3.4], [-3, 4.3], [2.4, 4.3], [2, 2.6], [-4, 2.2], [-10, 1.6]], tone: "belly", op: 0.95 }],
        lines: [{ d: "M-9.6,-1.4l.01,0M-7.6,-1.6l.01,0M-5.6,-1.7l.01,0M-3.6,-1.7l.01,0M-8.6,0l.01,0M-6.4,0.2l.01,0", tone: "mark", w: 0.55, op: 0.8 }],
        eye: { at: [-11.6, -2.2], rx: 1.05, ry: 1 },
        nose: [[-14.9, -1.4], [-14.3, -1.75], [-13.95, -1.25], [-14.45, -0.95]],
        mouth: "M-15.3,0.9Q-12,1.9 -7.8,1.3",
        pectoral: [[1.6, 0.6], [5.6, -0.8], [7.4, 1.4], [5.6, 3.6], [2, 2.6]],
        collar: { d: "M2,-4.6Q3.4,0 2,4.6", w: 1.1, tag: [2.4, 5.2, 0.95] },
      },
    },
  },

  // A bird has no paws: the beak does the work. pose.beak is a world point the beak tip reaches by leaning
  // the body and tipping the head, and pose.wings (0..1) opens the wings.
  woodpecker: {
    colors: { fur: "#222126", belly: "#EFEBE3", dark: "#151418", skin: "#7A736E", mark: "#C8282D", eye: "#140c0c", claw: "#2a2726" },
    coat: { flow: [0.4, 1], tuft: 0.55, gap: 1.3, tw: 0.3, strand: 4, sw: 0.3 },
    up: {
      pivot: [-2, -6], box: [-44, -92, 26, 6], shadow: [2, 22, 5], lean: 10,
      neck: { base: [-6, -58], w: [12, 10], max: 7, tone: "dark" },
      body: {
        pts: [[-6, -8], [-14, -18], [-18, -32], [-18, -46], [-14, -58], [-6, -64], [4, -64], [12, -58], [16, -46], [16, -30], [12, -16], [4, -8]],
        strands: 40, flow: [0.2, 1],
        marks: [
          { pts: [[-13, -18], [-17, -32], [-17, -46], [-13, -56], [-7, -60], [-10, -48], [-12, -32], [-9, -18]], tone: "belly", front: true, op: 0.95 },
          { pts: [[-6, -9], [-12, -16], [-8, -21], [0, -15], [2, -9]], tone: "mark", front: true },
        ],
      },
      wing: {
        pivot: [2, -56], up: 150,
        pts: [[-8, -58], [6, -62], [16, -52], [18, -36], [16, -20], [12, -8], [6, -10], [2, -24], [-2, -40], [-6, -50]], tone: "dark",
        marks: [
          { pts: [[-2, -54], [6, -56], [10, -48], [4, -42], [-1, -47]], tone: "belly", soft: false },
          { pts: [[3, -34], [12, -33], [12, -31.4], [3, -32.2]], tone: "belly", op: 0.9 },
          { pts: [[4, -27], [13, -26], [13, -24.4], [4, -25.2]], tone: "belly", op: 0.9 },
          { pts: [[5, -20], [13, -19], [12.6, -17.4], [5, -18.2]], tone: "belly", op: 0.9 },
        ],
        lines: "M6,-44Q11,-30 11,-10M10,-46Q15,-32 14,-14",
        spread: {
          pts: [[0, -54], [-3, -70], [2, -86], [12, -99], [25, -106], [33, -101], [26, -93], [33, -88], [25, -81], [30, -75], [21, -69], [23, -63], [12, -57]],
          marks: [[6, -88], [12, -94], [18, -97], [10, -80], [16, -84], [22, -86], [14, -71], [20, -74]].map(([x, y]) => ({ pts: [[x - 1.4, y], [x, y - 1.2], [x + 1.4, y], [x, y + 1.2]], tone: "belly", soft: false })),
          lines: "M4,-60Q10,-80 24,-100M8,-58Q18,-76 30,-90M12,-58Q22,-70 28,-76",
        },
      },
      collar: { d: "M-15,-60Q-6,-55 6,-61", w: 1.2, tag: [-6, -57.5, 1.5] },
      head: {
        pivot: [-4, -62], tone: "belly", pitch: 9,
        pts: [[-16, -68], [-17, -76], [-12, -84], [-3, -87], [6, -84], [9, -76], [7, -68], [0, -63], [-10, -63]],
        strands: 0, tuft: 0.7,
        marks: [
          { pts: [[-15.4, -76], [-11, -83.6], [-3, -86.4], [5, -83.6], [7.4, -78], [-4, -79.4], [-11, -77.6]], tone: "dark", soft: false },
          { pts: [[4, -82], [8.4, -77.5], [8, -72.6], [3.6, -76]], tone: "mark", soft: false },
          { pts: [[-16, -70.6], [-8, -71.4], [2, -69], [7, -64.6], [4.6, -62.6], [-2, -65.6], [-10, -68], [-16, -68.6]], tone: "dark", soft: false },
        ],
        eye: { at: [-8, -75.4], rx: 2, ry: 2.1 },
        beak: [[-15.6, -77.2], [-24, -75.4], [-31.4, -73.2], [-30.6, -72.2], [-23, -71.4], [-15.6, -70.6]],
        beakLine: "M-16,-73.8L-29.4,-72.9",
        beakTip: [-31.4, -72.8],
      },
      feet: {
        near: { at: [-10, 0], pts: [[1.2, -11], [-1.2, -11], [-1.5, -2.4], [-6.6, -2.8], [-8.4, -1], [-6.2, 0.4], [-1.4, 0.6], [3, 1.8], [5.2, 1.2], [1.8, -1.2]], tone: "skin", claws: "M-8.2,-1q-1,.4 -1.3,1.5M5,1.3q.9,.4 1,1.4", clawW: 0.55 },
        far: { at: [-3, -1], pts: [[1, -10], [-1, -10], [-1.3, -2.2], [-5.6, -2.5], [-7, -1], [-5.2, 0.3], [-1.2, 0.5], [2.6, 1.6], [4.4, 1], [1.6, -1.1]], tone: "skin" },
      },
      tail: {
        pivot: [-2, -6], back: "over",
        pts: [[3, -15], [13, -11], [21, 1], [19, 4.5], [11, -1.5], [1, -7]], tone: "dark", strands: 10, tuft: 0.8, flow: [0.6, 1],
      },
    },
  },
};

export const ROLES = {
  power: { hex: "#F5C518", word: "power", does: "motors, current, anything that runs" },
  holding: { hex: "#E5484D", word: "holding", does: "latches, clamps, brakes, grips" },
  cutting: { hex: "#8E4EC6", word: "cutting", does: "blades, cutters, grinders, shredders" },
  sensing: { hex: "#3E9BDB", word: "sensing and timing", does: "gauges, thermostats, timers, switches that read" },
  moving: { hex: "#46A758", word: "moving", does: "carriages, rollers, conveyors, feeders" },
  heat: { hex: "#F76B15", word: "heat", does: "heating elements, igniters" },
  fluid: { hex: "#12A594", word: "fluid", does: "pumps, hoses, valves, cooling" },
  spring: { hex: "#E93D82", word: "spring", does: "springs, launchers, returns" },
};

export const SPECIES = Object.fromEntries(Object.entries(ART).map(([name, a]) => [name, { colors: a.colors, arms: a.up?.arms ?? null, four: !!a.four, path: !!a.path, beak: !!a.up?.head?.beakTip, wings: !!a.up?.wing }]));

// ---------- colour
const hexToHsl = (hex) => {
  const v = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(v >> 16) & 255, (v >> 8) & 255, v & 255].map((x) => x / 255);
  const hi = Math.max(r, g, b), lo = Math.min(r, g, b), l = (hi + lo) / 2;
  if (hi === lo) return [0, 0, l * 100];
  const d = hi - lo, s = l > 0.5 ? d / (2 - hi - lo) : d / (hi + lo);
  const h = hi === r ? (g - b) / d + (g < b ? 6 : 0) : hi === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s * 100, l * 100];
};
const hsl = (h, s, l) => `hsl(${h.toFixed(0)} ${Math.max(0, Math.min(100, s)).toFixed(0)}% ${Math.max(0, Math.min(100, l)).toFixed(1)}%)`;
const toneVars = (name, hex) => {
  const [h, s, l] = hexToHsl(hex);
  return `--so-${name}:${hsl(h, s, l)};--so-${name}-lit:${hsl(h - 4, s * 0.9, l + (100 - l) * 0.32)};--so-${name}-shade:${hsl(h + 6, Math.min(100, s * 1.1), l * 0.62)}`;
};
const TONES = ["fur", "belly", "dark", "skin", "mark"];

// The subject: the thing the machine works on (the bread, the pencil, the coin) is the one object in the
// machine drawn in its own colour, so the reader can follow it through. subjectCss(selector, light, dark)
// gives a group the kit's tone tokens in that colour, so every solid inside it keeps its shading and lit state.
export function subjectCss(sel, light, dark = light) {
  const ramp = (hex, darkTheme) => {
    const [h, s, l] = hexToHsl(hex);
    const L = (k) => hsl(h, s, Math.min(97, l * k));
    const base = darkTheme ? 0.82 : 1;
    return `--anatomy-paper:${L(base)};--anatomy-face:${L(base * 1.06)};--anatomy-top:${L(base * 1.12)};--anatomy-shade-0:${L(base * 0.72)};--anatomy-shade-1:${L(base * 0.8)};--anatomy-shade-2:${L(base * 0.88)};--anatomy-shade-3:${L(base * 0.95)};--anatomy-lit-top:${L(base * 1.16)};--anatomy-lit-shade:${L(base * 0.98)}`;
  };
  return `${sel}{${ramp(light, false)}}.iso[data-theme="dark"] ${sel},.iso:not([data-theme]) ${sel}{${ramp(dark, true)}}`;
}

// Older figures passed a material palette to crewCss. Machines take no colour now, so it is ignored.
export const paletteOf = () => ({});

export function crewCss() {
  const rules = [
    `.crew .so-tuft,.crew .so-strand,.crew .so-line{fill:none;stroke-linecap:round}`,
    `.crew[data-duty]>.so-fig{filter:url(#so-duty)}`,
    `.iso{--crew-duty:#ffffff}.iso[data-theme="light"]{--crew-duty:#000000}`,
    `.crew{--so-ground:#000}`,
    `.iso{--so-zap:#FFE14D;--so-zap-core:#FFFBE8}.iso[data-theme="light"]{--so-zap:#E8A600;--so-zap-core:#FFF4C2}`,
  ];
  for (const [name, a] of Object.entries(ART)) {
    rules.push(`.crew[data-species="${name}"]{${TONES.filter((t) => a.colors[t]).map((t) => toneVars(t, a.colors[t])).join(";")};--so-eye:${a.colors.eye ?? "#120c08"};--so-nose:${a.colors.nose ?? a.colors.skin};--so-claw:${a.colors.claw ?? "#efe6da"};--so-whisker:${a.colors.whisker ?? "#f6f1e8"};--so-teeth:${a.colors.teeth ?? "#f4efe6"}}`);
  }
  for (const [name, r] of Object.entries(ROLES)) rules.push(`.crew[data-role="${name}"]{--so-role:${r.hex};--so-role-dark:${hsl(...(([h, s, l]) => [h, s, l * 0.62])(hexToHsl(r.hex)))}}`);
  return rules.join("\n");
}

// ---------- defs: gradients per tone, lit from the top left of the screen
function defs(sp) {
  const a = ART[sp];
  const id = (x) => `so-${sp}-${x}`;
  const out = [];
  const fx = 0.5;
  for (const t of TONES) {
    if (!a.colors[t]) continue;
    out.push(`<radialGradient id="${id(`v-${t}`)}" cx="${fx}" cy=".3" r=".82" fx="${fx}" fy=".26"><stop offset="0" style="stop-color:var(--so-${t}-lit)"/><stop offset=".5" style="stop-color:var(--so-${t})"/><stop offset="1" style="stop-color:var(--so-${t}-shade)"/></radialGradient>`);
    out.push(`<radialGradient id="${id(`s-${t}`)}"><stop offset="0" style="stop-color:var(--so-${t})"/><stop offset=".55" style="stop-color:var(--so-${t});stop-opacity:.92"/><stop offset="1" style="stop-color:var(--so-${t});stop-opacity:0"/></radialGradient>`);
  }
  out.push(`<radialGradient id="${id("ao")}"><stop offset="0" style="stop-color:var(--so-fur-shade);stop-opacity:.75"/><stop offset="1" style="stop-color:var(--so-fur-shade);stop-opacity:0"/></radialGradient>`);
  out.push(`<radialGradient id="${id("ground")}"><stop offset="0" stop-color="#000" stop-opacity=".3"/><stop offset=".6" stop-color="#000" stop-opacity=".14"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>`);
  out.push(`<radialGradient id="${id("eye")}" cx=".42" cy=".36" r=".7"><stop offset="0" style="stop-color:color-mix(in srgb,var(--so-eye) 55%,#7a5236)"/><stop offset=".45" style="stop-color:var(--so-eye)"/><stop offset="1" style="stop-color:var(--so-eye)"/></radialGradient>`);
  out.push(`<filter id="so-duty" x="-20%" y="-20%" width="140%" height="140%"><feMorphology in="SourceAlpha" operator="dilate" radius=".75" result="d"/><feFlood style="flood-color:var(--crew-duty)" result="c"/><feComposite in="c" in2="d" operator="in" result="rim"/><feMerge><feMergeNode in="rim"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`);
  return `<defs>${out.join("")}</defs>`;
}

// ---------- painting helpers (local coordinates)
// Light from above, so a mirrored animal is lit the same way.
const LIGHT = () => [0, -1];
function furShape(sp, pts, tone, o, mirror) {
  const { d, poly } = curve(pts);
  const coat = ART[sp].coat;
  const light = LIGHT(mirror);
  const flow = o.flow ?? coat.flow;
  let s = `<path d="${d}" fill="url(#so-${sp}-v-${tone})"/>`;
  if (coat.shell) {
    // A hard shell: no fur, a soft gloss up and to the left of its middle.
    const [x0, y0, x1, y1] = bounds(poly);
    return s + `<ellipse cx="${n1(x0 + (x1 - x0) * 0.4)}" cy="${n1(y0 + (y1 - y0) * 0.3)}" rx="${n1((x1 - x0) * 0.26)}" ry="${n1((y1 - y0) * 0.16)}" fill="#fff" opacity=".2"/>`;
  }
  const nStr = o.strands ?? 0;
  if (nStr) {
    const st = strands(poly, { count: nStr, len: o.strandLen ?? coat.strand, flow, seed: o.seed ?? 3, light });
    if (st.shade) s += `<path class="so-strand" d="${st.shade}" style="stroke:var(--so-${tone}-shade);stroke-width:${o.sw ?? coat.sw};opacity:.5"/>`;
    if (st.lit) s += `<path class="so-strand" d="${st.lit}" style="stroke:var(--so-${tone}-lit);stroke-width:${o.sw ?? coat.sw};opacity:.55"/>`;
  }
  if (o.tufts !== false) {
    const tf = tufts(poly, { len: o.tuft ?? coat.tuft, gap: o.gap ?? coat.gap, flow, lean: o.lean ?? 0.5, seed: (o.seed ?? 3) + 11, light, only: o.only });
    const w = o.tw ?? coat.tw;
    if (tf.shade) s += `<path class="so-tuft" d="${tf.shade}" style="stroke:var(--so-${tone}-shade);stroke-width:${w};opacity:.55"/>`;
    if (tf.mid) s += `<path class="so-tuft" d="${tf.mid}" style="stroke:var(--so-${tone});stroke-width:${w}"/>`;
    if (tf.lit) s += `<path class="so-tuft" d="${tf.lit}" style="stroke:var(--so-${tone}-lit);stroke-width:${w};opacity:.85"/>`;
  }
  return s;
}
const softShape = (sp, pts, tone, op = 1) => `<path d="${curve(pts).d}" fill="url(#so-${sp}-s-${tone})"${op < 1 ? ` opacity="${op}"` : ""}/>`;
const plainShape = (sp, pts, tone) => `<path d="${curve(pts).d}" fill="url(#so-${sp}-v-${tone})"/>`;
const aoBlob = (sp, [cx, cy, rx, ry], op = 1) => `<ellipse cx="${n1(cx)}" cy="${n1(cy)}" rx="${n1(rx)}" ry="${n1(ry)}" fill="url(#so-${sp}-ao)"${op < 1 ? ` opacity="${op}"` : ""}/>`;

function eyeSvg(sp, e, state, far = false) {
  const [cx, cy] = e.at;
  const grow = state === "wide" ? 1.18 : 1;
  const rx = e.rx * grow, ry = e.ry * grow, rot = e.rot ?? 0;
  const tf = `transform="rotate(${rot} ${n1(cx)} ${n1(cy)})"`;
  let s = "";
  if (e.ring) s += `<ellipse cx="${n1(cx)}" cy="${n1(cy)}" rx="${n1(rx + e.ring)}" ry="${n1(ry + e.ring)}" fill="url(#so-${sp}-s-mark)" ${tf}/>`;
  s += `<ellipse cx="${n1(cx)}" cy="${n1(cy)}" rx="${n1(rx + 0.45)}" ry="${n1(ry + 0.45)}" style="fill:var(--so-fur-shade)" ${tf}/>`;
  if (state === "shut") {
    s += `<ellipse cx="${n1(cx)}" cy="${n1(cy)}" rx="${n1(rx)}" ry="${n1(ry)}" style="fill:var(--so-fur)" ${tf}/>`;
    s += `<path class="so-line" d="M${n1(cx - rx * 0.95)},${n1(cy + ry * 0.05)}Q${n1(cx)},${n1(cy + ry * 0.55)} ${n1(cx + rx * 0.95)},${n1(cy + ry * 0.05)}" style="stroke:var(--so-eye);stroke-width:${n1(Math.max(0.5, rx * 0.22))}" ${tf}/>`;
    return s;
  }
  s += `<ellipse cx="${n1(cx)}" cy="${n1(cy)}" rx="${n1(rx)}" ry="${n1(ry)}" fill="url(#so-${sp}-eye)" ${tf}/>`;
  if (e.pupil) s += `<ellipse cx="${n1(cx - rx * 0.08)}" cy="${n1(cy)}" rx="${n1(rx * e.pupil)}" ry="${n1(ry * e.pupil)}" fill="#120c08"/>`;
  if (!far || rx > 1.2) {
    s += `<ellipse cx="${n1(cx - rx * 0.34)}" cy="${n1(cy - ry * 0.4)}" rx="${n1(rx * 0.3)}" ry="${n1(ry * 0.26)}" fill="#fff" opacity=".92"/>`;
    s += `<circle cx="${n1(cx + rx * 0.35)}" cy="${n1(cy + ry * 0.38)}" r="${n1(rx * 0.12)}" fill="#fff" opacity=".5"/>`;
  }
  if (state === "happy") {
    // Squint: the lids close over the top and lift from below, inside the eye's outline.
    const RX = rx + 0.5, RY = ry + 0.5;
    const cut = (dy) => RX * Math.sqrt(Math.max(0, 1 - (dy / RY) ** 2));
    const yt = -ry * 0.08, yb = ry * 0.55, xt = cut(yt), xb = cut(yb);
    s += `<path d="M${n1(cx - xt)},${n1(cy + yt)}A${n1(RX)} ${n1(RY)} 0 0 1 ${n1(cx + xt)},${n1(cy + yt)}Q${n1(cx)},${n1(cy + yt + ry * 0.4)} ${n1(cx - xt)},${n1(cy + yt)}Z" style="fill:var(--so-fur)" ${tf}/>`;
    s += `<path d="M${n1(cx - xb)},${n1(cy + yb)}A${n1(RX)} ${n1(RY)} 0 0 0 ${n1(cx + xb)},${n1(cy + yb)}Q${n1(cx)},${n1(cy + yb - ry * 0.3)} ${n1(cx - xb)},${n1(cy + yb)}Z" style="fill:var(--so-fur)" ${tf}/>`;
    s += `<path class="so-line" d="M${n1(cx - xt)},${n1(cy + yt)}Q${n1(cx)},${n1(cy + yt + ry * 0.4)} ${n1(cx + xt)},${n1(cy + yt)}" style="stroke:var(--so-fur-shade);stroke-width:${n1(Math.max(0.4, rx * 0.16))}" ${tf}/>`;
  }
  return s;
}

function whiskersSvg(w) {
  if (!w) return "";
  const r = rng(w.seed ?? 5);
  let d = "";
  for (let i = 0; i < w.n; i++) {
    const a = (w.from + ((w.to - w.from) * i) / Math.max(1, w.n - 1) + (r() - 0.5) * 6) * RAD;
    const l = w.len * (0.75 + 0.4 * r());
    const o = add(w.at, [0, (i - w.n / 2) * (w.spread ?? 0.6)]);
    const tip = add(o, [Math.cos(a), Math.sin(a)], l);
    const c = add(add(o, [Math.cos(a), Math.sin(a)], l * 0.5), [0, l * 0.07]);
    d += `M${pt(o)}Q${pt(c)} ${pt(tip)}`;
  }
  return `<path class="so-line" d="${d}" style="stroke:var(--so-whisker);stroke-width:${w.width ?? 0.35};opacity:${w.opacity ?? 0.75}"/>`;
}

function brushSvg(b) {
  if (!b) return "";
  const r = rng(b.seed ?? 13);
  let d = "";
  for (let i = 0; i < b.n; i++) {
    const a = (-90 + (i / Math.max(1, b.n - 1) - 0.5) * (b.spread ?? 60) + (b.tilt ?? 0) + (r() - 0.5) * 10) * RAD;
    const l = b.len * (0.6 + 0.5 * r());
    const o = add(b.at, [(r() - 0.5) * 1.2, 1.5]);
    const tip = add(o, [Math.cos(a), Math.sin(a)], l);
    d += `M${pt(o)}Q${pt(add(add(o, [Math.cos(a), Math.sin(a)], l * 0.5), [l * 0.12, 0]))} ${pt(tip)}`;
  }
  return `<path class="so-tuft" d="${d}" style="stroke:var(--so-dark);stroke-width:${b.w ?? 0.6}"/>`;
}

function tailSvg(sp, T, mirror) {
  if (T.line) {
    const d = curve(limb(T.line.cl, T.line.w)).d;
    return `<path d="${d}" fill="url(#so-${sp}-v-${T.tone ?? "skin"})"/>${T.line.rings ? ringsSvg(T.line) : ""}`;
  }
  let s = furShape(sp, T.pts, T.tone ?? "fur", { strands: T.strands ?? 20, flow: T.flow, seed: 31, tuft: T.tuft, gap: T.gap, lean: T.lean, tw: T.tw, strandLen: T.strandLen, tufts: T.tufts }, mirror);
  for (const m of T.marks ?? []) s += m.soft === false ? plainShape(sp, m.pts, m.tone ?? "dark") : softShape(sp, m.pts, m.tone ?? "dark", m.op ?? 1);
  if (T.scales) {
    const { poly } = curve(T.pts);
    const [x0, y0, x1, y1] = bounds(poly);
    let d = "";
    const g = T.scales;
    for (let x = x0; x < x1; x += g) for (let y = y0; y < y1; y += g * 0.7) {
      const c = [x + ((Math.round((y - y0) / (g * 0.7)) % 2) * g) / 2, y];
      if (inside(poly, c[0] - g * 0.4, c[1]) && inside(poly, c[0] + g * 0.4, c[1] + g * 0.3)) d += `M${pt(add(c, [-g * 0.4, 0]))}Q${pt(add(c, [0, g * 0.45]))} ${pt(add(c, [g * 0.4, 0]))}`;
    }
    s += `<path class="so-line" d="${d}" style="stroke:var(--so-${T.tone ?? "fur"}-shade);stroke-width:.45;opacity:.7"/>`;
  }
  return s;
}
function ringsSvg(L) {
  const { poly } = curve(L.cl, false, 12);
  let d = "";
  for (let i = 4; i < poly.length - 2; i += 3) {
    const t = unit(sub(poly[i + 1], poly[i - 1])), nrm = [-t[1], t[0]];
    const w = 1.2;
    d += `M${pt(add(poly[i], nrm, w))}L${pt(add(poly[i], nrm, -w))}`;
  }
  return `<path class="so-line" d="${d}" style="stroke:var(--so-skin-shade);stroke-width:.25;opacity:.5"/>`;
}

// ---------- props: only the few that read cleanly at a figure's size. Hats, goggles, bow ties, mitts,
// watches and held notebooks were tried and dropped: they read as stickers or as specks.
export const PROPS = {
  glasses: { at: "face", does: "round wire glasses, for whoever reads or times things" },
  sweatband: { at: "head", does: "a towelling band in the role colour, for the runners and jumpers" },
};
const ink = (w) => `class="so-line" style="stroke:#2b2622;stroke-width:${n1(w)}"`;
function headProps(sp, H, wear, front) {
  if (!wear.length) return "";
  const xs = H.pts.map((p) => p[0]), ys = H.pts.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), w = x1 - x0, h = Math.max(...ys) - y0;
  const s = w / 42;
  let out = "";
  if (wear.includes("sweatband")) {
    const y = y0 + h * 0.15;
    const band = (dy, dx0, dx1) => `M${n1(x0 + w * dx0)},${n1(y + 1.5 * s + dy)}Q${n1(x0 + w * 0.5)},${n1(y - 3.5 * s + dy)} ${n1(x1 - w * dx1)},${n1(y + 2 * s + dy)}`;
    out += `<path d="${band(0, 0.12, 0.04)}" class="so-line" style="stroke:var(--so-role,#888);stroke-width:${n1(3.6 * s)}"/><path d="${band(-0.1, 0.14, 0.06)}" class="so-line" style="stroke:#fff;stroke-width:${n1(0.7 * s)};opacity:.75"/>`;
  }
  if (wear.includes("glasses") && H.eye) {
    const [cx, cy] = H.eye.at;
    const r = Math.max(H.eye.rx * 1.75 + 0.8, 3 * s);
    const arm = `<path d="M${n1(cx + r)},${n1(cy - 0.4)}L${n1(Math.min(x1 - 2 * s, cx + r + w * 0.4))},${n1(cy - 1.2)}" ${ink(0.7 * s)}/>`;
    out += front ? `${arm}<circle cx="${n1(cx)}" cy="${n1(cy)}" r="${n1(r)}" fill="#fff" opacity=".14"/><circle cx="${n1(cx)}" cy="${n1(cy)}" r="${n1(r)}" fill="none" ${ink(0.75 * s)}/><path d="M${n1(cx - r * 0.6)},${n1(cy - r * 0.55)}Q${n1(cx - r * 0.1)},${n1(cy - r * 0.9)} ${n1(cx + r * 0.4)},${n1(cy - r * 0.7)}" class="so-line" style="stroke:#fff;stroke-width:${n1(0.5 * s)};opacity:.7"/><path d="M${n1(cx - r)},${n1(cy + 0.2)}L${n1(cx - r - 2.6 * s)},${n1(cy + 0.8 * s)}" ${ink(0.7 * s)}/>` : arm;
  }
  return out;
}

function headSvg(sp, H, { eyes, front, mirror, wear = [], role }) {
  let s = "";
  const ears = H.ears ?? {};
  if (ears.far) s += furShape(sp, ears.far.pts, ears.far.tone ?? "fur", { strands: 0, tuft: 1.2, gap: 1.6, seed: 21 }, mirror) + (front && ears.far.inner ? softShape(sp, ears.far.inner, ears.far.innerTone ?? "skin", 0.9) : "") + brushSvg(ears.far.brush);
  for (const x of H.under ?? []) s += x(sp, mirror);
  s += furShape(sp, H.pts, H.tone ?? "fur", { strands: H.strands ?? 30, flow: H.flow, seed: 9, tuft: H.tuft, only: H.tuftOnly }, mirror);
  for (const m of H.marks ?? []) if (front || !m.front) s += m.soft === false ? plainShape(sp, m.pts, m.tone) : softShape(sp, m.pts, m.tone, m.op ?? 1);
  for (const l of H.lines ?? []) if (front || !l.front) s += `<path class="so-line" d="${l.d}" style="stroke:var(--so-${l.tone ?? "dark"});stroke-width:${l.w ?? 0.8};opacity:${l.op ?? 1}"/>`;
  if (H.beak) s += plainShape(sp, H.beak, H.beakTone ?? "dark") + (H.beakLine ? `<path class="so-line" d="${H.beakLine}" style="stroke:var(--so-dark-shade);stroke-width:.45;opacity:.8"/>` : "");
  if (front && H.eyeFar) s += eyeSvg(sp, H.eyeFar, eyes, true);
  if (H.eye && (front || H.eyeBack !== false)) s += eyeSvg(sp, H.eye, eyes);
  if (H.snout) s += `<path d="${curve(H.snout).d}" fill="url(#so-${sp}-v-skin)"/><path class="so-line" d="${curve(H.snout, false).d}" style="stroke:var(--so-skin-shade);stroke-width:.25;opacity:.35"/>`;
  if (H.nose) s += `<path d="${curve(H.nose).d}" style="fill:var(--so-nose)"/><path d="${curve(H.nose).d}" fill="url(#so-${sp}-v-skin)" opacity=".35"/>`;
  if (H.mouth) s += `<path class="so-line" d="${H.mouth}" style="stroke:var(--so-fur-shade);stroke-width:.55;opacity:.8"/>`;
  if (ears.near) {
    s += furShape(sp, ears.near.pts, ears.near.tone ?? "fur", { strands: 0, tuft: ears.near.tuft ?? 1.1, gap: 1.6, seed: 23, flow: ears.near.flow }, mirror);
    if (ears.near.inner) s += softShape(sp, ears.near.inner, ears.near.innerTone ?? "skin", front ? 0.95 : 0.4);
    s += brushSvg(ears.near.brush);
  }
  if (H.teeth) s += `<path d="${H.teeth}" style="fill:var(--so-teeth)"/><path d="${H.teeth}" fill="url(#so-${sp}-v-skin)" opacity=".18"/>${H.teethLine ? `<path class="so-line" d="${H.teethLine}" style="stroke:var(--so-fur-shade);stroke-width:.4"/>` : ""}`;
  if (front) s += whiskersSvg(H.whiskers);
  s += headProps(sp, H, wear, front);
  return s;
}

function pawSvg(sp, P) {
  // A paw along +x from the wrist.
  const l = P.len, w = P.w;
  if (P.pincer) {
    // A crab's claw: a swollen palm, a fixed finger below and a movable one above, dark tips.
    const palm = [[-0.5, -w * 0.4], [l * 0.3, -w * 0.55], [l * 0.58, -w * 0.45], [l * 0.66, 0], [l * 0.58, w * 0.45], [l * 0.3, w * 0.55], [-0.5, w * 0.4]];
    const lower = [[l * 0.5, w * 0.06], [l * 0.82, w * 0.1], [l * 1.04, -w * 0.02, 1], [l * 0.86, w * 0.3], [l * 0.55, w * 0.4]];
    const upper = [[l * 0.5, -w * 0.08], [l * 0.82, -w * 0.26], [l * 1.08, -w * 0.12, 1], [l * 0.8, -w * 0.42], [l * 0.5, -w * 0.44]];
    const tip = (x, y) => `<ellipse cx="${n1(x)}" cy="${n1(y)}" rx="${n1(l * 0.09)}" ry="${n1(w * 0.09)}" fill="url(#so-${sp}-s-skin)"/>`;
    return `<path d="${curve(upper).d}" fill="url(#so-${sp}-v-${P.tone ?? "fur"})"/><path d="${curve(lower).d}" fill="url(#so-${sp}-v-${P.tone ?? "fur"})"/>${tip(l * 1.0, -w * 0.14)}${tip(l * 0.98, 0)}<path d="${curve(palm).d}" fill="url(#so-${sp}-v-${P.tone ?? "fur"})"/><ellipse cx="${n1(l * 0.28)}" cy="${n1(-w * 0.2)}" rx="${n1(l * 0.16)}" ry="${n1(w * 0.12)}" fill="#fff" opacity=".2"/>`;
  }
  const pts = [[-0.5, -w * 0.42], [l * 0.45, -w * 0.55], [l * 0.9, -w * 0.38], [l * 1.04, 0], [l * 0.9, w * 0.38], [l * 0.45, w * 0.55], [-0.5, w * 0.42]];
  let s = `<path d="${curve(pts).d}" fill="url(#so-${sp}-v-${P.tone ?? "skin"})"/>`;
  const toes = P.toes ?? 4;
  let d = "";
  for (let i = 1; i < toes; i++) {
    const y = -w * 0.5 + (w * i) / toes;
    d += `M${n1(l * 0.68)},${n1(y * 0.9)}L${n1(l * 1.0)},${n1(y * 0.75)}`;
  }
  s += `<path class="so-line" d="${d}" style="stroke:var(--so-${P.tone ?? "skin"}-shade);stroke-width:${n1(w * 0.07)};opacity:.7"/>`;
  if (P.claws) {
    let c = "";
    for (let i = 0; i < P.claws; i++) {
      const y = -w * 0.38 + (w * 0.76 * i) / Math.max(1, P.claws - 1);
      const cl = P.clawLen ?? l * 0.4;
      c += `M${n1(l * 0.95)},${n1(y)}Q${n1(l * 0.95 + cl * 0.7)},${n1(y - cl * 0.05)} ${n1(l * 0.95 + cl)},${n1(y + cl * 0.35)}`;
    }
    s += `<path class="so-line" d="${c}" style="stroke:var(--so-claw);stroke-width:${n1(P.clawW ?? w * 0.13)}"/>`;
  }
  return s;
}

function footSvg(sp, F) {
  let s = `<path d="${curve(F.pts).d}" fill="url(#so-${sp}-v-${F.tone ?? "skin"})"/>`;
  if (F.claws) s += `<path class="so-line" d="${F.claws}" style="stroke:var(--so-claw);stroke-width:${F.clawW ?? 0.5}"/>`;
  if (F.toes) s += `<path class="so-line" d="${F.toes}" style="stroke:var(--so-${F.tone ?? "skin"}-shade);stroke-width:.35;opacity:.7"/>`;
  return s;
}

const collarSvg = (C) => (C ? `<path class="so-line" d="${C.d}" style="stroke:var(--so-role-dark);stroke-width:${n1(C.w + 0.8)}"/><path class="so-line" d="${C.d}" style="stroke:var(--so-role);stroke-width:${n1(C.w)}"/>${C.tag ? `<circle cx="${n1(C.tag[0])}" cy="${n1(C.tag[1])}" r="${n1(C.tag[2])}" style="fill:var(--so-role-dark)"/><circle cx="${n1(C.tag[0] - C.tag[2] * 0.15)}" cy="${n1(C.tag[1] - C.tag[2] * 0.15)}" r="${n1(C.tag[2] * 0.72)}" style="fill:var(--so-role)"/><circle cx="${n1(C.tag[0] - C.tag[2] * 0.35)}" cy="${n1(C.tag[1] - C.tag[2] * 0.35)}" r="${n1(C.tag[2] * 0.22)}" fill="#fff" opacity=".7"/>` : ""}` : "");

// ---------- static pieces, cached by species, stance, view and mirror
const CACHE = new Map();
function pieces(sp, stance, front, mirror, eyes, role, wear, spread = false) {
  const key = `${sp}|${stance}|${front}|${mirror}|${eyes}|${role}|${wear.join(",")}|${spread}`;
  if (CACHE.has(key)) return CACHE.get(key);
  const a = ART[sp], R = stance === "four" ? a.four : a.up;
  const out = { defs: defs(sp) };
  const B = R.body;
  const legs = (list) => (list ?? []).map((L) => plainShape(sp, limb(L.cl, L.w), L.tone ?? "fur")).join("");
  out.body = legs(B.under) + furShape(sp, B.pts, B.tone ?? "fur", { strands: B.strands ?? 60, flow: B.flow, seed: 4, only: B.tuftOnly, lean: B.lean }, mirror);
  for (const m of B.marks ?? []) if (front || !m.front) out.body += m.soft === false ? plainShape(sp, m.pts, m.tone) : softShape(sp, m.pts, m.tone, m.op ?? 1);
  if (!front) for (const m of B.backMarks ?? []) out.body += softShape(sp, m.pts, m.tone, m.op ?? 1);
  for (const o of B.ao ?? []) out.body += aoBlob(sp, o, 0.8);
  out.body += legs(B.over);
  out.collar = collarSvg(R.collar);
  out.head = headSvg(sp, R.head, { eyes, front, mirror, wear, role });
  out.tail = R.tail ? tailSvg(sp, R.tail, mirror) : "";
  if (R.wing) {
    // Folded on the body, or spread up and back in flight.
    const Wg = spread && R.wing.spread ? { ...R.wing, ...R.wing.spread } : R.wing;
    out.wingN = furShape(sp, Wg.pts, Wg.tone ?? "fur", { strands: 0, tuft: 0.8, gap: 1.2, seed: 41, flow: [1, 0.4] }, mirror) + (Wg.marks ?? []).map((m) => (m.soft === false ? plainShape(sp, m.pts, m.tone) : softShape(sp, m.pts, m.tone, m.op ?? 1))).join("") + (Wg.lines ? `<path class="so-line" d="${Wg.lines}" style="stroke:var(--so-${Wg.tone ?? "fur"}-shade);stroke-width:.4;opacity:.6"/>` : "");
    out.wingF = plainShape(sp, Wg.pts, Wg.tone === "belly" ? "fur" : "dark");
  }
  out.ground = `<ellipse cx="${n1(R.shadow[0])}" cy="1" rx="${n1(R.shadow[1])}" ry="${n1(R.shadow[2])}" fill="url(#so-${sp}-ground)"/>`;
  if (R.arms) out.pawN = out.pawF = pawSvg(sp, R.arms.paw);
  if (R.feet) { out.footN = footSvg(sp, R.feet.near); out.footF = footSvg(sp, R.feet.far ?? R.feet.near); }
  if (R.legs) out.legFoot = R.legs.map((L) => footSvg(sp, L.foot));
  CACHE.set(key, out);
  return out;
}

const tr = (x, y) => `translate(${n1(x)} ${n1(y)})`;

// ---------- the eel: a body along a world path
const ramp = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
// A path when the pose gives none: straight along the heading through `at`, with a gentle wave.
function eelPath(pose, size) {
  const at = pose.at ?? [0, 0, 0];
  const h = (pose.heading ?? 0) * RAD, fw = [Math.cos(h), Math.sin(h)], side = [-fw[1], fw[0]];
  const ph = (pose.stride?.phase ?? 0) * TAU, amp = size * (0.035 + (pose.stride?.amount ?? 0) * 0.3);
  return Array.from({ length: 17 }, (_, i) => {
    const u = i / 16, wave = Math.sin(u * TAU * 1.2 + ph) * amp * ramp(0, 0.3, u);
    if (pose.stance === "hang") return [at[0] + fw[0] * wave, at[1] + fw[1] * wave, at[2] + size * (0.55 - u)];
    return [at[0] + fw[0] * size * (0.5 - u) + side[0] * wave, at[1] + fw[1] * size * (0.5 - u) + side[1] * wave, at[2]];
  });
}
// Distance along a world polyline to a point, carrying on past its end along the last segment.
function walker(path) {
  const d = [0];
  for (let i = 1; i < path.length; i++) d.push(d[i - 1] + Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1], path[i][2] - path[i - 1][2]));
  return (s) => {
    let i = 1;
    while (i < path.length - 1 && d[i] < s) i++;
    const a = path[i - 1], b = path[i], t = (s - d[i - 1]) / (d[i] - d[i - 1] || 1);
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  };
}
const ribbon = (L, R) => `M${L.map(pt).join("L")}L${[...R].reverse().map(pt).join("L")}Z`;
function eelPieces(sp, mirror, eyes, role, wear) {
  const key = `${sp}|path|${mirror}|${eyes}|${role}|${wear.join(",")}`;
  if (CACHE.has(key)) return CACHE.get(key);
  const H = ART[sp].path.head;
  const out = { defs: defs(sp) };
  out.head = headSvg(sp, H, { eyes, front: true, mirror, wear, role }) + collarSvg(H.collar) + softShape(sp, H.pectoral, "dark", 0.85);
  CACHE.set(key, out);
  return out;
}
// pose: { path: world points from the snout back, at/heading when there is no path, eyes, charge 0..1,
// flicker (any number; each whole step redraws the sparks), target: a world point the snout arcs to }.
function eelCritter(spec, pose, P) {
  const sp = spec.species, A = ART[sp].path;
  const size = spec.size ?? 40;
  const path = pose.path?.length > 1 ? pose.path : eelPath(pose, size);
  const W = walker(path);
  const mid = W(size / 2);
  const zpx = Math.abs(iso([mid[0], mid[1], mid[2] + 1], P)[1] - iso(mid, P)[1]);
  const k = (size * zpx) / 100;
  const s0 = (A.head.len * size) / 100, N = 36;
  const p = [], n = [], hw = [], fin = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    p.push(iso(W(s0 + (size - s0) * t), P));
    const w = A.width * (t < 0.42 ? 1 - (0.1 * t) / 0.42 : 0.9 * (1 - ((t - 0.42) / 0.58) ** 1.5)) + 0.25;
    hw.push(w * k);
    fin.push(A.fin * k * ramp(0.1, 0.32, t) * (1 - 0.4 * ramp(0.9, 1, t)));
  }
  for (let i = 0; i <= N; i++) {
    const tg = unit(sub(p[Math.min(N, i + 1)], p[Math.max(0, i - 1)]));
    let nv = [tg[1], -tg[0]];
    if (i ? nv[0] * n[i - 1][0] + nv[1] * n[i - 1][1] < 0 : nv[1] > 0) nv = [-nv[0], -nv[1]];
    n.push(nv);
  }
  const at = (i, f) => add(p[i], n[i], hw[i] * f);
  const span = (a, b, f) => Array.from({ length: b - a + 1 }, (_, j) => at(a + j, f));
  const tip = add(p[N], unit(sub(p[N], p[N - 1])), hw[N] * 1.5);
  const outline = [...span(0, N, 1), [...tip, 1], ...span(0, N, -1).reverse()];
  const finEdge = (i) => add(p[i], n[i], -(hw[i] + fin[i]));
  const f0 = Math.round(N * 0.1);
  const dyn = {};
  dyn.body = curve(outline).d;
  dyn.shade = shd(dyn.body, 0, hw[0] * 0.6);
  dyn.under = ribbon(span(0, N, -0.15), span(0, N, -1));
  dyn.lit = ribbon(span(0, N - 4, 0.15), span(0, N - 4, 0.8));
  const b1 = Math.round(N * 0.45);
  dyn.belly = ribbon(span(0, b1, -0.98), Array.from({ length: b1 + 1 }, (_, j) => at(j, -(1 - 0.6 * (1 - j / b1)))));
  dyn.gloss = ribbon(span(0, Math.round(N * 0.8), 0.5), span(0, Math.round(N * 0.8), 0.62));
  dyn.fin = ribbon(Array.from({ length: N - f0 + 1 }, (_, j) => finEdge(f0 + j)).concat([tip]), span(f0, N, -0.9).concat([tip]));
  let rays = "";
  for (let i = f0 + 1; i < N; i += 2) rays += `M${pt(at(i, -0.95))}L${pt(finEdge(i))}`;
  dyn.rays = rays;
  // The head: drawn facing left with its neck at the origin, turned to point back along the first stretch of path.
  const snout = iso(W(0), P);
  let D = sub(snout, p[0]);
  D = len(D) > 1e-6 ? unit(D) : unit(sub(p[0], p[1]));
  const mirror = D[0] > 0;
  const rot = Math.atan2(D[1], D[0]) / RAD + (mirror ? 0 : 180);
  dyn.head = `${tr(p[0][0], p[0][1])} rotate(${n1(rot)}) scale(${n1(mirror ? -k * 100 : k * 100) / 100} ${n1(k * 100) / 100})`;
  // Charge: sparks off the body and a crackle down its middle, redrawn whenever `flicker` steps on.
  const charge = Math.max(0, Math.min(1, pose.charge ?? 0));
  let zap = "";
  if (charge > 0) {
    const r = rng(Math.floor(pose.flicker ?? 0) * 7919 + 13);
    for (let i = 1; i < N - 2; i += 3) {
      if (r() > charge * 0.85) continue;
      const side = r() < 0.5 ? 1 : -1;
      let q = at(i, side * 0.9);
      zap += `M${pt(q)}`;
      for (let j = 0; j < 3; j++) { q = add(add(q, n[i], side * hw[0] * (0.35 + r() * 0.3)), unit(sub(p[i + 1], p[i])), hw[0] * (r() - 0.5) * 0.8); zap += `L${pt(q)}`; }
    }
    zap += `M${pt(p[0])}` + p.slice(1, N - 2).map((q, i) => `L${pt(add(q, n[i + 1], hw[i + 1] * (r() - 0.5) * 0.7))}`).join("");
    if (pose.target) {
      const T = iso(pose.target, P);
      zap += `M${pt(snout)}`;
      for (let j = 1; j <= 3; j++) { const q = add(snout, sub(T, snout), j / 3); zap += `L${pt(j < 3 ? add(q, [r() - 0.5, r() - 0.5], hw[0] * 0.7) : q)}`; }
    }
    dyn.charge = dyn.body;
  } else dyn.charge = "";
  dyn.zap = zap;
  dyn.zapGlow = zap;
  const eyes = pose.eyes ?? "open";
  const wear = [].concat(spec.wear ?? []).filter((w) => PROPS[w]);
  const S = eelPieces(sp, mirror, eyes, spec.role, wear);
  const xs = outline.map((q) => q[0]).concat([snout[0] - hw[0] * 1.4, snout[0] + hw[0] * 1.4]);
  const ys = outline.map((q) => q[1]).concat([snout[1] - hw[0] * 2.4, snout[1] + hw[0] * 1.4]);
  return {
    name: spec.name ?? sp, species: sp, role: spec.role, size, stance: "path", hang: false, front: true, mirror, eyes,
    key: `${sp}|path|${mirror}|${eyes}`, S, dyn, reach: {}, depth: depthOf(mid, P), anchor: p[0],
    box: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)], lines: { ray: k * 0.14, glow: Math.max(1, hw[0] * 0.55), core: Math.max(0.4, hw[0] * 0.17) },
  };
}

// ---------- the critter
export function critter(spec, pose = {}, P) {
  const sp = spec.species;
  const a = ART[sp];
  if (!a) throw new Error(`no species ${sp}`);
  if (a.path) return eelCritter(spec, pose, P);
  const stance = pose.stance === "four" && a.four ? "four" : "up";
  const hang = pose.stance === "hang";
  const R = stance === "four" ? a.four : a.up;
  const size = spec.size ?? 20;
  const at = pose.at ?? [0, 0, 0];
  const hop = pose.hop ?? 0;
  const g0 = iso(at, P);
  const base = iso([at[0], at[1], at[2] + hop], P);
  const zpx = Math.abs(iso([at[0], at[1], at[2] + 1], P)[1] - g0[1]);
  const k = (size * zpx) / 100;
  const h = (pose.heading ?? 0) * RAD;
  const fw = [Math.cos(h), Math.sin(h), 0];
  const fs = sub(iso([at[0] + fw[0], at[1] + fw[1], at[2]], P), g0);
  const fl = len(fs) || 1;
  const mirror = fs[0] > 0;
  const front = fs[1] > -0.05 * fl;
  const turn = Math.min(1, 0.74 + (0.26 * Math.abs(fs[0])) / fl / 0.55);
  const sq = pose.squash ?? 0;
  const sx = (mirror ? -1 : 1) * k * turn * (1 + 0.1 * sq), sy = k * (1 - 0.26 * sq);
  const eyes = pose.eyes ?? "open";
  const wear = [].concat(spec.wear ?? []).filter((w) => PROPS[w]);
  const wingsOpen = Math.max(0, Math.min(1, pose.wings ?? 0));
  const spread = !!R.wing?.spread && wingsOpen >= 0.5;
  const S = pieces(sp, stance, front, mirror, eyes, spec.role, wear, spread);
  let lean = ((pose.lean ?? 0) + (R.lean ?? 0)) * RAD;
  const toLocal = (w) => { const s = iso(w, P); return [(s[0] - base[0]) / sx, (s[1] - base[1]) / sy]; };
  const L = (p) => rotp(p, -lean, R.pivot);
  const look = pose.look ?? [0, 0];
  let pitch = Math.max(-30, Math.min(34, look[1] * 0.75)) + (R.head.pitch ?? 0);
  const reach = {};
  let neckOff = [0, 0];
  if (pose.beak && R.head.beakTip) {
    // Lean the body a little, tip the head and stretch the neck until the beak tip lands on the target.
    // For each lean and tip the neck takes up what is left, up to its length; the search prefers a short
    // neck and a small lean, so a bird pecks with its neck and only leans into a long reach.
    const T = toLocal(pose.beak), maxNeck = R.neck?.max ?? 0;
    const fit = (ln, pc) => {
      const Tb = rotp(T, ln * RAD, R.pivot);
      const tip = rotp(R.head.beakTip, pc * RAD, R.head.pivot);
      let o = sub(Tb, tip);
      if (len(o) > maxNeck) o = [(o[0] * maxNeck) / len(o), (o[1] * maxNeck) / len(o)];
      const miss = len(sub(Tb, add(tip, o)));
      return [miss, miss * 6 + len(o) * 0.1 + Math.abs(ln) * 0.25 + Math.abs(pc) * 0.02, o];
    };
    let best = null;
    const scan = (a0, a1, da, b0, b1, db) => { for (let a = a0; a <= a1; a += da) for (let b = b0; b <= b1; b += db) { const f = fit(a, b); if (!best || f[1] < best.cost) best = { a, b, miss: f[0], cost: f[1], o: f[2] }; } };
    scan(-15, 55, 2.5, -30, 34, 4);
    scan(best.a - 2.5, best.a + 2.5, 0.5, Math.max(-30, best.b - 4), Math.min(34, best.b + 4), 0.5);
    lean = best.a * RAD;
    pitch = best.b;
    neckOff = best.o;
    reach.beak = (best.miss * size) / 100;
  }
  const dyn = {};
  dyn.root = `${tr(base[0], base[1])} scale(${Math.round(sx * 1000) / 1000} ${Math.round(sy * 1000) / 1000})`;
  dyn.ground = `${tr(g0[0], g0[1])} scale(${Math.round(sx * 1000) / 1000} ${Math.round(k * 1000) / 1000})`;
  dyn.lean = `rotate(${n1(-lean / RAD)} ${pt(R.pivot)})`;
  dyn.head = `${neckOff[0] || neckOff[1] ? `${tr(neckOff[0], neckOff[1])} ` : ""}rotate(${n1(pitch)} ${pt(R.head.pivot)})`;
  if (R.neck) {
    // The neck: from its base on the body to wherever the head has gone, hidden under both when it hasn't moved.
    const top = add(R.head.pivot, neckOff);
    dyn.neck = curve(limb([R.neck.base, add(R.neck.base, sub(top, R.neck.base), 0.5), top], [R.neck.w[0], (R.neck.w[0] + R.neck.w[1]) / 2, R.neck.w[1]])).d;
  }
  if (R.wing) {
    // Folded: the wing lifts a little off the back. Spread: it beats, from wings 0.5 (down) to 1 (up).
    const w = spread ? (wingsOpen - 0.75) * 50 : wingsOpen * 30;
    dyn.wingN = `rotate(${n1(-w)} ${pt(R.wing.pivot)})`;
    dyn.wingF = `rotate(${n1(-w - (spread ? 14 : 0))} ${pt(R.wing.pivot)})`;
  }
  const stride = pose.stride ?? { phase: 0, amount: 0 };
  const sway = (pose.tailSway ?? 0) * 12;
  if (R.tail) dyn.tail = `rotate(${n1(-lean / RAD + sway)} ${pt(R.tail.pivot ?? R.pivot)})`;

  if (stance === "up") {
    // Which side of the animal is nearer the viewer.
    const side = [-Math.sin(h), Math.cos(h), 0];
    const leftNear = depthOf([at[0] + side[0], at[1] + side[1], at[2]], P) >= depthOf(at, P);
    const nearKey = leftNear ? "l" : "r", farKey = leftNear ? "r" : "l";
    const A = R.arms ?? { near: [0, 0], far: [0, 0], skip: true };
    // The shoulders sit across the body: move them along the animal's real side axis as the camera sees it,
    // so a paw target to its left or right lands on the matching side of the drawing.
    const sv = sub(iso([at[0] + side[0], at[1] + side[1], at[2]], P), g0);
    const span = ((A.span ?? 10) * size) / 100;
    const across = [(sv[0] * span) / sx, (sv[1] * span) / sy];
    const nearOff = leftNear ? across : [-across[0], -across[1]];
    for (const [which, key] of A.skip ? [] : [["N", nearKey], ["F", farKey]]) {
      const drawn = hang && A.hang ? A.hang[which === "N" ? "near" : "far"] : which === "N" ? A.near : A.far;
      const sgn = which === "N" ? 1 : -1;
      const shoulder = [drawn[0] + nearOff[0] * sgn * 0.6, drawn[1] + nearOff[1] * sgn * 0.6];
      const S0 = L(shoulder);
      const rest = hang ? add(shoulder, [0, -(A.l1 + A.l2) * 0.9]) : which === "N" ? A.rest.near : A.rest.far;
      const tgt = pose.paws?.[key] ? toLocal(pose.paws[key]) : L(rest);
      const r = reach2(S0, tgt, A.l1, A.l2, A.bend ?? [0.45, 1]);
      if (pose.paws?.[key]) reach[key] = (r.short * size) / 100;
      const W = r.W;
      const u = unit(sub(W, r.E));
      const wrist = add(W, u, -A.paw.len * 0.55);
      dyn[`arm${which}`] = curve(limb([S0, r.E, wrist], A.w)).d;
      dyn[`paw${which}`] = `${tr(wrist[0], wrist[1])} rotate(${n1(Math.atan2(u[1], u[0]) / RAD)})`;
    }
    const st = (stride.amount ?? 0) * 60;
    const ph = (stride.phase ?? 0) * Math.PI * 2;
    const F = R.feet ?? { near: { at: [0, 0] }, far: { at: [0, 0] } };
    if (hang) dyn.ground = "scale(0)";
    if (!R.feet) {
      // Legs drawn into the body (a crab): nothing to step.
    } else if (hang) {
      // Feet dangle, toes down, swinging a little with the stride.
      const swing = 8 * Math.sin(ph) * (stride.amount ?? 0) * 8;
      dyn.footN = `${tr(F.near.at[0] + 2, F.near.at[1] + 2)} rotate(${n1(-72 + swing)})`;
      dyn.footF = `${tr(F.far.at[0] + 4, F.far.at[1] + 1)} rotate(${n1(-64 - swing)})`;
    } else {
      dyn.footN = tr(F.near.at[0] + st * Math.sin(ph), F.near.at[1] - Math.max(0, Math.cos(ph)) * st * 0.3);
      dyn.footF = tr(F.far.at[0] - st * Math.sin(ph), F.far.at[1] - Math.max(0, -Math.cos(ph)) * st * 0.3);
    }
  } else {
    const amt = (stride.amount ?? 0) * 60;
    const ph = (stride.phase ?? 0) * Math.PI * 2;
    R.legs.forEach((G, i) => {
      const q = ph + G.offset * Math.PI * 2;
      const foot = [G.foot.x + amt * Math.cos(q), -Math.max(0, Math.sin(q)) * amt * 0.42];
      const hip = L(G.hip);
      const r = reach2(hip, foot, G.l1, G.l2, G.bend);
      dyn[`leg${i}`] = curve(limb([hip, r.E, r.W], G.w)).d;
      dyn[`foot${i}`] = tr(r.W[0], r.W[1]);
    });
  }
  const key = `${sp}|${stance}|${front}|${mirror}|${eyes}|${spread}`;
  return { name: spec.name ?? sp, species: sp, role: spec.role, size, stance, hang, front, mirror, eyes, key, S, dyn, reach, depth: depthOf(at, P), anchor: base };
}

const node = (k, tag, attr, inner = "") => (tag === "path" ? `<path data-k="${k}" ${attr}/>` : `<g data-k="${k}" ${attr}>${inner}</g>`);

function eelInner(c) {
  const { S, dyn, lines: w } = c;
  const fill = (k, style, op) => `<path data-k="${k}" d="${dyn[k]}" style="${style}"${op ? ` opacity="${op}"` : ""}/>`;
  const line = (k, style) => `<path data-k="${k}" d="${dyn[k]}" class="so-line" style="${style}"/>`;
  return `${S.defs}${fill("shade", "fill:var(--so-ground)", ".16")}<g class="so-fig">${fill("fin", "fill:var(--so-fur-shade)", ".85")}${line("rays", `stroke:var(--so-dark);stroke-width:${n1(w.ray * 10) / 10};opacity:.3`)}${fill("body", "fill:var(--so-fur)")}${fill("under", "fill:var(--so-fur-shade)", ".55")}${fill("lit", "fill:var(--so-fur-lit)", ".5")}${fill("belly", "fill:var(--so-belly)", ".9")}${fill("gloss", "fill:#fff", ".22")}${fill("charge", "fill:var(--so-zap)", ".24")}<g data-k="head" transform="${dyn.head}">${S.head}</g>${line("zapGlow", `stroke:var(--so-zap);stroke-width:${n1(w.glow)};opacity:.45`)}${line("zap", `stroke:var(--so-zap-core);stroke-width:${n1(w.core * 10) / 10}`)}</g>`;
}

function inner(c) {
  if (c.stance === "path") return eelInner(c);
  const { S, dyn } = c;
  const a = ART[c.species];
  const R = c.stance === "four" ? a.four : a.up;
  const g = (k, html) => node(k, "g", `transform="${dyn[k]}"`, html);
  const limbPath = (k, tone) => `<path data-k="${k}" d="${dyn[k]}" fill="url(#so-${c.species}-v-${tone})"/>`;
  const parts = [];
  const tailBehind = !R.tail || (c.front ? R.tail.front !== "over" : R.tail.back !== "over");
  if (c.stance === "up") {
    const armTone = R.arms?.tone ?? "fur";
    if (R.tail && tailBehind) parts.push(g("tail", S.tail));
    if (R.arms) parts.push(limbPath("armF", armTone), g("pawF", S.pawF));
    if (S.footF) parts.push(g("footF", S.footF));
    const neck = R.neck ? `<path data-k="neck" d="${dyn.neck}" fill="url(#so-${c.species}-v-${R.neck.tone ?? "fur"})"/>` : "";
    const torso = (R.wing ? g("wingF", S.wingF) : "") + neck + S.body + (R.wing ? g("wingN", S.wingN) : "") + S.collar;
    parts.push(node("lean", "g", `transform="${dyn.lean}"`, torso + g("head", S.head)));
    if (S.footN) parts.push(g("footN", S.footN));
    if (R.tail && !tailBehind) parts.push(g("tail", S.tail));
    if (R.arms) parts.push(limbPath("armN", armTone), g("pawN", S.pawN));
  } else {
    const legTone = (G) => G.tone ?? "fur";
    R.legs.forEach((G, i) => { if (G.far) parts.push(limbPath(`leg${i}`, legTone(G)), g(`foot${i}`, S.legFoot[i])); });
    if (R.tail && tailBehind) parts.push(g("tail", S.tail));
    parts.push(node("lean", "g", `transform="${dyn.lean}"`, S.body + S.collar + g("head", S.head)));
    R.legs.forEach((G, i) => { if (!G.far) parts.push(limbPath(`leg${i}`, legTone(G)), g(`foot${i}`, S.legFoot[i])); });
    if (R.tail && !tailBehind) parts.push(g("tail", S.tail));
  }
  return `${S.defs}<g data-k="ground" transform="${dyn.root}">${S.ground}</g><g class="so-fig"><g data-k="root" transform="${dyn.root}">${parts.join("")}</g></g>`;
}

// The pixel look: each animal is sampled on a grid of square blocks, about 22 to its height, fixed in the
// figure so it moves across the grid like a sprite; each sample fills its block and its colours are cut to a few levels.
const PX = 22;
const pxId = (c) => `so-px-${c.species}-${c.name}`.replace(/[^\w-]/g, "");
function pxGrid(c) {
  const [x0, y0, x1, y1] = critterBox(c);
  const sc = c.dyn.root ? Math.abs(+c.dyn.root.match(/scale\(([-\d.]+)/)[1]) : 0;
  const t = sc ? (100 * sc) / PX : Math.max(x1 - x0, y1 - y0) / (PX * 1.4), d = t / 2, pad = t * 3;
  const gx = Math.floor((x0 - pad) / t) * t, gy = Math.floor((y0 - pad) / t) * t;
  const f = (v) => +v.toFixed(3);
  return { t: f(t), d: f(d), x: f(gx), y: f(gy), w: f(Math.ceil((x1 + pad - gx) / t) * t), h: f(Math.ceil((y1 + pad - gy) / t) * t), dx: f(gx + (t - d) / 2), dy: f(gy + (t - d) / 2), r: f((t - d) / 2) };
}
const LEVELS = "0 .2 .4 .55 .7 .85 1";
function pxFilter(c) {
  const g = pxGrid(c);
  return `<filter id="${pxId(c)}" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" x="${g.x}" y="${g.y}" width="${g.w}" height="${g.h}" color-interpolation-filters="sRGB"><feFlood x="${g.dx}" y="${g.dy}" width="${g.d}" height="${g.d}" result="dot"/><feComposite in="dot" x="${g.x}" y="${g.y}" width="${g.t}" height="${g.t}" result="cell"/><feTile in="cell" result="dots"/><feComposite in="SourceGraphic" in2="dots" operator="in"/><feMorphology operator="dilate" radius="${g.r}"/><feComponentTransfer><feFuncR type="discrete" tableValues="${LEVELS}"/><feFuncG type="discrete" tableValues="${LEVELS}"/><feFuncB type="discrete" tableValues="${LEVELS}"/><feFuncA type="discrete" tableValues="0 1 1 1"/></feComponentTransfer></filter>`;
}
// Move the grid's window with the animal each frame; the blocks themselves stay put in the figure.
function pxUpdate(el, c) {
  const f = el.querySelector("filter"), g = pxGrid(c);
  if (!f || f.__k === `${g.x},${g.y},${g.w},${g.h},${g.t}`) return;
  f.__k = `${g.x},${g.y},${g.w},${g.h},${g.t}`;
  for (const [k, v] of Object.entries({ x: g.x, y: g.y, width: g.w, height: g.h })) f.setAttribute(k, v);
  const [flood, cell, , , dilate] = f.children;
  for (const [k, v] of Object.entries({ x: g.dx, y: g.dy, width: g.d, height: g.d })) flood.setAttribute(k, v);
  for (const [k, v] of Object.entries({ x: g.x, y: g.y, width: g.t, height: g.t })) cell.setAttribute(k, v);
  dilate.setAttribute("radius", g.r);
}

export function critterSvg(c, { duty = false, part } = {}) {
  return `<g class="crew" data-crew="${c.name}" data-species="${c.species}"${c.role ? ` data-role="${c.role}"` : ""}${duty ? " data-duty" : ""}${part ? ` data-part="${part}"` : ""} style="filter:url(#${pxId(c)})">${pxFilter(c)}${inner(c)}</g>`;
}

export function paintCritter(el, c) {
  if (el.__crew !== c.key) {
    el.innerHTML = pxFilter(c) + inner(c);
    el.style.filter = `url(#${pxId(c)})`;
    el.__crew = c.key;
    el.__nodes = Object.fromEntries([...el.querySelectorAll("[data-k]")].map((n) => [n.getAttribute("data-k"), n]));
    return;
  }
  for (const [k, v] of Object.entries(c.dyn)) {
    const n = el.__nodes[k];
    if (!n) continue;
    const attr = n.tagName === "path" ? "d" : "transform";
    if (n.getAttribute(attr) !== v) n.setAttribute(attr, v);
  }
  pxUpdate(el, c);
}

// The box a critter covers on screen, for framing.
export function critterBox(c) {
  if (c.box) return c.box;
  const a = ART[c.species], R = c.stance === "four" ? a.four : a.up;
  const [x0, y0, x1, y1] = R.box;
  const m = c.dyn.root.match(/translate\(([-\d.]+) ([-\d.]+)\) scale\(([-\d.]+) ([-\d.]+)\)/).slice(1).map(Number);
  const xs = [m[0] + x0 * m[2], m[0] + x1 * m[2]], ys = [m[1] + y0 * m[3], m[1] + y1 * m[3]];
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}
