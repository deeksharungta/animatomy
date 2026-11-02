// A desk stapler, cut away and staffed: node build.mjs [--light]
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { critter, critterSvg, crewCss, subjectCss } from "../../kit/critters.mjs";
import { checkReach, worstReach } from "../../kit/reach.mjs";
import { kitScript, crewScript, stepsScript } from "../../scripts/inline-kit.mjs";
import { STEPS_CSS, stepsHtml, fitView } from "../../kit/steps.mjs";
import { C } from "./model.mjs";
import { dynamic, poses } from "./head.mjs";
import { scene, DESK, ROOM_TOP } from "./scene.mjs";
import { pageScript } from "./page.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
const WIDTH = 600, HEIGHT = 430;

const P = k.fitProjection(
  [...k.boxCorners(DESK, -16, 0), [DESK.x - 6, DESK.y - 6, ROOM_TOP], [DESK.x + DESK.w, DESK.y - 6, ROOM_TOP], [DESK.x - 6, DESK.y + DESK.d, ROOM_TOP]],
  WIDTH, HEIGHT, { pad: 14, azimuth: 58 },
);
const at = (p) => k.iso(p, P);

const ROO = { species: "kangaroo", name: "Roo", size: 24, role: "spring", wear: ["sweatband"] };
const PIP = { species: "squirrel", name: "Pip", size: 16, role: "moving" };
const K = { ...k, ...L };

const FRESH = { paperO: C.OUT, paperT: C.OUT, p: 0, pT: 0, g: 1, n: C.N0, driven: false, dd: 0, duty: "", stepT: 0, swap: -1, fade: 1, hop: 0, pressing: false };

// Pip rides the magazine's rail behind the follower and leans on its push plate: check both paws over the whole
// press and the feed.
const pipPoses = [];
for (let p = 0; p <= C.GAP + C.B0 + 1e-9; p += 0.7) for (const fed of [0, 0.5, 1]) {
  const s = { ...FRESH, p, driven: fed < 1, n: fed < 1 ? C.N0 - 1 : C.N0, g: fed };
  pipPoses.push([`of the follower at p ${p.toFixed(1)}`, poses(C, s, dynamic(K, P, C, s)).pip]);
}
checkReach(PIP, pipPoses, P);
const D0 = dynamic(K, P, C, FRESH);
const pose0 = poses(C, FRESH, D0);
const sc = scene(P, C);
const crew = (spec, pose, part) => critterSvg(critter(spec, pose, P), { part });
const g = (name, html) => `<g data-part="${name}">${html}</g>`;

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label: "A desk stapler on an office desk, its near side and the near front corner of its nose cut away, run by two animals. A wall calendar and a socket hang behind; a pencil cup, a box of staples and a staple remover sit on the desk. A stack of yellow notes lies on the anvil. Roo the kangaroo stands on the rubber press pad on top of the head and stamps it down: the head and the magazine swing down on the hinge pin until the magazine rests on the notes, then the blade drives the front staple through them, and the anvil's grooves fold its legs inward. Pip the squirrel stands on the magazine's rail behind the follower and pushes it that keeps the strip of staples against the nose.",
  body: [
    sc.room, sc.desk, sc.propsBack,
    sc.base,
    g("leaf", D0.leaf),
    g("paper", D0.paper),
    g("staple-out", D0.stapleOut),
    g("cap-back", D0.capBack),
    sc.earFar,
    g("mag", D0.mag),
    crew(PIP, pose0.pip, "pip"),
    sc.earNear,
    g("cap-front", D0.capFront),
    sc.pinHead,
    crew(ROO, pose0.roo, "roo"),
    sc.propsFront,
  ],
});

