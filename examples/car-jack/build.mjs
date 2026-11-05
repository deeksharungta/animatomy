// Builds the staffed bottle jack as a standalone page: `node build.mjs` (dark) and `node build.mjs --light`.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { critter, critterSvg, crewCss, subjectCss } from "../../kit/critters.mjs";
import { kitScript, crewScript, stepsScript } from "../../scripts/inline-kit.mjs";
import { STEPS_CSS, stepsHtml } from "../../kit/steps.mjs";
import { C, P, WIDTH, HEIGHT, OTTIE, PINCH } from "./model.mjs";
import { room, floor, propsBack } from "./scene.mjs";
import { stand } from "./stand.mjs";
import { liner, wheel } from "./wheel.mjs";
import { baseBack, galleries, baseParts, pumpBody } from "./base.mjs";
import { tubeBack, cylinderBack, nut, ram } from "./bottle.mjs";
import { sill, arch, door } from "./car.mjs";
import { dynamic } from "./moving.mjs";
import { poses } from "./poses.mjs";
import { STEPS, LABEL, KEYS, CAPTION, crewChecks } from "./story.mjs";
import { liveScript, START } from "./live.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
const warnings = crewChecks();

const D0 = dynamic({ ...k, ...L }, P, C, START), Q0 = poses(C, START);
const g = (name, html, extra = "") => `<g data-part="${name}"${extra}>${html}</g>`;
const oil = (name) => `<g class="cj-oil">${g(name, D0[name])}</g>`;
const lift = ` transform="${k.translateAlong(P, [0, 0, 0])}"`;
const crew = (spec, pose, name) => critterSvg(critter(spec, pose, P), { part: name });

const svg = k.figureSvg({
  width: WIDTH, height: HEIGHT, label: LABEL,
  body: [
    room(), floor(), propsBack(), g("liner", liner(), lift), g("wheel", wheel()), stand(),
    baseBack(), galleries(), baseParts(), oil("beads"), g("ball", D0.ball), g("needle", D0.needle), g("knob", D0.knob), crew(PINCH, Q0.pinch, "pinch"),
    g("link", D0.link), pumpBody(), g("socket", D0.socket),
    tubeBack(), oil("res"), cylinderBack(), oil("cyl"), nut(), g("ram", ram(), ` transform="${k.translateAlong(P, [0, 0, START.e])}"`),
    g("body", arch() + sill() + door(), lift), oil("cham"), g("cup", D0.cup), g("cross", D0.cross), crew(OTTIE, Q0.ottie, "ottie"), g("sleeve", D0.sleeve), g("handle", D0.handle),
  ],
});

const css = `${crewCss()}${STEPS_CSS}${subjectCss(".cj-oil", "#D9A03A", "#D8A043")}${subjectCss(".cj-cave", "#c9c6c0", "#4a4844")}${subjectCss(".cj-rubber", "#a8a49e", "#6e6b66")}
.cj-bead{fill:var(--cj-bead);stroke:none}.iso{--cj-bead:#fff1c4}.iso[data-theme="light"]{--cj-bead:#fff6d8}
.cj-void{fill:var(--anatomy-halo);opacity:.6;stroke:var(--anatomy-lo);stroke-width:var(--anatomy-weight)}
.iso-stage{touch-action:pan-y;cursor:pointer;overflow:hidden}
.iso-stage:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:6px}`;

const body = `<style>${css}</style>` + k.plateHtml({
  fig: "Fig 1", title: "Bottle jack, staffed", hint: "Plays on its own, on a loop", readout: `stroke 0/${C.STROKES} · ram +0 mm · 0 bar · grip 0.0 kg`, keys: KEYS, caption: CAPTION,
  body: `<div class="iso-stage" tabindex="0" role="group" aria-label="Hydraulic bottle jack lifting a car, playing on a loop: Space pauses, Home starts again">${svg}</div>${stepsHtml(STEPS)}`,
});
const file = theme === "light" ? "car-jack-light.html" : "car-jack.html";
writeFileSync(join(HERE, file), k.pageHtml({ title: "Bottle jack, staffed", theme, body, script: kitScript() + crewScript() + stepsScript() + liveScript(), width: 680 }));
console.log("wrote", file, warnings ? `(${warnings} crew warnings)` : "· crew checks clean");
