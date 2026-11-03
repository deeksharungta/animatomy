import * as G from "../../kit/lathe.mjs";
import { C, P, K, dialFrame, S, Ln, Dt } from "./model.mjs";
import { tools } from "./tools.mjs";

// The gear train, each wheel drawn once at angle 0 in the dial's plane; the page turns its face with an affine
// matrix (a turn in a plane is affine on screen), while the round body behind it never changes.
const T = tools(K, P, { O: C.O, U: C.U, N: C.N });
const face = (d, tone) => `<path class="iso-fill" d="${d}"/><path class="iso-shade" data-shade="${tone}" d="${d}"/><path class="iso-line iso-edge" data-tone="mid" d="${d}"/>`;
const SHADE = G.bandOf(G.dot3(C.N, G.lightOf(P)));
const toneOfFace = Math.min(3, SHADE);

// A brass wheel: a thin round body, then a toothed face with four spoke windows, a hub and its arbor.
function wheel([cx, cy], r, n, d, spokes = 4) {
  const r0 = r - 0.55, r1 = r + 0.45, F = dialFrame(cx, cy, 0);
  const body = S(G.disc(d - 0.5, d + 0.2, r0 - 0.2, F, P), { tone: "mid", crease: "none" });
  let top = face(T.teeth(cx, cy, r0, r1, n, d + 0.5), toneOfFace);
  const win = [];
  for (let i = 0; i < spokes; i++) {
    const a0 = (i / spokes) * Math.PI * 2 + 0.22, a1 = a0 + (Math.PI * 2) / spokes - 0.44, pts = [];
    for (let j = 0; j <= 10; j++) pts.push(T.pl(d + 0.5)(cx + (r - 3) * Math.cos(a0 + ((a1 - a0) * j) / 10), cy + (r - 3) * Math.sin(a0 + ((a1 - a0) * j) / 10)));
    for (let j = 10; j >= 0; j--) pts.push(T.pl(d + 0.5)(cx + 4.4 * Math.cos(a0 + 0.3 + ((a1 - a0 - 0.6) * j) / 10), cy + 4.4 * Math.sin(a0 + 0.3 + ((a1 - a0 - 0.6) * j) / 10)));
    win.push(T.path(pts, true));
  }
  top += `<path class="di-window" d="${win.join("")}"/>` + Ln(win.join(""), { tone: "faint" });
  top += Ln(T.circle(cx, cy, r - 1.8, d + 0.5, 72), { tone: "faint" });
  top += S(G.disc(d + 0.5, d + 1.6, 3.2, F, P), { tone: "hi" });
  return { body, top: `<g class="di-brass">${top}</g>` };
}

// A pinion: a short cylinder of leaves on its arbor, the leaves drawn on its near face.
function pinion([cx, cy], r, n, d0, d1) {
  const F = dialFrame(cx, cy, 0);
  const body = S(G.disc(d0, d1, r - 0.4, F, P), { tone: "hi", crease: "none" });
  const top = face(T.teeth(cx, cy, r - 0.55, r + 0.5, n, d1), toneOfFace) + Dt([T.pl(d1)(cx, cy)], { size: 0.6, tone: "lo" });
  return { body, top };
}

export const CROWN = wheel(C.PINION, C.CROWN.r, C.CROWN.teeth, C.CROWN.d);
export const PINION1 = pinion(C.PINION, 3.18, 16, C.RACK.d0, C.RACK.d1);
export const HAIR_WHEEL = wheel(C.HAIR.at, C.HAIR.r, C.HAIR.teeth, C.HAIR.d);
export const CENTRE = pinion([0, 0], C.CENTRE.r, C.CENTRE.teeth, C.CENTRE.d0, -7);

// Arbors: the round staffs the wheels turn on, from the plate (or the middle bridge) to their front pivots.
export function arbor([cx, cy], d0, d1, r = 0.9) {
  return S(G.disc(d0, d1, r, dialFrame(cx, cy, 0), P), { tone: "hi", crease: "none" });
}

