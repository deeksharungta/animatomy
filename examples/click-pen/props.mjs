import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { P, at, S, Ln, D } from "./model.mjs";

// The desk's props, at a sixth of their size like the room, in the kit's own tones.
const seg = (a, b) => k.segment(a, b, P);
const vertical = (x, y, z0, prof, tone = "hi") => S(L.solidOf(prof, L.frameOf([x, y, z0], [0, 0, 1], [1, 0, 0], [0, 1, 0]), P), { tone, crease: "none" });

// An open spiral notebook: a card cover, two ruled pages with margins, and wire rings through the spine.
export function notebook() {
  const c = { x: -78, y: 14.5, w: 36, d: 18, r: 0.6 }, sx = c.x + c.w / 2, z = 1.2;
  const left = { x: c.x + 1, y: c.y + 1, w: c.w / 2 - 2, d: c.d - 2, r: 0.4 }, right = { ...left, x: sx + 1 };
  const rules = (p) => Array.from({ length: 5 }, (_, i) => k.lineOnTop([p.x, p.y + 3 + i * 2.6], [p.x + p.w, p.y + 3 + i * 2.6], z, P)).join("");
  const margin = (p) => k.lineOnTop([p.x + 2.6, p.y], [p.x + 2.6, p.y + p.d], z, P);
  const out = [S(k.slabOf(c, 0, 0.4, P, 3), { tone: "mid" })];
  for (const p of [left, right]) out.push(S(k.slabOf(p, 0.4, z - 0.4, P, 3), { tone: "hi", inner: Ln(rules(p), { tone: "faint" }) + Ln(margin(p), { tone: "lo" }) }));
  const rings = Array.from({ length: 9 }, (_, i) => L.arcOf(L.frameOf([sx, c.y + 1.6 + i * 1.85, z - 0.1], [0, 1, 0], [1, 0, 0], [0, 0, 1]), 0, 1, P, { from: 0, to: Math.PI })).join("");
  out.push(Ln(rings, { tone: "mid" }));
  return out.join("");
}

// A pen cup holding three pencils and the real pen the model is made from, a sixth of the model's length.
export function penCup() {
  const [cx, cy, r, ch] = [2, -21, 6, 16];
  const out = [`<path class="iso-halo" d="${k.haloOf({ x: cx - r, y: cy - r, w: 2 * r, d: 2 * r, r }, 0, 1, P)}"/>`];
  out.push(S(k.cylinder(cx, cy, r, 0, ch, P, 48, 0.4), { tone: "hi", inner: Ln(k.sideArc(cx, cy, r, 2.6, P, 32) + k.sideArc(cx, cy, r, ch - 2.6, P, 32), { tone: "faint" }) }));
  out.push(`<path class="so-void" d="${k.ring(cx, cy, r - 0.7, ch, P, 48)}"/>`);
  const items = [[cx - 2.4, cy - 1.6, "pencil", 29], [cx + 1.8, cy - 2.6, "pencil", 27], [cx + 2.2, cy + 2.2, "pen", 23.3], [cx - 1.6, cy + 2.8, "pencil", 30]];
  for (const [x, y, kind, len] of items.sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P))) {
    if (kind === "pen") {
      out.push(vertical(x, y, 2, [[0, 0.93], [len - 4, 0.93], [len - 4, 1.03], [len - 3, 1.03], [len - 3, 0.5], [len - 1.6, 0.5], [len - 1.5, 0.57, 1], [len - 0.8, 0.57, 1], [len - 0.7, 0]], "hi"));
      out.push(S(k.slabOf({ x: x + 0.93, y: y - 0.3, w: 0.35, d: 0.6, r: 0.1 }, 2 + len - 9, 5.4, P, 2), { tone: "mid" }));
      continue;
    }
    const hex = Array.from({ length: 6 }, (_, i) => [x + 1.2 * Math.cos((i * Math.PI) / 3 + Math.PI / 6), y + 1.2 * Math.sin((i * Math.PI) / 3 + Math.PI / 6)]);
    out.push(S(k.extrude(hex, 2, len - 5, P), { tone: "hi" }));
    out.push(S(k.cylinder(x, y, 1.22, len - 3, 1.4, P, 16), { tone: "mid", inner: Ln(k.sideArc(x, y, 1.22, len - 2.3, P, 12), { tone: "faint" }) }));
    out.push(S(k.cylinder(x, y, 1.12, len - 1.6, 1.2, P, 16, 0.3), { tone: "hi" }));
  }
  return out.join("");
}

