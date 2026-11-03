import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../kit/iso-kit.mjs";
import { critter, critterSvg, crewCss, subjectCss } from "../../kit/critters.mjs";
import { kitScript, crewScript, stepsScript } from "../../scripts/inline-kit.mjs";
import { STEPS_CSS, stepsHtml } from "../../kit/steps.mjs";
import { WIDTH, HEIGHT, C, P } from "./model.mjs";
import * as B from "./barrel.mjs";
import * as SC from "./scene.mjs";
import { poses } from "./poses.mjs";
import { STEPS, LABEL, keys, rest, draw0, reach, F, ROCKY, ROO } from "./story.mjs";
import { MODEL_SCRIPT } from "./page-model.mjs";
import { RUN_SCRIPT } from "./page-run.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
reach();
const S0 = rest(), D0 = draw0(S0), pose0 = poses(C, S0, D0, F);
const crew = (spec, key) => critterSvg(critter(spec, pose0[key], P), { part: key });
const mv = (name, cls = "") => `<g data-part="${name}"${cls ? ` class="${cls}"` : ""}>${D0[name]}</g>`;
const [A0] = C.WIN_A, [, B1] = C.WIN_B;

// Back to front, bottom to top: the room and the stand; the nose and window B with the spring and Roo;
// the barrel and the clamp; window A with the ribs, the cam, the button's crown and Rocky; then the top.
const body = [
  SC.walls(), SC.bench(), SC.ruler(), SC.notepad(), SC.writing(), SC.stand(), B.clip(),
  B.nose(), mv("tip"), B.windowB(), mv("springBack"), mv("refill"), mv("ink", "pen-ink"), mv("springFront"), crew(ROO, "roo"),
  B.tube(B1, C.GRIP[0]), SC.jawBack(), B.grip(), SC.jawFront(), B.tube(C.GRIP[1], C.BAND[0]), B.centreBand(),
  B.windowA(), B.ribBack(), mv("lugBack"), mv("finsBack"), B.ribSides(), mv("rotor"), mv("lugIn"), mv("plunger"), mv("shoulder"), mv("lugFin"), mv("fins"), crew(ROCKY, "rocky"),
  B.topBand(), mv("button"),
];
const svg = k.figureSvg({ width: WIDTH, height: HEIGHT, label: LABEL, body });

const css = `${crewCss()}${STEPS_CSS}${subjectCss(".pen-ink", "#3D5BA9", "#6F8CD8")}
.pen-ink-line .iso-line{stroke:#3D5BA9;stroke-width:1.1}
.pen-stage{touch-action:pan-y;overflow:hidden}
.pen-stage:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:6px}`;

const page = `<style>${css}</style>` + k.plateHtml({
  fig: "Fig 1",
  title: "Click pen, staffed",
  hint: "Plays on its own, on a loop",
  readout: "out · tip 2.5 mm · cam 0° · 1.9 N",
  keys,
  caption: "A retractable ballpoint pen cut away over its click mechanism and its nose. Pressing the button drives a sawtooth crown onto a four-lugged cam, pushes it below the barrel's ribs and turns it 15°; letting go, the return spring lifts it and the ribs' slanted ends turn it 30° more, 45° in all. Its lugs land in short notches and long grooves in turn, so the tip stays 2.5 mm out after one click and goes 0.5 mm inside the nose after the next.",
  body: `<div class="iso-stage pen-stage" tabindex="0" role="group" aria-label="Click pen, playing on a loop: Space pauses, Home starts again">${svg}</div>${stepsHtml(STEPS)}`,
});

const file = theme === "light" ? "click-pen-light.html" : "click-pen.html";
writeFileSync(join(HERE, file), k.pageHtml({ title: "Click pen, staffed", theme, body: page, script: kitScript() + crewScript() + stepsScript() + MODEL_SCRIPT + RUN_SCRIPT, width: 640 }));
console.log("wrote", file);
