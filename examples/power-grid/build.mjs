// A turbine-generator putting power on the grid, and why the disconnector never breaks current: node build.mjs [--light]
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../kit/iso-kit.mjs";
import { critter, critterSvg, crewCss, subjectCss } from "../../kit/critters.mjs";
import { worstReach } from "../../kit/reach.mjs";
import { kitScript, glScript, crewScript, stepsScript } from "../../scripts/inline-kit.mjs";
import { STEPS_CSS, stepsHtml } from "../../kit/steps.mjs";
import { WIDTH, HEIGHT, C, P, K, MO, VOLTA, CRUMB, ROO, PINCH } from "./model.mjs";
import { REST } from "./physics.mjs";
import { room, floor, propsBack, propsFront, mat, tray } from "./scene.mjs";
import { turbineLow, turbineHigh, governorBase, governorCap } from "./turbine.mjs";
import { generator, hatchPath, hatchInside, hatchRim, slipRings, brushGear, exciter } from "./generator.mjs";
import { busDuct, cubicleBack, mechanism, partition, pole, windowPath, windowRim, cubicleFront } from "./breaker.mjs";
import { frame, frontChannel, jaws, jawFront, hinges, hingeCheek, barsIn, barsOut, barsUp, wallBushings, gearbox } from "./disconnector.mjs";
import { desk } from "./desk.mjs";
import { STEPS, N, reachWarnings, reachLists, posesOf } from "./story.mjs";
import { CAPTION, LABEL, KEYS } from "./words.mjs";
import { MODEL_SCRIPT } from "./page-model.mjs";
import { DRAW_SCRIPT } from "./page-draw.mjs";
import { RUN_SCRIPT } from "./page-run.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
const p0 = posesOf({});
const crew = (spec, pose, name) => critterSvg(critter(spec, pose, P), { part: name });
const g = (name, html = "") => `<g data-part="${name}">${html}</g>`;
const x72 = C.CUT;

