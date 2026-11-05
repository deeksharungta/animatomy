// Small builders shared by the frame, the counter and the scene.
import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { P, at, S, Ln, D } from "./model.mjs";

export const ngon = (r, n = 12, a0 = 0.5) => Array.from({ length: n }, (_, i) => [r * Math.cos(((i + a0) / n) * Math.PI * 2), r * Math.sin(((i + a0) / n) * Math.PI * 2)]);
const unit = (v) => { const l = Math.hypot(...v); return v.map((x) => x / l); };

// A round rod along any axis.
export const rod = (o, a, r, s0, s1, n = 14) => {
  const u = Math.abs(a[2]) > 0.9 ? [1, 0, 0] : [0, 0, 1];
  return L.prismOf(L.frameOf(o, a, u, L.cross3(a, u)), ngon(r, n), s0, s1, P);
};
// A box from its min corner and size, square to the axes.
export const box = (x, y, z, w, d, h, tone = "mid", r = 0.3, extra = {}) => S(k.slabOf({ x, y, w, d, r }, z, h, P, 2, Math.min(0.3, r)), { tone, ...extra });

// A frame along a sloping direction: u across it on the level, v the surface normal (up).
export const slopeFrame = (o, a) => {
  const d = unit(a), u = unit([d[1], -d[0], 0]);
  return L.frameOf(o, d, u, L.cross3(u, d));
};

// A U-section chute from a to b: the floor's top surface runs through the line a-b.
export function chute(a, b, w, { lip = 2.6, t = 1.2, tone = "hi" } = {}) {
  const d = b.map((v, i) => v - a[i]), len = Math.hypot(...d), F = slopeFrame(a, d);
  const rect = (u0, u1, v0, v1) => [[u0, v0], [u1, v0], [u1, v1], [u0, v1]];
  const side = (sgn) => L.prismOf(F, sgn > 0 ? rect(w / 2, w / 2 + t, -t, lip) : rect(-w / 2 - t, -w / 2, -t, lip), 0, len, P);
  const floor = L.prismOf(F, rect(-w / 2, w / 2, -t, 0), 0, len, P);
  const nearSign = k.depthOf(L.pointOf(F, len / 2, 1, 0), P) > k.depthOf(L.pointOf(F, len / 2, 1, Math.PI), P) ? 1 : -1;
  const rivets = (sg) => D(Array.from({ length: Math.floor(len / 9) }, (_, i) => at(L.pointOf(F, 4.5 + i * 9, 0, 0).map((v, j) => v + F.u[j] * sg * (w / 2 + t / 2) + F.v[j] * lip))), { size: 0.4 });
  return { back: S(side(-nearSign), { tone: "mid" }) + rivets(-nearSign) + S(floor, { tone }), front: S(side(nearSign), { tone: "mid" }) + rivets(nearSign) };
}

// An open box: the floor and far walls, then (after its contents) the near walls.
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

// A rounded rectangle standing in a y plane (a slot frame, a drawer front's moulding).
export const ringY = (y, x0, x1, z0, z1, rr) => {
  const pts = [];
  const arc = (cx, cz, a0) => { for (let i = 0; i <= 6; i++) { const t = a0 + (i / 6) * (Math.PI / 2); pts.push(at([cx + rr * Math.cos(t), y, cz + rr * Math.sin(t)])); } };
  arc(x1 - rr, z1 - rr, 0); arc(x0 + rr, z1 - rr, Math.PI / 2); arc(x0 + rr, z0 + rr, Math.PI); arc(x1 - rr, z0 + rr, Math.PI * 1.5);
  return k.pathOf(pts, true);
};
export const ringX = (x, y0, y1, z0, z1, rr) => {
  const pts = [];
  const arc = (cy, cz, a0) => { for (let i = 0; i <= 6; i++) { const t = a0 + (i / 6) * (Math.PI / 2); pts.push(at([x, cy + rr * Math.cos(t), cz + rr * Math.sin(t)])); } };
  arc(y1 - rr, z1 - rr, 0); arc(y0 + rr, z1 - rr, Math.PI / 2); arc(y0 + rr, z0 + rr, Math.PI); arc(y1 - rr, z0 + rr, Math.PI * 1.5);
  return k.pathOf(pts, true);
};

// Screws at the corners of a top face.
export const screws = (plan, z, inset = 2.5) => D(k.corners(plan, inset).map(([x, y]) => at([x, y, z])), { size: 0.5 });

// A hole's number in pips on a plate facing +y, like a domino: a small ring for hole 0.
export function pips(i, x, y, zm) {
  const at0 = [[], [[0, 0]], [[-2, 0], [2, 0]], [[-2.8, 0], [0, 0], [2.8, 0]], [[-1.4, 0.9], [1.4, 0.9], [-1.4, -0.9], [1.4, -0.9]], [[-2.8, 0.9], [0, 0.9], [2.8, 0.9], [-1.4, -0.9], [1.4, -0.9]],
    [[-2.8, 0.9], [0, 0.9], [2.8, 0.9], [-2.8, -0.9], [0, -0.9], [2.8, -0.9]], [[-3.3, 0.9], [-1.1, 0.9], [1.1, 0.9], [3.3, 0.9], [-2.2, -0.9], [0, -0.9], [2.2, -0.9]]][i];
  return (at0.length ? D(at0.map(([u, v]) => at([x + u, y, zm + v])), { size: 0.62, tone: "hi" }) : Ln(ringY(y, x - 1.2, x + 1.2, zm - 1.2, zm + 1.2, 1.1), { tone: "mid" }))
    + D([at([x - 4.2, y, zm]), at([x + 4.2, y, zm])], { size: 0.35, tone: "lo" });
}
