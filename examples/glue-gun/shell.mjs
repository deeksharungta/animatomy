import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D, face, quad, roundPoly, inset } from "./model.mjs";

// The far clamshell half, seen from inside where the near half came off: its far wall, the inside and outside of
// its perimeter wall, the band where it was cut at y = 0, and the screw bosses that held the two halves together.
const V = L.viewOf(P), Z = C.ZC, FAR = -C.HW, IN = -C.HW + C.WALL;
const PER = 8;
export const OUTP = roundPoly(C.OUT, PER);
export const INV = inset(C.OUT, C.WALL);
export const INP = roundPoly(INV, PER);
const dotV = (n) => n[0] * V[0] + n[1] * V[1] + n[2] * V[2];

// One solid along an outline: a strip between y0 and y1 for each run of segments facing the viewer.
function wallStrip(pts, y0, y1, outward, skip = () => false, tone = "mid", cls, tilt = 0) {
  const n = pts.length, runs = [];
  let run = null;
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz);
    if (l < 1e-6) continue;
    const nrm = outward ? [-dz / l, 0, dx / l] : [dz / l, 0, -dx / l];
    if (dotV(nrm) > 0.02 && !skip(a, b)) { if (!run) runs.push((run = [])); run.push([a, b, nrm]); } else run = null;
  }
  if (runs.length > 1 && runs[0][0][0] === pts[0] && runs.at(-1).at(-1)[1] === pts[0]) runs[0] = [...runs.pop(), ...runs[0]];
  return runs.map((segs) => {
    const shades = [[], [], [], [], []], top = [], far = [], near = [];
    for (const [a, b, nrm] of segs) {
      const q = k.pathOf([[a[0], y0, a[1]], [b[0], y0, b[1]], [b[0], y1, b[1]], [a[0], y1, a[1]]].map(at), true);
      shades[L.toneOf(tilt ? L.unit3([nrm[0], -tilt, nrm[2]]) : nrm, P)].push(q);
    }
    for (const [a] of segs) { far.push([a[0], y0, a[1]]); near.push([a[0], y1, a[1]]); }
    const last = segs.at(-1)[1];
    far.push([last[0], y0, last[1]]); near.push([last[0], y1, last[1]]);
    const ring = k.pathOf([...far, ...near.reverse()].map(at), true);
    return S({ fill: ring, outline: ring, crease: "", top: shades[4].join(""), shades: shades.slice(0, 4).map((s) => s.join("")), seamless: true }, { tone, crease: "none", className: cls });
  }).join("");
}

const inSlot = (a, b) => Math.min(a[1], b[1]) < Z - 30 && a[0] > C.SLOT[0] - 0.1 && b[0] < C.SLOT[1] + 0.1 && a[0] < C.SLOT[1] + 0.1;
const isFront = (a, b) => Math.abs(a[0] - 36) < 0.01 && Math.abs(b[0] - 36) < 0.01;

// The far wall's inside face, the visible inner faces of the perimeter wall, the slot's side and the far wall's vents.
export function shellInside() {
  const out = [face(INP, IN, { tone: "mid", cls: "gg-in" })];
  out.push(wallStrip(INP, IN, 0, false, (a, b) => inSlot([Math.min(a[0], b[0]), a[1]], [Math.max(a[0], b[0]), b[1]]), "mid", "gg-in"));
  const zf = INV[5][1];
  out.push(quad([[C.SLOT[0], IN, zf], [C.SLOT[1], IN, zf], [C.SLOT[1], -C.SLOT_Y, zf], [C.SLOT[0], -C.SLOT_Y, zf]], [0, 0, 1]));
  out.push(face([[C.SLOT[0], Z - 36], [C.SLOT[1], Z - 36], [C.SLOT[1], zf], [C.SLOT[0], zf]], -C.SLOT_Y));
  // Vents through the far wall beside the heater, each a closed slot.
  const vents = [];
  for (let i = 0; i < 6; i++) {
    const x = -6 + i * 6, pts = roundPoly([[x, Z - 22, 1.2], [x + 2.6, Z - 22, 1.2], [x + 2.6, Z - 30, 1.2], [x, Z - 30, 1.2]], 4);
    vents.push(k.pathOf(pts.map(([px, pz]) => at([px, IN, pz])), true));
  }
  out.push(`<path class="gg-vent" d="${vents.join("")}"/>` + Ln(vents.join(""), { tone: "lo" }));
  return out.join("");
}

