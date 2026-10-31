import { critter } from "../../kit/critters.mjs";
import { fitView } from "../../kit/steps.mjs";
import { WIDTH, HEIGHT, C, P, at, OLLIE, EMBER, CRUMB, ROLE } from "./model.mjs";
import { poses } from "./moving.mjs";

// The machine at rest and cold: the state every run starts from.
export const rest = () => ({ T: C.T0, sw: 0, heat: 0, ph: 0, amp: 0, p: 0, head: 0, lift: 0, g: 0, flow: 0, shotT: 0, clock: 0, puff: 9, steam: 0, duty: "", swap: -1, fade: 1, stepT: 0 });

// Every paw must land on its handle through the whole stroke and at the switch.
for (let i = 0; i <= 16; i++) {
  const p = poses(C, { ...rest(), ph: (i / 16) * Math.PI * 2, amp: 1 });
  for (const [paw, short] of Object.entries(critter(OLLIE, p.ollie, P).reach)) if (short > 0.3) console.warn(`Ollie's ${paw} paw is ${short.toFixed(1)} short of the handle at ${i}/16 of a stroke`);
}
for (const sw of [1, 0.95, 0.91]) {
  const p = poses(C, { ...rest(), sw });
  for (const [paw, short] of Object.entries(critter(EMBER, p.ember, P).reach)) if (short > 0.3) console.warn(`Ember's ${paw} paw is ${short.toFixed(1)} short of the switch at ${sw}`);
}

const [gx, gy] = C.G;
export const STEPS = [
  { title: "Meet the crew", who: "Ollie, Ember and Crumb", color: "var(--anatomy-hi)", text: "Three animals run this espresso machine: Ember on the heater switch, Ollie on the pump, Crumb on the pressure valve.", points: null, hold: 1.6 },
  { title: "Ember heats the boiler", who: "Ember · heat", color: ROLE.heat, text: "Ember pushes the heater switch over and the band round the boiler glows. At 93 °C, about four minutes later, the thermostat knocks the switch back.", points: [[gx - 20, gy - 20, 122], [gx + 20, gy + 20, 86], [44, 52, 79], [44, 52, 104]] },
  { title: "Ollie pumps", who: "Ollie · fluid", color: ROLE.fluid, text: "Ollie works the pump's piston. Each stroke pushes water from the tank into the boiler and on into the coffee, and the gauge climbs.", points: [[-14, -14, 6], [46, -14, 4], [46, -14, 34], [C.OPV.x, C.OPV.y, 66], [-42, 60, 128]] },
  { title: "Crumb lets the extra go", who: "Crumb · sensing", color: ROLE.sensing, text: "Past 9 bar the water lifts Crumb off the over-pressure valve, and the extra runs back to the tank. The coffee never gets more than 9 bar.", points: [[C.OPV.x - 12, C.OPV.y - 12, 34], [C.OPV.x + 12, C.OPV.y + 12, 72], [-20, -28, 38]] },
  { title: "The shot pours", who: "the coffee", color: "var(--anatomy-hi)", text: "Water at 93 °C and 9 bar soaks through 18 g of ground coffee. In about 28 seconds, 36 g of espresso runs into the cup.", points: [[gx - 14, gy - 14, 10], [gx + 14, gy + 14, 10], [gx, gy, 76], [gx, gy + 40, 56]] },
  { title: "Ollie stops, the valve vents", who: "Ollie · fluid", color: ROLE.fluid, text: "Ollie lets go of the piston. The three-way valve opens and vents the coffee's pressure down into the drip tray in a puff of steam.", points: [[C.SOL.x + 10, C.SOL.y, 76], [gx - 10, gy, 10], [46, -14, 4], [46, -14, 30]] },
  { title: "A double espresso", who: "everyone", color: "var(--anatomy-hi)", text: "36 g of espresso in 28 seconds, at 9 bar and 93 °C, with a layer of crema on top.", points: [[-60, -60, 0], [60, 66, 0], [0, 0, 158], [60, 66, 40]], hold: 2 },
];
export const views = STEPS.map((s) => (s.points ? fitView(s.points.map(at), [WIDTH, HEIGHT], { pad: 22, least: 0.34 }) : [0, 0, WIDTH, HEIGHT]));

export const LABEL = "A single-boiler espresso machine on a kitchen counter, with its right side, top and most of its front cut away, run by three animals. A cup stands on the drip tray under the group head and portafilter. Ember the fennec fox stands on the deck beside the boiler and pushes the heater switch, so the band heater round the boiler glows until the thermostat on top knocks the switch back at 93 °C. Ollie the otter stands at the pump and works its piston rod back and forth by a crosshead handle, pushing water from the tank into the boiler. Crumb the mouse sits on the cap of the over-pressure valve, and is lifted off it when the pressure passes 9 bar. Espresso runs from the portafilter's two spouts into the cup, and the gauge on the front panel shows the pressure.";

export const keys = [
  { mark: "lit", label: "On duty: whoever is doing the work right now" },
  { mark: "raised", label: "Ember, fennec fox, heat: holds the heater switch on" },
  { mark: "raised", label: "Ollie, otter, fluid: works the pump's piston" },
  { mark: "raised", label: "Crumb, mouse, sensing: sits on the over-pressure valve" },
];
