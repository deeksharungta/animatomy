import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../kit/iso-kit.mjs";
import { critter, critterSvg, crewCss, SPECIES, ROLES, PROPS } from "../kit/critters.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const theme = args.includes("--light") ? "light" : "dark";
const only = args.find((a) => a.startsWith("--only="))?.slice(7).split(",");
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
  { label: "reach", heading: AZ - 55, pose: { lean: 12, look: [0, 8] }, paws: true },
  { label: "walk", heading: AZ - 50, pose: { stride: { phase: 0.25, amount: 0.12 }, lean: 6 } },
  { label: "all fours", heading: AZ - 70, pose: { stance: "four", stride: { phase: 0.15, amount: 0.13 } } },
  { label: "hanging", heading: AZ - 60, pose: { stance: "hang", look: [0, 12] }, hang: true },
  { label: "asleep", heading: AZ, pose: { eyes: "shut", squash: 0.4, lean: -4 } },
  { label: "startled", heading: AZ, pose: { eyes: "wide", hop: 3 } },
  { label: "kitted out", heading: AZ + 40, pose: { look: [0, 6], eyes: "happy" }, kit: true },
];
// One outfit per species for the last column, so every prop shows up on some head, neck or paw.
const KIT = {
  hamster: ["sweatband", "whistle"], mouse: ["cap", "notebook"], squirrel: ["hardhat", "clipboard"], beaver: ["goggles", "mitts"],
  sloth: ["glasses", "stopwatch"], mole: ["minerhat"], kangaroo: ["sweatband", "whistle"], fennec: ["goggles", "mitts"],
  raccoon: ["glasses", "pencil"], otter: ["cap", "bowtie"], crab: ["hardhat"],
};
const roles = Object.keys(ROLES);
const W = 132, H = 150;
const P = k.fitProjection([[-20, -20, 0], [20, 20, 0], [0, 0, SIZE * 1.25], [-20, 20, SIZE * 1.25]], W, H, { pad: 12 });
const tile = (name, i, cell) => {
  const pose = { at: [0, 0, 0], heading: cell.heading, ...(cell.pose ?? {}) };
  if (cell.hang) {
    const h = (cell.heading * Math.PI) / 180, f = [Math.cos(h), Math.sin(h)], l = [-Math.sin(h), Math.cos(h)];
    // Hang from a bar at a fixed height: the body drops by the shoulder height plus most of the arm.
    const A = SPECIES[name].arms, sh = -(A.hang ?? A).near[1] / 100, arm = (A.l1 + A.l2) / 100;
    pose.at = [0, 0, SIZE * (0.92 - sh - arm * 0.7)];
    const ahead = (SIZE * -(A.hang ?? A).near[0]) / 100;
    pose.paws = { l: [f[0] * ahead + l[0] * 2, f[1] * ahead + l[1] * 2, SIZE * 0.8], r: [f[0] * ahead - l[0] * 2, f[1] * ahead - l[1] * 2, SIZE * 0.8] };
  }
  if (cell.paws) {
    const h = (cell.heading * Math.PI) / 180, f = [Math.cos(h), Math.sin(h)], l = [-Math.sin(h), Math.cos(h)];
    // A point in front of the chest, as far as this species' arms comfortably go.
    const A = SPECIES[name].arms, sh = -A.near[1] / 100, arm = (A.l1 + A.l2) / 100;
    const ahead = SIZE * (0.1 + arm * 0.55), up = SIZE * (sh + arm * 0.2), w = SIZE * 0.04;
    pose.paws = { l: [f[0] * ahead + l[0] * w, f[1] * ahead + l[1] * w, up], r: [f[0] * ahead - l[0] * w, f[1] * ahead - l[1] * w, up] };
  }
  const wear = cell.kit ? (KIT[name] ?? ["glasses"]).filter((w) => PROPS[w]) : [];
  const c = critter({ species: name, size: SIZE, role: roleArg ?? roles[(i * 3) % roles.length], wear }, pose, P);
  const halo = cell.hang ? `<path class="iso-line" data-tone="mid" d="${k.segment([-6, -6, SIZE * 0.8 + 0.6], [6, 6, SIZE * 0.8 + 0.6], P)}"/>` : `<path class="iso-halo" d="${k.haloOf({ x: -10, y: -10, w: 20, d: 20, r: 10 }, 0, 0.1, P)}" style="filter:blur(3px)"/>`;
  return `<div class="cell">${k.figureSvg({ width: W, height: H, label: `${name}, ${cell.label}`, body: [halo, critterSvg(c, { duty: cell.label === "reach" })] })}<span>${name} · ${cell.label}${Object.values(c.reach).some((v) => v > 0.5) ? " · out of reach" : ""}</span></div>`;
};
const grid = species.map((name, i) => cells.map((cell) => tile(name, i, cell)).join("")).join("");
const css = `${crewCss()}.cast{display:grid;grid-template-columns:repeat(${cells.length},1fr);gap:4px}.cell{display:flex;flex-direction:column;align-items:center}.cell span{font:11px var(--anatomy-mono);color:var(--anatomy-muted)}`;
const html = k.pageHtml({ title: "Cast sheet", theme, width: W * cells.length + 80, body: `<style>${css}</style>${k.plateHtml({ fig: "Cast", title: "Staff Only crew", hint: "every species, every heading, every pose, and dressed for work", body: `<div class="cast">${grid}</div>` })}` });
writeFileSync(out, html);
console.log("wrote", out);
