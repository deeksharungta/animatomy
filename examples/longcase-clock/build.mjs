import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../kit/iso-kit.mjs";
import { critter, critterSvg, crewCss, subjectCss } from "../../kit/critters.mjs";
import { kitScript, crewScript, stepsScript } from "../../scripts/inline-kit.mjs";
import { STEPS_CSS, stepsHtml } from "../../kit/steps.mjs";
import { WIDTH, HEIGHT, C, P, K, HICKORY, PINCH, KNOCK } from "./model.mjs";
import { room, floor, table } from "./scene.mjs";
import { plinth, trunk, stile, hoodWalls, seatboard, cornice, column } from "./case.mjs";
import { plate, pillars, wheels, click, dial, brackets, strike, bob, weight } from "./movement.mjs";
import { dynamic, poses } from "./moving.mjs";
import { STEPS, LABEL, keys, rest } from "./story.mjs";
import { MODEL_SCRIPT } from "./page-model.mjs";
import { RUN_SCRIPT } from "./page-run.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
const S0 = rest();
const D0 = dynamic(K, P, C, S0);
const pose0 = poses(C, S0, D0);
const crew = (spec, pose, part) => critterSvg(critter(spec, pose, P), { part });
const mv = (name, html, extra = "") => `<g data-part="${name}"${extra}>${html}</g>`;

// Back to front: the trunk and the pendulum behind everything, the weight in the trunk, then the movement on its seatboard.
const body = [
  room(), floor(), plinth(), trunk(), hoodWalls(),
  mv("rod", D0.rod), mv("bob", bob(), ` transform="${D0.bob}"`), mv("crutch", D0.crutch),
  mv("cord", D0.cord), mv("weight", weight(), ` transform="${D0.weight}"`), stile(), seatboard(),
  plate(), pillars(false), brackets(), crew(PINCH, pose0.pinch, "pinch"), strike(), wheels(), click(),
  mv("great", D0.great), mv("center", D0.center), mv("third", D0.third), mv("pins", D0.pins), mv("fly", D0.fly),
  mv("esc", D0.esc), mv("anchor", D0.anchor), mv("cordUp", D0.cordUp),
  pillars(true), dial(), mv("hands", D0.hands), mv("crank", D0.crank), crew(HICKORY, pose0.hickory, "hickory"),
  mv("hammer", D0.hammer), crew(KNOCK, pose0.knock, "knock"), column(), cornice(), table(),
];
const svg = k.figureSvg({ width: WIDTH, height: HEIGHT, label: LABEL, body });

const css = `${crewCss()}${STEPS_CSS}${subjectCss(".lc-hand", "#2F4C86", "#5B7BC0")}
.lc-stage{touch-action:pan-y;overflow:hidden}
.lc-stage:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:6px}`;

const page = `<style>${css}</style>` + k.plateHtml({
  fig: "Fig 1",
  title: "Longcase clock, staffed",
  hint: "Plays on its own, on a loop",
  readout: "stopped · 12:59:52 · weight 0 cm up",
  keys,
  caption: "An eight-day longcase clock with the front and right side of its case cut away. Hickory winds the weight up with the crank, Pinch's claws are the anchor's pallets and let the escape wheel go half a tooth each second, and at one o'clock Knock, as the hammer, strikes the bell once. The pendulum is 99.4 cm long and takes two seconds to swing there and back.",
  body: `<div class="iso-stage lc-stage" tabindex="0" role="group" aria-label="Longcase clock, playing on a loop: Space pauses, Home starts again">${svg}</div>${stepsHtml(STEPS)}`,
});

const file = theme === "light" ? "longcase-clock-light.html" : "longcase-clock.html";
writeFileSync(join(HERE, file), k.pageHtml({ title: "Longcase clock, staffed", theme, body: page, script: kitScript() + crewScript() + stepsScript() + MODEL_SCRIPT + RUN_SCRIPT, width: 680 }));
console.log("wrote", file);
