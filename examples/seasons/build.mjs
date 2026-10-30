import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../kit/iso-kit.mjs";
import { crewCss } from "../../kit/critters.mjs";
import { kitScript, glScript, crewScript, stepsScript } from "../../scripts/inline-kit.mjs";
import { STEPS_CSS, stepsHtml } from "../../kit/steps.mjs";
import { WIDTH, HEIGHT, C, M, DAY0, G0, at } from "./model.mjs";
import { dyn0, pose0 } from "./moving.mjs";
import { desk, plinth, pillarLow, collar, pillarHigh, lamp, mountLow, meridian, axisRod, globeBase, latitudes, RK } from "./scene.mjs";
import { VOLTA, PIP, MO, crew, STEPS, readoutOf } from "./story.mjs";
import { DRAW_SCRIPT } from "./page-draw.mjs";
import { RUN_SCRIPT } from "./page-run.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";

// ---------------------------------------------------------------- figure

// Inside the orbit group the low parts (gears and handle) go before or after the globe's mount, whichever
// is true from the camera: the page moves them between the low-a and low-b slots as the arm swings.
const placeLow = (front) => (front ? { a: `<g data-part="gears">${dyn0.gears}</g>`, b: `<g data-part="handle">${dyn0.handle}</g>` } : { a: `<g data-part="handle">${dyn0.handle}</g>`, b: `<g data-part="gears">${dyn0.gears}</g>` });
const low0 = placeLow(dyn0.armFront);
const orbitParts = `<g data-orbit>
  <g data-part="bar">${dyn0.bar}</g>
  <g data-part="low-a">${low0.a}</g>
  <g data-part="pip-a"></g>
  <g data-part="mount">${mountLow()}</g>
  <g data-part="crank">${axisRod("low")}</g>
  <g data-part="crank-h">${dyn0.crank}</g>
  <g data-part="mo-slot">${crew(MO, pose0.mo, "mo")}</g>
  <g data-part="globe">${meridian(false)}<g clip-path="url(#sn-disk)">${globeBase()}<path class="sn-land" data-part="land" d="${dyn0.land}"/><path class="sn-night" data-part="night" d="${dyn0.night}" style="--sn-lamp:${dyn0.lamp}"/></g>${latitudes()}<circle class="sn-london" data-part="london" r="1.1" cx="${dyn0.london ? dyn0.london[0].toFixed(2) : -999}" cy="${dyn0.london ? dyn0.london[1].toFixed(2) : -999}"/>${axisRod("high")}${meridian(true)}</g>
  <g data-part="low-b">${low0.b}</g>
  <g data-part="pip-b">${crew(PIP, pose0.pip, "pip")}</g>
</g>`;

const c0 = at(G0);
const defs = `<defs><clipPath id="sn-disk"><circle cx="${c0[0].toFixed(2)}" cy="${c0[1].toFixed(2)}" r="${RK.toFixed(2)}"/></clipPath><filter id="sn-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${(RK * 0.07).toFixed(2)}"/></filter></defs>`;
const back = [
  defs,
  desk(),
  plinth(),
  `<g data-part="orbit-back">${dyn0.armFront ? "" : orbitParts}</g>`,
  crew(VOLTA, pose0.volta, "volta"),
  pillarLow(),
  collar(),
  pillarHigh(),
  lamp(),
];
const front = [`<g data-part="orbit-front">${dyn0.armFront ? orbitParts : ""}</g>`];

