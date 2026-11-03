import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, cutFace } from "./model.mjs";

// Round parts on the iron's axis cut by the plane y = 0, keeping the far half (y < 0). The angle phi runs from
// the top cut edge (90°) round the far side (180°) to the bottom cut edge (270°).
const V = L.viewOf(P);
const pt = (x, r, f) => [x, r * Math.cos(f), C.ZC + r * Math.sin(f)];
const chain = (edges) => {
  const next = new Map();
  for (const [a, b] of edges) { (next.get(a) ?? next.set(a, []).get(a)).push(b); (next.get(b) ?? next.set(b, []).get(b)).push(a); }
  const used = new Set(), runs = [];
  const key = (a, b) => (a < b ? a + "|" + b : b + "|" + a);
  for (const [a0, b0] of edges) {
    if (used.has(key(a0, b0))) continue;
    used.add(key(a0, b0));
    const run = [a0, b0];
    for (let end = b0; ;) {
      const n = (next.get(end) ?? []).find((c) => !used.has(key(end, c)));
      if (n === undefined) break;
      used.add(key(end, n)); run.push(n); end = n;
    }
    runs.push(run);
  }
  return runs;
};

// The visible facets of the far half of a surface of revolution (`inner` for its inside), with tones by facing
// and one outline round everything visible.
export function halfRev(profile, { inner = false, steps = 30 } = {}) {
  const sign = inner ? -1 : 1, quads = [], shades = [[], [], [], [], []], vert = new Map();
  const id = (j, a) => { const key = j * 1000 + a; if (!vert.has(key)) vert.set(key, at(pt(profile[j][0], profile[j][1], Math.PI / 2 + (a / steps) * Math.PI))); return key; };
  const count = new Map();
  for (let j = 0; j < profile.length - 1; j++) {
    const [x0, r0] = profile[j], [x1, r1] = profile[j + 1];
    const slope = (r1 - r0) / Math.max(1e-6, x1 - x0);
    if (Math.abs(x1 - x0) < 1e-6) continue;
    for (let a = 0; a < steps; a++) {
      const f = Math.PI / 2 + ((a + 0.5) / steps) * Math.PI;
      const n = L.mul3(L.unit3([-slope, Math.cos(f), Math.sin(f)]), sign);
      if (L.dot3(n, V) <= 0.004) continue;
      const q = [id(j, a), id(j, a + 1), id(j + 1, a + 1), id(j + 1, a)];
      const d = k.pathOf(q.map((v) => vert.get(v)), true);
      quads.push(d); shades[L.toneOf(n, P)].push(d);
      for (let e = 0; e < 4; e++) { const u = q[e], w = q[(e + 1) % 4], kk = u < w ? u + "|" + w : w + "|" + u; count.set(kk, (count.get(kk) ?? 0) + 1); }
    }
  }
  const edges = [...count].filter(([, c]) => c === 1).map(([kk]) => kk.split("|").map(Number));
  const outline = chain(edges).map((run) => k.pathOf(run.map((v) => vert.get(v)), run[0] === run.at(-1))).join("");
  return { fill: quads.join(""), shades: shades.slice(0, 4).map((list) => list.join("")), outline, crease: "", top: shades[4].join(""), seamless: true };
}

// A flat face with the tone its normal earns.
export function flat(d, normal, tone = "mid", cls = "") {
  const t = L.toneOf(normal, P), shades = ["", "", "", ""];
  if (t < 4) shades[t] = d;
  return S({ fill: d, outline: d, crease: "", top: t === 4 ? d : "", shades }, { tone, crease: "none", className: cls || undefined });
}

// A half annulus facing +x (the near end of a tube), as a flat face.
export function halfRing(x, ri, ro, tone = "mid", steps = 30) {
  const outer = Array.from({ length: steps + 1 }, (_, i) => pt(x, ro, Math.PI / 2 + (i / steps) * Math.PI));
  const inner = Array.from({ length: steps + 1 }, (_, i) => pt(x, ri, Math.PI * 1.5 - (i / steps) * Math.PI));
  return flat(k.pathOf([...outer, ...inner].map(at), true), [1, 0, 0], tone);
}

// A tube from x0 to x1 cut in half: its inside, both cut strips, the outside you see over the top, the near end.
export function halfTube(x0, x1, ri, ro, { tone = "mid", end = true, inside = true, strip = "" } = {}) {
  const out = [];
  if (inside && ri > 0) out.push(S(halfRev([[x0, ri], [x1, ri]], { inner: true }), { tone, crease: "none" }));
  out.push(cutFace([[x0, C.ZC - ro], [x1, C.ZC - ro], [x1, C.ZC - ri], [x0, C.ZC - ri]], tone, strip));
  out.push(cutFace([[x0, C.ZC + ri], [x1, C.ZC + ri], [x1, C.ZC + ro], [x0, C.ZC + ro]], tone, strip));
  out.push(S(halfRev([[x0, ro], [x1, ro]]), { tone, crease: "none" }));
  if (end) out.push(halfRing(x1, ri, ro, tone));
  return out.join("");
}

// A solid turned body cut in half: the outside over the top and the section face.
export function halfSolid(profile, { tone = "hi", cls = "" } = {}) {
  const face = [...profile.map(([x, r]) => [x, C.ZC + r]), ...profile.slice().reverse().map(([x, r]) => [x, C.ZC - r])];
  return S(halfRev(profile), { tone, crease: "none", className: cls || undefined }) + cutFace(face, tone, cls);
}

// Ribs round the far half's visible outside of a tube: a grip's rings, a nut's knurl.
export const ringArc = (x, r) => L.arcOf(L.frameOf([x, 0, C.ZC], [1, 0, 0], [0, 0, 1], [0, -1, 0]), 0, r, P, { from: 0, to: Math.PI, trim: 0 });

// A knurl on the far half's visible outside, between two seams: lines along x that fade toward the limb.
export function knurlFar(x0, x1, r, pitch = 0.09) {
  const lines = [];
  for (let f = Math.PI / 2 + pitch / 2; f < Math.PI; f += pitch) {
    const n = [0, Math.cos(f), Math.sin(f)], face = L.dot3(n, V);
    if (face <= 0.02) continue;
    lines.push({ d: k.segment(pt(x0, r, f), pt(x1, r, f), P), alpha: L.fadeOf(face, [0.03, 0.35]) });
  }
  return k.fadedSvg(lines, { tone: "lo" }) + k.lineSvg(ringArc(x0, r) + ringArc(x1, r), { tone: "faint" });
}