const STEPS = [
  { title: "Meet the crew", who: "Roo and Pip", color: "var(--anatomy-hi)", text: "Roo stands on the head's press pad. Pip stands on the magazine's rail with both paws on the follower behind the staples.", points: null, hold: 1.6 },
  { title: "The notes go in", who: "the notes", color: "var(--anatomy-hi)", text: "Twelve sheets slide over the anvil until their back edge meets the paper stop.", points: [[13, -18, 11], [120, 16, 13], [82, 0, 40]] },
  { title: "Roo stamps on the head", who: "Roo · spring", color: "#E93D82", text: "The head and the magazine swing down together on the hinge pin until the magazine's nose rests on the notes.", points: [[0, -11, 11], [96, 11, 11], [32, 0, 70], [-90, 0, 40]] },
  { title: "The blade drives a staple", who: "Roo · spring", color: "#E93D82", text: "The magazine can go no lower, so the head goes on alone. Its blade shears the front staple off the strip and pushes the legs through.", points: [[70, -6, 10], [92, 12, 10], [82, 0, 34]], least: 0.2 },
  { title: "The anvil folds the legs", who: "the anvil", color: "var(--anatomy-hi)", text: "Each 6 mm leg meets a curved groove in the anvil and is bent inward, flat under the notes.", points: [[80.5, 1, 11], [83.5, 7.5, 11], [82, 4, 15]], least: 0.09 },
  { title: "Pip feeds the next staple", who: "Pip · moving", color: "#46A758", text: "Roo eases off and the blade lifts clear. Pip pushes the follower, and the whole strip moves up half a millimetre.", points: [[-4, 8, 10], [86, 8, 10], [40, 0, 34], [0, 16, 32]] },
  { title: "Roo rides the head back up", who: "Roo · spring", color: "#E93D82", text: "The springs lift the magazine off the notes and the head back up, with Roo on top.", points: [[-90, -11, 0], [96, 18, 0], [32, 0, 76]] },
  { title: "Stapled", who: "the notes", color: "var(--anatomy-hi)", text: "Out come the notes, held by one staple. 119 are left in the strip.", points: null, hold: 2 },
];
const views = STEPS.map((s) => (s.points ? fitView(s.points.map(at), [WIDTH, HEIGHT], { pad: 22, least: s.least ?? 0.34 }) : [0, 0, WIDTH, HEIGHT]));
const live = pageScript({ P, C, ROO, PIP, STEPS, views, FRESH, WIDTH, HEIGHT });
const keys = [
  { mark: "lit", label: "On duty: whoever is doing the work right now" },
  { mark: "raised", label: "Roo, kangaroo, spring: stamps the head down and rides it back up" },
  { mark: "raised", label: "Pip, squirrel, moving: stands in for the feed spring, pushing the follower that feeds the strip" },
];
const css = `${crewCss()}${STEPS_CSS}${subjectCss(".st-paper", "#F2D25C", "#F5D76E")}
.so-void{fill:var(--anatomy-halo);opacity:.55;stroke:var(--anatomy-lo);stroke-width:var(--anatomy-weight)}
.iso-stage{touch-action:pan-y;cursor:pointer;overflow:hidden}
.iso-stage:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:6px}`;
const body = `<style>${css}</style>` + k.plateHtml({
  fig: "Fig 1",
  title: "Stapler, staffed",
  hint: "Plays on its own, on a loop",
  readout: `ready · head down 0.0 of ${(C.GAP + C.B0).toFixed(1)} mm · ${C.N0} staples`,
  keys,
  caption: "A desk stapler with the near side of its head and the near front corner of its nose cut away. Pressing the head first swings the magazine down 11.6 mm onto the notes; the head then drives on 6.6 mm alone, its blade pushing a 26/6 staple (12.7 mm crown, 6 mm legs) through twelve sheets into the anvil, whose grooves fold the legs flat. When the blade lifts, the follower moves the strip up by one staple, half a millimetre.",
  body: `<div class="iso-stage" tabindex="0" role="group" aria-label="Stapler, playing on a loop: Space pauses, Home starts again">${svg}</div>${stepsHtml(STEPS)}`,
});
const file = theme === "light" ? "stapler-light.html" : "stapler.html";
writeFileSync(join(HERE, file), k.pageHtml({ title: "Stapler, staffed", theme, body, script: kitScript() + crewScript() + stepsScript() + live, width: 680 }));
console.log("wrote", file, "· worst reach", worstReach(PIP, pipPoses, P).worst.toFixed(2));
