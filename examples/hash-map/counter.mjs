// The fixed parts round the camshaft and the counter: the guide bar the rods run through, the click that holds the
// ratchet, Knock's perch, Rocky's step, and the feed (chute and in-tray) the letters arrive by.
import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D, xc } from "./model.mjs";
import { box, chute, openBox, screws, pips } from "./helpers.mjs";

const sh = C.SHAFT, up = [0, 0, 1];

// The guide bar over the cams, on a post at each end, with a bushed hole for every follower rod.
export function guide() {
  const g = C.GUIDE, p = { x: -2.6, y: sh.y - 2, w: C.X1 + 5.2, d: 9.4, r: 0.6 };
  const posts = [-2.6, C.X1].map((x) => box(x, sh.y + 5, C.CEIL + C.BOARD, 2.6, 2.4, g.z - C.CEIL - C.BOARD, "mid")).join("");
  const holes = Array.from({ length: C.N }, (_, i) => k.ring(xc(C, i), sh.y, 1.7, g.z + g.h, P, 20)).join("");
  return posts + S(k.slabOf(p, g.z, g.h, P, 2, 0.3), { tone: "mid" }) + Ln(holes, { tone: "lo" })
    + D([0, 88, 176].map((x) => at([x + 0.6, sh.y + 5.6, g.z + g.h])), { size: 0.5 });
}

// The fascia in front of the flags: a lowered flag hides behind it and a raised one stands clear, over a pip plate.
export function fascia() {
  const g = C.GUIDE, y = sh.y + 2, z0 = g.z + g.h, z1 = sh.z + C.CAM.r0 + C.ROD.len + C.FLAG.h + 0.4, out = [];
  out.push(S(k.slabOf({ x: -2.6, y, w: C.X1 + 5.2, d: 1.4, r: 0.3 }, z0, z1 - z0, P, 2, 0.3), { tone: "mid" }));
  for (let i = 0; i < C.N; i++) {
    const x = xc(C, i), zm = (z0 + z1) / 2;
    out.push(S(k.slabOf({ x: x - 5, y: y + 1.4, w: 10, d: 0.4, r: 0.3 }, zm - 2.2, 4.4, P, 2), { tone: "hi" }) + pips(i, x, y + 1.8, zm));
  }
  return out.join("") + D([-1.4, C.X1 + 1.4].map((x) => at([x, y + 1.4, (z0 + z1) / 2])), { size: 0.45 });
}

// The post at the counter's outer end: bearings for the camshaft and the drive axle, and the detent's spring arm,
// which presses its roller onto the star wheel's rim so the wheel stays put between slots.
export function post() {
  const p = C.POST, G = C.GEN, R = G.c * Math.cos(Math.PI / 8), zt = sh.z + R + 3.4, foot = { x: p.x - 3, y: sh.y - 7, w: p.w + 6, d: 14, r: 0.8 };
  return S(k.slabOf(foot, C.TOP, 2, P, 3, 0.4), { tone: "mid" }) + screws(foot, C.TOP + 2, 1.3)
    + box(p.x, sh.y - 4, C.TOP + 2, p.w, 8, zt - C.TOP - 2, "mid")
    + [sh.z, sh.z - G.c].map((z) => S(L.disc(0, 0.8, 3.4, L.frameAlong([p.x + p.w, sh.y, z], [1, 0, 0]), P), { tone: "mid" })).join("")
    + box(G.x + G.w / 2 + 0.3, sh.y - 1.2, zt - 1.4, p.x - G.x - G.w / 2 - 0.3, 2.4, 1.4, "hi")
    + D([at([p.x + p.w, sh.y, zt - 0.7]), at([p.x + p.w, sh.y - 2.6, C.TOP + 6]), at([p.x + p.w, sh.y + 2.6, C.TOP + 6])], { size: 0.45 });
}

