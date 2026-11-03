import { C } from "./model.mjs";

// The tip as a row of copper nodes 4 mm long, from the slug's back face to the point. Each node has a heat
// capacity, a conductance to the next, a share of the heater's contact and a loss to the air where it is bare.
const rOf = (x) => {
  const T = C.TIP;
  if (x <= T[0][0]) return C.TIP_R;
  for (let i = 1; i < T.length; i++) if (x <= T[i][0]) { const [a, ra] = T[i - 1], [b, rb] = T[i]; return ra + ((rb - ra) * (x - a)) / (b - a); }
  return 0.3;
};

export const NODES = (() => {
  const x0 = C.SLUG[0], n = Math.ceil((92 - x0) / C.NODE), out = { x: [], cap: [], g: [], heat: [], loss: [] };
  for (let i = 0; i < n; i++) {
    const a = x0 + i * C.NODE, b = Math.min(92, a + C.NODE), mid = (a + b) / 2, r = Math.max(0.5, rOf(mid)) / 1000, len = (b - a) / 1000;
    out.x.push(+mid.toFixed(2));
    out.cap.push(C.RHO_C * Math.PI * r * r * len);
    const rn = Math.max(0.5, rOf(b + C.NODE / 2)) / 1000, area = Math.PI * Math.min(r, rn) * Math.min(r, rn);
    out.g.push(i < n - 1 ? (C.K_CU * area) / (C.NODE / 1000) : 0);
    const inHeat = Math.max(0, Math.min(b, C.HEAT.x1) - Math.max(a, C.HEAT.x0)) / (C.HEAT.x1 - C.HEAT.x0);
    out.heat.push(C.G_HEAT * inHeat);
    out.loss.push(mid > C.BARREL.x1 ? C.H_AIR * 2 * Math.PI * r * len : 0);
  }
  return out;
})();

// One step of h seconds of model time. S.T is the node temperatures, S.TH the heater's; S.q the heat flow
// (watts) leaving each node toward the point, and S.qh into each node from the heater.
export function heatStep(S, N, C, h, on) {
  const n = N.x.length, T = S.T, q = S.q, qh = S.qh;
  let into = 0;
  for (let i = 0; i < n; i++) { qh[i] = N.heat[i] * (S.TH - T[i]); into += qh[i]; q[i] = i < n - 1 ? N.g[i] * (T[i] - T[i + 1]) : 0; }
  S.TH += (h * ((on ? C.WATTS : 0) - into - C.G_SHELL * (S.TH - C.T0))) / C.C_HEAT;
  for (let i = 0; i < n; i++) T[i] += (h * (qh[i] + (i ? q[i - 1] : 0) - q[i] - N.loss[i] * (T[i] - C.T0))) / N.cap[i];
}

// Run the model for `secs` with the Curie switch working, sub-stepped for stability.
export function heatRun(S, N, C, secs, power) {
  const steps = Math.max(1, Math.ceil(secs / 0.012)), h = secs / steps;
  for (let s = 0; s < steps; s++) {
    const slug = S.T[0];
    if (S.held && slug >= C.CURIE) S.held = false;
    else if (!S.held && slug <= C.REGRAB) S.held = true;
    S.closed = S.held;
    heatStep(S, N, C, h, power && S.closed);
    if (power && S.closed) S.onT += h;
    S.runT += h;
  }
}

export const coldState = () => ({ T: NODES.x.map(() => C.T0), q: NODES.x.map(() => 0), qh: NODES.x.map(() => 0), TH: C.T0, held: true, closed: true, onT: 0, runT: 0 });
