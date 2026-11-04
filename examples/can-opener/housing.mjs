// The opener's housing with its right side panel off: feet, floor plate, the back and left walls seen from inside,
// the front face plate that carries the feed shaft and the lever slot, the top cap with its power light, and the cord.
import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at } from "./model.mjs";
import { SOCKET } from "./scene.mjs";

const S = (paths, style) => k.solidSvg(paths, style);
const Ln = (d, style) => k.lineSvg(d, style);
const D = (pts, style) => k.dotsSvg(pts, style);
const H = C.HOUSE, X0 = H.x, X1 = H.x + H.w, Y0 = H.y, Y1 = H.y + H.d, T = C.WALL;
// A closed slot on a face at constant x (in y, z) or constant y (in x, z), for vents and the lever slot.
export const slotX = (x, y0, y1, z0, z1, r) => {
  const pts = [], arc = (cy, cz, a0) => { for (let i = 0; i <= 6; i++) { const t = a0 + (i / 6) * (Math.PI / 2); pts.push(at([x, cy + r * Math.cos(t), cz + r * Math.sin(t)])); } };
  arc(y1 - r, z1 - r, 0); arc(y0 + r, z1 - r, Math.PI / 2); arc(y0 + r, z0 + r, Math.PI); arc(y1 - r, z0 + r, Math.PI * 1.5);
  return k.pathOf(pts, true);
};
export const slotY = (y, x0, x1, z0, z1, r) => {
  const pts = [], arc = (cx, cz, a0) => { for (let i = 0; i <= 6; i++) { const t = a0 + (i / 6) * (Math.PI / 2); pts.push(at([cx + r * Math.cos(t), y, cz + r * Math.sin(t)])); } };
  arc(x1 - r, z1 - r, 0); arc(x0 + r, z1 - r, Math.PI / 2); arc(x0 + r, z0 + r, Math.PI); arc(x1 - r, z0 + r, Math.PI * 1.5);
  return k.pathOf(pts, true);
};

export function cord() {
  const s = SOCKET;
  const route = [at([-86, Y0, 16]), at([-86, Y0 - 10, 2]), at([-120, -70, 2]), at([s.x - 4, -96, 2]), at([s.x - 4, -96, s.z - 6])];
  return k.wireSvg(route[0], at([s.x - 4, -96, s.z - 4]), { via: route.slice(1, -1).concat([route[4]]), tone: "mid", size: 1 }) +
    S(k.slabOf({ x: -90, y: Y0 - 3, w: 8, d: 3, r: 1 }, 12, 8, P, 3), { tone: "mid" });
}

