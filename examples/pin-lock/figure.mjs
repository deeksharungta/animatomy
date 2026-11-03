import { critter, critterSvg } from "../../kit/critters.mjs";
import { C, M, P, K, at, S, Ln } from "./model.mjs";
import { T, housing, caps, towerTop, collar } from "./cylinder.mjs";
import { base, cheek, rail, deskTop, drawerBack, boardBehind, boardTop } from "./furniture.mjs";
import { caseBack, caseShell, caseTop, post, pivot, pivotHead } from "./latch.mjs";
import { walls, bench, pinKit, tweezers } from "./scene.mjs";
import { dynamic, poses } from "./moving.mjs";
import { MICE, ROO } from "./crew.mjs";

// The rest state: no key in, plug at 0°, bolt up in its keep, drawer shut.
export const REST = { which: 0, kx: C.KEY.out, deg: 0, d: 0, duty: "", t: 0, idle: 0, v: [0, 0, 0, 0, 0], rooV: 0, aligned: false };
export const D0 = dynamic(K, P, C, M, REST, T);
export const Q0 = poses(C, M, REST, T, D0);

const g = (name, html = "", attr = "") => `<g data-part="${name}"${attr}>${html}</g>`;
const crew = (spec, pose, name) => critterSvg(critter(spec, pose, P), { part: name });
const D = C.DESK, k0 = C.BOLT.x0 + 0.4, k1 = C.BOLT.x1 - 0.4;
// The bolt shows everywhere but over the desk's cut face, except inside the keep's pocket.
const keepClip = () => {
  const face = [[D.x0, D.z0], [D.x1, D.z0], [D.x1, D.z1], [D.x0, D.z1]].map(([x, z]) => at([x, 0, z]));
  const pocket = [[k1, D.z0], [k0, D.z0], [k0, D.z0 + 4], [k1, D.z0 + 4]].map(([x, z]) => at([x, 0, z]));
  return `<clipPath id="pl-keep"><path clip-rule="evenodd" d="M-2000 -2000H4000V4000H-2000Z${K.pathOf(face, true)}${K.pathOf(pocket, true)}"/></clipPath>`;
};
const bolt = () => {
  const B = C.BOLT, L = C.LEVER, sl = [[B.x0 - 0.8, L.pz - 1.4], [B.x1 + 0.8, L.pz - 1.4], [B.x1 + 0.8, L.pz + 1.4], [B.x0 - 0.8, L.pz + 1.4]];
  const top = [[B.x0, B.bottom], [B.x1, B.bottom], [B.x1, B.top - 1.2], [B.x1 + 1.2, B.top], [B.x0, B.top]];
  const F = { o: [0, -B.half, 0], a: [0, 1, 0], u: [1, 0, 0], v: [0, 0, 1] };
  const rivets = [[B.x0 - 1.2, 20], [B.x0 - 1.2, 28]].map(([x, z]) => at([x, 0.02, z]));
  return S(T.body(F, top, 0, B.half), { tone: "mid", crease: "lo" }) + `<path class="pl-void" d="${T.onCut(sl)}"/>` + Ln(T.onCut(sl), { tone: "lo" }) + K.dotsSvg(rivets, { size: 0.45 });
};

export function figure() {
  const drawer = [
    drawerBack(), caseBack(), caseShell(), caseTop(), post(), pivot(),
    g("lever", D0.lever), pivotHead(), crew(ROO, Q0.roo, "roo"),
    g("crank", D0.crank), boardBehind(), `<g class="pl-shell">${housing()}</g>`, towerTop(),
    g("plug-back", D0.plugBack), g("plug", D0.plug), g("plug-front", D0.plugFront),
    ...C.PINS.map((x, i) => g("driver" + i, S(K.cylinder(x, 0, C.PIN_R, C.REST + M.pinLen[i], C.DRIVER, P, 20), { tone: "hi", crease: "lo", className: "pl-steel" }), ` transform="${D0.drivers[i]}"`)),
    caps(),
    ...MICE.map((m, i) => crew(m, Q0["m" + i], "m" + i)),
    boardTop(), collar(),
    `<g class="pl-key">${g("key-out", D0.keyOut)}</g>`,
  ];
  return [
    `<defs>${keepClip()}</defs>`,
    walls(), bench(), pinKit(), tweezers(), base(), cheek(), rail(),
    g("drawer", drawer.join(""), ` transform="${D0.drawer}"`),
    deskTop(),
    `<g clip-path="url(#pl-keep)">${g("drawer-b", g("bolt", bolt(), ` transform="${D0.bolt}"`) + g("eye", D0.eye), ` transform="${D0.drawer}"`)}</g>`,
  ];
}
