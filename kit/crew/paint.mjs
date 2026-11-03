import { RAD, n1, pt, sub, add, len, unit, rng, curve, inside, bounds, tufts, strands, limb } from "./draw.mjs";
import { ART } from "./cast.mjs";
import { TONES } from "./colour.mjs";

// ---------- defs: gradients per tone, lit from the top left of the screen
export function defs(sp) {
  const a = ART[sp];
  const id = (x) => `so-${sp}-${x}`;
  const out = [];
  const fx = 0.5;
  for (const t of TONES) {
    if (!a.colors[t]) continue;
    out.push(`<radialGradient id="${id(`v-${t}`)}" cx="${fx}" cy=".3" r=".82" fx="${fx}" fy=".26"><stop offset="0" style="stop-color:var(--so-${t}-lit)"/><stop offset=".5" style="stop-color:var(--so-${t})"/><stop offset="1" style="stop-color:var(--so-${t}-shade)"/></radialGradient>`);
    out.push(`<radialGradient id="${id(`s-${t}`)}"><stop offset="0" style="stop-color:var(--so-${t})"/><stop offset=".55" style="stop-color:var(--so-${t});stop-opacity:.92"/><stop offset="1" style="stop-color:var(--so-${t});stop-opacity:0"/></radialGradient>`);
  }
  out.push(`<radialGradient id="${id("ao")}"><stop offset="0" style="stop-color:var(--so-fur-shade);stop-opacity:.75"/><stop offset="1" style="stop-color:var(--so-fur-shade);stop-opacity:0"/></radialGradient>`);
  out.push(`<radialGradient id="${id("ground")}"><stop offset="0" stop-color="#000" stop-opacity=".3"/><stop offset=".6" stop-color="#000" stop-opacity=".14"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>`);
  out.push(`<radialGradient id="${id("eye")}" cx=".42" cy=".36" r=".7"><stop offset="0" style="stop-color:color-mix(in srgb,var(--so-eye) 55%,#7a5236)"/><stop offset=".45" style="stop-color:var(--so-eye)"/><stop offset="1" style="stop-color:var(--so-eye)"/></radialGradient>`);
  out.push(`<filter id="so-duty" x="-20%" y="-20%" width="140%" height="140%"><feMorphology in="SourceAlpha" operator="dilate" radius=".4" result="d"/><feFlood style="flood-color:var(--crew-duty)" result="c"/><feComposite in="c" in2="d" operator="in" result="rim"/><feMerge><feMergeNode in="rim"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`);
  return `<defs>${out.join("")}</defs>`;
}

// ---------- painting helpers (local coordinates)
// Light from above, so a mirrored animal is lit the same way.
export const LIGHT = () => [0, -1];
export function furShape(sp, pts, tone, o, mirror) {
  const { d, poly } = curve(pts);
  const coat = ART[sp].coat;
  const light = LIGHT(mirror);
  const flow = o.flow ?? coat.flow;
  let s = `<path d="${d}" fill="url(#so-${sp}-v-${tone})"/>`;
  if (coat.shell) {
    // A hard shell: no fur, a soft gloss up and to the left of its middle.
    const [x0, y0, x1, y1] = bounds(poly);
    return s + `<ellipse cx="${n1(x0 + (x1 - x0) * 0.4)}" cy="${n1(y0 + (y1 - y0) * 0.3)}" rx="${n1((x1 - x0) * 0.26)}" ry="${n1((y1 - y0) * 0.16)}" fill="#fff" opacity=".2"/>`;
  }
  const nStr = o.strands ?? 0;
  if (nStr) {
    const st = strands(poly, { count: nStr, len: o.strandLen ?? coat.strand, flow, seed: o.seed ?? 3, light });
    if (st.shade) s += `<path class="so-strand" d="${st.shade}" style="stroke:var(--so-${tone}-shade);stroke-width:${o.sw ?? coat.sw};opacity:.5"/>`;
    if (st.lit) s += `<path class="so-strand" d="${st.lit}" style="stroke:var(--so-${tone}-lit);stroke-width:${o.sw ?? coat.sw};opacity:.55"/>`;
  }
  if (o.tufts !== false) {
    const tf = tufts(poly, { len: o.tuft ?? coat.tuft, gap: o.gap ?? coat.gap, flow, lean: o.lean ?? 0.5, seed: (o.seed ?? 3) + 11, light, only: o.only });
    const w = o.tw ?? coat.tw;
    if (tf.shade) s += `<path class="so-tuft" d="${tf.shade}" style="stroke:var(--so-${tone}-shade);stroke-width:${w};opacity:.55"/>`;
    if (tf.mid) s += `<path class="so-tuft" d="${tf.mid}" style="stroke:var(--so-${tone});stroke-width:${w}"/>`;
    if (tf.lit) s += `<path class="so-tuft" d="${tf.lit}" style="stroke:var(--so-${tone}-lit);stroke-width:${w};opacity:.85"/>`;
  }
  return s;
}
export const softShape = (sp, pts, tone, op = 1) => `<path d="${curve(pts).d}" fill="url(#so-${sp}-s-${tone})"${op < 1 ? ` opacity="${op}"` : ""}/>`;
export const plainShape = (sp, pts, tone) => `<path d="${curve(pts).d}" fill="url(#so-${sp}-v-${tone})"/>`;
export const aoBlob = (sp, [cx, cy, rx, ry], op = 1) => `<ellipse cx="${n1(cx)}" cy="${n1(cy)}" rx="${n1(rx)}" ry="${n1(ry)}" fill="url(#so-${sp}-ao)"${op < 1 ? ` opacity="${op}"` : ""}/>`;

