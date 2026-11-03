import { checkReach, worstReach } from "../../kit/reach.mjs";
import { fitView } from "../../kit/steps.mjs";
import { WIDTH, HEIGHT, C, M, P, L, at } from "./model.mjs";
import { poses, REST, T0, blockHome } from "./moving.mjs";
import { ROO, MO, PINCH } from "./crew.mjs";

// ---------------------------------------------------------------- reach, over every block, the lifts and the lock

const states = [];
for (let i = 0; i < C.BLOCKS.length; i++) states.push(["on the " + C.BLOCKS[i].toFixed(2) + " mm block", { ...REST, p: M.rest(i) }]);
states.push(["at the top of a lift", { ...REST, p: M.rest(4) + C.CLEAR }], ["at full range", { ...REST, p: C.RANGE }]);
for (const grip of [0, 0.5]) states.push(["with the lock " + (grip ? "half" : "fully") + " open", { ...REST, grip }]);
export const REACH = { roo: [], mo: [], pinch: [] };
for (const [label, st] of states) { const q = poses(C, M, st, T0); for (const n of Object.keys(REACH)) REACH[n].push([label, q[n]]); }
export const reachWarnings = checkReach(ROO, REACH.roo, P) + checkReach(MO, REACH.mo, P) + checkReach(PINCH, REACH.pinch, P);
export const worst = { roo: worstReach(ROO, REACH.roo, P).worst, mo: worstReach(MO, REACH.mo, P).worst, pinch: worstReach(PINCH, REACH.pinch, P).worst };

// ---------------------------------------------------------------- the run

const ROLE = { sensing: "#3E9BDB", holding: "#E5484D", spring: "#E93D82" };
const box = (x0, x1, y0, y1, d = -6) => [L(x0, y0, d), L(x1, y0, d), L(x0, y1, d), L(x1, y1, d)];
const rows = C.BLOCKS.map((_, i) => blockHome(C, i)).flatMap(([x, y]) => [[x, y, 0], [x, y, 18]]);
const show = (i) => M.show(M.reading(M.rest(i), M.rest(0)));
// Each beat: who acts, what it does (every number from the model), what the camera shows, and the block it ends on.
export const STEPS = [
  { title: "Meet the crew", who: "Roo, Mo and Pinch", color: "var(--anatomy-hi)", want: 0, hold: 1.4, points: null,
    text: "Three animals work inside this dial indicator: Roo is the plunger's return spring, Mo is the hairspring, and Pinch is the bezel lock." },
  { title: "Pinch locks the zero", who: "Pinch · holding", color: ROLE.holding, want: 0, points: box(-26, 54, -76, -16, -4), least: 0.22,
    text: "On the 1.00 mm reference block, you turn the bezel until 0 sits under the needle. Pinch lets go of it, then clamps it there." },
  { title: "Mo winds the hairspring", who: "Mo · sensing", color: ROLE.sensing, want: 4, points: [...box(-80, 80, -80, 86, 0), L(0, C.BUSH.y1 + 34, C.PLUNGER_D)],
    text: `You lift the plunger by its cap and slide in the 9 mm block. Every millimetre turns the needle once and Mo's wheel a tenth of a turn: it reads ${show(4)}.` },
  { title: "Roo stamps it down", who: "Roo · spring", color: ROLE.spring, want: 1, points: box(-60, 16, -34, 62, -14), least: 0.22,
    text: `Swap in the 1.37 mm block and let go: Roo drives the plunger ${(M.rest(4) + C.CLEAR - M.rest(1)).toFixed(1)} mm down onto it. The needle unwinds to ${show(1)}: 37 divisions.` },
  { title: "Mo keeps every tooth pressed", who: "Mo · sensing", color: ROLE.sensing, want: 2, points: box(-4, 46, -10, 36, -5), least: 0.2,
    text: `The 2.50 mm block reads ${show(2)}, one and a half turns. Mo's steady pull keeps each tooth on the same flank, so the needle can't rattle in the gaps.` },
  { title: "Back on the reference", who: "Roo · spring", color: ROLE.spring, want: 0, hold: 2, points: [...box(-82, 82, -84, 86, 0), L(0, C.TIP0, C.PLUNGER_D), ...rows],
    text: `Back on the 1.00 mm block, Roo brings the plunger down and it reads ${show(0)} again: Pinch never let the bezel slip.` },
];
export const VIEWS = STEPS.map((s) => (s.points ? fitView(s.points.map(at), [WIDTH, HEIGHT], { pad: 14, least: s.least ?? 0.26 }) : [0, 0, WIDTH, HEIGHT]));
// When you take over, the camera holds on the indicator and the row of blocks.
export const TAKE_VIEW = fitView([...box(-82, 82, -84, 90, 0), ...rows].map(at), [WIDTH, HEIGHT], { pad: 16, least: 0.3 });
