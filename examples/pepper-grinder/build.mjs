// Builds the staffed pepper mill as a standalone page: `node build.mjs` (dark) and `node build.mjs --light`.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { critter, critterSvg, crewCss, subjectCss, ellipsoidOf } from "../../kit/critters.mjs";
import { kitScript, crewScript, stepsScript } from "../../scripts/inline-kit.mjs";
import { STEPS_CSS, stepsHtml } from "../../kit/steps.mjs";
import { C, P, WIDTH, HEIGHT, CHOMP, ROO } from "./model.mjs";
import { room, desk, saucerBack, saucerFront, propsBack, propsFront } from "./scene.mjs";
import { bodyBack, spill, ringBack, heap, yoke, race, bushing, bandsFront, head, knob, tip } from "./mill.mjs";
import { dynamic } from "./dynamic.mjs";
import { poses } from "./poses.mjs";
import { STEPS, LABEL, KEYS, CAPTION, crewChecks } from "./story.mjs";
import { liveScript } from "./live.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
const warnings = crewChecks();

const S0 = { s: 0, kick: 0, phi: 1.2, knob: 0, flutes: [0, 1, 2].map(() => ({ has: true, grow: 1 })), frags: [], dust: [], pile: 0.15, bite: 0, idle: 9, t: 0, near: false, lit: "cone" };
const D0 = dynamic({ ...k, ...L, ellipsoidOf }, P, C, S0);
const Q0 = poses(C, S0);
const g = (name, html, extra = "") => `<g data-part="${name}"${extra}>${html}</g>`;
const crew = (spec, pose, name) => critterSvg(critter(spec, pose, P), { part: name });

const svg = k.figureSvg({
  width: WIDTH, height: HEIGHT, label: LABEL,
  body: [
    room(), desk(), propsBack(), saucerBack(), bodyBack(), spill(), g("pile", D0.pile), ringBack(), heap(),
    crew(CHOMP, Q0.chomp, "chomp"), g("frags", D0.frags), g("corns-back", D0.cornsBack),
    g("yoke", yoke()), g("shaft-low", D0.shaftLow), g("dust-back", D0.dustBack),
    g("race", `${race()}<g data-part="balls">${D0.balls}</g>`), g("cone-body", D0.cone), g("pin", D0.pin), g("corns-front", D0.cornsFront), g("shaft-mid", D0.shaftMid), bushing(), g("shaft-high", D0.shaftHigh),
    crew(ROO, Q0.roo, "roo"), g("dust-front", D0.dustFront),
    bandsFront(), head(), g("head-ribs", D0.headRibs), g("knob", knob()), g("knob-ribs", D0.knobRibs), g("pointer", D0.pointer), g("tip", tip()),
    saucerFront(), propsFront(),
  ],
});

const css = `${crewCss()}${STEPS_CSS}${subjectCss(".pg-corn", "#5E4636", "#8A6A55")}${subjectCss(".pg-dust", "#8B7B6C", "#A39484")}
.iso{--pg-core:#EFE3C8}.iso[data-theme="light"]{--pg-core:#E9DBBA}
.pg-core-fill{fill:var(--pg-core)}
.so-void{fill:var(--anatomy-halo);opacity:.55;stroke:var(--anatomy-lo);stroke-width:var(--anatomy-weight)}
.iso-stage{touch-action:pan-y;cursor:pointer;overflow:hidden}
.iso-stage:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:6px}`;

const body = `<style>${css}</style>` + k.plateHtml({
  fig: "Fig 1", title: "Pepper mill, staffed", hint: "Plays on its own, on a loop", readout: "gap 1.00 mm · 0 corns · 0.00 g", keys: KEYS, caption: CAPTION,
  body: `<div class="iso-stage" tabindex="0" role="group" aria-label="Pepper mill, playing on a loop: Space pauses, Home starts again">${svg}</div>${stepsHtml(STEPS)}`,
});
const file = theme === "light" ? "pepper-grinder-light.html" : "pepper-grinder.html";
writeFileSync(join(HERE, file), k.pageHtml({ title: "Pepper mill, staffed", theme, body, script: kitScript() + crewScript() + stepsScript() + liveScript(), width: 680 }));
console.log("wrote", file, warnings ? `(${warnings} crew warnings)` : "· crew checks clean");
