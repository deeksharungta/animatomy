import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../kit/iso-kit.mjs";
import { critter, critterSvg, crewCss, subjectCss } from "../../kit/critters.mjs";
import { kitScript, glScript, crewScript, stepsScript } from "../../scripts/inline-kit.mjs";
import { STEPS_CSS, stepsHtml } from "../../kit/steps.mjs";
import { WIDTH, HEIGHT, C, P, K, ROO, VOLTA, MO, CRUMB } from "./model.mjs";
import { room, desk, cord, propsBack, propsFront } from "./scene.mjs";
import { station, skirt, housingBack, element, plate, wall, lid, spout } from "./kettle.mjs";
import { housing, handleLoop, insides, wires } from "./handle.mjs";
import { dynamic, poses } from "./moving.mjs";
import { STEPS, LABEL, keys, rest } from "./story.mjs";
import { MODEL_SCRIPT } from "./page-model.mjs";
import { RUN_SCRIPT } from "./page-run.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
const S0 = rest();
const D0 = dynamic(K, P, C, S0);
const pose0 = poses(C, S0, D0);
const crew = (spec, pose, part) => critterSvg(critter(spec, pose, P), { part });
const mv = (name, html) => `<g data-part="${name}">${html}</g>`;

// Back to front: the room, the base, the skirt and what lies in it, the plate and wall, the water,
// the lid and spout, then the handle side from its back wall forward to the switch and Roo.
const parts = [
  room(), desk(), cord(), propsBack(), station(), housingBack(), skirt(), element(), crew(VOLTA, pose0.volta, "volta"), insides(), wires(),
  mv("leaf", D0.leaf), mv("bdleaf", D0.bdLeaf), mv("plunger", D0.plunger), crew(CRUMB, pose0.crumb, "crumb"),
  plate(), wall(), `<g class="kt-water">${mv("water", D0.water + D0.bubbles)}</g>`, lid(), spout(), housing(),
  mv("spring", D0.spring), mv("link", D0.link), mv("disc", D0.disc), mv("bar", D0.bar), crew(MO, pose0.mo, "mo"),
  handleLoop(), mv("rocker", D0.rocker), crew(ROO, pose0.roo, "roo"), propsFront(),
];
const svg = k.figureSvg({ width: WIDTH, height: HEIGHT, label: LABEL, body: parts });

const css = `${crewCss()}${STEPS_CSS}${subjectCss(".kt-water", "#A6D2EC", "#6EA6C8")}
.kt-bubble{fill:var(--anatomy-top);opacity:.85}
.kt-void{fill:var(--anatomy-halo);opacity:.55;stroke:var(--anatomy-lo);stroke-width:var(--anatomy-weight)}
.kt-stage{position:relative;touch-action:pan-y;overflow:hidden}
.kt-stage>svg,.kt-stage>canvas{display:block;width:100%;height:auto}
.kt-stage>canvas{position:absolute;inset:0;height:100%!important;pointer-events:none}
.iso[data-theme="dark"] .kt-stage>canvas,.iso:not([data-theme]) .kt-stage>canvas{mix-blend-mode:screen}
.kt-stage:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:6px}`;

const body = `<style>${css}</style>` + k.plateHtml({
  fig: "Fig 1",
  title: "Kettle, staffed",
  hint: "Plays on its own, on a loop",
  readout: "off · 20 °C · 1000 g",
  keys,
  caption: "A 2.2 kW cordless kettle cut in half, with a litre of water. Roo switches it on, Volta carries the current to the element, and at the boil steam runs down a tube onto Mo's disc, which snaps and throws the switch off. Then Mo dozes off: nothing switches the kettle off, the litre boils away in about eighteen minutes, and the plate overheats until Crumb's boil-dry cut-out stops the power at 140 °C.",
  body: `<div class="iso-stage kt-stage" tabindex="0" role="group" aria-label="Kettle, playing on a loop: Space pauses, Home starts again">${svg}<canvas class="kt-steam" aria-hidden="true"></canvas></div>${stepsHtml(STEPS)}`,
});

const file = theme === "light" ? "kettle-light.html" : "kettle.html";
writeFileSync(join(HERE, file), k.pageHtml({ title: "Kettle, staffed", theme, body, script: kitScript() + glScript() + crewScript() + stepsScript() + MODEL_SCRIPT + RUN_SCRIPT, width: 680 }));
console.log("wrote", file);
