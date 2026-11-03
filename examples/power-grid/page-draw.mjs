// The page script, part two: drawing the model, the glow layer and its SVG fallback, and the readout.
export const DRAW_SCRIPT = `
const stage = document.querySelector(".pg-stage");
const svgs = [...stage.querySelectorAll(":scope > svg")];
const part = (name) => stage.querySelector('[data-part="' + name + '"]');
const NAMES = ["gov", "lever-back", "lever", "cpl", "poles", "cb-spring", "cb-rods", "cb-lever", "contacts", "flags", "blade0", "blade1", "blade2", "cranks", "coupling", "disc", "bolt", "bolt-top", "crank", "pointer", "meters", "field", "fb-lamps", "fb-vac", "fb-air"];
const el = Object.fromEntries(NAMES.map((n) => [n, part(n)]));
const crewEl = Object.fromEntries(["mo", "volta", "crumb", "roo", "pinch"].map((n) => [n, part(n)]));
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
  crewEl[name].toggleAttribute("data-duty", duty);
}
const glow = glLayer({ canvas: stage.querySelector(".pg-arcs"), fragment: GLOW, view: SIZE, camera: CAMERA, uniforms: ["uLamp", "uVac", "uAir", "uOpen", "uGapZ", "uGap", "uLight"], maxRatio: 1.5 });
const lamps = glLayer({ canvas: stage.querySelector(".pg-lamps"), fragment: GLOW, view: SIZE, camera: CAMERA, uniforms: ["uLamp", "uVac", "uAir", "uOpen", "uGapZ", "uGap", "uLight"], maxRatio: 1.5 });
if (glow) stage.setAttribute("data-gl", "");
let view = [...VIEWS[0]], glT = performance.now();
const env = { lamp: 0, vac: 0, air: 0 };
const follow = (k, to, up, down, dt) => { env[k] = still.matches ? to : env[k] + (to - env[k]) * (1 - Math.exp(-dt / (to > env[k] ? up : down))); if (env[k] < 1e-3 && to === 0) env[k] = 0; };
function lampLevel() {
  if (S.closed || S.E < 0.02) return 0;
  const bus = S.ds < 0.002 ? 1 : 0, v = Math.hypot(S.E * Math.cos(S.phi) - bus, S.E * Math.sin(S.phi));
  return Math.min(1, (v / 2) ** 1.5);
}
let gap = { z: 83, g: 0 };
function paintGL() {
  const now = performance.now(), dt = Math.min(0.1, (now - glT) / 1000);
  glT = now;
  follow("lamp", lampLevel(), 0.06, 0.1, dt);
  follow("vac", S.arcVac, 0.02, 0.06, dt);
  follow("air", S.airOn ? 0.35 + 0.65 * S.arcAir : 0, 0.02, 0.08, dt);
  const light = stage.closest("[data-theme]")?.getAttribute("data-theme") === "light" ? 1 : 0;
  const t = still.matches ? 0.8 : now / 1000;
  // Two canvases: the arcs between the switchgear and what stands in front of it, the lamps over the desk.
  const cam = { uView: [view[2], view[3]], uOrigin: [CAMERA.origin[0] - view[0], CAMERA.origin[1] - view[1]], uOpen: S.ds * C.OPEN, uGapZ: gap.z, uGap: Math.max(0.15, gap.g), uLight: light };
  if (glow) env.vac + env.air > 0.002 ? glow.draw({ ...cam, uLamp: 0, uVac: env.vac, uAir: env.air }, t) : glow.clear();
  if (lamps) env.lamp > 0.002 ? lamps.draw({ ...cam, uLamp: env.lamp, uVac: 0, uAir: 0 }, t) : lamps.clear();
  return env.lamp + env.vac + env.air > 0.002;
}
const amps = () => (S.synced || S.vacOn ? Math.hypot(S.P, S.Q) * 1e6 / (Math.sqrt(3) * C.GRID_KV * 1e3) : 0);
function words() {
  const w = S.airOn ? "arc at the blades" : S.vacOn ? "vacuum arc" : S.synced ? "on grid" : S.closed ? "breaker closed" : S.f < 0.5 ? "at rest" : S.E > 0.5 ? "excited" : "running";
  const tag = S.warp > 1.01 ? " · ×" + Math.round(S.warp) : S.warp < 0.99 ? " · ×1/" + Math.round(1 / S.warp) : "";
  return w + " · " + Math.round(S.f * 30) + " rpm · " + (S.synced ? C.GRID_KV : S.E * C.GRID_KV).toFixed(1) + " kV · " + S.P.toFixed(1) + " MW · " + Math.round(amps()) + " A" + tag;
}
function draw() {
  const G = governor(K, P, C, S, T), Sp = spinning(K, P, C, S, T), B = breaker(K, P, C, S, T), I = isolator(K, P, C, S, T), N = instruments(K, P, C, S, T);
  put("gov", G.gov); put("lever-back", G.leverBack); put("lever", G.lever);
  put("cpl", Sp.bolts); put("poles", Sp.poles);
  put("cb-spring", B.spring); put("cb-rods", B.rods); put("cb-lever", B.lever); put("contacts", B.contacts); put("flags", B.flags);
  I.blades.forEach((b, i) => put("blade" + i, b));
  put("cranks", I.cranks); put("coupling", I.coupling); put("disc", I.disc); put("bolt", I.bolt); put("bolt-top", I.boltTop); put("crank", I.crank);
  put("pointer", N.pointer); put("meters", N.meters); put("field", N.field);
  gap = { z: B.gapZ, g: 1.1 * (1 - S.cb) };
  const p = poses(C, S, G, B, I, N);
  for (const n of ["mo", "volta", "crumb", "roo", "pinch"]) paintCrew(n, p[n], S.duty === n);
  // Without WebGL the same light is drawn in SVG: lamp tints, a violet column in the window, the air arcs.
  const lv = lampLevel();
  put("fb-lamps", LAMP_PTS.map((q) => '<circle class="pg-fb-lamp" cx="' + q[0] + '" cy="' + q[1] + '" r="2.2" style="opacity:' + lv.toFixed(2) + '"/>').join(""));
  const w = K.iso([C.CUT, C.BOT.y, B.gapZ], P);
  put("fb-vac", S.vacOn ? '<ellipse class="pg-fb-arc" cx="' + w[0].toFixed(1) + '" cy="' + w[1].toFixed(1) + '" rx="2.6" ry="' + (0.8 + S.arcVac).toFixed(2) + '"/>' : "");
  put("fb-air", S.airOn ? I.tips.map((tp) => { const j = [tp[0], C.DS.jy, C.DS.z + 4.5], m = [tp[0], (j[1] + tp[1]) / 2, (j[2] + tp[2]) / 2 + 1.5]; const jj = K.iso(j, P); return '<circle class="pg-fb-arc" cx="' + jj[0].toFixed(1) + '" cy="' + jj[1].toFixed(1) + '" r="' + (2 + 2 * S.arcAir).toFixed(2) + '" style="opacity:.45"/><path class="pg-fb-air" d="' + K.pathOf([j, m, tp].map((q) => K.iso(q, P))) + '" style="stroke-width:' + (1.4 + 1.6 * S.arcAir).toFixed(2) + '"/>'; }).join("") : "");
  stage.dataset.phase = Math.round((S.phi * 180) / Math.PI);
  stage.dataset.breaker = S.closed ? "closed" : "open";
  stage.dataset.blade = S.ds.toFixed(2);
  const text = words();
  if (readout.textContent !== text) readout.textContent = text;
  paintGL();
}
`;
