// Builds the staffed cylinder music box as a standalone page: `node build.mjs` (dark) and `node build.mjs --light`.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { critter, critterSvg, crewCss, subjectCss } from "../../kit/critters.mjs";
import { kitScript, crewScript, stepsScript } from "../../scripts/inline-kit.mjs";
import { STEPS_CSS, stepsHtml } from "../../kit/steps.mjs";
import { C, P, WIDTH, HEIGHT, ROO, PINCH } from "./model.mjs";
import "./tune.mjs";
import { room, desk, propsBack, propsFront } from "./scene.mjs";
import { lid, caseBack, rightLip, frontLip } from "./case.mjs";
import { bedplate, combBed, barrelPillar, barrelCock, bridgeLeft, bridgeRight, postMid, govFoot, govPillar, govCock, leverPlate, changeLever } from "./bed.mjs";
import { barrelBack, barrelFront } from "./barrel.mjs";
import { cylinder, cylinderEnd, pinionBody, wheelBody, midTrain, wormBody, arborLow, combBase } from "./drive.mjs";
import { moving } from "./moving.mjs";
import { teethOf } from "./teeth.mjs";
import { poses } from "./poses.mjs";
import { STEPS, LABEL, KEYS, CAPTION, crewChecks } from "./story.mjs";
import { liveScript, START } from "./live.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
const warnings = crewChecks();

const S0 = { ...START, lift: new Array(C.COMB.n).fill(0), amp: new Array(C.COMB.n).fill(0) };
const KL = { ...k, ...L };
const D0 = moving(KL, P, C, S0), Q0 = poses(C, S0);
const g = (name, html) => `<g data-part="${name}">${html}</g>`;
const crew = (spec, pose, name) => critterSvg(critter(spec, pose, P), { part: name });

const svg = k.figureSvg({
  width: WIDTH, height: HEIGHT, label: LABEL,
  body: [
    room(), desk(), propsBack(), lid(), caseBack(), bedplate(), barrelPillar(),
    midTrain(), g("midPin", D0.midPin), g("midWheel", D0.midWheel), postMid(),
    barrelBack(), g("crownBack", D0.crownBack), `<g data-slot="rooBack"></g>`, arborLow(), barrelCock(),
    `<g data-slot="rooFront">${crew(ROO, Q0.roo, "roo")}</g>`, g("ratchet", D0.ratchet), g("key", D0.key), barrelFront(), g("crownFront", D0.crownFront),
    pinionBody(), g("pinion", D0.pinion), bridgeLeft(),
    g("cyl", cylinder()), g("pins", D0.pins), cylinderEnd(), wheelBody(), g("wheel", D0.wheel), g("holes", D0.holes), bridgeRight(),
    govFoot(), wormBody(), g("thread", D0.thread), govPillar(), govCock(), g("fly", D0.fly), crew(PINCH, Q0.pinch, "pinch"),
    g("teeth", teethOf(KL, P, C, S0)), combBed(), combBase(),
    leverPlate(), g("lever", D0.lever), changeLever(), rightLip(), frontLip(), propsFront(),
  ],
});

const css = `${crewCss()}${STEPS_CSS}${subjectCss(".mb-brass", "#C9A646", "#D4B25A")}
.mb-void{fill:var(--anatomy-halo);opacity:.7;stroke:var(--anatomy-lo);stroke-width:var(--anatomy-weight)}
.mb-ring{fill:var(--anatomy-hi);stroke:none}
.iso-stage{touch-action:pan-y;overflow:hidden}
.iso-stage:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:6px}`;

const body = `<style>${css}</style>` + k.plateHtml({
  fig: "Fig 1", title: "Music box, staffed", hint: "Plays on its own, on a loop", readout: "run down · cylinder 0.0 rpm · fly 0 rpm · spring 0.00 turn", keys: KEYS, caption: CAPTION,
  body: `<div class="iso-stage" tabindex="0" role="group" aria-label="Cylinder music box, playing on a loop: Space pauses, Home starts again">${svg}</div>${stepsHtml(STEPS)}`,
});
const file = theme === "light" ? "music-box-light.html" : "music-box.html";
writeFileSync(join(HERE, file), k.pageHtml({ title: "Music box, staffed", theme, body, script: kitScript() + crewScript() + stepsScript() + liveScript(), width: 720 }));
console.log("wrote", file, warnings ? `(${warnings} crew warnings)` : "· crew checks clean");
