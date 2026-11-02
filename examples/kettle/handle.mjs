import * as k from "../../kit/iso-kit.mjs";
import { C, P, at, S, Ln, D, seg, inCut, rounded, pin, pipe } from "./model.mjs";
import { cutSolid } from "./cutsolid.mjs";

// The handle side: the controller housing under the handle and the spine the steam tube climbs, as one
// moulding cut open; the handle loop; and the parts fixed inside the housing (the disc's cup, the
// steam tube, the contacts' blocks, the bar's pivot post).
export function housing() {
  const outer = [[-84, 12], [-82, 10], [-53, 10], [-53, 146], [-62, 146], [-62, 64], [-82, 64], [-84, 62]];
  const hole = [[-81, 13], [-55.5, 13], [-55.5, 143.5], [-59.5, 143.5], [-59.5, 61.5], [-81, 61.5]];
  const out = [S(cutSolid(outer, [hole], -7, 0), { tone: "mid" })];
  // Vent slots in the housing's outer wall, and screws where it meets the skirt.
  out.push(D([[-82.5, 0, 15], [-82.5, 0, 58], [-54.25, 0, 15], [-54.25, 0, 70], [-54.25, 0, 140], [-60.75, 0, 70], [-60.75, 0, 140]].map(at), { size: 0.5, tone: "lo" }));
  return out.join("");
}

export function handleLoop() {
  const outer = [[-62, 76], [-62, 88], [-88, 88], [-88, 134], [-62, 134], [-62, 146], [-94, 146], [-96, 145.5], [-97.5, 144], [-98, 142], [-98, 80], [-97.5, 78], [-96, 76.5], [-94, 76]];
  const out = [S(cutSolid(outer, [], -6, 0), { tone: "hi" })];
  // Finger ribs across the grip's cut face, edge to edge.
  out.push(Ln([96, 104, 112, 120].map((z) => seg([-98, 0, z], [-88, 0, z])).join(""), { tone: "faint" }));
  // Screws holding the two handle mouldings together.
  out.push(D([[-80, 0, 82], [-80, 0, 140], [-93, 0, 82], [-93, 0, 140]].map(at), { size: 0.55, tone: "lo" }));
  // The lid release button on top of the handle.
  out.push(S(inCut(rounded(-74, -66, 146, 148.6, 1.2, 3), -4.5, -1.5), { tone: "hi" }));
  return out.join("");
}

// The steam tube runs from a port high in the wall, down the spine, into the cup over Mo's disc.
export const STEAM_ROUTE = [[-50.6, -3, 134], [-57.5, -3, 128], [-57.5, -3, 57.6], [-61, -3, 57.6]];
export function insides() {
  const d = C.DISC, out = [];
  out.push(pipe(STEAM_ROUTE, 1.3, { tone: "hi", bend: 3 }));
  // The disc's cup: the bimetal disc sits under it, the steam fills it.
  out.push(S(inCut([[d.u - 5.6, d.z + 0.8], [d.u + 5.6, d.z + 0.8], [d.u + 5, d.z + 3.6], [d.u - 5, d.z + 3.6]], -5.5, -0.6), { tone: "mid" }));
  out.push(D([at([d.u - 4, -0.6, d.z + 2.2]), at([d.u + 4, -0.6, d.z + 2.2])], { size: 0.45, tone: "lo" }));
  // The trip bar's pivot post, hung from the ceiling.
  out.push(S(inCut([[-59.5, C.BAR.pivot[1] - 1.5], [-56.8, C.BAR.pivot[1] - 1.5], [-56.8, 61.5], [-59.5, 61.5]], -5, -1), { tone: "mid" }));
  out.push(S(pin(C.BAR.pivot[0], C.BAR.pivot[1], 0.9, -5, 0.2), { tone: "hi" }));
  // The switch contacts: the leaf's anchor block (its terminal is where Volta's wire lands) and the fixed contact.
  out.push(S(inCut(rounded(-62, -58, 12, 19.5, 0.6, 2), -5, -1), { tone: "mid" }));
  out.push(S(inCut(rounded(-79.5, -74.5, 21.4, 24.6, 0.6, 2), -5, -1), { tone: "mid" }));
  out.push(D([at([-77, -1, 21.4])], { size: 0.7, tone: "hi" }));
  // The toggle spring's anchor post on the housing floor.
  out.push(S(inCut([[-81, 13], [-78.6, 13], [-78.6, 27], [-81, 27]], -4.5, -1.5), { tone: "mid" }));
  // The boil-dry contacts' anchor and fixed contact, under the plate.
  out.push(S(inCut(rounded(-52, -48, 12, 21, 0.6, 2), -5, -1), { tone: "mid" }));
  out.push(S(inCut(rounded(-47.5, -44.5, 21.5, 26.2, 0.6, 2), -5, -1), { tone: "mid" }));
  // A cable clamp on the skirt floor, which Crumb stands on.
  out.push(S(inCut(rounded(-33, -24, 12, 17, 0.8, 2), -6, -0.5), { tone: "mid" }));
  // The boil-dry disc, pressed against the plate's underside.
  out.push(S(inCut(rounded(-46.5, -35.5, 26.2, 29, 0.8, 2), -8, -1), { tone: "hi" }));
  out.push(D([at([-45, -1, 27.6]), at([-37, -1, 27.6])], { size: 0.45, tone: "lo" }));
  return out.join("");
}

// Wires: the switch's fixed contact to the boil-dry anchor, the boil-dry fixed contact to the element's terminal.
export function wires() {
  const w = (from, to, via) => k.wireSvg(at(from), at(to), { via: via.map(at), tone: "lo", size: 0.8 });
  return w([-77, -1, 24.6], [-50, -1, 21], [[-77, -1, 27], [-54, -1, 27], [-54, -1, 23], [-50, -1, 23]]) +
    w([-46, -1, 26.2], [-44, -12, 20], [[-46, -1, 27.5], [-49, -6, 27.5], [-49, -12, 20]]);
}
