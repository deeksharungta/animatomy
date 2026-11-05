// The crew, posed each frame from the same state that moves their parts. Serialized into the page, so it uses only
// C and S. Rocky's paws are on the crank's grip; Knock's beak swings to the heart cam's rim; Nib carries the letter.
export function poses(C, S) {
  const sh = C.SHAFT, a = S.alpha, dz = sh.z - C.GEN.c;
  const Cr = C.CRANK, grip = [Cr.x + Cr.r * Math.sin(a), Cr.y1 + 1.6 + Cr.grip / 2, dz + Cr.r * Math.cos(a)];
  const R = C.PLACE.rocky, reading = S.duty === "rocky";
  const rocky = {
    at: R.at, heading: R.heading, lean: 6 + 3 * Math.cos(a), look: [0, reading ? -12 : -4],
    paws: { l: [grip[0], grip[1] - 1.6, grip[2]], r: [grip[0], grip[1] + 1.6, grip[2]] },
    squash: 0.04 * (1 - Math.cos(a)), eyes: reading ? "open" : S.t > 1 && !S.duty ? "happy" : "open",
    tailSway: 0.3 * Math.sin(a),
  };
  // Knock: winds back, strikes the rim, and holds there while the shaft springs round to zero.
  const H = C.HEART, bc = Math.atan2(-C.HEART.dir[0], C.HEART.dir[1]), wrap = (x) => Math.atan2(Math.sin(x), Math.cos(x));
  const psi = (S.th * Math.PI) / 4, rr = 1.9 + (H.r - 1.9) * (Math.abs(wrap(bc - psi - bc)) / Math.PI);
  const dir = [0, -Math.sin(bc), Math.cos(bc)], hit = [H.x, sh.y + dir[1] * (rr + 0.4), sh.z + dir[2] * (rr + 0.4)];
  const back = S.strike < 0 ? 3 + 3 * -S.strike : S.strike > 0 ? 0 : 3;
  const knock = {
    at: C.PLACE.knock.at, heading: C.PLACE.knock.heading,
    beak: [hit[0], hit[1] + back * 0.95, hit[2] + back * 0.6],
    wings: S.strike < 0 ? 0.3 : 0, eyes: S.strike > 0 ? "shut" : "open",
  };
  // Nib: on all fours with nothing to carry, up on the hind feet with a letter or at a hole. A carried letter is in
  // front of him along his heading, his paws on its near part; at a hole his paws are on the letter's front edge.
  const N = S.nib, E = C.ENV, held = S.letters.find((l) => l.held), inHole = N.phase === "slide" || N.phase === "cmp";
  const G = C.GRIP, nib = { at: [N.p[0], N.p[1], C.TOP], heading: N.hd, lean: inHole ? G.lean[1] : G.lean[0], look: [0, -6], eyes: S.read && S.read.found && N.phase !== "cmp" ? "happy" : "open" };
  if (N.walk && !held) Object.assign(nib, { stance: "four", stride: { phase: N.walk / 5, amount: 0.13 } });
  else if (N.walk) Object.assign(nib, { stride: { phase: N.walk / 5, amount: 0.1 } });
  if (held) {
    const h = (N.hd * Math.PI) / 180, f = [Math.cos(h), Math.sin(h)], s = [-f[1], f[0]], z = held.pos[2] + E.t;
    const near = [N.p[0] + f[0] * G.ahead, N.p[1] + f[1] * G.ahead];
    const py = Math.max(held.pos[1] - E.d / 2 + 1, Math.min(held.pos[1] + E.d / 2 - 0.8, N.p[1] - 1));
    nib.paws = inHole && !held.turn ? { l: [held.pos[0] + E.l / 2 - 2.4, py, z], r: [held.pos[0] + E.l / 2 - 1, py, z] }
      : { l: [near[0] + s[0] * G.side, near[1] + s[1] * G.side, z], r: [near[0] - s[0] * G.side, near[1] - s[1] * G.side, z] };
  }
  return { rocky, knock, nib, grip, hit };
}
