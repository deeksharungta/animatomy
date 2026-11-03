import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D, faceY, flatY, discY, box, roundRect, ringY } from "./model.mjs";
import { hammerAt } from "./mech.mjs";

const PL = C.PLATE, PT = PL.t;

// A countersunk wood screw on a y face: its head and a slot across it, rim to rim.
const screw = (x, z, y, r = 2.4, a = 0.6) => S(discY(x, z, r, y, y + 0.7), { tone: "mid", crease: "lo" }) +
  Ln(k.segment([x - r * Math.cos(a) * 0.86, y + 0.7, z - r * Math.sin(a) * 0.86], [x + r * Math.cos(a) * 0.86, y + 0.7, z + r * Math.sin(a) * 0.86], P), { tone: "lo" });

// The maker's plate: a thin riveted plaque with three rule lines standing for its lettering.
function makersPlate(x0, x1, z0, z1) {
  const y = PT + 0.6, rules = [0.72, 0.5, 0.28].map((f, i) => k.segment([x0 + 3.2, y, z0 + (z1 - z0) * f], [x1 - 3.2 - i * 3, y, z0 + (z1 - z0) * f], P)).join("");
  return S(flatY(0, 0, 0, roundRect(x0, x1, z0, z1, 1.4, 3), PT, y), { tone: "hi" }) + Ln(rules, { tone: "lo", free: true }) +
    D([at([x0 + 1.5, y, (z0 + z1) / 2]), at([x1 - 1.5, y, (z0 + z1) / 2])], { size: 0.45, tone: "lo" });
}

// The cast base plate screwed to the door, with a groove round its face and the boss the spindle comes through.
export function plate() {
  const out = [S(flatY(0, 0, 0, roundRect(PL.x0, PL.x1, PL.z0, PL.z1, PL.r, 8), 0, PT), { tone: "mid", inner: Ln(ringY(PT, PL.x0 + 4, PL.x1 - 4, PL.z0 + 4, PL.z1 - 4, PL.r - 4), { tone: "faint" }) })];
  for (const [x, z] of [[PL.x0 + 8.5, PL.z0 + 8.5], [PL.x1 - 8.5, PL.z0 + 8.5], [PL.x0 + 8.5, PL.z1 - 8.5], [PL.x1 - 8.5, PL.z1 - 8.5]]) out.push(screw(x, z, PT));
  out.push(S(discY(0, 0, C.BOSS.r, PT, C.BOSS.y1), { tone: "mid", crease: "lo", inner: Ln(L.arcOf(faceY(0, PT, 0), 1.6, C.BOSS.r, P), { tone: "faint" }) }));
  out.push(S(discY(0, 0, 6, C.BOSS.y1, C.WHEEL.y), { tone: "hi", crease: "lo" }));
  out.push(makersPlate(23, 39, -37, -27));
  return out.join("");
}

// The studs the hammer and the click turn on, and the posts their springs push from.
export function studs() {
  const H = C.HAM, Ck = C.CLICK, out = [];
  for (const [x, z, y1] of [[H.pivot[0], H.pivot[1], H.y], [Ck.pivot[0], Ck.pivot[1], Ck.y]]) out.push(S(discY(x, z, 2.2, PT, y1), { tone: "mid", crease: "lo" }));
  const sz = hammerAt(C, 0).spring[1], hy = H.y + H.t / 2;
  out.push(S(box(C.SPRING.post, PT, sz - 4.5, C.SPRING.post + 4.5, hy + 3.5, sz + 4.5, 0.6, 0.4), { tone: "mid" }));
  out.push(S(L.disc(0, 0.8, 2.6, L.frameAlong([C.SPRING.post, hy, sz], [-1, 0, 0]), P), { tone: "hi", crease: "lo" }));
  out.push(D([at([C.SPRING.post + 2.25, hy + 3.5, sz + 2.4])], { size: 0.5, tone: "lo" }));
  const cx = Ck.pivot[0] + Ck.arm[0] * C.CSPRING.at, cy = Ck.y + Ck.t / 2, cz = C.CSPRING.post;
  out.push(S(box(cx - 2.6, PT, cz, cx + 2.6, cy + 3, cz + 5.5, 0.6, 0.4), { tone: "mid" }));
  out.push(S(L.disc(0, 0.7, 1.7, L.frameAlong([cx, cy, cz], [0, 0, -1]), P), { tone: "hi", crease: "lo" }));
  out.push(D([at([cx, cy + 3, cz + 3.6])], { size: 0.5, tone: "lo" }));
  return out.join("");
}

// The gong: a shallow brass dome, open toward the door, on a pillar from the plate, held by a nut at its crown.
const G = C.GONG;
const gongR = (s) => G.R * Math.sqrt(Math.max(0, 1 - (s / G.H) ** 2));
const gongSlope = (s) => (-G.R * (s / (G.H * G.H))) / Math.sqrt(Math.max(1e-6, 1 - (s / G.H) ** 2));
export function gong() {
  const F = faceY(0, G.y, G.z), prof = [];
  for (let i = 0; i <= 28; i++) { const s = (i / 28) * G.s1; prof.push([s, gongR(s), 1]); }
  prof[0] = [0, G.R]; prof[prof.length - 1] = [G.s1, gongR(G.s1)];
  const lip = L.arcOf(F, 1.4, gongR(1.4), P, { slope: gongSlope(1.4) }), band = L.arcOf(F, 7, gongR(7), P, { slope: gongSlope(7) });
  const body = S(L.solidOf(prof, F, P, { smooth: { slope: gongSlope, radius: gongR } }), { tone: "hi", crease: "none", inner: Ln(lip + band, { tone: "faint" }) });
  const top = G.y + G.s1, crown = S(L.disc(0, 0.8, 8, faceY(0, top, G.z), P), { tone: "hi", crease: "lo" });
  return `<g class="db-gong" data-part="gong">${body}${crown}</g>` +
    S(L.prismOf(faceY(0, top + 0.8, G.z), Array.from({ length: 6 }, (_, i) => [4.6 * Math.cos((i / 6) * Math.PI * 2 + 0.3), 4.6 * Math.sin((i / 6) * Math.PI * 2 + 0.3)]), 0, 3.2, P), { tone: "mid" }) +
    S(L.solidOf([[0, 2], [0.8, 1.8, 1], [1.6, 0]], faceY(0, top + 4, G.z), P), { tone: "mid", crease: "none" });
}

// A bracket off the plate: a shelf on a web, screwed to the plate's face; Rocky stands on it.
export function shelf() {
  const { x0, x1, z, y1 } = C.SHELF;
  const mid = (x0 + x1) / 2, web = L.frameOf([mid - 1, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  return S(L.prismOf(web, [[PT, z - 1.2], [y1 - 6, z - 1.2], [PT, z - 11]], 0, 2, P), { tone: "mid" }) +
    S(box(x0, PT, z - 1.2, x1, y1, z, 0.5, 0.4), { tone: "mid" }) +
    D([at([x0 + 2.5, PT + 2.5, z]), at([x1 - 2.5, PT + 2.5, z])], { size: 0.5, tone: "lo" });
}