// Floor, back wall and left wall: drawn before everything inside.
export function shellBack() {
  const out = [`<path class="iso-halo" d="${k.haloOf(k.insetPlan(H, -4), 0, 1, P)}"/>`];
  const feet = k.corners(H, 8).sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
  for (const [x, y] of feet) out.push(S(k.cylinder(x, y, 5, 0, C.FLOOR, P, 24, 0.4), { tone: "lo" }));
  out.push(S(k.slabOf(H, C.FLOOR, C.PLATE, P, 6, 0.8), { tone: "mid" }));
  const zf = C.FLOOR + C.PLATE;
  out.push(D([[X0 + 8, Y1 - 6], [X1 - 10, Y1 - 6]].map(([x, y]) => at([x, y, zf])), { size: 0.5 }));
  out.push(S(k.slabOf({ x: X0, y: Y0, w: H.w - 4, d: T, r: 0.8 }, zf, C.TOP - zf, P, 3), { tone: "mid" }));
  out.push(S(k.slabOf({ x: X0, y: Y0 + T, w: T, d: H.d - T, r: 0.8 }, zf, C.TOP - zf, P, 3), { tone: "mid" }));
  // Inside the back wall: vents, the rating plate with its rules and rivets, and the screw bosses.
  const yi = Y0 + T, xi = X0 + T;
  out.push(Ln([0, 1, 2, 3, 4, 5].map((i) => slotY(yi, -98 + i * 7, -94 + i * 7, 18, 38, 1.5)).join(""), { tone: "mid" }));
  out.push(Ln([0, 1, 2, 3].map((i) => slotX(xi, -20 + i * 8, -16 + i * 8, 120, 146, 1.5)).join(""), { tone: "mid" }));
  out.push(S(k.slabOf({ x: -58, y: yi, w: 26, d: 0.8, r: 0.3 }, 132, 16, P, 2), { tone: "hi", crease: "faint" }));
  out.push(Ln([[-55, 143.5, 15], [-55, 140, 20], [-55, 136.5, 12]].map(([x, z, w]) => k.segment([x, yi + 0.8, z], [x + w, yi + 0.8, z], P)).join(""), { tone: "mid", free: true }));
  out.push(D([[-56, yi + 0.8, 146], [-34, yi + 0.8, 146]].map(at), { size: 0.45 }));
  // Moulded stiffening ribs up the back wall, and screw bosses in the inside corners.
  for (const x of [-46, -30]) out.push(S(k.slabOf({ x, y: yi, w: 1.6, d: 2.4, r: 0.3 }, zf, 120 - zf, P, 2), { tone: "mid" }));
  for (const [x, y] of [[X0 + T + 4, yi + 4], [X1 - 9, yi + 4]]) {
    out.push(S(k.cylinder(x, y, 3.2, zf, 24, P, 20, 0.4), { tone: "mid" }));
    out.push(`<path class="co-void" d="${k.ring(x, y, 1.3, zf + 24, P, 16)}"/>`);
  }
  out.push(D([[X0 + 8, yi, 150], [X1 - 10, yi, 150], [X0 + 8, yi, 16], [X1 - 10, yi, 16], [xi, Y1 - 8, 150], [xi, Y1 - 8, 16]].map(at), { size: 0.5 }));
  return out.join("");
}

