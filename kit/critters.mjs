import { iso, depthOf, pathOf } from "./iso-kit.mjs";
import { sphereOf, solidOf, ringBand, disc, ribsOf, spokesOf, prismOf, frameAlong, frameOf, viewOf, lightOf, pointOf, hullOf, scaleOf, add3, sub3, mul3, unit3, len3, cross3, dot3 } from "./lathe.mjs";

const TAU = Math.PI * 2;
const RAD = Math.PI / 180;

export const ROLES = {
  power: { hex: "#F5C518", word: "power", does: "motors, current, anything that runs" },
  holding: { hex: "#E5484D", word: "holding", does: "latches, clamps, brakes, grips" },
  cutting: { hex: "#8E4EC6", word: "cutting", does: "blades, cutters, grinders, shredders" },
  sensing: { hex: "#3E9BDB", word: "sensing and timing", does: "gauges, thermostats, timers, switches that read" },
  moving: { hex: "#46A758", word: "moving", does: "carriages, rollers, conveyors, feeders" },
  heat: { hex: "#F76B15", word: "heat", does: "heating elements, igniters" },
  fluid: { hex: "#12A594", word: "fluid", does: "pumps, hoses, valves, cooling" },
  spring: { hex: "#E93D82", word: "spring", does: "springs, launchers, returns" },
};

export const SPECIES = {
  hamster: {
    fur: "#D9A273", belly: "#F4E6D2", dark: "#A8744B",
    body: { r: 0.27, h: 0.5, z: 0.06, egg: 0.16 },
    head: { r: 0.22, x: 0.04, z: 0.67 },
    ears: { kind: "round", r: 0.07, az: 44, el: 50, inner: "pink" },
    snout: { kind: "cheeks", r: 0.085 },
    nose: { r: 0.024, c: "pink" },
    eyes: { r: 0.034, az: 28, el: 14 },
    blush: true,
    arms: { len: 0.17, r: 0.048, paw: 0.05, c: "dark" },
    legs: { r: 0.06, foot: 0.065, c: "dark" },
    tail: { kind: "stub", r: 0.05 },
  },
  mouse: {
    fur: "#A9A2B4", belly: "#ECE7EF", dark: "#857C91",
    body: { r: 0.21, h: 0.48, z: 0.06, egg: 0.14 },
    head: { r: 0.2, x: 0.04, z: 0.66 },
    ears: { kind: "round", r: 0.1, az: 46, el: 62, inner: "pink" },
    snout: { kind: "muzzle", r: 0.07, x: 0.17, z: -0.03, c: "belly" },
    nose: { r: 0.022, c: "pink" },
    eyes: { r: 0.032, az: 26, el: 14 },
    blush: true,
    arms: { len: 0.16, r: 0.04, paw: 0.042, c: "pink" },
    legs: { r: 0.05, foot: 0.06, c: "pink" },
    tail: { kind: "thin", r: 0.022, c: "pink" },
  },
  squirrel: {
    fur: "#C8743F", belly: "#F1DCC2", dark: "#9C5428",
    body: { r: 0.21, h: 0.5, z: 0.06, egg: 0.14 },
    head: { r: 0.19, x: 0.05, z: 0.68 },
    ears: { kind: "point", r: 0.05, h: 0.13, az: 40, el: 58, inner: "pink" },
    snout: { kind: "muzzle", r: 0.065, x: 0.16, z: -0.04, c: "belly" },
    nose: { r: 0.022, c: "nose" },
    eyes: { r: 0.033, az: 27, el: 14 },
    blush: true,
    arms: { len: 0.17, r: 0.04, paw: 0.045, c: "dark" },
    legs: { r: 0.055, foot: 0.065, c: "dark" },
    tail: { kind: "bushy", r: 0.11 },
  },
  beaver: {
    fur: "#A0683F", belly: "#D9B48C", dark: "#6B4A35",
    body: { r: 0.27, h: 0.52, z: 0.05, egg: 0.18 },
    head: { r: 0.2, x: 0.04, z: 0.68 },
    ears: { kind: "round", r: 0.045, az: 62, el: 44, inner: "dark" },
    snout: { kind: "muzzle", r: 0.09, x: 0.15, z: -0.04, c: "belly" },
    nose: { r: 0.03, c: "nose" },
    teeth: true,
    eyes: { r: 0.032, az: 30, el: 18 },
    blush: true,
    arms: { len: 0.17, r: 0.048, paw: 0.05, c: "dark" },
    legs: { r: 0.06, foot: 0.075, c: "dark" },
    tail: { kind: "paddle", r: 0.17, c: "dark" },
  },
  sloth: {
    fur: "#9C8572", belly: "#B7A28D", dark: "#5C4838", face: "#EBDFCB",
    body: { r: 0.22, h: 0.54, z: 0.06, egg: 0.1 },
    head: { r: 0.2, x: 0.03, z: 0.7 },
    ears: { kind: "none" },
    snout: { kind: "none" },
    mask: true,
    nose: { r: 0.03, c: "nose" },
    eyes: { r: 0.03, az: 25, el: 6 },
    patches: true,
    blush: true,
    arms: { len: 0.4, r: 0.05, paw: 0.05, c: "fur", claws: true },
    legs: { r: 0.06, foot: 0.06, c: "fur" },
    tail: { kind: "none" },
  },
  mole: {
    fur: "#5E5668", belly: "#776E82", dark: "#4A4352",
    body: { r: 0.25, h: 0.52, z: 0.06, egg: 0.12 },
    head: { r: 0.2, x: 0.04, z: 0.68 },
    ears: { kind: "none" },
    snout: { kind: "long", r: 0.07, len: 0.16, c: "pink" },
    nose: { r: 0.03, c: "pinkdark" },
    eyes: { r: 0.022, az: 30, el: 16 },
    blush: true,
    arms: { len: 0.16, r: 0.05, paw: 0.07, c: "pink" },
    legs: { r: 0.06, foot: 0.065, c: "dark" },
    tail: { kind: "stub", r: 0.035 },
  },
  kangaroo: {
    fur: "#C9925E", belly: "#EED7B9", dark: "#9E6A3C",
    body: { r: 0.22, h: 0.56, z: 0.06, egg: 0.22 },
    head: { r: 0.17, x: 0.05, z: 0.73 },
    ears: { kind: "point", r: 0.05, h: 0.17, az: 30, el: 62, inner: "pink" },
    snout: { kind: "muzzle", r: 0.07, x: 0.15, z: -0.03, c: "fur" },
    nose: { r: 0.025, c: "nose" },
    eyes: { r: 0.03, az: 30, el: 14 },
    blush: true,
    arms: { len: 0.15, r: 0.038, paw: 0.042, c: "fur" },
    legs: { r: 0.07, foot: 0.08, long: 0.12, c: "dark" },
    tail: { kind: "thick", r: 0.09 },
  },
};

