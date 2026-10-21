import { Check, Circle, XCircle } from "lucide-react";
import type { Order } from "@/types";
import { orderStatusMeta } from "@/lib/constants";
import { cn, formatDate } from "@/lib/utils";

const steps = ["pending", "confirmed", "processing", "shipped", "delivered"] as const;

export function OrderTimeline({ order }: { order: Order }) {
  if (order.status === "cancelled" || order.status === "refunded") {
    return (
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-danger/10 text-danger">
            <XCircle className="size-4" />
          </span>
          <div>
            <p className="text-sm font-semibold">{orderStatusMeta[order.status].label}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {order.statusHistory.at(-1)?.note ?? orderStatusMeta[order.status].description}
            </p>
            {order.statusHistory.at(-1) && (
              <p className="mt-1 text-[0.62rem] text-muted-foreground">
                {formatDate(order.statusHistory.at(-1)!.at, { dateStyle: "medium", timeStyle: "short" })}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentIndex = steps.indexOf(order.status as (typeof steps)[number]);
  const historyByStatus = new Map(order.statusHistory.map((entry) => [entry.status, entry]));

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Delivery progress
        </p>
        <p className="text-[0.65rem] font-medium text-muted-foreground">{order.shippingMethod.eta}</p>
      </div>

      <div className="mt-6 grid grid-cols-5 gap-1">
        {steps.map((step, index) => {
          const complete = index <= currentIndex;
          const entry = historyByStatus.get(step);
          return (
            <div key={step} className="relative flex flex-col items-center text-center">
              {index < steps.length - 1 && (
                <span
                  className={cn(
                    "absolute left-1/2 top-[13px] h-0.5 w-full",
                    index < currentIndex ? "bg-primary" : "bg-border",
                  )}
                  aria-hidden
                />
              )}
              <span
                className={cn(
                  "relative z-10 grid size-7 place-items-center rounded-full border-2 bg-card",
                  complete ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground",
                )}
              >
                {complete ? <Check className="size-3.5" /> : <Circle className="size-2.5 fill-current" />}
              </span>
              <p className={cn("mt-2 text-[0.6rem] font-semibold", complete ? "text-foreground" : "text-muted-foreground")}>
                {orderStatusMeta[step].label}
              </p>
              <p className="mt-0.5 hidden text-[0.55rem] text-muted-foreground sm:block">
                {entry ? formatDate(entry.at, { month: "short", day: "numeric" }) : "—"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
