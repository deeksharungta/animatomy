// Builds the staffed hash map as a standalone page: `node build.mjs` (dark) and `node build.mjs --light`.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../kit/iso-kit.mjs";
import { critter, critterSvg, crewCss, subjectCss } from "../../kit/critters.mjs";
import { kitScript, crewScript, stepsScript } from "../../scripts/inline-kit.mjs";
import { STEPS_CSS, stepsHtml } from "../../kit/steps.mjs";
import { C, P, K, WIDTH, HEIGHT, NIB, ROCKY, KNOCK, xc } from "./model.mjs";
import { stateAt } from "./timeline.mjs";
import { room, desk, propsBack, propsFront } from "./scene.mjs";
import { cabinet, runner, frameBack, divider, topBoard } from "./frame.mjs";
import { guide, fascia, post, post2, perch, pedestal, step, CH, TRAY, chutePost } from "./counter.mjs";
import { dynamic } from "./moving.mjs";
import { envelope } from "./letters.mjs";
import { poses } from "./poses.mjs";
import { STEPS, LABEL, KEYS, CAPTION, E, crewChecks } from "./story.mjs";
import { PAGE_SCRIPT } from "./page.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
const warnings = crewChecks();

const S0 = stateAt(C, E, 0), D0 = dynamic(K, P, C, S0), Q0 = poses(C, S0);
const g = (name, html = "") => `<g data-part="${name}">${html}</g>`;
const crew = (spec, pose, name) => critterSvg(critter(spec, pose, P), { part: name });
// The letters already filed when the run opens: a few in most holes, none in 6 yet, a little askew.
const filed = (i) => Array.from({ length: C.PREFILL[i] }, (_, n) => envelope(K, P, C, [xc(C, i) + [0.8, -0.9][n % 2], C.Y1 - C.ENV.d / 2 - 0.6 - n * 0.7, C.FLOOR + n * (C.ENV.t + 0.15)])).join("");
const holes = Array.from({ length: C.N }, (_, i) => divider(i) + filed(i) + g("hole" + i)).join("");
const [chute, tray] = [CH(), TRAY()];

const svg = k.figureSvg({
  width: WIDTH, height: HEIGHT, label: LABEL,
  body: [
    room(), desk(), cabinet(), runner(), frameBack(), holes, divider(C.N), topBoard(),
    g("cams", D0.cams), guide(), g("flags", D0.flags), fascia(), perch(), crew(KNOCK, Q0.knock, "knock"), g("counter", D0.counter), post(), post2(), g("bevel", D0.bevel),
    chute.back, chutePost(), g("chuteL"), chute.front, tray.back, g("trayL"), tray.front, tray.legs,
    step(), crew(ROCKY, Q0.rocky, "rocky"), pedestal(), g("crank", D0.crank), g("carry"), crew(NIB, Q0.nib, "nib"), propsBack(), propsFront(),
  ],
});

const css = `${crewCss()}${STEPS_CSS}${subjectCss(".hm-env", "#E4D3A8", "#E2D2A6")}${subjectCss(".hm-stamp", "#C0453A", "#D0574A")}${subjectCss(".hm-slip", "#B9CDE0", "#A9C2DA")}
.hm-void{fill:var(--anatomy-halo);opacity:.6;stroke:var(--anatomy-lo);stroke-width:var(--anatomy-weight)}
.hm-ghost{animation:hm-out .8s ease forwards}@keyframes hm-out{to{opacity:0}}
@media (prefers-reduced-motion:reduce){.hm-ghost{display:none}}
.iso-stage{touch-action:pan-y;overflow:hidden}
.iso-stage:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:6px}`;

const body = `<style>${css}</style>` + k.plateHtml({
  fig: "Fig 1", title: "Hash map, staffed", hint: "Plays on its own, on a loop", readout: "8 holes · hole = letter sum mod 8", keys: KEYS, caption: CAPTION,
  body: `<div class="iso-stage" tabindex="0" role="group" aria-label="Hash map as a letter-sorting desk, playing on a loop: Space pauses, Home starts again">${svg}</div>${stepsHtml(STEPS)}`,
});
const file = theme === "light" ? "hash-map-light.html" : "hash-map.html";
writeFileSync(join(HERE, file), k.pageHtml({ title: "Hash map, staffed", theme, body, script: kitScript() + crewScript() + stepsScript() + PAGE_SCRIPT, width: 760 }));
console.log("wrote", file, warnings ? `(${warnings} crew warnings)` : "· crew checks clean");
