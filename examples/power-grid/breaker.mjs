import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D, box, rod, turned, ringY } from "./model.mjs";

// The generator circuit breaker: a metal-clad cubicle with its doors and right side off. Three vacuum
// interrupters stand on the partition, the spring mechanism below drives their moving contacts through
// insulated push rods, and the bus duct from the generator lands on the roof.
const U = C.CUB, X0 = U.x, X1 = U.x + U.w, Y0 = U.y, Y1 = U.y + U.d, TOP = C.CUB_TOP, PZ = C.PART_Z;
const B = C.BOT;
const Z = [0, 0, 1];

export function busDuct() {
  const out = [];
  const z0 = TOP + 2, z1 = TOP + 14, gz = C.SH + C.GEN.r + 6;
  for (const x of [-30, 10]) {
    out.push(S(box(x - 2, C.FLOOR_Y, z0 - 6, x + 2, -72, z0 - 2, 0.3), { tone: "lo" }));
    out.push(S(box(x - 2, C.FLOOR_Y, z0 - 22, x + 2, C.FLOOR_Y + 3, z0 - 2, 0.3), { tone: "lo" }));
  }
  out.push(S(box(-52, -84, z0, X1 - 14, -68, z1, 0.6, 0.5), { tone: "mid", inner: Ln([-20, 20].map((x) => k.segment([x, -68, z0], [x, -68, z1], P)).join(""), { tone: "faint" }) }));
  out.push(S(box(-52, -84, z0, -36, AY + 2, z1, 0.6, 0.5), { tone: "mid", inner: Ln([-50, -28].map((y) => k.segment([-36, y, z0], [-36, y, z1], P)).join(""), { tone: "faint" }) }));
  out.push(S(box(-52, AY - 10, gz, -36, AY + 2, z1, 0.6, 0.5), { tone: "mid", inner: Ln(k.sideSeam({ x: -52, y: AY - 10, w: 16, d: 12, r: 0.6 }, gz + 14, P, 2), { tone: "faint" }) }));
  out.push(D([[-52, AY + 2, gz + 2], [-36, AY + 2, gz + 2]].map(at), { size: 0.5 }));
  out.push(Ln(ringY(AY + 2, -49, -39, gz + 4, gz + 16, 0.8), { tone: "faint" }) + D([[-48, AY + 2, gz + 5], [-40, AY + 2, gz + 5], [-48, AY + 2, gz + 15], [-40, AY + 2, gz + 15]].map(at), { size: 0.4 }));
  // Bolted joints in the duct: a collar round each section joint with a row of bolts.
  const band = (x0, y0, za, x1, y1, zb) => S(box(x0, y0, za, x1, y1, zb, 0.6, 0.3), { tone: "mid" });
  for (const x of [-12, 30]) { out.push(band(x, -85, z0 - 1, x + 2.4, -67, z1 + 1)); out.push(D([z0 + 2, z0 + 6, z0 + 10].map((z) => at([x + 1.2, -67, z])), { size: 0.45 })); }
  out.push(band(-53, -40, z0 - 1, -35, -37.6, z1 + 1));
  out.push(D([z0 + 2, z0 + 6, z0 + 10].map((z) => at([-35, -38.8, z])), { size: 0.45 }));
  out.push(band(-53, AY - 11, gz + 20, -35, AY + 3, gz + 22.4));
  out.push(D([-50, -44, -38].map((x) => at([x, AY + 3, gz + 21.2])), { size: 0.45 }));
  return out.join("");
}
const AY = C.AY;

export function cubicleBack() {
  const out = [];
  out.push(`<path class="iso-halo" d="${k.haloOf({ x: X0, y: Y0, w: U.w, d: U.d, r: 1 }, 0, 4, P)}"/>`);
  out.push(S(box(X0, Y0, 0, X1, Y0 + 3, TOP, 0.4), { tone: "mid" }));
  out.push(S(box(X0, Y0, 0, X0 + 3, Y1, TOP, 0.4), { tone: "mid" }));
  out.push(S(box(X0, Y0, 0, X1, Y1, 4, 0.4, 0.4), { tone: "lo" }));
  // The mechanism housing at the back of the lower compartment, with the closing spring along it.
  out.push(S(box(X0 + 5, Y0 + 3, 4, X1 - 5, C.MECH.y - 5, PZ, 0.6, 0.4), { tone: "mid" }));
  out.push(Ln(ringY(C.MECH.y - 5, X0 + 9, X1 - 9, 34, 54, 1.2), { tone: "faint" }));
  out.push(D([[X0 + 11, C.MECH.y - 5, 36], [X1 - 11, C.MECH.y - 5, 36], [X0 + 11, C.MECH.y - 5, 52], [X1 - 11, C.MECH.y - 5, 52]].map(at), { size: 0.45 }));
  // The operation counter's window and the hand-charging socket on the housing's face.
  out.push(Ln(ringY(C.MECH.y - 5, X0 + 14, X0 + 24, 44, 48, 0.6, 2), { tone: "lo" }));
  out.push(S(rod([X1 - 16, C.MECH.y - 5, 46], [0, 1, 0], 2.4, 0, 1.4, 20), { tone: "mid" }) + D([at([X1 - 16, C.MECH.y - 3.6, 46])], { size: 0.9, tone: "lo" }));
  return out.join("");
}
export const partition = () => S(k.slabOf({ x: X0 + 3, y: Y0 + 3, w: U.w - 6, d: Y1 - Y0 - 9, r: 0.4 }, PZ, 3, P, 2, 0.4), { tone: "mid" });
// The charging motor and the closing spring's housing, and the main shaft bearings.
export function mechanism() {
  const out = [], my = C.MECH.y, mz = C.MECH.z;
  out.push(S(rod([X0 + 6, my + 1, 12], [1, 0, 0], 5, 0, 10, 24), { tone: "hi" }));
  out.push(S(box(X0 + 7, my - 3, 4, X0 + 15, my + 5, 8, 0.3), { tone: "mid" }));
  for (const x of [X0 + 8, X1 - 8]) out.push(S(box(x - 2, my - 5, mz - 6, x + 2, my + 3, mz + 3, 0.4), { tone: "mid" }));
  out.push(S(rod([X0 + 6, my, mz], [1, 0, 0], 1.6, 0, U.w - 12, 14), { tone: "hi" }));
  return out.join("");
}

