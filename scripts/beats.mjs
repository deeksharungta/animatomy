import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const argv = process.argv.slice(2);
if (!argv.length || argv.includes("--help") || argv.includes("-h")) {
  console.log(`Shoot every beat of a run page at its end and tile them into one contact sheet.

  node beats.mjs <page.html> [--out beats.png] [--columns 3] [--full] [--min 32] [--theme dark|light] [drive.mjs flags]

Opens the page once per beat with ?beat=n (the run plays beats 0 to n to their ends and stops on n), shoots
each with drive.mjs, and lays them out in reading order, each labelled with its beat number and readout.
--full adds the caption under each figure. Warns when the critter a beat's caption names is less than 60% in
frame, mostly hidden behind other parts, or shorter than --min px (32) at 1440 wide; beat 0, the opening
overview, is not measured. Read the sheet: the actor is in frame and lit, and the caption
matches the picture.`);
  process.exit(argv.length ? 0 : 1);
}
const take = (flag, fallback) => {
  const at = argv.indexOf(flag);
  if (at < 0) return fallback;
  const value = argv[at + 1];
  argv.splice(at, 2);
  return value;
};
const has = (flag) => { const at = argv.indexOf(flag); if (at >= 0) argv.splice(at, 1); return at >= 0; };
const out = resolve(take("--out", "beats.png"));
const columns = Number(take("--columns", 3));
const full = has("--full");
const page = resolve(argv.shift());

// The number of beats is the number of segments in the page's progress track.
const track = readFileSync(page, "utf8").match(/class="so-steps-track"[^>]*>((?:<i><\/i>)+)/);
if (!track) { console.error("no run on this page (no .so-steps-track)"); process.exit(1); }
const count = track[1].split("<i></i>").length - 1;

const scripts = dirname(fileURLToPath(import.meta.url)), capture = join(scripts, "capture.mjs"), drive = join(scripts, "drive.mjs");
// The beat's actor, named first in its caption ("Mo · sensing"): its height on screen, how much of it is inside the
// figure's frame, and how much of what is in frame is on top rather than hidden behind other parts (sampled on a grid).
const DUTY = "(()=>{const st=document.createElement('style');st.textContent='*{pointer-events:none!important}svg *{pointer-events:visiblePainted!important}';document.head.append(st);const w=(document.querySelector('[data-steps-who]')||{}).textContent||'';const n=w.split(/ [·&]| and /)[0].trim();const d=n&&document.querySelector('.crew[data-crew=\\''+n+'\\']');if(!d){st.remove();return '';}const r=(d.querySelector('.so-fig')||d).getBoundingClientRect(),f=d.ownerSVGElement.getBoundingClientRect();const x=Math.max(0,Math.min(r.right,f.right)-Math.max(r.left,f.left)),y=Math.max(0,Math.min(r.bottom,f.bottom)-Math.max(r.top,f.top));let own=0,top=0;for(let i=0;i<7;i++)for(let j=0;j<7;j++){const a=document.elementsFromPoint(r.left+r.width*(i+.5)/7,r.top+r.height*(j+.5)/7);if(!a.some((e)=>d.contains(e)))continue;own++;if(d.contains(a[0]))top++;}st.remove();return n+'|'+Math.round(r.height)+'|'+(r.width*r.height?(x*y)/(r.width*r.height):0).toFixed(2)+'|'+(own>=4?top/own:1).toFixed(2);})()";
const minHeight = Number(take("--min", 32));
const dir = mkdtempSync(join(tmpdir(), "beats-"));
// Beat 0 is the opening view (?beat=0 leaves the run at its start); every later beat is shown at its end.
const cells = [];
for (let n = 0; n < count; n++) {
  const shot = join(dir, `beat-${n}.png`);
  const url = `file://${page}?beat=${n}${full ? "&full" : ""}`;
  const run = spawnSync(process.execPath, [drive, url, JSON.stringify([["wait", 1500], ["shot", shot, null, 2], ["eval", DUTY]]), ...argv], { encoding: "utf8" });
  if (run.status !== 0) { process.stderr.write(run.stdout + run.stderr); rmSync(dir, { recursive: true, force: true }); process.exit(1); }
  const readout = run.stdout.match(/readout "([^"]*)"/)?.[1] ?? "";
  if (!/console: clean/.test(run.stdout)) console.warn(`beat ${n}: ${run.stdout.split("\n").filter((l) => l && !/^(shot|eval|readout)/.test(l)).join(" ")}`);
  // The beat's actor must be in frame and big enough to read: that is what the beat is for.
  const [who, tall, seen, onTop] = (JSON.parse(run.stdout.match(/eval: (.*)/)?.[1] ?? '""') || "").split("|");
  if (n === 0) {}
  else if (who && +seen < 0.6) console.warn(`beat ${n}: the caption names ${who}, but only ${Math.round(+seen * 100)}% of them is in frame`);
  else if (who && +onTop < 0.5) console.warn(`beat ${n}: the caption names ${who}, but ${Math.round((1 - +onTop) * 100)}% of them is hidden behind other parts`);
  else if (who && +tall < minHeight) console.warn(`beat ${n}: the caption names ${who}, but they are only ${tall} px tall; give the beat a closer camera or the critter more size`);
  cells.push({ n, readout, src: `data:image/png;base64,${readFileSync(shot).toString("base64")}` });
  console.log(`beat ${n}: "${readout}"`);
}
const sheet = join(dir, "sheet.html");
writeFileSync(sheet, `<!doctype html><meta charset="utf-8"><body style="margin:12px;background:#fff;font:12px ui-monospace,monospace;color:#333"><div style="display:grid;grid-template-columns:repeat(${columns},1fr);gap:10px;width:${columns * 480}px">${cells.map((c) => `<figure style="margin:0"><img src="${c.src}" style="width:100%;display:block;border:1px solid #ddd"><figcaption style="padding:4px 2px">beat ${c.n} · ${c.readout.replace(/</g, "&lt;")}</figcaption></figure>`).join("")}</div>`);
const run = spawnSync(process.execPath, [capture, sheet, "--out", out, "--select", "body", "--width", String(columns * 480 + 40), "--scale", "1", "--wait", "500"], { encoding: "utf8" });
rmSync(dir, { recursive: true, force: true });
if (run.status !== 0) { process.stderr.write(run.stdout + run.stderr); process.exit(1); }
console.log(`wrote ${out} · ${count} beats`);
