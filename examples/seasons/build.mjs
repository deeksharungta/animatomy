import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { critter, critterSvg, crewCss } from "../../kit/critters.mjs";
import { kitScript, glScript, crewScript, stepsScript } from "../../scripts/inline-kit.mjs";
import { glCamera } from "../../kit/gl.mjs";
import { STEPS_CSS, stepsHtml, fitView } from "../../kit/steps.mjs";
import { LAND } from "./land.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";

const WIDTH = 620;
const HEIGHT = 540;

// A tellurion on a desk. World units are about 2 mm. The lamp is the Sun; the year arm carries the globe
// round it on a train of five equal gears, which turns the globe's mount back as fast as the arm turns it
// forward, so the tilted axis keeps pointing the same way all year.
const C = {
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
};

// ---------------------------------------------------------------- the model (shared by build and page)

function model(C) {
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

const M = model(C);
const DAY0 = 79;
const G0 = M.centre(C.JUNE_DAY);

// The camera frames the machine; the desk runs on past the edges of the figure.
const ring = (r, z, n = 24) => Array.from({ length: n }, (_, i) => [r * Math.cos((i / n) * 2 * Math.PI), r * Math.sin((i / n) * 2 * Math.PI), z]);
const P = k.fitProjection([...ring(C.PLINTH.r + 6, 0), ...ring(C.ORBIT, C.GLOBE_Z + C.GLOBE_R + 8), [0, 0, C.LAMP[2] + 12]], WIDTH, HEIGHT, { pad: 10, azimuth: 45, elevation: 32 });
const K = { ...k, ...L };
const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const Ln = (d, style) => k.lineSvg(d, style);
const Dt = (points, style) => k.dotsSvg(points, style);
const UP = [0, 0, 1];

// ---------------------------------------------------------------- what moves (shared by build and page)

function dynamic(K, P, C, M, S) {
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
function poses(C, M, S, D) {
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

C.LANDS = LAND;
const REST = { day: DAY0, target: DAY0, lock: false, spin: 1.2, lamp: 0, lampT: 0, walk: false, turning: false, t: 0, duty: "", stepT: 0 };
const dyn0 = dynamic(K, P, C, M, REST);
const pose0 = poses(C, M, REST, dyn0);

// ---------------------------------------------------------------- the scene and the static machine

function desk() {
  const { x, y, w, d, r } = C.DESK;
  const out = [];
  out.push(S(k.slabOf({ x, y, w, d, r }, -10, 10, P, 6, 0.6), { tone: "lo" }));
  for (let i = 1; i < 9; i++) out.push(Ln(k.lineOnTop([x + 0.15, y + (d * i) / 9], [x + w - 0.15, y + (d * i) / 9], 0, P), { tone: "faint" }));
  return out.join("");
}

function plinth() {
  const out = [];
  const pz = C.PLINTH;
  out.push(`<path class="iso-halo" d="${k.haloOf({ x: -pz.r, y: -pz.r, w: pz.r * 2, d: pz.r * 2, r: pz.r }, 0, 0.1, P)}" style="filter:blur(5px)"/>`);
  for (let i = 0; i < 4; i++) {
    const t = Math.PI / 4 + (i * Math.PI) / 2;
    out.push(S(L.solidOf([[0, 4.2], [3, 4.6, 1], [6, 3.6]], L.frameAlong([50 * Math.cos(t), 50 * Math.sin(t), 0], UP), P), { tone: "mid" }));
  }
  out.push(S(L.solidOf([[pz.z0, pz.r - 1], [pz.z0 + 1, pz.r, 1], [pz.z1 - 1, pz.r, 1], [pz.z1, pz.r - 1.2, 1]], L.frameAlong([0, 0, 0], UP), P), { tone: "mid" }));
  // The month ring: a raised band with a tick for every five days, a long one for each month and dots at the
  // solstices and equinoxes. The arm's pointer reads the date off it.
  out.push(S(L.ringBand(pz.z1, pz.z1 + 0.6, C.RING[0], C.RING[1], L.frameAlong([0, 0, 0], UP), P), { tone: "hi" }));
  const rz = pz.z1 + 0.6;
  let day = 1, minor = "", major = "";
  const angleOf = (d) => M.angle(d);
  for (let m = 0; m < 12; m++) {
    const t = angleOf(day);
    major += k.lineOnTop([Math.cos(t) * C.RING[1], Math.sin(t) * C.RING[1]], [Math.cos(t) * (C.RING[1] - 5.5), Math.sin(t) * (C.RING[1] - 5.5)], rz, P);
    for (let d = 5; d < M.LENGTHS[m]; d += 5) { const s = angleOf(day + d); minor += k.lineOnTop([Math.cos(s) * C.RING[1], Math.sin(s) * C.RING[1]], [Math.cos(s) * (C.RING[1] - 2.6), Math.sin(s) * (C.RING[1] - 2.6)], rz, P); }
    day += M.LENGTHS[m];
  }
  out.push(Ln(minor, { tone: "faint", free: "end" }), Ln(major, { tone: "lo", free: "end" }));
  out.push(Dt([79, 172, 265, 355].map((d) => { const t = angleOf(d); return at([Math.cos(t) * (C.RING[0] + 4.6), Math.sin(t) * (C.RING[0] + 4.6), rz]); }), { size: 0.9, tone: "mid" }));
  return out.join("");
}

function pillarLow() {
  const out = [];
  out.push(S(k.cylinder(0, 0, C.PILLAR_R + 2.4, C.PLINTH.z1, 1.6, P, 32), { tone: "mid" }));
  out.push(S(k.cylinder(0, 0, C.PILLAR_R, C.PLINTH.z1 + 1.6, 4, P, 24), { tone: "hi", crease: "none" }));
  // The socket where the lamp's cable goes into the pillar, at Volta's snout.
  out.push(S(k.slabOf({ x: 2.4, y: -1.6, w: 2.2, d: 3.2, r: 0.4 }, C.PLINTH.z1 + 0.4, 3, P, 2), { tone: "mid" }));
  return out.join("");
}

function collar() {
  return S(k.cylinder(0, 0, C.ARM.from, 18, 4, P, 32), { tone: "mid" }) + S(k.cylinder(0, 0, C.PILLAR_R, 18 - 2.4, 2.4, P, 24), { tone: "hi", crease: "none" });
}

const gearAt = (c, turn = 0) => S(L.prismOf(L.frameOf(c, UP, [1, 0, 0], [0, 1, 0]), M.teeth(turn), C.GEAR.z0, C.GEAR.z1, P), { tone: "hi" }) + Dt([at([c[0], c[1], C.GEAR.z1])], { size: 0.45, tone: "lo" });

function pillarHigh() {
  const out = [];
  out.push(gearAt([0, 0, 0]));
  out.push(S(k.cylinder(0, 0, C.PILLAR_R, C.GEAR.z1, 30, P, 24), { tone: "hi", crease: "none" }));
  out.push(S(L.solidOf([[0, 3.6], [1.6, 4.4, 1], [3.4, 3.2]], L.frameAlong([0, 0, C.GEAR.z1 + 30], UP), P), { tone: "mid" }));
  return out.join("");
}

function lamp() {
  return S(L.sphereOf(C.LAMP, C.LAMP_R, P, { steps: 48 }), { tone: "hi", lit: true });
}

// The globe's mount, drawn at the June position and moved with the arm. It never turns: the gear train
// carries it round without changing its orientation.

function mountLow() {
  const G = G0, out = [];
  out.push(gearAt([G[0], G[1], 0]));
  const bottom = G[2] - C.GLOBE_R - 2.5;
  out.push(S(k.cylinder(G[0], G[1], 1.3, C.GEAR.z1, bottom - C.GEAR.z1, P, 16), { tone: "hi", crease: "none" }));
  // Mo's shelf: a round platform on a bracket off the post, beside the crank.
  const n = [-C.T[1], C.T[0]], [u, v] = C.SHELF.at;
  const sx = G[0] + C.T[0] * u + n[0] * v, sy = G[1] + C.T[1] * u + n[1] * v;
  const l = Math.hypot(u, v), q = [(-v / l) * 0.7, (u / l) * 0.7];
  const F = L.frameOf([G[0], G[1], 0], UP, C.T, [n[0], n[1], 0]);
  out.push(S(L.prismOf(F, [[q[0], q[1]], [u + q[0], v + q[1]], [u - q[0], v - q[1]], [-q[0], -q[1]]], C.SHELF.z - 1.8, C.SHELF.z - 0.6, P), { tone: "mid", crease: "none" }));
  out.push(S(k.cylinder(sx, sy, C.SHELF.r, C.SHELF.z - 0.6, 1.6, P, 28), { tone: "mid" }));
  return out.join("");
}

// The meridian: a half ring in the plane of the tilt, from the north bearing round the far side to the south.
function meridian(front) {
  const G = G0, Rm = C.GLOBE_R + 2.6, w = 1.2;
  const F = L.frameOf(G, M.cross(C.T, UP), C.T, UP);
  const from = C.TILT, to = C.TILT + 180;
  const split = 90;
  const [a0, a1] = front ? [from, split] : [split, to];
  const pts = [];
  for (let i = 0; i <= 24; i++) { const t = ((a0 + ((a1 - a0) * i) / 24) * Math.PI) / 180; pts.push([(Rm + w) * Math.sin(t), (Rm + w) * Math.cos(t)]); }
  for (let i = 24; i >= 0; i--) { const t = ((a0 + ((a1 - a0) * i) / 24) * Math.PI) / 180; pts.push([(Rm - w) * Math.sin(t), (Rm - w) * Math.cos(t)]); }
  return S(L.prismOf(F, pts, -0.5, 0.5, P), { tone: "mid", crease: "faint" });
}

function axisRod(part) {
  const G = G0, R = C.GLOBE_R;
  const A = M.A;
  const p = (s) => [G[0] + A[0] * s, G[1] + A[1] * s, G[2] + A[2] * s];
  if (part === "low") {
    const E = p(-(R + C.BELOW));
    const F = L.frameAlong(E, A);
    return S(L.solidOf([[0, 0.7], [C.BELOW + 0.4, 0.7]], F, P), { tone: "hi", crease: "none" }) + S(L.disc(-0.5, 0.5, C.CRANK, F, P), { tone: "hi" }) + S(L.solidOf([[C.BELOW - 3.3, 1.4], [C.BELOW - 1.6, 1.4]], F, P), { tone: "mid" });
  }
  const N = p(R - 0.4);
  const F = L.frameAlong(N, A);
  return S(L.solidOf([[0, 0.7], [C.ABOVE, 0.7]], F, P), { tone: "hi", crease: "none" }) + S(L.solidOf([[2.6, 1.4], [4.2, 1.4], [4.8, 0.9, 1]], L.frameAlong(p(R), A), P), { tone: "mid" });
}

// The globe itself, the one thing in colour: ocean, land, latitude lines and the night side.
const RK = C.GLOBE_R * k.cameraOf(P).k;
function globeBase() {
  const c = at(G0);
  return `<circle class="sn-ocean" cx="${c[0].toFixed(2)}" cy="${c[1].toFixed(2)}" r="${RK.toFixed(2)}"/>`;
}
function latitudes() {
  const V = L.viewOf(P);
  const lines = [];
  for (const [lat, cls] of [[0, "sn-eq"], [C.TILT, "sn-trop"], [-C.TILT, "sn-trop"], [90 - C.TILT, "sn-arc"], [C.TILT - 90, "sn-arc"]]) {
    let run = [], d = "";
    for (let i = 0; i <= 120; i++) {
      const n = M.surface(lat, (i / 120) * 360, 0);
      if (M.dot(n, V) > 0) run.push(at([G0[0] + C.GLOBE_R * n[0], G0[1] + C.GLOBE_R * n[1], G0[2] + C.GLOBE_R * n[2]]));
      else { if (run.length > 1) d += k.pathOf(run); run = []; }
    }
    if (run.length > 1) d += k.pathOf(run);
    lines.push(`<path class="sn-lat ${cls}" d="${d}"/>`);
  }
  const c = at(G0);
  lines.push(`<circle class="sn-rim" cx="${c[0].toFixed(2)}" cy="${c[1].toFixed(2)}" r="${RK.toFixed(2)}"/>`);
  return lines.join("");
}

// ---------------------------------------------------------------- the crew

const VOLTA = { species: "eel", name: "Volta", size: 34, role: "power" };
const PIP = { species: "squirrel", name: "Pip", size: 14, role: "moving" };
const MO = { species: "sloth", name: "Mo", size: 12, role: "sensing", wear: ["glasses"] };
const crew = (spec, pose, part) => critterSvg(critter(spec, pose, P), { part });

// Reach check: Pip on the handle and Mo on the crank, round the whole year and the whole day.
for (let day = 1; day <= 365; day += 13) {
  for (const spin of [0, 1.6, 3.2, 4.8]) {
    const st = { ...REST, day, spin, lamp: 1, walk: spin > 2 };
    const d = dynamic(K, P, C, M, st);
    const p = poses(C, M, st, d);
    for (const [name, spec, pose] of [["Pip", PIP, p.pip], ["Mo", MO, p.mo]]) {
      const c = critter(spec, pose, P);
      for (const [paw, short] of Object.entries(c.reach)) if (short > 0.3) console.warn(`${name}'s ${paw} paw is ${short.toFixed(1)} short on day ${day}, spin ${spin}`);
    }
  }
}
// The numbers the figure shows, checked against the real sky.
{
  const lon = C.LONDON[0];
  const show = (day) => { const dec = M.decl(day); return `${M.date(day)}: Sun over ${dec.toFixed(1)}°, London day ${M.dayLength(lon, dec).toFixed(2)} h, noon Sun ${M.noonSun(lon, dec).toFixed(1)}°, ${M.distance(day).toFixed(1)} million km`; };
  for (const d of [79, 172, 266, 355, 3]) console.log(show(d));
}

// ---------------------------------------------------------------- figure

// Inside the orbit group the low parts (gears and handle) go before or after the globe's mount, whichever
// is true from the camera: the page moves them between the low-a and low-b slots as the arm swings.
const placeLow = (front) => (front ? { a: `<g data-part="gears">${dyn0.gears}</g>`, b: `<g data-part="handle">${dyn0.handle}</g>` } : { a: `<g data-part="handle">${dyn0.handle}</g>`, b: `<g data-part="gears">${dyn0.gears}</g>` });
const low0 = placeLow(dyn0.armFront);
const orbitParts = `<g data-orbit>
  <g data-part="bar">${dyn0.bar}</g>
  <g data-part="low-a">${low0.a}</g>
  <g data-part="pip-a"></g>
  <g data-part="mount">${mountLow()}</g>
  <g data-part="crank">${axisRod("low")}</g>
  <g data-part="crank-h">${dyn0.crank}</g>
  <g data-part="mo-slot">${crew(MO, pose0.mo, "mo")}</g>
  <g data-part="globe">${meridian(false)}<g clip-path="url(#sn-disk)">${globeBase()}<path class="sn-land" data-part="land" d="${dyn0.land}"/><path class="sn-night" data-part="night" d="${dyn0.night}" style="--sn-lamp:${dyn0.lamp}"/></g>${latitudes()}<circle class="sn-london" data-part="london" r="1.1" cx="${dyn0.london ? dyn0.london[0].toFixed(2) : -999}" cy="${dyn0.london ? dyn0.london[1].toFixed(2) : -999}"/>${axisRod("high")}${meridian(true)}</g>
  <g data-part="low-b">${low0.b}</g>
  <g data-part="pip-b">${crew(PIP, pose0.pip, "pip")}</g>
</g>`;

const c0 = at(G0);
const defs = `<defs><clipPath id="sn-disk"><circle cx="${c0[0].toFixed(2)}" cy="${c0[1].toFixed(2)}" r="${RK.toFixed(2)}"/></clipPath><filter id="sn-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${(RK * 0.07).toFixed(2)}"/></filter></defs>`;
const back = [
  defs,
  desk(),
  plinth(),
  `<g data-part="orbit-back">${dyn0.armFront ? "" : orbitParts}</g>`,
  crew(VOLTA, pose0.volta, "volta"),
  pillarLow(),
  collar(),
  pillarHigh(),
  lamp(),
];
const front = [`<g data-part="orbit-front">${dyn0.armFront ? orbitParts : ""}</g>`];

const LABEL = "A tellurion on a desk, run by three animals: a brass model of the Sun and the Earth. A lamp on a central pillar is the Sun. A long arm carries a globe round it, the globe's axis tilted 23.4° and kept pointing the same way all year by a train of five gears along the arm. Pip the squirrel walks round the base pushing the arm, one lap a year, its pointer moving round a month ring. Mo the sloth stands on a shelf under the globe and turns it once a day by a crank on its south end. Volta the electric eel lies along the lamp's cable on the base and lights the Sun. In June the north pole leans toward the lamp and London's day is long; in December it leans away.";
const backSvg = k.figureSvg({ width: WIDTH, height: HEIGHT, label: LABEL, body: back });
const frontSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="iso-svg sn-layer" viewBox="0 0 ${WIDTH} ${HEIGHT}" aria-hidden="true">${front.join("")}</svg>`;

// The lamp's light, in the drawing's own camera. It is steady, so the page redraws it only when the lamp or the
// camera changes.
const GLOW = `
uniform float uLamp;
uniform vec3 uLampP;
uniform float uLight;
void main() {
  vec2 vb = viewOf(gl_FragCoord.xy);
  vec2 q = (vb - project(uLampP)) / uK;
  float r = length(q);
  float g = uLamp * (exp(-r * r / 40.0) * 1.3 + exp(-r * r / 420.0) * 0.38 + exp(-r / 34.0) * 0.1);
  vec3 c = tonemap(vec3(1.0, 0.84, 0.52) * g, 1.4);
  float a = max(c.r, max(c.g, c.b));
  float al = min(0.82, a * 0.95);
  vec3 ink = mix(vec3(0.98, 0.72, 0.28), vec3(0.93, 0.55, 0.12), clamp(r / 30.0, 0.0, 1.0));
  vec4 col = mix(vec4(c, a), vec4(ink * al, al), uLight);
  float dz = (hash12(gl_FragCoord.xy) - 0.5) / 255.0 * step(0.004, col.a);
  gl_FragColor = vec4(max(col.rgb + dz, 0.0), col.a);
}`;

// ---------------------------------------------------------------- the run

const ROLE = { sensing: "#3E9BDB", moving: "#46A758", power: "#F5C518" };
const views = (pts) => fitView(pts.map(at), [WIDTH, HEIGHT], { pad: 18, least: 0.4 });
const box = (c, r, h = r) => [[c[0], c[1], c[2] + h], [c[0], c[1], c[2] - h], [c[0] + r, c[1] - r, c[2]], [c[0] - r, c[1] + r, c[2]]];
const globeBox = (day, extra = []) => [...box(M.centre(day), 16, 20), ...extra];
// A season is read off the globe and the lamp together, and Pip, who brought the arm there, stays in view.
const pipAt = (day) => { const st = { ...REST, day }, q = poses(C, M, st, dynamic(K, P, C, M, st)).pip.at; return [q, [q[0], q[1], q[2] + PIP.size]]; };
const seasonBox = (day) => globeBox(day, [...box(C.LAMP, 9), ...pipAt(day)]);
const STEPS = [
  { title: "Meet the crew", who: "Volta, Pip and Mo", color: "var(--anatomy-hi)", text: "Three animals run this tellurion: Volta lights the lamp, Pip walks the year arm round, and Mo turns the globe.", to: 79, points: null, hold: 1.6 },
  { title: "Volta lights the Sun", who: "Volta · power", color: ROLE.power, text: "Volta's current runs up the pillar into the lamp. Its light falls on one half of the globe; the other half is in night.", to: 79, points: [[-6, -6, 14], [40, 4, 14], ...box(C.LAMP, 9), ...globeBox(79)] },
  { title: "Pip walks the year", who: "Pip · moving", color: ROLE.moving, text: "One lap of the arm is one year. As it swings, five gears turn the globe's mount back by the same angle, so the axis keeps pointing the same way.", to: 132, points: [...box(C.LAMP, 9), ...globeBox(132), [62, 0, 14], [0, 62, 14]] },
  { title: "June: the north leans in", who: "Pip · moving", color: ROLE.moving, text: "The axis tips 23.4° toward the lamp. The Sun stands overhead at 23.4° north, and the Arctic stays lit all day.", to: 172, points: seasonBox(172) },
  { title: "Mo turns the days", who: "Mo · sensing", color: ROLE.sensing, text: "Each turn of Mo's crank is one day. London spends most of the turn in the light: 16 hours 38 minutes, with the Sun 62° high at noon.", to: 175, points: globeBox(175, [[M.centre(175)[0], M.centre(175)[1], 34]]) },
  { title: "September: neither leans in", who: "Pip · moving", color: ROLE.moving, text: "The axis now points sideways to the lamp, so the light reaches from pole to pole: day and night are about 12 hours each, everywhere.", to: 266, points: seasonBox(266) },
  { title: "December: the north leans away", who: "Pip · moving", color: ROLE.moving, text: "The same tilt now points the north away. London gets 7 hours 50 minutes of daylight, the Sun only 15° high.", to: 355, points: seasonBox(355) },
  { title: "It isn't the distance", who: "Pip · moving", color: ROLE.moving, text: "Earth is closest to the Sun in early January, 147 million km, and farthest in July, 152 million. It's winter in the north all the same: the tilt makes the seasons.", to: 368, points: seasonBox(368) },
  { title: "Back to spring", who: "everyone", color: "var(--anatomy-hi)", text: "Pip brings the year round to March. Day and night are about equal again, and the cycle starts over.", to: 444, points: null, hold: 2 },
];
// The readout: the date and London's day, from the Sun's height over the equator that the machine gives.
function readoutOf(C, M, day) {
  const dec = M.decl(day), lat = C.LONDON[0], m = Math.round(M.dayLength(lat, dec) * 60);
  return M.date(day) + " · London: day " + Math.floor(m / 60) + " h " + String(m % 60).padStart(2, "0") + " m, noon Sun " + Math.round(M.noonSun(lat, dec)) + "°";
}
const VIEWS = STEPS.map((s) => (s.points ? views(s.points) : [0, 0, WIDTH, HEIGHT]));
const CAMERA = glCamera(P);

const live = `
const P = ${JSON.stringify(P)};
const C = ${JSON.stringify(C)};
const VOLTA = ${JSON.stringify(VOLTA)}, PIP = ${JSON.stringify(PIP)}, MO = ${JSON.stringify(MO)};
const STEP_INFO = ${JSON.stringify(STEPS.map(({ title, text, who, hold, pace }) => ({ title, text, who, hold, pace })))};
const TARGETS = ${JSON.stringify(STEPS.map((s) => s.to))};
const VIEWS = ${JSON.stringify(VIEWS.map((v) => v.map((n) => +n.toFixed(2))))};
const COLORS = ${JSON.stringify(STEPS.map((s) => s.color))};
const CAMERA = ${JSON.stringify(CAMERA)};
const GLOW = ${JSON.stringify(GLOW)};
const K = { iso, pathOf, depthOf, cameraOf, solidSvg, dotsSvg, ...CREW };
const model = ${model.toString()};
const dynamic = ${dynamic.toString()};
const poses = ${poses.toString()};
const M = model(C);
const stage = document.querySelector(".sn-stage");
const svgs = [...stage.querySelectorAll(":scope > svg")];
const part = (name) => stage.querySelector('[data-part="' + name + '"]');
const orbit = stage.querySelector("[data-orbit]");
const el = { back: part("orbit-back"), front: part("orbit-front"), bar: part("bar"), gears: part("gears"), handle: part("handle"), lowA: part("low-a"), lowB: part("low-b"), pipA: part("pip-a"), pipB: part("pip-b"), mount: part("mount"), crank: part("crank"), crankH: part("crank-h"), moSlot: part("mo-slot"), globe: part("globe"), land: part("land"), night: part("night"), london: part("london"), pip: part("pip"), mo: part("mo"), volta: part("volta") };
const readout = document.querySelector("[data-readout]");
const REST = ${JSON.stringify(REST)};
const S = { ...REST };
let lastPose = {};
function paintCrew(name, node, spec, pose, duty) {
  const key = JSON.stringify(pose) + duty;
  if (lastPose[name] === key) return;
  lastPose[name] = key;
  CREW.paintCritter(node, CREW.critter(spec, pose, P));
  node.toggleAttribute("data-duty", duty);
}
const glow = glLayer({ canvas: stage.querySelector(".sn-gl"), fragment: GLOW, view: [${WIDTH}, ${HEIGHT}], camera: CAMERA, uniforms: ["uLamp", "uLampP", "uLight"], maxRatio: 1.25 });
let view = VIEWS[0] ? [...VIEWS[0]] : [0, 0, ${WIDTH}, ${HEIGHT}];
const still = matchMedia("(prefers-reduced-motion: reduce)");
let glKey = "", width = 0;
new ResizeObserver((entries) => { width = entries[0].contentRect.width; paintGL(); }).observe(stage);
function paintGL() {
  if (!glow) return;
  const light = stage.closest("[data-theme]")?.getAttribute("data-theme") === "light" ? 1 : 0;
  const key = view.map((v) => v.toFixed(2)).join(" ") + " " + S.lamp.toFixed(3) + " " + light + " " + width;
  if (key === glKey) return;
  glKey = key;
  const cam = { uView: [view[2], view[3]], uOrigin: [CAMERA.origin[0] - view[0], CAMERA.origin[1] - view[1]] };
  S.lamp > 0.002 ? glow.draw({ ...cam, uLamp: S.lamp, uLampP: C.LAMP, uLight: light }, 0) : glow.clear();
}
const readoutOf = ${readoutOf.toString()};
// Only what changed reaches the DOM: a paused globe turning in place leaves the arm and its gears alone.
const shown = new Map();
function put(node, name, value) {
  const was = shown.get(node) ?? {};
  if (was[name] === value) return;
  was[name] = value;
  shown.set(node, was);
  if (name === "html") node.innerHTML = value; else node.setAttribute(name, value);
}
function draw() {
  const D = dynamic(K, P, C, M, S);
  const host = D.armFront ? el.front : el.back;
  if (orbit.parentNode !== host) host.appendChild(orbit);
  const [first, second] = D.armFront ? [el.gears, el.handle] : [el.handle, el.gears];
  if (first.parentNode !== el.lowA) { el.lowA.appendChild(first); el.lowB.appendChild(second); }
  put(el.bar, "html", D.bar);
  put(el.gears, "html", D.gears);
  put(el.handle, "html", D.handle);
  const t = "translate(" + D.globeShift[0].toFixed(2) + " " + D.globeShift[1].toFixed(2) + ")";
  for (const g of [el.mount, el.crank, el.globe]) put(g, "transform", t);
  put(el.crankH, "html", D.crank);
  put(el.land, "d", D.land);
  put(el.night, "d", D.night);
  put(el.night, "style", "--sn-lamp:" + D.lamp);
  put(el.london, "cx", D.london ? D.london[0].toFixed(2) : "-999");
  put(el.london, "cy", D.london ? D.london[1].toFixed(2) : "-999");
  const p = poses(C, M, S, D);
  // Pip stands in front of the globe's post or behind it, whichever is true from the camera.
  const pipNear = K.depthOf(p.pip.at, P) > K.depthOf([D.G[0], D.G[1], 30], P);
  const slot = pipNear ? el.pipB : el.pipA;
  if (el.pip.parentNode !== slot) slot.appendChild(el.pip);
  paintCrew("pip", el.pip, PIP, p.pip, S.duty === "pip");
  paintCrew("mo", el.mo, MO, p.mo, S.duty === "mo");
  paintCrew("volta", el.volta, VOLTA, p.volta, S.duty === "volta");
  paintGL();
  const text = readoutOf(C, M, S.day);
  if (readout.textContent !== text) readout.textContent = text;
}
const DONE = TARGETS.map((to, i) => () => (i === 1 ? S.lamp === 1 && S.stepT > 0.6 : S.day === S.target && S.stepT > 0.4));
function step(dt) {
  S.t += dt;
  S.stepT += dt;
  S.lamp += (S.lampT - S.lamp) * (1 - Math.exp(-dt / 0.35));
  if (Math.abs(S.lampT - S.lamp) < 0.001) S.lamp = S.lampT;
  const gap = S.target - S.day;
  // Pip hurries between seasons and slows into each; on Mo's beat the date keeps time with the globe's turns.
  const lock = S.lock && Math.abs(gap) < 3.5;
  const speed = lock ? C.TURN / (2 * Math.PI) : Math.max(1.5, Math.min(30, Math.abs(gap) * 3));
  const v = Math.sign(gap) * Math.min(Math.abs(gap), speed * dt);
  S.day += v;
  if (Math.abs(S.target - S.day) < 0.01) S.day = S.target;
  S.walk = Math.abs(v) > 1e-4;
  if (S.turning) S.spin += (lock ? C.TURN : C.SPIN) * dt;
  S.duty = Math.abs(S.lamp - S.lampT) > 0.01 ? "volta" : S.walk ? "pip" : S.turning && S.lamp > 0.5 ? "mo" : "";
}
function enter(i) {
  if (i === 0) Object.assign(S, { ...REST, spin: S.spin });
  Object.assign(S, { lampT: i >= 1 ? 1 : 0, turning: i >= 3, target: TARGETS[i], lock: i === 4, stepT: 0 });
  draw();
}
const run = STEPS.mountSteps({
  root: document.querySelector("[data-steps]"),
  svg: svgs,
  stage,
  steps: STEP_INFO,
  views: VIEWS,
  colors: COLORS,
  size: [${WIDTH}, ${HEIGHT}],
  enter,
  update: (dt) => { step(dt); draw(); },
  done: (i) => DONE[i](),
  advance: step,
  draw,
  save: () => JSON.parse(JSON.stringify(S)),
  load: (x) => { Object.assign(S, JSON.parse(JSON.stringify(x))); lastPose = {}; draw(); },
  onView: (v) => { view = v; paintGL(); },
});
// Drag the globe round the lamp, or use the arrow keys, to set any date. The run pauses, the camera pulls back
// to the whole machine and the globe keeps turning; Space replays the beat it left, from the date set.
const said = document.querySelector("[data-said]");
let scrubbed = false, dragging = false, onScreen = false, idleFrame = 0, spinT = 0;
function idle(now) {
  idleFrame = 0;
  if (run.playing || !onScreen || still.matches) return;
  if (!dragging && spinT) { S.spin += C.SPIN * Math.min(0.05, (now - spinT) / 1000); draw(); }
  spinT = now;
  idleFrame = requestAnimationFrame(idle);
}
function idleStart() { if (!idleFrame) { spinT = 0; idleFrame = requestAnimationFrame(idle); } }
new IntersectionObserver((entries) => { onScreen = entries[entries.length - 1].isIntersecting; if (onScreen) idleStart(); }).observe(stage);
function setDay(day) {
  if (run.playing) run.toggle();
  run.aim([0, 0, ${WIDTH}, ${HEIGHT}]);
  Object.assign(S, { day: (((day - 1) % 365) + 365) % 365 + 1, lamp: 1, lampT: 1, turning: true, lock: false, walk: false, duty: "" });
  S.target = S.day;
  scrubbed = true;
  draw();
  idleStart();
}
function pointAt(e) {
  const box = svgs[0].getBoundingClientRect(), vb = svgs[0].viewBox.baseVal;
  return [vb.x + ((e.clientX - box.left) / box.width) * vb.width, vb.y + ((e.clientY - box.top) / box.height) * vb.height];
}
function dayAt([x, y]) {
  let best = S.day, bd = Infinity;
  for (let d = 1; d <= 365; d += 0.5) { const g = K.iso(M.centre(d), P); const e = (g[0] - x) ** 2 + (g[1] - y) ** 2; if (e < bd) { bd = e; best = d; } }
  return best;
}
stage.addEventListener("pointerdown", (e) => {
  const q = pointAt(e), g = K.iso(M.centre(S.day), P);
  if (Math.hypot(q[0] - g[0], q[1] - g[1]) > ${(RK * 1.6).toFixed(1)}) return;
  dragging = true;
  stage.setPointerCapture(e.pointerId);
  setDay(dayAt(q));
});
stage.addEventListener("pointermove", (e) => { if (dragging) setDay(dayAt(pointAt(e))); });
for (const type of ["pointerup", "pointercancel"]) stage.addEventListener(type, () => { if (dragging) said.textContent = readoutOf(C, M, S.day); dragging = false; });
stage.addEventListener("keydown", (e) => {
  if (e.key === " " && run.playing && scrubbed) {
    // The run's own Space handler has just resumed it: replay the beat from the date set.
    scrubbed = false;
    S.day += 365 * Math.round((TARGETS[run.index] - S.day) / 365);
    run.go(run.index);
  } else if (e.key === " " && !run.playing) idleStart();
  else if (e.key === "Home") scrubbed = false;
  else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    e.preventDefault();
    setDay(S.day + (e.key === "ArrowRight" ? 1 : -1) * (e.shiftKey ? 10 : 1));
    said.textContent = readoutOf(C, M, S.day);
  }
});
`;

const keys = [
  { mark: "lit", label: "On duty: whoever is doing the work right now" },
  { mark: "raised", label: "Volta, electric eel, power: lights the lamp, the Sun" },
  { mark: "raised", label: "Pip, squirrel, moving: walks the year arm round, one lap a year" },
  { mark: "raised", label: "Mo, sloth, sensing: turns the globe once a day by its crank" },
];

const css = `${crewCss()}${STEPS_CSS}
.sn-stage{position:relative;touch-action:pan-y pinch-zoom;overflow:hidden}
.sn-stage [data-part="globe"]{cursor:grab}
.sn-said{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
.sn-stage>svg,.sn-stage>canvas{display:block;width:100%;height:auto}
.sn-stage>.sn-layer{position:absolute;inset:0;height:100%!important;pointer-events:none}
.iso[data-theme="dark"] .sn-stage>canvas,.iso:not([data-theme]) .sn-stage>canvas{mix-blend-mode:screen}
.sn-stage:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:6px}
.iso{--sn-ocean:#2E6597;--sn-land:#5E8A4E;--sn-night:#03060f;--sn-dark:.84;--sn-line:#ffffff}
.iso[data-theme="light"]{--sn-ocean:#6FA6D6;--sn-land:#8DB46E;--sn-night:#0B1630;--sn-dark:.62;--sn-line:#ffffff}
.sn-ocean{fill:var(--sn-ocean)}
.sn-land{fill:var(--sn-land);stroke:none}
.sn-night{fill:var(--sn-night);filter:url(#sn-soft);opacity:calc(var(--sn-dark) * var(--sn-lamp, 0))}
.sn-lat{fill:none;stroke:var(--sn-line);stroke-width:.45;opacity:.5;stroke-linecap:round}
.sn-trop{stroke-dasharray:1.6 1.6}
.sn-arc{stroke-dasharray:.4 1.4}
.sn-rim{fill:none;stroke:var(--anatomy-hi);stroke-width:var(--anatomy-weight)}
.sn-london{fill:#fff;stroke:#1c1c1c;stroke-width:.5}`;

const body = `<style>${css}</style>` + k.plateHtml({
  fig: "Fig 1",
  title: "Why the Earth has seasons, staffed",
  hint: "Plays on its own · drag the globe",
  readout: readoutOf(C, M, DAY0),
  keys,
  caption:
    "A tellurion: the lamp is the Sun and the globe is the Earth, its axis tilted 23.4° and kept pointing at the same stars all year by five equal gears along the arm. Through the year the tilt points the northern half toward the lamp, then sideways, then away. When it leans in, the Sun stands higher and the days are longer, so each square metre gets more sunlight for more hours; when it leans away, the same light comes in low, spreads over more ground and for fewer hours. The distance hardly changes, and the Earth is closest to the Sun in January. The model's sizes and distances are not to scale; its angles are.",
  body: `<div class="iso-stage sn-stage" tabindex="0" role="group" aria-label="Tellurion, playing on a loop: Space pauses, Home starts again, left and right arrows change the date">${backSvg}<canvas class="sn-layer sn-gl" aria-hidden="true"></canvas>${frontSvg}</div><p class="sn-said" aria-live="polite" data-said></p>${stepsHtml(STEPS)}`,
});

const file = theme === "light" ? "seasons-light.html" : "seasons.html";
writeFileSync(join(HERE, file), k.pageHtml({ title: "Why the Earth has seasons, staffed", theme, body, script: kitScript() + glScript() + crewScript() + stepsScript() + live, width: 680 }));
console.log("wrote", file);
