// ---------------------------------------------------------------- the motor and the rotor

// The motor: a ribbed can on the arm's end with a brush box on top, its terminal where Volta's snout touches.
// The rotor: a brass flywheel on the motor's shaft, a hub with an outer bearing cap, six lightening holes
// in its web and balance holes drilled in its rim, all turning with the spin and blurring with speed.
export function rotorOf(K, P, C, S, X) {
  const { V, dot, add, mul, side, dir, up, O, arm, solid, line, item } = X;
  const B = C.BAR, Ro = C.ROTOR, s0 = Ro.at - Ro.w / 2, s1 = Ro.at + Ro.w / 2, rF = K.frameAlong(O, dir);
  const Fb = K.frameOf(O, dir, side, up);
  // The motor can, its cooling ribs, and the brush box with its spring cap and the lead's terminal screw.
  let m = solid(K.solidOf([[B.to - 2, 4.6], [B.to - 1.4, 6.2, 1], [s0 - 0.6, 6.2, 1], [s0, 5]], rF, P), { tone: "mid", inner: K.fadedSvg(K.ribsOf(rF, B.to + 0.6, s0 - 1.6, 6.2, 36, P, { fade: [0.04, 0.42], seams: true }), { tone: "faint" }) });
  m += solid(K.prismOf(Fb, [[-1.8, 5.8], [1.8, 5.8], [1.8, 8.4], [-1.8, 8.4]], B.to + 0.4, B.to + 3.6, P), { tone: "hi" });
  m += solid(K.disc(8.4, 9.4, 1.1, K.frameOf(arm(B.to + 2, 0, 0), up, dir, side), P), { tone: "mid" });
  m += K.dotsSvg([K.iso(arm(B.to + 1, 0, 9.4), P), K.iso(arm(B.to + 2, X.facing * 1.8, 7.1), P)], { size: 0.45, tone: "lo" });
  item("motor", arm(B.to + 2), m);
  const blur = Math.min(1, S.w / 120);
  const hub = (s, e) => solid(K.solidOf([[s, 7.4], [s + e * 1.2, 7.4, 1], [s + e * 2.2, 5.2]], rF, P), { tone: "mid" }) + solid(K.disc(s + e * 2.2, s + e * 3.6, 3.2, rF, P), { tone: "hi" });
  let ro = `<g class="gy-brass">${solid(K.solidOf([[s0, Ro.R - 1.4], [s0 + 0.7, Ro.R, 1], [s1 - 0.7, Ro.R, 1], [s1, Ro.R - 1.4]], rF, P), { tone: "hi" })}`;
  const out_ = dot(dir, V) > 0, fs = out_ ? s1 : s0;
  // The web: a rim band, a groove where the web meets the hub, and the hub's face ring.
  ro += line(K.circleOf(rF, fs, Ro.R - 4, P, 72), { tone: "lo" }) + line(K.circleOf(rF, fs, Ro.R - 5.6, P, 72), { tone: "faint" }) + line(K.circleOf(rF, fs, Ro.hub + 1.5, P, 40), { tone: "faint" });
  const circ = (c, r, n = 20) => Array.from({ length: n }, (_, j) => K.iso(add(c, mul(side, r * Math.cos((j / n) * 6.283)), mul(up, r * Math.sin((j / n) * 6.283))), P));
  let holes = "";
  for (let i = 0; i < 6; i++) { const t = S.psi + 0.52 + (i * Math.PI) / 3; holes += K.pathOf(circ(add(arm(fs), mul(side, 14.4 * Math.cos(t)), mul(up, 14.4 * Math.sin(t))), 3.4), true); }
  if (blur < 0.98) ro += `<path class="gy-void" d="${holes}" opacity="${(1 - blur).toFixed(2)}"/>`;
  if (blur > 0.02) ro += `<path class="gy-void" fill-rule="evenodd" d="${K.pathOf(circ(arm(fs), 17.8, 64), true) + K.pathOf(circ(arm(fs), 11, 48).reverse(), true)}" opacity="${(0.6 * blur).toFixed(2)}"/>`;
  // Six bolts on a ring round the hub, and the balance holes drilled into the rim, both fading with speed.
  const bolts = [];
  for (let i = 0; i < 6; i++) { const t = S.psi + (i * Math.PI) / 3; const p = K.iso(add(arm(fs), mul(side, 9.6 * Math.cos(t)), mul(up, 9.6 * Math.sin(t))), P); bolts.push([p[0], p[1], 1 - 0.8 * blur]); }
  ro += K.dotsSvg(bolts, { size: 0.9, tone: "lo" });
  const drill = K.dotsOf(rF, Ro.at, Ro.R, 16, P, { phase: S.psi, fade: [0.04, 0.42] }).map((p) => [p[0], p[1], (p[2] ?? 1) * (1 - 0.9 * blur)]);
  ro += K.dotsSvg(drill, { size: 0.75, tone: "lo" });
  ro += line(K.arcOf(rF, s0 + 2.2, Ro.R, P), { tone: "faint" }) + line(K.arcOf(rF, s1 - 2.2, Ro.R, P), { tone: "faint" });
  ro += `</g>`;
  // The outer bearing cap and its nut; on the inner side the motor can's lip is the bearing.
  ro = out_ ? ro + hub(s1, 1) : hub(s1, 1) + ro;
  if (out_) ro += K.dotsSvg([K.iso(arm(s1 + 3.6), P)], { size: 0.7, tone: "lo" });
  item("rotor", arm(Ro.at), ro);
}
