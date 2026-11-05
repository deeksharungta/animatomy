import { iso, depthOf } from "../iso-kit.mjs";
import { RAD, n1, pt, sub, add, len, unit, rotp, curve, limb, reach2 } from "./draw.mjs";
import { leg } from "./parts.mjs";
import { ART, ROLES } from "./cast.mjs";
import { PROPS } from "./head.mjs";
import { pieces, tr } from "./pieces.mjs";
import { eelCritter } from "./eel.mjs";

// ---------- the critter
export function critter(spec, pose = {}, P) {
  const sp = spec.species;
  const a = ART[sp];
  if (!a) throw new Error(`no species ${sp}`);
  // A role outside the eight ("turning", "timing") warns once, which fails the clean-console check.
  if (spec.role && !ROLES[spec.role] && !(critter.bad ??= new Set()).has(spec.role)) { critter.bad.add(spec.role); console.warn(`${spec.name ?? sp}: "${spec.role}" is not a role; use one of ${Object.keys(ROLES).join(", ")}`); }
  if (a.path) return eelCritter(spec, pose, P);
  const stance = pose.stance === "four" && a.four ? "four" : "up";
  const hang = pose.stance === "hang";
  const R = stance === "four" ? a.four : a.up;
  const size = spec.size ?? 20;
  const at = pose.at ?? [0, 0, 0];
  const hop = pose.hop ?? 0;
  const g0 = iso(at, P);
  const base = iso([at[0], at[1], at[2] + hop], P);
  const zpx = Math.abs(iso([at[0], at[1], at[2] + 1], P)[1] - g0[1]);
  const k = (size * zpx) / 100;
  const h = (pose.heading ?? 0) * RAD;
  const fw = [Math.cos(h), Math.sin(h), 0];
  const fs = sub(iso([at[0] + fw[0], at[1] + fw[1], at[2]], P), g0);
  const fl = len(fs) || 1;
  const mirror = fs[0] > 1e-6 * fl; // a tolerance: facing along the camera's line, fs[0] is rounding noise
  const front = fs[1] > -0.05 * fl;
  const turn = Math.min(1, 0.74 + (0.26 * Math.abs(fs[0])) / fl / 0.55);
  const sq = pose.squash ?? 0;
  const sx = (mirror ? -1 : 1) * k * turn * (1 + 0.1 * sq), sy = k * (1 - 0.26 * sq);
  const eyes = pose.eyes ?? "open";
  // A sweatband on a critter under 15 units tall is a smudge, so small critters go bare.
  const wear = [].concat(spec.wear ?? []).filter((w) => PROPS[w] && !(w === "sweatband" && (spec.size ?? 20) < 15));
  const wingsOpen = Math.max(0, Math.min(1, pose.wings ?? 0));
  const spread = !!R.wing?.spread && wingsOpen >= 0.5;
  const S = pieces(sp, stance, front, mirror, eyes, spec.role, wear, spread);
  let lean = ((pose.lean ?? 0) + (R.lean ?? 0)) * RAD;
  const toLocal = (w) => { const s = iso(w, P); return [(s[0] - base[0]) / sx, (s[1] - base[1]) / sy]; };
  const L = (p) => rotp(p, -lean, R.pivot);
  const look = pose.look ?? [0, 0];
  let pitch = Math.max(-30, Math.min(34, look[1] * 0.75)) + (R.head.pitch ?? 0);
  const reach = {};
  let neckOff = [0, 0];
  // The mouth's working tip: a bird's beak, or the front of any other animal's mouth (where a beaver's teeth bite).
  const biteTip = R.head.beakTip ?? (R.head.mouth ? R.head.mouth.match(/-?[\d.]+/g).slice(0, 2).map(Number) : null);
  const aim = pose.beak ?? pose.bite;
  if (aim && biteTip) {
    // Lean the body a little, tip the head and stretch the neck until the beak or mouth lands on the target.
    // For each lean and tip the neck takes up what is left, up to its length; the search prefers a short
    // neck and a small lean, so a bird pecks with its neck and only leans into a long reach.
    const T = toLocal(aim), maxNeck = R.neck?.max ?? 0;
    const fit = (ln, pc) => {
      const Tb = rotp(T, ln * RAD, R.pivot);
      const tip = rotp(biteTip, pc * RAD, R.head.pivot);
      let o = sub(Tb, tip);
      if (len(o) > maxNeck) o = [(o[0] * maxNeck) / len(o), (o[1] * maxNeck) / len(o)];
      const miss = len(sub(Tb, add(tip, o)));
      return [miss, miss * 6 + len(o) * 0.1 + Math.abs(ln) * 0.25 + Math.abs(pc) * 0.02, o];
    };
    let best = null;
    const scan = (a0, a1, da, b0, b1, db) => { for (let a = a0; a <= a1; a += da) for (let b = b0; b <= b1; b += db) { const f = fit(a, b); if (!best || f[1] < best.cost) best = { a, b, miss: f[0], cost: f[1], o: f[2] }; } };
    scan(-15, 55, 2.5, -30, 34, 4);
    scan(best.a - 2.5, best.a + 2.5, 0.5, Math.max(-30, best.b - 4), Math.min(34, best.b + 4), 0.5);
    lean = best.a * RAD;
    pitch = best.b;
    neckOff = best.o;
    reach[pose.beak ? "beak" : "bite"] = (best.miss * size) / 100;
  }
  const dyn = {};
  dyn.root = `${tr(base[0], base[1])} scale(${Math.round(sx * 1000) / 1000} ${Math.round(sy * 1000) / 1000})`;
  dyn.ground = `${tr(g0[0], g0[1])} scale(${Math.round(sx * 1000) / 1000} ${Math.round(k * 1000) / 1000})`;
  dyn.lean = `rotate(${n1(-lean / RAD)} ${pt(R.pivot)})`;
  dyn.head = `${neckOff[0] || neckOff[1] ? `${tr(neckOff[0], neckOff[1])} ` : ""}rotate(${n1(pitch)} ${pt(R.head.pivot)})`;
  if (R.neck) {
    // The neck: from its base on the body to wherever the head has gone, hidden under both when it hasn't moved.
    const top = add(R.head.pivot, neckOff);
    dyn.neck = curve(limb([R.neck.base, add(R.neck.base, sub(top, R.neck.base), 0.5), top], [R.neck.w[0], (R.neck.w[0] + R.neck.w[1]) / 2, R.neck.w[1]])).d;
  }
  if (R.wing) {
    // Folded: the wing lifts a little off the back. Spread: it beats, from wings 0.5 (down) to 1 (up).
    const w = spread ? (wingsOpen - 0.75) * 50 : wingsOpen * 30;
    dyn.wingN = `rotate(${n1(-w)} ${pt(R.wing.pivot)})`;
    dyn.wingF = `rotate(${n1(-w - (spread ? 14 : 0))} ${pt(R.wing.pivot)})`;
  }
  const stride = pose.stride ?? { phase: 0, amount: 0 };
  const sway = (pose.tailSway ?? 0) * 12;
  if (R.tail) dyn.tail = `rotate(${n1(-lean / RAD + sway)} ${pt(R.tail.pivot ?? R.pivot)})`;

  if (stance === "up") {
    // Which side of the animal is nearer the viewer.
    const side = [-Math.sin(h), Math.cos(h), 0];
    const leftNear = depthOf([at[0] + side[0], at[1] + side[1], at[2]], P) >= depthOf(at, P);
    const nearKey = leftNear ? "l" : "r", farKey = leftNear ? "r" : "l";
    const A = R.arms ?? { near: [0, 0], far: [0, 0], skip: true };
    // The shoulders sit across the body: move them along the animal's real side axis as the camera sees it,
    // so a paw target to its left or right lands on the matching side of the drawing.
    const sv = sub(iso([at[0] + side[0], at[1] + side[1], at[2]], P), g0);
    const span = ((A.span ?? 10) * size) / 100;
    const across = [(sv[0] * span) / sx, (sv[1] * span) / sy];
    const nearOff = leftNear ? across : [-across[0], -across[1]];
    for (const [which, key] of A.skip ? [] : [["N", nearKey], ["F", farKey]]) {
      const drawn = hang && A.hang ? A.hang[which === "N" ? "near" : "far"] : which === "N" ? A.near : A.far;
      const sgn = which === "N" ? 1 : -1;
      const shoulder = [drawn[0] + nearOff[0] * sgn * 0.6, drawn[1] + nearOff[1] * sgn * 0.6];
      const S0 = L(shoulder);
      const rest = hang ? add(shoulder, [0, -(A.l1 + A.l2) * 0.9]) : which === "N" ? A.rest.near : A.rest.far;
      const tgt = pose.paws?.[key] ? toLocal(pose.paws[key]) : L(rest);
      const r = reach2(S0, tgt, A.l1, A.l2, A.bend ?? [0.45, 1]);
      if (pose.paws?.[key]) reach[key] = (r.short * size) / 100;
      const W = r.W;
      const u = unit(sub(W, r.E));
      const wrist = add(W, u, -A.paw.len * 0.55);
      dyn[`arm${which}`] = curve(limb([S0, r.E, wrist], A.w)).d;
      dyn[`paw${which}`] = `${tr(wrist[0], wrist[1])} rotate(${n1(Math.atan2(u[1], u[0]) / RAD)})`;
    }
    const st = (stride.amount ?? 0) * 60;
    const ph = (stride.phase ?? 0) * Math.PI * 2;
    const F = R.feet ?? { near: { at: [0, 0] }, far: { at: [0, 0] } };
    if (hang) dyn.ground = "scale(0)";
    if (!R.feet) {
      // Legs drawn into the body (a crab): nothing to step.
    } else if (hang) {
      // Feet dangle, toes down, swinging a little with the stride.
      const swing = 8 * Math.sin(ph) * (stride.amount ?? 0) * 8;
      dyn.footN = `${tr(F.near.at[0] + 2, F.near.at[1] + 2)} rotate(${n1(-72 + swing)})`;
      dyn.footF = `${tr(F.far.at[0] + 4, F.far.at[1] + 1)} rotate(${n1(-64 - swing)})`;
    } else {
      dyn.footN = tr(F.near.at[0] + st * Math.sin(ph), F.near.at[1] - Math.max(0, Math.cos(ph)) * st * 0.3);
      dyn.footF = tr(F.far.at[0] - st * Math.sin(ph), F.far.at[1] - Math.max(0, -Math.cos(ph)) * st * 0.3);
    }
  } else {
    const amt = (stride.amount ?? 0) * 60;
    const ph = (stride.phase ?? 0) * Math.PI * 2;
    R.legs.forEach((G, i) => {
      const q = ph + G.offset * Math.PI * 2;
      const foot = [G.foot.x + amt * Math.cos(q), -Math.max(0, Math.sin(q)) * amt * 0.42];
      const hip = L(G.hip);
      const r = reach2(hip, foot, G.l1, G.l2, G.bend);
      dyn[`leg${i}`] = curve(limb([hip, r.E, r.W], G.w)).d;
      dyn[`foot${i}`] = tr(r.W[0], r.W[1]);
    });
  }
  const key = `${sp}|${stance}|${front}|${mirror}|${eyes}|${spread}`;
  return { name: spec.name ?? sp, species: sp, role: spec.role, size, stance, hang, front, mirror, eyes, key, S, dyn, reach, depth: depthOf(at, P), anchor: base };
}
