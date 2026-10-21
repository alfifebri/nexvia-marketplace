"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
}

export function QuantityStepper({ value, onChange, min = 1, max = 99, size = "md", className }: QuantityStepperProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-card",
        size === "sm" ? "h-9" : "h-11",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease quantity"
        className={cn(
          "inline-flex items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30",
          size === "sm" ? "size-8" : "size-10",
        )}
      >
        <Minus className="size-3.5" />
      </button>
      <span
        className={cn("min-w-8 text-center font-semibold tabular-nums", size === "sm" ? "text-xs" : "text-sm")}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase quantity"
        className={cn(
          "inline-flex items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30",
          size === "sm" ? "size-8" : "size-10",
        )}
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}
