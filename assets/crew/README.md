# Crew sprites

Illustrated animals for the sprite crew, bundled with the skill so nobody who uses it needs an image model.

- `hamster.webp`, `sloth.webp`: one atlas per animal, four columns by three rows of 512-unit cells (stored at half size, drawn at 2048 by 1536). Frames 0 to 3 idle and blink, 4 to 7 work, 8 to 11 react.
- `sprites.json`: per frame, its cell (`rect`), the foot `anchor`, the figure's `box` and, for animals that grip with two hands, the two `grips`. All in atlas units. Every frame is drawn for the default camera (azimuth 45°, elevation 30°), facing right.

The artwork was made once by the maintainers with an image model and packed into these atlases. Adding an animal or an action means adding an approved atlas and its manifest entry here; the skill never generates art. Covered by the repository's MIT licence.
