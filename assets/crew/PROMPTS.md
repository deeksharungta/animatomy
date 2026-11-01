# Prompts for a crew sheet

Attach `style-reference.webp` to every request: it is the approved look (the hamster and the sloth). Fill in the three parts below and send them as one prompt. These are the prompts the hamster and sloth sheets were made with, made general.

## 1. Style (always the same)

> Production asset: a detailed animation sprite atlas of ONE animal. The attached image is the approved style reference; match its look exactly but draw only the animal named below, with no props, machines or bars. Crisp scientific natural-history illustration: realistic adult anatomy, tiny natural eyes, muted natural colours, precise warm-grey technical contours, fine directional fur engraving, light four-tone directional shading lit from the upper left, pale solid volumes. Orthographic isometric camera elevated 30 degrees, the animal facing screen RIGHT, showing its front and right side, as in the reference. It belongs inside pale, precise isometric technical machines: no cartoon, no plush, no giant eyes, no photographic rendering, no thick outlines, no saturated colour.

## 2. The animal (one line, from the cast)

| Species | Line |
|---|---|
| hamster | a Syrian hamster: pear-shaped, golden ochre back, cream belly and cheeks, small round pink-lined ears, delicate pink digits, a thin mustard sweatband |
| mouse | a wood mouse: brown back, white underside, big round ears, dark eyes, a long fine tail |
| squirrel | a red squirrel: ear tufts, pale eye ring, white belly, dark long-toed feet, a plume of a tail curled up its back |
| beaver | a beaver: heavy and hunched, small ears, broad muzzle, orange incisors, webbed hind feet, a flat scaled tail |
| sloth | a three-toed sloth: pale taupe shaggy coat, light face with dark eye patches, long forearms, curved three-clawed hands, a very narrow dusty-blue collar, delicate round wire glasses |
| mole | a European mole: velvet black coat, a furred cone of a head with a short pink snout tip, huge pink spade hands with claws, hidden eyes |
| kangaroo | a red kangaroo: upright on long hind feet, a thick tail behind, long ears, long muzzle, short arms, a thin sweatband |
| fennec | a fennec fox: sand-coloured, enormous ears, cream face and chest, a dark-tipped bushy tail |
| raccoon | a raccoon: grey coat, black mask over the eyes, pale muzzle and brows, black hand-like paws, a ringed tail |
| otter | a river otter: sleek brown coat, broad flat head with small ears, pale throat, a thick tapering tail |
| crab | a shore crab: red shell with a pale underside, eyes on stalks, two big pincers, legs tucked under |
| woodpecker | a great spotted woodpecker: black back and wings with white shoulder patches and barred flight feathers, white face and underparts, black crown and moustache, red nape, chisel beak, stiff tail |

## 3. The layout and actions

> Deliver ONE atlas on TRUE TRANSPARENT background, 2048 x 1536 pixels: exactly FOUR columns and THREE rows of equal cells, twelve frames. No drawn grid, text, numbers, props, shadows, haze or paper. Every cell holds exactly one complete animal, with all ears, whiskers, claws, tail and feet inside the cell and a wide empty margin on every side. The SAME identity, scale and right-facing camera in every cell. The hind feet stand on the same baseline at 85% of each cell's height, the body centred at 48% of each cell's width; no drift of baseline or scale between frames.

Then one sentence per row, from this list (pick the actions the animal needs, a row each):

- **idle**: a four-frame upright idle, forepaws resting in front at chest height: slight inhale, half blink, blink closed, eyes open. Feet fixed.
- **work**: four effort poses, forepaws pressed forward on the SAME invisible handle at 65% of the cell's width and 48% of its height in all four: leaning in, crouching, full weight, recovering. Feet fixed.
- **walk**: four steps of an upright walk to the right, one stride cycle, feet on the baseline.
- **react**: four recoil poses: startled, small eyes open, torso recoils, forepaws lift, then settles. Do not jump; the animator moves the sprite.
- **run**: four steps of a run on all fours to the right, one gait cycle, feet on the baseline.
- **hang**: hanging with both arms overhead, the two hands gripping an invisible bar at the SAME two points near the top of every cell (x=40%, y=18% and x=59%, y=12%), body hanging below, legs bent; idle breathing and blinks. Keep the claws well inside the cell.
- **peck** (woodpecker): four frames of a strike: head back, swinging, beak tip at the same point, recoil.

## Tips

- Generate the idle row first, approve it, then attach the approved frame as a second reference for the other rows so the animal stays the same animal.
- If one frame is wrong, regenerate the sheet or replace that cell; never stretch a frame to fit.
- `node scripts/pack-sprites.mjs --help` lists the options, and its review sheet shows what still needs fixing.
