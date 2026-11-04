import { WIDTH, HEIGHT, C, P, PINCH, ROO, VOLTA } from "./model.mjs";
import { dynamic } from "./moving.mjs";
import { poses } from "./crew.mjs";
import { rest, simStep } from "./sim.mjs";
import { STEPS, views } from "./story.mjs";
import { FRAG, BOX } from "./shaders.mjs";
import { glCamera } from "../../kit/gl.mjs";
import { RUN } from "./page-run.mjs";

// The page script: the numbers, the model and the drawing, then the run (page-run.mjs).
export const pageScript = () => `
const P = ${JSON.stringify(P)};
const C = ${JSON.stringify(C)};
const PINCH = ${JSON.stringify(PINCH)}, ROO = ${JSON.stringify(ROO)}, VOLTA = ${JSON.stringify(VOLTA)};
const STEP_INFO = ${JSON.stringify(STEPS.map(({ title, text, who, hold, pace }) => ({ title, text, who, hold, pace })))};
const VIEWS = ${JSON.stringify(views.map((v) => v.map((n) => +n.toFixed(2))))};
const COLORS = ${JSON.stringify(STEPS.map((s) => s.color))};
const CAMERA = ${JSON.stringify(glCamera(P))};
const FRAG = ${JSON.stringify(FRAG)}, GL_BOX = ${JSON.stringify(BOX)};
const SIZE = [${WIDTH}, ${HEIGHT}];
const K = { iso, pathOf, segment, ring, cylinder, slabOf, solidSvg, lineSvg, dotsSvg, translateAlong, ...CREW };
const dynamic = ${dynamic.toString()};
const poses = ${poses.toString()};
const rest = ${rest.toString()};
const simStep = ${simStep.toString()};
const REST = rest(C);
const S = JSON.parse(JSON.stringify(REST));
// Model seconds per real second, beat by beat: the block takes minutes to warm and half an hour to cool.
const WARP = [1, 1, 45, 1, 1, 1, 1, 5, 420];
let beat = 0;
const step = (dt) => simStep(S, C, dt, WARP[beat] * dt);
${RUN}`;
