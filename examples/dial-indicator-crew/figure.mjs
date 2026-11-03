import { critter, critterSvg } from "../../kit/critters.mjs";
import { C, P, K } from "./model.mjs";
import { room, desk, granite, blockCase } from "./scene.mjs";
import { magBase, postTop, arm, clevis } from "./stand.mjs";
import { backCover, plungerLow, stem, shell, bushing, cap, cavityBack } from "./case.mjs";
import { brackets, guideLow, plungerIn, bridge, cocks, stud, shelves, lockPivot, lockLever, frame } from "./movement.mjs";
import { CROWN, PINION1, HAIR_WHEEL, CENTRE, arbor, collet, needle, scaleRing, bezel, markers } from "./wheels.mjs";
import { block } from "./blocks.mjs";
import { toolBoard, certificate, platePropsFront, baseFace, socket } from "./props.mjs";
import { dyn0, pose0, T0 } from "./moving.mjs";
import { ROO, MO, PINCH } from "./crew.mjs";

// The figure's drawing, back to front. Groups with a data-part are moved by the page.
const g = (name, html = "", attr = "") => `<g data-part="${name}"${attr}>${html}</g>`;
const crew = (spec, pose, name) => critterSvg(critter(spec, pose, P), { part: name });
const order = () => C.BLOCKS.map((_, i) => i).sort((a, b) => K.depthOf(blockAt0(a), P) - K.depthOf(blockAt0(b), P));
const blockAt0 = (i) => { const h = [C.HOME * C.N[0] + (i - 2) * C.LANE * C.U[0], C.HOME * C.N[1] + (i - 2) * C.LANE * C.U[1], 0]; return i === 0 ? [0, 0, 0] : h; };
const hairArbor = arbor(C.HAIR.at, -17, C.HAIR.sd);
const opening = T0.circle(0, 0, C.CASE.rIn, C.CASE.d1, 128);

export function figure() {
  return [
    `<defs><clipPath id="di-open"><path d="${opening}"/></clipPath></defs>`,
    room(), toolBoard(), certificate(), socket(), desk(), granite(), blockCase(),
    magBase(), baseFace(), postTop(), clevis(1), backCover(), clevis(-1), arm(), platePropsFront(),
    `<g data-part="blocks">${order().map((i) => g("block" + i, block(i), ` transform="${dyn0.blocks[i]}"`)).join("")}</g>`,
    g("plunger-low", plungerLow(), ` transform="${dyn0.lift}"`), stem(),
    `<g class="di-cavity" clip-path="url(#di-open)">`,
    cavityBack(), frame(), brackets(), guideLow(),
    g("plunger-in", plungerIn(), ` transform="${dyn0.lift}"`),
    g("pinion", PINION1.body + PINION1.top, ` transform="${dyn0.pinion}"`),
    g("coil-back", dyn0.coilBack), g("rod-up", dyn0.rodUp), g("coil-front", dyn0.coilFront), crew(ROO, pose0.roo, "roo"),
    bridge(), arbor(C.PINION, -19, -11),
    CROWN.body, g("crown", CROWN.top, ` transform="${dyn0.crown}"`),
    CENTRE.body, g("centre", CENTRE.top, ` transform="${dyn0.centre}"`), arbor([0, 0], -7, C.NEEDLE.d),
    hairArbor, HAIR_WHEEL.body, g("hair", HAIR_WHEEL.top, ` transform="${dyn0.hair}"`),
    g("spring", `<path class="iso-line" data-tone="hi" d="${dyn0.spring.d}"/>`), stud(), g("collet", collet(), ` transform="${dyn0.collet}"`),
    cocks(), shelves(), crew(MO, pose0.mo, "mo"),
    lockPivot(), g("lock", lockLever(), ` transform="${dyn0.lock}"`), crew(PINCH, pose0.pinch, "pinch"),
    `</g>`,
    shell(), bushing(), g("cap", cap(), ` transform="${dyn0.lift}"`),
    g("scale", scaleRing(), ` transform="${dyn0.scale}"`), bezel(), markers(),
    g("needle", needle(), ` transform="${dyn0.needle}"`),
  ];
}
