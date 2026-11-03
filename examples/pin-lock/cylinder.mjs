import { C, P, K, at, S, Ln, Dt } from "./model.mjs";
import { tools } from "./tools.mjs";

// The cylinder's static parts: the housing cut through its chambers, the chamber caps and the front collar.
export const T = tools(K, P);
const H = C.HOUSING, F0 = T.plugF(0);
const zc = Math.sqrt(H.r * H.r - H.half * H.half);
const startA = (Math.atan2(zc, -H.half) * 180) / Math.PI;
// The housing's kept half in section: the round body round the plug, and the tower the chambers are bored in.
export const PROFILE = [[0, H.top], [-H.half, H.top], ...T.arc(0, 0, H.r, startA, 270, 20)];
const void_ = (pts) => `<path class="pl-void" d="${T.onCut(pts)}"/>` + Ln(T.onCut(pts), { tone: "lo" });

export function housing() {
  const out = [S(T.body(F0, PROFILE, -H.x0, -H.x1), { tone: "mid" })];
  // The plug's bore and each chamber, open in the cut, from the shear line to the cap.
  const R = C.BORE_R, top = C.CHAMBER_TOP;
  out.push(void_([[H.x0, -C.PLUG.r], [H.x1, -C.PLUG.r], [H.x1, C.PLUG.r], [H.x0, C.PLUG.r]]));
  for (const x of C.PINS) {
    out.push(void_([[x - R, C.PLUG.r], [x + R, C.PLUG.r], [x + R, top], [x - R, top]]));
    // The bore's back wall, deepest along its middle.
    out.push(Ln(T.onCut([[x, C.PLUG.r], [x, top]], 0.02, false), { tone: "faint" }));
  }
  // The shear line: where the plug's surface meets the housing, through every chamber.
  out.push(Ln(T.onCut([[H.x0, C.PLUG.r], [H.x1, C.PLUG.r]], 0.03, false), { tone: "mid" }));
  // The housing's fixing screw's tapped hole, behind the chambers: a round bore with its thread.
  const hx = -29, hz = 15, hole = T.circle(hx, hz, 2.4, 24);
  out.push(`<path class="pl-void" d="${T.onCut(hole)}"/>` + Ln(T.onCut(hole) + T.onCut(T.circle(hx, hz, 1.9, 24), 0.03), { tone: "lo" }));
  return out.join("");
}

// Chamber caps: brass plugs pressed into the tops of the bores, flush with the tower.
export function caps() {
  return C.PINS.map((x) => S(K.cylinder(x, 0, C.BORE_R, C.CHAMBER_TOP, H.top - C.CHAMBER_TOP, P, 20), { tone: "hi", crease: "lo" })).join("");
}

// The tower's top outside the board, inside the latch case: a stamped rib and the two end screws.
export function towerTop() {
  const z = H.top, out = [];
  out.push(Ln(K.segment([-19, -H.half / 2, z], [H.x1, -H.half / 2, z], P), { tone: "faint" }));
  out.push(Dt([at([-29, -H.half / 2, z])], { size: 0.5 }));
  return out.join("");
}

// The collar on the drawer's face: a half ring round the plug face, with a groove and two screws.
export function collar() {
  const c = C.COLLAR, out = [];
  out.push(S(T.body(F0, T.half(c.r, -1, 32), -c.x1, -c.x0), { tone: "mid", crease: "lo" }));
  const face = (rad, a0, a1) => T.flat(F0, -c.x1, T.arc(0, 0, rad, a0, a1, 24), false);
  out.push(Ln(face(c.r - 1.6, 90, 270), { tone: "faint" }));
  out.push(Ln(face(C.PLUG.r + 0.2, 90, 270), { tone: "lo" }));
  const s = (a) => { const t = (a * Math.PI) / 180, rr = c.r - 3.3; return at(T.W(F0, -c.x1, rr * Math.cos(t), rr * Math.sin(t))); };
  out.push(Dt([s(150), s(210)], { size: 0.55 }));
  return out.join("");
}
