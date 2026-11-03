// The car as pure functions of the model's numbers, serialized into the page too, so each uses only its arguments.

// The push the wheels give on the floor (N) with the spring wound W turns: torque through a 16:1 train.
export function driveOf(C, W) {
  const H = C.PH;
  return (H.eta * (H.tau0 + H.k * W)) / (H.ratio * H.r);
}

// Where the click sits on the ratchet tooth under it: 0 at the root against the steep face, 0.96 at the tip.
export function clickOf(C, aA) {
  const s = (2 * Math.PI) / C.RATCHET.n;
  return (((C.CLICK.psi - aA) / s) % 1 + 1) % 1;
}

// One small step: you wind toward windT, the arbor recoils onto the click, the brake eases, and the spring drives the car.
export function advance(S, dt, C) {
  const H = C.PH;
  S.keyV = 0; S.backV = 0;
  if (S.windT > S.W + 1e-9) {
    const d = Math.min(S.windT - S.W, H.windRate * dt);
    S.W += d; S.aA -= 2 * Math.PI * d; S.keyV = H.windRate;
    if (S.W >= S.windT - 1e-9) { S.windT = -1; S.back = clickOf(C, S.aA) * (2 * Math.PI) / C.RATCHET.n; }
  } else if (S.back > 0) {
    const d = Math.min(S.back, H.recoil * dt);
    S.back -= d; S.aA += d; S.W -= d / (2 * Math.PI); S.backV = H.recoil;
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

// The angles of the arbor (key, ratchet), the barrel, the intermediate arbor and the axle, from the arbor and the turns wound.
export function anglesOf(S) {
  const barrel = S.aA + 2 * Math.PI * S.W;
  return { arbor: S.aA, barrel, inter: -4 * barrel, axle: 16 * barrel };
}
