// The crew, posed each frame from the state that moves their parts; serialized into the page too.
export function poses(C, S, D, A) {
  const Q = C.CREW, B = C.BARREL, ri = B.drum - 0.8, up = Q.roo.up;
  const load = Math.min(1, S.W / C.PH.full), b = S.brake, held = b < 0.5, running = Math.min(1, S.v / 0.25);
  // Roo is the spring's push: wound, he crouches against the held drum; let go, he treads it round.
  const tread = (-A.barrel * ri) / 5;
  const roo = {
    at: [B.x + ri * Math.sin(up), Q.roo.y, B.z - ri * Math.cos(up)],
    heading: Q.roo.heading,
    stride: { phase: tread, amount: 0.16 * running },
    hop: 0.8 * running * Math.abs(Math.sin(tread * Math.PI)),
    lean: (4 + 16 * load) * (1 - b) + (6 + 12 * load) * b,
    squash: (0.4 - 0.3 * b) * load,
    look: [0, 10 * b - 4],
    eyes: S.v > 0.02 ? "open" : S.W < 0.6 && S.D > 0.5 ? "happy" : held && load > 0.6 ? "wide" : "open",
  };
  // Pinch rides the click up each tooth as you wind, and leans back on it while the spring pulls.
  const winding = S.keyV > 0;
  const pinch = {
    at: Q.pinch.at,
    heading: Q.pinch.heading,
    lean: winding ? -4 + 10 * D.clickU : -4 - 10 * load,
    paws: { l: D.clickTail, r: [D.clickTail[0] + 0.6, D.clickTail[1], D.clickTail[2] - 1] },
    eyes: winding || S.backV > 0 ? "wide" : S.W < 0.6 && S.D > 0.5 ? "happy" : "open",
  };
  // Rocky presses the brake shoe onto the drum while you wind, and steps back with the lever as it swings off.
  const back = Q.rocky.step * S.brake, moving = Math.abs(S.brakeV) > 0.05;
  const rocky = {
    at: [Q.rocky.at[0] + back, Q.rocky.at[1], Q.rocky.at[2]],
    heading: Q.rocky.heading,
    stride: { phase: back / 3, amount: moving ? 0.12 : 0 },
    lean: (4 + 10 * load) * (1 - b) - 4 * b,
    paws: { l: D.grip[0], r: D.grip[1] },
    eyes: !held && S.v > 0.05 ? "happy" : "open",
  };
  return { roo, pinch, rocky };
}
