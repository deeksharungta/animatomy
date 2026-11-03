// The crew, posed each frame from the state that moves their parts; serialized into the page too.
// Roo treads the barrel round; Pinch holds the click's tail; Rocky holds the brake lever's grip.
export function poses(C, S, D, A) {
  const Q = C.CREW, B = C.BARREL;
  const surface = -A.barrel * B.drum;
  const running = Math.min(1, S.v / 0.25);
  const roo = {
    at: [B.x + Q.roo.dx, Q.roo.y, B.z + B.drum],
    heading: Q.roo.heading,
    stride: { phase: surface / 9, amount: 0.14 * running },
    lean: S.keyV > 0 || (S.brake < 0.5 && S.W > 1) ? 12 : 6 * running,
    squash: S.keyV > 0 ? 0.25 : 0,
    eyes: S.v > 0.02 ? "open" : S.W < 0.6 && S.D > 0.5 ? "happy" : "open",
  };
  const pinch = {
    at: Q.pinch.at,
    heading: Q.pinch.heading,
    lean: S.keyV > 0 ? -6 + 10 * D.clickU : 0,
    paws: { l: D.clickTail, r: [D.clickTail[0] + 0.6, D.clickTail[1], D.clickTail[2] - 1] },
    eyes: S.keyV > 0 ? "wide" : "open",
  };
  const rocky = {
    at: Q.rocky.at,
    heading: Q.rocky.heading,
    lean: S.brake < 0.5 && S.W > 1 ? -8 : 4,
    paws: { l: D.grip[0], r: D.grip[1] },
    eyes: S.brake > 0.5 && S.v > 0.05 ? "happy" : "open",
  };
  return { roo, pinch, rocky };
}
