// The sorting desk: a cabinet of drawers, and on it the frame of eight pigeonholes with a pip plate under each.
import * as k from "../../kit/iso-kit.mjs";
import { C, P, at, S, Ln, D, xc } from "./model.mjs";
import { box, ringY, ringX, screws, pips } from "./helpers.mjs";

const CAB = C.CAB, T = C.TOP;

// The cabinet: plinth and feet, carcass, six drawers with pulls and card holders, a moulded end panel, a maker's plate.
export function cabinet() {
  const out = [`<path class="iso-halo" d="${k.haloOf(k.insetPlan(CAB, -3), -2, 4, P)}"/>`];
  for (const [x, y] of k.corners(CAB, 6).sort((a, b) => k.depthOf([...a, 0], P) - k.depthOf([...b, 0], P))) out.push(S(k.cylinder(x, y, 3.4, 0, 4, P, 20), { tone: "lo" }));
  out.push(S(k.slabOf(k.insetPlan(CAB, 2), 4, 4, P, 3), { tone: "lo" }));
  const yf = CAB.y + CAB.d, xr = CAB.x + CAB.w;
  out.push(S(k.slabOf(CAB, 8, T - 8, P, 3, 0.8), { tone: "mid", inner: Ln(k.sideSeam(CAB, T - 4, P, 3), { tone: "faint" }) }));
  const n = 6, gw = CAB.w / n, lines = [], dots = [], pulls = [];
  for (let i = 0; i < n; i++) {
    const x0 = CAB.x + i * gw + 3, x1 = CAB.x + (i + 1) * gw - 3, mx = (x0 + x1) / 2;
    lines.push(ringY(yf, x0, x1, 10.5, T - 3.5, 1.2), ringY(yf, x0 + 2.2, x1 - 2.2, 12.7, T - 5.7, 0.8));
    // The card holder: a brass frame with three rules for the drawer's range of names.
    lines.push(ringY(yf + 0.1, mx - 7, mx + 7, T - 10.6, T - 7, 0.5));
    dots.push(at([mx - 6, yf, T - 8.8]), at([mx + 6, yf, T - 8.8]));
    for (const xx of [mx - 5.5, mx + 4.5]) pulls.push(S(k.slabOf({ x: xx, y: yf, w: 1, d: 1.4, r: 0.2 }, 14.2, 3.4, P, 2), { tone: "mid" }));
    pulls.push(S(k.slabOf({ x: mx - 6, y: yf + 1.4, w: 12, d: 1.2, r: 0.5 }, 14.6, 2, P, 2, 0.3), { tone: "hi" }));
  }
  out.push(Ln(lines.join(""), { tone: "faint" }), D(dots, { size: 0.45 }), pulls.join(""));
  out.push(Ln([T - 9.6, T - 8.8, T - 8].map((z, j) => Array.from({ length: n }, (_, i) => { const mx = CAB.x + (i + 0.5) * gw; return k.segment([mx - 5, yf + 0.1, z], [mx - 5 + [9, 7, 5][j], yf + 0.1, z], P); }).join("")).join(""), { tone: "lo", free: true }));
  // The end panel: a moulded field, and the maker's plate with its rules and rivets.
  out.push(Ln(ringX(xr, CAB.y + 4, yf - 4, 10.5, T - 3.5, 1.4) + ringX(xr, CAB.y + 6.4, yf - 6.4, 12.7, T - 5.7, 1), { tone: "faint" }));
  out.push(S(k.slabOf({ x: xr, y: 8, w: 0.8, d: 22, r: 0.3 }, 14, 8, P, 2), { tone: "hi" }));
  out.push(Ln([19.6, 18, 16.4].map((z, i) => k.segment([xr + 0.8, 11, z], [xr + 0.8, 11 + [16, 12, 9][i], z], P)).join(""), { tone: "mid", free: true }));
  out.push(D([at([xr + 0.8, 9.4, 21]), at([xr + 0.8, 28.6, 21]), at([xr + 0.8, 9.4, 15]), at([xr + 0.8, 28.6, 15])], { size: 0.45 }));
  // The top: boards running along the desk, and a brass edge strip on the front.
  out.push(Ln([24, 34].map((y) => k.lineOnTop([CAB.x, y], [xr, y], T, P)).join(""), { tone: "faint" }));
  out.push(S(k.slabOf({ x: CAB.x, y: yf - 1.6, w: CAB.w, d: 1.6, r: 0.3 }, T, 0.8, P, 2), { tone: "hi" }));
  return out.join("");
}

