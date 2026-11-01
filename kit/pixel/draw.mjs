// The pixel crew: every animal is a hand-drawn sprite, a grid of square cells in its own palette (kit/pixel/
// sprites-*.mjs). The rig still places it: feet, heading, hop and where each paw lands. pxInner draws the
// sprite there with the arms laid in cells from shoulder to paw, then shades, outlines and shadows it.
import { PX_SMALL } from "./sprites-small.mjs";
import { PX_CLIMB } from "./sprites-climb.mjs";
import { PX_TALL } from "./sprites-tall.mjs";
import { PX_WATER } from "./sprites-water.mjs";
import { PX_ODD } from "./sprites-odd.mjs";
import { pxEelCells } from "./eel.mjs";

export const PX_CELL = 5;
const PX = { ...PX_SMALL, ...PX_CLIMB, ...PX_TALL, ...PX_WATER, ...PX_ODD };
const v = (t, f) => `var(--so-${t}${f ? `-${f}` : ""},var(--so-fur))`;
const FILL = {
  F: v("fur"), l: v("fur", "lit"), s: v("fur", "shade"), B: v("belly"), b: v("belly", "shade"), D: v("dark"), d: v("dark", "lit"), x: v("dark", "shade"),
  P: v("skin"), p: `color-mix(in srgb,${v("skin")} 70%,${v("skin", "shade")})`, M: v("mark"), m: v("mark", "shade"), E: "var(--so-eye)", W: "#fff", N: "var(--so-nose)", T: "var(--so-claw)", Y: "var(--so-teeth)",
  C: "var(--so-role,#888)", c: "var(--so-role-dark,#555)", K: "var(--so-px-ink)", G: "var(--so-px-glass)", Z: "var(--so-zap)", z: "var(--so-zap-core)",
};
// A cell open to the sky takes the lit tone, one open to the floor the shade, so a mirrored sprite is lit alike.
const LIT = { F: "l", D: "d" }, SHADE = { F: "s", B: "b", D: "x", M: "m" };
const BACK = { E: "F", W: "F", N: "F", B: "F", b: "s", Y: "F", M: "F" };
const ARM = { fur: ["F", "s"], dark: ["D", "x"], skin: ["P", "p"] };
const key = (i, j) => `${i},${j}`;
const at = (cells, i, j) => cells[key(i, j)];

function stamp(cells, spr, { back, shut, dx = () => 0, dy = () => 0 }) {
  const H = spr.rows.length;
  spr.rows.forEach((row, r) => [...row].forEach((ch, c) => {
    if (ch === ".") return;
    if (back && BACK[ch]) ch = BACK[ch];
    if (shut && (ch === "E" || ch === "W")) ch = spr.rows[r + 1]?.[c] === "E" ? "F" : "K";
    cells[key(c - spr.x0 + dx(c, r), r - H + dy(c, r))] = ch;
  }));
}

// A thick segment in cells: every cell whose centre lies within w/2 of it.
function line(cells, a, b, w, ch, only) {
  const [x0, x1] = [Math.min(a[0], b[0]) - w, Math.max(a[0], b[0]) + w], [y0, y1] = [Math.min(a[1], b[1]) - w, Math.max(a[1], b[1]) + w];
  const d = [b[0] - a[0], b[1] - a[1]], L = d[0] * d[0] + d[1] * d[1] || 1;
  for (let i = Math.floor(x0); i <= x1; i++) for (let j = Math.floor(y0); j <= y1; j++) {
    const t = Math.max(0, Math.min(1, ((i + 0.5 - a[0]) * d[0] + (j + 0.5 - a[1]) * d[1]) / L));
    if (Math.hypot(a[0] + d[0] * t - i - 0.5, a[1] + d[1] * t - j - 0.5) <= w / 2 && (!only || only(i, j))) cells[key(i, j)] = ch;
  }
}

