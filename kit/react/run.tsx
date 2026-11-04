"use client";

import * as React from "react";
import { mountSteps, type Run, type StepsOptions } from "../steps-run.mjs";

export type { Run };

// What a figure gives the run: its model hooks and views. The stage, its svg and the caption panel are found for it.
export type RunSetup<S> = Omit<StepsOptions<S>, "root" | "svg" | "stage"> & {
  svg?: SVGSVGElement | SVGSVGElement[];
  // Wires the reader's takeover once the run is mounted; returns its cleanup.
  takeOver?: (run: Run) => (() => void) | void;
};

// Mounts the run on the stage after hydration and destroys it on unmount (so a Strict Mode double mount is clean).
// setup(stage) builds the model on the stage's own nodes; it runs in the effect, never during render.
export function useRun<S>(stage: React.RefObject<HTMLElement | null>, setup: (stage: HTMLElement) => RunSetup<S>) {
  const latest = React.useRef(setup);
  latest.current = setup;
  React.useEffect(() => {
    const node = stage.current;
    const root = node?.closest(".iso-plate")?.querySelector<HTMLElement>("[data-steps]");
    if (!node || !root) return;
    const { takeOver, svg, ...options } = latest.current(node);
    const svgs = svg ?? [...node.querySelectorAll<SVGSVGElement>(":scope > svg")];
    const run = mountSteps<S>({ ...options, root, svg: svgs, stage: node });
    const release = takeOver?.(run);
    return () => {
      release?.();
      run.destroy();
    };
  }, [stage]);
}
