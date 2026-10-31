// The run: a figure plays its model as one continuous story, beat after beat, with no stops.
// Each beat has a camera view and a caption; the moment a beat's action is done the next one starts,
// and the camera eases onto it while the machine keeps moving. After the last beat it starts again.
export const STEPS_CSS = `
.so-steps{display:grid;gap:8px;padding:14px 18px 16px;border-top:1px solid var(--anatomy-faint)}
.so-steps-who{display:inline-flex;align-items:center;gap:6px;font:500 12px/1 var(--anatomy-mono);color:var(--anatomy-muted);min-height:12px}
.so-steps-who i{width:10px;height:10px;border-radius:50%;background:var(--crew-step,var(--anatomy-lo));display:inline-block}
.so-steps-title{margin:0;font:600 19px/1.25 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--anatomy-strong);text-wrap:balance}
.so-steps-text{margin:0;max-width:62ch;color:var(--anatomy-text);font-size:14px;line-height:1.55;min-height:4.65em}
.so-steps-track{display:flex;gap:4px;margin-top:4px}
.so-steps-track i{flex:1;height:3px;border-radius:2px;background:var(--anatomy-faint);overflow:hidden;position:relative}
.so-steps-track i[data-done]{background:var(--anatomy-lo)}
.so-steps-track i[data-now]::after{content:"";position:absolute;inset:0;background:var(--crew-step,var(--anatomy-hi));transform-origin:left;transform:scaleX(var(--so-beat,0))}
.so-steps[data-bare]{position:absolute;top:0;left:0;width:1px;height:1px;margin:-1px;padding:0;border:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
.so-steps[data-paused] .so-steps-who::after{content:"paused";margin-left:6px;letter-spacing:.08em;text-transform:uppercase;font-size:10px}
.so-steps p{transition:opacity .25s ease}
.so-steps[data-swap] p{opacity:.35}
@media (prefers-reduced-motion:reduce){.so-steps p{transition:none}}
`;

const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function stepsHtml(steps) {
  const first = steps[0];
  return `<div class="so-steps" data-steps>
<span class="so-steps-who" data-steps-who>${first.who ? `<i></i>${esc(first.who)}` : ""}</span>
<p class="so-steps-title" data-steps-title aria-live="polite">${esc(first.title)}</p>
<p class="so-steps-text" data-steps-text>${esc(first.text)}</p>
<div class="so-steps-track" aria-hidden="true">${steps.map(() => "<i></i>").join("")}</div>
</div>`;
}

export function fitView(points, [W, H], { pad = 24, least = 0.38 } = {}) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of points) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  x0 -= pad; y0 -= pad; x1 += pad; y1 += pad;
  let w = x1 - x0, h = y1 - y0;
  const aspect = W / H;
  if (w / h > aspect) h = w / aspect; else w = h * aspect;
  if (w < W * least) { w = W * least; h = H * least; }
  if (w > W) { w = W; h = H; }
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  let x = cx - w / 2, y = cy - h / 2;
  x = Math.max(0, Math.min(W - w, x));
  y = Math.max(0, Math.min(H - h, y));
  return [x, y, w, h];
}

// steps: [{ title, who, text, hold?, pace? }], views: one viewBox per beat, colors: one per beat.
// enter(i, how) sets the model up for beat i ("start", "next" or "loop"); update(dt) advances it;
// done(i) says when beat i's action is over. A beat never ends before its caption can be read
// (about 0.23 s a word, 2.4 s at least). Give `advance` (the model step without drawing) and
// `save`/`load` (copy and restore the model state), and the run plays the whole story once,
// unseen, when it mounts, to time each beat's action; a quick action is then slowed so it fills
// its caption (never below `slowest`, 0.35 = 35% speed). A beat's own `pace` overrides that.
// After a beat's action is done the machine keeps running while the caption is read, unless the
// timing run found that this would carry it into the next beat's action; then it waits, so the
// story never runs ahead of its caption.
// `hold` keeps a beat on screen a little longer, for the opening overview and the closing shot.
// Give `draw` too and reduced motion runs each beat to its end on the model alone and draws it once.
// Space pauses and resumes; Home starts again. aim(viewBox) points the camera somewhere else until the
// next beat or until the run resumes (a figure that lets you drag it can show the whole machine while paused).
// By default the caption panel is only read to screen readers and the page is light; ?full shows the panel and the built theme.
export function mountSteps({ root, svg, stage, steps, views, enter, update, done, size, colors = [], ease = 0.45, advance, save, load, draw, slowest = 0.35, onView }) {
  const still = matchMedia("(prefers-reduced-motion: reduce)");
  const box = root.querySelector("[data-steps]") ?? root;
  const ui = {
    who: root.querySelector("[data-steps-who]"),
    title: root.querySelector("[data-steps-title]"),
    text: root.querySelector("[data-steps-text]"),
    bars: [...root.querySelectorAll(".so-steps-track i")],
  };
  if (!new URLSearchParams(location.search).has("full")) {
    box.setAttribute("data-bare", "");
    for (const el of document.querySelectorAll("[data-theme]")) el.setAttribute("data-theme", "light");
  }
  const full = [0, 0, size[0], size[1]];
  let index = 0, playing = true, finished = false, held = 0, age = 0, frame = 0, last = 0, visible = false, swap = 0;
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
    box.toggleAttribute("data-paused", !playing);
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
  if (advance && save && load) {
    const saved = save();
    const run = (seconds) => { for (let t = 0; t < seconds; t += 1 / 30) advance(1 / 30); };
    steps.forEach((s, i) => {
      enter(i, i ? "next" : "start");
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
        if (finished && age >= readFor(s) && (held += dt) >= (s.hold ?? 0)) go(index + 1);
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
  stage.addEventListener("keydown", (event) => {
    if (event.key === " ") { event.preventDefault(); toggle(); }
    else if (event.key === "Home") { event.preventDefault(); playing = true; go(0); }
  });
  new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
  write();
  enter(0, "start");
  if (still.matches) settle();
  label();
  return { go, toggle, aim, get index() { return index; }, get playing() { return playing; } };
}
