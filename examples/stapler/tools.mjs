// Drawing helpers shared by the moving parts. Inlined into the page, so they use only their arguments and model.mjs.
import { turn, prismY } from "./model.mjs";

export function tools(K, P, C, k) {
  const at = (p) => K.iso(p, P);
  return {
    at,
    seg: (a, b) => K.segment(a, b, P),
    Sv: (paths, o) => K.solidSvg(paths, o),
    Ln: (d, o) => K.lineSvg(d, o),
    Dt: (pts, o) => K.dotsSvg(pts, o),
    tm: (p) => turn(C, k.thm, p),
    tc: (p) => turn(C, k.thc, p),
    box: (th, x0, x1, z0, z1, y0, y1) => prismY(K, P, C, th, [[x0, z0], [x1, z0], [x1, z1], [x0, z1]], y0, y1),
    rrect: (x0, x1, y0, y1, r, n = 4) => {
      const pts = [];
      const arc = (cx, cy, a0) => { for (let i = 0; i <= n; i++) { const t = a0 + (i / n) * Math.PI / 2; pts.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]); } };
      arc(x1 - r, y1 - r, 0); arc(x0 + r, y1 - r, Math.PI / 2); arc(x0 + r, y0 + r, Math.PI); arc(x1 - r, y0 + r, Math.PI * 1.5);
      return pts;
    },
    circ: (cx, cy, r, n = 18) => Array.from({ length: n }, (_, i) => [cx + r * Math.cos((i / n) * Math.PI * 2), cy + r * Math.sin((i / n) * Math.PI * 2)]),
  };
}
