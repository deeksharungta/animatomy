import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../kit/iso-kit.mjs";
import { critter, critterSvg, crewCss, subjectCss } from "../../kit/critters.mjs";
import { kitScript, crewScript, stepsScript } from "../../scripts/inline-kit.mjs";
import { STEPS_CSS, stepsHtml } from "../../kit/steps.mjs";
import { WIDTH, HEIGHT, C, P, PLUMB, PINCH, ROCKY, KNOCK } from "./model.mjs";
import { room, floor, table } from "./scene.mjs";
import { plinth, trunk, stile, door, waist, seatboard } from "./case-low.mjs";
import { hoodWalls, backColumns, frontColumn, frieze, cornice, finials } from "./case-hood.mjs";
import { movementItems, plate, pillarItems } from "./movement.mjs";
import { backcock, bell, perches } from "./top.mjs";
import { bob, weight } from "./hang.mjs";
import { dial } from "./dial.mjs";
import { hoodDoor } from "./hooddoor.mjs";
import { poses } from "./poses.mjs";
import { STEPS, LABEL, keys, rest, drawn, reach } from "./story.mjs";
import { MODEL_SCRIPT } from "./page-model.mjs";
import { RUN_SCRIPT } from "./page-run.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
reach();
const S0 = rest();
const D0 = drawn(S0);
const pose0 = poses(C, S0, D0);
const crew = (spec, key) => critterSvg(critter(spec, pose0[key], P), { part: key });
const mv = (name, html = D0[name], extra = "") => `<g data-part="${name}"${extra}>${html}</g>`;

// The movement, painted from the back plate forward: every arbor piece, wheel and pinion by its depth along y,
// with Pinch standing in front of the anchor he is.
const items = [...movementItems((name) => mv(name)), ...pillarItems(), { key: pose0.pinch.at[1], html: crew(PINCH, "pinch") }];
items.sort((a, b) => a.key - b.key);

// Back to front: the room, the case's back and left walls, what hangs in the trunk, the hood, the movement, the dial,
// the crew on the brackets, and last what stands in front of the cut: the front column, the stile and the open door.
const body = [
  room(), floor(), plinth(), trunk(),
  mv("rod"), mv("bob", bob(), ` transform="${D0.bob}"`),
  mv("cord"), mv("weight", weight(-1), ` transform="${D0.weight}"`), mv("sweight", weight(1), ` transform="${D0.sweight}"`), crew(PLUMB, "plumb"),
  waist(), hoodWalls(), frieze(), backColumns(), backcock(), seatboard(), mv("cordUp"),
  plate(), bell(), perches(), ...items.map((it) => it.html),
  dial(), mv("hands"), mv("key"), crew(ROCKY, "rocky"), crew(KNOCK, "knock"),
  frontColumn(), cornice(), finials(false), finials(true), hoodDoor(), stile(), door(), table(),
];
const svg = k.figureSvg({ width: WIDTH, height: HEIGHT, label: LABEL, body });

const css = `${crewCss()}${STEPS_CSS}${subjectCss(".lc-hand", "#2F4C86", "#5B7BC0")}
.lc-stage{touch-action:pan-y;overflow:hidden}
.lc-stage:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:6px}`;

const page = `<style>${css}</style>` + k.plateHtml({
  fig: "Fig 1",
  title: "Longcase clock, staffed",
  hint: "Plays on its own, on a loop",
  readout: "stopped · 12:59:50 · weight 0 cm up",
  keys,
  caption: "An eight-day striking longcase clock, its trunk door open and its case cut away on the front and right. You wind it; Mo is the going weight's pull on its cord, Pinch is the anchor whose pallets let the escape wheel go half a tooth each one-second swing of the 99.4 cm pendulum, and at one o'clock Rocky's locking lever lets the strike train run one blow, which Knock, the hammer's spring, strikes on the bell. The weights fall 68 cm in eight days.",
  body: `<div class="iso-stage lc-stage" tabindex="0" role="group" aria-label="Longcase clock, playing on a loop: Space pauses, Home starts again">${svg}</div>${stepsHtml(STEPS)}`,
});

const file = theme === "light" ? "longcase-clock-light.html" : "longcase-clock.html";
writeFileSync(join(HERE, file), k.pageHtml({ title: "Longcase clock, staffed", theme, body: page, script: kitScript() + crewScript() + stepsScript() + MODEL_SCRIPT + RUN_SCRIPT, width: 680 }));
console.log("wrote", file);
