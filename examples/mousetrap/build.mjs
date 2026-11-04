// Builds the staffed mousetrap as a standalone page: `node build.mjs` (dark) and `node build.mjs --light`.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { critter, critterSvg, crewCss, subjectCss } from "../../kit/critters.mjs";
import { kitScript, crewScript, stepsScript } from "../../scripts/inline-kit.mjs";
import { STEPS_CSS, stepsHtml } from "../../kit/steps.mjs";
import { C, P, WIDTH, HEIGHT, ROO, PINCH, pedalPt } from "./model.mjs";
import { room, floor } from "./scene.mjs";
import { propsBack, propsFront } from "./props.mjs";
import { base, label, axle, axleStaples, eye, barStaple, pedalStaple, legStaple, pedalRoll } from "./trap.mjs";
import { wireOf, bendOf } from "./wire.mjs";
import { dynamic } from "./moving.mjs";
import { poses } from "./poses.mjs";
import { STEPS, LABEL, KEYS, CAPTION, crewChecks, START } from "./story.mjs";
import { liveScript } from "./live.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
const warnings = crewChecks();
globalThis.wireOf = wireOf; globalThis.bendOf = bendOf; globalThis.pedalPt = pedalPt;

const S0 = START;
const D0 = dynamic({ ...k, ...L }, P, C, S0), Q0 = poses(C, S0);
const g = (name, html) => `<g data-part="${name}">${html}</g>`;
const crew = (spec, pose, name) => critterSvg(critter(spec, pose, P), { part: name });

const svg = k.figureSvg({
  width: WIDTH, height: HEIGHT, label: LABEL,
  body: [
    room(), floor(), propsBack(), base(), label(),
    g("springFar", D0.springFar), legStaple(-1),
    axle(-C.SPRING.y0 + 0.5, C.SPRING.y0 - 0.5), axleStaples(), eye(-C.ARM_Y), g("armFar", D0.armFar),
    barStaple(), g("plate", D0.plate), pedalStaple(), pedalRoll(), g("cheese", D0.cheese), g("cross", D0.cross), g("bar", D0.bar), g("tab", D0.tab),
    crew(PINCH, Q0.pinch, "pinch"), eye(C.ARM_Y), g("armNear", D0.armNear), g("springNear", D0.springNear), legStaple(1),
    crew(ROO, Q0.roo, "roo"), g("pencil", D0.pencil), propsFront(),
  ],
});

const sc = P.scale;
const css = `${crewCss()}${STEPS_CSS}${subjectCss(".mt-cheese", "#F2C14E", "#E9B949")}
.mt-coil .i{fill:none;vector-effect:none;stroke-linecap:round;stroke-linejoin:round;stroke:var(--anatomy-top);stroke-width:${(C.SPRING.wire * sc).toFixed(2)}px}
.mt-coil.b .i{stroke:var(--anatomy-shade-1)}
.mt-void{fill:var(--anatomy-halo);opacity:.7;stroke:var(--anatomy-lo);stroke-width:var(--anatomy-weight)}
.mt-hole{fill:var(--anatomy-shade-0);stroke:var(--anatomy-mid);stroke-width:var(--anatomy-weight)}
.iso-stage{touch-action:pan-y;overflow:hidden}
.iso-stage:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:6px}`;

const body = `<style>${css}</style>` + k.plateHtml({
  fig: "Fig 1", title: "Mousetrap, staffed", hint: "Plays on its own · drag the cheese", readout: "set · 180° · catch 14 g",
  keys: KEYS, caption: CAPTION,
  body: `<div class="iso-stage" tabindex="0" role="group" aria-label="Mousetrap, playing on a loop: Space pauses, Home starts again; drag the cheese or press the down arrow to spring it, drag the hammer back or press the up arrow to set it">${svg}</div><p class="mt-said" data-said aria-live="polite" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)"></p>${stepsHtml(STEPS)}`,
});
const file = theme === "light" ? "mousetrap-light.html" : "mousetrap.html";
writeFileSync(join(HERE, file), k.pageHtml({ title: "Mousetrap, staffed", theme, body, script: kitScript() + crewScript() + stepsScript() + liveScript(), width: 760 }));
console.log("wrote", file, warnings ? `(${warnings} crew warnings)` : "· crew checks clean");
