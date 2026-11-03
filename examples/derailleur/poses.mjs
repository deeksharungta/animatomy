// The crew, posed each frame from the state that moves their parts; serialized into the page too.
// Roo pushes the outer link by the boss near its pivot; Mo hangs from the cage's lower jockey bolt.
export function poses(C, S, D, X) {
  const Q = X || C.CREW, a = D.pad, j = D.J2;
  const roo = {
    at: Q.roo.at,
    heading: Q.roo.heading,
    lean: Math.max(-10, Math.min(14, -S.psiV * 30)),
    squash: Math.max(0, Math.min(0.25, (S.psi / C.PSI[10]) * 0.25)),
    paws: { l: [a[0] - 1.2, a[1], a[2] + 1.6], r: [a[0] + 1.2, a[1], a[2] - 1.4] },
    eyes: Math.abs(S.psiV) > 0.6 ? "wide" : "open",
  };
  const mo = {
    at: [j[0] + Q.mo.dx, j[1] + Q.mo.dy, j[2] - Q.mo.drop],
    heading: Q.mo.heading,
    stance: "hang",
    look: [0, -6],
    paws: { l: [j[0] - 1.8, j[1], j[2] + 0.6], r: [j[0] + 1.8, j[1], j[2] + 0.6] },
    eyes: Math.abs(S.phiV) > 0.25 ? "wide" : Math.abs(S.phiV) < 0.01 && S.stepT > 2 ? "happy" : "open",
  };
  return { roo, mo };
}
