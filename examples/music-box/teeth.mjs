// The comb's 18 teeth, each a steel reed from its root in the base to its tip at the cylinder, drawn each frame:
// lifted by its pin (tipped about the root), then ringing once the pin lets it go. A ringing tooth shows its swing
// as a pale wedge to either side and, between duties, takes the lit accent. Lead weights hang under the six bass
// teeth. Serialized into the page as it stands.
export function teethOf(K, P, C, S) {
  const M = C.COMB, out = [], ring = [];
  for (let i = 0; i < M.n; i++) {
    const L = C.LEN[i] + 1.2, x = C.TX[i] - M.toothW / 2, y0 = M.tipY + L;
    const tip = Math.atan2(S.lift[i], L), u = [0, -Math.cos(tip), Math.sin(tip)], v = [0, Math.sin(tip), Math.cos(tip)];
    const F = K.frameOf([x, y0, M.z - M.t], [1, 0, 0], u, v);
    const poly = [[0, 0], [L, 0.35], [L, M.t], [0, M.t]];
    const amp = S.amp[i], lit = S.litTeeth && amp > 0.3;
    let html = "";
    if (i < 6) html += K.solidSvg(K.prismOf(F, [[L - 10 + (i >> 1) * 2, -2.4], [L - 3, -2.4], [L - 3, 0.05], [L - 10 + (i >> 1) * 2, 0.05]], 0.4, M.toothW - 0.4, P), { tone: "mid", crease: "lo" });
    html += K.solidSvg(K.prismOf(F, poly, 0, M.toothW, P), { tone: amp > 0.08 ? "hi" : "mid", crease: "lo", lit });
    out.push(html);
    if (amp > 0.06) {
      // The swing: the tooth's top face ghosted at the top and bottom of its stroke, fanning out from the root.
      const sw = amp * 1.1, at = (s, w, dx = 0) => K.iso([x + dx, y0 - s, M.z + w], P), op = Math.min(0.5, amp * 0.4).toFixed(2);
      for (const d of [sw, -sw]) ring.push(`<path class="mb-ring" opacity="${op}" d="${K.pathOf([at(0, 0), at(0, 0, M.toothW), at(L, d, M.toothW), at(L, d)], true)}"/>`);
    }
  }
  return out.join("") + ring.join("");
}
