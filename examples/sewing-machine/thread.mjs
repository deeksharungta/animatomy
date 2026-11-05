// The thread, each frame: the top thread from the spool through the guide, the tension discs, the take-up lever's
// eye and the guide under the head to the needle's eye and down to the cloth; under the plate, the loop Pinch carries
// round the bobbin case (only where it passes in front of the case), and the bobbin thread up to the cloth.
// Serialized into the page as it stands; R is the route (fixed points), D the moving parts, Q the crew's poses.
export function threads(K, P, C, S, R, D, Q) {
  const at = (p) => K.iso(p, P), TAU = Math.PI * 2, out = {};
  const m = ((S.th % TAU) + TAU) % TAU, BT = C.BT, CT = BT + 0.6 + C.CLOTH.t, under = BT - C.SKIN;
  const [nx, ny] = C.N, eye = D.needleEye, last = S.holes.length ? S.holes[S.holes.length - 1] - S.off : ny;
  // Above the plate: spool to needle, then from the eye down to the last hole while the needle is out of the cloth.
  const top = [R.spool, R.guide, R.disc0, R.disc1, R.check, D.eye, R.under, [nx, ny + 1.6, D.needleEye[2] + C.NEEDLE.len - 4], [nx, ny + 0.9, eye[2] + 1.2]];
  if (eye[2] > CT + 0.3) top.push([nx, Math.min(C.CUT.y - 0.5, last), CT + 0.2]);
  out.top = `<path class="sm-thread" d="${K.pathOf(top.map(at))}"/>`;
  // Under the plate: the loop. psi runs from the catch; the hook carries it 288° and it slides off and is drawn up.
  const psi = (m - C.CATCH + TAU) % TAU, carry = C.RELEASE - C.CATCH, shed = 0.7;
  const [bx, by] = C.B, rl = C.HOOK.caseR + 1.4, view = [Math.cos((P.azimuth ?? 45) * Math.PI / 180), Math.sin((P.azimuth ?? 45) * Math.PI / 180)];
  const seen = (a) => Math.cos(a) * view[0] + Math.sin(a) * view[1] > -0.05;
  const ring = (a0, a1, z, r = rl) => { const pts = [], n = Math.max(2, Math.ceil(Math.abs(a1 - a0) / 0.08)); for (let i = 0; i <= n; i++) { const a = a0 + ((a1 - a0) * i) / n; pts.push([a, [bx + r * Math.cos(a), by + r * Math.sin(a), z]]); } return pts; };
  // Split a run of [angle, point] into the stretches seen in front of the case.
  const front = (run) => { const parts = []; let cur = []; for (const [a, p] of run) { if (seen(a)) cur.push(at(p)); else { if (cur.length > 1) parts.push(K.pathOf(cur)); cur = []; } } if (cur.length > 1) parts.push(K.pathOf(cur)); return parts.join(""); };
  const H = [nx, ny, under], low = [];
  if (psi < carry + shed && S.holes.length) {
    const s = psi < carry ? 0 : K.ease((psi - carry) / shed);
    const pn = C.PHI_N, phi = psi < carry ? Q.phi : pn + 2 * carry * (1 - s);
    const claw = psi < carry ? Q.hook : [bx + C.HOOK.r * Math.cos(phi), by + C.HOOK.r * Math.sin(phi), C.HOOK.z];
    const zu = C.HOOK.top - 1 + s * 1, zl = C.HOOK.race + 4 + s * 5, start = [bx + rl * Math.cos(pn), by + rl * Math.sin(pn), zu];
    low.push(K.pathOf([at(H), at(start)]));
    low.push(front(ring(pn, phi, zu)));
    low.push(front(ring(phi, pn, zl)));
    if (seen(phi)) low.push(K.pathOf([at(claw), at([bx + rl * Math.cos(phi), by + rl * Math.sin(phi), zu])]) + K.pathOf([at(claw), at([bx + rl * Math.cos(phi), by + rl * Math.sin(phi), zl])]));
    low.push(K.pathOf([at([bx + rl * Math.cos(pn), by + rl * Math.sin(pn), zl]), at(H)]));
  } else if (psi > TAU - 0.4 && eye[2] < under) {
    // Just before the catch the thread flares out of the rising needle's eye toward the hook.
    const f = (psi - (TAU - 0.4)) / 0.4;
    low.push(K.pathOf([[nx, ny, eye[2] + 3], [nx - 1 - 1.6 * f, ny - 0.4, eye[2] + 1.6], [nx, ny, eye[2] + 0.2]].map(at)));
  }
  // The bobbin thread: out of the case's tension spring and up into the cloth at the newest hole.
  const bs = [bx + (C.HOOK.caseR + 0.7) * Math.cos(-0.75), by + (C.HOOK.caseR + 0.7) * Math.sin(-0.75), C.HOOK.race + 9];
  low.push(K.pathOf([at(bs), at([nx, Math.max(-38, Math.min(ny, last)), under])]));
  out.low = `<path class="sm-thread" d="${low.join("")}"/>`;
  return out;
}
