"use client";

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "volt" | "uv" | "ghost" | "hot";

const styles: Record<Variant, string> = {
  volt: "bg-volt text-[#0a0d00] shadow-[0_6px_0_var(--volt-deep),0_14px_40px_rgb(200_255_46/0.25)] hover:brightness-105 active:shadow-[0_2px_0_var(--volt-deep)]",
  uv: "bg-uv text-white shadow-[0_6px_0_#4a1fd1,0_14px_40px_rgb(139_92_255/0.3)] hover:brightness-110 active:shadow-[0_2px_0_#4a1fd1]",
  hot: "bg-hot text-white shadow-[0_6px_0_#a8003f,0_14px_40px_rgb(255_77_126/0.25)] hover:brightness-110 active:shadow-[0_2px_0_#a8003f]",
  ghost: "bg-deck/70 text-text border border-line-strong shadow-[0_6px_0_#070a26] hover:bg-deck-2 active:shadow-[0_2px_0_#070a26]",
};

export interface ArcadeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "md" | "lg" | "xl";
  loading?: boolean;
}

/** The chunky, physically-pressable button used for every primary game action. */
export const ArcadeButton = forwardRef<HTMLButtonElement, ArcadeButtonProps>(function ArcadeButton(
  { variant = "volt", size = "lg", loading, className, children, disabled, ...props },
  ref,
) {
  const sizes = {
    md: "h-11 px-5 text-base rounded-xl",
    lg: "h-14 px-7 text-lg rounded-2xl",
    xl: "h-16 px-9 text-2xl rounded-2xl",
  }[size];
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "relative inline-flex select-none items-center justify-center gap-2 font-display font-extrabold uppercase tracking-wide transition-[transform,box-shadow,filter,background] duration-100 active:translate-y-1 disabled:pointer-events-none disabled:opacity-45",
        sizes,
        styles[variant],
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="size-5 animate-spin" /> : children}
    </button>
  );
});
