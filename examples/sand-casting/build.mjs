// Molten steel poured into a sand mould, cut away and staffed: node build.mjs [--light]
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../kit/iso-kit.mjs";
import { critter, critterSvg, crewCss, subjectCss } from "../../kit/critters.mjs";
import { kitScript, glScript, crewScript, stepsScript } from "../../scripts/inline-kit.mjs";
import { STEPS_CSS, stepsHtml } from "../../kit/steps.mjs";
import { WIDTH, HEIGHT, C, PH, GEO, P, K, PINCH, OLLIE } from "./model.mjs";
import { fresh, levelZ } from "./physics.mjs";
import { room, floor, beam, trolley, props, nextMould, pendant } from "./scene.mjs";
import { board, drag, cope, endFittings } from "./mould.mjs";
import { copeTop, cup, sleeve, section, outlines } from "./mould-top.mjs";
import { LEFT, RIGHT, fillOf } from "./section.mjs";
import { ladle } from "./ladle.mjs";
import { steelPath, poses } from "./moving.mjs";
import { STEPS, LABEL, keys, NUM } from "./story.mjs";
import { CSS } from "./style.mjs";
import { pageScript } from "./page.mjs";
import { REACH } from "./reach.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
const S0 = fresh(PH);
const F0 = fillOf(C, GEO, S0, levelZ);
const L0 = ladle(K, P, C, S0);
const pose0 = poses(C, S0, F0, GEO);
const crew = (spec, pose, part) => critterSvg(critter(spec, pose, P), { part });
const g = (name, html, extra = "") => `<g data-part="${name}"${extra}>${html}</g>`;
const clip = `<clipPath id="sc-cav"><path d="${k.pathOf(LEFT.map(([x, z]) => k.iso([x, 0, z], P)), true)}${k.pathOf(RIGHT.map(([x, z]) => k.iso([x, 0, z], P)), true)}"/></clipPath>`;

// Back to front. The steel's glow and heat are painted on a canvas between the "|" cut and the front drawing.
const parts = [
  `<defs>${clip}</defs>`, room(), floor(), props(), nextMould(), g("ropes", L0.ropes), beam(), trolley(), pendant(),
  board(), drag(), cope(), copeTop(), g("spill-fb", ""), cup(), sleeve(), section(),
  `<g clip-path="url(#sc-cav)" class="sc-steel">${g("steel", `<path class="sc-metal" d="${steelPath(K, P, C, F0)}"/>`)}${g("hot", `<path class="sc-hot" d=""/>`)}</g>`,
  outlines(), endFittings(),
  "|",
  g("ladle-back", L0.back), g("ladle-body", L0.body), g("stream-fb", ""), g("ladle-front", L0.front),
  crew(OLLIE, pose0.ollie, "ollie"), crew(PINCH, pose0.pinch, "pinch"),
];
const cut = parts.indexOf("|");
const backSvg = k.figureSvg({ width: WIDTH, height: HEIGHT, label: LABEL, body: parts.slice(0, cut) });
const frontSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="iso-svg sc-layer" viewBox="0 0 ${WIDTH} ${HEIGHT}" aria-hidden="true">${parts.slice(cut + 1).join("")}</svg>`;

const body = `<style>${crewCss()}${STEPS_CSS}${subjectCss(".sc-steel", "#8E959E", "#5E656E")}${CSS}</style>` + k.plateHtml({
  fig: "Fig 1",
  title: "Pouring steel into sand, staffed",
  hint: "Plays on its own · drag the ladle",
  readout: `ready · ${PH.T_POUR} °C · 0.0 kg/s · 0% full`,
  keys,
  caption: `A teapot ladle pours plain carbon steel (0.25% C: liquidus ${PH.T_LIQ} °C, solidus ${PH.T_SOL} °C) at ${PH.T_POUR} °C into a green-sand mould for a flanged sleeve. The basin keeps the 16 mm choke at the sprue's foot running full at about ${PH.QSTAR} kg/s, so ${NUM.kg} kg fills the mould in ${NUM.fill} s from the bottom up. Pour slower than about 1.3 kg/s and the front cools into its freezing range and stops short; pour faster than the choke's ${NUM.qc} kg/s and the basin overflows onto the cope. The cope is shallow, with the cup and an insulating sleeve standing on it, so it weighs only ${NUM.cope} N: the steel's head in the riser pushes it up with ${NUM.lift} N, and the clamp holds the difference, ${NUM.hold} N. The riser has 1.2 times the casting's modulus, so it freezes last; it feeds the ${PH.SHRINK * 100}% the steel shrinks as it freezes (${NUM.fedL} L) and is left with a ${NUM.pipe} mm pipe. Drag the ladle or press ← → to tip it yourself; Space plays on.`,
  body: `<div class="iso-stage sc-stage" tabindex="0" role="group" aria-label="A ladle pouring steel into a sand mould, playing on a loop: Space pauses and plays on, Home starts again, left and right arrows tip the ladle">${backSvg}<canvas class="sc-layer sc-gl" aria-hidden="true"></canvas>${frontSvg}</div><p class="sc-said" aria-live="polite" data-said></p>${stepsHtml(STEPS)}`,
});

const file = theme === "light" ? "sand-casting-light.html" : "sand-casting.html";
writeFileSync(join(HERE, file), k.pageHtml({ title: "Pouring steel into sand, staffed", theme, body, script: kitScript() + glScript() + crewScript() + stepsScript() + pageScript(), width: 700 }));
console.log("wrote", file, "· worst reach", REACH.pinch.worst.toFixed(2), REACH.ollie.worst.toFixed(2));
