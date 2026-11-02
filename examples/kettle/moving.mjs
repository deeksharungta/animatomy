// The parts that move, drawn from the model's state. Both functions are also serialized into the page,
// so they use only the K, P, C and S objects passed in.
export function dynamic(K, P, C, S) {
  const R2 = Math.SQRT1_2, deg = Math.PI / 180;
  const W = ([u, w, z]) => [(u + w) * R2, (w - u) * R2, z];
  const at = (p) => K.iso(W(p), P);
  const CUT = K.frameOf([0, 0, 0], [R2, R2, 0], [R2, -R2, 0], [0, 0, 1]);
  const cut = (poly, w0, w1) => K.prismOf(CUT, poly, w0, w1, P);
  const rot = ([pu, pz], a, pts) => pts.map(([u, z]) => [pu + (u - pu) * Math.cos(a) - (z - pz) * Math.sin(a), pz + (u - pu) * Math.sin(a) + (z - pz) * Math.cos(a)]);
  const out = {};
  // The rocker: φ from on (tip down) to off (tip up). Its inner arm carries the link rod.
  const R = C.ROCK, [pu, pz] = R.pivot, phi = (R.on + (R.off - R.on) * S.rock) * deg;
  const rocker = rot(R.pivot, -phi, [[pu + R.inner, pz - 1], [pu + R.inner, pz + 1], [pu - R.outer + 1, pz + 1.6], [pu - R.outer, pz + 0.6], [pu - R.outer, pz - 1.4], [pu - R.outer + 1, pz - 1.6]]);
  out.rocker = K.solidSvg(cut(rocker, -6, 0), { tone: "hi", lit: S.duty === "" && S.rock < 0.5 }) + K.solidSvg(cut(Array.from({ length: 12 }, (_, i) => [pu + 1.3 * Math.cos(i * 0.5236), pz + 1.3 * Math.sin(i * 0.5236)]), -6.5, 0.5), { tone: "mid" });
  const inner = [pu + (R.inner - 0.6) * Math.cos(phi), pz - (R.inner - 0.6) * Math.sin(phi)];
  out.paddle = [pu - (R.outer - 3.5) * Math.cos(phi), pz + (R.outer - 3.5) * Math.sin(phi) + 1.6];
  out.paddleTilt = phi;
  // The link rod hangs from the inner arm and lifts the switch leaf onto its fixed contact.
  const L0 = C.LEAF, rodBottom = inner[1] - 20.6, tip = Math.max(L0.z, Math.min(L0.z + 2.5, rodBottom));
  out.link = K.solidSvg(cut([[inner[0] - 0.5, rodBottom], [inner[0] + 0.5, rodBottom], [inner[0] + 0.5, inner[1]], [inner[0] - 0.5, inner[1]]], -3.6, -2.4), { tone: "mid" }) + K.dotsSvg([at([inner[0], 0.6, inner[1]])], { size: 0.55, tone: "lo" });
  const leaf = [[L0.u0, L0.z - 0.4], [L0.u0, L0.z + 0.4], [L0.u1, tip + 0.4], [L0.u1, tip - 0.4]];
  out.leaf = K.solidSvg(cut(leaf, -4, -2), { tone: "hi" }) + K.dotsSvg([at([L0.u1 + 0.3, -1, tip + 0.4])], { size: 0.7, tone: "hi" });
  // The toggle spring, from its post up to the inner arm, drawn as a coil whose back half goes first.
  const sb = [-79.8, 27], st = [pu + 4.4 * Math.cos(phi), pz - 4.4 * Math.sin(phi) - 0.8];
  const back = [], front = [];
  let run = [], near = null;
  for (let i = 0; i <= 96; i++) {
    const f = i / 96, t = f * 9 * Math.PI * 2, c = [sb[0] + (st[0] - sb[0]) * f, sb[1] + (st[1] - sb[1]) * f];
    const p = at([c[0] + 1.3 * Math.cos(t), -3 + 1.3 * Math.sin(t), c[1]]), facing = Math.sin(t) > 0;
    if (near === null) near = facing;
    if (facing !== near) { run.push(p); (near ? front : back).push(K.pathOf(run)); run = [p]; near = facing; continue; }
    run.push(p);
  }
  if (run.length > 1) (near ? front : back).push(K.pathOf(run));
  out.spring = K.lineSvg(back.join(""), { tone: "lo" }) + K.lineSvg(front.join(""), { tone: "mid" });
  // Mo's trip bar: level while he holds it, tipped 8° when the disc snaps, its finger pressing the inner arm down.
  const B = C.BAR, beta = -C.BAR.trip * S.snap * deg, [bu, bz] = B.pivot;
  const bar = rot(B.pivot, beta, [[bu, bz - 1], [bu, bz + 1], [bu - B.len, bz + 1], [bu - B.len, bz - 1]]);
  const finger = rot(B.pivot, beta, [[bu - B.len + 0.2, bz - 1], [bu - B.len + 2.4, bz - 1], [bu - B.len + 2.4, bz - 8.4], [bu - B.len + 0.2, bz - 8.4]]);
  out.bar = K.solidSvg(cut(finger, -4.2, -1.8), { tone: "mid" }) + K.solidSvg(cut(bar, -4.4, -1.6), { tone: "hi", lit: S.duty === "" && S.snap > 0.5 });
  const onBar = (u) => rot(B.pivot, beta, [[u, bz + 1]])[0];
  out.grip = [onBar(-69.5), onBar(-72.5)];
  // The disc and its push pin: domed up while cold, snapped down when the steam has heated it.
  const D0 = C.DISC, dz = D0.z - 1.4 * S.snap;
  out.disc = K.solidSvg(cut([[D0.u - 0.7, onBar(D0.u)[1]], [D0.u + 0.7, onBar(D0.u)[1]], [D0.u + 0.7, dz], [D0.u - 0.7, dz]], -3.8, -2.2), { tone: "mid" }) +
    K.solidSvg(cut([[D0.u - D0.r, D0.z + 0.2], [D0.u - 2, dz - 0.3], [D0.u + 2, dz - 0.3], [D0.u + D0.r, D0.z + 0.2], [D0.u + D0.r, D0.z + 0.8], [D0.u - D0.r, D0.z + 0.8]], -5.4, -0.8), { tone: "hi" });
  // Crumb's boil-dry contacts: a leaf pressed up to its contact, pushed off it when that disc snaps.
  const drop = 1.6 * S.dry, bu0 = -41;
  out.plunger = K.solidSvg(cut([[bu0 - 0.8, 22 - drop], [bu0 + 0.8, 22 - drop], [bu0 + 0.8, 26.2], [bu0 - 0.8, 26.2]], -4.8, -2.2), { tone: "mid" }) + K.solidSvg(cut(rounded(bu0 - 2, bu0 + 2, 22 - drop, 23 - drop), -5.4, -1.6), { tone: "hi", lit: S.duty === "" && S.dry > 0.5 });
  // The leaf pivots on its anchor; past the plunger it carries a tab that Crumb holds.
  const zc = 21.5 - drop, zAt = (u) => 20.6 + ((zc - 20.6) * (u + 50)) / 9;
  out.leafTip = [-31.5, zAt(-31.5)];
  out.bdLeaf = K.solidSvg(cut([[-50, 20.1], [-50, 21.1], [-31, zAt(-31) + 0.5], [-31, zAt(-31) - 0.5]], -4.4, -1.6), { tone: "hi" });
  function rounded(u0, u1, z0, z1) { return [[u0, z0 + 0.4], [u0 + 0.4, z0], [u1 - 0.4, z0], [u1, z0 + 0.4], [u1, z1 - 0.4], [u1 - 0.4, z1], [u0 + 0.4, z1], [u0, z1 - 0.4]]; }
  // The water, the subject: a half cylinder from the plate up to its level, with bubbles on its cut face.
  const lvl = (S.g / C.AREA_CM2) / C.UNIT_CM, z0 = C.PLATE.z1, ring = [];
  for (let i = 0; i <= 48; i++) { const t = (i / 48) * Math.PI; ring.push(W([(C.BODY.r0 - 0.05) * Math.cos(t), -(C.BODY.r0 - 0.05) * Math.sin(t), 0]).slice(0, 2)); }
  // Below about a millimetre the film breaks up and pulls back into a puddle, so its radius shrinks with the mass.
  const film = 0.67, rr = lvl >= film ? 1 : Math.sqrt(lvl / film), pts = rr < 1 ? ring.map(([x, y]) => [x * rr + (1 - rr) * -25 * R2, y * rr + (1 - rr) * 25 * R2]) : ring;
  out.water = lvl > 0.02 ? K.solidSvg(K.extrude(pts, z0, Math.max(lvl, Math.min(film, lvl * 40)), P), { tone: "hi", crease: "none" }) : "";
  const bub = [], n = Math.round(70 * S.boil + 26 * S.fizz);
  for (let i = 0; i < n && lvl > 2; i++) {
    const h1 = (Math.sin(i * 12.9898) * 43758.5453) % 1, h2 = (Math.sin(i * 78.233) * 12543.1) % 1, sp = 0.5 + Math.abs(h2);
    const f = (Math.abs(h2) + S.clockB * sp * (i < 26 * S.fizz ? 0.25 : 1)) % 1, hz = i < 26 * S.fizz && S.boil < 0.5 ? f * Math.min(lvl, 6) : f * lvl;
    const p = at([Math.abs(h1) * 94 - 47, 0.1, z0 + 0.6 + Math.max(0, hz - 1.2)]);
    bub.push(`<circle class="kt-bubble" cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${(0.35 + 0.5 * Math.abs(h1 * h2) + 0.4 * S.boil * f).toFixed(2)}"/>`);
  }
  out.bubbles = bub.join("");
  return out;
}

