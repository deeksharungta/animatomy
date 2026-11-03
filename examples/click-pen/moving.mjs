// The parts that move, drawn from the model's state. Serialized into the page, so it uses only its
// arguments: X (the kit and lathe), P, C, K (the cam's numbers), the state S, the facet kit F and the frame.
export function drawn(X, P, C, K, S, F, PEN) {
  const out = {}, RAD = Math.PI / 180, solid = (faces, tone = "hi") => (faces.length ? X.solidSvg(F.solid(faces), { tone }) : "");
  const zF = (z) => X.frameOf([0, 0, z], PEN.a, PEN.u, PEN.v);
  const tube = (z0, z1, r, opts = {}) => (z1 - z0 > 0.01 ? X.solidSvg(X.solidOf([[0, r], [z1 - z0, r]], zF(z0), P), { tone: "hi", crease: "none", ...opts }) : "");
  const [A0, A1] = C.WIN_A, [B0, B1] = C.WIN_B, R = C.ROTOR, PL = C.PLUNGER, RF = C.REFILL;
  const h = C.Z0 + S.h, zp = C.Z0 + S.zp, ball = h - RF.top - RF.len;
  const ang = (u) => (u + 1) * 45;
  // The cam's four lugs: each a block on the cam's top whose fin rides the barrel's grooves.
  const lugBack = [], lugIn = [], lugFin = [];
  let near = null;
  for (let j = 0; j < 4; j++) {
    const a0 = ang(S.uc - K.wl) + 90 * j, a1 = ang(S.uc) + 90 * j, c = (a0 + a1) / 2;
    const top = (a) => h + K.m * ((a - a1) / 45);
    const angles = F.sweep(a0, a1, 2);
    const dz = (K.m / 45) / RAD, tilt = (r) => { const t = F.tan(c), g = dz / r; return [-t[0] * g, -t[1] * g, 1]; };
    const roof = (r0, r1) => angles.slice(0, -1).map((a, i) => ({ pts: [F.pt(r0, a, top(a)), F.pt(r1, a, top(a)), F.pt(r1, angles[i + 1], top(angles[i + 1])), F.pt(r0, angles[i + 1], top(angles[i + 1]))], n: tilt((r0 + r1) / 2) }));
    const zt = (a) => top(a), bodyTop = h - R.top, finLo = h - R.fin;
    const inner = [...roof(R.lugIn, R.r), ...F.side(a0, R.lugIn, R.r, bodyTop, top(a0), bodyTop, top(a0), -1), ...F.side(a1, R.lugIn, R.r, bodyTop, h, bodyTop, h, 1)];
    const fin = [...roof(R.r, R.lugOut), ...F.panel(R.lugOut, angles, () => finLo, zt, 1), ...F.side(a0, R.r, R.lugOut, finLo, top(a0), finLo, top(a0), -1), ...F.side(a1, R.r, R.lugOut, finLo, h, finLo, h, 1)];
    const front = Math.cos(c * RAD) > 0;
    if (front) { lugIn.push(solid(inner)); lugFin.push(solid(fin)); } else lugBack.push(solid([...inner, ...fin]));
    const off = Math.abs(((c - 90 + 540) % 360) - 180);
    if (!near || off < near.off) near = { off, a0, a1, c };
  }
  out.lugBack = lugBack.join("");
  out.lugIn = lugIn.join("");
  out.lugFin = lugFin.join("");
  out.rotor = tube(Math.max(A0, h - R.len), h - R.top, R.r, { lit: S.lit === "cam" });
  // The button's lower end in window A: a crown of eight teeth, and four fins that ride the long grooves.
  const crown = (a) => { const w = a / 45 - 1 - Math.floor(a / 45 - 1 + 1e-9); return w <= 0.5 ? K.m * (w - 0.5) : w < 0.9 ? -1.5 * K.m * (w - 0.5) : K.m * (w - 1.5); };
  const br = [];
  for (let i = 0; i < 8; i++) br.push(45 * i + 22.5 + 45, 45 * i + 40.5 + 45);
  const all = F.sweep(-180, 180, 2.5, br.map((b) => ((b + 180) % 360) - 180));
  const zb = (a, dir) => zp + crown(a + dir * 1e-6), lid = Math.min(A1, zp + PL.fin[1]);
  out.plunger = solid(F.panel(PL.crownIn, all.filter((a) => Math.cos(a * RAD) < 0.2), zb, () => zp, -1), "mid") + solid(F.panel(PL.r, all, zb, () => A1, 1));
  const fins = [], finsBack = [];
  for (let j = 0; j < 4; j++) {
    const c = 45 + 90 * j, a0 = c - 6, a1 = c + 6, angles = F.sweep(a0, a1, 2), lo = zp + PL.fin[0];
    if (lo >= A1) continue;
    const f = [...F.panel(R.lugOut, angles, () => lo, () => lid, 1), ...F.side(a0, PL.r, R.lugOut, lo, lid, lo, lid, -1), ...F.side(a1, PL.r, R.lugOut, lo, lid, lo, lid, 1)];
    if (lid < A1) f.push(...F.flat(lid, PL.r, R.lugOut, angles));
    (Math.cos(c * RAD) > 0 ? fins : finsBack).push(solid(f));
  }
  out.fins = fins.join("");
  out.finsBack = finsBack.join("");
  const sh = zp + PL.shoulder[0];
  out.shoulder = sh + 0.58 < A1 ? X.solidSvg(X.ringBand(0, PL.shoulder[1] - PL.shoulder[0], PL.r, PL.shoulder[2], zF(sh), P), { tone: "mid", crease: "none" }) : "";
  // Above the barrel: the button's neck and its cap, knurled round the side.
  const cap0 = zp + PL.cap[0], cap1 = zp + PL.cap[1], cr = PL.cap[2];
  const knurl = X.ribsOf(zF(cap0), 0.6, cap1 - cap0 - 1.2, cr, 28, P, { fade: [0.04, 0.4], seams: true });
  out.button = tube(C.BAR.top, cap0, PL.r) + X.solidSvg(X.solidOf([[0, cr - 0.3], [0.4, cr, 1], [cap1 - cap0 - 0.9, cr, 1], [cap1 - cap0 - 0.2, cr - 1.1, 1], [cap1 - cap0, 0]], zF(cap0), P), { tone: "hi", crease: "none", lit: S.lit === "button", inner: X.fadedSvg(knurl, { tone: "faint" }) });
  // The refill in window B: shank, collar and ink tube; below the nose, its brass tip and ball.
  const zc = ball + RF.collar[0];
  out.refill = tube(Math.max(B0, ball + RF.cone), zc, RF.shank, { tone: "mid" }) + tube(zc, ball + RF.collar[1], RF.collar[2], { tone: "mid" });
  out.ink = tube(Math.max(B0, ball + RF.collar[1]), B1, RF.r);
  const t1 = Math.min(0, ball + RF.cone);
  out.tip = t1 > ball + 0.3 ? X.solidSvg(X.solidOf([[0.3, RF.coneR[0]], [t1 - ball, RF.coneR[0] + ((RF.coneR[1] - RF.coneR[0]) * (t1 - ball)) / RF.cone]], zF(ball), P), { tone: "mid", crease: "none" }) + X.solidSvg(X.sphereOf([0, 0, ball + RF.ball], RF.ball, P), { tone: "hi" }) : "";
  // The return spring, from the seat ring up to the collar, split into the coils behind and in front.
  const SP = C.SPRING, n = Math.round(SP.turns * 24), runs = { b: [], f: [] };
  let run = [], side = null;
  for (let i = 0; i <= n; i++) {
    const t = i / n, a = t * SP.turns * 360, p = F.pt(SP.r, a, SP.seat + SP.wire / 2 + (zc - SP.seat - SP.wire) * t), s = X.iso(p, P), f = Math.cos(a * RAD) > 0 ? "f" : "b";
    if (side && f !== side) { run.push(s); runs[side].push(X.pathOf(run)); run = [s]; } else run.push(s);
    side = f;
  }
  runs[side].push(X.pathOf(run));
  out.springBack = X.lineSvg(runs.b.join(""), { tone: "lo" });
  out.springFront = X.lineSvg(runs.f.join(""), { tone: "hi" });
  // Where the crew hold on: Pinch the lug nearest his notch, Roo the collar's rim.
  out.lug = { near, h };
  out.collar = zc;
  return out;
}
