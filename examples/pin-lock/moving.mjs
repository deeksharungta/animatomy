import { C, M, P, K } from "./model.mjs";
import { tools } from "./tools.mjs";

// What moves, from the state S, shared by the build and the page (it uses only its arguments).
// S: which key, kx (the key's shoulder, x), deg (the plug's turn), d (how far the drawer is open), duty.
export function dynamic(K, P, C, M, S, T) {
  const out = {}, F = T.plugF(S.deg), R = C.PLUG.r, KY = C.KEY, cutFaces = T.faces(F);
  const sv = (paths, o) => K.solidSvg(paths, o);
  const bottoms = S.bottoms ?? M.pinsAt(S.which, S.kx);
  // The key in the plug's frame: w from the shoulder toward the tip, q up the blade, extruded across the cut.
  const Fk = { o: [S.kx, 0, 0], a: F.u, u: [-1, 0, 0], v: F.v };
  const low = (w) => (w > KY.len - 1.5 ? KY.bottom + (w - KY.len + 1.5) * (1.4 / 1.5) : KY.bottom);
  const blade = (w0, w1) => {
    const pts = [];
    for (let w = w0; w < w1; w += 0.25) pts.push([w, M.edge(S.which, w)]);
    pts.push([w1, Math.max(low(w1), M.edge(S.which, Math.min(w1, KY.len)))]);
    if (w1 >= KY.len) pts.push([KY.len, low(KY.len)], [KY.len - 1.5, KY.bottom]);
    else pts.push([w1, low(w1)]);
    pts.push([w0, low(w0)]);
    return pts;
  };
  const grooveEnd = (q) => { for (let w = 0; w <= KY.len; w += 0.05) if (M.edge(S.which, w) <= q || low(w) >= q || w >= KY.len - 0.01) return w; return KY.len; };
  const grooves = (w0, w1, p) => [-1.2, -2.4].map((q) => { const e = Math.min(w1, grooveEnd(q)); return e > w0 ? K.pathOf([T.at(T.W(Fk, p, w0, q)), T.at(T.W(Fk, p, e, q))]) : ""; }).join("");
  const split = Math.max(0, Math.min(KY.len, S.kx - C.PLUG.x0));
  const keyIn = split < KY.len ? `<g class="pl-key">` + sv(T.body(Fk, blade(split, KY.len), 0, KY.half), { tone: "hi", crease: "lo", lit: !S.duty, inner: cutFaces ? K.lineSvg(grooves(split, KY.len, KY.half), { tone: "lo" }) : "" }) + `</g>` : "";
  // The key pins: whole pins, of which the cut shows the half in front of it; a domed tip on the key.
  const pins = C.PINS.map((x, i) => {
    const Fp = { o: [x, 0, 0], a: F.v, u: F.u, v: [-1, 0, 0] }, b = bottoms[i];
    return sv(T.body(Fp, T.half(1, 1, 12), b, b + 0.5), { tone: "mid", crease: "none" }) + sv(T.body(Fp, T.half(C.PIN_R, 1, 16), b + 0.5, b + M.pinLen[i]), { tone: "hi", crease: "lo" });
  }).join("");
  // The plug: its kept half, the keyway and bores open in the cut, the keyway's mouth on its face.
  const cp = (x, q) => T.at(T.W(F, -x, 0.02, q));
  const comb = [[C.PLUG.x0, -4.3], [-30, -4.3], [-30, 3.7]];
  for (const x of [...C.PINS].reverse()) comb.push([x - C.BORE_R, 3.7], [x - C.BORE_R, R], [x + C.BORE_R, R], [x + C.BORE_R, 3.7]);
  comb.push([C.PLUG.x0, 3.7]);
  const combD = K.pathOf(comb.map(([x, q]) => cp(x, q)), true);
  const mouth = T.flat(F, -C.PLUG.x0, [[-KY.half - 0.05, -4.3], [0, -4.3], [0, 3.7], [-KY.half - 0.05, 3.7]]);
  let plug = sv(T.body(F, T.half(R, -1, 40), -C.PLUG.x0, -C.HOUSING.x1), { tone: "hi", crease: "lo" });
  if (cutFaces) plug += `<path class="pl-void" d="${combD}"/>` + K.lineSvg(combD, { tone: "lo" });
  if (T.dot([1, 0, 0], T.V) > 0) plug += `<path class="pl-void" d="${mouth}"/>` + K.lineSvg(mouth, { tone: "lo" });
  // The crank on the plug's tail: a half disc (the plug's retainer too) carrying the crank pin.
  const pinAt = T.W(F, -C.CRANK.x0, 0, -C.CRANK.r);
  const crank = sv(K.disc(0, C.CRANK.x0 - C.CRANK.x1, C.CRANK.pin, K.frameAlong(pinAt, [-1, 0, 0]), P), { tone: "hi", crease: "none" })
    + sv(T.body(F, T.half(C.CRANK.disc, -1, 40), -C.CRANK.d0, -C.CRANK.d1), { tone: "mid", crease: "lo" });
  out.plugBack = cutFaces ? "" : pins + keyIn;
  out.plug = plug;
  out.crank = crank;
  out.plugFront = cutFaces ? pins + keyIn : "";
  // The key outside the plug, whole: the blade up to the face, the shoulder and the bow with its ring hole.
  const head = [[0, -4.6], [0, 4.8], [-5, 4.8], ...T.arc(-17, 0.2, KY.bow, 25, 335, 28), [-5, -4.6]];
  const face = cutFaces ? KY.half : -KY.half;
  let keyOut = split > 0 ? sv(T.body(Fk, blade(0, split), -KY.half, KY.half), { tone: "hi", crease: "lo", lit: !S.duty, inner: K.lineSvg(grooves(0, split, face) + K.pathOf([T.at(T.W(Fk, face, 0, KY.bottom)), T.at(T.W(Fk, face, 0, KY.top))]), { tone: "lo" }) }) : "";
  const hole = K.pathOf(T.circle(-22, 0.2, 2.6, 24).map(([w, q]) => T.at(T.W(Fk, face, w, q))), true);
  keyOut += sv(T.body(Fk, head, -KY.half, KY.half), { tone: "hi", crease: "lo", lit: !S.duty, inner: `<path class="iso-fill" d="${hole}"/>` + K.lineSvg(hole, { tone: "lo" }) });
  out.keyOut = keyOut;
  // The drivers ride on the key pins; turned, they sit on the plug at the shear line.
  out.drivers = C.PINS.map((x, i) => K.translateAlong(P, [0, 0, bottoms[i] - C.REST]));
  // The lever, turned by φ about its pivot, its foot on the crank pin; its rear pin in the bolt's slot.
  const L = C.LEVER, phi = M.lever(S.deg), c = Math.cos(phi), s = Math.sin(phi);
  const FL = (y) => ({ o: [L.px, y, L.pz], a: [0, 1, 0], u: [c, 0, s], v: [-s, 0, c] });
  out.lever = sv(T.body(FL(-11), T.rect(-L.back, -L.under, L.front, L.under), 0, 3), { tone: "mid", crease: "lo" }) + sv(T.body(FL(-8), T.rect(L.contact - 3, -L.under, L.front, 0.4), 0, 8), { tone: "mid", crease: "lo" });
  out.leverTop = (xi) => [L.px + xi * c - L.under * s, -9.5, L.pz + xi * s + L.under * c];
  const eye = [L.px - L.rear * c, 0.05, L.pz - L.rear * s];
  out.eye = K.lineSvg(K.pathOf(T.circle(eye[0], eye[2], 1.2, 16).map(([x, z]) => T.at([x, 0.05, z])), true), { tone: "mid" }) + K.dotsSvg([T.at(eye)], { size: 0.45, tone: "mid" });
  out.drop = M.boltDrop(S.deg);
  out.bolt = K.translateAlong(P, [0, 0, -out.drop]);
  out.drawer = K.translateAlong(P, [S.d, 0, 0]);
  out.bottoms = bottoms;
  return out;
}

