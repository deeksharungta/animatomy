import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync, inflateSync } from "node:zlib";

const argv = process.argv.slice(2);
if (!argv.length || argv.includes("--help") || argv.includes("-h")) {
  console.log(`Map bare faces: large flat areas in a figure with nothing on them.

  node bare.mjs <file.html | url> [--max 8] [--out rings.png] [--wait 2500] [capture.mjs flags]

Captures the figure at 1x, then finds every connected area of flat or smoothly shaded colour (no seam, line, dot,
part or texture inside it) that isn't the card's paper, and the largest empty square inside each. Prints every square
wider than --max percent of the card's short side, largest first, in CSS px; --out writes the capture with each square
ringed. It is a map for the 4x pass, not a pass or fail: a plain wall may be right, and a figure can be thin with no
bare face at all (too few parts, parts that read as sticks), which only a look beside an example shows.
A wall, a floor or a big face of the machine that shows up here needs real parts on it: panel seams, screws, a label
plate, tiles, planks.`);
  process.exit(argv.length ? 0 : 1);
}
const take = (flag, fallback) => {
  const at = argv.indexOf(flag);
  if (at < 0) return fallback;
  const value = argv[at + 1];
  argv.splice(at, 2);
  return value;
};
const max = Number(take("--max", 8));
const out = take("--out", null);
const wait = take("--wait", "2500");

// The figure at 1x, from the skill's own capture script.
const dir = mkdtempSync(join(tmpdir(), "bare-"));
const shot = join(dir, "shot.png");
const run = spawnSync(process.execPath, [join(dirname(fileURLToPath(import.meta.url)), "capture.mjs"), argv[0], "--out", shot, "--scale", "1", "--wait", wait, ...argv.slice(1)], { encoding: "utf8" });
if (run.status !== 0) { process.stderr.write(run.stdout + run.stderr); rmSync(dir, { recursive: true, force: true }); process.exit(1); }
const img = readPng(readFileSync(shot));
rmSync(dir, { recursive: true, force: true });
const { w, h, px } = img;

// Neighbouring pixels within a few levels of each other belong together, so a smooth shade is one area and any
// stroke, dot or edge splits it.
const near = (a, b) => Math.abs(px[a] - px[b]) <= 3 && Math.abs(px[a + 1] - px[b + 1]) <= 3 && Math.abs(px[a + 2] - px[b + 2]) <= 3;
const lab = new Int32Array(w * h), areas = [];
for (let k = 0; k < w * h; k++) {
  if (lab[k]) continue;
  const A = { id: areas.length + 1, n: 0, at: k * 4, edge: false }, st = [k];
  lab[k] = A.id;
  while (st.length) {
    const q = st.pop(), x = q % w, y = (q - x) / w;
    A.n++;
    if (x === 0 || y === 0 || x === w - 1 || y === h - 1) A.edge = true;
    for (const r of [x > 0 && q - 1, x < w - 1 && q + 1, y > 0 && q - w, y < h - 1 && q + w]) if (r !== false && !lab[r] && near(q * 4, r * 4)) { lab[r] = A.id; st.push(r); }
  }
  areas.push(A);
}
// The card's own paper is the largest area; it and anything its colour (inside or outside the frame) is not a face.
const paper = areas.reduce((m, A) => (A.n > m.n ? A : m)).at;
for (const A of areas) if (Math.abs(px[A.at] - px[paper]) + Math.abs(px[A.at + 1] - px[paper + 1]) + Math.abs(px[A.at + 2] - px[paper + 2]) <= 4) A.edge = true;
// The largest empty square inside each flat area: a texture, seam or part anywhere in it would break it up.
const sq = new Uint16Array(w * h);
for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
  const k = y * w + x, L = lab[k];
  sq[k] = x && y && lab[k - 1] === L && lab[k - w] === L && lab[k - w - 1] === L ? 1 + Math.min(sq[k - 1], sq[k - w], sq[k - w - 1]) : 1;
  const A = areas[L - 1];
  if (!A.edge && sq[k] > (A.side ?? 0)) { A.side = sq[k]; A.sq = [x - sq[k] + 1, y - sq[k] + 1, x, y]; }
}
const unit = Math.min(w, h) / 100;
const bare = areas.filter((A) => !A.edge && A.side / unit >= max).sort((a, b) => b.side - a.side);
for (const A of bare) console.log(`bare square ${(A.side / unit).toFixed(1)}% of the card at x ${A.sq[0]}–${A.sq[2]}, y ${A.sq[1]}–${A.sq[3]}`);
const largest = areas.filter((A) => !A.edge).reduce((m, A) => Math.max(m, A.side ?? 0), 0);
console.log(`bare faces: ${bare.length} over ${max}% (largest empty square ${(largest / unit).toFixed(1)}% of the card's short side)`);

if (out) {
  for (const A of bare) {
    const [x0, y0, x1, y1] = A.sq;
    for (let t = 0; t < 3; t++) for (let x = x0; x <= x1; x++) for (const y of [y0 + t, y1 - t]) paint(x, y);
    for (let t = 0; t < 3; t++) for (let y = y0; y <= y1; y++) for (const x of [x0 + t, x1 - t]) paint(x, y);
  }
  writeFileSync(out, writePng(img));
}

function paint(x, y) {
  if (x < 0 || y < 0 || x >= w || y >= h) return;
  const i = (y * w + x) * 4;
  px[i] = 229; px[i + 1] = 72; px[i + 2] = 77; px[i + 3] = 255;
}

// PNG in and out, enough for Chrome's screenshots (8-bit RGB or RGBA, not interlaced).
function readPng(buf) {
  let p = 8, w = 0, h = 0, ch = 4;
  const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p), type = buf.toString("ascii", p + 4, p + 8), data = buf.subarray(p + 8, p + 8 + len);
    if (type === "IHDR") { w = data.readUInt32BE(0); h = data.readUInt32BE(4); ch = data[9] === 6 ? 4 : 3; }
    if (type === "IDAT") idat.push(data);
    p += 12 + len;
  }
  const raw = inflateSync(Buffer.concat(idat)), stride = w * ch, px = new Uint8Array(w * h * 4);
  let prev = new Uint8Array(stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], row = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)), cur = new Uint8Array(stride);
    for (let i = 0; i < stride; i++) {
      const a = i >= ch ? cur[i - ch] : 0, b = prev[i], c = i >= ch ? prev[i - ch] : 0;
      const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c);
      cur[i] = (row[i] + [0, a, b, (a + b) >> 1, pa <= pb && pa <= pc ? a : pb <= pc ? b : c][f]) & 255;
    }
    for (let x = 0; x < w; x++) for (let j = 0; j < 4; j++) px[(y * w + x) * 4 + j] = j < ch ? cur[x * ch + j] : 255;
    prev = cur;
  }
  return { w, h, px };
}
function writePng({ w, h, px }) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) Buffer.from(px.buffer, y * w * 4, w * 4).copy(raw, y * (w * 4 + 1) + 1);
  const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc = (b) => { let c = 0xffffffff; for (const x of b) c = crcTable[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const chunk = (type, data) => { const t = Buffer.concat([Buffer.from(type, "ascii"), data]), b = Buffer.alloc(12 + data.length); b.writeUInt32BE(data.length, 0); t.copy(b, 4); b.writeUInt32BE(crc(t), 8 + data.length); return b; };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}
