import { hamster, mouse } from "./art-hamster-mouse.mjs";
import { squirrel, beaver } from "./art-squirrel-beaver.mjs";
import { sloth, mole, crab } from "./art-sloth-mole-crab.mjs";
import { kangaroo, fennec } from "./art-kangaroo-fennec.mjs";
import { raccoon, eel } from "./art-raccoon-eel.mjs";
import { otter, woodpecker } from "./art-otter-woodpecker.mjs";

export const ART = { hamster, mouse, squirrel, beaver, sloth, mole, kangaroo, fennec, raccoon, otter, crab, eel, woodpecker };


export const ROLES = {
  power: { hex: "#F5C518", word: "power", does: "motors, current, anything that runs" },
  holding: { hex: "#E5484D", word: "holding", does: "latches, clamps, brakes, grips" },
  cutting: { hex: "#8E4EC6", word: "cutting", does: "blades, cutters, grinders, shredders" },
  sensing: { hex: "#3E9BDB", word: "sensing and timing", does: "gauges, thermostats, timers, switches that read" },
  moving: { hex: "#46A758", word: "moving", does: "carriages, rollers, conveyors, feeders" },
  heat: { hex: "#F76B15", word: "heat", does: "heating elements, igniters" },
  fluid: { hex: "#12A594", word: "fluid", does: "pumps, hoses, valves, cooling" },
  spring: { hex: "#E93D82", word: "spring", does: "springs, launchers, returns" },
};

export const SPECIES = Object.fromEntries(Object.entries(ART).map(([name, a]) => [name, { colors: a.colors, arms: a.up?.arms ?? null, four: !!a.four, path: !!a.path, beak: !!a.up?.head?.beakTip, wings: !!a.up?.wing }]));
