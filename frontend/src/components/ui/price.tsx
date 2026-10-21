import { cn, discountPercent, formatCurrency } from "@/lib/utils";

interface PriceProps {
  price: number;
  compareAt?: number;
  currency?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showDiscount?: boolean;
}

const sizes = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-xl",
  xl: "text-3xl",
};

export function Price({ price, compareAt, currency = "USD", size = "md", className, showDiscount = false }: PriceProps) {
  const discount = discountPercent(price, compareAt);
  return (
    <span className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-1", className)}>
      <span className={cn("font-semibold tracking-tight tabular-nums text-foreground", sizes[size])}>
        {formatCurrency(price, currency)}
      </span>
      {compareAt && compareAt > price && (
        <span className="text-xs text-muted-foreground line-through tabular-nums">
          {formatCurrency(compareAt, currency)}
        </span>
      )}
      {showDiscount && discount > 0 && (
        <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-coral">−{discount}%</span>
      )}
    </span>
  );
}
