// The crew's poses from the model's state. Serialized into the page, so it uses only C and S.
export function poses(C, S) {
  const Z = C.ZC, u = S.u, comp = u / C.STROKE, pl = C.PLATE.z + C.PLATE.h, g = S.grip;
  const P0 = C.PIN, R0 = C.ROO_AT;
  // Pinch rides the saddle; his claws close on the stick's near side and open off it on the way back.
  const off = 1.8 * (1 - g);
  const pinch = {
    at: [P0[0] + u, P0[1], C.CARR.z1 + 2],
    heading: P0[2],
    lean: 6 * g - 4 * (1 - g),
    look: [0, 4],
    paws: { l: [P0[3] + u, C.R * 0.77 + off, Z - C.R * 0.64 - off * 0.5], r: [P0[4] + u, C.R * 0.77 + off, Z - C.R * 0.64 - off * 0.5] },
    squash: 0.1 * g,
    eyes: S.uv < -1.5 ? "wide" : S.power ? "open" : "shut",
  };
  // Roo stands on the slide plate between the carriage's lug and the bulkhead, squashed as the carriage comes on.
  const lx = C.CARR.x1 + 2.6 + u;
  const roo = {
    at: [R0[0] + u * R0[3], R0[1], pl],
    heading: R0[2],
    lean: 8 + 10 * comp,
    look: [0, -4],
    paws: { l: [lx, 5.2, Z - 14.0], r: [lx, 7.2, Z - 15.4] },
    squash: 0.04 + 0.22 * comp,
    eyes: S.uv < -1.5 ? "happy" : comp > 0.6 ? "shut" : S.power ? "open" : "shut",
  };
  // Volta lies along the live wire with his snout on the top electrode's tab.
  const zf = C.ZF + 1.5;
  const volta = {
    path: [[-21.2, -1.6, Z - 14.6], [-26.4, -1.6, Z - 16.8], [-30.6, -1.6, Z - 23.6], [-35, -1.6, zf], [-54, -1.6, zf]],
    charge: S.cur > 0.03 ? Math.min(1, 0.35 + 0.65 * S.cur) : 0,
    flicker: S.t * 14,
    target: S.cur > 0.12 ? [-21.6, -1.6, Z - 13.2] : undefined,
    eyes: S.power ? "open" : "shut",
  };
  return { pinch, roo, volta };
}
