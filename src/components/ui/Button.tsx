import * as React from "react";
import { cn } from "@/src/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "light" | "lightOutline" | "dark";
  size?: "sm" | "md" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-forest-bg disabled:pointer-events-none disabled:opacity-50";
    
    const variants = {
      primary: "bg-emerald-400 text-emerald-950 hover:bg-emerald-300 hover:shadow-sm",
      secondary: "border border-emerald-800/80 bg-forest-elevated text-emerald-50 hover:border-emerald-500 hover:bg-emerald-950/50",
      outline: "border border-emerald-800/80 text-emerald-100 hover:border-emerald-500 hover:bg-emerald-900/30",
      ghost: "text-stone-700 hover:text-stone-900",
      light: "bg-stone-900 text-forest-text hover:bg-stone-800",
      lightOutline: "border border-stone-300 bg-white/70 text-stone-900 hover:bg-white",
      dark: "border border-emerald-700/80 bg-forest-surface text-emerald-100 hover:border-emerald-400 hover:bg-forest-bg",
    };

    const sizes = {
      sm: "h-8 px-3.5 text-xs",
      md: "h-10 px-4 py-2 text-sm",
      lg: "h-11 px-5 py-2.5 text-sm",
      icon: "h-10 w-10",
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
