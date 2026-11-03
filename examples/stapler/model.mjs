// The stapler's numbers and its kinematics. Every function here is also inlined into the page, so each one
// reads only its arguments and the other functions in this file.

// World units are millimetres: x along the stapler (nose at +x), y across it, z up from the desk.
export const C = {
  H: [-86, 21], // hinge pin (x, z), along y
  XS: 82, // drive line: the staple's crown is centred on x = 82
  ARM: 168, // hinge to drive line
  GAP: 11.6, // the magazine's nose rides 11.6 mm off the notes at rest
  B0: 6.6, // the blade's stroke relative to the magazine
  CROWN: 12.7, // 26/6 staple: 12.7 mm crown, 6 mm legs, 0.5 mm wire
  LEG: 6,
  WIRE: 0.5,
  ZB: 11, // base top
  ZA: 11.8, // anvil top
  ZG: 11.2, // groove floor
  ZP: 13.0, // paper top: twelve 80 gsm sheets, 1.2 mm
  ZM: 13, // magazine floor underside, closed
  ZS: 19.8, // crown top of a staple in the magazine
  ZT: 27, // magazine wall top
  N0: 120, // staples in the strip at the start
  PAPER: { x0: 13, x1: 87, y0: -36, y1: 16 }, // a pad of A8 notes, 74 x 52 mm
  OUT: 30, // the notes slide 30 mm out
  CUTX: 82, // the near-front quarter (x > 82, y > 0) is cut away
  CUTX1: 96.5,
  RX: -20, // Roo, the head's return spring, stands across the magazine here (x), on its top at z 27.8
  RY: -2,
  RH: 100,
  RPZ: 4.5, // the cap's post for Roo's paws ends this far above his seat
  RD: 2.5, // and stands this far in front of him, along his heading
  WX0: -34, // the cap's top is cut away over Roo from x WX0 to WX1, back to y = WY
  WX1: -6,
  WY: -5,
};

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// The press p is how far the drive line has come down, 0 at rest and GAP + B0 fully home.
// The magazine comes down first (its spring is the softer); then the head drives on alone.
export function kin(C, S) {
  const gap = Math.max(0, C.GAP - S.p);
  const thm = Math.asin(gap / C.ARM);
  const b = Math.max(0, Math.min(C.B0, C.B0 - Math.max(0, S.p - C.GAP)));
  const thc = thm + Math.asin(b / C.ARM);
  const d = Math.max(0, C.ZS - (C.ZP + C.WIRE) - b);
  return { thm, thc, b, d };
}

// A point given in the closed pose, turned about the hinge pin by th.
export function turn(C, th, [x, y, z]) {
  const c = Math.cos(th), s = Math.sin(th), dx = x - C.H[0], dz = z - C.H[1];
  return [C.H[0] + dx * c - dz * s, y, C.H[1] + dx * s + dz * c];
}

// A prism whose (x, z) outline, in the closed pose, runs across y from y0 to y1, turned by th.
export function prismY(K, P, C, th, poly, y0, y1) {
  const c = Math.cos(th), s = Math.sin(th);
  const F = K.frameOf([C.H[0], 0, C.H[1]], [0, 1, 0], [c, 0, s], [-s, 0, c]);
  return K.prismOf(F, poly.map(([x, z]) => [x - C.H[0], z - C.H[1]]), y0, y1, P);
}

// A prism whose (x, y) outline rises along the turned z from z0 to z1.
export function prismZ(K, P, C, th, poly, z0, z1) {
  const c = Math.cos(th), s = Math.sin(th);
  const F = K.frameOf([C.H[0], 0, C.H[1]], [-s, 0, c], [c, 0, s], [0, 1, 0]);
  return K.prismOf(F, poly.map(([x, y]) => [x - C.H[0], y]), z0 - C.H[1], z1 - C.H[1], P);
}

// A floor outline with the quadrant x > xc, y > yc taken out, for the cutaway at the nose.
export function notchRing(ring, xc, yc) {
  const inQ = ([x, y]) => x > xc && y > yc;
  const out = [];
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i], b = ring[(i + 1) % ring.length];
    if (!inQ(a)) out.push(a);
    if (inQ(a) !== inQ(b)) {
      const hits = [];
      if ((a[0] - xc) * (b[0] - xc) < 0) { const t = (xc - a[0]) / (b[0] - a[0]); const y = a[1] + t * (b[1] - a[1]); if (y >= yc) hits.push([t, [xc, y]]); }
      if ((a[1] - yc) * (b[1] - yc) < 0) { const t = (yc - a[1]) / (b[1] - a[1]); const x = a[0] + t * (b[0] - a[0]); if (x >= xc) hits.push([t, [x, yc]]); }
      hits.sort((m, n) => m[0] - n[0]);
      const hit = hits[0][1];
      if (inQ(b)) out.push(hit, [xc, yc]);
      else out.push(hit);
    }
  }
  return out;
}

// The cap's outline in the closed pose: a long flat back, a rounded nose and a straight lower edge.
export function capTop() {
  return [[-97, 32.6], [-95.8, 37.6], [-92.8, 40.8], [-88, 41.6], [46, 40.1], [56, 39.7], [64, 39.0], [71, 37.8], [77, 36.0], [82, 33.8], [85, 31.4], [86.9, 28.4], [87.6, 25.0]];
}
export function capOutline() {
  return [...capTop(), [87.6, 16.2], [-90, 15.6], [-94.6, 17.4], [-96.8, 24]];
}
// The cap's top height at x, closed pose.
export function capZ(x) {
  const t = capTop();
  for (let i = 0; i < t.length - 1; i++) if (x >= t[i][0] && x <= t[i + 1][0]) { const u = (x - t[i][0]) / (t[i + 1][0] - t[i][0]); return t[i][1] + u * (t[i + 1][1] - t[i][1]); }
  return t[t.length - 1][1];
}

// Where the cap's post for Roo's paws stands (x, y): in front of him along his heading.
export function rooPost(C) {
  const a = (C.RH * Math.PI) / 180;
  return [C.RX + C.RD * Math.cos(a), C.RY + C.RD * Math.sin(a)];
}
