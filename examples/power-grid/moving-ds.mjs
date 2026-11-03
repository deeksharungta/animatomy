// The disconnector's moving parts, the interlock, the hand crank and the desk's pointer and needles. Inlined.
export function isolator(K, P, C, S, T) {
  const DS = C.DS, a = S.ds * C.OPEN, out = {};
  const dir = [0, -Math.cos(a), Math.sin(a)], hz = DS.z + 1.6;
  out.tips = [];
  out.blades = DS.xs.map((x) => {
    const h = [x, DS.hy, hz], tip = [x, DS.hy + dir[1] * (C.BLADE + 1.6), hz + dir[2] * (C.BLADE + 1.6)];
    out.tips.push([x, DS.hy + dir[1] * C.BLADE, hz + dir[2] * C.BLADE]);
    return T.S(T.barAB([x, DS.hy + 1.6 * Math.cos(a), hz - 1.6 * Math.sin(a)], tip, [1, 0, 0], 1.2, 2.6), { tone: "hi", lit: S.lit === "ds" });
  });
  // The cranks on the rotating insulators turn a quarter turn as the blades rise.
  const b = -S.ds * 1.7;
  out.cranks = DS.xs.map((x) => {
    const o = [x - 7, C.RY, DS.z - 1.8], e = [o[0] + 5 * Math.cos(b), o[1] + 5 * Math.sin(b), o[2]];
    return T.S(T.barAB(o, e, [0, 0, 1], 1.4, 1), { tone: "mid" }) + T.D([T.at(e)], { size: 0.55, tone: "lo" });
  }).join("");
  out.coupling = T.S(T.rodAB([141 - 3 * S.ds, -66, 67.6], [186 - 3 * S.ds, -66, 67.6], 0.8, 10), { tone: "mid" });
  // The interlock: a notched disc on the drive shaft and the bolt that drops into its notch.
  const G = C.GB, z = C.GBX.z, turn = S.ds * Math.PI * 4 + S.dsTry * 0.3;
  const nd = [Math.cos(turn + 0.9), Math.sin(turn + 0.9)];
  out.disc = T.S(K.cylinder(G.x, G.y, 3.4, z + 7, 1.8, P, 28, 0.3), { tone: "hi" }) + T.Ln(T.seg([G.x + 1.3 * nd[0], G.y + 1.3 * nd[1], z + 8.8], [G.x + 3.4 * nd[0], G.y + 3.4 * nd[1], z + 8.8]), { tone: "lo" });
  const tipX = 144.6 + 3 * (1 - S.lock), kx = tipX + 4.2;
  out.bolt = T.S(T.rodAB([tipX, G.y, z + 7.9], [146.2, G.y, z + 7.9], 0.8, 10), { tone: "hi", lit: S.lit === "lock" });
  out.knob = [kx, -57.5, z + 15];
  out.boltTop = T.S(K.cylinder(kx, -57.5, 0.7, z + 11, 3.2, P, 12), { tone: "mid" }) + T.S(T.ball([kx, -57.5, z + 14.8], 1.2), { tone: "hi", lit: S.lit === "lock" });
  out.slot = T.Ln(K.pathOf([[144.6 + 4.2 - 1, -58.5, z + 11], [151.6 + 1, -58.5, z + 11], [151.6 + 1, -56.5, z + 11], [144.6 + 4.2 - 1, -56.5, z + 11]].map(T.at), true), { tone: "lo" });
  // The hand crank on the gearbox: you turn it two turns to swing the blades.
  const h = turn, hub = [G.x, -55, z], arm = [G.x + 6 * Math.cos(h), -54.6, z + 6 * Math.sin(h)];
  out.crank = T.S(K.prismOf(K.frameOf(hub, [0, 1, 0], [1, 0, 0], [0, 0, 1]), Array.from({ length: 14 }, (_, i) => [1.8 * Math.cos((i / 14) * 6.283), 1.8 * Math.sin((i / 14) * 6.283)]), 0, 1.2, P), { tone: "mid" }) +
    T.S(T.barAB([hub[0], -54.4, hub[2]], arm, [0, 1, 0], 1.6, 0.9), { tone: "hi" }) + T.S(T.rodAB([arm[0], -54, arm[2]], [arm[0], -49.5, arm[2]], 0.9, 10), { tone: "mid" });
  return out;
}

export function instruments(K, P, C, S, T) {
  const sc = C.SC, z = C.DESK.z + 1.85, a = S.ptr, out = {};
  const d = [-Math.sin(a), -Math.cos(a)];
  out.pointer = T.Ln(T.seg([sc.x - 3 * d[0], sc.y - 3 * d[1], z], [sc.x + (sc.r - 1.2) * d[0], sc.y + (sc.r - 1.2) * d[1], z]), { tone: "hi", free: true }) +
    T.D([T.at([sc.x, sc.y, z])], { size: 1.3, tone: "hi" });
  // The pointer's T-handle: a post at two thirds of its length with a short crossbar along it, for Crumb to push.
  const p = [sc.x + C.TAB_R * d[0], sc.y + C.TAB_R * d[1], z + C.TAB_H], ends = [[p[0] + d[0], p[1] + d[1], p[2]], [p[0] - d[0], p[1] - d[1], p[2]]];
  out.pointer += T.S(K.cylinder(p[0], p[1], 0.4, z, C.TAB_H, P, 10), { tone: "hi", crease: "none" }) + T.S(T.rodAB(ends[1], ends[0], 0.4, 8), { tone: "hi" });
  out.tab = { p, d, ends };
  const needle = (m, v) => {
    const q = -Math.PI * 0.75 + Math.PI * 1.5 * Math.max(0, Math.min(1, (v - m.lo) / (m.hi - m.lo)));
    return T.Ln(T.seg([m.x, m.y, z - 0.6], [m.x - (m.r - 0.8) * Math.sin(q), m.y - (m.r - 0.8) * Math.cos(q), z - 0.6]), { tone: "hi", free: "end" }) + T.D([T.at([m.x, m.y, z - 0.6])], { size: 0.7, tone: "hi" });
  };
  out.meters = needle(C.METERS[0], S.E * C.GRID_KV) + needle(C.METERS[1], S.f);
  // The field ammeter on the excitation cubicle, in the plane of its door.
  const E = C.FIELD_M, q = -Math.PI * 0.75 + Math.PI * 1.5 * Math.min(1, S.If / 400);
  out.field = T.Ln(T.seg([E.x, E.y, E.z], [E.x + (E.r - 0.8) * Math.sin(q), E.y, E.z + (E.r - 0.8) * Math.cos(q)]), { tone: "hi", free: "end" });
  return out;
}
