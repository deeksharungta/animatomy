// The breaker's moving parts: the spring mechanism's main lever and footplate, the crank arms and push rods,
// the closing spring, the contacts inside the cut interrupter and the indicator flags. Inlined into the page.
export function breaker(K, P, C, S, T) {
  const B = C.BOT, M = C.MECH, mx = C.MECH.x, X0 = C.CUB.x, Y1 = C.CUB.y + C.CUB.d, PZ = C.PART_Z;
  const cb = S.cb, gap = 1.1 * (1 - cb);
  const psi = ((12 - 22 * cb) * Math.PI) / 180;
  const end = [mx, M.y + M.arm * Math.cos(psi), M.z + M.arm * Math.sin(psi)];
  const out = {};
  // Main lever from the shaft out to the footplate Roo stands on.
  out.lever = T.S(T.barAB([mx, M.y, M.z], end, [1, 0, 0], 2, 2), { tone: "hi", lit: S.lit === "cb" }) +
    T.S(T.box(mx - 3.5, end[1] - 2.5, end[2] - 0.6, mx + 3.5, end[1] + 2.5, end[2] + 0.6, 0.4), { tone: "mid" }) +
    T.D([T.at([mx, M.y, M.z])], { size: 0.7, tone: "mid" });
  out.foot = [mx, end[1], end[2] + 0.6];
  // Crank arms and insulated push rods up through the partition, one per pole.
  const beta = ((32 + 14 * cb) * Math.PI) / 180;
  out.rods = C.PHX.map((x) => {
    const pin = [x, M.y + 6 * Math.cos(beta), M.z + 6 * Math.sin(beta)];
    return T.S(T.barAB([x, M.y, M.z], pin, [1, 0, 0], 1.6, 1.6), { tone: "mid" }) + T.S(T.rodAB(pin, [x, B.y, PZ], 1.1, 10), { tone: "hi" }) + T.D([T.at(pin)], { size: 0.55, tone: "lo" });
  }).join("");
  // The closing spring between its plates: compressed while charged, long once it has thrown the contacts in.
  const len = 16 + 9 * (1 - S.chg), x0 = X0 + 20;
  const c = K.coil(x0, x0 + len, [M.y - 1, M.sz], 3.6, 7, "x", P);
  out.spring = T.Ln(c.back, { tone: "lo" }) + T.S(T.rodAB([x0 - 1, M.y - 1, M.sz], [x0 + 27, M.y - 1, M.sz], 0.8, 10), { tone: "mid" }) + T.Ln(c.front, { tone: "mid" }) +
    T.S(T.box(x0 - 1.2, M.y - 5.5, M.sz - 4.5, x0, M.y + 3.5, M.sz + 4.5), { tone: "mid" }) + T.S(T.box(x0 + len, M.y - 5.5, M.sz - 4.5, x0 + len + 1.2, M.y + 3.5, M.sz + 4.5), { tone: "hi" });
  // Inside the cut interrupter: the fixed contact from above, the moving contact from below on its bellows.
  const x = C.CUT, y = B.y, zc = (B.z0 + B.z1) / 2;
  out.contacts = T.S(K.cylinder(x, y, 1.1, zc + 1.4, B.z1 - zc, P, 12), { tone: "mid" }) + T.S(K.cylinder(x, y, 2.6, zc, 1.4, P, 24, 0.3), { tone: "hi" }) +
    T.S(K.cylinder(x, y, 1.1, B.z0, zc - gap - 1.4 - B.z0, P, 12), { tone: "mid" }) +
    [0, 1, 2].map((i) => T.S(K.cylinder(x, y, 1.9, B.z0 + 1 + i * 1.3 - gap * 0.3, 0.6, P, 16), { tone: "lo" })).join("") +
    T.S(K.cylinder(x, y, 2.6, zc - gap - 1.4, 1.4, P, 24, 0.3), { tone: "hi", lit: S.lit === "cb" });
  out.gapZ = zc - gap / 2;
  // Indicator flags behind the mid rail's windows: closed / open, and spring charged.
  out.flags = [[X0 + 8.6, cb > 0.5], [X0 + 19.6, S.chg > 0.5]].map(([fx, on]) => T.S(T.box(fx, Y1, PZ - 1.8, fx + 6.8, Y1 + 0.15, PZ + 1.8, 0.2), { tone: on ? "hi" : "lo" })).join("");
  return out;
}
