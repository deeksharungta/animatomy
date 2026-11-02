// Where the crew stand and what their paws hold, from the same state that moves the parts.
// Serialized into the page, so it uses only C and S.
export function poses(C, S) {
  const kx = C.SLIDE.x0 - C.HANDLE + S.stroke;
  const g = [kx, C.KNOB_Y + 2.5, C.ZB + 8];
  const pushing = S.pushV;
  const pip = {
    at: [kx - C.PIP_AT[0], C.PIP_AT[1], C.DECK_Z],
    heading: 0,
    lean: pushing > 0 ? 12 : pushing < 0 ? -6 : 2,
    look: [-10, -6],
    paws: { l: [g[0] - 0.6, g[1] + 0.4, g[2] + 1.2], r: [g[0] + 0.6, g[1] + 0.4, g[2] - 0.6] },
    stride: { phase: kx / 6, amount: pushing ? 0.11 : 0 },
    eyes: pushing && S.n === 0 && !S.pocket ? "wide" : "open",
    tailSway: 0.3 * Math.sin(kx / 3),
  };
  const th = S.crank;
  const knob = [C.KNOB_X, C.SHAFT.y + C.CRANK.r * Math.cos(th), C.SHAFT.z + C.CRANK.r * Math.sin(th)];
  const mo = {
    at: C.MO_AT,
    heading: C.MO_HEADING,
    lean: 4 + 3 * Math.sin(th),
    look: [-6, 4],
    paws: { l: [knob[0] - 1.1, knob[1], knob[2]], r: [knob[0] + 1.1, knob[1], knob[2]] },
    eyes: S.t <= 0 ? "open" : S.n >= C.CAP ? "happy" : "open",
  };
  return { pip, mo, knob, grip: g };
}
