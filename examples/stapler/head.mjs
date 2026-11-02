// The moving parts, drawn from the model each frame. Inlined into the page, so these functions use only their
// arguments, the functions in model.mjs and tools(), magazine() and cap().
import { kin, turn, prismY, notchRing, capOutline, capZ } from "./model.mjs";
import { tools } from "./tools.mjs";
import { magazine } from "./mag.mjs";
import { cap } from "./cap.mjs";

export function dynamic(K, P, C, S) {
  const k = kin(C, S), t = tools(K, P, C, k);
  const { at, Sv, Ln, Dt, tm, tc } = t;
  const out = {};
  const lit = S.duty === "";

  // The notes: twelve sheets on the anvil, draped over the base's far edge onto the desk.
  const o = S.paperO, Pp = C.PAPER;
  const x0 = Pp.x0 + o, x1 = Pp.x1 + o;
  const nx0 = Math.max(C.CUTX, x0), nx1 = Math.min(C.CUTX1, x1);
  let ring = [[x0, Pp.y0], [x1, Pp.y0], [x1, Pp.y1], [x0, Pp.y1]];
  if (nx1 > nx0 + 0.05) ring = notchRing(ring, C.CUTX, 0);
  const sheet = K.extrude(ring, C.ZA, C.ZP - C.ZA, P, { convex: false });
  const leaves = [12.2, 12.6].map((z) => K.ringSeam(ring, z, P)).join("");
  // The top sheet is ruled: lines run edge to edge, broken where the cutaway takes the corner.
  const rules = [];
  for (let y = Pp.y0 + 6; y < Pp.y1 - 2; y += 5.2) {
    if (y > 0 && nx1 > nx0 + 0.05) { rules.push(K.segment([x0, y, C.ZP], [nx0, y, C.ZP], P)); }
    else rules.push(K.segment([x0, y, C.ZP], [x1, y, C.ZP], P));
  }
  rules.push(K.segment([x0 + 9, Pp.y0, C.ZP], [x0 + 9, Pp.y1, C.ZP], P));
  out.paper = `<g class="st-paper">${Sv(sheet, { tone: "hi", lit, crease: "lo", inner: Ln(leaves, { tone: "faint" }) })}${Ln(rules.join(""), { tone: "faint" })}</g>`;

  // The staple being driven: crown, a near leg cut by the section and a far leg hidden in the notes.
  const staple = () => {
    if (!S.driven) return "";
    const d = S.dd, xs = C.XS - C.WIRE / 2 + o, w = C.WIRE;
    const top = C.ZS - d, cb = top - w, tip = C.ZS - C.LEG - d;
    const e = Math.max(0, C.ZG - tip);
    const parts = [];
    const rect = (ya, yb) => [[xs, ya], [xs + w, ya], [xs + w, yb], [xs, yb]];
    const farLow = Math.max(tip, C.ZP);
    if (cb > farLow + 0.02) parts.push(Sv(K.extrude(rect(-C.CROWN / 2, -C.CROWN / 2 + w), farLow, cb - farLow, P), { tone: "hi" }));
    parts.push(Sv(K.extrude(rect(-C.CROWN / 2, C.CROWN / 2), cb, w, P), { tone: "hi" }));
    const inCut = xs + w <= C.CUTX1 + 0.3;
    const nearLow = inCut ? Math.max(tip, C.ZG) : Math.max(tip, C.ZP);
    if (cb > nearLow + 0.02) parts.push(Sv(K.extrude(rect(C.CROWN / 2 - w, C.CROWN / 2), nearLow, cb - nearLow, P), { tone: "hi" }));
    if (inCut && e > 0.02) parts.push(Sv(K.extrude(rect(C.CROWN / 2 - w - e, C.CROWN / 2 - w), C.ZG, w, P), { tone: "hi" }));
    return parts.join("");
  };
  const slotIn = S.p > C.GAP + 0.05;
  out.stapleOut = slotIn ? "" : staple();

  // The magazine's leaf spring, riveted to the base and pressing up under the magazine's floor.
  const cz = tm([-44, 0, C.ZM])[2], lx = tm([-44, 0, C.ZM])[0];
  const q = [[-58, C.ZB], [-53, C.ZB + 0.3 * (cz - C.ZB - 0.5)], [-48, C.ZB + 0.72 * (cz - C.ZB - 0.5)], [lx, cz - 0.5]];
  let leaf = Sv(prismY(K, P, C, 0, [[-66, C.ZB], [-58, C.ZB], [-58, C.ZB + 0.5], [-66, C.ZB + 0.5]], -4, 4), { tone: "mid" });
  for (let i = 0; i < 3; i++) leaf += Sv(prismY(K, P, C, 0, [q[i], q[i + 1], [q[i + 1][0], q[i + 1][1] + 0.5], [q[i][0], q[i][1] + 0.5]], -4, 4), { tone: "mid" });
  out.leaf = leaf + Dt([at([-63.5, -2, C.ZB + 0.5]), at([-63.5, 2, C.ZB + 0.5])], { size: 0.45 });

  // The cap's far wall, seen from inside through the cutaway, with its pressed rib.
  const th = k.thc;
  const rib = [];
  for (let i = 0; i <= 12; i++) { const a = Math.PI / 2 + (i / 12) * Math.PI; rib.push([-40 + 1.1 * Math.cos(a), 33.6 + 1.1 * Math.sin(a)]); }
  for (let i = 0; i <= 12; i++) { const a = -Math.PI / 2 + (i / 12) * Math.PI; rib.push([60 + 1.1 * Math.cos(a), 33.6 + 1.1 * Math.sin(a)]); }
  const ribD = K.pathOf(rib.map(([x, z]) => at(tc([x, -10.2, z]))), true);
  out.capBack = Sv(prismY(K, P, C, th, capOutline(), -11, -10.2), { tone: "mid", inner: Ln(ribD, { tone: "faint" }) }) +
    Dt([[-62, 37], [-42, 37], [70, 31]].map(([x, z]) => at(tc([x, -10.2, z]))), { size: 0.45 });
  const { mag, follower } = magazine(K, P, C, S, k, t, staple, slotIn);
  out.mag = mag;
  out.follower = follower;
  out.capFront = cap(K, P, C, k, t);
  out.k = k;
  return out;
}

// Where the crew stand and what their paws hold, from the same state.
export function poses(C, S, D) {
  const k = D.k;
  const padZ = capZ(32) + 1.0;
  const roo = {
    at: turn(C, k.thc, [32, 1.5, padZ]),
    heading: 118,
    stance: "up",
    lean: S.pressing ? 12 : 3,
    look: [0, S.pressing ? -14 : 4],
    squash: S.pressing ? 0.36 : 0.04,
    hop: S.hop || 0,
    eyes: S.pressing ? "open" : S.hop > 0.4 ? "wide" : S.driven && S.p < 0.05 ? "happy" : "open",
  };
  // Pip stands on the rail behind the follower, where the feed spring would be, and leans on its push plate.
  const r = D.follower - 12, ext = k.thm / Math.asin(C.GAP / C.ARM);
  const pip = {
    at: turn(C, k.thm, [r - 7.5, 0, 19.3]),
    heading: 20,
    stance: "up",
    lean: 30 + (S.duty === "pip" ? 3 : 0),
    look: [0, -4 + 4 * ext],
    paws: { l: turn(C, k.thm, [r, 1.2, 28]), r: turn(C, k.thm, [r, 2, 25.5]) },
    eyes: S.duty === "pip" ? "open" : S.driven && S.g >= 1 ? "happy" : "open",
  };
  return { roo, pip };
}
