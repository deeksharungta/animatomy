import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, Dt } from "./model.mjs";
import { tube } from "./bike.mjs";
import { WY } from "./scene.mjs";
import { partsKit } from "./moving.mjs";

const Q = partsKit({ ...k, ...L }, P, C);
const TOP = -330, FRONT = -230;
const slab = (x, y, w, d, z, h, tone = "mid", r = 1.5, inner = "") => S(k.slabOf({ x, y, w, d, r }, z, h, P, 4), { tone, inner });
const flatOn = (c, a, poly, h, tone = "mid") => S(L.prismOf(L.frameOf([c[0], c[1], TOP], [0, 0, 1], [Math.cos(a), Math.sin(a), 0], [-Math.sin(a), Math.cos(a), 0]), poly, 0, h, P), { tone });

// The workbench along the wall: a thick beech top with its grain, and an apron of drawers below its front edge.
export function bench() {
  const grain = [];
  for (let y = WY + 40; y < FRONT; y += 46) grain.push(k.segment([-900, y, TOP], [1000, y, TOP], P));
  const out = [slab(-900, WY, 1900, FRONT - WY, TOP - 36, 36, "mid", 2, Ln(grain.join(""), { tone: "faint" })), slab(-900, FRONT - 6, 1900, 6, TOP - 160, 124, "lo", 0.5)];
  // Two rows of shallow drawers, each with its pull and a blank card holder.
  for (const [z, h] of [[TOP - 96, 56], [TOP - 154, 54]]) for (let x = -620; x < 700; x += 150) {
    const c = x + 70;
    out.push(slab(x + 2, FRONT, 142, 4, z, h, "mid", 1));
    out.push(S(Q.bar3([c - 26, FRONT + 7, z + h * 0.42], [c + 26, FRONT + 7, z + h * 0.42], 1.8, 1.8, [0, 0, 1]), { tone: "hi" }));
    for (const hx of [c - 22, c + 22]) out.push(S(Q.bar3([hx, FRONT + 4, z + h * 0.42], [hx, FRONT + 7, z + h * 0.42], 1.4, 1.4, [0, 0, 1]), { tone: "mid" }));
    out.push(S(k.slabOf({ x: c - 16, y: FRONT + 4, w: 32, d: 1, r: 0.2 }, z + h * 0.66, 10, P, 2), { tone: "hi" }));
  }
  return out.join("");
}

