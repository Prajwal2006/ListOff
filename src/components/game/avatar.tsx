import { cn } from "@/lib/utils";

const PALETTES: [string, string][] = [
  ["#c8ff2e", "#3fbf00"],
  ["#8b5cff", "#4a1fd1"],
  ["#2ee6ff", "#0077ff"],
  ["#ff4d7e", "#b3004b"],
  ["#ffc23d", "#ff7a00"],
  ["#5effc4", "#00a87d"],
  ["#ff8bf0", "#b01fd8"],
  ["#7aa2ff", "#2d3fd8"],
  ["#ff6b3d", "#c42a00"],
  ["#e6ff6b", "#a1b800"],
  ["#c9b6ff", "#7a52ff"],
  ["#6bfff3", "#00a0b5"],
];

export function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "?") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

export function Avatar({
  name,
  avatar,
  size = "md",
  dim = false,
  className,
}: {
  name: string;
  avatar: number;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  dim?: boolean;
  className?: string;
}) {
  const [a, b] = PALETTES[avatar % PALETTES.length];
  const dims = {
    xs: "size-6 text-[10px]",
    sm: "size-8 text-xs",
    md: "size-11 text-sm",
    lg: "size-16 text-xl",
    xl: "size-24 text-3xl",
  }[size];
  return (
    <span
      className={cn(
        "relative inline-grid shrink-0 place-items-center rounded-full font-display font-black text-ink shadow-[inset_0_-3px_0_rgb(0_0_0/0.25)] transition-opacity",
        dims,
        dim && "opacity-40 grayscale",
        className,
      )}
      style={{ background: `radial-gradient(circle at 30% 25%, ${a}, ${b})` }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
