import { C, P, K, at, S, Ln, Dt } from "./model.mjs";
import { T } from "./cylinder.mjs";

// The latch case behind the drawer front, cut open: its back plate, floor, top and end wall, the post
// Roo braces on, and the pivot the lever turns on.
const Q = C.CASE, L = C.LEVER, BT = C.BOLT;
const screw = (x, y, z) => Ln(K.sideRing([x, y, z], 1.2, "y", P, 16), { tone: "lo" }) + Dt([at([x, y, z])], { size: 0.5 });

export function caseBack() {
  const out = [S(T.box(Q.x0, Q.x1, Q.y0, Q.y0 + 1.5, Q.z0, Q.z1), { tone: "mid", crease: "lo" })];
  const y = Q.y0 + 1.5;
  // Its face: four corner screws into the drawer front's back, and a stamped rib round the edge.
  out.push(screw(Q.x0 - 4, y, Q.z0 + 4), screw(Q.x1 + 4, y, Q.z0 + 4), screw(Q.x1 + 4, y, Q.z1 - 5), screw(-40, y, Q.z1 - 5));
  const r = [[Q.x0 - 1.5, Q.z0 + 1.5], [Q.x1 + 1.5, Q.z0 + 1.5], [Q.x1 + 1.5, Q.z1 - 2.5], [Q.x0 - 1.5, Q.z1 - 2.5]];
  out.push(Ln(K.pathOf(r.map(([x, z]) => at([x, y, z])), true), { tone: "faint" }));
  // The bolt's guide: two cheeks on the back plate either side of its path.
  for (const x of [BT.x0 + 1.6, BT.x1 - 1.6]) out.push(S(T.box(x, x + (x > BT.x0 ? -1.6 : 1.6), y, y + 3, 12, 30), { tone: "lo" }));
  return out.join("");
}

export function caseShell() {
  const out = [];
  out.push(S(T.box(Q.x0, Q.x1, Q.y0, 0, Q.z0, Q.z0 + 2), { tone: "mid", crease: "lo" }));
  out.push(S(T.box(Q.x1, Q.x1 + 2, Q.y0, 0, Q.z0, Q.z1), { tone: "mid", crease: "lo" }));
  return out.join("");
}

// The case top: a plate with the bolt's slot through it, in two pieces either side of the bolt.
export function caseTop() {
  const out = [];
  out.push(S(T.box(Q.x0, BT.x0 + 0.3, Q.y0, 0, Q.z1 - 2, Q.z1), { tone: "mid", crease: "lo" }));
  out.push(S(T.box(BT.x1 - 0.3, Q.x1, Q.y0, 0, Q.z1 - 2, Q.z1), { tone: "mid", crease: "lo" }));
  return out.join("");
}

// Roo's post: a steel rod hung from the case top, clear of the lever below it.
export function post() {
  const p = C.POST;
  return S(K.cylinder(p.x, -9.5, p.r, p.z0, p.z1 - p.z0, P, 20), { tone: "mid", crease: "none", inner: Ln(K.sideArc(p.x, -9.5, p.r, p.z1 - 4, P, 14), { tone: "faint" }) });
}

// The lever's pivot: a shouldered pin from the back plate.
export function pivot() {
  const F = K.frameOf([L.px, Q.y0 + 1.5, L.pz], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  return S(K.solidOf([[0, 2.2], [1.5, 2.2], [1.5, 1.4], [4.6, 1.4]], F, P), { tone: "lo" });
}
export function pivotHead() {
  const F = K.frameOf([L.px, -8, L.pz], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  return S(K.solidOf([[0, 2.4], [0.8, 2.4, 1], [1.4, 1.6, 1], [1.6, 0]], F, P), { tone: "mid" });
}