export function eyeSvg(sp, e, state, far = false) {
  const [cx, cy] = e.at;
  const grow = state === "wide" ? 1.18 : 1;
  const rx = e.rx * grow, ry = e.ry * grow, rot = e.rot ?? 0;
  const tf = `transform="rotate(${rot} ${n1(cx)} ${n1(cy)})"`;
  let s = "";
  if (e.ring) s += `<ellipse cx="${n1(cx)}" cy="${n1(cy)}" rx="${n1(rx + e.ring)}" ry="${n1(ry + e.ring)}" fill="url(#so-${sp}-s-mark)" ${tf}/>`;
  s += `<ellipse cx="${n1(cx)}" cy="${n1(cy)}" rx="${n1(rx + 0.45)}" ry="${n1(ry + 0.45)}" style="fill:var(--so-fur-shade)" ${tf}/>`;
  if (state === "shut") {
    s += `<ellipse cx="${n1(cx)}" cy="${n1(cy)}" rx="${n1(rx)}" ry="${n1(ry)}" style="fill:var(--so-fur)" ${tf}/>`;
    s += `<path class="so-line" d="M${n1(cx - rx * 0.95)},${n1(cy + ry * 0.05)}Q${n1(cx)},${n1(cy + ry * 0.55)} ${n1(cx + rx * 0.95)},${n1(cy + ry * 0.05)}" style="stroke:var(--so-eye);stroke-width:${n1(Math.max(0.5, rx * 0.22))}" ${tf}/>`;
    return s;
  }
  s += `<ellipse cx="${n1(cx)}" cy="${n1(cy)}" rx="${n1(rx)}" ry="${n1(ry)}" fill="url(#so-${sp}-eye)" ${tf}/>`;
  if (e.pupil) s += `<ellipse cx="${n1(cx - rx * 0.08)}" cy="${n1(cy)}" rx="${n1(rx * e.pupil)}" ry="${n1(ry * e.pupil)}" fill="#120c08"/>`;
  if (!far || rx > 1.2) {
    s += `<ellipse cx="${n1(cx - rx * 0.34)}" cy="${n1(cy - ry * 0.4)}" rx="${n1(rx * 0.3)}" ry="${n1(ry * 0.26)}" fill="#fff" opacity=".92"/>`;
    s += `<circle cx="${n1(cx + rx * 0.35)}" cy="${n1(cy + ry * 0.38)}" r="${n1(rx * 0.12)}" fill="#fff" opacity=".5"/>`;
  }
  if (state === "happy") {
    // Squint: the lids close over the top and lift from below, inside the eye's outline.
    const RX = rx + 0.5, RY = ry + 0.5;
    const cut = (dy) => RX * Math.sqrt(Math.max(0, 1 - (dy / RY) ** 2));
    const yt = -ry * 0.08, yb = ry * 0.55, xt = cut(yt), xb = cut(yb);
    s += `<path d="M${n1(cx - xt)},${n1(cy + yt)}A${n1(RX)} ${n1(RY)} 0 0 1 ${n1(cx + xt)},${n1(cy + yt)}Q${n1(cx)},${n1(cy + yt + ry * 0.4)} ${n1(cx - xt)},${n1(cy + yt)}Z" style="fill:var(--so-fur)" ${tf}/>`;
    s += `<path d="M${n1(cx - xb)},${n1(cy + yb)}A${n1(RX)} ${n1(RY)} 0 0 0 ${n1(cx + xb)},${n1(cy + yb)}Q${n1(cx)},${n1(cy + yb - ry * 0.3)} ${n1(cx - xb)},${n1(cy + yb)}Z" style="fill:var(--so-fur)" ${tf}/>`;
    s += `<path class="so-line" d="M${n1(cx - xt)},${n1(cy + yt)}Q${n1(cx)},${n1(cy + yt + ry * 0.4)} ${n1(cx + xt)},${n1(cy + yt)}" style="stroke:var(--so-fur-shade);stroke-width:${n1(Math.max(0.4, rx * 0.16))}" ${tf}/>`;
  }
  return s;
}

