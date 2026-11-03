// What turns: the LP turbine's last-stage blades and the coupling, the generator rotor's slot wedges, the oil
// pump's wheel and the cooler fans. Inlined into the page, so each function uses only its arguments.
export function spinning(K, P, C, S, T) {
  const X = [1, 0, 0], out = {}, a = S.spin, AY = C.AY, SH = C.SH;
  // Last-stage blades of the double-flow LP: one row at each end, the longest blades in the machine.
  const rows = [];
  for (const [x, dir] of [[-247, -1], [-215, 1]]) {
    const F = K.frameAlong([x, AY, SH], X);
    rows.push(T.S(K.disc(-0.8, 0.8, 11, F, P), { tone: "mid" }));
    rows.push(T.Ln(K.spokesOf(F, 0.8, 11, 26, 44, P, { phase: a * dir, sweep: 0.18 * dir }), { tone: "lo" }));
    rows.push(T.Ln(K.circleOf(F, 0.8, 26, P), { tone: "lo" }));
  }
  out.lp = rows.join("");
  const Fc = K.frameAlong([-188.2, AY, SH], X);
  out.cpl = T.D(K.dotsOf(Fc, 0, 6.6, 10, P, { phase: a, fade: [0.04, 0.42] }), { size: 0.5, tone: "mid" });
  // Rotor: the slot wedges and the two pole faces, turning with the shaft.
  const Fr = K.frameAlong([-160, AY, SH], X);
  out.rotor = K.fadedSvg(K.ribsOf(Fr, 0, 54, C.ROTOR + 0.02, 18, P, { phase: a, fade: [0.08, 0.5] }), { tone: "lo" }) +
    T.Ln(K.ribsOf(Fr, 0, 54, C.ROTOR + 0.02, 2, P, { phase: a + 0.18, least: 0.05 }), { tone: "mid" });
  // The oil pump's wheel: rungs across the rim and spokes on the back ring, turning at the pump's speed.
  const W = C.PUMP, wr = W.r, y0 = W.y - W.w + 1.6, y1 = W.y + W.w - 2.4, rungs = [], spokes = [];
  for (let i = 0; i < 28; i++) { const t = S.wheel + (i / 28) * Math.PI * 2; rungs.push(K.segment([W.x + wr * Math.cos(t), y0, W.z + wr * Math.sin(t)], [W.x + wr * Math.cos(t), y1, W.z + wr * Math.sin(t)], P)); }
  for (let i = 0; i < 6; i++) { const t = S.wheel + (i / 6) * Math.PI * 2 + 0.26; spokes.push(K.segment([W.x + 3 * Math.cos(t), y0, W.z + 3 * Math.sin(t)], [W.x + wr * Math.cos(t), y0, W.z + wr * Math.sin(t)], P)); }
  out.wheel = T.Ln(spokes.join(""), { tone: "mid" }) + T.Ln(rungs.join(""), { tone: "mid" });
  // Fan blades under the radiator banks.
  const R = C.RAD, FY = C.TANK.y + C.TANK.d, fy = (FY + 2 + FY + 18) / 2, fz = R.z[0] - 6;
  out.fans = [44, 57, 70].map((x) => T.Ln(K.onTop([0, 1, 2, 3, 4].flatMap((i) => { const t = S.fan + (i / 5) * Math.PI * 2; return [[x + 5.5 + 1.6 * Math.cos(t), fy + 1.6 * Math.sin(t)], [x + 5.5 + 5 * Math.cos(t + 0.3), fy + 5 * Math.sin(t + 0.3)], [x + 5.5 + 1.6 * Math.cos(t + 0.5), fy + 1.6 * Math.sin(t + 0.5)]]; }), fz, P, true), { tone: "lo" })).join("");
  return out;
}

// The governor valve's crosshead and spindle, lifted by Ollie against the closing springs.
export function valveLive(K, P, C, S, T) {
  const V = C.VALVE, Z = C.DECK_Z, rest = Z + 28, lift = Math.min(1, S.lift) * V.lift, zc = rest + lift, out = {};
  out.cross = T.S(T.box(V.x - 6.6, V.y - 1.5, zc - 1, V.x + 6.6, V.y + 1.5, zc + 1, 0.3), { tone: "hi", lit: S.lit === "valve" }) +
    [-1, 1].map((d) => T.S(T.box(V.x + d * 7.5 - 1.4, V.y - 2, zc - 1.8, V.x + d * 7.5 + 1.4, V.y + 2, zc + 1.8, 0.3), { tone: "mid" })).join("") +
    T.D([T.at([V.x - 5, V.y + 1.5, zc]), T.at([V.x + 5, V.y + 1.5, zc])], { size: 0.45 });
  out.spindle = T.S(K.cylinder(V.x, V.y, 0.9, Z + 20, zc - Z - 21, P, 12), { tone: "hi", crease: "none" }) + T.S(K.cylinder(V.x, V.y, 0.9, zc + 1, Z + 46 - zc - 1, P, 12), { tone: "hi", crease: "none" });
  out.paws = [[V.x - 1.2, V.y + 0.6, zc - 1], [V.x + 1.2, V.y + 0.6, zc - 1]];
  // Inside the chest: the plug lifts off its seat by the same stroke (drawn small, behind the chest's window).
  out.lift = lift;
  return out;
}
