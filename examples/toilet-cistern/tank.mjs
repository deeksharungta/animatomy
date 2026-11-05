// The cistern's vitreous china shell with its front wall cut away: the floor slab, back and left walls drawn before
// everything inside, the right wall and the front corner stub that carries the handle drawn after. Inside: the date
// stamp, the moulded water line, the tank bolts' heads on their rubber washers, and the fill valve's locknut.
import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D, up, alongY, circleY } from "./model.mjs";

const T = C.TANK, W = T.wall, Z0 = C.Z0, XI0 = T.x0 + W, XI1 = T.x1 - W, YI0 = T.y0 + W, YI1 = T.y1 - W;
export const INNER = { x0: XI0, x1: XI1, y0: YI0, y1: YI1 };
// A rounded rectangle standing in a y plane, as a closed path.
const panelY = (y, x0, x1, z0, z1, r) => {
  const pts = [], arc = (cx, cz, a0) => { for (let i = 0; i <= 5; i++) { const t = a0 + (i / 5) * (Math.PI / 2); pts.push(at([cx + r * Math.cos(t), y, cz + r * Math.sin(t)])); } };
  arc(x1 - r, z1 - r, 0); arc(x0 + r, z1 - r, Math.PI / 2); arc(x0 + r, z0 + r, Math.PI); arc(x1 - r, z0 + r, Math.PI * 1.5);
  return k.pathOf(pts, true);
};

export function shellBack() {
  const out = [];
  out.push(S(k.slabOf({ x: T.x0, y: T.y0, w: T.x1 - T.x0, d: T.y1 - T.y0, r: 1 }, T.z0, T.floor, P, 2, 1), { tone: "mid", crease: "faint" }));
  out.push(S(k.slabOf({ x: T.x0, y: T.y0, w: T.x1 - T.x0 - W, d: W, r: 1 }, Z0, T.z1 - Z0, P, 2), { tone: "mid" }));
  out.push(S(k.slabOf({ x: T.x0, y: YI0, w: W, d: T.y1 - YI0, r: 1 }, Z0, T.z1 - Z0, P, 2), { tone: "mid" }));
  // The ledge the lid's locating lip sits inside, moulded along the back wall under the rim.
  out.push(S(k.slabOf({ x: XI0, y: YI0, w: XI1 - XI0, d: 5, r: 0.5 }, T.z1 - 30, 5, P, 2), { tone: "mid", crease: "faint" }));
  // On the back wall's inside: the moulded water line with its end marks, and the maker's date stamp.
  const zf = Z0 + C.FULL;
  out.push(Ln(k.segment([-150, YI0, zf], [-60, YI0, zf], P) + k.segment([-150, YI0, zf], [-150, YI0, zf + 7], P) + k.segment([-60, YI0, zf], [-60, YI0, zf + 7], P), { tone: "mid" }));
  out.push(Ln(panelY(YI0, -44, 24, Z0 + 214, Z0 + 250, 6), { tone: "mid" }));
  out.push(Ln([[-36, 240, 40], [-36, 232, 50], [-36, 224, 30]].map(([x, z, w]) => k.segment([x, YI0, Z0 + z], [x + w, YI0, Z0 + z], P)).join(""), { tone: "faint", free: true }));
  out.push(Ln(circleY(-110, YI0, Z0 + 236, 9) + circleY(-110, YI0, Z0 + 236, 5), { tone: "faint" }));
  // The two screws that fix the cistern to the wall, through the back wall on rubber washers.
  for (const x of [-150, 150]) {
    const F = alongY(x, YI0, Z0 + 262);
    out.push(S(L.disc(0, 2, 11, F, P), { tone: "lo" }), S(L.disc(2, 3.4, 8, F, P), { tone: "hi" }), S(L.solidOf([[3.4, 6], [5.4, 4, 1], [6, 0.1]], F, P), { tone: "hi", crease: "faint" }));
  }
  // The mould's parting seam up the inside corner and across the floor, and the floor's slight fall to the valve.
  out.push(Ln(k.segment([XI0, YI0, Z0], [XI0, YI0, T.z1], P), { tone: "faint" }));
  out.push(Ln(k.onTop([[XI0, YI1], [XI0, YI0], [XI1, YI0]], Z0, P), { tone: "faint" }));
  // The tank bolts' heads inside, on rubber and steel washers, and the fill valve's inner locknut.
  for (const x of [-110, 110]) {
    out.push(S(k.cylinder(x, 100, 12, Z0, 3, P, 24), { tone: "lo" }));
    out.push(S(k.cylinder(x, 100, 9, Z0 + 3, 1.5, P, 24), { tone: "hi" }));
    out.push(S(L.solidOf([[0, 6], [3, 6], [5, 3.5, 1], [6, 0.1]], up(x, 100, Z0 + 4.5), P), { tone: "hi", crease: "faint" }));
  }
  out.push(S(k.extrude(k.circleRing(C.FILL.x, C.FILL.y, 20, 6), Z0, 8, P), { tone: "hi", crease: "lo" }));
  out.push(S(k.cylinder(C.FILL.x, C.FILL.y, 15, Z0 + 8, 3, P, 24), { tone: "mid" }));
  return out.join("");
}

