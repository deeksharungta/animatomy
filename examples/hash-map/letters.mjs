// The letters: an envelope (or the lookup slip), flat in a hole or tray, or on the chute's slope. Serialized into
// the page, so it uses only K, P and C.
export function envelope(K, P, C, pos, kind = "env", slope = null, lit = false) {
  const E = kind === "env" ? C.ENV : C.SLIP, at = (p) => K.iso(p, P);
  const u = slope ? slope.u : [0, 1, 0], v = slope ? slope.v : [0, 0, 1], F = K.frameOf(pos, [1, 0, 0], u, v);
  const pt = (s, w, h = E.t) => at([0, 1, 2].map((i) => pos[i] + s * (i === 0) + u[i] * w + v[i] * h));
  const body = K.solidSvg(K.prismOf(F, [[-E.d / 2, 0], [E.d / 2, 0], [E.d / 2, E.t], [-E.d / 2, E.t]], -E.l / 2, E.l / 2, P), { tone: "hi", lit });
  const l2 = E.l / 2, d2 = E.d / 2;
  if (kind !== "env") return `<g class="hm-slip">${body}${K.lineSvg([0, 1, 2].map((j) => K.pathOf([pt(-l2 + 2, d2 - 2 - j * 1.8), pt(-l2 + 2 + [7, 5, 6][j], d2 - 2 - j * 1.8)])).join(""), { tone: "mid", free: true })}</g>`;
  const flap = K.lineSvg(K.pathOf([pt(-l2, -d2), pt(0, -d2 + E.d * 0.42), pt(l2, -d2)]), { tone: "mid" });
  const rules = K.lineSvg([0, 1, 2].map((j) => K.pathOf([pt(-2.5, 1.2 + j * 1.7), pt(-2.5 + [8, 6.5, 5][j], 1.2 + j * 1.7)])).join(""), { tone: "mid", free: true });
  const SF = K.frameOf([0, 1, 2].map((i) => pos[i] + (l2 - 3) * (i === 0) + u[i] * (d2 - 2.6) + v[i] * E.t), [1, 0, 0], u, v);
  const stamp = K.solidSvg(K.prismOf(SF, [[-1.8, 0], [1.8, 0], [1.8, 0.2], [-1.8, 0.2]], -1.6, 1.6, P), { tone: "hi" });
  return `<g class="hm-env">${body}${flap}${rules}</g><g class="hm-stamp">${stamp}</g>`;
}
