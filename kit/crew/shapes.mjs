import { iso, pathOf } from "../iso-kit.mjs";
import { frameAlong, viewOf, lightOf, pointOf, hullOf, add3, mul3, unit3, len3, cross3, dot3 } from "../lathe.mjs";
import { inside } from "./draw.mjs";

export const TAU = Math.PI * 2;

// ---------- an ellipsoid for machine parts (eggs, domes, piles), in kit solid form
export const BANDS = [0, 0.2, 0.42, 0.62];

export function ellipsoidOf(centre, [a, b, c], P, { steps = 32, clip = null, bands = null, shade0 = true } = {}) {
  const bc = cross3(b, c), ca = cross3(c, a), ab = cross3(a, b);
  const det = dot3(a, bc);
  const inv = (w) => [dot3(bc, w) / det, dot3(ca, w) / det, dot3(ab, w) / det];
  const Vu = unit3(inv(viewOf(P)));
  const Lu = unit3(inv(lightOf(P)));
  const map = (u) => iso(add3(centre, add3(add3(mul3(a, u[0]), mul3(b, u[1])), mul3(c, u[2]))), P);
  const circle = (axis, h) => {
    const F = frameAlong([0, 0, 0], axis), r = Math.sqrt(Math.max(0, 1 - h * h));
    return Array.from({ length: steps }, (_, i) => pointOf(F, h, r, (i / steps) * TAU));
  };
  let Nu = null, Hc = 0;
  if (clip) {
    const raw = [dot3(a, clip.n), dot3(b, clip.n), dot3(c, clip.n)];
    const k = len3(raw);
    Nu = mul3(raw, 1 / k);
    Hc = (clip.d ?? 0) / k;
  }
  const inside = (u) => !Nu || dot3(u, Nu) >= Hc - 1e-9;
  const rim = circle(Vu, 0);
  const cut = Nu ? circle(Nu, Hc) : [];
  const outline = pathOf(hullOf([...rim.filter(inside), ...cut].map(map)), true);
  const capOf = (t) => {
    if (t == null || t >= 1) return "";
    if (t <= -1) return outline;
    const pts = rim.filter((u) => dot3(u, Lu) >= t && inside(u));
    for (const u of circle(Lu, t)) if (dot3(u, Vu) >= -1e-9 && inside(u)) pts.push(u);
    for (const u of cut) if (dot3(u, Vu) >= -1e-9 && dot3(u, Lu) >= t) pts.push(u);
    if (dot3(Vu, Lu) > t && inside(Vu)) pts.push(Vu);
    return pts.length > 2 ? pathOf(hullOf(pts.map(map)), true) : "";
  };
  const bs = bands ?? BANDS.slice(1);
  return { fill: outline, outline, crease: "", top: "", shades: [shade0 ? outline : "", capOf(bs[0]), capOf(bs[1]), capOf(bs[2])], seamless: true };
}
