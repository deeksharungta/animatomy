import { C } from "./model.mjs";

// The crew: five mice are the pin springs, Roo is the bolt's spring.
export const MICE = ["Nib", "Bit", "Dot", "Fig", "Tam"].map((name) => ({ species: "mouse", name, size: C.MOUSE.size, role: "holding" }));
export const ROO = { species: "kangaroo", name: "Roo", size: C.ROO.size, role: "spring" };
