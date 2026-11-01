// Drawn crew: for a species with a bundled sprite sheet (assets/crew/), turn the rig's pose into a frame of
// that sheet and the matrix that pins it in the drawing. Pure, so the build and the page share it. The rig
// still decides everything that moves: where the animal stands, which way it faces, what it is doing.

// The actions a pose asks for, best first. A pose with none of them in the sheet is drawn by the rig instead.
export function spriteActions(c) {
  if (c.hang) return ["hang"];
  if (c.stance === "four") return c.place.stride ? ["run"] : ["stand4", "run"];
  if (c.place.wings >= 0.5) return ["fly", "idle"];
  if (c.place.beak) return ["peck", "work", "idle"];
  if (c.eyes === "wide" || c.place.hop > 0.5) return ["react", "idle"];
  if (c.eyes === "shut") return ["sleep", "idle"];
  if (c.place.paws) return ["work", "idle"];
  return c.place.stride ? ["walk", "idle"] : ["idle"];
}

// Which frame of an action plays now: walking and running follow the stride, idle blinks now and then,
// a reaction plays once, everything else loops at its own pace.
function spriteFrame(M, list, action, t, phase) {
  const A = M.actions[action] ?? { fps: 4, loop: true }, n = list.length;
  if (action === "walk" || action === "run") return list[Math.floor((((phase % 1) + 1) % 1) * n) % n];
  if (action === "idle") { const q = t % 4.8; return list[q < 4 ? 0 : Math.min(n - 1, Math.floor((q - 4) / 0.2) + 1)]; }
  const i = Math.floor(t * A.fps);
  return list[A.loop ? i % n : Math.min(n - 1, i)];
}

// Claws onto what they hold: the sheet's scale stays the rig's, the grips' midpoint lands on the paws'
// midpoint, and the figure leans with the bar a little (at most 11°: it hangs, so gravity keeps it upright).
function spriteGrips(g, paws, s, flip) {
  const G = g.map(([x, y]) => [x * flip * s, y * s]), mid = (q) => [(q[0][0] + q[1][0]) / 2, (q[0][1] + q[1][1]) / 2];
  const turn = (p) => { let t = Math.atan2(p[1][1] - p[0][1], p[1][0] - p[0][0]) - Math.atan2(G[1][1] - G[0][1], G[1][0] - G[0][0]); t = Math.atan2(Math.sin(t), Math.cos(t)); return t; };
  const [ta, tb] = [turn(paws), turn([paws[1], paws[0]])], t = Math.max(-0.2, Math.min(0.2, Math.abs(ta) <= Math.abs(tb) ? ta : tb));
  const c = Math.cos(t), sn = Math.sin(t), gm = mid(G), pm = mid(paws);
  return [c * flip * s, sn * flip * s, -sn * s, c * s, pm[0] - (c * gm[0] - sn * gm[1]), pm[1] - (sn * gm[0] + c * gm[1])];
}

// The frame and its matrix (from cell units to the drawing), or null when the sheet has no art for the pose.
export function spriteOf(M, c, t = 0) {
  const ch = M.characters[c.species];
  const action = ch && spriteActions(c).find((a) => ch.actions[a]?.length);
  if (!action) return null;
  const index = spriteFrame(M, ch.actions[action], action, t, c.place.stride?.phase ?? 0), f = ch.frames[index];
  // One art scale per sheet, set by the animal standing; a sheet drawn only on all fours is scaled by that.
  const { base, k, h, h4, paws } = c.place;
  const s = (k * (ch.fourScale?.includes(action) ? h4 : h)) / ch.height, flip = (ch.facing === "right") !== c.mirror ? -1 : 1;
  if (f.grips && paws?.l && paws?.r) return { index, rect: f.rect, m: spriteGrips(f.grips, [paws.l, paws.r], s, flip) };
  // Otherwise the feet on the ground point, scaled to the rig's height and turned the way the animal faces.
  return { index, rect: f.rect, m: [s * flip, 0, 0, s, base[0] - f.feet[0] * s * flip, base[1] - f.feet[1] * s] };
}

// A drawn critter's slot: a cell-sized window onto its sheet, framed and pinned by `spritePaint`.
export const spriteSlot = (name, cell) => `<g class="so-sprite"><svg width="${cell}" height="${cell}" viewBox="0 0 ${cell} ${cell}" overflow="hidden"><use href="#so-atlas-${name}"/></svg></g>`;
export function spritePaint(slot, s) {
  const win = slot.firstElementChild, box = s.rect.join(" "), m = `matrix(${s.m.map((v) => +v.toFixed(4)).join(" ")})`;
  if (win.getAttribute("viewBox") !== box) win.setAttribute("viewBox", box);
  if (slot.getAttribute("transform") !== m) slot.setAttribute("transform", m);
}