// A pad of sticky notes, its sheets showing as lines round the side.
export function stickyNotes() {
  const p = { x: 54, y: 17, w: 12.6, d: 12.6, r: 0.5 };
  const sides = [0.6, 1.2, 1.8, 2.4].map((z) => k.sideSeam(p, z, P, 2)).join("");
  const note = [3.5, 5.2, 6.9].map((v) => k.lineOnTop([p.x + 2, p.y + v], [p.x + p.w - 3, p.y + v], 3, P)).join("");
  return `<path class="iso-halo" d="${k.haloOf(p, 0, 1, P)}"/>` + S(k.slabOf(p, 0, 3, P, 2), { tone: "hi", inner: Ln(sides, { tone: "faint" }) + Ln(note, { tone: "faint", free: true }) });
}

// An eraser in its card sleeve.
export function eraser() {
  const e = { x: 12, y: 24, w: 8.6, d: 3.6, r: 0.7 }, s = { x: 15, y: 23.85, w: 4.3, d: 3.9, r: 0.15 };
  return S(k.slabOf(e, 0, 2, P, 4, 0.4), { tone: "hi" }) + S(k.slabOf(s, 0, 2.15, P, 2), { tone: "mid", inner: Ln(k.lineOnTop([s.x + 0.7, s.y + 1.4], [s.x + 3.6, s.y + 1.4], 2.15, P), { tone: "faint", free: true }) });
}

// A steel rule along the front of the desk, its millimetre marks hanging from its far edge.
export function ruler() {
  const p = { x: -38, y: 26, w: 46, d: 3.6, r: 0.25 }, z1 = 0.5;
  const ticks = k.topTicks(p.x + 1.5, p.x + p.w - 1.5, 0.84, 6, p.y, z1, [0.6, 1.3], P, "x");
  return S(k.slabOf(p, 0, z1, P, 2), { tone: "hi", inner: Ln(ticks.minor, { tone: "lo" }) + Ln(ticks.major, { tone: "mid" }) }) + D([at([p.x + p.w - 1.4, p.y + p.d / 2, z1])], { size: 0.55, tone: "mid" });
}

// An index card, turned a little on the desk, ruled, with a line the real pen wrote on it in the ink's own colour.
export function card() {
  const o = [24, 15], w = 23, d = 14, t = (-10 * Math.PI) / 180, z = 0.3;
  const on = (u, v) => [o[0] + u * Math.cos(t) - v * Math.sin(t), o[1] + u * Math.sin(t) + v * Math.cos(t)];
  const ruleAt = (v) => k.lineOnTop(on(0, v), on(w, v), z, P);
  const rules = [5, 7.6, 10.2, 12.8].map(ruleAt).join("");
  const head = k.lineOnTop(on(0, 2.6), on(w, 2.6), z, P);
  const out = [S(k.extrude([on(0, 0), on(w, 0), on(w, d), on(0, d)], 0, z, P), { tone: "hi", inner: Ln(rules, { tone: "faint" }) + Ln(head, { tone: "lo" }) })];
  const pts = Array.from({ length: 48 }, (_, i) => { const f = i / 47, [x, y] = on(2.4 + f * 15, 7.2); return at([x, y, z]).map((v, j) => v + (j ? Math.sin(f * 29) * 0.55 - Math.abs(Math.sin(f * 8)) * 0.45 : 0)); });
  out.push(`<g class="pen-ink-line">${k.lineSvg(k.pathOf(pts), { tone: "hi", free: true })}</g>`);
  return out.join("");
}

// Two books lying one on the other at the back of the desk, their page edges ruled round the sides.
export function books() {
  const a = { x: -76, y: -28, w: 22, d: 14, r: 0.4 }, b = { x: -74.5, y: -26.8, w: 18.5, d: 11.6, r: 0.4 };
  const cover = (p, z) => [3, 4.4].map((v) => k.lineOnTop([p.x, p.y + v], [p.x + p.w, p.y + v], z, P)).join("") + k.lineOnTop([p.x + 2.4, p.y], [p.x + 2.4, p.y + p.d], z, P);
  const pages = (p, z0, z1) => [0.35, 0.55, 0.75].map((f) => k.sideSeam(k.insetPlan(p, 0.01), z0 + (z1 - z0) * f, P, 2)).join("");
  return `<path class="iso-halo" d="${k.haloOf(a, 0, 1, P)}"/>` + S(k.slabOf(a, 0, 4, P, 2, 0.2), { tone: "mid", inner: Ln(pages(a, 0, 4), { tone: "faint" }) }) + S(k.slabOf(b, 4, 3.2, P, 2, 0.2), { tone: "hi", inner: Ln(pages(b, 4, 7.2), { tone: "faint" }) + Ln(cover(b, 7.2), { tone: "lo" }) });
}
