import { WIDTH, HEIGHT, C, P, ROO, PINCH, ROCKY } from "./model.mjs";
import * as M from "./mech.mjs";
import { partsKit, drawn } from "./moving.mjs";
import { poses } from "./poses.mjs";
import { STEPS, views, rest, FOCUS, TARGET } from "./story.mjs";

const fns = [M.driveOf, M.advance, M.stepModel, M.anglesOf, partsKit, drawn, poses];

// The page script, part one: the numbers, the mechanism and the model's step with who is on duty.
export const MODEL_SCRIPT = () => `
const P = ${JSON.stringify(P)};
const C = ${JSON.stringify(C)};
const SPEC = ${JSON.stringify({ roo: ROO, pinch: PINCH, rocky: ROCKY })};
const STEP_INFO = ${JSON.stringify(STEPS.map(({ title, text, who, hold, pace }) => ({ title, text, who, hold, pace })))};
const VIEWS = ${JSON.stringify(views.map((v) => v.map((n) => +n.toFixed(2))))};
const COLORS = ${JSON.stringify(STEPS.map((s) => s.color))};
const FOCUS = ${JSON.stringify(FOCUS)}, TARGET = ${JSON.stringify(TARGET)};
const SIZE = [${WIDTH}, ${HEIGHT}];
${fns.map((f) => f.toString()).join("\n")}
const K = { iso, pathOf, segment, solidSvg, lineSvg, dotsSvg, fadedSvg, depthOf, translateAlong, ...CREW };
const M = { anglesOf };
const Q = partsKit(K, P);
const REST = ${JSON.stringify(rest())};
const S = { ...REST };
function step(dt) {
  stepModel(S, dt, C);
  const moving = { pinch: S.keyV > 0, rocky: Math.abs(S.brakeV) > 0.05, roo: S.v > 0.01 };
  S.duty = S.focus && moving[S.focus] ? S.focus : moving.roo ? "roo" : "";
  S.lit = S.duty ? "" : "barrel";
}
`;
