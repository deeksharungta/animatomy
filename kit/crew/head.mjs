import { n1, curve, strands } from "./draw.mjs";
import { furShape, softShape, plainShape, eyeSvg, whiskersSvg, brushSvg } from "./paint.mjs";

// ---------- props: only the few that read cleanly at a figure's size. Hats, goggles, bow ties, mitts,
// watches and held notebooks were tried and dropped: they read as stickers or as specks.
export const PROPS = {
  glasses: { at: "face", does: "round wire glasses, for whoever reads or times things" },
  sweatband: { at: "head", does: "a towelling band in the role colour, for the runners and jumpers" },
};
export const ink = (w) => `class="so-line" style="stroke:#2b2622;stroke-width:${n1(w)}"`;
export function headProps(sp, H, wear, front) {
  if (!wear.length) return "";
  const xs = H.pts.map((p) => p[0]), ys = H.pts.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), w = x1 - x0, h = Math.max(...ys) - y0;
  const s = w / 42;
  let out = "";
  if (wear.includes("sweatband")) {
    // Across the head between the crown and the brow, edge to edge of the head at that height (never over the eye).
    const brow = H.eye ? H.eye.at[1] - H.eye.ry : y0 + h * 0.4;
    const y = Math.min(y0 + (brow - y0) * 0.55, brow - 2.6 * s);
    const cuts = H.pts.flatMap((a, i) => { const b = H.pts[(i + 1) % H.pts.length]; return (a[1] - y) * (b[1] - y) <= 0 && a[1] !== b[1] ? [a[0] + ((y - a[1]) / (b[1] - a[1])) * (b[0] - a[0])] : []; });
    const l = Math.min(...cuts), r = Math.max(...cuts), bw = r - l;
    const band = (dy, i0, i1) => `M${n1(l + bw * i0)},${n1(y + 1.2 * s + dy)}Q${n1(l + bw * 0.5)},${n1(y - 1.6 * s + dy)} ${n1(r - bw * i1)},${n1(y + 1.2 * s + dy)}`;
    out += `<path d="${band(0, 0.03, 0.03)}" class="so-line" style="stroke:var(--so-role,#888);stroke-width:${n1(2.6 * s)}"/><path d="${band(-0.1, 0.08, 0.08)}" class="so-line" style="stroke:#fff;stroke-width:${n1(0.5 * s)};opacity:.75"/>`;
  }
  if (wear.includes("glasses") && H.eye) {
    const [cx, cy] = H.eye.at;
    const r = Math.max(H.eye.rx * 1.75 + 0.8, 3 * s);
    const arm = `<path d="M${n1(cx + r)},${n1(cy - 0.4)}L${n1(Math.min(x1 - 2 * s, cx + r + w * 0.4))},${n1(cy - 1.2)}" ${ink(0.7 * s)}/>`;
    out += front ? `${arm}<circle cx="${n1(cx)}" cy="${n1(cy)}" r="${n1(r)}" fill="#fff" opacity=".14"/><circle cx="${n1(cx)}" cy="${n1(cy)}" r="${n1(r)}" fill="none" ${ink(0.75 * s)}/><path d="M${n1(cx - r * 0.6)},${n1(cy - r * 0.55)}Q${n1(cx - r * 0.1)},${n1(cy - r * 0.9)} ${n1(cx + r * 0.4)},${n1(cy - r * 0.7)}" class="so-line" style="stroke:#fff;stroke-width:${n1(0.5 * s)};opacity:.7"/><path d="M${n1(cx - r)},${n1(cy + 0.2)}L${n1(cx - r - 2.6 * s)},${n1(cy + 0.8 * s)}" ${ink(0.7 * s)}/>` : arm;
  }
  return out;
}

