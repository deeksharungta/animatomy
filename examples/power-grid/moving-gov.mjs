// The governor and everything that turns with the shaft, drawn from the model's state. Inlined into the page,
// so it uses only its arguments (K: the kit, P: the camera, C: the numbers, S: the state, T: tools(K, P)).
// The flyballs' angle from the speed (a spring-loaded governor works across 48 to 52 Hz), the sleeve from the
// arms, the valve from the model, and the floating lever's fulcrum where the line between them crosses its post.
export function govGeom(C, S) {
  const { x } = C.GOV, top = C.GOV_TOP, L = C.ARM;
  const th = ((20 + 30 * Math.max(0, Math.min(1, (S.f - 48) / 4))) * Math.PI) / 180;
  const rb = L * Math.sin(th), zb = top - L * Math.cos(th);
  const zs = zb - Math.sqrt(L * L - (rb - 1.5) ** 2);
  const zv = C.LEVER.z + S.g * C.VALVE.lift;
  const xs = x + 2.2, xv = C.VALVE.x + 1.6, px = C.LEVER.pivot[0];
  return { th, rb, zb, zs, zv, xs, xv, px, zp: zs + ((zv - zs) * (px - xs)) / (xv - xs) };
}
export function governor(K, P, C, S, T) {
  const { x, y } = C.GOV, top = C.GOV_TOP, ly = y + 2.6;
  const { rb, zb, zs, zv, xs, xv, px, zp } = govGeom(C, S);
  const A = (S.spin * 0.5) % (Math.PI * 2);
  const V = [Math.cos((P.azimuth * Math.PI) / 180), Math.sin((P.azimuth * Math.PI) / 180)];
  const balls = [0, Math.PI].map((d) => {
    const a = A + d, c = Math.cos(a), s = Math.sin(a);
    const b = [x + rb * c, y + rb * s, zb], sl = [x + 1.5 * c, y + 1.5 * s, zs + 0.6];
    const svg = T.S(T.rodAB([x, y, top], b, 0.55, 8), { tone: "mid" }) + T.S(T.rodAB(b, sl, 0.45, 8), { tone: "mid" }) + T.S(T.ball(b, 2.4), { tone: "hi" });
    return { front: c * V[0] + s * V[1] > 0, svg };
  });
  const sp = T.helix(x, y, zs + 1.2, 99, 1.9, 5);
  const out = [];
  for (const b of balls) if (!b.front) out.push(b.svg);
  out.push(T.Ln(sp.back, { tone: "lo" }));
  out.push(T.S(K.cylinder(x, y, 0.9, 82, top - 82, P, 12), { tone: "hi", crease: "none" }));
  out.push(T.S(K.cylinder(x, y, 2.6, 99, 1.2, P, 18), { tone: "mid" }));
  out.push(T.S(K.cylinder(x, y, 2.2, zs - 2, 3.2, P, 18, 0.3), { tone: "hi", lit: S.lit === "sleeve" }));
  out.push(T.Ln(sp.front, { tone: "mid" }));
  for (const b of balls) if (b.front) out.push(b.svg);
  // The floating lever: sleeve fork, fulcrum block on the post (the speed changer), valve spindle.
  const back = [], front = [];
  back.push(T.S(K.cylinder(C.VALVE.x, y, 1, 80, zv - 80, P, 12), { tone: "hi", crease: "none" }));
  back.push(T.S(T.box(px - 2, y + 4, zp - 2.2, px + 2, y + 7, zp + 2.2), { tone: "mid" }));
  front.push(T.S(T.barAB([xs - 1.2, ly, zs - 0.2], [xv + 1.2, ly, zv], [0, 1, 0], 1.2, 2.2), { tone: "hi", lit: S.lit === "lever" }));
  front.push(T.S(T.rodAB([px, ly - 0.8, zp], [px, y + 4, zp], 0.7, 10), { tone: "mid" }));
  front.push(T.D([[xs, ly + 0.6, zs], [xv, ly + 0.6, zv]].map(T.at), { size: 0.6, tone: "mid" }));
  return { gov: out.join(""), leverBack: back.join(""), lever: front.join(""), zs, zv, zp, ends: [[xs - 1.2, ly, zs - 0.2], [xv + 1.2, ly, zv]] };
}

// Things that turn with the shaft: the coupling's bolts and the rotor's pole boundaries seen through the hatch.
export function spinning(K, P, C, S, T) {
  const A = S.spin, AY = C.AY, SH = C.SH;
  const bolts = [];
  for (let i = 0; i < 6; i++) { const a = A + (i / 6) * Math.PI * 2; bolts.push(T.at([C.CPL + 0.1, AY + 7.6 * Math.sin(a), SH + 7.6 * Math.cos(a)])); }
  const H = C.HATCH, R = C.ROTOR + 0.05, V = [0, Math.sin((P.azimuth * Math.PI) / 180), 0.5];
  const poles = [];
  for (let i = 0; i < 8; i++) {
    const a = A + (i / 8) * Math.PI * 2, n = [0, Math.sin(a), Math.cos(a)];
    if (n[1] * V[1] + n[2] * V[2] < 0.05) continue;
    poles.push({ d: T.seg([H.x0 - 4, AY + R * n[1], SH + R * n[2]], [H.x1 + 4, AY + R * n[1], SH + R * n[2]]), main: i % 2 === 0 });
  }
  return {
    bolts: T.D(bolts, { size: 0.7, tone: "lo" }),
    poles: T.Ln(poles.filter((p) => p.main).map((p) => p.d).join(""), { tone: "lo" }) + T.Ln(poles.filter((p) => !p.main).map((p) => p.d).join(""), { tone: "faint" }),
  };
}
