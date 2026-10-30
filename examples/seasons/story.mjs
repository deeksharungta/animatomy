import { critter, critterSvg } from "../../kit/critters.mjs";
import { fitView } from "../../kit/steps.mjs";
import { WIDTH, HEIGHT, C, M, K, P, at } from "./model.mjs";
import { REST, dynamic, poses } from "./moving.mjs";

// ---------------------------------------------------------------- the crew

export const VOLTA = { species: "eel", name: "Volta", size: 34, role: "power" };
export const PIP = { species: "squirrel", name: "Pip", size: 14, role: "moving" };
export const MO = { species: "sloth", name: "Mo", size: 12, role: "sensing", wear: ["glasses"] };
export const crew = (spec, pose, part) => critterSvg(critter(spec, pose, P), { part });

// Reach check: Pip on the handle and Mo on the crank, round the whole year and the whole day.
for (let day = 1; day <= 365; day += 13) {
  for (const spin of [0, 1.6, 3.2, 4.8]) {
    const st = { ...REST, day, spin, lamp: 1, walk: spin > 2 };
    const d = dynamic(K, P, C, M, st);
    const p = poses(C, M, st, d);
    for (const [name, spec, pose] of [["Pip", PIP, p.pip], ["Mo", MO, p.mo]]) {
      const c = critter(spec, pose, P);
      for (const [paw, short] of Object.entries(c.reach)) if (short > 0.3) console.warn(`${name}'s ${paw} paw is ${short.toFixed(1)} short on day ${day}, spin ${spin}`);
    }
  }
}
// The numbers the figure shows, checked against the real sky.
{
  const lon = C.LONDON[0];
  const show = (day) => { const dec = M.decl(day); return `${M.date(day)}: Sun over ${dec.toFixed(1)}°, London day ${M.dayLength(lon, dec).toFixed(2)} h, noon Sun ${M.noonSun(lon, dec).toFixed(1)}°, ${M.distance(day).toFixed(1)} million km`; };
  for (const d of [79, 172, 266, 355, 3]) console.log(show(d));
}

// ---------------------------------------------------------------- the run

const ROLE = { sensing: "#3E9BDB", moving: "#46A758", power: "#F5C518" };
const views = (pts) => fitView(pts.map(at), [WIDTH, HEIGHT], { pad: 18, least: 0.4 });
const box = (c, r, h = r) => [[c[0], c[1], c[2] + h], [c[0], c[1], c[2] - h], [c[0] + r, c[1] - r, c[2]], [c[0] - r, c[1] + r, c[2]]];
const globeBox = (day, extra = []) => [...box(M.centre(day), 16, 20), ...extra];
// A season is read off the globe and the lamp together, and Pip, who brought the arm there, stays in view.
const pipAt = (day) => { const st = { ...REST, day }, q = poses(C, M, st, dynamic(K, P, C, M, st)).pip.at; return [q, [q[0], q[1], q[2] + PIP.size]]; };
const seasonBox = (day) => globeBox(day, [...box(C.LAMP, 9), ...pipAt(day)]);
export const STEPS = [
  { title: "Meet the crew", who: "Volta, Pip and Mo", color: "var(--anatomy-hi)", text: "Three animals run this tellurion: Volta lights the lamp, Pip walks the year arm round, and Mo turns the globe.", to: 79, points: null, hold: 1.6 },
  { title: "Volta lights the Sun", who: "Volta · power", color: ROLE.power, text: "Volta's current runs up the pillar into the lamp. Its light falls on one half of the globe; the other half is in night.", to: 79, points: [[-6, -6, 14], [40, 4, 14], ...box(C.LAMP, 9), ...globeBox(79)] },
  { title: "Pip walks the year", who: "Pip · moving", color: ROLE.moving, text: "One lap of the arm is one year. As it swings, five gears turn the globe's mount back by the same angle, so the axis keeps pointing the same way.", to: 132, points: [...box(C.LAMP, 9), ...globeBox(132), [62, 0, 14], [0, 62, 14]] },
  { title: "June: the north leans in", who: "Pip · moving", color: ROLE.moving, text: "The axis tips 23.4° toward the lamp. The Sun stands overhead at 23.4° north, and the Arctic stays lit all day.", to: 172, points: seasonBox(172) },
  { title: "Mo turns the days", who: "Mo · sensing", color: ROLE.sensing, text: "Each turn of Mo's crank is one day. London spends most of the turn in the light: 16 hours 38 minutes, with the Sun 62° high at noon.", to: 175, points: globeBox(175, [[M.centre(175)[0], M.centre(175)[1], 34]]) },
  { title: "September: neither leans in", who: "Pip · moving", color: ROLE.moving, text: "The axis now points sideways to the lamp, so the light reaches from pole to pole: day and night are about 12 hours each, everywhere.", to: 266, points: seasonBox(266) },
  { title: "December: the north leans away", who: "Pip · moving", color: ROLE.moving, text: "The same tilt now points the north away. London gets 7 hours 50 minutes of daylight, the Sun only 15° high.", to: 355, points: seasonBox(355) },
  { title: "It isn't the distance", who: "Pip · moving", color: ROLE.moving, text: "Earth is closest to the Sun in early January, 147 million km, and farthest in July, 152 million. It's winter in the north all the same: the tilt makes the seasons.", to: 368, points: seasonBox(368) },
  { title: "Back to spring", who: "everyone", color: "var(--anatomy-hi)", text: "Pip brings the year round to March. Day and night are about equal again, and the cycle starts over.", to: 444, points: null, hold: 2 },
];
// The readout: the date and London's day, from the Sun's height over the equator that the machine gives.
export function readoutOf(C, M, day) {
  const dec = M.decl(day), lat = C.LONDON[0], m = Math.round(M.dayLength(lat, dec) * 60);
  return M.date(day) + " · London: day " + Math.floor(m / 60) + " h " + String(m % 60).padStart(2, "0") + " m, noon Sun " + Math.round(M.noonSun(lat, dec)) + "°";
}
export const VIEWS = STEPS.map((s) => (s.points ? views(s.points) : [0, 0, WIDTH, HEIGHT]));
