import { C, M, K, P, DAY0 } from "./model.mjs";

// ---------------------------------------------------------------- what moves (shared by build and page)

export function dynamic(K, P, C, M, S) {
  const out = {};
  const a = M.angle(S.day);
  const dir = [Math.cos(a), Math.sin(a), 0], side = [-Math.sin(a), Math.cos(a), 0];
  const G = M.centre(S.day), G0 = M.centre(C.JUNE_DAY);
  const at = (p) => K.iso(p, P);
  const shift = (p, q) => { const s = at(p), t = at(q); return [s[0] - t[0], s[1] - t[1]]; };
  out.G = G;
  out.globeShift = shift(G, G0);
  // The arm: a flat bar from the collar to a pointer over the month ring, with Pip's handle near its end.
  const A = C.ARM;
  const rr = A.w / 2;
  const bar = [[A.from, -rr], [A.to - 3, -rr], [A.to, 0], [A.to - 3, rr], [A.from, rr]];
  out.bar = K.solidSvg(K.prismOf(K.frameOf([0, 0, 0], [0, 0, 1], dir, side), bar, A.z0, A.z1, P), { tone: "mid", crease: "faint" });
  // Gears 1, 2 and 3 ride on the arm; 1 and 3 turn twice as fast as it, 2 keeps its orientation (as do 0 and 4),
  // so the axis never turns. They are drawn far to near.
  const g = C.GEAR;
  const toward = K.depthOf([dir[0], dir[1], 0], P) - K.depthOf([0, 0, 0], P) > 0;
  out.armFront = toward;
  let gears = "";
  for (const n of toward ? [1, 2, 3] : [3, 2, 1]) {
    const c = [dir[0] * g.pitch * 2 * n, dir[1] * g.pitch * 2 * n, 0];
    gears += K.solidSvg(K.prismOf(K.frameOf(c, [0, 0, 1], [1, 0, 0], [0, 1, 0]), M.teeth(n === 2 ? 0 : 2 * a), g.z0, g.z1, P), { tone: "hi", crease: "faint" }) + K.dotsSvg([at([c[0], c[1], g.z1])], { size: 0.45, tone: "lo" });
  }
  out.gears = gears;
  // Pip's push knob sticks out of the arm's trailing side, at a squirrel's chest height.
  const hz = C.HANDLE.z, back = [-side[0], -side[1], 0];
  const h0 = [dir[0] * C.HANDLE.r - side[0] * rr, dir[1] * C.HANDLE.r - side[1] * rr, hz];
  const knob = [h0[0] + back[0] * C.HANDLE.out, h0[1] + back[1] * C.HANDLE.out, hz];
  out.handle = K.solidSvg(K.solidOf([[0, 0.6], [C.HANDLE.out, 0.6]], K.frameAlong(h0, back), P), { tone: "hi", crease: "none" }) + K.solidSvg(K.sphereOf(knob, 1.3, P, { steps: 24 }), { tone: "hi" });
  out.grip = knob;
  // Mo's crank on the axis's south end: its handle turns with the globe.
  const R = C.GLOBE_R;
  const E = [G[0] - M.A[0] * (R + C.BELOW), G[1] - M.A[1] * (R + C.BELOW), G[2] - M.A[2] * (R + C.BELOW)];
  const hc = [0, 1, 2].map((i) => E[i] + C.CRANK * 0.82 * (Math.cos(S.spin) * M.e1[i] + Math.sin(S.spin) * M.e2[i]));
  const tip = [hc[0] - M.A[0] * 2.4, hc[1] - M.A[1] * 2.4, hc[2] - M.A[2] * 2.4];
  out.crank = K.solidSvg(K.solidOf([[0, 0.55], [2.4, 0.55]], K.frameAlong(hc, [-M.A[0], -M.A[1], -M.A[2]]), P), { tone: "hi", crease: "none" });
  out.crankTip = tip;
  out.hub = E;
  // The globe's surface, drawn about the reference centre G0 and moved with globeShift: land, night, London.
  const cam = K.cameraOf(P), V = [cam.cosA * cam.cosE, cam.sinA * cam.cosE, cam.sinE];
  const unit = (v) => { const l = Math.hypot(...v) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
  // Land on the near half only: each coastline is cut where it crosses the rim and the pieces are joined along
  // the rim. The outlines run clockwise seen from outside; on screen (y down) that is the falling angle.
  const c0 = at(G0), rim = R * cam.k, pt = (n) => at([G0[0] + R * n[0], G0[1] + R * n[1], G0[2] + R * n[2]]);
  const angleOf = (q) => Math.atan2(q[1] - c0[1], q[0] - c0[0]);
  const cut = (a, fa, b, fb) => pt(unit([0, 1, 2].map((i) => Math.abs(fb) * a[i] + Math.abs(fa) * b[i])));
  const turn = (from, to) => (((from - to) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const arc = (from, to) => { const out = []; for (let t = 0.1; t < turn(from, to); t += 0.1) out.push([c0[0] + rim * Math.cos(from - t), c0[1] + rim * Math.sin(from - t)]); return out; };
  const line = (points) => points.map((q, i) => `${i ? "L" : "M"}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join("") + "Z";
  let land = "";
  for (const ring of C.LANDS) {
    const n = ring.map(([lon, lat]) => M.surface(lat, lon, S.spin)), f = n.map((q) => M.dot(q, V));
    const start = f.findIndex((x) => x <= 0);
    if (start < 0) { land += line(n.map(pt)); continue; }
    const pieces = [];
    let piece = null;
    for (let k = 0; k < n.length; k++) {
      const i = (start + k) % n.length, j = (i + 1) % n.length;
      if (f[i] <= 0 && f[j] > 0) piece = [cut(n[i], f[i], n[j], f[j]), pt(n[j])];
      else if (f[i] > 0 && f[j] > 0) piece.push(pt(n[j]));
      else if (f[i] > 0) { piece.push(cut(n[i], f[i], n[j], f[j])); pieces.push(piece); piece = null; }
    }
    while (pieces.length) {
      let outline = pieces.shift();
      for (;;) {
        const from = angleOf(outline[outline.length - 1]);
        const gap = (q) => turn(from, angleOf(q[0]));
        const next = pieces.reduce((best, q, i) => (best < 0 || gap(q) < gap(pieces[best]) ? i : best), -1);
        if (next < 0 || gap(outline) <= gap(pieces[next])) { outline = outline.concat(arc(from, angleOf(outline[0]))); break; }
        outline = outline.concat(arc(from, angleOf(pieces[next][0])), pieces.splice(next, 1)[0]);
      }
      land += line(outline);
    }
  }
  out.land = land;
  // Night: the half of the globe facing away from the lamp, bounded by the terminator's near half and the rim.
  const Ls = M.toSun(S.day);
  const u = unit(M.cross(Ls, V));
  let vt = unit(M.cross(Ls, u)); if (M.dot(vt, V) < 0) vt = vt.map((x) => -x);
  let w = unit(M.cross(V, u)); if (M.dot(w, Ls) > 0) w = w.map((x) => -x);
  const pts = [];
  for (let i = 0; i <= 40; i++) { const t = (i / 40) * Math.PI; pts.push(at([0, 1, 2].map((j) => G0[j] + R * (Math.cos(t) * u[j] + Math.sin(t) * vt[j])))); }
  for (let i = 40; i >= 0; i--) { const t = (i / 40) * Math.PI; pts.push(at([0, 1, 2].map((j) => G0[j] + R * (Math.cos(t) * u[j] + Math.sin(t) * w[j])))); }
  out.night = S.lamp > 0.01 ? K.pathOf(pts, true) : "";
  out.lamp = S.lamp.toFixed(3);
  const lon = M.surface(C.LONDON[0], C.LONDON[1], S.spin);
  out.london = M.dot(lon, V) > 0.05 ? at([G0[0] + R * lon[0], G0[1] + R * lon[1], G0[2] + R * lon[2]]) : null;
  return out;
}

// Crew poses from the state and the moving parts.
export function poses(C, M, S, D) {
  const a = M.angle(S.day);
  const r = C.HANDLE.r + C.PIP_OUT, pa = a - C.PIP_BACK / r;
  const across = [Math.cos(a) * 0.5, Math.sin(a) * 0.5];
  const pip = {
    at: [r * Math.cos(pa), r * Math.sin(pa), C.PLINTH.z1 + 0.6],
    heading: (pa / Math.PI) * 180 + 90,
    lean: C.PIP_LEAN,
    look: [0, 4],
    paws: { l: [D.grip[0] - across[0], D.grip[1] - across[1], D.grip[2] + 0.3], r: [D.grip[0] + across[0], D.grip[1] + across[1], D.grip[2] - 0.3] },
    stride: { phase: (S.day / 365.2422) * ((2 * Math.PI * C.HANDLE.r) / 9), amount: S.walk ? 0.12 : 0 },
    eyes: S.walk ? "open" : "happy",
  };
  const G = D.G, n = [-C.T[1], C.T[0]];
  const sh = [G[0] + C.T[0] * C.SHELF.at[0] + n[0] * C.SHELF.at[1], G[1] + C.T[1] * C.SHELF.at[0] + n[1] * C.SHELF.at[1], C.SHELF.z + 1];
  const tip = D.crankTip;
  const mo = {
    at: sh,
    heading: (Math.atan2(D.hub[1] - sh[1], D.hub[0] - sh[0]) / Math.PI) * 180,
    lean: 4,
    look: [0, 16],
    paws: { l: tip, r: [tip[0], tip[1], tip[2] - 0.9] },
    eyes: S.lamp > 0.5 ? "open" : "shut",
  };
  const volta = {
    path: C.VOLTA,
    charge: S.lamp > 0.05 ? 0.35 + 0.45 * S.lamp : 0,
    flicker: S.lamp > 0.05 ? Math.floor(S.t * 12) : 0,
    target: S.lamp > 0.05 ? C.SOCKET : undefined,
    eyes: S.lamp > 0.05 ? "happy" : "shut",
  };
  return { pip, mo, volta };
}

export const REST = { day: DAY0, target: DAY0, lock: false, spin: 1.2, lamp: 0, lampT: 0, walk: false, turning: false, t: 0, duty: "", stepT: 0 };
export const dyn0 = dynamic(K, P, C, M, REST);
export const pose0 = poses(C, M, REST, dyn0);