// One vacuum interrupter pole: insulating support, lower terminal, ceramic body, upper terminal. The nearest
// one has a window cut in its body so the contacts show.
export function pole(x, cut) {
  const out = [];
  out.push(S(k.cylinder(x, B.y, 3.4, PZ + 3, B.z0 - PZ - 6, P, 20), { tone: "mid" }));
  out.push(S(box(x - 4, B.y - 4, B.z0 - 3, x + 4, B.y + 4, B.z0, 0.4), { tone: "hi" }));
  const body = turned([x, B.y, B.z0], Z, [[0, B.r - 1], [1, B.r], [B.z1 - B.z0 - 1, B.r], [B.z1 - B.z0, B.r - 1]]);
  const Fb = L.frameAlong([x, B.y, B.z0], Z);
  const ribs = [5, 11, 17].map((s) => L.arcOf(Fb, s, B.r, P)).join("");
  out.push(S(body, { tone: "hi", inner: Ln(ribs, { tone: "faint" }) }));
  if (cut) out.push(`<path class="pg-void" d="${windowPath(x)}"/>`);
  out.push(S(box(x - 4, B.y - 4, B.z1, x + 4, B.y + 4, B.z1 + 3, 0.4), { tone: "hi" }));
  return out.join("");
}
export const WIN = { z0: B.z0 + 4, z1: B.z1 - 4, t0: -0.1, t1: 1.9 };
const onB = (x, t, z, r = B.r + 0.1) => at([x + r * Math.cos(t), B.y + r * Math.sin(t), z]);
export function windowPath(x) {
  const pts = [], n = 14;
  for (let i = 0; i <= n; i++) pts.push(onB(x, WIN.t0 + ((WIN.t1 - WIN.t0) * i) / n, WIN.z0));
  for (let i = 0; i <= n; i++) pts.push(onB(x, WIN.t1 - ((WIN.t1 - WIN.t0) * i) / n, WIN.z1));
  return k.pathOf(pts, true);
}
export const windowRim = (x) => `<path class="pg-rim" d="${windowPath(x)}"/>`;

// The front frame: posts, the header, the mid rail with its indicator windows and buttons, the right kick plate.
export function cubicleFront() {
  const out = [];
  out.push(S(box(X1 - 3, Y0, 0, X1, Y1, 8, 0.3), { tone: "mid" }));
  out.push(S(box(X1 - 3, Y0, TOP - 4, X1, Y1, TOP, 0.3), { tone: "mid" }));
  out.push(S(box(X0, Y1 - 3, 0, X0 + 4, Y1, TOP, 0.3), { tone: "mid" }));
  out.push(S(box(X1 - 4, Y1 - 3, 0, X1, Y1, TOP, 0.3), { tone: "mid" }));
  out.push(S(box(X0, Y1 - 3, TOP - 6, X1, Y1, TOP, 0.3, 0.4), { tone: "mid" }));
  out.push(S(box(X0, Y1 - 3, PZ - 4, X1, Y1, PZ + 4, 0.3, 0.4), { tone: "mid" }));
  out.push(S(box(X0, Y0, TOP, X1, Y1, TOP + 2, 0.3, 0.4), { tone: "mid" }));
  out.push(D([[X0 + 2, Y1, 10], [X0 + 2, Y1, TOP - 10], [X1 - 2, Y1, 10], [X1 - 2, Y1, TOP - 10]].map(at), { size: 0.5 }));
  out.push(Ln(ringY(Y1, X0 + 8, X0 + 16, PZ - 2.4, PZ + 2.4, 0.6, 2) + ringY(Y1, X0 + 19, X0 + 27, PZ - 2.4, PZ + 2.4, 0.6, 2), { tone: "lo" }));
  for (const [x, t] of [[X1 - 18, "hi"], [X1 - 11, "lo"]]) out.push(S(rod([x, Y1, PZ], [0, 1, 0], 1.6, 0, 1.4, 16), { tone: t }));
  return out.join("");
}
export const FLAGS = [[X0 + 12, Y1, PZ], [X0 + 23, Y1, PZ]];
