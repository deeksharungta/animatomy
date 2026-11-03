import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D, rod, disc, ring, faceY, box } from "./model.mjs";

// The movement between its plates: the back plate with its pillars, and every arbor with what it carries
// (barrels, ratchets, wheels, pinions, collets), cut into pieces at each wheel so they paint in depth along y.
// The front plate is off. Each item is { key, html }; the build sorts them from the back plate forward.
const PY = C.PLATE.y + 1.2, FY = C.FRONT_Y;
const pinion = (x, z, r, y0, y1) => {
  const F = faceY(x, y0, z);
  return S(L.disc(0, y1 - y0, r, F, P), { tone: "hi", crease: "lo", inner: k.fadedSvg(L.ribsOf(F, 0, y1 - y0, r, Math.round(r * 6), P, { fade: [0.1, 0.55] }), { tone: "lo" }) });
};
const collet = (x, z, y) => S(L.solidOf([[0, 1.5], [0.3, 1.5], [0.3, 1.1], [0.8, 0.9]], faceY(x, y, z), P), { tone: "hi", crease: "lo" });
const pivotEnd = (x, z, r) => S(L.solidOf([[0, r], [0.5, r * 0.6, 1], [0.7, r * 0.3]], faceY(x, FY - 0.7, z), P), { tone: "hi", crease: "none" });

// One arbor and its features, as depth items. feats: [y0, y1, html].
function arbor(x, z, r, y1, feats, end = true) {
  const items = [], list = [...feats].sort((a, b) => a[0] - b[0]);
  let y = PY;
  for (const [f0, f1, html] of list) {
    if (f0 - y > 0.05) items.push({ key: (y + f0) / 2, html: S(rod([x, y, z], [0, 1, 0], r, 0, f0 - y, 10), { tone: "hi" }) });
    items.push({ key: (f0 + f1) / 2, html });
    y = Math.max(y, f1);
  }
  if (y1 - y > 0.05) items.push({ key: (y + y1) / 2, html: S(rod([x, y, z], [0, 1, 0], r, 0, y1 - y - (end ? 0.7 : 0), 10), { tone: "hi" }) + (end ? pivotEnd(x, z, r) : "") });
  return items;
}

// A barrel with its flanges and its ratchet wheel, the click and click spring on the great wheel.
const barrel = (x, z) => {
  const B = C.BARREL, F = faceY(x, B.y0, z), len = B.y1 - B.y0 - 0.6;
  return S(L.solidOf([[0, B.r + 0.9], [0.5, B.r + 0.9], [0.5, B.r], [len - 0.5, B.r], [len - 0.5, B.r + 0.9], [len, B.r + 0.9]], F, P), { tone: "hi", crease: "lo" });
};
const ratchet = (x, z) => {
  const F = faceY(x, C.BARREL.y1 - 0.6, z);
  return S(L.disc(0, 0.6, 4.4, F, P), { tone: "mid", crease: "lo", inner: k.fadedSvg(L.ribsOf(F, 0, 0.6, 4.4, 26, P, { fade: [0.05, 0.4] }), { tone: "lo" }) });
};
export function click(x, z, side) {
  const y = C.GREAT.y + 0.6, px = x + side * 5.6, pz = z + 2.2;
  return S(rod([px, y, pz], [0, 1, 0], 0.45, 0, 1, 8), { tone: "hi" }) +
    S(L.prismOf(L.frameOf([px, y, pz], [0, 1, 0], [1, 0, 0], [0, 0, 1]), [[0, -0.35], [-side * 1.6, -1.9], [-side * 1.2, -2.3], [0, 0.35]], 0, 0.4, P), { tone: "hi" }) +
    Ln(k.pathOf([[px + side * 0.3, y + 0.5, pz + 0.4], [px + side * 1.5, y + 0.5, pz - 1.2], [px - side * 0.4, y + 0.5, pz - 2.6]].map(at)), { tone: "mid" });
}