export function whiskersSvg(w) {
  if (!w) return "";
  const r = rng(w.seed ?? 5);
  let d = "";
  for (let i = 0; i < w.n; i++) {
    const a = (w.from + ((w.to - w.from) * i) / Math.max(1, w.n - 1) + (r() - 0.5) * 6) * RAD;
    const l = w.len * (0.75 + 0.4 * r());
    const o = add(w.at, [0, (i - w.n / 2) * (w.spread ?? 0.6)]);
    const tip = add(o, [Math.cos(a), Math.sin(a)], l);
    const c = add(add(o, [Math.cos(a), Math.sin(a)], l * 0.5), [0, l * 0.07]);
    d += `M${pt(o)}Q${pt(c)} ${pt(tip)}`;
  }
  return `<path class="so-line" d="${d}" style="stroke:var(--so-whisker);stroke-width:${w.width ?? 0.35};opacity:${w.opacity ?? 0.75}"/>`;
}

export function brushSvg(b) {
  if (!b) return "";
  const r = rng(b.seed ?? 13);
  let d = "";
  for (let i = 0; i < b.n; i++) {
    const a = (-90 + (i / Math.max(1, b.n - 1) - 0.5) * (b.spread ?? 60) + (b.tilt ?? 0) + (r() - 0.5) * 10) * RAD;
    const l = b.len * (0.6 + 0.5 * r());
    const o = add(b.at, [(r() - 0.5) * 1.2, 1.5]);
    const tip = add(o, [Math.cos(a), Math.sin(a)], l);
    d += `M${pt(o)}Q${pt(add(add(o, [Math.cos(a), Math.sin(a)], l * 0.5), [l * 0.12, 0]))} ${pt(tip)}`;
  }
  return `<path class="so-tuft" d="${d}" style="stroke:var(--so-dark);stroke-width:${b.w ?? 0.6}"/>`;
}

export function tailSvg(sp, T, mirror) {
  if (T.line) {
    const d = curve(limb(T.line.cl, T.line.w)).d;
    return `<path d="${d}" fill="url(#so-${sp}-v-${T.tone ?? "skin"})"/>${T.line.rings ? ringsSvg(T.line) : ""}`;
  }
  let s = furShape(sp, T.pts, T.tone ?? "fur", { strands: T.strands ?? 20, flow: T.flow, seed: 31, tuft: T.tuft, gap: T.gap, lean: T.lean, tw: T.tw, strandLen: T.strandLen, tufts: T.tufts }, mirror);
  for (const m of T.marks ?? []) s += m.soft === false ? plainShape(sp, m.pts, m.tone ?? "dark") : softShape(sp, m.pts, m.tone ?? "dark", m.op ?? 1);
  if (T.scales) {
    const { poly } = curve(T.pts);
    const [x0, y0, x1, y1] = bounds(poly);
    let d = "";
    const g = T.scales;
    for (let x = x0; x < x1; x += g) for (let y = y0; y < y1; y += g * 0.7) {
      const c = [x + ((Math.round((y - y0) / (g * 0.7)) % 2) * g) / 2, y];
      if (inside(poly, c[0] - g * 0.4, c[1]) && inside(poly, c[0] + g * 0.4, c[1] + g * 0.3)) d += `M${pt(add(c, [-g * 0.4, 0]))}Q${pt(add(c, [0, g * 0.45]))} ${pt(add(c, [g * 0.4, 0]))}`;
    }
    s += `<path class="so-line" d="${d}" style="stroke:var(--so-${T.tone ?? "fur"}-shade);stroke-width:.45;opacity:.7"/>`;
  }
  return s;
}
export function ringsSvg(L) {
  const { poly } = curve(L.cl, false, 12);
  let d = "";
  for (let i = 4; i < poly.length - 2; i += 3) {
    const t = unit(sub(poly[i + 1], poly[i - 1])), nrm = [-t[1], t[0]];
    const w = 1.2;
    d += `M${pt(add(poly[i], nrm, w))}L${pt(add(poly[i], nrm, -w))}`;
  }
  return `<path class="so-line" d="${d}" style="stroke:var(--so-skin-shade);stroke-width:.25;opacity:.5"/>`;
}
