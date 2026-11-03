// The car as pure functions of the model's numbers. They are serialized into the page too, so each one
// uses only its arguments and the other functions in this file.

// The push the wheels give on the floor (N) with the spring wound W turns: torque through a 16:1 train.
export function driveOf(C, W) {
  const H = C.PH;
  return (H.eta * (H.tau0 + H.k * W)) / (H.ratio * H.r);
}

// One small step. You wind the key toward windT; the brake lever eases on or off; with the brake off the
// spring drives the car against rolling friction and drag, and the spring lets out as the wheels turn.
export function advance(S, dt, C) {
  const H = C.PH;
  S.keyV = 0;
  if (S.windT > S.W + 1e-9) {
    const d = Math.min(S.windT - S.W, H.windRate * dt);
    S.W += d; S.aA -= 2 * Math.PI * d; S.keyV = H.windRate;
    if (S.W >= S.windT - 1e-9) S.windT = -1;
  }
  const bT = S.brakeOff ? 1 : 0, b0 = S.brake;
  S.brake += Math.sign(bT - S.brake) * Math.min(Math.abs(bT - S.brake), dt / 0.45);
  S.brakeV = (S.brake - b0) / dt;
  const free = S.brake > 0.5 && S.keyV === 0;
  const F = free ? driveOf(C, S.W) : 0;
  if (S.v <= 0 && F <= H.f0) S.v = 0;
  else S.v = Math.max(0, S.v + ((F - H.f0 - H.c * S.v * S.v) / H.m) * dt);
  if (!free) S.v = 0;
  const ds = S.v * dt;
  S.D += ds;
  S.roll = (S.roll + ds * 1000) % C.WORLD.period;
  S.W = Math.max(0, S.W - ds / (H.ratio * 2 * Math.PI * H.r));
  S.vMax = Math.max(S.vMax, S.v);
}

export function stepModel(S, dt, C) {
  const n = Math.max(1, Math.ceil(dt / 0.002));
  for (let i = 0; i < n; i++) advance(S, dt / n, C);
  S.stepT += dt;
}

// The angles of everything that turns: the arbor (and key and ratchet), the barrel, the intermediate arbor
// and the axle, all from the arbor's angle and the turns wound into the spring.
export function anglesOf(S) {
  const barrel = S.aA + 2 * Math.PI * S.W;
  return { arbor: S.aA, barrel, inter: -4 * barrel, axle: 16 * barrel };
}
