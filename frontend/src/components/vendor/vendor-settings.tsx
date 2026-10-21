"use client";

import { useState } from "react";
import { Bell, CreditCard, Save, ShieldCheck, Truck } from "lucide-react";
import { toast } from "sonner";
import type { Vendor } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useMounted } from "@/hooks/use-mounted";
import { useVendorWorkspace } from "@/hooks/queries";
import { useDemoStore } from "@/stores/demo-store";
import { formatDate } from "@/lib/utils";

export function VendorSettings() {
  const mounted = useMounted();
  const { vendor } = useVendorWorkspace();

  if (!mounted) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-[480px] max-w-3xl rounded-2xl" />
      </div>
    );
  }

  return <SettingsForm vendor={vendor} />;
}

function SettingsForm({ vendor }: { vendor: Vendor }) {
  const updateVendorProfile = useDemoStore((state) => state.updateVendorProfile);
  const [form, setForm] = useState({
    taxRate: vendor.settings.taxRate,
    shippingFee: vendor.settings.shippingFee,
    freeShippingThreshold: vendor.settings.freeShippingThreshold,
    returnWindowDays: vendor.settings.returnWindowDays,
    acceptsReturns: vendor.settings.acceptsReturns,
  });
  const [payout, setPayout] = useState("weekly");
  const [payoutMethod, setPayoutMethod] = useState("bank");
  const [notifications, setNotifications] = useState({
    orders: true,
    reviews: true,
    payouts: true,
    marketing: false,
  });
  const [pending, setPending] = useState(false);

  const update = (patch: Partial<typeof form>) => setForm((current) => ({ ...current, ...patch }));

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    if (form.taxRate < 0 || form.taxRate > 30) {
      toast.error("Tax rate must be between 0 and 30%.");
      return;
    }
    if (form.shippingFee < 0) {
      toast.error("Shipping fee cannot be negative.");
      return;
    }
    setPending(true);
    updateVendorProfile(vendor.id, {
      settings: {
        ...vendor.settings,
        taxRate: Number(form.taxRate),
        shippingFee: Number(form.shippingFee),
        freeShippingThreshold: Number(form.freeShippingThreshold),
        returnWindowDays: Number(form.returnWindowDays),
        acceptsReturns: form.acceptsReturns,
      },
    });
    window.setTimeout(() => {
      setPending(false);
      toast.success("Settings saved");
    }, 350);
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Workspace</p>
        <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">Settings</h1>
        <p className="mt-1 text-xs text-muted-foreground">Commercial terms, payouts and notifications for {vendor.name}.</p>
      </div>

      <form onSubmit={save} className="max-w-3xl space-y-4">
        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Shipping & tax</h2>
            </div>
            <Badge variant="muted" className="text-[0.5rem] uppercase">{vendor.settings.currency}</Badge>
          </div>
          <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
            <Field label="Standard shipping fee" hint="Charged per order at checkout">
              <Input
                type="number"
                min={0}
                step="0.5"
                value={form.shippingFee}
                onChange={(event) => update({ shippingFee: Number(event.target.value) })}
              />
            </Field>
            <Field label="Free shipping threshold">
              <Input
                type="number"
                min={0}
                step="5"
                value={form.freeShippingThreshold}
                onChange={(event) => update({ freeShippingThreshold: Number(event.target.value) })}
              />
            </Field>
            <Field label="Tax rate (%)">
              <Input
                type="number"
                min={0}
                max={30}
                step="0.1"
                value={form.taxRate}
                onChange={(event) => update({ taxRate: Number(event.target.value) })}
              />
            </Field>
            <Field label="Return window (days)">
              <Input
                type="number"
                min={0}
                max={90}
                value={form.returnWindowDays}
                onChange={(event) => update({ returnWindowDays: Number(event.target.value) })}
                disabled={!form.acceptsReturns}
              />
            </Field>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-muted/50 p-3">
            <div>
              <p className="text-xs font-medium">Accept returns</p>
              <p className="text-[0.6rem] text-muted-foreground">Customers can request a return within the window.</p>
            </div>
            <Switch
              checked={form.acceptsReturns}
              onCheckedChange={(checked) => update({ acceptsReturns: checked })}
              aria-label="Accept returns"
            />
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <CreditCard className="size-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Payouts</h2>
          </div>
          <p className="mt-1 text-[0.62rem] text-muted-foreground">
            Marketplace commission of {vendor.settings.commissionRate}% is deducted before payout. Joined{" "}
            {formatDate(vendor.joinedAt, { month: "long", year: "numeric" })}.
          </p>
          <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
            <Field label="Payout method">
              <Select value={payoutMethod} onValueChange={setPayoutMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Bank transfer (ACH)</SelectItem>
                  <SelectItem value="stripe">Stripe Express</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Payout schedule">
              <Select value={payout} onValueChange={setPayout}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly · Friday</SelectItem>
                  <SelectItem value="biweekly">Every two weeks</SelectItem>
                  <SelectItem value="monthly">Monthly · 1st</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-muted/40 p-3 text-[0.6rem] text-muted-foreground">
            <ShieldCheck className="size-3.5 shrink-0 text-success" />
            Payout details are encrypted and reviewed by the marketplace finance team.
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <Bell className="size-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Notifications</h2>
          </div>
          <div className="mt-3 divide-y divide-border">
            {(
              [
                { key: "orders", label: "New orders", hint: "Instant alert when an order lands" },
                { key: "reviews", label: "New reviews", hint: "Daily digest of customer feedback" },
                { key: "payouts", label: "Payout updates", hint: "When funds are on the way" },
                { key: "marketing", label: "Marketplace insights", hint: "Promotions and growth tips" },
              ] as const
            ).map((item) => (
              <div key={item.key} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-xs font-medium">{item.label}</p>
                  <p className="text-[0.58rem] text-muted-foreground">{item.hint}</p>
                </div>
                <Switch
                  checked={notifications[item.key]}
                  onCheckedChange={(checked) => setNotifications((current) => ({ ...current, [item.key]: checked }))}
                  aria-label={item.label}
                />
              </div>
            ))}
          </div>
        </section>

        <div className="flex justify-end">
          <Button type="submit" loading={pending}>
            <Save className="size-4" /> Save settings
          </Button>
        </div>
      </form>
    </div>
  );
}
