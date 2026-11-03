import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../kit/iso-kit.mjs";
import { critter, critterSvg, crewCss, subjectCss } from "../../kit/critters.mjs";
import { kitScript, crewScript, stepsScript } from "../../scripts/inline-kit.mjs";
import { STEPS_CSS, stepsHtml } from "../../kit/steps.mjs";
import { WIDTH, HEIGHT, C, P, K, MO, PINCH, KNOCK, eventsOf, stateAt } from "./model.mjs";
import { room, desk, keyboard } from "./scene.mjs";
import { base, rail, shaft, dashpotBack, dashpotFront, pushrod, guides, crossheadBack, crossheadFront, ruler, tripEye, bellSide, bell, searStud, perch } from "./machine.mjs";
import { openBox } from "./helpers.mjs";
import { dynamic } from "./moving.mjs";
import { poses } from "./poses.mjs";
import { STEPS, LABEL, keysLegend, CAPTION } from "./story.mjs";
import { PAGE_SCRIPT } from "./page.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
const S0 = stateAt(C, eventsOf(C), 0), D0 = dynamic(K, P, C, S0), pose0 = poses(C, S0, D0);
const mv = (name, html = "") => `<g data-part="${name}">${html}</g>`;
const crew = (spec, name) => critterSvg(critter(spec, pose0[name], P), { part: name });
const R = rail(), bin = openBox(C.BIN, C.FLOOR, 9);

// Back to front: the room and desk, the bell side at the back right, the dashpot, the crosshead, the crew, the shaft, the bin.
const parts = [
  room(), desk(), base(),
  R.back, mv("rail", D0.rail), R.front, bellSide(),
  dashpotBack(), mv("piston", D0.piston), dashpotFront(), mv("rodUp", D0.rodUp),
  mv("push", pushrod()), guides(), mv("hammer", D0.hammer), mv("xback", crossheadBack()), tripEye(),
  searStud(), mv("sear", D0.sear), mv("platform", D0.platform), crew(PINCH, "pinch"), mv("bell", bell()), mv("hammerFront", D0.hammerFront),
  crew(MO, "mo"), ruler(), mv("xfront", crossheadFront()), perch(C.PERCH), crew(KNOCK, "knock"),
  shaft(), mv("lift", D0.lift), mv("paddle", D0.paddle),
  bin.back, mv("pile", D0.pile), mv("cup", D0.cup), bin.front,
  keyboard(),
];
const svg = k.figureSvg({ width: WIDTH, height: HEIGHT, label: LABEL, body: parts });

const css = `${crewCss()}${STEPS_CSS}${subjectCss(".db-ball", "#C99A2E", "#D8A93C")}
.db-void{fill:var(--anatomy-halo);opacity:.6;stroke:var(--anatomy-lo);stroke-width:var(--anatomy-weight)}
.db-glass .iso-fill,.db-glass .iso-shade,.db-glass .iso-top{opacity:.16}
.db-oil .iso-fill,.db-oil .iso-shade,.db-oil .iso-top{opacity:.55}
.iso-stage{touch-action:pan-y;overflow:hidden}
.iso-stage:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:6px}`;

const body = `<style>${css}</style>` + k.plateHtml({
  fig: "Fig 1",
  title: "Debounce timer, staffed",
  hint: "Plays on its own, on a loop",
  readout: `wait 0 ms · keys 0 · rings 0 · 0.00 s`,
  keys: keysLegend,
  caption: CAPTION,
  body: `<div class="iso-stage" tabindex="0" role="group" aria-label="Debounce timer, playing on a loop: Space pauses, Home starts again">${svg}</div>${stepsHtml(STEPS)}`,
});

const file = theme === "light" ? "debounce-light.html" : "debounce.html";
writeFileSync(join(HERE, file), k.pageHtml({ title: "Debounce timer, staffed", theme, body, script: kitScript() + crewScript() + stepsScript() + PAGE_SCRIPT, width: 700 }));
console.log("wrote", file);
