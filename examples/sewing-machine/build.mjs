// Builds the staffed sewing machine as a standalone page: `node build.mjs` (dark) and `node build.mjs --light`.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { critter, critterSvg, crewCss, subjectCss } from "../../kit/critters.mjs";
import { kitScript, crewScript, stepsScript } from "../../scripts/inline-kit.mjs";
import { STEPS_CSS, stepsHtml } from "../../kit/steps.mjs";
import { C, P, WIDTH, HEIGHT, KNOCK, PINCH, MO, BUN, MOCHI, kin, ease } from "./model.mjs";
import { room, desk, propsBack, propsFront, pedal } from "./scene.mjs";
import { bedBack, pit, bobbin, skin } from "./bed.mjs";
import { pillarBack, pillarFront, upperBack, upperFront, headBack, headFront } from "./body.mjs";
import { wheelBack, wheelFront, handBack, shaft, topParts } from "./drive.mjs";
import { headInside, presserBar, presserFoot, collarPerch, tension, selector } from "./head.mjs";
import { dynamic } from "./moving.mjs";
import { threads } from "./thread.mjs";
import { poses } from "./poses.mjs";
import { STEPS, LABEL, KEYS, CAPTION, crewChecks } from "./story.mjs";
import { liveScript } from "./live.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
const warnings = crewChecks();

const S0 = { th: 0, omega: 0, wheel: 0.3, t: 0, idle: 9, holes: [], off: 0, lit: "needle", duty: "" };
const K = { ...k, ...L, kin, ease };
const D0 = dynamic(K, P, C, S0), Q0 = poses(C, S0, kin), T0 = threads(K, P, C, S0, C.ROUTE, D0, Q0);
const g = (name, html, cls = "") => `<g data-part="${name}"${cls ? ` class="${cls}"` : ""}>${html}</g>`;
const crew = (spec, pose, name) => critterSvg(critter(spec, pose, P), { part: name });
const slot = (name, html = "") => `<g data-slot="${name}">${html}</g>`;
const az = (P.azimuth * Math.PI) / 180, ahead = (q) => (q.pinch.at[0] - C.B[0]) * Math.cos(az) + (q.pinch.at[1] - C.B[1]) * Math.sin(az) > 0;
const at0 = ahead(Q0) ? "pinchFront" : "pinchBack";
const pinch = (name) => slot(name, name === at0 ? crew(PINCH, Q0.pinch, "pinch") : "");

const svg = k.figureSvg({
  width: WIDTH, height: HEIGHT, label: LABEL,
  body: [
    room(), desk(), propsBack(), bedBack(), pit(), g("needleLow", D0.needleLow), pinch("pinchBack"), bobbin(), g("low", T0.low),
    skin(), g("cloth", D0.cloth, "sm-cloth"), g("stitches", D0.stitches), pinch("pinchFront"), crew(MO, Q0.mo, "mo"), presserFoot(),
    handBack(), g("hand", D0.hand), pillarBack(), wheelBack(), g("belt", D0.belt), g("spokes", D0.spokes), g("rungs", D0.rungs),
    crew(MOCHI, Q0.mochi, "mochi"), crew(BUN, Q0.bun, "bun"), wheelFront(), pillarFront(),
    upperBack(), shaft(), headBack(), headInside(), g("link", D0.link), g("crank", D0.crank), presserBar(),
    upperFront(), headFront(), g("takeOut", D0.takeOut), tension(), selector(), topParts(), collarPerch(),
    crew(KNOCK, Q0.knock, "knock"), g("needleHigh", D0.needleHigh), g("top", T0.top), propsFront(), pedal(),
  ],
});

const css = `${crewCss()}${STEPS_CSS}${subjectCss(".sm-cloth", "#4C6E9E", "#5A7DB0")}${subjectCss(".sm-wound", "#C99A3A", "#D9A845")}
.sm-thread{fill:none;stroke:#B8862A;stroke-width:1.4px;vector-effect:non-scaling-stroke;stroke-linecap:round;stroke-linejoin:round}
.sm-stitch{stroke-width:2.2px}
.iso[data-theme="dark"] .sm-thread,.iso:not([data-theme]) .sm-thread{stroke:#D9A845}
[data-part="knock"] [data-k="ground"]{display:none}
.iso-stage{touch-action:pan-y;overflow:hidden}
.iso-stage:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:6px}`;

const body = `<style>${css}</style>` + k.plateHtml({
  fig: "Fig 1", title: "Sewing machine, staffed", hint: "Plays on its own, on a loop", readout: "ready · 0 stitches/min · 0 stitches · 0 mm sewn", keys: KEYS, caption: CAPTION,
  body: `<div class="iso-stage" tabindex="0" role="group" aria-label="Lockstitch sewing machine, playing on a loop: Space pauses, Home starts again">${svg}</div>${stepsHtml(STEPS)}`,
});
const file = theme === "light" ? "sewing-machine-light.html" : "sewing-machine.html";
writeFileSync(join(HERE, file), k.pageHtml({ title: "Sewing machine, staffed", theme, body, script: kitScript() + crewScript() + stepsScript() + liveScript(), width: 800 }));
console.log("wrote", file, warnings ? `(${warnings} crew warnings)` : "· crew checks clean");