// A screw boss: a post from the far wall to the parting plane with the screw's tip in its hole.
export const BOSSES = [[-108, Z + 11], [-40, Z + 12], [12, Z + 15.5], [-50, Z - 28], [-124, 22], [-114, 60]];
export function bosses() {
  return BOSSES.map(([x, z]) => {
    const F = L.frameAlong([x, IN, z], [0, 1, 0]);
    return S(L.disc(0, -IN, 3.4, F, P, { steps: 28 }), { tone: "mid", crease: "none" }) + Ln(L.circleOf(F, -IN, 1.5, P, 24), { tone: "lo" }) +
      D([at([x, 0, z])], { size: 0.55, tone: "lo" });
  }).join("");
}

// A rib across the inside at x0..x1 from floor to roof, notched round the stick at radius rn.
export function rib([x0, x1], rn, { wire = true } = {}) {
  const zf = Math.max(floorAt(x1), Z - 26), zr = Z + 19 - C.WALL, arc = [];
  for (let i = 0; i <= 16; i++) { const f = -Math.PI / 2 - (i / 16) * Math.PI; arc.push([rn * Math.cos(f), Z + rn * Math.sin(f)]); }
  const notch = wire ? [[-8, zf], [-8, zf + 3], [-13, zf + 3], [-13, zf]] : [];
  const poly = [[0, zf], [0, Z - rn], ...arc.slice(1, -1), [0, Z + rn], [0, zr], [IN, zr], [IN, zf], ...notch.reverse()];
  const d = k.pathOf(poly.map(([y, z]) => at([x1, y, z])), true);
  const out = [S({ fill: d, outline: d, crease: "", top: "", shades: ["", "", "", ""].map((s, i) => (i === L.toneOf([1, 0, 0], P) ? d : s)) }, { tone: "mid", crease: "none" })];
  out.push(face([[x0, zf], [x1, zf], [x1, Z - rn], [x0, Z - rn]], 0) + face([[x0, Z + rn], [x1, Z + rn], [x1, zr], [x0, zr]], 0));
  return out.join("");
}
// The outer top's height at x, read off the outline.
export function topAt(x) {
  let z = -1e9;
  for (let i = 0; i < OUTP.length; i++) {
    const a = OUTP[i], b = OUTP[(i + 1) % OUTP.length];
    if ((a[0] - x) * (b[0] - x) > 0 || a[0] === b[0]) continue;
    z = Math.max(z, a[1] + ((b[1] - a[1]) * (x - a[0])) / (b[0] - a[0]));
  }
  return z;
}
// The inner floor's height at x, read off the inner outline.
export function floorAt(x) {
  let z = -1e9;
  for (let i = 0; i < INP.length; i++) {
    const a = INP[i], b = INP[(i + 1) % INP.length];
    if ((a[0] - x) * (b[0] - x) > 0 || a[0] === b[0]) continue;
    const zz = a[1] + ((b[1] - a[1]) * (x - a[0])) / (b[0] - a[0]);
    if (zz < Z - 10 && zz > z) z = zz;
  }
  return z;
}

