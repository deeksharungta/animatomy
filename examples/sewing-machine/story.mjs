// The run's beats, their cameras, the words under the card, and the crew's reach and point-of-work checks.
import { checkReach, checkWork } from "../../kit/reach.mjs";
import { fitView } from "../../kit/steps.mjs";
import { C, P, WIDTH, HEIGHT, at, kin, KNOCK, PINCH, MO, BUN, MOCHI, ROLE } from "./model.mjs";
import { poses } from "./poses.mjs";

const HI = "var(--anatomy-hi)", N = C.NEEDLE;
const rise = ((N.stroke * (1 - Math.cos(C.CATCH - Math.PI))) / 2).toFixed(1), carry = Math.round(((C.RELEASE - C.CATCH) * 360) / Math.PI);
export const STEPS = [
  { title: "Meet the crew", who: "Bun, Mochi, Knock, Pinch and Mo", color: HI, text: "Five animals run this sewing machine: Bun and Mochi are its motor, Knock the needle bar, Pinch the hook under the plate and Mo the feed dog.", points: null, hold: 1.6 },
  { title: "Bun and Mochi start the motor", who: "Bun and Mochi · power", color: ROLE.power, text: `You press the pedal and the hamsters run. Their belt turns the arm shaft twice for each turn of the wheel: one shaft turn, one stitch, ${C.SPM} a minute.`, points: [[-152, -42, 84], [-120, 22, 84], [-152, -42, 150], [-120, 22, 150], [-156, -10, 236]], least: 0.3, pace: 0.1 },
  { title: "Knock drives the needle down", who: "Knock · moving", color: ROLE.moving, text: `Knock is the needle bar. He brings the needle down ${N.stroke} mm, through both layers of denim, its eye and the thread below the plate. Slowed 25 times.`, points: [[88, -10, 58], [114, 18, 58], [100, 0, 128], [100, 14, 40]], pace: 0.04 },
  { title: "Pinch takes the loop", who: "Pinch · holding", color: ROLE.holding, text: `Rising ${rise} mm, the needle leaves its thread behind in a loop. Pinch is the hook: his claw passes the needle and takes it.`, points: [[72, -6, 38], [112, 26, 38], [100, 10, 64], [78, 24, 58]], least: 0.2, pace: 0.02 },
  { title: "Pinch carries it round the bobbin", who: "Pinch · holding", color: ROLE.holding, text: `He runs the loop round the bobbin case, ${carry}° in all, so the bobbin's thread passes through it. The take-up lever gives thread as the loop grows.`, points: [[60, -14, 38], [112, 30, 38], [84, -18, 56], [106, 26, 62]], least: 0.22, pace: 0.021 },
  { title: "Mo feeds the cloth one stitch", who: "Mo · moving", color: ROLE.moving, text: `The loop slips off the case and the take-up lever pulls the knot up between the layers. Mo's claws rise through the slot and draw the cloth back ${C.SL} mm.`, points: [[106, 4, 36], [128, 24, 36], [104, 4, 64], [126, 20, 62]], least: 0.18, pace: 0.04 },
  { title: "Stitch after stitch", who: "Knock · moving", color: ROLE.moving, text: `At full speed it all turns at once, ${C.SPM} stitches a minute, half speed here. Each turn of the shaft lays one more ${C.SL} mm stitch in the seam.`, points: [[40, -76, 58], [150, 40, 58], [104, 0, 150], [124, 34, 230]], least: 0.4, pace: 0.6 },
  { title: "You let go of the pedal", who: "Bun and Mochi · power", color: ROLE.power, text: "The hamsters slow and stop, and the shaft comes to rest with the needle up, Knock on his top perch. The seam is done.", points: [[-158, -42, 80], [-112, 24, 80], [-158, -42, 160], [-112, 24, 160], [-96, 24, 60]], least: 0.32, pace: 0.4, hold: 2 },
];
export const FOCUS = ["", "squad", "knock", "pinch", "pinch", "mo", "knock", "squad"];
export const VIEWS = STEPS.map((s) => (s.points ? fitView(s.points.map(at), [WIDTH, HEIGHT], { pad: 18, least: s.least ?? 0.3 }) : [0, 0, WIDTH, HEIGHT]));

