// ---------------------------------------------------------------- what moves (shared by build and page)

// Everything on the swivel, rebuilt from the model's angles: the fork turns with the swing ph, the arm also
// tips by th on the trunnion. Each item comes back with a depth key (planar, larger is nearer) so the page
// can sort the swivel's parts, the column and the park post back to front.
export function dynamic(K, P, C, S) {
  const cam = K.cameraOf(P), V = [cam.cosA * cam.cosE, cam.sinA * cam.cosE, cam.sinE];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const add = (...vs) => [0, 1, 2].map((i) => vs.reduce((t, v) => t + v[i], 0));
  const mul = (v, s) => [v[0] * s, v[1] * s, v[2] * s];
  const ct = Math.cos(S.th), st = Math.sin(S.th), cp = Math.cos(S.ph), sp = Math.sin(S.ph);
  const dirH = [cp, sp, 0], side = [-sp, cp, 0], dir = [ct * cp, ct * sp, st], up = [-st * cp, -st * sp, ct];
  const O = [0, 0, C.PIVOT_Z];
  const arm = (s, a = 0, h = 0) => add(O, mul(dir, s), mul(side, a), mul(up, h));
  const key = (p) => K.depthOf([p[0], p[1], 0], P);
  const solid = (paths, style) => K.solidSvg(paths, style);
  const line = (d, style) => K.lineSvg(d, style);
  const out = { items: {}, dir, side, up, arm, O };
  const item = (name, p, svg) => { out.items[name] = { key: key(p), svg }; };
  const facing = dot(side, V) > 0 ? 1 : -1;

  // The fork: two cheeks standing on the fork plate, a trunnion cap and a rubber stop on each.
  const F = C.FORK;
  for (const sg of [1, -1]) {
    const Fc = K.frameOf([0, 0, 0], mul(side, sg), dirH, [0, 0, 1]);
    const hw = F.w / 2, pts = [[-11, F.z1], [11, F.z1], [11, F.z1 + 3], [hw, F.top - 3], [hw - 3, F.top], [-hw + 3, F.top], [-hw, F.top - 3], [-11, F.z1 + 3]];
    let svg = solid(K.prismOf(Fc, pts, F.cheek, F.cheek + F.t, P), { tone: "mid", crease: "faint" });
    const outer = F.cheek + F.t, cap = K.frameAlong(add([0, 0, C.PIVOT_Z], mul(side, sg * outer)), mul(side, sg));
    // The tilt quadrant: ticks every 5° round the cap on the outer face, the cap's pointer tips with the arm.
    if (sg === facing) {
      let ticks = "";
      for (let d = -20; d <= 20; d += 5) {
        const a = (d * Math.PI) / 180, r0 = 4.4, r1 = d % 10 === 0 ? 5.8 : 5.1;
        const p0 = add([0, 0, C.PIVOT_Z], mul(side, sg * outer), mul(dirH, -r0 * Math.cos(a)), [0, 0, -r0 * Math.sin(a)]);
        const p1 = add([0, 0, C.PIVOT_Z], mul(side, sg * outer), mul(dirH, -r1 * Math.cos(a)), [0, 0, -r1 * Math.sin(a)]);
        ticks += K.segment(p0, p1, P);
      }
      svg += line(ticks, { tone: "lo" });
    }
    svg += solid(K.disc(0, 1.2, 3.2, cap, P), { tone: "hi" });
    if (sg === facing) svg += line(K.segment(add(arm(0, sg * (outer + 1.2)), mul(dir, -1)), add(arm(0, sg * (outer + 1.2)), mul(dir, -4.6)), P), { tone: "hi", free: "end" });
    svg += K.dotsSvg([K.iso(add([0, 0, C.PIVOT_Z], mul(side, sg * (outer + 1.2))), P)], { size: 0.6, tone: "lo" });
    let pads = "";
    for (const e of [1, -1]) pads += solid(K.prismOf(Fc, [[e * 8.6 - 1.6, C.PIVOT_Z - 7.4], [e * 8.6 + 1.6, C.PIVOT_Z - 7.4], [e * 8.6 + 1.6, C.PIVOT_Z - 5], [e * 8.6 - 1.6, C.PIVOT_Z - 5]], F.cheek - 1, F.cheek, P), { tone: "lo" });
    // The rubber stops sit on the cheek's inner face: hidden behind the near cheek, seen on the far one.
    svg = sg === facing ? pads + svg : svg + pads;
    svg += K.dotsSvg([-8, 8].map((e) => K.iso(add([0, 0, F.z1 + 1.6], mul(dirH, e), mul(side, sg * outer)), P)), { size: 0.45, tone: "lo" });
    item(sg === 1 ? "cheekA" : "cheekB", mul(side, sg * F.cheek), svg);
  }
  // The pointer tab on the fork plate reads the swing off the degree ring below it.
  const Ft = K.frameOf([0, 0, 0], [0, 0, 1], dirH, side);
  item("tab", mul(dirH, 9), solid(K.prismOf(Ft, [[8, -1], [10.4, -0.3], [10.4, 0.3], [8, 1]], F.z0, F.z0 + 1, P), { tone: "hi" }));

  // The trunnion block, and the two halves of the arm bar out of it.
  const Fb = K.frameOf(O, dir, side, up);
  const B = C.BAR, hw = B.w / 2, hh = B.h / 2;
  const bar = [[-hw, -hh + 0.4], [-hw + 0.4, -hh], [hw - 0.4, -hh], [hw, -hh + 0.4], [hw, hh - 0.4], [hw - 0.4, hh], [-hw + 0.4, hh], [-hw, hh - 0.4]];
  const Fk = K.frameOf(O, side, dir, up);
  item("block", O, solid(K.prismOf(Fk, [[-5, -4], [5, -4], [5, 4], [-5, 4]], -F.cheek + 1.6, F.cheek - 1.6, P), { tone: "hi" }) + K.dotsSvg([K.iso(arm(-2.6, 0, 4), P), K.iso(arm(2.6, 0, 4), P)], { size: 0.5, tone: "lo" }));
  // The rotor half: bar, a scale in centimetres on whichever face you see, the hanging rail and the stator boss.
  let r = solid(K.prismOf(Fb, bar, 5, B.to, P), { tone: "mid", crease: "faint" });
  let minor = "", major = "";
  for (let s = 10; s <= 70; s += 5) {
    const big = s % 25 === 0, a = facing * hw;
    (big ? (major += K.segment(arm(s, a, hh), arm(s, a, hh - 2.4), P)) : (minor += K.segment(arm(s, a, hh), arm(s, a, hh - 1.3), P)));
  }
  r += line(minor, { tone: "faint" }) + line(major, { tone: "lo" });
  const R = C.RAIL, rz = -hh - R.drop;
  for (const s of [R.from - 1.5, R.to + 1.5]) r += solid(K.prismOf(Fb, [[-1, rz], [1, rz], [1, -hh], [-1, -hh]], s - 0.8, s + 0.8, P), { tone: "mid" });
  r += solid(K.solidOf([[0, R.r], [R.to - R.from + 3, R.r]], K.frameAlong(arm(R.from - 1.5, 0, rz), dir), P), { tone: "hi", crease: "none" });
  r += solid(K.solidOf([[B.to, 3.6], [B.to + 0.6, 4.4, 1], [C.ROTOR.at - C.ROTOR.w / 2, 4.4]], K.frameAlong(O, dir), P), { tone: "hi" });
  r += solid(K.prismOf(Fb, [[-1.6, 4], [1.6, 4], [1.6, 5.6], [-1.6, 5.6]], B.to + 1.4, B.to + 3.8, P), { tone: "mid" });
  r += K.dotsSvg([K.iso(arm(B.to + 2.6, 0, 5.6), P)], { size: 0.5, tone: "hi" });
  item("barR", arm(B.to / 2), r);
  // The counterweight half: bar, end nut, and the counterweight clamped on with a knurled thumb screw.
  let c = solid(K.prismOf(Fb, bar, B.from, -5, P), { tone: "mid", crease: "faint" });
  c += solid(K.solidOf([[0, 3.6], [2.4, 3.6]], K.frameAlong(arm(B.from), mul(dir, -1)), P), { tone: "hi" });
  // The latch eye under the counterweight half, which Pinch holds while the arm is parked.
  const es = -C.POST.r, ez = -hh - C.EYE;
  c += solid(K.prismOf(Fb, [[-0.7, ez + 1.2], [0.7, ez + 1.2], [0.7, -hh], [-0.7, -hh]], es - 0.7, es + 0.7, P), { tone: "mid" });
  c += solid(K.ringBand(-0.55, 0.55, 0.9, 2, K.frameAlong(arm(es, 0, ez), side), P), { tone: "hi" });
  item("barC", arm(B.from / 2), c);
  const W = C.CW, cwF = K.frameAlong(arm(W.at + W.len / 2), mul(dir, -1));
  let w = solid(K.solidOf([[0, W.r - 1], [0.8, W.r, 1], [W.len - 0.8, W.r, 1], [W.len, W.r - 1]], cwF, P), { tone: "mid" });
  // A knurled band to grip it by, and an index line to read its position off the scale.
  w += K.fadedSvg(K.ribsOf(cwF, 4, W.len - 4, W.r, 72, P, { fade: [0.04, 0.42], seams: true }), { tone: "faint" });
  const ts = arm(W.at, 0, W.r - 0.4);
  w += solid(K.solidOf([[0, 1.2], [2.4, 1.2]], K.frameAlong(ts, up), P), { tone: "hi" }) + solid(K.disc(2.4, 4.4, 2.6, K.frameAlong(ts, up), P), { tone: "hi" });
  item("cw", arm(W.at), w);

  // The rotor: a brass flywheel running on the stator, its bolts turning with the spin and blurring with speed.
  const Ro = C.ROTOR, s0 = Ro.at - Ro.w / 2, s1 = Ro.at + Ro.w / 2, rF = K.frameAlong(O, dir);
  const blur = Math.min(1, S.w / 120);
  let ro = `<g class="gy-brass">${solid(K.solidOf([[s0, Ro.R - 1.4], [s0 + 0.7, Ro.R, 1], [s1 - 0.7, Ro.R, 1], [s1, Ro.R - 1.4]], rF, P), { tone: "hi" })}`;
  const out_ = dot(dir, V) > 0, fs = out_ ? s1 : s0;
  ro += line(K.circleOf(rF, fs, Ro.R - 4, P, 72), { tone: "lo" }) + line(K.circleOf(rF, fs, Ro.hub + 1.5, P, 40), { tone: "faint" });
  const Fr = K.frameOf(arm(fs), dir, side, up), bolts = [];
  for (let i = 0; i < 6; i++) { const t = S.psi + (i * Math.PI) / 3; const p = K.iso(add(arm(fs), mul(side, 10.6 * Math.cos(t)), mul(up, 10.6 * Math.sin(t))), P); bolts.push([p[0], p[1], 1 - 0.8 * blur]); }
  // Six lightening holes through the web; at speed they blur into a dim band.
  const circ = (c, r, n = 20) => Array.from({ length: n }, (_, j) => K.iso(add(c, mul(side, r * Math.cos((j / n) * 6.283)), mul(up, r * Math.sin((j / n) * 6.283))), P));
  let holes = "";
  for (let i = 0; i < 6; i++) { const t = S.psi + 0.52 + (i * Math.PI) / 3; holes += K.pathOf(circ(add(arm(fs), mul(side, 15.5 * Math.cos(t)), mul(up, 15.5 * Math.sin(t))), 2.9), true); }
  if (blur < 0.98) ro += `<path class="gy-void" d="${holes}" opacity="${(1 - blur).toFixed(2)}"/>`;
  if (blur > 0.02) ro += `<path class="gy-void" fill-rule="evenodd" d="${K.pathOf(circ(arm(fs), 18.4, 64), true) + K.pathOf(circ(arm(fs), 12.6, 48).reverse(), true)}" opacity="${(0.6 * blur).toFixed(2)}"/>`;
  ro += K.dotsSvg(bolts, { size: 0.9, tone: "lo" });
  ro += line(K.arcOf(rF, s0 + 2.2, Ro.R, P), { tone: "faint" }) + line(K.arcOf(rF, s1 - 2.2, Ro.R, P), { tone: "faint" });
  ro += `</g>`;
  if (out_) ro += solid(K.solidOf([[s1, 6], [s1 + 1.6, 6, 1], [s1 + 2.4, 4.2]], rF, P), { tone: "mid" }) + solid(K.disc(s1 + 2.4, s1 + 4.4, 2.6, rF, P), { tone: "hi" });
  else ro = solid(K.solidOf([[s1, 6], [s1 + 1.6, 6, 1], [s1 + 2.4, 4.2]], rF, P), { tone: "mid" }) + solid(K.disc(s1 + 2.4, s1 + 4.4, 2.6, rF, P), { tone: "hi" }) + ro;
  void Fr;
  item("rotor", arm(Ro.at), ro);
  out.terminal = arm(B.to + 2.6, 0, 5.8);
  out.facing = facing;
  return out;
}

