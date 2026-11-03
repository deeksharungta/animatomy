// The crew, posed each frame from the state that moves their parts; serialized into the page too.
// Roo is the parallelogram's return spring, braced between his seat on the B-knuckle and the outer link's spring pin:
// the cable squeezes him down as it pulls, and he kicks the link back out when it lets go. Mo is the cage spring,
// hanging between the P-knuckle's anchor peg and the cage's tab: the bigger cogs swing the tab away and stretch him.
export function poses(C, S, D, X) {
  const Q = X || C.CREW, b = D.boss, A = D.moA, T = D.moT, t = Math.max(0, Math.min(1, S.psi / C.PSI[10]));
  const roo = {
    at: Q.roo.at,
    heading: Q.roo.heading,
    lean: Q.roo.lean * t,
    squash: Q.roo.squash * t,
    look: [0, 14 - 10 * t],
    paws: { l: [b[0], b[1] - 1.2, b[2]], r: [b[0], b[1] + 1.2, b[2]] },
    eyes: S.psiV < -0.3 ? "wide" : t > 0.5 ? "shut" : "open",
    tailSway: -0.3 * t,
  };
  // The further apart his holds, the higher his arms lift him: hanging straight-armed at rest, spread wide on the 32T.
  const reach = Math.hypot(T[0] - A[0], T[2] - A[2]);
  const mo = {
    at: [(A[0] + T[0]) / 2 + Q.mo.dx, A[1] + Q.mo.dy, (A[2] + T[2]) / 2 - Q.mo.drop + Q.mo.lift * reach],
    heading: Q.mo.heading,
    stance: "hang",
    lean: Math.max(-25, Math.min(25, (T[0] - A[0]) * 0.6)),
    look: [0, -6],
    paws: { l: A, r: T },
    eyes: Math.abs(S.phiV) > 0.25 ? "wide" : reach > 26 ? "shut" : Math.abs(S.phiV) < 0.01 && S.stepT > 2 ? "happy" : "open",
  };
  return { roo, mo };
}
