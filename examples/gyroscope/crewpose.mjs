// ---------------------------------------------------------------- crew poses from the state and the moving parts

export function poses(C, S, D, MO, PINCH) {
  const add = (...vs) => [0, 1, 2].map((i) => vs.reduce((t, v) => t + v[i], 0));
  const mul = (v, s) => [v[0] * s, v[1] * s, v[2] * s];
  const deg = (v) => (Math.atan2(v[1], v[0]) * 180) / Math.PI;
  const hh = C.BAR.h / 2;
  // Volta lies along the top of the arm, snout on the brush box's terminal, tail on the trunnion block's post.
  const path = [[71.4, 7.6], [67, 4.4], [40, 4.2], [8, 4.2], [-2.4, 4.6]].map(([s, h]) => D.arm(s, 0, h));
  const volta = { path, charge: S.motor ? 0.45 + 0.45 * Math.min(1, S.amps) : 0, flicker: S.motor ? Math.floor(S.t * 14) : 0, target: S.motor ? D.terminal : undefined, eyes: S.motor ? "happy" : S.w > 5 ? "open" : "shut" };
  // Mo hangs from the rail under the arm. Climbing, he goes hand over hand: the paws pass each other along
  // the rail, one stride per 3.2 units, his body swinging under them; still, both paws close together.
  const g = D.arm(S.d, 0, -hh - C.RAIL.drop - C.RAIL.r);
  const sideV = mul(D.side, D.facing), heading = deg([sideV[0] - 0.35 * D.dir[0], sideV[1] - 0.35 * D.dir[1]]);
  const ph = S.d / 3.2, reach = S.climb ? 2.6 * Math.sin(ph * Math.PI) : 1.4, sw = S.climb ? Math.cos(ph * Math.PI) : 0;
  const mo = {
    at: [g[0], g[1], g[2] - MO.size * 0.93],
    heading, stance: "hang", lean: 6 * sw * Math.sign(S.dT - S.d), look: [0, S.climb ? 14 : -6],
    paws: { l: add(g, mul(D.dir, reach)), r: add(g, mul(D.dir, -reach)) },
    tailSway: 0.6 * sw,
    eyes: S.w < 5 && !S.lock ? "wide" : S.lock && S.w < 5 && !S.climb ? "shut" : "open",
  };
  // Pinch stands on his shelf on the fork, side-on to the latch lug's cross pin, and pinches its near end
  // between his claws, one above and one below. Letting go, the claws spring apart and drop to his chest.
  const Sh = C.SHELF, Lg = C.LUG;
  const feet = add(mul(D.dirH, Sh.feet[0]), mul(D.side, Sh.feet[1]), [0, 0, Sh.z]);
  const end = D.arm(Lg.s - Lg.grip, 0, -hh - Lg.drop);
  const open = S.lock ? 0 : Math.min(1, S.rel / 0.6), wide = 0.9 + 1.6 * Math.sin(open * Math.PI), chest = add(feet, [0, 0, 9]);
  const near = add(mul(end, 1 - 0.4 * open), mul(chest, 0.4 * open));
  const pinch = {
    at: feet, heading: deg(D.side) + Sh.turn, stance: "up", lean: -8 * open, look: [0, S.lock ? 10 : 24],
    paws: open < 1 ? { l: add(near, mul(D.up, wide)), r: add(near, mul(D.up, -wide)) } : undefined,
    squash: 0.25 * open, eyes: S.lock ? "open" : S.phd * S.phd > 0.2 ? "wide" : "happy",
  };
  return { volta, mo, pinch };
}
