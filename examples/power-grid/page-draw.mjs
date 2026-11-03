// The page script, part two: drawing the model, the glow layer and its SVG fallback, and the readout.
export const DRAW_SCRIPT = `
const stage = document.querySelector(".pg-stage");
const svgs = [...stage.querySelectorAll(":scope > svg")];
const part = (name) => stage.querySelector('[data-part="' + name + '"]');
const NAMES = ["lp", "cpl", "rotor", "wheel", "fans", "cross", "spindle", "cb-lever", "cb-spring", "cb-link", "contacts", "flag", "blade0", "blade1", "blade2", "cranks", "disc", "bolt", "bolt-top", "dials", "fb-lamps", "fb-sf", "fb-air"];
const el = Object.fromEntries(NAMES.map((n) => [n, part(n)]));
const CREW_NAMES = ["ollie", "volta", "bun", "mochi", "roo", "pinch"];
const crewEl = Object.fromEntries(CREW_NAMES.map((n) => [n, part(n)]));
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const cache = {};
const put = (name, html) => { if (cache[name] !== html) { cache[name] = html; el[name].innerHTML = html; } };
let lastPose = {};
function paintCrew(name, pose, duty) {
  const key = JSON.stringify(pose) + duty;
  if (lastPose[name] === key) return;
  lastPose[name] = key;
  CREW.paintCritter(crewEl[name], CREW.critter(CREW_SPEC[name], pose, P));
  CREW.setDuty(crewEl[name], duty);
}
const UNI = ["uLamp", "uSF", "uAir", "uHeat", "uOpen", "uGapX", "uGap", "uLight", "uCur", "uCurPh"];
const glow = glLayer({ canvas: stage.querySelector(".pg-arcs"), fragment: GLOW, view: SIZE, camera: CAMERA, uniforms: UNI, maxRatio: 1.5 });
const lamps = glLayer({ canvas: stage.querySelector(".pg-lamps"), fragment: GLOW, view: SIZE, camera: CAMERA, uniforms: UNI, maxRatio: 1.5 });
if (glow) stage.setAttribute("data-gl", "");
let view = [...VIEWS[0]], glT = performance.now();
const env = { lamp: 0, sf: 0, air: 0, heat: 0 };
const follow = (k, to, up, down, dt) => { env[k] = still.matches ? to : env[k] + (to - env[k]) * (1 - Math.exp(-dt / (to > env[k] ? up : down))); if (env[k] < 1e-3 && to === 0) env[k] = 0; };
function lampLevel() {
  if (S.closed || S.E < 0.02) return 0;
  const v = Math.hypot(S.E * Math.cos(S.phi) - 1, S.E * Math.sin(S.phi));
  return Math.min(1, (v / 2) ** 1.5);
}
let gapX = 176, gapW = 0;
function paintGL() {
  const now = performance.now(), dt = Math.min(0.1, (now - glT) / 1000);
  glT = now;
  follow("lamp", lampLevel(), 0.06, 0.1, dt);
  follow("sf", S.arcSF, 0.02, 0.06, dt);
  follow("air", S.airOn ? 0.35 + 0.65 * S.arcAir : 0, 0.02, 0.08, dt);
  follow("heat", S.airOn ? 1 : 0, 0.3, 2.5, dt);
  const light = stage.closest("[data-theme]")?.getAttribute("data-theme") === "light" ? 1 : 0;
  const t = still.matches ? 0.8 : now / 1000;
  const cam = { uView: [view[2], view[3]], uOrigin: [CAMERA.origin[0] - view[0], CAMERA.origin[1] - view[1]], uOpen: S.ds * C.OPEN, uGapX: gapX, uGap: Math.max(0.2, gapW), uLight: light };
  paintFlows(dt, cam, t);
  if (glow) env.sf + env.air + env.heat + fenv.cur > 0.002 ? glow.draw({ ...cam, uLamp: 0, uSF: env.sf, uAir: env.air, uHeat: env.heat, uCur: fenv.cur, uCurPh: ph.cur }, t) : glow.clear();
  if (lamps) env.lamp > 0.002 ? lamps.draw({ ...cam, uLamp: env.lamp, uSF: 0, uAir: 0, uHeat: 0, uCur: 0, uCurPh: 0 }, t) : lamps.clear();
}
const ampsHV = () => (S.synced || S.sfOn ? (Math.hypot(S.P, S.Q) * 1e6) / (Math.sqrt(3) * C.HV_KV * 1e3) : 0);
function words() {
  const w = S.airOn ? "arc" : S.sfOn ? "SF6 arc" : S.synced ? "on grid" : S.closed ? "closed" : S.f < 0.5 ? "at rest" : S.E > 0.5 ? "excited" : "running";
  const k = S.warp > 1.01 ? " · ×" + Math.round(S.warp) : S.warp < 0.99 ? " · ×1/" + Math.round(1 / S.warp) : S.heat > 1.5 ? " · ×" + Math.round(S.heat) : "";
  const kv = S.synced ? C.HV_KV : S.E * C.HV_KV;
  return w + " · " + Math.round(S.f * 60).toLocaleString("en-GB") + " rpm · " + Math.round(kv) + " kV · " + Math.round(S.P) + " MW · " + Math.round(ampsHV()) + " A · " + Math.round(S.top) + " °C" + k;
}
function draw() {
  const Sp = spinning(K, P, C, S, T), V = valveLive(K, P, C, S, T), B = breakerLive(K, P, C, S, T), I = isolatorLive(K, P, C, S, T);
  put("lp", Sp.lp); put("cpl", Sp.cpl); put("rotor", Sp.rotor); put("wheel", Sp.wheel); put("fans", Sp.fans);
  put("cross", V.cross); put("spindle", V.spindle);
  put("cb-lever", B.lever); put("cb-spring", B.spring); put("cb-link", B.link); put("contacts", B.contacts); put("flag", B.flag);
  I.blades.forEach((b, i) => put("blade" + i, b));
  put("cranks", I.cranks); put("disc", I.disc); put("bolt", I.bolt); put("bolt-top", I.boltTop);
  put("dials", dials(K, P, C, S, T));
  gapX = B.gapX; gapW = B.gap;
  const p = poses(C, S, V, B, I);
  for (const n of CREW_NAMES) paintCrew(n, p[n], S.duty === n || (S.duty === "squad" && (n === "bun" || n === "mochi")));
  // Without WebGL the same light is drawn in SVG: lamp tints, a violet column in the window, the air arcs.
  const lv = lampLevel();
  put("fb-lamps", LAMP_PTS.map((q) => '<circle class="pg-fb-lamp" cx="' + q[0] + '" cy="' + q[1] + '" r="1.8" style="opacity:' + lv.toFixed(2) + '"/>').join(""));
  const w = K.iso([B.gapX, C.PH[2], C.STAND + 40], P);
  put("fb-sf", S.sfOn ? '<ellipse class="pg-fb-arc" cx="' + w[0].toFixed(1) + '" cy="' + w[1].toFixed(1) + '" rx="' + (1 + B.gap * 0.6).toFixed(2) + '" ry="' + (0.6 + 0.6 * S.arcSF).toFixed(2) + '"/>' : "");
  put("fb-air", S.airOn ? I.tips.map((tp) => { const j = [C.DS.jaw, tp[1], C.DS.z + 2], m = [(j[0] + tp[0]) / 2, tp[1], (j[2] + tp[2]) / 2 + 3]; const jj = K.iso(j, P); return '<circle class="pg-fb-arc" cx="' + jj[0].toFixed(1) + '" cy="' + jj[1].toFixed(1) + '" r="' + (2 + 2 * S.arcAir).toFixed(2) + '" style="opacity:.45"/><path class="pg-fb-air" d="' + K.pathOf([j, m, tp].map((q) => K.iso(q, P))) + '" style="stroke-width:' + (1.4 + 1.6 * S.arcAir).toFixed(2) + '"/>'; }).join("") : "");
  stage.dataset.phase = Math.round((S.phi * 180) / Math.PI);
  stage.dataset.breaker = S.closed ? "closed" : "open";
  stage.dataset.blade = S.ds.toFixed(2);
  stage.dataset.oil = S.top.toFixed(1);
  const text = words();
  if (readout.textContent !== text) readout.textContent = text;
  paintGL();
}
`;
