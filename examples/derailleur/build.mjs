import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../kit/iso-kit.mjs";
import { critter, critterSvg, crewCss, subjectCss } from "../../kit/critters.mjs";
import { kitScript, crewScript, stepsScript } from "../../scripts/inline-kit.mjs";
import { STEPS_CSS, stepsHtml } from "../../kit/steps.mjs";
import { WIDTH, HEIGHT, C, P, ROO, MO } from "./model.mjs";
import { hubFar, hubShell, hubNear, rim, cog, lockring } from "./bike.mjs";
import { frameFar, frameNear, dropout } from "./frame.mjs";
import { bKnuckle, housing } from "./knuckle.mjs";
import { wall } from "./scene.mjs";
import { bench, benchTop, lamp } from "./bench.mjs";
import { standPost } from "./stand.mjs";
import { poses } from "./poses.mjs";
import { STEPS, LABEL, keys, rest, draw0, reach } from "./story.mjs";
import { MODEL_SCRIPT } from "./page-model.mjs";
import { RUN_SCRIPT } from "./page-run.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
reach();
const S0 = rest();
const D0 = draw0(S0);
const pose0 = poses(C, S0, D0);
const crew = (spec, key) => critterSvg(critter(spec, pose0[key], P), { part: key });
const mv = (name, html = D0[name]) => `<g data-part="${name}">${html}</g>`;

// Back to front: the wall and bench, the stand and the far side of the bike, the wheel, the cassette from its biggest
// cog out, the cage's inner plate and jockeys, the chain, the near side of the frame, the cage's outer plate, the
// parallelogram, the B-knuckle and its cable, with the crew in their slots.
const body = [
  wall(), bench(), benchTop(), lamp(), standPost(),
  frameFar(), hubFar(), mv("spokesN"), hubShell(), rim(), mv("spokesD"), hubNear(),
  ...C.TEETH.map((_, i) => cog(i) + mv("t" + i, D0.teeth[i])).reverse(), lockring(),
  mv("cageIn"), mv("jockeys"), mv("chainCas"), mv("chainDer"), frameNear(), dropout(),
  mv("cageOut"), mv("moCaps"), crew(MO, "mo"), mv("links"), housing(), bKnuckle(), crew(ROO, "roo"),
];
const svg = k.figureSvg({ width: WIDTH, height: HEIGHT, label: LABEL, body });
const css = `${crewCss()}${STEPS_CSS}${subjectCss(".bk-chain", "#A3AAB3", "#A8AFB8")}
.bk-stage{touch-action:pan-y;overflow:hidden}
.bk-stage [data-part^="spokes"] .iso-line{opacity:.3}
.bk-stage:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:6px}
.bk-said{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}`;

const page = `<style>${css}</style>` + k.plateHtml({
  fig: "Fig 1",
  title: "Rear derailleur, staffed",
  hint: "Plays on its own · ← → to shift",
  readout: "gear 11T · cable 0.0 mm · chain on 11T",
  keys,
  caption: `An 11-speed rear derailleur on an 11–32 cassette with a ${C.LINKS}-link chain. Each click of the shifter pulls 2.67 mm of cable, and the slant parallelogram moves the guide pulley 3.74 mm, one cog, against Roo's return spring; releasing the cable lets Roo throw it back out. The chain only climbs or drops as you pedal, one cog at a time, and Mo's cage spring swings the cage to take up the chain the bigger cogs don't need.`,
  body: `<div class="iso-stage bk-stage" tabindex="0" role="group" aria-label="Rear derailleur, playing on a loop: Space pauses, Home starts again, left and right arrows shift to a bigger or a smaller cog">${svg}</div><p class="bk-said" aria-live="polite" data-said></p>${stepsHtml(STEPS)}`,
});
const file = theme === "light" ? "derailleur-light.html" : "derailleur.html";
writeFileSync(join(HERE, file), k.pageHtml({ title: "Rear derailleur, staffed", theme, body: page, script: kitScript() + crewScript() + stepsScript() + MODEL_SCRIPT + RUN_SCRIPT, width: 700 }));
console.log("wrote", file);
