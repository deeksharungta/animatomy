import { C, S, box } from "./model.mjs";
import { L, P, D, at } from "./shapes.mjs";
import { site, siteFront, yard, trench, firewall, props } from "./scene.mjs";
import { deckUnder, deckSlab, soleplates, deckRail, stair, lubeOil, COLS } from "./deck.mjs";
import { lpCasing, lpWindow, lpInside, lpRim, pedestal, shaft, valveBack, valveBody, yokeBack, springCan } from "./turbine.mjs";
import { genFrame, coolers, genWindow, genInside, endWindings, rotor, genRim, terminalBox } from "./generator.mjs";
import { housingBack, housingFront, slipRings, brushGear, trunking, excitation } from "./exciter.mjs";
import { portals, phase, windowPath, windowInside, turret } from "./ipb.mjs";
import { foundation, tank, xwinPath, xInside, xRim, conservator, oltc, bushing, neutral } from "./xfmr.mjs";
import { manifolds, panels, fanBack, fanHub, pumpBack, pumpFront } from "./cooler.mjs";
import { panel } from "./panel.mjs";
import { cwinPath } from "./breaker.mjs";
import { yardBack, yardFront } from "./compose-yard.mjs";
import { hoodTop, coverParts, coolerCabinet, statorWater, headerValves, wallParts } from "./details.mjs";

// The painter's order, back to front. `crew(name)` draws a critter in its slot; `g(name)` is a live group.
const g = (name, html = "") => `<g data-part="${name}">${html}</g>`;
export const clips = () => `<defs>${[["pg-lp", lpWindow()], ["pg-gen", genWindow()], ["pg-ipb", windowPath()], ["pg-xw", xwinPath()], ["pg-cw", cwinPath()]].map(([id, d]) => `<clipPath id="${id}"><path d="${d}"/></clipPath>`).join("")}</defs>`;
const coupling = () => {
  const F = L.frameAlong([-190, C.AY, C.SH], [1, 0, 0]);
  return S(L.disc(0, 1.6, 9, F, P), { tone: "mid" }) + S(L.disc(1.6, 3.2, 9, F, P), { tone: "mid" });
};

export function backItems(crew) {
  const colsBack = COLS.filter(([, y]) => y < 0), colsFront = COLS.filter(([, y]) => y > 0);
  return [
    site(), yard(), trench(), firewall(), wallParts(),
    // Under the deck: the back columns, the terminal box and the isolated-phase bus to the transformer's turret.
    deckUnder(colsBack), terminalBox(), portals(), turret(), phase(0), phase(1), phase(2),
    `<g class="pg-cavity" clip-path="url(#pg-ipb)">${windowInside()}</g>`, "@flow:bus",
    deckUnder(colsFront), deckSlab(),
    // On the deck: lube oil, the LP turbine with its hood open, the coupling, the generator cut open.
    soleplates([[-262, -200, -44, 8], [-170, -96, -36, 0]]), lubeOil(),
    lpCasing(), `<g class="pg-cavity" clip-path="url(#pg-lp)">${lpInside()}${g("lp")}</g>`, "@flow:lp", lpRim(), hoodTop(),
    pedestal(-200, -186), shaft(-186, -178), coupling(), g("cpl"),
    genFrame(), `<g class="pg-cavity" clip-path="url(#pg-gen)">${genInside()}${endWindings()}</g>`, `<g clip-path="url(#pg-gen)">${rotor()}${g("rotor")}</g>`, "@flow:gen", genRim(), coolers(), statorWater(), excitation(),
    pedestal(-88, -76), housingBack(), slipRings(), brushGear(), trunking(), crew("volta"), housingFront(),
    // The governor valve in front of the turbine: Ollie inside its yoke under the crosshead.
    valveBack(), valveBody(), yokeBack(), g("spindle"), g("cross"), crew("ollie"), springCan(),
    deckRail(),
    // The transformer: foundation, tank with its window, conservator and bushings, the cooler and the pump.
    foundation(), tank(), `<g class="pg-cavity" clip-path="url(#pg-xw)">${xInside()}</g>`, "@flow:xw", xRim(), coolerCabinet(), headerValves(), coverParts(), neutral(), conservator(),
    ...C.HVB.ys.map((y) => bushing(y)), oltc(),
    fanBack(), g("fans"), fanHub(), manifolds(false), panels(), manifolds(true), "@flow:cool",
    pumpBack(), g("wheel"), crew("mochi"), crew("bun"), pumpFront(),
    ...yardBack(crew, g), "@flow:arcs",
  ];
}
export function frontItems(crew) {
  return [
    ...yardFront(crew, g),
    panel(), g("dials"), stair(), ...props(), siteFront(),
    `<g class="pg-fb">${g("fb-lamps")}${g("fb-sf")}${g("fb-air")}</g>`,
  ];
}
void box; void D; void at;
