import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { P, at, S, Ln, D } from "./model.mjs";

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

// A U-section chute from a to b: the floor's top surface runs through the line a-b.
export function chute(a, b, w, { lip = 2.6, t = 1.2, tone = "hi" } = {}) {
  const d = b.map((v, i) => v - a[i]), len = Math.hypot(...d), F = slopeFrame(a, d);
  const rect = (u0, u1, v0, v1) => [[u0, v0], [u1, v0], [u1, v1], [u0, v1]];
  const side = (sgn) => L.prismOf(F, sgn > 0 ? rect(w / 2, w / 2 + t, -t, lip) : rect(-w / 2 - t, -w / 2, -t, lip), 0, len, P);
  const floor = L.prismOf(F, rect(-w / 2, w / 2, -t, 0), 0, len, P);
  const nearSign = k.depthOf(L.pointOf(F, len / 2, 1, 0), P) > k.depthOf(L.pointOf(F, len / 2, 1, Math.PI), P) ? 1 : -1;
  return S(side(-nearSign), { tone: "mid" }) + S(floor, { tone }) + S(side(nearSign), { tone: "mid" });
}

// A coin rail from a to b: two round rods the token rides on, tied together by flat straps underneath.
export function coinRail(a, b, gap = 10, { r = 0.8, ties = 3 } = {}) {
  const d = b.map((v, i) => v - a[i]), len = Math.hypot(...d), F = slopeFrame(a, d);
  const rodAt = (u) => L.prismOf(L.frameOf(L.pointOf(F, 0, 0, 0).map((v, i) => v + F.u[i] * u - F.v[i] * r), F.a, F.u, F.v), ngon(r, 12), 0, len, P);
  const tie = (s) => L.prismOf(F, [[-gap / 2 - r, -2 * r - 0.8], [gap / 2 + r, -2 * r - 0.8], [gap / 2 + r, -2 * r], [-gap / 2 - r, -2 * r]], s, s + 1.4, P);
  const nearSign = k.depthOf(L.pointOf(F, len / 2, 1, 0), P) > k.depthOf(L.pointOf(F, len / 2, 1, Math.PI), P) ? 1 : -1;
  const tiesSvg = Array.from({ length: ties }, (_, i) => S(tie(((i + 0.5) / ties) * len - 0.7), { tone: "mid" })).join("");
  return tiesSvg + S(rodAt((-nearSign * gap) / 2), { tone: "hi" }) + S(rodAt((nearSign * gap) / 2), { tone: "hi" });
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

// A plate with a round hole straight through it (the tube's mouth).
export function holedSlab(plan, z, h, [cx, cy, r], tone = "hi") {
  const paths = k.slabOf(plan, z, h, P, 3, 0.5);
  const hole = k.ring(cx, cy, r, z + h, P, 48);
  return `<g style="fill-rule:evenodd">${S({ ...paths, fill: paths.fill + hole, top: paths.top + hole }, { tone })}</g>` + Ln(hole, { tone: "mid" });
}

// A rounded-rectangle ring standing in a y plane (a slot frame on a wall).
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
