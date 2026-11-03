// The parts that move, drawn from the model's state. Serialized into the page, so it uses only its
// arguments: X (the kit and lathe), P, C, K (the cam's numbers), the state S, the facet kit F and the frame.
export function drawn(X, P, C, K, S, F, PEN) {
  const out = {}, RAD = Math.PI / 180, solid = (faces, tone = "hi", lit = false) => (faces.length ? X.solidSvg(F.solid(faces), { tone, lit }) : "");
  const zF = (z) => X.frameOf(F.pt(0, 0, z), PEN.a, PEN.u, PEN.v);
  const lathe = (prof, z, opts = {}) => X.solidSvg(X.solidOf(prof, zF(z), P), { tone: "hi", crease: "none", ...opts });
  const tube = (z0, z1, r, opts = {}) => (z1 - z0 > 0.01 ? lathe([[0, r], [z1 - z0, r]], z0, opts) : "");
  const [, A1] = C.WIN_A, R = C.ROTOR, PL = C.PLUNGER, RF = C.REFILL;
  const h = C.Z0 + S.h, zp = C.Z0 + S.zp, ball = h - RF.top - RF.len;
  const ang = (u) => (u + 1) * 45 + C.ROT;
  // The cam's four lugs: each a block on the cam's top whose fin rides the barrel's grooves.
  const lugBack = [], lugIn = [], lugFin = [];
  let near = null;
  for (let j = 0; j < 4; j++) {
    const a0 = ang(S.uc - K.wl) + 90 * j, a1 = ang(S.uc) + 90 * j, c = (a0 + a1) / 2;
    const top = (a) => h + K.m * ((a - a1) / 45);
    const angles = F.sweep(a0, a1, 2);
    const g0 = (K.m / 45) / RAD, tilt = (r) => { const t = F.tan(c), g = g0 / r; return [0, 1, 2].map((i) => PEN.a[i] - t[i] * g); };
    const roof = (r0, r1) => angles.slice(0, -1).map((a, i) => ({ pts: [F.pt(r0, a, top(a)), F.pt(r1, a, top(a)), F.pt(r1, angles[i + 1], top(angles[i + 1])), F.pt(r0, angles[i + 1], top(angles[i + 1]))], n: tilt((r0 + r1) / 2) }));
    const bodyTop = h - R.top, finLo = h - R.fin;
    const inner = [...roof(R.lugIn, R.r), ...F.side(a0, R.lugIn, R.r, bodyTop, top(a0), bodyTop, top(a0), -1), ...F.side(a1, R.lugIn, R.r, bodyTop, h, bodyTop, h, 1)];
    const fin = [...roof(R.r, R.lugOut), ...F.under(R.r, R.lugOut, angles, () => finLo), ...F.panel(R.lugOut, angles, () => finLo, top, 1), ...F.side(a0, R.r, R.lugOut, finLo, top(a0), finLo, top(a0), -1), ...F.side(a1, R.r, R.lugOut, finLo, h, finLo, h, 1)];
    if (F.depth(c) > 0) { lugIn.push(solid(inner)); lugFin.push(solid(fin)); } else lugBack.push(solid([...inner, ...fin]));
    const off = Math.abs(((c - C.CREW.rocky.notch + 540) % 360) - 180);
    if (!near || off < near.off) near = { off, a0, a1, c, lo: finLo };
  }
  out.lugBack = lugBack.join("");
  out.lugIn = lugIn.join("");
  out.lugFin = lugFin.join("");
  // The cam's body, its socket fitted over the refill's end.
  out.rotor = tube(h - R.len, h - R.top, R.r, { lit: S.lit === "cam" });
  // The button's lower end: a crown of eight teeth, and four fins that ride the long grooves.
  const crown = (a) => { const v = (a - C.ROT) / 45 - 1, w = v - Math.floor(v + 1e-9); return w <= 0.5 ? K.m * (w - 0.5) : w < 0.9 ? -1.5 * K.m * (w - 0.5) : K.m * (w - 1.5); };
  const br = [];
  for (let i = 0; i < 8; i++) br.push(45 * i + 22.5 + 45 + C.ROT, 45 * i + 40.5 + 45 + C.ROT);
  const all = F.sweep(-180, 180, 2.5, br.map((b) => (((b + 180) % 360) + 360) % 360 - 180));
  const zb = (a, dir) => zp + crown(a + dir * 1e-6), lid = Math.min(A1, zp + PL.fin[1]);
  out.plunger = solid(F.panel(PL.crownIn, all.filter((a) => F.depth(a) < 0.2), zb, () => zp, -1), "mid") + solid([...F.panel(PL.r, all, zb, () => A1, 1), ...F.under(PL.crownIn, PL.r, all, zb)], "mid");
  const fins = [], finsBack = [];
  for (let j = 0; j < 4; j++) {
    const c = 45 + 90 * j + C.ROT, a0 = c - 6, a1 = c + 6, angles = F.sweep(a0, a1, 2), lo = zp + PL.fin[0];
    if (lo >= A1) continue;
    const f = [...F.panel(R.lugOut, angles, () => lo, () => lid, 1), ...F.side(a0, PL.r, R.lugOut, lo, lid, lo, lid, -1), ...F.side(a1, PL.r, R.lugOut, lo, lid, lo, lid, 1)];
    f.push(...F.under(PL.r, R.lugOut, angles, () => lo));
    (F.depth(c) > 0.05 ? fins : finsBack).push(solid(f, "mid"));
  }
  out.fins = fins.join("");
  out.finsBack = finsBack.join("");
  const sh = zp + PL.shoulder[0];
  out.shoulder = sh + 0.58 < A1 ? X.solidSvg(X.ringBand(0, PL.shoulder[1] - PL.shoulder[0], PL.r, PL.shoulder[2], zF(sh), P), { tone: "mid", crease: "none" }) : "";
  // Past the clip ring: the button's neck and its cap, knurled round the side.
  const cap0 = zp + PL.cap[0], cap1 = zp + PL.cap[1], cr = PL.cap[2];
  const knurl = X.ribsOf(zF(cap0), 0.6, cap1 - cap0 - 1.2, cr, 28, P, { fade: [0.04, 0.4], seams: true });
  out.button = tube(C.BAR.top, cap0, PL.r) + lathe([[0, cr - 0.3], [0.4, cr, 1], [cap1 - cap0 - 0.9, cr, 1], [cap1 - cap0 - 0.2, cr - 1.1, 1], [cap1 - cap0, 0]], cap0, { lit: S.lit === "button", inner: X.fadedSvg(knurl, { tone: "faint" }) });
  // The refill: its brass tip and ball, the shank, the collar the spring pushes, and the ink tube.
  const zc = ball + RF.collar[0], z1 = ball + RF.collar[1], ink = ball + RF.ink, end = ball + RF.len;
  // The tip in two pieces round the nose's bushing: what shows in the section, and what sticks out toward you.
  const coneAt = (s) => RF.coneR[0] + ((RF.coneR[1] - RF.coneR[0]) * (s - 0.25)) / (RF.cone - 0.25);
  const cone = (s0, s1) => (s1 - s0 > 0.05 ? lathe([[0, coneAt(s0)], [s1 - s0, coneAt(s1)]], ball + s0, { tone: "mid" }) : "");
  const ballSvg = X.solidSvg(X.sphereOf(F.pt(0, 0, ball + RF.ball), RF.ball, P), { tone: "hi" }), inside = ball + RF.ball > 0.8;
  out.tipIn = cone(Math.max(0.25, 0.8 - ball), RF.cone) + (inside ? ballSvg : "");
  out.tipOut = (inside ? "" : ballSvg) + cone(0.25, Math.min(RF.cone, -ball));
  out.refill = tube(ball + RF.cone, zc, RF.shank, { tone: "mid" }) + lathe([[0, RF.collar[2] - 0.25], [0.2, RF.collar[2], 1], [z1 - zc - 0.2, RF.collar[2], 1], [z1 - zc, RF.collar[2] - 0.25]], zc, { tone: "mid" });
  out.ink = tube(z1, ink, RF.r);
  // Behind the ink, its grease plug; then the empty tube, its end hidden in the cam's socket.
  out.tube = tube(ink, ink + RF.plug, RF.r, { tone: "mid" }) + tube(ink + RF.plug, Math.min(end, h - R.len), RF.r);
  // The return spring, from the seat up to the collar, split into the coils behind and in front.
  const SP = C.SPRING, n = Math.round(SP.turns * 24), runs = { b: [], f: [] };
  let run = [], side = null;
  for (let i = 0; i <= n; i++) {
    const t = i / n, a = t * SP.turns * 360, p = F.pt(SP.r, a, SP.seat + SP.wire / 2 + (zc - SP.seat - SP.wire) * t), s = X.iso(p, P), f = F.depth(a) > 0 ? "f" : "b";
    if (side && f !== side) { run.push(s); runs[side].push(X.pathOf(run)); run = [s]; } else run.push(s);
    side = f;
  }
  runs[side].push(X.pathOf(run));
  out.springBack = X.lineSvg(runs.b.join(""), { tone: "lo" });
  out.springFront = X.lineSvg(runs.f.join(""), { tone: "hi" });
  // Where the crew hold on: Rocky the lug nearest his notch, Roo the collar's face toward the nose.
  out.lug = { near, h };
  out.collar = zc;
  return out;
}