export function headSvg(sp, H, { eyes, front, mirror, wear = [], role }) {
  let s = "";
  const ears = H.ears ?? {};
  if (ears.far) s += furShape(sp, ears.far.pts, ears.far.tone ?? "fur", { strands: 0, tuft: 1.2, gap: 1.6, seed: 21 }, mirror) + (front && ears.far.inner ? softShape(sp, ears.far.inner, ears.far.innerTone ?? "skin", 0.9) : "") + brushSvg(ears.far.brush);
  for (const x of H.under ?? []) s += x(sp, mirror);
  s += furShape(sp, H.pts, H.tone ?? "fur", { strands: H.strands ?? 30, flow: H.flow, seed: 9, tuft: H.tuft, only: H.tuftOnly }, mirror);
  for (const m of H.marks ?? []) if (front || !m.front) s += m.soft === false ? plainShape(sp, m.pts, m.tone) : softShape(sp, m.pts, m.tone, m.op ?? 1);
  for (const l of H.lines ?? []) if (front || !l.front) s += `<path class="so-line" d="${l.d}" style="stroke:var(--so-${l.tone ?? "dark"});stroke-width:${l.w ?? 0.8};opacity:${l.op ?? 1}"/>`;
  if (H.beak) s += plainShape(sp, H.beak, H.beakTone ?? "dark") + (H.beakLine ? `<path class="so-line" d="${H.beakLine}" style="stroke:var(--so-dark-shade);stroke-width:.45;opacity:.8"/>` : "");
  if (front && H.eyeFar) s += eyeSvg(sp, H.eyeFar, eyes, true);
  if (H.eye && (front || H.eyeBack !== false)) s += eyeSvg(sp, H.eye, eyes);
  if (H.snout) s += `<path d="${curve(H.snout).d}" fill="url(#so-${sp}-v-skin)"/><path class="so-line" d="${curve(H.snout, false).d}" style="stroke:var(--so-skin-shade);stroke-width:.25;opacity:.35"/>`;
  if (H.nose) s += `<path d="${curve(H.nose).d}" style="fill:var(--so-nose)"/><path d="${curve(H.nose).d}" fill="url(#so-${sp}-v-skin)" opacity=".35"/>`;
  if (H.mouth) s += `<path class="so-line" d="${H.mouth}" style="stroke:var(--so-fur-shade);stroke-width:.55;opacity:.8"/>`;
  if (ears.near) {
    s += furShape(sp, ears.near.pts, ears.near.tone ?? "fur", { strands: 0, tuft: ears.near.tuft ?? 1.1, gap: 1.6, seed: 23, flow: ears.near.flow }, mirror);
    if (ears.near.inner) s += softShape(sp, ears.near.inner, ears.near.innerTone ?? "skin", front ? 0.95 : 0.4);
    s += brushSvg(ears.near.brush);
  }
  if (H.teeth) s += `<path d="${H.teeth}" style="fill:var(--so-teeth)"/><path d="${H.teeth}" fill="url(#so-${sp}-v-skin)" opacity=".18"/>${H.teethLine ? `<path class="so-line" d="${H.teethLine}" style="stroke:var(--so-fur-shade);stroke-width:.4"/>` : ""}`;
  if (front) s += whiskersSvg(H.whiskers);
  s += headProps(sp, H, wear, front);
  return s;
}

