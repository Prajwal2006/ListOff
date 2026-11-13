"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/** Every canonical answer for the topic, most-found first — the "how did nobody say X" moment. */
export function AnswerKey({
  answers,
  players,
  mine,
}: {
  answers: { answer: string; foundBy: number }[];
  players: number;
  mine?: Set<string>;
}) {
  const [all, setAll] = useState(false);
  const found = answers.filter((a) => a.foundBy > 0).length;
  const shown = all ? answers : answers.slice(0, 40);
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="font-display text-2xl font-extrabold uppercase">The full list</h3>
        <span className="text-sm text-muted-foreground">
          room found <b className="text-text">{found}</b> of {answers.length}
        </span>
      </div>
      <ul className="flex flex-wrap gap-1.5">
        {shown.map((a) => {
          const mineHit = mine?.has(a.answer);
          return (
            <li
              key={a.answer}
              className={cn(
                "rounded-lg border px-2 py-1 text-sm",
                mineHit
                  ? "border-volt/50 bg-volt/10 text-volt"
                  : a.foundBy > 0
                    ? "border-line-strong bg-deck/60 text-text"
                    : "border-line bg-night/40 text-faint",
              )}
            >
              {a.answer}
              {a.foundBy > 0 && players > 1 && <span className="ml-1 text-xs opacity-60">×{a.foundBy}</span>}
            </li>
          );
        })}
      </ul>
      {answers.length > 40 && (
        <button onClick={() => setAll((v) => !v)} className="mt-3 text-sm font-semibold text-cyan hover:underline">
          {all ? "Show fewer" : `Show all ${answers.length}`}
        </button>
      )}
    </div>
  );
}
