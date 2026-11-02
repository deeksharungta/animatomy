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

export const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

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

export { mountSteps } from "./steps-run.mjs";
