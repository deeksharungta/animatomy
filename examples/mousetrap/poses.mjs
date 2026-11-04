// The crew, posed each frame from the same state that moves their parts; serialized into the page as it stands.
// Roo is the springs: feet on the near spring's base leg, paws on its hook over the hammer's arm, crouched tight
// while the trap is set and flinging the arm over as it snaps. Pinch is the catch: his claws on the bar's tip.
export function poses(C, S) {
  const Z = C.AX.z, th = S.th, W = C.WIRE, SP = C.SPRING, Q = C.CREW;
  const tan = [-Math.sin(th), 0, Math.cos(th)], r = SP.hook + 1.6;
  const hook = [r * Math.cos(th), C.ARM_Y + 1, Z + r * Math.sin(th)].map((v, i) => v + tan[i] * (W + SP.wire / 2));
  const load = Math.max(0, Math.min(1, (th - C.TH_REST) / (C.TH_SET - C.TH_REST)));
  const roo = {
    at: Q.roo.at, heading: Q.roo.heading,
    squash: Q.roo.squash[0] + Q.roo.squash[1] * load * load,
    lean: Q.roo.lean[0] + Q.roo.lean[1] * load,
    look: [0, 10 - 20 * load],
    paws: { l: hook, r: hook },
    eyes: S.duty === "roo" ? "wide" : load > 0.9 ? "open" : S.idle > 2 ? "happy" : "open",
    tailSway: S.duty === "roo" ? 0.6 : 0,
  };
  // The bar's tip, where it sits under the pedal's lip: Pinch's claws close on it there.
  const tipZ = C.BAR.z + C.BAR.L * Math.sin(S.phi), tipX = C.BAR.x + C.BAR.L * Math.cos(S.phi);
  const g = S.grip;
  const pinch = {
    at: Q.pinch.at, heading: Q.pinch.heading,
    lean: 4 + 8 * g - 6 * S.strain,
    paws: g > 0.02 ? { l: [tipX - 2.6, 1.4, tipZ + 0.3], r: [tipX - 0.4, 1.4, tipZ + 0.3] } : undefined,
    eyes: S.duty === "pinch" ? "wide" : g > 0.5 ? "open" : "happy",
  };
  return { roo, pinch, hook, tip: [tipX - 1.5, 1.4, tipZ + 0.3] };
}
