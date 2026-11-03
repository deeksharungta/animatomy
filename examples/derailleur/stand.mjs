import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, Dt } from "./model.mjs";
import { tube } from "./bike.mjs";
import { partsKit } from "./moving.mjs";

const Q = partsKit({ ...k, ...L }, P, C);
// The repair stand's post rises behind the bike to the clamp on the seatpost, out of the card above. On it: the height
// clamp, a collar with its quick-release lever between the lower and upper tubes, and the tool tray on its own clamp.
const [X, Y] = [-330, -195], CZ = -60, TZ = -150, T = [-262, -262, TZ];

export function standPost() {
  const up = [0, 0, 1], lever = [X + 44, Y + 30, CZ - 10], ring = (F, s, r) => Ln(L.arcOf(F, s, r, P), { tone: "faint" });
  const F = L.frameAlong([X, Y, CZ], up), G = L.frameAlong([X, Y, TZ], up);
  // The tray's clamp ring on the lower tube, its arm, and the round tray with a rim and a few tools lying in it.
  const tray = S(L.disc(-10, 10, 23, G, P), { tone: "mid", crease: "lo", inner: ring(G, 0, 23) }) +
    S(Q.bar3([X + 14, Y - 14, TZ - 4], [T[0] - 40, T[1] + 40, TZ - 4], 6, 3, up), { tone: "mid" }) +
    S(k.cylinder(T[0], T[1], 58, TZ - 8, 4, P, 48), { tone: "mid" }) + S(L.ringBand(-4, 8, 54, 58, L.frameAlong(T, up), P), { tone: "hi", crease: "lo" }) +
    S(k.cylinder(T[0] - 18, T[1] + 6, 9, TZ - 4, 6, P, 20), { tone: "hi", inner: Ln(k.ring(T[0] - 18, T[1] + 6, 4, TZ + 2, P, 16), { tone: "lo" }) }) +
    S(Q.bar3([T[0] - 6, T[1] - 30, TZ - 2], [T[0] + 28, T[1] + 18, TZ - 2], 2.4, 2, up), { tone: "hi" }) +
    S(Q.bar3([T[0] + 10, T[1] - 26, TZ - 1.4], [T[0] + 34, T[1] - 2, TZ - 1.4], 4, 1.4, up), { tone: "lo" });
  return tube([[X, Y, -900], [X, Y, CZ - 14]], 21, "mid", 0) + tray +
    S(L.disc(-14, 14, 25, F, P), { tone: "hi", crease: "lo", inner: ring(F, 0, 25) }) +
    S(Q.bar3([X + 20, Y + 12, CZ], lever, 3.4, 3, up), { tone: "hi" }) + Dt([at(lever)], { size: 1, tone: "lo" }) +
    S(L.disc(-6, 6, 7, L.frameAlong([X + 18, Y + 12, CZ], [0.5, 0.86, 0]), P), { tone: "mid", crease: "lo" }) +
    tube([[X, Y, CZ + 14], [X, Y, 900]], 17, "hi", 0);
}