// What lies on the bench: the parts tray, a chain checker, a chain tool, the old cogs, a grease tub and a rag.
export function benchTop() {
  const out = [];
  // The parts tray: a shallow box of six compartments, a few bolts and two jockey wheels in it.
  const tx = -130, ty = -400, tw = 120, td = 90;
  out.push(slab(tx, ty, tw, td, TOP, 3, "lo", 3));
  for (const [x, y, w, d] of [[tx, ty, tw, 3], [tx, ty + td - 3, tw, 3], [tx, ty, 3, td], [tx + tw - 3, ty, 3, td], [tx + 40, ty, 3, td], [tx + 80, ty, 3, td], [tx, ty + 44, tw, 3]]) out.push(slab(x, y, w, d, TOP, 20, "hi", 0.5));
  for (const [x, y] of [[tx + 14, ty + 18], [tx + 26, ty + 28], [tx + 16, ty + 34], [tx + 100, ty + 18], [tx + 92, ty + 32]]) out.push(S(k.cylinder(x, y, 4, TOP + 3, 5, P, 16), { tone: "mid" }), Dt([at([x, y, TOP + 8])], { size: 0.6, tone: "lo" }));
  for (const [x, y] of [[tx + 62, ty + 68], [tx + 22, ty + 68]]) out.push(S(k.cylinder(x, y, 15, TOP + 3, 4, P, 32), { tone: "hi", inner: Ln(k.ring(x, y, 5, TOP + 7, P, 20), { tone: "lo" }) }));
  // The chain checker: a flat gauge with a hook at one end, a pin at the other and its 0.5 and 0.75 marks.
  const cx = -300, cy = -300, ca = 0.12, ux = Math.cos(ca), uy = Math.sin(ca), on = (s, t, z) => [cx + ux * s - uy * t, cy + uy * s + ux * t, TOP + z];
  out.push(flatOn([cx, cy], ca, [[-70, -7], [70, -7], [70, 7], [-70, 7]], 3, "hi"));
  out.push(S(k.cylinder(...on(-62, 0, 0).slice(0, 2), 3, TOP + 3, 9, P, 16), { tone: "mid" }), S(k.cylinder(...on(58, 0, 0).slice(0, 2), 3.5, TOP + 3, 7, P, 16), { tone: "mid" }));
  out.push(Ln(k.pathOf([at(on(20, -7, 3)), at(on(20, -3, 3))]) + k.pathOf([at(on(34, -7, 3)), at(on(34, -3, 3))]), { tone: "lo" }));
  // The chain tool: its body, the driving screw through it and the T-handle on the screw.
  const hx = -40, hy = -258;
  out.push(slab(hx - 22, hy - 9, 44, 18, TOP, 22, "mid", 2), S(Q.bar3([hx + 22, hy, TOP + 13], [hx + 58, hy, TOP + 13], 2.6, 2.6, [0, 0, 1]), { tone: "hi" }));
  out.push(S(Q.bar3([hx + 58, hy - 26, TOP + 13], [hx + 58, hy + 26, TOP + 13], 3, 3, [0, 0, 1]), { tone: "mid" }));
  // The worn cassette's cogs, stacked; the grease tub with its screw lid; a rag folded by the wall.
  for (let i = 0; i < 4; i++) out.push(S(k.cylinder(-420, -400, 64 - i * 7, TOP + i * 2.4, 1.8, P, 48), { tone: "hi", inner: Ln(k.ring(-420, -400, 50 - i * 7, TOP + i * 2.4 + 1.8, P, 40), { tone: "faint" }) }));
  out.push(S(k.cylinder(-470, -330, 30, TOP, 36, P, 40), { tone: "mid" }), S(k.cylinder(-470, -330, 32, TOP + 36, 9, P, 40), { tone: "hi", inner: Ln(k.ring(-470, -330, 22, TOP + 45, P, 32), { tone: "faint" }) }));
  out.push(slab(-660, -410, 110, 80, TOP, 6, "hi", 6), slab(-652, -402, 90, 64, TOP + 6, 4, "hi", 6));
  return out.join("");
}

// The work light: a weighted base, a column and an arm with its tension spring, and the shade aimed at the derailleur.
export function lamp() {
  const base = [-80, -300, TOP], elbow = [-80, -300, -110], head = [60, -200, -20];
  const aim = L.unit3(L.sub3([26, 50, -60], head)), F = L.frameAlong(head, aim);
  return S(k.cylinder(base[0], base[1], 34, TOP, 10, P, 40), { tone: "mid" }) + S(k.cylinder(base[0], base[1], 12, TOP + 10, 14, P, 24), { tone: "hi" }) +
    tube([[base[0], base[1], TOP + 24], elbow], 4, "hi", 0) + tube([elbow, head], 3.4, "hi", 0) +
    tube([[base[0] + 12, base[1], TOP + 40], [elbow[0] + 12, elbow[1], elbow[2] - 30]], 1, "lo", 0) +
    S(L.disc(-5, 5, 8, L.frameAlong(elbow, [0, 1, 0]), P), { tone: "mid", crease: "lo" }) +
    S(L.solidOf([[-10, 7], [-4, 8.5, 1], [3, 16, 1], [10, 24]], F, P), { tone: "mid", crease: "lo" }) + S(L.disc(-16, -10, 5, F, P), { tone: "hi", crease: "lo" });
}
