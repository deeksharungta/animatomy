import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../kit/iso-kit.mjs";
import { critter, critterSvg, crewCss } from "../../kit/critters.mjs";
import { kitScript, crewScript, stepsScript } from "../../scripts/inline-kit.mjs";
import { STEPS_CSS, stepsHtml } from "../../kit/steps.mjs";
import { WIDTH, HEIGHT, C, P, S, Ln, discY, circleY, ROO, PINCH, ROCKY } from "./model.mjs";
import { floor, wall, trim, worldLines, worldProps } from "./scene.mjs";
import { farWheels, tray, rearPanel, frontLow, nearSill, bumpers, axles, wheel, exhaust } from "./car.mjs";
import { farWall, dash, seat } from "./body.mjs";
import * as Mo from "./motor.mjs";
import { STEPS, LABEL, keys, rest, draw0, pose, checks, RUN } from "./story.mjs";
import { MODEL_SCRIPT } from "./page-model.mjs";
import { RUN_SCRIPT } from "./page-run.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
const W = checks();
console.log(`run: ${RUN.D.toFixed(2)} m, top ${RUN.vMax.toFixed(2)} m/s, ${RUN.t.toFixed(1)} s, spring left ${RUN.Wend.toFixed(2)} turns, period ${C.WORLD.period.toFixed(1)} mm`);
console.log(`duty frames ${JSON.stringify(W.frames)}, reach warnings ${W.reach}, work warnings ${W.work}`);
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

// Back to front: room, far side, tray, train, barrel with Roo spun inside it, the brake outside its drum, Rocky and the dash, strap, shelf and click with Pinch, near side.
const body = [
  wall(), floor(), spun("worldLines", worldLines(), D0.worldT), trim(), spun("worldProps", worldProps(), D0.worldT), halo,
  farWheels(), farWall(), exhaust(), tray(), rearPanel(), seat(), Mo.backPlate(), axles(),
  Mo.interStatic(), spun("interTeeth", Mo.interTeeth(), D0.interT), Mo.axlePinion(), mv("axleLeaves"), Mo.interPinion(), mv("interLeaves"),
  Mo.barrelBack(), spun("barrelTeeth", Mo.barrelTeeth(), D0.barrelT),
  `<g data-part="barrelWall">${Mo.barrelWall(true)}</g>`, Mo.barrelMouth(),
  `<g clip-path="url(#wc-mouth)">${spun("coverMarks", Mo.coverMarks(), D0.coverT)}${mv("drumRibs")}${Mo.arborCollar()}${mv("spring", "wc-spring")}${Mo.arborBack()}${spun("rooSpin", crew(ROO, "roo"), D0.rooT)}</g>`,
  Mo.barrelLip(), Mo.brakeBracket(), mv("brake"), Mo.arborFront(), crew(ROCKY, "rocky"), dash(),
  Mo.strap(), Mo.shelf(), S(discY(B.x, B.z, C.RATCHET.root - 0.5, C.RATCHET.y0, C.RATCHET.y1), { tone: "hi", crease: "lo" }),
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
  caption: `A tinplate wind-up coupe with its near side cut away. Turning the key winds the mainspring round its arbor while a brake shoe holds the barrel, and a click on the arbor's ratchet stops it unwinding back through the key. With the brake off, the spring's outer end pushes the hook in the barrel wall round (Roo is the spring, his feet on that hook and his paws on the arbor); the barrel's teeth drive a 16:1 train to the rear axle, so ${(RUN.wound - RUN.Wend).toFixed(1)} turns of the key carry the car ${RUN.D.toFixed(1)} m across the floor, until the spring's push no longer beats rolling friction.`,
  body: `<div class="iso-stage wc-stage" tabindex="0" role="group" aria-label="Wind-up car, playing on a loop: Space pauses, Home starts again">${svg}</div>${stepsHtml(STEPS)}`,
});

const file = theme === "light" ? "windup-car-light.html" : "windup-car.html";
writeFileSync(join(HERE, file), k.pageHtml({ title, theme, body: page, script: kitScript() + crewScript() + stepsScript() + MODEL_SCRIPT() + RUN_SCRIPT, width: 720 }));
console.log("wrote", file);
