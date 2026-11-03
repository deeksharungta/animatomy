// The cap: the blade's holder, the pressed-steel skin, the near wall's stub, the press pad, a badge and a label.
// Inlined into the page, so it uses only its arguments and model.mjs.
import { prismY, prismZ, capTop, capOutline, capZ, rooPost } from "./model.mjs";

export function cap(K, P, C, k, t) {
  const { at, seg, Sv, Ln, Dt, tm, tc, box, rrect, circ } = t;
  const th = k.thc;
  const c = [];
  c.push(Sv(prismY(K, P, C, th, [[79.6, 32.0], [82, 32.0], [82, 33.0], [79.6, 34.0]], -7, 7), { tone: "mid" }));
  c.push(Sv(prismY(K, P, C, th, [[82, 32.0], [84.6, 32.0], [84.6, 31.9], [82, 33.0]], -7, 0), { tone: "mid" }));
  const path = [[-94.6, 17.4], [-96.8, 21.5], ...capTop(), [87.6, 16.2]];
  // The skin is cut at the nose (x > 82, back to y = 0) and over Roo's window (back to y = C.WY), so split it there.
  const cuts = [C.WX0, C.WX1, 82], pts = [];
  for (let i = 0; i < path.length - 1; i++) {
    let a = path[i];
    const b = path[i + 1];
    for (const x of cuts) if (a[0] < x && b[0] > x) { const m = [x, a[1] + ((x - a[0]) / (b[0] - a[0])) * (b[1] - a[1])]; pts.push([a, m]); a = m; }
    pts.push([a, b]);
  }
  const reach = (mid) => (mid > 82 ? 0 : mid > C.WX0 && mid < C.WX1 ? C.WY : 11);
  const T = 0.9;
  const norm = ([a, b]) => { const dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz); return [-dz / l, dx / l]; };
  const skin = { fill: [], shades: [[], [], [], []], crease: "", top: "", outline: "" };
  const nearTop = [], nearIn = [], farTop = [], steps = [];
  let last = null;
  pts.forEach((sg, i) => {
    const [a, b] = sg, n = norm(sg), y1 = reach((a[0] + b[0]) / 2);
    const poly = [a, b, [b[0] - n[0] * T, b[1] - n[1] * T], [a[0] - n[0] * T, a[1] - n[1] * T]];
    const pr = prismY(K, P, C, th, poly, -11, y1);
    skin.fill.push(pr.fill); pr.shades.forEach((sh, j) => skin.shades[j].push(sh));
    const inner = [a[0] - n[0] * T, a[1] - n[1] * T];
    if (i === 0) { farTop.push(a); nearTop.push([a, y1]); nearIn.push([inner, y1]); }
    else if (y1 !== last) { nearTop.push([a, y1]); nearIn.push([inner, y1]); steps.push([a, last, y1]); }
    farTop.push(b);
    nearTop.push([b, y1]); nearIn.push([[b[0] - n[0] * T, b[1] - n[1] * T], y1]);
    last = y1;
  });
  const W = (p, y) => at(tc([p[0], y, p[1]]));
  const outline = [K.pathOf(farTop.map((p) => W(p, -11))), K.pathOf(nearTop.map(([p, y]) => W(p, y))), K.pathOf(nearIn.map(([p, y]) => W(p, y))),
    K.pathOf([W(path[0], -11), W(path[0], 11)]), K.pathOf([W(nearTop[0][0], 11), W(nearIn[0][0], 11)]),
    K.pathOf([W(path[path.length - 1], -11), W(path[path.length - 1], 0)]),
    ...steps.map(([p, y0, y1]) => K.pathOf([W(p, y0), W(p, y1)]))].join("");
  const skinPaths = { fill: skin.fill.join(""), shades: skin.shades.map((l) => l.join("")), crease: "", top: "", outline };
  // The near wall's stub over the hinge.
  const stub = [];
  const ol = capOutline();
  for (let i = 0; i < ol.length; i++) {
    const a = ol[i], b = ol[(i + 1) % ol.length];
    if (a[0] <= -66) stub.push(a);
    if ((a[0] - -66) * (b[0] - -66) < 0) { const t = (-66 - a[0]) / (b[0] - a[0]); stub.push([-66, a[1] + t * (b[1] - a[1])]); }
  }
  c.push(Sv(prismY(K, P, C, th, stub, 10.2, 11), { tone: "mid" }));
  // The rolled beads along both edges of the cap's top, from its back to the foot of its nose.
  // A bead runs from the cap's back (or from a cut edge, `from`) to `upto`; the near one breaks at Roo's window.
  const bead = (y, upto, from = null) => K.pathOf([...(from === null ? path.filter(([x]) => x <= upto) : [[from, capZ(from)], ...path.filter(([x]) => x > from && x <= upto)]), ...(upto < 87 ? [[upto, capZ(upto)]] : [])].map((p) => W(p, y)));
  c.push(Sv(skinPaths, { tone: "mid", inner: Ln(bead(-8.4, 99) + bead(8.4, C.WX0) + bead(8.4, 82, C.WX1), { tone: "faint" }) }));
  // Badge on the stub: a plate with three rule lines and two rivets.
  c.push(Sv(prismY(K, P, C, th, [[-81, 27.4], [-69, 27.4], [-68.4, 28], [-68.4, 32.4], [-69, 33], [-81, 33], [-81.6, 32.4], [-81.6, 28]], 11, 11.4), { tone: "hi" }));
  c.push(Ln([[31.6, 9], [30.2, 7], [28.8, 8]].map(([z, w]) => seg(tc([-79, 11.4, z]), tc([-79 + w, 11.4, z]))).join(""), { tone: "mid", free: true }));
  c.push(Dt([at(tc([-80.3, 11.4, 30.2])), at(tc([-69.7, 11.4, 30.2]))], { size: 0.4 }));
  // The press pad where Roo stamps: rubber, ribbed across.
  const pz = capZ(44) - 0.3;
  c.push(Sv(prismZ(K, P, C, th, rrect(20, 44, -8, 8, 2.4), pz, pz + 1.3), { tone: "hi" }));
  const ribs = [];
  for (let x = 23; x <= 41.1; x += 2) ribs.push(seg(tc([x, -8, pz + 1.3]), tc([x, 8, pz + 1.3])));
  c.push(Ln(ribs.join(""), { tone: "faint" }));
  // A label plate on the back of the cap.
  const lz = capZ(-48) + 0.05;
  c.push(Sv(prismZ(K, P, C, th, rrect(-60, -36, -6, 6, 1.2, 3), lz, lz + 0.5), { tone: "hi" }));
  c.push(Ln([[-2.2, 18], [0, 14], [2.2, 16]].map(([y, w]) => seg(tc([-57, y, lz + 0.5]), tc([-57 + w, y, lz + 0.5]))).join(""), { tone: "lo", free: true }));
  c.push(Dt([at(tc([-58.6, 0, lz + 0.5])), at(tc([-37.4, 0, lz + 0.5]))], { size: 0.4 }));
  // The bracket Roo pushes up on: an arm under the cap's top from its far wall, and a post down to his chest.
  const [px, py] = rooPost(C), foot = 27.8 + C.RPZ, under = capZ(px) - 0.9;
  c.push(Sv(box(th, px - 1.3, px + 1.3, under - 1.4, under, -10.2, py + 1.3), { tone: "mid" }) + Dt([at(tc([px, -9.4, under - 0.7]))], { size: 0.4 }));
  c.push(Sv(prismZ(K, P, C, th, rrect(px - 1.3, px + 1.3, py - 1.3, py + 1.3, 0.5, 2), foot, under - 1.4), { tone: "mid" }));
  return c.join("");
}