const LABEL = "A tellurion on a desk, run by three animals: a brass model of the Sun and the Earth. A lamp on a central pillar is the Sun. A long arm carries a globe round it, the globe's axis tilted 23.4° and kept pointing the same way all year by a train of five gears along the arm. Pip the squirrel walks round the base pushing the arm, one lap a year, its pointer moving round a month ring. Mo the sloth stands on a shelf under the globe and turns it once a day by a crank on its south end. Volta the electric eel lies along the lamp's cable on the base and lights the Sun. In June the north pole leans toward the lamp and London's day is long; in December it leans away.";
const backSvg = k.figureSvg({ width: WIDTH, height: HEIGHT, label: LABEL, body: back });
const frontSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="iso-svg sn-layer" viewBox="0 0 ${WIDTH} ${HEIGHT}" aria-hidden="true">${front.join("")}</svg>`;

const keys = [
  { mark: "lit", label: "On duty: whoever is doing the work right now" },
  { mark: "raised", label: "Volta, electric eel, power: lights the lamp, the Sun" },
  { mark: "raised", label: "Pip, squirrel, moving: walks the year arm round, one lap a year" },
  { mark: "raised", label: "Mo, sloth, sensing: turns the globe once a day by its crank" },
];

const css = `${crewCss()}${STEPS_CSS}
.sn-stage{position:relative;touch-action:pan-y pinch-zoom;overflow:hidden}
.sn-stage [data-part="globe"]{cursor:grab}
.sn-said{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
.sn-stage>svg,.sn-stage>canvas{display:block;width:100%;height:auto}
.sn-stage>.sn-layer{position:absolute;inset:0;height:100%!important;pointer-events:none}
.iso[data-theme="dark"] .sn-stage>canvas,.iso:not([data-theme]) .sn-stage>canvas{mix-blend-mode:screen}
.sn-stage:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:6px}
.iso{--sn-ocean:#2E6597;--sn-land:#5E8A4E;--sn-night:#03060f;--sn-dark:.84;--sn-line:#ffffff}
.iso[data-theme="light"]{--sn-ocean:#6FA6D6;--sn-land:#8DB46E;--sn-night:#0B1630;--sn-dark:.62;--sn-line:#ffffff}
.sn-ocean{fill:var(--sn-ocean)}
.sn-land{fill:var(--sn-land);stroke:none}
.sn-night{fill:var(--sn-night);filter:url(#sn-soft);opacity:calc(var(--sn-dark) * var(--sn-lamp, 0))}
.sn-lat{fill:none;stroke:var(--sn-line);stroke-width:.45;opacity:.5;stroke-linecap:round}
.sn-trop{stroke-dasharray:1.6 1.6}
.sn-arc{stroke-dasharray:.4 1.4}
.sn-rim{fill:none;stroke:var(--anatomy-hi);stroke-width:var(--anatomy-weight)}
.sn-london{fill:#fff;stroke:#1c1c1c;stroke-width:.5}`;

const body = `<style>${css}</style>` + k.plateHtml({
  fig: "Fig 1",
  title: "Why the Earth has seasons, staffed",
  hint: "Plays on its own · drag the globe",
  readout: readoutOf(C, M, DAY0),
  keys,
  caption:
    "A tellurion: the lamp is the Sun and the globe is the Earth, its axis tilted 23.4° and kept pointing at the same stars all year by five equal gears along the arm. Through the year the tilt points the northern half toward the lamp, then sideways, then away. When it leans in, the Sun stands higher and the days are longer, so each square metre gets more sunlight for more hours; when it leans away, the same light comes in low, spreads over more ground and for fewer hours. The distance hardly changes, and the Earth is closest to the Sun in January. The model's sizes and distances are not to scale; its angles are.",
  body: `<div class="iso-stage sn-stage" tabindex="0" role="group" aria-label="Tellurion, playing on a loop: Space pauses, Home starts again, left and right arrows change the date">${backSvg}<canvas class="sn-layer sn-gl" aria-hidden="true"></canvas>${frontSvg}</div><p class="sn-said" aria-live="polite" data-said></p>${stepsHtml(STEPS)}`,
});

const file = theme === "light" ? "seasons-light.html" : "seasons.html";
writeFileSync(join(HERE, file), k.pageHtml({ title: "Why the Earth has seasons, staffed", theme, body, script: kitScript() + glScript() + crewScript() + stepsScript() + DRAW_SCRIPT + RUN_SCRIPT, width: 680 }));
console.log("wrote", file);
