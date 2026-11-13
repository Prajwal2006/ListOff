"use client";

import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Circular timer driven by the server clock. Shifts cyan → amber → hot as it runs down. */
export function CountdownRing({
  msLeft,
  totalMs,
  size = 120,
  label,
  className,
}: {
  msLeft: number;
  totalMs: number;
  size?: number;
  label?: string;
  className?: string;
}) {
  const r = 44;
  const c = 2 * Math.PI * r;
  const frac = totalMs > 0 ? Math.max(0, Math.min(1, msLeft / totalMs)) : 0;
  const secs = Math.ceil(msLeft / 1000);
  const color = frac > 0.5 ? "var(--cyan)" : frac > 0.25 ? "var(--amber)" : "var(--hot)";
  const urgent = secs <= 5 && msLeft > 0;
  return (
    <div className={cn("relative grid place-items-center", className)} style={{ width: size, height: size }}>
      {urgent && (
        <span className="absolute inset-2 rounded-full border-2 border-hot animate-pulse-ring" aria-hidden />
      )}
      <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--line-strong)" strokeWidth="7" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - frac)}
          style={{ transition: "stroke-dashoffset 120ms linear, stroke 300ms", filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <div className="relative flex flex-col items-center leading-none">
        {/* Old and new digits share one grid cell so they cross-fade in place, perfectly centred. */}
        <div className="grid place-items-center">
          <AnimatePresence initial={false}>
            <motion.span
              key={secs}
              initial={{ y: -12, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 12, opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.18 }}
              className="col-start-1 row-start-1 font-display font-black tabular"
              style={{ fontSize: size * 0.38, color: urgent ? "var(--hot)" : "var(--text)" }}
            >
              {secs}
            </motion.span>
          </AnimatePresence>
        </div>
        {label && <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{label}</span>}
      </div>
    </div>
  );
}

/** A thin bar version of the timer for headers. */
export function TimerBar({ msLeft, totalMs }: { msLeft: number; totalMs: number }) {
  const frac = totalMs > 0 ? Math.max(0, Math.min(1, msLeft / totalMs)) : 0;
  const color = frac > 0.5 ? "var(--cyan)" : frac > 0.25 ? "var(--amber)" : "var(--hot)";
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
      <div
        className="h-full rounded-full"
        style={{ width: `${frac * 100}%`, background: color, transition: "width 120ms linear", boxShadow: `0 0 12px ${color}` }}
      />
    </div>
  );
}
