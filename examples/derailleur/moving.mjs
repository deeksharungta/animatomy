// The parts that move, drawn from the model's state; serialized into the page, so they use only their arguments.
export function partsKit(K, P, C) {
  const at = (p) => K.iso(p, P);
  const sub = (a, b) => a.map((v, i) => v - b[i]), unit = (a) => { const l = Math.hypot(...a); return a.map((v) => v / l); };
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const frameY = (y) => K.frameOf([0, y, 0], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const polyY = (poly, y0, y1) => K.prismOf(frameY(y0), poly, 0, y1 - y0, P);
  const discY = (x, z, r, y0, y1) => K.disc(0, y1 - y0, r, K.frameOf([x, y0, z], [0, 1, 0], [1, 0, 0], [0, 0, 1]), P);
  const discA = (o, a, r, s0, s1) => K.disc(s0, s1, r, K.frameAlong(o, a), P);
  // A bar from a to b with a w by t section; up sets which way the w side faces.
  const bar3 = (a, b, w, t, up) => {
    const d = sub(b, a), len = Math.hypot(...d), dn = d.map((v) => v / len), u = unit(cross(dn, up)), v = cross(dn, u);
    return K.prismOf(K.frameOf(a, dn, u, v), [[-w, -t], [w, -t], [w, t], [-w, t]], 0, len, P);
  };
  // The hull of two circles in the x-z plane, for a cage plate.
  const stadium = (c1, c2, r) => Array.from({ length: 32 }, (_, i) => {
    const t = (i / 32) * Math.PI * 2, c = Math.cos(t) * (c2[0] - c1[0]) + Math.sin(t) * (c2[1] - c1[1]) > 0 ? c2 : c1;
    return [c[0] + r * Math.cos(t), c[1] + r * Math.sin(t)];
  });
  // A sprocket's teeth: a zigzag between tip and root circles on its outer face, turned to ang.
  const teeth = (x, z, y, r, n, ang) => K.pathOf(Array.from({ length: n * 2 }, (_, i) => {
    const a = ang + (i / (n * 2)) * Math.PI * 2, rr = i % 2 ? r - 1.6 : r + 1.9;
    return at([x + rr * Math.cos(a), y, z + rr * Math.sin(a)]);
  }), true);
  // A coil spring between two world points, split into the half behind its axis and the half in front.
  const coil = (a, b, r, turns) => {
    const d = sub(b, a), dn = unit(d), e1 = unit(cross(dn, Math.abs(dn[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0])), e2 = cross(dn, e1);
    const n = Math.round(turns * 16), back = [], front = [];
    let run = [], near = null;
    for (let i = 0; i <= n; i++) {
      const t = i / n, g = t * turns * Math.PI * 2, off = e1.map((v, j) => (v * Math.cos(g) + e2[j] * Math.sin(g)) * r);
      const p = at(a.map((v, j) => v + d[j] * t + off[j])), facing = K.depthOf(off, P) > 0;
      if (near === null) near = facing;
      if (facing !== near) { run.push(p); (near ? front : back).push(K.pathOf(run)); run = [p]; near = facing; continue; }
      run.push(p);
    }
    if (run.length > 1) (near ? front : back).push(K.pathOf(run));
    return { back: back.join(""), front: front.join("") };
  };
  return { at, sub, unit, cross, polyY, discY, discA, bar3, stadium, teeth, coil };
}

// The chain: one plate between each pair of rollers, inner and outer plates by turns, split into the run the
// derailleur holds and the run on the cassette, each in depth order.
export function chainSvg(K, P, C, S, Q, G, loop) {
  const out = { der: [], cas: [] }, n = C.LINKS, ph = ((S.s % C.PITCH) + C.PITCH) % C.PITCH;
  const rollers = Array.from({ length: n + 1 }, (_, i) => G.pointAt(loop, (ph + i * C.PITCH) % loop.total));
  const plates = [];
  for (let i = 0; i < n; i++) {
    const a = rollers[i], b = rollers[i + 1];
    if (a.p[0] < -260 && b.p[0] < -260) continue;
    const outer = (i + Math.floor(S.s / C.PITCH)) % 2 === 0, h = outer ? 3.9 : 3.5, dy = outer ? 3 : 2;
    const d = [b.p[0] - a.p[0], b.p[2] - a.p[2]], l = Math.hypot(d[0], d[1]) || 1, u = [d[0] / l, d[1] / l], nn = [-u[1], u[0]];
    const pts = [];
    for (const [c, s0] of [[a.p, 1], [b.p, -1]]) for (let k = 0; k <= 6; k++) {
      const t = (k / 6) * Math.PI, cx = nn[0] * Math.cos(t) * s0 - u[0] * Math.sin(t) * s0, cz = nn[1] * Math.cos(t) * s0 - u[1] * Math.sin(t) * s0;
      pts.push(Q.at([c[0] + h * cx, c[1] + dy, c[2] + h * cz]));
    }
    const d3 = K.depthOf([(a.p[0] + b.p[0]) / 2, (a.p[1] + b.p[1]) / 2 + dy, (a.p[2] + b.p[2]) / 2], P) + (outer ? 0.5 : 0);
    plates.push({ der: a.der && b.der, d3, html: `<path class="${outer ? "iso-top" : "iso-shade"}" data-shade="1" d="${K.pathOf(pts, true)}"/><path class="iso-line iso-edge" data-tone="${outer ? "mid" : "lo"}" d="${K.pathOf(pts, true)}"/>` });
    if (outer) for (const c of [a.p, b.p]) plates.push({ der: a.der && b.der, d3: d3 + 0.1, html: K.dotsSvg([Q.at([c[0], c[1] + dy + 0.4, c[2]])], { size: 0.9, tone: "lo" }) });
  }
  plates.sort((x, y) => x.d3 - y.d3);
  for (const pl of plates) (pl.der ? out.der : out.cas).push(pl.html);
  return { der: `<g class="iso-solid bk-chain">${out.der.join("")}</g>`, cas: `<g class="iso-solid bk-chain">${out.cas.join("")}</g>` };
}
