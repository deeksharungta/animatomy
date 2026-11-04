// Builds the staffed electric can opener as a standalone page: `node build.mjs` (dark) and `node build.mjs --light`.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { critter, critterSvg, crewCss, subjectCss } from "../../kit/critters.mjs";
import { kitScript, crewScript, stepsScript } from "../../scripts/inline-kit.mjs";
import { STEPS_CSS, stepsHtml } from "../../kit/steps.mjs";
import { C, P, WIDTH, HEIGHT, CHOMP, BUN, MOCHI, ROO } from "./model.mjs";
import { room, desk, propsBack, propsFront } from "./scene.mjs";
import { cord, shellBack, shellFront, cap } from "./housing.mjs";
import { clamp, wheelBack, wheelFront, drive, pinionBody, gearBody, shaftIn, shaftOut, feedBody, pivot, pivotClip, microswitch, shelf, wiring } from "./mech.mjs";
import { canLow, farShell, soup, lidStatic, nearShell } from "./can.mjs";
import { dynamic } from "./dynamic.mjs";
import { poses } from "./poses.mjs";
import { STEPS, LABEL, KEYS, CAPTION, crewChecks } from "./story.mjs";
import { liveScript } from "./live.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
const warnings = crewChecks();

const S0 = { lev: 0, on: false, omega: 0, wheel: 0.4, gear: 0.2, can: 0.3, cut: 0, pierced: false, free: false, cutting: false, idle: 9, t: 0, throwT: 9, duty: "", lit: "lever" };
const D0 = dynamic({ ...k, ...L }, P, C, S0);
const Q0 = poses(C, S0);
const g = (name, html, extra = "") => `<g data-part="${name}"${extra}>${html}</g>`;
const can = (html) => `<g data-can="">${html}</g>`;
const crew = (spec, pose, name) => critterSvg(critter(spec, pose, P), { part: name });

const svg = k.figureSvg({
  width: WIDTH, height: HEIGHT, label: LABEL,
  body: [
    room(), desk(), propsBack(), cord(), shellBack(), clamp(), pivot(), wiring(), microswitch(), g("plunger", D0.plunger),
    wheelBack(), g("spokes", D0.spokes), g("rungs", D0.rungs), crew(MOCHI, Q0.mochi, "mochi"), crew(BUN, Q0.bun, "bun"), wheelFront(),
    drive(), gearBody(), g("gear", D0.gear), g("holes", D0.holes), pinionBody(), g("pinion", D0.pinion), shaftIn(), shelf(),
    g("lever-in", D0.leverIn), crew(ROO, Q0.roo, "roo"), pivotClip(), shellFront(), cap(),
    shaftOut(), feedBody(), g("feed", D0.feed),
    can(canLow() + g("label", D0.label)), can(farShell()), can(soup()),
    can(g("lid", lidStatic() + g("cut", D0.cut) + g("code", D0.code))),
    g("lever-out", D0.leverOut), crew(CHOMP, Q0.chomp, "chomp"), can(nearShell()), propsFront(),
  ],
});

const css = `${crewCss()}${STEPS_CSS}${subjectCss(".co-label", "#B7402F", "#C9533F")}${subjectCss(".co-soup", "#D9672F", "#E07A3E")}
.co-void{fill:var(--anatomy-halo);opacity:.6;stroke:var(--anatomy-lo);stroke-width:var(--anatomy-weight)}
.iso-stage{touch-action:pan-y;cursor:pointer;overflow:hidden}
.iso-stage:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:6px}`;

const body = `<style>${css}</style>` + k.plateHtml({
  fig: "Fig 1", title: "Can opener, staffed", hint: "Plays on its own, on a loop", readout: "lever up · feed gear 0 rpm · cut 0 of 214 mm", keys: KEYS, caption: CAPTION,
  body: `<div class="iso-stage" tabindex="0" role="group" aria-label="Electric can opener, playing on a loop: Space pauses, Home starts again">${svg}</div>${stepsHtml(STEPS)}`,
});
const file = theme === "light" ? "can-opener-light.html" : "can-opener.html";
writeFileSync(join(HERE, file), k.pageHtml({ title: "Can opener, staffed", theme, body, script: kitScript() + crewScript() + stepsScript() + liveScript(), width: 680 }));
console.log("wrote", file, warnings ? `(${warnings} crew warnings)` : "· crew checks clean");
