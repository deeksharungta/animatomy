// The parts that move, drawn from the model's state. Serialized into the page, so it uses only K, P, C and S.
export function dynamic(K, P, C, S) {
  const at = (p) => K.iso(p, P), out = {};
  const add = (a, b, s = 1) => a.map((v, i) => v + b[i] * s);
  const unit = (v) => { const l = Math.hypot(...v); return v.map((x) => x / l); };
  // A round-ended flat bar from a to b, t thick along `across`.
  const bar = (a, b, w, t, across, tone = "hi", lit = false) => {
    const d = unit(b.map((v, i) => v - a[i])), len = Math.hypot(...b.map((v, i) => v - a[i])), F = K.frameOf(a, across, d, K.cross3(across, d));
    const cap = (c, a0) => Array.from({ length: 9 }, (_, i) => { const q = a0 + (i / 8) * Math.PI; return [c + (w / 2) * Math.cos(q), (w / 2) * Math.sin(q)]; });
    return K.solidSvg(K.prismOf(F, [...cap(0, Math.PI / 2), ...cap(len, -Math.PI / 2)], -t / 2, t / 2, P), { tone, lit });
  };
  const pin = (c, axis, r, len, tone = "hi") => K.solidSvg(K.disc(-len / 2, len / 2, r, K.frameAlong(c, axis), P), { tone, crease: "lo" });
  const ball = (c, lit = false) => `<g class="db-ball">${K.solidSvg(K.sphereOf(c, C.BALL_R, P, { steps: 24 }), { tone: "hi", lit })}</g>`;

  // The rock shaft's arms: the paddle in front, the lift arm behind under the pushrod.
  const phi = -C.A + 2 * C.A * S.q, RS = [0, C.RS.y, C.RS.z];
  const front = [0, Math.cos(phi), -Math.sin(phi)], nF = [0, Math.sin(phi), Math.cos(phi)], back = [0, -Math.cos(phi), Math.sin(phi)];
  const hub = (x) => [x, RS[1], RS[2]];
  const tipF = add(hub(C.PAD_X), front, C.PAD_L), tipB = add(hub(C.LIFT_X), back, C.LIFT_L);
  const cup = add(tipF, nF, 1.2), cupBall = add(cup, nF, C.BALL_R - 0.6);
  out.paddle = bar(hub(C.PAD_X - 2), add(tipF, [-2, 0, 0]), 3, 1.2, [1, 0, 0], "hi", S.duty === "" && S.q > 0.01)
    + bar(hub(C.PAD_X + 2), add(tipF, [2, 0, 0]), 3, 1.2, [1, 0, 0])
    + pin(hub(C.PAD_X), [1, 0, 0], 2.6, 6, "mid")
    + K.solidSvg(K.disc(-1.2, 0, 4.4, K.frameAlong(cup, nF), P), { tone: "hi" })
    + K.solidSvg(K.ringBand(0, 1.3, 3.3, 4.4, K.frameAlong(cup, nF), P), { tone: "mid" });
  out.lift = pin(hub(C.LIFT_X), [1, 0, 0], 2.6, 4.4, "mid") + bar(hub(C.LIFT_X), tipB, 3, 2, [1, 0, 0]) + pin(tipB, [1, 0, 0], 1.3, 4.2);
  // The balls: down the rail, into the cup, and over the lip into the bin.
  const ra = C.RAIL.a, rb = C.RAIL.b, rd = unit(rb.map((v, i) => v - ra[i])), up = K.cross3(unit([rd[1], -rd[0], 0]), rd);
  const lip = add(add(tipF, front, 5), nF, 3);
  const spot = (i) => [C.BIN.x + 5 + (i % 3) * 7.4, C.BIN.y + 4.6 + (Math.floor(i / 3) % 2) * 6.6, C.FLOOR + 1.2 + C.BALL_R + Math.floor(i / 6) * 5.4];
  const bez = (a, m, b, s) => a.map((v, i) => (1 - s) * (1 - s) * v + 2 * s * (1 - s) * m[i] + s * s * b[i]);
  const list = S.balls.map((b) => {
    if (b.seg === "rail") return { slot: "rail", p: add(ra.map((v, i) => v + (rb[i] - v) * b.u), up, 2.4) };
    if (b.seg === "cup") return { slot: "cup", p: cupBall.map((v, i) => v + (lip[i] - v) * b.u) };
    const end = spot(b.i);
    return { slot: "spill", p: bez(lip, [end[0], end[1] - 4, lip[2] + 1], end, b.u) };
  });
  out.rail = list.filter((b) => b.slot === "rail").sort((a, b) => K.depthOf(a.p, P) - K.depthOf(b.p, P)).map((b) => ball(b.p)).join("");
  out.cup = list.filter((b) => b.slot !== "rail").map((b) => ball(b.p)).join("");
  out.pile = Array.from({ length: S.keys }, (_, i) => spot(i)).sort((a, b) => K.depthOf(a, P) - K.depthOf(b, P)).map((p) => ball(p)).join("");

  // The hammer: a hub on its pin, the stem down to the striker, and the forked tail round the trip rod.
  const th = S.ham, [hx, , hz] = C.HP, hy = C.HP[1];
  const sd = [-Math.sin(th), 0, -Math.cos(th)], head = [hx + C.STEM * sd[0], hy, hz + C.STEM * sd[2]], ha = [Math.cos(th), 0, -Math.sin(th)];
  const tp = (y, u) => [hx - u * Math.cos(th), y, hz + u * Math.sin(th)];
  const ty = C.TRIP[1], tine = (y) => bar(tp(y, 0), tp(y, C.TAIL), 1.6, 1.1, [0, 1, 0]);
  const sleeve = K.solidSvg(K.disc(0, hy + 1 - ty + 2.6, 1.9, K.frameAlong([hx, ty - 2.6, hz], [0, 1, 0]), P), { tone: "mid", crease: "lo" });
  out.hammer = tine(ty - 1.9);
  out.hammerFront = tine(ty + 1.9) + sleeve + bar([hx, hy, hz], head, 2.2, 1.4, [0, 1, 0], "hi", S.duty === "knock")
    + K.solidSvg(K.disc(-2.6, 2.6, C.HEAD_R, K.frameAlong(head, ha), P), { tone: "hi", crease: "lo" })
    + K.solidSvg(K.disc(C.CATCH_Y - hy, 1, 0.9, K.frameAlong(add([hx, hy, hz], sd, C.PIN_AT), [0, 1, 0]), P), { tone: "hi", crease: "lo" });
  out.head = add(head, ha, -C.HEAD_R - 0.4);
  out.catchPin = add([hx, C.CATCH_Y + 0.4, hz], sd, C.PIN_AT);
  // The sear lever: the trip rod's foot presses its left end; its right end carries Pinch's platform.
  const Se = C.SEAR, al = Math.asin((1.5 * S.press) / Se.left), cs = Math.cos(al), sn = Math.sin(al);
  const lp = (u) => [Se.x + u * cs, Se.y, Se.z - u * sn];
  out.sear = bar(lp(-Se.arm), lp(Se.right), 2.4, 1.6, [0, 1, 0]) + pin([Se.x, Se.y, Se.z], [0, 1, 0], 1.4, 3);
  const pf = lp(Se.plat);
  const fr = (o) => K.frameOf(o, [0, 1, 0], [cs, 0, -sn], [sn, 0, cs]), RISE = 11;
  const PY = Se.py;
  out.platform = K.solidSvg(K.prismOf(fr([pf[0], PY, pf[2]]), [[-1, 0], [1, 0], [1, RISE + 1.2], [-1, RISE + 1.2]], 0, 1.6, P), { tone: "mid" })
    + K.solidSvg(K.prismOf(fr([pf[0], PY - 0.4, pf[2]]), [[-1, 0], [1, 0], [1, 1.2], [-1, 1.2]], 0, Se.y - PY + 0.4, P), { tone: "mid" })
    + K.solidSvg(K.prismOf(fr([pf[0] + sn * RISE, PY - 3, pf[2] + cs * RISE]), [[-2.6, 0], [2.6, 0], [2.6, 1.2], [-2.6, 1.2]], 0, 6, P), { tone: "hi" });
  out.stand = [pf[0] + sn * (RISE + 1.2), PY, pf[2] + cs * (RISE + 1.2) + 1];

  // The rod above the gland, the piston in the oil and its rod up to the cap.
  const [dx, dy] = C.DP, zc = C.ZC0 + S.zc, zp = zc - C.ROD;
  out.rodUp = K.solidSvg(K.cylinder(dx, dy, 1.4, C.Z_TOP + 8, zc - C.Z_TOP - 8, P, 16), { tone: "hi" });
  out.piston = K.solidSvg(K.cylinder(dx, dy, 1.4, zp, C.Z_TOP - zp, P, 16), { tone: "hi" })
    + K.solidSvg(K.cylinder(dx, dy, C.GLASS_R - 0.6, zp - C.PISTON_H, C.PISTON_H, P, 40, 0.3), { tone: "hi" })
    + K.lineSvg(K.sideArc(dx, dy, C.GLASS_R - 0.6, zp - C.PISTON_H + 1.6, P), { tone: "faint" });
  out.xhead = K.translateAlong(P, [0, 0, S.zc]);
  out.push = K.translateAlong(P, [0, 0, Math.max(0, C.TRAVEL * (Math.sin(phi) + Math.sin(C.A)) / (2 * Math.sin(C.A)))]);
  out.bell = S.ring > 0.01 ? `translate(${(S.ring * 0.5 * Math.sin(S.t * 900)).toFixed(2)},0)` : "";
  return out;
}
