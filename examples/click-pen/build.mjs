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
import * as PR from "./props.mjs";
import * as ST from "./stand.mjs";
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
// Back to front, the button end farthest: the room and the back props; the stand's far flanks; the button and the
// clip ring; the pen's far half (bore, threads, ribs); inside it, button to nose, the plunger, the cam's far lugs,
// Rocky, the cam, the refill, the spring with Roo, and the tip; then the pen's near half, the near flanks and the
// bushing at the nose, and the props in front.
const body = [
  SC.walls(), SC.desk(), SC.corkBoard(), SC.calendar(), PR.penCup(), PR.books(), ST.base(), ST.blocksBack(),
  mv("button"), B.topBand(), B.boreAt(C.WIN_A[1], C.BAR.ri), B.backs(), B.ribs(),
  mv("shoulder"), mv("finsBack"), mv("plunger"), mv("fins"), mv("lugBack"), crew(ROCKY, "rocky"), mv("rotor"), mv("lugIn"), mv("lugFin"),
  mv("tube"), mv("ink", "pen-ink"), mv("springBack"), mv("refill"), crew(ROO, "roo"), mv("springFront"), mv("tipIn"),
  B.fronts(), B.clip(), ST.blocksFront(), B.bushing(), mv("tipOut"),
  PR.notebook(), PR.ruler(), PR.eraser(), PR.card(), PR.stickyNotes(),
];
const svg = k.figureSvg({ width: WIDTH, height: HEIGHT, label: LABEL, body });

const css = `${crewCss()}${STEPS_CSS}${subjectCss(".pen-ink", "#3D5BA9", "#6F8CD8")}
.pen-ink-line .iso-line{stroke:#3D5BA9;stroke-width:1.1}
.pen-stage{touch-action:pan-y;overflow:hidden}
.so-void{fill:var(--anatomy-halo);opacity:.55;stroke:var(--anatomy-lo);stroke-width:var(--anatomy-weight)}
.pen-stage:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:6px}`;

const page = `<style>${css}</style>` + k.plateHtml({
  fig: "Fig 1",
  title: "Click pen, staffed",
  hint: "Plays on its own, on a loop",
  readout: "out · tip 2.5 mm · cam 0° · 1.9 N",
  keys,
  caption: "A 6:1 model of a retractable ballpoint, cut in half along its length on a display stand, with the real pen in the cup behind it; the scale on the stand is the real pen's millimetres. Pressing the button drives a sawtooth crown onto a four-lugged cam, pushes it past the barrel's ribs and turns it 15°; letting go, the return spring pushes it back and the ribs' slanted ends turn it 30° more, 45° in all. Its lugs land in short notches and long grooves in turn, so the tip stays 2.5 mm out after one click and goes 0.5 mm inside the nose after the next.",
  body: `<div class="iso-stage pen-stage" tabindex="0" role="group" aria-label="Click pen, playing on a loop: Space pauses, Home starts again">${svg}</div>${stepsHtml(STEPS)}`,
});

const file = theme === "light" ? "click-pen-light.html" : "click-pen.html";
writeFileSync(join(HERE, file), k.pageHtml({ title: "Click pen, staffed", theme, body: page, script: kitScript() + crewScript() + stepsScript() + MODEL_SCRIPT + RUN_SCRIPT, width: 760 }));
console.log("wrote", file);
