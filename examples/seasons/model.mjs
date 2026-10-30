import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { LAND } from "./land.mjs";

export const WIDTH = 620;
export const HEIGHT = 540;

// A tellurion on a desk. World units are about 2 mm. The lamp is the Sun; the year arm carries the globe
// round it on a train of five equal gears, which turns the globe's mount back as fast as the arm turns it
// forward, so the tilted axis keeps pointing the same way all year.
export const C = {
  DESK: { x: -150, y: -150, w: 300, d: 300, r: 6 },
  PLINTH: { r: 62, z0: 6, z1: 14 },
  RING: [50, 60.5],
  PILLAR_R: 3,
  LAMP: [0, 0, 64],
  LAMP_R: 7.5,
  ARM: { z0: 20, z1: 22, w: 7, from: 7.5, to: 58 },
  GEAR: { pitch: 6, root: 5.3, tip: 6.7, teeth: 20, z0: 22, z1: 24 },
  ORBIT: 48,
  GLOBE_R: 14,
  GLOBE_Z: 64,
  TILT: 23.44,
  // The axis leans 30° out of the picture plane, so the equinoxes fall at the front-left and back-right rather
  // than straight in front of and behind the lamp.
  T: [Math.cos(-Math.PI / 12), Math.sin(-Math.PI / 12), 0],
  JUNE_DAY: 172,
  JUNE_ANGLE: (11 * Math.PI) / 12,
  HANDLE: { r: 54, out: 2.6, z: 21 },
  // Mo stands on a shelf off the globe's post, beside the crank: [along T, across T] from the post.
  SHELF: { z: 34, r: 4, at: [-11.5, 2.5] },
  PIP_BACK: 8,
  PIP_OUT: 0.6,
  PIP_LEAN: 2,
  CRANK: 3,
  BELOW: 6,
  ABOVE: 3.5,
  LONDON: [51.5, -0.1],
  SPIN: 1.1,
  // While Mo has the beat the globe turns once every three seconds and the date moves one day per turn.
  TURN: (2 * Math.PI) / 3,
  SOCKET: [3.4, 0, 15.7],
  VOLTA: [[5.6, 0.8, 15.6], [12, 2.6, 15.6], [20, -1, 15.6], [28, 1.6, 15.6], [36, -0.6, 15.6], [44, 0.6, 15.6]],
  LANDS: LAND,
};

// ---------------------------------------------------------------- the model (shared by build and page)

export function model(C) {
  const D = Math.PI / 180, YEAR = 365.2422, eps = C.TILT * D;
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  // The axis leans toward T. e1 and e2 span the globe's equator with e1 × e2 = A, so a growing spin turns
  // the globe west to east, as the Earth turns.
  const A = [Math.sin(eps) * C.T[0], Math.sin(eps) * C.T[1], Math.cos(eps)];
  const e2 = [Math.cos(eps) * C.T[0], Math.cos(eps) * C.T[1], -Math.sin(eps)];
  const e1 = cross(e2, A);
  // The arm keeps the real calendar: the Earth moves a little faster near the Sun in January (Kepler), so the
  // equinoxes fall on 20 March and 23 September rather than a quarter year either side of June.
  const kepler = (day) => (2 * Math.PI * day) / YEAR + 2 * 0.0167 * Math.sin((2 * Math.PI * (day - 3)) / YEAR);
  const angle = (day) => C.JUNE_ANGLE + kepler(day) - kepler(C.JUNE_DAY);
  const centre = (day) => { const a = angle(day); return [C.ORBIT * Math.cos(a), C.ORBIT * Math.sin(a), C.GLOBE_Z]; };
  const toSun = (day) => { const g = centre(day); const d = [C.LAMP[0] - g[0], C.LAMP[1] - g[1], C.LAMP[2] - g[2]]; const l = Math.hypot(...d); return [d[0] / l, d[1] / l, d[2] / l]; };
  // The Sun's declination comes out of the machine: the angle between the lamp's direction and the equator.
  const decl = (day) => Math.asin(dot(A, toSun(day))) / D;
  const surface = (lat, lon, spin) => { const a = lon * D + spin, c = Math.cos(lat * D), s = Math.sin(lat * D); return [0, 1, 2].map((i) => c * Math.cos(a) * e1[i] + c * Math.sin(a) * e2[i] + s * A[i]); };
  // Sunrise to sunset, with the Sun's upper rim on a refracted horizon (-0.833°).
  const dayLength = (lat, dec) => {
    const c = (Math.sin(-0.833 * D) - Math.sin(lat * D) * Math.sin(dec * D)) / (Math.cos(lat * D) * Math.cos(dec * D));
    return c <= -1 ? 24 : c >= 1 ? 0 : (2 * Math.acos(c)) / D / 15;
  };
  const noonSun = (lat, dec) => 90 - Math.abs(lat - dec);
  const distance = (day) => 149.6 * (1 - 0.0167 * Math.cos((2 * Math.PI * (day - 3)) / YEAR));
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const LENGTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const date = (day) => {
    let d = ((Math.floor(day) - 1) % 365 + 365) % 365, m = 0;
    while (d >= LENGTHS[m]) { d -= LENGTHS[m]; m++; }
    return `${d + 1} ${MONTHS[m]}`;
  };
  // A gear's outline: four points a tooth, `turn` radians round.
  const teeth = (turn) => {
    const g = C.GEAR, pts = [];
    for (let i = 0; i < g.teeth; i++) {
      const b = turn + (i / g.teeth) * Math.PI * 2, w = Math.PI / g.teeth;
      for (const [da, r] of [[-w * 0.5, g.root], [-w * 0.28, g.tip], [w * 0.28, g.tip], [w * 0.5, g.root]]) pts.push([r * Math.cos(b + da), r * Math.sin(b + da)]);
    }
    return pts;
  };
  return { A, e1, e2, angle, centre, toSun, decl, surface, dayLength, noonSun, distance, date, LENGTHS, teeth, dot, cross };
}

export const M = model(C);
export const DAY0 = 79;
export const G0 = M.centre(C.JUNE_DAY);

// The camera frames the machine; the desk runs on past the edges of the figure.
const ring = (r, z, n = 24) => Array.from({ length: n }, (_, i) => [r * Math.cos((i / n) * 2 * Math.PI), r * Math.sin((i / n) * 2 * Math.PI), z]);
export const P = k.fitProjection([...ring(C.PLINTH.r + 6, 0), ...ring(C.ORBIT, C.GLOBE_Z + C.GLOBE_R + 8), [0, 0, C.LAMP[2] + 12]], WIDTH, HEIGHT, { pad: 10, azimuth: 45, elevation: 32 });
export const K = { ...k, ...L };
export const at = (p) => k.iso(p, P);
export const S = (paths, style) => k.solidSvg(paths, style);
export const Ln = (d, style) => k.lineSvg(d, style);
export const Dt = (points, style) => k.dotsSvg(points, style);
export const UP = [0, 0, 1];