// The hairspring's collet on the front of the hairspring wheel's arbor, with the pin the spring's inner end is in.
export function collet() {
  const [cx, cy] = C.HAIR.at, F = dialFrame(cx, cy, 0), d = C.HAIR.sd;
  return S(G.disc(d - 0.6, d + 1.2, C.HAIR.spring[0], F, P), { tone: "hi" }) + S(G.disc(d + 1.2, d + 3.6, 0.8, dialFrame(cx + C.HAIR.spring[0] - 0.8, cy, 0), P), { tone: "hi" });
}

// The needle on the centre arbor's front end: a tapered blade, a counterweight tail and a domed hub.
export function needle() {
  const n = C.NEEDLE, f = T.pl(n.d);
  const pts = [[-1.4, n.tail], [1.4, n.tail], [0.8, 4], [0.2, n.tip], [-0.2, n.tip], [-0.8, 4]].map(([x, y]) => f(x, y));
  const out = [`<path class="iso-fill" d="${T.path(pts, true)}"/><path class="iso-line iso-edge" data-tone="lit" d="${T.path(pts, true)}"/>`];
  out.push(S(G.solidOf([[0, 3], [0.8, 3], [1.4, 2.2, 1], [1.8, 0]], dialFrame(0, 0, n.d), P), { tone: "hi" }));
  return out.join("");
}

// The scale: the dial plate's outer ring, left on when its centre was cut away: 100 divisions of 0.01 mm.
export function scaleRing() {
  const s = C.SCALE, F = dialFrame(0, 0, 0), f = T.pl(s.d);
  const out = [S(G.ringBand(s.d - 0.8, s.d, s.rIn, s.rOut, F, P, { hole: [s.d, s.rIn] }), { tone: "hi", crease: "lo" })];
  const minor = [], mid = [], major = [];
  for (let i = 0; i < 100; i++) {
    const a = Math.PI / 2 - (i / 100) * Math.PI * 2, l = i % 10 === 0 ? 5.2 : i % 5 === 0 ? 3.8 : 2.4;
    const seg = T.path([f(s.rOut * Math.cos(a), s.rOut * Math.sin(a)), f((s.rOut - l) * Math.cos(a), (s.rOut - l) * Math.sin(a))]);
    (i % 10 === 0 ? major : i % 5 === 0 ? mid : minor).push(seg);
  }
  out.push(Ln(T.circle(0, 0, s.rOut, s.d, 128), { tone: "lo" }));
  out.push(Ln(minor.join(""), { tone: "lo" }), Ln(mid.join(""), { tone: "mid" }), Ln(major.join(""), { tone: "hi" }));
  return out.join("");
}

// The bezel: a knurled ring round the front that turns the scale to set zero.
export function bezel() {
  const b = C.BEZEL, F = dialFrame(0, 0, 0);
  const out = [S(G.ringBand(b.d0, b.d1, C.SCALE.rOut, b.rOut, F, P, { hole: [b.d1, C.SCALE.rOut] }), { tone: "mid" })];
  out.push(K.fadedSvg(G.ribsOf(F, b.d0 + 0.6, b.d1 - 2, b.rOut, 120, P, { fade: [0.1, 0.55], seams: true }), { tone: "lo" }));
  out.push(Ln(G.circleOf(F, b.d1, b.rOut - 2.4, P, 128), { tone: "faint" }));
  return out.join("");
}

// Two tolerance markers clipped to the bezel: pointers you set to the limits, so a glance says in or out.
export function markers() {
  const out = [];
  for (const a of [0.92, 0.08].map((t) => Math.PI / 2 - t * Math.PI * 2 + Math.PI * 2)) {
    const c = Math.cos(a), s = Math.sin(a), f = T.pl(C.BEZEL.d1 + 0.6);
    const w = 1.3, pts = [[80.4, -w], [80.4, w], [75, w * 0.6], [71, 0], [75, -w * 0.6]].map(([r, t]) => f(r * c - t * s, r * s + t * c));
    out.push(`<path class="iso-fill" d="${T.path(pts, true)}"/><path class="iso-line iso-edge" data-tone="mid" d="${T.path(pts, true)}"/>`);
    out.push(S(G.disc(C.BEZEL.d1 - 4, C.BEZEL.d1 + 1.2, 2, dialFrame(81 * c, 81 * s, 0), P), { tone: "mid" }));
  }
  return out.join("");
}
