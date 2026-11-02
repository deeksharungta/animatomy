import { ART, ROLES } from "./cast.mjs";
import { ink } from "./head.mjs";
import { ramp } from "./eel.mjs";

// ---------- colour
export const hexToHsl = (hex) => {
  const v = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(v >> 16) & 255, (v >> 8) & 255, v & 255].map((x) => x / 255);
  const hi = Math.max(r, g, b), lo = Math.min(r, g, b), l = (hi + lo) / 2;
  if (hi === lo) return [0, 0, l * 100];
  const d = hi - lo, s = l > 0.5 ? d / (2 - hi - lo) : d / (hi + lo);
  const h = hi === r ? (g - b) / d + (g < b ? 6 : 0) : hi === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s * 100, l * 100];
};
export const hsl = (h, s, l) => `hsl(${h.toFixed(0)} ${Math.max(0, Math.min(100, s)).toFixed(0)}% ${Math.max(0, Math.min(100, l)).toFixed(1)}%)`;
// The illustrated look: natural-history drawing on paper, so every tone is lighter and more muted than the
// animal's own colour, and the shade stays soft; the ink line and the fur hatching carry the form.
export const toneVars = (name, hex) => {
  const [h, s0, l0] = hexToHsl(hex);
  const s = s0 * 0.62, l = l0 + (100 - l0) * 0.32;
  return `--so-${name}:${hsl(h, s, l)};--so-${name}-lit:${hsl(h - 4, s * 0.85, l + (100 - l) * 0.45)};--so-${name}-shade:${hsl(h + 6, s * 1.05, l * 0.78)}`;
};
export const TONES = ["fur", "belly", "dark", "skin", "mark"];

// The subject: the thing the machine works on (the bread, the pencil, the coin) is the one object in the
// machine drawn in its own colour, so the reader can follow it through. subjectCss(selector, light, dark)
// gives a group the kit's tone tokens in that colour, so every solid inside it keeps its shading and lit state.
export function subjectCss(sel, light, dark = light) {
  const ramp = (hex, darkTheme) => {
    const [h, s, l] = hexToHsl(hex);
    const L = (k) => hsl(h, s, Math.min(97, l * k));
    const base = darkTheme ? 0.82 : 1;
    return `--anatomy-paper:${L(base)};--anatomy-face:${L(base * 1.06)};--anatomy-top:${L(base * 1.12)};--anatomy-shade-0:${L(base * 0.72)};--anatomy-shade-1:${L(base * 0.8)};--anatomy-shade-2:${L(base * 0.88)};--anatomy-shade-3:${L(base * 0.95)};--anatomy-lit-top:${L(base * 1.16)};--anatomy-lit-shade:${L(base * 0.98)}`;
  };
  return `${sel}{${ramp(light, false)}}.iso[data-theme="dark"] ${sel},.iso:not([data-theme]) ${sel}{${ramp(dark, true)}}`;
}

// Older figures passed a material palette to crewCss. Machines take no colour now, so it is ignored.
export const paletteOf = () => ({});

export function crewCss() {
  const rules = [
    `.crew .so-tuft,.crew .so-strand,.crew .so-line{fill:none;stroke-linecap:round}`,
    `.crew{--so-ink:color-mix(in srgb,var(--so-fur-shade,#6b5d50) 45%,#3d3631)}`,
    `.crew .so-fig path[fill*="-v-"]{stroke:var(--so-ink);stroke-width:.6px;stroke-linejoin:round;vector-effect:non-scaling-stroke;paint-order:stroke}`,
    `.crew .so-strand{stroke:var(--so-ink)!important;opacity:.6!important;stroke-width:.35px!important;vector-effect:non-scaling-stroke}`,
    `.crew .so-tuft{stroke:var(--so-ink)!important;opacity:.55!important;stroke-width:.45px!important;vector-effect:non-scaling-stroke}`,
    `.crew [fill="#fff"][opacity=".5"]{display:none}`,
    `.crew [fill*="-eye)"],.crew [fill*="-eye)"]~[fill="#fff"]{transform-box:fill-box;transform-origin:center;transform:scale(.72)}`,
    `.crew [data-k="ground"]{opacity:.6}`,
    `.crew[data-duty]>.so-fig{filter:url(#so-duty)}`,
    `.iso{--crew-duty:#ffffff}.iso[data-theme="light"]{--crew-duty:#000000}`,
    `.crew{--so-ground:#000}`,
    `.iso{--so-zap:#FFE14D;--so-zap-core:#FFFBE8}.iso[data-theme="light"]{--so-zap:#E8A600;--so-zap-core:#FFF4C2}`,
  ];
  for (const [name, a] of Object.entries(ART)) {
    rules.push(`.crew[data-species="${name}"]{${TONES.filter((t) => a.colors[t]).map((t) => toneVars(t, a.colors[t])).join(";")};--so-eye:${a.colors.eye ?? "#120c08"};--so-nose:${a.colors.nose ?? a.colors.skin};--so-claw:${a.colors.claw ?? "#efe6da"};--so-whisker:${a.colors.whisker ?? "#f6f1e8"};--so-teeth:${a.colors.teeth ?? "#f4efe6"}}`);
  }
  for (const [name, r] of Object.entries(ROLES)) rules.push(`.crew[data-role="${name}"]{--so-role:${r.hex};--so-role-dark:${hsl(...(([h, s, l]) => [h, s, l * 0.62])(hexToHsl(r.hex)))}}`);
  return rules.join("\n");
}