export function pawSvg(sp, P) {
  // A paw along +x from the wrist.
  const l = P.len, w = P.w;
  if (P.pincer) {
    // A crab's claw: a swollen palm, a fixed finger below and a movable one above, dark tips.
    const palm = [[-0.5, -w * 0.4], [l * 0.3, -w * 0.55], [l * 0.58, -w * 0.45], [l * 0.66, 0], [l * 0.58, w * 0.45], [l * 0.3, w * 0.55], [-0.5, w * 0.4]];
    const lower = [[l * 0.5, w * 0.06], [l * 0.82, w * 0.1], [l * 1.04, -w * 0.02, 1], [l * 0.86, w * 0.3], [l * 0.55, w * 0.4]];
    const upper = [[l * 0.5, -w * 0.08], [l * 0.82, -w * 0.26], [l * 1.08, -w * 0.12, 1], [l * 0.8, -w * 0.42], [l * 0.5, -w * 0.44]];
    const tip = (x, y) => `<ellipse cx="${n1(x)}" cy="${n1(y)}" rx="${n1(l * 0.09)}" ry="${n1(w * 0.09)}" fill="url(#so-${sp}-s-skin)"/>`;
    return `<path d="${curve(upper).d}" fill="url(#so-${sp}-v-${P.tone ?? "fur"})"/><path d="${curve(lower).d}" fill="url(#so-${sp}-v-${P.tone ?? "fur"})"/>${tip(l * 1.0, -w * 0.14)}${tip(l * 0.98, 0)}<path d="${curve(palm).d}" fill="url(#so-${sp}-v-${P.tone ?? "fur"})"/><ellipse cx="${n1(l * 0.28)}" cy="${n1(-w * 0.2)}" rx="${n1(l * 0.16)}" ry="${n1(w * 0.12)}" fill="#fff" opacity=".2"/>`;
  }
  const pts = [[-0.5, -w * 0.42], [l * 0.45, -w * 0.55], [l * 0.9, -w * 0.38], [l * 1.04, 0], [l * 0.9, w * 0.38], [l * 0.45, w * 0.55], [-0.5, w * 0.42]];
  let s = `<path d="${curve(pts).d}" fill="url(#so-${sp}-v-${P.tone ?? "skin"})"/>`;
  const toes = P.toes ?? 4;
  let d = "";
  for (let i = 1; i < toes; i++) {
    const y = -w * 0.5 + (w * i) / toes;
    d += `M${n1(l * 0.68)},${n1(y * 0.9)}L${n1(l * 1.0)},${n1(y * 0.75)}`;
  }
  s += `<path class="so-line" d="${d}" style="stroke:var(--so-${P.tone ?? "skin"}-shade);stroke-width:${n1(w * 0.07)};opacity:.7"/>`;
  if (P.claws) {
    let c = "";
    for (let i = 0; i < P.claws; i++) {
      const y = -w * 0.38 + (w * 0.76 * i) / Math.max(1, P.claws - 1);
      const cl = P.clawLen ?? l * 0.4;
      c += `M${n1(l * 0.95)},${n1(y)}Q${n1(l * 0.95 + cl * 0.7)},${n1(y - cl * 0.05)} ${n1(l * 0.95 + cl)},${n1(y + cl * 0.35)}`;
    }
    s += `<path class="so-line" d="${c}" style="stroke:var(--so-claw);stroke-width:${n1(P.clawW ?? w * 0.13)}"/>`;
  }
  return s;
}

export function footSvg(sp, F) {
  let s = `<path d="${curve(F.pts).d}" fill="url(#so-${sp}-v-${F.tone ?? "skin"})"/>`;
  if (F.claws) s += `<path class="so-line" d="${F.claws}" style="stroke:var(--so-claw);stroke-width:${F.clawW ?? 0.5}"/>`;
  if (F.toes) s += `<path class="so-line" d="${F.toes}" style="stroke:var(--so-${F.tone ?? "skin"}-shade);stroke-width:.35;opacity:.7"/>`;
  return s;
}

export const collarSvg = (C) => (C ? `<path class="so-line" d="${C.d}" style="stroke:var(--so-role-dark);stroke-width:${n1(C.w + 0.8)}"/><path class="so-line" d="${C.d}" style="stroke:var(--so-role);stroke-width:${n1(C.w)}"/>${C.tag ? `<circle cx="${n1(C.tag[0])}" cy="${n1(C.tag[1])}" r="${n1(C.tag[2])}" style="fill:var(--so-role-dark)"/><circle cx="${n1(C.tag[0] - C.tag[2] * 0.15)}" cy="${n1(C.tag[1] - C.tag[2] * 0.15)}" r="${n1(C.tag[2] * 0.72)}" style="fill:var(--so-role)"/><circle cx="${n1(C.tag[0] - C.tag[2] * 0.35)}" cy="${n1(C.tag[1] - C.tag[2] * 0.35)}" r="${n1(C.tag[2] * 0.22)}" fill="#fff" opacity=".7"/>` : ""}` : "");
