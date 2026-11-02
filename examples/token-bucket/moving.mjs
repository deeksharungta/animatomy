// The parts that move, drawn from the model's state. Serialized into the page, so it uses only K, P, C and S.
export function dynamic(K, P, C, S) {
  const at = (p) => K.iso(p, P);
  const out = {};
  const lerp = (a, b, s) => a.map((v, i) => v + (b[i] - v) * s);
  const coin = (body) => `<g class="tb-token">${body}</g>`;
  // A token sunk in a pocket shows only its face, flush with the part around it.
  const flat = ([x, y, z], lit = false, sunk = false) => coin(K.solidSvg(sunk ? K.cylinder(x, y, C.TR, z + C.TH - 0.25, 0.25, P, 36) : K.cylinder(x, y, C.TR, z, C.TH, P, 36, 0.3), { tone: "hi", lit }) + K.lineSvg(K.ring(x, y, C.TR - 1.4, z + C.TH, P, 36), { tone: "mid" }));
  const tilted = (p, n) => coin(K.solidSvg(K.disc(0, C.TH, C.TR, K.frameAlong(p, n), P), { tone: "hi" }));
  const byDepth = (list) => list.sort((a, b) => K.depthOf(a.p, P) - K.depthOf(b.p, P));
  const jit = [[0, 0], [2.6, -1.8], [-2.2, 2], [1.4, 2.6], [-2.6, -2], [2.2, 1.2], [-1, -2.8], [0.6, 2.2]];
  const pile = (cx, cy, z0, n, step) => Array.from({ length: n }, (_, i) => flat([cx + jit[i % 8][0], cy + jit[i % 8][1], z0 + i * step])).join("");

  // The feeder disc: pockets carry a token each from under the hopper round to the hole.
  const [fx, fy] = C.F, zt = C.PLATE_Z + 8;
  const pockets = [0, 1, 2, 3].map((i) => { const a = S.disc + (i * Math.PI) / 2; return { a, p: [fx + C.POCKET_R * Math.cos(a), fy + C.POCKET_R * Math.sin(a), zt] }; });
  const teeth = [];
  for (let i = 0; i < 32; i++) { const a = S.disc + (i / 32) * Math.PI * 2; teeth.push(K.segment([fx + 17.4 * Math.cos(a), fy + 17.4 * Math.sin(a), zt], [fx + 20 * Math.cos(a), fy + 20 * Math.sin(a), zt], P)); }
  out.disc = K.lineSvg(teeth.join(""), { tone: "mid" })
    + byDepth(pockets).map((q) => (Math.cos(q.a) > 1e-6 ? flat([q.p[0], q.p[1], zt - C.TH], false, true) : `<path class="tb-void" d="${K.ring(q.p[0], q.p[1], C.TR + 0.3, zt, P, 36)}"/>`)).join("");
  out.pinion = K.lineSvg(K.ribsOf(K.frameAlong([C.SHAFT.x1 - 6, C.SHAFT.y, C.SHAFT.z], [1, 0, 0]), 0, 6, C.PIN_R + 0.02, 8, P, { phase: S.crank, seams: true }), { tone: "mid" });

  // Mo's crank: a hub on the shaft, an arm, and a knob that points back toward Mo.
  const th = S.crank, r = C.CRANK.r, cx = C.CRANK.x, d = [0, Math.cos(th), Math.sin(th)];
  const hub = [cx, C.SHAFT.y, C.SHAFT.z], end = [cx, C.SHAFT.y + r * d[1], C.SHAFT.z + r * d[2]];
  const arm = K.prismOf(K.frameOf(hub, d, [1, 0, 0], K.cross3(d, [1, 0, 0])), [[-0.9, -1.1], [0.9, -1.1], [0.9, 1.1], [-0.9, 1.1]], 0, r, P);
  const knob = K.prismOf(K.frameOf(end, [-1, 0, 0], [0, 1, 0], [0, 0, 1]), Array.from({ length: 10 }, (_, i) => [1.1 * Math.cos(i * 0.628), 1.1 * Math.sin(i * 0.628)]), 0.9, 5.6, P);
  out.crank = K.solidSvg(K.disc(-1, 1, 2.6, K.frameAlong(hub, [1, 0, 0]), P), { tone: "hi" }) + K.solidSvg(arm, { tone: "hi", lit: S.duty === "mo" })
    + K.solidSvg(knob, { tone: "hi" }) + K.solidSvg(K.sphereOf([cx - 6.2, end[1], end[2]], 1.6, P, { steps: 16 }), { tone: "hi" });

  // Tokens sliding down the feed chute (under the plate until they come out at its edge).
  out.feed = S.fly.filter((f) => f.slot === "feed").map((f) => tilted(f.p, f.n)).join("");
  // The stack in the tube, resting on the slide (lifted one token while its pocket is out), and a token dropping in.
  const zs = C.ZB + S.lift, list = [];
  for (let i = 0; i < S.stack; i++) list.push(flat([0, 0, zs + i * C.TH], S.duty === "" && i === S.stack - 1, i === 0 && S.lift === 0));
  for (const f of S.fly.filter((q) => q.slot === "in")) {
    const zTop = zs + S.stack * C.TH, z = f.p[2] + (zTop - f.p[2]) * Math.min(1, Math.max(0, f.drop) ** 2);
    list.push(flat([0, f.p[1], z]));
  }
  out.stack = list.join("");
  out.pocket = S.pocket ? flat([S.pocket.x, 0, C.ZB], false, true) : "";
  out.over = S.fly.filter((f) => f.slot === "over").map((f) => tilted(f.p, f.n)).join("");

  // The flap: a see-saw on the pivot rod. A token in its cup tips it front-down, to Served.
  const [, py, pz] = C.PV, ct = Math.cos(S.tilt), st = Math.sin(S.tilt);
  const fp = (x, u, v) => [x, py + u * ct - v * st, pz + u * st + v * ct];
  const n = [0, -st, ct];
  const FR = (x) => K.frameOf(fp(x, 0, 0), [1, 0, 0], [0, ct, st], n);
  const box = (x0, x1, u0, u1, v0, v1) => K.prismOf(FR(x0), [[u0, v0], [u1, v0], [u1, v1], [u0, v1]], 0, x1 - x0, P);
  const F = C.FLAP, A = C.ARM;
  const tok = S.cupTok.map((c) => {
    const cup = fp(C.CUP[0], C.CUP[1], 2.8);
    if (c.out == null) return { p: lerp([C.SLIDE.stroke, 0, C.ZB], cup, c.fall), n: lerp([0, 0, 1], n, c.fall) };
    const lip = fp(C.CUP[0], A.u1 + 3, 2.8);
    if (c.out < 0.5) return { p: lerp(cup, lip, c.out * 2), n };
    const k2 = S.cash, land = [C.CASH.x + 10 + [0, 2.6, -2.2, 1.4, -2.6, 2.2, -1, 0.6][k2 % 8], C.CASH.y + 10 + [0, -1.8, 2, 2.6, -2, 1.2, -2.8, 2.2][k2 % 8], C.FLOOR + 1.2 + k2 * 1.3];
    return { p: lerp(lip, land, (c.out - 0.5) * 2), n: lerp(n, [0, 0, 1], (c.out - 0.5) * 2), fall: true };
  });
  out.flap = K.solidSvg(box(34, 46, F.u0, F.u0 + 4, -3.6, 1.1), { tone: "mid" })
    + K.solidSvg(box(F.x0, F.x1, F.u0, F.u1, 1.1, 2.2), { tone: "hi", inner: K.lineSvg(K.segment(fp(F.x0 + 2, F.u0 + 2, 2.2), fp(F.x1 - 2, F.u0 + 2, 2.2), P) + K.segment(fp(F.x0 + 2, F.u1 - 2, 2.2), fp(F.x1 - 2, F.u1 - 2, 2.2), P), { tone: "faint", free: true }) })
    + K.solidSvg(box(A.x0, A.x1, A.u0, A.u1, 1.1, 2.2), { tone: "hi" })
    + K.solidSvg(box(A.x0, A.x0 + 0.7, A.u0, A.u1, 2.2, 3.8), { tone: "mid" }) + K.solidSvg(box(A.x0, A.x1, A.u0, A.u0 + 0.7, 2.2, 3.8), { tone: "mid" })
    + tok.filter((t) => !t.fall).map((t) => tilted(t.p, t.n)).join("")
    + K.solidSvg(box(A.x1 - 0.7, A.x1, A.u0, A.u1, 2.2, 3.8), { tone: "mid" })
    + K.dotsSvg([at(fp(F.x0 + 1.4, F.u0 + 1.4, 2.2)), at(fp(F.x1 - 1.4, F.u0 + 1.4, 2.2)), at(fp(F.x1 - 1.4, F.u1 - 1.4, 2.2)), at(fp(F.x0 + 1.4, F.u1 - 1.4, 2.2))], { size: 0.45 });
  out.cashFly = tok.filter((t) => t.fall).map((t) => tilted(t.p, t.n)).join("");
  out.cash = pile(C.CASH.x + 10, C.CASH.y + 10, C.FLOOR + 1.2, S.cash, 1.3);
  out.spill = pile(C.SPILL.x + 8, C.SPILL.y + 7, C.FLOOR + 1.2, S.spill, 1.8);

  // Envelopes: down the chute from the slot, then off the flap's front (Served) or back (Refused) end.
  const E = C.ENV, ca = C.CHUTE.a, cb = C.CHUTE.b, len = Math.hypot(cb[1] - ca[1], cb[2] - ca[2]), bc = Math.atan2(ca[2] - cb[2], cb[1] - ca[1]);
  const env = (p, beta, s0 = -E.l / 2, lit = false) => {
    const dir = [0, Math.cos(beta), -Math.sin(beta)], up = [0, Math.sin(beta), Math.cos(beta)];
    const Fe = K.frameOf(p, dir, [1, 0, 0], up), pt = (s, u) => at(K.pointOf(Fe, s, 0, 0).map((v, i) => v + [u, 0, 0][i] + up[i] * E.t));
    const body = K.prismOf(Fe, [[-E.w / 2, 0], [E.w / 2, 0], [E.w / 2, E.t], [-E.w / 2, E.t]], s0, E.l / 2, P);
    const v = s0 > -E.l / 2 + 0.5 ? "" : K.lineSvg(K.pathOf([pt(-E.l / 2, -E.w / 2), pt(-E.l / 2 + E.l * 0.45, 0), pt(-E.l / 2, E.w / 2)]), { tone: "mid" });
    return K.solidSvg(body, { tone: "hi", lit, inner: v });
  };
  const stackAt = (c, i) => [c[0] + jit[i % 8][0] * 0.4, c[1] + jit[i % 8][1] * 0.4, C.FLOOR + 1.2 + i * 1.1];
  const served = [C.SERVED.x + C.SERVED.w / 2, C.SERVED.y + C.SERVED.d / 2], refused = [C.REFUSED.x + C.REFUSED.w - 8, C.REFUSED.y + C.REFUSED.d / 2];
  out.servedPile = Array.from({ length: S.served }, (_, i) => env(stackAt(served, i), 0)).join("");
  out.refusedPile = Array.from({ length: S.refused }, (_, i) => env(stackAt(refused, i), 0)).join("");
  const bez = (a, m, b, s) => a.map((v, i) => (1 - s) * (1 - s) * v + 2 * s * (1 - s) * m[i] + s * s * b[i]);
  out.env = S.env.map((e) => {
    if (e.seg === "chute") {
      const sc = -E.l / 2 + e.u * (len + E.l / 2), p = [ca[0], ca[1] + (sc * (cb[1] - ca[1])) / len, ca[2] + (sc * (cb[2] - ca[2])) / len];
      return env(p, bc, Math.max(-E.l / 2, -sc));
    }
    const ok = e.seg === "served", mid = fp(ca[0], ok ? 4 : -7, 2.2), end = stackAt(ok ? served : refused, e.i);
    const beta = e.u < 0.5 ? bc + (-S.tilt - bc) * e.u * 2 : -S.tilt * (1 - (e.u - 0.5) * 2);
    return env(bez(cb, mid, end, e.u), beta);
  }).join("");
  return out;
}
