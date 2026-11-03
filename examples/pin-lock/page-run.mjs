import { WIDTH, HEIGHT } from "./model.mjs";

// The page script, part two: the run, and you taking it over.
export const RUN_SCRIPT = `
const run = STEPS.mountSteps({
  root: document.querySelector("[data-steps]"), svg: svgs, stage, steps: STEP_INFO, views: VIEWS, colors: COLORS, size: [${WIDTH}, ${HEIGHT}],
  enter, update: (dt) => { step(dt); draw(); }, done: (i) => DONE[i](), advance: step, draw,
  save: () => JSON.parse(JSON.stringify(S)),
  load: (x) => { Object.assign(S, JSON.parse(JSON.stringify(x))); lastPose = {}; draw(); },
});
// Taking over: drag the key along its axis to push it in or pull it out, or up and down to turn it;
// 1 and 2 pick key A or B, the arrows push and turn, O opens and shuts the drawer. Space hands back to the run.
const said = document.querySelector("[data-said]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
let took = false, onScreen = false, frame = 0, tPrev = 0, drag = null;
function loop(now) {
  frame = 0;
  if (run.playing || !onScreen) return;
  const dt = tPrev ? Math.min(0.05, (now - tPrev) / 1000) : 0;
  tPrev = now;
  if (still.matches) { for (let i = 0; i < 300; i++) step(0.02); } else step(dt);
  draw();
  if (moving() || drag) frame = requestAnimationFrame(loop);
  else { tPrev = 0; said.textContent = readoutText(); }
}
const kick = () => { if (!frame && onScreen) { tPrev = 0; frame = requestAnimationFrame(loop); } };
new IntersectionObserver((entries) => { onScreen = entries[entries.length - 1].isIntersecting; if (onScreen && took) kick(); }).observe(stage);
function take(aim = true) {
  if (run.playing) run.toggle();
  if (aim) run.aim(TAKE_VIEW);
  took = true;
  S.plan = [];
  S.stepT = 1;
}
function plan(list) { take(); S.plan = list; kick(); }
function pointAt(e, vb = svgs[0].viewBox.baseVal) {
  const box = svgs[0].getBoundingClientRect();
  return [vb.x + ((e.clientX - box.left) / box.width) * vb.width, vb.y + ((e.clientY - box.top) / box.height) * vb.height];
}
// The key's bow in screen space, and the screen directions of the key's axis and of a turn.
const bowAt = () => K.iso([S.kx + 17 + S.d, 0, 0], P);
const axis = (() => { const a = K.iso([0, 0, 0], P), b = K.iso([1, 0, 0], P); return [b[0] - a[0], b[1] - a[1]]; })();
stage.addEventListener("pointerdown", (e) => {
  const q = pointAt(e), b = bowAt();
  if (Math.hypot(q[0] - b[0], q[1] - b[1]) > 22) return;
  take(false);
  const v = svgs[0].viewBox.baseVal;
  drag = { q, kx: S.kx, deg: S.degT, vb: { x: v.x, y: v.y, width: v.width, height: v.height } };
  stage.setPointerCapture(e.pointerId);
  kick();
});
stage.addEventListener("pointermove", (e) => {
  if (!drag) return;
  const q = pointAt(e, drag.vb), dx = q[0] - drag.q[0], dy = q[1] - drag.q[1];
  const along = (dx * axis[0] + dy * axis[1]) / (axis[0] * axis[0] + axis[1] * axis[1]);
  S.kxT = Math.max(IN, Math.min(OUT, drag.kx + along));
  S.degT = Math.max(0, Math.min(90, drag.deg - (dy - along * axis[1]) * 2.2));
  kick();
});
for (const type of ["pointerup", "pointercancel"]) stage.addEventListener(type, () => { if (drag) { drag = null; S.degT = 0; kick(); said.textContent = readoutText(); } });
stage.addEventListener("keydown", (e) => {
  if (e.key === " " && run.playing && took) { took = false; run.go(run.index); return; }
  if (e.key === "Home") { took = false; return; }
  const keys = { "1": [{ deg: 0 }, { kx: OUT }, { which: 0 }, { kx: IN }], "2": [{ deg: 0 }, { kx: OUT }, { which: 1 }, { kx: IN }],
    ArrowLeft: [{ deg: 0 }, { kx: IN }], ArrowRight: [{ deg: 0 }, { kx: OUT }], ArrowUp: [{ deg: 90, wait: 0.6 }], ArrowDown: [{ deg: 0 }],
    o: [{ d: S.d > 1 ? 0 : C.OPEN }], O: [{ d: S.d > 1 ? 0 : C.OPEN }] };
  if (keys[e.key]) { e.preventDefault(); plan(keys[e.key]); }
});
`;
