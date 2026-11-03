import { C, P, PEN, KIT, S } from "./model.mjs";
import { facetKit } from "./facets.mjs";
import { cutDepth, cutAngle } from "./mech.mjs";

// Bodies of revolution cut along a horizontal plane at or below the pen's axis (mech.mjs, cutDepth). A profile is a
// list of [z, r] points along the axis (two points at one z make a step); a body lies between an inner and an outer one.
const F = facetKit(KIT, P, PEN);
const comb = (a, ka, b, kb) => a.map((v, i) => v * ka + b[i] * kb);

// The angle of a point on the section: t runs from the near cut edge (0) round under the axis to the far one (1).
const angleAt = (z, r, t) => { const d = cutDepth(C, z), a = cutAngle(d, r, false); return a + (cutAngle(d, r, true) - a) * t; };

// The faces of one profile over the part below the cut; sign -1 faces the bore, +1 faces out.
function surface(prof, sign, step) {
  const out = [], n = Math.ceil(180 / step);
  for (let j = 0; j + 1 < prof.length; j++) {
    const [[z0, r0], [z1, r1]] = [prof[j], prof[j + 1]], len = Math.hypot(z1 - z0, r1 - r0);
    if (len < 1e-9) continue;
    for (let i = 0; i < n; i++) {
      const [t, u] = [i / n, (i + 1) / n], mid = (angleAt(z0, r0, (t + u) / 2) + angleAt(z1, r1, (t + u) / 2)) / 2;
      const nrm = comb(PEN.a, (-sign * (r1 - r0)) / len, F.rad(mid), (sign * (z1 - z0)) / len);
      out.push({ pts: [F.pt(r0, angleAt(z0, r0, t), z0), F.pt(r0, angleAt(z0, r0, u), z0), F.pt(r1, angleAt(z1, r1, u), z1), F.pt(r1, angleAt(z1, r1, t), z1)], n: nrm });
    }
  }
  return out;
}

// The section itself at the near or far edge: a flat face, facing up, between the two profiles.
const cut = (inner, outer, t) => ({ pts: [...inner, ...outer.slice().reverse()].map(([z, r]) => F.pt(r, angleAt(z, r, t), z)), n: [0, 0, 1] });

// A bore sits in its own shadow: shade its faces as if tilted away from the light, but keep their true facing.
const shadow = (faces, k) => faces.map((f) => ({ ...f, s: [f.n[0], f.n[1], f.n[2] - k] }));

// The far half seen from inside (its bore and its far cut), and the near half seen from outside (its skin and near cut).
export function shell(inner, outer, { tone = "hi", bore = "mid", step = 4, skin = "", deep = 1.1 } = {}) {
  const solid = (faces, style) => S(F.solid(faces), { crease: "faint", ...style });
  return {
    back: solid(shadow(surface(inner, -1, step), deep), { tone: bore }) + solid([cut(inner, outer, 1)], { tone }),
    front: solid(surface(outer, 1, step), { tone, inner: skin }) + solid([cut(inner, outer, 0)], { tone }),
  };
}

// A V thread between two radii: the same teeth for the spigot's outside and the barrel's inside, so they mesh.
export function thread(z0, z1, [r0, r1], pitch, from = z0) {
  const out = [], tooth = (z) => { const w = (((z - from) / pitch) % 1 + 1) % 1; return w < 0.5 ? r1 - (r1 - r0) * 2 * w : r0 + (r1 - r0) * (2 * w - 1); };
  out.push([z0, tooth(z0)]);
  for (let z = from + Math.ceil((z0 - from) / (pitch / 2) + 1e-9) * (pitch / 2); z < z1 - 1e-6; z += pitch / 2) out.push([z, tooth(z)]);
  out.push([z1, tooth(z1)]);
  return out;
}

// Rings round the near outside of a body, from the near cut edge to its silhouette.
export const rings = (zs, r) => zs.map((z) => KIT.arcOf(KIT.frameOf(F.pt(0, 0, z), PEN.a, PEN.u, PEN.v), 0, r, P, { from: (angleAt(z, r, 0) * Math.PI) / 180, to: (angleAt(z, r, 1) * Math.PI) / 180 })).join("");

export { F, angleAt };
