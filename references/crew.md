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
12. Props
13. Anti-patterns

## 1. The premise

The machine is real; the workforce is fake. Every machine is secretly run by a small crew of real-looking animals, and each crew member's job is a real part. A beaver chewing round the pencil *is* the cutter; hamsters on a wheel *are* the motor; a crab holding on *is* the latch.

The rule that makes it work: **a crew member's motion is the part's real motion.** Take the crew away and the mechanism is still true. If a critter isn't doing a part's job, cut it. The reader learns how the thing works, and laughs while they do.

The tone is "you were never meant to see this": a peek behind a door marked Staff Only. Keep it in the drawing, not in words.

## 2. Casting rules

1. **The species' trait is the job.** Claws grip, teeth cut, wheels run, a slow animal times things. If you can't say why that animal does that job in three words, it's the wrong animal.
2. **Colour by role, not by species.** Eight role colours, fixed for every figure (section 3). Many species share one role; a reader learns eight colours, never forty.
3. **One operator per mechanism.** A part that moves on its own power gets exactly one operator. A part pushed by another part (a plunger riding a block, a gear driven by a gear) needs none. A swarm of one species (ants, hamsters) counts as one operator.
4. **One per mechanism, up to seven per figure.** A detailed machine gets an operator for every mechanism that moves on its own: the toaster has five (the browning knob, the lever, the latch hook, the live wire and the bimetal strip). Past seven, the picture stops reading; split the machine into two figures.
5. **A flaw for every member, kept for later.** Each species has a habit that would cause a real failure (the sloth dozes off, the crab won't let go). Note it in the crew list. Don't show it unless the user asks for a "break it" moment; then the failure shown must be the real failure that habit causes.

Write the crew list next to the parts list, one line each:

```
Pip · squirrel · moving · pushes the carriage by its knob · flaw: gets distracted, carriage stops short
Mo  · sloth    · sensing · walks the needle round the dial  · flaw: dozes off, reading lags
```

## 3. Roles and colours

`ROLES` in `kit/critters.mjs`. Each critter wears a thin collar in its role colour, with a small tag at the throat. A sweatband takes the same colour (section 12).

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

**Colour belongs to the animals.** The machine and the scene are drawn exactly as Anatomy draws them: its paper and tone ramp, one lit accent, no colour. The animals carry their real fur colours, their role collars and their props, so they are the only colour in the picture and the eye finds them first. Never tint a machine part, a scene prop or a wall, and never paint a part in a role colour; the run's progress bar is the only other place the role colours appear.

**The subject is in its own colour.** The thing the machine works on (the bread, the pencil, the coin, the gauge blocks) is the one object in the machine drawn in its real colour, so the reader can follow it through: the bread golden with a pale crumb that browns as it toasts, the pencil in its yellow paint with a pink eraser. Wrap its solids in a group and give the group `subjectCss(".my-part", lightHex, darkHex)`: it sets the kit's tone tokens to a ramp of that colour, so the solid keeps its shading, its lit state and its lines. A subject made of several materials gets a group and a `subjectCss` per material: the pencil's paint, the bare wood and graphite of its cone and its eraser are four, and its metal ferrule stays in the kit's tones. What comes off the subject is the subject too: the pencil's shavings are wood with a yellow painted edge. A colour that changes with the model (toast browning) goes on as a tinted layer over the face, its opacity from the model. One subject per figure; never colour a machine part, a scene prop or the walls. A soft glow round the subject was tried first and dropped: it carried no information and leaked out where the subject was hidden.

**Light and heat are the exception.** What the machine gives off, not what it is made of, may glow in colour: a heating element's orange, a flame, a spark, an LED. Draw it with WebGL as Anatomy does (`webgl.md`): a canvas between a back and a front drawing that adds a warm glow (screen blend in dark, ink in light) and sparks, only while the part is on. The toaster's ribbons, the warm light on the bread and the contact spark are the reference. The glow never tints a part that is off. A crew member's own glow (an eel's charge) is part of the crew's drawing, in SVG, and follows the same rule: only while the current flows.

## 4. The cast

`SPECIES` in `kit/critters.mjs` lists the cast; the drawings are in `ART` in the same file. Each species is a painted illustration authored from the real animal: its silhouette, proportions, markings and fur colours.