// Knock's perch: a column on the desk top beside the frame, with a little platform level with the heart cam's foot.
export function perch() {
  const [x, y, z] = C.PLACE.knock.at, base = { x: x - 4, y: y - 4, w: 8, d: 8, r: 0.8 };
  return S(k.slabOf(base, C.TOP, 1.4, P, 3, 0.3), { tone: "mid" }) + screws(base, C.TOP + 1.4, 1.2)
    + S(k.cylinder(x, y, 1.4, C.TOP + 1.4, z - C.TOP - 2.8, P, 14), { tone: "mid" }) + S(k.cylinder(x, y, 2.4, z - 3.6, 2.2, P, 16, 0.3), { tone: "mid" })
    + S(k.slabOf({ x: x - 4, y: y - 3.4, w: 8, d: 6.8, r: 0.8 }, z - 1.4, 1.4, P, 3, 0.3), { tone: "hi" });
}

// The drive axle's second bearing, on a slim post behind Rocky's step.
export function post2() {
  const x = C.POST2, z = C.SHAFT.z - C.GEN.c, foot = { x: x - 2.6, y: sh.y - 5, w: 7.6, d: 10, r: 0.8 };
  return S(k.slabOf(foot, C.TOP, 1.6, P, 3, 0.4), { tone: "mid" }) + D(k.corners(foot, 1.1).map(([px, py]) => at([px, py, C.TOP + 1.6])), { size: 0.4 })
    + box(x, sh.y - 3, C.TOP + 1.6, 2.4, 6, z + 2 - C.TOP - 1.6, "mid") + S(L.disc(0, 0.8, 3, L.frameAlong([x + 2.4, sh.y, z], [1, 0, 0]), P), { tone: "mid" });
}

// The crank's pedestal: a column on the desk top with a bearing for the crank's axle.
export function pedestal() {
  const Cr = C.CRANK, z = sh.z - C.GEN.c, foot = { x: Cr.x - 3.5, y: Cr.y1 - 7.6, w: 7, d: 5.2, r: 0.8 };
  return S(k.slabOf(foot, C.TOP, 1.6, P, 3, 0.4), { tone: "mid" }) + D(k.corners(foot, 1.1).map(([x, y]) => at([x, y, C.TOP + 1.6])), { size: 0.4 })
    + box(Cr.x - 1.6, Cr.y1 - 6.6, C.TOP + 1.6, 3.2, 3.2, z - 3 - C.TOP - 1.6, "mid")
    + S(L.disc(0, 3.2, 3, L.frameAlong([Cr.x, Cr.y1 - 6.6, z], [0, 1, 0]), P), { tone: "mid" });
}

// Rocky's step: a block on the desk top beside the crank.
export function step() {
  const p = C.PLACE.rocky.at, s = { x: p[0] - 7, y: p[1] - 5, w: 14, d: 11, r: 0.8 };
  return S(k.slabOf(s, C.TOP, p[2] - C.TOP, P, 3, 0.4), { tone: "mid", inner: Ln(k.sideSeam(s, p[2] - 2, P, 3), { tone: "faint" }) }) + screws(s, p[2], 1.6);
}

// The feed: the chute from the wall slot, its post, and the in-tray it drops letters into.
export const CH = () => chute(C.CHUTE.a, C.CHUTE.b, C.CHUTE.w, { lip: 3 });
// The in-tray stands on four short legs, so its letters are at Nib's paw height.
export const TRAY = () => {
  const T = C.TRAY, o = openBox(T, T.z, 4.6), legs = k.corners(T, 1.6).sort((a, b) => k.depthOf([...a, 0], P) - k.depthOf([...b, 0], P));
  const leg = ([x, y]) => S(k.cylinder(x, y, 0.9, C.TOP, T.z - C.TOP, P, 12), { tone: "mid" });
  return { back: legs.slice(0, 3).map(leg).join("") + o.back, front: o.front, legs: leg(legs[3]) };
};
export function chutePost() {
  const b = C.CHUTE.b, x = b[0], y = -4, z = b[2] + ((C.CHUTE.a[2] - b[2]) * (b[1] - y)) / (b[1] - C.CHUTE.a[1]) - 1.4;
  return box(x - 1.4, y - 1.4, C.TOP, 2.8, 2.8, z - C.TOP, "mid") + box(x - C.CHUTE.w / 2 - 1.2, y - 1.4, z - 2, C.CHUTE.w + 2.4, 2.8, 2, "mid")
    + D([at([x - C.CHUTE.w / 2, y + 1.4, z - 1]), at([x + C.CHUTE.w / 2, y + 1.4, z - 1])], { size: 0.45 });
}