export function poses(C, S, D) {
  const R2 = Math.SQRT1_2, W = ([u, w, z]) => [(u + w) * R2, (w - u) * R2, z];
  // Roo stands on the switch paddle: crouched while he holds it on, thrown up when it flips off.
  const [ru, rz] = D.paddle;
  const roo = {
    at: W([ru, -3, rz]), heading: 45 - 90, lean: S.stamp ? 14 : 3, look: [0, S.stamp ? -12 : 4],
    squash: S.stamp ? 0.35 : S.rock < 0.5 ? 0.12 : 0, hop: S.hop * 3,
    eyes: S.hop > 0.4 ? "wide" : "open",
  };
  // Volta lies along the live wire from the connector to the switch's leaf, snout on its terminal.
  const volta = {
    path: [[-57.6, -5, 14.2], [-50, -9, 14.2], [-38, -12.5, 14.2], [-22, -12.5, 14.2], [-8, -9, 14.2], [-1, -6, 14.2]].map(W),
    charge: S.current, flicker: S.current > 0 ? Math.floor(S.clockB * 14) : 0,
    target: S.current > 0 ? W([-58, -3, 16.5]) : undefined,
    eyes: S.current > 0 ? "open" : "shut",
  };
  // Mo hangs from the trip bar in the steam cup's draught; Crumb holds the boil-dry leaf up to its contact.
  const [g0, g1] = D.grip;
  const mo = {
    at: W([(g0[0] + g1[0]) / 2 + 0.6, -2.4, g0[1] - 19.3]), heading: 45 + 90, stance: "hang", lean: -2,
    look: [-10, S.asleep ? -16 : 10 + 6 * S.warm],
    paws: { l: W([g0[0], -3, g0[1] + 0.2]), r: W([g1[0], -3, g1[1] + 0.2]) },
    eyes: S.asleep ? "shut" : S.snap > 0.5 && S.warm > 0.6 && S.g > 100 ? "happy" : S.warm > 0.3 ? "wide" : "open", squash: S.asleep ? 0.06 + 0.05 * Math.sin(S.clockB * 1.6) : 0,
  };
  const [cu, cz] = D.leafTip;
  const crumb = {
    at: W([cu + 2.5, -1.5, 17]), heading: 100, lean: 12 + 16 * S.dry, look: [0, 16],
    paws: { l: W([cu - 0.6, -2.6, cz]), r: W([cu + 0.6, -2.6, cz]) },
    squash: 0.35 * S.dry, eyes: S.dry > 0.3 ? "wide" : S.plateT > 104 ? "wide" : "open",
  };
  return { roo, volta, mo, crumb };
}
