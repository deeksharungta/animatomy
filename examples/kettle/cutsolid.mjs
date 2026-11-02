import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { W, TOWARD, P } from "./model.mjs";

// A solid whose cut face is any polygon in the cut plane (concave, with holes), drawn back from the cut
// to w0: the handle loop, the controller's walls. It returns kit SolidPaths, so solidSvg shades it:
// the cut face in its own tone, every side that faces the viewer in its bucket, one outline round the union.
const area = (pts) => pts.reduce((s, p, i) => { const q = pts[(i + 1) % pts.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0) / 2;
const orient = (pts, sign) => (Math.sign(area(pts)) === sign ? pts : [...pts].reverse());
const V = L.viewOf(P), LT = L.lightOf(P);

export function cutSolid(outer, holes = [], w0 = -6, w1 = 0) {
  const front = (p) => k.iso(W([p[0], w1, p[1]]), P);
  const back = (p) => k.iso(W([p[0], w0, p[1]]), P);
  const buckets = [[], [], [], [], []];
  const fills = [], outline = [], crease = [];
  const capTone = L.bandOf(L.dot3(TOWARD, LT));
  const loops = [orient(outer, 1), ...holes.map((h) => orient(h, -1))];
  const cap = loops.map((loop, i) => { const pts = orient(loop.map(front), i === 0 ? -1 : 1); return k.pathOf(pts, true); }).join("");
  buckets[capTone].push(cap);
  fills.push(cap);
  for (const loop of loops) {
    const n = loop.length;
    const seen = [];
    for (let j = 0; j < n; j++) {
      const a = loop[j], b = loop[(j + 1) % n];
      // The outward normal of this side, in world space (outer loop counter-clockwise in u, z).
      const du = b[0] - a[0], dz = b[1] - a[1];
      const nu = dz, nz = -du;
      const len = Math.hypot(nu, nz) || 1;
      const normal = L.add3(L.mul3(W([1, 0, 0]), nu / len), [0, 0, nz / len]);
      const visible = L.dot3(normal, V) > 1e-6;
      seen.push(visible);
      if (visible) {
        const quad = orient([front(a), front(b), back(b), back(a)], -1);
        buckets[L.bandOf(L.dot3(normal, LT))].push(k.pathOf(quad, true));
        fills.push(k.pathOf(quad, true));
        crease.push(k.pathOf([front(a), front(b)]));
        outline.push(k.pathOf([back(a), back(b)]));
      } else outline.push(k.pathOf([front(a), front(b)]));
    }
    for (let j = 0; j < n; j++) if (seen[j] !== seen[(j - 1 + n) % n]) outline.push(k.pathOf([front(loop[j]), back(loop[j])]));
  }
  return { fill: fills.join(""), outline: outline.join(""), crease: crease.join(""), top: buckets[4].join(""), shades: buckets.slice(0, 4).map((l) => l.join("")) };
}
