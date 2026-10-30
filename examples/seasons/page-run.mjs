import { WIDTH, HEIGHT } from "./model.mjs";
import { RK } from "./scene.mjs";

// The page script, part two: the run, and the reader taking it over.
export const RUN_SCRIPT = `const run = STEPS.mountSteps({
  root: document.querySelector("[data-steps]"),
  svg: svgs,
  stage,
  steps: STEP_INFO,
  views: VIEWS,
  colors: COLORS,
  size: [${WIDTH}, ${HEIGHT}],
  enter,
  update: (dt) => { step(dt); draw(); },
  done: (i) => DONE[i](),
  advance: step,
  draw,
  save: () => JSON.parse(JSON.stringify(S)),
  load: (x) => { Object.assign(S, JSON.parse(JSON.stringify(x))); lastPose = {}; draw(); },
  onView: (v) => { view = v; paintGL(); },
});
// Drag the globe round the lamp, or use the arrow keys, to set any date. The run pauses, the camera pulls back
// to the whole machine and the globe keeps turning; Space replays the beat it left, from the date set.
const said = document.querySelector("[data-said]");
let scrubbed = false, dragging = false, onScreen = false, idleFrame = 0, spinT = 0;
function idle(now) {
  idleFrame = 0;
  if (run.playing || !onScreen || still.matches) return;
  if (!dragging && spinT) { S.spin += C.SPIN * Math.min(0.05, (now - spinT) / 1000); draw(); }
  spinT = now;
  idleFrame = requestAnimationFrame(idle);
}
function idleStart() { if (!idleFrame) { spinT = 0; idleFrame = requestAnimationFrame(idle); } }
new IntersectionObserver((entries) => { onScreen = entries[entries.length - 1].isIntersecting; if (onScreen) idleStart(); }).observe(stage);
function setDay(day) {
  if (run.playing) run.toggle();
  run.aim([0, 0, ${WIDTH}, ${HEIGHT}]);
  Object.assign(S, { day: (((day - 1) % 365) + 365) % 365 + 1, lamp: 1, lampT: 1, turning: true, lock: false, walk: false, duty: "" });
  S.target = S.day;
  scrubbed = true;
  draw();
  idleStart();
}
function pointAt(e) {
  const box = svgs[0].getBoundingClientRect(), vb = svgs[0].viewBox.baseVal;
  return [vb.x + ((e.clientX - box.left) / box.width) * vb.width, vb.y + ((e.clientY - box.top) / box.height) * vb.height];
}
function dayAt([x, y]) {
  let best = S.day, bd = Infinity;
  for (let d = 1; d <= 365; d += 0.5) { const g = K.iso(M.centre(d), P); const e = (g[0] - x) ** 2 + (g[1] - y) ** 2; if (e < bd) { bd = e; best = d; } }
  return best;
}
stage.addEventListener("pointerdown", (e) => {
  const q = pointAt(e), g = K.iso(M.centre(S.day), P);
  if (Math.hypot(q[0] - g[0], q[1] - g[1]) > ${(RK * 1.6).toFixed(1)}) return;
  dragging = true;
  stage.setPointerCapture(e.pointerId);
  setDay(dayAt(q));
});
stage.addEventListener("pointermove", (e) => { if (dragging) setDay(dayAt(pointAt(e))); });
for (const type of ["pointerup", "pointercancel"]) stage.addEventListener(type, () => { if (dragging) said.textContent = readoutOf(C, M, S.day); dragging = false; });
stage.addEventListener("keydown", (e) => {
  if (e.key === " " && run.playing && scrubbed) {
    // The run's own Space handler has just resumed it: replay the beat from the date set.
    scrubbed = false;
    S.day += 365 * Math.round((TARGETS[run.index] - S.day) / 365);
    run.go(run.index);
  } else if (e.key === " " && !run.playing) idleStart();
  else if (e.key === "Home") scrubbed = false;
  else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    e.preventDefault();
    setDay(S.day + (e.key === "ArrowRight" ? 1 : -1) * (e.shiftKey ? 10 : 1));
    said.textContent = readoutOf(C, M, S.day);
  }
});
`;
