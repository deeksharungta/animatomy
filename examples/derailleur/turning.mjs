// The wheel turns with the cassette as you pedal: its spokes, nipples and valve at the cassette's angle.
// Serialized into the page, so it uses only its arguments.
export function turning(K, P, C, Q, S) {
  const out = {}, T = 6.2832, line = K.lineSvg, solid = K.solidSvg, W = C.WHEEL, rr = W.rim - 9;
  const pt = (r, a, y, c = [0, 0]) => [c[0] + r * Math.cos(a), y, c[1] + r * Math.sin(a)];
  // Fourteen spokes a side, laced one-cross from the hub's flanges to the rim; the drive side ends in its nipples.
  const spokes = (yf, phase, nip) => {
    const d = [], dots = [];
    for (let i = 0; i < 14; i++) {
      const a = S.cas + (i / 14) * T + phase, b = a + (i % 2 ? 0.55 : -0.55);
      d.push(K.segment(pt(22, a, yf), pt(rr, b, -1), P));
      if (nip) dots.push(Q.at(pt(rr, b, -1)));
    }
    return line(d.join(""), { tone: "faint" }) + (nip ? K.dotsSvg(dots, { size: 0.75, tone: "lo" }) : "");
  };
  out.spokesN = spokes(-32, 0.35, false);
  const av = S.cas + 1.9;
  out.spokesD = spokes(4, 0.13, true) + solid(Q.bar3(pt(rr, av, -1), pt(rr - 22, av, -1), 1.3, 1.3, [0, 1, 0]), { tone: "hi" }) +
    solid(Q.bar3(pt(rr - 4, av, -1), pt(rr - 8, av, -1), 2.6, 2.6, [0, 1, 0]), { tone: "mid" });
  return out;
}
