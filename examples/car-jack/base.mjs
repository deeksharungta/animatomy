// The jack's cast base, cut in half on its centre line: the casting with its bosses and name panel, and on the cut
// face every drilled passage the oil takes: the delivery gallery and the pocket where Pinch is the check valve, the
// suction gallery with its little ball valve, the release gallery and the needle's bore, and the hex plugs.
import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D, half, halfSolid, alongX, flatY, channel } from "./model.mjs";

const B = C.BASE, Q = C.POCKET, U = C.SUC, R = C.REL, PU = C.PUMP;
// The base's back half: square on the cut face, rounded at the back corners.
const corner = (cx, cy, a0, r = 8) => Array.from({ length: 7 }, (_, i) => { const a = a0 + (i / 6) * (Math.PI / 2); return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; });
export const PLAN = [[B.x1, 0], ...corner(B.x1 - 8, B.y0 + 8, 0).reverse(), ...corner(B.x0 + 8, B.y0 + 8, Math.PI * 1.5).reverse(), [B.x0, 0]];
const rect = (x0, x1, z0, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
// The passages, as channels in (x, z) on the cut face: oil-filled, so they take the oil's colour.
export const PATHS = {
  del: [[86, Q.z], [Q.x1, Q.z]], delOut: [[Q.x0, Q.z], [C.DEL_UP, Q.z], [C.DEL_UP, B.z1]],
  suc: [[U.x, B.z1], [U.x, U.z], [86, U.z]], rel: [[R.x, B.z1], [R.x, R.z], [R.seat, R.z]], relUp: [[R.riser, R.z + R.r], [R.riser, B.z1]],
};

export function baseBack() {
  const out = [`<path class="iso-halo" d="${k.haloOf({ x: B.x0 - 6, y: B.y0 - 4, w: B.x1 - B.x0 + 12, d: 58, r: 10 }, 0, 1, P)}"/>`];
  out.push(S(k.extrude(PLAN, 0, B.z1, P, { bevel: 0.8 }), { tone: "mid", crease: "lo", inner: Ln(k.ringSeam(PLAN, 8, P), { tone: "faint" }) }));
  // Raised bosses round the bottle and the pump, the reservoir tube's weld bead, and the ear post's foot.
  out.push(S(halfSolid(37, 43, B.z1, B.z1 + 3), { tone: "mid", crease: "lo" }));
  out.push(S(halfSolid(17, 21, B.z1, B.z1 + 3, PU.x), { tone: "mid", crease: "lo" }));
  // The cast name panel on the base's top, with its three raised rules and two rivets.
  const pan = { x: 42, y: -47, w: 58, d: 22, r: 2 };
  out.push(S(k.slabOf(pan, B.z1, 1, P, 3, 0.4), { tone: "hi" }));
  out.push(Ln([[47, -31, 90], [47, -36, 80], [47, -41, 70]].map(([x, y, x1]) => k.lineOnTop([x, y], [x1, y], B.z1 + 1, P)).join(""), { tone: "lo", free: true }));
  out.push(D([[pan.x + 3, pan.y + 11], [pan.x + pan.w - 3, pan.y + 11]].map(([x, y]) => at([x, y, B.z1 + 1])), { size: 0.5 }));
  out.push(D([[-54, -42], [-54, -10], [106, -8]].map(([x, y]) => at([x, y, B.z1])), { size: 0.5, tone: "lo" }));
  return out.join("");
}

// The cut face's oil: every passage, the pocket, the suction check's counterbore and the release bore's annulus.
export function galleries() {
  const oil = [];
  for (const [key, pts] of Object.entries(PATHS)) oil.push(flatY(channel(pts, 2.6), { shade: 1, tone: "lo" }));
  oil.push(flatY(rect(Q.x0, Q.x1, Q.z - Q.r, Q.z + Q.r), { shade: 1, tone: "lo" }));
  oil.push(flatY(rect(U.check[0], U.check[1], U.z - U.r, U.z + U.r), { shade: 1, tone: "lo" }));
  oil.push(flatY(rect(B.x0 + 4, R.seat - 2, R.z - R.r - 1, R.z + R.r + 1), { shade: 1, tone: "lo" }));
  oil.push(flatY(rect(PU.x - PU.r, PU.x + PU.r, PU.bottom, B.z1), { shade: 1, tone: "lo" }));
  return `<g class="cj-oil">${oil.join("")}</g>`;
}

// Parts on the cut face: the delivery seat's lip, the suction seat and spring retainer, the intake screen, the
// cylinder's O-ring in its counterbore, and the two hex plugs at the base's end with their copper washers.
export function baseParts() {
  const out = [];
  out.push(flatY([[Q.x1 - 2, Q.z + Q.hole], [Q.x1, Q.z + Q.hole], [Q.x1, Q.z + Q.r], [Q.x1 - 2, Q.z + Q.r]], { shade: 0, tone: "mid" }));
  out.push(flatY([[Q.x1 - 2, Q.z - Q.r], [Q.x1, Q.z - Q.r], [Q.x1, Q.z - Q.hole], [Q.x1 - 2, Q.z - Q.hole]], { shade: 0, tone: "mid" }));
  out.push(flatY([[U.check[0], U.z - U.r], [U.check[0] + 1.4, U.z - U.r], [U.check[0] + 1.4, U.z - 2], [U.check[0], U.z - 2]], { shade: 0, tone: "mid" }));
  out.push(flatY([[U.check[0], U.z + 2], [U.check[0] + 1.4, U.z + 2], [U.check[0] + 1.4, U.z + U.r], [U.check[0], U.z + U.r]], { shade: 0, tone: "mid" }));
  out.push(flatY(rect(U.check[1] - 1.2, U.check[1], U.z - U.r, U.z + U.r), { shade: 0, tone: "mid" }));
  out.push(Ln(k.segment([U.x - 4, 0, B.z1 - 0.6], [U.x + 4, 0, B.z1 - 0.6], P), { tone: "mid" }));
  out.push(D([-2.6, 0, 2.6].map((dx) => at([U.x + dx, 0, B.z1 - 0.6])), { size: 0.35, tone: "lo" }));
  const ringAt = (x, z, r) => Array.from({ length: 16 }, (_, i) => [x + r * Math.cos((i / 16) * Math.PI * 2), z + r * Math.sin((i / 16) * Math.PI * 2)]);
  for (const s of [-1, 1]) out.push(flatY(ringAt(s * 20, B.z1 - 2, 1.6), { shade: 0, tone: "lo" }));
  // The casting's recessed underside, open between its rim and the pump's foot.
  out.push(`<path class="cj-void" d="${k.pathOf(rect(B.x0 + 8, B.x1 - 10, 0, 3.6).map(([x, z]) => at([x, 0, z])), true)}"/>`);
  for (const z of [Q.z, U.z]) {
    out.push(S(L.prismOf(alongX(B.x1, z), halfRound(6), 0, 1.4, P), { tone: "mid" }));
    out.push(S(L.prismOf(alongX(B.x1 + 1.4, z), hex(5.4), 0, 6, P), { tone: "hi", crease: "lo" }));
    out.push(Ln(k.segment([B.x1 + 1.4, 0, z], [B.x1 + 7.4, 0, z], P), { tone: "faint" }));
  }
  // The pump bore in the base and body: a cavity above the oil, behind Ottie.
  out.push(`<path class="cj-void" d="${k.pathOf(rect(PU.x - PU.r, PU.x + PU.r, B.z1, PU.z1 + 6).map(([x, z]) => at([x, -0.1, z])), true)}"/>`);
  return out.join("");
}
export const halfRound = (r) => Array.from({ length: 17 }, (_, i) => [r * Math.cos((i / 16) * Math.PI), r * Math.sin((i / 16) * Math.PI)]);
export const hex = (r) => Array.from({ length: 7 }, (_, i) => { const a = Math.PI + (i / 6) * Math.PI; return [r * Math.cos(a), -r * Math.sin(a)]; });

// The pump body and its gland nut, the ear post with the link's lower pin: the pump's static half.
export function pumpBody() {
  const out = [];
  out.push(S(halfSolid(PU.r, PU.body, B.z1, PU.z1, PU.x), { tone: "hi", crease: "lo"}));
  out.push(S(k.extrude(half(PU.r, PU.gland, PU.x, 6), PU.z1, 6, P, { convex: false }), { tone: "hi", crease: "lo" }));
  for (const s of [-1, 1]) out.push(flatY(rect(PU.x + s * (PU.r + 0.2), PU.x + s * (PU.r + 2.2), PU.z1 + 2.6, PU.z1 + 4.8), { shade: 0, tone: "lo" }));
  for (const s of [-1, 1]) out.push(flatY(rect(PU.x + s * (PU.r + 0.2), PU.x + s * (PU.r + 2.2), 43, 46), { shade: 0, tone: "lo" }));
  const [ex, , ez] = C.EAR, post = { x: ex - 3, y: -14, w: 6, d: 14, r: 0.6 };
  out.push(S(k.slabOf(post, B.z1, ez + 4 - B.z1, P, 2, 0.4), { tone: "mid", crease: "lo" }));
  out.push(Ln(k.segment([ex - 3, 0, B.z1 + 6], [ex + 3, 0, B.z1 + 6], P), { tone: "faint" }));
  return out.join("");
}
