"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/** Big numeric input with − / + buttons and keyboard arrows. */
export function Stepper({
  value,
  onChange,
  min,
  max,
  size = "md",
  label,
  disabled,
}: {
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  size?: "md" | "xl";
  label: string;
  disabled?: boolean;
}) {
  const clamp = (n: number) => Math.max(min, Math.min(max, n));
  const btn =
    size === "xl"
      ? "size-16 sm:size-20 rounded-2xl text-3xl"
      : "size-11 rounded-xl text-xl";
  return (
    <div className="flex items-center justify-center gap-3 sm:gap-5" role="group" aria-label={label}>
      <button
        type="button"
        aria-label={`Decrease ${label}`}
        disabled={disabled || value <= min}
        onClick={() => onChange(clamp(value - 1))}
        className={cn(
          "grid place-items-center border border-line-strong bg-deck text-text shadow-[0_5px_0_#070a26] transition active:translate-y-1 active:shadow-[0_1px_0_#070a26] disabled:opacity-35",
          btn,
        )}
      >
        <Minus className={size === "xl" ? "size-8" : "size-5"} />
      </button>
      <input
        aria-label={label}
        inputMode="numeric"
        disabled={disabled}
        value={value}
        onChange={(e) => {
          const n = parseInt(e.target.value.replace(/\D/g, ""), 10);
          onChange(Number.isFinite(n) ? clamp(n) : min);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp") {
            e.preventDefault();
            onChange(clamp(value + 1));
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            onChange(clamp(value - 1));
          }
        }}
        className={cn(
          "bg-transparent text-center font-display font-black tabular text-text focus:outline-none",
          size === "xl" ? "w-40 text-[7rem] leading-none sm:w-52 sm:text-[9rem]" : "w-16 text-4xl",
        )}
      />
      <button
        type="button"
        aria-label={`Increase ${label}`}
        disabled={disabled || value >= max}
        onClick={() => onChange(clamp(value + 1))}
        className={cn(
          "grid place-items-center border border-line-strong bg-deck text-text shadow-[0_5px_0_#070a26] transition active:translate-y-1 active:shadow-[0_1px_0_#070a26] disabled:opacity-35",
          btn,
        )}
      >
        <Plus className={size === "xl" ? "size-8" : "size-5"} />
      </button>
    </div>
  );
}

export function ChoiceChips<T extends number | string>({
  options,
  value,
  onChange,
  format = (v) => String(v),
  label,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  format?: (v: T) => string;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={String(o)}
          type="button"
          role="radio"
          aria-checked={o === value}
          onClick={() => onChange(o)}
          className={cn(
            "h-11 min-w-16 rounded-xl border px-4 font-display text-lg font-extrabold transition",
            o === value
              ? "border-volt bg-volt text-[#0a0d00] shadow-[0_4px_0_var(--volt-deep)]"
              : "border-line-strong bg-night text-muted-foreground hover:text-text",
          )}
        >
          {format(o)}
        </button>
      ))}
    </div>
  );
}
