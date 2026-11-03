// Where the crew stand and what they hold, from the same state that moves the parts. Serialized into the page, so it uses only C, S and D.
export function poses(C, S, D, X) {
  const Q = X || {}, bz = C.ZC0 + 1.5 + S.zc, [mx] = C.MO_BAR;
  const mo = {
    at: [mx + (Q.moDx ?? 0), -10 + (Q.moDy ?? 1), bz - (Q.moDrop ?? 17)],
    heading: Q.moH ?? 15,
    stance: "hang",
    look: [0, -6],
    paws: { l: [mx - 3, -10, bz + 0.6], r: [mx + 3, -10, bz + 0.6] },
    eyes: S.q > 0.05 ? "wide" : S.duty === "mo" ? "open" : S.t > 0.3 ? "shut" : "open",
  };
  const st = D.stand, pin = D.catchPin, hold = S.cocked && S.press < 0.3;
  const pinch = {
    at: [st[0] + (Q.pinchDx ?? 0.5), st[1] + (Q.pinchDy ?? 0), st[2]],
    heading: Q.pinchH ?? 60,
    lean: hold ? 6 : -10 * S.press,
    paws: hold || Q.reach ? { l: [pin[0] - 0.8, pin[1], pin[2]], r: [pin[0] + 0.8, pin[1], pin[2]] } : undefined,
    eyes: S.duty === "pinch" ? "wide" : hold ? "open" : "happy",
  };
  const pk = C.PERCH;
  const knock = {
    at: [pk[0] + (Q.knockDx ?? 0), pk[1] + (Q.knockDy ?? 0), pk[2]],
    heading: Q.knockH ?? 330,
    beak: D.head,
    wings: S.duty === "knock" ? 0.3 : 0,
    eyes: S.ring > 0.3 ? "wide" : "open",
  };
  return { mo, pinch, knock };
}
