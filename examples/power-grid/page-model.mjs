import { WIDTH, HEIGHT, C, P, at, MO, VOLTA, CRUMB, ROO, PINCH } from "./model.mjs";
import { LAMPS } from "./desk.mjs";
import { REST, physics, verdict } from "./physics.mjs";
import { tools } from "./tools.mjs";
import { govGeom, governor, spinning } from "./moving-gov.mjs";
import { breaker } from "./moving-cb.mjs";
import { isolator, instruments } from "./moving-ds.mjs";
import { poses } from "./poses.mjs";
import { STEPS, views, FSET_IDLE, FSET_LOAD, V_SET } from "./story.mjs";
import { GLOW } from "./shaders.mjs";
import { glCamera } from "../../kit/gl.mjs";

// The page script, part one: the numbers, the physics and the beats' targets.
export const MODEL_SCRIPT = `
const P = ${JSON.stringify(P)};
const C = ${JSON.stringify(C)};
const CREW_SPEC = ${JSON.stringify({ mo: MO, volta: VOLTA, crumb: CRUMB, roo: ROO, pinch: PINCH })};
const STEP_INFO = ${JSON.stringify(STEPS.map(({ title, text, who, hold, pace }) => ({ title, text, who, hold, pace })))};
const VIEWS = ${JSON.stringify(views.map((v) => v.map((n) => +n.toFixed(2))))};
const COLORS = ${JSON.stringify(STEPS.map((s) => s.color))};
const CAMERA = ${JSON.stringify(glCamera(P))};
const GLOW = ${JSON.stringify(GLOW)};
const SIZE = [${WIDTH}, ${HEIGHT}];
const LAMP_PTS = ${JSON.stringify(LAMPS.map((p) => at(p).map((v) => +v.toFixed(2))))};
const FSET_IDLE = ${FSET_IDLE}, FSET_LOAD = ${FSET_LOAD}, V_SET = ${V_SET};
const K = { iso, pathOf, segment, ring, cylinder, slabOf, coil, solidSvg, lineSvg, dotsSvg, translateAlong, ...CREW };
${[physics, verdict, tools, govGeom, governor, spinning, breaker, isolator, instruments, poses].map((fn) => fn.toString()).join("\n")}
const T = tools(K, P);
const REST = ${JSON.stringify({ ...REST, wantClose: false, mode: "run" })};
const S = { ...REST };
// Model seconds per real second, beat by beat: the run-up takes minutes, the breaker acts in milliseconds.
const WARP = [1, 45, 1, 1, 1, 3, 1, 0.02, 1, 120];
let beat = 0, last = null;
function step(dt) {
  S.stepT += dt;
  if (S.mode === "run") S.warp = WARP[beat];
  const before = { zs: last ? last.zs : 0, zv: last ? last.zv : 0, If: S.If, lock: S.lock, cb: S.cb, ds: S.ds, ptr: S.ptr };
  // You press close once the pointer comes round to just before twelve and the synchro-check agrees.
  if (S.wantClose && !S.cbCmd && !S.closed) {
    const ang = (S.phi * 180) / Math.PI;
    if (!verdict(C, S) && ang > -3 && ang < 0.5) { S.cbCmd = "close"; S.cbT = 0; S.wantClose = false; }
  }
  const wasClosing = S.cbCmd === "close";
  physics(C, S, dt);
  if (wasClosing) S.chg = Math.min(S.chg, 1 - S.cb);
  else if (S.chg < 1) S.chg = Math.min(1, S.chg + (dt * S.warp) / 8);
  S.hop = S.cbCmd === "open" || (S.hop > 0 && S.hopT < 0.5) ? Math.min(1, S.hop + dt / 0.12) : S.hop * Math.exp(-dt / 0.25);
  S.hopT = S.cbCmd === "open" ? 0 : (S.hopT ?? 1) + dt;
  if (S.hop < 0.01) S.hop = 0;
  if (S.E > 0.3 && !S.synced && !S.closed) S.ptr = S.phi;
  // Who is on duty: the operator of whichever part is moving most, so a stop hands the light back.
  const g = govGeom(C, S);
  last = g;
  const r = Math.max(dt, 1e-3), rate = {
    roo: (Math.abs(S.cb - before.cb) / r) * 4 + S.hop * 2,
    pinch: (Math.abs(S.lock - before.lock) / r) * 2 + S.dsTry * 3,
    volta: Math.abs(S.If - before.If) / r / 20,
    mo: (Math.abs(g.zs - before.zs) + Math.abs(g.zv - before.zv)) / r,
    crumb: S.synced || S.closed ? 0 : Math.abs(S.ptr - before.ptr) / r > 0.05 && Math.abs(S.ptr - before.ptr) < 1 ? 0.3 : 0,
  };
  let best = "", top = 0.12;
  for (const [k, v] of Object.entries(rate)) if (v > top) { best = k; top = v; }
  S.duty = best;
  const dsMoving = Math.abs(S.ds - before.ds) / r > 0.02;
  S.lit = S.duty ? "" : dsMoving || S.ds > 0.5 ? "ds" : S.closed ? "cb" : S.f > 1 ? "lever" : "sleeve";
}
`;