export const MATERIALS = {
  shell: { hex: "#E3EBE5", use: "housing, lids, covers" },
  inside: { hex: "#E6ECE6", use: "inner walls and backs of a cutaway" },
  steel: { hex: "#CBD3DD", use: "decks, plates, brackets, gears" },
  iron: { hex: "#A9B2BF", use: "axles, posts, pins, heavy parts" },
  brass: { hex: "#E4D6B4", use: "bushings, bearings, terminals" },
  plastic: { hex: "#E2D8EC", use: "knobs, buttons, switch bodies" },
  wood: { hex: "#E8CFAA", use: "pencil wood, shavings, light timber" },
  desk: { hex: "#C9A27A", use: "desk tops, benches, floors" },
  wall: { hex: "#EFEBE4", use: "room walls behind the scene" },
  paint: { hex: "#9FB4D3", use: "the subject's painted body" },
  rubber: { hex: "#EDBDB6", use: "erasers, feet, grips" },
  paper: { hex: "#FBF8F1", use: "notebooks, labels, paper" },
  graphite: { hex: "#4B4B52", use: "pencil lead, dark inserts" },
};

const FIXED = { eye: "#1E1712", white: "#FFFDF7", pink: "#E7A3A0", pinkdark: "#C9706C", nose: "#2A1D16" };

const hexToHsl = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255);
  const hi = Math.max(r, g, b), lo = Math.min(r, g, b), l = (hi + lo) / 2;
  if (hi === lo) return [0, 0, l * 100];
  const d = hi - lo, s = l > 0.5 ? d / (2 - hi - lo) : d / (hi + lo);
  const h = hi === r ? (g - b) / d + (g < b ? 6 : 0) : hi === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s * 100, l * 100];
};
const hsl = (h, s, l) => `hsl(${h.toFixed(0)} ${Math.max(0, Math.min(100, s)).toFixed(0)}% ${Math.max(0, Math.min(100, l)).toFixed(1)}%)`;

export function tokensOf(hex, theme) {
  const [h, s, l] = hexToHsl(hex);
  if (theme === "light") {
    return {
      paper: hsl(h, s, l), face: hsl(h, s, l + 3), top: hsl(h, s, l + 7),
      "shade-0": hsl(h, s, l - 13), "shade-1": hsl(h, s, l - 7), "shade-2": hsl(h, s, l - 2), "shade-3": hsl(h, s, l + 4),
      "lit-top": hsl(h, s, l + 9), "lit-shade": hsl(h, s, l + 1),
      hi: hsl(h, s * 0.55, Math.min(24, l * 0.35)), mid: hsl(h, s * 0.5, l * 0.6), lo: hsl(h, s * 0.45, l * 0.78), faint: hsl(h, s * 0.4, l - 9),
    };
  }
  const d = Math.max(16, Math.min(44, l * 0.62));
  const sd = s * 0.78;
  return {
    paper: hsl(h, sd, d), face: hsl(h, sd, d + 3), top: hsl(h, sd, d + 7),
    "shade-0": hsl(h, sd, d - 8), "shade-1": hsl(h, sd, d - 4), "shade-2": hsl(h, sd, d + 1), "shade-3": hsl(h, sd, d + 6),
    "lit-top": hsl(h, sd, d + 10), "lit-shade": hsl(h, sd, d + 3),
    hi: hsl(h, s * 0.45, 84), mid: hsl(h, s * 0.45, 64), lo: hsl(h, s * 0.4, 46), faint: hsl(h, sd, d + 10),
  };
}

