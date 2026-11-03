// A power station's generating unit putting power on the grid, and why the disconnector never breaks current: node build.mjs [--light]
import { writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../kit/iso-kit.mjs";
import { critter, critterSvg, crewCss, subjectCss } from "../../kit/critters.mjs";
import { kitScript, glScript, crewScript, stepsScript } from "../../scripts/inline-kit.mjs";
import { STEPS_CSS, stepsHtml } from "../../kit/steps.mjs";
import { WIDTH, HEIGHT, P, OLLIE, VOLTA, BUN, MOCHI, ROO, PINCH } from "./model.mjs";
import { STEPS, reachWarnings, worst, posesOf, N } from "./story.mjs";
import { CAPTION, LABEL, KEYS } from "./words.mjs";
import { backItems, frontItems, clips } from "./compose.mjs";
import { MODEL_SCRIPT } from "./page-model.mjs";
import { DRAW_SCRIPT } from "./page-draw.mjs";
import { RUN_SCRIPT } from "./page-run.mjs";
import { FLOW_SCRIPT } from "./page-flow.mjs";
import { FALLBACK } from "./flows-geo.mjs";
import { CSS } from "./style.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
const p0 = posesOf({});
const crew = (name) => critterSvg(critter({ ollie: OLLIE, volta: VOLTA, bun: BUN, mochi: MOCHI, roo: ROO, pinch: PINCH }[name], p0[name], P), { part: name });
const back = backItems(crew), front = frontItems(crew);
// A layer's own box never takes a hit, even under a checker's svg { pointer-events } override; its parts still do.
const NOHIT = "pointer-events:none!important";
// The back drawing is cut at each flow's slot: what the flow runs through below, its canvas, then what covers it.
const cuts = [[]], slots = [];
for (const item of back) {
  const slot = /^@flow:(\w+)$/.exec(item)?.[1];
  if (slot) { cuts.at(-1).push(FALLBACK[slot]()); slots.push(slot); cuts.push([]); } else cuts.at(-1).push(item);
}
const layerSvg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" class="iso-svg pg-layer" viewBox="0 0 ${WIDTH} ${HEIGHT}" aria-hidden="true" style="${NOHIT}">${body.join("")}</svg>`;
const backSvg = k.figureSvg({ width: WIDTH, height: HEIGHT, label: LABEL, body: [clips(), ...cuts[0]] }) +
  slots.map((n, i) => `<canvas class="pg-layer ${n === "arcs" ? "pg-arcs" : `pg-flow pg-flow-${n}`}" aria-hidden="true"></canvas>` + (cuts[i + 1].length ? layerSvg(cuts[i + 1]) : "")).join("");
const frontSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="iso-svg pg-layer pg-front" viewBox="0 0 ${WIDTH} ${HEIGHT}" aria-hidden="true" style="${NOHIT}">${front.join("")}</svg>`;

const css = `${crewCss()}${STEPS_CSS}${subjectCss(".pg-cu", "#C27A44", "#D08A55")}${CSS}`;
const plate = `<style>${css}</style>` + k.plateHtml({
  fig: "Fig 1",
  title: "Power station, staffed",
  hint: "Plays on its own · drag the valve",
  readout: "at rest · 0 rpm · 0 kV · 0 MW · 0 A · 22 °C",
  keys: KEYS,
  caption: CAPTION,
  body: `<div class="iso-stage pg-stage" tabindex="0" role="group" aria-label="A turbo-generator, its step-up transformer and its 400 kV bay, playing on a loop: Space pauses and resumes, Home starts again. To take over: left and right arrows set the governor, up and down the voltage, B closes or trips the breaker, O tries the disconnector, Shift+O tries it with its interlock defeated.">${backSvg}${frontSvg}<canvas class="pg-layer pg-lamps" aria-hidden="true"></canvas></div><p class="pg-said" aria-live="polite" data-said></p>${stepsHtml(STEPS)}`,
});

// The CREW namespace exposes only part of kit/lathe.mjs; the live parts also need dots, arcs and circles on round bodies.
const lathe = readFileSync(new URL("../../kit/lathe.mjs", import.meta.url), "utf8").replace(/^import[^;]+;\s*$/gm, "").replace(/^export /gm, "");
const latheScript = `const LATHE = (() => {\n${lathe}\nreturn { dotsOf, circleOf, arcOf, fadeOf };\n})();\n`;
const file = theme === "light" ? "power-grid-light.html" : "power-grid.html";
const script = kitScript() + glScript() + crewScript() + latheScript + stepsScript() + MODEL_SCRIPT + `const TOP_LOAD = ${N.top};` + DRAW_SCRIPT + FLOW_SCRIPT + RUN_SCRIPT;
writeFileSync(join(HERE, file), k.pageHtml({ title: "Power station, staffed", theme, body: plate, script, width: 760 }));
console.log("wrote", file, "· reach warnings", reachWarnings, "· worst reach", worst);
