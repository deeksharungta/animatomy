import { WIDTH, HEIGHT } from "./model.mjs";

// The page script, part two: the run, and you taking it over. Drag the cheese down (or ↓) to tip the pedal;
// drag the hammer back (or ↑) to set the trap again. The run pauses, the camera holds on the trap, Space plays on.
export const takeScript = () => `
const run = STEPS.mountSteps({
  root: document.querySelector("[data-steps]"), svg, stage, steps: STEP_INFO, views: VIEWS, colors: COLORS, size: [${WIDTH}, ${HEIGHT}],
  enter, update: (dt) => { step(dt); draw(); }, done: (i) => DONE[i](), advance: step, draw,
  save: () => JSON.parse(JSON.stringify(S)),
  load: (x) => { Object.assign(S, JSON.parse(JSON.stringify(x))); lastPose = {}; },
});
const said = document.querySelector("[data-said]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
let took = false, onScreen = false, frame = 0, tPrev = 0, drag = null;
function loop(now) {
  frame = 0;
  if (run.playing || !onScreen) return;
  const dt = tPrev ? Math.min(0.05, (now - tPrev) / 1000) : 0;
  tPrev = now;
  if (still.matches) { for (let i = 0; i < 600; i++) step(0.02); } else step(dt);
  draw();
  const busy = S.free || S.barFree || S.hand || S.layT >= 0 || S.duty || S.md !== S.mdT || S.scare > 0 || Math.abs(S.grab - S.grabT) > 0.01 || Math.abs(S.grip - S.gripT) > 0.01 || (S.set && Math.abs(S.psi - S.psiT) > 0.01);
  if (busy || drag) frame = requestAnimationFrame(loop);
  else { tPrev = 0; said.textContent = readoutText(); }
}
const kick = () => { if (!frame && onScreen) { tPrev = 0; frame = requestAnimationFrame(loop); } };
new IntersectionObserver((entries) => { onScreen = entries[entries.length - 1].isIntersecting; if (onScreen && took) kick(); }).observe(stage);
function take() {
  if (run.playing) run.toggle();
  run.aim(TAKE_VIEW);
  took = true;
  S.mdT = 0; S.grabT = 0; S.push = false;
  S.stepT = 1;
}
// Press: tip the pedal toward the trip angle (Nib has gone home: your finger presses); set: wind the hammer back and lay the bar.
function pressTo(psi) { take(); if (!S.set) return; S.push = true; S.rate = 24; S.psiT = Math.max(0, Math.min(C.TRIP + 0.4, psi)); kick(); }
function windTo(th) { take(); if (S.set || S.free || S.barFree || S.layT >= 0) return; S.push = false; S.hand = true; S.slow = 1; S.thT = Math.max(C.TH_REST, Math.min(C.TH_SET + 0.03, th)); kick(); }
function setIfBack() { if (S.hand && S.thT >= C.TH_SET && S.layT < 0) { S.layT = 0; S.gripT = 0; kick(); } }
function pointAt(e) {
  const box = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal;
  return [vb.x + ((e.clientX - box.left) / box.width) * vb.width, vb.y + ((e.clientY - box.top) / box.height) * vb.height];
}
// The hammer's angle under the pointer: the pointer taken back onto the hammer's own plane (y = 0) through the camera.
function angleAt(q) {
  const o = iso([0, 0, 0], P), ex = iso([1, 0, 0], P), ez = iso([0, 0, 1], P);
  const a = [ex[0] - o[0], ex[1] - o[1]], c = [ez[0] - o[0], ez[1] - o[1]], d = [q[0] - o[0], q[1] - o[1]], det = a[0] * c[1] - a[1] * c[0];
  const x = (d[0] * c[1] - d[1] * c[0]) / det, z = (a[0] * d[1] - a[1] * d[0]) / det;
  let th = Math.atan2(z - C.AX.z, x);
  if (th < -Math.PI / 2) th += 2 * Math.PI;
  return th;
}
const near = (q, w, r) => { const g = iso(w, P); return Math.hypot(g[0] - q[0], g[1] - q[1]) < r; };
stage.addEventListener("pointerdown", (e) => {
  const q = pointAt(e), arm = (r) => [r * Math.cos(S.th), 0, C.AX.z + r * Math.sin(S.th)];
  if (S.set && (near(q, pedalPt(C, 31, 0, 6, S.psi), 24) || near(q, pedalPt(C, 20, 0, 0, S.psi), 20))) drag = { kind: "press", y: q[1], psi: S.psi };
  else if (!S.set && !S.free && !S.barFree && (near(q, arm(C.ARM_L), 26) || near(q, arm(C.ARM_L / 2), 20))) drag = { kind: "wind", x: q[0], y: q[1], th: S.th };
  if (!drag) return;
  stage.setPointerCapture(e.pointerId);
  take();
});
stage.addEventListener("pointermove", (e) => {
  if (!drag) return;
  const q = pointAt(e);
  if (drag.kind === "press") pressTo(drag.psi + (q[1] - drag.y) * 0.25);
  else windTo(angleAt(q));
});
for (const type of ["pointerup", "pointercancel"]) stage.addEventListener(type, () => {
  if (!drag) return;
  if (drag.kind === "press" && S.set) { S.psiT = 0; S.push = false; }
  if (drag.kind === "wind") { if (S.thT >= C.TH_SET - 0.25) { S.thT = C.TH_SET + 0.03; setIfBack(); } else { S.hand = false; S.free = true; S.slow = 1 / 20; S.w = 0; S.tm = 0; S.landed = false; } }
  drag = null; kick();
});
stage.addEventListener("keydown", (e) => {
  if (e.key === " " && run.playing && took) { took = false; run.go(run.index); return; }
  if (e.key === "Home") { took = false; return; }
  if (e.key === "ArrowDown") { e.preventDefault(); pressTo(S.psiT + 1.2); return; }
  if (e.key === "ArrowUp") {
    e.preventDefault(); take();
    // Wait for the hammer and bar to come to rest, wind the hammer back, then lay the bar.
    const go = () => { if (S.set || S.layT >= 0) return; if (S.free || S.barFree) { kick(); setTimeout(go, 80); return; } windTo(C.TH_SET + 0.03); if (Math.abs(S.th - S.thT) < 0.01) setIfBack(); else setTimeout(go, 80); };
    go();
  }
});
`;
