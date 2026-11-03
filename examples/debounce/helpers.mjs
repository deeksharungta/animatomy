import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { P, at, S, D } from "./model.mjs";

const ngon = (r, n = 12) => Array.from({ length: n }, (_, i) => [r * Math.cos(((i + 0.5) / n) * Math.PI * 2), r * Math.sin(((i + 0.5) / n) * Math.PI * 2)]);
const unit = (v) => { const l = Math.hypot(...v); return v.map((x) => x / l); };

// A round rod along any axis.
export const rod = (o, a, r, s0, s1, n = 14) => {
  const u = Math.abs(a[2]) > 0.9 ? [1, 0, 0] : [0, 0, 1];
  return L.prismOf(L.frameOf(o, a, u, L.cross3(a, u)), ngon(r, n), s0, s1, P);
};

// A frame along a sloping direction: u across it on the level, v the surface normal (up).
export const slopeFrame = (o, a) => {
  const d = unit(a), u = unit([d[1], -d[0], 0]);
  return L.frameOf(o, d, u, L.cross3(u, d));
};

// A ball rail from a to b: two round rods the ball rides on, tied by flat straps underneath.
export function ballRail(a, b, gap = 6, { r = 0.8, ties = 3 } = {}) {
  const d = b.map((v, i) => v - a[i]), len = Math.hypot(...d), F = slopeFrame(a, d);
  const rodAt = (u) => L.prismOf(L.frameOf(L.pointOf(F, 0, 0, 0).map((v, i) => v + F.u[i] * u - F.v[i] * r), F.a, F.u, F.v), ngon(r, 12), 0, len, P);
  const tie = (s) => L.prismOf(F, [[-gap / 2 - r, -2 * r - 0.8], [gap / 2 + r, -2 * r - 0.8], [gap / 2 + r, -2 * r], [-gap / 2 - r, -2 * r]], s, s + 1.4, P);
  const nearSign = k.depthOf(L.pointOf(F, len / 2, 1, 0), P) > k.depthOf(L.pointOf(F, len / 2, 1, Math.PI), P) ? 1 : -1;
  const tiesSvg = Array.from({ length: ties }, (_, i) => S(tie(((i + 0.5) / ties) * len - 0.7), { tone: "mid" })).join("");
  return { back: tiesSvg + S(rodAt((-nearSign * gap) / 2), { tone: "hi" }), front: S(rodAt((nearSign * gap) / 2), { tone: "hi" }) };
}

// An open box: the far walls and floor, then (after its contents) the near walls.
export function openBox(plan, z0, h, t = 1.2) {
  const { x, y, w, d } = plan;
  const walls = [
    { x, y, w, d: t, r: 0.3 }, { x, y: y + t, w: t, d: d - 2 * t, r: 0.3 },
    { x: x + w - t, y: y + t, w: t, d: d - 2 * t, r: 0.3 }, { x, y: y + d - t, w, d: t, r: 0.3 },
  ];
  const wall = (p) => S(k.slabOf(p, z0 + t, h - t, P, 2), { tone: "mid" });
  return {
    back: S(k.slabOf(plan, z0, t, P, 3), { tone: "lo" }) + wall(walls[0]) + wall(walls[1]),
    front: wall(walls[2]) + wall(walls[3]) + D(k.corners(plan, t / 2).map(([px, py]) => at([px, py, z0 + h])), { size: 0.45 }),
  };
}

// A vertical post with a foot flange and a screw dot either side.
export function post(x, y, z0, z1, w = 3, tone = "mid") {
  const foot = { x: x - w, y: y - w, w: w * 2, d: w * 2, r: 0.6 };
  return S(k.slabOf(foot, z0, 1.4, P, 2, 0.3), { tone: "mid" }) + D([at([x - w + 0.9, y + w - 0.9, z0 + 1.4]), at([x + w - 0.9, y - w + 0.9, z0 + 1.4])], { size: 0.4 })
    + S(k.slabOf({ x: x - w / 2, y: y - w / 2, w, d: w, r: 0.4 }, z0 + 1.4, z1 - z0 - 1.4, P, 2), { tone });
}

// Screws at the corners of a top face.
export const screws = (plan, z, inset = 2.5) => D(k.corners(plan, inset).map(([x, y]) => at([x, y, z])), { size: 0.5 });
