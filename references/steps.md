# The run

Every Staff Only figure is a full picture that plays its machine as one continuous story. It opens on the whole scene (the machine on its desk or bench, a wall behind it, a few props), then follows the mechanism beat by beat without stopping: each beat plays one piece of the action, the camera eases onto the crew member doing it, and a caption says in a sentence what is happening. When the last beat ends it starts again. There are no buttons and no pauses between beats. `examples/toaster/` is the reference; `examples/pencil-sharpener/` and `examples/vending-machine/` are smaller ones.

## Contents
1. Shape of a run
2. Writing the beats
3. The scene
4. The camera
5. The model, beat by beat
6. Pacing
7. API
8. Verifying
9. Anti-patterns

## 1. Shape of a run

- **Beat 1 is "Meet the crew".** The whole scene, nothing moving yet, every critter at rest where it works. One sentence names each one and its job. It holds a little longer than the others.
- **Beats 2 to n−1 follow the action in order.** One beat per handoff in the mechanism: the knob is set, the lever goes down, the hook catches, the heat comes on, the strip curls, the hook trips, the toast pops. Usually 5 to 9 beats in all. A detailed machine has more handoffs, not longer beats.
- **The last beat returns to rest** (let go, switch off, cool down) with the camera pulled back, so the loop back to beat 1 doesn't jump.
- **Under the picture:** the crew member on duty with their role colour, a title of a few words, one or two sentences, and a thin progress bar with one segment per beat; the current segment fills in that beat's role colour. The card's corners keep Anatomy's `Fig n`, title, hint ("Plays on its own, on a loop") and live readout.

## 2. Writing the beats

Each beat is `{ title, who, color, text, points, hold?, pace? }`:

- **title**: what happens, in a few words, with the crew member's name as the subject when one acts: "Rocky sets the browning", "Roo stamps the lever down".
- **who**: who is on duty and their role, `"Mo · sensing"`. Its dot takes `color` (the role hex), so the progress bar carries the same colour code as the crew.
- **text**: one or two plain sentences: the critter's action, then the real mechanism it stands for. "The strip pushes the hook's tail up. The hook swings off the pin, and Dig can't hold it against Mo." Every number in it is true to the model.
- **points**: world points the camera must show for this beat (section 4). `null` for the whole scene.
- **hold**: extra seconds on screen after the beat would otherwise end. Use it on the first and last beats only.
- **pace**: a fixed playback speed for this beat's action, overriding the automatic one (section 6).

One actor per beat. If two things happen at once, the beat belongs to whichever the reader should watch, and the other happens in the background. Keep captions short: a beat lasts at least as long as it takes to read its caption, so a long caption slows the whole run.

## 3. The scene

The full picture is what makes a run more than a diagram. Build it with the kit like everything else:

