// The run's beats, their cameras, the words under the card, and the crew's reach and point-of-work checks.
import { checkReach, checkWork } from "../../kit/reach.mjs";
import { fitView } from "../../kit/steps.mjs";
import { C, P, WIDTH, HEIGHT, at, ROO, PINCH, NIB, ROLE, snap, torque, catchForce, crossForce } from "./model.mjs";
import { poses } from "./poses.mjs";

const SN = snap(), ms = SN.ms.toFixed(0), mps = SN.v.toFixed(0);
const gf = (n) => Math.round((n / 9.81) * 1000);
const hold = gf(crossForce()), catchG = gf(catchForce()), ratio = Math.round(C.BAR.L / C.CROSS_AT);
const press = Math.max(1, Math.round(gf(0.3 * catchForce() * (13 / C.PEDAL.cup[0]))));
export const NUM = { ms, mps, hold, catchG, ratio, press, slow: 150 };

// The trap as it opens: set, Nib at home behind the skirting.
export const START = { th: C.TH_SET, w: 0, phi: C.PHI_SET, pw: 0, psi: 0, push: false, grip: 1, strain: 0, idle: 0, duty: "", lit: true, md: 0, mdT: 0, mh: 90, grab: 0, grabT: 0, hop: 0, back: 0, scare: 0, stride: 0 };
// Nib holding the cheese, the pedal tipped psi degrees; and how far the crossbar lands from Nib's nose, in mm.
const nibOn = (psi) => poses(C, { ...START, md: C.NIB.len, mdT: C.NIB.len, mh: 180, grab: 1, psi }).nib;
const nose = nibOn(C.TRIP).bite, clear = ((Math.hypot(nose[0], nose[2] - C.AX.z) - C.ARM_L - C.WIRE) / 2).toFixed(0);

const HI = "var(--anatomy-hi)";
export const STEPS = [
  { title: "Meet the crew", who: "Roo and Pinch", color: HI, text: "Two animals run this trap: Roo is its pair of springs, wound tight round the axle, and Pinch is the catch on the pedal that holds it all back.", points: null, hold: 1.6 },
  { title: "Nib comes for the cheese", who: "Nib · off duty", color: HI, text: "Nib the mouse, off duty, smells the cheese and comes out of the hole, round the back of the trap to its bait end.", points: [[-58, -90, 0], [-26, -88, 36], [132, -60, 0], [132, 8, 0], [106, 0, 46], [98, 24, 18]], least: 0.36 },
  { title: "Nib tugs the cheese", who: "Pinch · holding", color: ROLE.holding, text: `The bar's lever leaves Pinch only ${catchG} g of the springs' ${hold} g to hold, so Nib's ${press} g tug tips the pedal ${C.TRIP}°.`, points: [[34, -12, 18], [98, 24, 18], [92, 4, 64], [34, 22, 46], [114, 0, 0], [106, 0, 44]], pace: 0.6 },
  { title: "Pinch lets go", who: "Pinch · holding", color: ROLE.holding, text: `The lip slides ${(C.ENGAGE / 2).toFixed(1)} mm off the bar's tip and Pinch's claws open. Slowed ${NUM.slow} times from here.`, points: [[22, -10, 18], [62, 26, 18], [48, 6, 50], [-6, 0, 34]], least: 0.24, pace: 0.12 },
  { title: "Roo snaps it shut", who: "Roo · spring", color: ROLE.spring, text: `Roo throws the hammer over: 180° in ${ms} ms and lands at ${mps} m/s, ${clear} mm short of Nib's nose. Nib jumps back and runs home.`, points: [[-215, 0, 0], [98, 45, 0], [98, -45, 0], [0, 0, 104], [-98, -45, 18], [4, 46, 52], [116, 0, 44]], least: 0.5 },
  { title: "You pull the hammer back", who: "Roo · spring", color: ROLE.spring, text: `Half a turn winds Roo's springs up again: ${torque(C.TH_SET).toFixed(3)} N·m, ${hold} g on the hammer.`, points: [[-84, -30, 18], [24, 48, 18], [4, 40, 54], [-76, 0, 30]] },
  { title: "Pinch takes the bar", who: "Pinch · holding", color: ROLE.holding, text: "You lay the bar over the hammer and level the pedal, and Pinch closes his claws on the bar's tip under the lip. It is set.", points: [[-98, -40, 0], [98, 45, 0], [-88, 0, 150], [44, 20, 40]], hold: 1.8 },
];
export const VIEWS = STEPS.map((s) => (s.points ? fitView(s.points.map(at), [WIDTH, HEIGHT], { pad: 18, least: s.least ?? 0.3 }) : [0, 0, WIDTH, HEIGHT]));
export const TAKE_VIEW = fitView([[-215, 0, 0], [100, 46, 0], [100, -46, 0], [0, 0, 104], [-98, -46, 18], [110, 20, 40]].map(at), [WIDTH, HEIGHT], { pad: 18, least: 0.3 });