export function paletteOf() {
  const out = {};
  for (const [name, sp] of Object.entries(SPECIES)) {
    for (const key of ["fur", "belly", "dark", "face"]) if (sp[key]) out[`${name}-${key}`] = sp[key];
  }
  for (const [name, role] of Object.entries(ROLES)) out[`role-${name}`] = role.hex;
  for (const [name, mat] of Object.entries(MATERIALS)) out[`mat-${name}`] = mat.hex;
  return { ...out, ...FIXED };
}

const tokenCss = (tokens) => Object.entries(tokens).map(([key, value]) => `--anatomy-${key}:${value}`).join(";");

export function crewCss(palette = paletteOf()) {
  const rules = [
    `.crew{--anatomy-weight:.8px}`,
    `.crew[data-duty] .iso-edge{stroke:var(--crew-duty);stroke-width:1.15px}`,
    `.iso{--crew-duty:#ffffff}.iso[data-theme="light"]{--crew-duty:#000000}`,
    `.crew-patch{stroke:none;fill:var(--anatomy-top)}`,
    `.crew-patch[data-shade="mid"]{fill:var(--anatomy-paper)}`,
    `.crew-gleam{stroke:none;fill:#fffdf7}`,
  ];
  for (const [key, hex] of Object.entries(palette)) {
    rules.push(`.iso [data-c="${key}"]{${tokenCss(tokensOf(hex, "dark"))}}`);
    rules.push(`.iso[data-theme="light"] [data-c="${key}"],.iso [data-theme="light"] [data-c="${key}"]{${tokenCss(tokensOf(hex, "light"))}}`);
  }
  rules.push(`.iso [data-c="eye"] .iso-edge,.iso [data-c="nose"] .iso-edge{stroke:var(--anatomy-shade-0)}`);
  return rules.join("\n");
}

const rot = (v, axis, a) => {
  const c = Math.cos(a), s = Math.sin(a), k = unit3(axis);
  return add3(add3(mul3(v, c), mul3(cross3(k, v), s)), mul3(k, dot3(k, v) * (1 - c)));
};

const BANDS = [0, 0.2, 0.42, 0.62];

export function ellipsoidOf(centre, [a, b, c], P, { steps = 32, clip = null } = {}) {
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
    const pts = rim.filter((u) => dot3(u, Lu) >= t && inside(u));
    for (const u of circle(Lu, t)) if (dot3(u, Vu) >= -1e-9 && inside(u)) pts.push(u);
    for (const u of cut) if (dot3(u, Vu) >= -1e-9 && dot3(u, Lu) >= t) pts.push(u);
    if (dot3(Vu, Lu) > t && inside(Vu)) pts.push(Vu);
    return pts.length > 2 ? pathOf(hullOf(pts.map(map)), true) : "";
  };
  return { fill: outline, outline, crease: "", top: "", shades: [outline, capOf(BANDS[1]), capOf(BANDS[2]), capOf(BANDS[3])], seamless: true };
}

const along = (centre, axis, half, r0, r1 = r0) => {
  const F = frameAlong(centre, axis);
  return [centre, [mul3(F.a, half), mul3(F.u, r0), mul3(F.v, r1)]];
};

const ellipseOn = (c, n, r, P, { squash = 1, spin = 0, steps = 16, lift = 0 } = {}) => {
  const F = frameAlong(add3(c, mul3(unit3(n), lift)), n);
  const u = rot(F.u, F.a, spin), v = rot(F.v, F.a, spin);
  const pts = Array.from({ length: steps }, (_, i) => {
    const t = (i / steps) * TAU;
    return iso(add3(F.o, add3(mul3(u, r * Math.cos(t)), mul3(v, r * squash * Math.sin(t)))), P);
  });
  return pathOf(pts, true);
};

const arcOn = (c, n, r, P, { bend = 1, spin = 0, steps = 9 } = {}) => {
  const F = frameAlong(c, n);
  const u = rot(F.u, F.a, spin), v = rot(F.v, F.a, spin);
  const pts = Array.from({ length: steps }, (_, i) => {
    const t = Math.PI * (i / (steps - 1));
    return iso(add3(c, add3(mul3(u, r * Math.cos(t)), mul3(v, -bend * r * 0.55 * Math.sin(t)))), P);
  });
  return pathOf(pts);
};

