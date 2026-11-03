import { WIDTH, HEIGHT, C, P, ROO, MO } from "./model.mjs";
import * as G from "./geo.mjs";
import { partsKit, chainSvg } from "./moving.mjs";
import { drawn } from "./drawn.mjs";
import { turning } from "./turning.mjs";
import { stepModel } from "./sim.mjs";
import { poses } from "./poses.mjs";
import { STEPS, views, rest, TARGET, FOCUS } from "./story.mjs";

const fns = [G.linkage, G.lerpCog, G.tangent, G.chainLoop, G.chainLength, G.solvePhi, G.pointAt, partsKit, chainSvg, drawn, turning, stepModel, poses];

// The page script, part one: the numbers, the geometry and the model's step with who is on duty.
export const MODEL_SCRIPT = `
const P = ${JSON.stringify(P)};
const C = ${JSON.stringify(C)};
const SPEC = ${JSON.stringify({ roo: ROO, mo: MO })};
const STEP_INFO = ${JSON.stringify(STEPS.map(({ title, text, who, hold, pace }) => ({ title, text, who, hold, pace })))};
const VIEWS = ${JSON.stringify(views.map((v) => v.map((n) => +n.toFixed(2))))};
const COLORS = ${JSON.stringify(STEPS.map((s) => s.color))};
const TARGET = ${JSON.stringify(TARGET)}, FOCUS = ${JSON.stringify(FOCUS)};
const SIZE = [${WIDTH}, ${HEIGHT}];
${fns.map((f) => f.toString()).join("\n")}
const K = { iso, pathOf, segment, solidSvg, lineSvg, dotsSvg, depthOf, ...CREW };
const GG = { linkage, lerpCog, tangent, chainLoop, chainLength, solvePhi, pointAt, chainSvg };
const Q = partsKit(K, P, C);
const REST = ${JSON.stringify(rest())};
const S = { ...REST };
function step(dt) {
  stepModel(S, dt, C, GG);
  const moving = { roo: Math.abs(S.psiV) > 0.04, mo: Math.abs(S.phiV) > 0.02 };
  // In a beat only its actor can be on duty; when the reader shifts by hand, whichever spring is moving is.
  S.duty = S.focus === "any" ? (moving.roo ? "roo" : moving.mo ? "mo" : "") : S.focus && moving[S.focus] ? S.focus : "";
  S.lit = S.duty ? "" : "cage";
}
`;
