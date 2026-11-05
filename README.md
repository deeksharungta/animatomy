<h1 align="center">Animatomy</h1>

<p align="center"><b>A Claude skill that explains how a machine works by showing the crew of animals who secretly run it.</b><br>Animals + anatomy: a fork of <a href="https://github.com/wheresryan22/anatomy">Anatomy</a> where every moving part has an animal on shift.</p>

<p align="center">
  <img src=".github/assets/toaster-crew.webp" width="640" alt="An isometric pop-up toaster, cut away, its heating ribbons glowing orange. Inside, a sloth in glasses hangs from the bimetal strip, a mole holds the latch hook, an electric eel lies along the live wire, crackling, a kangaroo in a sweatband stamps the lever down, and a raccoon lifts the browning knob's lever.">
</p>

<p align="center"><sub><code>examples/toaster</code>, light theme, mid-toast. Mo feels the heat while Dig, Volta, Roo and Rocky hold their posts. Whoever is working is lit.</sub></p>

<table>
  <tr>
    <td width="50%"><img src=".github/assets/seasons-crew.webp" alt="A tellurion on a desk in June: a lamp glows orange as the Sun, a globe tilted toward it on a gear arm. A sloth in glasses on a shelf turns the globe by a crank; a red squirrel pushes the arm round the base."><br><sub><code>examples/seasons</code>: why the Earth has seasons. Drag the globe to any date.</sub></td>
    <td width="50%"><img src=".github/assets/sharpener-crew.webp" alt="An electric pencil sharpener cut open: a yellow pencil with a pink eraser feeds down into a cutter, a beaver gnaws its point, two hamsters run the motor wheel and a sloth hangs on the switch lever. Wood shavings fall into the drawer."><br><sub><code>examples/pencil-sharpener</code>: Chomp the beaver is the cutter.</sub></td>
  </tr>
  <tr>
    <td width="50%"><img src=".github/assets/vending-crew.webp" alt="Inside a vending machine: a brass coin rolls down a rail past a mole, who checks it, under a keypad that reads CREDIT 1.00."><br><sub><code>examples/vending-machine</code>: Dig the mole checks the coin.</sub></td>
    <td width="50%"><img src=".github/assets/dial-indicator-crew.webp" alt="A dial indicator cut open on its stand over gauge blocks: inside the case a kangaroo is the plunger's return spring, a sloth in glasses holds the hairspring wheel and a crab locks the bezel, behind the needle and gear train."><br><sub><code>examples/dial-indicator-crew</code>: the crew are the gauge's springs and lock; you slide the blocks.</sub></td>
  </tr>
  <tr>
    <td width="50%"><img src=".github/assets/token-bucket-crew.webp" alt="A token dispenser on a desk: a red squirrel pushes a slide under a tube of brass tokens, mid-burst, as envelopes drop onto a see-saw flap; a sloth in glasses turns the feeder crank above."><br><sub><code>examples/token-bucket</code>: an idea, not a machine. Pip spends a token per request.</sub></td>
    <td width="50%"><img src=".github/assets/power-grid-crew.webp" alt="A power station on a concrete plinth: a steam turbine and a 660 MW generator on their deck, a step-up transformer with radiators, an oil pump wheel with two hamsters, a 400 kV breaker and disconnector, and a lattice gantry with copper conductors running out to the line."><br><sub><code>examples/power-grid</code>: a generator joins the grid, and why a disconnector never breaks current. Its steam, hydrogen, oil, air and current flow in colour.</sub></td>
  </tr>
  <tr>
    <td width="50%"><img src=".github/assets/sand-casting-crew.webp" alt="A foundry corner: a teapot ladle on a hoist over a green-sand mould cut in half to show its pouring cup, sprue, runner, core and riser; an otter waits at the riser and a crab clamps the flask."><br><sub><code>examples/sand-casting</code>: pour the steel yourself; too slow and it freezes short.</sub></td>
  </tr>
</table>

---

## The idea

Anatomy explains an idea by inventing a real machine whose working *is* the idea, then building it from dozens of small, solid, shaded parts. Animatomy keeps all of that and adds one thing: **the machine is real, the workforce is fake.** Every animal is a machine part: it does the job of one real part and moves the way that part moves. The hamsters' wheel is the motor, the crab's grip is the latch, the beaver's teeth are the blade. An animal that isn't doing a part's job gets cut.

The mechanism stays true to the real thing, and the crew is why people remember how it works.

## How it works

