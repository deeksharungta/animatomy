# Changelog

## Unreleased

### Added

- `examples/longcase-clock`: an eight-day longcase clock. Rocky the raccoon (power) winds the weight up with the crank, Mo the sloth (sensing and timing) hangs from the pendulum's rod and swings with it while the anchor lets the escape wheel go half a tooth a second, and at one o'clock Knock the woodpecker (spring), who is the hammer, strikes the bell once. The hands are in blued steel; the woodpecker gets its first job. It is written in files of 150 lines or fewer.
- `examples/espresso-machine`: a single-boiler espresso machine, staffed by three crew members no example used before. Ember the fennec fox (heat) holds the heater switch on top of the boiler until the thermostat knocks it back at 93 °C, Ollie the otter (fluid) works the vibratory pump's piston, and Crumb the mouse (sensing) sits on the over-pressure valve until 9 bar lifts her off it. The coffee runs into the cup in its own colours, 36 g in 28 s, and WebGL draws the band heater's glow, the steam off the cup and the vent's puff into the drip tray. It is written in files of 150 lines or fewer.
- Run pages open bare: the figure plays on its own with no caption panel on screen (the panel stays in the page for screen readers, pinned inside the figure's box so it never adds a scrollbar) and in the light theme only, whichever theme it was built in. `?full` on the URL shows the caption panel and the built theme. It lives in `mountSteps`, so the toaster, sharpener, vending machine and seasons pages all take it.

### Changed

- The README shows four more figures (seasons, the sharpener, the vending machine and the dial, from the current builds), says how a figure gets made in five steps, explains the default and `?full` ways to open a page, installs with one `git clone`, and lists every example. The old dial image, which still showed the glow, is replaced.
- Staff Only is now Animatomy, a parody of Anatomy's name: the skill's `name` is `animatomy` (invoke it as `/animatomy` and install it at `~/.claude/skills/animatomy`), and every mention in the README, SKILL.md, the references, the evals, the agent card, the licence and the kit is renamed. The releases below keep the name they shipped under. The `so-` CSS and id prefixes are unchanged.
- The pencil sharpener's pencil is drawn in its own colours instead of glowing: yellow paint, bare wood and graphite on the cone as it is cut, and a pink eraser, each with `subjectCss`. The shavings it sheds are bare wood with a band of yellow paint along one edge, and the pile in the drawer is wood. The metal ferrule stays in the kit's tones. The sharpener no longer uses `subjectDefs()`.
- The vending machine's coin is brass instead of glowing, and so are the coins stacked in the cash box. It no longer uses `subjectDefs()`.
- The dial indicator crew's gauge blocks are polished steel, a cool grey set apart from the machine's tones, instead of glowing. It no longer uses `subjectDefs()` or `subjectSvg()`.
- `examples/seasons/build.mjs` is split into files of 150 lines or fewer: `model.mjs` (the numbers, the calendar and the camera), `moving.mjs` (the arm, gears, globe surface and crew poses), `scene.mjs` (the desk and the static machine), `story.mjs` (the crew, the reach check and the beats), `page-draw.mjs` and `page-run.mjs` (the page script), and `build.mjs`, which assembles the figure and writes the pages. The built pages are byte-identical.

### Removed

- `subjectDefs()`, `subjectSvg()` and the glow CSS (`.so-subject`, `--so-subject`) in `kit/critters.mjs`. Every subject is now drawn in its own colour with `subjectCss()`.

## Staff Only 0.10.0 (2026-10-29)

### Added

- `examples/seasons`: why the Earth has seasons, on a tellurion. A lamp is the Sun; a year arm carries a coloured globe round it on five equal gears, so the 23.4° axis keeps pointing the same way. Volta lights the lamp, Pip walks the arm round by a knob (one lap a year), and Mo turns the globe by a crank on its south end (one turn a day). The arm keeps the real calendar, and the Sun's height, London's day length and its noon Sun come out of the machine's geometry. Drag the globe or press ← → to set any date; Space plays on. A WebGL glow lights the lamp in both themes.
- `aim(viewBox)` on the object `mountSteps` returns: points the camera somewhere else until the run resumes or changes beat, for figures the reader can take over.
- `mountSteps` takes `draw`: with it, reduced motion runs each beat to its end on the model and draws once, instead of redrawing at every step (beat changes froze the page for up to a second). The toaster, sharpener and vending machine pass it.

### Fixed

- `mountSteps` escapes the crew member's name with the same `esc` as the rest of the caption.

## Staff Only 0.9.0 (2026-10-29)

### Changed

- The subject is drawn in its own colour instead of glowing. `subjectCss(selector, light, dark)` in `kit/critters.mjs` gives a group the kit's tone tokens in one colour, so its solids keep their shading. The toaster's bread is first: a golden crust, a pale crumb, and a toast colour over both as it browns (it used to turn dark grey). The glow was dropped: it carried no information and leaked out where the bread was hidden behind the boards.

### Removed

- The pigeon and its `envelope` prop. The woodpecker stays as the one bird, and keeps the beak reach, neck and wings.

## Staff Only 0.8.0 (2026-10-29)

### Added

- The subject glows. `subjectDefs()` and `subjectSvg()` in `kit/critters.mjs` put a soft halo (warm white in dark, highlighter gold in light) on the thing the machine works on, so the reader can follow it through the machine: the toaster's bread, the sharpener's pencil, the vending machine's coin and the dial indicator's gauge blocks.

### Fixed

- The sharpener, vending machine and dial indicator descriptions no longer mention the caps, scarves and goggles their crews stopped wearing.

## Staff Only 0.7.0 (2026-10-29)

### Added

- Two birds: a great spotted woodpecker (striking: hammers, needles, strikers) and a rock pigeon (carrying: messages, signals, small parts). Birds work with their beaks: `pose.beak` is a world point the beak tip lands on, reached by leaning the body a little, tipping the head and stretching the neck, with any shortfall in `reach.beak`. `pose.wings` lifts the folded wing or, from 0.5, spreads and beats it.
- The cast sheet draws the birds pecking and flying in place of reaching, going on all fours and hanging.

### Changed

- Props are trimmed to the three that read cleanly at figure size: `glasses`, `sweatband` and, for birds, `envelope`. Hats, goggles, the pencil, bow tie, stopwatch, whistle, mitts, notebook and clipboard are gone; they read as stickers or specks. In the examples only Mo (glasses), Roo and the sharpener's hamsters (sweatbands) wear anything. The cast sheet's "kitted out" column is gone.

## Staff Only 0.6.0 (2026-10-29)

### Added

- The electric eel, the first crew member with no limbs. It lies along a path in the world (`pose.path`, snout first), drawn along it each frame with a head like the others', a fin under its length and a role collar, and crackles with sparks while charged (`charge`, `flicker`, and `target` for an arc from its snout). It takes head and neck props.
- The cast sheet draws the eel in every cell: straight at four headings, swimming, curled, hanging and charged.

### Changed

- `examples/toaster`: Volta the electric eel (power) replaces Ember on the live wire. The carriage's foot now closes the contacts on its own, as in a real toaster, so they need no operator; Volta lies along the wire with his snout on its terminal and crackles while current flows to the ribbons. The heat is slowed while the carriage goes down, so the ribbons come up in Volta's beat. Ember stays in the cast for a future heat job.

## Staff Only 0.5.0 (2026-10-29)

### Added

- `examples/toaster`: the new reference figure. A pop-up toaster cut away on a kitchen counter, run by five crew with props: Rocky the raccoon lifts the browning knob's pointer lever, whose cam lowers the bimetal strip's bracket; Roo the kangaroo stamps the lever down; Dig the mole swings the latch hook over the carriage pin; Ember the fennec fox presses the heater contacts closed; Mo the sloth rides the strip as it curls and trips the hook. A WebGL layer between a back and a front drawing paints the glowing nichrome ribbons, the warm light on the bread and walls, and the spark as the contacts open, in both themes. The build checks every paw at every knob setting and temperature.
- Four species: fennec fox, raccoon, otter and crab (eleven in all).
- Props. `PROPS` in `kit/critters.mjs` and `spec.wear` put a hard hat, miner's hat, cap, sweatband, glasses, goggles, a pencil, a bow tie, a stopwatch, a whistle, oven mitts, a notebook or a clipboard on any critter. They are anchored to each drawing's head, eyes, neck and paws, follow the lean, the head and the mirror, and take the role colour when they are cloth or plastic. The crew in every example wears them.
- `scripts/cast-sheet.mjs` gains a "kitted out" column.
- `references/crew.md`: the new species, a props section, crew size by mechanism, the glow rule and how to give a small control a handle.

### Changed

- The step player is now a continuous run. `mountSteps` plays the whole story without stopping: no buttons, no step dots, no autoplay toggle, just a caption, who is on duty and a progress bar. Each beat lasts at least as long as its caption takes to read; given `advance`, `save` and `load`, the run times every beat once at mount, slows quick actions to fill their caption, and lets the machine keep running between beats unless that would spoil the next one. `hold` replaces `dwell`, `svg` may be several layered drawings and `onView` lets a WebGL layer follow the camera. Space pauses, Home restarts. `references/steps.md` is rewritten for it.
- Light and heat may glow in colour: the machine and scene stay monochrome, but what they give off (a hot element, a flame, a spark, a lamp) is drawn on a WebGL layer while it is on.
- One critter per mechanism, up to seven per figure (was two to five), so detailed machines get a full crew.
- The crew examples' captions are shorter and some beats merged, for the continuous run.
- `SKILL.md` and the README describe the run, props, the glow and the toaster.

## Staff Only 0.4.0 (2026-10-29)

### Changed

- The crew is redrawn from scratch as real animals. `kit/critters.mjs` no longer builds critters from solids or blended lobes: each species is a painted illustration (authored shapes from the real animal, soft gradients lit from above, markings that fade into the fur, fur strokes at the edges and hair strands inside, no outlines) on a 2D rig that places it in the figure's camera. It faces its heading (mirrored left or right, seen from behind when it walks away), leans, tips its head, steps, sways its tail and reaches two-bone arms to world points. New stances: `"four"` (a side-on drawing on all fours whose legs run from `stride`) and `"hang"` (arms up, feet dangling, for a sloth on a lever). Eyes squint for `"happy"` and close with a lid for `"shut"`. The on-duty critter gets a thin rim instead of a heavier outline. Posing is a handful of transforms, so frames are cheaper than before.
- Machines and scenes are monochrome again, drawn exactly as Anatomy draws them. `MATERIALS` and the `mat-*` tokens are gone; the only colour in a figure is on the animals (their fur and a role-coloured collar).
- `spec.wear` is gone: every critter wears one collar in its role colour. (0.5.0 brings `spec.wear` back for props.)
- The three crew examples use the new crew: the hamsters run on all fours, Mo hangs from the sharpener's lever, Dig holds the top of the coin, and the scenes lose their material colours.
- `scripts/cast-sheet.mjs` shows every species at four headings and in six poses, including on all fours and hanging.

## Staff Only 0.3.0 (2026-10-29)

### Added

- `examples/vending-machine`: a Hero-size figure, a snack machine in a hallway with four crew (Dig the mole checks coins, Pip the squirrel banks them, Bun and Mochi turn coil B3) and seven steps, from the coin going in to the bar landing in the bin.

### Removed

- The GitHub Actions workflow. Run the tests and rebuild the examples locally (see `CONTRIBUTING.md`).

## Staff Only 0.2.0 (2026-10-27)

### Added

- The step player. `kit/steps.mjs`: `stepsHtml`, `STEPS_CSS`, `fitView` and `mountSteps`, which plays a figure's model one step at a time with Next, Back, step dots, autoplay, camera zoom by `viewBox`, keys and reduced motion; `stepsScript()` inlines it. `references/steps.md`.
- `MATERIALS` in `kit/critters.mjs`: pale material colours for machines and scenes, emitted by `crewCss()` in both themes.
- `examples/pencil-sharpener`: the reference figure, an electric sharpener on a desk with a full scene and seven steps.

### Changed

- Every Staff Only figure is now a full, softly coloured scene played step by step. `SKILL.md` gains a "Write the steps" step, scene and materials in "Plan the world", the step bar in "Frame it", the step player in "Make it live" and step checks in verification.

## Staff Only 0.1.0 (2026-10-27)

Forked from Anatomy at commit `1482e84` (Printable sheets, #126). Everything below that heading is Anatomy's history.

### Added

- The crew. `kit/critters.mjs`: `critter(spec, pose, P)` builds a cute isometric animal from kit spheres and a new `ellipsoidOf` (an ellipsoid shaded like `sphereOf`, with an optional clip plane), `critterSvg` draws it, `paintCritter` updates it in place each frame, `crewCss()` gives each species and each of eight roles its own token set in light and dark. Seven species (hamster, mouse, squirrel, beaver, sloth, mole, kangaroo), five role items (hat, scarf, band, cap, goggles), poses with paw targets, stride, lean, look, hop, squash and four eye states, and a reach report for paws that can't reach their handle.
- `scripts/cast-sheet.mjs`: every species at four headings and in four poses, in either theme.
- `scripts/inline-kit.mjs`: `crewScript()` inlines `kit/lathe.mjs` and `kit/critters.mjs` as one `CREW` namespace.
- `examples/dial-indicator-crew`: the dial indicator, staffed by Pip the squirrel and Mo the sloth, with the on-duty light and a build-time reach check.
- `references/crew.md`: casting, roles and colours, the cast, building, posing, reach, the duty light, motion, order, performance, verification, adding a species, anti-patterns.
- `scripts/critters.test.mjs`: the crew builds for every species, heading, role item and eye state without a NaN, and `ellipsoidOf` matches `sphereOf` on a sphere.

### Changed

- `SKILL.md`: renamed to `staff-only`; the one idea now includes the crew; a "Cast the crew" step after the parts list; crew rules; crew checks in verification; crew files in the setup table. The community gallery is Anatomy's and is not used.

All notable changes to Anatomy are recorded here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Releases follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html); entries from before the first release are dated.

## [Unreleased]

### Added

- Printable sheets. `scripts/print.mjs` freezes poses of a built figure as vector stills (WebGL as a 2× PNG) and prints one A4 or US Letter PDF in three formats: `poster` (one page: big name, numbers, pinned figure and a line per part), `drawing` (one page: parts list, specification, inset and a strip of lit steps) and `detailed` (two pages: pinned figure with round close-ups, then large lit steps with text and the why). Parts are CSS selectors over the live SVG, so any figure can be printed; crowded pins spread apart with hairline leaders, and the script fails when a format runs past its pages. `examples/raptor-engine/sheet.mjs` and `examples/arcade-cabinet/sheet.mjs` are the references, `references/print.md` the guide.
- Antigravity support, alongside Claude Code, OpenCode and Codex. Documented user and project installation paths in the README and CONTRIBUTING, updated SKILL.md compatibility, and added Antigravity to the bug report form.
- MiniMax Code support. The README and CONTRIBUTING document its user (`~/.minimax/skills`) and project (`.minimax/skills`) folders and `npx skills add ... -a minimax-code`, SKILL.md lists it, and the bug report form offers it.

### Changed

- A Figure no longer quotes a time to the user. The 30–90 minute estimate was often far longer than the build itself ([#41](https://github.com/wheresryan22/anatomy/issues/41)).

### Fixed

- Line-end audits follow cubic and quadratic strokes with a bounded screen-space approximation, so lines attached between curve samples are not reported as loose.

- `drive.mjs` waits for the page to load (up to 10 s) before it runs the first action, and gives up with an error when Chrome leaves a request unanswered for 60 s instead of hanging, as `capture.mjs` now does.
- `drive.mjs` rejects an `orbit` whose step is zero or points away from its end angle, and a `sheet` whose count is not a whole number of at least 1, before Chrome starts. A zero step used to capture frames without ever finishing; the others died with `Cannot read properties of undefined (reading 'width')`.
- `publish.mjs --force` keeps the figure it was replacing when the new publish fails (a `--pages` file that does not exist, files that reach outside the folder, a failed build), and a missing `--pages` file now says `page X not found` instead of a bare `ENOENT`.
- `publish.mjs` rejects unsupported license values before building a figure, matching the community gallery's MIT and CC-BY-4.0 schema.
- `capture.mjs` rejects option values it cannot use (`--zoom` without four numbers, `--hover` without two, a non-numeric `--width`, `--scale`, `--wait` or `--times`, a `--theme` other than dark or light) before Chrome starts, instead of saving a shot as if they had been honoured.
- `turn-fidelity.mjs` transforms upright prisms through their authoring frame `F` (`F.o`, `F.u`, `F.v` and downward `F.a`) before calling `k.extrude`, so `turn-check.mjs --fidelity` matches `T.prism` on upright frame-authored and vertically split prisms.
- `audit.mjs` `supports` samples stiff tube surfaces on rings perpendicular to each segment's tangent (`ringAround`) instead of flat horizontal `XY` circles, so horizontal and inclined tubes detect vertical and perpendicular support contacts and no longer bridge air gaps past their flat end caps.
- A repeated vertex in a `T.prism` polygon no longer pushes a rounded corner outside the polygon: `roundedPolygon` drops consecutive duplicate points before it rounds.
- `T.prism` rejects a star polygon such as a pentagram, which turns the same way at every vertex but winds twice, with the same "split it into convex pieces" error as any other non-convex part.
- The 3D turn audit samples a clip through its last instant and never past it. A clip whose length was not a whole number of frames was sampled beyond its end, or stopped short of its final pose.
- `capture.mjs` waits for the page to load before it touches it, even with `--wait 0`, and gives up with an error when Chrome leaves a request unanswered for 60 s instead of hanging.
- `drive.mjs` `until` times a condition inside the page, so one that is already true passes however short the wait, even on a slow machine; a promise that never settles still times out.
- Start headless Chrome on Windows from an elevated terminal: `capture.mjs`, `drive.mjs` and `turn-check.mjs` pass `--do-not-de-elevate` there. Chrome otherwise relaunches itself without the elevation, the process the script started exits with code 0, and the check stops with `Chrome exited before startup: 0` while the relaunched browser stays running.
- Resolve the current React readout target on every write so replaced readouts and anchors do not leave updates on detached elements.
- Reject drive `turn` and `orbit` actions when the page has no callable 3D turn controller, instead of reporting an unchanged figure as a successful turn.
- Await asynchronous `until` conditions without treating the promise itself as success, while enforcing the wait deadline.
- Capture measures the current figure before every screenshot, including moved, resized and timed zoom crops.
- `publish.mjs --submit` makes the fork again with gh 2.101 and later, which refuse `--remote` when a repository is named; gh never adds a remote in that case, so the flag is gone (#53).
- Ripple Tank's water and paper shaders read their ink colour from the same fixed per-theme uniform as every other tuned constant in the figure, instead of carrying its own hardcoded `pale ? light : dark` pair inline in GLSL.

## [1.1.0] - 2026-10-12

### Added

- `scripts/publish.mjs` and `references/publish.md`: share a finished framework-free figure in the community gallery, `wheresryan22/anatomy-community`. The script copies the figure, points its kit imports at the gallery's `.skill/` link, records the kit fingerprint (`scripts/fingerprint.mjs`) so the gallery can rebuild it with the same kit version, and copies only the source, under `figures/<author>/<id>/`. The gallery builds the pages in a locked sandbox. `--submit` sends it as a pull request after asking, making a fork when needed.
- `publish.mjs` records how long the figure took to make and how many tokens it used. In Claude Code it reads them from the session's own log (`scripts/session.mjs`, through `CLAUDE_CODE_SESSION_ID`, subagents included): from the request that made the figure to the request to publish it, idle gaps over 10 minutes left out and cache reads not counted. The plan shows both before anything is sent. `--minutes` and `--tokens` set them by hand, `--no-session` leaves them out.
- `publish.mjs` accepts `--agent Antigravity`, alongside Claude Code, OpenCode, Codex and Other.
- OpenCode and Codex support, alongside Claude Code. `SKILL.md` exposes `/anatomy` to OpenCode through `metadata`, `agents/openai.yaml` gives Codex its display name, and the README, CONTRIBUTING and the bug report form cover all three agents.

### Fixed

- Start headless Chrome on Linux: `capture.mjs`, `drive.mjs` and `turn-check.mjs` pass `--no-sandbox` there and find Playwright's Linux Chromium under `~/.cache/ms-playwright`, so the browser checks and the gallery's validator run on Linux hosts.
- `references/publish.md` clones the gallery with `--single-branch`, so contributors skip the previews branch and its images.
- `publish.mjs --submit` no longer stops with "already exists" when an earlier run without `--submit` left the figure's folder in the clone; it only asks for `--force` when the folder is already on the gallery's main.
- Preserve configured pipe clearances in broad-phase solid and pipe sampling.
- Observe replacement and late-mounted DOM targets through useInView.
- Check texture line attachments against rounded rectangle corners, including separate radii, SVG clamping and transformed outlines.
- Honor explicit capture, drive and line-check selectors, and scope reported readouts to the requested figure.
- Decode valid SVG attribute quotes, whitespace and XML character references in audit bounds.
- Exclude invisible empty clip intersections from authored SVG bounds.
- `scripts/drive.mjs` now fails when a browser evaluation throws or rejects, rather than reporting a clean successful session.
- The arcade cabinet now accepts coins with reduced motion enabled, preserving the meter, credit and power-on events when the coin animation is skipped.
- The turning dial stops its idle tour when reduced motion is enabled while the page is open and cancels its pending automatic restart while preserving keyboard and pointer input.
- `scripts/drive.mjs` now exits with status 1 and stops subsequent actions when an `until` condition times out.
- `scripts/capture.mjs` now creates the output directory for screenshots, including nested paths under `shots/`.
- The line-end check now includes the selected element when `--select` names an SVG, rather than checking only SVGs inside it.
- `scripts/drive.mjs` now rejects unknown actions before running the session, so a misspelled verification step cannot report success.
- Browser checks now fail promptly and remove their temporary profiles when Chrome exits before its debugging port is ready.
- The line-end check now uses ellipse boundaries and transformed circle boundaries, and treats hollow interiors as empty instead of solid dots.
- The line-end check now follows SVG arc curves instead of treating each arc as a straight chord.
- Capture and drive now fail when Chrome cannot load the requested page, instead of reporting a clean browser error page.
- Orbit checks reject invalid sampling steps and empty pose lists before a zero-state sweep can pass.
- Solid clearance audits rebuild cached surface grids when sampling spacing or cell size changes.
- Tube geometry audits use tapered radii instead of replacing every segment with an averaged cylinder.
- The line verifier reflects smooth Bezier controls only after the matching curve family.
- Capture and drive send native Enter activation so button and form checks perform their default action.
- Fixed-part and coverage bounds restore a closed SVG subpath origin before relative moves.
- Audit ray casts now refresh body camera coefficients when the projection direction changes, so repeated builds retain the correct depth order.
- Audit profile tracing now checks quarter-span deviations, preserving inflected analytic and smooth profiles whose midpoint lies on their chord.
- Depth-key solving now allows large acyclic figures to converge beyond 400 rounds and avoids choosing a cycle victim from an empty set of violated rules.
- Splitting now accepts default fixed rounds and preserves explicit prism/round ownership, so a pipe fitting can be split without inventing collisions with its own pipe.
- Turning builders now reject missing named part/parent groups and duplicate group names before authored motions silently become static or alias one value.
- Native fidelity checks now compare complete filled silhouettes for cut parts and honor open round ends in the kit reference, preserving deliberately unstroked cut edges.
- Tube fidelity checks path coverage in both directions when vertex counts differ, rejecting empty or truncated live silhouettes while preserving equivalent resampling.
- Solid clearances check sliding rods whose drawn reach changes, even when their stretching geometry leaves no relative translation to a stationary obstacle.
- React `Solid` honors the existing `paths.seamless` marker so smooth tone regions receive the same seam treatment as the plain SVG renderer.
- React `Dots` retains the kit's optional per-point opacity, including fading bolt circles and pulsing dots, while ordinary points remain opaque.
- Write the first readout value even when empty or issued before passive binding.
- Measure transformed rectangular and round SVG primitives through their true affine bounds.

## [1.0.0] - 2026-10-10

### Added

- `examples/arcade-cabinet/`, an upright arcade cabinet with its side panel off. A quarter rolls down the coin chute past the coin-switch wire into the cash box, the switch's pulse runs along its cable to the board, and the CRT warms up, self-tests and runs an attract mode drawn in the plane of the tilted monitor; the stick closes a microswitch under the panel. It draws in the light and dark themes and passes `--audit`.
- `examples/spot-plate/`, a second React figure from the same site as `test-rig`: six pairs of glass drops that run together into one piece of glass as a fan of feeler blades sets `merge`. It draws in the light and dark themes.
- A first workflow step, **Size it before you start**: every request is sized as a Figure (about 30–90 minutes), a Hero (2–4 hours) or an Epic (6 hours or more), and the estimate is told to the user first. An Epic is not started until the user chooses it over a proposed Hero version. Every size has a working page within the first hour, and Claude reports when a step runs past twice its share of the estimate.

### Fixed

- `examples/test-rig/` drew its glass button dark in the light theme. `stretch.css` now has light values for its own colours.

### Changed

- The workflow steps are renumbered 1–10.
- The 4× detail sweep scales with the size: the subject and mechanism for a Figure, the whole drawing for a Hero or an Epic. The density rule itself still holds for every figure.
## 2026-10-08

### Changed

- The skill is now called Anatomy: `name: anatomy` in `SKILL.md`, invoked as `/anatomy`. It was developed privately as `isometric-objects` before this date, without releases.
- The CSS tokens are now `--anatomy-*` (for example `--anatomy-card`, `--anatomy-face`, `--anatomy-shade-0`); they were `--iso-*`. Every example is rebuilt with the new names.
- The figure card (`.iso-plate`) is square and flat: no rounded corners and no floating shadow, just a 1 px rule in the drawing's mid tone.
- `SKILL.md` makes high detail a standing rule for every figure, raises the parts list to at least 40 parts (60–150 for a hero figure), and adds a 4× detail pass to the final check.

### Added

- The public repository: a README with screenshots of the examples, the MIT license, a contributing guide, a code of conduct, a security policy, issue forms, a pull request template, and a CI workflow that rebuilds every example and fails if a committed page changes.
- What the skill contains at this point: the workflow and craft rules in `SKILL.md`; the kit (SVG core, round parts, pipes, the geometry audit, the WebGL layer, React components, and the 3D mode in beta); eight references; the headless Chrome checks in `scripts/`; six examples (`dial-indicator`, `desk-computer`, `raptor-engine`, `ripple-tank`, `test-rig`, `turning-dial`); and five evals.
