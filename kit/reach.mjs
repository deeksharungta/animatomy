import { critter } from "./critters.mjs";

// Reach for the crew: check that every working paw lands on its handle, and search for a spot where it does.
// A pose list is [label, pose] pairs, one per moment worth checking (both ends of travel, every stop).

// The worst shortfall over a pose list, in world units, and where it happened.
export function worstReach(spec, poses, P) {
  let worst = 0, where = "";
  for (const [label, pose] of poses) {
    for (const [paw, short] of Object.entries(critter(spec, pose, P).reach ?? {})) if (short > worst) { worst = short; where = `${label} (${paw === "l" ? "left" : "right"} paw)`; }
  }
  return { worst, where };
}

// Print a warning for every paw short by more than `limit` in any pose; returns how many it printed.
export function checkReach(spec, poses, P, { limit = 0.3, name = spec.name ?? spec.species } = {}) {
  let n = 0;
  for (const [label, pose] of poses) {
    for (const [paw, short] of Object.entries(critter(spec, pose, P).reach ?? {})) {
      if (short > limit) { n++; console.warn(`${name}'s ${paw === "l" ? "left" : "right"} paw is ${short.toFixed(1)} short ${label}`); }
    }
  }
  return n;
}

// Try every size, heading and spot on a grid round `at` (in x and y, `step` apart, within `radius`) and return the
// place whose worst paw is shortest: { at, heading, size, worst, where }. posesAt(place) builds the pose list for a
// candidate place, so the poses follow the critter wherever it stands. Ties go to the spot nearest `at`.
// By default only headings that show the critter's face are tried (within 75° of facing the camera); `clear(place)`
// returning false rejects a spot whose body would pass through a part.
export function findPlace(spec, posesAt, P, { at, radius = 6, step = 1, sizes = [spec.size], headings = facing(P), clear = () => true }) {
  let best = null;
  for (const size of sizes) for (const heading of headings) {
    for (let dx = -radius; dx <= radius + 1e-9; dx += step) for (let dy = -radius; dy <= radius + 1e-9; dy += step) {
      const place = { at: [at[0] + dx, at[1] + dy, at[2] ?? 0], heading, size };
      if (!clear(place)) continue;
      const { worst, where } = worstReach({ ...spec, size }, posesAt(place), P);
      const far = Math.hypot(dx, dy);
      if (!best || worst < best.worst - 1e-6 || (Math.abs(worst - best.worst) <= 1e-6 && far < best.far)) best = { ...place, worst, where, far };
    }
  }
  if (!best) throw new Error("findPlace: clear() rejected every spot");
  const { far, ...place } = best;
  return place;
}

// Headings that show a critter's face: the camera's azimuth faces the viewer, so every 15° within 75° of it.
export const facing = (P) => Array.from({ length: 11 }, (_, i) => (((P.azimuth ?? 45) - 75 + i * 15) % 360 + 360) % 360);
