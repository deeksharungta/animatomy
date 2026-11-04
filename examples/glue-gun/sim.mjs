// The gun's physics, serialized into the page: the PTC heater and block, the trigger and the claw, the stick as
// a piston pushing melt through the nozzle, the ball valve and the cooling blob. dt is real seconds, w model seconds.
export function rest(C) {
  return { power: false, rocker: 0, T: C.T0, W: 0, cur: 0, pull: false, u: 0, uv: 0, grip: 0, fed: 0, solid: 0.6, melt: 0, p: 0, ball: 0,
    out: 0, blobV: 0, blobT: C.T0, rope: 0, flow: 0, heat: 0, pullT: 0, t: 0, stepT: 0, clock: 0, duty: "", strokes: 0 };
}

export function simStep(S, C, dt, w) {
  const ease = (v, to, tau) => v + (to - v) * (1 - Math.exp(-dt / tau));
  S.t += dt; S.stepT += dt;
  S.rocker = ease(S.rocker, S.power ? 1 : 0, 0.09);
  if (Math.abs(S.rocker - (S.power ? 1 : 0)) < 0.004) S.rocker = S.power ? 1 : 0;
  // The PTC stones: resistance flat to 175 °C, then up tenfold every 24 K.
  const R = C.R0 * Math.pow(10, Math.max(0, S.T - C.TB) / C.DECADE), live = S.power && S.rocker > 0.5;
  S.W = live ? (C.V * C.V) / R : 0;
  S.cur = ease(S.cur, live ? C.R0 / R : 0, 0.15);
  if (S.cur < 0.01) S.cur = 0;
  // The trigger: you pull at a steady 60 N on the stick, limited by the melt's flow through the orifice.
  const u0 = S.u, mu = C.MU0 * Math.exp((190 - Math.max(S.T, 60)) / 25);
  const Rh = (8 * mu * C.L_ORI * 1e-3) / (Math.PI * Math.pow(C.NOZ.orifice * 1e-3, 4));
  const push = (C.FORCE / (C.AREA * 1e-6)) - C.CRACK * 1e5;
  if (S.pull) {
    S.pullT += dt;
    S.grip = ease(S.grip, 1, 0.05);
    const v = S.T > 95 ? ((push / Rh) / (C.AREA * 1e-9)) * Math.min(1, S.pullT / 0.18) : 0;
    if (S.grip > 0.6) S.u = Math.min(C.STROKE, S.u + v * dt);
  } else {
    S.pullT = 0;
    S.grip = ease(S.grip, 0, 0.05);
    S.u = ease(S.u, 0, 0.09);
    if (S.u < 0.02) S.u = 0;
  }
  const du = S.u - u0;
  S.uv = du / Math.max(dt, 1e-4);
  const fed = S.grip > 0.6 && du > 0 ? du : 0;
  S.fed += fed; S.solid += fed;
  S.out += fed * C.AREA; S.blobV += fed * C.AREA;
  if (fed > 0) S.blobT = (S.blobT * (S.blobV - fed * C.AREA) + (S.T - 6) * fed * C.AREA) / S.blobV;
  // Pressure behind the ball while the stick moves; the ball lifts off its seat past 0.3 bar.
  S.p = ease(S.p, fed > 0 ? C.PFULL : 0, fed > 0 ? 0.06 : 0.12);
  if (S.p < 0.01) S.p = 0;
  S.ball = ease(S.ball, Math.max(0, Math.min(1, (S.p - C.CRACK) / (C.PFULL - C.CRACK))) * C.NOZ.lift, 0.03);
  if (S.ball < 0.005) S.ball = 0;
  S.rope = ease(S.rope, fed > 0 ? 1 : 0, fed > 0 ? 0.08 : 0.25);
  if (S.rope < 0.02) S.rope = 0;
  S.flow = ease(S.flow, fed > 0 ? 1 : 0, fed > 0 ? 0.12 : 0.35);
  if (S.flow < 0.003) S.flow = 0;
  // Melting: the solid end inside the block melts at a rate set by the block's heat, drawing 37 J per mm.
  const sm = Math.max(0, Math.min(1, S.solid / 4)), m = S.T > 90 ? C.MELT * (S.T - 90) * sm * sm * (3 - 2 * sm) : 0;
  S.melt = m;
  S.solid = Math.max(0, S.solid - m * w);
  const drawn = m * C.J_MM;
  S.T += (w * (S.W - C.LOSS * (S.T - C.T0) - drawn)) / C.CAP;
  S.heat = ease(S.heat, Math.min(1, (S.W + drawn) / 40), 0.3);
  S.blobT += (w * (C.T0 - S.blobT)) / C.BLOB_TAU;
  if (S.power || S.T > C.T0 + 2) S.clock += w;
  // On duty: whoever's part moves; Volta while current runs and nothing else does.
  S.duty = S.uv > 1.5 ? "pinch" : S.uv < -1.5 ? "roo" : S.cur > 0.04 ? "volta" : "";
}
