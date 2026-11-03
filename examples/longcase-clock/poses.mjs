// The crew, posed each frame from the same state that moves their parts; serialized into the page too.
// Mo hangs his weight on the going cord above the pulley; Pinch's claws are the anchor's pallets;
// Rocky holds the locking lever's tail; Knock's beak is the hammer's head.
export function poses(C, S, D, X) {
  const g = D.grip, pr = C.WEIGHT.pulley, Q = X || {};
  const plumb = {
    at: [g[0] + (Q.plumbDx ?? 0), g[1] + (Q.plumbDy ?? 1), g[2] - (Q.plumbDrop ?? 12)],
    heading: Q.plumbH ?? 45,
    stance: "hang",
    look: [0, -8],
    paws: { l: [g[0] - pr, g[1] + 0.4, g[2]], r: [g[0] + pr, g[1] + 0.4, g[2]] },
    eyes: S.wt <= C.WEIGHT.low + 0.5 && !S.winding ? "shut" : S.winding ? "wide" : "open",
  };
  const t = D.tips, mid = [(t[0][0] + t[1][0]) / 2, (t[0][1] + t[1][1]) / 2, (t[0][2] + t[1][2]) / 2];
  const pinch = {
    at: [mid[0] + (Q.pinchDx ?? 0), mid[1] + (Q.pinchDy ?? 4), mid[2] + (Q.pinchDz ?? -2.5)],
    heading: Q.pinchH ?? 30,
    lean: (S.th || 0) * 40,
    paws: Object.fromEntries([["l", t[0]], ["r", t[1]]].map(([n, p]) => [n, [mid[0] + (p[0] - mid[0]) * (Q.pinchF ?? 0.85), p[1] + 0.9, p[2] + 0.7]])),
    eyes: S.amp > 0.3 ? "open" : "shut",
  };
  const k = D.tailKnob, rk = C.PERCH.rocky;
  const rocky = {
    at: [rk[0] + (Q.rockyDx ?? -1.5), rk[1] + (Q.rockyDy ?? 0), rk[2] + (Q.rockyDz ?? 0)],
    heading: Q.rockyH ?? 120,
    lean: S.lever > C.LEVER.lift * 0.5 ? -6 : 4,
    look: [0, 14],
    paws: { l: [k[0] - 0.4, k[1], k[2] + 0.3], r: [k[0] + 0.4, k[1], k[2] - 0.2] },
    eyes: S.ring > 0.3 ? "wide" : S.locked ? "happy" : "open",
  };
  const kn = C.PERCH.knock;
  const knock = {
    at: [kn[0] + (Q.knockDx ?? 0), kn[1] + (Q.knockDy ?? 2), kn[2]],
    heading: Q.knockH ?? 120,
    beak: D.head,
    wings: S.ring > 0.4 ? 0.3 : 0,
    eyes: S.ring > 0.3 ? "wide" : "open",
  };
  return { plumb, pinch, rocky, knock };
}
