// The machine's physics, one pure step. It is serialized into the page, so it uses only C, S and Math.
// Speed in Hz (rpm = 60 x Hz for two poles), power in MW, field current in A, voltage in per unit of 22 kV.
export const REST = {
  clock: 0, warp: 1, heat: 1, stepT: 0, f: 0, fref: 0, fset: 0, g: 0, lift: 0, If: 0, vset: 1.01, field: false,
  phi: 0, spin: 0, synced: false, P: 0, Q: 0, E: 0, cb: 0, cbCmd: "", cbT: 0, closed: false, arcSF: 0, sfOn: false,
  lock: 0, ds: 0, dsT: 0, dsTry: 0, tryT: -1, forced: false, arcAir: 0, airOn: false, arcAge: 0, gapMm: 0, tripBy: "",
  rev: 0, top: 22, pump: 0, pumpOn: false, wheel: 0.4, fan: 0, said: "", duty: "", hop: 0, hopT: 1, ptr: -0.6, lit: "",
};

export function physics(C, S, dt) {
  const PI2 = Math.PI * 2, w = dt * S.warp, n = Math.max(1, Math.ceil(w / 0.002)), h = w / n;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = (v, to, tau, t) => v + (to - v) * (1 - Math.exp(-t / tau));
  const loss = (f) => C.LOSS[0] * (f / 50) ** 2 + C.LOSS[1] * (f / 50);
  const trip = (why) => { if (S.cbCmd !== "open" && (S.closed || S.cbCmd === "close")) { S.cbCmd = "open"; S.cbT = 0; S.tripBy = why; } };
  for (let i = 0; i < n; i++) {
    S.clock += h;
    // Governor: the speed reference creeps toward the setting at the run-up rate; the valve follows the droop line,
    // and the valve's servo (Ollie) follows the governor's demand. On a load rejection the springs shut it at once.
    const dr = S.fset - S.fref;
    S.fref += Math.sign(dr) * Math.min(Math.abs(dr), C.RAMP * h * (S.synced ? 0.4 : 1));
    S.g = clamp((S.fref - S.f) / (C.DROOP * 50), 0, 1);
    S.lift = ease(S.lift, S.g, S.g < S.lift - 0.2 ? 0.12 : 0.5, h);
    const pm = S.lift * C.MW_VALVE;
    // Exciter: the AVR sets the field for the voltage asked, held to 1.1 per unit of V/Hz off the grid.
    const p = S.P / C.MVA;
    const eT = !S.field ? 0 : S.synced ? Math.hypot(S.vset, p * C.XS) : Math.min(S.vset, (1.1 * S.f) / 50);
    const ifT = S.f > 5 ? (C.IF0 * eT * 50) / Math.max(S.f, 25) : 0;
    S.If = ease(S.If, S.synced ? C.IF0 * eT : ifT, 0.8, h);
    if (S.If < 0.5 && !S.field) S.If = 0;
    S.E = (S.If / C.IF0) * (S.f / 50);
    // Breaker: the closing spring drives the contacts home in 55 ms, the opening spring parts them in 22 ms.
    if (S.cbCmd) S.cbT += h;
    if (S.cbCmd === "close") S.cb = clamp(S.cbT / C.T_CLOSE, 0, 1) ** 2;
    if (S.cbCmd === "open") S.cb = 1 - clamp(S.cbT / C.T_OPEN, 0, 1) ** 1.5;
    const linked = S.ds < 0.002;
    if (S.cbCmd === "close" && S.cb >= 1) { S.cbCmd = ""; S.closed = true; if (linked && S.E > 0.5) { S.synced = true; S.f = 50; } }
    // Current: the grid's 50 Hz wave. In SF6 the arc burns from contact separation to the next current zero.
    const th = PI2 * 50 * S.clock, i0 = Math.sin(th), i1 = Math.sin(th + PI2 * 50 * h), zero = i0 * i1 <= 0;
    if (S.cbCmd === "open" && S.closed && S.cb < 0.97) {
      S.closed = false;
      S.sfOn = S.synced && Math.abs(S.P) + Math.abs(S.Q) > 1;
      if (!S.sfOn) S.synced = false;
      if (S.P > 50) { S.fset = C.FSET_IDLE; S.lift = Math.min(S.lift, 0.02); }
    }
    if (S.sfOn && zero && S.cb < 0.8) { S.sfOn = false; S.synced = false; S.airOn = false; S.If = Math.min(S.If, C.IF0 * 1.12); }
    if (S.cbCmd === "open" && S.cb <= 0) S.cbCmd = "";
    S.arcSF = S.sfOn ? Math.abs(i1) : 0;
    // Speed: free, the rotor obeys the torque balance; on the grid it is held at 50 Hz and the rotor angle carries the load.
    if (S.synced) {
      S.f = 50;
      S.P = ease(S.P, pm - loss(50), 0.6, h);
      const pp = S.P / C.MVA;
      if (pp * C.XS > S.E * 0.98) trip("pole slip: the field is too weak to hold the rotor in step");
      S.phi = Math.asin(clamp((pp * C.XS) / Math.max(S.E, 0.05), -1, 1));
      S.Q = ((S.E * Math.cos(S.phi) - 1) / C.XS) * C.MVA;
      S.rev = S.P < -5 ? S.rev + h : 0;
      if (S.rev > 2) trip("reverse power: the grid was driving the set as a motor");
    } else {
      S.P = 0; S.Q = 0;
      S.f = Math.max(0, S.f + (50 * (pm - loss(S.f)) * h) / (2 * C.H * C.MVA));
      S.phi = ((((S.phi + PI2 * (S.f - 50) * h) % PI2) + PI2 * 1.5) % PI2) - Math.PI;
    }
    // Disconnector: it may never break current. The interlock bolt is in whenever the breaker is closed.
    S.lock = ease(S.lock, (S.closed || S.cbCmd === "close") && !S.forced ? 1 : 0, 0.5, h);
    if (S.lock > 0.5 && S.dsT !== S.ds && !S.forced) { S.dsT = S.ds; S.tryT = 0; }
    if (S.tryT >= 0) { S.tryT += h; S.dsTry = Math.sin(Math.min(1, S.tryT / 0.8) * Math.PI) * 0.6; if (S.tryT > 0.8) { S.tryT = -1; S.dsTry = 0; } }
    S.ds += clamp(S.dsT - S.ds, -h / C.T_DS, h / C.T_DS);
    const gap = 2 * C.BLADE * Math.sin((S.ds * C.OPEN) / 2) * 100;
    const live = (S.closed || S.sfOn) && S.synced;
    // Opened under load, the arc is in series with the load: nothing trips until it stretches far enough to flash
    // over to the next phase, which is a fault the protection sees.
    if (live && S.ds > 0.002) { S.airOn = true; S.gapMm = gap; if (S.ds * C.OPEN > C.FLASH) { S.arcAge += h; if (S.arcAge > C.T_PROT) trip("protection: the arc flashed over to the next phase"); } }
    if (!live) { S.airOn = false; S.arcAge = 0; }
    S.arcAir = S.airOn ? Math.abs(i1) : 0;
  }
  S.spin += PI2 * S.f * dt * 0.01;   // drawn at a hundredth of its true speed, so 3,000 rpm reads as a slow turn
  return 0;
}

