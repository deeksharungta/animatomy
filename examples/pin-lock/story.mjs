import { checkReach, worstReach } from "../../kit/reach.mjs";
import { fitView } from "../../kit/steps.mjs";
import { WIDTH, HEIGHT, C, M, P, K, at } from "./model.mjs";
import { T } from "./cylinder.mjs";
import { dynamic, poses } from "./moving.mjs";
import { REST } from "./figure.mjs";
import { MICE, ROO } from "./crew.mjs";

// ---------------------------------------------------------------- reach, over the whole insertion and the turn

const states = [];
for (let kx = C.KEY.out; kx >= C.PLUG.x0; kx -= 1.5) states.push(["with the key at x " + kx.toFixed(1), { ...REST, kx }]);
for (const deg of [0, 30, 60, 90]) states.push(["with the plug at " + deg + "°", { ...REST, kx: C.PLUG.x0, deg }]);
const REACH = { roo: [], ...Object.fromEntries(MICE.map((_, i) => ["m" + i, []])) };
for (const [label, st] of states) { const q = poses(C, M, st, T, dynamic(K, P, C, M, st, T)); for (const n of Object.keys(REACH)) REACH[n].push([label, q[n]]); }
export const reachWarnings = checkReach(ROO, REACH.roo, P) + MICE.reduce((n, m, i) => n + checkReach(m, REACH["m" + i], P), 0);
export const worst = Object.fromEntries(Object.keys(REACH).map((n, i) => [n, worstReach(n === "roo" ? ROO : MICE[i - 1], REACH[n], P).worst]));

// ---------------------------------------------------------------- the run

export const ROLE = { holding: "#E5484D", spring: "#E93D82" };
const IN = C.PLUG.x0, OUT = C.KEY.out, gap3 = M.gaps(M.pinsAt(1, IN))[2];
const cyl = [[6, 0, 26], [-34, 0, 26], [-34, 0, -10], [6, 0, -10]];
const latch = [[-30, 0, -8], [-76, 0, -8], [-76, 0, 44], [-30, 0, 44]];
// Each beat: its title, who acts, what happens (every number from the model), the camera's points and the plan
// the beat runs: a list of targets for the key (kx, which), the plug (deg) and the drawer (d).
export const STEPS = [
  { title: "Meet the crew", who: "The crew", color: "var(--anatomy-hi)", hold: 1.6, points: null, plan: [{ kx: OUT }, { deg: 0 }, { d: 0 }],
    text: "Five mice are the pin springs, one in each chamber, pushing the pins down across the shear line. Roo is the bolt's spring." },
  { title: "Key B goes in", who: "Nib, Bit, Dot, Fig and Tam · holding", color: ROLE.holding, points: [...cyl, [44, 0, 0]], least: 0.3, plan: [{ which: 1 }, { kx: IN }],
    text: "Its ridges lift each pin stack in turn. Each mouse is squeezed up, and pushes its stack back down." },
  { title: "Dot holds the plug", who: "Dot · holding", color: ROLE.holding, points: [[-6, 0, 24], [-22, 0, 24], [-22, 0, -6], [-6, 0, -6]], least: 0.22, plan: [{ deg: 90, wait: 1.2 }],
    text: `You try to turn it. Pin 3's cut is ${Math.abs(gap3).toFixed(2)} mm too deep, so Dot's driver still crosses the shear line: the plug stops at ${C.BIND}°.` },
  { title: "Key A goes in", who: "Nib, Bit, Dot, Fig and Tam · holding", color: ROLE.holding, points: [...cyl, [44, 0, 0]], least: 0.3, plan: [{ deg: 0 }, { kx: OUT }, { which: 0 }, { kx: IN }],
    text: "Swap the keys. Now every key pin's top lands on the shear line, and every driver sits wholly above it." },
  { title: "Roo is lifted", who: "Roo · spring", color: ROLE.spring, points: latch, least: 0.3, plan: [{ deg: 90 }],
    text: `You turn the key. The crank pin lifts the lever under Roo's feet, and the bolt drops ${M.boltDrop(90).toFixed(1)} mm, out of its keep.` },
  { title: "The drawer opens", who: "You", color: "var(--anatomy-hi)", points: [[-88, 0, 54], [36, 0, 54], [36, 0, -50], [-88, 0, -50], [62, 0, 0]], least: 0.5, plan: [{ d: C.OPEN }],
    text: `Nothing holds the drawer now. You pull it open ${C.OPEN} mm.` },
  { title: "Roo throws the bolt", who: "Roo · spring", color: ROLE.spring, points: [...latch, [-30, 0, 0]], least: 0.3, plan: [{ d: 0 }, { deg: 0 }],
    text: "Push it shut and let go of the key: Roo stamps the lever down, the bolt springs up into its keep, and the plug turns back to 0°." },
  { title: "Locked again", who: "Nib, Bit, Dot, Fig and Tam · holding", color: ROLE.holding, hold: 1.4, points: [...cyl, [-76, 0, 44], [62, 0, 0]], least: 0.5, plan: [{ kx: OUT }],
    text: "Pull the key out. Each mouse pushes its stack down again, and the drivers cross the shear line." },
];
const box = (pts) => pts.map((p) => at(p));
export const VIEWS = STEPS.map((s) => (s.points ? fitView(box(s.points), [WIDTH, HEIGHT], { pad: 14, least: s.least ?? 0.3 }) : [0, 0, WIDTH, HEIGHT]));
// When you take over, the camera holds on the lock, the latch and the key.
export const TAKE_VIEW = fitView(box([[-80, 0, 56], [70, 0, 56], [70, 0, -52], [-80, 0, -52]]), [WIDTH, HEIGHT], { pad: 10, least: 0.4 });
