import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";

export const WIDTH = 640;
export const HEIGHT = 540;

// A demonstration gyroscope on a lab bench. World units are 2 mm. A brass flywheel spins on the end of a
// balance arm; a counterweight on the other end balances it, so the arm sits level on its trunnion. A swivel
// at the top of the column lets the arm turn round, the trunnion lets it tip. Mo hangs under the arm as the
// one weight it isn't balanced against, and climbs out along a graduated rail to change his twist.
export const C = {
  BENCH: { x: -104, y: -100, w: 208, d: 204, r: 3 },
  PLINTH: { x: -40, y: -40, w: 80, d: 80, r: 6, z0: 4, z1: 15 },
  BASE: { r: 26, z0: 15, z1: 21 },
  COL: { r: 4.4, z0: 21, z1: 96 },
  HOUSING: { z0: 96, z1: 106, r: 12.5 },
  RINGS: { z0: 106, z1: 114, r: 6.4 },
  FORK: { z0: 114, z1: 117, r: 13, cheek: 7.5, top: 132, w: 7, t: 1.8 },
  PIVOT_Z: 127,
  BAR: { from: -62, to: 72, w: 6, h: 4 },
  RAIL: { from: 26, to: 67.5, drop: 5, r: 0.9 },
  ROTOR: { at: 82, R: 25, w: 10, hub: 7.5 },
  CW: { at: -50, r: 12.5, len: 16 },
  STOP: 18,
  // Pinch's shelf hangs off the fork under the counterweight half; the latch lug hangs from the bar beside it.
  LUG: { s: -20, drop: 15, grip: 2.4 },
  SHELF: { s: -30, side: -2, z: 101, feet: [-29, -2], turn: -90 },
  PARK: -60,
  MO: { near: 32, far: 64 },
  // Physics, SI. The trunnion holds the rotor 164 mm out; Mo is 0.8 kg on a rail, 64 or 128 mm out.
  I_S: 3.0e-3,
  I_ARM: 0.06,
  MO_KG: 0.8,
  // The rotor spins clockwise seen from its outer face, so the arm swings clockwise seen from above.
  SPIN: -1,
  RPM: 2400,
  MOTOR_T: 6,
  FRIC_V: 150,
  FRIC_C: 1.1,
  SWIVEL: 0.002,
  TRUNNION: 0.08,
  UNIT: 0.002,
  G: 9.81,
};

// ---------------------------------------------------------------- the model (shared by build and page)

export function physics(C) {
  const W = (C.RPM * 2 * Math.PI) / 60, D = Math.PI / 180;
  const torque = (S) => C.MO_KG * C.G * S.d * C.UNIT;
  const inertia = (S) => C.I_ARM + C.MO_KG * (S.d * C.UNIT) ** 2;
  // One step of the arm: a heavy symmetric top on a fixed point, with the spin's angular momentum L, the
  // tip th (rotor end up is +) and the swing ph round the column. Friction in the swivel resists the swing,
  // which is what lets the arm sink as the spin runs down.
  function step(S, dt, warp) {
    const ws = warp || 1;
    // The spin: Volta's motor drives it toward 2400 rpm, the bearings slow it (sped up by `warp`).
    const drive = S.motor ? (W - S.w) / C.MOTOR_T : 0;
    const fric = -S.w / C.FRIC_V - (S.w > 0 ? C.FRIC_C : 0);
    const wNew = Math.max(0, S.w + (drive + (S.motor ? 0 : fric)) * dt * ws);
    const dL = (C.SPIN * (wNew - S.w) * C.I_S) / dt;
    S.w = wNew;
    if (S.lock || S.hand) { S.thd = 0; S.phd = 0; return S; }
    const Ls = C.SPIN * C.I_S * S.w, I = inertia(S), tq = torque(S);
    const c = Math.cos(S.th), s = Math.sin(S.th);
    const thdd = (-I * S.phd * S.phd * s * c + Ls * S.phd * c - tq * c - C.TRUNNION * S.thd) / I;
    const phdd = (-C.SWIVEL * S.phd + 2 * I * S.phd * S.thd * c * s - Ls * S.thd * c - dL * s) / (I * c * c);
    S.thd += thdd * dt;
    S.phd += phdd * dt;
    S.th += S.thd * dt;
    S.ph += S.phd * dt;
    // The rubber stops on the fork: the arm lands on one and stays there.
    const lim = C.STOP * D;
    if (S.th < -lim) { S.th = -lim; S.thd = Math.max(0, -0.15 * S.thd); }
    if (S.th > lim) { S.th = lim; S.thd = Math.min(0, -0.15 * S.thd); }
    return S;
  }
  const rpm = (S) => (S.w * 60) / (2 * Math.PI);
  const lap = (S) => (Math.abs(S.phd) > 0.02 ? (2 * Math.PI) / Math.abs(S.phd) : Infinity);
  const steady = (S) => (S.w > 1 ? torque(S) / (C.I_S * S.w) : Infinity);
  return { W, D, torque, inertia, step, rpm, lap, steady };
}

export const PH = physics(C);

// The arm sweeps the whole card, so the camera frames the sweep and the stand (as the tellurion does): the
// bench and the two walls run on past the edges of the figure.
const TOP = 172, sweep = Array.from({ length: 48 }, (_, i) => [94 * Math.cos((i / 48) * 2 * Math.PI), 94 * Math.sin((i / 48) * 2 * Math.PI)]);
export const ROOM_TOP = TOP;
export const P = k.fitProjection([...sweep.map(([x, y]) => [x, y, -4]), ...sweep.map(([x, y]) => [x, y, 154])], WIDTH, HEIGHT, { pad: 8, azimuth: 45, elevation: 28 });
export const K = { ...k, ...L };
export const at = (p) => k.iso(p, P);
export const S_ = (paths, style) => k.solidSvg(paths, style);
export const Ln = (d, style) => k.lineSvg(d, style);
export const Dt = (points, style) => k.dotsSvg(points, style);
export const UP = [0, 0, 1];
// A round cord along a list of points, with a ball at every bend.
export function cordOf(pts, r, tone = "lo") {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p = pts[i], q = pts[i + 1], d = [q[0] - p[0], q[1] - p[1], q[2] - p[2]], l = Math.hypot(...d);
    out.push(S_(L.solidOf([[0, r], [l, r]], L.frameAlong(p, d.map((x) => x / l)), P), { tone, crease: "none" }));
    if (i) out.push(S_(L.sphereOf(p, r, P, { steps: 16 }), { tone }));
  }
  return out.join("");
}
