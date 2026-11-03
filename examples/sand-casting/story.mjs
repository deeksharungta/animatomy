import { fitView } from "../../kit/steps.mjs";
import { WIDTH, HEIGHT, C, PH, GEO, at, ROLE } from "./model.mjs";
import { fresh, advance, levelZ } from "./physics.mjs";
import { fillOf } from "./section.mjs";

// Run the pour once on the model, as the page will, and read every number the captions use from it.
const S = fresh(PH);
S.mode = "pour";
let t0 = null, tFull = null, Tfull = 0, liftMax = 0, holdMax = 0, zHold = null, tSolid = null, fsRAt = 0, pipe = 0;
for (let i = 0; i < 30 * 4000 && (tSolid === null || S.tc < tSolid + 3600); i++) {
  advance(C, PH, GEO, S, i < 30 * 60 ? 1 / 30 : 1);
  if (t0 === null && S.q > 0) t0 = S.t;
  if (tFull === null && S.tc >= 0) { tFull = S.t - t0; Tfull = S.Tm; }
  liftMax = Math.max(liftMax, S.lift);
  holdMax = Math.max(holdMax, S.hold);
  if (zHold === null && S.hold > 0) zHold = levelZ(C, GEO, S.vm);
  if (tSolid === null && S.fsC >= 1) { tSolid = S.tc; fsRAt = S.fsR; pipe = fillOf(C, GEO, S, levelZ).pipe; }
}
const r = (v, n = 0) => (n < 0 ? Math.round(v / 10 ** -n) * 10 ** -n : Number(v.toFixed(n)));
export const NUM = {
  fill: r(tFull, 1), Tfull: r(Tfull), kg: r(GEO.vMould * PH.RHO, 1), cast: r(GEO.vCast * PH.RHO_S, 1),
  lift: r(liftMax), cope: r(GEO.copeW), hold: r(holdMax), holdAt: r((zHold - C.Z.part) * C.MM), riserMm: (C.RISER.z1 - C.Z.part) * C.MM,
  fedL: r(S.fed * 1000, 2), pipe: r(pipe * C.MM, -1),
  solidMin: r(GEO.tsCast / 60, 1), riserMin: r(GEO.tsRiser / 60, 1), liquidLeft: r((1 - fsRAt) * 100), hourT: r(S.Tc, -1),
  qc: r(PH.RHO * PH.CD * GEO.aChoke * Math.sqrt(2 * PH.G * (GEO.hSprue + GEO.hBasin)), 1),
};
if (Math.abs(NUM.hourT - S.Tc) > 10) throw new Error("the cooling number drifted");

