import { C, depth } from "./model.mjs";
import { arrester, ct, kiosk, cbFrame } from "./bay.mjs";
import { pole, chamber, cabinetBack, cabinetFront, couplingRod, CWIN, AXZ } from "./breaker.mjs";
import { dsFrame, dsFrameFront, dsPosts, dsFront, driveBack, driveFront, couplingTube } from "./ds.mjs";
import { gantryColumn, gantryBeam, string, jumpers, dropper, lineSpan, terms } from "./gantry.mjs";
import { yard as _y } from "./scene.mjs";

// The switchyard's painter's order: every item gets the depth of a point near its base and is sorted,
// so phases and rows interleave as they stand; the near cabinets, the front gantry column and the
// near phase's disconnector front go to the front drawing, over the arcs.
const CB = C.CB, DS = C.DS, GA = C.GANTRY, ST = C.STAND;
export function yardBack(crew, g) {
  const items = [];
  const put = (p, svg) => items.push([depth(p), svg]);
  put([GA.x, GA.ys[0], 0], gantryColumn(GA.ys[0]));
  put([GA.x - 8, GA.ys[0], 0], gantryBeam());
  put([CB.x, -44, -2], cbFrame() + couplingRod());
  put([DS.hinge, -44, -2], dsFrame() + couplingTube() + g("cranks"));
  put([136 - 14, -14, 0], kiosk());
  C.PH.forEach((y, i) => {
    put([C.ARR, y, 0], arrester(y));
    put([C.CT, y, 0], ct(y));
    put([CB.x, y, ST], pole(y) + chamber(y, -1) + chamber(y, 1) + (i === 2 ? `<g class="pg-cavity" clip-path="url(#pg-cw)"><path class="pg-void" d="${cwinPathD}"/>${g("contacts")}</g><path class="pg-rim" d="${cwinPathD}"/>` : ""));
    put([DS.hinge, y, ST], dsPosts(y) + `<g class="pg-cu">${g("blade" + i)}</g>` + dsFront(y));
    put([GA.x + 10, y, BEAM_Z], string(y) + lineSpan(i));
    put([(C.HVB.x + DS.hinge) / 2, y, 90], jumpers(i));
    put([DS.jaw + 6, y, 100], dropper(i));
  });
  items.sort((a, b) => a[0] - b[0]);
  return [...items.map(([, s]) => s), terms()];
}
export function yardFront(crew, g) {
  return [
    cabinetBack(), g("cb-spring"), g("cb-link"), g("cb-lever"), crew("roo"), cabinetFront(), g("flag"),
    driveBack(), g("disc"), g("bolt"), crew("pinch"), g("bolt-top"), driveFront(),
    dsFrameFront(), gantryColumn(GA.ys[1]),
  ];
}
import { cwinPath } from "./breaker.mjs";
const cwinPathD = cwinPath();
const BEAM_Z = GA.z - 12;
void CWIN; void AXZ; void _y;
