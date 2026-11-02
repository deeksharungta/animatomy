// The still parts: the room, the desk and its props, and the stapler's base, anvil and hinge.
import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { notchRing } from "./model.mjs";

export const DESK = { x: -120, y: -66, w: 274, d: 102, r: 6 };
export const ROOM_TOP = 92;

export function scene(P, C) {
  const at = (p) => k.iso(p, P);
  const S = (paths, style) => k.solidSvg(paths, style);
  const Ln = (d, style) => k.lineSvg(d, style);
  const D = (pts, style) => k.dotsSvg(pts, style);
  const byDepth = (pts) => [...pts].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));

  const room = () => {
    const o = [];
    const yb = DESK.y - 6;
    o.push(S(k.slabOf({ x: DESK.x, y: yb, w: DESK.w, d: 6, r: 0.6 }, -16, ROOM_TOP + 16, P, 2), { tone: "mid" }));
    const stripes = [];
    for (let x = DESK.x + 14; x < DESK.x + DESK.w - 4; x += 14) stripes.push(k.segment([x, DESK.y, 0], [x, DESK.y, ROOM_TOP], P));
    o.push(Ln(stripes.join(""), { tone: "faint" }));
    o.push(S(k.slabOf({ x: DESK.x - 6, y: yb, w: 6, d: DESK.d + 6, r: 0.6 }, -16, ROOM_TOP + 16, P, 2), { tone: "mid" }));
    const s2 = [];
    for (let y = DESK.y + 14; y < DESK.y + DESK.d - 4; y += 14) s2.push(k.segment([DESK.x, y, 0], [DESK.x, y, ROOM_TOP], P));
    o.push(Ln(s2.join(""), { tone: "faint" }));
    // A wall calendar: a backing card, a month grid, a spiral binding and the nail it hangs on.
    const cal = { x: -46, w: 56, z0: 30, z1: 84 }, cy = DESK.y;
    o.push(S(k.slabOf({ x: cal.x, y: cy, w: cal.w, d: 1.2, r: 0.4 }, cal.z0, cal.z1 - cal.z0, P, 2), { tone: "hi" }));
    o.push(S(k.slabOf({ x: cal.x + 3, y: cy + 1.2, w: cal.w - 6, d: 0.6, r: 0.3 }, cal.z1 - 30, 26, P, 2), { tone: "mid" }));
    const gx0 = cal.x + 4, gx1 = cal.x + cal.w - 4, gz0 = cal.z0 + 4, gz1 = cal.z1 - 34, yy = cy + 1.2;
    const grid = [];
    for (let i = 1; i < 7; i++) { const x = gx0 + ((gx1 - gx0) * i) / 7; grid.push(k.segment([x, yy, gz0], [x, yy, gz1], P)); }
    for (let j = 1; j < 5; j++) { const z = gz0 + ((gz1 - gz0) * j) / 5; grid.push(k.segment([gx0, yy, z], [gx1, yy, z], P)); }
    grid.push(k.pathOf([[gx0, yy, gz0], [gx1, yy, gz0], [gx1, yy, gz1], [gx0, yy, gz1]].map(at), true));
    o.push(Ln(grid.join(""), { tone: "lo" }));
    o.push(D(Array.from({ length: 8 }, (_, i) => at([cal.x + 7 + i * 6, yy, cal.z1 - 2])), { size: 0.6, tone: "mid" }));
    o.push(Ln(k.segment([cal.x + cal.w / 2, cy, cal.z1 + 6], [cal.x + 8, cy + 0.6, cal.z1], P) + k.segment([cal.x + cal.w / 2, cy, cal.z1 + 6], [cal.x + cal.w - 8, cy + 0.6, cal.z1], P), { tone: "lo" }));
    o.push(D([at([cal.x + cal.w / 2, cy, cal.z1 + 6])], { size: 0.7, tone: "hi" }));
    const yf = yy + 0.6, px0 = cal.x + 3, px1 = cal.x + cal.w - 3, pz = cal.z1 - 30;
    const hills = [[px0, pz + 8], [px0 + 10, pz + 15], [px0 + 17, pz + 11], [px0 + 27, pz + 20], [px0 + 36, pz + 12], [px0 + 43, pz + 16], [px1, pz + 9]];
    o.push(Ln(k.pathOf(hills.map(([x, z]) => at([x, yf, z]))), { tone: "lo" }) + Ln(k.pathOf(Array.from({ length: 16 }, (_, i) => at([px0 + 40 + 2.6 * Math.cos((i / 16) * Math.PI * 2), yf, pz + 22 + 2.6 * Math.sin((i / 16) * Math.PI * 2)])), true), { tone: "lo" }));
    // Skirting boards along both walls.
    o.push(S(k.slabOf({ x: DESK.x, y: DESK.y, w: DESK.w, d: 1.4, r: 0.3 }, 0, 7, P, 2, 0.3), { tone: "mid" }));
    o.push(S(k.slabOf({ x: DESK.x, y: DESK.y + 1.4, w: 1.4, d: DESK.d - 1.4, r: 0.3 }, 0, 7, P, 2, 0.3), { tone: "mid" }));
    // A wall socket by the desk.
    o.push(S(k.slabOf({ x: 108, y: cy, w: 16, d: 1.6, r: 1 }, 34, 22, P, 3, 0.4), { tone: "hi" }));
    o.push(Ln(k.pathOf([[112, cy + 1.6, 46], [112, cy + 1.6, 50], [113.4, cy + 1.6, 50], [113.4, cy + 1.6, 46]].map(at), true) + k.pathOf([[118.6, cy + 1.6, 46], [118.6, cy + 1.6, 50], [120, cy + 1.6, 50], [120, cy + 1.6, 46]].map(at), true), { tone: "mid" }));
    o.push(D([at([116, cy + 1.6, 40])], { size: 0.5 }));
    return o.join("");
  };

  const desk = () => {
    const grain = [];
    for (let y = DESK.y + 12; y < DESK.y + DESK.d - 6; y += 13) grain.push(k.lineOnTop([DESK.x, y], [DESK.x + DESK.w, y], 0, P));
    return S(k.slabOf(DESK, -16, 16, P, 6, 1.2), { tone: "mid" }) + Ln(grain.join(""), { tone: "faint" });
  };

  // A pencil cup at the back and a box of staples at the back right.
  const propsBack = () => {
    const o = [];
    const [cx, cy] = [-100, -44];
    o.push(S(k.cylinder(cx, cy, 13, 0, 30, P, 48, 0.6), { tone: "hi" }) + Ln(k.sideArc(cx, cy, 13, 24, P, 32), { tone: "faint" }));
    o.push(`<path class="so-void" d="${k.ring(cx, cy, 11.6, 30, P, 48)}"/>`);
    for (const [x, y, h] of byDepth([[cx - 4, cy - 3, 60], [cx + 4, cy - 2, 52], [cx + 1, cy + 4, 66]])) {
      const hex = Array.from({ length: 6 }, (_, i) => [x + 3 * Math.cos((i * Math.PI) / 3 + Math.PI / 6), y + 3 * Math.sin((i * Math.PI) / 3 + Math.PI / 6)]);
      o.push(S(k.extrude(hex, 8, h - 14, P), { tone: "hi" }) + S(k.cylinder(x, y, 3.2, h - 6, 4, P, 20), { tone: "mid" }) + S(k.cylinder(x, y, 3, h - 2, 3.4, P, 20, 0.5), { tone: "hi" }));
    }
    const box = { x: 100, y: -62, w: 50, d: 24, r: 1.2 };
    o.push(`<path class="iso-halo" d="${k.haloOf(box, 0, 18, P)}"/>`);
    o.push(S(k.slabOf(box, 0, 14, P, 3, 0.5), { tone: "mid", inner: Ln(k.sideSeam(box, 10, P, 3), { tone: "faint" }) }));
    const lid = k.insetPlan(box, -0.6);
    o.push(S(k.slabOf(lid, 14, 4, P, 3, 0.5), { tone: "hi" }));
    const lab = { x: box.x + 8, y: box.y + 7, w: 30, d: 18, r: 1 };
    o.push(S(k.slabOf(lab, 18, 0.4, P, 3), { tone: "hi" }) + Ln(k.planOutline(k.insetPlan(lab, 1.4), 18.4, P, 3), { tone: "faint" }));
    o.push(Ln([[6, 18], [10, 12], [14, 15]].map(([dy, w]) => k.lineOnTop([lab.x + 4, lab.y + dy - 2], [lab.x + 4 + w, lab.y + dy - 2], 18.4, P)).join(""), { tone: "lo", free: true }));
    // A spare strip of staples on the lid.
    const s = { x: box.x + 42, y: box.y + 4, w: 12.7, d: 24, r: 0.3 };
    o.push(S(k.slabOf(s, 18, 6, P, 2), { tone: "hi", inner: Ln(Array.from({ length: 47 }, (_, i) => k.segment([s.x + s.w, s.y + 0.5 * (i + 1), 18], [s.x + s.w, s.y + 0.5 * (i + 1), 24], P)).join(""), { tone: "faint" }) }));
    return o.join("");
  };

  // A staple remover in front: two jaws on a pin, its grips one above the other.
  const propsFront = () => {
    const o = [];
    const x0 = 96, y0 = 20;
    o.push(`<path class="iso-halo" d="${k.haloOf({ x: x0, y: y0, w: 44, d: 14, r: 6 }, 0, 10, P)}"/>`);
    const grip = (z, h) => S(k.slabOf({ x: x0 + 8, y: y0, w: 36, d: 14, r: 6 }, z, h, P, 6, 0.6), { tone: "mid" });
    o.push(grip(0, 4));
    o.push(S(L.disc(-8, 8, 2.2, L.frameAlong([x0 + 40, y0 + 7, 5.2], [0, 1, 0]), P), { tone: "hi" }));
    o.push(grip(6.4, 4) + Ln(k.sideSeam({ x: x0 + 8, y: y0, w: 36, d: 14, r: 6 }, 8.4, P, 6), { tone: "faint" }));
    const F = L.frameOf([x0 + 8, y0, 0], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
    for (const y of [1.2, 10.4]) {
      o.push(S(L.prismOf(F, [[0, 3.6], [0, 0.4], [-7.6, 5], [-6.4, 5.6]], y, y + 2.4, P), { tone: "hi" }));
      o.push(S(L.prismOf(F, [[0, 6.6], [0, 10.4], [-6.4, 5.8], [-7.6, 5.4]], y, y + 2.4, P), { tone: "hi" }));
    }
    return o.join("");
  };

  // The base: rubber pad, pressed-steel shell with a bead round it, a depth scale and the anvil.
  const base = () => {
    const o = [];
    const pad = notchRing(k.ringOf({ x: -101, y: -19.5, w: 198, d: 39, r: 12 }, 8), C.CUTX, 0);
    const shellPlan = { x: -100, y: -18.5, w: 196, d: 37, r: 11 };
    const shell = notchRing(k.ringOf(shellPlan, 8), C.CUTX, 0);
    o.push(`<path class="iso-halo" d="${k.haloOf({ x: -101, y: -19.5, w: 198, d: 39, r: 12 }, 0, 12, P)}"/>`);
    o.push(S(k.extrude(pad, 0, 3, P, { convex: false }), { tone: "lo", crease: "faint" }));
    o.push(S(k.extrude(shell, 3, C.ZB - 3, P, { convex: false, bevel: 0.8 }), { tone: "mid", inner: Ln(k.ringSeam(shell, 7.4, P), { tone: "faint" }) }));
    // The throat-depth scale on the near side: millimetres back from the staple, a major mark every 5.
    const t = k.sideTicks(13, 80, 1, 5, 18.5, C.ZB, [1.2, 2.4], P, "x");
    o.push(Ln(t.minor, { tone: "lo" }) + Ln(t.major, { tone: "mid" }));
    // A pressed panel on the base top and rivets along its ledge.
    o.push(Ln(k.planOutline({ x: -72, y: -14.5, w: 70, d: 29, r: 5 }, C.ZB, P, 5), { tone: "faint" }));
    o.push(D([[-66, 15.5], [-36, 15.5], [-6, 15.5], [-66, -15.5], [-36, -15.5]].map(([x, y]) => at([x, y, C.ZB])), { size: 0.45 }));
    // The anvil plate: a closed-clinch pair of grooves, a pivot rivet, and the near groove cut through.
    const anvil = notchRing(k.ringOf({ x: 72, y: -9.5, w: 20, d: 19, r: 2 }, 4), C.CUTX, 0);
    o.push(S(k.extrude(anvil, C.ZB, C.ZA - C.ZB, P, { convex: false }), { tone: "hi", crease: "lo" }));
    o.push(Ln(k.planOutline({ x: 81.2, y: -7.6, w: 1.6, d: 5.6, r: 0.7 }, C.ZA, P, 3), { tone: "lo" }));
    o.push(Ln(k.pathOf([[82, 2, C.ZA], [81.2, 2.6, C.ZA], [81.2, 7.0, C.ZA], [82, 7.6, C.ZA]].map(at)), { tone: "lo" }));
    o.push(Ln(k.ring(75.5, 0, 1.6, C.ZA, P, 16), { tone: "lo" }) + D([at([75.5, 0, C.ZA])], { size: 0.5 }));
    const groove = [];
    for (let i = 0; i <= 16; i++) { const t2 = i / 16, y = 2 + 5.6 * t2; groove.push(at([82, y, C.ZA - 0.6 * Math.sin(Math.PI * t2) ** 0.6])); }
    o.push(`<path class="so-void" d="${k.pathOf(groove, true)}"/>`);
    // The paper stop and the hinge bracket's foot.
    o.push(S(k.slabOf({ x: 10.6, y: -12, w: 2, d: 24, r: 0.4 }, C.ZB, 1.4, P, 2), { tone: "hi" }));
    o.push(S(k.slabOf({ x: -98, y: -10.2, w: 26, d: 20.4, r: 1.5 }, C.ZB, 0.7, P, 3, 0.3), { tone: "mid" }));
    o.push(D([[-95.5, -8], [-74.5, -8]].map(([x, y]) => at([x, y, C.ZB + 0.7])), { size: 0.45 }));
    return o.join("");
  };

  const ear = (y0, y1) => S(L.prismOf(L.frameOf([0, 0, 0], [0, 1, 0], [1, 0, 0], [0, 0, 1]), [[-97, C.ZB + 0.7], [-75, C.ZB + 0.7], [-75, 14], [-80, 24], [-86, 26.4], [-92, 24.6], [-97, 19]], y0, y1, P), { tone: "mid" });
  const pinHead = () => S(L.disc(0, 0.7, 2.3, L.frameAlong([C.H[0], 11, C.H[1]], [0, 1, 0]), P), { tone: "hi" }) + S(L.sphereOf([C.H[0], 11.5, C.H[1]], 1.4, P), { tone: "hi" });
  const nearRivets = () => D([[-95.5, 8], [-74.5, 8]].map(([x, y]) => at([x, y, C.ZB + 0.7])), { size: 0.45 });

  return { room: room(), desk: desk(), propsBack: propsBack(), propsFront: propsFront(), base: base(), earFar: ear(-9.6, -8.4), earNear: ear(8.4, 9.6) + nearRivets(), pinHead: pinHead() };
}
