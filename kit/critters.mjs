// The Animatomy crew. Each animal is a natural-history illustration on a 2D rig: authored shapes facing left,
// standing on y = 0 and about 100 units tall, in pale muted tones with a fine ink contour and hatched fur.
// critter(spec, pose, P) places one in the figure's camera: it faces left or right by its heading, shows its
// back when it walks away, leans, hops, looks up and down, and reaches its paws to points in the world.
// critterSvg draws it at build time and paintCritter updates it each frame. The code is in kit/crew/.
export { ellipsoidOf } from "./crew/shapes.mjs";
export { ROLES, SPECIES } from "./crew/cast.mjs";
export { subjectCss, paletteOf, crewCss } from "./crew/colour.mjs";
export { PROPS } from "./crew/head.mjs";
export { critter } from "./crew/rig.mjs";
export { critterSvg, paintCritter, critterBox, setDuty } from "./crew/svg.mjs";
