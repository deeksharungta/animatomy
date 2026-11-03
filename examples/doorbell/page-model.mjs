import { WIDTH, HEIGHT, C, P, KNOCK, ROCKY } from "./model.mjs";
import * as M from "./mech.mjs";
import { partsKit, drawn } from "./moving.mjs";
import { poses } from "./poses.mjs";
import { STEPS, views, rest, TARGET, SPEED, FOCUS } from "./story.mjs";

const fns = [M.camR, M.turn, M.gapOf, M.contactOf, M.hammerAt, M.advance, M.stepModel, partsKit, drawn, poses];

// The page script, part one: the numbers, the mechanism and the model's step with who is on duty.
export const MODEL_SCRIPT = `
const P = ${JSON.stringify(P)};
const C = ${JSON.stringify(C)};
const SPEC = ${JSON.stringify({ knock: KNOCK, rocky: ROCKY })};
const STEP_INFO = ${JSON.stringify(STEPS.map(({ title, text, who, hold, pace }) => ({ title, text, who, hold, pace })))};
const VIEWS = ${JSON.stringify(views.map((v) => v.map((n) => +n.toFixed(2))))};
const COLORS = ${JSON.stringify(STEPS.map((s) => s.color))};
const TARGET = ${JSON.stringify(TARGET)}, SPEED = ${JSON.stringify(SPEED)}, FOCUS = ${JSON.stringify(FOCUS)};
const SIZE = [${WIDTH}, ${HEIGHT}];
${fns.map((f) => f.toString()).join("\n")}
const K = { iso, pathOf, segment, solidSvg, lineSvg, dotsSvg, depthOf, ...CREW };
const M = { camR, turn, gapOf, contactOf, hammerAt };
const Q = partsKit(K, P, C);
const REST = ${JSON.stringify(rest())};
const S = { ...REST };
function step(dt) {
  stepModel(S, dt, C);
  const moving = {
    knock: Math.abs(S.aV) > 0.3 || (S.a < -0.01 && Math.abs(S.thV) > 0.01) || S.ring > 0.5,
    rocky: Math.abs(S.cV) > 0.05 || (S.jam && S.stepT < 3),
  };
  S.duty = S.focus && moving[S.focus] ? S.focus : "";
  S.lit = S.duty ? "" : "gong";
}
`;
