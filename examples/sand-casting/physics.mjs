// The pour, as one model. Every function here is also inlined into the page, so each reads only its arguments.
// State S: tilt th (deg), steel left in the ladle ml (kg) at Tl, basin volume vb, mould volume vm at Tm, the time
// since the pour began (t) and since the mould filled (tc), what spilled, and whether the steel froze short.

export function fresh(PH) {
  return { hook: 102, th: 0, thT: 0, ml: PH.M0, Tl: PH.T_POUR, q: 0, qo: 0, vb: 0, vm: 0, Tm: PH.T_POUR, H: 0, t: 0, tc: -1, spill: 0, spillT: 20, short: false, mode: "rest", manual: false, fed: 0, fsC: 0, fsR: 0, fsG: 0, Tc: PH.T_POUR, Tr: PH.T_POUR, Tg: PH.T_POUR, lift: 0, liftV: 0, hold: 0, pipe: 0, wheel: 0, poured: 0 };
}

// The ladle's steel surface stands at h above its inner floor; tilted by th it runs over the lip when the lip is
// below the surface. Returns the head over the lip, in m (negative: not pouring).
export function headOver(C, PH, ml, th) {
  const Lg = C.LADLE, mm = C.MM / 1000;
  const h = (ml / PH.RHO) / (Math.PI * (Lg.rIn * mm) ** 2);
  const a = th * Math.PI / 180;
  return (h - Lg.flowH * mm) * Math.cos(a) + Lg.flowU * mm * Math.sin(a);
}
export const flowOf = (C, PH, ml, th) => {
  const hd = headOver(C, PH, ml, th);
  return hd > 0 && ml > 0.2 ? PH.RHO * PH.WEIR * PH.SPOUT_B * Math.sqrt(2 * PH.G) * hd ** 1.5 : 0;
};
// The tilt that gives a pour rate q with ml kg left.
export function tiltFor(C, PH, ml, q) {
  const mm = C.MM / 1000, Lg = C.LADLE;
  const hd = (q / (PH.RHO * PH.WEIR * PH.SPOUT_B * Math.sqrt(2 * PH.G))) ** (2 / 3);
  const A = (ml / PH.RHO) / (Math.PI * (Lg.rIn * mm) ** 2) - Lg.flowH * mm, B = Lg.flowU * mm;
  const R = Math.hypot(A, B), phi = Math.atan2(A, B);
  return (Math.asin(Math.min(1, hd / R)) - phi) * 180 / Math.PI;
}

