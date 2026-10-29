import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const KIT = join(dirname(fileURLToPath(import.meta.url)), "..", "kit");
const strip = (file) => readFileSync(join(KIT, file), "utf8").replace(/^export /gm, "");

export function kitScript() {
  return strip("iso-kit.mjs");
}

export function glScript() {
  return strip("gl.mjs");
}

export function turnScript() {
  return strip("turn.mjs");
}

export function fixedScript() {
  return strip("turn-fixed.mjs") + "\n" + strip("canvas-painter.mjs");
}

export function glSharedScript() {
  return strip("gl-shared.mjs");
}

const unmodule = (file) => readFileSync(join(KIT, file), "utf8").replace(/^import[^;]+;\s*$/gm, "").replace(/^export /gm, "");

export function crewScript() {
  return `const CREW = (() => {\n${unmodule("lathe.mjs")}\nreturn (() => {\n${unmodule("critters.mjs")}\nreturn { critter, critterSvg, paintCritter, SPECIES, ROLES, ellipsoidOf, sphereOf, solidOf, ringBand, disc, prismOf, ribsOf, spokesOf, frameAlong, frameOf, pointOf, add3, sub3, mul3, unit3, len3, cross3, dot3 };\n})();\n})();\n`;
}

export function stepsScript() {
  return `const STEPS = (() => {\n${unmodule("steps.mjs")}\nreturn { mountSteps, fitView };\n})();\n`;
}
