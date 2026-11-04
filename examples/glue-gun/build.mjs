import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { critter, critterSvg, crewCss, subjectCss } from "../../kit/critters.mjs";
import { kitScript, glScript, crewScript, stepsScript } from "../../scripts/inline-kit.mjs";
import { STEPS_CSS, stepsHtml } from "../../kit/steps.mjs";
import { WIDTH, HEIGHT, C, P, PINCH, ROO, VOLTA } from "./model.mjs";
import { room, bench, strip, plug, cord } from "./scene.mjs";
import { shellInside, shellOutside, cutBand, bosses, rib, floorAt } from "./shell.mjs";
import { bushing, sleeve, block, stack, post, nozzle, nozzleOut } from "./barrel.mjs";
import { slidePlate, pivotBoss, cordIn, liveWire, neutralWire, standFar, standNear, ZF, gripRibs } from "./mech.mjs";
import { props, boxBack, boxLid, boxFront } from "./props.mjs";
import { dynamic } from "./moving.mjs";
import { poses } from "./crew.mjs";
import { rest } from "./sim.mjs";
import { STEPS, LABEL, keys, reachWarnings } from "./story.mjs";
import { pageScript } from "./page.mjs";
import { TONES } from "./tones.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
if (reachWarnings) console.warn(`${reachWarnings} reach/work warning(s)`);
const S0 = { ...rest(C), power: false };
const dyn = dynamic({ ...k, ...L }, P, C, S0);
const pose0 = poses(C, S0);
const crew = (spec, key) => critterSvg(critter(spec, pose0[key], P), { part: key });
const mv = (name, html) => `<g data-part="${name}">${html}</g>`;

// Back to front. The canvas sits at "|": it lights the block, the melt and the blob; the mechanism covers it.
const parts = [
  room(), bench(), props(), strip(), mv("rocker", dyn.rocker), plug(), cord(), standFar(), boxBack(), boxFront(), boxLid(),
  shellInside(), gripRibs(), bosses(), rib(C.RIBS[0], 6.4), pivotBoss(), neutralWire(), post(floorAt(20)), stack(), block(), sleeve(), nozzle(),
  mv("melt", dyn.melt), mv("half", dyn.half), mv("ball", dyn.ball), rib(C.RIBS[1], 6.4), bushing(), shellOutside(), cutBand(), nozzleOut(), mv("meltOut", dyn.meltOut), mv("spring", dyn.spring), cordIn(),
  mv("blob", dyn.blob), mv("rope", dyn.rope),
  "|",
  liveWire(), crew(VOLTA, "volta"), mv("triggerLow", dyn.triggerLow), slidePlate(), mv("triggerHigh", dyn.triggerHigh), mv("carriage", dyn.carriage),
  crew(ROO, "roo"), mv("stick", dyn.stick), crew(PINCH, "pinch"), standNear(),
];
const cut = parts.indexOf("|");
const backSvg = k.figureSvg({ width: WIDTH, height: HEIGHT, label: LABEL, body: parts.slice(0, cut) });
const frontSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="iso-svg gg-layer" viewBox="0 0 ${WIDTH} ${HEIGHT}" aria-hidden="true">${parts.slice(cut + 1).join("")}</svg>`;

const css = `${crewCss()}${STEPS_CSS}${subjectCss(".gg-glue", "#E4CF95", "#D9C38A")}${subjectCss(".gg-melt", "#E0AE52", "#D6A24A")}${TONES}`;

const body = `<style>${css}</style>` + k.plateHtml({
  fig: "Fig 1",
  title: "Hot glue gun, staffed",
  hint: "Plays on its own, on a loop",
  readout: "off · 22 °C",
  keys,
  caption: `A 230 V hot glue gun for 11.2 mm sticks with its near half taken off and its barrel cut along its length. Two PTC stones under an aluminium block heat the bore to about 190 °C and hold it there by themselves; each pull of the trigger drives the stick 10 mm on, and the solid stick, sealed by a silicone sleeve, pushes the melt ahead of it past a spring-loaded ball and out of the nozzle.`,
  body: `<div class="iso-stage gg-stage" tabindex="0" role="group" aria-label="Hot glue gun, playing on a loop: Space pauses, Home starts again">${backSvg}<canvas class="gg-layer gg-gl" aria-hidden="true"></canvas>${frontSvg}</div>${stepsHtml(STEPS)}`,
});

const file = theme === "light" ? "glue-gun-light.html" : "glue-gun.html";
writeFileSync(join(HERE, file), k.pageHtml({ title: "Hot glue gun, staffed", theme, body, script: kitScript() + glScript() + crewScript() + stepsScript() + pageScript(), width: 720 }));
console.log("wrote", file);
