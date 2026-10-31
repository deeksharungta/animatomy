import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D, ringX, ringY } from "./model.mjs";

// The case, cut away on its right and front: the plinth, the trunk's back and left side, and the hood
// with its seatboard, back, left side, cornice and one turned column.
export function plinth() {
  const p = C.PLINTH, z = C.PLINTH_Z;
  const out = [`<path class="iso-halo" d="${k.haloOf(p, 0, 4, P)}"/>`];
  out.push(S(k.slabOf({ x: p.x - 1.5, y: p.y - 1.5, w: p.w + 3, d: p.d + 3, r: 1.2 }, 0, 4, P, 3, 0.5), { tone: "mid" }));
  out.push(S(k.slabOf(p, 4, z - 6, P, 3, 0.4), { tone: "mid" }));
  out.push(S(k.slabOf({ x: p.x - 1, y: p.y - 1, w: p.w + 2, d: p.d + 2, r: 1 }, z - 2, 2, P, 3, 0.4), { tone: "mid" }));
  out.push(Ln(ringY(p.y + p.d, p.x + 5, p.x + p.w - 5, 8, z - 6, 1.2) + ringX(p.x + p.w, p.y + 5, p.y + p.d - 5, 8, z - 6, 1.2), { tone: "faint" }));
  return out.join("");
}

export function trunk() {
  const t = C.TRUNK, z0 = C.PLINTH_Z, z1 = C.SEAT_Z - 3;
  const out = [];
  out.push(S(k.slabOf({ x: t.x, y: t.y, w: t.w, d: 2, r: 0.4 }, z0, z1 - z0, P, 2, 0.3), { tone: "mid" }));
  out.push(S(k.slabOf({ x: t.x, y: t.y + 2, w: 2, d: t.d - 2, r: 0.4 }, z0, z1 - z0, P, 2, 0.3), { tone: "mid" }));
  out.push(Ln(ringY(t.y + 2, t.x + 6, t.x + t.w - 6, z0 + 8, z1 - 8, 2) + ringX(t.x + 2, t.y + 6, t.y + t.d - 6, z0 + 8, z1 - 8, 2), { tone: "faint" }));
  out.push(Ln(k.segment([t.x + t.w, t.y + 2, z0], [t.x + t.w, t.y + 2, z1], P), { tone: "faint" }));
  out.push(D([[t.x + 4, t.y + 2, z1 - 4], [t.x + t.w - 4, t.y + 2, z1 - 4], [t.x + 4, t.y + 2, z0 + 4], [t.x + t.w - 4, t.y + 2, z0 + 4]].map(at), { size: 0.45 }));
  return out.join("");
}

// The front stile left of the cut, with the trunk door's hinge pins.
export function stile() {
  const t = C.TRUNK, z0 = C.PLINTH_Z, z1 = C.SEAT_Z - 3;
  return S(k.slabOf({ x: t.x, y: t.y + t.d - 2, w: 8, d: 2, r: 0.4 }, z0, z1 - z0, P, 2, 0.3), { tone: "mid" }) +
    [z0 + 18, z1 - 18].map((z) => S(k.cylinder(t.x + 8.4, t.y + t.d - 1, 0.6, z, 5, P, 10), { tone: "hi" })).join("");
}

export function hoodWalls() {
  const h = C.HOOD, z0 = C.SEAT_Z - 3, z1 = C.HOOD_TOP;
  const out = [];
  out.push(S(k.slabOf({ x: h.x, y: h.y, w: h.w, d: 2, r: 0.4 }, z0, z1 - z0, P, 2, 0.3), { tone: "mid" }));
  out.push(S(k.slabOf({ x: h.x, y: h.y + 2, w: 2, d: h.d - 2, r: 0.4 }, z0, z1 - z0, P, 2, 0.3), { tone: "mid" }));
  out.push(Ln(ringX(h.x + 2, h.y + 6, h.y + h.d - 6, z0 + 8, z1 - 8, 2) + k.segment([h.x + h.w, h.y + 2, z0], [h.x + h.w, h.y + 2, z1], P), { tone: "faint" }));
  return out.join("");
}

// The seatboard the movement stands on; the pendulum and the weight's cord pass down through it.
export function seatboard() {
  const h = C.HOOD, seat = { x: h.x + 2, y: h.y + 2, w: h.w - 2, d: h.d - 2, r: 0.4 };
  return S(k.slabOf(seat, C.SEAT_Z - 3, 3, P, 2, 0.3), { tone: "hi" }) + Ln(k.planOutline(k.insetPlan(seat, 2.5), C.SEAT_Z, P, 2), { tone: "faint" });
}

// The cornice over the back of the hood, with a brass finial on top.
export function cornice() {
  const h = C.HOOD, z = C.HOOD_TOP;
  const top = { x: h.x - 2, y: h.y - 2, w: h.w + 4, d: 14, r: 0.8 };
  return S(k.slabOf(top, z, 3, P, 3, 0.4), { tone: "mid" }) + S(k.slabOf({ ...k.insetPlan(top, 2), d: 10 }, z + 3, 2.4, P, 3, 0.4), { tone: "mid" }) +
    S(L.solidOf([[0, 2], [1.5, 2.6, 1], [4, 1.2, 1], [6, 2.4, 1], [8, 2.2, 1], [10.5, 0.4]], L.frameAlong([0, h.y + 5, z + 5.4], [0, 0, 1]), P), { tone: "hi", crease: "none" });
}

// A turned column at the hood's front left corner.
export function column() {
  const h = C.HOOD, x = h.x + 2.5, y = h.y + h.d - 2.5, z0 = C.SEAT_Z, z1 = C.HOOD_TOP;
  return S(L.solidOf([[0, 2], [2, 2, 1], [3, 1.4, 1], [z1 - z0 - 3, 1.2, 1], [z1 - z0 - 2, 2, 1], [z1 - z0, 2]], L.frameAlong([x, y, z0], [0, 0, 1]), P), { tone: "hi", crease: "none" });
}
