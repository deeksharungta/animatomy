import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D, byDepth, pipe } from "./model.mjs";

// The props: a carton of spare sticks at the back of the bench, two loose sticks and a steel rule on the mat,
// and the plywood box whose lid is being glued, under the nozzle.
const B = C.BOX, LID = { x: B.x - 1.2, y: B.y - 1.2, w: B.w + 2.4, d: B.d + 2.4, r: 1.2 };

export function props() {
  const out = [];
  // The carton: four walls, its open top, and the ends of the sticks standing in it.
  const cart = { x: 98, y: -40, w: 24, d: 34, r: 1 };
  out.push(`<path class="iso-halo" d="${k.haloOf(cart, 0, 6, P)}"/>`);
  out.push(S(k.slabOf(cart, 0, 52, P, 2, 0.4), { tone: "hi" }) + Ln(k.sideSeam(cart, 40, P, 2), { tone: "faint" }));
  const ends = [];
  for (let i = 0; i < 2; i++) for (let j = 0; j < 3; j++) ends.push([cart.x + 6.5 + i * 11, cart.y + 6.5 + j * 10.5, 52 + ((i * 7 + j * 3) % 5)]);
  for (const [x, y, z] of byDepth(ends, ([x, y, z]) => [x, y, z])) out.push(S(k.cylinder(x, y, C.R, 52, z - 52 + 6, P, 24, 0.4), { tone: "hi", crease: "none" }));
  out.push(Ln(k.planOutline(k.insetPlan(cart, 0.8), 52, P, 2), { tone: "lo" }));
  out.push(S(k.slabOf({ x: cart.x + cart.w, y: cart.y + 4, w: 0.4, d: 26, r: 0.2 }, 14, 16, P, 1), { tone: "mid" }));
  const lab = { x: cart.x + 4, y: cart.y + cart.d, w: 16, d: 0.4, r: 0.2 };
  out.push(S(k.slabOf(lab, 20, 22, P, 1), { tone: "mid" }) + Ln([37, 34, 31].map((z, i) => k.segment([lab.x + 2, lab.y + 0.4, z], [lab.x + 2 + [11, 8, 10][i], lab.y + 0.4, z], P)).join(""), { tone: "lo", free: true }));
  out.push(Ln([26, 22.5, 19].map((z, i) => k.segment([cart.x + cart.w + 0.4, cart.y + 7, z], [cart.x + cart.w + 0.4, cart.y + 7 + [18, 12, 15][i], z], P)).join(""), { tone: "lo", free: true }));
  // Two loose sticks and a steel rule lying on the mat in front of the gun.
  const F1 = L.frameAlong([-56, 22, C.R + 0.8], [1, 0, 0]), F2 = L.frameAlong([-40, 32, C.R + 0.8], [0.97, -0.24, 0]);
  out.push(S(L.disc(0, 100, C.R, F1, P, { steps: 32 }), { tone: "hi", crease: "none" }) + S(L.disc(0, 70, C.R, F2, P, { steps: 32 }), { tone: "hi", crease: "none" }));
  const rule = { x: -146, y: 22, w: 76, d: 9, r: 0.4 };
  out.push(S(k.slabOf(rule, 0.8, 0.8, P, 2), { tone: "hi" }));
  const t = k.topTicks(rule.x + 2, rule.x + rule.w - 2, 2, 5, rule.y + rule.d, 1.6, [1.6, 3], P);
  out.push(Ln(t.minor, { tone: "lo" }) + Ln(t.major, { tone: "mid" }));
  return out.join("");
}

// The box's body: plywood walls with finger joints at the corner you see.
export function boxBack() {
  const out = [`<path class="iso-halo" d="${k.haloOf(B, 0, 10, P)}"/>`, S(k.slabOf(B, 0, B.z - 6, P, 2, 0.5), { tone: "mid" })];
  const xn = B.x + B.w, yn = B.y + B.d, fingers = [];
  for (let z = 8; z < B.z - 8; z += 8) fingers.push(k.segment([xn, yn - 4, z], [xn, yn, z], P), k.segment([xn, yn, z], [xn - 4, yn, z], P));
  out.push(Ln(fingers.join(""), { tone: "faint" }));
  out.push(Ln(k.segment([xn - 4, yn, 0], [xn - 4, yn, B.z - 6], P) + k.segment([xn, yn - 4, 0], [xn, yn - 4, B.z - 6], P), { tone: "faint" }));
  return out.join("");
}

// The lid, its plies showing round the edge, and two brass pins at the near corners.
export function boxLid() {
  const out = [S(k.slabOf(LID, B.z - 6, 6, P, 2, 0.5), { tone: "hi" })];
  out.push(Ln([B.z - 4.5, B.z - 3, B.z - 1.5].map((z) => k.sideSeam(LID, z, P, 2)).join(""), { tone: "faint" }));
  out.push(D([at([LID.x + LID.w - 4, LID.y + LID.d - 4, B.z]), at([LID.x + 4, LID.y + LID.d - 4, B.z]), at([LID.x + LID.w - 4, LID.y + 4, B.z])], { size: 0.5, tone: "lo" }));
  // Pencil lines across the lid that mark where the glue goes.
  out.push(Ln(k.lineOnTop([C.BLOB_X, LID.y], [C.BLOB_X, LID.y + LID.d], B.z, P) + k.lineOnTop([LID.x, 0], [LID.x + LID.w, 0], B.z, P), { tone: "faint" }));
  return out.join("");
}

// The box's hasp on its front and a rope handle on its end.
export function boxFront() {
  const out = [], yf = B.y + B.d, xe = B.x + B.w;
  const hasp = { x: B.x + B.w / 2 - 4, y: yf, w: 8, d: 0.8, r: 0.4 };
  out.push(S(k.slabOf(hasp, B.z - 20, 12, P, 2, 0.2), { tone: "hi" }) + D([at([hasp.x + 2, yf + 0.8, B.z - 11]), at([hasp.x + 6, yf + 0.8, B.z - 11]), at([hasp.x + 2, yf + 0.8, B.z - 17]), at([hasp.x + 6, yf + 0.8, B.z - 17])], { size: 0.45, tone: "lo" }));
  out.push(S(k.slabOf({ x: hasp.x + 2.6, y: yf + 0.8, w: 2.8, d: 1.6, r: 0.6 }, B.z - 15.4, 3, P, 2, 0.2), { tone: "mid" }));
  out.push(S(k.slabOf({ x: xe, y: -8, w: 1.2, d: 4, r: 0.3 }, B.z - 30, 5, P, 2) , { tone: "mid" }) + S(k.slabOf({ x: xe, y: 4, w: 1.2, d: 4, r: 0.3 }, B.z - 30, 5, P, 2), { tone: "mid" }));
  out.push(pipe([[xe + 1.2, -6, B.z - 27.5], [xe + 6, -6, B.z - 30], [xe + 6, 6, B.z - 30], [xe + 1.2, 6, B.z - 27.5]], 1.1, { tone: "mid", bend: 3 }));
  return out.join("");
}
