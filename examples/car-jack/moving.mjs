// What changes each frame, as markup: the oil in the reservoir, under the ram and in the pump chamber, the beads of
// oil running through the galleries, the suction valve's ball and spring, the release needle and its knob, and the
// pump's link, handle socket and handle. Serialized into the page as it stands; K carries the kit and lathe.
export function dynamic(K, P, C, S) {
  const at = (p) => K.iso(p, P), out = {}, Z0 = C.BASE.z1, PU = C.PUMP;
  const arc = (r, cx, n = 28) => Array.from({ length: n + 1 }, (_, i) => { const a = Math.PI + (Math.PI * i) / n; return [cx + r * Math.cos(a), r * Math.sin(a)]; });
  const half = (r0, r1, cx = 0) => (r0 > 0 ? [...arc(r1, cx), ...arc(r0, cx).reverse()] : arc(r1, cx));
  const hs = (r0, r1, z0, z1, cx = 0) => K.extrude(half(r0, r1, cx), z0, Math.max(0.05, z1 - z0), P, { convex: r0 === 0 });
  const flat = (poly, shade = 2, tone = "mid", lit = false) => { const d = K.pathOf(poly.map(([x, z]) => at([x, 0, z])), true); return `<g class="iso-solid"${lit ? " data-lit" : ""}><path class="iso-fill" d="${d}"/><path class="iso-shade" data-shade="${shade}" d="${d}"/><path class="iso-line iso-edge" data-tone="${tone}" d="${d}"/></g>`; };
  const rect = (x0, x1, z0, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];

  // The oil: the reservoir's level, the column under the ram, and the pump chamber up to Ottie's feet.
  out.res = K.solidSvg(hs(C.CYL.r1, C.TUBE.r0, Z0, S.level), { tone: "hi", crease: "none" });
  out.cyl = K.solidSvg(hs(0, C.CYL.r0, Z0, Z0 + S.e), { tone: "hi", crease: "none" });
  out.cham = K.solidSvg(hs(0, PU.r, Z0, S.zp - 3, PU.x), { tone: "hi", crease: "none" });

  // Beads of oil along each passage while it flows: spaced 6 mm, moving with the volume through it.
  const beads = (pts, phase, amount) => {
    if (amount < 0.02) return "";
    const seg = [], dots = [];
    let total = 0;
    for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); total += l; }
    for (let s = ((phase % 6) + 6) % 6; s < total; s += 6) {
      let d = s, i = 0;
      while (i < seg.length - 1 && d > seg[i]) { d -= seg[i]; i++; }
      const t = Math.min(1, d / seg[i]), a = pts[i], b = pts[i + 1];
      const fade = Math.min(1, s / 5, (total - s) / 5) * amount;
      const p = at([a[0] + (b[0] - a[0]) * t, 0.3, a[1] + (b[1] - a[1]) * t]);
      dots.push(`<circle class="cj-bead" cx="${p[0].toFixed(2)}" cy="${p[1].toFixed(2)}" r="${(1.2 * P.scale).toFixed(2)}" opacity="${fade.toFixed(2)}"/>`);
    }
    return dots.join("");
  };
  const Q = C.POCKET, U = C.SUC, R = C.REL;
  out.beads = beads([[PU.x, Math.min(S.zp - 5, 52)], [PU.x, Q.z], [C.DEL_UP, Q.z], [C.DEL_UP, Z0 + Math.max(2, Math.min(S.e - 2, 30))]], S.ph.del, S.flow.del) +
    beads([[U.x, Math.max(Z0 + 2, S.level - 12)], [U.x, U.z], [PU.x, U.z], [PU.x, Math.min(S.zp - 5, 52)]], S.ph.suc, S.flow.suc) +
    beads([[R.x, Z0 + Math.max(2, Math.min(S.e - 2, 30))], [R.x, R.z], [R.seat - 1, R.z], [R.riser, R.z + R.r], [R.riser, Math.max(Z0 + 2, S.level - 12)]], S.ph.ret, S.flow.ret);

  // The suction valve: its ball lifts off the seat as oil is drawn in, squashing its spring against the retainer.
  const bx = U.check[0] + 1.4 + U.ball + 1.6 * S.ball, x1 = U.check[1] - 1.2, ring = [];
  for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; ring.push([bx + U.ball * Math.cos(a), U.z + U.ball * Math.sin(a)]); }
  const zz = [];
  for (let i = 0; i <= 6; i++) zz.push(at([bx + U.ball + ((x1 - bx - U.ball) * i) / 6, 0, U.z + (i % 2 ? 1.8 : -1.8) * (i > 0 && i < 6 ? 1 : 0.4)]));
  out.ball = K.lineSvg(K.pathOf(zz), { tone: "hi" }) + flat(ring, 3, "hi");

  // The release needle: it backs out 2 mm at full turn, its cone leaving the seat; the knurled knob comes out with it.
  const o = 2 * S.rel, xt = R.seat - o, xe = C.BASE.x0, rn = R.r - 0.8;
  out.needle = flat([[xt, R.z], [xt - 3.4, R.z - rn], [xe - 8 - o, R.z - rn], [xe - 8 - o, R.z + rn], [xt - 3.4, R.z + rn]], 0, "hi", S.lit === "needle");
  const KF = K.frameOf([xe - 7 - o, 0, R.z], [-1, 0, 0], [0, 0, 1], [0, -1, 0]), hr = (r) => Array.from({ length: 21 }, (_, i) => [r * Math.cos((Math.PI * i) / 20), r * Math.sin((Math.PI * i) / 20)]);
  const knurl = [];
  for (let i = 1; i < 10; i++) knurl.push(K.pathOf([at([xe - 7 - o - i, 0, R.z + R.knob]), at([xe - 7 - o - i, 0, R.z - R.knob])]));
  out.knob = flat(rect(xe, xe + 5, R.z - 5, R.z + 5), 0, "lo") + flat(rect(xe - 7 - o, xe, R.z - 5.4, R.z + 5.4), 1, "mid") +
    K.solidSvg(K.prismOf(KF, hr(R.knob), 0, 10, P), { tone: "hi", crease: "lo" }) + K.lineSvg(knurl.join(""), { tone: "lo" });

  // The plunger's cup seal under Ottie's feet, and its crosshead, behind him, that his paws hold and the socket drives.
  const A = [PU.x, 0, S.zp + C.PIN_UP], E = C.EAR, X = C.CROSS;
  out.cup = K.solidSvg(hs(0, PU.r - 0.2, S.zp - 3, S.zp, PU.x), { tone: "lo", crease: "lo" }) +
    K.solidSvg(hs(PU.r - 1.8, PU.r - 0.2, S.zp, S.zp + C.PIN_UP - 3, PU.x), { tone: "hi", crease: "lo" });
  out.cross = K.solidSvg(K.prismOf(K.frameOf([A[0], -4.4, A[2]], [0, 1, 0], [1, 0, 0], [0, 0, 1]), [[-X, -3], [X, -3], [X, 3], [-X, 3]], 0, 2.6, P), { tone: "hi", crease: "lo", lit: S.lit === "pin" }) +
    K.dotsSvg([-X + 2, X - 2].map((dx) => at([A[0] + dx, -1.8, A[2]])), { size: 0.6 }) +
    K.solidSvg(K.disc(0, 15, 2.4, K.frameOf([A[0], -19, A[2]], [0, 1, 0], [1, 0, 0], [0, 0, 1]), P), { tone: "hi" });

  // The pump linkage: the link from the ear pin, the socket's back plate and its pivot pin, the sleeve and the handle,
  // all cut on the section plane like the rest.
  const dx = A[0] - E[0], dz = A[2] - E[2], d = Math.hypot(dx, dz);
  const a = (C.AB * C.AB - C.LINK * C.LINK + d * d) / (2 * d), h = Math.sqrt(Math.max(0, C.AB * C.AB - a * a));
  const Bp = [A[0] - (a * dx) / d - (h * dz) / d, 0, A[2] - (a * dz) / d + (h * dx) / d];
  const u = [(A[0] - Bp[0]) / C.AB, 0, (A[2] - Bp[2]) / C.AB], n = [-u[2], 0, u[0]];
  const lu = [(Bp[0] - E[0]) / C.LINK, 0, (Bp[2] - E[2]) / C.LINK], ln = [-lu[2], 0, lu[0]];
  out.link = K.solidSvg(K.prismOf(K.frameOf([E[0], -14, E[2]], [0, -1, 0], lu, ln), [[-4, -4], [C.LINK + 4, -4], [C.LINK + 4, 4], [-4, 4]], 0, 2.6, P), { tone: "mid", crease: "lo" }) +
    K.solidSvg(K.disc(0, 17, 2.4, K.frameOf([E[0], -17, E[2]], [0, 1, 0], [1, 0, 0], [0, 0, 1]), P), { tone: "hi" });
  const SF = K.frameOf([Bp[0], -16, Bp[2]], [0, -1, 0], u, n), L1 = C.SOCKET, s0 = 62;
  out.socket = K.solidSvg(K.prismOf(SF, [[-7, -7], [L1, -8.5], [L1, 8.5], [-7, 7]], 0, 2.6, P), { tone: "hi", crease: "lo" }) +
    K.solidSvg(K.disc(0, 19, 2.6, K.frameOf([Bp[0], -19, Bp[2]], [0, 1, 0], [1, 0, 0], [0, 0, 1]), P), { tone: "hi" });
  const tube = (from, to, r) => K.prismOf(K.frameOf([Bp[0] + u[0] * from, 0, Bp[2] + u[2] * from], u, n, [0, -1, 0]), hr(r), 0, to - from, P);
  out.sleeve = K.solidSvg(tube(s0, L1, 9.5), { tone: "hi", crease: "lo" }) +
    K.dotsSvg([at([Bp[0] + u[0] * (L1 + s0) / 2 + n[0] * 9.4, -0.6, Bp[2] + u[2] * (L1 + s0) / 2 + n[2] * 9.4])], { size: 0.6 });
  const len = C.AB + C.GRIP + 40, bore = (from, to, r) => K.pathOf([[from, r], [to, r], [to, -r], [from, -r]].map(([sv, w]) => at([Bp[0] + u[0] * sv + n[0] * w, 0, Bp[2] + u[2] * sv + n[2] * w])), true);
  out.handle = K.solidSvg(tube(L1, len, 7), { tone: "hi", crease: "lo" }) + `<path class="cj-void" d="${bore(L1 + 0.6, len - 80, 5.4)}"/>` +
    K.solidSvg(tube(len - 80, len + 2, 8.4), { tone: "mid", crease: "lo" });
  out.A = A; out.B = Bp; out.u = u;
  return out;
}