// The open side's cut edges, where the side panel came off: a lip along the floor plate and up the front plate.
export function shellFront() {
  const out = [];
  out.push(S(k.slabOf({ x: X1 - 4, y: Y0, w: 4, d: H.d, r: 0.8 }, C.FLOOR + C.PLATE, C.TOP - C.FLOOR - C.PLATE, P, 3), { tone: "mid" }));
  const xo = X1, xe = X1 + 1.2;
  // The cutting head's escutcheon: a raised plate round the slot and the boss, with its two screws and a rule.
  const escR = 3, escPts = [];
  const corner = (cy, cz, a0) => { for (let i = 0; i <= 5; i++) { const t = a0 + (i / 5) * (Math.PI / 2); escPts.push([cy + escR * Math.cos(t), cz + escR * Math.sin(t)]); } };
  corner(22 - escR, 152 - escR, 0); corner(-12 + escR, 152 - escR, Math.PI / 2); corner(-12 + escR, 92 + escR, Math.PI); corner(22 - escR, 92 + escR, Math.PI * 1.5);
  out.push(S(L.prismOf(L.frameOf([xo, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]), escPts, 0, 1.2, P), { tone: "hi", crease: "lo" }));
  out.push(D([[xo + 1.2, -8, 148], [xo + 1.2, 18, 96]].map(at), { size: 0.55 }));
  // The lever slot with its rubber stop, the feed shaft boss and the four face screws.
  out.push(`<path class="co-void" d="${slotX(xe, C.LEVER.y - 4, C.LEVER.y + 4, 121, 148, 3.6)}"/>`);
  out.push(S(k.slabOf({ x: xo - 1, y: C.LEVER.y - 3.5, w: 2.4, d: 7, r: 1 }, 121.5, 2, P, 3), { tone: "lo" }));
  out.push(D([[xo, Y0 + 6, 150], [xo, Y1 - 6, 150], [xo, Y0 + 6, 18], [xo, Y1 - 6, 18]].map(at), { size: 0.55 }));
  out.push(Ln(k.segment([xo, Y0 + 2, 60], [xo, Y1 - 2, 60], P), { tone: "faint" }));
  const F = L.frameOf([xe, 0, C.FEED.z], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  out.push(S(L.disc(0, 3, 8, F, P), { tone: "hi", crease: "lo" }));
  out.push(S(L.disc(3, 5, 4.5, F, P), { tone: "hi", crease: "lo" }));
  out.push(D(L.dotsOf(F, 3, 6.2, 3, P, { phase: 0.4, all: true }), { size: 0.45 }));
  // Low on the face: an access panel with its screw, and the motor's vent slots beside it.
  const pan = [];
  const pc = (cy, cz, a0) => { for (let i = 0; i <= 5; i++) { const t = a0 + (i / 5) * (Math.PI / 2); pan.push([cy + 3 * Math.cos(t), cz + 3 * Math.sin(t)]); } };
  pc(4, 54, 0); pc(-22, 54, Math.PI / 2); pc(-22, 18, Math.PI); pc(4, 18, Math.PI * 1.5);
  out.push(S(L.prismOf(L.frameOf([xo, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]), pan, 0, 0.8, P), { tone: "hi", crease: "lo" }));
  out.push(D([at([xo + 0.8, -9, 50])], { size: 0.6 }));
  out.push(Ln([0, 1, 2, 3, 4].map((i) => slotX(xo + 0.8, -19 + i * 4.6, -16.6 + i * 4.6, 22, 44, 1.2)).join(""), { tone: "mid" }));
  out.push(Ln([0, 1, 2, 3].map((i) => slotX(xo, 10 + i * 4.4, 12.4 + i * 4.4, 22, 50, 1.2)).join(""), { tone: "mid" }));
  // The can guide: a rounded nub below the gear that the can's wall leans on.
  out.push(S(k.slabOf({ x: xo, y: -3, w: 17.4, d: 6, r: 2.5 }, 78, 4, P, 4, 0.4), { tone: "mid" }));
  return out.join("");
}

export function cap() {
  const out = [];
  const zt = C.TOP;
  out.push(S(k.slabOf({ ...H, x: X0 - 1, w: H.w + 1 }, zt, 6, P, 6, 1), { tone: "hi", inner: Ln(k.sideSeam({ ...H, x: X0 - 1, w: H.w + 1 }, zt + 2, P, 6), { tone: "faint" }) }));
  out.push(Ln(k.planOutline(k.insetPlan(H, 5), zt + 6, P, 6), { tone: "faint" }));
  // A raised grip plate on the cap with a row of grip grooves, and its two screws.
  const grip = { x: -88, y: -18, w: 40, d: 36, r: 5 };
  out.push(S(k.slabOf(grip, zt + 6, 1.4, P, 5, 0.5), { tone: "hi" }));
  out.push(Ln(Array.from({ length: 7 }, (_, i) => k.lineOnTop([grip.x + 8 + i * 4, grip.y + 4], [grip.x + 8 + i * 4, grip.y + grip.d - 4], zt + 7.4, P)).join(""), { tone: "faint", free: true }));
  out.push(D([[grip.x + 3.5, grip.y + grip.d / 2], [grip.x + grip.w - 3.5, grip.y + grip.d / 2]].map(([x, y]) => at([x, y, zt + 7.4])), { size: 0.55 }));
  out.push(S(k.cylinder(-30, 12, 3.6, zt + 6, 1.2, P, 24, 0.3), { tone: "mid" }));
  out.push(`<g data-part="led">${S(k.cylinder(-30, 12, 2.2, zt + 7.2, 1, P, 20), { tone: "hi" })}</g>`);
  out.push(D([[X0 + 8, Y0 + 8], [X1 - 8, Y0 + 8], [X0 + 8, Y1 - 8], [X1 - 8, Y1 - 8]].map(([x, y]) => at([x, y, zt + 6])), { size: 0.55 }));
  return out.join("");
}
