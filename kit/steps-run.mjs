// The run's loop, mounted on a page by mountSteps. kit/steps.mjs has the caption markup, its CSS and fitView.
import { esc } from "./steps.mjs";

// steps: [{ title, who, text, hold?, pace? }], views: one viewBox per beat, colors: one per beat.
// enter(i, how) sets the model up for beat i ("start", "next" or "loop"); update(dt) advances it;
// done(i) says when beat i's action is over. A beat never ends before its caption can be read
// (about 0.23 s a word, 2.4 s at least). Give `advance` (the model step without drawing) and
// `save`/`load` (copy and restore the model state), and the run plays the whole story once,
// unseen, when it mounts, to time each beat's action; a quick action is then slowed so it fills
// its caption (never below `slowest`, 0.35 = 35% speed). A beat's own `pace` overrides that.
// After a beat's action is done the machine keeps running while the caption is read, unless the
// timing run found that this would carry it into the next beat's action; then the run moves on to
// that beat at once. It never freezes the machine: the reader pauses it with Space.
// `hold` keeps a beat on screen a little longer, for the opening overview and the closing shot.
// Give `draw` too and reduced motion runs each beat to its end on the model alone and draws it once.
// Space pauses and resumes; Home starts again. aim(viewBox) points the camera somewhere else until the
// next beat or until the run resumes (a figure that lets you drag it can show the whole machine while paused).
// By default the caption panel is only read to screen readers; ?full shows it. The page keeps the theme it was built in.
// ?beat=n plays beats 0 to n through to their ends and stops on n, for a screenshot of one beat. destroy() stops it all.
export function mountSteps({ root, svg, stage, steps, views, enter, update, done, size, colors = [], ease = 0.45, advance, save, load, draw, slowest = 0.35, onView }) {
  const still = matchMedia("(prefers-reduced-motion: reduce)");
  const box = root.querySelector("[data-steps]") ?? root;
  const ui = {
    who: root.querySelector("[data-steps-who]"),
    title: root.querySelector("[data-steps-title]"),
    text: root.querySelector("[data-steps-text]"),
    bars: [...root.querySelectorAll(".so-steps-track i")],
  };
  if (!new URLSearchParams(location.search).has("full")) box.setAttribute("data-bare", "");
  const full = [0, 0, size[0], size[1]];
  let frozen = false, index = 0, playing = true, finished = false, held = 0, age = 0, frame = 0, last = 0, visible = false, swap = 0;
  let cam = views[0] ? [...views[0]] : [...full];
  let aimed = null;
  // `svg` may be one element or several layered ones (a back and a front drawing round a canvas);
  // onView(viewBox) lets a WebGL layer follow the camera.
  const svgs = [].concat(svg);
  const write = () => { const box = cam.map((v) => v.toFixed(2)).join(" "); for (const el of svgs) el.setAttribute("viewBox", box); onView?.(cam); };
  const label = () => {
    const s = steps[index];
    ui.title.textContent = s.title;
    ui.text.textContent = s.text;
    ui.who.innerHTML = s.who ? `<i></i>${esc(s.who)}` : "";
    root.style.setProperty("--crew-step", colors[index] || "var(--anatomy-hi)");
    ui.bars.forEach((bar, i) => { bar.toggleAttribute("data-now", i === index); bar.toggleAttribute("data-done", i < index); });
    box.toggleAttribute("data-paused", !playing && !frozen);
  };
  const settle = (at = index, cap = 1800) => {
    let n = 0;
    const step = advance && draw ? advance : update;
    while (!done(at) && n++ < cap) step(1 / 30);
    if (step !== update) draw();
  };
  const words = (s) => `${s.title} ${s.text}`.trim().split(/\s+/).length;
  const readFor = (s) => Math.max(2.4, words(s) * 0.23);
  const pace = steps.map((s) => s.pace ?? 1);
  const flow = steps.map(() => false);
  // The model as each beat begins, saved during the timing pass, so a figure the reader took over can restore one.
  const starts = [];
  if (advance && save && load) {
    const saved = save();
    const run = (seconds) => { for (let t = 0; t < seconds; t += 1 / 30) advance(1 / 30); };
    steps.forEach((s, i) => {
      enter(i, i ? "next" : "start");
      starts[i] = save();
      let t = 0;
      while (!done(i) && t < 40) { advance(1 / 30); t += 1 / 30; }
      if (s.pace == null) pace[i] = Math.max(slowest, Math.min(1, t / (readFor(s) * 0.9)));
      if (i === steps.length - 1) return;
      // Would running on through the caption finish the next beat before it starts?
      const atDone = save();
      const next = () => { enter(i + 1, "next"); let n = 0; while (!done(i + 1) && n < 40) { advance(1 / 30); n += 1 / 30; } return n; };
      const waited = next();
      load(atDone);
      run(Math.max(0, readFor(s) + (s.hold ?? 0) - t / pace[i]) * pace[i]);
      const later = save();
      flow[i] = next() >= waited * 0.85;
      load(flow[i] ? later : atDone);
    });
    load(saved);
  }
  const go = (to) => {
    const how = to >= steps.length ? "loop" : to === 0 ? "start" : "next";
    if (to >= steps.length) to = 0;
    enter(to, how);
    index = to;
    aimed = null;
    finished = false;
    held = 0;
    age = 0;
    swap = 0.18;
    box.setAttribute("data-swap", "");
    if (still.matches) { settle(); cam = [...(views[index] ?? full)]; write(); }
    label();
    run();
  };
  const tick = (now) => {
    const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
    last = now;
    if (swap > 0 && (swap -= dt) <= 0) box.removeAttribute("data-swap");
    if (playing) {
      age += dt;
      if (still.matches) {
        // Reduced motion: each beat is shown at its end, and the run moves on every few seconds.
        if ((held += dt) > Math.max(3.5, steps[index].hold ?? 0)) go(index + 1);
      } else {
        const s = steps[index];
        if (!finished || flow[index]) update(dt * pace[index]);
        if (!finished && (finished = done(index))) box.dataset.actionTook = age.toFixed(1);
        // A flowing beat runs on while its caption is read; any other moves straight on instead of freezing.
        if (finished && age >= (flow[index] ? readFor(s) : 0) && (held += dt) >= (s.hold ?? 0)) go(index + 1);
      }
      const fill = Math.min(1, age / (readFor(steps[index]) + (steps[index].hold ?? 0)));
      root.style.setProperty("--so-beat", fill.toFixed(3));
    }
    const target = aimed ?? views[index] ?? full;
    const k = still.matches ? 1 : 1 - Math.exp(-dt / ease);
    let moving = false;
    cam = cam.map((v, i) => { const n = v + (target[i] - v) * k; if (Math.abs(target[i] - n) > 0.05) moving = true; return Math.abs(target[i] - n) > 0.05 ? n : target[i]; });
    write();
    frame = visible && (playing || moving || swap > 0) ? requestAnimationFrame(tick) : 0;
  };
  const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
  const toggle = () => { playing = !playing; if (playing) aimed = null; label(); run(); };
  const aim = (view) => { aimed = view ? [...view] : null; if (still.matches && aimed) { cam = [...aimed]; write(); } run(); };
  const keys = (event) => {
    if (event.key === " ") { event.preventDefault(); toggle(); }
    else if (event.key === "Home") { event.preventDefault(); playing = true; go(0); }
  };
  stage.addEventListener("keydown", keys);
  // The camera zooms past the figure's edges, so the stage always clips.
  if (getComputedStyle(stage).overflow === "visible") stage.style.overflow = "hidden";
  const seen = new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" });
  seen.observe(stage);
  write();
  const only = Number(new URLSearchParams(location.search).get("beat"));
  frozen = Number.isInteger(only) && only > 0 && only < steps.length;
  if (Number.isInteger(only) && only > 0 && only < steps.length) {
    for (let i = 0; i <= only; i++) { enter(i, i ? "next" : "start"); settle(i); }
    index = only;
    playing = false;
    cam = [...(views[index] ?? full)];
    write();
  } else {
    enter(0, "start");
    if (still.matches) settle();
  }
  label();
  const destroy = () => { cancelAnimationFrame(frame); frame = 0; visible = false; seen.disconnect(); stage.removeEventListener("keydown", keys); };
  const startOf = (i) => (starts[i] ? JSON.parse(JSON.stringify(starts[i])) : null);
  return { go, toggle, aim, destroy, startOf, get index() { return index; }, get playing() { return playing; } };
}
