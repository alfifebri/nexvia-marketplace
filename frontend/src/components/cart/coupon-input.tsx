"use client";

import { useState } from "react";
import { Check, Tag, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/stores/cart-store";

export function CouponInput({ compact = false }: { compact?: boolean }) {
  const coupon = useCartStore((state) => state.coupon);
  const applyCoupon = useCartStore((state) => state.applyCoupon);
  const removeCoupon = useCartStore((state) => state.removeCoupon);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const apply = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!code.trim()) {
      setError("Enter a code first.");
      return;
    }
    const result = applyCoupon(code);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    toast.success(result.message);
    setCode("");
  };

  if (coupon) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-success/25 bg-success/5 p-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-success/15 text-success">
            <Check className="size-3.5" />
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-xs font-semibold">
              {coupon.code}
              <Badge variant="success" className="text-[0.5rem]">Applied</Badge>
            </p>
            <p className="truncate text-[0.62rem] text-muted-foreground">{coupon.description}</p>
          </div>
        </div>
        <button
          onClick={() => {
            removeCoupon();
            toast.info("Coupon removed");
          }}
          className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-danger"
          aria-label="Remove coupon"
        >
          <X className="size-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={apply} className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="Discount code"
            aria-label="Discount code"
            className="h-10 pl-8 text-xs uppercase"
          />
        </div>
        <Button type="submit" variant="outline" size="sm" className="h-10">
          Apply
        </Button>
      </form>
      {error ? (
        <p className="mt-1.5 text-[0.62rem] text-danger">{error}</p>
      ) : (
        !compact && (
          <p className="mt-1.5 text-[0.62rem] text-muted-foreground">
            First order? Try <span className="font-semibold text-foreground">NEXVIA10</span>.
          </p>
        )
      )}
    </div>
  );
}
