import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const argv = process.argv.slice(2);
if (!argv.length || argv.includes("--help") || argv.includes("-h")) {
  console.log(`Watch a run page play and report any on-duty rim that blinks.

  node flicker.mjs <page.html> [--seconds 60] [--min 300] [drive.mjs flags]

Records every change of data-duty on the crew for --seconds (60, about one loop) and warns when a critter's rim
stays on, or goes off and back on, for less than --min ms (300). A blinking rim means the figure toggles duty
from a threshold that the model crosses back and forth; call CREW.setDuty instead of toggleAttribute, and pick
the duty from the beat or a state the model holds, not from a speed. Exits 1 when it finds any.`);
  process.exit(argv.length ? 0 : 1);
}
const take = (flag, fallback) => { const at = argv.indexOf(flag); if (at < 0) return fallback; const v = argv[at + 1]; argv.splice(at, 2); return v; };
const seconds = Number(take("--seconds", 60)), min = Number(take("--min", 300));
const page = resolve(argv.shift());

// In the page: log every rim change with its time, then list the runs of on or off shorter than `min`.
const WATCH = `new Promise((done) => {
  const log = [], t0 = performance.now();
  new MutationObserver((ms) => ms.forEach((m) => log.push([m.target.dataset.crew ?? "?", m.target.hasAttribute("data-duty"), performance.now() - t0])))
    .observe(document.body, { subtree: true, attributeFilter: ["data-duty"] });
  setTimeout(() => {
    const last = {}, short = [];
    for (const [who, on, t] of log) {
      const prev = last[who];
      if (prev && t - prev.t < ${min} && prev.on !== on) short.push(who + " " + (prev.on ? "on" : "off") + " for " + Math.round(t - prev.t) + " ms at " + (prev.t / 1000).toFixed(1) + " s");
      last[who] = { on, t };
    }
    done(log.length + "|" + short.join(";"));
  }, ${seconds * 1000});
})`;
const drive = join(dirname(fileURLToPath(import.meta.url)), "drive.mjs");
const run = spawnSync(process.execPath, [drive, pathToFileURL(page).href, JSON.stringify([["wait", 500], ["eval", WATCH, (seconds + 30) * 1000]]), ...argv], { encoding: "utf8" });
const [changes, short] = (JSON.parse(run.stdout.match(/eval: (.*)/)?.[1] ?? '""') || "|").split("|");
if (!changes) { console.error(run.stdout + run.stderr); process.exit(1); }
const blinks = short ? short.split(";") : [];
for (const b of blinks) console.warn("blink: " + b);
console.log(`${changes} rim changes in ${seconds} s, ${blinks.length} blink${blinks.length === 1 ? "" : "s"}`);
process.exit(blinks.length ? 1 : 0);