const xs = C.SPRUE.x, cx = C.CX, R = C.RISER, xe = C.FL.x1 + C.FL.t, Lx = C.LADLE.x;
export const STEPS = [
  { title: "Meet the crew", who: "Pinch and Ollie", color: "var(--anatomy-hi)", text: `A green-sand mould, cut in half, waits under a ladle of steel at ${PH.T_POUR} °C. Pinch the crab is the clamp on the box's end; Ollie the otter waits on the riser's sleeve.`, points: null, hold: 1.6 },
  { title: "You tip the ladle", who: "you · the handwheel", color: "var(--anatomy-hi)", text: `You turn the handwheel and the worm tips the ladle. Steel runs over the spout's lip into the pouring cup at ${PH.QSTAR} kg/s.`, points: [[Lx - 34, 0, 150], [Lx + 30, 0, 72], [xs + 12, 0, 84], [Lx - 26, 40, 80]] },
  { title: "Down the sprue, along the runner", who: "the steel", color: "var(--anatomy-hi)", text: "The full cup keeps the sprue running full. The steel drops to the well, runs along the runner and turns up the ingate.", points: [[xs - 12, 0, 100], [cx - 8, 0, 4], [cx - 8, 0, 34], [xs - 12, 0, 4]] },
  { title: "Up round the core", who: "the steel", color: "var(--anatomy-hi)", text: `The steel fills the sleeve from the bottom, round the sand core it is trying to float, up to the cope's face.`, points: [[cx - 28, 0, 14], [cx + 28, 0, 14], [cx + 28, 0, 70], [cx - 28, 0, 70]] },
  { title: "Pinch holds the cope down", who: "Pinch · holding", color: ROLE.holding, text: `Climbing the riser, the steel pushes up on the cope: ${NUM.lift} N against the cope's ${NUM.cope} N weight. Past ${NUM.holdAt} mm up it would float the cope; Pinch's claws hold the other ${NUM.hold} N.`, points: [[R.x - 12, 0, 60], [xe + 12, -14, 44], [xe + 12, -14, 70], [R.x, -6, 112]] },
  { title: "You tip the ladle back", who: "you · the handwheel", color: "var(--anatomy-hi)", text: `Full: ${NUM.kg} kg in ${NUM.fill} s, at ${NUM.Tfull} °C. You wind the ladle upright, and Ollie hops into the riser.`, points: [[Lx - 36, 0, 160], [Lx + 34, 0, 70], [R.x + 12, -8, 118], [Lx - 26, 40, 80]] },
  { title: "It freezes from the sand inward", who: "the steel", color: "var(--anatomy-hi)", text: `The sand draws the heat out. Below ${PH.T_LIQ} °C a solid skin grows in from every wall; thin sections freeze first.`, points: [[xs - 12, 0, 4], [xe, 0, 4], [xe, 0, 100], [xs - 12, 0, 100]] },
  { title: "Ollie feeds the shrinkage", who: "Ollie · fluid", color: ROLE.fluid, text: `Freezing steel shrinks ${PH.SHRINK * 100}%. Ollie presses the riser's liquid heart down into the casting, ${NUM.fedL} L, and sinks into a pipe ${NUM.pipe} mm deep. At ${PH.T_SOL} °C it is solid: ${NUM.solidMin} min.`, points: [[R.x - 14, 0, 58], [R.x + 14, 0, 58], [R.x + 6, -8, 116], [cx - 22, 0, 22]] },
  { title: "The riser froze last", who: "everyone", color: "var(--anatomy-hi)", text: `The riser was still ${NUM.liquidLeft}% liquid when the casting set, so the pipe is in the riser, not the casting. An hour on, the casting glows at ${NUM.hourT} °C.`, points: null, hold: 2 },
];
export const views = STEPS.map((s) => (s.points ? fitView(s.points.map(at), [WIDTH, HEIGHT], { pad: 24, least: 0.34 }) : [0, 0, WIDTH, HEIGHT]));

export const LABEL = `A sand mould on a foundry floor, cut in half to show its inside, under a teapot ladle of molten steel hung from a jib crane and tipped by a worm gear and a handwheel. Steel pours from the ladle's spout into the pouring basin, down the sprue, along the runner and up the ingate into a flanged sleeve formed round a sand core, then up into a riser. A pouring cup and an insulating riser sleeve stand on the shallow cope. Pinch the crab, standing on the drag's handle, is the clamp: one claw on the cope's lug and one under the drag's, he holds the part of the steel's upward push that the cope's weight can't. Ollie the otter waits on the riser sleeve while the mould fills, then hops into the riser and presses its liquid heart down into the shrinking casting, sinking into the pipe it leaves. The steel glows in its own colours and freezes from the sand walls inward.`;

export const keys = [
  { mark: "lit", label: "On duty: whoever is doing the work right now" },
  { mark: "raised", label: "You: the crane, and the handwheel that tips the ladle" },
  { mark: "raised", label: "Pinch, crab, holding: the clamp, holding the steel's lift that the cope's weight can't" },
  { mark: "raised", label: "Ollie, otter, fluid: the riser's feed, pressing liquid steel down into the shrinking casting" },
];
