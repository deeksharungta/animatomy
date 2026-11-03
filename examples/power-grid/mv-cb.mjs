// The breaker's moving parts: the spring mechanism's main lever and footplate, the opening spring under it,
// the drive link, the contacts and puffer inside the near pole's chamber, and the position flag.
// Inlined into the page, so it uses only its arguments.
export function breakerLive(K, P, C, S, T) {
  const M = C.CBM, out = {}, cb = S.cb;
  // Main lever: pivot at the right, footplate at the left end; Roo stamps it down to close.
  const pv = [M.x + 11, M.y + 4, M.z + 9], arm = 8.4, psi = ((14 - 26 * cb) * Math.PI) / 180;
  const end = [pv[0] - arm * Math.cos(psi), pv[1], pv[2] + arm * Math.sin(psi)];
  out.lever = T.S(T.barAB(pv, end, [0, 1, 0], 1.8, 1.4), { tone: "hi", lit: S.lit === "cb" }) +
    T.S(T.box(end[0] - 3.2, end[1] - 2.4, end[2] - 0.5, end[0] + 1.2, end[1] + 2.4, end[2] + 0.5, 0.3), { tone: "mid" }) + T.D([T.at([pv[0], pv[1] + 1, pv[2]])], { size: 0.7, tone: "mid" });
  out.foot = [end[0] - 1, end[1], end[2] + 0.5];
  // The opening spring between the floor and the lever: charged (short) while the breaker is closed.
  const sx = pv[0] - 3.4, sTop = pv[2] + (end[2] - pv[2]) * (3.4 / arm) - 0.8, sp = T.helix(sx, pv[1], M.z + 2.4, sTop, 1.6, 6);
  out.spring = T.Ln(sp.back, { tone: "lo" }) + T.S(K.cylinder(sx, pv[1], 0.5, M.z + 1.2, sTop - M.z - 1.2, P, 8), { tone: "mid", crease: "none" }) + T.Ln(sp.front, { tone: "mid" });
  // The drive link from the lever up through the roof to the portal's crank.
  const lk = [pv[0] - 2, pv[1], pv[2] + (end[2] - pv[2]) * (2 / arm)];
  out.link = T.S(T.rodAB(lk, [M.x + M.w / 2, M.y + 3, M.z + M.h + 0.2], 0.6, 10), { tone: "hi" });
  // Inside the window: fixed contact from the chamber's far end, moving contact and puffer from the head.
  const y = C.PH[2], z = C.STAND + 40, xc = C.CB.x + 10, gap = 3.2 * (1 - cb), X = [1, 0, 0];
  const Fm = K.frameAlong([C.CB.x + 5, y, z], X), Ff = K.frameAlong([C.CB.x + 15, y, z], [-1, 0, 0]);
  out.contacts = T.S(K.disc(0, 15 - 10 - gap / 2 - 1.6, 0.8, Ff, P), { tone: "mid" }) + T.S(K.disc(15 - 10 - gap / 2 - 1.6, 15 - 10 - gap / 2, 1.4, Ff, P), { tone: "hi" }) +
    T.S(K.disc(0, xc - C.CB.x - 5 - gap / 2 - 3, 2.2, Fm, P), { tone: "lo" }) + T.S(K.disc(xc - C.CB.x - 5 - gap / 2 - 3, xc - C.CB.x - 5 - gap / 2 - 0.6, 1.6, Fm, P), { tone: "mid" }) +
    T.S(K.disc(xc - C.CB.x - 5 - gap / 2 - 0.6, xc - C.CB.x - 5 - gap / 2, 0.7, Fm, P), { tone: "hi", lit: S.lit === "cb" });
  out.gapX = xc - gap / 2 + 0.2; out.gap = gap;
  // The position flag in the cabinet's side window: up while closed.
  out.flag = T.S(T.box(M.x + M.w + 0.05, M.y + 6, M.z + 18 + (cb > 0.5 ? 1.6 : 0), M.x + M.w + 0.3, M.y + 8, M.z + 19.4 + (cb > 0.5 ? 1.6 : 0), 0.15), { tone: cb > 0.5 ? "hi" : "lo" });
  return out;
}

// The disconnector's moving parts: three blades, the cranks on the drive insulators with their links, the
// locking disc on the drive shaft, and the interlock bolt with the knob Pinch holds.
export function isolatorLive(K, P, C, S, T) {
  const DS = C.DS, out = {}, th = (S.ds + S.dsTry * 0.04) * C.OPEN, rot = DS.hinge + 7, top = DS.z - 4 - 5.8;
  out.blades = C.PH.map((y) => {
    const tip = [DS.hinge + C.BLADE * Math.cos(th), y, DS.z + C.BLADE * Math.sin(th)];
    const root = [DS.hinge, y, DS.z];
    return T.S(T.rodAB(root, tip, 0.9, 12), { tone: "hi", lit: S.lit === "ds" }) + T.S(T.box(tip[0] - 1.2, y - 1.2, tip[2] - 1.2, tip[0] + 1.2, y + 1.2, tip[2] + 1.2, 0.3), { tone: "hi" });
  });
  out.tips = C.PH.map((y) => [DS.hinge + C.BLADE * Math.cos(th), y, DS.z + C.BLADE * Math.sin(th)]);
  // Crank on each drive insulator's cap, turned through 90° as the blades open, and the link to the blade's heel.
  const ca = (S.ds + S.dsTry * 0.04) * (Math.PI / 2);
  out.cranks = C.PH.map((y) => {
    const c = [rot, y, top], e = [rot - 3.4 * Math.cos(ca), y + 3.4 * Math.sin(ca) * 0, top + 3.4 * Math.sin(ca)];
    const heel = [DS.hinge + 3 * Math.cos(th) + 1.6 * Math.sin(th), y, DS.z + 3 * Math.sin(th) - 1.6 * Math.cos(th)];
    return T.S(T.barAB(c, e, [0, 1, 0], 1.2, 1), { tone: "mid" }) + T.S(T.rodAB(e, heel, 0.45, 8), { tone: "hi" }) + T.D([T.at(c), T.at(e)], { size: 0.5, tone: "lo" });
  }).join("");
  // The locking disc on the drive shaft and the bolt: in while the breaker is closed.
  const M = C.DSM, sx = M.x + M.w / 2, sy = M.y + 3.4, zb = M.z + 10.2, disc = K.frameAlong([sx, sy, zb - 0.6], [0, 0, 1]);
  out.disc = T.S(K.disc(0, 1.2, 2.8, disc, P), { tone: "hi", lit: S.lit === "lock" }) + T.D([T.at([sx + 2.2 * Math.cos(-ca), sy + 2.2 * Math.sin(-ca), zb + 0.6])], { size: 0.5, tone: "lo" });
  const tipX = sx + 2.2 + (1 - S.lock) * 1.6;
  out.bolt = T.S(T.rodAB([tipX, sy, zb], [M.x + M.w - 1.6, sy, zb], 0.6, 10), { tone: "hi" });
  out.knob = [tipX + 0.6, sy + 2.4, zb];
  out.boltTop = T.S(T.rodAB([tipX + 0.6, sy, zb], out.knob, 0.4, 8), { tone: "hi" }) + T.S(T.ball(out.knob, 0.9), { tone: "hi", lit: S.lit === "lock" });
  return out;
}
