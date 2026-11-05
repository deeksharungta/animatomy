// Nib, the mouse the trap is set for: off duty, out of the hole for the cheese. The path, the walk, the tug on the
// cheese, the jump when the hammer lands, and the run home. Serialized into the page as they stand: they use only
// C, S and pedalPt.
import { pedalPt } from "./model.mjs";

// Where Nib is at a distance along the path from the hole: the point and the way the path runs there.
export function nibAt(C, md) {
  const pts = C.NIB.path;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (md <= l || i === pts.length - 1) {
      const t = Math.max(0, Math.min(1, md / l));
      return { p: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, 0], dir: (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI };
    }
    md -= l;
  }
}

// One frame of Nib: walk toward the target, turn to face the way, take or let go of the cheese, jump, then run home.
export function nibStep(C, S, dt) {
  const N = C.NIB, ease = (v, t, tau) => v + (t - v) * (1 - Math.exp(-dt / tau));
  const out = S.mdT > S.md, v = out ? N.walk : N.run;
  S.md = out ? Math.min(S.mdT, S.md + v * dt) : Math.max(S.mdT, S.md - v * dt);
  S.stride += Math.abs(v * dt) * (S.md === S.mdT ? 0 : 1);
  const there = S.md >= N.len - 0.01;
  const want = there ? 180 : nibAt(C, S.md).dir + (out || S.md === S.mdT ? 0 : 180);
  S.mh += ((((want - S.mh) % 360) + 540) % 360 - 180) * (1 - Math.exp(-dt / 0.1));
  S.grab = ease(S.grab, there && S.scare === 0 ? S.grabT : 0, 0.22);
  if (S.scare > 0) {
    S.scare += dt;
    const t = Math.min(1, S.scare / 0.4);
    S.hop = N.hop * Math.sin(Math.PI * t);
    S.back = N.back * t * (2 - t);
    if (S.scare > 1.1 && S.mdT !== 0) S.mdT = 0;
  }
  if (S.md === 0 && S.mdT === 0) { S.scare = 0; S.hop = 0; S.back = 0; }
}

// Nib's pose: on all fours along the path, then up on the hind feet at the end with paws and teeth on the cheese's
// tall end, which tips with the pedal. Out of sight (null) inside the hole.
export function nibPose(C, S) {
  const N = C.NIB;
  if (S.md < 1) return null;
  const { p } = nibAt(C, S.md), there = S.md >= N.len - 0.01;
  if (!there) return { at: p, heading: S.mh, stance: "four", stride: { phase: S.stride / N.step, amount: 0.13 }, eyes: S.scare > 0 ? "wide" : "open" };
  const s = C.PEDAL.h + 1.4, g = S.grab, G = N.grip, on = (u, v, z) => pedalPt(C, u, v, s + z, S.psi);
  return {
    at: [p[0] + S.back, p[1], 0], heading: S.mh, hop: S.hop,
    lean: N.lean[0] + N.lean[1] * g, look: [0, 8 + 6 * g],
    paws: g > 0.05 ? { l: on(G[0], -G[1], G[2]), r: on(G[0], G[1], G[2]) } : undefined,
    bite: g > 0.5 ? on(G[3], 0, G[4]) : undefined,
    eyes: S.scare > 0 ? "wide" : g > 0.5 ? "happy" : "open",
  };
}
