// The bottle, cut in half: the reservoir tube round the outside, the pressure cylinder inside it, the top nut that
// holds both with its wiper, and the reservoir's filler bung; and the ram, built at its lowest and lifted by the page.
import * as k from "../../kit/iso-kit.mjs";
import { C, P, at, S, Ln, D, half, halfSolid, flatY } from "./model.mjs";

const T = C.TUBE, Y = C.CYL, N = C.NUT, R = C.RAM, Z0 = C.BASE.z1, SD = C.SADDLE;
const rect = (x0, x1, z0, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];

export function tubeBack() {
  const out = [];
  out.push(S(halfSolid(T.r0, T.r1, Z0, T.z1), { tone: "hi", crease: "faint", inner: Ln(k.segment([-T.r1, 0, 80], [-T.r0, 0, 80], P) + k.segment([T.r0, 0, 80], [T.r1, 0, 80], P), { tone: "faint" }) }));
  out.push(S(halfSolid(T.r1, T.r1 + 1.6, Z0, Z0 + 2), { tone: "mid", crease: "lo" }));
  // The filler bung on the tube's left side, cut through: a rubber plug in its hole, head outside.
  out.push(flatY([[-T.r1 - 5, 126], [-T.r1, 126], [-T.r1, 129], [-T.r0 + 0.4, 129], [-T.r0 + 0.4, 137], [-T.r1, 137], [-T.r1, 140], [-T.r1 - 5, 140]], { shade: 0, tone: "lo" }));
  return out.join("");
}

export function cylinderBack() {
  const out = [];
  out.push(S(halfSolid(Y.r0, Y.r1, Z0, Y.z1), { tone: "hi", crease: "faint" }));
  return out.join("");
}

// The top nut: screwed onto the tube, holding the cylinder down, with its wiper seal and wrench flats.
export function nut() {
  const out = [];
  out.push(S(k.extrude(half(R.r, N.r1, 0, 6), N.z0, N.z1 - N.z0, P, { convex: false, bevel: 0.6 }), { tone: "hi", crease: "lo", inner: Ln(k.segment([-N.r1, 0, N.z0 + 5], [-T.r1, 0, N.z0 + 5], P) + k.segment([T.r1, 0, N.z0 + 5], [N.r1, 0, N.z0 + 5], P), { tone: "faint" }) }));
  for (const s of [-1, 1]) {
    out.push(flatY(rect(s * (R.r + 0.2), s * (R.r + 2), N.z1 - 4, N.z1 - 1.5), { shade: 0, tone: "lo" }));
  }
  out.push(D([-31, -23, 23, 31].map((x) => at([x, -Math.sqrt(N.r1 ** 2 - x * x) * 0.85, N.z1])), { size: 0.45, tone: "lo" }));
  return out.join("");
}

// The ram at e = 0: a hollow piston with its U-cup seal, backup ring and wear band, the extension screw threaded
// into its bore, and the saddle on top with serrated cheeks either side of the pinch-weld groove.
export function ram() {
  const out = [], top = Z0 + R.len, lo = Z0 + 12, sc = top - 46;
  out.push(S(halfSolid(0, R.r, Z0, lo), { tone: "hi", crease: "lo" }));
  out.push(S(halfSolid(R.bore, R.r, lo, top), { tone: "hi", crease: "lo", inner: Ln(k.segment([-R.r, 0, top - 30], [-R.bore, 0, top - 30], P) + k.segment([R.bore, 0, top - 30], [R.r, 0, top - 30], P), { tone: "faint" }) }));
  for (const s of [-1, 1]) {
    out.push(flatY(rect(s * (R.r - 2.6), s * (R.r - 0.1), Z0 + 2, Z0 + 6), { shade: 0, tone: "lo" }));
    out.push(flatY(rect(s * (R.r - 2.6), s * (R.r - 0.1), Z0 + 6.4, Z0 + 7.6), { shade: 3, tone: "lo" }));
    out.push(flatY(rect(s * (R.r - 1.4), s * (R.r - 0.1), Z0 + 9, Z0 + 11), { shade: 3, tone: "mid" }));
  }
  out.push(`<path class="cj-void" d="${k.pathOf(rect(-R.bore, R.bore, lo, sc).map(([x, z]) => at([x, -0.1, z])), true)}"/>`);
  out.push(S(halfSolid(0, R.bore - 0.4, sc, top + 2), { tone: "hi", crease: "lo" }));
  const th = [];
  for (let z = sc + 2; z < top - 1; z += 2.4) for (const s of [-1, 1]) th.push(k.pathOf([at([s * (R.bore - 0.4), 0, z]), at([s * (R.bore - 1.8), 0, z + 1.2]), at([s * (R.bore - 0.4), 0, z + 2.4])]));
  out.push(Ln(th.join(""), { tone: "faint" }));
  // The screw's hex collar, seated on the ram's top, with its flats.
  out.push(S(k.extrude(half(0, 14.5, 0, 6), top, 2, P), { tone: "hi", crease: "lo" }));
  const g = SD.groove, zt = top + 2 + SD.h;
  out.push(S(halfSolid(0, SD.r, top + 2, zt - 3), { tone: "hi", crease: "lo" }));
  for (const s of [-1, 1]) {
    const cheek = [];
    for (let i = 0; i <= 16; i++) { const x = s * (g + ((SD.r - g) * i) / 16); cheek.push([x, -Math.sqrt(Math.max(0, SD.r * SD.r - x * x))]); }
    cheek.push([s * SD.r, 0], [s * g, 0]);
    out.push(S(k.extrude(cheek, zt - 3, 3, P), { tone: "hi", crease: "lo" }));
    out.push(Ln([5, 8.5, 12, 15.5].map((x) => k.lineOnTop([s * x, -Math.sqrt(SD.r * SD.r - x * x) + 0.6], [s * x, 0], zt, P)).join(""), { tone: "lo" }));
  }
  return out.join("");
}
