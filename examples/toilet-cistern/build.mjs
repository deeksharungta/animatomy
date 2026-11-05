// Builds the staffed toilet cistern as a standalone page: `node build.mjs` (dark) and `node build.mjs --light`.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { critter, critterSvg, crewCss } from "../../kit/critters.mjs";
import { kitScript, crewScript, stepsScript } from "../../scripts/inline-kit.mjs";
import { STEPS_CSS, stepsHtml } from "../../kit/steps.mjs";
import { C, P, WIDTH, HEIGHT, OTTIE, MO } from "./model.mjs";
import { room, floor, lid, brush } from "./scene.mjs";
import { pedestal, deck, bowl, wellClip, well, seat } from "./pan.mjs";
import { shellBack, shellFront, handleRose } from "./tank.mjs";
import { flushBase, overflow, seatRing, fillValve, refill, supply } from "./valves.mjs";
import { fresh } from "./physics.mjs";
import { dynamic } from "./moving.mjs";
import { poses } from "./poses.mjs";
import { STEPS, LABEL, KEYS, CAPTION, crewChecks } from "./story.mjs";
import { liveScript } from "./live.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
const warnings = crewChecks();

const S0 = fresh(C), Q0 = poses(C, S0);
S0.ring = Q0.L.ring;
const D0 = dynamic({ ...k, ...L }, P, C, S0);
const g = (name) => `<g data-part="${name}">${D0[name]}</g>`;
const crew = (spec, pose, name) => critterSvg(critter(spec, pose, P), { part: name });

const svg = k.figureSvg({
  width: WIDTH, height: HEIGHT, label: LABEL,
  body: [
    `<defs>${wellClip()}</defs>`, room(), floor(), lid(), supply(), pedestal(), deck(),
    shellBack(), refill(), g("waterBack"), g("ripples"), fillValve(), g("inflow"), g("float"), crew(MO, Q0.mo, "mo"),
    flushBase(), overflow(), g("trickle"), seatRing(), g("throat"), g("swirl"), crew(OTTIE, Q0.ottie, "ottie"), g("chain"), g("arm"),
    g("waterFront"), shellFront(), handleRose(), g("handle"),
    bowl(), seat(), well(), g("bowl"), brush(),
  ],
});

const css = `${crewCss()}${STEPS_CSS}
.iso{--tc-water:#6FAEDB;--tc-line:#3F82B8}
.iso[data-theme="dark"],.iso:not([data-theme]){--tc-water:#4F93CC;--tc-line:#8CC4EE}
.tc-wb{fill:var(--tc-water);opacity:.34}
.tc-wf{fill:var(--tc-water);opacity:.3}
.iso-stage svg .tc-wb,.iso-stage svg .tc-wf{pointer-events:none!important}
.tc-pool{fill:var(--tc-water);opacity:.8;stroke:var(--tc-line);stroke-width:var(--anatomy-weight);vector-effect:non-scaling-stroke}
.tc-wl{fill:none;stroke:var(--tc-line);stroke-width:var(--anatomy-weight);vector-effect:non-scaling-stroke}
.tc-stream{fill:none;stroke:var(--tc-water);stroke-width:2.4px;stroke-linecap:round;vector-effect:non-scaling-stroke}
.tc-well{fill:var(--anatomy-shade-1);stroke:none}
.tc-void{fill:var(--anatomy-halo);opacity:.7;stroke:var(--anatomy-lo);stroke-width:var(--anatomy-weight)}
.tc-throat{fill:var(--anatomy-lo);stroke:var(--anatomy-mid);stroke-width:var(--anatomy-weight)}
.iso-stage{touch-action:pan-y;overflow:hidden}
.iso-stage:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:6px}`;

const body = `<style>${css}</style>` + k.plateHtml({
  fig: "Fig 1", title: "Toilet cistern, staffed", hint: "Plays on its own, on a loop", readout: "full · tank 6.0 L", keys: KEYS, caption: CAPTION,
  body: `<div class="iso-stage" tabindex="0" role="group" aria-label="Toilet cistern, playing on a loop: Space pauses, Home starts again">${svg}</div>${stepsHtml(STEPS)}`,
});
const file = theme === "light" ? "toilet-cistern-light.html" : "toilet-cistern.html";
writeFileSync(join(HERE, file), k.pageHtml({ title: "Toilet cistern, staffed", theme, body, script: kitScript() + crewScript() + stepsScript() + liveScript(), width: 720 }));
console.log("wrote", file, warnings ? `(${warnings} crew warnings)` : "· crew checks clean");
