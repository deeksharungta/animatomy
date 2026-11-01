import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// The drawn crew's sheets: illustrated animals bundled with the skill (assets/crew/), so nobody using it needs
// an image model. A species with a sheet is drawn from it wherever the rig has art for the pose.
const DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "assets", "crew");
export const SPRITE_MANIFEST = JSON.parse(readFileSync(join(DIR, "sprites.json"), "utf8"));

// Each sheet goes into the page once, as a data URL in the first drawing of that species, so a one-file
// page works offline.
const embedded = new Set();
export function atlasDefs(name) {
  const ch = SPRITE_MANIFEST.characters[name];
  if (!ch || embedded.has(name)) return "";
  embedded.add(name);
  const [cols, rows] = ch.grid, c = SPRITE_MANIFEST.cell;
  return `<defs><image id="so-atlas-${name}" width="${cols * c}" height="${rows * c}" href="data:image/webp;base64,${readFileSync(join(DIR, ch.atlas)).toString("base64")}"/></defs>`;
}

// While a drawn critter works, a thin rim in the duty colour.
export const SPRITE_CSS = `.crew .so-sprite{pointer-events:none}.crew[data-duty] .so-sprite{filter:drop-shadow(6px 0 0 var(--crew-duty)) drop-shadow(-6px 0 0 var(--crew-duty)) drop-shadow(0 6px 0 var(--crew-duty)) drop-shadow(0 -6px 0 var(--crew-duty))}`;
