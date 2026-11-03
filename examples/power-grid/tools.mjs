// Drawing helpers for the moving parts. Inlined into the page, so they use only their arguments.
export function tools(K, P) {
  const at = (p) => K.iso(p, P);
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const ngon = (r, n) => Array.from({ length: n }, (_, i) => [r * Math.cos(((i + 0.5) / n) * Math.PI * 2), r * Math.sin(((i + 0.5) / n) * Math.PI * 2)]);
  const frame = (o, a) => { const u = Math.abs(a[2]) > 0.9 ? [1, 0, 0] : [0, 0, 1]; const v = norm(cross(a, u)); return K.frameOf(o, a, norm(cross(v, a)), v); };
  return {
    at, cross, norm,
    S: (paths, o) => K.solidSvg(paths, o),
    Ln: (d, o) => K.lineSvg(d, o),
    D: (pts, o) => K.dotsSvg(pts, o),
    seg: (a, b) => K.segment(a, b, P),
    box: (x0, y0, z0, x1, y1, z1, r = 0.3) => K.slabOf({ x: x0, y: y0, w: x1 - x0, d: y1 - y0, r }, z0, z1 - z0, P, 2),
    // A round rod between two world points.
    rodAB: (a, b, r, n = 12) => { const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], l = Math.hypot(d[0], d[1], d[2]); return K.prismOf(frame(a, norm(d)), ngon(r, n), 0, l, P); },
    // A flat bar between two points, `w` wide across `side` and `t` thick.
    barAB: (a, b, side, w, t) => { const d = norm([b[0] - a[0], b[1] - a[1], b[2] - a[2]]), l = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]); const v = norm(cross(d, side)); return K.prismOf(K.frameOf(a, d, side, v), [[-w / 2, -t / 2], [w / 2, -t / 2], [w / 2, t / 2], [-w / 2, t / 2]], 0, l, P); },
    ball: (c, r) => K.sphereOf(c, r, P, { steps: 24 }),
    // A coil spring round a vertical axis, split into the half behind its axis and the half in front.
    helix: (x, y, z0, z1, r, turns) => {
      const back = [], front = [], n = Math.ceil(turns * 24), V = [Math.cos(((P.azimuth ?? 45) * Math.PI) / 180), Math.sin(((P.azimuth ?? 45) * Math.PI) / 180)];
      let run = [], near = null;
      for (let i = 0; i <= n; i++) {
        const t = (i / n) * turns * Math.PI * 2, p = [x + r * Math.cos(t), y + r * Math.sin(t), z0 + ((z1 - z0) * i) / n];
        const f = Math.cos(t) * V[0] + Math.sin(t) * V[1] > 0;
        if (near === null) near = f;
        if (f !== near) { run.push(at(p)); (near ? front : back).push(K.pathOf(run)); run = [at(p)]; near = f; continue; }
        run.push(at(p));
      }
      if (run.length > 1) (near ? front : back).push(K.pathOf(run));
      return { back: back.join(""), front: front.join("") };
    },
  };
}
