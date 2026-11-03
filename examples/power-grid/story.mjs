import { fitView } from "../../kit/steps.mjs";
import { checkReach } from "../../kit/reach.mjs";
import { WIDTH, HEIGHT, C, P, K, at, MO, CRUMB, PINCH, ROLE, loadPoint, LOAD_MW } from "./model.mjs";
import { REST } from "./physics.mjs";
import { tools } from "./tools.mjs";
import { governor } from "./moving-gov.mjs";
import { breaker } from "./moving-cb.mjs";
import { isolator, instruments } from "./moving-ds.mjs";
import { poses } from "./poses.mjs";

// Every number in the captions is computed here from the model's constants.
const loss = (f) => C.LOSS[0] * (f / 50) ** 2 + C.LOSS[1] * (f / 50);
export const F_IDLE = 50.05, V_SET = 1.01;
export const FSET_IDLE = F_IDLE + ((loss(F_IDLE) / C.MW_MAX) * C.DROOP * 50);
export const FSET_LOAD = 50 + (((LOAD_MW + loss(50)) / C.MW_MAX) * C.DROOP * 50);
const LP = loadPoint(LOAD_MW);
export const N = {
  rpm: (F_IDLE * 120) / C.POLES, runup: F_IDLE / C.RAMP / 60, kv: V_SET * C.GRID_KV, ifIdle: (C.IF0 * V_SET * 50) / F_IDLE,
  slip: F_IDLE - 50, turn: 1 / (F_IDLE - 50), close: C.T_CLOSE * 1000, mw: LOAD_MW, amps: LP.I, delta: LP.delta, ifLoad: LP.If,
  halfCycle: 1000 / (2 * C.GRID_HZ), open: (C.OPEN * 180) / Math.PI, phaseV: (C.GRID_KV * 1000) / Math.sqrt(3),
  arcV: C.ARC_V0 + C.ARC_E * 100,
};
const r0 = (v) => Math.round(v).toLocaleString("en-GB");

// Reach: Mo on the lever over the whole speed and valve range, Crumb on the pointer all the way round,
// Pinch on the bolt's knob in and out.
const T = tools(K, P);
const at3 = (s) => { const st = { ...REST, ...s }; const G = governor(K, P, C, st, T), B = breaker(K, P, C, st, T), I = isolator(K, P, C, st, T), Nn = instruments(K, P, C, st, T); return poses(C, st, G, B, I, Nn); };
export const posesOf = at3;
const mo = [], crumb = [], pinch = [];
for (const f of [0, 48, 50, F_IDLE, 51.2, 52]) for (const g of [0, 0.05, 0.6, 1]) mo.push([`at ${f} Hz, valve ${g}`, at3({ f, g }).mo]);
for (let a = -Math.PI; a < Math.PI; a += Math.PI / 12) crumb.push([`at pointer ${Math.round((a * 180) / Math.PI)}°`, at3({ ptr: a, E: 1 }).crumb]);
for (const lock of [0, 0.5, 1]) for (const dsTry of [0, 0.6]) pinch.push([`with the bolt at ${lock}, crank slack ${dsTry}`, at3({ lock, dsTry }).pinch]);
export const reachWarnings = checkReach(MO, mo, P) + checkReach(CRUMB, crumb, P) + checkReach(PINCH, pinch, P);
export const reachLists = { mo, crumb, pinch };

const hi = "var(--anatomy-hi)";
export const STEPS = [
  { title: "Meet the crew", who: "Mo, Volta, Crumb, Roo and Pinch", color: hi, text: "Five animals run this generator: Mo on the governor, Volta on the field, Crumb on the synchroscope, Roo in the breaker, Pinch on the interlock.", points: null, hold: 1.6 },
  { title: "Mo opens the steam valve", who: "Mo · sensing", color: ROLE.sensing, text: `You set the governor to ${r0(N.rpm)} rpm. Mo rides its lever down, the valve opens, and in ${N.runup.toFixed(1)} minutes the set runs up to ${F_IDLE} Hz.`, points: [[-228, -26, 30], [-160, 6, 30], [-212, -10, 120], [-176, -10, 100]] },
  { title: "Volta builds the voltage", who: "Volta · power", color: ROLE.power, text: `Volta's current, ${Math.round(N.ifIdle)} A, runs through the slip rings into the rotor. Its spinning poles now make ${N.kv.toFixed(1)} kV, just over the grid's ${C.GRID_KV}.`, points: [[-30, -44, 0], [26, 12, 0], [-12, -10, 60], [-10, -84, 76], [8, 6, 52]] },
  { title: "Crumb tracks the phase", who: "Crumb · sensing", color: ROLE.sensing, text: `The set runs ${N.slip.toFixed(2)} Hz fast, so Crumb walks the pointer round once every ${Math.round(N.turn)} s. The lamps go dark as it nears twelve: in phase.`, points: [[88, -6, 46], [132, 24, 46], [112, 8, 62]], least: 0.24 },
  { title: "Roo closes the breaker", who: "Roo · spring", color: ROLE.spring, text: `You press close just before twelve. Roo stamps, the spring drives the contacts home in ${N.close} ms, and the rotor locks in step with the grid.`, points: [[32, -92, 6], [86, -60, 6], [72, -76, 96], [44, -84, 60]], least: 0.26 },
  { title: "Mo puts on load", who: "Mo · sensing", color: ROLE.sensing, text: `You raise the setting. The speed can't rise now, so the valve opens to ${N.mw} MW: the rotor runs ${Math.round(N.delta)}° ahead and pushes ${Math.round(N.amps)} A into the grid.`, points: [[-230, -30, 0], [-126, 20, 0], [-212, -10, 120], [-90, -10, 80]] },
  { title: "Pinch holds the interlock", who: "Pinch · holding", color: ROLE.holding, text: `You try the disconnector's crank. Pinch's bolt holds it: the blade has no arc chute, and ${Math.round(N.amps)} A would follow it as an arc.`, points: [[132, -64, 26], [158, -50, 26], [150, -58, 52], [138, -48, 40]], least: 0.18 },
  { title: "Roo trips the breaker", who: "Roo · spring", color: ROLE.spring, text: `You press trip. The opening spring parts the contacts ${C.GAP_VAC} mm in vacuum, and the arc dies at the next current zero, within ${N.halfCycle} ms.`, points: [[50, -88, 22], [86, -60, 22], [72, -76, 94], [60, -66, 56]], least: 0.26 },
  { title: "Pinch lets go, the blades open", who: "Pinch · holding", color: ROLE.holding, text: `No current flows now, so the bolt comes out. You crank the blades up ${Math.round(N.open)}° with no arc: a gap you can see.`, points: [[134, -106, 60], [196, -54, 60], [166, -80, 112], [140, -52, 30]], least: 0.2 },
  { title: "Back to rest", who: "everyone", color: hi, text: "Mo shuts the valve and the set runs down. Volta's field goes off, and you close the blades ready for the next start.", points: null, hold: 2 },
];
export const views = STEPS.map((s) => (s.points ? fitView(s.points.map(at), [WIDTH, HEIGHT], { pad: 20, least: s.least ?? 0.32 }) : [0, 0, WIDTH, HEIGHT]));
