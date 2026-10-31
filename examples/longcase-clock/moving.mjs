// The parts that move, drawn from the model's state. Both functions are also serialized into the page,
// so they use only the K, C and S objects passed in. Angles turn in the movement's x-z plane: 0 points to +x.
export function dynamic(K, P, C, S) {
  const at = (p) => K.iso(p, P);
  const Y = C.WHEEL_Y, yf = Y + 0.72;
  const pt = (x, z, r, a, y = yf) => [x + r * Math.cos(a), y, z + r * Math.sin(a)];
  const slab = (o, u, v, a, poly, s0, s1) => K.prismOf(K.frameOf(o, a, u, v), poly, s0, s1, P);
  const rot = (poly, a) => poly.map(([u, v]) => [u * Math.cos(a) - v * Math.sin(a), u * Math.sin(a) + v * Math.cos(a)]);
  const flat = (o, poly, s0, s1) => slab(o, [1, 0, 0], [0, 0, 1], [0, 1, 0], poly.map(([u, v]) => [u, v]), s0, s1);
  const out = {};
  // Spokes and teeth on the turning wheels' front faces.
  const marks = (w, a, n, spokes = 4) => {
    const teeth = [], arms = [];
    for (let i = 0; i < n; i++) { const t = a + (i / n) * Math.PI * 2; teeth.push(K.segment(pt(w.x, w.z, w.r - 0.7, t), pt(w.x, w.z, w.r - 0.1, t), P)); }
    for (let i = 0; i < spokes; i++) { const t = a + (i / spokes) * Math.PI * 2 + 0.4; arms.push(K.segment(pt(w.x, w.z, 1.2, t), pt(w.x, w.z, w.r - 0.05, t), P)); }
    return K.lineSvg(teeth.join(""), { tone: "lo" }) + K.lineSvg(arms.join(""), { tone: "mid" });
  };
  out.great = marks(C.GREAT, S.great, 42);
  out.center = marks(C.CENTER, S.center, 36);
  out.third = marks(C.THIRD, S.third, 32);
  const pin = (t) => K.solidSvg(K.prismOf(K.frameOf(pt(C.PINS.x, C.PINS.z, C.PINS.r - 0.6, t), [0, 1, 0], [1, 0, 0], [0, 0, 1]), [[-0.35, -0.35], [0.35, -0.35], [0.35, 0.35], [-0.35, 0.35]], 0, 1.6, P), { tone: "hi" });
  out.pins = marks(C.PINS, S.pins, 0, 3) + Array.from({ length: C.PINS.n }, (_, i) => pin(S.pins + (i / C.PINS.n) * Math.PI * 2)).join("");
  // The escape wheel: thirty hooked teeth, stepping half a tooth each swing.
  const E = C.ESC, saw = [];
  for (let i = 0; i < E.n; i++) {
    const t = (i / E.n) * Math.PI * 2;
    saw.push([(E.r - 1.1) * Math.cos(t), (E.r - 1.1) * Math.sin(t)], [E.r * Math.cos(t + 0.09), E.r * Math.sin(t + 0.09)], [(E.r - 1.1) * Math.cos(t + 0.21), (E.r - 1.1) * Math.sin(t + 0.21)]);
  }
  out.esc = K.solidSvg(flat([E.x, Y, E.z], rot(saw, S.esc), 0, 0.6), { tone: "hi", lit: S.duty === "" });
  // The anchor rocks with the pendulum; its pallets reach down either side of the wheel's top.
  const az = C.ANCHOR_Z, U = C.PALLET, dv = az - (E.z + Math.sqrt(E.r * E.r - U * U));
  const arm = [[-1, 0.7], [1, 0.7], [U + 1.2, -dv + 1.6], [U + 0.45, -dv], [U - 0.45, -dv + 0.4], [0, -1.2], [-U + 0.45, -dv + 0.4], [-U - 0.45, -dv], [-U - 1.2, -dv + 1.6]];
  out.anchor = K.solidSvg(flat([E.x, Y + 0.8, az], rot(arm, S.th), 0, 0.7), { tone: "hi" });
  const tip = (side) => { const [u, v] = rot([[side * U, -dv]], S.th)[0]; return [E.x + u, Y + 1.15, az + v]; };
  out.tips = [tip(-1), tip(1)];
  // The pendulum and the crutch that keeps it in step with the anchor.
  const Pn = C.PEND, sx = Math.sin(S.th), cz = Math.cos(S.th);
  out.rod = K.solidSvg(K.prismOf(K.frameOf([E.x, Pn.y, Pn.z], [sx, 0, -cz], [cz, 0, sx], [0, 1, 0]), [[-0.35, -0.2], [0.35, -0.2], [0.35, 0.2], [-0.35, 0.2]], 0, Pn.len - Pn.bob * 0.6, P), { tone: "hi" });
  out.crutch = K.solidSvg(K.prismOf(K.frameOf([E.x, Pn.y + 1, az], [sx, 0, -cz], [cz, 0, sx], [0, 1, 0]), [[-0.3, -0.3], [0.3, -0.3], [0.3, 0.3], [-0.3, 0.3]], 0, 14, P), { tone: "mid" });
  out.bob = K.translateAlong(P, [Pn.len * sx, 0, Pn.len * (1 - cz)]);
  // The weight on its cord from the barrel, and the crank Rocky winds it with.
  const G = C.GREAT, cx = G.x + C.BARREL.r, cy = (C.BARREL.y0 + C.BARREL.y1) / 2;
  out.weight = K.translateAlong(P, [0, 0, S.wt - C.WEIGHT.high]);
  out.cord = K.lineSvg(K.segment([cx, cy, C.SEAT_Z], [cx, cy, S.wt + C.WEIGHT.h + 2.2], P), { tone: "mid" });
  out.cordUp = K.lineSvg(K.segment([cx, cy, G.z], [cx, cy, C.SEAT_Z], P), { tone: "mid" });
  const ca = S.crank, handle = [G.x + C.CRANK.r * Math.cos(ca), C.CRANK.y + 0.6, G.z + C.CRANK.r * Math.sin(ca)];
  out.crank = K.solidSvg(flat([G.x, C.CRANK.y, G.z], rot([[-0.9, -0.9], [C.CRANK.r, -0.7], [C.CRANK.r, 0.7], [-0.9, 0.9]], ca), 0, 0.6), { tone: "hi", lit: S.duty === "rocky" }) +
    K.solidSvg(K.prismOf(K.frameOf(handle, [0, 1, 0], [1, 0, 0], [0, 0, 1]), Array.from({ length: 10 }, (_, i) => [0.7 * Math.cos(i * 0.628), 0.7 * Math.sin(i * 0.628)]), 0, 2.2, P), { tone: "hi" });
  out.handle = [handle[0], handle[1] + 1.6, handle[2]];
  // The hands, in blued steel: the minute hand long and thin, the hour hand short and broad.
  const Ce = C.CENTER, hy = C.DIAL.y + 1.2;
  const hand = (a, len, w, y) => K.solidSvg(flat([Ce.x, y, Ce.z], rot([[-1.6, -w], [len - 1.4, -w * 0.4], [len, 0], [len - 1.4, w * 0.4], [-1.6, w]], a), 0, 0.3), { tone: "hi" });
  const mins = (S.t / 60) % 60, hours = (S.t / 3600) % 12;
  out.hands = `<g class="lc-hand">${hand(Math.PI / 2 + (hours / 12) * Math.PI * 2, 6.6, 0.9, hy)}${hand(Math.PI / 2 + (mins / 60) * Math.PI * 2, 10.6, 0.55, hy + 0.35)}</g>` + K.dotsSvg([at([Ce.x, hy + 0.7, Ce.z])], { size: 0.9, tone: "hi" });
  // The hammer swings on its arbor; its head strikes the bell's rim.
  const H = C.HAMMER, ha = S.ham, hd = [H.x + H.len * Math.sin(ha), H.y, H.z + H.len * Math.cos(ha)];
  out.hammer = K.solidSvg(K.prismOf(K.frameOf([H.x, H.y, H.z], [Math.sin(ha), 0, Math.cos(ha)], [Math.cos(ha), 0, -Math.sin(ha)], [0, 1, 0]), [[-0.35, -0.3], [0.35, -0.3], [0.35, 0.3], [-0.35, 0.3]], -4, H.len - 0.8, P), { tone: "hi", lit: S.duty === "" && S.ring > 0.5 }) +
    K.solidSvg(K.prismOf(K.frameOf([hd[0], H.y - 1.1, hd[2]], [0, 1, 0], [1, 0, 0], [0, 0, 1]), Array.from({ length: 12 }, (_, i) => [0.95 * Math.cos(i * 0.5236), 0.95 * Math.sin(i * 0.5236)]), 0, 2.2, P), { tone: "hi" });
  out.head = hd;
  // The fly: two vanes that spin while the strike train runs, to slow it.
  const F = C.FLY, vane = [[-3.2, -0.15], [3.2, -0.15], [3.2, 0.15], [-3.2, 0.15]];
  out.fly = K.solidSvg(flat([F.x, Y + 2.4, F.z], rot(vane, S.fly), 0, 1.6), { tone: "hi" });
  return out;
}

