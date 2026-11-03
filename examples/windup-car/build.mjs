import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../kit/iso-kit.mjs";
import { critter, critterSvg, crewCss } from "../../kit/critters.mjs";
import { kitScript, crewScript, stepsScript } from "../../scripts/inline-kit.mjs";
import { STEPS_CSS, stepsHtml } from "../../kit/steps.mjs";
import { WIDTH, HEIGHT, C, P, S, Ln, discY, circleY, ROO, PINCH, ROCKY } from "./model.mjs";
import { floor, wall, worldLines, worldProps } from "./scene.mjs";
import { farWheels, farWall, tray, rearPanel, frontLow, nearSill, bumpers, axles, wheel } from "./car.mjs";
import * as Mo from "./motor.mjs";
import { STEPS, LABEL, keys, rest, draw0, pose, reach, RUN } from "./story.mjs";
import { MODEL_SCRIPT } from "./page-model.mjs";
import { RUN_SCRIPT } from "./page-run.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
const warns = reach();
console.log(`run: ${RUN.D.toFixed(2)} m, top ${RUN.vMax.toFixed(2)} m/s, ${RUN.t.toFixed(1)} s, spring left ${RUN.Wend.toFixed(2)} turns, period ${C.WORLD.period.toFixed(1)} mm, reach warnings ${warns}`);
const S0 = rest(), D0 = draw0(S0), pose0 = pose(S0);
const crew = (spec, key) => critterSvg(critter(spec, pose0[key], P), { part: key });
const mv = (name, cls = "") => `<g data-part="${name}"${cls ? ` class="${cls}"` : ""}>${D0[name]}</g>`;
const spun = (name, html, t) => `<g data-part="${name}" transform="${t}">${html}</g>`;
const Wh = C.WHEEL, B = C.BARREL;
const hub = (x) => {
  const y = Wh.near[1] - 0.2;
  return Ln([0, 1, 2, 3, 4].map((i) => { const a = (i / 5) * Math.PI * 2 + 0.3; return circleY(x + 7.4 * Math.cos(a), y, Wh.z + 7.4 * Math.sin(a), 1.5, 16); }).join(""), { tone: "lo" });
};
const halo = `<path class="iso-halo" d="${k.haloOf({ x: -68, y: -46, w: 136, d: 92, r: 14 }, 0, 0.5, P)}"/>`;

// Back to front: the room and the toys going by, the car's far wheels and far side, its floor and rear panel,
// the motor's back plate, axles and train, the brake and the barrel with Roo on top and Rocky beside it,
// then the strap, ratchet and click with Pinch, the near sill, near wheels, key and bumpers.
const body = [
  wall(), floor(), spun("worldLines", worldLines(), D0.worldT), spun("worldProps", worldProps(), D0.worldT), halo,
  farWheels(), farWall(), tray(), rearPanel(), Mo.backPlate(), axles(),
  Mo.interStatic(), spun("interTeeth", Mo.interTeeth(), D0.interT), Mo.axlePinion(), mv("axleLeaves"), Mo.interPinion(), mv("interLeaves"),
  Mo.barrelBack(), spun("barrelTeeth", Mo.barrelTeeth(), D0.barrelT),
  Mo.brakeBracket(), mv("brake"), `<g data-part="barrelWall">${Mo.barrelWall(true)}</g>`, Mo.barrelMouth(), mv("spring", "wc-spring"), Mo.arborIn(), Mo.barrelRim(), crew(ROO, "roo"), crew(ROCKY, "rocky"),
  Mo.strap(), S(discY(B.x, B.z, C.RATCHET.root - 0.5, C.RATCHET.y0, C.RATCHET.y1), { tone: "hi", crease: "lo" }),
  spun("ratchetTeeth", Mo.ratchetTeeth(), D0.ratchetT), mv("click"), Mo.arborKey(), crew(PINCH, "pinch"),
  frontLow(), nearSill(), Mo.sillBush(),
  wheel(Wh.rearX, Wh.near[0], Wh.near[1]), spun("rearHub", hub(Wh.rearX), D0.rearT),
  wheel(Wh.frontX, Wh.near[0], Wh.near[1]), spun("frontHub", hub(Wh.frontX), D0.frontT),
  mv("key"), ...bumpers(),
];
const svg = k.figureSvg({ width: WIDTH, height: HEIGHT, label: LABEL, body });

const css = `${crewCss()}${STEPS_CSS}
.wc-spring{--anatomy-hi:#2E5A9E}.iso[data-theme="dark"] .wc-spring,.iso:not([data-theme]) .wc-spring{--anatomy-hi:#86A9E6}
.wc-spring .iso-line{stroke-width:1.15px}
.wc-stage{touch-action:pan-y;overflow:hidden}
.wc-stage:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:6px}`;

const title = "Wind-up car, staffed";
const page = `<style>${css}</style>` + k.plateHtml({
  fig: "Fig 1",
  title,
  hint: "Plays on its own, on a loop",
  readout: `resting · spring ${RUN.Wend.toFixed(1)} turns · 0.00 m · 0.00 m/s`,
  keys,
  caption: `A tinplate wind-up car with its near side cut away. Turning the key winds the mainspring round its arbor, and a click on the arbor's ratchet stops it unwinding back through the key. With the brake off, the spring's outer end turns the barrel; its teeth drive a 16:1 train to the rear axle, so ${(C.PH.full - RUN.Wend).toFixed(1)} turns of the key carry the car ${RUN.D.toFixed(1)} m across the floor, until the spring's push no longer beats rolling friction.`,
  body: `<div class="iso-stage wc-stage" tabindex="0" role="group" aria-label="Wind-up car, playing on a loop: Space pauses, Home starts again">${svg}</div>${stepsHtml(STEPS)}`,
});

const file = theme === "light" ? "windup-car-light.html" : "windup-car.html";
writeFileSync(join(HERE, file), k.pageHtml({ title, theme, body: page, script: kitScript() + crewScript() + stepsScript() + MODEL_SCRIPT() + RUN_SCRIPT, width: 720 }));
console.log("wrote", file);
