"use client";

import { Star } from "lucide-react";
import { cn, formatCompact } from "@/lib/utils";

interface RatingProps {
  value: number;
  count?: number;
  size?: "xs" | "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
  compactCount?: boolean;
}

const starSize = {
  xs: "size-3",
  sm: "size-3.5",
  md: "size-4",
  lg: "size-5",
};

export function Rating({ value, count, size = "sm", showValue = true, className, compactCount = true }: RatingProps) {
  const clamped = Math.max(0, Math.min(5, value));
  return (
    <div className={cn("flex items-center gap-1.5", className)} aria-label={`Rated ${clamped} out of 5`}>
      <div className="flex items-center gap-0.5" aria-hidden>
        {Array.from({ length: 5 }).map((_, index) => {
          const fill = Math.max(0, Math.min(1, clamped - index)) * 100;
          return (
            <span key={index} className={cn("relative inline-flex", starSize[size])}>
              <Star className={cn(starSize[size], "text-muted-foreground/35")} strokeWidth={1.5} />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill}%` }}>
                <Star className={cn(starSize[size], "fill-amber-400 text-amber-400")} strokeWidth={1.5} />
              </span>
            </span>
          );
        })}
      </div>
      {showValue && (
        <span className="text-xs font-semibold tabular-nums text-foreground">{clamped.toFixed(1)}</span>
      )}
      {typeof count === "number" && (
        <span className="text-xs text-muted-foreground">
          ({compactCount ? formatCompact(count) : count})
        </span>
      )}
    </div>
  );
}

interface RatingInputProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export function RatingInput({ value, onChange, className }: RatingInputProps) {
  return (
    <div className={cn("flex items-center gap-1", className)} role="radiogroup" aria-label="Your rating">
      {Array.from({ length: 5 }).map((_, index) => {
        const starValue = index + 1;
        return (
          <button
            key={starValue}
            type="button"
            role="radio"
            aria-checked={value === starValue}
            aria-label={`${starValue} star${starValue > 1 ? "s" : ""}`}
            onClick={() => onChange(starValue)}
            className="rounded-md p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Star
              className={cn(
                "size-7 transition-colors",
                starValue <= value
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/30 hover:text-amber-400/60",
              )}
            />
          </button>
        );
      })}
      <span className="ml-2 text-sm font-medium text-muted-foreground">
        {value ? `${value}.0` : "Select a rating"}
      </span>
    </div>
  );
}