| Species | Good at | What it looks like |
|---|---|---|
| hamster | power (running wheels), carrying | pear-shaped Syrian hamster, golden back, cream belly and cheeks, small round ears, pink paws; runs on all fours |
| mouse | small precise jobs, sorting | wood mouse: brown back, white underside, big round ears, big dark eyes, long ringed tail |
| squirrel | moving, storing, quick fetching | red squirrel: ear tufts, pale eye ring, white belly, dark long-toed feet, a plume of a tail curled up its back |
| beaver | cutting, gnawing, building | heavy and hunched, small ears, broad muzzle, orange incisors, webbed hind feet, flat scaled tail |
| sloth | sensing and timing, slow steady holds | three-toed sloth: shaggy coat, pale face mask with dark eye stripes, long arms with long claws; hangs from bars |
| mole | digging, pushing through, inspecting | velvet black coat, furred cone of a head with a short pink snout tip, huge pink spade hands with claws, hidden eyes |
| kangaroo | spring, launching, stamping | upright on long hind feet with a thick tail behind, long ears, long muzzle, short arms |
| fennec | heat (it lives in the desert), listening | sand-coloured fox with enormous ears, a cream face and chest, a dark-tipped bushy tail |
| raccoon | turning knobs, dials and latches with nimble hands | grey coat, black mask over the eyes, pale muzzle and brows, black hand-like paws, a ringed tail |
| otter | fluid: pumps, valves, anything wet | sleek brown coat, broad flat head with small ears, pale throat, a thick tapering tail |
| crab | holding, clamping, pinching | red shell with a pale underside, eyes on stalks, two big pincers; walks sideways, legs drawn into the body |
| woodpecker | striking: hammers, needles, strikers, anything that hits over and over | great spotted woodpecker: black back and wings with white shoulder patches and barred flight feathers, white face and underparts, black crown and moustache, red nape and red under the tail, a chisel beak; clings upright, propped on its stiff tail |
| eel | power: current, wires, circuits, batteries (an electric eel makes electricity) | electric eel: long smooth olive body, orange throat and belly, a flat head with small eyes, a long fin under its whole length and no other limbs; lies along a path and crackles while charged |

Show the cast before placing anyone: `node scripts/cast-sheet.mjs --light` (and without `--light`) writes `cast-sheet*.html` with every species at four headings (facing you, left, right, away) and in six poses (reaching, walking, on all fours, hanging, asleep, startled; birds peck and fly instead, and the eel curls). `--only=sloth,beaver` and `--role=power` narrow it. Capture it and read it at 2×.

Recurring cast: give each critter a name and keep the same species and role across a set of figures, so readers learn them.

## 5. Building a critter

```js
import { critter, critterSvg, crewCss } from "../../kit/critters.mjs";

const MO = { species: "sloth", name: "Mo", size: 18, role: "sensing", wear: ["glasses"] };
const pose = {
  at: [x, y, z],              // the point between its feet, on the surface it stands on
  heading: 30,                // degrees in the floor plane, 0 = +x
  stance: "up",               // "up" (the default: sitting or standing, paws free) | "four" (on all fours) | "hang" (from its paws)
  lean: 10,                   // forward lean in degrees, negative leans back
  look: [yaw, pitch],         // pitch tips the head up (+) or down (-)
  paws: { l: [x, y, z], r: [x, y, z] },   // world points the paws hold; omit for a resting paw
  stride: { phase, amount },  // feet: phase from distance travelled, amount ~0.1 while walking
  hop: 0, squash: 0,          // lift in world units; 0..1 squash for a sit, a strain or a landing
  eyes: "open",               // "open" | "shut" | "happy" (a squint) | "wide"
  tailSway: 0,                // -1..1
};
const c = critter(PIP, pose, P);          // { reach, front, mirror, dyn, … }, pure, no DOM
svg.push(critterSvg(c, { part: "pip" })); // build time
// page: <style>${crewCss()}</style> once, before the figure
```

