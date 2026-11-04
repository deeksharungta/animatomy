// The parts that move, drawn from the model's state, and the crew's poses. Both functions are serialized into
// the page too, so they use only the K, P, C and S objects passed in.
export function dynamic(K, P, C, S) {
  const at = (p) => K.iso(p, P), Z = C.ZC, u = S.u, out = {};
  const ng = (r, n) => Array.from({ length: n }, (_, i) => [r * Math.cos(((i + 0.5) / n) * Math.PI * 2), r * Math.sin(((i + 0.5) / n) * Math.PI * 2)]);
  const rodX = (x0, x1, r, n) => K.prismOf(K.frameOf([x0, 0, Z], [1, 0, 0], [0, 0, 1], [0, 1, 0]), ng(r, n), 0, x1 - x0, P);
  // The coil spring from the stop's back face to the collar's front face, split into its back and front halves.
  const a = C.BULK.x0, b = C.COLLAR.x1 + u, back = [], front = [], V = [0.433, 0.75, 0.5];
  let run = [], near = null;
  const n = 120, turns = 7, R = 2.4;
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * turns * Math.PI * 2, p = [a + (b - a) * (i / n), R * Math.cos(t), Z + R * Math.sin(t)];
    const facing = Math.cos(t) * V[1] + Math.sin(t) * V[2] > 0;
    if (near === null) near = facing;
    if (facing !== near) { run.push(at(p)); (near ? front : back).push(K.pathOf(run)); run = [at(p)]; near = facing; continue; }
    run.push(at(p));
  }
  if (run.length > 1) (near ? front : back).push(K.pathOf(run));
  out.springBack = K.lineSvg(back.join(""), { tone: "lo" });
  out.springFront = K.lineSvg(front.join(""), { tone: "hi" });
  // The stub of rod between the stop's front face and the magnet's cup, which shortens as the rod goes back.
  const len = C.CUP.x0 + u - C.BULK.x1;
  out.stub = len > 0.05 ? K.solidSvg(rodX(C.BULK.x1, C.CUP.x0 + u, C.ROD.r, 14), { tone: "hi" }) : "";
  // The power strip's rocker on its top face: its near end pressed down when off, its far end when on.
  const W = C.SOCKET, T = W.z + 10.8, on = S.rocker, x0 = W.x + 34, x1 = W.x + 41;
  const zNear = T + 0.6 + 1.6 * (1 - on), zFar = T + 0.6 + 1.6 * on, zMid = T + 1.4;
  const quad = (y0, y1, z0, z1) => K.pathOf([[x0, y0, z0], [x1, y0, z0], [x1, y1, z1], [x0, y1, z1]].map(at), true);
  const plate = (d, tone, lit) => K.solidSvg({ fill: d, outline: d, crease: "", top: d, shades: ["", "", "", ""] }, { tone, crease: "none", lit });
  out.rocker = plate(quad(W.y + 4, W.y + 8, zFar, zMid), "mid", S.duty === "" && on > 0.5) + plate(quad(W.y + 8, W.y + 12, zMid, zNear), "mid", false) +
    K.dotsSvg([at([(x0 + x1) / 2, W.y + 10, (zMid + zNear) / 2])], { size: 0.55, tone: on > 0.5 ? "lo" : "faint" });
  return out;
}

export function poses(C, S) {
  const Z = C.ZC, u = S.u, top = C.BOARD.z + C.BOARD.h, comp = (u + C.TRAVEL) / C.TRAVEL;
  // Roo is the spring: feet fixed on the board, paws on the collar's lug. Crouched and squashed while Ember
  // holds the rod in, stretched out after the collar as he snaps it back.
  const fx = C.COLLAR.x1 + u + 0.2;
  const roo = {
    at: [C.ROO_AT[0], C.ROO_AT[1], top],
    heading: C.ROO_AT[2],
    lean: 24 - 16 * comp,
    look: [0, 6],
    paws: { l: [fx, 7.4, Z - 2.6], r: [fx, 7.4, Z - 4.6] },
    squash: 0.34 * comp - 0.06,
    eyes: S.rodV < -0.6 ? "wide" : S.power ? "open" : "happy",
  };
  // Ember is the heat's control: paws on the contact bridge's back face, pressing it onto the contacts so the
  // current reaches the coil. Leaning in while they are shut, pushed back upright when Roo overpowers her.
  const bx = C.BRIDGE.x0 + u - 0.2;
  const ember = {
    at: [C.EMBER_AT[0], C.EMBER_AT[1], top],
    heading: C.EMBER_AT[2],
    lean: 5 + 15 * comp,
    look: [0, 4],
    paws: { l: [bx, 4.5, Z - 1.6], r: [bx, 3.4, Z - 3.5] },
    squash: 0.14 * (1 - comp),
    eyes: S.rodV < -0.6 ? "wide" : !S.power ? "shut" : "open",
  };
  const top6 = top + 1.1;
  const volta = {
    path: [[-35, 4.2, top6], [-37.5, 6.8, top6], [-44, 6.8, top6], [-53.4, 6.8, top6], [-53.4, 6.8, top + 6.4], [-55.4, 5, top + 6.6]],
    charge: S.cur > 0.05 ? S.cur : 0,
    flicker: S.t * 14,
    target: S.cur > 0.3 ? [C.CONTACT_X - 0.1, C.CONTACTS[1], Z - 2.4] : undefined,
    eyes: S.power ? "open" : "shut",
  };
  return { roo, ember, volta };
}