// Crew poses from the state and the moving parts.
export function poses(C, S, D, MO, PINCH) {
  const add = (...vs) => [0, 1, 2].map((i) => vs.reduce((t, v) => t + v[i], 0));
  const mul = (v, s) => [v[0] * s, v[1] * s, v[2] * s];
  const hh = C.BAR.h / 2;
  // Volta lies along the top of the arm from the motor's terminal back over the trunnion block.
  const path = [[73, 5.2], [69, 2 + 1.9], [40, 3.9], [12, 3.9]].map(([s, h]) => D.arm(s, 0, h));
  const volta = { path, charge: S.motor ? 0.45 + 0.4 * Math.min(1, S.amps) : 0, flicker: S.motor ? Math.floor(S.t * 14) : 0, target: S.motor ? D.terminal : undefined, eyes: S.motor ? "happy" : S.w > 5 ? "open" : "shut" };
  // Mo hangs from the rail under the arm; moving out, his paws go hand over hand.
  const g = D.arm(S.d, 0, -hh - C.RAIL.drop - C.RAIL.r);
  const sideV = mul(D.side, D.facing), heading = (Math.atan2(sideV[1] - 0.35 * D.dir[1], sideV[0] - 0.35 * D.dir[0]) * 180) / Math.PI;
  const hand = S.climb ? Math.sin(S.d * 0.9) * 1.6 : 0;
  const mo = {
    at: [g[0], g[1], g[2] - MO.size * 0.93],
    heading, stance: "hang", lean: 0, look: [0, S.climb ? 10 : -6],
    paws: { l: add(g, mul(D.dir, 1.3 + hand)), r: add(g, mul(D.dir, -1.3 + hand)) },
    eyes: S.w < 5 && !S.lock ? "wide" : S.lock && S.w < 5 ? "shut" : "open",
  };
  // Pinch stands on the park post; while the arm is parked his claws hold the bar from below.
  const pa = (C.PARK * Math.PI) / 180 + Math.PI, post = [C.POST.r * Math.cos(pa), C.POST.r * Math.sin(pa), C.POST.z1];
  const feet = [post[0] + 4, post[1], C.POST.z1 - C.POST.drop * S.pz];
  const over = Math.abs(Math.cos(S.ph + Math.PI - pa)) > 0.93 && !S.lock;
  const grip = D.arm(-C.POST.r, 0, -hh - C.EYE - 1.8);
  const pinch = {
    at: feet, heading: 80, stance: "up", lean: 0, look: [0, S.lock ? 18 : 30],
    paws: S.lock ? { l: add(grip, mul(D.dir, 0.9)), r: add(grip, mul(D.dir, -0.9)) } : undefined,
    hop: S.pz > 0.02 && S.pz < 0.98 ? 1.5 : 0, eyes: over ? "wide" : S.lock ? "open" : "happy",
  };
  return { volta, mo, pinch, post };
}
