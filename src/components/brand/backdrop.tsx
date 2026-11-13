import { cn } from "@/lib/utils";

/** Ambient stage lighting: drifting colour fields over a faint scoreboard grid. */
export function Backdrop({ tone = "default" }: { tone?: "default" | "volt" | "uv" | "hot" }) {
  const accent = {
    default: "bg-uv/30",
    volt: "bg-volt/20",
    uv: "bg-uv/40",
    hot: "bg-hot/25",
  }[tone];
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink">
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at 50% 30%, black 20%, transparent 75%)",
        }}
      />
      <div className={cn("absolute -left-1/4 -top-1/3 h-[70vmax] w-[70vmax] rounded-full blur-[120px] animate-drift", accent)} />
      <div className="absolute -bottom-1/3 -right-1/4 h-[60vmax] w-[60vmax] rounded-full bg-cyan/15 blur-[130px] animate-drift [animation-delay:-8s]" />
      <div className="absolute left-1/3 top-1/2 h-[40vmax] w-[40vmax] rounded-full bg-volt/10 blur-[120px] animate-drift [animation-delay:-14s]" />
    </div>
  );
}
