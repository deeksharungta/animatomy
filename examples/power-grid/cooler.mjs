import { k, L, P, at, S, Ln, D, box, seg, rod, rodAB, circleY } from "./shapes.mjs";
import { C } from "./model.mjs";

// The cooler: three banks of pressed-steel radiator panels on the tank's front, each with its top and bottom
// manifold and a fan under it; the bottom manifolds join a return pipe to the oil pump at the +x end, whose
// motor's cover is off so the wheel Bun and Mochi run in shows; the pump sends the cooled oil back into the tank.
const R = C.RAD, T = C.TANK, FY = T.y + T.d, PU = C.PUMP;
export const BANKS = [44, 57, 70];
const PANELS = 7, PITCH = 1.6, Y0 = FY + 2, Y1 = FY + 18;

export function manifolds(top) {
  const out = [], z = top ? R.z[1] : R.z[0] - 3;
  for (const x of BANKS) {
    out.push(S(rod([x + 5.5, FY, z + 1.5], [0, 1, 0], 1.4, 0, 3, 12), { tone: "hi" }));
    out.push(S(box(x, Y0, z, x + 11, Y1, z + 3, 0.8, 0.4), { tone: "mid" }));
    out.push(D([[x + 1, Y1, z + 1.5], [x + 10, Y1, z + 1.5]].map(at), { size: 0.4 }));
  }
  return out.join("");
}
export function panels() {
  const out = [];
  for (const x of BANKS) for (let i = 0; i < PANELS; i++) {
    const px = x + 0.4 + i * PITCH, plan = { x: px, y: Y0 + 0.4, w: 0.55, d: Y1 - Y0 - 0.8, r: 0.25 };
    const ch = [Y0 + 4, Y0 + 8, Y0 + 12].map((y) => seg([px + 0.55, y, R.z[0]], [px + 0.55, y, R.z[1]]));
    out.push(S(k.slabOf(plan, R.z[0], R.z[1] - R.z[0], P, 2), { tone: "hi", inner: Ln(ch.join(""), { tone: "faint" }) }));
  }
  return out.join("");
}
// Fans under the banks: a shroud ring on a bracket from the tank, the motor hub, and blades drawn live.
export const FANS = BANKS.map((x) => [x + 5.5, (Y0 + Y1) / 2, R.z[0] - 9]);
export function fanBack() {
  const out = [];
  for (const [x, y, z] of FANS) {
    out.push(S(box(x - 0.6, FY, z + 1.6, x + 0.6, y, z + 2.8, 0.2), { tone: "mid" }));
    out.push(S(k.cylinder(x, y, 6, z, 3, P, 36), { tone: "mid", crease: "none" }));
    out.push(`<path class="pg-void" d="${k.onTop(k.circleRing(x, y, 5.3, 36), z + 3, P, true)}"/>`);
  }
  return out.join("");
}
export const fanHub = () => FANS.map(([x, y, z]) => S(k.cylinder(x, y, 1.4, z + 0.4, 2.8, P, 16), { tone: "hi" })).join("");

// The return pipe and the pump: volute behind, the motor drum in front, open toward you.
export const DRUM = { y0: PU.y - PU.w, y1: PU.y + PU.w - 1, r: PU.r + 1.6 };
export function pumpBack() {
  const out = [], { x, y, z } = PU, Fy = L.frameAlong([x, DRUM.y0 - 6, z], [0, 1, 0]);
  const zr = R.z[0] - 1.5;
  out.push(S(rodAB([BANKS[2] + 11, DRUM.y0 - 3, zr], [x - 9.2, DRUM.y0 - 3, zr], 1.4, 12), { tone: "hi" }));
  out.push(S(L.solidOf([[0, 8], [1, 9.4, 1], [5, 9.4, 1], [6, 8]], Fy, P), { tone: "mid" }));
  out.push(S(rodAB([x, DRUM.y0 - 4, z + 9], [x, DRUM.y0 - 4, 44], 1.6, 12), { tone: "hi" }) + S(rodAB([x, DRUM.y0 - 4, 44], [T.x + T.w + 1.6, DRUM.y0 - 4, 44], 1.6, 12), { tone: "hi" }));
  out.push(S(L.disc(-1, 0, 3, L.frameAlong([T.x + T.w + 1.6, DRUM.y0 - 4, 44], [1, 0, 0]), P), { tone: "mid" }));
  // The drum's back wall and its rim, seen from the open front.
  out.push(S(box(x - 8, DRUM.y0 - 2, 0, x + 8, DRUM.y1 + 1, 1.4, 0.4), { tone: "lo" }) + S(box(x - 6, DRUM.y0, 1.4, x + 6, DRUM.y1 - 1, z - DRUM.r + 0.4, 0.3), { tone: "mid" }));
  const Fd = L.frameAlong([x, DRUM.y0, z], [0, 1, 0]);
  out.push(S(L.ringBand(0, DRUM.y1 - DRUM.y0, DRUM.r - 0.8, DRUM.r, Fd, P), { tone: "mid" }));
  const wy = PU.y - PU.w + 1.6;
  out.push(`<g class="pg-cavity">${S(L.disc(0, 0.8, DRUM.r - 0.8, Fd, P), { tone: "lo" })}${S(L.disc(0.8, wy - DRUM.y0, 3, Fd, P), { tone: "mid" })}${Ln(circleY(x, wy, z, PU.r, 64), { tone: "mid" })}</g>`);
  // Cooling ribs round the drum, a terminal box on top and the feet the motor stands on.
  out.push(K_ribs(Fd));
  out.push(S(box(x - 3.4, DRUM.y0 + 1, z + DRUM.r - 0.6, x + 3.4, DRUM.y0 + 6, z + DRUM.r + 3.6, 0.4), { tone: "mid" }) + D([at([x - 2, DRUM.y0 + 6, z + DRUM.r + 2.6]), at([x + 2, DRUM.y0 + 6, z + DRUM.r + 2.6])], { size: 0.4 }));
  return out.join("");
}
export function pumpFront() {
  const { x, z } = PU, out = [];
  out.push(Ln(circleY(x, PU.y + PU.w - 2.4, z, PU.r, 64), { tone: "mid" }));
  out.push(Ln(circleY(x, DRUM.y1, z, DRUM.r, 64), { tone: "mid" }) + Ln(circleY(x, DRUM.y1, z, DRUM.r - 0.8, 64), { tone: "lo" }));
  out.push(D(Array.from({ length: 10 }, (_, i) => { const t = (i / 10) * Math.PI * 2 + 0.2; return at([x + (DRUM.r - 0.4) * Math.cos(t), DRUM.y1, z + (DRUM.r - 0.4) * Math.sin(t)]); }), { size: 0.4, tone: "mid" }));
  return out.join("");
}
const K_ribs = (Fd) => {
  const ribs = L.ribsOf(Fd, 0.6, DRUM.y1 - DRUM.y0 - 0.6, DRUM.r + 0.02, 40, P, { fade: [0.1, 0.55], seams: true });
  return k.fadedSvg(ribs, { tone: "lo" });
};
export { R as RAD };
