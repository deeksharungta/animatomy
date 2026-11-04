import { WIDTH, HEIGHT, C, P, VOLTA, EMBER, ROO } from "./model.mjs";
import { NODES, heatStep, heatRun } from "./thermal.mjs";
import { dynamic, poses } from "./moving.mjs";
import { STEPS, views, rest } from "./story.mjs";
import { HEAT, HEAT_BOX } from "./shaders.mjs";
import { glCamera } from "../../kit/gl.mjs";

// The page script, part one: the numbers, and the model that heats the tip and works the Curie switch.
export const MODEL_SCRIPT = `
const P = ${JSON.stringify(P)};
const C = ${JSON.stringify(C)};
const N = ${JSON.stringify(NODES)};
const VOLTA = ${JSON.stringify(VOLTA)}, EMBER = ${JSON.stringify(EMBER)}, ROO = ${JSON.stringify(ROO)};
const STEP_INFO = ${JSON.stringify(STEPS.map(({ title, text, who, hold, pace }) => ({ title, text, who, hold, pace })))};
const VIEWS = ${JSON.stringify(views.map((v) => v.map((n) => +n.toFixed(2))))};
const COLORS = ${JSON.stringify(STEPS.map((s) => s.color))};
const CAMERA = ${JSON.stringify(glCamera(P))};
const HEAT = ${JSON.stringify(HEAT)}, HEAT_BOX = ${JSON.stringify(HEAT_BOX)};
const SIZE = [${WIDTH}, ${HEIGHT}];
const K = { iso, pathOf, segment, ring, cylinder, slabOf, solidSvg, lineSvg, dotsSvg, translateAlong, ...CREW };
const dynamic = ${dynamic.toString()};
const poses = ${poses.toString()};
const heatStep = ${heatStep.toString()};
const heatRun = ${heatRun.toString()};
const REST = ${JSON.stringify(rest())};
const S = JSON.parse(JSON.stringify(REST));
// Model seconds per real second, beat by beat: the tip takes about 100 s to heat and 13 minutes to cool.
const WARP = [1, 1, 22, 2, 2.5, 2, 140];
let beat = 0;
const ease = (v, to, tau, dt) => v + (to - v) * (1 - Math.exp(-dt / tau));
function step(dt) {
  const w = WARP[beat] * dt, held0 = S.held, u0 = S.u;
  S.t += dt; S.stepT += dt;
  if (S.power || S.T[N.x.length - 1] > C.T0 + 1) S.clock += w;
  S.rocker = ease(S.rocker, S.power ? 1 : 0, 0.09, dt);
  if (Math.abs(S.rocker - (S.power ? 1 : 0)) < 0.004) S.rocker = S.power ? 1 : 0;
  heatRun(S, N, C, w, S.power);
  if (S.held && !held0 && S.power) S.cycles++;
  S.slug = S.T[0];
  // The magnet snaps back to the slug, or the spring snaps the rod back, in a few tens of milliseconds.
  const want = S.held ? 0 : -C.TRAVEL;
  S.u = ease(S.u, want, S.held ? 0.07 : 0.045, dt);
  if (Math.abs(S.u - want) < 0.01) S.u = want;
  S.rodV = (S.u - u0) / Math.max(dt, 1e-3);
  S.cur = ease(S.cur, S.power && S.held && S.u > -0.3 ? 1 : 0, 0.12, dt);
  if (S.cur < 0.03) S.cur = 0;
  // Roo is on duty while his spring holds the switch open; Ember as she presses it shut, and while she holds it
  // shut with the coil hot. With the coil still cold, the current is Volta's.
  if (S.rodV > 1.5) S.grabT = 0.7;
  S.grabT = Math.max(0, (S.grabT || 0) - dt);
  S.duty = !S.held ? "roo" : S.u < -0.3 || S.grabT > 0 ? "ember" : S.cur > 0.5 ? (S.TH > 60 ? "ember" : "volta") : "";
}
`;
