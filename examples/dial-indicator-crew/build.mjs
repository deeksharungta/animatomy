// A dial indicator on a magnetic stand, its case cut open, run from inside: node build.mjs [--light]
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../kit/iso-kit.mjs";
import { crewCss, subjectCss } from "../../kit/critters.mjs";
import { STEPS_CSS, stepsHtml } from "../../kit/steps.mjs";
import { kitScript, crewScript, stepsScript } from "../../scripts/inline-kit.mjs";
import { WIDTH, HEIGHT, M, C } from "./model.mjs";
import { figure } from "./figure.mjs";
import { STEPS, reachWarnings, worst } from "./story.mjs";
import { LABEL, KEYS, CAPTION } from "./words.mjs";
import { DRAW_SCRIPT } from "./page-draw.mjs";
import { RUN_SCRIPT } from "./page-run.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
const svg = k.figureSvg({ width: WIDTH, height: HEIGHT, label: LABEL, body: figure() });
const css = `${crewCss()}${STEPS_CSS}${subjectCss(".di-steel", "#B4BCC4", "#C0C8D0")}
.di-wall{fill:var(--anatomy-shade-0)}
.di-window{fill:var(--di-void)}
.iso{--di-void:#0b0b0b}
.iso[data-theme="light"]{--di-void:#8f8b84}
.iso[data-theme="light"] .di-cavity{--anatomy-paper:#bdb9b2;--anatomy-face:#bdb9b2;--anatomy-top:#cfcbc4;--anatomy-shade-0:#a9a59e;--anatomy-shade-1:#b3afa8;--anatomy-shade-2:#bdb9b2;--anatomy-shade-3:#c7c3bc}
.iso[data-theme="light"] .di-brass{--anatomy-paper:#e9e5dc;--anatomy-face:#e9e5dc;--anatomy-top:#f1ede5;--anatomy-shade-0:#d9d4ca;--anatomy-shade-1:#e0dbd2;--anatomy-shade-2:#e6e2d9;--anatomy-shade-3:#ece8e0}
.di-stage{position:relative;touch-action:pan-y;overflow:hidden}
.di-stage>svg{display:block;width:100%;height:auto}
.di-stage:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:6px}
@media (max-width:480px){.iso-plate-corner[data-corner="readout"]{font-size:9.5px;letter-spacing:0}}
.di-said{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}`;
const r0 = M.show(M.reading(C.PRELOAD, 0.27));
const body = `<style>${css}</style>` + k.plateHtml({
  fig: "Fig 1",
  title: "Dial indicator, staffed",
  hint: "Plays on its own · keys 1–5 or drag a block",
  readout: `1.00 mm block · reads ${r0}`,
  keys: KEYS,
  caption: CAPTION,
  body: `<div class="iso-stage di-stage" tabindex="0" role="group" aria-label="Dial indicator, playing on a loop: Space pauses and resumes, Home starts again. To take over: keys 1 to 5 or left and right arrows choose a gauge block, or drag one in the row; Z sets the zero.">${svg}</div><p class="di-said" aria-live="polite" data-said></p>${stepsHtml(STEPS)}`,
});
const file = theme === "light" ? "dial-indicator-crew-light.html" : "dial-indicator-crew.html";
writeFileSync(join(HERE, file), k.pageHtml({ title: "Dial indicator, staffed", theme, body, script: kitScript() + crewScript() + stepsScript() + DRAW_SCRIPT + RUN_SCRIPT, width: 720 }));
console.log("wrote", file, "· reach warnings", reachWarnings, "· worst reach", Object.entries(worst).map(([n, w]) => n + " " + w.toFixed(2)).join(", "));