1. **You ask:** `/animatomy how a pop-up toaster knows when the toast is done`.
2. **Claude plans:** it sizes the figure, finds the real numbers, picks a machine whose working *is* the idea, lists 40 to 150 parts, casts an animal for every part that moves on its own (the headline event first, the animal that fits the motion, each at the spot where its part does its work), and writes the beats: "Meet the crew", one beat per step of the mechanism, then back to rest.
3. **Claude builds:** one model moves both the parts and the crew, so every paw stays on its handle. The machine and scene are drawn in Anatomy's monochrome; colour goes only on the animals, the thing being worked on and any heat or light.
4. **Claude checks:** every paw and tooth reaches its handle and its point of work across the whole motion, no line ends float, no on-duty outline blinks, and every beat is screenshotted in both themes and at phone width. Before handing over, it puts its figure beside the toaster and the sharpener and zooms in to 4× to add what's missing.
5. **You get one HTML file** that plays the whole story on a loop, with the camera easing onto whoever is working, and never pauses until you press Space. Ask for Next.js and you get a React figure instead.

## What's different from Anatomy

| | Anatomy | Animatomy |
|---|---|---|
| The one idea | The object is the explanation | The object is the explanation, and the crew is how it moves |
| Workflow | Size, truth, object, parts, world, geometry, order, frame, live, verify | Adds **cast the crew** after the parts list, and crew checks (reach, point of work, blinks, a side-by-side with the toaster and sharpener) to verify |
| Colour | Monochrome, one lit accent | Monochrome machine; colour only on the animals, the thing being worked on, and any heat or light |
| Format | One interactive figure | A full scene played as one continuous story on a loop, with no buttons and no stops |
| Lit accent | One part | One critter: the one whose part is moving (the part again when nothing moves) |
| Kit | `kit/` | `kit/` plus `kit/critters.mjs` (the crew: animals drawn as natural-history illustrations on a 2D rig, with their fur and role colours), `kit/reach.mjs` (reach and the point of work), `kit/steps.mjs` (the run), `kit/react/run.tsx` (the crew and run in Next.js), `scripts/cast-sheet.mjs` and `scripts/flicker.mjs` |
| Examples | 9 | 32: adds 23 crewed machines, `examples/toaster`, `examples/pencil-sharpener`, `examples/vending-machine`, `examples/seasons`, `examples/espresso-machine`, `examples/longcase-clock`, `examples/power-grid`, `examples/sand-casting`, `examples/token-bucket`, `examples/dial-indicator-crew`, `examples/debounce`, `examples/can-opener`, `examples/toilet-cistern`, `examples/car-jack`, `examples/sewing-machine`, `examples/music-box`, `examples/hash-map`, `examples/mousetrap`, `examples/glue-gun`, `examples/pepper-grinder`, `examples/gyroscope`, `examples/pin-lock` and `examples/soldering-iron` |
| Gallery | Publishes to the Anatomy community gallery | Doesn't publish there |

