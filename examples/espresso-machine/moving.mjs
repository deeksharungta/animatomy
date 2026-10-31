// The parts that move, drawn from the model's state. Both functions are also serialized into the page,
// so they use only the K, C and S objects passed in.
export function dynamic(K, P, C, S) {
  const at = (p) => K.iso(p, P);
  const out = {};
  const [gx, gy] = C.G;
  const g = C.GAUGE, a = Math.PI * 1.25 - (Math.min(16, S.p) / 16) * Math.PI * 1.5;
  const tip = [g.x + (g.r - 1.2) * Math.cos(a), g.y + 2.6, g.z + (g.r - 1.2) * Math.sin(a)];
  const tail = [g.x - 2.6 * Math.cos(a), g.y + 2.6, g.z - 2.6 * Math.sin(a)];
  out.needle = K.lineSvg(K.segment(tail, tip, P), { tone: "hi", free: true }) + K.dotsSvg([at([g.x, g.y + 2.7, g.z])], { size: 1.1, tone: "hi" });
  const sw = C.SW, ang = sw.off + (sw.on - sw.off) * S.sw, d = [Math.sin(ang), 0, Math.cos(ang)];
  const lip = [sw.pivot[0] + sw.len * d[0], sw.pivot[1], sw.pivot[2] + sw.len * d[2]];
  const n8 = Array.from({ length: 10 }, (_, i) => [Math.cos(((i + 0.5) / 10) * Math.PI * 2), Math.sin(((i + 0.5) / 10) * Math.PI * 2)]);
  const lever = K.prismOf(K.frameOf(sw.pivot, d, [0, 1, 0], K.cross3(d, [0, 1, 0])), n8.map(([u, v]) => [u * 0.9, v * 0.9]), 0, sw.len, P);
  out.lever = K.solidSvg(lever, { tone: "hi", lit: S.duty === "" && S.sw > 0.5 }) + K.solidSvg(K.sphereOf(lip, 1.9, P, { steps: 20 }), { tone: "hi" });
  out.lip = lip;
  // The valve: the spring is squeezed as the water lifts the stem and Crumb's cap.
  const V = C.OPV, lift = S.lift * 2.2, z0 = V.z1 + 1 + lift, z1 = V.cage;
  const back = [], front = [];
  let run = [], near = null;
  for (let i = 0; i <= 72; i++) {
    const t = (i / 72) * 6 * Math.PI * 2, p = [V.x + 2.4 * Math.cos(t), V.y + 2.4 * Math.sin(t), z0 + (z1 - z0) * (i / 72)];
    const facing = Math.cos(t) * 0.7 + Math.sin(t) * 0.7 > 0;
    if (near === null) near = facing;
    if (facing !== near) { run.push(at(p)); (near ? front : back).push(K.pathOf(run)); run = [at(p)]; near = facing; continue; }
    run.push(at(p));
  }
  if (run.length > 1) (near ? front : back).push(K.pathOf(run));
  const stem = K.cylinder(V.x, V.y, 0.9, V.z1, z1 + 2.2 + lift - V.z1, P, 12);
  out.spring = K.lineSvg(back.join(""), { tone: "lo" }) + K.solidSvg(stem, { tone: "hi" }) + K.lineSvg(front.join(""), { tone: "mid" });
  out.cap = K.solidSvg(K.cylinder(V.x, V.y, 5, z1 + 2.2 + lift, 1.4, P, 32, 0.3), { tone: "hi", lit: S.duty === "" && S.lift > 0.5 });
  out.capTop = z1 + 3.6 + lift;
  // The coffee: two streams from the spouts and the espresso rising in the cup, crema on top.
  const z0c = C.TRAY_Z + 0.8 + 1.2, top = z0c + 0.6 + (C.CUP.h - 3.2) * Math.min(1, S.g / C.SHOT);
  out.coffee = S.g > 0.05 ? `<g class="es-crema"><path class="iso-top" d="${K.ring(gx, gy, C.CUP.r - 0.8, top, P, 40)}"/></g>` : "";
  const w = Math.min(0.55, S.flow * 0.4);
  const rim = C.TRAY_Z + 0.8 + C.CUP.h;
  const stream = (z0, z1) => (w > 0.04 ? `<g class="es-coffee">${[-2.6, 2.6].map((dx) => K.solidSvg(K.cylinder(gx + dx * (0.7 + 0.3 * Math.min(1, S.g / 4)), gy, w, z0, z1 - z0, P, 10), { tone: "hi", crease: "none" })).join("")}</g>` : "");
  // Below the rim a stream is inside the cup, so it is clipped to the opening with the coffee.
  out.streams = stream(rim, C.SPOUT_Z);
  out.streamsIn = stream(top, rim);
  return out;
}

export function poses(C, S) {
  const H = C.HANDLE, y = C.PUMP.y;
  const hx = H.x + C.STROKE * Math.sin(S.ph) * S.amp;
  const ollie = {
    at: [hx + 7.5, y + 1, C.FLOOR],
    heading: 180,
    lean: 9 + 3 * Math.cos(S.ph) * S.amp,
    look: [0, -4],
    paws: { l: [hx + H.r, y + 0.6, 13.5], r: [hx + H.r, y + 0.6, 16.5] },
    eyes: S.amp > 0.2 ? "open" : S.g >= C.SHOT ? "happy" : "open",
    squash: 0.12 * S.amp * (0.5 + 0.5 * Math.sin(S.ph)),
  };
  const sw = C.SW, ang = sw.off + (sw.on - sw.off) * S.sw;
  const lip = [sw.pivot[0] + sw.len * Math.sin(ang), sw.pivot[1], sw.pivot[2] + sw.len * Math.cos(ang)];
  const pressing = S.sw > 0.9;
  const ember = {
    at: [14, sw.pivot[1] + 0.5, C.BOIL.z1],
    heading: 185,
    lean: pressing ? 10 : -2,
    look: [-6, pressing ? 6 : 14],
    paws: pressing ? { l: [lip[0] + 1.6, lip[1] - 1, lip[2] + 0.6], r: [lip[0] + 1.6, lip[1] + 1, lip[2] + 1] } : {},
    eyes: S.T >= C.TSET - 0.5 && !pressing ? "happy" : "open",
  };
  const V = C.OPV;
  const crumb = {
    at: [V.x, V.y, C.OPV.cage + 3.6 + S.lift * 2.2],
    heading: 40,
    look: [0, S.lift > 0.3 ? 18 : 4],
    eyes: S.lift > 0.3 ? "wide" : S.p > 6 ? "open" : S.p < 0.2 && S.T < 40 ? "shut" : "open",
    squash: 0.2 * S.lift,
    tailSway: Math.sin(S.ph * 0.5) * 0.4 * S.lift,
  };
  return { ollie, ember, crumb };
}
