// The crew's poses, from the same state that moves their parts. Inlined into the page; uses only its arguments.
// V: valveLive(...), B: breakerLive(...), I: isolatorLive(...).
export function poses(C, S, V, B, I) {
  const Z = C.DECK_Z, A = C.AT;
  // Ollie stands on the valve's bonnet inside the yoke and heaves the crosshead up: he is the servo's push.
  const effort = Math.min(1, S.lift * 1.6);
  const ollie = {
    at: [C.VALVE.x + A.ollie[0], C.VALVE.y + A.ollie[1], Z + 20], heading: A.ollie[2], lean: -4 - 6 * effort, look: [0, 18],
    paws: { l: V.paws[0], r: V.paws[1] }, squash: 0.3 * (1 - effort),
    eyes: S.f < 1 && S.lift < 0.01 ? "shut" : S.lift < S.g - 0.25 ? "wide" : S.lift > 0.8 ? "happy" : "open",
  };
  // Volta lies in the field trunking with his snout on the terminal: his charge is the field current.
  const amps = S.If / 2800;
  const volta = {
    path: C.VOLTA_PATH, charge: Math.min(1, amps * 1.4),
    flicker: amps > 0.02 ? Math.floor(S.clock * 14) : 0,
    target: amps > 0.02 ? C.FIELD_TERM : undefined,
    eyes: amps < 0.02 ? "shut" : S.synced && S.P > 300 ? "happy" : "open",
  };
  // Bun and Mochi run on the bottom of the pump's wheel: their running is the pump turning.
  const W = C.PUMP, run = Math.min(1, S.pump * 1.2);
  const ham = (deg, phase) => {
    const a = (deg * Math.PI) / 180, rr = W.r - 0.9;
    return {
      at: [W.x + rr * Math.sin(a), W.y - 0.8, W.z - rr * Math.cos(a)], heading: 0, stance: "four", lean: 4 * run, look: [8, 0],
      stride: { phase: (S.wheel * W.r) / 3 + phase, amount: 0.13 * run },
      eyes: S.pump < 0.04 ? "shut" : "open", squash: S.pump < 0.04 ? 0.35 : 0,
    };
  };
  // Roo stands on the mechanism's footplate: she stamps it down to close, and the opening spring throws her up.
  const roo = {
    at: [B.foot[0] + A.roo[0], B.foot[1] + A.roo[1], B.foot[2]], heading: A.roo[2],
    lean: S.cbCmd === "close" ? 12 : 2, look: [0, S.cbCmd === "close" ? -12 : 4],
    squash: S.cbCmd === "close" ? 0.35 : S.closed ? 0.12 : 0, hop: S.hop * 1.4,
    eyes: S.hop > 0.3 ? "wide" : S.closed && S.P > 300 ? "happy" : "open",
  };
  // Pinch stands on the drive's gearbox and grips the interlock bolt's knob: in while the breaker is closed.
  const pinch = {
    at: [I.knob[0] + A.pinch[0], I.knob[1] + A.pinch[1], C.DSM.z + 5.2], heading: A.pinch[2],
    paws: { l: [I.knob[0], I.knob[1] - 0.5, I.knob[2]], r: [I.knob[0], I.knob[1] + 0.5, I.knob[2]] },
    squash: S.dsTry > 0.05 ? 0.25 : 0, lean: S.dsTry > 0.05 ? -10 : 0,
    eyes: S.airOn || S.dsTry > 0.05 ? "wide" : "open",
  };
  return { ollie, volta, bun: ham(-16, 0.5), mochi: ham(16, 0), roo, pinch };
}
