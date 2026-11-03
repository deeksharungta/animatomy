import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D, faceY, flatY, discY, box, roundRect, ringY, pipe } from "./model.mjs";

const T = C.DOOR.t;

// Outside the door: the rose the key turns in, and the key's round boss.
export function outsideBack() {
  return S(discY(0, 0, 7, C.KEY.y, C.KEY.y + 10), { tone: "hi", crease: "lo", inner: Ln(L.arcOf(faceY(0, C.KEY.y, 0), 7, 7, P), { tone: "faint" }) });
}
export function outsideFront() {
  const F = faceY(0, -T - C.ROSE.t, 0);
  return S(L.solidOf([[0, C.ROSE.r - 2], [0.6, C.ROSE.r - 0.6, 1], [1.6, C.ROSE.r, 1], [C.ROSE.t, C.ROSE.r]], F, P), { tone: "mid", crease: "none", inner: Ln(L.arcOf(F, 1.6, C.ROSE.r, P), { tone: "faint" }) });
}

// The door: solid timber 44 mm thick, cut away through the spindle's axis, with a moulded panel on its face.
export function door() {
  const grain = [-8, -17, -27, -36].map((y) => k.segment([0, y, -400], [0, y, 400], P)).join("");
  const panel = ringY(0, -400, -52, -56, 400, 8) + ringY(0, -400, -57, -51, 400, 5);
  return S(box(-500, -T, -400, 0, 0, 400, 0.01), { tone: "mid", inner: Ln(grain, { tone: "faint" }) }) + Ln(panel, { tone: "faint" });
}

// A door viewer above the bell: its flange, barrel and lens, and the swivel cover turned aside on its pin.
export function viewer() {
  const [x, z] = [-64, 88];
  return S(discY(x, z, 8, 0, 1.6), { tone: "mid", crease: "lo" }) + S(discY(x, z, 5.4, 1.6, 7), { tone: "hi", crease: "lo" }) +
    S(discY(x, z, 3.4, 7, 7.6), { tone: "hi", crease: "lo", lit: false }) + Ln(L.circleOf(faceY(x, 7.6, z), 0, 2.2, P), { tone: "faint" }) +
    S(flatY(0, 0, 0, roundRect(x - 13, x - 5.5, z - 9, z - 1.5, 3.7), 1.6, 2.6), { tone: "mid" }) + D([at([x - 6.6, 2.6, z - 2.6])], { size: 0.6, tone: "lo" });
}

// A double coat hook on its back plate: two brass arms out of the plate, each ending in a ball.
export function hooks() {
  const [x, z] = [-66, 24], y0 = 2.4;
  const out = [S(flatY(0, 0, 0, roundRect(x - 5, x + 5, z - 16, z + 16, 4), 0, y0), { tone: "mid" })];
  out.push(D([at([x, y0, z - 12]), at([x, y0, z + 12])], { size: 0.6, tone: "lo" }));
  out.push(pipe([[x, y0, z - 4], [x, 18, z - 4], [x, 22, z + 4]], 1.3, { tone: "hi", bend: 4 }));
  out.push(S(L.sphereOf([x, 22.6, z + 5.2], 2, P), { tone: "hi" }));
  out.push(pipe([[x, y0, z + 6], [x, 10, z + 6], [x, 12, z + 13]], 1.1, { tone: "hi", bend: 3 }));
  out.push(S(L.sphereOf([x, 12.3, z + 14.2], 1.7, P), { tone: "hi" }));
  return out.join("");
}
