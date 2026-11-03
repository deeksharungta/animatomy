import { C } from "./model.mjs";

// The mould's cavities in the cut plane y = 0, as (x, z) outlines. The SVG draws them, clips the steel to them,
// and the shader tests the same points, so the glow registers with the lines.
const xs = C.SPRUE.x, cx = C.CX, cs = C.CAST, R = C.RISER, V = C.VENT;
const rt = C.SPRUE.rt, rb = C.SPRUE.rb, br = C.BASIN.r;
const fL = cx - cs.rf, wL = cx - cs.ro, iL = cx - cs.ri, iR = cx + cs.ri, wR = cx + cs.ro, fR = cx + cs.rf;
const z0 = cs.z0, z1 = cs.z1, ft = cs.ft, top = C.Z.cup, cope = C.Z.top;
const rx0 = R.x - R.r, rx1 = R.x + R.r, neck = 4, bk = 2; // the breaker core's neck radius and thickness

// Gating, basin, vent and the left half of the casting, as one outline.
export const LEFT = [
  [xs - br, top], [xs - br * 0.74, 91.2], [xs - rt, C.SPRUE.z1], [xs - rb, C.SPRUE.z0],
  [C.WELL.x0, C.WELL.z1], [C.WELL.x0, C.WELL.z0], [C.WELL.x1, C.WELL.z0], [C.WELL.x1, C.RUN.z0],
  [C.RUN.x1, C.RUN.z0], [C.RUN.x1, C.RUN.z1], [C.GATE.x1, C.RUN.z1], [C.GATE.x1, z0],
  [iL, z0], [iL, z1], [V.x + V.r, z1], [V.x + V.r, cope], [V.x - V.r, cope], [V.x - V.r, z1], [fL, z1], [fL, z1 - ft],
  [wL, z1 - ft], [wL, z0 + ft], [fL, z0 + ft], [fL, z0], [C.GATE.x0, z0], [C.GATE.x0, C.RUN.z1],
  [xs + rb, C.SPRUE.z0], [xs + rt, C.SPRUE.z1], [xs + br * 0.74, 91.2], [xs + br, top],
];
// The right half of the casting and the riser above it, through the breaker core's neck.
export const RIGHT = [
  [iR, z0], [fR, z0], [fR, z0 + ft], [wR, z0 + ft], [wR, z1 - ft], [fR, z1 - ft], [fR, z1],
  [R.x + neck, z1], [R.x + neck, z1 + bk], [rx1, z1 + bk], [rx1, top], [rx0, top], [rx0, z1 + bk],
  [R.x - neck, z1 + bk], [R.x - neck, z1], [iR, z1],
];
// The core and its prints, with the vent channel up its middle and on through the cope.
export const CORE = [[iL, C.CORE.z0], [iR, C.CORE.z0], [iR, C.CORE.z1], [iL, C.CORE.z1]];
export const CORE_VENT = { x: cx, r: 0.8, z0: C.CORE.z0 + 2, z1: cope };
// The breaker core under the riser: a sand ring whose neck lets the riser feed the casting.
export const BREAKER = [
  [[iR, z1], [R.x - neck, z1], [R.x - neck, z1 + bk], [iR, z1 + bk]],
  [[R.x + neck, z1], [R.x + neck + 6, z1], [R.x + neck + 6, z1 + bk], [R.x + neck, z1 + bk]],
];
// Cope bars: steel ribs across the cope that hold its sand in, cut where they cross y = 0.
export const BARS = [-30, -14, 2].map((x) => ({ x0: x - 0.8, x1: x + 0.8, z0: 66.5, z1: cope }));
export const SIZES = { xs, rt, rb, br, cx, iL, iR, wL, wR, fL, fR, z0, z1, rx0, rx1, neck, bk, top, cope };

// Where the steel stands for a given state: the runner's front, the ingate's level, the casting's, the riser's.
export function fillOf(C, GEO, S, levelZ) {
  const vg = GEO.vGate, wellV = 0.12 * vg, runV = 0.78 * vg;
  const v = S.vm, out = {};
  out.front = v <= wellV ? C.WELL.x0 + 0.01 : Math.min(C.RUN.x1, C.WELL.x0 + (C.RUN.x1 - C.WELL.x0) * Math.min(1, (v - wellV) / runV));
  out.runZ = v <= wellV ? C.WELL.z0 + (C.RUN.z1 - C.WELL.z0) * (v / wellV) : C.RUN.z1;
  out.gate = v <= wellV + runV ? C.RUN.z1 : Math.min(C.GATE.z1 + 0.01, C.RUN.z1 + (C.GATE.z1 - C.RUN.z1) * ((v - wellV - runV) / (vg - wellV - runV)));
  const z = levelZ(C, GEO, v);
  out.cast = v <= vg ? C.CAST.z0 : Math.min(C.CAST.z1 + 2, z);
  // What the riser feeds the casting leaves a pipe in its top: a funnel as deep as the model's pipe, as wide
  // as the riser's first skin.
  out.riser = z <= C.CAST.z1 ? C.CAST.z1 : Math.min(C.RISER.z1, z);
  out.rl = C.RISER.r * 0.94;
  out.pipe = S.pipe;
  out.basin = C.BASIN.z0 + (S.vb / GEO.aBasin) / (C.MM / 1000);
  const hb = S.vb / GEO.aBasin;
  out.sprue = S.tc >= 0 && !S.short ? 1 : S.qo > 0.001 ? (hb > 0.002 ? 1 : Math.min(1, Math.sqrt(S.qo / 2.5))) : 0;
  out.has = Math.min(1, v / (0.02 * vg));
  return out;
}
