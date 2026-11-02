// The page script, part two: drawing the model, the steam layer, and the run.
export const RUN_SCRIPT = `
const stage = document.querySelector(".kt-stage");
const svgs = [...stage.querySelectorAll(":scope > svg")];
const part = (name) => stage.querySelector('[data-part="' + name + '"]');
const names = ["rocker", "link", "leaf", "spring", "bar", "disc", "plunger", "bdleaf", "water", "roo", "volta", "mo", "crumb"];
const el = Object.fromEntries(names.map((n) => [n, part(n)]));
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
let lastPose = {}, lastKey = {};
function paintCrew(name, spec, pose, duty) {
  const key = JSON.stringify(pose) + duty;
  if (lastPose[name] === key) return;
  lastPose[name] = key;
  CREW.paintCritter(el[name], CREW.critter(spec, pose, P));
  el[name].toggleAttribute("data-duty", duty);
}
const put = (name, html) => { if (lastKey[name] !== html) { lastKey[name] = html; el[name].innerHTML = html; } };
const steam = glLayer({ canvas: stage.querySelector(".kt-steam"), fragment: STEAM, view: SIZE, camera: CAMERA, uniforms: ["uSteam", "uHaze", "uLight", "uSpout", "uCup", "uCupAt"], maxRatio: 1.25 });
let view = [...VIEWS[0]];
function paintGL() {
  const light = stage.closest("[data-theme]")?.getAttribute("data-theme") === "light" ? 1 : 0;
  const cam = { uView: [view[2], view[3]], uOrigin: [CAMERA.origin[0] - view[0], CAMERA.origin[1] - view[1]] };
  const t = still.matches ? 0.5 : performance.now() / 1000;
  const plume = Math.min(1, S.steam / 0.9) * S.fade, haze = S.haze * S.fade, cup = S.T >= 99.9 ? Math.min(1, S.steam / 0.9) * S.warm * S.fade : 0;
  if (steam) plume + haze + cup > 0.004 ? steam.draw({ ...cam, uSteam: plume, uHaze: haze, uLight: light, uSpout: SPOUT, uCup: cup, uCupAt: CUP }, t) : steam.clear();
}
const mm = (s) => Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0");
function draw() {
  const D = dynamic(K, P, C, S);
  put("rocker", D.rocker); put("link", D.link); put("leaf", D.leaf); put("spring", D.spring); put("bar", D.bar);
  put("disc", D.disc); put("plunger", D.plunger); put("bdleaf", D.bdLeaf); put("water", D.water + D.bubbles);
  el.water.style.opacity = S.fade.toFixed(3);
  const p = poses(C, S, D);
  paintCrew("roo", ROO, p.roo, S.duty === "roo");
  paintCrew("volta", VOLTA, p.volta, S.duty === "volta");
  paintCrew("mo", MO, p.mo, S.duty === "mo");
  paintCrew("crumb", CRUMB, p.crumb, S.duty === "crumb");
  paintGL();
  const on = S.rock < 0.5;
  const word = S.swap >= 0 ? "refilled" : S.bdOpen && on ? "cut out" : !on ? (S.g < 15 ? "off · boiled dry" : S.T > 95 ? "off · boiled" : "off") : S.g < 15 ? "boiling dry" : S.T >= 99.9 ? "boiling" : "heating";
  const dry = beat >= 6;
  const text = word + " · " + Math.round(S.T) + " °C · " + Math.round(S.g) + " g" + (dry ? " · plate " + Math.round(S.plateT) + " °C" : "") + (S.clock > 0 ? " · " + mm(S.clock) : "");
  if (readout.textContent !== text) readout.textContent = text;
}
const DONE = [
  () => S.swap < 0 && S.stepT > 0.3,
  () => S.rock < 0.01 && S.current > 0.97,
  () => S.T >= 99.9,
  () => S.snapped && S.snap > 0.9,
  () => S.rock > 0.98 && S.current < 0.02 && S.stepT > 0.6,
  () => S.T >= 99.9 && S.Td >= C.SNAP + 3,
  () => S.g < 15,
  () => S.bdOpen && S.dry > 0.97 && S.current < 0.02,
  () => S.rock > 0.98 && S.stepT > 1.2,
];
function enter(i, how) {
  beat = i;
  if (i === 0) {
    const keep = { g: S.g, T: S.T, plateT: S.plateT, Td: S.Td, lost: S.lost, clock: S.clock, haze: S.haze, snap: S.snap, dry: S.dry, clockB: S.clockB };
    Object.assign(S, { ...REST, ...(how === "loop" ? keep : {}), swap: how === "loop" ? 0 : -1 });
    if (how === "loop") S.snapped = S.snap > 0.5; else S.clockB = 0;
  }
  if (i === 1 || i === 5) { S.want = 0; S.stamp = true; }
  if (i === 2) S.stamp = false;
  // Ten minutes go by between the two boils: the water cools a little and Mo's disc resets.
  if (i === 5) {
    const t = 600, f = Math.exp(-t / C.COOL_TAU);
    Object.assign(S, { T: C.T0 + (S.T - C.T0) * f, plateT: C.T0 + (S.T - C.T0) * f, Td: 25, snapped: false, asleep: true, clock: 0, lost: 0 });
  }
  if (i === 6) S.stamp = false;
  if (i === 8) S.asleep = false;
  S.stepT = 0;
  lastPose = {};
  draw();
}
STEPS.mountSteps({
  root: document.querySelector("[data-steps]"),
  svg: svgs,
  stage,
  steps: STEP_INFO,
  views: VIEWS,
  colors: COLORS,
  size: SIZE,
  enter,
  update: (dt) => { step(dt); draw(); },
  done: (i) => DONE[i](),
  advance: step,
  draw,
  save: () => JSON.parse(JSON.stringify({ S, beat })),
  load: (x) => { Object.assign(S, JSON.parse(JSON.stringify(x.S))); beat = x.beat; lastPose = {}; lastKey = {}; },
  onView: (v) => { view = v; paintGL(); },
});
`;
