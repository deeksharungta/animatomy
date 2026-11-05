// The crew, posed each frame from the state that moves their parts; serialized into the page as it stands.
// Ottie is the pump plunger: he stands in the bore on its cup seal, his feet its face, his paws on the crosshead the
// handle's socket drives, and rides the stroke. Pinch is the delivery check valve: he sits on its seat with his claws
// on the lip; the pump's push lifts him back off it, and the car's pressure presses him onto it again.
export function poses(C, S) {
  const PU = C.PUMP, Q = C.POCKET, A = [PU.x, 0, S.zp + C.PIN_UP], O = C.CREW;
  const down = S.vz < -2, up = S.vz > 2;
  const ottie = {
    at: [PU.x + O.ottie.dx, O.ottie.y, S.zp],
    heading: O.ottie.heading,
    lean: O.ottie.lean - (down ? 3 : 0),
    squash: down ? 0.08 : 0,
    look: [0, up ? 14 : 4],
    paws: { l: [A[0] - O.ottie.grip, -2.6, A[2]], r: [A[0] + O.ottie.grip, -2.6, A[2]] },
    eyes: S.idle > 3 ? "shut" : S.done ? "happy" : "open",
    tailSway: down ? 0.4 : up ? -0.3 : 0,
  };
  const g = S.gate, x = O.pinch.x - 4.5 * g;
  const pinch = {
    at: [x, O.pinch.y, Q.z - Q.r + 0.2],
    heading: O.pinch.heading,
    lean: 6 - 10 * g + 4 * S.strain,
    paws: g < 0.5 ? { l: [Q.x1 - 0.8, -1, Q.z + 3.2], r: [Q.x1 - 0.8, -1, Q.z - 1.6] } : undefined,
    eyes: S.idle > 3 && S.strain > 0.5 ? "shut" : "open",
    squash: 0.12 * S.strain,
  };
  return { ottie, pinch, A, lip: [Q.x1 - 0.8, -1, Q.z + 0.8], face: [PU.x, 0, S.zp] };
}
