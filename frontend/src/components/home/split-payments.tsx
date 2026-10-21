"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, BadgeCheck, CreditCard, Split, Wallet } from "lucide-react";
import { demoOrders } from "@/lib/demo/orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

const steps = [
  {
    icon: CreditCard,
    title: "Collect",
    description: "Stripe, Razorpay, UPI, wallets or COD — one hosted, PCI-compliant checkout.",
  },
  {
    icon: Split,
    title: "Split",
    description: "Commission is calculated per line item, not guessed at the end of the month.",
  },
  {
    icon: Wallet,
    title: "Settle",
    description: "Vendor transfers queue automatically. Webhook-backed ledger, zero spreadsheets.",
  },
];

export function SplitPayments() {
  const order = demoOrders[0];
  const platformFee = order.payment.transfers.reduce((sum, transfer) => sum + transfer.commission, 0);

  return (
    <section className="container-page section-pad">
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-2.5">
            <span className="h-px w-8 bg-foreground/30" />
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Payments without the black box
            </p>
          </div>
          <h2 className="mt-4 text-balance text-3xl font-semibold leading-[1.05] tracking-[-0.035em] sm:text-4xl lg:text-[2.9rem]">
            One checkout.
            <br />
            <span className="font-display font-normal italic">Every vendor paid.</span>
          </h2>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
            Nexvia is built for multi-vendor commerce from the first line of code. Every order fans out
            into commission, vendor payouts and refunds automatically — across Stripe Connect and
            Razorpay Route.
          </p>

          <div className="mt-8 space-y-4">
            {steps.map((step, index) => (
              <div key={step.title} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-card text-foreground shadow-xs">
                    <step.icon className="size-4" />
                  </span>
                  {index < steps.length - 1 && <span className="my-1 w-px flex-1 bg-border" />}
                </div>
                <div className="pb-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[0.62rem] font-bold tabular-nums text-muted-foreground/60">
                      0{index + 1}
                    </span>
                    <h3 className="text-sm font-semibold">{step.title}</h3>
                  </div>
                  <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href="/support">
                Read the payments docs <ArrowUpRight className="size-4" />
              </Link>
            </Button>
            <div className="flex items-center gap-2 text-[0.68rem] text-muted-foreground">
              <BadgeCheck className="size-4 text-success" /> PCI-DSS ready
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-accent/30 via-transparent to-coral/10 blur-2xl" aria-hidden />
          <div className="relative overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-lift">
            <div className="flex items-center justify-between border-b border-border bg-muted/40 px-5 py-4">
              <div>
                <p className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Settlement preview
                </p>
                <p className="mt-0.5 font-mono text-xs font-semibold">{order.orderNumber}</p>
              </div>
              <Badge variant="success" dot>
                Paid
              </Badge>
            </div>

            <div className="space-y-4 p-5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Order total · {order.items.length} vendors</span>
                <span className="font-semibold tabular-nums">{formatCurrency(order.totals.grandTotal)}</span>
              </div>

              <div className="space-y-2.5">
                {order.payment.transfers.map((transfer) => {
                  const line = order.items.find((item) => item.storeName === transfer.storeName);
                  const itemTotal = order.items
                    .filter((item) => item.storeName === transfer.storeName)
                    .reduce((sum, item) => sum + item.lineTotal, 0);
                  const percent = itemTotal > 0 ? (transfer.amount / itemTotal) * 100 : 0;
                  return (
                    <div key={transfer.storeName} className="rounded-xl border border-border bg-background p-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-[0.62rem] font-bold text-secondary-foreground">
                            {transfer.storeName.split(" ").map((word) => word[0]).join("").slice(0, 2)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold">{transfer.storeName}</p>
                            <p className="text-[0.6rem] text-muted-foreground">
                              Stripe Connect · {line?.commissionRate}% platform fee
                            </p>
                          </div>
                        </div>
                        <span className="shrink-0 text-xs font-semibold tabular-nums">
                          {formatCurrency(transfer.amount)}
                        </span>
                      </div>
                      <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${percent}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.9, delay: 0.2 }}
                          className="h-full rounded-full bg-primary"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-xl border border-dashed border-border bg-muted/30 p-3.5">
                <div className="flex items-center justify-between text-[0.68rem]">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Split className="size-3.5" /> Nexvia commission
                  </span>
                  <span className="font-semibold tabular-nums">{formatCurrency(platformFee)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[0.68rem] text-muted-foreground">
                  <span>Tax + shipping</span>
                  <span className="tabular-nums">
                    {formatCurrency(order.totals.tax + order.totals.shippingFee)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-xs font-semibold">Vendor payouts queued</span>
                <span className="text-sm font-semibold tabular-nums">
                  {formatCurrency(order.payment.transfers.reduce((sum, transfer) => sum + transfer.amount, 0))}
                </span>
              </div>

              <div className="flex items-center justify-center gap-4 rounded-xl bg-[#635bff]/10 px-3 py-2.5">
                <span className="text-[0.65rem] font-bold tracking-tight text-[#635bff]">stripe</span>
                <span className="h-3 w-px bg-border" />
                <span className="text-[0.65rem] font-bold tracking-tight text-[#0d6efd]">Razorpay</span>
                <span className="text-[0.6rem] text-muted-foreground">· Connect + Route</span>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-4 -left-4 hidden items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 shadow-float sm:flex">
            <span className="grid size-7 place-items-center rounded-full bg-success/10 text-success">
              <BadgeCheck className="size-4" />
            </span>
            <div>
              <p className="text-[0.65rem] font-semibold">Transfer complete</p>
              <p className="text-[0.55rem] text-muted-foreground">2 vendors · 1.8s</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-14 flex justify-center">
        <Link
          href="/vendor/onboarding"
          className="group inline-flex items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline"
        >
          Start selling on Nexvia
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
