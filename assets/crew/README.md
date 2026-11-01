# The drawn crew

Illustrated animals for the crew, bundled with the skill so nobody who uses it needs an image model. A species with a sheet here is drawn from its sheet in every machine, for every pose the sheet has art for; any other pose, and any species without a sheet, is drawn by the rig as before. The rig still decides everything that moves: where the animal stands, which way it faces, what it holds.

- `<species>.webp`: one sheet per animal, a grid of 512-unit cells (stored at half size), every frame scaled to the same body height and pinned at the same point.
- `sprites.json`: per animal, its grid, which way the art faces, its body height, its actions (frame lists) and, per frame, its cell (`rect`), its `feet`, its `box` and, for hanging frames, its two `grips`. Cell units.
- `style-reference.webp`: the approved look. Attach it to every generation.
- `PROMPTS.md`: the prompts to generate a sheet.

## Actions

The rig's pose picks the action; the first one the sheet has wins, so a sheet can start small.

| Action | When the rig asks for it | Frames | Pinned by |
|---|---|---|---|
| `idle` | standing upright, nothing in its paws | 4: calm, half blink, blink, open | feet |
| `work` | paws on a handle, knob, lever or crank | 4: an effort cycle, paws forward at chest height | feet |
| `walk` | walking upright (frames follow the stride) | 4 to 8 | feet |
| `react` | startled, or thrown into the air | 4: startle, recoil, recover, settle | feet |
| `sleep` | eyes shut | 1 to 4 | feet |
| `run` | on all fours, moving (a wheel, a lap) | 4 to 8 | feet |
| `stand4` | on all fours, still | 1 to 4 | feet |
| `hang` | hanging from both hands overhead | 4 to 8 | the two topmost claws |
| `peck` | the woodpecker striking with its beak | 4 | feet |
| `fly` | the woodpecker with its wings open | 4 | feet |

What the shipped machines use: `hang` (Mo in the toaster, sharpener and clock), `run` (the sharpener's and vending machine's wheel hamsters), `work` (nearly everyone else), `walk` (Pip pushing the dial's carriage and the seasons arm), `idle` and `react` everywhere, `peck` (Knock in the clock). The electric eel lies along a wire and stays drawn by the rig.

## Adding an animal

1. **Generate** a sheet with your image model, using `PROMPTS.md` and `style-reference.webp`. One sheet can hold several actions, a row each; 4 by 3 cells is a good size. Transparent background is best; a plain flat one is keyed out.
2. **Pack** it:

   ```
   node scripts/pack-sprites.mjs fennec fennec-sheet.png --actions idle:4,work:4,react:4 --facing right
   ```

   It keys out a plain background, finds each whole animal on the sheet (named by the cell its centre sits in, so a paw that reaches past the cell line is kept and a neighbour's never comes along), drops stray specks, scales every frame to one body height, pins it by its feet (the lowest point under its centre of mass; by its claws in `hang`, by its centre in `fly`), writes `fennec.webp`, merges its entry into `sprites.json` and writes `review-fennec.html`.
3. **Review**. Open the review sheet: every frame on paper and on dark, feet marked red, grips blue, and any problem in red under it (a figure cut off by its cell, a pale fringe left from the background, an empty cell). Regenerate a frame rather than living with one.
4. **Check it in place**: `node scripts/cast-sheet.mjs --only=fennec --light` shows the animal in all ten poses; poses still drawn by the rig are the actions it lacks. Then rebuild a machine that uses it and watch it run.
5. **Ship** the `.webp` and the `sprites.json` change. Packing again replaces the animal's sheet. To add actions and keep the art it has, pack a sheet of just the new rows with `--add` (same number of columns): they go under the existing ones at the same body height.

The art is made once, by whoever adds the animal; the skill never generates art. Covered by the repository's MIT licence.
