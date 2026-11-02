import { len, strands } from "./draw.mjs";
import { inner } from "./svg.mjs";

// ---------- the cast
// The crew, drawn facing left, standing on y = 0, about 100 units tall (y down).
// Each species has `up` (sitting or standing, paws free) and `four` (on all fours, in profile).
export const sh = (pts, dx, dy) => pts.map(([x, y, c]) => (c ? [x + dx, y + dy, c] : [x + dx, y + dy]));
export const shd = (d, dx, dy) => d.replace(/(-?[\d.]+),(-?[\d.]+)/g, (_, x, y) => `${+(+x + dx).toFixed(2)},${+(+y + dy).toFixed(2)}`);
// A hind foot pointing left: heel at x = heel, toes at x = -l.
export const footPts = (l, w, heel = 2.5) => [[heel, 0.4], [heel * 0.8, -w * 0.8], [-l * 0.3, -w], [-l * 0.78, -w * 0.82], [-l, -w * 0.38], [-l * 0.92, w * 0.18], [-l * 0.3, w * 0.25]];
export const toeClaws = (l, w, n, cl) => Array.from({ length: n }, (_, i) => { const y = -w * 0.62 + (w * 0.7 * i) / Math.max(1, n - 1); return `M${-l * 0.96},${y.toFixed(2)}Q${(-l - cl * 0.6).toFixed(2)},${(y - cl * 0.05).toFixed(2)} ${(-l - cl).toFixed(2)},${(y + cl * 0.4).toFixed(2)}`; }).join("");
export const toeLines = (l, w) => `M${-l * 0.95},${(-w * 0.5).toFixed(2)}L${(-l * 0.72).toFixed(2)},${(-w * 0.55).toFixed(2)}M${-l * 0.97},${(-w * 0.1).toFixed(2)}L${(-l * 0.72).toFixed(2)},${(-w * 0.2).toFixed(2)}`;
export const leg = (hip, l1, l2, w, bend, x, foot, offset, far = false, tone) => ({ hip, l1, l2, w, bend, foot: { x, ...foot }, offset, far, tone });

export const HAMSTER_HEAD_UP = {
  pivot: [-8, -56],
  pts: [[-38, -62], [-37, -68], [-33, -76], [-24, -83], [-12, -86], [0, -84], [9, -77], [12, -67], [8, -58], [-2, -52], [-14, -49], [-26, -51], [-34, -55]],
  strands: 45, flow: [1, 0.25], tuft: 1.4,
  marks: [
    { pts: [[-36.5, -60], [-34, -67], [-26, -69], [-16, -64], [-11, -55], [-19, -50.5], [-29, -52]], tone: "belly" },
    { pts: [[-9, -63], [-2, -68], [5, -63], [3, -55], [-5, -53]], tone: "dark", op: 0.5 },
    { pts: [[-30, -79], [-20, -84], [-8, -83], [-14, -77], [-24, -75]], tone: "dark", op: 0.35 },
  ],
  eye: { at: [-22, -71.5], rx: 4.3, ry: 4.8, rot: -12 },
  nose: [[-39.6, -63.6], [-37.4, -66.2], [-34.8, -64.6], [-36.6, -61.6]],
  mouth: "M-37.4,-61.4Q-36.6,-58.6 -33.6,-58",
  whiskers: { at: [-33.5, -62], n: 7, from: 150, to: 212, len: 19 },
  ears: {
    near: { pts: [[-4, -83], [-4, -91], [1, -96.5], [8, -95], [11, -88], [7, -81]], inner: [[-1, -84.5], [-0.5, -90.5], [3, -94], [7.5, -91.5], [8, -86], [5, -83]] },
    far: { pts: [[-21, -84], [-21, -90], [-16, -94], [-10, -91], [-9, -85]], inner: [[-19, -86], [-18.5, -89.5], [-15, -91.5], [-11.5, -89], [-11.5, -86]] },
  },
};

export const SLOTH_HEAD = {
  pivot: [-6, -60],
  pts: [[-32, -70], [-31, -77], [-26, -84], [-16, -89], [-4, -89], [6, -84], [10, -75], [8, -66], [0, -60], [-12, -58], [-24, -60], [-30, -64]],
  strands: 40, flow: [0.6, 1], tuft: 2.6,
  marks: [
    { pts: [[-26, -84], [-14, -90], [-1, -88], [-5, -82], [-17, -81]], tone: "dark", op: 0.45 },
    { pts: [[-31.5, -68], [-31, -77], [-25, -83], [-15, -84], [-8.5, -78], [-8, -68], [-14, -62], [-24, -61.5]], tone: "mark", soft: false },
    { pts: [[-28, -76], [-21, -79.5], [-11, -78], [-3, -74.5], [-7, -71], [-18, -71.5], [-26, -72.5]], tone: "dark" },
  ],
  eye: { at: [-20, -75.2], rx: 2.3, ry: 2.5, rot: -8 },
  nose: [[-33.4, -69.4], [-31.6, -72.4], [-28.2, -71.8], [-28.6, -68.4], [-31, -67.2]],
  mouth: "M-31.6,-66.4Q-26,-62.8 -18.6,-65.2",
};
