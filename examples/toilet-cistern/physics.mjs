// The cistern's model, one step at a time: your press on the handle, the chain, Ottie lifting and floating, the
// flow out through the seat (Torricelli), Mo's float arm and the fill valve it throttles, and the pan's water.
// Pure: serialized into the page as it stands, and run in the build to put true numbers in the captions.
export function fresh(C) {
  return { lev: 0, push: false, pushT: 0, hop: 0, lift: 0, h: C.FULL, paw: C.SHUT, open: 0, qout: 0, qin: 0, bowl: 0, siph: false, swirl: 0,
    t: 0, clock: 0, run: false, warp: 1, dh: 0, dHop: 0, dPaw: 0, idle: 9, wet: 1, out: 0, stepT: 0, focus: "", duty: "", lit: true, ring: [0, 0, 0] };
}

export function stepModel(C, S, dt) {
  const m = dt * S.warp, cl = (v) => Math.max(0, Math.min(1, v)), ease = (v, t, tau) => v + (t - v) * (1 - Math.exp(-m / tau));
  S.t += dt; S.stepT += dt;
  if (S.run) S.clock += m;
  // You press the handle for 0.9 s and let go; it falls back on its own weight.
  if (S.push) { S.pushT += m; S.lev = ease(S.lev, 1, 0.09); if (S.lev > 0.995) S.lev = 1; if (S.pushT > 0.9) S.push = false; }
  else { S.lev = ease(S.lev, 0, 0.11); if (S.lev < 0.004) S.lev = 0; }
  // The chain goes taut once the arm's end is a chain's length above Ottie's ring: from there it lifts her.
  const [px, , pz] = C.SHAFT, dx = C.ARM_END[0] - px, a = C.SWING * S.lev;
  const ex = px + dx * Math.cos(a), ez = pz - dx * Math.sin(a), rest = C.Z0 + C.SEAT.top + C.RING[2];
  const horiz = Math.hypot(ex - C.SEAT.x - C.RING[0], C.ARM_END[1] - C.SEAT.y - C.RING[1]);
  const chain = Math.max(0, ez - Math.sqrt(C.CHAIN * C.CHAIN - horiz * horiz) - rest);
  // Afloat, she rides with her feet under the surface, so she sinks as the water falls and lands on the seat.
  const cap = Math.min(C.HOP, Math.max(0, (S.h - C.SEAL - 2) * C.SINK)), h0 = S.hop, p0 = S.paw;
  S.hop = Math.max(Math.min(S.hop, cap), chain);
  if (S.hop < 3 && chain === 0) S.hop = 0;
  S.lift = chain > 0.5 ? 1 : 0;
  // Out through the seat: Q = Cd·A·√(2g(h + head)), the opening growing over Ottie's first 16 mm.
  S.qout = S.hop > 0 ? C.CD * C.A * cl(S.hop / C.HOP_FULL) * Math.sqrt(2 * 9.81 * (S.h / 1000 + C.HEAD)) * 1000 : 0;
  // Mo floats 30 mm under the arm's end once the water reaches him; his height sets the valve's opening.
  S.paw = Math.max(C.STOP, Math.min(C.SHUT, S.h + C.FLOAT));
  S.open = cl((C.SHUT - S.paw) / C.BAND);
  if (S.open < 0.03) S.open = 0;
  S.qin = C.QIN * S.open;
  const dh = (S.qin * (1 - C.BOWL_SHARE) - S.qout) / C.AREA;
  S.h = Math.min(C.FULL, S.h + dh * m); S.out += S.qout * m;
  S.dh = dh * S.warp; S.dHop = (S.hop - h0) / Math.max(dt, 1e-3); S.dPaw = (S.paw - p0) / Math.max(dt, 1e-3);
  S.wet = S.h + C.FLOAT > C.STOP + 6 ? 1 : 0;
  // The pan: the flush lifts its water, the siphon then pulls it low, and the refill tube's share tops it back up.
  if (S.qout > 0.3) { S.bowl = ease(S.bowl, 26 * Math.min(1, S.qout / 2.2), 0.35); S.siph = true; }
  else if (S.siph) { S.bowl = ease(S.bowl, -15, 0.5); if (S.bowl < -14) S.siph = false; }
  else S.bowl = Math.min(0, S.bowl + (S.qin * C.BOWL_SHARE / 0.05) * m);
  S.swirl += S.qout * m;
  // Who is on duty: the beat's actor, while their part moves (Ottie's valve while the water runs through it).
  const moving = { ottie: Math.abs(S.dHop) > 2 || S.qout > 0.25, mo: Math.abs(S.dPaw) > 0.2 };
  S.duty = S.focus && moving[S.focus] ? S.focus : "";
  S.lit = !S.duty && S.lev === 0;
  S.idle = moving.ottie || moving.mo || S.lev > 0 ? 0 : S.idle + dt;
}
