import { fitView } from "../../kit/steps.mjs";
import { checkReach, worstReach } from "../../kit/reach.mjs";
import { WIDTH, HEIGHT, C, P, K, at, OLLIE, ROO, PINCH, ROLE } from "./model.mjs";
import { REST } from "./physics.mjs";
import { tools } from "./tools.mjs";
import { valveLive } from "./mv-spin.mjs";
import { breakerLive, isolatorLive } from "./mv-cb.mjs";
import { poses } from "./poses.mjs";

// Every number in the captions is computed here from the model's constants.
const loss = (f) => C.LOSS[0] * (f / 50) ** 2 + C.LOSS[1] * (f / 50);
export const F_IDLE = 50.05, V_SET = 1.01;
export const FSET_IDLE = F_IDLE + (loss(F_IDLE) / C.MW_VALVE) * C.DROOP * 50;
export const FSET_LOAD = 50 + ((C.MW + loss(50)) / C.MW_VALVE) * C.DROOP * 50 + 0.01;
const kload = C.MW / C.MVA, E_LOAD = Math.hypot(V_SET, kload * C.XS);
const topOil = (pumps) => C.AMB + C.RISE * ((kload * kload * C.R + 1) / (C.R + 1)) * (pumps ? 1 : C.RISE_OFF);
export const N = {
  rpm: F_IDLE * 60, runup: F_IDLE / C.RAMP / 60, kv: V_SET * C.LV_KV, hv: V_SET * C.HV_KV, ifIdle: (C.IF0 * V_SET * 50) / F_IDLE,
  turn: 1 / (F_IDLE - 50), close: C.T_CLOSE * 1000, ifLoad: C.IF0 * E_LOAD, delta: (Math.atan2(kload * C.XS, V_SET) * 180) / Math.PI,
  lvA: (C.MW * 1e6) / (Math.sqrt(3) * C.LV_KV * 1e3), hvA: (C.MW * 1e6) / (Math.sqrt(3) * C.HV_KV * 1e3), copper: C.LOSS_LL * kload * kload,
  top: topOil(true), flow: C.PUMPS * C.PUMP_LS, halfCycle: 1000 / (2 * C.GRID_HZ), open: (C.OPEN * 180) / Math.PI, gapM: C.BLADE / 10,
  phaseKv: C.HV_KV / Math.sqrt(3), arcV: C.ARC_V0 + C.ARC_E * C.BLADE * 100, ratio: C.HV_KV / C.LV_KV,
};
const r0 = (v) => Math.round(v).toLocaleString("en-GB");

// Reach: Ollie on the crosshead over the whole stroke, Roo on the footplate open and closed, Pinch on the bolt's knob.
const T = tools(K, P);
export const posesOf = (s) => { const st = { ...REST, ...s }; return poses(C, st, valveLive(K, P, C, st, T), breakerLive(K, P, C, st, T), isolatorLive(K, P, C, st, T)); };
const ollie = [0, 0.25, 0.5, 0.75, 1].map((lift) => [`at lift ${lift}`, posesOf({ lift }).ollie]);
const pinch = [0, 0.5, 1].flatMap((lock) => [0, 0.6].map((dsTry) => [`with the bolt at ${lock}, crank slack ${dsTry}`, posesOf({ lock, dsTry }).pinch]));
export const reachWarnings = checkReach(OLLIE, ollie, P) + checkReach(PINCH, pinch, P);
export const worst = `Ollie ${worstReach(OLLIE, ollie, P).worst.toFixed(2)}, Pinch ${worstReach(PINCH, pinch, P).worst.toFixed(2)}`;
void ROO;

