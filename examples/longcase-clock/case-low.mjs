import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D, ringX, ringY, rod, box } from "./model.mjs";

// The lower case, cut away on its front and right: the plinth on its skirting, the trunk's backboard and left side,
// the left stile with the trunk door swung open on its hinges, the waist moulding and the seatboard.
export function plinth() {
  const p = C.PLINTH, z = C.PLINTH_Z;
  const out = [`<path class="iso-halo" d="${k.haloOf(p, 0, 4, P)}"/>`];
  const skirt = { x: p.x - 1.5, y: p.y - 1.5, w: p.w + 3, d: p.d + 3, r: 1.2 };
  out.push(S(k.slabOf(skirt, 0, 3, P, 3, 0.5), { tone: "mid", inner: Ln(k.sideSeam(skirt, 1.4, P, 3), { tone: "faint" }) }));
  out.push(S(k.slabOf({ ...k.insetPlan(skirt, 0.8), r: 1 }, 3, 1.6, P, 3, 0.4), { tone: "mid" }));
  out.push(S(k.slabOf(p, 4.6, z - 7.6, P, 3, 0.4), { tone: "mid" }));
  out.push(S(k.slabOf({ x: p.x - 0.6, y: p.y - 0.6, w: p.w + 1.2, d: p.d + 1.2, r: 1 }, z - 3, 1.2, P, 3, 0.3), { tone: "mid" }));
  out.push(S(k.slabOf({ x: p.x - 1.2, y: p.y - 1.2, w: p.w + 2.4, d: p.d + 2.4, r: 1 }, z - 1.8, 1.8, P, 3, 0.4), { tone: "mid" }));
  // A raised panel on the front and the side: a moulded frame and a fielded centre.
  out.push(Ln(ringY(p.y + p.d, p.x + 5, p.x + p.w - 5, 8.6, z - 7, 1.2) + ringY(p.y + p.d, p.x + 8, p.x + p.w - 8, 11, z - 9.4, 0.8), { tone: "faint" }));
  out.push(Ln(ringX(p.x + p.w, p.y + 5, p.y + p.d - 5, 8.6, z - 7, 1.2) + ringX(p.x + p.w, p.y + 8, p.y + p.d - 8, 11, z - 9.4, 0.8), { tone: "faint" }));
  return out.join("");
}

export function trunk() {
  const t = C.TRUNK, z0 = C.PLINTH_Z, z1 = C.WAIST_Z;
  const out = [];
  // The backboard: three planks, nailed to the sides.
  const seams = [-8, 6].map((x) => k.segment([x, t.y + 2, z0], [x, t.y + 2, z1], P)).join("");
  out.push(S(k.slabOf({ x: t.x, y: t.y, w: t.w, d: 2, r: 0.4 }, z0, z1 - z0, P, 2, 0.3), { tone: "mid", inner: Ln(seams, { tone: "faint" }) }));
  out.push(D([-20.6, 20.6].flatMap((x) => [40, 80, 120].map((z) => at([x, t.y + 2, z]))), { size: 0.4, tone: "mid" }));
  out.push(S(k.slabOf({ x: t.x, y: t.y + 2, w: 2, d: t.d - 2, r: 0.4 }, z0, z1 - z0, P, 2, 0.3), { tone: "mid" }));
  out.push(Ln(ringX(t.x + 2, t.y + 5, t.y + t.d - 6, z0 + 8, z1 - 8, 2) + ringX(t.x + 2, t.y + 8, t.y + t.d - 9, z0 + 12, z1 - 12, 1), { tone: "faint" }));
  out.push(Ln(k.segment([t.x + t.w, t.y + 2, z0], [t.x + t.w, t.y + 2, z1], P), { tone: "faint" }));
  // A repairer's paper label pasted on the backboard, and the two screws that hold the case to the wall.
  const lab = { x0: 8, x1: 18, z0: 112, z1: 126 }, ly = t.y + 2.05;
  out.push(Ln(ringY(ly, lab.x0, lab.x1, lab.z0, lab.z1, 0.3) + ringY(ly, lab.x0 + 0.8, lab.x1 - 0.8, lab.z0 + 0.8, lab.z1 - 0.8, 0.2), { tone: "lo" }));
  out.push(Ln([123, 120.5, 118, 115.5].map((z, i) => k.segment([lab.x0 + 2, ly, z], [lab.x1 - 2 - (i % 2) * 2.5, ly, z], P)).join(""), { tone: "lo", free: true }));
  for (const [x, z] of [[-14, 132], [14, 40]]) out.push(Ln(L.circleOf(L.frameAlong([x, ly, z], [0, 1, 0]), 0, 1.3, P), { tone: "lo" }), S(L.disc(0, 0.5, 0.75, L.frameAlong([x, ly, z], [0, 1, 0]), P), { tone: "hi" }));
  // The trunk's floor: boards across the top of the plinth.
  const fl = { x: t.x + 2, y: t.y + 2, w: t.w - 2, d: t.d - 2, r: 0.3 };
  out.push(S(k.slabOf(fl, z0, 0.8, P, 2), { tone: "lo", inner: Ln([-12, -2, 8].map((x) => k.lineOnTop([x, fl.y], [x, fl.y + fl.d], z0 + 0.8, P)).join(""), { tone: "faint" }) }));
  return out.join("");
}

