import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../kit/iso-kit.mjs";
import { critter, critterSvg, crewCss, subjectCss } from "../../kit/critters.mjs";
import { kitScript, crewScript, stepsScript } from "../../scripts/inline-kit.mjs";
import { STEPS_CSS, stepsHtml } from "../../kit/steps.mjs";
import { WIDTH, HEIGHT, C, P, at, S, Ln, D, K, PIP, MO, eventsOf, stateAt } from "./model.mjs";
import { room, desk, propsFront } from "./scene.mjs";
import { base, feederPosts, feederPlate, hopper, shaftFar, bearing, pinionBody, bed, rail, deck, collar, rods, bridge, ruler, feedChute, overChute } from "./machine.mjs";
import { refusedBox, servedBox, cashBox, spillBox, pivot, requestChute, chuteSupport } from "./right.mjs";
import { rod } from "./helpers.mjs";
import { dynamic } from "./moving.mjs";
import { poses } from "./poses.mjs";
import { STEPS, LABEL, keys, CAPTION } from "./story.mjs";
import { PAGE_SCRIPT } from "./page.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
const S0 = stateAt(C, eventsOf(C), 0);
const dyn0 = dynamic(K, P, C, S0);
const pose0 = poses(C, S0);
const mv = (name, html = "") => `<g data-part="${name}">${html}</g>`;
const crew = (spec, pose, name) => critterSvg(critter(spec, pose, P), { part: name });

// The coin slide (built at rest and moved along x), and Pip's handle over the front rail.
const SL = C.SLIDE, zh = C.ZB + 8;
const slidePlate = { x: SL.x0, y: -10, w: SL.x1 - SL.x0, d: 20, r: 0.6 };
const slide = S(k.slabOf(slidePlate, C.ZB, C.TH, P, 2, 0.4), { tone: "hi" }) + `<path class="tb-void" d="${k.ring(0, 0, C.TR + 0.3, C.ZB + C.TH, P, 40)}"/>`
  + D([at([SL.x0 + 2.5, -7, C.ZB + C.TH]), at([SL.x0 + 2.5, 7, C.ZB + C.TH])], { size: 0.5 })
  + S(rod([SL.x0, 0, C.ZB + 1.8], [-1, 0, 0], 1.3, 0, C.HANDLE), { tone: "hi" });
const kx = SL.x0 - C.HANDLE;
const handle = S(rod([kx, 0, C.ZB + 1.8], [0, 0, 1], 1.2, 0, zh - C.ZB - 1.8), { tone: "hi" })
  + S(rod([kx, 0, zh], [0, 1, 0], 1.2, 0, C.KNOB_Y + 1), { tone: "hi" })
  + S(K.sphereOf([kx, C.KNOB_Y + 2.5, zh], 2.2, P, { steps: 24 }), { tone: "hi" });
const discStatic = Ln(k.ring(C.F[0], C.F[1], 17.4, C.PLATE_Z + 8, P, 72), { tone: "faint" })
  + S(k.cylinder(C.F[0], C.F[1], 4, C.PLATE_Z + 8, 2, P, 24, 0.3), { tone: "hi" }) + D([at([C.F[0], C.F[1], C.PLATE_Z + 10])], { size: 0.8, tone: "hi" });
const [refused, served, cash, spill] = [refusedBox(), servedBox(), cashBox(), spillBox()];

const parts = [
  room(), desk(), base(), feederPosts(false),
  refused.back, mv("refused-pile", dyn0.refusedPile), refused.front,
  feedChute(), mv("feed", dyn0.feed), feederPosts(true), feederPlate(), discStatic, mv("disc", dyn0.disc), hopper(),
  shaftFar(), mv("crank", dyn0.crank), bearing(), pinionBody(), mv("pinion", dyn0.pinion), crew(MO, pose0.mo, "mo"),
  bed(), rail(false), ruler(), chuteSupport(), pivot(), mv("flap", dyn0.flap),
  served.back, mv("served-pile", dyn0.servedPile), cash.back, mv("cash", dyn0.cash),
  requestChute(), mv("env", dyn0.env), mv("cash-fly", dyn0.cashFly), served.front, cash.front,
  mv("slide", slide), mv("pocket", dyn0.pocket),
  collar(), rods(false), mv("stack", dyn0.stack), rods(true), bridge(),
  deck(), rail(true), mv("handle", handle), crew(PIP, pose0.pip, "pip"),
  spill.back, mv("spill", dyn0.spill), overChute(), mv("over", dyn0.over), spill.front,
  propsFront(),
];
const svg = k.figureSvg({ width: WIDTH, height: HEIGHT, label: LABEL, body: parts });

const css = `${crewCss()}${STEPS_CSS}${subjectCss(".tb-token", "#C99A2E", "#D8A93C")}
.tb-void{fill:var(--anatomy-halo);opacity:.55;stroke:var(--anatomy-lo);stroke-width:var(--anatomy-weight)}
.tb-ghost{animation:tb-out .8s ease forwards}@keyframes tb-out{to{opacity:0}}
@media (prefers-reduced-motion:reduce){.tb-ghost{display:none}}
.iso-stage{touch-action:pan-y;overflow:hidden}
.iso-stage:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:6px}`;

const body = `<style>${css}</style>` + k.plateHtml({
  fig: "Fig 1",
  title: "Token bucket, staffed",
  hint: "Plays on its own, on a loop",
  readout: `${C.START} of ${C.CAP} tokens · passed 0 · refused 0 · 0.0 s`,
  keys,
  caption: CAPTION,
  body: `<div class="iso-stage" tabindex="0" role="group" aria-label="Token bucket rate limiter, playing on a loop: Space pauses, Home starts again">${svg}</div>${stepsHtml(STEPS)}`,
});

const file = theme === "light" ? "token-bucket-light.html" : "token-bucket.html";
writeFileSync(join(HERE, file), k.pageHtml({ title: "Token bucket, staffed", theme, body, script: kitScript() + crewScript() + stepsScript() + PAGE_SCRIPT, width: 700 }));
console.log("wrote", file);