const bandOnSphere = (c, axis, R, z0, z1, P, V, steps = 40) => {
  const F = frameAlong(c, axis);
  const ring = (z) => {
    const rho = Math.sqrt(Math.max(0, R * R - z * z)) * 1.035;
    return Array.from({ length: steps + 1 }, (_, i) => {
      const t = (i / steps) * TAU;
      const radial = add3(mul3(F.u, Math.cos(t)), mul3(F.v, Math.sin(t)));
      return { p: add3(add3(c, mul3(F.a, z)), mul3(radial, rho)), seen: dot3(radial, V) > -0.05 };
    });
  };
  const top = ring(z1), bottom = ring(z0);
  const seen = top.map((q, i) => q.seen && bottom[i].seen);
  let start = seen.findIndex((s, i) => s && !seen[(i - 1 + steps) % steps]);
  if (start < 0) start = 0;
  const idx = [];
  for (let k = 0; k <= steps; k++) {
    const i = (start + k) % steps;
    if (!seen[i]) break;
    idx.push(i);
  }
  if (idx.length < 2) return "";
  const pts = [...idx.map((i) => iso(top[i].p, P)), ...idx.reverse().map((i) => iso(bottom[i].p, P))];
  return pathOf(pts, true);
};

export function critter(spec, pose, P) {
  const sp = typeof spec.species === "string" ? SPECIES[spec.species] : spec.species;
  const name = typeof spec.species === "string" ? spec.species : spec.name;
  if (!sp) throw new Error(`unknown species ${spec.species}`);
  const H = spec.size;
  const V = viewOf(P);
  const Lgt = lightOf(P);
  const parts = [];
  const cOf = (key) => (["fur", "belly", "dark", "face"].includes(key) ? `${name}-${key}` : key);
  const front = (c, r) => depthOf(add3(c, mul3(V, r)), P);
  const put = (part) => parts.push(part);
  const ball = (key, c, at, r, extra = 0) => put({ key, kind: "solid", c, paths: sphereOf(at, r, P, { steps: Math.max(16, Math.min(48, Math.round(r * scaleOf(P) * 4))) }), depth: front(at, r) + extra, at, r });
  const blob = (key, c, beads, split = null) => {
    const groups = split ? [beads.filter((b) => dot3(sub3(b.at, split), V) < 0), beads.filter((b) => dot3(sub3(b.at, split), V) >= 0)] : [beads];
    groups.forEach((list, g) => {
      if (!list.length) return;
      const sorted = [...list].sort((a, b) => front(a.at, a.r) - front(b.at, b.r));
      const balls = sorted.map((b) => sphereOf(b.at, b.r, P, { steps: Math.max(14, Math.min(28, Math.round(b.r * scaleOf(P) * 3))) }));
      const depth = split ? (g === 0 ? Math.min(...list.map((b) => front(b.at, 0))) : Math.max(...list.map((b) => front(b.at, b.r)))) : Math.max(...list.map((b) => front(b.at, b.r * 0.5)));
      put({ key: `${key}${g}`, kind: "blob", c, balls, depth });
    });
  };

  const heading = (pose.heading ?? 0) * RAD;
  const f0 = [Math.cos(heading), Math.sin(heading), 0];
  const side = [-Math.sin(heading), Math.cos(heading), 0];
  const up0 = [0, 0, 1];
  const lean = (pose.lean ?? 0) * RAD;
  const f = add3(mul3(f0, Math.cos(lean)), mul3(up0, -Math.sin(lean)));
  const up = add3(mul3(up0, Math.cos(lean)), mul3(f0, Math.sin(lean)));
  const squash = pose.squash ?? 0;
  const sx = 1 + 0.1 * squash, sz = 1 - 0.14 * squash;
  const base = add3(pose.at, [0, 0, (pose.hop ?? 0)]);
  const hipZ = sp.body.z + 0.08;
  const hip = add3(base, mul3(up0, hipZ * H));
  const W = ([x, y, z]) => add3(hip, add3(add3(mul3(f, x * H * sx), mul3(side, y * H * sx)), mul3(up, (z - hipZ) * H * sz)));
  const D = ([x, y, z]) => unit3(add3(add3(mul3(f, x), mul3(side, y)), mul3(up, z)));

  const ell = (key, c, centre, axes, extra = 0, opts = {}) => {
    const r = Math.max(...axes.map(len3));
    put({ key, kind: "solid", c, paths: ellipsoidOf(centre, axes, P, { steps: Math.max(18, Math.min(44, Math.round(r * scaleOf(P) * 3))), ...opts }), depth: front(centre, r) + extra });
  };
  const B = sp.body;
  const bodyBase = W([0, 0, B.z]);
  const bodyLen = B.h * H * sz;
  const R = B.r * H * sx;
  const bodyMid = add3(bodyBase, mul3(up, bodyLen * 0.5));
  const bodyDepth = front(bodyMid, R);
  ell("body", cOf("fur"), bodyMid, [mul3(f, R), mul3(side, R), mul3(up, bodyLen * 0.5)]);
  if ((B.egg ?? 0) > 0.12) ell("hips", cOf("fur"), add3(bodyBase, mul3(up, bodyLen * 0.3)), [mul3(f, R * 1.06), mul3(side, R * 1.06), mul3(up, bodyLen * 0.3)], 0.0002);

  const bellyZ = -0.12;
  const bellyN = unit3(add3(f, mul3(up, 0.15)));
  const bellyAt = add3(add3(bodyMid, mul3(up, bodyLen * 0.5 * bellyZ)), mul3(f, R * Math.sqrt(1 - bellyZ * bellyZ) * 0.98));
  if (dot3(bellyN, V) > 0.05) put({ key: "belly", kind: "patch", c: cOf("belly"), d: ellipseOn(bellyAt, bellyN, B.r * H * 0.5, P, { squash: 1.35 }), depth: bodyDepth + 0.001, shade: "mid", edge: "faint" });

  const Hd = sp.head;
  const yaw = (pose.look?.[0] ?? 0) * RAD, pitch = (pose.look?.[1] ?? 0) * RAD;
  const hf0 = rot(f, up, yaw);
  const hs = rot(side, up, yaw);
  const hf = rot(hf0, hs, -pitch);
  const hu = rot(up, hs, -pitch);
  const headC = W([Hd.x, 0, Hd.z]);
  const hr = Hd.r * H;
  const headDepth = front(headC, hr);
  const HD = ([x, y, z]) => unit3(add3(add3(mul3(hf, x), mul3(hs, y)), mul3(hu, z)));
  const onHead = (az, el, out = 1) => {
    const dir = HD([Math.cos(el * RAD) * Math.cos(az * RAD), Math.cos(el * RAD) * Math.sin(az * RAD), Math.sin(el * RAD)]);
    return { dir, p: add3(headC, mul3(dir, hr * out)) };
  };
  ball("head", cOf("fur"), headC, hr);
  const flat = (p, axis, r, t = 0.2) => along(p, axis, r * t, r, r);

  const feature = (key, colour, p, n, r, extra, opt) => {
    if (dot3(n, V) > 0.06) put({ key, kind: "patch", c: colour, d: ellipseOn(p, n, r, P, opt), depth: headDepth + extra, shade: "mid", edge: opt?.edge ?? "faint" });
  };

  if (sp.mask) {
    const m = onHead(0, -4);
    feature("mask", cOf("face"), m.p, m.dir, hr * 0.7, 0.0005, { squash: 0.78 });
  }
  if (sp.patches) {
    for (const s of [-1, 1]) {
      const e = onHead(s * sp.eyes.az, sp.eyes.el);
      feature(`patch${s}`, cOf("dark"), e.p, e.dir, hr * 0.17, 0.0007, { squash: 0.6, spin: -s * 0.35 });
    }
  }

  const E = spec.wear === "hat" || spec.wear === "cap" ? { kind: "none" } : sp.ears;
  if (E.kind === "round") {
    for (const s of [-1, 1]) {
      const at = onHead(s * E.az, E.el, 0.93);
      const axis = unit3(add3(mul3(hf, 0.85), mul3(at.dir, 0.35)));
      const er = E.r * H;
      const dep = front(at.p, er);
      ell(`ear${s}`, cOf("fur"), ...flat(at.p, axis, er));
      if (dot3(axis, V) > 0.1) put({ key: `earIn${s}`, kind: "patch", c: E.inner === "dark" ? cOf("dark") : "pink", d: ellipseOn(add3(at.p, mul3(axis, er * 0.19)), axis, er * 0.6, P), depth: dep + 0.0005 });
    }
  } else if (E.kind === "point") {
    for (const s of [-1, 1]) {
      const at = onHead(s * E.az, E.el, 0.85);
      const axis = unit3(add3(mul3(at.dir, 0.7), mul3(hu, 0.6)));
      const er = E.r * H, eh = E.h * H;
      const tipC = add3(at.p, mul3(axis, eh * 0.5));
      const [, axes] = along(tipC, axis, eh * 0.55, er, er * 0.55);
      ell(`ear${s}`, cOf("fur"), tipC, axes);
    }
  }

  const N = sp.snout;
  let noseAt = onHead(0, -8, 1.0).p, noseDir = hf;
  if (N.kind === "cheeks") {
    for (const s of [-1, 1]) {
      const at = add3(headC, add3(add3(mul3(hf, hr * 0.78), mul3(hs, s * hr * 0.42)), mul3(hu, -hr * 0.38)));
      ball(`cheek${s}`, cOf("belly"), at, N.r * H, 0);
    }
    noseAt = add3(headC, add3(mul3(hf, hr * 1.0), mul3(hu, -hr * 0.12)));
  } else if (N.kind === "muzzle") {
    const at = add3(headC, add3(mul3(hf, hr * 0.82 + (N.x ?? 0) * 0), mul3(hu, (N.z ?? -0.04) * H)));
    const mr = N.r * H;
    ball("muzzle", cOf(N.c ?? "belly"), at, mr, 0);
    noseAt = add3(at, add3(mul3(hf, mr * 0.92), mul3(hu, mr * 0.35)));
  } else if (N.kind === "long") {
    const base = add3(headC, add3(mul3(hf, hr * 0.7), mul3(hu, -hr * 0.18)));
    const tip = add3(base, mul3(hf, N.len * H));
    ell("snout", N.c ?? "pink", ...along(mul3(add3(base, tip), 0.5), hf, N.len * H * 0.6, N.r * H, N.r * H * 0.85));
    noseAt = add3(tip, mul3(hf, N.r * H * 0.45));
  }
  const nr = sp.nose.r * H;
  ball("nose", sp.nose.c, noseAt, nr, 0);
  if (sp.teeth && dot3(hf, V) > -0.2) {
    const at = add3(noseAt, add3(mul3(hu, -nr * 3.2), mul3(hf, -nr * 0.6)));
    const F = frameOf(at, hf, unit3(cross3(hu, hf)), hu);
    const tw = nr * 1.9, th = nr * 2.4;
    const paths = prismOf(F, [[-tw, 0], [tw, 0], [tw, -th], [-tw, -th]], -nr * 0.25, nr * 0.25, P);
    put({ key: "teeth", kind: "solid", c: "white", paths, depth: front(at, nr * 2) + 0.002 });
  }

  const eyes = pose.eyes ?? "open";
  const er = sp.eyes.r * H * (eyes === "wide" ? 1.35 : 1);
  for (const s of [-1, 1]) {
    const e = onHead(s * sp.eyes.az, sp.eyes.el, 1);
    if (dot3(e.dir, V) < 0.02) continue;
    if (eyes === "shut" || eyes === "happy" || (pose.blink ?? 0) > 0.5) {
      const bend = eyes === "happy" ? -1 : 1;
      put({ key: `eye${s}`, kind: "line", c: "eye", tone: "hi", d: arcOn(add3(e.p, mul3(e.dir, er * 0.15)), e.dir, er * 1.05, P, { bend }), depth: headDepth + 0.003 });
    } else {
      const c = add3(headC, mul3(e.dir, hr - er * 0.35));
      if (eyes === "wide") {
        const wc = add3(headC, mul3(e.dir, hr - er * 0.55));
        put({ key: `eyeW${s}`, kind: "solid", c: "white", paths: sphereOf(wc, er * 1.15, P, { steps: 32 }), depth: headDepth + 0.002 });
        const pc = add3(headC, mul3(e.dir, hr + er * 0.2));
        put({ key: `eye${s}`, kind: "solid", c: "eye", paths: sphereOf(pc, er * 0.55, P, { steps: 24 }), depth: headDepth + 0.003 });
      } else {
        put({ key: `eye${s}`, kind: "solid", c: "eye", paths: sphereOf(c, er, P, { steps: 32 }), depth: headDepth + 0.003 });
        const g = unit3(add3(mul3(V, 1), mul3(Lgt, 0.6)));
        const gl = add3(c, mul3(g, er * 0.98));
        put({ key: `gleam${s}`, kind: "gleam", c: "white", d: ellipseOn(gl, V, er * 0.34, P, { steps: 10 }), depth: headDepth + 0.004 });
      }
    }
    if (sp.blush) {
      const b = onHead(s * (sp.eyes.az + 14), sp.eyes.el - 24, 1);
      feature(`blush${s}`, "pink", b.p, b.dir, hr * 0.13, 0.0009, { squash: 0.6, edge: "none" });
    }
  }

  const A = sp.arms;
  const paws = pose.paws ?? {};
  const reach = {};
  for (const s of [-1, 1]) {
    const key = s < 0 ? "r" : "l";
    const shoulder = W([0.03, s * B.r * 0.78, B.z + B.h * 0.66]);
    const rest = W([0.17, s * (B.r * 0.62), B.z + B.h * 0.38]);
    const want = paws[key] ?? rest;
    const len = A.len * H;
    const toward = sub3(want, shoulder);
    const dist = len3(toward);
    const max = len * 1.35;
    const paw = dist > max ? add3(shoulder, mul3(unit3(toward), max)) : want;
    reach[key] = Math.max(0, dist - max);
    const ar = A.r * H, pr = A.paw * H;
    const mid = mul3(add3(shoulder, paw), 0.5);
    const span = len3(sub3(paw, shoulder));
    if (span > 1e-3) ell(`arm${s}`, cOf(A.c === "pink" ? "fur" : A.c ?? "fur"), ...along(mid, sub3(paw, shoulder), span * 0.5 + ar * 0.4, ar));
    ball(`paw${s}`, A.c === "pink" ? "pink" : cOf(A.c ?? "fur"), paw, pr, 0.0001);
  }

  const Lg = sp.legs;
  const stride = pose.stride ?? { phase: 0, amount: 0 };
  for (const s of [-1, 1]) {
    const hipAt = add3(base, add3(add3(mul3(f0, 0), mul3(side, s * B.r * H * 0.52)), mul3(up0, hipZ * H * 0.8)));
    const ph = TAU * stride.phase + (s > 0 ? Math.PI : 0);
    const swing = Math.sin(ph) * stride.amount * H;
    const lift = Math.max(0, Math.cos(ph)) * stride.amount * H * 0.45;
    const fr = Lg.foot * H;
    const footAt = add3(base, add3(add3(mul3(f0, swing + (Lg.long ? Lg.long * H * 0.4 : 0.02 * H)), mul3(side, s * B.r * H * 0.55)), mul3(up0, fr * 0.8 + lift)));
    const legMid = mul3(add3(hipAt, footAt), 0.5);
    ell(`leg${s}`, cOf(Lg.c === "pink" ? "fur" : Lg.c ?? "dark"), ...along(legMid, sub3(footAt, hipAt), len3(sub3(footAt, hipAt)) * 0.5 + Lg.r * H * 0.3, Lg.r * H));
    if (Lg.long) {
      const toe = add3(footAt, mul3(f0, Lg.long * H));
      ell(`foot${s}`, cOf(Lg.c ?? "dark"), ...along(mul3(add3(footAt, toe), 0.5), f0, Lg.long * H * 0.6, fr * 0.75, fr * 0.6));
    } else {
      ball(`foot${s}`, Lg.c === "pink" ? "pink" : cOf(Lg.c ?? "dark"), footAt, fr, 0);
    }
  }

  const T = sp.tail;
  const sway = pose.tailSway ?? 0;
  const tailBase = W([-B.r * 0.85, 0, B.z + 0.1]);
  if (T.kind === "stub") ball("tail", cOf("fur"), W([-B.r * 0.98, 0, B.z + 0.1]), T.r * H, 0);
  else if (T.kind === "bushy") {
    const n = 11, beads = [];
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const x = -B.r * 0.95 - 0.2 * Math.sin(t * Math.PI * 0.85) + 0.05 * Math.sin(t * 5);
      const z = B.z + 0.06 + 0.86 * t;
      const y = sway * 0.12 * Math.sin(t * Math.PI);
      const r = (0.05 + T.r * Math.sin(Math.min(1, t * 1.1) * Math.PI) * 0.95 + 0.03 * t) * H;
      beads.push({ at: W([x, y, z]), r });
    }
    blob("tail", cOf("fur"), beads);
  } else if (T.kind === "paddle") {
    const at = add3(base, add3(mul3(f0, -(B.r + T.r * 0.9) * H), mul3(up0, 0.035 * H)));
    ell("tail", cOf("dark"), at, [mul3(f0, T.r * H), mul3(side, T.r * H * 0.58), mul3(unit3(add3(up0, mul3(f0, -0.15))), 0.028 * H)]);
  } else if (T.kind === "thin" || T.kind === "thick") {
    const n = T.kind === "thin" ? 14 : 8, beads = [];
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const p = T.kind === "thin"
        ? add3(base, add3(add3(mul3(f0, -(B.r * 0.9 + 0.32 * t) * H), mul3(side, (0.08 * Math.sin(t * 5) + sway * 0.1 * t) * H)), mul3(up0, (0.03 + 0.08 * Math.sin(t * Math.PI)) * H)))
        : add3(base, add3(mul3(f0, -(B.r * 0.8 + 0.34 * t) * H), mul3(up0, (0.18 * (1 - t) + 0.035) * H)));
      const r = (T.kind === "thin" ? T.r * (1 - 0.4 * t) : T.r * (1 - 0.62 * t)) * H;
      beads.push({ at: p, r });
    }
    blob("tail", T.c ? T.c : cOf("fur"), beads);
  }

  const wear = spec.wear;
  if (wear && spec.role) {
    const rc = `role-${spec.role}`;
    if (wear === "hat") {
      const z0 = hr * 0.56;
      const rho = Math.sqrt(hr * hr - z0 * z0);
      const domeC = add3(headC, mul3(hu, z0));
      const top = hr * 1.14 - z0;
      ell("brim", rc, add3(domeC, mul3(hf, hr * 0.08)), [mul3(hf, rho * 1.24), mul3(hs, rho * 1.24), mul3(hu, hr * 0.035)], headDepth + 0.006 - front(domeC, rho * 1.24));
      ell("hat", rc, domeC, [mul3(hf, rho * 1.08), mul3(hs, rho * 1.08), mul3(hu, top)], headDepth + 0.007 - front(domeC, rho * 1.08), { clip: { n: hu, d: 0 } });
    } else if (wear === "band") {
      const d = bandOnSphere(headC, hu, hr, hr * 0.3, hr * 0.5, P, V);
      if (d) put({ key: "band", kind: "patch", c: rc, d, depth: headDepth + 0.0008, shade: "mid" });
    } else if (wear === "scarf") {
      const neck = W([Hd.x * 0.5, 0, Hd.z - Hd.r * 0.9]);
      const n = 16, beads = [];
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU;
        beads.push({ at: add3(neck, add3(mul3(f, Math.cos(a) * B.r * H * 0.72), mul3(side, Math.sin(a) * B.r * H * 0.72))), r: B.r * H * 0.25 });
      }
      for (let i = 0; i < 3; i++) {
        const t = i / 2;
        beads.push({ at: add3(neck, add3(mul3(f, B.r * H * (0.7 + 0.08 * t)), add3(mul3(side, B.r * H * (0.35 + 0.05 * t)), mul3(up, -B.r * H * (0.15 + 0.6 * t))))), r: B.r * H * (0.2 - 0.03 * t) });
      }
      blob("scarf", rc, beads, neck);
    } else if (wear === "cap") {
      const z0 = hr * 0.36;
      const rho = Math.sqrt(hr * hr - z0 * z0) * 1.06;
      const baseC = add3(headC, mul3(hu, z0));
      const axis = unit3(add3(mul3(hu, 1), mul3(hf, -0.75)));
      const ch = hr * 1.15;
      const F = frameAlong(baseC, axis);
      ell("cap", rc, baseC, [mul3(F.a, ch), mul3(F.u, rho), mul3(F.v, rho)], headDepth + 0.006 - front(baseC, ch), { clip: { n: axis, d: 0 } });
      ball("pompom", "white", add3(baseC, mul3(axis, ch * 1.02)), hr * 0.22, 0.007);
    } else if (wear === "goggles") {
      const d = bandOnSphere(headC, hu, hr, hr * 0.44, hr * 0.58, P, V);
      if (d) put({ key: "strap", kind: "patch", c: rc, d, depth: headDepth + 0.0008, shade: "mid" });
      for (const s of [-1, 1]) {
        const g = onHead(s * 22, 32, 1.02);
        if (dot3(g.dir, V) < 0) continue;
        ell(`lens${s}`, rc, ...flat(g.p, g.dir, hr * 0.2, 0.3), headDepth + 0.006 - front(g.p, hr * 0.2));
        put({ key: `glass${s}`, kind: "patch", c: "white", d: ellipseOn(add3(g.p, mul3(g.dir, hr * 0.065)), g.dir, hr * 0.13, P), depth: headDepth + 0.0065 });
      }
    }
  }

  parts.sort((a, b) => a.depth - b.depth);
  return { name: spec.name ?? name, species: name, role: spec.role, parts, reach };
}

