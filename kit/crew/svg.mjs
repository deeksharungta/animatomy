import { n1 } from "./draw.mjs";
import { leg } from "./parts.mjs";
import { ART } from "./cast.mjs";

export const node = (k, tag, attr, inner = "") => (tag === "path" ? `<path data-k="${k}" ${attr}/>` : `<g data-k="${k}" ${attr}>${inner}</g>`);

export function eelInner(c) {
  const { S, dyn, lines: w } = c;
  const fill = (k, style, op) => `<path data-k="${k}" d="${dyn[k]}" style="${style}"${op ? ` opacity="${op}"` : ""}/>`;
  const line = (k, style) => `<path data-k="${k}" d="${dyn[k]}" class="so-line" style="${style}"/>`;
  return `${S.defs}${fill("shade", "fill:var(--so-ground)", ".16")}<g class="so-fig">${fill("fin", "fill:var(--so-fur-shade)", ".85")}${line("rays", `stroke:var(--so-dark);stroke-width:${n1(w.ray * 10) / 10};opacity:.3`)}${fill("body", "fill:var(--so-fur)")}${fill("under", "fill:var(--so-fur-shade)", ".55")}${fill("lit", "fill:var(--so-fur-lit)", ".5")}${fill("belly", "fill:var(--so-belly)", ".9")}${fill("gloss", "fill:#fff", ".22")}${fill("charge", "fill:var(--so-zap)", ".24")}<g data-k="head" transform="${dyn.head}">${S.head}</g>${line("zapGlow", `stroke:var(--so-zap);stroke-width:${n1(w.glow)};opacity:.45`)}${line("zap", `stroke:var(--so-zap-core);stroke-width:${n1(w.core * 10) / 10}`)}</g>`;
}

export function inner(c) {
  if (c.stance === "path") return eelInner(c);
  const { S, dyn } = c;
  const a = ART[c.species];
  const R = c.stance === "four" ? a.four : a.up;
  const g = (k, html) => node(k, "g", `transform="${dyn[k]}"`, html);
  const limbPath = (k, tone) => `<path data-k="${k}" d="${dyn[k]}" fill="url(#so-${c.species}-v-${tone})"/>`;
  const parts = [];
  const tailBehind = !R.tail || (c.front ? R.tail.front !== "over" : R.tail.back !== "over");
  if (c.stance === "up") {
    const armTone = R.arms?.tone ?? "fur";
    if (R.tail && tailBehind) parts.push(g("tail", S.tail));
    if (R.arms) parts.push(limbPath("armF", armTone), g("pawF", S.pawF));
    if (S.footF) parts.push(g("footF", S.footF));
    const neck = R.neck ? `<path data-k="neck" d="${dyn.neck}" fill="url(#so-${c.species}-v-${R.neck.tone ?? "fur"})"/>` : "";
    const torso = (R.wing ? g("wingF", S.wingF) : "") + neck + S.body + (R.wing ? g("wingN", S.wingN) : "") + S.collar;
    parts.push(node("lean", "g", `transform="${dyn.lean}"`, torso + g("head", S.head)));
    if (S.footN) parts.push(g("footN", S.footN));
    if (R.tail && !tailBehind) parts.push(g("tail", S.tail));
    if (R.arms) parts.push(limbPath("armN", armTone), g("pawN", S.pawN));
  } else {
    const legTone = (G) => G.tone ?? "fur";
    R.legs.forEach((G, i) => { if (G.far) parts.push(limbPath(`leg${i}`, legTone(G)), g(`foot${i}`, S.legFoot[i])); });
    if (R.tail && tailBehind) parts.push(g("tail", S.tail));
    parts.push(node("lean", "g", `transform="${dyn.lean}"`, S.body + S.collar + g("head", S.head)));
    R.legs.forEach((G, i) => { if (!G.far) parts.push(limbPath(`leg${i}`, legTone(G)), g(`foot${i}`, S.legFoot[i])); });
    if (R.tail && !tailBehind) parts.push(g("tail", S.tail));
  }
  return `${S.defs}<g data-k="ground" transform="${dyn.root}">${S.ground}</g><g class="so-fig"><g data-k="root" transform="${dyn.root}">${parts.join("")}</g></g>`;
}

export function critterSvg(c, { duty = false, part } = {}) {
  return `<g class="crew" data-crew="${c.name}" data-species="${c.species}"${c.role ? ` data-role="${c.role}"` : ""}${duty ? " data-duty" : ""}${part ? ` data-part="${part}"` : ""}>${inner(c)}</g>`;
}

export function paintCritter(el, c) {
  if (el.__crew !== c.key) {
    el.innerHTML = inner(c);
    el.__crew = c.key;
    el.__nodes = Object.fromEntries([...el.querySelectorAll("[data-k]")].map((n) => [n.getAttribute("data-k"), n]));
    return;
  }
  for (const [k, v] of Object.entries(c.dyn)) {
    const n = el.__nodes[k];
    if (!n) continue;
    const attr = n.tagName === "path" ? "d" : "transform";
    if (n.getAttribute(attr) !== v) n.setAttribute(attr, v);
  }
}

// The box a critter covers on screen, for framing.
export function critterBox(c) {
  if (c.box) return c.box;
  const a = ART[c.species], R = c.stance === "four" ? a.four : a.up;
  const [x0, y0, x1, y1] = R.box;
  const m = c.dyn.root.match(/translate\(([-\d.]+) ([-\d.]+)\) scale\(([-\d.]+) ([-\d.]+)\)/).slice(1).map(Number);
  const xs = [m[0] + x0 * m[2], m[0] + x1 * m[2]], ys = [m[1] + y0 * m[3], m[1] + y1 * m[3]];
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}
