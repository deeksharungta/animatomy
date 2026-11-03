import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, Dt, V } from "./model.mjs";
import { tubePieces, tubeSvg } from "../../kit/tube.mjs";

const alongY = (x, y, z) => L.frameOf([x, y, z], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
export const tube = (pts, r, tone = "mid", bend = 6) => tubePieces(L.fillet(pts, bend, 8), r, P, { maxLength: 600, spacing: 1 }).map((p) => tubeSvg(p, { tone })).join("");

// The hub behind the cassette: its shell, the drive-side flange and the spokes that leave it for the rim.
export function hub() {
  const out = [S(L.solidOf([[-30, 16], [-4, 16], [-2, 19, 1], [0, 19]], alongY(0, 0, 0), P), { tone: "mid", crease: "none" })];
  const spokes = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + 0.13, b = a + (i % 2 ? 0.55 : -0.55);
    spokes.push(k.segment([22 * Math.cos(a), 4, 22 * Math.sin(a)], [311 * Math.cos(b), -1, 311 * Math.sin(b)], P));
  }
  out.push(Ln(spokes.join(""), { tone: "faint" }));
  out.push(S(L.disc(0, 3, 27, alongY(0, 2, 0), P), { tone: "mid", crease: "lo", inner: Ln(L.arcOf(alongY(0, 2, 0), 3, 22, P), { tone: "faint" }) }));
  out.push(Dt(L.dotsOf(alongY(0, 5, 0), 0, 22, 12, P, { all: true, phase: 0.13 }), { size: 0.6, tone: "lo" }));
  return out.join("");
}

// The rim and tyre, a hoop round the wheel's centre plane; only its lower rear arc shows in the card.
export function rim() {
  const pts = Array.from({ length: 73 }, (_, i) => { const a = (i / 72) * Math.PI * 2; return [311 * Math.cos(a), -1, 311 * Math.sin(a)]; });
  const tyre = pts.map(([x, , z]) => [x * 1.075, -1, z * 1.075]);
  return tube(tyre, 15, "lo", 0) + tube(pts, 9, "mid", 0);
}

// One cog: a thin steel disc with chamfered teeth; its teeth are drawn on top each frame as it turns.
export function cog(i) {
  const r = C.R[i] + 1.9, F = alongY(0, C.Y[i], 0);
  const inner = i >= 7 ? Ln(L.circleOf(alongY(0, C.Y[i] + C.COG_T, 0), 0, r - 9, P), { tone: "faint" }) : "";
  return S(L.disc(0, C.COG_T, r, F, P), { tone: "hi", crease: "lo", inner }) + (i >= 7 ? Dt(L.dotsOf(alongY(0, C.Y[i] + C.COG_T, 0), 0, r - 14, 6, P, { all: true, phase: 0.3 }), { size: 0.7, tone: "lo" }) : "");
}

// The lockring that holds the cogs on the freehub, and the axle's end through it.
export function lockring() {
  const y = C.Y[0] + C.COG_T, F = alongY(0, y, 0);
  return S(L.disc(0, 2.4, 17, F, P), { tone: "mid", crease: "lo", inner: Ln(L.arcOf(F, 1.2, 17, P), { tone: "faint" }) }) +
    Dt(L.dotsOf(alongY(0, y + 2.4, 0), 0, 13, 12, P, { all: true }), { size: 0.55, tone: "lo" }) +
    S(L.disc(0, 16, 7.5, alongY(0, y + 2.4, 0), P), { tone: "hi", crease: "lo" });
}
