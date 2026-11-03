// ---------------------------------------------------------------- the fork, its tilt quadrant and Pinch's shelf

// The fork turns with the swing: two cheeks on the fork plate, a trunnion cap and a rubber stop on each, a
// graduated quadrant with stop pins on the cheek you see, the index tab over the degree ring, and the shelf
// Pinch stands on under the counterweight half. X carries the frame and helpers from dynamic().
export function forkOf(K, P, C, S, X) {
  const { add, mul, dirH, side, dir, arm, solid, line, item, facing } = X;
  const F = C.FORK, D = Math.PI / 180, Z = [0, 0, 1];
  for (const sg of [1, -1]) {
    const Fc = K.frameOf([0, 0, 0], mul(side, sg), dirH, Z);
    const hw = F.w / 2, pts = [[-11, F.z1], [11, F.z1], [11, F.z1 + 3], [hw, F.top - 3], [hw - 3, F.top], [-hw + 3, F.top], [-hw, F.top - 3], [-11, F.z1 + 3]];
    let svg = solid(K.prismOf(Fc, pts, F.cheek, F.cheek + F.t, P), { tone: "mid", crease: "faint" });
    const outer = F.cheek + F.t, face = add([0, 0, C.PIVOT_Z], mul(side, sg * (outer + 0.6)));
    const qp = (r, a) => add(face, mul(dirH, r * Math.cos(a * D)), [0, 0, r * Math.sin(a * D)]);
    if (sg === facing) {
      // The quadrant: a sector plate on the rotor side, ticks every 5°, a stop pin past each end of the scale.
      const sector = [[0, C.PIVOT_Z]];
      for (let a = -30; a <= 30; a += 5) sector.push([11.4 * Math.cos(a * D), C.PIVOT_Z + 11.4 * Math.sin(a * D)]);
      svg += solid(K.prismOf(Fc, sector, outer, outer + 0.6, P), { tone: "hi" });
      let minor = "", major = "";
      for (let a = -20; a <= 20; a += 5) (a % 10 ? (minor += K.segment(qp(10.8, a), qp(9.4, a), P)) : (major += K.segment(qp(10.8, a), qp(8.4, a), P)));
      svg += line(minor, { tone: "faint" }) + line(major, { tone: "lo" }) + line(K.arcOf(K.frameOf(face, mul(side, sg), dirH, Z), 0, 10.8, P, { least: -1, from: -22 * D, to: 22 * D }), { tone: "faint" });
      for (const a of [-26.2, 26.2]) svg += solid(K.disc(0, 1.6, 1, K.frameAlong(qp(7, a), mul(side, sg)), P), { tone: "mid" });
      svg += K.dotsSvg([K.iso(qp(5.6, -12), P), K.iso(qp(5.6, 12), P)], { size: 0.4, tone: "lo" });
    }
    const cap = K.frameAlong(add([0, 0, C.PIVOT_Z], mul(side, sg * outer)), mul(side, sg));
    svg += solid(K.disc(0, 1.6, 3.2, cap, P), { tone: "hi" });
    // The pointer is fixed to the trunnion pin, so it tips with the arm across the quadrant.
    if (sg === facing) svg += line(K.segment(arm(0, sg * (outer + 1.6)), arm(10.4, sg * (outer + 1.6)), P), { tone: "hi", free: "end" });
    svg += K.dotsSvg([K.iso(add([0, 0, C.PIVOT_Z], mul(side, sg * (outer + 1.6))), P)], { size: 0.6, tone: "lo" });
    let pads = "";
    for (const e of [1, -1]) pads += solid(K.prismOf(Fc, [[e * 8.6 - 1.6, C.PIVOT_Z - 7.4], [e * 8.6 + 1.6, C.PIVOT_Z - 7.4], [e * 8.6 + 1.6, C.PIVOT_Z - 5], [e * 8.6 - 1.6, C.PIVOT_Z - 5]], F.cheek - 1, F.cheek, P), { tone: "lo" });
    // The rubber stops sit on the cheek's inner face: hidden behind the near cheek, seen on the far one.
    svg = sg === facing ? pads + svg : svg + pads;
    svg += K.dotsSvg([-8, 8].map((e) => K.iso(add([0, 0, F.z1 + 1.6], mul(dirH, e), mul(side, sg * outer)), P)), { size: 0.45, tone: "lo" });
    item(sg === 1 ? "cheekA" : "cheekB", mul(side, sg * F.cheek), svg);
  }
  // The index tab: from the fork plate's rim down over the housing's degree ring, to read the swing.
  const Ft = K.frameOf([0, 0, 0], side, dirH, Z), H = C.HOUSING;
  let tab = solid(K.prismOf(Ft, [[F.r - 1.6, F.z0], [F.r, F.z0], [H.r + 0.6, H.z1 + 0.6], [H.r - 1.2, H.z1 + 0.6]], -0.5, 0.5, P), { tone: "hi" });
  tab += K.dotsSvg([0, 1, 2, 3].map((i) => K.iso(add(mul(dirH, 10 * Math.cos(0.6 + (i * Math.PI) / 2)), mul(side, 10 * Math.sin(0.6 + (i * Math.PI) / 2)), [0, 0, F.z1]), P)), { size: 0.45 });
  item("tab", mul(dirH, F.r), tab);
  // Pinch's shelf: a strut hung from the fork plate and a platform with a raised lip, under the latch lug.
  const Sh = C.SHELF, Fs = K.frameOf([0, 0, 0], side, dirH, Z);
  let sh = solid(K.prismOf(Fs, [[-F.r + 2.4, F.z0], [-F.r + 0.4, F.z0], [Sh.s + 5, Sh.z], [Sh.s + 7, Sh.z]], Sh.side - 5, Sh.side - 3, P), { tone: "mid" });
  const Fp = K.frameOf([0, 0, Sh.z - 1.6], Z, dirH, side), pl = [[Sh.s - 6, Sh.side - 5], [Sh.s + 6, Sh.side - 5], [Sh.s + 6, Sh.side + 5], [Sh.s - 6, Sh.side + 5]];
  sh = solid(K.prismOf(Fp, pl, 0, 1.6, P), { tone: "mid" }) + sh;
  sh += K.dotsSvg([[-4.6, -3.6], [4.6, -3.6], [-4.6, 3.6], [4.6, 3.6]].map(([a, b]) => K.iso(add(mul(dirH, Sh.s + a), mul(side, Sh.side + b), [0, 0, Sh.z]), P)), { size: 0.4, tone: "lo" });
  item("shelf", add(mul(dirH, Sh.s), mul(side, Sh.side)), sh);
  void dir;
}
