import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, S, Ln, D, at, AX } from "./model.mjs";

// The switch rod and what it carries, built at rest (held, contacts closed) and moved as four groups by the
// rod's travel: the rear rod and contact bridge, the spring collar, the rod through the spring, the magnet.
const rodX = (x0, x1) => S(L.disc(x0, x1, C.ROD.r, AX, P, { steps: 18 }), { tone: "hi", crease: "none" });
const disc = (x0, x1, r, tone = "hi") => S(L.disc(x0, x1, r, AX, P), { tone, crease: "none" });

export function rodParts() {
  const Br = C.BRIDGE, Co = C.COLLAR, Cu = C.CUP, M = C.MAGNET;
  const a = rodX(C.ROD.x0, Br.x0) + disc(Br.x0, Br.x1, Br.r) + Ln(L.circleOf(AX, Br.x1, Br.r - 1.4, P, 40), { tone: "faint" });
  // The collar carries a push lug on its near side: the handle Roo's paws brace on.
  const lug = S(k.slabOf({ x: Co.x0, y: 2.6, w: Co.x1 - Co.x0, d: 5.4, r: 0.4 }, C.ZC - 5.4, 3.4, P, 2), { tone: "mid" });
  const b = rodX(Br.x1, Co.x0) + disc(Co.x0, Co.x1, Co.r, "mid") + lug + D([at([Co.x0 + 0.75, 0, C.ZC + Co.r])], { size: 0.5, tone: "lo" });
  const c = rodX(Co.x1, C.BULK.x1);
  const d = disc(Cu.x0, Cu.x1, Cu.r) + disc(M.x0, M.x1, M.r, "mid") + Ln(L.arcOf(AX, M.x0 + 2, M.r, P), { tone: "faint" });
  return { a, b, c, d };
}