- **Wear** is an optional list of props (section 12).
- **Size** is the critter's height in world units. Pick it against the part it operates: about half a carriage's length, a third of a dial's diameter. A squirrel at 25 and a sloth at 18 sit well in the dial example; the vending machine's hamsters are 10 in a wheel of radius 11.
- **Painted, not built from solids.** Each animal is drawn once, facing left and about 100 units tall, as a set of authored shapes: body, head, ears, markings, eyes, nose, whiskers, arms, paws, feet and tail. Fills are soft gradients lit from above; light markings (belly, muzzle, cheeks) fade into the fur; short fur strokes soften every edge and hair strands follow the coat; there are no outlines. `critter()` places that drawing in the figure's camera: at the projection of `at`, scaled so `size` world units of height match the camera, mirrored to face its heading, and drawn from behind when its heading points away from the viewer (no belly, no far eye, the tail in front). The ground shadow stays on the floor when it hops.
- **A rig, not a puppet.** The upper body leans around the hips, the head tips around the neck, the arms are two bones from the shoulder to the paw target (projected into the drawing), the feet step with the stride, and the tail sways from its root. `stance: "four"` swaps to the side-on drawing on all fours, whose four legs run from `stride`. `stance: "hang"` uses the upright drawing with the shoulders set back, the arms up to the paws and the feet dangling, and drops the ground shadow.
- **No limbs: a body along a path.** The eel has no paws, so it doesn't stand at a point: `pose.path` is a list of world points from its snout back, and its body lies along that path for `size` world units (carrying on past the last point if the path is shorter). Lay the path along the part it is: a wire, a pipe, a channel. Lift the path off the floor by its half-thickness (about 5% of its length) so it lies on the surface, not in it. The head is drawn like any other head (eyes, props, collar) and turned to point back along the first stretch of path. `charge` (0 to 1) makes it crackle, `flicker` redraws the sparks each time it steps on a whole number (give it time × 14 for a lively crackle), and `target` draws an arc from the snout to a world point, such as the terminal it touches. With no path, it lies straight along `heading` through `at`, with a gentle wave that `stride` moves.
- **A bird works with its beak.** The woodpecker has wings, not paws: `pose.beak` is a world point the beak tip lands on. The rig leans the body (a little), tips the head and stretches the neck to reach it, preferring the neck, and reports any shortfall in `reach.beak`. A woodpecker reaches about its own height off its perch and a little ahead. `pose.wings` opens the wings: below 0.5 the folded wing lifts off the back, from 0.5 to 1 the spread wing beats from down to up, so `wings: 0.75 + 0.25 * sin(t)` flaps. Pair flight with `hop` to lift it off its perch.
- **Turning.** Facing left or right is a mirror, and a critter that turns through the camera's axis narrows a little as it passes, which reads as a turn. Headings within a few degrees of straight at the viewer still show a three-quarter face; that is the drawing, not a bug.
- **Colour comes from tokens.** `crewCss()` gives every species its fur, belly, dark, skin and marking tones (each with a lit and a shade value), eye, nose, claw, whisker and teeth colours, and every role its collar colour. Never type a colour into a critter's markup.

## 6. Paws, handles and reach

A paw that works is a contact, like a pipe end on its port (`craft.md`, section 8, "Contacts and junctions"):

- **Targets come from the part.** Compute each paw target from the same numbers that place the handle: the knob's centre plus its radius, the coin's rim, the lever's end. Never from the critter.
- **The nearer paw takes the nearer target.** `critter()` works out which side of the animal faces the viewer and gives that arm the matching paw (`l` or `r`). Both arms reach in the drawing's plane, so a target far behind or in front of the animal reads as reached when it is on screen. Pick targets that read from the camera: the top or the near rim of a coin, not two points on opposite faces. Reaching straight at the camera is the rig's weak spot: a target in front of a critter that faces the viewer lands low on its body, so turn the critter a little side-on to its handle.
- **Place the critter from the handle.** Stand it where both paws reach: `at` = handle − about 0.35 × size along its heading. Arms don't stretch; `critter(…).reach.l` / `.r` report how far each paw falls short, in world units. A hanging sloth's `at` is about one body height below the bar.
- **Check reach in the build** at both ends of travel and at every stop, and print a warning for any paw short by more than 0.3 (`examples/dial-indicator-crew/build.mjs` does this). Ship at zero warnings. To find a spot, loop the build over a few candidate `at` values and headings and keep one with no warnings; it takes seconds.
- **A handle that goes all the way round is checked all the way round.** The arms are drawn in the picture's plane, so the same grip can be in reach facing one way and short facing another. The seasons build walks Pip's knob round the whole year and Mo's crank round the whole day, and the spot that passed was found by looping the build over distance, knob height, lean and the critter's size. Put a push knob at the critter's chest height on the side it pushes from, not on top of a bar it can't reach over.
- **Give a small control a handle.** A knob a fraction of the critter's size can't be gripped on its rim from the viewer's side: the critter stands in front of it and hides the hand. Give the part a real handle that reaches toward the critter, and slide the paws along it to the point nearest the shoulder. The toaster's browning knob has a pointer lever that Rocky lifts.
- **Grip from the side you can see.** Put the critter on the viewer's side of its handle, so the paws and face are in view.
- **Standing.** Feet stand on a real surface at its real height: a plate's top, a dial's face, a wheel's rungs. Not on a slab's edge, not in the air (a hop and a hang are the exceptions).
- **Clearance.** No critter's body passes through a part, at rest or anywhere in its travel. Crowding a critter against a rail at full stroke reads like a sunk part.