const SHADES = [0, 1, 2, 3];

const partSvg = (part) => {
  const head = `<g data-c="${part.c}" data-k="${part.key}"`;
  if (part.kind === "solid") {
    const p = part.paths;
    return `${head} class="iso-solid"${p.seamless ? " data-seamless" : ""}><path class="iso-fill" d="${p.fill}"/>${SHADES.map((i) => `<path class="iso-shade" data-shade="${i}" d="${p.shades[i] ?? ""}"/>`).join("")}<path class="iso-top" d="${p.top ?? ""}"/><path class="iso-line iso-edge" data-tone="hi" d="${p.outline}"/></g>`;
  }
  if (part.kind === "blob") {
    const edges = part.balls.map((b) => b.outline).join("");
    const body = part.balls.map((b) => `<path class="iso-fill" d="${b.fill}"/>${SHADES.map((i) => `<path class="iso-shade" data-shade="${i}" d="${b.shades[i] ?? ""}"/>`).join("")}`).join("");
    return `${head} class="iso-solid crew-blob" data-seamless><path class="iso-line iso-edge" data-tone="hi" d="${edges}" style="stroke-width:calc(var(--anatomy-weight) * 2.2)"/>${body}</g>`;
  }
  if (part.kind === "patch") return `${head}><path class="crew-patch"${part.shade ? ` data-shade="${part.shade}"` : ""} d="${part.d}"/>${part.edge === "none" ? "" : `<path class="iso-line" data-tone="${part.edge ?? "mid"}" d="${part.d}"/>`}</g>`;
  if (part.kind === "gleam") return `${head}><path class="crew-gleam" d="${part.d}"/></g>`;
  return `${head}><path class="iso-line" data-tone="${part.tone ?? "hi"}" data-free="" d="${part.d}" style="stroke-width:1.1px"/></g>`;
};

