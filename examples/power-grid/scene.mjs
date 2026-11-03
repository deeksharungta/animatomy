import * as k from "../../kit/iso-kit.mjs";
import { P, at, S, Ln, D, FLOOR, ROOM_TOP, box, rod, ringY, C } from "./model.mjs";

// The turbine hall: a concrete floor in bays, the back and end walls with a crane rail on corbels,
// an insulating mat, a hot stick on its hooks and the generator's inspection hatch cover on the floor.
const WY = FLOOR.y - 6, WX = FLOOR.x - 6;
export function room() {
  const out = [];
  // Wall panels: joints down each wall, and two courses round it that wrap its visible ends.
  const bw = { x: WX, y: WY, w: FLOOR.w + 6, d: 6, r: 0.4 }, sw = { x: WX, y: WY, w: 6, d: FLOOR.d + 6, r: 0.4 };
  const back = [];
  for (let x = FLOOR.x + 30; x < FLOOR.x + FLOOR.w; x += 60) back.push(k.segment([x, FLOOR.y, 0], [x, FLOOR.y, ROOM_TOP], P));
  for (const z of [18, 112]) back.push(k.sideSeam(bw, z, P, 2));
  out.push(S(k.slabOf(bw, -12, ROOM_TOP + 12, P, 2), { tone: "mid", inner: Ln(back.join(""), { tone: "faint" }) }));
  const side = [];
  for (let y = FLOOR.y + 40; y < FLOOR.y + FLOOR.d; y += 60) side.push(k.segment([FLOOR.x, y, 0], [FLOOR.x, y, ROOM_TOP], P));
  for (const z of [18, 112]) side.push(k.sideSeam(sw, z, P, 2));
  out.push(S(k.slabOf(sw, -12, ROOM_TOP + 12, P, 2), { tone: "mid", inner: Ln(side.join(""), { tone: "faint" }) }));
  // The overhead crane's rail on the back wall, on corbels, with its end stop.
  for (let x = FLOOR.x + 30; x < FLOOR.x + FLOOR.w; x += 60) {
    out.push(S(box(x - 3, FLOOR.y, 124, x + 3, FLOOR.y + 7, 132, 0.3), { tone: "lo" }));
    out.push(D([[x, FLOOR.y + 7, 128]].map(at), { size: 0.5 }));
  }
  out.push(S(box(FLOOR.x, FLOOR.y, 132, FLOOR.x + FLOOR.w, FLOOR.y + 8, 139, 0.3, 0.5), { tone: "mid" }));
  out.push(S(box(FLOOR.x, FLOOR.y + 2, 139, FLOOR.x + FLOOR.w, FLOOR.y + 5, 142, 0.3), { tone: "lo" }));
  return out.join("");
}

export function floor() {
  const out = [S(k.slabOf(FLOOR, -12, 12, P, 3, 1), { tone: "lo" })];
  const joints = [];
  for (let x = FLOOR.x + 30; x < FLOOR.x + FLOOR.w; x += 60) joints.push(k.lineOnTop([x, FLOOR.y], [x, FLOOR.y + FLOOR.d], 0, P));
  for (let y = FLOOR.y + 40; y < FLOOR.y + FLOOR.d; y += 60) joints.push(k.lineOnTop([FLOOR.x, y], [FLOOR.x + FLOOR.w, y], 0, P));
  out.push(Ln(joints.join(""), { tone: "faint" }));
  out.push(Ln(k.sideSeam(FLOOR, -6, P, 3), { tone: "faint" }));
  return out.join("");
}

// Things on the floor and walls behind the machines.
export function propsBack() {
  const out = [];
  // A hot stick hangs level on two hooks on the back wall, between the exciter and the switchgear.
  const z = 58, y = FLOOR.y + 2;
  for (const x of [-60, -40]) out.push(S(box(x - 1, FLOOR.y, z - 2.5, x + 1, FLOOR.y + 5, z - 1, 0.2), { tone: "mid" }));
  out.push(S(rod([-76, y + 1.4, z], [1, 0, 0], 1.3, 0, 46, 12), { tone: "mid" }));
  out.push(S(rod([-30, y + 1.4, z], [1, 0, 0], 1.9, 0, 6, 12), { tone: "hi" }));
  out.push(S(rod([-84, y + 1.4, z], [1, 0, 0], 2, 0, 8, 12), { tone: "lo" }));
  // A key cabinet for the interlock keys.
  out.push(S(box(-6, FLOOR.y, 70, 14, FLOOR.y + 4, 92, 0.3, 0.4), { tone: "mid" }));
  out.push(Ln(ringY(FLOOR.y + 4, -4, 12, 72, 90, 1), { tone: "faint" }));
  out.push(D([[-3, FLOOR.y + 4, 81], [10, FLOOR.y + 4, 81]].map(at), { size: 0.6, tone: "hi" }));
  return out.join("");
}

// The rubber mat before the switchgear.
export function mat() {
  const out = [];
  const mat = { x: 24, y: -54, w: 66, d: 30, r: 1.2 };
  out.push(S(k.slabOf(mat, 0, 1, P, 3, 0.3), { tone: "lo" }));
  const ribs = [];
  for (let y = mat.y + 4; y < mat.y + mat.d - 2; y += 4) ribs.push(k.lineOnTop([mat.x, y], [mat.x + mat.w, y], 1, P));
  out.push(Ln(ribs.join(""), { tone: "faint" }));
  return out.join("");
}
// The inspection hatch cover, taken off the generator and laid on the floor.
export function propsFront() {
  const out = [];
  const hc = { x: -188, y: 24, w: 46, d: 14, r: 3 };
  out.push(S(k.slabOf(hc, 0, 2.2, P, 4, 0.5), { tone: "mid" }));
  out.push(Ln(k.planOutline(k.insetPlan(hc, 3), 2.2, P, 4), { tone: "faint" }));
  out.push(D(k.corners(hc, 2).concat([[hc.x + hc.w / 2, hc.y + 2], [hc.x + hc.w / 2, hc.y + hc.d - 2]]).map(([x, y]) => at([x, y, 2.2])), { size: 0.55 }));
  out.push(S(box(hc.x + 18, hc.y + 11, 2.2, hc.x + 28, hc.y + 15, 4, 0.6), { tone: "hi" }));
  return out.join("");
}
export const CABLE_TRAY = { x: 14, y: -84, w: 10, d: 92, r: 0.5 };
export function tray() {
  const t = CABLE_TRAY;
  return S(k.slabOf(t, 0, 1.2, P, 2), { tone: "lo" }) + S(box(t.x, t.y, 1.2, t.x + 1, t.y + t.d, 3.4, 0.2), { tone: "mid" }) + S(box(t.x + t.w - 1, t.y, 1.2, t.x + t.w, t.y + t.d, 3.4, 0.2), { tone: "mid" });
}