// One arm: shoulder on the sprite, paw where the rig says it lands, elbow bent the way the rig bends it.
function arm(cells, A, near) {
  const { S, W, E, len, w, tone, paw, claw } = A;
  const d = Math.hypot(W[0] - S[0], W[1] - S[1]), m = [(S[0] + W[0]) / 2, (S[1] + W[1]) / 2];
  const side = Math.sign((W[0] - S[0]) * (E[1] - S[1]) - (W[1] - S[1]) * (E[0] - S[0])) || 1;
  const h = d < len ? Math.sqrt((len / 2) ** 2 - (d / 2) ** 2) * side : 0;
  const El = [m[0] - ((W[1] - S[1]) / (d || 1)) * h, m[1] + ((W[0] - S[0]) / (d || 1)) * h];
  const [base, shade] = ARM[tone] ?? ARM.fur, ch = near ? base : shade;
  const before = near ? { ...cells } : null;
  line(cells, S, El, w, ch);
  line(cells, El, W, w, ch);
  const pw = ARM[paw]?.[near ? 0 : 1] ?? ch, pi = Math.floor(W[0] - 0.5), pj = Math.floor(W[1] - 0.5);
  for (const [a, b] of [[0, 0], [1, 0], [0, 1], [1, 1]]) cells[key(pi + a, pj + b)] = pw;
  if (claw) { const u = [(W[0] - El[0]) / (Math.hypot(W[0] - El[0], W[1] - El[1]) || 1), (W[1] - El[1]) / (Math.hypot(W[0] - El[0], W[1] - El[1]) || 1)]; line(cells, W, [W[0] + u[0] * claw, W[1] + u[1] * claw], 1, claw > 2 ? "T" : "K"); }
  // Where the near arm lies over the body it gets an ink contour, as a pixel artist draws a limb in front.
  if (near) for (const k of Object.keys(cells).filter((k) => before[k] !== cells[k])) {
    const [i, j] = k.split(",").map(Number);
    for (const n of [key(i - 1, j), key(i + 1, j), key(i, j - 1), key(i, j + 1)]) if (before[n] && before[n] === cells[n]) cells[n] = "K";
  }
}

function finish(cells, { wear = [], spr, shadow }) {
  if (wear.includes("sweatband") && spr?.band != null) for (const k of Object.keys(cells)) {
    const [i, j] = k.split(",").map(Number);
    if (j === spr.band - spr.rows.length && i + spr.x0 >= spr.head[0] && i + spr.x0 <= spr.head[2] && "FlsDdxM".includes(cells[k])) cells[k] = "C";
  }
  if (wear.includes("glasses")) for (const k of Object.keys(cells).filter((k) => cells[k] === "E")) {
    const [i, j] = k.split(",").map(Number);
    for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) if (cells[key(i + a, j + b)] && !"EW".includes(cells[key(i + a, j + b)])) cells[key(i + a, j + b)] = "G";
  }
  const out = { ...cells };
  for (const [k, ch] of Object.entries(cells)) {
    const [i, j] = k.split(",").map(Number);
    const up = !at(cells, i, j - 1), down = !at(cells, i, j + 1);
    if (up && !down && LIT[ch]) out[k] = LIT[ch];
    else if (down && !up && SHADE[ch]) out[k] = SHADE[ch];
  }
  const ring = {};
  for (const k of Object.keys(cells)) {
    const [i, j] = k.split(",").map(Number);
    for (const n of [key(i - 1, j), key(i + 1, j), key(i, j - 1), key(i, j + 1)]) if (!cells[n]) ring[n] = 1;
  }
  const ground = {};
  if (shadow) for (let i = shadow[0]; i <= shadow[1]; i++) if (!cells[key(i, shadow[2])] && !ring[key(i, shadow[2])]) ground[key(i, shadow[2])] = 1;
  return { out, ring, ground };
}

// Runs of one fill along each row, as one path per fill.
function paths(cells, fill) {
  const byFill = {};
  const rows = {};
  for (const k of Object.keys(cells)) { const [i, j] = k.split(",").map(Number); (rows[j] ??= []).push(i); }
  for (const [j, is] of Object.entries(rows)) {
    is.sort((a, b) => a - b);
    for (let n = 0; n < is.length;) {
      const f = fill(cells[key(is[n], j)]);
      let m = n + 1;
      while (m < is.length && is[m] === is[m - 1] + 1 && fill(cells[key(is[m], j)]) === f) m++;
      (byFill[f] ??= []).push(`M${is[n]} ${j}h${m - n}v1h-${m - n}z`);
      n = m;
    }
  }
  return byFill;
}

