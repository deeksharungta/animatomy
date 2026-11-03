import { WIDTH, HEIGHT, C, K, P, PEN } from "./model.mjs";
import * as M from "./mech.mjs";
import { facetKit } from "./facets.mjs";
import { drawn } from "./moving.mjs";
import { poses } from "./poses.mjs";
import { STEPS, views, rest, TARGET, FOCUS, ROCKY, ROO } from "./story.mjs";

const fns = [M.ribEdge, M.crown, M.cutDepth, M.cutAngle, M.ceilingOf, M.restOf, M.advance, M.stepModel, facetKit, drawn, poses];

// The page script, part one: the numbers, the mechanism and the model's step with who is on duty.
export const MODEL_SCRIPT = `
const P = ${JSON.stringify(P)};
const C = ${JSON.stringify(C)};
const KC = ${JSON.stringify(K)};
const PEN = ${JSON.stringify(PEN)};
const SPEC = ${JSON.stringify({ rocky: ROCKY, roo: ROO })};
const STEP_INFO = ${JSON.stringify(STEPS.map(({ title, text, who, hold, pace }) => ({ title, text, who, hold, pace })))};
const VIEWS = ${JSON.stringify(views.map((v) => v.map((n) => +n.toFixed(2))))};
const COLORS = ${JSON.stringify(STEPS.map((s) => s.color))};
const TARGET = ${JSON.stringify(TARGET)}, FOCUS = ${JSON.stringify(FOCUS)};
const SIZE = [${WIDTH}, ${HEIGHT}];
${fns.map((f) => f.toString()).join("\n")}
const X = { iso, pathOf, segment, solidSvg, lineSvg, dotsSvg, fadedSvg, depthOf, cameraOf, ...CREW };
const F = facetKit(X, P, PEN);
const REST = ${JSON.stringify(rest())};
const S = { ...REST };
function step(dt) {
  stepModel(S, dt, KC);
  const moving = Math.abs(S.hV) > 0.05 || Math.abs(S.uV) > 0.02;
  const w = (((S.uc - 1) % 2) + 2) % 2, nearNotch = w < 0.57 || w > 1.77;
  const on = { rocky: moving && nearNotch, roo: moving };
  S.duty = S.focus && on[S.focus] ? S.focus : "";
  S.lit = S.duty ? "" : "button";
}
`;