// The right wall, the front corner stub with the handle's mounting hole, and the cut faces with a fine hatch.
export function shellFront() {
  const out = [];
  out.push(S(k.slabOf({ x: XI1, y: T.y0, w: W, d: T.y1 - T.y0, r: 1 }, Z0, T.z1 - Z0, P, 2), { tone: "mid" }));
  const st = C.STUB;
  out.push(S(k.slabOf({ x: st.x0, y: YI1, w: XI1 - st.x0, d: W, r: 0.6 }, st.z0, T.z1 - st.z0, P, 2), { tone: "mid" }));
  // The cut faces: the china's section, hatched, at the left wall, the right wall, the floor and the stub's edge.
  const hatch = [];
  for (let z = T.z0 + 8; z < T.z1 - 2; z += 9) hatch.push(k.segment([T.x0 + 1, T.y1, z], [T.x0 + W - 1, T.y1, z + 6], P), k.segment([XI1 + 1, T.y1, z], [T.x1 - 1, T.y1, z + 6], P));
  for (let x = T.x0 + 12; x < T.x1 - 12; x += 12) hatch.push(k.segment([x, T.y1, T.z0 + 2], [x + 8, T.y1, T.z0 + T.floor - 2], P));
  for (let z = st.z0 + 6; z < T.z1 - 4; z += 9) hatch.push(k.segment([st.x0, YI1 + 1, z], [st.x0, T.y1 - 1, z + 5], P));
  out.push(Ln(hatch.join(""), { tone: "faint", free: true }));
  // Outside on the right wall: the glaze's seam and the hole plugs for a side handle never fitted.
  out.push(Ln(k.segment([T.x1, T.y0, T.z0 + 30], [T.x1, T.y1, T.z0 + 30], P), { tone: "faint" }));
  out.push(S(L.disc(0, 1.2, 9, L.frameOf([T.x1, 120, 682], [1, 0, 0], [0, 1, 0], [0, 0, 1]), P), { tone: "hi", crease: "faint" }));
  // The maker's water-rating label on the side: a plate with a ringed mark and three rules of print.
  const panelX = (x, y0, y1, z0, z1, r) => {
    const pts = [], arc = (cy, cz, a0) => { for (let i = 0; i <= 5; i++) { const t = a0 + (i / 5) * (Math.PI / 2); pts.push(at([x, cy + r * Math.cos(t), cz + r * Math.sin(t)])); } };
    arc(y1 - r, z1 - r, 0); arc(y0 + r, z1 - r, Math.PI / 2); arc(y0 + r, z0 + r, Math.PI); arc(y1 - r, z0 + r, Math.PI * 1.5);
    return k.pathOf(pts, true);
  };
  out.push(S(L.prismOf(L.frameOf([T.x1, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]), [[40, 470], [150, 470], [150, 540], [40, 540]], 0, 0.6, P), { tone: "hi", crease: "faint" }));
  out.push(Ln(panelX(T.x1 + 0.6, 46, 76, 492, 534, 4), { tone: "faint" }));
  out.push(Ln([[84, 526, 56], [84, 514, 48], [84, 502, 60], [84, 490, 40], [48, 480, 96]].map(([y, z, w]) => k.segment([T.x1 + 0.6, y, z], [T.x1 + 0.6, y + w, z], P)).join(""), { tone: "mid", free: true }));
  return out.join("");
}

// The handle on the stub's face: chrome rose, hex nut, and the lever you press, on its square shaft (moving.mjs).
export function handleRose() {
  const [x, , z] = C.SHAFT, F = alongY(x, T.y1, z);
  const hex = [0, 1, 2, 3, 4, 5].map((i) => [9 * Math.cos((i / 6) * Math.PI * 2 + 0.5), 9 * Math.sin((i / 6) * Math.PI * 2 + 0.5)]);
  return S(L.solidOf([[0, 17], [3, 17, 1], [6, 13, 1], [7, 11]], F, P), { tone: "hi", crease: "faint" }) +
    S(L.prismOf(L.frameOf([x, T.y1, z], [0, 1, 0], [1, 0, 0], [0, 0, 1]), hex, 7, 13, P), { tone: "hi", crease: "lo" });
}

// Under the tank: the doughnut gasket's lip and the tank bolts, seen between the tank's foot and the deck.
export function foot() {
  const out = [];
  out.push(S(k.slabOf({ x: -150, y: 40, w: 300, d: 140, r: 20 }, C.BOWL.z, T.z0 - C.BOWL.z, P, 6), { tone: "lo" }));
  return out.join("");
}