The subject keeps its real colours: the toaster's golden bread, the sharpener's yellow pencil, the vending machine's brass coin, the dial's steel gauge blocks. Heat and light (the toaster's ribbons, the seasons lamp) glow on a WebGL layer, only while they are on.

Everything else, from the craft rules to the audit, the line check, WebGL, the 3D mode (not offered for crewed figures: it hasn't been tested with a crew) and printable sheets, is Anatomy's, unchanged. `ANATOMY-README.md` is Anatomy's own README, kept for reference.

## Two ways to open a figure

| URL | Shows |
|---|---|
| `toaster.html` | The figure alone, playing on its loop, in the theme it was built in (`toaster-light.html` for light). Made for embedding. The captions stay in the page for screen readers. |
| `toaster.html?full` | The full page: a caption and progress bar under the figure, one beat at a time. |

Light is the default: Claude hands you the `-light` page unless you ask for dark, and builds both. Space pauses and resumes, Home starts again. Interactive figures also let you take over: drag the globe in seasons, the blocks in the dial indicator, the ladle in sand casting, the steam valve in the power station, the key in the pin lock, or the cheese and hammer in the mousetrap; Space hands back to the story.

## The crew

<p align="center"><img src=".github/assets/cast-sheet.webp" width="720" alt="A cast sheet: thirteen animals drawn as natural-history illustrations (hamster, mouse, squirrel, beaver, sloth, mole, kangaroo, fennec fox, raccoon, otter, crab, electric eel, woodpecker), each at four headings and in six poses including on all fours, hanging and flying, each with a thin collar in its role colour."></p>

Thirteen species ship: hamster, mouse, squirrel, beaver, sloth, mole, kangaroo, fennec fox, raccoon, otter, crab, electric eel and woodpecker. Each is a natural-history illustration of the real animal (its silhouette, proportions, markings and fur in pale muted colour, with a fine ink contour and hatched fur, so it sits in the same line language as the machines) on a rig that places it in the figure's camera, turns it to its heading and reaches its paws to the parts it works. The eel has no paws: it lies along a wire and crackles while current flows. The woodpecker works with its beak, striking over and over, and flies. Each wears a thin collar in its role colour:

| Role | Colour | Does |
|---|---|---|
| power | yellow | motors, current |
| holding | red | latches, clamps, brakes |
| cutting | violet | blades, cutters |
| sensing | blue | gauges, timers, switches that read |
| moving | green | carriages, rollers, feeders |
| heat | orange | heating elements |
| fluid | aqua | pumps, hoses, valves |
| spring | pink | springs, launchers |

Casting rules, in short:

- **The right animal for the job.** Wheels are hamsters, springs are Roo (and Roo is only ever a spring), cutters are Chomp, catches are Pinch.
- **Headline first.** The event the explainer is about gets the first animal.
- **At the point of work.** Each animal's teeth, paws or claws are where its part does its work; riding a part doesn't count.
- **The animal is the part.** The part it stands for isn't drawn again beside it.
- **One per mechanism,** so a detailed machine gets a bigger crew (up to seven).

Props are rare and only where they read cleanly: glasses on Mo, who times things, and sweatbands on the runners and jumpers (Bun, Mochi and Roo). `references/crew.md` has the full rules and how to add a species.

## Install

Add the skill to Claude Code with one command:

```sh
npx skills add deeksharungta/animatomy -g -a claude-code
```

It needs Node.js 20 or later (the builds need 20.10 or later). Leave out `-g` to add it to the current project only.

Or [download the skill](https://github.com/deeksharungta/animatomy/archive/refs/heads/main.zip) and unzip it into your skills folder:

```sh
unzip animatomy-main.zip -d ~/.claude/skills && mv ~/.claude/skills/animatomy-main ~/.claude/skills/animatomy
```

Then open Claude Code in your project and ask how anything works. Name the machine or the idea, not the drawing:

```text
/animatomy how a pop-up toaster knows when the toast is done
/animatomy how a vending machine checks your coin, light theme
/animatomy why the Earth has seasons, interactive
/animatomy explain a token bucket rate limiter, with a crew
```

Thirty-two complete examples ship with the skill, from a crewed dial gauge to the toaster, and Claude opens the closest one before it starts. Ask for a size ("a Figure", "a Hero", "an Epic"), a theme or a format (one HTML file, Next.js, an A4 PDF) in the same line.

Animatomy is a standard [Agent Skill](https://agentskills.io), so it also runs in OpenCode, Codex and Antigravity: put this folder in that agent's skills folder, as in `ANATOMY-README.md`. Builds need Node.js 20.10 or later and the checks need Chrome or Chromium. Nothing to `npm install`.

## Try the examples

The built pages are in the repo, so you can open them straight away; rebuild one with `node examples/<name>/build.mjs` (add `--light` for the light build):

```sh
open examples/toaster/toaster-light.html
open examples/pencil-sharpener/pencil-sharpener-light.html
open examples/vending-machine/vending-machine-light.html
open examples/seasons/seasons-light.html
open examples/espresso-machine/espresso-machine-light.html
open examples/longcase-clock/longcase-clock-light.html
open examples/power-grid/power-grid-light.html
open examples/sand-casting/sand-casting-light.html
open examples/token-bucket/token-bucket-light.html
open examples/dial-indicator-crew/dial-indicator-crew-light.html
open examples/debounce/debounce-light.html
open examples/can-opener/can-opener-light.html
open examples/mousetrap/mousetrap-light.html
open examples/glue-gun/glue-gun-light.html
open examples/pepper-grinder/pepper-grinder-light.html
open examples/gyroscope/gyroscope-light.html
open examples/pin-lock/pin-lock-light.html
open examples/soldering-iron/soldering-iron-light.html
node scripts/cast-sheet.mjs --light && open cast-sheet-light.html
```

To see the captions, open a page in a browser with `?full` on the end of its address.

## Credits and license

Animatomy is built on [Anatomy](https://github.com/wheresryan22/anatomy) by Ryan ([skills.wheresryan.sh/anatomy](https://skills.wheresryan.sh/anatomy)), used under the MIT license. Anatomy's kit, examples, references and scripts are his work; the crew and the run (`kit/critters.mjs`, `kit/crew/`, `kit/reach.mjs`, `kit/steps.mjs`, `kit/react/run.tsx`, `kit/react/steps.tsx`, `scripts/cast-sheet.mjs`, `references/crew.md`, `references/steps.md`, `scripts/flicker.mjs` and the 18 crewed examples, `examples/toaster`, `examples/pencil-sharpener`, `examples/vending-machine`, `examples/seasons`, `examples/espresso-machine`, `examples/longcase-clock`, `examples/power-grid`, `examples/sand-casting`, `examples/token-bucket`, `examples/dial-indicator-crew`, `examples/debounce`, `examples/can-opener`, `examples/toilet-cistern`, `examples/car-jack`, `examples/sewing-machine`, `examples/music-box`, `examples/hash-map`, `examples/mousetrap`, `examples/glue-gun`, `examples/pepper-grinder`, `examples/gyroscope`, `examples/pin-lock` and `examples/soldering-iron`) and the changes to `SKILL.md` are Animatomy's. See [LICENSE](LICENSE).