// The frame behind the holes: back panel and the floor board, whose front is the rail carrying the pip plates.
export function frameBack() {
  const out = [];
  out.push(box(-1.2, C.Y0 - 1.6, T, C.X1 + 2.4, 1.6, C.CEIL + C.BOARD - T, "mid"));
  const fb = { x: -1.2, y: C.Y0, w: C.X1 + 2.4, d: C.Y1 - C.Y0, r: 0.3 };
  out.push(S(k.slabOf(fb, T, C.RAIL - T, P, 2, 0.4), { tone: "mid", inner: Ln(k.sideSeam(fb, C.RAIL - 1.4, P, 2), { tone: "faint" }) }));
  for (let i = 0; i < C.N; i++) {
    const x = xc(C, i), z0 = T + 1.6, z1 = C.RAIL - 2.6;
    out.push(S(k.slabOf({ x: x - 5, y: C.Y1, w: 10, d: 0.5, r: 0.3 }, z0, z1 - z0, P, 2), { tone: "hi" }));
    const zm = (z0 + z1) / 2;
    out.push(pips(i, x, C.Y1 + 0.5, zm));
    out.push(D([at([x - 4.2, C.Y1 + 0.5, zm]), at([x + 4.2, C.Y1 + 0.5, zm])], { size: 0.35, tone: "lo" }));
  }
  return out.join("");
}

// One divider (i = 0 and 8 are the side panels): a board between two holes, with a rounded front edge.
export function divider(i) {
  const x = i * C.PITCH, side = i === 0 || i === C.N;
  return S(k.slabOf({ x: side ? x - 1.2 : x, y: C.Y0, w: side ? C.WALL + 1.2 : C.WALL, d: C.Y1 - C.Y0 + (side ? 0.6 : 0), r: 0.4 }, C.RAIL, C.CEIL - C.RAIL, P, 2, 0.3), { tone: "mid" })
    + (i === C.N ? Ln(ringX(x + C.WALL, C.Y0 + 3, C.Y1 - 3, C.RAIL + 3, C.CEIL - 3, 1), { tone: "faint" }) + D([[C.Y0 + 1.6, C.RAIL + 1.6], [C.Y1 - 1.4, C.RAIL + 1.6], [C.Y0 + 1.6, C.CEIL - 1.6], [C.Y1 - 1.4, C.CEIL - 1.6]].map(([y, z]) => at([x + C.WALL, y, z])), { size: 0.45 }) : "");
}

// The top board over the holes; the camshaft's blocks stand on it.
export function topBoard() {
  const p = { x: -1.8, y: C.Y0 - 1.6, w: C.X1 + 3.6, d: C.SHAFT.y + 6 - C.Y0 + 1.6, r: 0.6 };
  return S(k.slabOf(p, C.CEIL, C.BOARD, P, 3, 0.5), { tone: "mid" }) + screws(p, C.CEIL + C.BOARD, 2)
    + Ln(k.lineOnTop([-1.8, C.Y1], [C.X1 + 1.8, C.Y1], C.CEIL + C.BOARD, P), { tone: "faint" }) + indexStrip();
}

// A brass index strip along the top board's front: a tick and a dot over every hole's centre, a short tick between.
function indexStrip() {
  const z = C.CEIL + C.BOARD + 0.5, y1 = C.SHAFT.y + 5.4, ticks = [], dots = [];
  for (let i = 0; i <= C.N * 2; i++) {
    const x = (i * C.PITCH) / 2 + C.WALL / 2, major = i % 2 === 1;
    ticks.push(k.segment([x, y1, z], [x, y1 - (major ? 1.6 : 0.9), z], P));
    dots.push(at([x, y1 - (major ? 1.6 : 0.9), z]));
  }
  return S(k.slabOf({ x: -0.6, y: y1 - 2.4, w: C.X1 + 1.2, d: 2.4, r: 0.3 }, z - 0.5, 0.5, P, 2), { tone: "hi", flat: true }) + Ln(ticks.join(""), { tone: "mid" }) + D(dots, { size: 0.35, tone: "mid" });
}

// The rubber runner along the ledge in front of the holes, where Nib walks: a thin mat with ribs across it.
export function runner() {
  const m = { x: -6, y: C.Y1 + 1.2, w: 200, d: 6.8, r: 0.8 }, ribs = [];
  for (let x = m.x + 3; x < m.x + m.w - 1; x += 3.4) ribs.push(k.lineOnTop([x, m.y + 0.6], [x, m.y + m.d - 0.6], T + 0.5, P));
  return S(k.slabOf(m, T, 0.5, P, 3), { tone: "lo", flat: true }) + Ln(ribs.join(""), { tone: "faint" });
}
