// The page script, part three: each beat's targets, the run, and the reader taking it over.
export const RUN_SCRIPT = `
const phiDeg = () => (S.phi * 180) / Math.PI;
const DONE = [
  () => S.stepT > 0.3,
  () => Math.abs(S.f - 50.05) < 0.004 && S.fref >= S.fset - 1e-6,
  () => Math.abs(S.E - V_SET) < 0.004,
  () => S.E > 0.5 && phiDeg() > -10 && phiDeg() < -4,
  () => S.closed && S.stepT > 0.2,
  () => Math.abs(S.P - 6) < 0.05,
  () => S.tryT < 0 && S.stepT > 1,
  () => !S.vacOn && S.cb <= 0 && !S.cbCmd && S.stepT > 0.1,
  () => S.ds >= 1,
  () => S.f < 4 && S.ds <= 0,
];
const SNAP = [];
function enter(i, how) {
  beat = i;
  SNAP[i] = JSON.parse(JSON.stringify(S));
  if (i === 0) { const spin = S.spin; Object.assign(S, JSON.parse(JSON.stringify(REST)), { spin }); }
  if (i === 1) S.fset = FSET_IDLE;
  if (i === 2) { S.field = true; S.vset = V_SET; }
  if (i === 4) S.wantClose = true;
  if (i === 5) S.fset = FSET_LOAD;
  if (i === 6) S.dsT = 1;
  if (i === 7) { S.cbCmd = "open"; S.cbT = 0; S.tripBy = "you"; }
  if (i === 8) S.dsT = 1;
  if (i === 9) { S.fset = 0; S.field = false; S.dsT = 0; }
  S.stepT = 0;
  lastPose = {};
  draw();
}
// Beat 4 waits at normal speed for the pointer, then slows right down for the 60 ms the contacts take.
const runStep = (dt) => { if (beat === 4) WARP[4] = S.cbCmd === "close" || S.closed ? 0.03 : 1; step(dt); };
const run = STEPS.mountSteps({
  root: document.querySelector("[data-steps]"), svg: svgs, stage, steps: STEP_INFO, views: VIEWS, colors: COLORS, size: SIZE,
  enter, update: (dt) => { runStep(dt); draw(); }, done: (i) => DONE[i](), advance: runStep, draw,
  save: () => JSON.parse(JSON.stringify({ S, beat })),
  load: (x) => { Object.assign(S, JSON.parse(JSON.stringify(x.S))); beat = x.beat; lastPose = {}; },
  onView: (v) => { view = v; paintGL(); },
});
// Taking over: arrow keys or a drag on the governor set the speed, up and down the voltage, B closes or trips the
// breaker, O tries the disconnector (Shift+O with its interlock defeated). Space hands back to the run.
const said = document.querySelector("[data-said]");
const say = (t) => { said.textContent = t; };
let took = false, onScreen = false, frame = 0, tPrev = 0, slowFor = 0;
function loop(now) {
  frame = 0;
  if (run.playing || !onScreen) return;
  const dt = tPrev ? Math.min(0.05, (now - tPrev) / 1000) : 0;
  tPrev = now;
  const fast = !S.synced && Math.abs(S.fref - S.fset) > 0.02, event = S.cbCmd || S.vacOn || S.airOn || S.tryT >= 0;
  slowFor = event ? 0.4 : Math.max(0, slowFor - dt);
  S.warp = slowFor > 0 && (S.cbCmd || S.vacOn || S.airOn || S.ds > 0.002 && S.ds < 0.2 && S.forced) ? 1 / 30 : fast ? 60 : 1;
  const was = S.tripBy;
  step(dt);
  if (S.tripBy && S.tripBy !== was && S.tripBy !== "you") say("The breaker tripped: " + S.tripBy + ".");
  draw();
  frame = requestAnimationFrame(loop);
}
const kick = () => { if (!frame && !run.playing) { tPrev = 0; frame = requestAnimationFrame(loop); } };
new IntersectionObserver((e) => { onScreen = e[e.length - 1].isIntersecting; kick(); }).observe(stage);
function take() {
  if (run.playing) run.toggle();
  run.aim([0, 0, SIZE[0], SIZE[1]]);
  took = true; S.mode = "take"; S.wantClose = false;
  kick();
}
const act = {
  speed(d, big) { take(); S.fset = d > 0 ? (S.fset < 45 ? FSET_IDLE : Math.min(52.5, S.fset + (big ? 0.5 : 0.05))) : (S.fset - (big ? 0.5 : 0.05) < 49 && !S.synced ? 0 : S.fset - (big ? 0.5 : 0.05)); say("Governor set to " + Math.round(S.fset * 30) + " rpm."); },
  volts(d, big) { take(); if (d > 0) S.field = true; S.vset = Math.max(0.9, Math.min(1.1, S.vset + d * (big ? 0.05 : 0.01))); if (d < 0 && S.vset <= 0.9 && !S.synced) S.field = false; say("Voltage set to " + (S.vset * C.GRID_KV).toFixed(1) + " kV" + (S.field ? "." : ", field off.")); },
  breaker() {
    take();
    if (S.closed || S.cbCmd === "close") { S.cbCmd = "open"; S.cbT = 0; S.tripBy = "you"; say("You trip the breaker."); return; }
    const why = S.ds < 0.002 ? verdict(C, S) : "";
    if (why) { say("The synchro-check won't let it close: " + why + "."); return; }
    S.cbCmd = "close"; S.cbT = 0; say(S.ds < 0.002 ? "The breaker closes: in step with the grid." : "The breaker closes onto the open disconnector: no grid, no current.");
  },
  isolator(force) {
    take();
    S.forced = !!force && S.ds < 0.5;
    S.dsT = S.ds > 0.5 ? 0 : 1;
    if (S.lock > 0.5 && !S.forced) say("Locked: the breaker is closed, so the interlock bolt holds the disconnector's shaft. Trip the breaker first.");
    else if (S.forced && S.synced) say("Interlock defeated: the blades open under " + Math.round(amps()) + " A and an arc follows them; arc protection trips the breaker.");
    else say(S.dsT ? "The blades open: no current, no arc." : "The blades close.");
  },
};
stage.addEventListener("keydown", (e) => {
  // Space hands back: the beat replays from the state the story had when it began, since what the reader left
  // (an open breaker, a defeated interlock) may not allow that beat's action.
  if (e.key === " " && run.playing && took) { took = false; if (SNAP[run.index]) Object.assign(S, JSON.parse(JSON.stringify(SNAP[run.index]))); S.mode = "run"; S.forced = false; lastPose = {}; run.go(run.index); return; }
  const k = e.key.toLowerCase();
  if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); act.speed(e.key === "ArrowRight" ? 1 : -1, e.shiftKey); }
  else if (e.key === "ArrowUp" || e.key === "ArrowDown") { e.preventDefault(); act.volts(e.key === "ArrowUp" ? 1 : -1, e.shiftKey); }
  else if (k === "b") act.breaker();
  else if (k === "o") act.isolator(e.shiftKey);
});
// Pointer: drag the governor up or down; press the crank or the breaker's front to work them.
const HIT = { gov: K.iso([C.GOV.x, C.GOV.y, 96], P), crank: K.iso([C.GB.x, -52, C.GBX.z], P), cb: K.iso([57, -58, 60], P), btn: K.iso([103, 19.5, C.DESK.z], P) };
const pointAt = (e) => { const b = svgs[0].getBoundingClientRect(), v = svgs[0].viewBox.baseVal; return [v.x + ((e.clientX - b.left) / b.width) * v.width, v.y + ((e.clientY - b.top) / b.height) * v.height]; };
const near = (q, h, r) => Math.hypot(q[0] - h[0], q[1] - h[1]) < r;
let drag = null;
stage.addEventListener("pointerdown", (e) => {
  const q = pointAt(e);
  if (near(q, HIT.gov, 22)) { drag = { y: e.clientY, f: S.fset < 45 ? FSET_IDLE : S.fset }; stage.setPointerCapture(e.pointerId); take(); S.fset = drag.f; }
  else if (near(q, HIT.crank, 12)) act.isolator(e.shiftKey);
  else if (near(q, HIT.cb, 26) || near(q, HIT.btn, 8)) act.breaker();
});
stage.addEventListener("pointermove", (e) => { if (drag) S.fset = Math.max(48, Math.min(52.5, drag.f + (drag.y - e.clientY) * 0.01)); });
for (const t of ["pointerup", "pointercancel"]) stage.addEventListener(t, () => { if (drag) say("Governor set to " + Math.round(S.fset * 30) + " rpm."); drag = null; });
`;
