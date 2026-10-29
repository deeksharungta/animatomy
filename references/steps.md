# The step player

Every Staff Only figure is a full picture played one step at a time. It opens on the whole scene (the machine on its desk or bench, a wall behind it, a few props), then walks through the mechanism: each step plays one piece of the action, zooms the camera onto the crew member doing it, and says in a sentence what happened. `examples/pencil-sharpener/` is the reference.

## Contents
1. Shape of a step player
2. Writing the steps
3. The scene
4. The camera
5. The model, step by step
6. API
7. Verifying
8. Anti-patterns

## 1. Shape of a step player

- **Step 1 is "Meet the crew".** The whole scene, nothing moving yet, every critter at rest where it works. One sentence names each one and its job.
- **Steps 2 to n−1 follow the action in order.** One step per handoff in the mechanism: the pencil goes in, the switch closes, the motor starts, the cutter cuts, the shavings fall. Usually 5 to 8 steps in all.
- **The last step returns to rest** (let go, switch off, coast to a stop) with the camera pulled back, so autoplay can loop to step 1 without a jump.
- **Under the picture:** `Step 3 of 7`, the crew member on duty with their role colour, a title of a few words, one or two sentences, and Back, a row of step dots, Play/Pause and Next. The card's corners keep Anatomy's `Fig n`, title, hint and live readout.

## 2. Writing the steps

Each step is `{ title, who, color, text, points, dwell? }`:

- **title**: what happens, in a few words, with the crew member's name as the subject when one acts: "Mo gets lifted onto the switch", "Bun and Mochi start running".
- **who**: who is on duty and their role, `"Mo · sensing"`. Its dot takes `color` (the role hex), so the step bar carries the same colour code as the crew.
- **text**: one or two plain sentences: the critter's action, then the real mechanism it stands for. "The pencil pushes the short arm aside. The lever pivots, the long arm swings up with Mo hanging on it, and its end presses the microswitch." Every number in it is true to the model.
- **points**: world points the camera must show for this step (section 4). `null` for the whole scene.
- **dwell**: seconds autoplay waits after the step's action finishes (default 1.8). Longer on step 1 and the last step.

One actor per step. If two things happen at once, the step belongs to whichever the reader should watch, and the other happens in the background.

## 3. The scene

The full picture is what makes a step player more than a diagram. Build it with the kit like everything else:

- **A surface:** a desk, bench or floor slab under the machine, with grain or tile lines that end on its edges.
- **A wall or two behind:** thin slabs at the back edge, with a quiet texture (stripes, panels) and at most one object on it (a cork board, a shelf, a clock).
- **Two or three props** that belong to the subject and sit on the surface: a pencil cup and a notebook beside a sharpener, a mug beside a coffee grinder. Props are static and never steal a step.
- **No colour.** The surface, walls and props are drawn like the machine, in the kit's own tones and tone hierarchy (base `lo`, structure `mid`, subject `hi`). The animals are the only colour in the picture, so they are what the eye finds.
- The scene is part of the overview only. Fit the projection to the whole scene (`fitProjection` with the desk and wall corners), and let the steps zoom in.

## 4. The camera

- The camera is the SVG `viewBox`. `fitView(points, [W, H], { pad, least })` (in `kit/steps.mjs`) turns a step's world points, projected with `iso`, into a viewBox of the card's aspect, padded, clamped inside the figure, and never closer than `least` of the full size (0.34 gives up to about 3× zoom).
- Pick points that frame the actor and what it acts on: Mo, his lever, the switch box and the point of the pencil; the whole wheel and the pinion it drives. Leave the next actor just out of frame, so Next reveals it.
- The player eases between views (about 0.55 s), and lines keep their weight at any zoom because the kit draws them with `non-scaling-stroke`.
- Build the views at build time and pass them to the page as numbers.

## 5. The model, step by step

The figure keeps Anatomy's single model; the player decides when it runs:

- **`enter(i, how)`** sets that step's targets: step 2 pushes the pencil in (`target = 1`), the last step pulls it out. `how` is `"start"`, `"next"`, `"back"`, `"jump"` or `"loop"`. On the first entry of each step, save a snapshot of the state; on `"back"`, restore it, so Back always shows the step as it began.
- **`update(dt)`** advances the model and draws, exactly as a normal tick would.
- **`done(i)`** says when the step's action has finished: the switch closed and Mo's hop settled, the wheel at full speed, the cone at 18 mm. The player stops calling `update` then and freezes the frame, so each step ends on a clear picture. With autoplay on it waits `dwell`, then goes to the next step.
- **Physics doesn't wait for the camera.** If the motor starts the moment the switch closes, it starts during the switch step; end that step soon after (`closeT > 1.1`) and let the next step show the wheel at speed. Never fake the order.
- **Loop:** after the last step, step 1 resets the model (a fresh pencil fades in) and keeps what should persist (the shavings pile).
- **Jump:** clicking a later dot fast-forwards every step in between with `update(1/30)` until each is done, so the state is always one the model could reach.

## 6. API

```js
import { STEPS_CSS, stepsHtml, fitView } from "../../kit/steps.mjs";
import { kitScript, crewScript, stepsScript } from "../../scripts/inline-kit.mjs";

const views = STEPS.map((s) => (s.points ? fitView(s.points.map(at), [W, H], { pad: 18, least: 0.34 }) : [0, 0, W, H]));
const body = `<style>${crewCss()}${STEPS_CSS}</style>` + k.plateHtml({ …, body: `<div class="iso-stage" tabindex="0" role="group" aria-label="…">${svg}</div>${stepsHtml(STEPS)}` });
// page script: kitScript() + crewScript() + stepsScript() + live
STEPS.mountSteps({ root, svg, stage, steps, views, colors, size: [W, H], enter, update, done });
```

`mountSteps` owns the animation loop: it calls `update` while the step plays, eases the camera, runs autoplay, stops when offscreen or idle, and handles keys (Left and Right arrows step, Space plays and pauses, Home goes to step 1). Clicking the picture is Next. Under reduced motion it never autoplays, and each step jumps straight to its finished state and view.

## 7. Verifying

- **A contact sheet of every step in both themes:** let autoplay run, capture each step once its action is done, and read every PNG. Each step's actor is in frame, big enough to read, and lit; the caption matches what the frame shows.
- **Back and Next agree.** Go forward to the last step, then back to step 1 one step at a time: every step looks as it did on the way forward.
- **Every `done` is reachable.** A step whose condition never comes true freezes autoplay. Jump from step 1 to the last dot; the fast-forward must finish.
- **The line check** passes in the overview (`scripts/lines.mjs` reads the page at load, which is step 1).
- **390 px wide:** the step text wraps and the buttons fit; the zoomed steps make the crew readable on a phone, which is what the overview can't do.

## 8. Anti-patterns

- **A step where nothing moves.** Every step after the first plays an action; a step that only re-frames belongs in another step's caption.
- **Zooming into empty space.** Points that miss the actor, or a view so tight the part it acts on is cut off.
- **Captions that repeat the legend.** Say what happened in this step, not who the crew are again.
- **Steps that end mid-motion.** `done` waits until the action settles, so the frozen frame reads.
- **Coloured machines.** Any tint on a housing, prop or wall competes with the crew. The machine and the scene stay in the kit's tones.
- **Words in the drawing.** Titles and captions live under the picture, never on it.
