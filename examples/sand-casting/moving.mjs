// The parts that move with the model, and the crew's poses. Inlined into the page: they read only their arguments.

// The steel in the cut plane, as polygons by level, clipped to the cavities by the page (#sc-cav). The riser's
// liquid core drains into the casting as it shrinks and leaves a funnel-shaped pipe in its top.
export function steelPath(K, P, C, F) {
  if (F.has <= 0 && F.basin <= C.BASIN.z0 + 0.01 && F.sprue <= 0) return "";
  const at = (x, z) => K.iso([x, 0, z], P);
  const poly = (pts) => K.pathOf(pts.map(([x, z]) => at(x, z)), true);
  const rect = (x0, x1, z0, z1) => (z1 - z0 > 0.02 && x1 - x0 > 0.02 ? poly([[x0, z0], [x1, z0], [x1, z1], [x0, z1]]) : "");
  const xs = C.SPRUE.x, cs = C.CAST, R = C.RISER, d = [];
  d.push(rect(xs - C.BASIN.r - 1, xs + C.BASIN.r + 1, C.BASIN.z0 - 0.5, F.basin));
  const w = C.SPRUE.rt * F.sprue;
  if (F.sprue > 0) d.push(rect(xs - w, xs + w, C.SPRUE.z0 - 0.5, C.SPRUE.z1 + 0.5));
  if (F.has > 0) {
    d.push(rect(C.WELL.x0 - 1, F.front, C.WELL.z0 - 1, Math.min(F.runZ, C.RUN.z1) + (F.runZ >= C.RUN.z1 ? 0.5 : 0)));
    d.push(rect(C.GATE.x0 - 0.5, C.GATE.x1 + 0.5, C.RUN.z1 - 0.5, F.gate));
    if (F.cast > cs.z0) d.push(rect(C.CX - cs.rf - 1, C.CX + cs.rf + 1, cs.z0 - 0.5, F.cast));
    if (F.riser > cs.z1) {
      const x0 = R.x - R.r - 1, x1 = R.x + R.r + 1, top = F.riser, pts = [[x0, cs.z1 - 0.5], [x1, cs.z1 - 0.5], [x1, top]];
      if (F.pipe > 0.05) for (let i = 0; i <= 16; i++) { const u = 1 - (2 * i) / 16; pts.push([R.x + u * F.rl, top - F.pipe * (1 - u * u)]); }
      pts.push([x0, top]);
      d.push(poly(pts));
    }
  }
  return d.join("");
}

// The crew. Pinch is the flask clamp: one claw on the cope's lug, one under the drag's, standing on the drag's
// handle; he squashes with the share of the steel's lift that the cope's own weight can't hold. Ollie is the
// riser's feed: he waits on the sleeve's rim while it fills, then stands in the riser's liquid core and presses
// it down into the shrinking casting, sinking with the bottom of the pipe.
export function poses(C, S, F, GEO) {
  const R = C.RISER, xe = C.FL.x1 + C.FL.t, CL = C.CLAMP;
  const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const k = Math.min(1, S.hold / 140);
  const pinch = {
    at: CL.at,
    heading: CL.heading,
    squash: 0.06 + 0.3 * k,
    lean: -6 * k,
    look: [0, 6],
    paws: { l: [xe + CL.reach, CL.y, C.Z.part + CL.lug + 0.1], r: [xe + CL.reach, CL.y, C.Z.part - CL.lug - 0.1] },
    eyes: S.liftV > 20 && S.hold > 0 ? "wide" : S.tc >= 0 && S.fsC >= 1 ? "happy" : k > 0.5 ? "shut" : "open",
  };
  // Into the riser once it is full, in a hop over the sleeve's rim.
  const b = S.tc < 0 || S.short ? 0 : smooth(0, 3, S.tc);
  const top = Math.max(R.z1 - 0.2, F.riser);
  const wait = [R.x + 3.5, -10.2, C.Z.cup], dive = [R.x - 0.5 * F.rl, 0.8, top - 0.75 * F.pipe];
  const at = wait.map((v, i) => v + (dive[i] - v) * b);
  at[2] += 7 * Math.sin(Math.PI * b);
  // He treads the liquid heart down: his feet step once for every 1.5 units the pipe deepens.
  const feeding = b >= 1 && S.fsC < 1 && F.pipe > 0.05;
  const ollie = {
    at,
    heading: b < 0.5 ? 200 : 40,
    lean: feeding ? 18 : b > 0 ? 8 : 0,
    squash: feeding ? 0.18 : 0,
    look: [0, b < 0.5 ? -20 : -30],
    stride: { phase: F.pipe / 1.5, amount: feeding ? 0.09 : 0 },
    eyes: S.fsC >= 1 && S.tc >= 0 ? "happy" : feeding ? "shut" : S.tc < 0 && F.riser > C.CAST.z1 + 2 ? "wide" : "open",
  };
  return { ollie, pinch };
}
