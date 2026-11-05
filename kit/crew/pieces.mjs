import { n1, strands, limb } from "./draw.mjs";
import { ART } from "./cast.mjs";
import { defs, furShape, softShape, plainShape, aoBlob, tailSvg } from "./paint.mjs";
import { headSvg, pawSvg, footSvg, collarSvg } from "./head.mjs";

// ---------- static pieces, cached by species, stance, view and mirror
export const CACHE = new Map();
export function pieces(sp, stance, front, mirror, eyes, role, wear, spread = false) {
  const key = `${sp}|${stance}|${front}|${mirror}|${eyes}|${role}|${wear.join(",")}|${spread}`;
  if (CACHE.has(key)) return CACHE.get(key);
  const a = ART[sp], R = stance === "four" ? a.four : a.up;
  const out = { defs: defs(sp) };
  const B = R.body;
  const legs = (list) => (list ?? []).map((L) => plainShape(sp, limb(L.cl, L.w), L.tone ?? "fur")).join("");
  out.body = legs(B.under) + furShape(sp, B.pts, B.tone ?? "fur", { strands: B.strands ?? 60, flow: B.flow, seed: 4, only: B.tuftOnly, lean: B.lean }, mirror);
  for (const m of B.marks ?? []) if (front || !m.front) out.body += m.soft === false ? plainShape(sp, m.pts, m.tone) : softShape(sp, m.pts, m.tone, m.op ?? 1);
  if (!front) for (const m of B.backMarks ?? []) out.body += softShape(sp, m.pts, m.tone, m.op ?? 1);
  for (const o of B.ao ?? []) out.body += aoBlob(sp, o, 0.8);
  out.body += legs(B.over);
  // A collar shows the role; an animal with none (a visitor, off duty) wears none.
  out.collar = role ? collarSvg(R.collar) : "";
  out.head = headSvg(sp, R.head, { eyes, front, mirror, wear, role });
  out.tail = R.tail ? tailSvg(sp, R.tail, mirror) : "";
  if (R.wing) {
    // Folded on the body, or spread up and back in flight.
    const Wg = spread && R.wing.spread ? { ...R.wing, ...R.wing.spread } : R.wing;
    out.wingN = furShape(sp, Wg.pts, Wg.tone ?? "fur", { strands: 0, tuft: 0.8, gap: 1.2, seed: 41, flow: [1, 0.4] }, mirror) + (Wg.marks ?? []).map((m) => (m.soft === false ? plainShape(sp, m.pts, m.tone) : softShape(sp, m.pts, m.tone, m.op ?? 1))).join("") + (Wg.lines ? `<path class="so-line" d="${Wg.lines}" style="stroke:var(--so-${Wg.tone ?? "fur"}-shade);stroke-width:.4;opacity:.6"/>` : "");
    out.wingF = plainShape(sp, Wg.pts, Wg.tone === "belly" ? "fur" : "dark");
  }
  out.ground = `<ellipse cx="${n1(R.shadow[0])}" cy="1" rx="${n1(R.shadow[1])}" ry="${n1(R.shadow[2])}" fill="url(#so-${sp}-ground)"/>`;
  if (R.arms) out.pawN = out.pawF = pawSvg(sp, R.arms.paw);
  if (R.feet) { out.footN = footSvg(sp, R.feet.near); out.footF = footSvg(sp, R.feet.far ?? R.feet.near); }
  if (R.legs) out.legFoot = R.legs.map((L) => footSvg(sp, L.foot));
  CACHE.set(key, out);
  return out;
}

export const tr = (x, y) => `translate(${n1(x)} ${n1(y)})`;
