import { cutDepth, cutAngle } from "./mech.mjs";

// The crew, posed each frame from the state that moves their parts; serialized into the page too.
// Rocky's paws are the cut-away notch's hold on the lug beside him; Roo's paws push the refill's collar.
export function poses(C, S, D, F) {
  const Q = C.CREW, L = D.lug, N = L.near;
  const smooth = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
  const lerp = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
  // How firmly Rocky has the lug: full while it sits in his notch, letting go as it is pushed out and turns away.
  const grip = smooth((18 - N.off) / 8) * smooth((L.h - (C.Z0 + 0.9)) / 1.2);
  // He hooks his paws under the lug's front end and pulls it back against the spring; let go, they come up to his chest.
  const at = F.pt(Q.rocky.r, 270, Q.rocky.z), h = (Q.rocky.heading * Math.PI) / 180, fwd = [Math.cos(h), Math.sin(h)];
  const chest = (k, z) => [at[0] + fwd[0] * k, at[1] + fwd[1] * k, at[2] + z];
  const readyL = chest(1.5, 4.6), readyR = chest(1.1, 4.0);
  const [gl, gr] = Q.rocky.grip, onL = F.pt(gl[0], N.c + gl[1], N.lo + gl[2]), onR = F.pt(gr[0], N.c + gr[1], N.lo + gr[2]);
  const rocky = {
    at,
    heading: Q.rocky.heading,
    paws: { l: lerp(readyL, onL, grip), r: lerp(readyR, onR, grip) },
    lean: Q.rocky.lean[0] + Q.rocky.lean[1] * grip,
    look: [0, -10],
    eyes: S.duty === "rocky" && grip < 0.9 ? "wide" : "open",
  };
  // Roo stands on the nose's far cut edge behind the collar and shoves it toward the button: squashed when the
  // spring is pressed short, standing tall as it runs out.
  const B = C.BAR, seat = C.SPRING.seat, zc = D.collar;
  const zf = Math.max(seat + 0.9, zc - Q.roo.gap);
  const rin = C.CONE.seatR + ((B.ri - C.CONE.seatR) * (zf - seat)) / (B.joint - seat);
  const rout = C.CONE.nose + 0.145 + ((B.ro - C.CONE.nose - 0.145) * (zf - 0.8)) / (B.joint - 0.8);
  const rm = (rin + rout) / 2, d = cutDepth(C, zf);
  const span = zc - seat, press = Math.max(0, Math.min(1, (9.5 - span) / 4.9));
  const roo = {
    at: F.pt(rm, cutAngle(d, rm, true), zf),
    heading: Q.roo.heading,
    lean: Q.roo.lean + 4 * press,
    squash: 0.55 * press,
    look: [0, -8],
    paws: { l: F.pt(2.1, Q.roo.paw[0], zc - 0.06), r: F.pt(2.1, Q.roo.paw[1], zc - 0.06) },
    stride: { phase: zf / 2.4, amount: Math.min(0.12, Math.abs(S.hV || 0) * 0.02) },
    eyes: S.duty === "roo" ? (S.hV > 0 ? "happy" : "wide") : "open",
    tailSway: -0.2,
  };
  return { rocky, roo };
}
