// A drawer's pin-tumbler lock on a cutaway demonstrator, run from inside: node build.mjs [--light]
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../kit/iso-kit.mjs";
import { crewCss, subjectCss } from "../../kit/critters.mjs";
import { STEPS_CSS, stepsHtml } from "../../kit/steps.mjs";
import { kitScript, crewScript, stepsScript } from "../../scripts/inline-kit.mjs";
import { WIDTH, HEIGHT } from "./model.mjs";
import { figure } from "./figure.mjs";
import { STEPS, reachWarnings, worst } from "./story.mjs";
import { LABEL, KEYS, CAPTION } from "./words.mjs";
import { DRAW_SCRIPT } from "./page-draw.mjs";
import { RUN_SCRIPT } from "./page-run.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
const svg = k.figureSvg({ width: WIDTH, height: HEIGHT, label: LABEL, body: figure().join("") });
const css = `${crewCss()}${STEPS_CSS}${subjectCss(".pl-key", "#C29A3E", "#D6B45C")}${subjectCss(".pl-steel", "#c2c2be", "#4c4c4c")}${subjectCss(".pl-shell", "#e6e5e1", "#262626")}
.pl-void{fill:var(--pl-void)}
.iso{--pl-void:#141414}
.iso[data-theme="light"]{--pl-void:#d3cec5}
.pl-stage{position:relative;touch-action:pan-y;overflow:hidden}
.pl-stage>svg{display:block;width:100%;height:auto}
.pl-stage:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:6px}
@media (max-width:480px){.iso-plate-corner[data-corner="readout"]{font-size:9px;letter-spacing:0}}
.pl-said{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}`;
const body = `<style>${css}</style>` + k.plateHtml({
  fig: "Fig 1",
  title: "Pin tumbler lock, staffed",
  hint: "Plays on its own · drag the key",
  readout: "key A · 0.0 mm in · plug 0° · locked",
  keys: KEYS,
  caption: CAPTION,
  body: `<div class="iso-stage pl-stage" tabindex="0" role="group" aria-label="A pin tumbler lock, playing on a loop: Space pauses and resumes, Home starts again. To take over: drag the key's bow along the key to push it in or pull it out, or up to turn it; 1 and 2 pick key A or key B, left and right arrows push it in and pull it out, up and down arrows turn it and let go, O opens and shuts the drawer.">${svg}</div><p class="pl-said" aria-live="polite" data-said></p>${stepsHtml(STEPS)}`,
});
const file = theme === "light" ? "pin-lock-light.html" : "pin-lock.html";
writeFileSync(join(HERE, file), k.pageHtml({ title: "Pin tumbler lock, staffed", theme, body, script: kitScript() + crewScript() + stepsScript() + DRAW_SCRIPT + RUN_SCRIPT, width: 760 }));
console.log("wrote", file, "· reach warnings", reachWarnings, "· worst reach", Object.entries(worst).map(([n, w]) => n + " " + w.toFixed(2)).join(", "));
