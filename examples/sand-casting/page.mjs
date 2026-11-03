import { glCamera } from "../../kit/gl.mjs";
import { WIDTH, HEIGHT, C, PH, GEO, P, PINCH, OLLIE } from "./model.mjs";
import { fresh, headOver, flowOf, tiltFor, advance, levelZ, hookFor } from "./physics.mjs";
import { fillOf } from "./section.mjs";
import { steelPath, poses } from "./moving.mjs";
import { ladle } from "./ladle.mjs";
import { STEPS, views } from "./story.mjs";
import { GLOW, INK_STOPS } from "./shaders.mjs";
import { RUN_SCRIPT } from "./page-run.mjs";
import { DRAW_SCRIPT } from "./page-draw.mjs";

// The page script, part one: the numbers and the model, inlined from the same modules the build uses.
export const pageScript = () => `
const P = ${JSON.stringify(P)}, C = ${JSON.stringify(C)}, PH = ${JSON.stringify(PH)}, GEO = ${JSON.stringify(GEO)};
const PINCH = ${JSON.stringify(PINCH)}, OLLIE = ${JSON.stringify(OLLIE)};
const STEP_INFO = ${JSON.stringify(STEPS.map(({ title, text, who, hold, pace }) => ({ title, text, who, hold, pace })))};
const VIEWS = ${JSON.stringify(views.map((v) => v.map((n) => +n.toFixed(2))))};
const COLORS = ${JSON.stringify(STEPS.map((s) => s.color))};
const CAMERA = ${JSON.stringify(glCamera(P))}, SIZE = [${WIDTH}, ${HEIGHT}];
const GLOW = ${JSON.stringify(GLOW)}, INK_STOPS = ${JSON.stringify(INK_STOPS)};
const K = { iso, pathOf, segment, solidSvg, lineSvg, dotsSvg, translateAlong, depthOf, ...CREW };
${fresh.toString()}
${headOver.toString()}
const flowOf = ${flowOf.toString()};
${tiltFor.toString()}
${advance.toString()}
${levelZ.toString()}
${hookFor.toString()}
${fillOf.toString()}
${steelPath.toString()}
${poses.toString()}
${ladle.toString()}
// Model seconds per real second, beat by beat: the pour runs in real time, the freezing and cooling faster.
const WARP = [1, 1, 1, 1, 1, 1, 12, 30, 400];
let beat = 0;
const S = { ...fresh(PH), stepT: 0, swap: -1, fade: 1 };
function step(dt, warp = WARP[beat]) {
  S.stepT += dt;
  const w = dt * warp, n = Math.max(1, Math.ceil(w / (S.tc < 0 ? 1 / 30 : 1)));
  for (let i = 0; i < n; i++) advance(C, PH, GEO, S, w / n, dt / n);
  if (S.swap >= 0) {
    S.swap += dt / 0.9;
    if (S.swap >= 0.5 && S.vm > 0) { const keep = { stepT: S.stepT, swap: S.swap }; Object.assign(S, fresh(PH), keep); }
    S.fade = Math.abs(Math.cos(Math.PI * Math.min(1, S.swap)));
    if (S.swap >= 1) { S.swap = -1; S.fade = 1; }
  }
}
${DRAW_SCRIPT}
${RUN_SCRIPT}
`;
