// The crew, posed each frame from the state that moves their parts; serialized into the page as it stands.
// Roo is the mainspring: he stands in the barrel with his feet on its hook at the wall and his paws on the arbor,
// turning round with the barrel as he pushes it, crouched by the wind. Pinch is the stop: claws on the fly's vane.
export function poses(C, S) {
  const d2r = Math.PI / 180, B = C.BARREL, R = C.PLACE.roo, floor = B.z0 + B.floor;
  const psi = R.psi0 + S.tb * 360, ps = psi * d2r;
  // Paws on the arbor at the height that sits level with his shoulders on screen: raised when the arbor is nearer
  // the camera than he is, lowered when it is farther (a camera EL° up drops nearer points by tan EL of the gap).
  const va = C.AZ * d2r, toCam = (q) => (q[0] - B.x - R.r * Math.cos(ps)) * Math.cos(va) + (q[1] - B.y - R.r * Math.sin(ps)) * Math.sin(va);
  const paw = (off) => { const a = (psi + off) * d2r, q = [B.x + (C.ARBOR.hub + 0.2) * Math.cos(a), B.y + (C.ARBOR.hub + 0.2) * Math.sin(a)]; return [q[0], q[1], floor + R.chest + Math.tan(C.EL * d2r) * toCam(q)]; };
  const pushing = S.run && S.wnd > 0;
  const roo = {
    at: [B.x + R.r * Math.cos(ps), B.y + R.r * Math.sin(ps), floor],
    heading: psi + 180 + R.turn,
    lean: R.lean,
    squash: R.squash[0] + R.squash[1] * S.wnd,
    look: [0, -4],
    paws: { l: paw(-R.spread), r: paw(R.spread) },
    eyes: S.winding ? "shut" : pushing ? (S.wnd < 0.15 ? "wide" : "open") : S.idle > 2 ? "happy" : "open",
    tailSway: pushing ? 0.3 * Math.sin(S.t * 2) : 0,
  };
  const Q = C.PLACE.pinch, F = C.FLY, W = C.WORM, th = C.PLACE.fly;
  const tipAt = (z) => [W.x + (F.r - 0.4) * Math.cos(th), W.y + (F.r - 0.4) * Math.sin(th), z];
  const g = S.grip;
  const pinch = {
    at: Q.at, heading: Q.heading,
    lean: Q.lean - 10 * (1 - g),
    look: [0, 8],
    paws: g > 0.5 ? { l: tipAt(F.z0 + Q.claw[0]), r: tipAt(F.z0 + Q.claw[1]) } : undefined,
    eyes: S.flyRpm > 600 ? "wide" : g > 0.5 ? "open" : "happy",
  };
  return { roo, pinch, hook: roo.at, tip: tipAt(F.z0 + Q.claw[0]) };
}