function svgOf(grid, transform, over = {}) {
  const { out, ring, ground } = grid;
  const g = Object.keys(ground).length ? `<path class="px-ground" d="${Object.keys(ground).map((k) => { const [i, j] = k.split(","); return `M${i} ${j}h1v1h-1z`; }).join("")}"/>` : "";
  const o = `<path class="px-o" d="${Object.values(paths(ring, () => "o")).flat().join("")}"/>`;
  const body = Object.entries(paths(out, (ch) => FILL[ch] ?? FILL.F)).map(([f, d]) => `<path d="${d.join("")}" style="fill:${f}"/>`).join("");
  const top = Object.keys(over).length ? `<path class="px-zap" d="${Object.values(paths(over, () => "z")).flat().join("")}"/>` : "";
  return `<g class="px" transform="${transform}">${g}${o}${body}${top}</g>`;
}

export function pxInner(c) {
  if (c.stance === "path") { const { cells, zap } = pxEelCells(c); return svgOf(finish(cells, {}), `scale(${c.px.cell})`, zap); }
  const { px } = c, sp = PX[c.species];
  const spr = c.stance === "four" ? sp.four : c.hang ? sp.hang ?? sp.up : px.wings >= 0.5 && sp.spread ? sp.spread : sp.up;
  const sg = c.mirror ? -1 : 1, unit = px.k * PX_CELL;
  const toCell = (p) => [(p[0] * px.sx) / (sg * unit), (p[1] * px.sy) / unit];
  const cells = {};
  const ph = (px.stride?.phase ?? 0) * Math.PI * 2, amt = ((px.stride?.amount ?? 0) * 60) / PX_CELL;
  const inBox = (b, c0, r0) => c0 >= b[0] && c0 <= b[2] && r0 >= b[1] && r0 <= b[3];
  const step = (c0, r0) => { const g = (spr.feet ?? []).findIndex((b) => inBox(b, c0, r0)); return g < 0 ? [0, 0] : [Math.round(Math.sin(ph + g * Math.PI) * amt), Math.cos(ph + g * Math.PI) > 0.5 && amt > 0.4 ? -1 : 0]; };
  const head = px.beak && spr.beak ? (() => { const T = toCell(px.beak), H = spr.rows.length, d = [Math.round(T[0] - (spr.beak[0] - spr.x0 + 0.5)), Math.round(T[1] - (spr.beak[1] - H + 0.5))], L = Math.hypot(...d), m = Math.min(1, 3 / (L || 1)); return [Math.round(d[0] * m), Math.round(d[1] * m)]; })() : [0, 0];
  const isHead = (c0, r0) => spr.head && inBox(spr.head, c0, r0);
  const limbs = Object.entries(px.limbs ?? {}).map(([w, L]) => ({ ...L, S: [L.S[0] / PX_CELL, L.S[1] / PX_CELL], W: toCell(L.W), E: toCell(L.E), len: L.len / PX_CELL, near: w === "N" }));
  for (const A of limbs.filter((A) => !A.near)) arm(cells, A, false);
  stamp(cells, spr, { back: !c.front, shut: c.eyes === "shut", dx: (c0, r0) => (isHead(c0, r0) ? head[0] : step(c0, r0)[0]), dy: (c0, r0) => (isHead(c0, r0) ? head[1] : step(c0, r0)[1]) });
  for (const A of limbs.filter((A) => A.near)) arm(cells, A, true);
  const xs = Object.keys(cells).filter((k) => k.endsWith(",-1")).map((k) => +k.split(",")[0]);
  const shadow = c.hang || !xs.length ? null : [Math.min(...xs) - 1, Math.max(...xs) + 1, Math.round(px.lift)];
  return svgOf(finish(cells, { wear: px.wear, spr, shadow }), `translate(${px.base[0].toFixed(1)} ${px.base[1].toFixed(1)}) scale(${(sg * unit).toFixed(3)} ${unit.toFixed(3)})`);
}
