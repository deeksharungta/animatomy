import { critter, critterSvg } from "../../kit/critters.mjs";
import { fitView } from "../../kit/steps.mjs";
import { WIDTH, HEIGHT, C, K, P, PH, at } from "./model.mjs";
import { dynamic, poses } from "./moving.mjs";

// ---------------------------------------------------------------- the crew

export const VOLTA = { species: "eel", name: "Volta", size: 64, role: "power" };
export const MO = { species: "sloth", name: "Mo", size: 22, role: "moving" };
export const PINCH = { species: "crab", name: "Pinch", size: 12, role: "holding" };
export const crew = (spec, pose, part) => critterSvg(critter(spec, pose, P), { part });

export const PARK = (C.PARK * Math.PI) / 180;
export const REST = { w: 0, th: 0, thd: 0, ph: PARK, phd: 0, motor: false, lock: true, d: C.MO.near, dT: C.MO.near, climb: false, psi: 0, t: 0, amps: 0, pz: 0, hand: false, warp: 1, stepT: 0, rel: 9, duty: "" };

// Reach: Pinch on the parked bar; Mo on the rail at both ends of it, all the way round and at both stops.
{
  const warn = (name, c, label) => { for (const [paw, short] of Object.entries(c.reach)) if (short > 0.3) console.warn(`${name}'s ${paw} paw is ${short.toFixed(1)} short ${label}`); };
  const d0 = dynamic(K, P, C, REST), p0 = poses(C, REST, d0, MO, PINCH);
  warn("Pinch", critter(PINCH, p0.pinch, P), "parked");
  for (let ph = 0; ph < 6.28; ph += 0.4) for (const th of [-0.31, 0, 0.31]) for (const d of [C.MO.near, C.MO.far]) {
    const st = { ...REST, ph, th, d, lock: false, w: 200 }, D = dynamic(K, P, C, st);
    warn("Mo", critter(MO, poses(C, st, D, MO, PINCH).mo, P), `at swing ${ph.toFixed(1)}, tilt ${th}, ${d}`);
  }
}
// The numbers the captions quote, from the model: the same run the page plays, stepped here.
const L0 = C.I_S * PH.W, lap = (d) => (2 * Math.PI * L0) / PH.torque({ d });
const NUM = (() => {
  const S = { ...REST, w: PH.W, lock: false, motor: true }, h = 1 / 600;
  let dip = 0;
  for (let t = 0; t < 4; t += h) { PH.step(S, h); dip = Math.min(dip, S.th); }
  while (S.d < C.MO.far) { S.d = Math.min(C.MO.far, S.d + 9 * h); PH.step(S, h); }
  S.motor = false;
  for (let t = 0; t < 60 && S.th > -(C.STOP * PH.D) + 1e-6; t += h) PH.step(S, h, 5);
  return { dip: Math.round(-dip / PH.D), fall: Math.round(PH.rpm(S) / 100) * 100, near: lap(C.MO.near).toFixed(1), far: lap(C.MO.far).toFixed(1) };
})();
console.log(`spin ${C.RPM} rpm, L ${L0.toFixed(3)} N·m·s; lap ${NUM.near} s with Mo at ${C.MO.near * 2} mm, ${NUM.far} s at ${C.MO.far * 2} mm; dips ${NUM.dip}°, falls at ${NUM.fall} rpm`);
const n = (x) => Number(x).toLocaleString("en-GB");

// ---------------------------------------------------------------- the run

const ROLE = { power: "#F5C518", holding: "#E5484D", moving: "#46A758" };
const view = (pts, least = 0.36) => fitView(pts.map(at), [WIDTH, HEIGHT], { pad: 16, least });
const ring = (r, z, n = 16) => Array.from({ length: n }, (_, i) => [r * Math.cos((i / n) * 6.283), r * Math.sin((i / n) * 6.283), z]);
const D0 = dynamic(K, P, C, REST);
const sweep = [...ring(C.ROTOR.at + 12, C.PIVOT_Z + 28), ...ring(C.ROTOR.at + 12, C.PIVOT_Z - 50), [0, 0, 20]];
const parked = [D0.arm(C.ROTOR.at + 6, 0, 26), D0.arm(C.ROTOR.at + 6, 0, -26), D0.arm(-8, 0, 8), D0.arm(30, 0, -24)];
const post = poses(C, REST, D0, MO, PINCH).post;
export const STEPS = [
  { title: "Meet the crew", who: "Volta, Mo and Pinch", color: "var(--anatomy-hi)", text: "Volta is the rotor's motor current, Mo hangs under the arm as its one unbalanced weight, and Pinch holds the arm level.", points: null, hold: 1.6 },
  { title: "Volta spins the rotor up", who: "Volta · power", color: ROLE.power, text: `Current runs along Volta into the motor in the hub, and the brass rotor runs up to ${n(C.RPM)} rpm.`, points: parked },
  { title: "Pinch lets go", who: "Pinch · holding", color: ROLE.holding, text: `Pinch drops clear. Mo's weight pulls the rotor end down: it dips about ${NUM.dip}°, nods, and stops sinking.`, points: [[post[0], post[1], post[2] - 22], [post[0], post[1], post[2] + 16], [0, 0, C.FORK.top + 4], [0, 0, C.HOUSING.z0 - 4], D0.arm(-34, 0, 0)], least: 0.3 },
  { title: "It goes round, not down", who: "Mo · moving", color: ROLE.moving, text: `Mo's pull tips the spin sideways instead of down, so the whole arm swings round the column: one lap every ${NUM.near} s.`, points: sweep, least: 0.6 },
  { title: "Mo climbs out", who: "Mo · moving", color: ROLE.moving, text: `Twice as far out, Mo twists twice as hard, and the arm swings twice as fast: a lap every ${NUM.far} s.`, points: sweep, least: 0.6 },
  { title: "Volta lets go", who: "Mo · moving", color: ROLE.moving, text: "With the current off, the bearings slow the rotor (sped up 5×). Less spin, so the same pull swings it faster.", points: sweep, least: 0.6 },
  { title: "Down it goes", who: "Mo · moving", color: ROLE.moving, text: `At about ${n(NUM.fall)} rpm the spin can't hold the swing up any more. The arm sinks onto its stop.`, points: sweep, least: 0.6 },
  { title: "Back to rest", who: "everyone", color: "var(--anatomy-hi)", text: "You lift the arm back, Pinch takes hold, Mo climbs in and the rotor runs down.", points: null, hold: 2 },
];
export const VIEWS = STEPS.map((s) => (s.points ? view(s.points, s.least) : [0, 0, WIDTH, HEIGHT]));

export function readoutOf(C, PH, S) {
  const rpm = Math.round(PH.rpm(S) / 10) * 10, lap = PH.lap(S);
  const tilt = Math.round((S.th * 180) / Math.PI);
  return `${rpm.toLocaleString("en-GB")} rpm · lap ${lap < 60 ? lap.toFixed(1) + " s" : "—"} · tilt ${tilt > 0 ? "+" : tilt < 0 ? "−" : ""}${Math.abs(tilt)}°${S.warp > 1 ? " · spin ×" + S.warp : ""}`;
}
