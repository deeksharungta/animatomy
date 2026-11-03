// The crew, posed each frame from the state that moves their parts; serialized into the page too.
// Knock's beak is the hammer's head; Rocky's paws hold the click's tail.
export function poses(C, S, D, X) {
  const Q = X || C.CREW;
  const kq = Q.knock, stem = D.stem;
  const knock = {
    at: [stem[0] + (stem[3] - stem[0]) * kq.f + kq.dx, stem[1] + kq.dy, stem[2] + (stem[4] - stem[2]) * kq.f + kq.dz],
    heading: Q.knock.heading,
    lean: Math.max(-12, Math.min(8, S.a * 70)),
    beak: D.beak,
    wings: S.ring > 0.55 ? 0.3 : 0,
    eyes: S.ring > 0.55 ? "wide" : S.ring > 0.15 ? "happy" : "open",
  };
  const rocky = {
    at: Q.rocky.at,
    heading: Q.rocky.heading,
    lean: S.jam ? -5 : Math.max(-6, Math.min(6, (S.c + 0.06) * 30)),
    paws: { l: D.claws[0], r: D.claws[1] },
    eyes: S.jam ? "shut" : "open",
  };
  return { knock, rocky };
}