// One step of dt model seconds. `real` is the wall-clock step, for the hand on the wheel.
export function advance(C, PH, GEO, S, dt, real = dt) {
  S.t += dt;
  // You: on the run the wheel follows a plan (tip to the design rate, tip back when the riser shows full).
  if (!S.manual) {
    if (S.mode === "pour") S.thT = Math.min(95, tiltFor(C, PH, S.ml, PH.QSTAR * 0.98));
    if (S.mode === "pour" && (S.vm >= GEO.vMould * 0.985 || S.short)) S.mode = "back";
    if (S.mode === "back" || S.mode === "rest") S.thT = 0;
  }
  const step = PH.TILT_RATE * real, th0 = S.th;
  S.th += Math.max(-step, Math.min(step, S.thT - S.th));
  S.wheel += (S.th - th0) / C.WHEEL.per;
  S.hook += (hookFor(C, S.th) - S.hook) * (1 - Math.exp(-real / 0.25));
  S.Tl -= PH.LADLE_COOL * dt * (S.ml > 0.5 ? 1 : 0);
  // Steel over the lip falls into the basin; the sprue takes what its choke allows, the rest piles up and spills.
  const full = S.vm >= GEO.vMould - 1e-7;
  S.q = Math.min(flowOf(C, PH, S.ml, S.th), S.ml / dt);
  S.ml -= S.q * dt;
  S.poured += S.q * dt;
  const hb = S.vb / GEO.aBasin;
  const cap = full || S.short ? 0 : PH.RHO * PH.CD * GEO.aChoke * Math.sqrt(2 * PH.G * (GEO.hSprue + hb));
  const avail = (S.vb * PH.RHO) / dt + S.q;
  S.qo = Math.min(cap, avail, ((GEO.vMould - S.vm) * PH.RHO) / dt);
  S.vb += ((S.q - S.qo) * dt) / PH.RHO;
  const vmax = GEO.aBasin * GEO.hBasin;
  if (S.vb > vmax) { S.spill += (S.vb - vmax) * PH.RHO; S.vb = vmax; S.spillT = S.Tl; }
  else if (S.spill > 0) S.spillT -= ((S.spillT - PH.T_AMB) * dt) / 45;
  // The steel in the mould mixes with what comes in, and gives heat to the sand it wets.
  if (S.qo > 0) {
    S.H += S.qo * dt * S.Tl;
    S.vm = Math.min(GEO.vMould, S.vm + (S.qo * dt) / PH.RHO);
  }
  const mass = S.vm * PH.RHO, f = S.vm / GEO.vMould;
  if (mass > 0.05 && S.tc < 0) {
    S.H -= ((PH.FLUX * GEO.aWet * Math.max(f, 0.05)) / PH.CP) * dt;
    S.Tm = S.H / mass;
  } else if (mass <= 0.05) { S.H = mass * S.Tl; S.Tm = S.Tl; }
  // The leading edge runs 15 degC colder than the mean; once it is 20 degC into the freezing range it stops.
  if (!S.short && f > 0.003 && f < 0.999 && S.Tm - 15 < PH.T_LIQ - 20) S.short = true;
  if (S.tc < 0 && (S.vm >= GEO.vMould * 0.999 || (S.qo === 0 && S.q === 0 && (S.short || (S.mode === "back" && S.vm > GEO.vMould * 0.97))))) S.tc = 0;
  else if (S.tc >= 0) S.tc += dt;
  // Freezing: the solid shell grows as the root of time (Chvorinov); each part is solid at B times its modulus squared.
  const tc = Math.max(0, S.tc);
  const fs = (ts) => (S.tc < 0 ? 0 : Math.min(1, Math.sqrt(tc / ts)));
  S.fsC = fs(GEO.tsCast); S.fsR = fs(GEO.tsRiser); S.fsG = fs(GEO.tsGate);
  const temp = (fsx, ts) => fsx < 1 ? Math.min(S.Tm, PH.T_LIQ - (PH.T_LIQ - PH.T_SOL) * fsx) : PH.T_AMB + (PH.T_SOL - PH.T_AMB) * Math.exp(-(tc - ts) / (PH.TAU * Math.sqrt(ts / GEO.tsCast)));
  S.Tc = S.tc < 0 ? S.Tm : temp(S.fsC, GEO.tsCast);
  S.Tr = S.tc < 0 ? S.Tm : temp(S.fsR, GEO.tsRiser);
  S.Tg = S.tc < 0 ? S.Tm : temp(S.fsG, GEO.tsGate);
  if (S.tc >= 0 && S.Tm > PH.T_LIQ) { S.H -= ((PH.FLUX * GEO.aWet) / PH.CP) * dt; S.Tm = Math.max(PH.T_LIQ, S.H / Math.max(mass, 0.05)); }
  // The riser feeds the shrinkage: 2 % of what has frozen, in the casting and in the riser itself.
  const fed0 = S.fed, mm = C.MM / 1000;
  S.fed = S.short ? 0 : PH.SHRINK * (GEO.vCast * S.fsC + GEO.vRiser * S.fsR);
  // What it feeds drains from the riser's liquid heart, which narrows as its walls freeze: the pipe deepens.
  const rl = C.RISER.r * Math.sqrt(Math.max(0.03, 1 - S.fsR));
  S.pipe = S.fed > 0 ? Math.min(C.RISER.z1 - C.CAST.z1 - 4, S.pipe + (S.fed - fed0) / (Math.PI * (rl * mm) ** 2) / mm) : 0;
  // The steel pushes the cope up: its head over the casting's top face, and the core floating in it.
  const zl = levelZ(C, GEO, S.vm);
  const head = Math.max(0, zl - C.Z.part) * C.MM / 1000;
  const sub = Math.max(0, Math.min(1, (zl - C.CAST.z0) / (C.CAST.z1 - C.CAST.z0)));
  // Once a solid skin grows under the cope it carries that push, so the lift falls as the casting freezes.
  const lift = (PH.RHO * PH.G * head * GEO.aTop + (PH.RHO - PH.RHO_SAND) * PH.G * GEO.vCore * sub) * (1 - S.fsC);
  S.liftV = (lift - S.lift) / Math.max(dt, 1e-4);
  S.lift = lift;
  S.hold = Math.max(0, lift - GEO.copeW); // what the cope's own weight can't hold: the clamp's share
}

// The level of steel in the mould for a volume v: the gating fills first, then the casting from the bottom, then the riser.
export function levelZ(C, GEO, v) {
  const cs = C.CAST, mm = C.MM / 1000, A = (r) => Math.PI * (r * mm) ** 2;
  if (v <= GEO.vGate) return C.RUN.z0 + (C.GATE.z1 - C.RUN.z0) * (v / GEO.vGate);
  let left = v - GEO.vGate;
  const bands = [[cs.z0, cs.z0 + cs.ft, A(cs.rf) - A(cs.ri)], [cs.z0 + cs.ft, cs.z1 - cs.ft, A(cs.ro) - A(cs.ri)], [cs.z1 - cs.ft, cs.z1, A(cs.rf) - A(cs.ri)], [C.RISER.z0, C.RISER.z1, A(C.RISER.r)]];
  for (const [z0, z1, a] of bands) {
    const cap = a * (z1 - z0) * mm;
    if (left <= cap) return z0 + left / a / mm;
    left -= cap;
  }
  return C.RISER.z1;
}

// The crane follows the tilt so the lip stays a hand's breadth over the basin (you, on the crane's pendant).
export function hookFor(C, th) {
  const t = (th * Math.PI) / 180, Lg = C.LADLE;
  const dz = -Lg.lipU * Math.sin(t) + Lg.lipW * Math.cos(t);
  return Math.max(C.Z.cup + 4, Math.min(C.Z.cup + 30, C.Z.cup + 6 - dz));
}
