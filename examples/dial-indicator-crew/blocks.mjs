import * as k from "../../kit/iso-kit.mjs";
import * as G from "../../kit/lathe.mjs";
import { C, P, S, Ln } from "./model.mjs";
import { blockHome } from "./moving.mjs";

// The five gauge blocks, lapped steel, each drawn at its home in the row; the page slides them.
const rect = (w, l) => [[-w / 2, -l / 2], [w / 2, -l / 2], [w / 2, l / 2], [-w / 2, l / 2]];
export function block(i) {
  const h = C.BLOCKS[i] * 2, [x, y] = blockHome(C, i), B = C.BLOCK;
  const F = G.frameOf([x, y, 0], [0, 0, 1], C.U, C.N);
  const halo = `<path class="iso-halo" d="${k.pathOf(rect(B.w + 3, B.l + 3).map(([a, b]) => k.iso([x + a * C.U[0] + b * C.N[0], y + a * C.U[1] + b * C.N[1], 0], P)), true)}" style="filter:blur(3px)"/>`;
  const top = rect(B.w - 3, B.l - 3).map(([a, b]) => k.iso([x + a * C.U[0] + b * C.N[0], y + a * C.U[1] + b * C.N[1], h], P));
  // A lapped face shows a faint inset where the chamfer meets it; the size is engraved on the side (not drawn).
  return `${halo}<g class="di-steel">${S(G.prismOf(F, rect(B.w, B.l), 0, h, P), { tone: "hi", crease: "lo" })}${Ln(k.pathOf(top, true), { tone: "faint" })}</g>`;
}