## 7. The on-duty light

Anatomy lights exactly one part: the one to watch. Staff Only lights exactly one critter: the one whose part is moving now.

- Set `data-duty` on that critter's group (`critterSvg(c, { duty: true })` or `el.toggleAttribute("data-duty", …)`). A thin rim in `--crew-duty` (white in dark, black in light) appears round its silhouette; the fill is untouched.
- Choose it from the motion itself: the fastest-moving part's operator, above a small threshold, so a stop hands the light back.
- When nothing moves, nobody is on duty and the lit accent returns to the subject part, as in Anatomy. The dial example lights the plunger at rest and toggles the plunger's `data-lit` off while a critter is on duty.
- Never light two critters, and never light a critter and a part at the same time.

## 8. Motion

Everything in `motion.md` applies; the machine stays calm and eased. The crew rides on top of it:

- **Pose from the model, every frame.** `paintCritter(el, critter(spec, poseOf(state), P))` inside the same `tick` that moves the parts, after the parts. Inline the crew with `kitScript() + crewScript() + live` and call `CREW.critter` and `CREW.paintCritter` in the page.
- **Stride from distance, not time.** `stride.phase = x / strideLength`, so feet don't slide; `amount` fades to 0 as the speed does.
- **Lean from effort.** Lean into a push (positive), back on a pull (negative), in proportion to speed, clamped.
- **Small life, never a part.** Eyes `happy` when the job is done, `shut` after the part has been still a while (the sloth dozes), `wide` on a sudden move. A tail sway is fine. A critter never moves a part the model didn't move.
- **Reduced motion.** Critters jump to their pose like every other part, no stride, no blink.
- **Cheap writes.** The painted shapes are built once per species, view and eye state and cached. Each frame `paintCritter` only rewrites a handful of transforms and the two arm paths; it rebuilds the group when the view changes (turning round, opening its eyes, going on all fours).

## 9. Painter's order and performance

- **Within a critter** the order is fixed by the drawing: tail, far arm and far foot behind the body, then the body, collar and head, then the near foot and near arm (the tail comes forward when it is seen from behind).
- **In the figure** a critter is one item in the slot where it physically stands, like any moving part. In the dial example Pip is drawn after the carriage, plunger and dial (he stands in front of all three) and Mo after the needle he holds. If a critter can pass in front of and behind the same part during its travel, split that part or bound the travel, as `craft.md`, section 5 says for any moving part.
- **The audit doesn't record critters.** They are drawn in their slot and checked by eye at 4× (section 10). Keep them clear of pipes and cables, and don't route a line through where a critter stands.
- **Cost.** Posing a critter is a few transforms, so five critters add well under a millisecond to a frame; the vending machine's busiest beat runs at about 3 ms a frame. A critter's markup is large (fur strokes), about 25–40 KB each, so a page with many critters grows; past seven, split the figure.

## 10. Verifying a crew

Add these to `verify.md`'s list:

1. **Cast sheet first.** `node scripts/cast-sheet.mjs --only=… --light` and without `--light`; read both at 2×.
2. **Reach is zero.** The build prints no reach warnings at either end of travel or at any stop.
3. **4× close-ups in both themes** of every critter at rest, at both ends of its travel and mid-motion: paws on the handle, feet on the surface, nothing sunk into a part, the face readable and the collar and props showing.
4. **390 px wide.** Every critter's face and role colour still read. If not, raise its size before shrinking anything else.
5. **The duty light** is on the critter whose part is moving in each frame of a contact sheet, and on the part when nothing moves.
6. **Line ends.** `scripts/lines.mjs` must still print `line ends: 0`. Critters draw no kit lines, so they never count.

## 11. Adding a species

Add a drawing to `ART` in `kit/critters.mjs`: colours, a coat, and an `up` drawing (and a `four` one if it will ever run on all fours), all facing left, feet on y = 0, about 100 units tall, y down. Shapes are point lists drawn as smooth closed curves (a third value marks a corner). A sketch for an otter, trimmed:

```js
otter: {
  colors: { fur: "#6B4A33", belly: "#C9AE8E", dark: "#3E2A1E", skin: "#4A3B33", mark: "#D9C3A6" },
  coat: { flow: [0.3, 1], tuft: 1.4, gap: 0.9, tw: 0.5, strand: 5, sw: 0.4 },  // fur: stroke length, spacing, widths
  up: {
    pivot: [2, -6], box: [-50, -100, 60, 4], shadow: [6, 40, 6],     // lean pivot, framing box, ground shadow
    body: { pts: [[-16, 0], [-24, -14], /* … */], strands: 70, marks: [{ pts: [/* belly */], tone: "belly", front: true }] },
    collar: { d: "M-24,-50Q-10,-44 6,-52", w: 1.3, tag: [-14, -46, 1.7] },
    head: {
      pivot: [-6, -56], pts: [/* … */], flow: [1, 0.2],
      marks: [{ pts: [/* muzzle */], tone: "mark" }],
      eye: { at: [-22, -70], rx: 2.6, ry: 2.8 }, nose: [/* … */], mouth: "M…", whiskers: { at: [-34, -64], n: 7, from: 150, to: 212, len: 16 },
      ears: { near: { pts: [/* … */], inner: [/* … */] } },
    },
    arms: { near: [-20, -44], far: [-14, -47], l1: 8, l2: 8, w: [8, 5.5, 4], rest: { near: [-28, -36], far: [-26, -39] }, paw: { len: 5, w: 3.6, tone: "skin", claws: 5 } },
    feet: { near: { at: [-12, 0], pts: [/* … */], tone: "skin" }, far: { at: [-19, -1.2], pts: [/* … */], tone: "skin" } },
    tail: { pivot: [22, -6], back: "over", pts: [/* a long tapered rudder */] },
  },
},
```

Work from photographs of the real animal in profile: trace its proportions on the 100-unit grid, then render it on the cast sheet in both themes and read it at 2× before using it. A species with a different body plan (a crab's legs and claws, a bird's wings) gets its own drawing with the same parts list (`legs` like the `four` drawings, `arms` for whatever grips), so `critter`, `critterSvg` and `paintCritter` work unchanged. A species with no limbs at all (an eel, a snake, a worm) uses a `path` drawing like the eel's: a `head` in the usual head format with its neck at the origin, a `width` (half-thickness behind the head) and a `fin`; the body is built along the path each frame.

## 12. Props

Most of the crew wear nothing but their collar. A prop goes on only where it reads cleanly at the figure's size and says something about the job; if it looks stuck on, or shrinks to a speck, leave it off. `PROPS` in `kit/critters.mjs` holds the two that pass, and `spec.wear` puts them on:

| Prop | Sits | For |
|---|---|---|
| `glasses` | over the near eye | whoever reads or times things (Mo on the strip, the switch and the dial) |
| `sweatband` | round the forehead, in the role colour | runners and jumpers big enough to show it (Bun and Mochi in the sharpener's wheel, Roo on the lever) |

- **Hats are out.** Hard hats, caps and a miner's hat were tried on every species and read as stickers on top of the drawing. So were goggles, a bow tie, oven mitts, a stopwatch, a whistle, a pencil, a notebook and a clipboard: at figure size they were specks or noise.
- **Small critters go bare.** Below about 15 world units a sweatband is a hairline; the vending machine's hamsters (size 10) wear nothing.
- **Anchored to the drawing.** Props are placed from each species' own head and eye points, so they sit right at every heading, mirror with the animal, follow the lean and the head's tip, and show only what the camera would see (the glasses' arm alone from behind). Never place a prop by hand.
- **Kid-friendly.** Nothing a child shouldn't copy: no cigarettes or cigars, no drinks, no weapons.
- **Check it close.** A prop that doesn't hold up in the 4× close-ups in both themes comes off.

## 13. Anti-patterns

- **Decorative crew.** A critter waving at the reader, or standing beside a part that moves by itself. Every critter has a job.
- **A crew that lies.** A critter that turns a part the wrong way, at a different speed from the model, or before the part moves. The motion is the part's motion.
- **Pasted pictures.** An image dropped over the machine at a guessed spot. Every critter is placed by `critter()` from world points: where it stands, which way it heads, what its paws hold.
- **Cartoon tells.** Outlines, blush, huge shiny eyes, hats, a head as big as the body, every species built on the same body. The crew looks like the real animals.
- **Costumes.** Props on everyone, or props that read as stickers. Most of the crew wear only their collar.
- **Colour on the machine.** A tinted housing, a coloured prop, a part in a role colour. The machine is drawn as Anatomy draws it; colour is the crew's.
- **Rainbow crew.** Several role colours on one critter. One collar, one role.
- **Speech bubbles and name tags.** Words stay in the legend.
- **Floating paws.** A paw a few units short of its handle reads like a pipe ending in the air. The reach check catches it; a 4× close-up confirms it.
- **Crowds.** More critters than mechanisms, or more than seven on one machine. One per mechanism, one on duty at a time.
- **A crew that hides the mechanism.** A body parked over the part it explains. Put the critter beside its handle on the viewer's side, and make the part visible around it.
