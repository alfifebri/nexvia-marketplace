import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";
import type { Order } from "@/types";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { ProductImage } from "@/components/ui/product-image";
import { formatCurrency, formatDate } from "@/lib/utils";

export function OrderCard({ order, showCustomer = false }: { order: Order; showCustomer?: boolean }) {
  const visible = order.items.slice(0, 3);
  const rest = order.items.length - visible.length;

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-foreground/15">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/30 px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <div>
            <p className="text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Order
            </p>
            <p className="text-xs font-semibold">#{order.orderNumber}</p>
          </div>
          <div className="hidden sm:block">
            <p className="text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Placed
            </p>
            <p className="text-xs">{formatDate(order.placedAt)}</p>
          </div>
          {showCustomer && (
            <div>
              <p className="text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Customer
              </p>
              <p className="text-xs">{order.customerName}</p>
            </div>
          )}
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex -space-x-3">
            {visible.map((item) => (
              <ProductImage
                key={item.id}
                src={item.image}
                alt={item.title}
                className="size-12 rounded-xl border-2 border-card"
                sizes="48px"
              />
            ))}
            {rest > 0 && (
              <span className="grid size-12 place-items-center rounded-xl border-2 border-card bg-muted text-[0.6rem] font-semibold text-muted-foreground">
                +{rest}
              </span>
            )}
            {visible.length === 0 && (
              <span className="grid size-12 place-items-center rounded-xl bg-muted text-muted-foreground">
                <Package className="size-4" />
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {order.items[0]?.title ?? "Order"}
              {order.items.length > 1 && (
                <span className="text-muted-foreground"> + {order.items.length - 1} more</span>
              )}
            </p>
            <p className="mt-0.5 text-[0.65rem] text-muted-foreground">
              {order.items.reduce((sum, item) => sum + item.quantity, 0)} items ·{" "}
              {order.shippingMethod.label}
            </p>
            <p className="mt-0.5 text-[0.65rem] text-muted-foreground sm:hidden">
              {formatDate(order.placedAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <div className="text-right">
            <p className="text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Total
            </p>
            <p className="text-sm font-semibold tabular-nums">
              {formatCurrency(order.totals.grandTotal, order.totals.currency)}
            </p>
          </div>
          <Link
            href={`/account/orders/${order.id}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-[0.65rem] font-semibold transition-colors hover:border-foreground/25 hover:bg-muted"
          >
            View <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>
    </article>
  );
}