- **A surface:** a desk, bench or floor slab under the machine, with grain or tile lines that end on its edges.
- **A wall or two behind:** thin slabs at the back edge, with a quiet texture (stripes, panels, tiles) and at most one object on it (a cork board, a shelf, a clock, a socket).
- **Two or three props** that belong to the subject and sit on the surface: a pencil cup beside a sharpener, a mug beside a toaster. Props are static and never steal a beat. A prop can double as a perch for a critter (the toaster's stack of books under Rocky).
- **No colour.** The surface, walls and props are drawn like the machine, in the kit's own tones and tone hierarchy (base `lo`, structure `mid`, subject `hi`). The animals are the only colour in the picture, apart from the light and heat the machine gives off (`crew.md`, section 3).
- The scene is part of the overview only. Fit the projection to the whole scene (`fitProjection` with the desk and wall corners), and let the beats zoom in.
- **A machine that needs the whole card** (something that sweeps round, like the tellurion's year arm) can drop the wall and fit the projection to the machine alone, with the surface running off the edges of the figure. Its grain lines still end on the surface's edges, outside the view.

## 4. The camera

- The camera is the SVG `viewBox`. `fitView(points, [W, H], { pad, least })` (in `kit/steps.mjs`) turns a beat's world points, projected with `iso`, into a viewBox of the card's aspect, padded, clamped inside the figure, and never closer than `least` of the full size (0.32 gives about 3× zoom).
- Pick points that frame the actor and what it acts on: Mo, the strip he rides and the hook's tail; Ember and the contacts. The next actor can be in frame or just outside it.
- The camera eases toward each beat's view while the machine keeps moving (`ease`, about 0.45 s), and lines keep their weight at any zoom because the kit draws them with `non-scaling-stroke`.
- A figure drawn in layers (a back SVG, a WebGL canvas, a front SVG) passes every SVG as `svg: [back, front]`, and `onView(viewBox)` lets the canvas follow the same camera (`webgl.md`).
- Build the views at build time and pass them to the page as numbers.

## 5. The model, beat by beat

The figure keeps Anatomy's single model; the run decides what it is asked to do:

- **`enter(i, how)`** sets that beat's targets: beat 3 pushes the lever down (`hand = true`), the last one turns the knob back. `how` is `"start"`, `"next"` or `"loop"`. On `"loop"` reset what should start fresh (a new slice of bread) and keep what should persist.
- **`update(dt)`** advances the model and draws, exactly as a normal tick would.
- **`done(i)`** says when the beat's action has finished: the knob at its setting, the hook over the pin, the strip at the trip temperature. The run moves on once the action is done and the caption has had time to be read.
- **The machine never stops.** Between the end of one beat's action and the start of the next, the model keeps running (the strip keeps heating, the spring keeps settling) unless that would carry it into the next beat's action before its caption is up; then it waits at the end of the action (section 6).
- **Physics doesn't wait for the camera.** If the heaters come on the moment the contacts close, they come on during the contacts beat; the next beat shows them glowing. Never fake the order.
- **Slow processes run fast.** A toast takes four minutes; a beat should take seconds. Give the model a time warp per beat (the toaster's `WARP` runs the heating beats at 30× and the cool-down at 60×) and show the real clock in the readout.

## 6. Pacing

Give `mountSteps` the model step without drawing (`advance`) and a way to copy and restore the state (`save`, `load`). When it mounts, it plays the whole story once, unseen, to time each beat:

- **Reading time.** A beat never ends before its caption can be read: about 0.23 s a word, 2.4 s at least, plus its `hold`.
- **Slow quick actions down.** A beat whose action is much shorter than its caption plays at a slower speed, so the motion fills the caption instead of finishing and sitting still (never below `slowest`, 0.35 by default). A beat's `pace` overrides this.
- **Flow or wait.** For each beat the timing run checks whether letting the machine run on through the caption would finish the next beat's action before it starts. If not, the machine flows on; if so, it waits at the end of the action.
- Without `advance`, `save` and `load` every beat plays at full speed and the machine waits after each action.
- **Reduced motion.** Pass `draw` (the drawing without a model step) as well, and each beat is run to its end on the model alone and drawn once. Without it the run calls `update` for every step of the beat, which redraws hundreds of times in one go and freezes the page at each beat change.

## 7. API

```js
import { STEPS_CSS, stepsHtml, fitView } from "../../kit/steps.mjs";
import { kitScript, crewScript, stepsScript } from "../../scripts/inline-kit.mjs";

const views = STEPS.map((s) => (s.points ? fitView(s.points.map(at), [W, H], { pad: 22, least: 0.32 }) : [0, 0, W, H]));
const body = `<style>${crewCss()}${STEPS_CSS}</style>` + k.plateHtml({ …, hint: "Plays on its own, on a loop", body: `<div class="iso-stage" tabindex="0" role="group" aria-label="…">${svg}</div>${stepsHtml(STEPS)}` });
// page script: kitScript() + crewScript() + stepsScript() + live
STEPS.mountSteps({ root, svg, stage, steps, views, colors, size: [W, H], enter, update, done, advance, draw, save, load, onView });
```

`mountSteps` owns the animation loop: it calls `update` at each beat's pace, eases the camera, fills the progress bar, moves on when a beat is done and read, loops after the last beat, and stops drawing while the figure is offscreen. Space pauses and resumes; Home starts again from beat 1. Under reduced motion each beat jumps straight to its finished state and view, and the run moves on every few seconds. To embed a figure without its captions, open the page with `?bare`: the caption panel is hidden, the run plays on as before, and the page shows the light theme only.

It returns `{ go(i), toggle(), aim(viewBox), index, playing }`.

**Letting the reader take over.** A figure can also be driven by hand: the seasons tellurion lets you drag the globe to any date or step it with ← →. When the reader takes over, pause the run (`toggle()` if `playing`), set the model straight from the input, and `aim(viewBox)` the camera at what they now need to see (the whole figure, usually). The aim holds until the run resumes or moves to another beat. When Space resumes it, call `go(index)` to replay the current beat from where the reader left the model; `go` resets the beat's clock, so a beat that had already finished plays again instead of sitting still (the run's own Space handler fires first, so a second keydown listener sees `playing` already true). Say so in the plate's hint, and in the stage's `aria-label` for the keys. The plate's corners are hidden from screen readers, so give what the reader changes (the date) a visually hidden `aria-live="polite"` line, written when a key is pressed or a drag ends, not every frame. On a phone the figure must still scroll the page: keep `touch-action: pan-y` on the stage and start a drag only when the pointer lands on the part being dragged.

## 8. Verifying

- **Time the run.** Log each beat's start time and how long its action took (the run sets `data-action-took` on the caption box). No beat should flip before its caption can be read, and the whole loop should be a comfortable watch (the toaster takes a little over a minute, the sharpener about half a minute).
- **A contact sheet of every beat in both themes:** with reduced motion each beat shows its finished state; capture each once and read every PNG. Each beat's actor is in frame, big enough to read, and lit; the caption matches what the frame shows.
- **Every `done` is reachable.** A beat whose condition never comes true stalls the run. The timing run gives up after 40 s of model time per beat; a beat that hits that is a bug.
- **The line check** passes in the overview (`scripts/lines.mjs` reads the page at load, which is beat 1).
- **390 px wide:** the caption wraps and the progress bar fits; the zoomed beats make the crew readable on a phone, which is what the overview can't do.

## 9. Anti-patterns

- **A beat where nothing moves.** Every beat after the first plays an action; a beat that only re-frames belongs in another beat's caption.
- **Zooming into empty space.** Points that miss the actor, or a view so tight the part it acts on is cut off.
- **Captions that repeat the legend.** Say what happens in this beat, not who the crew are again.
- **Long captions.** Each word adds a quarter of a second to the run. Two short sentences.
- **Stop-and-go.** Freezing the machine at the end of every beat. The run flows; it only waits when running on would spoil the next beat.
- **Coloured machines.** Any tint on a housing, prop or wall competes with the crew. The machine and the scene stay in the kit's tones; only light and heat glow.
- **Words in the drawing.** Titles and captions live under the picture, never on it.
