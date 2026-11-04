import * as React from "react";
import type { Beat } from "../steps-run.mjs";

// The run's caption panel and progress bar, as stepsHtml writes them; server-safe. The run fills it in place after
// hydration, so render it once and never re-render it.
export function Steps({ steps }: { steps: Beat[] }) {
  const first = steps[0];
  return (
    <div className="so-steps" data-steps="">
      <span className="so-steps-who" data-steps-who="">
        {first.who ? (
          <>
            <i />
            {first.who}
          </>
        ) : null}
      </span>
      <p className="so-steps-title" data-steps-title="" aria-live="polite">
        {first.title}
      </p>
      <p className="so-steps-text" data-steps-text="">
        {first.text}
      </p>
      <div className="so-steps-track" aria-hidden="true">
        {steps.map((_, index) => (
          <i key={index} />
        ))}
      </div>
    </div>
  );
}

// The run's caption fields only: what a page passes from the server to the client (no points, no colours).
export const beatsOf = (steps: Beat[]): Beat[] => steps.map(({ title, text, who, hold, pace }) => ({ title, text, who, hold, pace }));
