// The derailleur's moving parts and the turning teeth, from the model's state; serialized into the page too.
export function drawn(K, P, C, S, Q, G) {
  const out = {}, solid = K.solidSvg, line = K.lineSvg, A = C.ARC.axis;
  const { J1, P: Pk } = G.linkage(C, S.psi), loop = G.chainLoop(C, S.psi, S.phi, S.pos), J2 = loop.J2, y = J1[1];
  const ring = (c, r, yy, n = 33) => K.pathOf(Array.from({ length: n }, (_, i) => Q.at([c[0] + r * Math.cos(i / (n - 1) * 6.2832), yy, c[2] + r * Math.sin(i / (n - 1) * 6.2832)])), true);
  const hex = (c, r, yy, a = 0) => K.pathOf(Array.from({ length: 6 }, (_, i) => Q.at([c[0] + r * Math.cos(a + i * 1.0472), yy, c[2] + r * Math.sin(a + i * 1.0472)])), true);
  out.teeth = C.TEETH.map((n, i) => line(Q.teeth(0, 0, C.Y[i] + C.COG_T, C.R[i], n, S.cas + i * 0.37), { tone: "mid" }));
  // The cage: two plates either side of the jockey wheels, hung from the pivot at the guide pulley's axle.
  const plate = Q.stadium([J1[0], J1[2]], [J2[0], J2[2]], 13.5);
  out.cageIn = solid(Q.polyY(plate, y - 8.6, y - 7), { tone: "mid" });
  // A jockey wheel: its toothed ring, the sealed bearing's shield and race, and the bolt through it.
  const jockey = (c, ang) => solid(Q.discY(c[0], c[2], C.RJ + 1.4, y - C.JOCKEY.t / 2, y + C.JOCKEY.t / 2), { tone: "hi", crease: "lo", inner: line(ring(c, C.RJ - 3.2, y + C.JOCKEY.t / 2), { tone: "faint" }) }) +
    line(Q.teeth(c[0], c[2], y + C.JOCKEY.t / 2, C.RJ, C.JOCKEY.n, ang), { tone: "mid" }) +
    solid(Q.discY(c[0], c[2], 6.5, y + C.JOCKEY.t / 2, y + 3.4), { tone: "mid", crease: "lo", inner: line(ring(c, 4.4, y + 3.4), { tone: "faint" }) }) +
    K.dotsSvg([0, 1, 2, 3, 4, 5, 6, 7].map((i) => Q.at([c[0] + 10 * Math.cos(ang + i * 0.785), y + C.JOCKEY.t / 2, c[2] + 10 * Math.sin(ang + i * 0.785)])), { size: 0.45, tone: "lo" });
  out.jockeys = jockey(J1, -S.jock) + jockey(J2, S.jock);
  const ch = G.chainSvg(K, P, C, S, Q, G, loop);
  out.chainDer = ch.der;
  out.chainCas = ch.cas;
  const pinStud = (c) => solid(Q.discY(c[0], c[2], 4, y + 8.6, y + 10.4), { tone: "hi", crease: "lo", inner: line(hex(c, 2, y + 10.4, 0.3), { tone: "lo" }) });
  const groove = line(K.pathOf(Q.stadium([J1[0], J1[2]], [J2[0], J2[2]], 10.5).map(([px, pz]) => Q.at([px, y + 8.6, pz])), true), { tone: "faint" });
  const along = (f) => [J1[0] + (J2[0] - J1[0]) * f, J1[2] + (J2[2] - J1[2]) * f];
  const win = line(K.pathOf(Q.stadium(along(0.3), along(0.46), 3.4).map(([px, pz]) => Q.at([px, y + 8.6, pz])), true), { tone: "lo" });
  const tab = [0.55, 0.62].map(along);
  // Mo's spring tab: a lug off the outer plate's rear edge, 26 mm from the pivot, with a peg for his paw.
  const f = S.phi, u = [-Math.sin(f), -Math.cos(f)], n = [Math.cos(f), -Math.sin(f)], cb = Math.cos(C.MO.beta), sb = Math.sin(C.MO.beta);
  const dir = [cb * u[0] + sb * n[0], cb * u[1] + sb * n[1]], T = [J1[0] + C.MO.tab * dir[0], y + 12, J1[2] + C.MO.tab * dir[1]];
  const lug = solid(Q.bar3([J1[0] + 9 * dir[0], y + 9.4, J1[2] + 9 * dir[1]], [T[0] + 3.4 * dir[0], y + 9.4, T[2] + 3.4 * dir[1]], 3.8, 0.9, [0, 1, 0]), { tone: "mid" }) +
    solid(Q.discY(T[0], T[2], 3.2, y + 10.3, y + 16), { tone: "hi", crease: "lo" });
  // The spring's anchor: an arm cast on the P-knuckle's pivot boss, ending in the peg Mo hangs from.
  const M = [J1[0] + C.MO.anchor[0], y + C.MO.anchor[1], J1[2] + C.MO.anchor[2]];
  const arm = solid(Q.bar3([J1[0], y + 12.2, J1[2]], [M[0] + 2.5, y + 12.2, M[2] - 0.7], 4.2, 1, [0, 1, 0]), { tone: "mid" }) +
    solid(Q.discY(M[0], M[2], 3.2, y + 13.2, y + 18.5), { tone: "hi", crease: "lo" });
  // The pegs' heads, broad enough to read at a beat's camera; Mo's paws close round them.
  const cap = (c, y0) => solid(Q.discY(c[0], c[2], 4.2, y0, y0 + 1.2), { tone: "hi", crease: "lo", inner: K.dotsSvg([Q.at([c[0], y0 + 1.2, c[2]])], { size: 0.7, tone: "lo" }) });
  // From the anchor peg hangs the spring's hooked leg, a short strap with a ring at its foot for Mo's paw.
  const R = [M[0], y + 16, M[2] - C.MO.strap];
  out.moCaps = cap(T, y + 16) + solid(Q.bar3([M[0], y + 16, M[2]], R, 2.4, 0.7, [0, 1, 0]), { tone: "mid" }) + cap(M, y + 18.5) +
    solid(Q.discY(R[0], R[2], 2.8, y + 15.4, y + 16.8), { tone: "mid", crease: "lo", inner: K.lineSvg(K.pathOf(Array.from({ length: 17 }, (_, i) => Q.at([R[0] + Math.cos(i * 0.3927), y + 16.8, R[2] + Math.sin(i * 0.3927)])), true), { tone: "lo" }) });
  out.cageOut = solid(Q.polyY(plate, y + 7, y + 8.6), { tone: "hi", lit: S.lit === "cage", inner: groove + win }) + pinStud(J2) +
    solid(Q.bar3([tab[0][0], y + 8.6, tab[0][1]], [tab[1][0], y + 8.6, tab[1][1]], 2.2, 1.2, [0, 1, 0]), { tone: "mid" }) + lug +
    solid(Q.discY(J1[0], J1[2], 9, y + 8.6, y + 13), { tone: "mid", crease: "lo", inner: line(hex(J1, 3.2, y + 13), { tone: "lo" }) }) + arm;
  out.moA = [M[0], y + 15, M[2] - C.MO.strap];
  out.moT = [T[0], y + 13, T[2]];
  // The parallelogram: the P-knuckle over the cage pivot and two parallel links back to the B-knuckle; the cable
  // is clamped to the outer link, and Roo's spring pin stands proud of it a third of the way out.
  const o = C.OFF, Bk = C.BK, add = (p, q, s = 1) => p.map((v, i) => v + q[i] * s);
  const link = (s) => solid(Q.bar3(add(Bk, o, s), add(Pk, o, s), 3.4, 1.6, A), { tone: "hi", lit: S.lit === "links" && s > 0 });
  const pins = (c) => [1, -1].map((s) => solid(Q.discA(add(c, o, s), A, 2.6, -3.2, 3.2), { tone: "mid", crease: "lo", inner: line(K.pathOf(Array.from({ length: 25 }, (_, i) => Q.at(add(add(c, o, s), Q.ring(A, 1.4, i / 24 * 6.2832, 3.2)))), true), { tone: "faint" }) })).join("");
  const anchor = add(add(Bk, o), Q.sub(Pk, Bk).map((v) => v * C.ANCHOR));
  const pin = add(add(add(Bk, o), Q.sub(Pk, Bk).map((v) => v * C.BOSS.f)), A, 0);
  const boss = solid(Q.discA(pin, A, 2.2, 1.6, C.BOSS.g - 0.8), { tone: "mid", crease: "lo" }) + solid(Q.discA(pin, A, 3.4, C.BOSS.g - 0.8, C.BOSS.g + 0.4), { tone: "hi", crease: "lo" });
  const bolt = solid(Q.discA(anchor, A, 3.6, 1.6, 2.6), { tone: "mid", crease: "lo" }) + solid(Q.discA(anchor, A, 2.6, 2.6, 4.6), { tone: "hi", crease: "lo", inner: line(K.pathOf(Array.from({ length: 6 }, (_, i) => Q.at(add(anchor, Q.ring(A, 1.4, i * 1.0472, 4.6)))), true), { tone: "lo" }) });
  const tail = add(anchor, Q.sub(anchor, C.BARREL).map((v) => v * 0.16)), crimp = add(tail, Q.sub(anchor, C.BARREL).map((v) => v * 0.05));
  const pd = Q.unit(Q.sub(Pk, [J1[0], y + 13, J1[2]]));
  out.links = solid(Q.bar3([J1[0], y + 13, J1[2]], add(Pk, A, 0), 6.5, 5.5, [1, 0, 0]), { tone: "mid" }) +
    solid(Q.discA(Pk, pd, 3.6, 0, 1.4), { tone: "hi", crease: "lo", inner: line(K.pathOf(Array.from({ length: 6 }, (_, i) => Q.at(add(Pk, Q.ring(pd, 1.6, i * 1.0472, 1.4)))), true), { tone: "lo" }) }) + link(-1) + pins(Pk) + link(1) + boss + bolt +
    line(K.pathOf([Q.at(C.BARREL), Q.at(add(anchor, A, 3.6)), Q.at(add(tail, A, 3.6))]), { tone: "hi" }) +
    solid(Q.bar3(add(tail, A, 3.6), add(crimp, A, 3.6), 1.1, 1.1, A), { tone: "hi" }) + K.dotsSvg([Q.at(add(anchor, A, 3.6))], { size: 0.9, tone: "lo" });
  out.boss = add(pin, A, C.BOSS.g);
  return out;
}
