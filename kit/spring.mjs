import { iso, depthOf, pathOf } from "./iso-kit.mjs";

// A coil spring between any two world points (an upright spring, one on a tilted arm), split into the half behind
// its axis and the half in front, like iso-kit's coil() (which runs along x or y only). Draw `back` before the rod
// or part it wraps and `front` after; `ends` are the two wire ends, for dots.
export function springAlong(a, b, radius, turns, P, perTurn = 16) {
  const axis = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], length = Math.hypot(...axis) || 1, u = axis.map((v) => v / length);
  // Any direction not along the axis gives the two vectors across it.
  const ref = Math.abs(u[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
  const cross = (p, q) => [p[1] * q[2] - p[2] * q[1], p[2] * q[0] - p[0] * q[2], p[0] * q[1] - p[1] * q[0]];
  const c1 = cross(u, ref), n1 = Math.hypot(...c1), e1 = c1.map((v) => v / n1), e2 = cross(u, e1);
  const count = Math.max(1, Math.round(turns * perTurn));
  const back = [], front = [], ends = [];
  let run = [], near = null;
  for (let i = 0; i <= count; i++) {
    const t = i / count, angle = t * turns * Math.PI * 2;
    const off = e1.map((v, k) => v * Math.cos(angle) + e2[k] * Math.sin(angle));
    const flat = iso(a.map((v, k) => v + axis[k] * t + radius * off[k]), P);
    if (i === 0 || i === count) ends.push(flat);
    const facing = depthOf(off, P) > 0;
    if (near === null) near = facing;
    if (facing !== near) { run.push(flat); (near ? front : back).push(pathOf(run)); run = [flat]; near = facing; continue; }
    run.push(flat);
  }
  if (run.length > 1) (near ? front : back).push(pathOf(run));
  return { back: back.join(""), front: front.join(""), ends };
}