// Reach and point of work: Roo through the whole swing, Pinch on the tip while it is held and strained, Nib's
// paws and teeth on the cheese as the pedal tips.
export function crewChecks() {
  const ths = Array.from({ length: 13 }, (_, i) => C.TH_REST + ((C.TH_SET - C.TH_REST) * i) / 12);
  const pr = ths.map((th) => [`(hammer at ${((th * 180) / Math.PI).toFixed(0)}°)`, poses(C, { ...START, th }).roo]);
  const hookAt = (label) => poses(C, { ...START, th: (parseFloat(label.slice(11)) * Math.PI) / 180 }).hook;
  const pp = [0, 0.5, 1].map((s) => [`(strain ${s})`, poses(C, { ...START, strain: s }).pinch]);
  const tip = poses(C, START).tip;
  const pn = [0, C.TRIP / 2, C.TRIP].map((psi) => [`(pedal ${psi.toFixed(1)}°)`, nibOn(psi)]);
  const reach = checkReach(ROO, pr, P) + checkReach(PINCH, pp, P) + checkReach(NIB, pn, P);
  const work = checkWork(ROO, pr, P, { end: "paws", work: (l) => hookAt(l), near: 2.5 }) + checkWork(PINCH, pp, P, { end: "paws", work: tip })
    + checkWork(NIB, pn, P, { end: "bite", work: (l) => nibOn(parseFloat(l.slice(7))).bite });
  console.log(`checkReach: ${reach} warnings · checkWork: ${work} warnings`);
  return reach + work;
}

export const LABEL = `A wooden spring mousetrap on a boarded floor by a skirting board with a mouse hole, beside a carton of traps and a jar of peanut butter. Its pine base carries a U-shaped steel hammer on an axle wound with two coil springs, a hold-down bar stapled at the far end, and a tin pedal with a bait cup and a wedge of cheese. Roo the kangaroo stands on the near spring's leg with his paws on its hook over the hammer's arm: he is the springs, crouched tight while the hammer is pulled back. Pinch the crab stands by the pedal with his claws on the hold-down bar's tip, under the pedal's lip: he is the catch. Nib the mouse comes out of the hole and tugs the cheese from the trap's end, the pedal tips ${C.TRIP}°, Pinch lets go, and Roo throws the hammer over in ${ms} ms, ${clear} mm short of Nib's nose.`;
export const KEYS = [
  { mark: "lit", label: "On duty: whoever is doing the work right now" },
  { mark: "raised", label: "Roo, kangaroo, spring: the two coil springs on the axle; throws the hammer over" },
  { mark: "raised", label: "Pinch, crab, holding: the pedal's catch; holds the bar's tip until the pedal tips" },
  { mark: "raised", label: "Nib, mouse, off duty: comes for the cheese; the tug springs the trap" },
];
export const CAPTION = `A spring mousetrap is a hair trigger guarding a lot of stored energy. Pulling the hammer back winds two coil springs half a turn, to ${torque(C.TH_SET).toFixed(3)} N·m (${hold} g on the hammer). The hold-down bar pins the hammer, and because it presses near its own pivot and is held ${ratio} times farther out, the pedal's catch holds only ${catchG} g, by ${(C.ENGAGE / 2).toFixed(1)} mm. Nib's tug of about ${press} g on the cheese tips the pedal ${C.TRIP}°, the catch slips, and the hammer swings 180° in ${ms} ms, landing at ${mps} m/s, ${clear} mm short of Nib, who pulled from the trap's end. Drag the cheese down to spring it and drag the hammer back to set it, or use ↓ and ↑; Space plays on.`;