// The band where the clamshell was cut, with gaps at the trigger slot, the rear opening and the nozzle's hole.
const GAPS = [
  [[C.SLOT[0], Z - 37], [C.SLOT[1], Z - 37], [C.SLOT[1], Z - 33], [C.SLOT[0], Z - 33]],
  [[-129, Z - C.REAR.ro], [-124, Z - C.REAR.ro], [-124, Z + C.REAR.ro], [-129, Z + C.REAR.ro]],
  [[33, Z - 6.6], [37, Z - 6.6], [37, Z + 6.6], [33, Z + 6.6]],
];
export function cutBand() {
  const ring = (pts) => k.pathOf(pts.map(([x, z]) => at([x, 0, z])), true);
  const box = [[-400, -200], [300, -200], [300, 400], [-400, 400]];
  const clip = `<clipPath id="gg-band"><path clip-rule="evenodd" d="${ring(box)}${GAPS.map(ring).join("")}"/></clipPath>`;
  const d = ring(OUTP) + ring(INP.slice().reverse());
  const edges = [
    k.segment([C.SLOT[0], 0, Z - 36], [C.SLOT[0], 0, INV[5][1]], P), k.segment([C.SLOT[1], 0, Z - 36], [C.SLOT[1], 0, INV[5][1]], P),
    k.segment([-128, 0, Z - C.REAR.ro], [-128 + C.WALL, 0, Z - C.REAR.ro], P), k.segment([-128, 0, Z + C.REAR.ro], [-128 + C.WALL, 0, Z + C.REAR.ro], P),
    k.segment([36 - C.WALL, 0, Z - 6.6], [36, 0, Z - 6.6], P), k.segment([36 - C.WALL, 0, Z + 6.6], [36, 0, Z + 6.6], P),
  ];
  const t = L.toneOf([0, 1, 0], P), shades = ["", "", "", ""];
  if (t < 4) shades[t] = d;
  return `<defs>${clip}</defs><g clip-path="url(#gg-band)">${S({ fill: d, outline: d, crease: "", top: t === 4 ? d : "", shades }, { tone: "hi", crease: "none", className: "gg-band" })}</g>` +
    Ln(edges.join(""), { tone: "lo" });
}

// The outside you see: the top, the front with the nozzle's hole, and the grip's front with its ribs.
export function shellOutside() {
  const out = [wallStrip(OUTP, FAR, FAR + 1.4, true, isFront, "mid", undefined, 1.4), wallStrip(OUTP, FAR + 1.4, FAR + 3.4, true, isFront, "mid", undefined, 0.5), wallStrip(OUTP, FAR + 3.4, 0, true, isFront, "mid")];
  // The rating plate on the top, and the vent slots over the heater.
  const plate = { x: -106, y: -13, w: 34, d: 10, r: 1 };
  out.push(S(k.slabOf(plate, Z + 19, 0.5, P, 2, 0.2), { tone: "hi" }) + Ln(k.planOutline(k.insetPlan(plate, 1.2), Z + 19.5, P, 2), { tone: "faint" }));
  out.push(Ln([-5.6, -8, -10.4].map((y, i) => k.lineOnTop([plate.x + 4, y], [plate.x + 4 + [20, 14, 24][i], y], Z + 19.5, P)).join(""), { tone: "lo", free: true }));
  out.push(D([at([plate.x + 2.2, -4.6, Z + 19.5]), at([plate.x + plate.w - 2.2, -11.4, Z + 19.5])], { size: 0.45 }));
  const slots = [];
  for (const x of [2, 6.5, 11, 15.5, 20]) {
    const ring = roundPoly([[x - 0.9, -3.5, 0.8], [x + 0.9, -3.5, 0.8], [x + 0.9, -12.5, 0.8], [x - 0.9, -12.5, 0.8]], 3);
    slots.push(k.pathOf(ring.map(([px, py]) => at([px, py, topAt(px) + 0.05])), true));
  }
  out.push(`<path class="gg-vent" d="${slots.join("")}"/>` + Ln(slots.join(""), { tone: "lo" }));
  const fz = [Z - 22 + 8, Z + 14 - 6], hole = [];
  for (let i = 0; i <= 18; i++) { const f = Math.PI / 2 + (i / 18) * Math.PI; hole.push([36, 6.6 * Math.cos(f), Z + 6.6 * Math.sin(f)]); }
  out.push(quad([[36, 0, fz[1]], [36, FAR, fz[1]], [36, FAR, fz[0]], [36, 0, fz[0]], ...hole.reverse()], [1, 0, 0]));
  // Grip ribs across the grip's front face, edge to edge.
  const ribs = [];
  for (let z = 14; z < 66; z += 5) { const x = -108 + (16 * (z - 4)) / 72; ribs.push(k.segment([x, FAR, z], [x, 0, z], P)); }
  out.push(Ln(ribs.join(""), { tone: "faint" }));
  return out.join("");
}