// The left stile in front of the cut, with the trunk door's two hinges, and the door swung open past square.
const HINGE = [-14, -8], OPEN = (95 * Math.PI) / 180, DOOR = { w: 28, t: 1.6, z0: 32, z1: 132 };
const dir = [Math.cos(OPEN), Math.sin(OPEN)], inward = [Math.sin(OPEN), -Math.cos(OPEN)];
const onDoor = (u, z, off = 0) => [HINGE[0] + u * dir[0] + off * inward[0], HINGE[1] + u * dir[1] + off * inward[1], z];
const doorSlab = (u0, u1, o0, o1, z0, z1) => L.prismOf(L.frameOf(onDoor(0, z0), [0, 0, 1], [dir[0], dir[1], 0], [inward[0], inward[1], 0]), [[u0, o0], [u1, o0], [u1, o1], [u0, o1]], 0, z1 - z0, P);
export function stile() {
  const t = C.TRUNK, z0 = C.PLINTH_Z, z1 = C.WAIST_Z;
  const out = [S(box(t.x, t.y + t.d - 2, z0, HINGE[0], t.y + t.d, z1, 0.4, 0.3), { tone: "mid" })];
  out.push(Ln(k.segment([t.x + 2, t.y + t.d, z0], [t.x + 2, t.y + t.d, z1], P), { tone: "faint" }));
  for (const z of [DOOR.z0 + 12, DOOR.z1 - 16]) {
    out.push(S(box(HINGE[0] - 2.6, t.y + t.d - 0.2, z, HINGE[0], t.y + t.d + 0.15, z + 6, 0.1), { tone: "lo" }));
    out.push(S(k.cylinder(HINGE[0] + 0.2, t.y + t.d + 0.3, 0.55, z - 0.4, 6.8, P, 12), { tone: "hi" }));
  }
  return out.join("");
}

