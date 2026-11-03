// The machine's physics, one pure step. It is serialized into the page, so it uses only C, S and Math.
// Speeds in Hz (rpm = Hz x 30 for four poles), power in MW, field current in A, voltages per unit of 11 kV.
export const REST = {
  clock: 0, warp: 1, stepT: 0, f: 0, fref: 0, fset: 0, g: 0, If: 0, vset: 1.01, field: false,
  phi: 0, spin: 0, synced: false, P: 0, Q: 0, E: 0, cb: 0, cbCmd: "", cbT: 0, closed: false, arcVac: 0, vacOn: false,
  lock: 0, ds: 0, dsT: 0, dsTry: 0, tryT: -1, forced: false, arcAir: 0, airOn: false, arcAge: 0, gapMm: 0, tripBy: "",
  rev: 0, refuse: "", said: "", duty: "", fade: 1, swap: -1, hop: 0, hopT: 1, chg: 1, ptr: -0.6, lit: "",
};

export function physics(C, S, dt) {
  const PI2 = Math.PI * 2, w = dt * S.warp, n = Math.max(1, Math.ceil(w / 0.002)), h = w / n;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = (v, to, tau, t) => v + (to - v) * (1 - Math.exp(-t / tau));
  const loss = (f) => C.LOSS[0] * (f / 50) ** 2 + C.LOSS[1] * (f / 50);
  const trip = (why) => { if (S.cbCmd !== "open" && (S.closed || S.cbCmd === "close")) { S.cbCmd = "open"; S.cbT = 0; S.tripBy = why; } };
  const cbStart = S.cb;
  for (let i = 0; i < n; i++) {
    S.clock += h;
    // Governor: the speed reference creeps toward the setting at the run-up rate, the valve follows the droop line.
    const dr = S.fset - S.fref;
    S.fref += Math.sign(dr) * Math.min(Math.abs(dr), C.RAMP * h * (S.synced ? 0.5 : 1));
    S.g = ease(S.g, clamp((S.fref - S.f) / (C.DROOP * 50), 0, 1), 0.3, h);
    const pm = S.g * C.MW_MAX;
    // Exciter: the AVR sets the field for the voltage asked, held to 1.1 per unit of V/Hz.
    const p = S.P / C.MVA;
    const eT = !S.field ? 0 : S.synced ? Math.hypot(S.vset, p * C.XS) : Math.min(S.vset, 1.1 * S.f / 50);
    const ifT = S.f > 5 ? (C.IF0 * eT * 50) / Math.max(S.f, 25) : 0;
    S.If = ease(S.If, S.synced ? C.IF0 * eT : ifT, 0.8, h);
    if (S.If < 0.05 && !S.field) S.If = 0;
    S.E = (S.If / C.IF0) * (S.f / 50);
    // Breaker: the closing spring drives the contacts home in 60 ms, the opening spring parts them in 40 ms.
    if (S.cbCmd) S.cbT += h;
    if (S.cbCmd === "close") S.cb = clamp(S.cbT / C.T_CLOSE, 0, 1) ** 2;
    if (S.cbCmd === "open") S.cb = 1 - clamp(S.cbT / C.T_OPEN, 0, 1) ** 1.5;
    const linked = S.ds < 0.002;
    if (S.cbCmd === "close" && S.cb >= 1) { S.cbCmd = ""; S.closed = true; if (linked && S.E > 0.5) { S.synced = true; S.f = 50; } }
    // Current: the grid's 50 Hz wave. It flows while the contacts touch or an arc bridges them.
    const th = PI2 * 50 * S.clock, i0 = Math.sin(th), i1 = Math.sin(th + PI2 * 50 * h);
    const zero = i0 * i1 <= 0;
    if (S.cbCmd === "open" && S.closed && S.cb < 0.98) { S.closed = false; S.vacOn = S.synced && Math.abs(S.P) + Math.abs(S.Q) > 0.02; if (!S.vacOn) { S.synced = false; S.If = Math.min(S.If, C.IF0 * 1.12); } }
    // Off the grid the terminal voltage first rises only to the transient EMF (about 1.12 per unit); the AVR then pulls it back.
    if (S.vacOn && zero) { S.vacOn = false; S.synced = false; S.airOn = false; S.If = Math.min(S.If, C.IF0 * 1.12); }
    if (S.cbCmd === "open" && S.cb <= 0) S.cbCmd = "";
    S.arcVac = S.vacOn ? Math.abs(i1) : 0;
    // Speed: free, the rotor obeys the torque balance; on the grid it is held at 50 Hz and the rotor angle carries the load.
    if (S.synced) {
      S.f = 50;
      S.P = ease(S.P, pm - loss(50), 0.6, h);
      const pp = S.P / C.MVA;
      if (pp * C.XS > S.E * 0.98) trip("pole slip: the field is too weak to hold the rotor in step");
      S.phi = Math.asin(clamp((pp * C.XS) / Math.max(S.E, 0.05), -1, 1));
      S.Q = ((S.E * Math.cos(S.phi) - 1) / C.XS) * C.MVA;
      S.rev = S.P < -0.1 ? S.rev + h : 0;
      if (S.rev > 2) trip("reverse power: the grid was driving the set as a motor");
    } else {
      S.P = 0; S.Q = 0;
      S.f = Math.max(0, S.f + (50 * (pm - loss(S.f)) * h) / (2 * C.H * C.MVA));
      S.phi = ((((S.phi + PI2 * (S.f - 50) * h) % PI2) + PI2 * 1.5) % PI2) - Math.PI;
    }
    // Disconnector: no current may be broken. The interlock bolt is in whenever the breaker is closed.
    S.lock = ease(S.lock, (S.closed || S.cbCmd === "close") && !S.forced ? 1 : 0, 0.05, h);
    if (S.lock > 0.5 && S.dsT !== S.ds && !S.forced) { S.dsT = S.ds; S.tryT = 0; }
    if (S.tryT >= 0) { S.tryT += h; S.dsTry = Math.sin(Math.min(1, S.tryT / 0.8) * Math.PI) * 0.6; if (S.tryT > 0.8) { S.tryT = -1; S.dsTry = 0; } }
    S.ds = S.ds + clamp(S.dsT - S.ds, -h / 1.6, h / 1.6);
    const gap = 2 * C.BLADE * Math.sin((S.ds * C.OPEN) / 2) * 25;
    const live = (S.closed || S.vacOn) && S.synced;
    if (live && S.ds > 0.002) { S.airOn = true; S.arcAge += h; S.gapMm = gap; if (S.arcAge > C.T_PROT) trip("arc protection: an arc on the disconnector"); }
    if (!live) S.airOn = false;
    S.arcAir = S.airOn ? Math.abs(i1) : 0;
  }
  S.spin += PI2 * (S.f / 2) * dt * 0.02;   // drawn at a fiftieth of its true speed, so 1500 rpm reads as a slow turn
  return Math.abs(S.cb - cbStart);
}

// Pure helpers for words: rpm, kV, the synchro-check verdict.
export function verdict(C, S) {
  const slip = S.f - 50, dv = S.E - 1, ang = (S.phi * 180) / Math.PI;
  if (S.E < 0.5) return "no generator voltage";
  if (Math.abs(slip) > C.SLIP_MAX) return `slip ${slip.toFixed(2)} Hz, more than ${C.SLIP_MAX}`;
  if (Math.abs(dv) > C.DV_MAX) return `voltage ${(dv * 100).toFixed(0)} % off the grid's`;
  if (Math.abs(ang) > C.ANGLE_MAX) return `phase ${Math.round(ang)}° apart, more than ${C.ANGLE_MAX}°`;
  return "";
}
