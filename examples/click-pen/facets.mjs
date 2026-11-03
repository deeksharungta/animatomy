// Solids built from faces round the pen's axis: cylinder panels between two height curves, radial side
// faces and flat rings. Serialized into the page, so it uses only its arguments: K (the kit and lathe), P,
// and the pen's frame F (angle 0 faces the viewer).
export function facetKit(K, P, F) {
  const RAD = Math.PI / 180, cam = K.cameraOf(P), BANDS = [0, 0.2, 0.42, 0.62];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], mul = (a, k) => a.map((v) => v * k);
  const unit = (a) => mul(a, 1 / (Math.hypot(a[0], a[1], a[2]) || 1));
  const view = [cam.cosA * cam.cosE, cam.sinA * cam.cosE, cam.sinE], light = unit([-cam.sinA, cam.cosA, 1.2]);
  const toneOf = (n) => { let t = 0; const s = dot(unit(n), light); while (t < 4 && s >= BANDS[t]) t++; return t; };
  const rad = (a) => { const c = Math.cos(a * RAD), n = Math.sin(a * RAD); return [0, 1, 2].map((i) => c * F.u[i] + n * F.v[i]); };
  const tan = (a) => { const c = Math.cos(a * RAD), n = Math.sin(a * RAD); return [0, 1, 2].map((i) => -n * F.u[i] + c * F.v[i]); };
  const pt = (r, a, z) => { const d = rad(a); return [F.o[0] + d[0] * r, F.o[1] + d[1] * r, F.o[2] + z]; };
  const nrm = (a, sign) => mul(rad(a), sign);
  const key = (p) => p.map((v) => Math.round(v * 1e4)).join(",");
  const orient = (s) => {
    let A = 0;
    for (let i = 0; i < s.length; i++) { const p = s[i], q = s[(i + 1) % s.length]; A += p[0] * q[1] - q[0] * p[1]; }
    return A < 0 ? s.slice().reverse() : s;
  };
  // Faces to SolidPaths: tone buckets by facing, the outline where a face meets no other, creases at folds.
  function solid(faces, { crease = 26 } = {}) {
    const fill = [], shades = [[], [], [], [], []], edges = new Map();
    for (const f of faces) {
      if (dot(unit(f.n), view) <= 1e-4) continue;
      const s = orient(f.pts.map((p) => K.iso(p, P))), d = K.pathOf(s, true);
      fill.push(d);
      shades[toneOf(f.n)].push(d);
      for (let i = 0; i < f.pts.length; i++) {
        const a = f.pts[i], b = f.pts[(i + 1) % f.pts.length], ka = key(a), kb = key(b);
        if (ka === kb) continue;
        const id = ka < kb ? ka + "|" + kb : kb + "|" + ka, e = edges.get(id);
        if (e) e.n2 = f.n; else edges.set(id, { a, b, n1: f.n, n2: null });
      }
    }
    const out = [], fold = [], cos = Math.cos(crease * RAD);
    for (const e of edges.values()) {
      const d = K.pathOf([K.iso(e.a, P), K.iso(e.b, P)]);
      if (!e.n2) out.push(d);
      else if (dot(unit(e.n1), unit(e.n2)) < cos) fold.push(d);
    }
    return { fill: fill.join(""), outline: out.join(""), crease: fold.join(""), top: shades[4].join(""), shades: shades.slice(0, 4).map((x) => x.join("")), seamless: true };
  }
  // A cylinder panel at radius r from angle a0 to a1, between heights zb(a) and zt(a); sign +1 faces out.
  function panel(r, angles, zb, zt, sign = 1) {
    const faces = [];
    for (let i = 0; i + 1 < angles.length; i++) {
      const a = angles[i], b = angles[i + 1];
      if (b - a < 1e-6) continue;
      const [ba, bb, ta, tb] = [zb(a, 1), zb(b, -1), zt(a, 1), zt(b, -1)];
      if (ta - ba < 1e-6 && tb - bb < 1e-6) continue;
      faces.push({ pts: [pt(r, a, ba), pt(r, b, bb), pt(r, b, tb), pt(r, a, ta)], n: nrm((a + b) / 2, sign) });
    }
    return faces;
  }
  // A radial face at angle a, from radius r0 to r1 and height zb to zt at each radius; sign +1 faces +angle.
  function side(a, r0, r1, zb0, zt0, zb1 = zb0, zt1 = zt0, sign = 1) {
    if (zt0 - zb0 < 1e-6 && zt1 - zb1 < 1e-6) return [];
    return [{ pts: [pt(r0, a, zb0), pt(r1, a, zb1), pt(r1, a, zt1), pt(r0, a, zt0)], n: mul(tan(a), sign) }];
  }
  // A flat annular sector at height z, facing up (sign +1) or down.
  function flat(z, r0, r1, angles, sign = 1) {
    const faces = [];
    for (let i = 0; i + 1 < angles.length; i++) {
      const a = angles[i], b = angles[i + 1];
      faces.push({ pts: [pt(r0, a, z), pt(r1, a, z), pt(r1, b, z), pt(r0, b, z)], n: [0, 0, sign] });
    }
    return faces;
  }
  // Angles from a0 to a1 about every step degrees, always through the given break angles.
  function sweep(a0, a1, step = 3, breaks = []) {
    const list = [a0, a1, ...breaks.filter((b) => b > a0 && b < a1)];
    const n = Math.max(1, Math.ceil((a1 - a0) / step));
    for (let i = 1; i < n; i++) list.push(a0 + ((a1 - a0) * i) / n);
    return [...new Set(list.map((v) => Math.round(v * 1e6) / 1e6))].sort((x, y) => x - y);
  }
  const facing = (a, sign = 1) => sign * dot(rad(a), view) > 0;
  return { pt, rad, tan, solid, panel, side, flat, sweep, facing };
}