export function poses(C, S, D) {
  const G = C.GREAT, h = D.handle;
  // Rocky winds with both hands on the crank's handle; Mo hangs on the pendulum rod and swings with it.
  const rocky = {
    at: [G.x - 6, C.DIAL.y + 1.4, C.SEAT_Z],
    heading: 30,
    lean: 4,
    look: [0, 10],
    paws: S.winding || S.wt < C.WEIGHT.high - 0.5 ? { l: [h[0] - 0.4, h[1], h[2]], r: [h[0] + 0.3, h[1], h[2] + 0.4] } : {},
    eyes: S.wt >= C.WEIGHT.high - 0.5 && !S.winding ? "happy" : "open",
  };
  const Pn = C.PEND, dir = [Math.sin(S.th), 0, -Math.cos(S.th)], on = (d) => [C.ESC.x + d * dir[0], Pn.y + 0.6, Pn.z + d * dir[2]], grip = on(72);
  const mo = {
    at: [grip[0], Pn.y + 1.5, grip[2] - 16 * 0.8],
    heading: 45,
    stance: "hang",
    look: [-10, 8],
    paws: { l: on(73), r: on(71) },
    eyes: S.amp < 0.05 ? "shut" : S.ring > 0.4 ? "wide" : "open",
  };
  const knock = {
    at: [-23.5, -17.5, 194],
    heading: 0,
    beak: D.head,
    wings: S.ring > 0.4 ? 0.3 : 0,
    eyes: S.ring > 0.3 ? "wide" : "open",
  };
  return { rocky, mo, knock };
}
