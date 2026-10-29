# Crew

Every Staff Only figure is an Anatomy figure with a crew inside. This page is everything about the crew: who gets cast, how they look, how they move, and how to check them. Everything in `craft.md` still applies to the machine around them.

## Contents
1. The premise
2. Casting rules
3. Roles and colours
4. The cast
5. Building a critter
6. Paws, handles and reach
7. The on-duty light
8. Motion
9. Painter's order and performance
10. Verifying a crew
11. Adding a species
12. Anti-patterns

## 1. The premise

The machine is real; the workforce is fake. Every machine is secretly run by a tiny crew of cartoon animals, and each crew member's job is a real part. A beaver chewing round the pencil *is* the cutter; hamsters on a wheel *are* the motor; a crab holding on *is* the latch.

The rule that makes it work: **a crew member's motion is the part's real motion.** Take the crew away and the mechanism is still true. If a critter isn't doing a part's job, cut it. The reader learns how the thing works, and laughs while they do.

The tone is "you were never meant to see this": a peek behind a door marked Staff Only. Keep it in the drawing, not in words.

## 2. Casting rules

1. **The species' trait is the job.** Claws grip, teeth cut, wheels run, a slow animal times things. If you can't say why that animal does that job in three words, it's the wrong animal.
2. **Colour by role, not by species.** Eight role colours, fixed for every figure (section 3). Many species share one role; a reader learns eight colours, never forty.
3. **One operator per mechanism.** A part that moves on its own power gets exactly one operator. A part pushed by another part (a plunger riding a block, a gear driven by a gear) needs none. A swarm of one species (ants, hamsters) counts as one operator.
4. **Two to five per figure.** More than five critters on screen stops reading. A machine with more mechanisms keeps the extras off duty and out of frame, or splits into two figures.
5. **A flaw for every member, kept for later.** Each species has a habit that would cause a real failure (the sloth dozes off, the crab won't let go). Note it in the crew list. Don't show it unless the user asks for a "break it" moment; then the failure shown must be the real failure that habit causes.

Write the crew list next to the parts list, one line each:

```
Pip · squirrel · moving · pushes the carriage by its knob · flaw: gets distracted, carriage stops short
Mo  · sloth    · sensing · walks the needle round the dial  · flaw: dozes off, reading lags
```

## 3. Roles and colours

`ROLES` in `kit/critters.mjs`. Each critter wears one item in its role colour; in light and dark the kit derives a four-tone ramp from the colour, like every other solid.

| Role | Colour | Hex | Mechanisms |
|---|---|---|---|
| power | sunflower yellow | `#F5C518` | motors, current, anything that runs |
| holding | tomato red | `#E5484D` | latches, clamps, brakes, grips |
| cutting | violet | `#8E4EC6` | blades, cutters, grinders, shredders |
| sensing | sky blue | `#3E9BDB` | gauges, thermostats, timers, switches that read |
| moving | leaf green | `#46A758` | carriages, rollers, conveyors, feeders |
| heat | ember orange | `#F76B15` | heating elements, igniters |
| fluid | aqua | `#12A594` | pumps, hoses, valves, cooling |
| spring | bubblegum pink | `#E93D82` | springs, launchers, returns |

The machine and the scene take pale, low-saturation material colours (`MATERIALS`: shell, inside, steel, iron, brass, plastic, wood, desk, wall, paint, rubber, paper, graphite; wrap a part in `<g data-c="mat-steel">`). The crew is the only bold colour in the picture, so the eye finds them first, and the role colour says what each one does before anyone reads the legend. Don't paint machine parts in role colours, and keep materials pale: a saturated housing fights the crew (an apricot shell read as "power yellow" on the first sharpener and was taken down to a pale sage).

Role items (`spec.wear`): `hat` (hard hat), `scarf`, `band` (headband), `cap` (beanie with a pompom), `goggles`. Pick whichever reads best on that species' head; the colour carries the meaning, not the item.

## 4. The cast

`SPECIES` in `kit/critters.mjs`. Each is data: proportions of body, head, ears, snout, eyes, arms, legs and tail in units of the critter's height, plus fur colours.

| Species | Good at | Body plan notes |
|---|---|---|
| hamster | power (running wheels), carrying | chubby, round ears, cheek pouches, stub tail |
| mouse | small precise jobs, sorting | big round ears, pink paws, long thin tail |
| squirrel | moving, storing, quick fetching | pointed ears, big bushy tail |
| beaver | cutting, gnawing, building | buck teeth, flat paddle tail |
| sloth | sensing and timing, slow steady holds | long arms, face mask and eye patches, no tail |
| mole | digging, pushing through, inspecting | long pink snout, big pink paws, tiny eyes |
| kangaroo | spring, launching, stamping | tall ears, long feet, thick tail |

Show the cast before placing anyone: `node scripts/cast-sheet.mjs --light` (and without `--light`) writes `cast-sheet*.html` with every species at four headings (facing you, left, right, away) and in four poses (reaching, walking, asleep, startled). `--only=sloth,beaver`, `--wear=hat` and `--role=power` narrow it. Capture it and read it at 2×: a species whose face doesn't read facing you, or whose silhouette doesn't read from the side, is not ready for a figure.

Recurring cast: give each critter a name and keep the same species, role and item across a set of figures, so readers learn them.

## 5. Building a critter

```js
import { critter, critterSvg, crewCss } from "../../kit/critters.mjs";

const PIP = { species: "squirrel", name: "Pip", size: 25, role: "moving", wear: "scarf" };
const pose = {
  at: [x, y, z],              // the point between its feet, on the surface it stands on
  heading: 30,                // degrees in the floor plane, 0 = +x; toward the viewer is the camera azimuth
  lean: 10,                   // forward lean in degrees, negative leans back
  look: [yaw, pitch],         // head turn in degrees
  paws: { l: [x, y, z], r: [x, y, z] },   // world points the paws hold; omit for a resting paw
  stride: { phase, amount },  // legs: phase from distance travelled, amount ~0.1 while walking
  hop: 0, squash: 0,          // lift in world units; 0..1 squash for a sit, a strain or a landing
  eyes: "open",               // "open" | "shut" | "happy" | "wide"
  tailSway: 0,                // -1..1
};
const c = critter(PIP, pose, P);          // { parts, reach, … }, pure, no DOM
svg.push(critterSvg(c, { part: "pip" })); // build time
// page: <style>${crewCss()}</style> once, before the figure
```

- **Size** is the critter's height in world units. Pick it against the part it operates: about half a carriage's length, a third of a dial's diameter. Keep sizes consistent across a set; a squirrel at 25 and a sloth at 18 sit well in the dial example.
- **Built from the kit.** Heads are `sphereOf`; bodies, limbs, ears, snouts and hats are `ellipsoidOf` (an ellipsoid shaded exactly like `sphereOf`, with an optional clip plane for domes and caps); tails and scarves are blobs (spheres drawn as one body under one outline). Faces are decals on the head: eyes, a gleam, blush, a mask. Everything has the four-tone ramp and the kit's outline, so a critter sits in the drawing's own camera and light.
- **Colour comes from tokens.** Every part carries `data-c` (`squirrel-fur`, `role-moving`, `eye`…) and `crewCss()` maps each one to the kit's `--anatomy-*` tokens in both themes, the way a cavity gets its own token set in `craft.md`, section 7. Never type a colour into a critter's markup.
- **Facing.** Find the heading that faces the viewer once (`heading = azimuth`) and work from it. A critter facing the reader reads best; one with its back to the reader is fine while it works, but don't leave it there at rest.

## 6. Paws, handles and reach

A paw that works is a contact, like a pipe end on its port (`craft.md`, section 8, "Contacts and junctions"):

- **Targets come from the part.** Compute each paw target from the same numbers that place the handle: the knob's centre plus its radius, the needle's points at a set distance from the hub. Never from the critter.
- **Place the critter from the handle, not the other way round.** Stand it where both paws reach: `at` = handle − about 0.35 × size along its heading. Arms stretch up to 1.35 × their length (a cartoon stretch); beyond that `critter(…).reach.l` / `.r` report how far the paw falls short, in world units.
- **Check reach in the build** at both ends of travel and at every stop, and print a warning for any paw short by more than 0.3 (`examples/dial-indicator-crew/build.mjs` does this). Ship at zero warnings.
- **Grip from the side you can see.** Put the critter on the viewer's side of its handle, so the paws and face are in view.
- **Standing.** Feet stand on a real surface at its real height: a plate's top, a dial's face, a platform. Not on a slab's edge, not in the air (a hop is the one exception, and it lands).
- **Clearance.** No critter's body passes through a part, at rest or anywhere in its travel; keep its body radius clear of the nearest face. Crowding a critter against a rail at full stroke reads like a sunk part.

## 7. The on-duty light

Anatomy lights exactly one part: the one to watch. Staff Only lights exactly one critter: the one whose part is moving now.

- Set `data-duty` on that critter's group (`critterSvg(c, { duty: true })` or `el.toggleAttribute("data-duty", …)`). Its outline takes `--crew-duty` (white in dark, black in light) and a heavier stroke.
- Choose it from the motion itself: the fastest-moving part's operator, above a small threshold, so a stop hands the light back.
- When nothing moves, nobody is on duty and the lit accent returns to the subject part, as in Anatomy. The dial example lights the plunger at rest and toggles the plunger's `data-lit` off while a critter is on duty.
- Never light two critters, and never light a critter and a part at the same time.

## 8. Motion

Everything in `motion.md` applies; the machine stays calm and eased. The crew rides on top of it:

- **Pose from the model, every frame.** `paintCritter(el, critter(spec, poseOf(state), P))` inside the same `tick` that moves the parts, after the parts. Inline the crew with `kitScript() + crewScript() + live` and call `CREW.critter` and `CREW.paintCritter` in the page.
- **Stride from distance, not time.** `stride.phase = x / strideLength`, so feet don't slide; `amount` fades to 0 as the speed does.
- **Lean from effort.** Lean into a push (positive), back on a pull (negative), in proportion to speed, clamped.
- **Small life, never a part.** Eyes `happy` when the job is done, `shut` after the part has been still a while (the sloth dozes), `wide` on a sudden move. A breath or a tail sway is fine. A critter never moves a part the model didn't move.
- **Reduced motion.** Critters jump to their pose like every other part, no stride, no blink.
- **Shape writes.** `paintCritter` rewrites `d` attributes in place while the set of parts is the same and rebuilds the group when it changes (eyes opening, a part turning out of view).

## 9. Painter's order and performance

- **Within a critter** parts are ordered by the depth of their nearest point; decals sit just above their host. `critter()` returns them sorted.
- **In the figure** a critter is one item in the slot where it physically stands, like any moving part. In the dial example Pip is drawn after the carriage, plunger and dial (he stands in front of all three) and Mo after the needle he holds. If a critter can pass in front of and behind the same part during its travel, split that part or bound the travel, as `craft.md`, section 5 says for any moving part.
- **The audit doesn't record critters yet.** They are drawn in their slot and checked by eye at 4× (section 10). Keep them clear of pipes and cables, and don't route a line through where a critter stands.
- **Cost.** A critter rebuilds in about 1.5 ms (a dozen ellipsoids and a few blobs). Two critters keep a frame near 3 ms. Rebuild only while something moves, stop the loop when settled, and keep blobs short (a tail of 11 beads, a scarf of 16). Measure with `drive.mjs` if a figure has more than three.

## 10. Verifying a crew

Add these to `verify.md`'s list:

1. **Cast sheet first.** `node scripts/cast-sheet.mjs --only=… --light` and without `--light`; read both at 2×.
2. **Reach is zero.** The build prints no reach warnings at either end of travel or at any stop.
3. **4× close-ups in both themes** of every critter at rest, at both ends of its travel and mid-motion: paws on the handle, feet on the surface, nothing sunk into a part, the face readable, the role item on the head and not hiding the eyes.
4. **390 px wide.** Every critter's face and role colour still read. If not, raise its size before shrinking anything else.
5. **The duty light** is on the critter whose part is moving in each frame of a contact sheet, and on the part when nothing moves.
6. **Line ends.** `scripts/lines.mjs` must still print `line ends: 0`; eye arcs carry `data-free`, every other crew line is closed.

## 11. Adding a species

Add an entry to `SPECIES` in `kit/critters.mjs`. Everything is in units of the critter's height:

```js
otter: {
  fur: "#7A5A43", belly: "#D8C2A6", dark: "#5A4030",   // three fur colours; optional face for a mask
  body: { r: 0.22, h: 0.56, z: 0.06, egg: 0.14 },       // egg > 0.12 adds wide hips
  head: { r: 0.19, x: 0.04, z: 0.7 },
  ears: { kind: "round", r: 0.04, az: 60, el: 40, inner: "dark" },   // "round" | "point" | "none"
  snout: { kind: "muzzle", r: 0.08, c: "belly" },       // "cheeks" | "muzzle" | "long" | "none"
  nose: { r: 0.028, c: "nose" },
  eyes: { r: 0.032, az: 28, el: 14 },
  blush: true,
  arms: { len: 0.17, r: 0.045, paw: 0.05, c: "dark" },
  legs: { r: 0.06, foot: 0.07, c: "dark" },
  tail: { kind: "thick", r: 0.08 },                     // "stub" | "bushy" | "paddle" | "thin" | "thick" | "none"
},
```

Then render it on the cast sheet in both themes, read it at 2×, and fix proportions before using it. A species needs a different body plan (a crab's six legs and claws, an ant's three segments, a bird's wings) when the mammal plan can't say what it does; add a plan as its own builder beside `critter`, using the same parts (`ellipsoidOf`, `sphereOf`, blobs, decals) and the same output, so `critterSvg` and `paintCritter` work unchanged.

## 12. Anti-patterns

- **Decorative crew.** A critter waving at the reader, or standing beside a part that moves by itself. Every critter has a job.
- **A crew that lies.** A critter that turns a part the wrong way, at a different speed from the model, or before the part moves. The motion is the part's motion.
- **Flat cartoons on an isometric drawing.** Characters drawn side-on and pasted over the machine. Build them from the kit in the figure's camera.
- **Rainbow crew.** Colours by species, or several colours per critter. One role colour per critter, from the eight.
- **A loud machine.** Saturated housings and parts compete with the crew. Materials stay pale.
- **Speech bubbles and name tags.** Words stay in the legend.
- **Floating paws.** A paw a few units short of its handle reads like a pipe ending in the air. The reach check catches it; a 4× close-up confirms it.
- **Crowds.** Eight critters on one machine. Two to five, one on duty at a time.
- **A crew that hides the mechanism.** A body parked over the part it explains. Put the critter beside its handle on the viewer's side, and make the part visible around it.
