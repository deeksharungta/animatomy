import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../kit/iso-kit.mjs";
import { critter, critterSvg, crewCss, subjectCss } from "../../kit/critters.mjs";
import { kitScript, crewScript, stepsScript } from "../../scripts/inline-kit.mjs";
import { STEPS_CSS, stepsHtml } from "../../kit/steps.mjs";
import { WIDTH, HEIGHT, C, P, KNOCK, ROCKY } from "./model.mjs";
import { outsideBack, outsideFront, door, viewer, hooks } from "./scene.mjs";
import { plate, studs, gong, shelf } from "./parts.mjs";
import { poses } from "./poses.mjs";
import { STEPS, LABEL, keys, rest, draw0, reach } from "./story.mjs";
import { MODEL_SCRIPT } from "./page-model.mjs";
import { RUN_SCRIPT } from "./page-run.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
reach();
const S0 = rest();
const D0 = draw0(S0);
const pose0 = poses(C, S0, D0);
const crew = (spec, key) => critterSvg(critter(spec, pose0[key], P), { part: key });
const mv = (name) => `<g data-part="${name}">${D0[name]}</g>`;

// Back to front: the key and rose outside, the door, what is on its face, the bell's plate, studs and posts,
// the wheel and click with Rocky, the nut, the gong, then the hammer with Knock clinging to its stem.
const body = [
  mv("key"), outsideBack(), mv("spinOut"), outsideFront(), door(), viewer(), hooks(),
  plate(), studs(), mv("cspring"), mv("wheel"), mv("click"), mv("nut"), shelf(), crew(ROCKY, "rocky"),
  gong(), mv("hammer"), mv("hspring"), mv("head"), crew(KNOCK, "knock"),
];
const svg = k.figureSvg({ width: WIDTH, height: HEIGHT, label: LABEL, body });

const css = `${crewCss()}${STEPS_CSS}${subjectCss(".db-gong", "#B8913F", "#C9A458")}
.db-stage{touch-action:pan-y;overflow:hidden}
.db-stage:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:6px}`;

const page = `<style>${css}</style>` + k.plateHtml({
  fig: "Fig 1",
  title: "Twist doorbell, staffed",
  hint: "Plays on its own, on a loop",
  readout: "still · key 0° · 0 rings",
  keys,
  caption: "A twist doorbell on the inside of a front door, the door cut away through the key's square spindle. Twisting the key outside turns a six-toothed star wheel. Each tooth's ramp pushes the hammer's tail out, cocking Knock against his spring; at the steep face the tail drops, the spring throws the ball head onto the brass gong and it bounces clear so the gong rings. Rocky's click rides the same teeth and jams a steep face if the key is turned back. One turn rings six times.",
  body: `<div class="iso-stage db-stage" tabindex="0" role="group" aria-label="Twist doorbell, playing on a loop: Space pauses, Home starts again">${svg}</div>${stepsHtml(STEPS)}`,
});

const file = theme === "light" ? "doorbell-light.html" : "doorbell.html";
writeFileSync(join(HERE, file), k.pageHtml({ title: "Twist doorbell, staffed", theme, body: page, script: kitScript() + crewScript() + stepsScript() + MODEL_SCRIPT + RUN_SCRIPT, width: 680 }));
console.log("wrote", file);
