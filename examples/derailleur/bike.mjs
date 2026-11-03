import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, Dt } from "./model.mjs";
import { tubePieces, tubeSvg } from "../../kit/tube.mjs";

export const alongY = (x, y, z) => L.frameOf([x, y, z], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
export const tube = (pts, r, tone = "mid", bend = 6) => tubePieces(L.fillet(pts, bend, 8), r, P, { maxLength: 600, spacing: 1 }).map((p) => tubeSvg(p, { tone })).join("");
const hoop = (r, y, n = 96) => Array.from({ length: n + 1 }, (_, i) => { const a = (i / n) * Math.PI * 2; return [r * Math.cos(a), y, r * Math.sin(a)]; });

// The hub's far flange, behind the wheel's plane, and the axle end through the far dropout.
export function hubFar() {
  return S(L.disc(0, 3, 27, alongY(0, -35, 0), P), { tone: "lo", crease: "lo" }) + Dt(L.dotsOf(alongY(0, -32, 0), 0, 22, 14, P, { all: true, phase: 0.35 }), { size: 0.55, tone: "lo" });
}

// The hub's shell between its flanges, and the drive-side flange the near spokes leave.
export function hubShell() {
  return S(L.solidOf([[-32, 15], [-26, 13, 1], [-12, 12.5, 1], [-4, 15, 1], [0, 18]], alongY(0, 0, 0), P), { tone: "mid", crease: "none" });
}
export function hubNear() {
  return S(L.disc(0, 3, 27, alongY(0, 2, 0), P), { tone: "mid", crease: "lo", inner: Ln(L.arcOf(alongY(0, 2, 0), 3, 22, P), { tone: "faint" }) }) +
    Dt(L.dotsOf(alongY(0, 5, 0), 0, 22, 14, P, { all: true, phase: 0.13 }), { size: 0.6, tone: "lo" }) +
    // The freehub body between the flange and the biggest cog, splined to carry the cassette.
    S(L.disc(0, C.Y[10] - 5, 17, alongY(0, 5, 0), P), { tone: "lo", crease: "lo", inner: Ln(L.ribsOf(alongY(0, 5, 0), 0.4, C.Y[10] - 5.4, 17, 18, P, { seams: true }), { tone: "faint" }) });
}

// The rim, a box-section hoop with its brake track, and the tyre round it with a ridge down its tread.
export function rim() {
  const W = C.WHEEL;
  return tube(hoop(W.tyre, -1), 15, "lo", 0) + Ln(k.pathOf(hoop(W.tyre, 13, 144).map(at)), { tone: "faint" }) +
    tube(hoop(W.rim, -1), 9, "mid", 0) + Ln(k.pathOf(hoop(W.rim + 3, 7.6, 144).map(at)), { tone: "faint" });
}

// One cog: a thin steel disc with chamfered teeth; its teeth are drawn on top each frame as it turns. The five
// biggest ride on a spider, so they carry its windows; the smaller ones show the spacer's edge inside them.
export function cog(i) {
  const r = C.R[i] + 1.9, F = alongY(0, C.Y[i], 0), face = alongY(0, C.Y[i] + C.COG_T, 0);
  const inner = Ln(L.circleOf(face, 0, i >= 6 ? r - 9 : r - 5.5, P), { tone: "faint" });
  const holes = i >= 6 ? Dt(L.dotsOf(face, 0, r - 14, i >= 8 ? 10 : 6, P, { all: true, phase: 0.3 + i * 0.1 }), { size: 0.7, tone: "lo" }) : "";
  return S(L.disc(0, C.COG_T, r, F, P), { tone: "hi", crease: "lo", inner }) + holes;
}

// The lockring that holds the cogs on the freehub, its twelve tool splines, and the axle end through it.
export function lockring() {
  const y = C.Y[0] + C.COG_T, F = alongY(0, y, 0), top = alongY(0, y + 2.4, 0);
  const splines = Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return k.segment([10.5 * Math.cos(a), y + 2.4, 10.5 * Math.sin(a)], [13.6 * Math.cos(a), y + 2.4, 13.6 * Math.sin(a)], P); }).join("");
  return S(L.disc(0, 2.4, 17, F, P), { tone: "mid", crease: "lo", inner: Ln(L.arcOf(F, 1.2, 17, P), { tone: "faint" }) + Ln(L.circleOf(top, 0, 13.6, P), { tone: "lo" }) + Ln(L.circleOf(top, 0, 10.5, P), { tone: "lo" }) + Ln(splines, { tone: "lo" }) }) +
    S(L.disc(0, 16, 7.5, top, P), { tone: "hi", crease: "lo", inner: Ln(L.circleOf(alongY(0, y + 18.4, 0), 0, 4, P), { tone: "lo" }) });
}
