// What changes each frame, as markup: the turning shaft, the cone's flutes, the head's ribs and knob knurl, the race
// balls, the corns in the flutes, the cracked pieces, the falling pepper and the pile. Serialized into the page.
export function dynamic(K, P, C, S) {
  const rad = (d) => (d * Math.PI) / 180;
  const polar = (a, r, z) => [r * Math.cos(rad(a)), r * Math.sin(rad(a)), z];
  const at = (p) => K.iso(p, P);
  const coneR = (u) => {
    const T = C.CONE;
    for (let i = 1; i < T.length; i++) if (u <= T[i][0]) return T[i - 1][1] + ((T[i][1] - T[i - 1][1]) * (u - T[i - 1][0])) / (T[i][0] - T[i - 1][0]);
    return T[T.length - 1][1];
  };
  const out = {};
  const zcb = C.CONE_Z + S.s - S.kick, zy = C.YOKE_Z + S.s, phi = S.phi;
  const zframe = (z, a = 0) => K.frameOf([0, 0, z], [0, 0, 1], [Math.cos(a), Math.sin(a), 0], [-Math.sin(a), Math.cos(a), 0]);
  const w = C.SHAFT, sq = [[-w, -w], [w, -w], [w, w], [-w, w]];
  const shaft = (z0, z1, lit) => K.solidSvg(K.prismOf(zframe(z0, phi), sq, 0, z1 - z0, P), { tone: "hi", lit, crease: "lo" });
  out.shaftLow = shaft(zy, zcb - C.RACE_H, false);
  out.shaftMid = shaft(zcb + 63, C.BUSH, false);
  out.shaftHigh = shaft(C.BUSH + 8, C.HEAD_Z + 2, false);
  // Fine flutes in the grinding zone, three coarse feed flutes above; both turn with the cone.
  const F = zframe(zcb);
  const fine = K.ribsOf(F, 0, 20, coneR(0), 54, P, { phase: phi, twist: 0.35, r1: coneR(20), fade: [0.1, 0.55] });
  const coarse = K.ribsOf(F, 20, 56, coneR(20), 18, P, { phase: phi, twist: 0.9, r1: coneR(56), fade: [0.05, 0.5] });
  // The flutes are the cone's own texture, drawn under its outline so the edge stays whole where they meet it.
  out.cone = K.solidSvg(K.solidOf(C.CONE, F, P, { fill: "hull" }), { tone: "hi", crease: "lo", lit: S.lit === "cone", inner: K.fadedSvg(fine, { tone: "lo" }) + K.fadedSvg(coarse, { tone: "mid" }) });
  out.flutes = "";
  const balls = [];
  for (let i = 0; i < 12; i++) { const a = phi / 2 + (i / 12) * Math.PI * 2; const p = [24.5 * Math.cos(a), 24.5 * Math.sin(a), C.CONE_Z - 0.2]; if (Math.cos(a - rad(45)) > 0.1) balls.push(at(p)); }
  out.balls = K.dotsSvg(balls, { size: 0.8, tone: "mid" });
  const H = zframe(C.HEAD_Z);
  out.headRibs = K.fadedSvg(K.ribsOf(H, 3, 16, 56.4, 48, P, { phase: phi, r1: 55, fade: [0.1, 0.55] }), { tone: "lo" });
  const Kn = zframe(C.KNOB_Z);
  const kp = phi + S.knob;
  const pin = [0, Math.PI].map((d) => [Math.cos(kp + d), Math.sin(kp + d)]).filter(([c, s]) => c + s > 0.2).map(([c, s]) => at([5.7 * c, 5.7 * s, zcb + 61]));
  out.pin = K.dotsSvg(pin, { size: 0.9, tone: "mid" });
  const pt = [Math.cos(kp), Math.sin(kp)];
  out.pointer = Math.cos(kp - Math.PI / 4) > -0.2 ? K.dotsSvg([at([10.4 * pt[0], 10.4 * pt[1], C.KNOB_Z + 10])], { size: 0.9, tone: "hi" }) : "";
  out.knobRibs = K.fadedSvg(K.ribsOf(Kn, 1.5, 8.5, 11, 28, P, { phase: phi + S.knob, fade: [0.1, 0.55], seams: true }), { tone: "lo" });
  // Corns: each flute carries one, sitting on the coarse zone against the cone; a new one drops in from the heap.
  const corn = (c, r) => K.solidSvg(K.sphereOf(c, r, P, { steps: 20 }), { tone: "hi" });
  const back = [], front = [];
  const cz = zcb + C.CORN_U, cr = coneR(C.CORN_U) + C.CORN_R;
  for (let i = 0; i < C.FLUTES; i++) {
    const f = S.flutes[i];
    if (!f.has) continue;
    const a = (phi * 180) / Math.PI + i * (360 / C.FLUTES);
    const g = Math.min(1, f.grow);
    const p = polar(a, cr + 3 * (1 - g), cz + 9 * (1 - g) * (1 - g));
    (Math.cos(rad(a - 45)) > 0 ? front : back).push([K.depthOf(p, P), corn(p, C.CORN_R)]);
  }
  const sort = (l) => l.sort((x, y) => x[0] - y[0]).map((x) => x[1]).join("");
  out.cornsBack = `<g class="pg-corn">${sort(back)}</g>`;
  out.cornsFront = `<g class="pg-corn">${sort(front)}</g>`;
  // Cracked pieces: husk outside, the pale core showing on the broken face.
  const piece = (c) => {
    const pts = [];
    for (let i = 0; i < 5; i++) { const t = c.spin + (i / 5) * Math.PI * 2; const r = c.size * (0.75 + 0.25 * Math.cos(3 * t)); pts.push(at([c.x + r * Math.cos(t), c.y + r * Math.sin(t), c.z + r * 0.8 * Math.sin(t + 1)])); }
    return { d: K.pathOf(pts, true), core: K.pathOf(pts.slice(1, 4), true) };
  };
  const ps = S.frags.map(piece);
  out.frags = ps.length ? `<g class="iso-solid pg-corn"><path class="iso-fill" d="${ps.map((p) => p.d).join("")}"/><path class="iso-line iso-edge" data-tone="mid" d="${ps.map((p) => p.d).join("")}"/></g><g class="pg-core"><path class="iso-fill pg-core-fill" d="${ps.map((p) => p.core).join("")}"/></g>` : "";
  const dz = (list) => K.dotsSvg(list.map((d) => at([d.x, d.y, d.z])), { size: 0.75, tone: "mid" });
  out.dustBack = `<g class="pg-dust">${dz(S.dust.filter((d) => d.front === false))}</g>`;
  out.dustFront = `<g class="pg-dust">${dz(S.dust.filter((d) => d.front !== false))}</g>`;
  const pl = Math.min(1, S.pile), ph = 2 + 9 * pl, pr = 12 + 16 * pl;
  out.pileH = ph + pr;
  const mound = [[0, pr], [ph * 0.25, pr * 0.82, 1], [ph * 0.6, pr * 0.48, 1], [ph * 0.9, pr * 0.16, 1], [ph, 0]];
  const specks = [];
  for (let i = 0; i < 26; i++) { const a = i * 2.39996, f = Math.sqrt((i + 0.5) / 26), r = pr * 0.85 * f, h = ph * (1 - f * f * 0.95); if (Math.cos(a - Math.PI / 4) > -0.3 || f < 0.5) specks.push(at([r * Math.cos(a), r * Math.sin(a), C.Z0 + h])); }
  out.pile = `<g class="pg-dust">${K.solidSvg(K.solidOf(mound, zframe(C.Z0), P), { tone: "hi" })}${K.dotsSvg(specks, { size: 0.55, tone: "lo" })}</g>`;
  return out;
}
