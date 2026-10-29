import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../kit/iso-kit.mjs";
import { critter, critterSvg, crewCss, SPECIES, ROLES } from "../kit/critters.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const theme = args.includes("--light") ? "light" : "dark";
const only = args.find((a) => a.startsWith("--only="))?.slice(7).split(",");
const wearArg = args.find((a) => a.startsWith("--wear="))?.slice(7);
const roleArg = args.find((a) => a.startsWith("--role="))?.slice(7);
const out = args.find((a) => a.startsWith("--out="))?.slice(6) ?? join(HERE, "..", `cast-sheet${theme === "light" ? "-light" : ""}.html`);
const species = only ?? Object.keys(SPECIES);
const SIZE = 30;
const AZ = 45;
const cells = [
  { label: "facing you", heading: AZ },
  { label: "to the left", heading: AZ + 60 },
  { label: "to the right", heading: AZ - 60 },
  { label: "away", heading: AZ + 180 },
  { label: "reach", heading: AZ - 20, pose: { lean: 12, look: [0, 8] }, paws: true },
  { label: "walk", heading: AZ - 50, pose: { stride: { phase: 0.25, amount: 0.12 }, lean: 6 } },
  { label: "asleep", heading: AZ, pose: { eyes: "shut", squash: 0.4, lean: -4 } },
  { label: "startled", heading: AZ, pose: { eyes: "wide", hop: 3 } },
];
const wears = ["hat", "scarf", "band", "cap", "goggles"];
const roles = Object.keys(ROLES);
const W = 132, H = 150;
const P = k.fitProjection([[-16, -16, 0], [16, 16, 0], [0, 0, SIZE * 1.25], [-16, 16, SIZE * 1.25]], W, H, { pad: 16 });
const tile = (name, i, cell) => {
  const pose = { at: [0, 0, 0], heading: cell.heading, ...(cell.pose ?? {}) };
  if (cell.paws) {
    const h = (cell.heading * Math.PI) / 180, f = [Math.cos(h), Math.sin(h)], l = [-Math.sin(h), Math.cos(h)];
    pose.paws = { l: [f[0] * 11 + l[0] * 4, f[1] * 11 + l[1] * 4, SIZE * 0.62], r: [f[0] * 11 - l[0] * 4, f[1] * 11 - l[1] * 4, SIZE * 0.62] };
  }
  const c = critter({ species: name, size: SIZE, role: roleArg ?? roles[(i * 3) % roles.length], wear: wearArg ?? wears[i % wears.length] }, pose, P);
  const halo = `<path class="iso-halo" d="${k.haloOf({ x: -10, y: -10, w: 20, d: 20, r: 10 }, 0, 0.1, P)}" style="filter:blur(3px)"/>`;
  return `<div class="cell">${k.figureSvg({ width: W, height: H, label: `${name}, ${cell.label}`, body: [halo, critterSvg(c, { duty: cell.label === "reach" })] })}<span>${name} · ${cell.label}${Object.values(c.reach).some((v) => v > 0.5) ? " · out of reach" : ""}</span></div>`;
};
const grid = species.map((name, i) => cells.map((cell) => tile(name, i, cell)).join("")).join("");
const css = `${crewCss()}.cast{display:grid;grid-template-columns:repeat(${cells.length},1fr);gap:4px}.cell{display:flex;flex-direction:column;align-items:center}.cell span{font:11px var(--anatomy-mono);color:var(--anatomy-muted)}`;
const html = k.pageHtml({ title: "Cast sheet", theme, width: W * cells.length + 80, body: `<style>${css}</style>${k.plateHtml({ fig: "Cast", title: "Staff Only crew", hint: "every species, every heading, every pose", body: `<div class="cast">${grid}</div>` })}` });
writeFileSync(out, html);
console.log("wrote", out);
