import * as G from "../../kit/lathe.mjs";
import { C, P, K, L, dialFrame, upFrame, at, S, Ln, Dt } from "./model.mjs";
import { tools } from "./tools.mjs";

// The indicator's case from outside: back cover and lug, the stem, the case wall cut open at the front,
// and the bushing and cap on top. The plunger's outside parts are drawn at rest (p = 0) and moved by the page.
const T = tools(K, P, { O: C.O, U: C.U, N: C.N });
const PD = C.PLUNGER_D, CS = C.CASE;
const F0 = dialFrame(0, 0, 0);

export function backCover() {
  const out = [];
  out.push(S(T.boxL(-4, 4, -10, 14, -62, C.BACK.d0 + 0.5), { tone: "mid" }));
  out.push(S(G.disc(C.BACK.d0, C.BACK.d1, CS.rOut - 1, F0, P), { tone: "mid" }));
  return out.join("");
}

// The plunger below the case: the contact point (a 3 mm ball on a hex holder), the rod, and the lift collar.
export function plungerLow() {
  const F = upFrame(0, C.TIP0, PD);
  const out = [];
  out.push(S(T.ball(L(0, C.TIP0 + 3, PD), 3), { tone: "hi" }));
  out.push(S(G.solidOf([[2.2, 1.6], [7, 1.6], [7, 3.8], [11, 3.8]], F, P), { tone: "hi" }));
  out.push(S(G.prismOf(F, [0, 1, 2, 3, 4, 5].map((i) => [4.6 * Math.cos((i / 6) * 6.283 + 0.4), 4.6 * Math.sin((i / 6) * 6.283 + 0.4)]), 11, 15, P), { tone: "hi" }));
  out.push(S(G.disc(15, 90, C.ROD_R, F, P), { tone: "hi", crease: "none" }));
  return out.join("");
}

export function stem() {
  const st = C.STEM, F = upFrame(0, st.y1, PD);
  const out = [];
  const len = st.y0 - st.y1;
  out.push(S(G.solidOf([[0, st.r - 0.8], [0.8, st.r], [len - 6, st.r], [len - 6, st.r + 2.4], [len, st.r + 2.4]], F, P), { tone: "mid", inner: Ln(G.arcOf(F, 8, st.r, P) + G.arcOf(F, 18, st.r, P), { tone: "faint" }) }));
  return out.join("");
}

// The case wall, open at the front where the crystal and the dial's centre have been cut away.
export function shell() {
  const out = [];
  out.push(S(G.ringBand(CS.d0, CS.d1, CS.rIn, CS.rOut, F0, P, { hole: [CS.d1, CS.rIn] }), { tone: "mid", inner: Ln(G.arcOf(F0, -20, CS.rOut, P), { tone: "faint" }) }));
  return out.join("");
}

// On top: the bushing the plunger slides in, and the cap on the plunger's end (lit: you lift it by this).
export function bushing() {
  const b = C.BUSH, F = upFrame(0, b.y0 - 2, PD);
  return S(G.solidOf([[0, b.r + 2], [2, b.r + 2], [2, b.r], [b.y1 - b.y0 + 2, b.r]], F, P), { tone: "mid" });
}
export function cap() {
  const F = upFrame(0, C.BUSH.y1 - 6, PD);
  const out = [S(G.disc(0, 8, C.ROD_R, F, P), { tone: "hi", crease: "none" })];
  out.push(S(G.solidOf([[7, 5.2], [11, 5.2], [12.5, 4.4, 1], [13.4, 2.8, 1], [13.8, 0]], F, P), { tone: "hi" }));
  return out.join("");
}

// The inside of the case behind the movement: the inner wall where the opening shows it, and the back plate.
export function cavityBack() {
  const out = [];
  out.push(`<path class="di-wall" d="${T.circle(0, 0, CS.rIn, CS.d1, 96)}"/>`);
  out.push(Ln(T.circle(0, 0, CS.rIn, C.PLATE_D + 2, 96), { tone: "lo" }));
  out.push(S(G.disc(C.PLATE_D - 2, C.PLATE_D, CS.rIn - 0.4, F0, P), { tone: "mid" }));
  // Back plate: screws, a pillar each side and a stamped rim.
  out.push(Ln(T.circle(0, 0, CS.rIn - 5, C.PLATE_D, 96), { tone: "faint" }));
  const screws = [[-50, 42], [50, 42], [-56, -30], [56, -30], [0, 62]];
  out.push(Ln(screws.map(([x, y]) => T.circle(x, y, 2.4, C.PLATE_D, 20)).join(""), { tone: "lo" }));
  out.push(Dt(screws.map(([x, y]) => T.pl(C.PLATE_D)(x, y)), { size: 0.55 }));
  out.push(Ln(screws.map(([x, y]) => T.path([T.pl(C.PLATE_D)(x - 2.4, y), T.pl(C.PLATE_D)(x + 2.4, y)])).join(""), { tone: "lo" }));
  return out.join("");
}
void at; void K;
