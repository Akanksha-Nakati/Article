"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium rounded transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed",
          {
            primary:
              "bg-accent text-white hover:bg-accent/90 active:scale-95",
            secondary:
              "bg-ink/10 text-ink hover:bg-ink/20 active:scale-95",
            ghost:
              "text-ink/70 hover:text-ink hover:bg-ink/5 active:scale-95",
            danger:
              "bg-red-600 text-white hover:bg-red-700 active:scale-95",
          }[variant],
          {
            sm: "px-3 py-1.5 text-sm gap-1.5",
            md: "px-4 py-2 text-sm gap-2",
            lg: "px-6 py-3 text-base gap-2",
          }[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
