// The mechanism as pure functions of the model's numbers. They are serialized into the page too, so each
// one uses only its arguments and the other functions in this file.

// The star wheel's edge at body angle psi: each tooth rises up a steep face, then runs down a straight ramp.
export function camR(C, psi) {
  const W = C.WHEEL, T = C.T, k = Math.floor(psi / T), base = k * T, f = psi / T - k;
  const ends = f < W.steep ? [[W.root, base], [W.tip, base + W.steep * T]] : [[W.tip, base + W.steep * T], [W.root, base + T]];
  const A = [ends[0][0] * Math.cos(ends[0][1]), ends[0][0] * Math.sin(ends[0][1])];
  const B = [ends[1][0] * Math.cos(ends[1][1]), ends[1][0] * Math.sin(ends[1][1])];
  const e = [B[0] - A[0], B[1] - A[1]], d = [Math.cos(psi), Math.sin(psi)];
  return (e[0] * A[1] - A[0] * e[1]) / (e[0] * d[1] - d[0] * e[1]);
}

export function turn(v, a) {
  return [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
}

// Where an arm's tip is, turned by a about its pivot, and how far it sits outside the wheel's edge there.
export function gapOf(C, pivot, arm, a, th) {
  const v = turn(arm, a), p = [pivot[0] + v[0], pivot[1] + v[1]];
  return Math.hypot(p[0], p[1]) - C.PIN - camR(C, Math.atan2(p[1], p[0]) - th);
}

// The furthest a follower can turn toward the wheel before its tip meets the edge (lo is the cocked side).
export function contactOf(C, pivot, arm, th, lo, hi) {
  if (gapOf(C, pivot, arm, hi, th) >= 0) return hi;
  let a = lo, b = hi;
  for (let i = 0; i < 22; i++) { const m = (a + b) / 2; if (gapOf(C, pivot, arm, m, th) >= 0) a = m; else b = m; }
  return a;
}

// The hammer turned by a: its tail tip, the head's centre, and where the spring bears on its stem.
export function hammerAt(C, a) {
  const H = C.HAM, p = H.pivot, t = turn(H.tail, a), h = turn(H.arm, a);
  return { tail: [p[0] + t[0], p[1] + t[1]], head: [p[0] + h[0], p[1] + h[1]], spring: [p[0] + h[0] * C.SPRING.at, p[1] + h[1] * C.SPRING.at] };
}

// The angle at which the head's face meets the gong's rim.
export function hitAngle(C) {
  let a = 0, b = 0.4;
  for (let i = 0; i < 30; i++) {
    const m = (a + b) / 2, h = hammerAt(C, m).head;
    if (Math.hypot(h[0], h[1] - C.GONG.z) > C.GONG.R + C.HAM.head) a = m; else b = m;
  }
  return a;
}

// The model, one small step: the key turns the wheel toward its target unless the click jams a steep face;
// the hammer swings on its spring, pinned by the tooth under its tail, and bounces off the gong.
export function advance(S, dt, C) {
  const T = C.T, W = C.WHEEL, Ck = C.CLICK;
  const th0 = S.th, dir = Math.sign(S.thT - S.th);
  if (dir > 0) S.th = Math.min(S.thT, S.th + S.om * dt);
  if (dir < 0) {
    const psi = Ck.tipA - S.th, wall = Ck.tipA - (Math.floor(psi / T) + 1) * T + T * W.steep * 0.12;
    S.th = Math.max(S.thT, S.th - S.om * dt, wall);
    S.jam = S.th <= wall + 1e-9 && S.thT < wall;
  }
  S.thV = (S.th - th0) / dt;
  const H = C.HAM, cam = contactOf(C, H.pivot, H.tail, S.th, -0.6, 0.3);
  S.aV += (-H.K * S.a - H.damp * S.aV) * dt;
  S.a += S.aV * dt;
  if (S.a >= C.HIT) {
    if (S.aV > 0.4) { S.ring = 1; S.strikes += 1; }
    S.a = C.HIT; S.aV = -H.bounce * Math.abs(S.aV);
  }
  if (S.a > cam) { S.a = cam; S.aV = 0; }
  const c0 = S.c;
  S.c = contactOf(C, Ck.pivot, Ck.arm, S.th, -0.5, 0.05);
  S.cV = (S.c - c0) / dt;
  S.ring *= Math.exp(-dt / C.RING_TAU);
}

export function stepModel(S, dt, C) {
  const n = Math.max(1, Math.ceil(dt / 0.001));
  for (let i = 0; i < n; i++) advance(S, dt / n, C);
  S.stepT += dt;
}
