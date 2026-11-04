import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { critter, critterSvg, crewCss, subjectCss } from "../../kit/critters.mjs";
import { kitScript, glScript, crewScript, stepsScript } from "../../scripts/inline-kit.mjs";
import { STEPS_CSS, stepsHtml } from "../../kit/steps.mjs";
import { WIDTH, HEIGHT, C, P, VOLTA, EMBER, ROO } from "./model.mjs";
import { room, socket, plug, cordOut, cordIn, bench, standBase, restBack, restFront, propsBack, propsFront, spareTips } from "./scene.mjs";
import { ironBack, ironFront } from "./iron.mjs";
import { board, farSide, liveWire, guide, leafSvg, stop, heaterLeads } from "./inside.mjs";
import { rodParts } from "./rodset.mjs";
import { dynamic, poses } from "./moving.mjs";
import { STEPS, LABEL, keys, rest, reachWarnings, workWarnings } from "./story.mjs";
import { MODEL_SCRIPT } from "./page-model.mjs";
import { RUN_SCRIPT } from "./page-run.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
if (reachWarnings) console.warn(`${reachWarnings} reach warning(s)`);
if (workWarnings) console.warn(`${workWarnings} point-of-work warning(s)`);
const S0 = rest();
const dyn0 = dynamic({ ...k, ...L }, P, C, S0);
const pose0 = poses(C, S0);
const crew = (spec, key) => critterSvg(critter(spec, pose0[key], P), { part: key });
const mv = (name, html) => `<g data-part="${name}">${html}</g>`;
const R = rodParts();

// Back to front. The heat and current are painted on a canvas between the "|" cut and the front drawing,
// which holds everything inside the switch chamber, drawn whole.
const parts = [
  room(), bench(), propsBack(), socket(), mv("rocker", dyn0.rocker), plug(), cordOut(), standBase(), restBack(-100, C.GRIP.r[1]), restBack(40, C.BARREL.r[1]),
  ironBack(), cordIn(), board(), ironFront(),
  "|",
  farSide(), mv("rodA", R.a), guide(), leafSvg(0), mv("rodB", R.b), mv("springBack", dyn0.springBack), mv("rodC", R.c), mv("springFront", dyn0.springFront),
  stop(), mv("stub", dyn0.stub), mv("rodD", R.d), heaterLeads(), leafSvg(1), crew(EMBER, "ember"), liveWire(), crew(VOLTA, "volta"), crew(ROO, "roo"),
  restFront(-100, C.GRIP.r[1]), restFront(40, C.BARREL.r[1]), spareTips(), propsFront(),
];
const cut = parts.indexOf("|");
const backSvg = k.figureSvg({ width: WIDTH, height: HEIGHT, label: LABEL, body: parts.slice(0, cut) });
const frontSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="iso-svg si-layer" viewBox="0 0 ${WIDTH} ${HEIGHT}" aria-hidden="true">${parts.slice(cut + 1).join("")}</svg>`;

const css = `${crewCss()}${STEPS_CSS}${subjectCss(".si-tip", "#C8794A", "#C98256")}
.si-stage{position:relative;touch-action:pan-y;overflow:hidden}
.si-stage>svg,.si-stage>canvas{display:block;width:100%;height:auto}
.si-stage>.si-layer{position:absolute;inset:0;height:100%!important;pointer-events:none}
.iso[data-theme="dark"] .si-stage>canvas,.iso:not([data-theme]) .si-stage>canvas{mix-blend-mode:screen}
.si-stage:not([data-gl]) [data-part=coil][data-on] .iso-dot,.si-stage:not([data-gl]) [data-part=coil][data-on] circle{fill:#E8A817;stroke:#E8A817}
.si-stage:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:6px}`;

const body = `<style>${css}</style>` + k.plateHtml({
  fig: "Fig 1",
  title: "Soldering iron, staffed",
  hint: "Plays on its own, on a loop",
  readout: "off · tip 22 °C",
  keys,
  caption: `A 60 W soldering iron with a magnetic temperature switch, cut in half along its length. Volta brings the current, and while Ember presses the contact bridge shut it runs into the nichrome coil round the tip's copper core. A slug of magnetic alloy at the back of the tip holds a magnet on the switch rod; at the slug's Curie point, 370 °C, the magnet lets go, Roo's spring overpowers Ember and snaps the contacts open, and at 364 °C she presses them shut again.`,
  body: `<div class="iso-stage si-stage" tabindex="0" role="group" aria-label="Soldering iron, playing on a loop: Space pauses, Home starts again">${backSvg}<canvas class="si-layer si-heat" aria-hidden="true"></canvas>${frontSvg}</div>${stepsHtml(STEPS)}`,
});

const file = theme === "light" ? "soldering-iron-light.html" : "soldering-iron.html";
writeFileSync(join(HERE, file), k.pageHtml({ title: "Soldering iron, staffed", theme, body, script: kitScript() + glScript() + crewScript() + stepsScript() + MODEL_SCRIPT + RUN_SCRIPT, width: 700 }));
console.log("wrote", file);
