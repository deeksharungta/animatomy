import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, Dt } from "./model.mjs";
import { tube } from "./bike.mjs";
import { partsKit } from "./moving.mjs";

const Q = partsKit({ ...k, ...L }, P, C);
export const WY = -420;
const F = (y) => WY + 4 + y;
// A pegboard hook: out of a hole, along, and up at its tip.
const hook = (x, z, len = 22) => tube([[x, F(0), z], [x, F(len), z], [x, F(len + 4), z + 6]], 1.4, "hi", 3);
const rect = (x0, z0, x1, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
const plate = (poly, y0, y1, tone = "mid", inner = "") => S(Q.polyY(poly, F(y0), F(y1)), { tone, inner });
const bar = (a, b, w, t, tone = "mid") => S(Q.bar3(a, b, w, t, [0, 1, 0]), { tone });

// The workshop wall behind the bench: a pegboard down to the bench top, and the tools on its hooks.
export function wall() {
  const out = [S(k.slabOf({ x: -900, y: WY - 10, w: 1900, d: 10, r: 0.1 }, -520, 1200, P, 2), { tone: "mid" })];
  out.push(S(L.prismOf(L.frameOf([0, WY, 0], [0, 1, 0], [1, 0, 0], [0, 0, 1]), rect(-660, -326, 140, 420), 0, 4, P), { tone: "hi" }));
  const holes = [];
  for (let x = -645; x <= 125; x += 25) for (let z = -311; z <= 405; z += 25) holes.push(at([x, F(0), z]));
  out.push(Dt(holes, { size: 0.55, tone: "lo" }));
  // Left of the bike: hex keys, 2 to 10 mm, in their holder; the spoke wrench; a coil of spare housing; the cassette
  // lockring tool on a peg and the pedal wrench across two hooks.
  out.push(hook(-505, -246), hook(-435, -246), plate(rect(-520, -254, -420, -242), 14, 26));
  [2, 2.5, 3, 4, 5, 6, 8, 10].forEach((d, i) => {
    const x = -510 + i * 12, len = 22 + d * 4, w = 0.5 + d * 0.11;
    out.push(bar([x, F(20), -254], [x, F(20), -254 - len], w, w, "hi"), bar([x, F(20), -242], [x, F(20), -236], w, w, "hi"));
  });
  out.push(hook(-388, -262), plate(Array.from({ length: 8 }, (_, i) => [-388 + 15 * Math.cos(i * 0.785 + 0.39), -277 + 15 * Math.sin(i * 0.785 + 0.39)]), 18, 21));
  out.push(S(L.disc(0, 3.2, 4, L.frameOf([-388, F(21), -277], [0, 1, 0], [1, 0, 0], [0, 0, 1]), P), { tone: "lo" }));
  out.push(hook(-335, -212, 26));
  const coil = (r, dz) => Array.from({ length: 41 }, (_, i) => { const t = (i / 40) * Math.PI * 2; return [-335 + r * Math.sin(t), F(20) + 3 * Math.cos(t), -222 - r + r * Math.cos(t) + dz]; });
  out.push(tube(coil(30, 0), 2.4, "lo", 0), tube(coil(27, -3), 2.4, "lo", 0));
  const LT = L.frameOf([-268, F(4), -246], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  out.push(hook(-268, -236, 30), S(L.disc(0, 26, 12, LT, P), { tone: "mid", crease: "lo", inner: Ln(L.circleOf(LT, 26, 6, P), { tone: "lo" }) }));
  out.push(Ln(L.ribsOf(LT, 0.5, 25.5, 12, 12, P, { seams: true }), { tone: "faint" }));
  out.push(hook(-410, -306), hook(-300, -306), bar([-430, F(18), -310], [-290, F(18), -318], 7, 1.8, "mid"), plate([[-292, -326], [-270, -328], [-264, -308], [-286, -306]], 16, 20, "hi"));
  // Right of the bike: the cable cutters hanging open, three screwdrivers in a strip, and the chain whip.
  for (const [x, a] of [[-222, 0.12], [-202, -0.12]]) out.push(hook(x, -150), bar([x, F(14), -156], [x - 70 * Math.sin(a), F(14), -156 - 70 * Math.cos(a)], 4.5, 1.6, "lo"));
  out.push(plate([[-224, -162], [-200, -162], [-204, -136], [-220, -136]], 12, 17), Dt([at([-212, F(17), -154])], { size: 0.9, tone: "lo" }));
  out.push(plate(rect(-176, -150, -112, -140), 0, 16));
  for (const [x, len] of [[-166, 70], [-144, 86], [-122, 56]]) {
    out.push(bar([x, F(10), -138], [x, F(10), -114], 4.6, 4.6, "mid"), bar([x, F(10), -152], [x, F(10), -152 - len], 1.1, 1.1, "hi"));
    out.push(Dt([at([x, F(14.6), -114])], { size: 0.8, tone: "lo" }));
  }
  out.push(hook(-82, -116), bar([-82, F(16), -118], [-82, F(16), -236], 6, 2.4, "mid"), Dt([at([-82, F(18.4), -126])], { size: 1, tone: "lo" }));
  const links = Array.from({ length: 7 }, (_, i) => [-70 + 6 * Math.sin(i * 0.4), F(16), -226 - i * 11.4]);
  links.forEach((p, i) => i && out.push(S(Q.bar3(links[i - 1], p, 3.4, 1.4, [0, 1, 0]), { tone: i % 2 ? "hi" : "lo" })));
  out.push(Dt(links.map(at), { size: 0.7, tone: "lo" }));
  return out.join("");
}