const pathsOf = (part) => {
  if (part.kind === "solid") return [part.paths.fill, ...SHADES.map((i) => part.paths.shades[i] ?? ""), part.paths.top ?? "", part.paths.outline];
  if (part.kind === "blob") return [part.balls.map((b) => b.outline).join(""), ...part.balls.flatMap((b) => [b.fill, ...SHADES.map((i) => b.shades[i] ?? "")])];
  if (part.kind === "patch") return part.edge === "none" ? [part.d] : [part.d, part.d];
  return [part.d];
};

export function critterSvg(c, { duty = false, part } = {}) {
  return `<g class="crew" data-crew="${c.name}" data-species="${c.species}"${c.role ? ` data-role="${c.role}"` : ""}${duty ? " data-duty" : ""}${part ? ` data-part="${part}"` : ""}>${c.parts.map(partSvg).join("")}</g>`;
}

export function paintCritter(el, c) {
  const shape = c.parts.map((part) => `${part.key}:${part.kind}:${part.c}:${part.edge ?? ""}`).join("|");
  if (el.__crew !== shape || el.children.length !== c.parts.length) {
    el.innerHTML = c.parts.map(partSvg).join("");
    el.__crew = shape;
    return;
  }
  c.parts.forEach((part, i) => {
    const paths = el.children[i].children;
    pathsOf(part).forEach((d, j) => {
      if (paths[j] && paths[j].getAttribute("d") !== d) paths[j].setAttribute("d", d);
    });
  });
}
