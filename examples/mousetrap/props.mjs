// Props on the floor: the carton the traps came in, and a jar of peanut butter, the other bait.
import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { P, at, S, Ln, D } from "./model.mjs";

// The carton: a box with its end flap open, a tape strip over the lid, and a printed panel on its side.
export function propsBack() {
  const box = { x: -214, y: -86, w: 64, d: 36, r: 1 }, h = 26, out = [`<path class="iso-halo" d="${k.haloOf(box, 0, h, P)}"/>`];
  out.push(S(k.slabOf(box, 0, h, P, 2, 0.5), { tone: "mid", inner: Ln(k.sideSeam(box, h - 6, P, 2), { tone: "faint" }) }));
  out.push(S(k.slabOf({ x: box.x + 30, y: box.y, w: 14, d: box.d, r: 0.3 }, h, 0.4, P, 2), { tone: "lo" }));
  const y = box.y + box.d, rules = [[-206, 17, -170], [-206, 12.5, -176], [-206, 8, -184]];
  out.push(Ln(k.pathOf([[-208, y, 5], [-156, y, 5], [-156, y, 20], [-208, y, 20]].map(at), true), { tone: "lo" }));
  out.push(Ln(rules.map(([x0, z, x1]) => k.pathOf([at([x0, y, z]), at([x1, y, z])])).join(""), { tone: "lo", free: true }));
  // The end flap, folded open and lying on the floor beside the box.
  const flap = [[box.x + box.w, box.y + 2], [box.x + box.w + 20, box.y + 6], [box.x + box.w + 20, box.y + box.d - 6], [box.x + box.w, box.y + box.d - 2]];
  out.push(S(k.extrude(flap, 0, 0.6, P), { tone: "mid" }));
  // The jar: glass body, a ribbed lid and a label band.
  const J = [104, -66], body = L.frameAlong([J[0], J[1], 0], [0, 0, 1]);
  out.push(`<path class="iso-halo" d="${k.haloOf({ x: J[0] - 20, y: J[1] - 20, w: 40, d: 40, r: 20 }, 0, 44, P)}"/>`);
  out.push(S(L.solidOf([[0, 17], [3, 18, 1], [34, 18, 1], [37, 16], [38, 14.5]], body, P), { tone: "hi", inner: Ln(L.arcOf(body, 9, 18, P) + L.arcOf(body, 27, 18, P), { tone: "lo" }) }));
  out.push(Ln([20, 16, 12].map((z, i) => L.arcOf(body, z, 18, P, { from: 0.9 + i * 0.1, to: 2.2 - i * 0.2 })).join(""), { tone: "lo", free: true }));
  const lid = L.frameAlong([J[0], J[1], 38], [0, 0, 1]);
  out.push(S(L.disc(0, 8, 16.6, lid, P), { tone: "mid", inner: k.fadedSvg(L.ribsOf(lid, 0, 8, 16.6, 48, P, { fade: [0.05, 0.45] }), { tone: "lo" }) }));
  out.push(Ln(L.arcOf(lid, 8, 14.6, P, { least: -1 }), { tone: "faint" }));
  return out.join("");
}

// A pencil stub and its shavings lie near the front edge: nothing in front of the trap needs more.
export function propsFront() {
  const out = [];
  const cap = { x: 112, y: 40, w: 22, d: 14, r: 3 };
  out.push(`<path class="iso-halo" d="${k.haloOf(cap, 0, 6, P)}"/>`);
  out.push(S(k.slabOf(cap, 0, 6, P, 4, 0.5), { tone: "hi", inner: Ln(k.sideSeam(cap, 2.5, P, 4), { tone: "faint" }) }));
  out.push(Ln(k.planOutline(k.insetPlan(cap, 2.4), 6, P, 3), { tone: "lo" }) + D(k.corners(cap, 3.2).map(([x, y]) => at([x, y, 6])), { size: 0.4 }));
  return out.join("");
}