export function door() {
  const out = [S(doorSlab(0.6, DOOR.w, -DOOR.t, 0, DOOR.z0, DOOR.z1), { tone: "mid" })];
  // Its inside face: two battens, the lock box with its bolt and keyhole, and the hinge leaves.
  const bat = (z) => S(doorSlab(2, DOOR.w - 2, 0, 0.7, z, z + 4), { tone: "mid" });
  out.push(bat(DOOR.z0 + 6), bat(DOOR.z1 - 10));
  out.push(Ln(k.pathOf([onDoor(3, DOOR.z0 + 10, 0.7), onDoor(DOOR.w - 3, DOOR.z1 - 10, 0.7)].map(at)), { tone: "lo" }));
  out.push(S(doorSlab(DOOR.w - 7.5, DOOR.w - 1.2, 0, 1.6, 74, 84), { tone: "hi" }));
  const face = (u0, u1, z0, z1) => k.pathOf([onDoor(u0, z0, 0.05), onDoor(u1, z0, 0.05), onDoor(u1, z1, 0.05), onDoor(u0, z1, 0.05)].map(at), true);
  out.push(Ln(face(5, 16, 92, 108) + face(5.8, 15.2, 92.8, 107.2), { tone: "lo" }));
  out.push(Ln([105, 102.5, 100, 97.5, 95].map((z, i) => k.pathOf([onDoor(7, z, 0.05), onDoor(14 - (i % 3), z, 0.05)].map(at))).join(""), { tone: "lo", free: true }));
  out.push(S(doorSlab(DOOR.w - 1.2, DOOR.w + 0.6, 0.5, 1.1, 77.6, 79), { tone: "hi" }));
  out.push(D([onDoor(DOOR.w - 6.6, 75), onDoor(DOOR.w - 6.6, 83), onDoor(DOOR.w - 2.1, 75), onDoor(DOOR.w - 2.1, 83)].map((p) => at([p[0] + inward[0] * 1.6, p[1] + inward[1] * 1.6, p[2]])), { size: 0.4, tone: "mid" }));
  out.push(S(L.disc(0, 0.5, 0.5, L.frameAlong(onDoor(DOOR.w - 4.4, 80.5, 1.6), [inward[0], inward[1], 0]), P), { tone: "lo" }));
  for (const z of [DOOR.z0 + 12, DOOR.z1 - 16]) out.push(S(doorSlab(0.6, 6, 0, 0.25, z, z + 6), { tone: "lo" }));
  return out.join("");
}

// The waist moulding the hood sits on: two steps round the back and left of the trunk, cut with it.
export function waist() {
  const t = C.TRUNK, z = C.WAIST_Z;
  const strip = (g, z0, h) => S(k.slabOf({ x: t.x - g, y: t.y - g, w: t.w + 2 * g, d: 2 + g, r: 0.4 }, z0, h, P, 2, 0.3), { tone: "mid" }) +
    S(k.slabOf({ x: t.x - g, y: t.y + 2, w: 2 + g, d: t.d - 2 + g, r: 0.4 }, z0, h, P, 2, 0.3), { tone: "mid" });
  return strip(1, z, 3) + strip(2.4, z + 3, 3);
}

// The seatboard on the trunk's cheeks: holes for the cords, a slot for the pendulum and the bolts that hold the movement.
export function seatboard() {
  const h = C.HOOD, seat = { x: h.x + 2, y: h.y + 2, w: h.w - 2, d: h.d - 2, r: 0.4 }, z = C.SEAT_Z;
  const out = [S(k.slabOf({ x: seat.x, y: seat.y, w: 4, d: seat.d, r: 0.3 }, z - 5, 2, P, 2), { tone: "mid" })];
  out.push(S(k.slabOf(seat, z - 3, 3, P, 2, 0.3), { tone: "hi", inner: Ln(k.sideSeam(seat, z - 1.5, P, 2), { tone: "faint" }) }));
  const holes = [9.4, 12.4, -9.4, -12.4].map((x) => k.ring(x, -23.1, 0.9, z, P, 16)).join("");
  out.push(Ln(holes + k.planOutline({ x: -3, y: -31.4, w: 6, d: 3.8, r: 1.4 }, z, P, 4), { tone: "lo" }));
  for (const x of [-15, 15]) out.push(S(k.cylinder(x, -21.5, 1.4, z, 0.6, P, 16), { tone: "hi" }), Ln(k.lineOnTop([x - 0.9, -21.5], [x + 0.9, -21.5], z + 0.6, P), { tone: "lo" }));
  out.push(S(rod([12.4, -23.1, z], [0, 0, 1], 0.7, 0, 0.8, 10), { tone: "lo" }), S(rod([-12.4, -23.1, z], [0, 0, 1], 0.7, 0, 0.8, 10), { tone: "lo" }));
  return out.join("");
}
