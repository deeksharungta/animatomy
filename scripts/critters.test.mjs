import test from "node:test";
import assert from "node:assert/strict";
import * as k from "../kit/iso-kit.mjs";
import { sphereOf } from "../kit/lathe.mjs";
import { critter, critterSvg, crewCss, ellipsoidOf, SPECIES, ROLES } from "../kit/critters.mjs";

const P = k.fitProjection([[-40, -40, 0], [40, 40, 0], [0, 0, 40]], 400, 300, { pad: 20 });
const numbers = (d) => (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);

test("every species builds at every heading, item and eye state without a NaN", () => {
  const wears = ["hat", "scarf", "band", "cap", "goggles", undefined];
  const eyes = ["open", "shut", "happy", "wide"];
  for (const species of Object.keys(SPECIES)) {
    for (const heading of [0, 45, 135, 225, 315]) {
      wears.forEach((wear, i) => {
        const role = Object.keys(ROLES)[i % 8];
        const c = critter({ species, size: 24, role, wear }, { at: [0, 0, 0], heading, lean: 8, eyes: eyes[i % 4], stride: { phase: 0.3, amount: 0.1 }, paws: { l: [6, 3, 12] } }, P);
        const svg = critterSvg(c);
        assert.ok(c.parts.length > 10, `${species} has parts`);
        assert.ok(!svg.includes("NaN"), `${species} at ${heading} with ${wear} has no NaN`);
        for (let j = 1; j < c.parts.length; j++) assert.ok(c.parts[j - 1].depth <= c.parts[j].depth, "parts come sorted by depth");
      });
    }
  }
});

test("reach reports how far a paw falls short", () => {
  const near = critter({ species: "squirrel", size: 25 }, { at: [0, 0, 0], heading: 0, paws: { l: [6, 3, 9], r: [6, -3, 9] } }, P);
  assert.equal(near.reach.l, 0);
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

test("crewCss defines every species colour and role in both themes", () => {
  const css = crewCss();
  for (const species of Object.keys(SPECIES)) assert.ok(css.includes(`[data-c="${species}-fur"]`));
  for (const role of Object.keys(ROLES)) assert.ok(css.includes(`[data-c="role-${role}"]`));
  assert.ok(css.includes('.iso[data-theme="light"]'));
});
