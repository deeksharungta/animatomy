// The parts that move, rebuilt from the state each frame: the hammer, the springs, the hold-down bar, the pedal,
// and the cheese on it. Serialized into the page as it stands: it uses only K, P, C, S and the page's
// wireOf, bendOf and pedalPt.
export function dynamic(K, P, C, S) {
  const Z = C.AX.z, th = S.th, ct = Math.cos(th), st = Math.sin(th);
  const arm = (r, y) => [r * ct, y, Z + r * st];
  const tan = [-st, 0, ct];
  const at = (p) => K.iso(p, P), path = (pts, closed) => K.pathOf(pts.map(at), closed);
  const W = C.WIRE, SP = C.SPRING;

  // The bail: two arms from the eyes on the axle, bent round into the crossbar.
  const U = bendOf([arm(3.4, C.ARM_Y), arm(C.ARM_L, C.ARM_Y), arm(C.ARM_L, -C.ARM_Y), arm(3.4, -C.ARM_Y)], 7, 5);
  const n = U.length;
  const armNear = wireOf(K, P, U.slice(0, 2), W, { ends: false });
  const cross = wireOf(K, P, U.slice(1, n - 1), W);
  const armFar = wireOf(K, P, U.slice(n - 2), W, { ends: false });

  // A spring: its coil twisted by the hammer's angle, the base leg along the wood and the hook over the arm.
  function spring(sg) {
    const a0 = -Math.PI / 2, a1 = th + 10 * Math.PI, N = 150, back = [], front = [];
    let run = [], near = null;
    for (let i = 0; i <= N; i++) {
      const t = i / N, a = a0 + (a1 - a0) * t, off = [SP.r * Math.cos(a), 0, SP.r * Math.sin(a)];
      const p = [off[0], sg * (SP.y1 - (SP.y1 - SP.y0) * t), Z + off[2]], face = K.depthOf(off, P) > 0;
      if (near === null) near = face;
      if (face !== near) { run.push(p); (near ? front : back).push(run); run = [p]; near = face; continue; }
      run.push(p);
    }
    if (run.length > 1) (near ? front : back).push(run);
    // Each run of wire: a body as wide as the wire, between two edge lines offset half the wire either side on screen.
    const wpx = (SP.wire / 2) * Math.hypot(...[0, 1].map((i) => K.iso([1, 0, 0], P)[i] - K.iso([0, 0, 0], P)[i]));
    const coil = (runs, cls) => {
      const body = runs.map((r) => path(r)).join(""), edges = [];
      for (const r of runs) {
        const q = r.map(at);
        for (const sgn of [1, -1]) edges.push(K.pathOf(q.map((p, i) => {
          const a = q[Math.max(0, i - 1)], b = q[Math.min(q.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
          return [p[0] - (dy / l) * wpx * sgn, p[1] + (dx / l) * wpx * sgn];
        })));
      }
      return `<g class="mt-coil ${cls}"><path class="i" d="${body}"/>${K.lineSvg(edges.join(""), { tone: cls === "b" ? "mid" : "hi" })}</g>`;
    };
    const ay = sg > 0 ? [SP.y0 - 0.5, 41] : [-41, -SP.y0 + 0.5];
    const axle = wireOf(K, P, [[0, ay[0], Z], [0, ay[1], Z]], W, { ends: sg > 0 ? [false, true] : true });
    const leg = wireOf(K, P, bendOf([[0, sg * SP.y1, Z - SP.r], [SP.leg, sg * SP.y1, Z - SP.r], [SP.leg + 1.2, sg * SP.y1, C.TOP - 0.2]], 1.2, 3), SP.wire / 2, { ends: [true, false] }) + K.dotsSvg([at([SP.leg + 1.2, sg * SP.y1, C.TOP])], { size: 0.55, tone: "mid" });
    const o = SP.r * 1.0, off = (r, y, d) => arm(r, y).map((v, i) => v + tan[i] * d);
    const hook = wireOf(K, P, bendOf([off(o, sg * SP.y0, 0), off(SP.hook + 1.6, sg * SP.y0, W + SP.wire / 2), off(SP.hook + 1.6, sg * (C.ARM_Y - 1.2), W + SP.wire / 2)], 1, 3), SP.wire / 2);
    const legs = leg + hook;
    return sg > 0 ? coil(back, "b") + axle + coil(front, "f") + legs : legs + coil(back, "b") + axle + coil(front, "f");
  }

  // The hold-down bar: from its eye on the far staple to the tip under the pedal's lip.
  const bd = [Math.cos(S.phi), 0, Math.sin(S.phi)], B0 = [C.BAR.x, 0, C.BAR.z];
  const bar = wireOf(K, P, [B0.map((v, i) => v + bd[i] * 2.4), B0.map((v, i) => v + bd[i] * C.BAR.L)], C.BAR.r);

  // The pedal, tipped psi degrees about its pivot: tongue, plate, bait cup, catch tab and lip.
  const Q = C.PEDAL, ps = (S.psi * Math.PI) / 180;
  const pu = [Math.cos(ps), 0, -Math.sin(ps)], pn = [Math.sin(ps), 0, Math.cos(ps)], pv = [0, 1, 0];
  const F = K.frameOf([Q.px, 0, Q.pz], pn, pu, pv);
  const rect = (u0, u1, v0, v1, r = 0) => {
    const pts = [], cs = [[u1 - r, v1 - r, 0], [u0 + r, v1 - r, 1], [u0 + r, v0 + r, 2], [u1 - r, v0 + r, 3]];
    for (const [cu, cv, q] of cs) for (let j = 0; j <= 3; j++) { const a = ((q + j / 3) * Math.PI) / 2; pts.push([cu + r * Math.cos(a), cv + r * Math.sin(a)]); }
    return pts;
  };
  const pp = (u, v, s) => pedalPt(C, u, v, s, S.psi);
  const plate = K.solidSvg(K.prismOf(F, rect(Q.tongue[0], Q.tongue[1] + 1, -Q.tongue[2], Q.tongue[2], 1), -Q.h, Q.h, P), { tone: "hi" })
    + K.solidSvg(K.prismOf(F, rect(Q.plate[0], Q.plate[1], -Q.plate[2], Q.plate[2], 2.5), -Q.h, Q.h, P), { tone: "hi", inner: K.lineSvg(path(rect(4, 23, -15, 15, 3).map(([u, v]) => pp(u, v, Q.h)), true) + path(rect(6, 21, -12.5, 12.5, 2).map(([u, v]) => pp(u, v, Q.h)), true) + path(Array.from({ length: 25 }, (_, i) => pp(Q.cup[0] + (Q.cup[1] + 2.4) * Math.cos((i / 24) * 6.283), (Q.cup[1] + 2.4) * Math.sin((i / 24) * 6.283), Q.h)), true), { tone: "lo" }) })
    + K.dotsSvg([pp(35, -17, Q.h), pp(35, 17, Q.h), pp(2.5, -17, Q.h), pp(2.5, 17, Q.h)].map(at), { size: 0.5 });
  const Fc = K.frameOf(pp(Q.cup[0], 0, Q.h), pn, pu, pv);
  const cup = K.solidSvg(K.disc(0, 1.4, Q.cup[1], Fc, P), { tone: "hi", inner: K.lineSvg(K.arcOf(Fc, 1.4, Q.cup[1] - 1.6, P, { least: -1 }), { tone: "faint" }) });
  const tab = K.solidSvg(K.prismOf(F, rect(Q.tab[0], Q.tab[1], -3.6, 3.6), Q.h, Q.tab[2], P), { tone: "hi" })
    + K.solidSvg(K.prismOf(F, rect(Q.lip[0], Q.tab[1], -3.6, 3.6), Q.lip[1], Q.tab[2], P), { tone: "hi" });

  // The cheese: a wedge with its holes, sitting in the cup.
  const s0 = Q.h + 1.4, ch = [[24, 0], [40, 0], [40, 12]];
  const Fw = K.frameOf(pp(0, -7, s0), pv, pu, pn);
  const hole = (u, s, r) => path(Array.from({ length: 14 }, (_, i) => pp(u + r * Math.cos((i / 14) * 6.283), 7.02, s0 + s + r * 0.8 * Math.sin((i / 14) * 6.283))), true);
  const holes = `<path class="mt-hole" d="${hole(34, 3.5, 1.8) + hole(37.5, 7.6, 1.2) + hole(29.6, 1.9, 1)}"/>`;
  const cheese = `<g class="mt-cheese">${K.solidSvg(K.prismOf(Fw, ch, 0, 14, P), { tone: "hi", inner: holes })}</g>`;

  return { armNear, armFar, cross, springNear: spring(1), springFar: spring(-1), bar, plate: plate + cup, tab, cheese, hook: off0(1), hookFar: off0(-1) };
  function off0(sg) { const r = SP.hook + 1.6; return arm(r, sg * (C.ARM_Y + 1)).map((v, i) => v + tan[i] * (W + SP.wire / 2)); }
}
