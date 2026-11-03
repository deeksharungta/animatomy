// The derailleur's moving parts and the turning teeth, from the model's state; serialized into the page too.
export function drawn(K, P, C, S, Q, G) {
  const out = {}, solid = K.solidSvg, A = C.ARC.axis;
  const { J1, P: Pk } = G.linkage(C, S.psi), loop = G.chainLoop(C, S.psi, S.phi, S.pos), J2 = loop.J2, y = J1[1];
  out.teeth = C.TEETH.map((n, i) => K.lineSvg(Q.teeth(0, 0, C.Y[i] + C.COG_T, C.R[i], n, S.cas + i * 0.37), { tone: "mid" }));
  // The cage: two plates either side of the jockey wheels, hung from the pivot at the guide pulley's axle.
  const plate = Q.stadium([J1[0], J1[2]], [J2[0], J2[2]], 13.5);
  out.cageIn = solid(Q.polyY(plate, y - 8.6, y - 7), { tone: "mid" });
  const jockey = (c, ang) => solid(Q.discY(c[0], c[2], C.RJ + 1.4, y - C.JOCKEY.t / 2, y + C.JOCKEY.t / 2), { tone: "hi", crease: "lo" }) +
    K.lineSvg(Q.teeth(c[0], c[2], y + C.JOCKEY.t / 2, C.RJ, C.JOCKEY.n, ang), { tone: "mid" }) +
    solid(Q.discY(c[0], c[2], 6.5, y + C.JOCKEY.t / 2, y + 3.4), { tone: "mid", crease: "lo", inner: K.lineSvg(K.pathOf(Array.from({ length: 33 }, (_, i) => Q.at([c[0] + 4.4 * Math.cos(i / 32 * 6.2832), y + 3.4, c[2] + 4.4 * Math.sin(i / 32 * 6.2832)])), true), { tone: "faint" }) });
  out.jockeys = jockey(J1, -S.jock) + jockey(J2, S.jock);
  const ch = G.chainSvg(K, P, C, S, Q, G, loop);
  out.chainDer = ch.der;
  out.chainCas = ch.cas;
  const pinStud = (c) => solid(Q.discY(c[0], c[2], 4, y + 8.6, y + 10.4), { tone: "hi", crease: "lo" }) + K.dotsSvg([Q.at([c[0], y + 10.4, c[2]])], { size: 0.8, tone: "lo" });
  const groove = K.lineSvg(K.pathOf(Q.stadium([J1[0], J1[2]], [J2[0], J2[2]], 10.5).map(([px, pz]) => Q.at([px, y + 8.6, pz])), true), { tone: "faint" });
  const tab = [0.55, 0.62].map((f) => [J1[0] + (J2[0] - J1[0]) * f, J1[2] + (J2[2] - J1[2]) * f]);
  out.cageOut = solid(Q.polyY(plate, y + 7, y + 8.6), { tone: "hi", lit: S.lit === "cage", inner: groove }) + pinStud(J2) +
    solid(Q.bar3([tab[0][0], y + 8.6, tab[0][1]], [tab[1][0], y + 8.6, tab[1][1]], 2.2, 1.2, [0, 1, 0]), { tone: "mid" }) +
    solid(Q.discY(J1[0], J1[2], 9, y + 8.6, y + 13), { tone: "mid", crease: "lo" });
  // The parallelogram: the P-knuckle over the cage pivot, two parallel links back to the B-knuckle, and the
  // return spring across the diagonal; the cable is clamped to the outer link.
  const o = C.OFF, Bk = C.BK, add = (p, q, s = 1) => p.map((v, i) => v + q[i] * s);
  const sp = Q.coil(add(Bk, o, -1), add(Pk, o), 2.4, 10);
  const link = (s) => solid(Q.bar3(add(Bk, o, s), add(Pk, o, s), 3.4, 1.6, A), { tone: "hi", lit: S.lit === "links" && s > 0 });
  const pins = (c) => [1, -1].map((s) => solid(Q.discA(add(c, o, s), A, 2.6, -3.2, 3.2), { tone: "mid", crease: "lo" })).join("");
  const anchor = add(add(Bk, o), Q.sub(Pk, Bk).map((v) => v * C.ANCHOR)), pad = add(add(Bk, o), Q.sub(Pk, Bk).map((v) => v * C.PAD));
  out.links = solid(Q.bar3([J1[0], y + 13, J1[2]], add(Pk, A, 0), 6.5, 5.5, [1, 0, 0]), { tone: "mid" }) + link(-1) +
    K.lineSvg(sp.back, { tone: "lo" }) + pins(Pk) + link(1) + K.lineSvg(sp.front, { tone: "hi" }) +
    solid(Q.discA(anchor, A, 3.2, 1.6, 3.6), { tone: "hi", crease: "lo" }) + solid(Q.discA(pad, A, 2.6, 1.6, 4.4), { tone: "mid", crease: "lo" }) +
    K.lineSvg(K.pathOf([Q.at(C.BARREL), Q.at(add(anchor, A, 3.6))]), { tone: "hi" }) + K.dotsSvg([Q.at(add(anchor, A, 3.6))], { size: 0.9, tone: "lo" });
  out.pad = add(pad, A, 4.6);
  out.J2 = [J2[0], y + 10.6, J2[2]];
  return out;
}
