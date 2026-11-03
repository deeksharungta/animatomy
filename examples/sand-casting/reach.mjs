import { checkReach, worstReach } from "../../kit/reach.mjs";
import { C, PH, GEO, P, PINCH, OLLIE } from "./model.mjs";
import { fresh, advance, levelZ } from "./physics.mjs";
import { fillOf } from "./section.mjs";
import { poses } from "./moving.mjs";

// Every paw on its handle through the whole pour, the freezing and the cooling: Pinch's claws on the two lugs
// at every lift. Ollie has no paw targets: he waits on the sleeve's rim, then treads the riser's liquid heart.
const S = fresh(PH);
S.mode = "pour";
const pinch = [], ollie = [];
for (let i = 0; i < 30 * 60 + 800; i++) {
  advance(C, PH, GEO, S, i < 30 * 60 ? 1 / 30 : 1);
  if (i % 15) continue;
  const F = fillOf(C, GEO, S, levelZ), p = poses(C, S, F, GEO), at = `at ${S.t.toFixed(0)} s (riser ${F.riser.toFixed(1)}, lift ${S.lift.toFixed(0)} N)`;
  pinch.push([at, p.pinch]);
  ollie.push([at, p.ollie]);
}
checkReach(PINCH, pinch, P);
checkReach(OLLIE, ollie, P);
export const REACH = { pinch: worstReach(PINCH, pinch, P), ollie: worstReach(OLLIE, ollie, P) };
