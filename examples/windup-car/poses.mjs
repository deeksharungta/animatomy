// The crew, posed each frame from the state that moves their parts; serialized into the page too.
export function poses(C, S, D, A) {
  const Q = C.CREW, B = C.BARREL, R = Q.roo, r = C.ARBOR.r + 0.2;
  const load = Math.min(1, S.W / C.PH.full), b = S.brake, held = b < 0.5;
  // Roo is the mainspring: feet on the wall's hook, paws on the arbor where the spring's inner end hooks it, posed with the hook straight down (the page spins him with the barrel).
  // Each turn you wind bends him tighter into the push; as the turns run out he straightens, driving the hook and the barrel round.
  const arbor = (d) => [B.x + r * Math.sin(d), R.y, B.z - r * Math.cos(d)];
  const roo = {
    at: [B.x, R.y, B.z - (B.drum - 0.8 - R.lug)],
    heading: R.heading,
    lean: R.lean[0] + R.lean[1] * load,
    squash: R.squash[0] + R.squash[1] * load,
    look: [0, 6],
    paws: { l: arbor(R.paw[0]), r: arbor(R.paw[1]) },
    eyes: S.v > 0.02 ? "open" : S.W < 0.6 && S.D > 0.5 ? "happy" : held && load > 0.6 ? "wide" : "open",
  };
  // Pinch is the click: one claw on its tip at the tooth, the other closing on it as it drops behind each tooth and opening as the next lifts it.
  const winding = S.keyV > 0, u = D.clickU, tip = D.clickTip, open = winding ? u : 0, piv = C.CLICK.pivot;
  const back = [piv[0] - tip[0], piv[1] - tip[2]], bl = Math.hypot(back[0], back[1]);
  const pinch = {
    at: Q.pinch.at,
    heading: Q.pinch.heading,
    lean: winding ? -2 + 8 * u : -4 - 6 * load,
    paws: { l: tip, r: [tip[0] + (back[0] / bl) * (0.8 + 1.8 * open), tip[1], tip[2] + (back[1] / bl) * (0.8 + 1.8 * open) + open] },
    eyes: winding || S.backV > 0 ? "wide" : S.W < 0.6 && S.D > 0.5 ? "happy" : "open",
  };
  // Rocky presses the brake's shoe onto the drum while you wind; when you flick the tab he eases off with it, and lets go once the car rolls.
  const n = [Math.cos(C.BRAKE.phi), Math.sin(C.BRAKE.phi)], lift = Math.min(1, Math.max(0, (S.v - 0.25) / 0.1));
  const off = (p) => [p[0] + lift * (1.6 * n[0] + 0.6), p[1] + lift * 1.2, p[2] + lift * (1.6 * n[1] - 1.2)];
  const rocky = {
    at: [Q.rocky.at[0] + Q.rocky.step * b + 0.8 * lift, Q.rocky.at[1], Q.rocky.at[2]],
    heading: Q.rocky.heading,
    lean: (6 + 10 * load) * (1 - b) - 6 * b,
    paws: { l: off(D.grip[0]), r: off(D.grip[1]) },
    eyes: lift > 0.5 ? "happy" : held && load > 0.6 ? "wide" : "open",
  };
  return { roo, pinch, rocky };
}
