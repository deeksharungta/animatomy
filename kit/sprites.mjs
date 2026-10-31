import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// The sprite crew: illustrated animals from bundled atlases, placed on the machine by their foot anchor or by
// two grip points. Assets resolve next to the skill, and each atlas is embedded once, so a page works offline.
const DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "assets", "crew");
export const SPRITES = JSON.parse(readFileSync(join(DIR, "sprites.json"), "utf8"));

const ensure = (name) => {
  if (!SPRITES.characters[name]) throw new Error(`No sprite atlas for "${name}". Bundled: ${Object.keys(SPRITES.characters).join(", ")}.`);
  return SPRITES.characters[name];
};

// One <image> per atlas in the figure's defs, drawn at atlas size whatever its stored resolution.
export function spriteDefs(names) {
  const [w, h] = SPRITES.atlasSize;
  return `<defs>${names.map((n) => `<image id="so-atlas-${n}" width="${w}" height="${h}" href="data:image/webp;base64,${readFileSync(join(DIR, ensure(n).atlas)).toString("base64")}"/>`).join("")}</defs>`;
}

// A sprite's slot in the drawing: a cell-sized window onto its atlas, moved and framed by the page each frame.
export function spriteSvg(name, part) {
  ensure(name);
  const c = SPRITES.cell;
  return `<g class="so-sprite" data-part="${part}" data-sprite="${name}"><svg width="${c}" height="${c}" viewBox="0 0 ${c} ${c}" overflow="hidden"><use href="#so-atlas-${name}"/></svg></g>`;
}

// The manifest the page needs: frames, anchors and grips, without the files.
export const spriteManifest = (names) => ({ clips: SPRITES.clips, characters: Object.fromEntries(names.map((n) => [n, { frames: ensure(n).frames }])) });

// The runtime, as source for the page: pick a frame, then place it by its feet or its two grips.
export const SPRITE_SCRIPT = `
const SPRITE = (() => {
  const loop = (clip, t, fps) => clip.frames[Math.floor(t * fps) % clip.frames.length];
  const once = (clip, t, fps) => clip.frames[Math.min(clip.frames.length - 1, Math.floor(t * fps))];
  // Idle blinks now and then; work and react play at their own pace.
  const idle = (t) => { const q = t % 4.8; return q < 4 ? 0 : q < 4.2 ? 1 : q < 4.4 ? 2 : 3; };
  const frameOf = (M, clip, t) => clip === "idle" ? idle(t) : M.clips[clip].loop ? loop(M.clips[clip], t, 5) : once(M.clips[clip], t, 3);
  // Feet: the frame's foot anchor lands on a point of the drawing, at a scale and facing.
  const byFeet = (f, at, scale, mirror = false) => { const s = mirror ? -scale : scale; return [s, 0, 0, scale, at[0] - f.anchor[0] * s, at[1] - f.anchor[1] * scale]; };
  // Grips: the frame's two grip points land on two points of the drawing, by a rotation and a uniform scale only.
  const byGrips = (f, to) => {
    const [a0, a1] = f.grips, ux = a1[0] - a0[0], uy = a1[1] - a0[1], vx = to[1][0] - to[0][0], vy = to[1][1] - to[0][1], n = ux * ux + uy * uy;
    const a = (vx * ux + vy * uy) / n, b = (vy * ux - vx * uy) / n;
    return [a, b, -b, a, to[0][0] - a * a0[0] + b * a0[1], to[0][1] - b * a0[0] - a * a0[1]];
  };
  function paint(node, M, name, index, m, duty) {
    const f = M.characters[name].frames[index];
    const box = f.rect.join(" ");
    const win = node.firstElementChild;
    if (win.getAttribute("viewBox") !== box) win.setAttribute("viewBox", box);
    node.setAttribute("transform", "matrix(" + m.map((v) => +v.toFixed(4)).join(" ") + ")");
    node.toggleAttribute("data-duty", duty);
  }
  return { frameOf, byFeet, byGrips, paint };
})();
`;

export const SPRITE_CSS = `.so-sprite{pointer-events:none}.so-sprite[data-duty]{filter:drop-shadow(7px 0 0 var(--crew-duty)) drop-shadow(-7px 0 0 var(--crew-duty)) drop-shadow(0 7px 0 var(--crew-duty)) drop-shadow(0 -7px 0 var(--crew-duty))}`;