const body = [
  `<defs><clipPath id="pg-hatch"><path d="${hatchPath()}"/></clipPath><clipPath id="pg-win"><path d="${windowPath(x72)}"/></clipPath></defs>`,
  room(), floor(), propsBack(), wallBushings(), exciter(), mat(),
  // The breaker cubicle, back to front: mechanism and Roo, the partition, the three poles, the roof.
  cubicleBack(), mechanism(), g("cb-spring"), g("cb-rods"), g("cb-lever"), crew(ROO, p0.roo, "roo"), partition(), barsIn(),
  pole(C.PHX[0], false), pole(C.PHX[1], true), pole(C.PHX[2], false), `<g clip-path="url(#pg-win)">${g("contacts")}</g>`, windowRim(x72), barsUp(),
  // The disconnector: frame, jaws, hinges, blades, and the copper from the breaker.
  frame(), jaws(), g("coupling"), frontChannel(), hinges(), g("cranks"), `<g class="pg-cu">${g("blade0")}${g("blade1")}${g("blade2")}</g>`, jawFront(), hingeCheek(),
  barsOut(), "|", cubicleFront(), g("flags"), gearbox(), g("disc"), g("bolt"), g("bolt-top"), g("crank"), crew(PINCH, p0.pinch, "pinch"),
  // The turbine and its governor, with Mo on the floating lever.
  turbineLow(), turbineHigh(), governorBase(), g("gov"), g("lever-back"), g("lever"), crew(MO, p0.mo, "mo"), governorCap(),
  // The generator with its hatch off, the slip rings, the field cable's tray with Volta in it, the bus duct.
  generator(), `<g class="pg-cavity" clip-path="url(#pg-hatch)">${hatchInside()}${g("poles")}</g>`, hatchRim(), g("cpl"),
  slipRings(), brushGear(), tray(), crew(VOLTA, p0.volta, "volta"), g("field"), busDuct(), propsFront(),
  // The synchronising desk with Crumb on the synchroscope.
  desk(), g("meters"), g("pointer"), crew(CRUMB, p0.crumb, "crumb"),
  `<g class="pg-fb">${g("fb-lamps")}${g("fb-vac")}${g("fb-air")}</g>`,
];
const cut = body.indexOf("|");
const backSvg = k.figureSvg({ width: WIDTH, height: HEIGHT, label: LABEL, body: body.slice(0, cut) });
const frontSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="iso-svg pg-layer pg-front" viewBox="0 0 ${WIDTH} ${HEIGHT}" aria-hidden="true">${body.slice(cut + 1).join("")}</svg>`;

const css = `${crewCss()}${STEPS_CSS}${subjectCss(".pg-cu", "#C27A44", "#D08A55")}
.pg-void{fill:var(--pg-void);stroke:none}
.iso[data-theme="light"] .pg-cavity{--anatomy-paper:#8e8a84;--anatomy-face:#8e8a84;--anatomy-top:#a29e97;--anatomy-shade-0:#7a7671;--anatomy-shade-1:#85817b;--anatomy-shade-2:#908c86;--anatomy-shade-3:#9b9790;--anatomy-hi:#3a3835;--anatomy-mid:#4a4743;--anatomy-lo:#5d5a55;--anatomy-faint:#6f6b66}
.iso[data-theme="dark"] .pg-cavity{--anatomy-paper:inherit;--anatomy-face:inherit;--anatomy-top:inherit}
.pg-rim{fill:none;stroke:var(--anatomy-lo);stroke-width:var(--anatomy-weight)}
.iso{--pg-void:#060606;--pg-lamp:#f2a43a;--pg-arc:#9c8cff}
.iso[data-theme="light"]{--pg-void:#5b5853;--pg-lamp:#e8962a;--pg-arc:#6a58e8}
.pg-fb-lamp{fill:var(--pg-lamp)}
.pg-fb-arc{fill:var(--pg-arc);opacity:.85}
.pg-fb-air{fill:none;stroke:var(--pg-arc);stroke-linecap:round;stroke-linejoin:round}
.iso[data-theme="light"] .pg-fb-lamp{mix-blend-mode:multiply}
.pg-stage[data-gl] .pg-fb{display:none}
.pg-stage{position:relative;touch-action:pan-y;overflow:hidden}
.pg-stage>svg,.pg-stage>canvas{display:block;width:100%;height:auto}
.pg-stage>.pg-layer{position:absolute;inset:0;height:100%!important;pointer-events:none}
.iso[data-theme="dark"] .pg-stage>canvas,.iso:not([data-theme]) .pg-stage>canvas{mix-blend-mode:screen}
.pg-stage:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:6px}
@media (max-width:480px){.iso-plate-corner[data-corner="readout"]{font-size:9.5px;letter-spacing:0}}
.pg-said{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}`;

const plate = `<style>${css}</style>` + k.plateHtml({
  fig: "Fig 1",
  title: "Generator to grid, staffed",
  hint: "Plays on its own · drag the governor",
  readout: "at rest · 0 rpm · 0.0 kV · 0.0 MW · 0 A",
  keys: KEYS,
  caption: CAPTION,
  body: `<div class="iso-stage pg-stage" tabindex="0" role="group" aria-label="Turbine-generator and its switchgear, playing on a loop: Space pauses and resumes, Home starts again. To take over: left and right arrows set the governor's speed, up and down the voltage, B closes or trips the breaker, O tries the disconnector, Shift+O tries it with its interlock defeated.">${backSvg}<canvas class="pg-layer pg-arcs" aria-hidden="true"></canvas>${frontSvg}<canvas class="pg-layer pg-lamps" aria-hidden="true"></canvas></div><p class="pg-said" aria-live="polite" data-said></p>${stepsHtml(STEPS)}`,
});

const file = theme === "light" ? "power-grid-light.html" : "power-grid.html";
writeFileSync(join(HERE, file), k.pageHtml({ title: "Generator to grid, staffed", theme, body: plate, script: kitScript() + glScript() + crewScript() + stepsScript() + MODEL_SCRIPT + DRAW_SCRIPT + RUN_SCRIPT, width: 720 }));
const worst = Object.entries(reachLists).map(([n, l]) => `${n} ${worstReach({ mo: MO, crumb: CRUMB, pinch: PINCH }[n], l, P).worst.toFixed(2)}`).join(", ");
console.log("wrote", file, "· reach warnings", reachWarnings, "· worst reach", worst, "· numbers", JSON.stringify(Object.fromEntries(Object.entries(N).map(([a, b]) => [a, +b.toFixed(2)]))));
void REST; void K;