// Reach and point of work through a whole stitch for Knock, Pinch and Mo, and the hamsters' feet on the rungs.
const base = { th: 0, omega: 1, wheel: 0, t: 0.3, idle: 0 };
const TAU = Math.PI * 2;
export function crewChecks() {
  const ths = Array.from({ length: 36 }, (_, i) => (i / 36) * TAU);
  const q = (th) => poses(C, { ...base, th, wheel: -th / 2 }, kin);
  const deg = (th) => `(shaft at ${Math.round((th * 180) / Math.PI)}°)`;
  const thOf = (l) => (parseFloat(l.slice(10)) * Math.PI) / 180;
  const kn = ths.map((th) => [deg(th), q(th).knock]);
  const pi = ths.map((th) => [deg(th), q(th).pinch]);
  const carrying = ths.filter((th) => ((th - C.CATCH + TAU) % TAU) <= C.RELEASE - C.CATCH).map((th) => [deg(th), q(th).pinch]);
  const mo = ths.map((th) => [deg(th), q(th).mo]);
  const feeding = ths.filter((th) => kin(C, th).lift > 0.5).map((th) => [deg(th), q(th).mo]);
  const rung = (p) => [p.at[0], C.WHEEL.y + (p.at[1] - C.WHEEL.y) * (C.WHEEL.r / (C.WHEEL.r - 1.4)), C.WHEEL.z + (p.at[2] - C.WHEEL.z) * (C.WHEEL.r / (C.WHEEL.r - 1.4))];
  const ham = [0, 0.7, 2.1].map((w) => poses(C, { ...base, wheel: w }, kin));
  const reach = checkReach(KNOCK, kn, P) + checkReach(PINCH, pi, P) + checkReach(MO, mo, P);
  const work = checkWork(KNOCK, kn, P, { end: "beak", work: (l) => q(thOf(l)).knock.beak }) +
    checkWork(PINCH, carrying, P, { end: "paws", work: (l) => q(thOf(l)).hook }) +
    checkWork(MO, feeding, P, { end: "paws", work: (l) => q(thOf(l)).dog }) +
    checkWork(BUN, ham.map((p, i) => [`(frame ${i})`, p.bun]), P, { end: "feet", work: (l, p) => rung(p) }) +
    checkWork(MOCHI, ham.map((p, i) => [`(frame ${i})`, p.mochi]), P, { end: "feet", work: (l, p) => rung(p) });
  console.log(`checkReach: ${reach} warnings · checkWork: ${work} warnings`);
  return reach + work;
}

export const LABEL = "A lockstitch sewing machine on a sewing table, its covers off so the mechanism shows, sewing two layers of blue denim with mustard thread. The bed is cut open at the front right, through the needle, so the hook pit under the throat plate shows. Two hamsters run a wheel inside the pillar; its belt turns the arm shaft, whose crank works the take-up lever in the head. Knock the woodpecker is the needle bar: he flies up and down between two perches on the presser bar with the needle's clamp in his beak, driving it through the cloth. Under the plate Pinch the crab is the hook: he walks round the bobbin case, two laps a stitch, his claw taking the needle thread's loop and carrying it round the bobbin. Mo the sloth hangs from the feed slot by his claws and is the feed dog, drawing the cloth back one stitch at a time. Spools, a pin cushion, a tape measure, shears and the head's face plate lie about the room.";
export const KEYS = [
  { mark: "lit", label: "On duty: whoever is doing the work right now" },
  { mark: "raised", label: "Bun and Mochi, hamsters, power: the motor, running the wheel whose belt turns the shaft" },
  { mark: "raised", label: "Knock, woodpecker, moving: the needle bar, the needle's clamp in his beak" },
  { mark: "raised", label: "Pinch, crab, holding: the hook, his claw takes the loop round the bobbin" },
  { mark: "raised", label: "Mo, sloth, moving: the feed dog, his claws draw the cloth back a stitch" },
];
export const CAPTION = `A lockstitch sewing machine, one stitch at a time. Each turn of the arm shaft drives the needle ${N.stroke} mm down through the cloth. Rising ${rise} mm from the bottom, the needle leaves a loop of top thread, which the hook's point takes and carries ${carry}° round the bobbin case (the hook is geared to turn twice a stitch), so the bobbin thread passes through the loop. The take-up lever then pulls the loop up off the case and draws the knot into the cloth between its layers, and with the needle out of the cloth the feed dog rises through the throat plate and draws the cloth back one ${C.SL} mm stitch. At ${C.SPM} stitches a minute a stitch takes ${(60 / C.SPM).toFixed(2)} s.`;