const hi = "var(--anatomy-hi)", V = C.VALVE, Z = C.DECK_Z, M = C.CBM, DM = C.DSM, PU = C.PUMP;
export const STEPS = [
  { title: "Meet the crew", who: "Ollie, Volta, Bun, Mochi, Roo and Pinch", color: hi, text: "Six animals run this unit: Ollie at the steam valve, Volta on the field, Bun and Mochi in the oil pump, Roo in the breaker, Pinch on the interlock.", points: null, hold: 1.6 },
  { title: "Ollie lets the steam in", who: "Ollie · fluid", color: ROLE.fluid, text: `You set the governor to ${r0(N.rpm)} rpm. Ollie heaves the valve open, and the steam runs the shaft up to ${F_IDLE} Hz in ${Math.round(N.runup)} minutes.`, points: [[V.x - 12, V.y, Z], [V.x + 10, V.y + 4, Z + 62], [-212, -18, 88], [-200, -18, 40]], least: 0.24 },
  { title: "Volta builds the voltage", who: "Volta · power", color: ROLE.power, text: `Volta's ${r0(N.ifIdle)} A runs through the slip rings into the rotor. The stator makes ${N.kv.toFixed(1)} kV, and the transformer lifts it to ${r0(N.hv)} kV.`, points: [[-48, 12, Z], [-76, -18, 74], [-100, -18, 84], [-63, -9, Z]], least: 0.24 },
  { title: "Roo closes the breaker", who: "Roo · spring", color: ROLE.spring, text: `The synchroscope creeps round once every ${Math.round(N.turn)} s. Just before twelve you press close: Roo stamps, and the spring drives the contacts home in ${N.close} ms.`, points: [[M.x - 2, M.y + M.d, M.z], [M.x + M.w + 2, M.y, M.z + M.h + 2], [C.CB.x + 16, C.PH[2], C.STAND + 42], [C.CB.x - 4, C.PH[2], C.STAND + 44]], least: 0.22 },
  { title: `Ollie puts on ${C.MW} MW`, who: "Ollie · fluid", color: ROLE.fluid, text: `You raise the setting. The grid holds the speed, so the valve opens wide: the rotor runs ${Math.round(N.delta)}° ahead and ${N.hvA.toFixed(0)} A flows at ${C.HV_KV} kV.`, points: [[V.x - 12, V.y + 6, Z], [V.x + 8, V.y, Z + 64], [-110, -18, 88], [-140, 8, 40]], least: 0.3 },
  { title: "Bun and Mochi pump the oil", who: "Bun and Mochi · power", color: ROLE.power, text: `${N.copper.toFixed(1)} MW of copper loss warms the oil. At ${C.PUMP_ON} °C the pumps start, and Bun and Mochi drive ${N.flow} L/s down the radiators while the fans blow air up through them: the top oil settles at ${Math.round(N.top)} °C.`, points: [[PU.x - PU.r, PU.y + 5, 0], [PU.x + PU.r + 2, PU.y, PU.z + PU.r + 2], [70, -20, 40]], least: 0.2 },
  { title: "Pinch holds the interlock", who: "Pinch · holding", color: ROLE.holding, text: `You try the disconnector. Pinch's bolt holds its shaft: the blades have no arc chamber, and ${r0(N.hvA)} A would follow them as an arc.`, points: [[DM.x - 1, DM.y + DM.d, DM.z], [DM.x + DM.w + 1, DM.y, DM.z + DM.h + 1], [DM.x + 6, DM.y, 34]], least: 0.16 },
  { title: "Roo trips the breaker", who: "Roo · spring", color: ROLE.spring, text: `You press trip. The opening spring throws Roo up, and a blast of SF6 kills the arc at the next current zero, within ${N.halfCycle} ms.`, points: [[M.x - 2, M.y + M.d, M.z], [M.x + M.w + 2, M.y, M.z + M.h + 4], [C.CB.x + 16, C.PH[2], C.STAND + 42]], least: 0.22 },
  { title: "Pinch lets go, the blades open", who: "Pinch · holding", color: ROLE.holding, text: `No current flows now, so the bolt comes out. The motor swings the blades up ${Math.round(N.open)}° in ${C.T_DS} s with no arc: ${N.gapM} m of air you can see.`, points: [[DM.x - 1, DM.y + DM.d, DM.z], [C.DS.hinge - 2, C.PH[2], C.DS.z + C.BLADE + 2], [C.DS.jaw + 4, C.PH[2], C.DS.z], [DM.x + DM.w, DM.y, DM.z]], least: 0.2 },
  { title: "Back to rest", who: "everyone", color: hi, text: "Ollie lets the valve shut and the set runs down. Volta's field goes off, the pumps stop, and you close the blades for the next start.", points: null, hold: 2 },
];
export const views = STEPS.map((s) => (s.points ? fitView(s.points.map(at), [WIDTH, HEIGHT], { pad: 18, least: s.least ?? 0.32 }) : [0, 0, WIDTH, HEIGHT]));
