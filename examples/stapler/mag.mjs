// The magazine: far wall, floor, rail, the head spring, the strip and its follower, the blade and the nose.
// Inlined into the page, so it uses only its arguments and model.mjs.
import { prismY, prismZ } from "./model.mjs";

export function magazine(K, P, C, S, k, t, staple, slotIn) {
  const { at, seg, Sv, Ln, Dt, tm, tc, box, rrect, circ } = t;
  const out = {};
  const tmth = k.thm;
  const m = [];
  m.push(Sv(prismY(K, P, C, tmth, [[-92, 15], [-90, 13], [83.3, 13], [83.3, 27], [-90, 27], [-92, 25]], -8, -7.2), { tone: "mid" }));
  m.push(Sv(box(tmth, -90, 81.7, 13, 13.8, -8, 8), { tone: "mid" }));
  // A count scale on the far wall: a mark every 10 staples (5 mm), a long one every 50.
  m.push(Sv(box(tmth, -36, 80, 21.2, 23.4, -7.2, -6.9), { tone: "hi" }));
  const ticks = [[], []];
  for (let i = 0; i <= 23; i++) { const x = 80 - 5 * i, big = i % 5 === 0; ticks[big ? 1 : 0].push(seg(tm([x, -6.9, 23.4]), tm([x, -6.9, 23.4 - (big ? 1.7 : 0.9)]))); }
  m.push(Ln(ticks[0].join(""), { tone: "lo" }) + Ln(ticks[1].join(""), { tone: "mid" }));
  m.push(Sv(box(tmth, -60, 81.7, 13.8, 19.3, -5.6, 5.6), { tone: "mid" }));
  m.push(Dt([[-55, 0], [-38, 0]].map(([x, y]) => at(tm([x, y, 19.3]))), { size: 0.45 }));
  // Roo's seat across the magazine: he is the head's return spring, standing here and holding the cap up.
  m.push(Sv(box(tmth, C.RX - 7, C.RX + 7, 27, 27.8, -8, 6), { tone: "mid" }) + Dt([at(tm([C.RX - 5.5, -5, 27.8])), at(tm([C.RX + 5.5, -5, 27.8]))], { size: 0.4 }));
  // Strip and follower.
  const gE = S.g * S.g * (3 - 2 * S.g);
  const front0 = S.driven ? C.XS - C.WIRE / 2 + C.WIRE * gE : C.XS + C.WIRE / 2;
  const rear = front0 - C.WIRE * S.n;
  out.follower = rear;
  m.push(Sv(box(tmth, rear - 12, rear, 14, 21.5, -6.6, 6.6), { tone: "hi" }));
  m.push(Sv(box(tmth, rear - 12, rear - 10.6, 14, 29, -5.5, 5.5), { tone: "hi" }));
  m.push(Sv(prismZ(K, P, C, tmth, circ(rear - 8, 0, 2.2), 21.5, 24.2), { tone: "hi" }));
  const grip = [];
  for (let i = 0; i < 7; i++) { const a = -0.4 + (i / 6) * 2.4; grip.push(seg(tm([rear - 8 + 2.2 * Math.cos(a), 2.2 * Math.sin(a), 21.5]), tm([rear - 8 + 2.2 * Math.cos(a), 2.2 * Math.sin(a), 24.2]))); }
  m.push(Ln(grip.join(""), { tone: "faint" }));
  const lines = [];
  for (let x = rear + C.WIRE; x < front0 - 0.01; x += C.WIRE) {
    lines.push(seg(tm([x, 6.35, 13.8]), tm([x, 6.35, C.ZS])));
    lines.push(seg(tm([x, -6.35, C.ZS]), tm([x, 6.35, C.ZS])));
  }
  m.push(Sv(box(tmth, rear, front0, 13.8, C.ZS, -6.35, 6.35), { tone: "hi", inner: Ln(lines.join(""), { tone: "faint" }) }));
  if (slotIn) m.push(staple());
  // The blade slides down the nose between the rail's end and the front plate.
  const bz = C.ZP + C.WIRE + k.b;
  m.push(Sv(box(tmth, C.XS - 0.25, C.XS + 0.25, bz, bz + 18.5, -6.35, 6.35), { tone: "hi" }));
  m.push(Dt([[-3.5], [3.5]].map(([y]) => at(tm([C.XS + 0.25, y, bz + 16.6]))), { size: 0.45 }));
  m.push(Sv(box(tmth, 82.3, 83.3, 13, 27, -8, 0), { tone: "mid" }));
  m.push(Sv(prismY(K, P, C, tmth, [[-92, 15], [-90, 13], [-60, 13], [-60, 27], [-90, 27], [-92, 25]], 7.2, 8), { tone: "mid" }));
  out.mag = m.join("");
  return out;
}
