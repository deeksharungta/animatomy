import * as k from "../../kit/iso-kit.mjs";
import * as L from "../../kit/lathe.mjs";
import { C, P, at, S, Ln, D, rod, faceY } from "./model.mjs";

// The chapter ring, standing on three feet off the front pillars' plane, with its hour bars, minute track and
// half-hour marks; and the hour pipe on the centre arbor that carries the hands.
export function dial() {
  const R = C.DIAL, Ce = C.CENTER, F = faceY(Ce.x, R.y, Ce.z), out = [];
  for (const a of [0.5, 2.64, 4.3]) out.push(S(rod([Ce.x + 8.1 * Math.cos(a), C.FRONT_Y, Ce.z + 8.1 * Math.sin(a)], [0, 1, 0], 0.45, 0, R.y - C.FRONT_Y, 8), { tone: "mid" }));
  out.push(S(rod([Ce.x, -15.4, Ce.z], [0, 1, 0], 1, 0, 2.8, 14), { tone: "hi" }));
  out.push(S(L.ringBand(0, 0.6, R.r0, R.r1, F, P, { hole: [0.6, R.r0] }), { tone: "hi", crease: "lo" }));
  const y = R.y + 0.62, P3 = (r, a) => [Ce.x + r * Math.cos(a), y, Ce.z + r * Math.sin(a)];
  const circle = (r) => k.pathOf(Array.from({ length: 72 }, (_, i) => at(P3(r, (i / 72) * Math.PI * 2))), true);
  const ticks = [], hours = [], halves = [];
  for (let i = 0; i < 60; i++) {
    const a = Math.PI / 2 - (i / 60) * Math.PI * 2;
    if (i % 5) ticks.push(k.segment(P3(R.r1 - 0.9, a), P3(R.r1 - 0.25, a), P));
    else hours.push(k.segment(P3(R.r0 + 0.35, a), P3(R.r1 - 0.9, a), P), k.segment(P3(R.r0 + 0.35, a + 0.03), P3(R.r1 - 0.9, a + 0.03), P));
  }
  for (let i = 0; i < 12; i++) halves.push(at(P3(R.r1 - 1.3, Math.PI / 2 - ((i + 0.5) / 12) * Math.PI * 2)));
  out.push(Ln(circle(R.r1 - 0.9) + circle(R.r1 - 0.25) + circle(R.r0 + 0.35), { tone: "faint" }));
  out.push(Ln(ticks.join(""), { tone: "lo" }) + Ln(hours.join(""), { tone: "hi" }) + D(halves, { size: 0.45, tone: "mid" }));
  return out.join("");
}
