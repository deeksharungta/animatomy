import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, Dt } from "./model.mjs";
import { tube } from "./bike.mjs";
import { partsKit } from "./moving.mjs";

const Q = partsKit({ ...k, ...L }, P, C);
const DY = 66, lerp = L.lerp3;
// The stays, from the dropouts forward to the bottom bracket and up to the seat tube at 380 mm.
const cs = (s) => [[6, 69 * s, -6], [-389, 32 * s, -66]];
const ss = (s) => [[2, 69 * s, 10], [-270, 13 * s, 378]];

// The far side of the frame, behind the wheel: its chainstay, seatstay and dropout.
export function frameFar() {
  const poly = [[-16, -10], [-10, 14], [14, 18], [26, 4], [30, -18], [20, -30], [6, -24]];
  return tube(cs(-1), 9, "lo", 0) + tube(ss(-1), 7.5, "lo", 0) + S(Q.polyY(poly, -DY - 6, -DY), { tone: "lo" });
}

// The near side: the chainstay with its protector, and the seatstay.
export function frameNear() {
  const [a, b] = cs(1);
  return tube(cs(1), 9, "mid", 0) + tube([lerp(a, b, 0.1), lerp(a, b, 0.4)], 10.4, "lo", 0) + tube(ss(1), 7.5, "mid", 0);
}

// The drive-side dropout the axle sits in, and the hanger tab below it that carries the derailleur.
export function dropout() {
  const poly = [[-16, -10], [-10, 14], [14, 18], [26, 4], [30, -18], [20, -30], [6, -24]];
  const out = [S(Q.polyY(poly, DY, DY + 6), { tone: "mid", inner: Ln(k.pathOf(poly.map(([x, z]) => at([x * 0.78 + 3, DY + 6, z * 0.78 - 2])), true), { tone: "faint" }) })];
  out.push(S(Q.polyY([[12, -20], [30, -18], [30, -32], [18, -34]], DY + 6, DY + 10), { tone: "mid" }));
  out.push(S(L.solidOf([[0, 9], [3, 9], [4, 7.5, 1], [7, 7]], L.frameAlong([0, DY + 6, 0], [0, 1, 0]), P), { tone: "hi", crease: "none" }));
  out.push(S(L.disc(0, 2, 4.5, L.frameAlong([0, DY + 13, 0], [0, 1, 0]), P), { tone: "mid", crease: "lo" }));
  return out.join("");
}
