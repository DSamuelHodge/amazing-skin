import * as React from "react";
import { cn } from "@/src/lib/utils";

export interface BadgeProps extends React.ComponentProps<"div"> {
  variant?: "emerald" | "stone" | "amber" | "dark" | "outline";
}

function Badge({ className, variant = "emerald", ...props }: BadgeProps) {
  const baseStyles = "inline-flex items-center justify-center rounded-full font-medium transition-colors text-[0.7rem] px-2.5 py-1";
  
  const variants = {
    emerald: "bg-emerald-900/60 text-emerald-100",
    stone: "bg-white/70 text-stone-700 border border-stone-300",
    amber: "bg-amber-100/70 text-amber-800 border border-amber-300",
    dark: "bg-stone-900 text-forest-text",
    outline: "bg-stone-900/90 text-forest-text border border-stone-200/80",
  };

  return (
    <div className={cn(baseStyles, variants[variant], className)} {...props} />
  );
}

export { Badge };
