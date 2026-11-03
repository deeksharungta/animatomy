// The strike train's moving parts, drawn from the model's state; serialized into the page like going().
export function strike(K, P, C, S, W) {
  const out = {};
  const { SGREAT: SG, PINS: N, LOCK: Lk, WARN: Wn, FLY: F, HAMMER: H, LEVER: Lv } = C;
  out.sgreat = W.wheel(SG, S.sgreat);
  // The pin wheel: eight steel pins stand out of its face, and each lifts the hammer's tail once.
  const pins = [];
  for (let i = 0; i < N.count; i++) pins.push(W.pin(W.pt(N.x, N.z, N.at, S.pins + (i / N.count) * Math.PI * 2, N.y + 0.6), 0.36, 0.9));
  out.pins = W.wheel(N, S.pins) + pins.join("");
  // The locking wheel turns once a blow; its pin is what Rocky's hook catches.
  out.lock = W.wheel(Lk, S.lock, { spokes: 3 }) + W.pin(W.pt(Lk.x, Lk.z, Lk.at, S.lock, Lk.y + 0.6), 0.4, 1.4);
  out.warn = W.wheel(Wn, S.warn, { spokes: 3 }) + W.pin(W.pt(Wn.x, Wn.z, 2.5, S.warn, Wn.y + 0.6), 0.32, 1.6);
  // The fly: two vanes on its arbor that beat the air and keep the strike train from racing.
  const vane = [[-F.vane, -0.13], [F.vane, -0.13], [F.vane, 0.13], [-F.vane, 0.13]];
  out.fly = K.solidSvg(W.flat([F.x, -21.4, F.z], W.rot(vane, S.fly), 0, 2.8), { tone: "hi" }) +
    K.solidSvg(K.disc(0, 1.2, 0.7, K.frameAlong([F.x, -20.6, F.z], [0, 1, 0]), P), { tone: "hi", crease: "lo" });
  // The hammer: a long stem from its arbor up to a round head at the bell's lip, and a short tail on the pins.
  const a = S.ham, dir = [-Math.sin(a), 0, Math.cos(a)], head = [H.x + H.len * dir[0], H.y, H.z + H.len * dir[2]];
  out.hammer = W.bar([H.x, H.y, H.z], [H.x + (H.len - 0.9) * dir[0], H.y, H.z + (H.len - 0.9) * dir[2]], 0.32, 0.28, "hi", S.lit === "hammer") +
    K.solidSvg(K.disc(0, 2.2, 0.95, K.frameAlong([head[0], H.y - 1.1, head[2]], [0, 1, 0]), P), { tone: "hi", crease: "lo" }) +
    K.solidSvg(K.disc(0, 0.7, 0.8, K.frameAlong([H.x, H.y - 0.35, H.z], [0, 1, 0]), P), { tone: "hi", crease: "lo" });
  const ta = Math.PI + 0.436 + (a - H.rest), tail = [H.x + 4.6 * Math.cos(ta), -21, H.z + 4.6 * Math.sin(ta)];
  out.tail = W.bar([H.x, -21, H.z], tail, 0.36, 0.38) + K.solidSvg(K.disc(0, 0.8, 0.75, K.frameAlong([H.x, -21.4, H.z], [0, 1, 0]), P), { tone: "hi", crease: "lo" });
  out.head = [head[0] + 0.7, H.y + 1.1, head[2] + 0.5];
  // The locking lever, turned anticlockwise by S.lever about its stud: its bar, the hook over the locking pin,
  // the warning flag, the knob on its tail; and the lifting arm under the hour pin.
  const piv = [Lv.x, Lv.y, Lv.z], f = S.lever;
  const L = (u, v, y = Lv.y) => { const [x, z] = W.rot([[u, v]], f)[0]; return [Lv.x + x, y, Lv.z + z]; };
  const poly = (pts) => W.rot(pts, f);
  const len = Lv.tail - Lv.x, hook = C.LOCK.x + Lk.at * Math.cos(Lk.catch) - Lv.x;
  out.lever = K.solidSvg(W.flat([Lv.x, Lv.y - 0.3, Lv.z], poly([[-0.9, -0.38], [len, -0.32], [len, 0.32], [-0.9, 0.38]]), 0, 0.6), { tone: "hi", lit: S.lit === "lever" }) +
    K.solidSvg(W.flat([Lv.x, Lv.y - 0.3, Lv.z], poly([[hook - 0.4, -0.3], [hook + 0.35, -0.3], [hook + 0.2, -0.82], [hook - 0.3, -0.82]]), 0, 0.6), { tone: "hi" }) +
    K.solidSvg(W.flat([Lv.x, -21.9, Lv.z], poly([[6.2, -0.1], [6.8, -0.1], [6.8, -0.9], [6.2, -0.9]]), 0, 2.3), { tone: "mid" }) +
    W.pin(L(len, 0, Lv.y - 0.3), 0.55, 1.5) +
    K.solidSvg(K.disc(0, 0.9, 0.95, K.frameAlong([Lv.x, Lv.y - 0.3, Lv.z], [0, 1, 0]), P), { tone: "hi", crease: "lo" });
  out.lifting = W.bar(L(0, 0, -22.05), L(Lv.arm[0], Lv.arm[1], -22.05), 0.3, 0.24) + K.solidSvg(K.disc(0, 0.5, 0.8, K.frameAlong([Lv.x, -22.3, Lv.z], [0, 1, 0]), P), { tone: "hi" });
  out.tailKnob = L(len, 0.2, Lv.y + 1.2);
  return out;
}
