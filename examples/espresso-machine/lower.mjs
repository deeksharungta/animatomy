import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D, rod, pipe, ringX } from "./model.mjs";

// Below the deck: the water tank, the vibratory pump with the rod Ollie works, the over-pressure valve Crumb sits on, and their pipes.
export function tank() {
  const T = C.TANK, x1 = T.x + T.w;
  const out = [S(k.slabOf(T, C.FLOOR, C.TANK_TOP - C.FLOOR, P, 4, 0.8), { tone: "hi" })];
  out.push(Ln(ringX(x1, T.y + 8, T.y + 18, 20, 132, 2), { tone: "mid" }));
  out.push(Ln(Array.from({ length: 12 }, (_, i) => k.segment([x1, T.y + 8, 30 + i * 9], [x1, T.y + (i % 2 ? 10 : 11.5), 30 + i * 9], P)).join(""), { tone: "lo" }));
  out.push(Ln(k.sideSeam(T, 132, P, 4), { tone: "faint" }));
  out.push(S(rod([-24, T.y + T.d, 12], [0, 1, 0], 2.6, 0, 2, 16), { tone: "mid" }));
  out.push(S(rod([-24, T.y + T.d + 2, 12], [0, 1, 0], 1.9, 0, 1.4, 12), { tone: "mid" }));
  return out.join("");
}

export function hoses() {
  const { PUMP: Q, OPV: V } = C;
  return [
    pipe([[-24, -24.6, 12], [-24, -14, 12], [-24, -14, Q.z], [Q.x0 - 4, -14, Q.z]], 1.6, { bend: 3 }),
    pipe([[V.x - 4, V.y, 38], [-10, V.y, 38], [-10, -24, 38], [-20, -24, 38], [-20, -28, 38]], 1.4, { bend: 3 }),
  ].join("");
}

export function pump() {
  const { PUMP: Q } = C, y = Q.y, z = Q.z;
  const out = [];
  for (const x of [-4, 8]) out.push(S(k.slabOf({ x: x - 2, y: y - 6, w: 4, d: 12, r: 0.6 }, C.FLOOR, z - Q.r - C.FLOOR + 0.6, P, 3, 0.3), { tone: "mid" }));
  out.push(S(rod([Q.x0 - 4, y, z], [1, 0, 0], 2, 0, 4, 16), { tone: "mid" }));
  out.push(S(L.solidOf([[0, 4.5], [1.5, 6, 1], [6, 6]], L.frameAlong([Q.x0, y, z], [1, 0, 0]), P), { tone: "hi", crease: "none" }));
  out.push(S(rod([Q.x0 + 6, y, z], [1, 0, 0], Q.r, 0, 16, 40), { tone: "hi", crease: "lo" }));
  out.push(Ln([2.5, 13.5].map((s) => L.arcOf(L.frameAlong([Q.x0 + 6, y, z], [1, 0, 0]), s, Q.r, P)).join(""), { tone: "faint" }));
  out.push(S(L.solidOf([[0, 6], [4.5, 6, 1], [6, 4]], L.frameAlong([Q.x0 + 22, y, z], [1, 0, 0]), P), { tone: "hi", crease: "none" }));
  out.push(S(rod([C.OPV.x, y, z + 6], [0, 0, 1], 2, 0, 2.4, 16), { tone: "mid" }));
  out.push(D([[Q.x0 + 8, y + 5.8, z + 5.8], [Q.x0 + 20, y + 5.8, z + 5.8]].map(at), { size: 0.45 }));
  return out.join("");
}

// The pump's nose: the gland the rod slides through, and the outlet up to the valve.
export function pumpNose() {
  const { PUMP: Q, OPV: V } = C;
  return S(rod([Q.x1 + 1, Q.y, Q.z], [1, 0, 0], 2.6, 0, 1.4, 20), { tone: "mid" }) +
    pipe([[V.x, V.y, Q.z + 8], [V.x, V.y, V.z0]], 1.6, { caps: [false, false] });
}

export function valve() {
  const V = C.OPV;
  const out = [S(k.slabOf({ x: V.x - V.r, y: V.y - V.r, w: V.r * 2, d: V.r * 2, r: 1 }, V.z0, V.z1 - V.z0, P, 3, 0.4), { tone: "hi" })];
  out.push(D([[V.x + V.r, V.y - 2, V.z1 - 1.5], [V.x - 2, V.y + V.r, V.z1 - 1.5]].map(at), { size: 0.45 }));
  out.push(S(rod([V.x, V.y + V.r, 38], [0, 1, 0], 2.2, 0, 1.6, 16), { tone: "mid" }));
  out.push(S(rod([V.x - V.r, V.y, 38], [-1, 0, 0], 2.2, 0, 1.6, 16), { tone: "mid" }));
  return out.join("");
}

// The cage round the valve's spring: three posts and a top ring the stem rises through.
export function cage(front) {
  const V = C.OPV, posts = [0, 1, 2].map((i) => (i * 2 * Math.PI) / 3 + 0.4);
  const list = posts.filter((a) => (Math.cos(a) + Math.sin(a) > 0) === front);
  const out = list.map((a) => S(rod([V.x + 3.6 * Math.cos(a), V.y + 3.6 * Math.sin(a), V.z1], [0, 0, 1], 0.6, 0, V.cage - V.z1, 8), { tone: "mid" }));
  if (front) out.push(S(L.ringBand(0, 1.2, 1.2, 4.4, L.frameAlong([V.x, V.y, V.cage], [0, 0, 1]), P), { tone: "mid" }));
  return out.join("");
}

// Where the outlet climbs from the valve to the back of the boiler, behind the deck.
export function riser() {
  const V = C.OPV;
  return pipe([[V.x, V.y + V.r + 1.6, 38], [V.x, 4, 38], [V.x, 4, 90], [V.x, 18, 90], [V.x - 0.6, 23.4, 90]], 1.6, { bend: 4 });
}

// The piston rod and the crosshead handle Ollie pushes and pulls; the page slides this group along x.
export function piston() {
  const { ROD: R, HANDLE: H, PUMP: Q } = C;
  return S(rod([R.x0, Q.y, Q.z], [1, 0, 0], R.r, 0, H.x - R.x0, 12), { tone: "hi" }) +
    S(k.cylinder(H.x, Q.y, H.r, H.z0, H.z1 - H.z0, P, 14, 0.4), { tone: "hi" }) +
    S(k.cylinder(H.x, Q.y, 2.6, Q.z - 2.4, 4.8, P, 20, 0.4), { tone: "mid" }) +
    [H.z0, H.z1].map((z) => S(L.sphereOf([H.x, Q.y, z], 2.1, P, { steps: 18 }), { tone: "hi" })).join("");
}
