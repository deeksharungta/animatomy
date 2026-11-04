// The parts that move, drawn from the model's state. Serialized into the page, so it uses only K, P, C and S.
export function dynamic(K, P, C, S) {
  const at = (p) => K.iso(p, P), Z = C.ZC, out = {};
  const flat = (pts, y, tone, cls, lit) => {
    const d = K.pathOf(pts.map(([x, z]) => at([x, y, z])), true), t = C.TONE_Y, sh = ["", "", "", ""];
    if (t < 4) sh[t] = d;
    return K.solidSvg({ fill: d, outline: d, crease: "", top: t === 4 ? d : "", shades: sh }, { tone, crease: "none", className: cls, lit });
  };
  // The trigger turns about its pin; split where it passes through the slide plate.
  const [px, pz] = C.PIVOT, th = (S.u / C.STROKE) * 2 * C.SWING * Math.PI / 180 - (C.SWING * Math.PI) / 180;
  const rot = ([u, w]) => [u * Math.cos(th) + w * Math.sin(th), -u * Math.sin(th) + w * Math.cos(th)];
  const prism = (poly, y0, y1, tone) => K.solidSvg(K.prismOf(K.frameOf([px, 0, pz], [0, 1, 0], [1, 0, 0], [0, 0, 1]), poly.map(rot), y0, y1, P), { tone });
  const cut = C.PLATE.z - pz - 0.4, top = C.ARM - 0.6;
  const arm = (w0, w1) => [[-2.6, w0], [2.6, w0], [2.2, w1], [0.8, w1 + 0.9], [-0.8, w1 + 0.9], [-2.2, w1]];
  // The trigger's body: a near face from a smoothed outline with finger scallops, and the side faces you see.
  let ol = [[-5.4, 0], [-4.4, 3.2], [-1.6, 5.2], [1.6, 5.2], [4.4, 3.2], [5.4, 0], [6.6, -6], [8.6, -14], [9.8, -19], [9.0, -24], [10.2, -29], [9.6, -33.5], [8.0, -36], [4.5, -37.2], [1.2, -36], [-1.2, -32], [-2.6, -24], [-3.8, -15], [-5.0, -7]];
  for (let k = 0; k < 2; k++) ol = ol.flatMap((p, i) => { const q = ol[(i + 1) % ol.length]; return [[0.75 * p[0] + 0.25 * q[0], 0.75 * p[1] + 0.25 * q[1]], [0.25 * p[0] + 0.75 * q[0], 0.25 * p[1] + 0.75 * q[1]]]; });
  const wpt = ol.map((q) => { const r = rot(q); return [px + r[0], pz + r[1]]; }), y0 = -4, y1 = 4.6;
  const tone = (n) => { const l = Math.hypot(n[0], n[1], n[2]), sc = (n[0] * C.LIGHT[0] + n[1] * C.LIGHT[1] + n[2] * C.LIGHT[2]) / l; let t = 0; while (t < 4 && sc >= [0, 0.2, 0.42, 0.62][t]) t++; return t; };
  const sh = [[], [], [], [], []], far = [];
  wpt.forEach((a, i) => {
    const b = wpt[(i + 1) % wpt.length], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1, n = [-dz / l, 0, dx / l];
    if (n[0] * C.VIEW[0] + n[2] * C.VIEW[2] <= 0.01) return;
    sh[tone(n)].push(K.pathOf([[a[0], y0, a[1]], [b[0], y0, b[1]], [b[0], y1, b[1]], [a[0], y1, a[1]]].map(at), true));
    far.push(K.segment([a[0], y0, a[1]], [b[0], y0, b[1]], P));
  });
  const all = sh.flat().join("");
  const sides = K.solidSvg({ fill: all, outline: far.join(""), crease: "", top: sh[4].join(""), shades: sh.slice(0, 4).map((x) => x.join("")), seamless: true }, { tone: "mid", crease: "none" });
  const nf = K.pathOf(wpt.map(([x, z]) => at([x, y1, z])), true), tn = C.TONE_Y, nsh = ["", "", "", ""];
  if (tn < 4) nsh[tn] = nf;
  const near = K.solidSvg({ fill: nf, outline: nf, crease: "", top: tn === 4 ? nf : "", shades: nsh }, { tone: "mid", crease: "none" });
  const pin = at([px, y1, pz]);
  out.triggerLow = prism(arm(0, cut), -2.6, 2.6, "mid") + sides + near +
    K.lineSvg(K.circleOf(K.frameAlong([px, y1, pz], [0, 1, 0]), 0, 1.6, P, 18), { tone: "lo" }) + K.dotsSvg([pin], { size: 0.6, tone: "lo" });
  out.triggerHigh = prism(arm(cut, top), -2.6, 2.6, "mid");
  // The carriage: a sled on the slide plate, its saddle Pinch stands on and the lug Roo pushes.
  const u = S.u, c = C.CARR, box = (x0, x1, y0, y1, z0, z1, tone, r = 0.4) => K.solidSvg(K.slabOf({ x: x0 + u, y: y0, w: x1 - x0, d: y1 - y0, r }, z0, z1 - z0, P, 2, 0.3), { tone });
  out.carriage = box(c.x0, c.x1, -c.y, c.y, c.z0, c.z1 - 1, "mid") + box(c.x0 + 1, c.x1 - 1, -8, 11, c.z1 - 1, c.z1, "hi") +
    box(c.x1, c.x1 + 2.6, 3, 8, Z - 17, Z - 12.4, "hi") + box(C.PIN[0] - 6, C.PIN[0] + 6, 4, 11.6, c.z1, c.z1 + 2, "mid") + K.dotsSvg([at([c.x0 + 3 + u, 9.4, c.z1]), at([c.x1 - 3 + u, 9.4, c.z1]), at([c.x1 + 1.3 + u, 8, Z - 14.7]), at([C.PIN[0] - 4 + u, 10, c.z1 + 2]), at([C.PIN[0] + 4 + u, 10, c.z1 + 2])], { size: 0.5, tone: "lo" });
  // The stick, whole until it enters the sleeve, then cut; its front end rounds off where it melts.
  const R = C.R, xr = C.XR0 + S.fed, xf = C.BLOCK.x0 + S.solid, AX = K.frameOf([0, 0, Z], [1, 0, 0], [0, 0, 1], [0, 1, 0]);
  out.stick = K.solidSvg(K.disc(xr, C.SLEEVE.x0, R, AX, P, { steps: 40 }), { tone: "hi", crease: "none", className: "gg-glue", lit: S.duty === "" && S.power });
  const end = [];
  for (let i = 0; i <= 8; i++) { const f = (i / 8) * Math.PI / 2; end.push([xf - 2.6 + 2.6 * Math.sin(f), R - (R - 3.2) * (1 - Math.cos(f)) - (i === 8 ? 0 : 0)]); }
  const top3 = [[C.SLEEVE.x0, R], ...end];
  out.half = flat([...top3.map(([x, r]) => [x, Z + r]), ...top3.slice().reverse().map(([x, r]) => [x, Z - r])], 0, "hi", "gg-glue");
  // The melt ahead of it, filling the bore, the passage, the ball's chamber and the orifice.
  const rg = (x) => (x < 14 ? C.BLOCK.bore : x < 17 ? C.BLOCK.bore + ((C.BLOCK.pass - C.BLOCK.bore) * (x - 14)) / 3 : x < C.NOZ.seat ? C.BLOCK.pass : x < C.NOZ.step ? C.NOZ.chamber : C.NOZ.orifice);
  const xs = [xf - 2.4, 14, 17, C.NOZ.seat, C.NOZ.seat, C.NOZ.step, C.NOZ.step, 58].filter((x, i, a) => i === 0 || x >= a[0]);
  const prof = xs.map((x, i) => [x, i > 0 && xs[i - 1] === x ? rg(x + 0.01) : rg(x - 0.01)]);
  out.melt = flat([...prof.map(([x, r]) => [x, Z + r]), ...prof.slice().reverse().map(([x, r]) => [x, Z - r])], 0, "hi", "gg-melt");
  // The ball on its seat, lifted by the melt's pressure, and the cut turns of the spring that pushes it back.
  const bx = C.NOZ.seat + 1.33 + S.ball, ball = Array.from({ length: 24 }, (_, i) => [bx + C.NOZ.ball * Math.cos((i / 24) * 6.283), Z + C.NOZ.ball * Math.sin((i / 24) * 6.283)]);
  const sa = bx + C.NOZ.ball, sb = C.NOZ.step, turns = [];
  for (let i = 0; i < 5; i++) { const x = sa + ((sb - sa) * (i + 0.3)) / 5; turns.push(at([x, 0, Z + 2.1]), at([x + (sb - sa) / 10, 0, Z - 2.1])); }
  out.ball = flat(ball, 0, "hi", "gg-steel") + K.dotsSvg([at([bx - 0.8, 0, Z + 0.9])], { size: 0.5, tone: "hi" });
  out.spring = K.dotsSvg(turns, { size: 0.55, tone: "mid" });
  const po = [[36, C.NOZ.chamber], [C.NOZ.step, C.NOZ.chamber], [C.NOZ.step, C.NOZ.orifice], [58, C.NOZ.orifice]];
  const mo = [...po.map(([x, r]) => [x, Z + r]), ...po.slice().reverse().map(([x, r]) => [x, Z - r])], md = K.pathOf(mo.map(([x, z]) => at([x, 0, z])), true), msh = ["", "", "", ""];
  if (C.TONE_Y < 4) msh[C.TONE_Y] = md;
  out.meltOut = K.solidSvg({ fill: md, outline: K.pathOf(mo.map(([x, z]) => at([x, 0, z]))), crease: "", top: C.TONE_Y === 4 ? md : "", shades: msh }, { tone: "hi", crease: "none", className: "gg-melt" });
  // The blob on the box's lid, and the rope of glue from the tip while it runs.
  const V = Math.max(0, S.blobV), a = Math.cbrt(V / 0.838), h = 0.4 * a, B = C.BOX, cx = C.BLOB_X;
  if (a > 0.6) {
    const Rs = (a * a + h * h) / (2 * h), pr = [];
    for (let i = 0; i <= 10; i++) { const s = (h * i) / 10; pr.push([s, Math.sqrt(Math.max(0, Rs * Rs - (Rs - h + s) ** 2)), i > 0 && i < 10 ? 1 : 0]); }
    pr[10][1] = 0;
    out.blob = K.solidSvg(K.solidOf(pr, K.frameAlong([cx, 0, B.z], [0, 0, 1]), P), { tone: "hi", crease: "none", className: "gg-melt" });
  } else out.blob = "";
  const rr = 1.0 * S.rope;
  if (rr > 0.08) {
    const p0 = [58.4, Z], p1 = [cx - 1, Z - 2], p2 = [cx, B.z + h * 0.9], line = [];
    for (let i = 0; i <= 14; i++) { const t = i / 14, q = [(1 - t) ** 2 * p0[0] + 2 * t * (1 - t) * p1[0] + t * t * p2[0], (1 - t) ** 2 * p0[1] + 2 * t * (1 - t) * p1[1] + t * t * p2[1]]; line.push(at([q[0], 0, q[1]])); }
    const w = rr * P.scale, L1 = [], L2 = [];
    for (let i = 0; i < line.length; i++) {
      const a0 = line[Math.max(0, i - 1)], a1 = line[Math.min(line.length - 1, i + 1)], dx = a1[0] - a0[0], dy = a1[1] - a0[1], l = Math.hypot(dx, dy) || 1, f = w * (1 - 0.25 * (i / 14));
      L1.push([line[i][0] - (dy / l) * f, line[i][1] + (dx / l) * f]); L2.push([line[i][0] + (dy / l) * f, line[i][1] - (dx / l) * f]);
    }
    const d = K.pathOf([...L1, ...L2.reverse()], true);
    out.rope = K.solidSvg({ fill: d, outline: d, crease: "", top: d, shades: ["", "", "", ""] }, { tone: "hi", crease: "none", className: "gg-melt" });
  } else out.rope = "";
  // The power strip's rocker.
  const W = C.STRIP, T = W.z + 10.8, on = S.rocker, x0 = W.x + 36, x1 = W.x + 45;
  const q = (y0, y1, z0, z1) => K.pathOf([[x0, y0, z0], [x1, y0, z0], [x1, y1, z1], [x0, y1, z1]].map(at), true);
  const plate = (d) => K.solidSvg({ fill: d, outline: d, crease: "", top: d, shades: ["", "", "", ""] }, { tone: "mid", crease: "none" });
  out.rocker = plate(q(W.y + 3.5, W.y + 8.5, T + 0.6 + 1.6 * on, T + 1.4)) + plate(q(W.y + 8.5, W.y + 13.5, T + 1.4, T + 0.6 + 1.6 * (1 - on))) +
    K.dotsSvg([at([(x0 + x1) / 2, W.y + 11, T + 1.2 + 0.6 * (1 - on)])], { size: 0.55, tone: on > 0.5 ? "lo" : "faint" });
  return out;
}
