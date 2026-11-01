import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromePath } from "./print.mjs";
import { packInPage } from "./pack-sprites-page.mjs";

const CREW = join(dirname(fileURLToPath(import.meta.url)), "..", "assets", "crew");
const args = process.argv.slice(2);
const flag = (name, fallback) => { const i = args.indexOf(`--${name}`); return i < 0 ? fallback : args[i + 1]; };
const add = args.includes("--add"), takesValue = (a) => a?.startsWith("--") && a !== "--add";
const [species, sheet] = args.filter((a, i) => !a.startsWith("--") && !takesValue(args[i - 1]));
if (!species || !sheet) {
  console.log(`Pack a generated sheet into the drawn crew (assets/crew/).

  node scripts/pack-sprites.mjs <species> <sheet.png> --actions idle:4,work:4,react:4 [options]

  --actions a:n,...   the actions in the sheet, in reading order, and how many frames each (see assets/crew/README.md)
  --grid CxR          columns and rows of the sheet (default 4x3)
  --facing right|left which way the animal faces in the art (default right)
  --background auto|none  key out a plain background from the cell edges (default auto)
  --body px           body height in a 512 cell after packing (default 340)
  --review file.html  where to write the review sheet (default review-<species>.html)
  --add               add these actions under the animal's existing sheet instead of replacing it
                      (same number of columns; frames are scaled to the existing body height)

Each animal is found on the sheet (named by the cell its centre sits in), its background keyed out, scaled to one body height and pinned by its feet
(or, in a hang action, by its two topmost claws). Writes <species>.webp, merges its entry into sprites.json and
writes a review sheet of every frame with its anchors and problems.`);
  process.exit(species ? 1 : 0);
}
const actions = (flag("actions", "") || "").split(",").filter(Boolean).map((s) => { const [name, n] = s.split(":"); return [name, +n]; });
if (!actions.length) throw new Error("--actions is required, e.g. --actions idle:4,work:4,react:4");
const [cols, rows] = flag("grid", "4x3").split("x").map(Number);
const M = JSON.parse(readFileSync(join(CREW, "sprites.json"), "utf8")), old = add ? M.characters[species] : null;
if (add && old?.grid[0] !== cols) throw new Error(`--add needs ${species} in sprites.json with ${cols} columns`);
const base = old && { src: `data:image/webp;base64,${readFileSync(join(CREW, old.atlas)).toString("base64")}`, rows: old.grid[1] };
const cfg = { cols, rows, cell: 512, body: old?.height ?? +flag("body", 340), background: flag("background", "auto"), actions, out: 0.5, base };
if (actions.reduce((s, [, n]) => s + n, 0) > cols * rows) throw new Error(`--actions name ${actions.reduce((s, [, n]) => s + n, 0)} frames, the ${cols}x${rows} grid holds ${cols * rows}`);

// Chrome does the image work: the page decodes the sheet, keys, measures and packs it, then prints the result.
const dir = mkdtempSync(join(tmpdir(), "pack-sprites-"));
const page = join(dir, "pack.html");
const src = `data:image/png;base64,${readFileSync(resolve(sheet)).toString("base64")}`;
writeFileSync(page, `<!doctype html><pre id="out"></pre><script>(${packInPage})(${JSON.stringify(src)}, ${JSON.stringify(cfg)}).then((r) => (document.getElementById("out").textContent = JSON.stringify(r)), (e) => (document.getElementById("out").textContent = JSON.stringify({ error: String(e) })));</script>`);
// Headless Chrome now and then gives up before the page is done, so try a few times.
let text, run;
for (let t = 0; t < 4 && !text; t++) {
  run = spawnSync(chromePath(), ["--headless=new", "--disable-gpu", "--virtual-time-budget=60000", "--dump-dom", `file://${page}`], { encoding: "utf8", maxBuffer: 1 << 28 });
  text = run.stdout.match(/<pre id="out">([\s\S]*?)<\/pre>/)?.[1];
}
rmSync(dir, { recursive: true, force: true });
if (!text) throw new Error(`Chrome gave no result: ${run.stderr.slice(0, 400)}`);
const res = JSON.parse(text.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&"));
if (res.error) throw new Error(res.error);

writeFileSync(join(CREW, `${species}.webp`), Buffer.from(res.webp.split(",")[1], "base64"));
const onFours = actions.every(([a]) => ["run", "stand4"].includes(a));
const first = old?.frames.length ?? 0, totalRows = (base?.rows ?? 0) + rows;
let i = first;
const added = Object.fromEntries(actions.map(([name, n]) => [name, Array.from({ length: n }, () => i++)]));
M.characters[species] = {
  atlas: `${species}.webp`, grid: [cols, totalRows], facing: old?.facing ?? flag("facing", "right"), height: cfg.body,
  actions: { ...old?.actions, ...added },
  // A sheet with no upright frames is scaled by the animal on all fours.
  ...(onFours || old?.fourScale ? { fourScale: [...(old?.fourScale ?? []), ...(onFours ? Object.keys(added) : [])] } : {}),
  frames: [...(old?.frames ?? []), ...res.frames.map(({ problems, ...f }) => f)],
};
writeFileSync(join(CREW, "sprites.json"), JSON.stringify(M, null, 1) + "\n");

// The review sheet: every frame on paper and on dark, its anchors marked, its problems listed.
const review = resolve(flag("review", `review-${species}.html`));
const dot = (p, c) => `<circle cx="${p[0]}" cy="${p[1]}" r="7" fill="${c}"/>`;
const cellSvg = (f, bg) => `<svg width="200" height="200" viewBox="${f.rect.join(" ")}" style="background:${bg}"><image href="${species}.webp" width="${cols * 512}" height="${totalRows * 512}"/><g transform="translate(${f.rect[0]} ${f.rect[1]})">${dot(f.feet, "#e5484d")}${(f.grips ?? []).map((g) => dot(g, "#3e9bdb")).join("")}</g></svg>`;
const names = Object.entries(added).flatMap(([a, list]) => list.map((n, k) => [n - first, `${a} ${k + 1}`]));
writeFileSync(review, `<!doctype html><title>${species} sprites</title><body style="font:12px ui-monospace,monospace;margin:20px"><h1>${species}</h1><p>Red: feet. Blue: grips. Check that every frame reads at the same size, nothing is cut off, and the background is gone.</p><div style="display:flex;flex-wrap:wrap;gap:12px">${names.map(([n, label]) => `<div>${cellSvg(res.frames[n], "#fafaf8")}${cellSvg(res.frames[n], "#141414")}<div>${label}${res.frames[n].problems.map((p) => `<br><b style="color:#e5484d">${p}</b>`).join("")}</div></div>`).join("")}</div>`.replace(/href="([^"]+\.webp)"/g, `href="${join(CREW, `${species}.webp`)}"`));
const problems = res.frames.flatMap((f, n) => f.problems.map((p) => `frame ${n}: ${p}`));
console.log(`packed ${species}: ${res.frames.length} frames, ${Object.keys(M.characters[species].actions).join(", ")}; review ${review}`);
for (const p of problems) console.warn(p);
