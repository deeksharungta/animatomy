import { WIDTH, HEIGHT } from "./model.mjs";

// The page script, part three: the run, and the reader taking the handwheel.
export const RUN_SCRIPT = `
const DONE = [
  () => S.swap < 0 && S.stepT > 0.3,
  () => S.qo > 0.5 && S.q > PH.QSTAR * 0.85 && S.stepT > 2,
  () => cache.F && cache.F.cast > C.CAST.z0 + 0.6,
  () => cache.F && cache.F.cast >= C.CAST.z1,
  () => S.tc >= 0,
  () => S.th < 0.3 && S.stepT > 0.6,
  () => S.fsG >= 1,
  () => S.fsC >= 1,
  () => S.tc >= GEO.tsCast + 3600,
];
function enter(i, how) {
  beat = i;
  S.manual = false;
  if (i === 0 && how === "loop") S.swap = 0;
  if (i === 0 && how !== "loop") Object.assign(S, fresh(PH), { swap: -1, fade: 1 });
  if (i >= 1 && i <= 4 && S.tc < 0 && !S.short) S.mode = "pour";
  S.stepT = 0;
  lastPose = {};
  draw();
}
const run = STEPS.mountSteps({
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
  advance: (dt) => { step(dt); cache.F = fillOf(C, GEO, S, levelZ); },
  draw,
  save: () => JSON.parse(JSON.stringify({ S, beat })),
  load: (x) => { Object.assign(S, JSON.parse(JSON.stringify(x.S))); beat = x.beat; lastPose = {}; cache = {}; },
  onView: (v) => { view = v; paintGL(); },
});
// Take the handwheel: drag the ladle, or press left and right, to set the tilt yourself. The run pauses, the
// camera pulls back, and the model runs on at your tilt: too slow and the steel freezes short, too fast and the
// basin overflows onto the cope. Space plays on from the beat it left, with the mould as you left it.
const said = document.querySelector("[data-said]");
let taken = false, dragging = false, onScreen = false, idleFrame = 0, idleT = 0, grab = null;
function idle(now) {
  idleFrame = 0;
  if (run.playing || !onScreen) return;
  const dt = idleT ? Math.min(1 / 30, (now - idleT) / 1000) : 1 / 60;
  idleT = now;
  step(dt, S.tc < 0 ? 1 : 20);
  draw();
  idleFrame = requestAnimationFrame(idle);
}
function idleStart() { if (!idleFrame) { idleT = 0; idleFrame = requestAnimationFrame(idle); } }
new IntersectionObserver((entries) => { onScreen = entries[entries.length - 1].isIntersecting; if (onScreen && taken) idleStart(); }).observe(stage);
function take() {
  if (run.playing) run.toggle();
  run.aim([0, 0, ${WIDTH}, ${HEIGHT}]);
  if (S.swap >= 0) Object.assign(S, fresh(PH), { swap: -1, fade: 1 });
  S.manual = true;
  taken = true;
  idleStart();
}
const tell = () => { said.textContent = "Ladle tipped " + Math.round(S.thT) + " degrees, pouring " + flowOf(C, PH, S.ml, S.thT).toFixed(1) + " kilograms a second"; };
function pointAt(e) {
  const box = svgs[0].getBoundingClientRect(), vb = svgs[0].viewBox.baseVal;
  return [vb.x + ((e.clientX - box.left) / box.width) * vb.width, vb.y + ((e.clientY - box.top) / box.height) * vb.height];
}
stage.addEventListener("pointerdown", (e) => {
  const q = pointAt(e), c = K.iso([C.LADLE.x, 0, S.hook], P);
  if (Math.hypot(q[0] - c[0], q[1] - c[1]) > 46) return;
  dragging = true;
  stage.setPointerCapture(e.pointerId);
  stage.setAttribute("data-grab", "");
  take();
  grab = { x: q[0], y: q[1], th: S.thT };
});
stage.addEventListener("pointermove", (e) => {
  if (!dragging) return;
  const q = pointAt(e);
  S.thT = Math.max(0, Math.min(95, grab.th + (q[0] - grab.x) * 0.9 + (q[1] - grab.y) * 0.5));
});
for (const type of ["pointerup", "pointercancel"]) stage.addEventListener(type, () => { if (dragging) tell(); dragging = false; stage.removeAttribute("data-grab"); });
stage.addEventListener("keydown", (e) => {
  if (e.key === " " && run.playing && taken) {
    // The run's own Space handler has just resumed it: replay this beat from the mould as the reader left it.
    // A mould that froze short is scrap: the run starts a fresh one. Otherwise it plays on from the beat
    // that matches the mould as the reader left it.
    taken = false;
    S.manual = false;
    const F = fillOf(C, GEO, S, levelZ);
    const at = S.short ? 0 : S.tc < 0 ? (S.vm <= 0 ? (S.th > 0.3 ? 1 : run.index) : F.cast <= C.CAST.z0 + 0.6 ? 2 : F.cast < C.CAST.z1 ? 3 : 4) : S.th > 0.3 ? 5 : S.fsG < 1 ? 6 : S.fsC < 1 ? 7 : 8;
    run.go(at);
  } else if (e.key === "Home") { taken = false; S.manual = false; }
  else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    e.preventDefault();
    if (!taken) { take(); S.thT = S.th; }
    S.thT = Math.max(0, Math.min(95, S.thT + (e.key === "ArrowRight" ? 1 : -1) * (e.shiftKey ? 10 : 3)));
    tell();
  }
});
`;