export function movementItems(dyn) {
  const G = C.GREAT, SG = C.SGREAT, Ce = C.CENTER, T = C.THIRD, E = C.ESC, N = C.PINS, Lk = C.LOCK, W = C.WARN, Fl = C.FLY, H = C.HAMMER, Lv = C.LEVER;
  const wheel = (w, name) => [w.y, w.y + 0.6, ring(w.x, w.z, w.r - 1.5, w.r, w.y) + dyn(name)];
  const items = [];
  const B = C.BARREL;
  for (const [g, name, side] of [[G, "great", 1], [SG, "sgreat", -1]]) {
    items.push(...arbor(g.x, g.z, 0.8, -14.6, [[B.y0, B.y1 - 0.6, barrel(g.x, g.z) + dyn(name + "Coils")], [B.y1 - 0.6, B.y1, ratchet(g.x, g.z)], wheel(g, name), [g.y + 0.6, g.y + 1.6, click(g.x, g.z, side) + collet(g.x, g.z, g.y + 0.6)]], false));
    items.push({ key: -14.4, html: S(L.prismOf(L.frameOf([g.x, -15, g.z], [0, 1, 0], [1, 0, 0], [0, 0, 1]), [[-0.7, -0.7], [0.7, -0.7], [0.7, 0.7], [-0.7, 0.7]], 0, 1.4, P), { tone: "hi" }) });
  }
  items.push(...arbor(Ce.x, Ce.z, 0.7, -14.4, [wheel(Ce, "center"), [Ce.y + 0.6, Ce.y + 1.4, collet(Ce.x, Ce.z, Ce.y + 0.6)], [G.y - 0.5, G.y + 0.9, pinion(Ce.x, Ce.z, Ce.pin, G.y - 0.5, G.y + 0.9)], [-16.6, -15.4, pinion(Ce.x, Ce.z, 1.2, -16.6, -15.4)]], false));
  items.push(...arbor(T.x, T.z, 0.55, FY, [wheel(T, "third"), [Ce.y - 0.5, Ce.y + 0.9, pinion(T.x, T.z, T.pin, Ce.y - 0.5, Ce.y + 0.9)]]));
  items.push(...arbor(E.x, E.z, 0.5, FY, [[E.y, E.y + 0.5, dyn("esc")], [T.y - 0.5, T.y + 0.9, pinion(E.x, E.z, E.pin, T.y - 0.5, T.y + 0.9)]]));
  items.push(...arbor(0, C.ANCHOR.z, 0.5, FY, [[C.ANCHOR.y - 0.7, C.ANCHOR.y, dyn("anchor")]]));
  items.push(...arbor(N.x, N.z, 0.6, FY, [wheel(N, "pins"), [SG.y - 0.5, SG.y + 0.9, pinion(N.x, N.z, N.pin, SG.y - 0.5, SG.y + 0.9)]]));
  items.push(...arbor(Lk.x, Lk.z, 0.5, FY, [wheel(Lk, "lock"), [N.y - 0.5, N.y + 0.5, pinion(Lk.x, Lk.z, Lk.pin, N.y - 0.5, N.y + 0.5)]]));
  items.push(...arbor(W.x, W.z, 0.45, FY, [wheel(W, "warn"), [Lk.y - 0.5, Lk.y + 0.5, pinion(W.x, W.z, W.pin, Lk.y - 0.5, Lk.y + 0.5)]]));
  items.push(...arbor(Fl.x, Fl.z, 0.4, FY, [[W.y - 0.5, W.y + 0.5, pinion(Fl.x, Fl.z, Fl.pin, W.y - 0.5, W.y + 0.5)], [-21.4, -18.6, dyn("fly")]]));
  items.push(...arbor(H.x, H.z, 0.5, FY, [[-21.4, -20.6, dyn("tail")], [H.y - 0.3, H.y + 0.3, dyn("hammer")]]));
  items.push(...arbor(Lv.x, Lv.z, 0.55, -18.8, [[-22.3, -21.8, dyn("lifting")], [Lv.y - 0.3, Lv.y + 0.3, dyn("lever")]]));
  return items;
}

// The back plate, with the pillars' latches, an oil sink round every pivot and the movement's screws.
export function plate() {
  const p = C.PLATE, pivots = [C.GREAT, C.SGREAT, C.CENTER, C.THIRD, C.ESC, C.PINS, C.LOCK, C.WARN, C.FLY, C.HAMMER, C.LEVER, { x: 0, z: C.ANCHOR.z }];
  const sinks = pivots.map((w) => L.circleOf(faceY(w.x, PY, w.z), 0, 1.3, P)).join("");
  return S(box(p.x0, p.y, p.z0, p.x1, PY, p.z1, 0.6, 0.3), { tone: "mid" }) + Ln(sinks, { tone: "faint" }) +
    D(PILLARS.map(([x, z]) => at([x, PY, z])), { size: 0.5, tone: "mid" });
}
export const PILLARS = [[-15.5, 155.5], [15.5, 155.5], [-15.5, 197.5], [15.5, 197.5]];
// The four pillars, in two pieces each: behind the wheels, and their turned front ends.
export const pillarItems = () => PILLARS.flatMap(([x, z]) => {
  const F = faceY(x, PY, z), len = FY - PY;
  return [
    { key: -24, html: S(L.solidOf([[0, 1.3], [0.6, 1.3], [0.6, 0.9], [len - 3, 0.9]], F, P), { tone: "hi", crease: "lo" }) },
    { key: -18, html: S(L.solidOf([[len - 3, 0.9], [len - 1.6, 0.9], [len - 1.6, 1.15], [len - 0.9, 1.15], [len - 0.6, 0.6, 1], [len, 0.45]], F, P), { tone: "hi", crease: "lo" }) },
  ];
});
