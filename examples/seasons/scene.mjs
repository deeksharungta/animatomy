import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, M, G0, P, at, S, Ln, Dt, UP } from "./model.mjs";

// ---------------------------------------------------------------- the scene and the static machine

export function desk() {
  const { x, y, w, d, r } = C.DESK;
  const out = [];
  out.push(S(k.slabOf({ x, y, w, d, r }, -10, 10, P, 6, 0.6), { tone: "lo" }));
  for (let i = 1; i < 9; i++) out.push(Ln(k.lineOnTop([x + 0.15, y + (d * i) / 9], [x + w - 0.15, y + (d * i) / 9], 0, P), { tone: "faint" }));
  return out.join("");
}

export function plinth() {
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

export function pillarLow() {
  const out = [];
  out.push(S(k.cylinder(0, 0, C.PILLAR_R + 2.4, C.PLINTH.z1, 1.6, P, 32), { tone: "mid" }));
  out.push(S(k.cylinder(0, 0, C.PILLAR_R, C.PLINTH.z1 + 1.6, 4, P, 24), { tone: "hi", crease: "none" }));
  // The socket where the lamp's cable goes into the pillar, at Volta's snout.
  out.push(S(k.slabOf({ x: 2.4, y: -1.6, w: 2.2, d: 3.2, r: 0.4 }, C.PLINTH.z1 + 0.4, 3, P, 2), { tone: "mid" }));
  return out.join("");
}

export function collar() {
  return S(k.cylinder(0, 0, C.ARM.from, 18, 4, P, 32), { tone: "mid" }) + S(k.cylinder(0, 0, C.PILLAR_R, 18 - 2.4, 2.4, P, 24), { tone: "hi", crease: "none" });
}

const gearAt = (c, turn = 0) => S(L.prismOf(L.frameOf(c, UP, [1, 0, 0], [0, 1, 0]), M.teeth(turn), C.GEAR.z0, C.GEAR.z1, P), { tone: "hi" }) + Dt([at([c[0], c[1], C.GEAR.z1])], { size: 0.45, tone: "lo" });

export function pillarHigh() {
  const out = [];
  out.push(gearAt([0, 0, 0]));
  out.push(S(k.cylinder(0, 0, C.PILLAR_R, C.GEAR.z1, 30, P, 24), { tone: "hi", crease: "none" }));
  out.push(S(L.solidOf([[0, 3.6], [1.6, 4.4, 1], [3.4, 3.2]], L.frameAlong([0, 0, C.GEAR.z1 + 30], UP), P), { tone: "mid" }));
  return out.join("");
}

export function lamp() {
  return S(L.sphereOf(C.LAMP, C.LAMP_R, P, { steps: 48 }), { tone: "hi", lit: true });
}

// The globe's mount, drawn at the June position and moved with the arm. It never turns: the gear train
// carries it round without changing its orientation.

export function mountLow() {
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
export function meridian(front) {
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

export function axisRod(part) {
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
export const RK = C.GLOBE_R * k.cameraOf(P).k;
export function globeBase() {
  const c = at(G0);
  return `<circle class="sn-ocean" cx="${c[0].toFixed(2)}" cy="${c[1].toFixed(2)}" r="${RK.toFixed(2)}"/>`;
}
export function latitudes() {
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
