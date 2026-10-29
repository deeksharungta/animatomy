import test from "node:test";
import assert from "node:assert/strict";
import * as k from "../kit/iso-kit.mjs";
import { sphereOf } from "../kit/lathe.mjs";
import { critter, critterSvg, critterBox, crewCss, ellipsoidOf, SPECIES, ROLES } from "../kit/critters.mjs";

const P = k.fitProjection([[-40, -40, 0], [40, 40, 0], [0, 0, 40]], 400, 300, { pad: 20 });
const numbers = (d) => (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);

test("every species builds at every heading, stance and eye state without a NaN", () => {
  const eyes = ["open", "shut", "happy", "wide"];
  const stances = [undefined, "four", "hang"];
  for (const species of Object.keys(SPECIES)) {
    for (const heading of [0, 45, 135, 225, 315]) {
      stances.forEach((stance, i) => {
        const role = Object.keys(ROLES)[(heading / 45 + i) % 8];
        const c = critter({ species, size: 24, role }, { at: [0, 0, 0], heading, stance, lean: 8, look: [0, 10], eyes: eyes[(heading / 45 + i) % 4], stride: { phase: 0.3, amount: 0.1 }, paws: { l: [6, 3, 12] } }, P);
        const svg = critterSvg(c);
        assert.ok(!svg.includes("NaN") && !svg.includes("undefined"), `${species} at ${heading} ${stance ?? "up"} draws cleanly`);
        assert.ok(svg.includes(`url(#so-${species}-v-fur)`), `${species} is painted with its own fur`);
        for (const [key, value] of Object.entries(c.dyn)) assert.ok(svg.includes(`data-k="${key}"`) || value === "scale(0)", `${species} has a node for ${key}`);
        const [x0, y0, x1, y1] = critterBox(c);
        assert.ok(x1 > x0 && y1 > y0, `${species} has a box`);
      });
    }
  }
});

test("an animal faces the way it heads, and shows its back when it walks away", () => {
  const at = (heading) => critter({ species: "hamster", size: 20 }, { at: [0, 0, 0], heading }, k.fitProjection([[-40, -40, 0], [40, 40, 0], [0, 0, 40]], 400, 300, { pad: 20, azimuth: 45 }));
  assert.equal(at(0).mirror, true, "heading +x faces screen right");
  assert.equal(at(90).mirror, false, "heading +y faces screen left");
  assert.equal(at(0).front, true);
  assert.equal(at(200).front, false, "heading away shows the back");
});

test("the same pose draws the same picture", () => {
  const pose = { at: [2, 1, 0], heading: 30, lean: 5, look: [0, 8], eyes: "happy", paws: { r: [6, 2, 12] } };
  assert.equal(critterSvg(critter({ species: "squirrel", size: 22 }, pose, P)), critterSvg(critter({ species: "squirrel", size: 22 }, pose, P)));
});

test("reach reports how far a paw falls short", () => {
  const near = critter({ species: "squirrel", size: 25 }, { at: [0, 0, 0], heading: 0, paws: { l: [4, 1.5, 13], r: [4, -1.5, 13] } }, P);
  assert.equal(near.reach.l, 0);
  assert.equal(near.reach.r, 0);
  const far = critter({ species: "squirrel", size: 25 }, { at: [0, 0, 0], heading: 0, paws: { l: [40, 3, 9] } }, P);
  assert.ok(far.reach.l > 20);
});

test("ellipsoidOf with equal axes matches sphereOf", () => {
  const c = [3, -2, 7], r = 5;
  const e = ellipsoidOf(c, [[r, 0, 0], [0, r, 0], [0, 0, r]], P, { steps: 48 });
  const s = sphereOf(c, r, P, { steps: 48 });
  const box = (d) => {
    const n = numbers(d), xs = n.filter((_, i) => i % 2 === 0), ys = n.filter((_, i) => i % 2 === 1);
    return [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  };
  box(e.outline).forEach((v, i) => assert.ok(Math.abs(v - box(s.outline)[i]) < 0.2, "outline bounds match"));
  box(e.shades[3]).forEach((v, i) => assert.ok(Math.abs(v - box(s.shades[3])[i]) < 0.3, "highlight cap matches"));
});

test("crewCss colours every species and role, and nothing else", () => {
  const css = crewCss();
  for (const species of Object.keys(SPECIES)) assert.ok(css.includes(`[data-species="${species}"]`));
  for (const role of Object.keys(ROLES)) assert.ok(css.includes(`[data-role="${role}"]`));
  assert.ok(!css.includes("mat-"), "machines are not coloured");
});

test("an eel lies along its path, head first, and crackles only while charged", () => {
  const path = [[12, 0, 0], [0, 0, 0], [-10, 6, 0], [-24, 6, 0]];
  const quiet = critter({ species: "eel", size: 30, role: "power" }, { path }, P);
  const live = critter({ species: "eel", size: 30, role: "power" }, { path, charge: 1, flicker: 4, target: [14, 0, 2] }, P);
  assert.equal(quiet.dyn.zap, "", "no sparks without charge");
  assert.ok(live.dyn.zap.length > 40, "sparks while charged");
  const [x0, y0, x1, y1] = critterBox(quiet);
  const snout = k.iso(path[0], P);
  assert.ok(snout[0] >= x0 && snout[0] <= x1 && snout[1] >= y0 && snout[1] <= y1, "the head is at the start of the path");
  assert.equal(quiet.mirror, true, "a head pointing right mirrors the drawing");
});

test("a bird reaches with its beak, and says when a target is too far", () => {
  const P9 = { origin: [0, 0], scale: 9, azimuth: 45, elevation: 30 };
  const peck = critter({ species: "woodpecker", size: 22 }, { at: [0, 0, 0], heading: 90, beak: [0, 8, 18] }, P9);
  assert.ok(peck.reach.beak < 0.3, "a woodpecker strikes a point just ahead of its beak");
  const far = critter({ species: "woodpecker", size: 22 }, { at: [0, 0, 0], heading: 90, beak: [0, 40, 20] }, P9);
  assert.ok(far.reach.beak > 10, "a target well out of reach is reported");
  const flap = critter({ species: "woodpecker", size: 22 }, { at: [0, 0, 0], heading: 90, wings: 1 }, P9);
  assert.notEqual(flap.key, peck.key, "spread wings swap the wing drawing");
});
