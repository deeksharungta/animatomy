// The crew, posed each frame from the state that moves their parts; serialized into the page as it stands.
// Chomp is the outer burr's teeth: his bite lands on the corn's outer face as its flute brings it round to him.
// Roo is the cone's spring: feet on the yoke arm, paws on the thrust race's rim, squashed by every crack's kick.
export function poses(C, S) {
  const rad = (d) => (d * Math.PI) / 180;
  const polar = (a, r, z) => [r * Math.cos(rad(a)), r * Math.sin(rad(a)), z];
  const coneR = (u) => {
    const T = C.CONE;
    for (let i = 1; i < T.length; i++) if (u <= T[i][0]) return T[i - 1][1] + ((T[i][1] - T[i - 1][1]) * (u - T[i - 1][0])) / (T[i][0] - T[i - 1][0]);
    return T[T.length - 1][1];
  };
  const zcb = C.CONE_Z + S.s - S.kick, zy = C.YOKE_Z + S.s;
  const Q = C.PLACE;
  const b = S.bite;
  const cornZ = zcb + C.CORN_U, face = coneR(C.CORN_U) + C.CORN_R + 3.2;
  const chomp = {
    at: [Q.chomp.at[0], Q.chomp.at[1], C.RING.z1],
    heading: Q.chomp.heading,
    lean: Q.chomp.lean + 6 * b,
    squash: 0.12 * b,
    bite: polar(C.CRACK_A, face - 0.6 * b, cornZ + 1 - 1.2 * b),
    eyes: S.idle > 2.5 ? "shut" : b > 0.45 ? "happy" : S.near ? "wide" : "open",
    tailSway: 0.4 * Math.sin(S.t * 2),
  };
  const raceZ = zcb - C.RACE_H;
  const k = Math.max(0, S.kick);
  const roo = {
    at: [Q.roo.at[0], Q.roo.at[1], zy],
    heading: Q.roo.heading,
    lean: Q.roo.lean + 5 * k,
    squash: Q.roo.squash + 0.18 * k,
    look: [0, 16],
    paws: { l: polar(C.ROO_ARM - 9, 30, raceZ), r: polar(C.ROO_ARM + 9, 30, raceZ) },
    eyes: S.idle > 2.5 ? "shut" : k > 0.6 ? "wide" : "open",
    tailSway: -0.2 * k,
  };
  return { chomp, roo, crack: chomp.bite, race: [polar(C.ROO_ARM - 9, 30, raceZ), polar(C.ROO_ARM + 9, 30, raceZ)] };
}
