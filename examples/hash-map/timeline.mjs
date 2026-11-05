// The whole run as a schedule, and the machine at any moment of it. Serialized into the page as they stand, so they
// use only C, E and t.

// Every job in time order: the letter drops, Knock zeroes the counter if it isn't at 0, Rocky turns the crank once per
// unit of each letter, then Nib files the letter (put) or searches its hole (get).
export function planOf(C) {
  const T = C.T, xc = (i) => i * C.PITCH + C.WALL + (C.PITCH - C.WALL) / 2;
  const stacks = C.PREFILL.map(() => []), jobs = [], resets = [];
  let t = T.start, th = 0, nibFree = 0;
  const reset = (r0) => {
    const m = ((th % 8) + 8) % 8, to = m >= 4 ? th + 8 - m : th - m;
    if (!m) return r0;
    resets.push({ t0: r0, from: th, to }); th = to;
    return r0 + T.reset + 0.15;
  };
  for (const [j, job] of C.JOBS.entries()) {
    const J = { ...job, j, drop: t };
    let c = reset(t + T.drop + 0.1);
    J.c0 = c; J.th0 = th; J.strokes = []; J.chars = [];
    for (const [ci, ch] of [...job.key].entries()) {
      const v = ch.charCodeAt(0) - 64;
      J.chars.push({ ch, v, t0: c });
      for (let s = 0; s < v; s++) { J.strokes.push(c); c += T.stroke; }
      if (ci < job.key.length - 1) c += T.gap;
    }
    J.sum = J.chars.reduce((a, q) => a + q.v, 0); J.h = J.sum % 8; th += J.sum; J.countEnd = c;
    const pa = C.NIB_PATH, n = pa.length, dist = pa.slice(1, n - 1).reduce((l, q, i) => l + Math.hypot(q[0] - pa[i][0], q[1] - pa[i][1]), 0) + pa[n - 2][0] - xc(J.h) - C.STAND_DX;
    let p = Math.max(c + 0.2, nibFree);
    if (job.kind === "put") {
      J.pick = p; J.out = p + T.pick; J.arrive = J.out + dist / T.walk;
      J.slide = J.arrive; J.slideEnd = J.slide + T.slide; J.level = stacks[J.h].push(j) - 1 + C.PREFILL[J.h];
      J.home = J.slideEnd + dist / T.back; nibFree = J.home + 0.1;
      t = J.slideEnd;
    } else {
      J.out = p; J.arrive = p + dist / T.walk; J.cmps = [];
      let q = J.arrive;
      const list = [...stacks[J.h]].reverse();
      for (const [n, idx] of list.entries()) {
        const hit = C.JOBS[idx].key === job.key;
        J.cmps.push({ t0: q, idx, hit, level: C.PREFILL[J.h] + stacks[J.h].length - 1 - n });
        q += hit ? T.pull : T.cmp;
        if (hit) { J.found = idx; break; }
      }
      J.pullEnd = q; J.home = q + dist / T.walk; J.putEnd = J.home + T.put; nibFree = J.putEnd;
      t = J.putEnd;
    }
    jobs.push(J);
  }
  const fin = reset(t + 0.2);
  return { jobs, resets, end: fin + T.tail, stacks };
}

