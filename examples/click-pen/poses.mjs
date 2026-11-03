// The crew, posed each frame from the state that moves their parts; serialized into the page too.
// Rocky's claws are the notch's hold on the lug beside him; Roo's paws push the refill's collar up.
export function poses(C, S, D, F) {
  const Q = C.CREW, RAD = Math.PI / 180, L = D.lug, [A0] = C.WIN_A;
  const smooth = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
  // How firmly Rocky has the lug: full while it sits by the notch, letting go as it turns away.
  const grip = smooth((22 - L.near.off) / 10) * smooth((L.h - (C.Z0 + 0.6)) / 1.2);
  const lerp = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
  const out = C.Z0 + C.NOTCH_H, edge = Q.rocky.edge, r = C.ROTOR.lugOut + 0.1;
  const restL = F.pt(r, edge, out - 0.9), restR = F.pt(r, edge, out - 2.5);
  const onL = F.pt(r, L.near.a0, L.h - 0.9), onR = F.pt(r, L.near.a0, L.h - 2.5);
  const rocky = {
    at: Q.rocky.at || F.pt(Q.rocky.r, Q.rocky.a, A0),
    heading: Q.rocky.heading,
    paws: { l: lerp(restL, onL, grip), r: lerp(restR, onR, grip) },
    lean: 4 * grip,
    eyes: S.duty === "rocky" && grip < 0.9 ? "wide" : "open",
  };
  // Roo stands on the nose's seat ring under the collar: crouched when the tip is out, tall when it's in.
  const lift = D.collar - C.SPRING.seat, rAt = Q.roo.at || F.pt(Q.roo.r, Q.roo.a, C.SPRING.seat);
  const u0 = F.rad(0), v0 = F.tan(0), ra = Math.atan2(rAt[0] * v0[0] + rAt[1] * v0[1], rAt[0] * u0[0] + rAt[1] * u0[1]) / RAD;
  const roo = {
    at: rAt,
    heading: Q.roo.heading,
    lean: Math.max(-8, Math.min(22, 26 - lift * 3.4)),
    squash: Math.max(0, Math.min(1, (8.6 - lift) / 4.5)),
    look: [0, 12],
    paws: { l: F.pt(2.1, ra - 9, D.collar - 0.1), r: F.pt(2.1, ra + 9, D.collar - 0.1) },
    eyes: S.duty === "roo" ? (S.hV > 0 ? "happy" : "wide") : "open",
    tailSway: -0.2,
  };
  return { rocky, roo };
}
