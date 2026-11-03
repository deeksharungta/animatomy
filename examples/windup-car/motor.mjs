import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D, faceY, flatY, discY, box, circleY } from "./model.mjs";
import { rodY, teethPaths, ratchetPaths } from "./geo.mjs";

const B = C.BARREL, I = C.INTER, Ar = C.ARBOR, Rt = C.RATCHET, Bk = C.BRAKE;
const ring = (n, r, a0 = 0) => Array.from({ length: n }, (_, i) => [r * Math.cos(a0 + (i / n) * Math.PI * 2), r * Math.sin(a0 + (i / n) * Math.PI * 2)]);
const around = (cx, cz, r, n = 20) => ring(n, r).map(([u, v]) => [cx + u, cz + v]);

// The motor's back plate, riveted to the far wall: it carries the barrel, the intermediate arbor and the axle bush.
export function backPlate() {
  const poly = L.hullOf([...around(B.x, B.z, 20.5), ...around(I.x, I.z, 7), ...around(C.WHEEL.rearX, C.WHEEL.z, 6.5), ...around(Bk.pivot[0], Bk.pivot[1], 4), [6, C.BODY.deck], [-34, C.BODY.deck]]);
  const y = C.PLATE.y1, rivets = [[-30, 13], [3, 13], [-27, 45], [2, 45], [-46, 21]].map(([x, z]) => at([x, y, z]));
  const bushes = [[B.x, B.z, 3.6], [I.x, I.z, 2.6]].map(([x, z, r]) => S(discY(x, z, r, y, y + 0.9), { tone: "hi", crease: "lo" })).join("");
  return S(flatY(poly, C.PLATE.y0, y), { tone: "mid" }) + D(rivets, { size: 0.55, tone: "lo" }) + bushes;
}

// The intermediate arbor: its 40-tooth wheel's rim and hub, the arbor and its 12-leaf pinion (leaves drawn live).
export function interStatic() {
  const y = I.yW;
  return S(rodY(I.x, I.z, 1.2, C.PLATE.y1, I.yP1 + 0.6), { tone: "hi", crease: "none" }) +
    S(L.ringBand(0, 0.6, I.r - 2, I.r - 0.2, faceY(I.x, y, I.z), P), { tone: "hi", crease: "lo" }) +
    S(discY(I.x, I.z, 2.6, y - 0.3, y + 0.9), { tone: "hi", crease: "lo" });
}
export const interPinion = () => S(discY(I.x, I.z, I.pin - 0.3, I.yP0 + 1.6, I.yP1), { tone: "hi", crease: "lo" });
export const axlePinion = () => S(discY(C.WHEEL.rearX, C.WHEEL.z, C.AXPIN.r - 0.3, C.AXPIN.y0, C.AXPIN.y1), { tone: "hi", crease: "lo" });

// Teeth and spokes built at angle 0; the page turns each group with a screen matrix in its own plane.
export const interTeeth = () => {
  const spokes = [0, 1, 2, 3].map((i) => {
    const a = (i / 4) * Math.PI * 2 + 0.3, w = 1.2, u = [Math.cos(a), Math.sin(a)], n = [-u[1], u[0]];
    const p = (r, s) => [I.x + u[0] * r + n[0] * s, I.z + u[1] * r + n[1] * s];
    return S(flatY([p(2.4, -w), p(I.r - 1.9, -w * 0.8), p(I.r - 1.9, w * 0.8), p(2.4, w)], I.yW, I.yW + 0.6), { tone: "hi" });
  });
  return teethPaths(I.n, I.r - 0.2, I.tip, I.yW, I.yW + 0.6, { cx: I.x, cz: I.z }).map((t) => S(t, { tone: "hi", crease: "none" })).join("") + spokes.join("");
};
export const barrelTeeth = () => teethPaths(B.n, B.drum + 0.6, B.tip, B.yT, B.yF, { cx: B.x, cz: B.z }).map((t) => S(t, { tone: "hi", crease: "none" })).join("");
export const ratchetTeeth = () => ratchetPaths(Rt.n, Rt.root, Rt.r, Rt.y0, Rt.y1, B.x, B.z).map((t) => S(t, { tone: "hi", crease: "none" })).join("");

