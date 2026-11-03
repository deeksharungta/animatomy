import * as k from "../../kit/iso-kit.mjs";
import { C, P, S, Ln, box } from "./model.mjs";
import { blocks, ball, book, toyBox, skittles, marbles, carBox } from "./props.mjs";

// The room: boards running off the card, skirting, a panelled wainscot, a dado rail and papered wall; joints and toys scroll.
const FL = { x0: -900, x1: 900, y0: -112, y1: 420 }, BW = 31, WALL = FL.y0, DADO = 44;
const rows = Array.from({ length: Math.floor((FL.y1 - FL.y0) / BW) }, (_, i) => FL.y0 + i * BW);

export function floor() {
  const seams = rows.slice(1).map((y) => k.segment([FL.x0, y, 0], [FL.x1, y, 0], P)).join("");
  return S(box(FL.x0, FL.y0, -4, FL.x1, FL.y1, 0, 0.01), { tone: "lo", inner: Ln(seams, { tone: "faint" }) });
}
export const wall = () => S(box(FL.x0, WALL - 6, 0, FL.x1, WALL, 220, 0.01), { tone: "lo" });
// The dado rail and the skirting with its moulding and shoe, painted over the wallpaper's stripes.
export function trim() {
  return S(box(FL.x0, WALL, DADO, FL.x1, WALL + 2.4, DADO + 4, 0.01, 0.4), { tone: "mid" }) +
    S(box(FL.x0, WALL, 0, FL.x1, WALL + 3, 13, 0.01, 0.4), { tone: "mid", inner: Ln(k.segment([FL.x0, WALL + 3, 9], [FL.x1, WALL + 3, 9], P) + k.segment([FL.x0, WALL + 3, 3], [FL.x1, WALL + 3, 3], P), { tone: "faint" }) }) +
    S(box(FL.x0, WALL + 3, 0, FL.x1, WALL + 5, 2.4, 0.01, 0.3), { tone: "mid" });
}

// What scrolls: repeated every period so the run can loop without a jump.
function joints(x0) {
  const T = C.WORLD.period;
  const out = [];
  rows.forEach((y, i) => {
    for (const f of [0.13, 0.63]) {
      const x = x0 + ((f + (i * 0.37) % 1) % 1) * T;
      out.push(k.segment([x, y, 0], [x, y + BW, 0], P));
    }
  });
  return out.join("");
}
function stripes(x0) {
  const out = [], T = C.WORLD.period;
  for (let x = x0; x < x0 + T; x += 18) out.push(k.segment([x, WALL, DADO + 4], [x, WALL, 220], P));
  // The wainscot below the dado rail: a raised panel moulding every 74 mm.
  const n = Math.round(T / 74), pw = T / n, panels = [];
  for (let i = 0; i < n; i++) {
    const a = x0 + i * pw + 6, b = x0 + (i + 1) * pw - 6;
    panels.push(k.pathOf([[a, 18], [b, 18], [b, DADO - 5], [a, DADO - 5]].map(([u, z]) => k.iso([u, WALL, z], P)), true));
  }
  return Ln(out.join(""), { tone: "faint" }) + Ln(panels.join(""), { tone: "lo" });
}

const copies = () => [-1, 0, 1, 2].map((n) => n * C.WORLD.period - C.WORLD.period / 2);
export const worldLines = () => copies().map((x0) => Ln(joints(x0), { tone: "faint" }) + stripes(x0)).join("");
export const worldProps = () => copies().map((x0) => book(x0 + 205, -100) + blocks(x0 + 352, -100) + skittles(x0 + 400, -80) + ball(x0 + 503, -84) + toyBox(x0 + 570, -104) + marbles(x0 + 640, -76) + carBox(x0 + 303, 78) + marbles(x0 + 363, 90)).join("");
