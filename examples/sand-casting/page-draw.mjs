// The page script, part two: drawing the model into the SVG layers and the steel's light into the canvas.
export const DRAW_SCRIPT = `
const stage = document.querySelector(".sc-stage");
const svgs = [...stage.querySelectorAll(":scope > svg")];
const part = (name) => stage.querySelector('[data-part="' + name + '"]');
const el = { steel: part("steel").firstElementChild, hot: part("hot").firstElementChild, lb: part("ladle-back"), body: part("ladle-body"), lf: part("ladle-front"), ropes: part("ropes"), fb: part("stream-fb"), ollie: part("ollie"), pinch: part("pinch"), spill: part("spill-fb") };
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const LIGHT = stage.closest("[data-theme]")?.getAttribute("data-theme") === "light" ? 1 : 0;
const glow = glLayer({ canvas: stage.querySelector(".sc-gl"), fragment: GLOW, view: SIZE, camera: CAMERA, uniforms: ["uFill", "uFill2", "uTemp", "uFrz", "uS", "uFlow", "uSpill", "uPipe"], fixed: { uLight: LIGHT }, maxRatio: 1.5 });
if (glow) stage.setAttribute("data-gl", "");
let view = [...VIEWS[0]], lastPose = {}, cache = {};
function rampOf(T) {
  let c = INK_STOPS[0][1];
  for (let i = 1; i < INK_STOPS.length; i++) { const [t0] = INK_STOPS[i - 1], [t1, c1] = INK_STOPS[i]; const u = smooth(t0, t1, T); c = c.map((v, j) => v + (c1[j] - v) * u); }
  return c;
}
// The no-WebGL steel: one colour from the same table, its opacity opening as the glow does.
function hotCss(T) {
  const c = rampOf(LIGHT ? T - 180 * smooth(900, 1300, T) : T).map((v) => Math.round(v * 255)), a = smooth(560, 820, T);
  return "fill:rgb(" + c.join(",") + ");opacity:" + (a * (LIGHT ? 0.92 : 1)).toFixed(3);
}
// The stream falls from the lip as a jet: its speed over the lip from the head, then free fall to what it lands on.
function streamOf(lip, F) {
  if (S.q < 0.02) return null;
  const g = PH.G / (C.MM / 1000), v0 = 0.8 * Math.sqrt(PH.G * Math.max(0.002, headOver(C, PH, S.ml, S.th))) / (C.MM / 1000);
  const dx = (x) => Math.abs(x - C.SPRUE.x);
  const land = (x) => (dx(x) < C.BASIN.r ? Math.max(F.basin, C.BASIN.z0) : dx(x) < C.CUP.rim ? C.Z.cup : x > C.FL.x0 - C.FL.t ? C.Z.top : 0);
  let t1 = 0.01;
  while (t1 < 2 && lip[2] - 0.5 * g * t1 * t1 > land(lip[0] + v0 * t1)) t1 += 0.002;
  const pts = [];
  for (let i = 0; i < 12; i++) {
    const t = (t1 * i) / 11, v = Math.hypot(v0, g * t) * (C.MM / 1000);
    const r = Math.sqrt(S.q / (PH.RHO * Math.PI * Math.max(v, 0.3))) / (C.MM / 1000);
    const p = K.iso([lip[0] + v0 * t, 0, lip[2] - 0.5 * g * t * t], P);
    pts.push([p[0], p[1], r * P.scale]);
  }
  return pts;
}
function streamFallback(pts) {
  if (!pts) return "";
  const L = [], R = [];
  pts.forEach((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], n = Math.hypot(dx, dy) || 1;
    L.push([p[0] - (dy / n) * p[2], p[1] + (dx / n) * p[2]]); R.unshift([p[0] + (dy / n) * p[2], p[1] - (dx / n) * p[2]]);
  });
  return '<path class="sc-hot" style="' + hotCss(S.Tl) + '" d="' + K.pathOf(L.concat(R), true) + '"/>';
}
let stream = null;
// The spilt sheet, 5 mm thick, running off the cup and spreading over the cope's top round it; and its
// no-WebGL drawing, kept to the cope's top and drawn under the cup.
const spillR = () => (S.spill > 0.01 ? Math.min(40, C.CUP.r + Math.sqrt(S.spill / PH.RHO / 0.005 / Math.PI) / (C.MM / 1000)) : 0);
function spillFallback() {
  const r = spillR();
  if (!r) return "";
  const pts = [];
  for (let i = 0; i < 40; i++) { const t = (i / 40) * Math.PI * 2; pts.push(K.iso([Math.max(C.FL.x0, Math.min(C.FL.x1, C.SPRUE.x + r * Math.cos(t))), Math.max(C.FL.y0, Math.min(0, r * Math.sin(t))), C.Z.top], P)); }
  return '<path class="sc-hot" style="' + hotCss(S.spillT) + '" d="' + K.pathOf(pts, true) + '"/>';
}
function paintGL() {
  if (!glow) return;
  const F = cache.F;
  if (!F || (F.has <= 0 && F.basin <= C.BASIN.z0 + 0.01 && !stream && !S.spill) || (S.Tc < 560 && S.spillT < 560)) { glow.clear(); return; }
  const cam = { uView: [view[2], view[3]], uOrigin: [CAMERA.origin[0] - view[0], CAMERA.origin[1] - view[1]] };
  const s = new Float32Array(36);
  if (stream) stream.forEach((p, i) => { s[i * 3] = p[0] - view[0]; s[i * 3 + 1] = p[1] - view[1]; s[i * 3 + 2] = p[2]; });
  glow.draw({ ...cam, uFill: [F.front, F.runZ, F.gate, F.cast], uFill2: [F.riser, F.basin, F.sprue, F.has], uTemp: [S.Tc, S.Tr, S.Tg, S.Tl], uFrz: [S.fsC, S.fsR, S.fsG, S.fade], uS: s, uFlow: stream ? smooth(0, 0.3, S.q) : 0, uSpill: [spillR(), S.spillT], uPipe: [F.pipe, F.rl] }, still.matches ? 0.5 : performance.now() / 1000);
}
function paintCrew(name, node, spec, pose, duty) {
  const key = JSON.stringify(pose) + duty;
  if (lastPose[name] === key) return;
  lastPose[name] = key;
  CREW.paintCritter(node, CREW.critter(spec, pose, P));
  CREW.setDuty(node, duty);
}
let pipePrev = 0, thPrev = 0;
function draw() {
  const F = fillOf(C, GEO, S, levelZ);
  cache.F = F;
  const d = steelPath(K, P, C, F);
  if (cache.d !== d) { cache.d = d; el.steel.setAttribute("d", d); el.hot.setAttribute("d", d); }
  el.hot.setAttribute("style", hotCss(S.Tc));
  part("steel").style.opacity = S.fade.toFixed(3);
  part("hot").style.opacity = S.fade.toFixed(3);
  const key = S.th.toFixed(2) + "," + S.hook.toFixed(2);
  const turning = Math.abs(S.th - thPrev) > 0.01;
  thPrev = S.th;
  if (cache.ladle !== key) {
    cache.ladle = key;
    const Ld = ladle(K, P, C, S);
    cache.lip = Ld.lip;
    el.lb.innerHTML = Ld.back; el.body.innerHTML = Ld.body; el.lf.innerHTML = Ld.front; el.ropes.innerHTML = Ld.ropes;
    el.mouth = el.body.querySelector(".sc-mouth");
  }
  // The steel in the ladle shows hot through the spout's mouth.
  if (el.mouth) el.mouth.setAttribute("style", hotCss(S.Tl).replace(/opacity:[0-9.]+/, "opacity:1"));
  stream = S.fade > 0.99 ? streamOf(cache.lip, F) : null;
  el.fb.innerHTML = streamFallback(stream);
  el.spill.innerHTML = spillFallback();
  // On duty: Ollie while the pipe deepens (he is pressing the feed down), Pinch while the lift climbs.
  const feeding = F.pipe > pipePrev + 1e-5 && S.tc > 3 && beat >= 7;
  pipePrev = F.pipe;
  const p = poses(C, S, F, GEO);
  const duty = feeding ? "ollie" : S.liftV > 1.5 && S.tc < 0 && F.riser > C.CAST.z1 ? "pinch" : "";
  paintCrew("ollie", el.ollie, OLLIE, p.ollie, duty === "ollie");
  paintCrew("pinch", el.pinch, PINCH, p.pinch, duty === "pinch");
  el.lf.querySelector(".sc-rim")?.toggleAttribute("data-lit", !duty && turning);
  paintGL();
  const pct = Math.round((S.vm / GEO.vMould) * 100);
  const hb = S.vb / GEO.aBasin;
  const word = S.swap >= 0 ? "a fresh mould" : S.short ? "frozen short" : hb >= GEO.hBasin - 1e-4 && S.q > S.qo ? "overflowing" : S.q > 0.02 ? "pouring" : S.tc < 0 ? (S.vm > 0 ? "filling" : "ready") : S.fsC < 1 ? "freezing" : "solid";
  const text = S.tc < 0 || S.q > 0.02
    ? word + " · " + S.q.toFixed(1) + " kg/s · " + (S.lift > 60 && S.tc < 0 ? "lift " + Math.round(S.lift) + " N" : Math.round(S.tc < 0 && S.vm > 0 ? S.Tm : S.Tl) + " °C") + " · " + pct + "%" + (S.spill > 0.05 ? " · spilt " + S.spill.toFixed(1) + " kg" : "")
    : word + " · " + Math.round(S.Tc) + " °C · " + Math.round(S.fsC * 100) + "% solid · " + Math.floor(S.tc / 60) + ":" + String(Math.floor(S.tc % 60)).padStart(2, "0");
  if (readout.textContent !== text) readout.textContent = text;
}
`;
