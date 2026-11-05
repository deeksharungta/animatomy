// The crew, posed each frame from the shaft angle that moves their parts; serialized into the page as it stands.
// Knock is the needle bar: he flies the needle's 31 mm stroke between two perches on the presser bar, its clamp in his
// beak. Pinch is the hook: his claws are its point, two laps of the race a stitch, taking the loop at the needle.
// Mo is the feed dog, hanging from the slot by his claws. Bun and Mochi run the wheel.
export function poses(C, S, kin) {
  const k = kin(C, S.th), N = C.NEEDLE, run = Math.min(1, S.omega * 1.2);
  const moving = S.omega > 0.02;
  // Knock: feet on the low perch with the needle down, on the collar perch with it up; flying between.
  const hop = k.top - (N.low + N.len), Kp = C.PERCH;
  // While the machine runs he keeps his wings beating, perched or not, so his drawing never swaps mid-stroke.
  const flying = moving || (hop > 0.6 && hop < N.stroke - 0.6);
  const knock = {
    at: [Kp[0], Kp[1], Kp[2] + hop], heading: 90,
    beak: [C.N[0], C.N[1] - 2.6, k.top + N.clamp / 2],
    wings: flying ? 0.75 + 0.25 * Math.sin(S.t * 34) : 0,
    eyes: S.idle > 3 ? "shut" : "open",
    tailSway: flying ? 0.3 * Math.sin(S.t * 9) : 0,
  };
  // Pinch: the hook turns anticlockwise from above, two laps a stitch; its point meets the needle at the catch.
  const H = C.HOOK, [bx, by] = C.B, phi = C.PHI_N + 2 * (S.th - C.CATCH), rad = Math.PI / 180;
  const deg = ((((phi / rad) % 360) + 360) % 360) / 5, i0 = Math.floor(deg), f = deg - i0, ip = (T) => T[i0 % 72] * (1 - f) + T[(i0 + 1) % 72] * f;
  const D = ip(C.CRAB.D), rho = ip(C.CRAB.R), pa = phi - D * rad;
  const hp = [bx + H.r * Math.cos(phi), by + H.r * Math.sin(phi), H.z], tg = [-Math.sin(phi), Math.cos(phi)];
  const pinch = {
    at: [bx + rho * Math.cos(pa), by + rho * Math.sin(pa), H.race + 2], heading: C.CRAB.h,
    paws: { l: [hp[0] - tg[0] * 1.2, hp[1] - tg[1] * 1.2, H.z], r: [hp[0] + tg[0] * 1.2, hp[1] + tg[1] * 1.2, H.z] },
    stride: { phase: (-phi * H.r) / 7, amount: 0.12 * run },
    eyes: S.idle > 3 ? "shut" : "open",
  };
  // Mo: the feed dog. Claws up through the slot, drawing the cloth back with the needle out of it.
  const sl = C.SLOT, yd = sl[1] - 1 - C.SL * k.push, zd = C.BT - 2 + 2.4 * k.lift;
  const mo = {
    at: [sl[0] + 2, sl[1] + 5 - 2 * k.push, zd - 14], heading: 60, stance: "hang",
    paws: { l: [sl[0], yd + 1.1, zd], r: [sl[0], yd - 1.1, zd] },
    lean: -6 * k.push * (k.lift > 0.5 ? 1 : 0), look: [0, 18],
    eyes: S.idle > 3 ? "shut" : "open",
  };
  // Bun and Mochi: on the wheel's bottom rungs, running toward the window.
  const W = C.WHEEL;
  const ham = (x, offset, phase) => {
    const a = offset * rad, rr = W.r - 1.4;
    return {
      at: [x, W.y + rr * Math.sin(a), W.z - rr * Math.cos(a)], heading: 90, stance: "four",
      lean: 4 * run, look: [8, 0],
      stride: { phase: (-S.wheel * W.r) / 5 + phase, amount: 0.13 * run },
      eyes: S.omega < 0.04 && S.idle > 1.5 ? "shut" : "open",
      squash: S.omega < 0.04 && S.idle > 1.5 ? 0.3 : 0,
    };
  };
  return { knock, pinch, mo, bun: ham(W.x0 + 7, -9, 0.5), mochi: ham(W.x1 - 7, 9, 0), hook: hp, phi, dog: [sl[0], yd, zd] };
}
