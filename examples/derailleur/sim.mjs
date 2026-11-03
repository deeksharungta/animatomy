// The model's step, serialized into the page: clicks pull or release the cable one index at a time, the
// parallelogram follows, the chain climbs or drops one cog per shift travel as you pedal, and the cage keeps it taut.
export function stepModel(S, dt, C, G) {
  if (!(dt > 0)) return;
  if (S.g !== S.gT) {
    S.clickT += dt;
    if (S.clickT >= 0.34) { S.g += Math.sign(S.gT - S.g); S.clickT = 0; S.clicks += 1; }
  }
  const psiT = C.PSI[S.g], p0 = S.psi;
  S.psi += (psiT - S.psi) * (1 - Math.exp(-dt / (psiT > S.psi ? 0.07 : 0.09)));
  S.psiV = (S.psi - p0) / dt;
  const v = S.pedal * C.SPEED;
  S.s += v * dt;
  const y = G.linkage(C, S.psi).J1[1];
  let align = 0;
  for (let i = 1; i < C.Y.length; i++) if (Math.abs(C.Y[i] - y) < Math.abs(C.Y[align] - y)) align = i;
  if (align !== S.cog) {
    S.travel += v * dt;
    if (S.travel >= C.SHIFT) { S.cog += Math.sign(align - S.cog); S.travel = 0; }
  } else S.travel = 0;
  S.pos += (S.cog - S.pos) * (1 - Math.exp(-dt / 0.14));
  const f0 = S.phi;
  S.phi = G.solvePhi(C, S.psi, S.pos);
  S.phiV = (S.phi - f0) / dt;
  const R = G.lerpCog(C, S.pos, "R");
  S.cas += (v / R) * dt;
  S.jock += (v / C.RJ) * dt;
  S.stepT += dt;
}
