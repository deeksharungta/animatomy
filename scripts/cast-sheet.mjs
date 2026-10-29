import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../kit/iso-kit.mjs";
import { critter, critterSvg, crewCss, SPECIES, ROLES } from "../kit/critters.mjs";

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
];
// Birds work with the beak and fly instead of hanging or going on all fours.
const fw = (deg, d, z) => [Math.cos((deg * Math.PI) / 180) * d, Math.sin((deg * Math.PI) / 180) * d, z];
const BIRD = {
  reach: (sp, h) => ({ beak: sp === "pigeon" ? fw(h, SIZE * 0.5, SIZE * 0.1) : fw(h, SIZE * 0.3, SIZE * 0.8), lean: 0, look: [0, 0] }),
  "all fours": () => ({ stance: "up", wings: 0.5, hop: SIZE * 0.12, stride: null }),
  hanging: () => ({ stance: "up", wings: 1, hop: SIZE * 0.18 }),
};
// A species with no limbs (the eel) lies along a path instead: each cell gets a shape for its body.
const R = SIZE * 0.6;
const curl = (turns, r0, r1, n = 30) => Array.from({ length: n }, (_, i) => { const t = i / (n - 1), a = AZ * (Math.PI / 180) + t * turns * Math.PI * 2, r = r0 + (r1 - r0) * t; return [r * Math.cos(a), r * Math.sin(a), 0]; });
const PATHS = {
  reach: { path: curl(0.45, R * 0.2, R, 12).reverse(), charge: 1, flicker: 2, target: [R * 0.9, R * 0.2, 4] },
  "all fours": { path: curl(1.6, R, R * 0.25) },
  asleep: { path: curl(1.2, R * 0.85, R * 0.3) },
  startled: { charge: 1, flicker: 5 },
};
const roles = Object.keys(ROLES);
const W = 132, H = 150;
const P = k.fitProjection([[-20, -20, 0], [20, 20, 0], [0, 0, SIZE * 1.25], [-20, 20, SIZE * 1.25]], W, H, { pad: 12 });
const tile = (name, i, cell) => {
  const pose = { at: [0, 0, 0], heading: cell.heading, ...(cell.pose ?? {}) };
  if (SPECIES[name].path) Object.assign(pose, PATHS[cell.label] ?? {});
  else if (SPECIES[name].beak) Object.assign(pose, BIRD[cell.label]?.(name, cell.heading) ?? {});
  else if (cell.hang) {
    const h = (cell.heading * Math.PI) / 180, f = [Math.cos(h), Math.sin(h)], l = [-Math.sin(h), Math.cos(h)];
    // Hang from a bar at a fixed height: the body drops by the shoulder height plus most of the arm.
    const A = SPECIES[name].arms, sh = -(A.hang ?? A).near[1] / 100, arm = (A.l1 + A.l2) / 100;
    pose.at = [0, 0, SIZE * (0.92 - sh - arm * 0.7)];
    const ahead = (SIZE * -(A.hang ?? A).near[0]) / 100;
    pose.paws = { l: [f[0] * ahead + l[0] * 2, f[1] * ahead + l[1] * 2, SIZE * 0.8], r: [f[0] * ahead - l[0] * 2, f[1] * ahead - l[1] * 2, SIZE * 0.8] };
  }
  if (cell.paws && SPECIES[name].arms) {
    const h = (cell.heading * Math.PI) / 180, f = [Math.cos(h), Math.sin(h)], l = [-Math.sin(h), Math.cos(h)];
    // A point in front of the chest, as far as this species' arms comfortably go.
    const A = SPECIES[name].arms, sh = -A.near[1] / 100, arm = (A.l1 + A.l2) / 100;
    const ahead = SIZE * (0.1 + arm * 0.55), up = SIZE * (sh + arm * 0.2), w = SIZE * 0.04;
    pose.paws = { l: [f[0] * ahead + l[0] * w, f[1] * ahead + l[1] * w, up], r: [f[0] * ahead - l[0] * w, f[1] * ahead - l[1] * w, up] };
  }
  const c = critter({ species: name, size: SPECIES[name].path ? SIZE * 1.6 : SIZE, role: roleArg ?? roles[(i * 3) % roles.length] }, pose, P);
  const halo = cell.hang && SPECIES[name].arms ? `<path class="iso-line" data-tone="mid" d="${k.segment([-6, -6, SIZE * 0.8 + 0.6], [6, 6, SIZE * 0.8 + 0.6], P)}"/>` : `<path class="iso-halo" d="${k.haloOf({ x: -10, y: -10, w: 20, d: 20, r: 10 }, 0, 0.1, P)}" style="filter:blur(3px)"/>`;
  return `<div class="cell">${k.figureSvg({ width: W, height: H, label: `${name}, ${cell.label}`, body: [halo, critterSvg(c, { duty: cell.label === "reach" })] })}<span>${name} · ${cell.label}${Object.values(c.reach).some((v) => v > 0.5) ? " · out of reach" : ""}</span></div>`;
};
const grid = species.map((name, i) => cells.map((cell) => tile(name, i, cell)).join("")).join("");
const css = `${crewCss()}.cast{display:grid;grid-template-columns:repeat(${cells.length},1fr);gap:4px}.cell{display:flex;flex-direction:column;align-items:center}.cell span{font:11px var(--anatomy-mono);color:var(--anatomy-muted)}`;
const html = k.pageHtml({ title: "Cast sheet", theme, width: W * cells.length + 80, body: `<style>${css}</style>${k.plateHtml({ fig: "Cast", title: "Staff Only crew", hint: "every species, every heading, every pose", body: `<div class="cast">${grid}</div>` })}` });
writeFileSync(out, html);
console.log("wrote", out);
