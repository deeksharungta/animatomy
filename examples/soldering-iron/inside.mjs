import * as k from "../../kit/iso-kit.mjs";
import { C, P, at, S, Ln, D, rod, pipe } from "./model.mjs";

// The switch chamber's fixed insides: the terminal board, the cord's terminal block, the rod's rear guide,
// the spring stop, the two contact leaves and the wires between them.
const B = C.BOARD, TOP = B.z + B.h, Z = C.ZC;
export const BOARD_TOP = TOP;
const TB = { x: C.TERM.x0, y: -7, w: C.TERM.x1 - C.TERM.x0, d: 12, r: 0.8 };
export const LIVE_SCREW = [-57.5, 3.4, TOP + 5.5];
export const NEUTRAL_SCREW = [-57.5, -3.6, TOP + 5.5];
const leaf = (y) => ({ x: C.CONTACT_X, y: y - 1, w: 0.8, d: 2, r: 0.2 });
export const CONTACT = C.CONTACTS.map((y) => [C.CONTACT_X - 0.1, y, Z - 2.4]);
const wire = (pts, tone = "lo") => k.wireSvg(at(pts[0]), at(pts.at(-1)), { via: pts.slice(1, -1).map(at), tone, size: 0.7 });

export function board() {
  const out = [S(k.slabOf(B, B.z, B.h, P, 3, 0.4), { tone: "lo" })];
  out.push(Ln(k.planOutline(k.insetPlan(B, 1.6), TOP, P, 3), { tone: "faint" }));
  out.push(D([[-60.4, -5.9], [-6.2, -5.9], [-60.4, 4.9], [-6.2, 4.9]].map(([x, y]) => at([x, y, TOP])), { size: 0.5, tone: "mid" }));
  // Grommets where the neutral, the switched lead and the heater's leads pass under the board.
  for (const [x, y] of [[-51.5, -5.4], [-37, -5.6], [-6, -5.4]]) out.push(Ln(k.ring(x, y, 0.9, TOP, P, 16), { tone: "mid" }));
  return out.join("");
}

// The terminal block the cord lands on, and the neutral wire down through the board.
export function farSide() {
  const out = [S(k.slabOf(TB, TOP, 5.5, P, 3, 0.4), { tone: "hi" })];
  out.push(Ln(k.sideSeam(TB, TOP + 2.4, P, 3), { tone: "faint" }));
  for (const s of [LIVE_SCREW, NEUTRAL_SCREW]) out.push(S(k.cylinder(s[0], s[1], 1.5, TOP + 5.5, 0.8, P, 16), { tone: "mid" }) + Ln(k.lineOnTop([s[0] - 1.1, s[1]], [s[0] + 1.1, s[1]], TOP + 6.3, P), { tone: "lo" }));
  out.push(wire([[NEUTRAL_SCREW[0] + 1.4, NEUTRAL_SCREW[1], TOP + 5.8], [-53.4, NEUTRAL_SCREW[1], TOP + 5.8], [-53.4, -5.4, TOP + 0.4], [-51.5, -5.4, TOP + 0.4]]));
  return cordStub() + out.join("");
}

// The live wire along the board's near edge to the near contact, which Volta lies on, clear of Ember's feet.
export function liveWire() {
  return wire([[LIVE_SCREW[0] + 1.4, LIVE_SCREW[1], TOP + 5.8], [-53.4, 6.8, TOP + 5.8], [-53.4, 6.8, TOP + 0.4], [-37.5, 6.8, TOP + 0.4], [C.CONTACT_X + 0.4, C.CONTACTS[1], TOP + 0.4]]);
}

const cordStub = () => pipe([[-61, 0, 47.2], [-63.6, 0, 47.2]], 2.5, { tone: "mid", caps: [false, true] });

// The rear guide the rod slides in, drawn over the rod's back end.
export function guide() {
  const G = { x: C.GUIDE.x0, y: -2.4, w: C.GUIDE.x1 - C.GUIDE.x0, d: 4.8, r: 0.6 };
  return S(k.slabOf(G, TOP, Z + 3 - TOP, P, 3, 0.4), { tone: "mid" }) + Ln(k.sideRing([C.GUIDE.x1, 0, Z], 1.5, "x", P), { tone: "lo" }) +
    S(rod([C.GUIDE.x1, 0, Z], [1, 0, 0], C.ROD.r, 0, 2.5, 14), { tone: "hi" });
}

// The far contact leaf stands behind the rod, the near one in front of it.
export function leafSvg(i) {
  const y = C.CONTACTS[i], l = leaf(y);
  return S(k.slabOf(l, TOP, Z - 1.2 - TOP, P, 2), { tone: "mid" }) + D([at(CONTACT[i])], { size: 0.85, tone: "hi" }) + D([at([l.x + 0.4, y, TOP + 1.4])], { size: 0.4, tone: "lo" }) +
    (i === 0 ? wire([[C.CONTACT_X + 0.8, y, TOP + 0.4], [-36.5, -5.6, TOP + 0.4], [-37, -5.6, TOP]]) : "");
}

// The spring's fixed stop: a pedestal under the rod with a washer the spring bears on.
export function stop() {
  const s = C.BULK;
  return S(k.slabOf({ x: s.x0, y: -3.2, w: s.x1 - s.x0, d: 6.4, r: 0.4 }, TOP, Z - 3.4 - TOP, P, 2, 0.3), { tone: "mid" }) +
    S(rod([s.x0, 0, Z], [1, 0, 0], 3.4, 0, s.x1 - s.x0, 28), { tone: "hi" }) + Ln(k.sideRing([s.x1, 0, Z], 1.5, "x", P), { tone: "lo" });
}

// The heater's two leads leaving its rear cap: the far one under the board, the near one to a brass post
// at the board's front end.
export function heaterLeads() {
  const [px, py] = C.POST, h = Z - 2.6;
  return wire([[-1.2, -2.6, Z - 5.2], [-3.2, -4.6, Z - 5.6], [-6, -5.4, TOP]]) + S(k.cylinder(px, py, 1.2, TOP, 0.6, P, 18), { tone: "mid" }) +
    S(k.cylinder(px, py, 0.8, TOP + 0.6, h - TOP - 0.6, P, 16), { tone: "hi" }) + S(k.cylinder(px, py, 1.1, h, 0.7, P, 16, 0.2), { tone: "hi" }) +
    wire([[-1.2, 2.6, Z - 5.2], [-2.6, 3.6, Z - 1.8], [px + 0.4, py, h + 0.7]]);
}
