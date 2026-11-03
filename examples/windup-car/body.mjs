import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D, flatY, box, segY, arcPts } from "./model.mjs";
import { panelXZ, rodY } from "./geo.mjs";
import { archR } from "./car.mjs";

const Bd = C.BODY, Wh = C.WHEEL;
const yIn = Bd.y0 + 1;
// The coupe's side, front to back along the top: bonnet, windscreen pillar, roof, rear slope and tail.
const TOP = [[Bd.x1, 22], [63, 30], [56, 35.5], [40, 36], [30, 37], [18, 58], [12, 61], [-30, 61], [-38, 58], [-52, 44], [-60, 36], [Bd.x0, 29]];
// Where a level line at height z meets the side's front and back edges.
function spanAt(z) {
  const xs = [];
  for (let i = 0; i < TOP.length - 1; i++) {
    const [a, b] = [TOP[i], TOP[i + 1]];
    if ((a[1] - z) * (b[1] - z) <= 0 && a[1] !== b[1]) xs.push(a[0] + ((z - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
  }
  return [Math.min(...xs), Math.max(...xs)];
}

// The far side seen from inside: arch lips, two pressed windows, door seams, hinges, handle, belt line, fuel cap and tabs.
export function farWall() {
  const a0 = Math.asin((Bd.floor - Wh.z) / archR);
  const arch = (cx) => arcPts(cx, Wh.z, archR, Math.PI - a0, a0, 18);
  const outline = [[Bd.x0, Bd.floor], ...arch(Wh.rearX), ...arch(Wh.frontX), [Bd.x1, Bd.floor], ...TOP];
  const y = yIn, [b0, b1] = spanAt(38);
  const win = [[[-2, 41], [23.4, 41], [17.2, 56], [-2, 56]], [[-6, 41], [-31, 41], [-37, 49], [-30, 56], [-6, 56]]];
  const ring = (poly, by) => { const cx = poly.reduce((s, p) => s + p[0], 0) / poly.length, cz = poly.reduce((s, p) => s + p[1], 0) / poly.length; return poly.map(([x, z]) => { const d = Math.hypot(x - cx, z - cz); return [x - ((x - cx) / d) * by, z - ((z - cz) / d) * by]; }); };
  const closed = (poly) => k.pathOf(poly.map(([x, z]) => at([x, y, z])), true);
  const frames = win.map((w) => closed(w) + closed(ring(w, 1.4))).join("");
  const seams = segY(y, [-4, Bd.floor], [-4, 59.6]) + segY(y, [24.6, Bd.floor], [24.6, 37 + ((30 - 24.6) * 21) / 12]) + segY(y, [b0, 38], [b1, 38]);
  const aL = Math.asin((Bd.floor - Wh.z) / (archR + 1.6));
  const lips = [Wh.rearX, Wh.frontX].map((cx) => k.pathOf(arcPts(cx, Wh.z, archR + 1.6, Math.PI - aL, aL, 18).map(([x, z]) => at([x, y, z])))).join("");
  const tabs = [-56, -24, 24, 52].map((x) => S(box(x - 2.4, yIn, Bd.deck, x + 2.4, yIn + 2.6, Bd.deck + 0.5, 0.2), { tone: "hi" })).join("");
  const hinge = [22, 32].map((z) => S(L.disc(0, 3.2, 0.9, L.frameAlong([24.6, y + 0.9, z - 1.6], [0, 0, 1]), P), { tone: "hi", crease: "lo" })).join("");
  return S(panelXZ(outline, Bd.y0, y), { tone: "mid", inner: Ln(seams, { tone: "faint" }) + Ln(frames, { tone: "lo" }) + Ln(lips, { tone: "faint" }) }) +
    D([-50, -10, 8, 40].map((x) => at([x, y, Bd.floor + 3])), { size: 0.55, tone: "lo" }) + tabs + hinge +
    S(flatY([[0, 33], [7, 33], [7, 35.2], [0, 35.2]], y, y + 1.2), { tone: "hi" }) + D([at([1, y + 1.2, 34.1]), at([6, y + 1.2, 34.1])], { size: 0.4, tone: "lo" }) +
    S(L.disc(0, 0.8, 2.6, L.frameAlong([-54, y, 31], [0, 1, 0]), P), { tone: "hi", crease: "lo" }) +
    S(box(-30, yIn, 59.6, 12, yIn + 1.6, 61, 0.3), { tone: "hi" });
}

// The dashboard across the far half of the scuttle, its steering column and a three-spoke wheel.
export function dash() {
  const x = 40, z0 = 22, z1 = 33, wheelAt = [31, -18, 39], dir = [-0.62, 0, 0.78];
  const col = L.frameAlong([x, -18, 29], [wheelAt[0] - x, 0, wheelAt[2] - 29]);
  const len = Math.hypot(wheelAt[0] - x, wheelAt[2] - 29);
  const F = L.frameAlong(wheelAt, dir), spokes = [0, 1, 2].map((i) => { const t = Math.PI / 2 + (i / 3) * Math.PI * 2; return L.prismOf(L.frameOf(wheelAt, dir, L.radialOf(F, t), L.radialOf(F, t + Math.PI / 2)), [[1.4, -0.5], [6.2, -0.4], [6.2, 0.4], [1.4, 0.5]], -0.3, 0.3, P); });
  const wheel = S(L.disc(0, len, 0.9, col, P), { tone: "hi", crease: "none" }) + spokes.map((sp) => S(sp, { tone: "hi" })).join("") +
    S(L.ringBand(-0.5, 0.5, 6, 7.2, F, P, { steps: 48, hole: [0.5, 6] }), { tone: "hi", crease: "lo" }) + S(L.disc(-0.6, 0.8, 1.8, F, P), { tone: "hi", crease: "lo" });
  return wheel + S(box(x, yIn, z0, x + 1.4, -4, z1, 0.3, 0.2), { tone: "mid" }) +
    S(box(x - 4, yIn, z1, x + 1.4, -4, z1 + 1.2, 0.4, 0.3), { tone: "hi" }) + D([at([x + 1.4, -28, z0 + 2]), at([x + 1.4, -7, z0 + 2]), at([x + 1.4, -28, z1 - 2]), at([x + 1.4, -7, z1 - 2])], { size: 0.45, tone: "lo" });
}

// A pressed tin seat on the near side, against the rear panel: cushion, back and the pleats across them.
export function seat() {
  const c = { x: Bd.x0 + 4, y: 2, w: 13, d: 26, r: 1.6 };
  const pleats = [8, 14, 20, 26].map((y) => k.segment([c.x + 0.8, y, 19], [c.x + c.w - 0.8, y, 19], P)).join("");
  return S(box(Bd.x0 + 6, 4, Bd.deck, Bd.x0 + 14, 26, 15, 0.3), { tone: "mid" }) +
    S(k.slabOf(c, 15, 4, P, 4, 0.8), { tone: "hi", inner: Ln(pleats, { tone: "faint" }) }) +
    S(box(Bd.x0 + 1.4, 2, 19, Bd.x0 + 5, 28, 36, 1.4, 0.8), { tone: "hi", inner: Ln([8, 14, 20, 26].map((y) => k.segment([Bd.x0 + 5, y, 21], [Bd.x0 + 5, y, 34], P)).join(""), { tone: "faint" }) });
}
