// Types for kit/steps-run.mjs, so a TypeScript page (React, Next.js) can mount the run with checked options.
export interface Beat {
  title: string;
  text: string;
  who?: string;
  hold?: number;
  pace?: number;
}

export type ViewBox = number[];

export interface StepsOptions<S = unknown> {
  root: HTMLElement;
  svg: SVGSVGElement | SVGSVGElement[];
  stage: HTMLElement;
  steps: Beat[];
  views: Array<ViewBox | null | undefined>;
  size: [number, number];
  enter(index: number, how: "start" | "next" | "loop"): void;
  update(dt: number): void;
  done(index: number): boolean;
  colors?: string[];
  ease?: number;
  slowest?: number;
  advance?(dt: number): void;
  save?(): S;
  load?(state: S): void;
  draw?(): void;
  onView?(viewBox: ViewBox): void;
}

export interface Run {
  go(index: number): void;
  toggle(): void;
  aim(viewBox: ViewBox | null): void;
  destroy(): void;
  startOf(index: number): unknown;
  readonly index: number;
  readonly playing: boolean;
}

export function mountSteps<S>(options: StepsOptions<S>): Run;
