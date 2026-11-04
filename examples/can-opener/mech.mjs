// The drive and its mounts, drawn once at rest: bearing posts, the wheel's rims and hub, the axle, the spur pair's
// bodies, the feed shaft and gear body, the lever's pivot bracket, the microswitch, the spring shelf and the wiring.
// What turns or swings (rungs, spokes, teeth, the lever) is redrawn each frame in dynamic.mjs.
import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at } from "./model.mjs";

const S = (paths, style) => k.solidSvg(paths, style);
const Ln = (d, style) => k.lineSvg(d, style);
const D = (pts, style) => k.dotsSvg(pts, style);
const alongX = (x, y, z) => L.frameOf([x, y, z], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
const alongY = (x, y, z) => L.frameOf([x, y, z], [0, 1, 0], [0, 0, 1], [1, 0, 0]);
export const ringX = (x, cy, cz, r, n = 72) => k.pathOf(Array.from({ length: n }, (_, i) => at([x, cy + r * Math.cos((i / n) * Math.PI * 2), cz + r * Math.sin((i / n) * Math.PI * 2)])), true);
const zf = C.FLOOR + C.PLATE;

// The wheel's far rim, hub and far bearing post: behind the hamsters.
export function wheelBack() {
  const W = C.WHEEL, out = [];
  out.push(Ln(ringX(W.x0, 0, W.z, W.r) + ringX(W.x0, 0, W.z, W.r - 1.2), { tone: "hi" }));
  return out.join("");
}

export function wheelFront() {
  const W = C.WHEEL, out = [];
  out.push(S(L.disc(0, W.x1 - W.x0, 3.2, alongX(W.x0, 0, W.z), P), { tone: "hi" }));
  out.push(Ln(ringX(W.x1, 0, W.z, W.r) + ringX(W.x1, 0, W.z, W.r - 1.2), { tone: "hi" }));
  out.push(S(L.disc(0, 2, 4.2, alongX(W.x1 + 1.2, 0, W.z), P), { tone: "hi" }));
  out.push(D([at([W.x1 + 3.2, 0, W.z])], { size: 0.55, tone: "hi" }));
  return out.join("");
}

// Bearing posts on the floor plate, the axle out to the pinion, and the feed shaft's back end with its collar.
export function drive() {
  const out = [];
  for (const { x, w } of C.POSTS) {
    const top = x === -67 ? C.FEED.z + 6 : C.WHEEL.z + 6;
    out.push(S(k.slabOf({ x, y: -6, w, d: 12, r: 1 }, zf, top - zf, P, 3, 0.4), { tone: "mid" }));
    out.push(S(k.slabOf({ x: x - 2, y: -9, w: w + 4, d: 18, r: 1 }, zf, 3, P, 3, 0.4), { tone: "mid" }));
    out.push(D([[x - 1, -7], [x - 1, 7]].map(([xx, y]) => at([xx, y, zf + 3])), { size: 0.45 }));
    // A split bearing cap on top, held by two screws, with its oil hole.
    out.push(S(k.slabOf({ x: x - 0.6, y: -7, w: w + 1.2, d: 14, r: 1.2 }, top, 3, P, 3, 0.4), { tone: "hi" }));
    out.push(D([[x + w / 2, -4.6], [x + w / 2, 4.6]].map(([xx, y]) => at([xx, y, top + 3])), { size: 0.5 }));
    out.push(Ln(k.sideSeam({ x: x - 0.6, y: -7, w: w + 1.2, d: 14, r: 1.2 }, top + 1, P, 3), { tone: "faint" }));
  }
  out.push(S(L.disc(0, C.PIN.x0 - (C.WHEEL.x1 + 3.2), 1.6, alongX(C.WHEEL.x1 + 3.2, 0, C.WHEEL.z), P), { tone: "hi" }));
  for (const { x, w } of C.POSTS) out.push(S(L.disc(0, 1.4, 5, alongX(x + w, 0, C.WHEEL.z), P), { tone: "hi" }));
  out.push(S(L.disc(0, 1.4, 5, alongX(-63, 0, C.FEED.z), P), { tone: "hi" }));
  out.push(S(L.disc(0, C.GEAR.x0 - -61.6, C.SHAFT.r, alongX(-61.6, 0, C.FEED.z), P), { tone: "hi" }));
  return out.join("");
}

// The pinion and spur gear bodies; their teeth and the gear's holes turn in dynamic.mjs.
export const pinionBody = () => S(L.disc(0, C.PIN.x1 - C.PIN.x0, C.PIN.r - 0.8, alongX(C.PIN.x0, 0, C.PIN.z), P), { tone: "hi", crease: "lo" }) +
  S(L.disc(0, 2, 4, alongX(C.PIN.x1, 0, C.PIN.z), P), { tone: "hi" }) + D([at([C.PIN.x1 + 2, 0, C.PIN.z + 2.6])], { size: 0.45 });
export const gearBody = () => S(L.disc(0, C.GEAR.x1 - C.GEAR.x0, C.GEAR.r - 0.8, alongX(C.GEAR.x0, 0, C.FEED.z), P), { tone: "hi", crease: "lo" }) +
  Ln(ringX(C.GEAR.x1, 0, C.FEED.z, 15.5) + ringX(C.GEAR.x1, 0, C.FEED.z, 7), { tone: "faint" }) +
  S(L.disc(0, 3, 5, alongX(C.GEAR.x1, 0, C.FEED.z), P), { tone: "hi" });

// The feed shaft from the gear's hub to the face plate (inside), then out to the feed gear (outside).
export const shaftIn = () => S(L.disc(0, -20 - (C.GEAR.x1 + 3), C.SHAFT.r, alongX(C.GEAR.x1 + 3, 0, C.FEED.z), P), { tone: "hi" });
export const shaftOut = () => S(L.disc(0, C.FEED.x0 - (C.HOUSE.x + C.HOUSE.w + 5), C.SHAFT.r, alongX(C.HOUSE.x + C.HOUSE.w + 5, 0, C.FEED.z), P), { tone: "hi" });
export const feedBody = () => S(L.disc(0, C.FEED.x1 - C.FEED.x0, C.FEED.r - 0.7, alongX(C.FEED.x0, 0, C.FEED.z), P), { tone: "hi", crease: "lo" }) +
  S(L.disc(0, 1.2, 3.4, alongX(C.FEED.x1, 0, C.FEED.z), P), { tone: "mid" });

// The lever's pivot: a bracket on the back wall and the pin it swings on, with its E-clip.
export function pivot() {
  const [px, py, pz] = C.PIVOT, out = [];
  out.push(S(k.slabOf({ x: px - 5, y: C.HOUSE.y + C.WALL, w: 10, d: py - 4 - (C.HOUSE.y + C.WALL), r: 1 }, pz - 6, 12, P, 3, 0.4), { tone: "mid" }));
  out.push(D([[px - 3, C.HOUSE.y + C.WALL + 3, pz + 6], [px + 3, C.HOUSE.y + C.WALL + 3, pz + 6]].map(at), { size: 0.45 }));
  out.push(S(L.disc(0, 17, 1.8, alongY(px, py - 8, pz), P), { tone: "hi" }));
  return out.join("");
}
export const pivotClip = () => S(L.ringBand(0, 0.8, 1.8, 3.2, alongY(C.PIVOT[0], C.PIVOT[1] + 5, C.PIVOT[2]), P), { tone: "mid" });

// The microswitch under the lever's back end, on a bracket from the back wall; its plunger moves in dynamic.mjs.
export function microswitch() {
  const s = C.SWITCH, out = [];
  out.push(S(k.slabOf({ x: s.x - 1, y: C.HOUSE.y + C.WALL, w: s.w + 2, d: s.y - (C.HOUSE.y + C.WALL), r: 0.6 }, s.z - 3, 3, P, 2, 0.4), { tone: "mid" }));
  out.push(S(k.slabOf({ x: s.x, y: s.y, w: s.w, d: s.d, r: 1 }, s.z, s.h, P, 3, 0.4), { tone: "hi" }));
  out.push(Ln(k.sideSeam({ x: s.x, y: s.y, w: s.w, d: s.d, r: 1 }, s.z + 2.5, P, 3), { tone: "faint" }));
  out.push(D([[s.x + 2, s.y + s.d / 2, s.z + s.h], [s.x + s.w - 2, s.y + s.d / 2, s.z + s.h]].map(at), { size: 0.45 }));
  for (const y of [s.y + 2, s.y + 6]) out.push(S(k.slabOf({ x: s.x - 2.4, y: y - 0.8, w: 2.4, d: 1.6, r: 0.2 }, s.z + 2, 3, P, 2), { tone: "mid" }));
  return out.join("");
}

// Roo's spring shelf: a plate on a post from the floor, with a rubber foot pad where he stands.
export function shelf() {
  const s = C.SHELF, out = [];
  out.push(S(k.slabOf({ x: s.x + 5, y: s.y + 10, w: 6, d: 6, r: 1 }, zf, s.z - zf, P, 3, 0.4), { tone: "mid" }));
  out.push(S(k.slabOf({ x: s.x + 2, y: s.y + 7, w: 12, d: 12, r: 1 }, zf, 2, P, 3, 0.4), { tone: "mid" }));
  out.push(S(k.slabOf({ ...s, r: 1 }, s.z, s.h, P, 3, 0.5), { tone: "hi" }));
  out.push(Ln(k.planOutline(k.insetPlan({ ...s, r: 1 }, 2), s.z + s.h, P, 3), { tone: "faint" }));
  out.push(D(k.corners({ ...s, r: 1 }, 1.6).map(([x, y]) => at([x, y, s.z + s.h])), { size: 0.45 }));
  return out.join("");
}

// The cord's strain-relief clamp on the floor plate, with its two screws, and a cable clip on the way up.
export function clamp() {
  const out = [];
  out.push(S(k.slabOf({ x: -94, y: C.HOUSE.y + C.WALL, w: 16, d: 10, r: 2 }, zf, 7, P, 3, 0.5), { tone: "hi" }));
  out.push(D([[-91, C.HOUSE.y + C.WALL + 7], [-81, C.HOUSE.y + C.WALL + 7]].map(([x, y]) => at([x, y, zf + 7])), { size: 0.55 }));
  out.push(Ln(k.sideSeam({ x: -94, y: C.HOUSE.y + C.WALL, w: 16, d: 10, r: 2 }, zf + 3.5, P, 3), { tone: "faint" }));
  out.push(S(k.slabOf({ x: -100, y: 8, w: 12, d: 14, r: 2 }, zf, 5, P, 3, 0.5), { tone: "mid" }));
  out.push(Ln(k.planOutline({ x: -98, y: 10, w: 8, d: 10, r: 1 }, zf + 5, P, 3), { tone: "faint" }));
  out.push(D([at([-94, 15, zf + 5])], { size: 0.55 }));
  return out.join("");
}

// Wires: the cord comes in at the back wall's grommet, runs to the switch and on to the motor's terminal block.
export function wiring() {
  const s = C.SWITCH, out = [];
  out.push(S(k.slabOf({ x: -74, y: C.HOUSE.y + C.WALL, w: 8, d: 4, r: 0.6 }, 86, 8, P, 2), { tone: "hi" }));
  out.push(D([[-72, C.HOUSE.y + C.WALL + 4, 90], [-68, C.HOUSE.y + C.WALL + 4, 90]].map(at), { size: 0.5, tone: "mid" }));
  const w1 = k.wireSvg(at([-86, C.HOUSE.y + C.WALL, 16]), at([s.x - 2.4, s.y + 2, s.z + 3.5]), { via: [at([-86, C.HOUSE.y + C.WALL + 0.5, 104]), at([s.x - 4, C.HOUSE.y + C.WALL + 0.5, 112]), at([s.x - 4, s.y + 2, 112])], tone: "lo", size: 0.9 });
  const w2 = k.wireSvg(at([s.x - 2.4, s.y + 6, s.z + 3.5]), at([-72, C.HOUSE.y + C.WALL + 4, 90]), { via: [at([s.x - 6, s.y + 6, 110]), at([s.x - 6, C.HOUSE.y + C.WALL + 0.8, 100]), at([-72, C.HOUSE.y + C.WALL + 0.8, 94])], tone: "lo", size: 0.9 });
  out.push(w1.replace('class="iso-line"', 'class="iso-line" data-part="wire1"'), w2.replace('class="iso-line"', 'class="iso-line" data-part="wire2"'));
  return out.join("");
}
