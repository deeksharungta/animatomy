export const STEPS_CSS = `
.so-steps{display:grid;gap:10px;padding:14px 18px 16px;border-top:1px solid var(--anatomy-faint)}
.so-steps-head{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap}
.so-steps-count{font:600 11px/1 var(--anatomy-mono);letter-spacing:.12em;text-transform:uppercase;color:var(--anatomy-muted)}
.so-steps-title{margin:0;font:600 19px/1.25 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--anatomy-strong);text-wrap:balance}
.so-steps-text{margin:0;max-width:62ch;color:var(--anatomy-text);font-size:14px;line-height:1.55;min-height:3.1em}
.so-steps-bar{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.so-steps-dots{display:flex;gap:6px;flex:1;min-width:0}
.so-steps-dot{flex:1;min-width:14px;height:6px;border-radius:3px;border:0;padding:0;background:var(--anatomy-faint);cursor:pointer}
.so-steps-dot[aria-current="step"]{background:var(--crew-step,var(--anatomy-hi))}
.so-steps-dot[data-done]{background:var(--anatomy-lo)}
.so-steps-btn{font:600 13px/1 ui-sans-serif,system-ui,sans-serif;color:var(--anatomy-strong);background:var(--anatomy-card);border:1px solid var(--anatomy-lo);border-radius:999px;padding:8px 14px;cursor:pointer}
.so-steps-btn[data-primary]{background:var(--anatomy-strong);color:var(--anatomy-card);border-color:var(--anatomy-strong)}
.so-steps-btn:disabled{opacity:.4;cursor:default}
.so-steps-btn:focus-visible,.so-steps-dot:focus-visible{outline:2px solid var(--anatomy-muted);outline-offset:2px}
.so-steps-who{display:inline-flex;align-items:center;gap:6px;font:500 12px/1 var(--anatomy-mono);color:var(--anatomy-muted)}
.so-steps-who i{width:10px;height:10px;border-radius:50%;background:var(--crew-step,var(--anatomy-lo));display:inline-block}
.iso-svg.so-zoom{transition:none}
@media (max-width:560px){.so-steps-dots{order:-1;flex-basis:100%}.so-steps-btn{flex:1}}
`;

const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function stepsHtml(steps) {
  const dots = steps.map((s, i) => `<button type="button" class="so-steps-dot" data-step="${i}" aria-label="Step ${i + 1}: ${esc(s.title)}"></button>`).join("");
  const first = steps[0];
  return `<div class="so-steps" data-steps>
<div class="so-steps-head"><span class="so-steps-count" data-steps-count>Step 1 of ${steps.length}</span><span class="so-steps-who" data-steps-who>${first.who ? `<i></i>${esc(first.who)}` : ""}</span></div>
<p class="so-steps-title" data-steps-title aria-live="polite">${esc(first.title)}</p>
<p class="so-steps-text" data-steps-text>${esc(first.text)}</p>
<div class="so-steps-bar"><button type="button" class="so-steps-btn" data-steps-back>Back</button><div class="so-steps-dots">${dots}</div><button type="button" class="so-steps-btn" data-steps-play aria-pressed="true">Pause</button><button type="button" class="so-steps-btn" data-steps-next data-primary>Next</button></div>
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

export function mountSteps({ root, svg, stage, steps, views, enter, update, done, size, dwell = 1.8, autoplay = true, colors = [] }) {
  const still = matchMedia("(prefers-reduced-motion: reduce)");
  const ui = {
    count: root.querySelector("[data-steps-count]"),
    who: root.querySelector("[data-steps-who]"),
    title: root.querySelector("[data-steps-title]"),
    text: root.querySelector("[data-steps-text]"),
    back: root.querySelector("[data-steps-back]"),
    next: root.querySelector("[data-steps-next]"),
    play: root.querySelector("[data-steps-play]"),
    dots: [...root.querySelectorAll("[data-step]")],
  };
  const full = [0, 0, size[0], size[1]];
  let index = 0, auto = autoplay && !still.matches, finished = false, wait = 0, frame = 0, last = 0, visible = false;
  let cam = views[0] ? [...views[0]] : [...full];
  const write = () => svg.setAttribute("viewBox", cam.map((v) => v.toFixed(2)).join(" "));
  const label = () => {
    const s = steps[index];
    ui.count.textContent = `Step ${index + 1} of ${steps.length}`;
    ui.title.textContent = s.title;
    ui.text.textContent = s.text;
    ui.who.innerHTML = s.who ? `<i></i>${s.who.replace(/</g, "&lt;")}` : "";
    root.style.setProperty("--crew-step", colors[index] || "var(--anatomy-hi)");
    ui.dots.forEach((dot, i) => {
      if (i === index) dot.setAttribute("aria-current", "step"); else dot.removeAttribute("aria-current");
      dot.toggleAttribute("data-done", i < index);
    });
    ui.play.textContent = auto ? "Pause" : "Play";
    ui.play.setAttribute("aria-pressed", String(auto));
  };
  const settle = (at = index, cap = 1800) => { let n = 0; while (!done(at) && n++ < cap) update(1 / 30); };
  const go = (to, how = "next") => {
    if (to < 0) to = steps.length - 1;
    if (to >= steps.length) { to = 0; how = "loop"; }
    if (how === "jump" && to > index) {
      for (let k = index; k < to; k++) { settle(k); enter(k + 1, "next"); }
    } else enter(to, how);
    index = to;
    finished = false;
    wait = 0;
    if (still.matches) { settle(); cam = [...views[index]]; write(); }
    label();
    run();
  };
  const tick = (now) => {
    const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
    last = now;
    if (!finished) { update(dt); finished = done(index); }
    else if (auto) { wait += dt; if (wait > (steps[index].dwell ?? dwell)) go(index + 1, "next"); }
    const target = views[index] ?? full;
    const k = still.matches ? 1 : 1 - Math.exp(-dt / 0.55);
    let moving = false;
    cam = cam.map((v, i) => { const n = v + (target[i] - v) * k; if (Math.abs(target[i] - n) > 0.05) moving = true; return Math.abs(target[i] - n) > 0.05 ? n : target[i]; });
    write();
    const idle = finished && !auto && !moving;
    frame = visible && !idle ? requestAnimationFrame(tick) : 0;
  };
  const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
  ui.next.addEventListener("click", () => { auto = false; go(index + 1, "next"); });
  ui.back.addEventListener("click", () => { auto = false; go(index - 1, "back"); });
  ui.play.addEventListener("click", () => { auto = !auto; label(); run(); });
  ui.dots.forEach((dot, i) => dot.addEventListener("click", () => { auto = false; go(i, i > index ? "jump" : "back"); }));
  stage.addEventListener("click", () => { auto = false; go(index + 1, "next"); });
  stage.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") { event.preventDefault(); auto = false; go(index + 1, "next"); }
    else if (event.key === "ArrowLeft") { event.preventDefault(); auto = false; go(index - 1, "back"); }
    else if (event.key === " ") { event.preventDefault(); auto = !auto; label(); run(); }
    else if (event.key === "Home") { event.preventDefault(); auto = false; go(0, "back"); }
  });
  new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
  write();
  enter(0, "start");
  if (still.matches) settle();
  label();
  return { go: (i) => go(i, "jump"), get index() { return index; } };
}
