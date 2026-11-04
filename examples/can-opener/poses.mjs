// The crew, posed each frame from the state that moves their parts; serialized into the page as it stands.
// Chomp is the cutter: his feet are on the shoe that hangs from the lever, his bite is on the lid at the cut point.
// Bun and Mochi run in the wheel; Roo stands on the spring shelf with his paws on the pad under the lever.
export function poses(C, S) {
  const lv = (p) => {
    const a = C.THETA * (1 - S.lev), [px, , pz] = C.PIVOT, dx = p[0] - px, dz = p[2] - pz;
    return [px + dx * Math.cos(a) - dz * Math.sin(a), p[1], pz + dx * Math.sin(a) + dz * Math.cos(a)];
  };
  const Q = C.PLACE;
  const rad = (d) => (d * Math.PI) / 180;
  const cut = [C.CAN.x + C.CUT_R * Math.cos(rad(C.CUT_A)), C.CAN.y + C.CUT_R * Math.sin(rad(C.CUT_A)), C.CAN.lid - 0.6];
  const chew = S.cutting ? Math.sin(S.t * 22) : 0;
  const chomp = {
    at: lv(Q.chomp.at),
    heading: Q.chomp.heading,
    lean: Q.chomp.lean + 3 * chew,
    squash: S.cutting ? 0.06 + 0.04 * chew : 0,
    bite: lv(cut),
    eyes: S.free && S.lev < 0.5 ? "happy" : S.cutting ? "open" : S.idle > 2.5 ? "shut" : S.lev > 0.05 ? "wide" : "open",
    tailSway: S.cutting ? 0.5 * Math.sin(S.t * 3) : 0,
  };
  const W = C.WHEEL, run = Math.min(1, S.omega * 1.3);
  const ham = (offset, phase) => {
    const a = rad(offset), rr = W.r - 1.2;
    return {
      at: [(W.x0 + W.x1) / 2, rr * Math.sin(a), W.z - rr * Math.cos(a)],
      heading: 90,
      stance: "four",
      lean: 4 * run,
      look: [8, 0],
      stride: { phase: (-S.wheel * W.r) / 5 + phase, amount: 0.13 * run },
      eyes: S.omega < 0.04 ? (S.idle > 1.5 ? "shut" : "open") : S.omega > 0.9 ? "open" : "wide",
      squash: S.omega < 0.04 && S.idle > 1.5 ? 0.3 : 0,
    };
  };
  const pads = [lv([C.PAD.x - 2, C.PAD.y, C.PAD.z]), lv([C.PAD.x + 2, C.PAD.y, C.PAD.z])];
  // Roo's squash is the spring's: the gap from shelf to pad over the gap at rest.
  const gap = (lev) => { const a = C.THETA * (1 - lev), dx = C.PAD.x - px, dz = C.PAD.z - pz; return pz + dx * Math.sin(a) + dz * Math.cos(a) - Q.roo.at[2]; };
  const [px, , pz] = C.PIVOT;
  const roo = {
    at: Q.roo.at,
    heading: Q.roo.heading,
    lean: 4 * S.lev,
    squash: 1 - gap(S.lev) / gap(0),
    look: [0, 16],
    paws: { l: pads[0], r: pads[1] },
    eyes: S.throwT < 0.6 ? "wide" : S.lev > 0.95 ? "shut" : S.idle > 2.5 ? "shut" : "open",
    tailSway: -0.3 * S.lev,
  };
  return { chomp, bun: ham(-16, 0.5), mochi: ham(16, 0), roo, cut: chomp.bite, pads };
}