// Crew poses, from the same state and drawing that move the parts.
export function poses(C, M, S, T, D) {
  const out = {};
  C.PINS.forEach((x, i) => {
    const b = D.bottoms[i], top = b + M.pinLen[i] + C.DRIVER, comp = Math.max(0, b - C.REST), v = (S.v ?? [])[i] ?? 0;
    const sq = Math.min(1, comp / 3.8), hand = top + C.MOUSE.size * C.MOUSE.hand[i] * (1 - 0.26 * sq), xw = x + C.MOUSE.side[i] * C.BORE_R;
    out["m" + i] = {
      at: [x, 0.15, top], heading: C.MOUSE.headings[i], squash: sq, lean: sq * 10,
      paws: { l: [xw, 0, hand + 0.4], r: [xw, 0, hand - 0.4] }, look: [0, -8],
      eyes: v > 6 ? "wide" : S.aligned ? "happy" : (S.idle ?? 0) > 5 ? "shut" : "open", tailSway: Math.sin((S.t ?? 0) * 0.7 + i) * 0.3,
    };
  });
  const RO = C.ROO, f = D.leverTop(RO.xi), phi = M.lever(S.deg), strain = phi / M.lever(90);
  out.roo = {
    at: f, heading: RO.heading, lean: 4 + 10 * strain, squash: 0.1 + 0.55 * strain, look: [0, 4],
    paws: { l: [C.POST.x + RO.paw[0], -9.5 + RO.paw[1], f[2] + RO.hand + 0.8], r: [C.POST.x + RO.paw[0], -9.5 + RO.paw[1], f[2] + RO.hand - 0.8] },
    eyes: (S.rooV ?? 0) > 20 ? "wide" : strain > 0.5 ? "open" : "happy", tailSway: -0.2,
  };
  return out;
}
export const T0 = tools(K, P);
