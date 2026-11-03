import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";

// A tinplate wind-up coupe in millimetres: x forward (it drives toward +x), y across with +y the near side, z up.
export const WIDTH = 680;
export const HEIGHT = 500;

export const C = {
  BODY: { x0: -64, x1: 64, y0: -33, y1: 32, floor: 8, deck: 10, top: 37, sill: 15 },
  WHEEL: { r: 15, z: 15, rearX: -42, frontX: 44, near: [33.5, 42], far: [-43, -34.5], hub: 8 },
  // The motor: a going barrel open toward you, whose spring turns it, and a two-stage train to the rear axle.
  BARREL: { x: -10, z: 32, yT: -24, yF: -22.6, y1: -10, drum: 19, tip: 20.5, n: 48, ribs: 24 },
  INTER: { r: 14, tip: 14.7, n: 40, pin: 4.9, np: 12, yW: -28.6, yP0: -29, yP1: -22 },
  AXPIN: { r: 3.5, n: 10, y0: -29.6, y1: -26.4 },
  ARBOR: { r: 1.8, y0: -30, y1: 46 },
  PLATE: { y0: -31.4, y1: -30 },
  STRAP: { y0: 19.4, y1: 20.8 },
  RATCHET: { y0: 20.8, y1: 22.8, r: 8.6, root: 6.6, n: 12 },
  CLICK: { y0: 21, y1: 22.6, pivot: [1.5, 24.5], tail: [7, 16.6] },
  KEY: { y0: 39, y1: 46, w: 11, h: 9 },
  BRAKE: { y0: -18.2, y1: -16.6, pivot: [17, 50], grip: [11.8, 16.6], tail: [9.5, 4.6], swing: 0.26 },
  SPRING: { y: -18, rIn: 2.4, rOut: 17.4, coils: 5 },
  // Where the crew stand: Roo on the drum's floor (angle up the slope, plane y), the others on the tray.
  CREW: { roo: { y: -13.8, up: 0.2, heading: 0 }, pinch: { at: [12, 25, 10], heading: 115 }, rocky: { at: [22, -13, 10], heading: 100, step: 8 } },
  // The run: physics of a 120 g car on 30 mm wheels.
  PH: { m: 0.12, r: 0.015, ratio: 16, eta: 0.8, tau0: 0.003, k: 0.0097, f0: 0.0235, c: 0.334, windRate: 0.9, full: 3, recoil: 2.4 },
  // The floor and wall scroll past by the distance run, with this period (set in story.mjs).
  WORLD: { period: 600 },
};
C.PH.Ws = (C.PH.f0 * C.PH.ratio * C.PH.r / C.PH.eta - C.PH.tau0) / C.PH.k;

// The intermediate arbor sits where its pinion meshes the barrel and its wheel meshes the axle pinion.
{
  const B = [C.BARREL.x, C.BARREL.z], A = [C.WHEEL.rearX, C.WHEEL.z];
  const r1 = C.BARREL.tip - 0.7 + C.INTER.pin, r2 = C.INTER.r + C.AXPIN.r;
  const d = Math.hypot(A[0] - B[0], A[1] - B[1]), a = (r1 * r1 - r2 * r2 + d * d) / (2 * d), h = Math.sqrt(r1 * r1 - a * a);
  const u = [(A[0] - B[0]) / d, (A[1] - B[1]) / d];
  C.INTER.x = B[0] + a * u[0] + h * u[1];
  C.INTER.z = B[1] + a * u[1] - h * u[0];
}
// The brake lever: its shoe rests on the barrel's drum, on the line from the barrel's centre to the lever.
{
  const Bk = C.BRAKE, B = C.BARREL, zS = 35;
  const s = (zS - B.z) / B.drum;
  Bk.shoe = [B.x + B.drum * Math.sqrt(1 - s * s), zS];
}
// The click's tip rests on the ratchet on the line toward its pivot, turned back a little.
C.CLICK.psi = Math.atan2(C.CLICK.pivot[1] - C.BARREL.z, C.CLICK.pivot[0] - C.BARREL.x) - 0.42;

export const ROO = { species: "kangaroo", name: "Roo", size: 14, role: "spring", wear: ["sweatband"] };
export const PINCH = { species: "crab", name: "Pinch", size: 15, role: "holding" };
export const ROCKY = { species: "raccoon", name: "Rocky", size: 21, role: "holding" };
export const ROLE = { holding: "#E5484D", spring: "#E93D82" };

const VIEW = [[-80, 50, 0], [76, 50, 0], [-80, -112, 0], [76, -112, 0], [-66, -40, 66], [60, -40, 56], [-12, -30, 72]];
export const P = k.fitProjection(VIEW, WIDTH, HEIGHT, { pad: 0, azimuth: 58 });

export const at = (p) => k.iso(p, P);
export const S = (paths, style) => k.solidSvg(paths, style);
export const Ln = (d, style) => k.lineSvg(d, style);
export const D = (points, style) => k.dotsSvg(points, style);
export const K = { ...k, ...L };

// Frames on an axis along y through (x, y, z): angle 0 points to +x, angles turn toward +z.
export const faceY = (x, y, z) => L.frameOf([x, y, z], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
export const flatY = (poly, y0, y1) => L.prismOf(faceY(0, 0, 0), poly, y0, y1, P);
export const discY = (x, z, r, y0, y1) => L.disc(0, y1 - y0, r, faceY(x, y0, z), P);
export const box = (x0, y0, z0, x1, y1, z1, r = 0.3, bevel = 0) => k.slabOf({ x: x0, y: y0, w: x1 - x0, d: y1 - y0, r }, z0, z1 - z0, P, 2, bevel);
export const segY = (y, a, b) => k.segment([a[0], y, a[1]], [b[0], y, b[1]], P);
export const circleY = (x, y, z, r, n = 48) => k.pathOf(Array.from({ length: n }, (_, i) => at([x + r * Math.cos((i / n) * 2 * Math.PI), y, z + r * Math.sin((i / n) * 2 * Math.PI)])), true);
export const arcPts = (cx, cz, r, a0, a1, n = 12) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [cx + r * Math.cos(a), cz + r * Math.sin(a)]; });
