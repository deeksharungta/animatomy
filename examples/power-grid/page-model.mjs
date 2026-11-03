import { WIDTH, HEIGHT, C, P, OLLIE, VOLTA, BUN, MOCHI, ROO, PINCH } from "./model.mjs";
import { LAMPS } from "./panel.mjs";
import { REST, physics, thermal, verdict } from "./physics.mjs";
import { tools } from "./tools.mjs";
import { spinning, valveLive } from "./mv-spin.mjs";
import { breakerLive, isolatorLive } from "./mv-cb.mjs";
import { dials } from "./panel.mjs";
import { poses } from "./poses.mjs";
import { STEPS, views, FSET_IDLE, FSET_LOAD, V_SET } from "./story.mjs";
import { GLOW } from "./shaders.mjs";
import { glCamera } from "../../kit/gl.mjs";
import { iso } from "../../kit/iso-kit.mjs";

// The page script, part one: the numbers, the physics and who is on duty.
export const MODEL_SCRIPT = `
const P = ${JSON.stringify(P)};
const C = ${JSON.stringify({ ...C, FSET_IDLE })};
const CREW_SPEC = ${JSON.stringify({ ollie: OLLIE, volta: VOLTA, bun: BUN, mochi: MOCHI, roo: ROO, pinch: PINCH })};
const STEP_INFO = ${JSON.stringify(STEPS.map(({ title, text, who, hold, pace }) => ({ title, text, who, hold, pace })))};
const VIEWS = ${JSON.stringify(views.map((v) => v.map((n) => +n.toFixed(2))))};
const COLORS = ${JSON.stringify(STEPS.map((s) => s.color))};
const CAMERA = ${JSON.stringify(glCamera(P))};
const GLOW = ${JSON.stringify(GLOW)};
const SIZE = [${WIDTH}, ${HEIGHT}];
const LAMP_PTS = ${JSON.stringify(LAMPS.map((p) => iso(p, P).map((v) => +v.toFixed(2))))};
const FSET_IDLE = ${FSET_IDLE}, FSET_LOAD = ${FSET_LOAD}, V_SET = ${V_SET};
const K = { iso, pathOf, segment, ring, cylinder, slabOf, coil, onTop, solidSvg, lineSvg, dotsSvg, fadedSvg, translateAlong, ...CREW, ...LATHE };
${[physics, thermal, verdict, tools, spinning, valveLive, breakerLive, isolatorLive, dials, poses].map((fn) => fn.toString()).join("\n")}
const T = tools(K, P);
const REST = ${JSON.stringify({ ...REST, wantClose: false, wantOpen: false, mode: "run" })};
const S = { ...REST };
// Model seconds per real second, beat by beat, and the transformer's thermal clock beside it.
const WARP = [1, 120, 1, 1, 3, 1, 1, 0.02, 1, 120];
const HEAT = [1, 1, 1, 1, 30, 3000, 1, 1, 1, 3000];
let beat = 0;
function step(dt) {
  S.stepT += dt;
  if (S.mode === "run") { S.warp = WARP[beat]; S.heat = HEAT[beat]; }
  const before = { lift: S.lift, f: S.f, If: S.If, lock: S.lock, cb: S.cb, ds: S.ds, pump: S.pump };
  // You press close once the pointer comes round to just before twelve and the synchro-check agrees.
  if (S.wantClose && !S.cbCmd && !S.closed) {
    const ang = (S.phi * 180) / Math.PI;
    if (!verdict(C, S) && ang > -3 && ang < 0.5) { S.cbCmd = "close"; S.cbT = 0; S.wantClose = false; }
  }
  if (S.wantOpen && S.lock < 0.08) { S.dsT = 1; S.wantOpen = false; }
  physics(C, S, dt);
  thermal(C, S, dt);
  S.hop = S.cbCmd === "open" || (S.hop > 0 && S.hopT < 0.5) ? Math.min(1, S.hop + dt / 0.12) : S.hop * Math.exp(-dt / 0.25);
  S.hopT = S.cbCmd === "open" ? 0 : (S.hopT ?? 1) + dt;
  if (S.hop < 0.01) S.hop = 0;
  if (S.E > 0.3 && !S.synced && !S.closed) S.ptr = S.phi;
  // Who is on duty: the operator of whichever part is moving most, so a stop hands the light back.
  const r = Math.max(dt, 1e-3), rate = {
    roo: (Math.abs(S.cb - before.cb) / r) * 4 + S.hop * 2,
    pinch: (Math.abs(S.lock - before.lock) / r) * 2 + S.dsTry * 3,
    volta: Math.abs(S.If - before.If) / r / 200,
    ollie: (Math.abs(S.lift - before.lift) / r) * 6 + Math.abs(S.f - before.f) / r / 3,
    squad: (Math.abs(S.pump - before.pump) / r) * 3 + (S.pump > 0.5 ? 0.13 : 0),
  };
  let best = "", top = 0.12;
  for (const [k, v] of Object.entries(rate)) if (v > top) { best = k; top = v; }
  S.duty = best;
  const dsMoving = Math.abs(S.ds - before.ds) / r > 0.02;
  S.lit = S.duty ? "" : dsMoving || S.ds > 0.5 ? "ds" : S.closed ? "cb" : S.f > 1 ? "valve" : "lock";
}
`;
