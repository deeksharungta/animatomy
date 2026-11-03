import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../kit/iso-kit.mjs";
import { crewCss, subjectCss } from "../../kit/critters.mjs";
import { kitScript, crewScript, stepsScript } from "../../scripts/inline-kit.mjs";
import { STEPS_CSS, stepsHtml } from "../../kit/steps.mjs";
import { WIDTH, HEIGHT, C, K, P, PH } from "./model.mjs";
import { room, bench } from "./room.mjs";
import { props } from "./scene.mjs";
import { supply, cables, toggle, lamp, needleOf, METER } from "./supply.mjs";
import { base, column } from "./stand.mjs";
import { dynamic } from "./arm.mjs";
import { poses } from "./crewpose.mjs";
import { VOLTA, MO, PINCH, crew, STEPS, REST, readoutOf } from "./story.mjs";
import { PAGE_SCRIPT } from "./page.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";

const D0 = dynamic(K, P, C, REST), p0 = poses(C, REST, D0, MO, PINCH);
const pr = props();
const slots = {
  col: column(),
  ...Object.fromEntries(Object.entries(D0.items).map(([n, it]) => [n, it.svg])),
  pinch: crew(PINCH, p0.pinch, "pinch"), mo: crew(MO, p0.mo, "mo"), volta: crew(VOLTA, p0.volta, "volta"),
};
const sortSvg = `<g data-sort>${Object.entries(slots).map(([n, svg]) => `<g data-slot="${n}">${svg}</g>`).join("")}</g>`;
const live = `<g data-part="switch">${toggle(false)}</g><g data-part="lamp">${lamp(false)}</g><g data-part="needle">${needleOf(K, P, METER, 0)}</g>`;
const body = [room(), bench(), pr.back, supply(), live, base(), cables(), sortSvg, pr.front];

const LABEL = "A demonstration gyroscope on a lab bench, run by three animals. A cast-iron plinth on four levelling feet carries a column with a swivel on top; in the swivel's fork a balance arm tips on a trunnion, read off a quadrant. On one end of the arm a brass flywheel runs on a motor; on the other a counterweight balances it. A bench supply with a tachometer feeds the motor through slip rings at the swivel. Volta the electric eel lies along the arm from the trunnion's terminal post to the motor's brush box: he is its current. Mo the sloth hangs from a graduated rail under the rotor end and climbs out along it: his weight is the one thing the arm is not balanced against. Pinch the crab, on a shelf on the fork, holds the arm's latch lug in his claws until he lets go. With the rotor spinning, Mo's pull does not tip the arm down: it swings the arm round the column instead";
const svg = k.figureSvg({ width: WIDTH, height: HEIGHT, label: LABEL, body });

const keys = [
  { mark: "lit", label: "On duty: whoever is doing the work right now" },
  { mark: "raised", label: "Volta, electric eel, power: the current from the trunnion's terminal to the motor's brushes" },
  { mark: "raised", label: "Mo, sloth, moving: the unbalanced weight, climbing out along the rail to twist harder" },
  { mark: "raised", label: "Pinch, crab, holding: the latch whose claws hold the arm level" },
];
const css = `${crewCss()}${STEPS_CSS}${subjectCss(".gy-brass", "#C49A3E", "#B88C34")}
.gy-stage{position:relative;overflow:hidden}
.gy-void{fill:var(--anatomy-halo);stroke:var(--anatomy-lo);stroke-width:var(--anatomy-weight)}
.gy-stage>svg{display:block;width:100%;height:auto}
.gy-stage:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:6px}`;
const html = `<style>${css}</style>` + k.plateHtml({
  fig: "Fig 1",
  title: "How a gyroscope stays up, staffed",
  hint: "Plays on its own, on a loop",
  readout: readoutOf(C, PH, REST),
  keys,
  caption:
    "A spinning rotor carries angular momentum along its axle. A weight on the arm (Mo) puts a twist on it about the trunnion, and a twist changes angular momentum in its own direction: sideways, not down. So the axle swings round the column (precession) instead of falling, at a rate equal to the twist divided by the angular momentum. Twice the twist, twice the swing; half the spin, twice the swing. When the spin gets too slow, friction in the swivel lets the arm sink, and it falls onto its stop.",
  body: `<div class="iso-stage gy-stage" tabindex="0" role="group" aria-label="Gyroscope, playing on a loop: Space pauses, Home starts again">${svg}</div>${stepsHtml(STEPS)}`,
});

const file = theme === "light" ? "gyroscope-light.html" : "gyroscope.html";
writeFileSync(join(HERE, file), k.pageHtml({ title: "How a gyroscope stays up, staffed", theme, body: html, script: kitScript() + crewScript() + stepsScript() + PAGE_SCRIPT, width: 680 }));
console.log("wrote", file);