// The barrel: a toothed back flange, the drum open toward you so the spring shows, and its bore.
export function barrelBack() {
  const F = faceY(B.x, B.yT, B.z);
  return S(L.disc(0, B.yF - B.yT, B.drum + 0.6, F, P), { tone: "hi", crease: "lo" }) +
    S(discY(B.x, B.z, B.drum - 0.8, B.yF, B.yF + 0.4), { tone: "lo", crease: "none" });
}
export function barrelWall(lit = false) {
  const F = faceY(B.x, B.yF, B.z);
  return S(L.disc(0, B.y1 - B.yF, B.drum, F, P), { tone: "hi", crease: "lo", lit, inner: Ln(L.arcOf(F, 1.2, B.drum, P), { tone: "faint" }) });
}
// The drum's open mouth: the inner wall in shade where the near rim hides the back, and the back cover beyond.
export function barrelMouth() {
  const ri = B.drum - 0.8, mouth = circleY(B.x, B.y1, B.z, ri, 72), back = circleY(B.x, B.yF + 0.4, B.z, ri, 72);
  return `<clipPath id="wc-mouth"><path d="${mouth}"/></clipPath><path class="iso-fill" d="${mouth}"/><path class="iso-shade" data-shade="0" d="${mouth}"/>` +
    `<g clip-path="url(#wc-mouth)"><path class="iso-fill" d="${back}"/><path class="iso-shade" data-shade="2" d="${back}"/>${Ln(back, { tone: "faint" })}</g>`;
}
export const barrelRim = () => Ln(circleY(B.x, B.y1, B.z, B.drum - 0.8, 72), { tone: "mid" });

// The arbor: through the barrel, out through the strap and the near sill to the key.
export const arborIn = () => S(rodY(B.x, B.z, Ar.r, B.yF, Rt.y0), { tone: "hi", crease: "none" }) + S(discY(B.x, B.z, 3, B.yF + 0.4, B.yF + 2.4), { tone: "hi", crease: "lo" });
export const arborOut = () => S(rodY(B.x, B.z, Ar.r, B.y1 + 1, Rt.y0), { tone: "hi", crease: "none" });
export const arborKey = () => S(rodY(B.x, B.z, Ar.r, Rt.y1, C.KEY.y0), { tone: "hi", crease: "none" }) + S(discY(B.x, B.z, 3.4, Rt.y1, Rt.y1 + 1.2), { tone: "hi", crease: "lo" });
export const sillBush = () => S(discY(B.x, B.z, 3.2, C.BODY.y1 - 1.6, C.BODY.y1 + 0.4), { tone: "mid", crease: "lo" });

// The strap: the motor's front bridge, cut down to a bracket on the floor that holds the arbor and the click's stud.
export function strap() {
  const Ck = C.CLICK, y0 = C.STRAP.y0, y1 = C.STRAP.y1;
  const poly = L.hullOf([...around(B.x, B.z, 4.6), ...around(Ck.pivot[0], Ck.pivot[1], 3), [-17, C.BODY.deck], [3.5, C.BODY.deck]]);
  const foot = S(box(-18, y0 - 4, C.BODY.deck, 4.5, y1, C.BODY.deck + 1, 0.4, 0.2), { tone: "mid" });
  return foot + S(flatY(poly, y0, y1), { tone: "mid" }) + D([at([-14, y1, 13]), at([0.5, y1, 13])], { size: 0.5, tone: "lo" }) +
    S(discY(Ck.pivot[0], Ck.pivot[1], 1.1, y1, Ck.y1 + 0.7), { tone: "hi", crease: "lo" }) +
    D([at([-14, y0 - 2, C.BODY.deck + 1]), at([2, y0 - 2, C.BODY.deck + 1])], { size: 0.5, tone: "lo" });
}

// The brake's bracket on the floor and the stud the lever turns on.
export function brakeBracket() {
  const [px, pz] = Bk.pivot;
  return S(rodY(px, pz, 2, C.PLATE.y1, Bk.y0 - 0.2), { tone: "hi", crease: "none" }) +
    S(discY(px, pz, 2.8, Bk.y0 - 1.2, Bk.y0 - 0.2), { tone: "hi", crease: "lo" }) + S(discY(px, pz, 1, Bk.y0 - 0.2, Bk.y1 + 0.8), { tone: "hi", crease: "lo" });
}