// The transformer's top oil (IEC 60076-7, exponential), on its own clock: `heat` model seconds per real second.
export function thermal(C, S, dt) {
  const t = dt * S.heat, kload = Math.hypot(S.P, S.Q) / C.MVA, on = S.E > 0.3;
  const rise = on ? C.RISE * ((kload * kload * C.R + 1) / (C.R + 1)) * (S.pumpOn ? 1 : C.RISE_OFF) : 0;
  S.top += (C.AMB + rise - S.top) * (1 - Math.exp(-t / (60 * C.TAU[S.pumpOn ? 1 : 0])));
  if (S.top > C.PUMP_ON) S.pumpOn = true;
  if (S.top < C.PUMP_ON - 10) S.pumpOn = false;
  S.pump += ((S.pumpOn ? 1 : 0) - S.pump) * (1 - Math.exp(-dt / 0.8));
  if (S.pump < 1e-3 && !S.pumpOn) S.pump = 0;
  S.wheel += S.pump * dt * 3.2;
  S.fan += S.pump * dt * 6;
}

// Pure helpers for words: the synchro-check verdict.
export function verdict(C, S) {
  const slip = S.f - 50, dv = S.E - 1, ang = (S.phi * 180) / Math.PI;
  if (S.E < 0.5) return "no generator voltage";
  if (Math.abs(slip) > C.SLIP_MAX) return `slip ${slip.toFixed(2)} Hz, more than ${C.SLIP_MAX}`;
  if (Math.abs(dv) > C.DV_MAX) return `voltage ${(dv * 100).toFixed(0)} % off the grid's`;
  if (Math.abs(ang) > C.ANGLE_MAX) return `phase ${Math.round(ang)}° apart, more than ${C.ANGLE_MAX}°`;
  return "";
}
