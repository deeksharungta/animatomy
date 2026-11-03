// The parts that move, drawn from the model's state. These are serialized into the page, so they use only
// their arguments: K (the kit and lathe), P, C, the state S, the helpers from partsKit and the mechanism M.
export function partsKit(K, P, C) {
  const at = (p) => K.iso(p, P);
  const frame = (x, y, z) => K.frameOf([x, y, z], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const flat = (poly, y0, y1) => K.prismOf(frame(0, 0, 0), poly, y0, y1, P);
  const disc = (x, z, r, y0, y1) => K.disc(0, y1 - y0, r, frame(x, y0, z), P);
  const rot = (poly, a, c = [0, 0]) => poly.map(([u, v]) => [c[0] + u * Math.cos(a) - v * Math.sin(a), c[1] + u * Math.sin(a) + v * Math.cos(a)]);
  const bar = (a, b, w0, w1, y0, y1) => {
    const d = [b[0] - a[0], b[1] - a[1]], len = Math.hypot(d[0], d[1]), n = [-d[1] / len, d[0] / len];
    return flat([[a[0] + n[0] * w0, a[1] + n[1] * w0], [b[0] + n[0] * w1, b[1] + n[1] * w1], [b[0] - n[0] * w1, b[1] - n[1] * w1], [a[0] - n[0] * w0, a[1] - n[1] * w0]], y0, y1);
  };
  const ngon = (r, n, a) => Array.from({ length: n }, (_, i) => [r * Math.cos(a + (i / n) * Math.PI * 2), r * Math.sin(a + (i / n) * Math.PI * 2)]);
  // A coil spring between two x-z points in the plane y, split into the half behind its axis and the half in front.
  const coil = (a, b, y, r, turns) => {
    const n = Math.round(turns * 16), back = [], front = [], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const nx = -(b[1] - a[1]) / len, nz = (b[0] - a[0]) / len;
    let run = [], near = null;
    for (let i = 0; i <= n; i++) {
      const t = i / n, ang = t * turns * Math.PI * 2, cs = Math.cos(ang), sn = Math.sin(ang);
      const p = at([a[0] + (b[0] - a[0]) * t + nx * cs * r, y + sn * r, a[1] + (b[1] - a[1]) * t + nz * cs * r]);
      const facing = K.depthOf([nx * cs, sn, nz * cs], P) > 0;
      if (near === null) near = facing;
      if (facing !== near) { run.push(p); (near ? front : back).push(K.pathOf(run)); run = [p]; near = facing; continue; }
      run.push(p);
    }
    if (run.length > 1) (near ? front : back).push(K.pathOf(run));
    return K.lineSvg(back.join(""), { tone: "lo" }) + K.lineSvg(front.join(""), { tone: "hi" });
  };
  return { at, flat, disc, rot, bar, ngon, coil };
}

export function drawn(K, P, C, S, Q, M) {
  const out = {}, W = C.WHEEL, th = S.th, solid = K.solidSvg;
  // The key outside: a flat wing on the spindle's square, turned by you.
  const Ky = C.KEY, kw = [[-Ky.len, -Ky.w * 0.55], [-Ky.len + 2.6, -Ky.w], [Ky.len - 2.6, -Ky.w], [Ky.len, -Ky.w * 0.55], [Ky.len, Ky.w * 0.55], [Ky.len - 2.6, Ky.w], [-Ky.len + 2.6, Ky.w], [-Ky.len, Ky.w * 0.55]];
  out.key = solid(Q.flat(Q.rot(kw, th), Ky.y - Ky.t, Ky.y), { tone: "hi" });
  const sq = Q.rot([[-C.SPIN.half, -C.SPIN.half], [C.SPIN.half, -C.SPIN.half], [C.SPIN.half, C.SPIN.half], [-C.SPIN.half, C.SPIN.half]], th);
  out.spinOut = solid(Q.flat(sq, Ky.y + 10, -C.DOOR.t - C.ROSE.t), { tone: "hi" });
  // The star wheel: six sawtooth teeth round a disc, each a steep face then a long ramp.
  const teeth = [];
  for (let i = 0; i < W.n; i++) {
    const b = i * C.T + th, pt = (r, a) => [r * Math.cos(a), r * Math.sin(a)];
    const poly = [pt(W.root - 1.4, b), pt(W.root, b), pt(W.tip, b + W.steep * C.T), pt(W.root, b + C.T), pt(W.root - 1.4, b + C.T)];
    teeth.push(solid(Q.flat(poly, W.y, W.y + W.t), { tone: "hi", lit: S.lit === "wheel" }));
  }
  out.wheel = teeth.join("") + solid(Q.disc(0, 0, W.root - 0.2, W.y, W.y + W.t), { tone: "hi", crease: "lo" }) +
    solid(Q.disc(0, 0, W.hub, W.y + W.t, W.y + W.t + 0.8), { tone: "hi", crease: "lo" });
  const N = C.NUT;
  out.nut = solid(Q.flat(Q.ngon(N.r, 6, th + Math.PI / 6), N.y, N.y + N.h), { tone: "hi" }) + solid(Q.flat(sq, N.y + N.h, C.SPIN.y1), { tone: "mid" });
  // The hammer: a stem from its pivot up to the ball head at the gong, and a tail that rides the teeth.
  const H = C.HAM, hp = M.hammerAt(C, S.a), y0 = H.y, y1 = H.y + H.t;
  out.hammer = solid(Q.bar(H.pivot, hp.tail, 1.5, 1.1, y0, y1), { tone: "hi" }) + solid(Q.bar(H.pivot, hp.head, 1.8, 1.1, y0, y1), { tone: "hi" }) +
    solid(Q.disc(hp.spring[0], hp.spring[1], 1.6, y1, y1 + 0.6), { tone: "mid" }) +
    solid(Q.disc(H.pivot[0], H.pivot[1], 3.4, y0 - 0.4, y1 + 0.4), { tone: "hi", crease: "lo" }) + solid(Q.disc(H.pivot[0], H.pivot[1], 2, y1 + 0.4, y1 + 1.4), { tone: "mid" });
  out.hammer = solid(Q.disc(hp.tail[0], hp.tail[1], C.PIN, W.y + 0.4, y0), { tone: "hi", crease: "lo" }) + out.hammer;
  out.head = solid(K.sphereOf([hp.head[0], y0 + H.t / 2, hp.head[1]], H.head, P), { tone: "hi" });
  const post = [C.SPRING.post, M.hammerAt(C, 0).spring[1]];
  out.hspring = Q.coil([hp.spring[0] + 1.2, hp.spring[1]], post, y0 + H.t / 2, C.SPRING.r, C.SPRING.turns);
  // The click: an arm hanging from its stud whose nose rides the teeth and drops in behind each steep face.
  const Ck = C.CLICK, tipV = M.turn(Ck.arm, S.c), tip = [Ck.pivot[0] + tipV[0], Ck.pivot[1] + tipV[1]];
  const cy0 = Ck.y, cy1 = Ck.y + Ck.t;
  const tv = M.turn(Ck.tail, S.c), tail = [Ck.pivot[0] + tv[0], Ck.pivot[1] + tv[1]];
  out.click = solid(Q.bar(Ck.pivot, tail, 1.6, 1.3, cy0, cy1), { tone: "hi" }) + solid(Q.disc(tail[0], tail[1], 1.9, cy0 - 0.3, cy1 + 0.3), { tone: "hi", crease: "lo" }) +
    solid(Q.bar(Ck.pivot, tip, 1.7, 0.9, cy0, cy1), { tone: "hi" }) +
    solid(Q.disc(Ck.pivot[0], Ck.pivot[1], 3, cy0 - 0.4, cy1 + 0.4), { tone: "hi", crease: "lo" }) + solid(Q.disc(Ck.pivot[0], Ck.pivot[1], 1.8, cy1 + 0.4, cy1 + 1.4), { tone: "mid" });
  out.click = solid(Q.disc(tip[0], tip[1], C.PIN, W.y + 0.4, cy0), { tone: "hi", crease: "lo" }) + out.click;
  const cs = [Ck.pivot[0] + tipV[0] * C.CSPRING.at, Ck.pivot[1] + tipV[1] * C.CSPRING.at];
  const cs0 = Ck.pivot[0] + Ck.arm[0] * C.CSPRING.at;
  out.cspring = Q.coil([cs[0], cs[1] + 1.4], [cs0, C.CSPRING.post], cy0 + Ck.t / 2, C.CSPRING.r, C.CSPRING.turns);
  // Where the crew's paws and beak land.
  out.stem = [H.pivot[0], y1, H.pivot[1], hp.head[0], hp.head[1]];
  out.beak = [hp.head[0] + 2.6, y0 + H.t / 2 + 2.9, hp.head[1] + 1.4];
  out.claws = [[tail[0] - 1.2, cy1 + 0.6, tail[1] + 1.2], [tail[0] + 1.4, cy1 + 0.6, tail[1] - 0.8]];
  return out;
}
