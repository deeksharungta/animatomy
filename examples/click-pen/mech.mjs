// The click mechanism as pure functions of the model's numbers, unrolled round the barrel: u is in steps
// of 45°, heights are mm above the ribs' lowest ends. Serialized into the page, so each one uses only its
// arguments and the other functions in this file.

// The barrel ribs' lower edge over u: long grooves at even steps, short notches at odd ones, ramps between.
export function ribEdge(K, u) {
  const v = u - 2 * Math.floor(u / 2 + 1e-9), h = K.half + 1e-7;
  if (v <= h || v >= 2 - h) return 99;
  if (v < 1 - h) return K.m * (v - h);
  if (v <= 1 + h) return K.notch;
  return K.m * (v - 1 - h);
}

// The button's crown, relative to its pocket: a rising flank up to the pocket, then a steeper falling one.
export function crown(K, u) {
  const w = u - Math.floor(u + 1e-9);
  if (w <= 0.5) return K.m * (w - 0.5);
  if (w < 0.9) return -1.5 * K.m * (w - 0.5);
  return K.m * (w - 1.5);
}

// The highest the lug's top corner can sit at corner position uc, under the ribs and under a button at zp.
export function ceilingOf(K, uc, zp) {
  let best = 99;
  for (let i = 0; i <= K.N; i++) {
    const u = uc - (K.wl * i) / K.N, drop = K.m * (uc - u);
    best = Math.min(best, ribEdge(K, u) + drop, zp + crown(K, u) + drop);
  }
  return best;
}

// The lowest the button can rest on the lug whose top corner is at (uc, h).
export function restOf(K, uc, h) {
  let lo = -99;
  for (let i = 0; i <= K.N; i++) {
    const u = uc - (K.wl * i) / K.N;
    lo = Math.max(lo, h - K.m * (uc - u) - crown(K, u));
  }
  return lo;
}

// One small step: your thumb moves toward its target; the spring lifts the cam as high as the ribs and the
// button let it, and the slopes turn it whichever way lets it rise (along the ribs, never back).
export function advance(S, dt, K) {
  const df = K.thumb * dt;
  S.f = S.fT < S.f ? Math.max(S.fT, S.f - df) : Math.min(S.fT, S.f + df);
  const top = Math.min(S.f, K.zpStop), du = K.turn * dt, uc0 = S.uc;
  for (let k = 0; k < 3; k++) {
    const c0 = ceilingOf(K, S.uc, top), cp = ceilingOf(K, S.uc + du, top), cm = ceilingOf(K, S.uc - du, top);
    if (cp >= c0 - 1e-9 && cp > -90) S.uc += du;
    else if (cm > c0 + 1e-9) S.uc -= du;
    else break;
  }
  const h0 = S.h;
  S.h = ceilingOf(K, S.uc, top);
  S.zp = Math.max(K.zpMin, Math.min(top, restOf(K, S.uc, S.h)));
  S.hV = (S.h - h0) / dt;
  S.uV = (S.uc - uc0) / dt;
}

export function stepModel(S, dt, K) {
  const n = Math.max(1, Math.ceil(dt / 0.002));
  for (let i = 0; i < n; i++) advance(S, dt / n, K);
  S.stepT += dt;
}
