// The levers and the crew, posed from the state that moves them; serialized into the page as it stands.
// Ottie is the flapper: feet on the seat when it is shut, paws on the ring at the chain's foot, lifted off by the
// chain and floating at that height until the falling water lets her down. Mo is the float: he hangs by his paws
// from the end of the float arm, and the arm's angle is his height.
export function levers(C, S) {
  const [px, , pz] = C.SHAFT, a = C.SWING * S.lev, dx = C.ARM_END[0] - px;
  const end = [px + dx * Math.cos(a), C.ARM_END[1], pz - dx * Math.sin(a)];
  const seat = [C.SEAT.x, C.SEAT.y, C.Z0 + C.SEAT.top + S.hop];
  const ring = [seat[0] + C.RING[0], seat[1] + C.RING[1], seat[2] + C.RING[2]];
  const [qx, qy, qz] = C.PIVOT, th = Math.asin((S.paw - qz) / C.ARM);
  const tip = [qx + C.ARM * Math.cos(th), qy, C.Z0 + S.paw];
  return { end, seat, ring, th, tip, slack: Math.max(0, C.CHAIN - Math.hypot(end[0] - ring[0], end[1] - ring[1], end[2] - ring[2])) };
}

export function poses(C, S) {
  const L = levers(C, S), Q = C.PLACE;
  const swim = S.hop > 0.5 ? Math.sin(S.t * 5) : 0;
  const ottie = {
    at: [L.seat[0] + Q.ottie.at[0], L.seat[1] + Q.ottie.at[1], L.seat[2]],
    heading: Q.ottie.heading, lean: Q.ottie.lean - 4 * Math.min(1, S.lift), look: [0, 18],
    paws: { l: [L.ring[0] - 1.6, L.ring[1], L.ring[2]], r: [L.ring[0] + 1.6, L.ring[1], L.ring[2]] },
    squash: S.hop > 0.5 ? 0 : 0.06, tailSway: 0.5 * swim,
    eyes: S.hop > 0.5 && S.lift > 0.5 ? "wide" : S.hop > 0.5 ? "open" : S.idle > 3 ? "shut" : "open",
  };
  const c = Math.cos(L.th), s = Math.sin(L.th), u = [c, 0, s];
  const grip = (d) => [L.tip[0] - u[0] * d, L.tip[1], L.tip[2] - u[2] * d - 1.2];
  const mo = {
    at: [L.tip[0] + Q.mo.at[0], L.tip[1] + Q.mo.at[1], L.tip[2] + Q.mo.at[2]],
    heading: Q.mo.heading, stance: "hang", lean: Q.mo.lean, look: [0, -10],
    paws: { l: grip(Q.mo.grip[0]), r: grip(Q.mo.grip[1]) },
    eyes: S.wet < 0.1 ? "open" : S.idle > 4 ? "shut" : "open",
    tailSway: 0,
  };
  return { ottie, mo, L };
}
