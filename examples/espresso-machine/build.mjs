import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../kit/iso-kit.mjs";
import { critter, critterSvg, crewCss, subjectCss } from "../../kit/critters.mjs";
import { kitScript, glScript, crewScript, stepsScript } from "../../scripts/inline-kit.mjs";
import { STEPS_CSS, stepsHtml } from "../../kit/steps.mjs";
import { WIDTH, HEIGHT, C, P, K, OLLIE, EMBER, CRUMB } from "./model.mjs";
import { room, desk, propsBack, propsFront } from "./scene.mjs";
import { base, walls, top, frontUpper, frontLower, deck, trayBack } from "./housing.mjs";
import { tank, hoses, pump, piston, pumpNose, valve, cage, riser } from "./lower.mjs";
import { boiler, terminals, thermostat, switchBlock, wires, group, solenoid, cup, CUP_TOP } from "./upper.mjs";
import { dynamic, poses } from "./moving.mjs";
import { STEPS, LABEL, keys, rest } from "./story.mjs";
import { MODEL_SCRIPT } from "./page-model.mjs";
import { RUN_SCRIPT } from "./page-run.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
const [gx, gy] = C.G;
const S0 = rest();
const dyn0 = dynamic(K, P, C, S0);
const pose0 = poses(C, S0);
const crew = (spec, pose, part) => critterSvg(critter(spec, pose, P), { part });
const mv = (name, html) => `<g data-part="${name}">${html}</g>`;

// Back to front. The band heater's glow is painted on a canvas between the "|" cut and the front drawing.
const parts = [
  room(), desk(), propsBack(), base(), walls(), tank(), hoses(),
  pump(), mv("rod", piston()),
  pumpNose(), valve(), riser(), cage(false), mv("spring", dyn0.spring), cage(true), mv("cap", dyn0.cap), crew(CRUMB, pose0.crumb, "crumb"),
  crew(OLLIE, pose0.ollie, "ollie"),
  frontLower(), trayBack(), cup(),
  `<defs><clipPath id="es-rim"><path d="${k.ring(gx, gy, C.CUP.r - 0.7, CUP_TOP, P, 48)}"/></clipPath></defs>`,
  `<path class="es-void" d="${k.ring(gx, gy, C.CUP.r - 0.7, CUP_TOP, P, 48)}"/>`,
  `<g clip-path="url(#es-rim)">${mv("coffee", dyn0.coffee)}${mv("streams-in", dyn0.streamsIn)}</g>`,
  mv("streams", dyn0.streams), solenoid(), group(), deck(), boiler(), thermostat(), frontUpper(), mv("needle", dyn0.needle), top(),
  "|",
  terminals(), wires(), switchBlock(), mv("lever", dyn0.lever), crew(EMBER, pose0.ember, "ember"), propsFront(),
];
const cut = parts.indexOf("|");
const backSvg = k.figureSvg({ width: WIDTH, height: HEIGHT, label: LABEL, body: parts.slice(0, cut) });
const frontSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="iso-svg es-layer" viewBox="0 0 ${WIDTH} ${HEIGHT}" aria-hidden="true">${parts.slice(cut + 1).join("")}</svg>`;

const css = `${crewCss()}${STEPS_CSS}${subjectCss(".es-crema", "#C9925A", "#D29C63")}${subjectCss(".es-coffee", "#5A3418", "#7A4A26")}
.es-void{fill:var(--anatomy-halo);opacity:.55;stroke:var(--anatomy-lo);stroke-width:var(--anatomy-weight)}
.es-face{fill:var(--anatomy-face);stroke:none}
.es-stage{position:relative;touch-action:pan-y;overflow:hidden}
.es-stage>svg,.es-stage>canvas{display:block;width:100%;height:auto}
.es-stage>.es-layer{position:absolute;inset:0;height:100%!important;pointer-events:none}
.iso[data-theme="dark"] .es-stage>canvas,.iso:not([data-theme]) .es-stage>canvas{mix-blend-mode:screen}
.es-stage:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:6px}`;

const body = `<style>${css}</style>` + k.plateHtml({
  fig: "Fig 1",
  title: "Espresso machine, staffed",
  hint: "Plays on its own, on a loop",
  readout: "cold · 20 °C · 0.0 bar · 0 g",
  keys,
  caption: "A single-boiler espresso machine with its right side, top and most of its front cut away. Ember holds the heater on until the boiler reaches 93 °C, Ollie works the vibratory pump's piston, and past 9 bar the water lifts Crumb off the over-pressure valve so the extra runs back to the tank. 18 g of coffee gives 36 g of espresso in about 28 seconds.",
  body: `<div class="iso-stage es-stage" tabindex="0" role="group" aria-label="Espresso machine, playing on a loop: Space pauses, Home starts again">${backSvg}<canvas class="es-layer es-heat" aria-hidden="true"></canvas>${frontSvg}<canvas class="es-layer es-steam" aria-hidden="true"></canvas></div>${stepsHtml(STEPS)}`,
});

const file = theme === "light" ? "espresso-machine-light.html" : "espresso-machine.html";
writeFileSync(join(HERE, file), k.pageHtml({ title: "Espresso machine, staffed", theme, body, script: kitScript() + glScript() + crewScript() + stepsScript() + MODEL_SCRIPT + RUN_SCRIPT, width: 680 }));
console.log("wrote", file);
