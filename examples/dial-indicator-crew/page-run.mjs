import { WIDTH, HEIGHT } from "./model.mjs";

// The page script, part two: the run, and you taking it over.
export const RUN_SCRIPT = `
const run = STEPS.mountSteps({
  root: document.querySelector("[data-steps]"), svg: svgs, stage, steps: STEP_INFO, views: VIEWS, colors: COLORS, size: [${WIDTH}, ${HEIGHT}],
  enter, update: (dt) => { step(dt); draw(); }, done: (i) => DONE[i](), advance: step, draw,
  save: () => JSON.parse(JSON.stringify(S)),
  load: (x) => { Object.assign(S, JSON.parse(JSON.stringify(x))); lastPose = {}; draw(); },
});
// Taking over: 1 to 5 or the arrow keys choose a block, a drag along the row slides one in, Z sets the zero.
// The run pauses and the camera holds on the indicator and the blocks; Space hands back to the run.
const said = document.querySelector("[data-said]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
let took = false, onScreen = false, frame = 0, tPrev = 0, dragging = false;
function loop(now) {
  frame = 0;
  if (run.playing || !onScreen) return;
  const dt = tPrev ? Math.min(0.05, (now - tPrev) / 1000) : 0;
  tPrev = now;
  if (still.matches) { for (let i = 0; i < 400; i++) step(0.02); } else step(dt);
  draw();
  const busy = S.want !== S.under || Math.abs(S.p - M.rest(S.want)) > 1e-4 || S.zero !== 0 || S.duty;
  if (busy) frame = requestAnimationFrame(loop);
  else { tPrev = 0; said.textContent = readoutText(); }
}
const kick = () => { if (!frame && onScreen) { tPrev = 0; frame = requestAnimationFrame(loop); } };
new IntersectionObserver((entries) => { onScreen = entries[entries.length - 1].isIntersecting; if (onScreen && took) kick(); }).observe(stage);
function take() {
  if (run.playing) run.toggle();
  run.aim(TAKE_VIEW);
  took = true;
  S.stepT = 1;
}
function choose(i) {
  if (i < 0 || i >= C.BLOCKS.length) return;
  take();
  S.want = i;
  kick();
}
function pointAt(e) {
  const box = svgs[0].getBoundingClientRect(), vb = svgs[0].viewBox.baseVal;
  return [vb.x + ((e.clientX - box.left) / box.width) * vb.width, vb.y + ((e.clientY - box.top) / box.height) * vb.height];
}
// The block nearest the pointer, by its home in the row or its spot under the plunger.
function blockNear(q, reach) {
  let best = -1, bd = reach;
  C.BLOCKS.forEach((_, i) => {
    const home = [C.HOME * C.N[0] + (i - 2) * C.LANE * C.U[0], C.HOME * C.N[1] + (i - 2) * C.LANE * C.U[1], C.BLOCKS[i]];
    const g = K.iso(home, P), d = Math.hypot(g[0] - q[0], g[1] - q[1]);
    if (d < bd) { bd = d; best = i; }
  });
  return best;
}
stage.addEventListener("pointerdown", (e) => {
  const i = blockNear(pointAt(e), 26);
  if (i < 0) return;
  dragging = true;
  stage.setPointerCapture(e.pointerId);
  choose(i);
});
stage.addEventListener("pointermove", (e) => { if (dragging) { const i = blockNear(pointAt(e), 60); if (i >= 0 && i !== S.want) choose(i); } });
for (const type of ["pointerup", "pointercancel"]) stage.addEventListener(type, () => { dragging = false; });
stage.addEventListener("keydown", (e) => {
  if (e.key === " " && run.playing && took) { took = false; run.go(run.index); return; }
  if (e.key === "Home") { took = false; return; }
  const n = "12345".indexOf(e.key);
  if (n >= 0) { e.preventDefault(); choose(n); return; }
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); choose(Math.max(0, Math.min(C.BLOCKS.length - 1, S.want + (e.key === "ArrowRight" ? 1 : -1)))); return; }
  if (e.key === "z" || e.key === "Z") { e.preventDefault(); take(); S.zero = 1; S.zeroed = false; kick(); }
});
`;