// The machine at model time t: the shaft's angle in clicks, the crank, Knock's strike, Nib and every moving letter.
export function stateAt(C, E, t) {
  const T = C.T, cl = (v) => Math.max(0, Math.min(1, v)), ease = (v) => { const x = cl(v); return x * x * (3 - 2 * x); };
  const xc = (i) => i * C.PITCH + C.WALL + (C.PITCH - C.WALL) / 2, pa = C.NIB_PATH;
  // Nib's way along the ledge, by distance from home: the point and the way out.
  const along = (s) => {
    for (let i = 1; i < pa.length; i++) {
      const a = pa[i - 1], b = pa[i], l = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (s <= l || i === pa.length - 1) { const f = cl(s / l); return { p: [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f], dir: [(b[0] - a[0]) / l, (b[1] - a[1]) / l] }; }
      s -= l;
    }
  };
  const standOf = (J) => pa.slice(1, pa.length - 1).reduce((l, q, i) => l + Math.hypot(q[0] - pa[i][0], q[1] - pa[i][1]), 0) + pa[pa.length - 2][0] - xc(J.h) - C.STAND_DX;
  // The star wheel turns only while the crank's pin is in one of its slots: the middle 135° of each turn.
  const lam = Math.sin(Math.PI / 8), lim = Math.PI / 2 - Math.PI / 8;
  const click = (v) => { const a = -Math.PI + 2 * Math.PI * cl(v); if (a <= -lim) return 0; if (a >= lim) return 1; return (Math.atan2(lam * Math.sin(a), 1 - lam * Math.cos(a)) + Math.PI / 8) / (Math.PI / 4); };
  const S = { t, th: 0, alpha: Math.PI, strike: 0, duty: "", letters: [], nib: { s: 0, phase: "idle", walk: 0 }, read: null };
  for (const r of E.resets) {
    S.th += (r.to - r.from) * ease((t - r.t0) / T.reset);
    const u = t - r.t0;
    if (u > -T.wind && u < T.reset) { S.strike = u < 0 ? -(u + T.wind) / T.wind : u < 0.12 ? 1 - u / 0.12 : 0; S.duty = "knock"; }
  }
  const tray = (n) => [C.TRAY.x + C.TRAY.w / 2, C.TRAY.y + C.TRAY.d / 2, C.TRAY.z + 1.4 + n * 1.3];
  const hole = (h, lvl) => [xc(h), C.Y1 - C.ENV.d / 2 + 2, C.FLOOR + lvl * (C.ENV.t + 0.15)];
  const deg = (d) => (Math.atan2(d[1], d[0]) * 180) / Math.PI, toward = (p, hd, k = C.GRIP.ahead + C.ENV.l / 2 - 1) => [p[0] + Math.cos((hd * Math.PI) / 180) * k, p[1] + Math.sin((hd * Math.PI) / 180) * k, C.TOP + C.GRIP.z];
  const carried = (s, back = false) => { const { p, dir } = along(s); return toward(p, deg(dir) + (back ? 180 : 0)); };
  const nib = (s, phase, back = false) => { S.nib = { s, phase, walk: s, back }; };
  for (const J of E.jobs) {
    if (t < J.drop) break;
    const kind = J.kind === "put" ? "env" : "slip", u = (t - J.drop) / T.drop, sd = standOf(J);
    let pos = null, held = false;
    if (u < 1) { const a = C.CHUTE.a, b = C.CHUTE.b, s = u * u; pos = [a[0], a[1] + (b[1] - a[1]) * s, a[2] + (b[2] - a[2]) * s + 1.6]; S.letters.push({ j: J.j, kind, pos, slope: true }); }
    // Counting: one turn of Rocky's crank per unit of each letter, and the key read so far.
    if (t >= J.c0 && t < J.countEnd + 0.2) S.duty = S.duty || "rocky";
    for (const ts of J.strokes) { const v = (t - ts) / T.stroke; S.th += click(v); if (v >= 0 && v < 1) S.alpha = -Math.PI + 2 * Math.PI * v; }
    if (t >= J.c0) {
      const done = J.strokes.filter((ts) => t >= ts + T.stroke * 0.69).length;
      S.read = { j: J.j, kind: J.kind, key: J.key, count: done, sum: J.sum, h: J.h, vals: J.chars.filter((q) => t >= q.t0).map((q) => q.v), cmps: 0, found: false, filed: false };
    }
    if (J.kind === "put") {
      if (u >= 1 && t < J.pick) pos = tray(0);
      else if (t >= J.pick && t < J.out) {
        // Nib lifts the letter off the tray, then turns round with it toward the frame.
        const v = (t - J.pick) / T.pick, h0 = 20, h1 = deg(along(0).dir) + 360, hd = h0 + (h1 - h0) * ease((v - 0.4) / 0.6), p = along(0).p;
        pos = v < 0.4 ? tray(0).map((q, i) => q + (toward(p, h0)[i] - q) * ease(v / 0.4)) : toward(p, hd);
        nib(0, "pick"); S.nib.hd = hd; held = true;
      }
      else if (t >= J.out && t < J.arrive) { const s = sd * (t - J.out) / (J.arrive - J.out); nib(s, "walk"); pos = carried(s); held = true; }
      else if (t >= J.slide) {
        const v = (t - J.slide) / T.slide, h = hole(J.h, J.level), c = carried(sd), m = [h[0], pa[pa.length - 1][1], h[2]];
        pos = v < 0.4 ? c.map((q, i) => q + (m[i] - q) * ease(v / 0.4)) : m.map((q, i) => q + (h[i] - q) * ease((v - 0.4) / 0.6));
        if (t < J.slideEnd) { nib(sd, "slide"); held = true; }
        else if (t < J.home) nib(sd * (1 - (t - J.slideEnd) / (J.home - J.slideEnd)), "back", true);
        if (S.read && S.read.j === J.j && t >= J.slideEnd) S.read.filed = true;
      }
      if (S.nib.phase !== "idle" && t < J.home) S.duty = S.duty || "nib";
    } else {
      if (u >= 1) pos = tray(0);
      if (t >= J.out && t < J.arrive) nib(sd * (t - J.out) / (J.arrive - J.out), "walk");
      for (const q of J.cmps) {
        const v = (t - q.t0) / (q.hit ? T.pull : T.cmp);
        if (v < 0) continue;
        if (S.read && S.read.j === J.j) S.read.cmps++;
        if (v < 1) {
          // Each letter in the chain slides out for Nib to read; the match comes out, and Nib turns round with it.
          const turn = q.hit ? ease((v - 0.55) / 0.45) : 0;
          nib(sd, "cmp"); S.cmp = { idx: q.idx, out: q.hit ? ease(v / 0.55) * 0.3 : Math.sin(Math.PI * cl(v)) * 0.3, turn };
          if (turn > 0) S.nib.hd = 180 - 180 * turn;
        }
      }
      if (t >= J.pullEnd && t < J.home) nib(sd * (1 - (t - J.pullEnd) / (J.home - J.pullEnd)), "back", true);
      if (t >= J.home && t < J.putEnd) { nib(0, "put"); S.nib.hd = 20; S.put = ease((t - J.home) / T.put); }
      if (t >= J.pullEnd && S.read && S.read.j === J.j) S.read.found = true;
      if (t >= J.out && t < J.putEnd) S.duty = S.duty || "nib";
    }
    if (pos && !(u < 1)) S.letters.push({ j: J.j, kind, pos, held });
  }
  // A lookup moves letters filed earlier: the one checked slides half out and back, the one found is carried home.
  const get = E.jobs.find((J) => J.kind === "get" && t >= J.arrive);
  for (const l of S.letters) {
    if (S.cmp && l.j === S.cmp.idx) {
      const o = [l.pos[0], l.pos[1] + S.cmp.out * (C.ENV.d + 2), l.pos[2]], c = toward(along(S.nib.s).p, S.nib.hd ?? 180);
      l.pos = S.cmp.turn > 0 ? o.map((v, i) => v + (c[i] - v) * S.cmp.turn) : o; l.held = true; l.turn = S.cmp.turn;
    }
    if (get && l.j === get.found && t >= get.pullEnd) {
      const c = carried(S.nib.s, true), tr = tray(1);
      l.held = t < get.putEnd;
      l.pos = t < get.home ? c : t < get.putEnd ? c.map((v, i) => v + (tr[i] - v) * S.put) : tr;
    }
  }
  const at = along(S.nib.s);
  const dir = S.nib.back ? [-at.dir[0], -at.dir[1]] : at.dir, ph = S.nib.phase;
  const hd = S.nib.hd ?? (ph === "idle" ? 20 : ph === "slide" || ph === "cmp" ? 180 : deg(dir));
  Object.assign(S.nib, { p: at.p, dir, hd });
  return S;
}
