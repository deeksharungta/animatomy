// The crew's poses, from the same state that moves their parts. Inlined into the page; uses only its arguments.
// G: governor(...), B: breaker(...), I: isolator(...), N: instruments(...).
export function poses(C, S, G, B, I, N) {
  const lerp = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
  const [e1, e2] = G.ends, on = (x) => lerp(e1, e2, (x - e1[0]) / (e2[0] - e1[0]));
  // Mo hangs from the governor's floating lever and rides it: up when the flyballs close the valve, down to open it.
  const g0 = on(C.MO_X[0]), g1 = on(C.MO_X[1]);
  const mo = {
    at: [(g0[0] + g1[0]) / 2 + 0.4, g0[1] + (C.MO_DY ?? 1.6), (g0[2] + g1[2]) / 2 - C.MO_DROP],
    heading: C.MO_HEAD, stance: "hang", lean: -2, look: [-10, 10],
    paws: { l: [g0[0], g0[1], g0[2] + 0.9], r: [g1[0], g1[1], g1[2] + 0.9] },
    eyes: S.f < 1 && !S.field ? "shut" : S.f > 50.6 && !S.synced ? "wide" : "open",
  };
  // Volta lies in the field cable's tray with his snout at the brush gear's terminal: his charge is the field current.
  const amps = S.If / 300;
  const volta = {
    path: C.VOLTA_PATH,
    charge: Math.min(1, amps),
    flicker: amps > 0.02 ? Math.floor(S.clock * 14) : 0,
    target: amps > 0.02 ? C.FIELD_TERM : undefined,
    eyes: amps < 0.02 ? "shut" : S.synced && S.P > 5 ? "happy" : "open",
  };
  // Crumb walks round the synchroscope's face pushing the pointer by its T-handle, at the slip frequency.
  const pa = Math.atan2(N.tab.d[1], N.tab.d[0]), tg = pa - Math.PI / 2 + C.CRUMB_TURN, hc = [Math.cos(tg), Math.sin(tg)];
  const crumb = {
    at: [N.tab.p[0] - C.CRUMB_BACK * hc[0], N.tab.p[1] - C.CRUMB_BACK * hc[1], C.DESK.z + 1.8], heading: (tg * 180) / Math.PI, lean: 0, look: [0, -10],
    paws: { l: N.tab.ends[0], r: N.tab.ends[1] },
    stride: { phase: S.ptr * 4, amount: S.E > 0.3 && !S.closed ? 0.1 : 0 },
    eyes: S.synced ? "happy" : S.E < 0.3 ? "shut" : "open",
  };
  // Roo stands on the mechanism's footplate: she stamps it down to close, and the opening spring throws her up.
  const roo = {
    at: [B.foot[0] - 0.5, B.foot[1] + 0.5, B.foot[2]], heading: C.ROO_HEAD,
    lean: S.cbCmd === "close" ? 12 : 2, look: [0, S.cbCmd === "close" ? -12 : 4],
    squash: S.cbCmd === "close" ? 0.35 : S.closed ? 0.12 : 0,
    hop: S.hop * 5,
    eyes: S.hop > 0.3 ? "wide" : S.closed && S.P > 5 ? "happy" : "open",
  };
  // Pinch sits on the interlock housing and grips the bolt's knob: in while the breaker is closed.
  const pinch = {
    at: [I.knob[0] + C.PINCH_DX, -57.5 + C.PINCH_DY, C.GBX.z + 11], heading: C.PINCH_HEAD,
    paws: { l: [I.knob[0] + 0.3, I.knob[1] - 0.6, I.knob[2] - 0.4], r: [I.knob[0] + 0.3, I.knob[1] + 0.6, I.knob[2] - 0.4] },
    squash: S.dsTry > 0.05 ? 0.25 : 0, lean: S.dsTry > 0.05 ? -10 : 0,
    eyes: S.airOn ? "wide" : S.dsTry > 0.05 ? "wide" : "open",
  };
  return { mo, volta, crumb, roo, pinch };
}
