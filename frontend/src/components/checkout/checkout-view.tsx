"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  Landmark,
  LockKeyhole,
  MapPin,
  Package,
  ShieldCheck,
  Smartphone,
  Truck,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import type { Address, Order, OrderItem, PaymentProvider, SplitTransfer } from "@/types";
import { CheckoutSummary } from "@/components/checkout/checkout-summary";
import { CouponInput } from "@/components/cart/coupon-input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useMounted } from "@/hooks/use-mounted";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore, useCartTotals } from "@/stores/cart-store";
import { useDemoStore } from "@/stores/demo-store";
import { shippingMethods } from "@/lib/constants";
import { cn, formatCurrency, roundCurrency, uid } from "@/lib/utils";

const steps = [
  { label: "Delivery", icon: MapPin },
  { label: "Payment", icon: CreditCard },
  { label: "Review", icon: Check },
];

const emptyAddress: Address = {
  recipientName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  isDefault: false,
};

const formatCardNumber = (value: string) =>
  value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

const formatExpiry = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

export function CheckoutView() {
  const mounted = useMounted();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const lines = useCartStore((state) => state.lines);
  const coupon = useCartStore((state) => state.coupon);
  const clearCart = useCartStore((state) => state.clearCart);
  const shippingMethodId = useCartStore((state) => state.shippingMethodId);
  const setShippingMethod = useCartStore((state) => state.setShippingMethod);
  const addOrder = useDemoStore((state) => state.addOrder);
  const totals = useCartTotals();

  const savedAddresses = user?.addresses ?? [];
  const defaultAddress = savedAddresses.find((address) => address.isDefault) ?? savedAddresses[0];

  const [step, setStep] = useState(0);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(defaultAddress?.id ?? null);
  const [newAddressOpen, setNewAddressOpen] = useState(savedAddresses.length === 0);
  const [addressDraft, setAddressDraft] = useState<Address>({
    ...emptyAddress,
    recipientName: user?.name ?? "",
    phone: user?.phone ?? "",
    country: savedAddresses[0]?.country ?? "",
    isDefault: savedAddresses.length === 0,
  });
  const [saveAddress, setSaveAddress] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [provider, setProvider] = useState<PaymentProvider>("stripe");
  const [card, setCard] = useState({ name: user?.name ?? "", number: "", expiry: "", cvc: "" });
  const [upi, setUpi] = useState("");
  const [processing, setProcessing] = useState(false);

  if (!mounted) {
    return (
      <div className="container-page py-10">
        <Skeleton className="h-8 w-56" />
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <Skeleton className="h-[420px] rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (lines.length === 0) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <span className="grid size-16 place-items-center rounded-2xl bg-muted text-muted-foreground">
          <Package className="size-7" />
        </span>
        <h1 className="mt-6 text-2xl font-semibold">Nothing to check out — yet</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Your cart is empty. Add something considered and we&apos;ll take it from here.
        </p>
        <Button asChild className="mt-6">
          <Link href="/products">Explore the catalogue</Link>
        </Button>
      </div>
    );
  }

  const method = shippingMethods.find((item) => item.id === shippingMethodId) ?? shippingMethods[0];
  const selectedAddress = newAddressOpen
    ? addressDraft
    : savedAddresses.find((address) => address.id === selectedAddressId) ?? defaultAddress ?? addressDraft;

  const validateAddress = () => {
    const next: Record<string, string> = {};
    if (!newAddressOpen && selectedAddress?.id) return next;
    if (addressDraft.recipientName.trim().length < 2) next.recipientName = "Who should receive this?";
    if (addressDraft.phone.replace(/\D/g, "").length < 7) next.phone = "Enter a valid phone number.";
    if (!addressDraft.line1.trim()) next.line1 = "Street address is required.";
    if (!addressDraft.city.trim()) next.city = "City is required.";
    if (!addressDraft.state.trim()) next.state = "State or region is required.";
    if (!addressDraft.postalCode.trim()) next.postalCode = "Postal code is required.";
    if (!addressDraft.country.trim()) next.country = "Country is required.";
    return next;
  };

  const validatePayment = () => {
    const next: Record<string, string> = {};
    if (provider === "stripe") {
      if (card.name.trim().length < 2) next.cardName = "Name on card is required.";
      if (card.number.replace(/\s/g, "").length !== 16) next.cardNumber = "Enter a 16-digit card number.";
      if (!/^\d{2}\/\d{2}$/.test(card.expiry)) next.cardExpiry = "Use MM/YY.";
      if (!/^\d{3,4}$/.test(card.cvc)) next.cardCvc = "3 or 4 digits.";
    }
    if (provider === "razorpay" && !/^[\w.-]+@[\w.-]+$/.test(upi.trim())) {
      next.upi = "Enter a valid UPI ID, e.g. name@bank.";
    }
    return next;
  };

  const nextStep = () => {
    const next = step === 0 ? validateAddress() : validatePayment();
    setErrors(next);
    if (Object.keys(next).length > 0) {
      toast.error("A few details need attention.");
      return;
    }
    if (step === 0 && newAddressOpen && saveAddress && !selectedAddress.id) {
      const prepared: Address = {
        ...addressDraft,
        id: uid("addr"),
        recipientName: addressDraft.recipientName.trim(),
        phone: addressDraft.phone.trim(),
        line1: addressDraft.line1.trim(),
        line2: addressDraft.line2?.trim(),
        city: addressDraft.city.trim(),
        state: addressDraft.state.trim(),
        postalCode: addressDraft.postalCode.trim(),
        country: addressDraft.country.trim(),
      };
      setAddressDraft(prepared);
      setSelectedAddressId(prepared.id ?? null);
      updateProfile({
        addresses: [
          ...savedAddresses.map((address) => (prepared.isDefault ? { ...address, isDefault: false } : address)),
          prepared,
        ],
      });
    }
    setStep((current) => Math.min(2, current + 1));
  };

  const placeOrder = () => {
    if (!selectedAddress || processing) return;
    setProcessing(true);

    window.setTimeout(() => {
      const now = new Date().toISOString();
      const orderId = uid("order");
      const year = new Date().getFullYear();
      const orderNumber = `NXV-${year}-${String(Math.floor(1000 + Math.random() * 9000))}`;

      const items: OrderItem[] = lines.map((line, index) => {
        const lineTotal = roundCurrency(line.price * line.quantity);
        const commissionRate = 12;
        const platformFee = roundCurrency((lineTotal * commissionRate) / 100);
        return {
          id: `${orderId}-i${index + 1}`,
          productId: line.productId,
          slug: line.slug,
          title: line.title,
          image: line.thumbnail,
          sku: line.productId.toUpperCase(),
          price: line.price,
          quantity: line.quantity,
          variant: line.variant,
          variantLabel: line.variantLabel,
          lineTotal,
          vendorId: line.vendorId,
          storeId: line.storeId,
          storeName: line.storeName,
          commissionRate,
          platformFee,
          vendorPayout: roundCurrency(lineTotal - platformFee),
          status: "confirmed",
        };
      });

      const transfers: SplitTransfer[] = Object.values(
        items.reduce<Record<string, SplitTransfer>>((acc, item) => {
          const current = acc[item.storeId] ?? {
            vendorId: item.vendorId,
            storeName: item.storeName,
            amount: 0,
            commission: 0,
            status: provider === "cod" ? "pending" : "paid",
            transferId: provider === "cod" ? undefined : uid("tr"),
          };
          current.amount = roundCurrency(current.amount + item.vendorPayout);
          current.commission = roundCurrency(current.commission + item.platformFee);
          acc[item.storeId] = current;
          return acc;
        }, {}),
      );

      const statusNote =
        provider === "cod"
          ? "Order confirmed. Payment will be collected on delivery."
          : "Payment captured and order accepted.";

      const order: Order = {
        id: orderId,
        orderNumber,
        customerId: user.id,
        customerName: user.name,
        customerEmail: user.email,
        items,
        shippingAddress: selectedAddress,
        totals: {
          itemsTotal: totals.subtotal,
          discount: totals.discount,
          shippingFee: totals.shipping,
          tax: totals.tax,
          grandTotal: totals.total,
          currency: lines[0]?.currency ?? "USD",
        },
        payment: {
          provider,
          method:
            provider === "stripe"
              ? `Visa ending ${card.number.replace(/\s/g, "").slice(-4)}`
              : provider === "razorpay"
                ? upi.trim()
                : "Cash on delivery",
          status: provider === "cod" ? "pending" : "paid",
          paidAt: provider === "cod" ? undefined : now,
          paymentIntentId: provider === "cod" ? undefined : uid(provider === "stripe" ? "pi" : "pay"),
          transfers,
        },
        coupon: coupon ? { code: coupon.code, discount: totals.discount } : undefined,
        shippingMethod: method,
        status: "confirmed",
        statusHistory: [
          { status: "pending", note: "Order created and awaiting payment confirmation.", at: now },
          { status: "confirmed", note: statusNote, at: now },
        ],
        placedAt: now,
      };

      addOrder(order);
      useDemoStore.setState((state) => ({
        products: state.products.map((product) => {
          const purchased = lines
            .filter((line) => line.productId === product.id)
            .reduce((sum, line) => sum + line.quantity, 0);
          return purchased > 0
            ? { ...product, stock: Math.max(0, product.stock - purchased), soldCount: product.soldCount + purchased }
            : product;
        }),
      }));

      clearCart();
      setProcessing(false);
      toast.success("Order placed", { description: `Confirmation for #${orderNumber} is on its way.` });
      router.push(`/checkout/success?order=${orderNumber}`);
    }, 1100);
  };

  return (
    <div className="container-page py-8 lg:py-10">
      <Link
        href="/cart"
        className="inline-flex items-center gap-1.5 text-[0.68rem] font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Back to cart
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Secure checkout
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
            Almost yours.
          </h1>
        </div>
        <p className="flex items-center gap-1.5 text-[0.65rem] text-muted-foreground">
          <LockKeyhole className="size-3.5" /> Encrypted and buyer-protected
        </p>
      </div>

      <div className="mt-7 flex items-center gap-2 sm:gap-4">
        {steps.map((item, index) => {
          const complete = index < step;
          const active = index === step;
          return (
            <div key={item.label} className="flex flex-1 items-center gap-2 sm:gap-3">
              <button
                onClick={() => index < step && setStep(index)}
                disabled={index > step}
                className={cn(
                  "flex items-center gap-2 text-left",
                  index < step && "cursor-pointer",
                  index > step && "cursor-default",
                )}
              >
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full border text-xs font-semibold transition-colors",
                    complete && "border-primary bg-primary text-primary-foreground",
                    active && "border-primary bg-primary/[0.06] text-primary",
                    !complete && !active && "border-border bg-card text-muted-foreground",
                  )}
                >
                  {complete ? <Check className="size-4" /> : <item.icon className="size-3.5" />}
                </span>
                <span className={cn("text-[0.7rem] font-semibold", active ? "text-foreground" : "text-muted-foreground")}>
                  {item.label}
                </span>
              </button>
              {index < steps.length - 1 && (
                <span className={cn("h-px flex-1", index < step ? "bg-primary" : "bg-border")} />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <div className="space-y-4">
          {step === 0 && (
            <>
              <section className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="flex items-center gap-2 text-sm font-semibold">
                    <MapPin className="size-4 text-muted-foreground" /> Delivery address
                  </h2>
                  {savedAddresses.length > 0 && (
                    <button
                      onClick={() => setNewAddressOpen((value) => !value)}
                      className="text-[0.65rem] font-semibold text-primary hover:underline"
                    >
                      {newAddressOpen ? "Use saved address" : "Use a new address"}
                    </button>
                  )}
                </div>

                {!newAddressOpen ? (
                  <div className="mt-3 space-y-2">
                    {savedAddresses.map((address) => {
                      const active = selectedAddressId === address.id;
                      return (
                        <button
                          key={address.id}
                          onClick={() => setSelectedAddressId(address.id ?? null)}
                          className={cn(
                            "flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-colors",
                            active ? "border-primary bg-primary/[0.03]" : "border-border hover:border-foreground/20",
                          )}
                        >
                          <span
                            className={cn(
                              "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border",
                              active ? "border-primary bg-primary text-primary-foreground" : "border-border",
                            )}
                          >
                            {active && <span className="size-1.5 rounded-full bg-current" />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2">
                              <span className="text-xs font-semibold">{address.recipientName}</span>
                              {address.isDefault && <Badge variant="accent" className="text-[0.5rem]">Default</Badge>}
                            </span>
                            <span className="mt-0.5 block text-[0.65rem] leading-relaxed text-muted-foreground">
                              {address.line1}
                              {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state}{" "}
                              {address.postalCode}, {address.country}
                            </span>
                            <span className="block text-[0.62rem] text-muted-foreground">{address.phone}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
                    <Field label="Recipient" error={errors.recipientName} className="sm:col-span-2">
                      <Input
                        value={addressDraft.recipientName}
                        onChange={(event) => setAddressDraft({ ...addressDraft, recipientName: event.target.value })}
                        placeholder="Full name"
                      />
                    </Field>
                    <Field label="Phone" error={errors.phone}>
                      <Input
                        value={addressDraft.phone}
                        onChange={(event) => setAddressDraft({ ...addressDraft, phone: event.target.value })}
                        placeholder="+1 415 555 0100"
                      />
                    </Field>
                    <Field label="Country" error={errors.country}>
                      <Input
                        value={addressDraft.country}
                        onChange={(event) => setAddressDraft({ ...addressDraft, country: event.target.value })}
                        placeholder="United States"
                      />
                    </Field>
                    <Field label="Street address" error={errors.line1} className="sm:col-span-2">
                      <Input
                        value={addressDraft.line1}
                        onChange={(event) => setAddressDraft({ ...addressDraft, line1: event.target.value })}
                        placeholder="1450 Valencia Street"
                      />
                    </Field>
                    <Field label="Apartment, suite" optional className="sm:col-span-2">
                      <Input
                        value={addressDraft.line2 ?? ""}
                        onChange={(event) => setAddressDraft({ ...addressDraft, line2: event.target.value })}
                        placeholder="Flat 3"
                      />
                    </Field>
                    <Field label="City" error={errors.city}>
                      <Input
                        value={addressDraft.city}
                        onChange={(event) => setAddressDraft({ ...addressDraft, city: event.target.value })}
                      />
                    </Field>
                    <Field label="State / region" error={errors.state}>
                      <Input
                        value={addressDraft.state}
                        onChange={(event) => setAddressDraft({ ...addressDraft, state: event.target.value })}
                      />
                    </Field>
                    <Field label="Postal code" error={errors.postalCode}>
                      <Input
                        value={addressDraft.postalCode}
                        onChange={(event) => setAddressDraft({ ...addressDraft, postalCode: event.target.value })}
                      />
                    </Field>
                    <label className="flex items-center gap-2 self-end pb-2 text-[0.65rem] text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={saveAddress}
                        onChange={(event) => setSaveAddress(event.target.checked)}
                        className="size-3.5 rounded border-input accent-primary"
                      />
                      Save to my account
                    </label>
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-border bg-card p-5">
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  <Truck className="size-4 text-muted-foreground" /> Delivery method
                </h2>
                <div className="mt-3 space-y-2">
                  {shippingMethods.map((item) => {
                    const free = item.id === "standard" && totals.subtotal >= 100;
                    const active = shippingMethodId === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setShippingMethod(item.id)}
                        className={cn(
                          "flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-colors",
                          active ? "border-primary bg-primary/[0.03]" : "border-border hover:border-foreground/20",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border",
                            active ? "border-primary bg-primary text-primary-foreground" : "border-border",
                          )}
                        >
                          {active && <span className="size-1.5 rounded-full bg-current" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-2">
                            <span className="flex items-center gap-2 text-xs font-semibold">
                              {item.label}
                              {item.badge && <Badge variant="muted" className="text-[0.5rem]">{item.badge}</Badge>}
                            </span>
                            <span className="text-xs font-semibold tabular-nums">
                              {item.price === 0 || free ? "Free" : formatCurrency(item.price)}
                            </span>
                          </span>
                          <span className="mt-0.5 block text-[0.62rem] text-muted-foreground">
                            {item.description} · {item.eta}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <div className="flex justify-end">
                <Button size="lg" onClick={nextStep}>
                  Continue to payment <ArrowRight className="size-4" />
                </Button>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <section className="rounded-2xl border border-border bg-card p-5">
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  <Wallet className="size-4 text-muted-foreground" /> Payment method
                </h2>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {[
                    { id: "stripe" as const, label: "Card", hint: "Visa, Mastercard, Amex", icon: CreditCard },
                    { id: "razorpay" as const, label: "UPI", hint: "GPay, PhonePe, Paytm", icon: Smartphone },
                    { id: "cod" as const, label: "Cash on delivery", hint: "Pay at your door", icon: Landmark },
                  ].map((item) => {
                    const active = provider === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setProvider(item.id);
                          setErrors({});
                        }}
                        className={cn(
                          "rounded-xl border p-3 text-left transition-colors",
                          active ? "border-primary bg-primary/[0.03]" : "border-border hover:border-foreground/20",
                        )}
                      >
                        <item.icon className={cn("size-4", active ? "text-primary" : "text-muted-foreground")} />
                        <p className="mt-2 text-xs font-semibold">{item.label}</p>
                        <p className="text-[0.58rem] text-muted-foreground">{item.hint}</p>
                      </button>
                    );
                  })}
                </div>

                {provider === "stripe" && (
                  <div className="mt-5 space-y-3.5 border-t border-border pt-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[0.62rem] text-muted-foreground">
                        Demo checkout — use any 16 digits, no real charge.
                      </p>
                      <button
                        onClick={() =>
                          setCard({
                            name: user.name,
                            number: "4242 4242 4242 4242",
                            expiry: "12/29",
                            cvc: "424",
                          })
                        }
                        className="shrink-0 text-[0.62rem] font-semibold text-primary hover:underline"
                      >
                        Use test card
                      </button>
                    </div>
                    <Field label="Name on card" error={errors.cardName}>
                      <Input
                        value={card.name}
                        onChange={(event) => setCard({ ...card, name: event.target.value })}
                        autoComplete="cc-name"
                      />
                    </Field>
                    <Field label="Card number" error={errors.cardNumber}>
                      <div className="relative">
                        <CreditCard className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          value={card.number}
                          onChange={(event) => setCard({ ...card, number: formatCardNumber(event.target.value) })}
                          placeholder="4242 4242 4242 4242"
                          inputMode="numeric"
                          autoComplete="cc-number"
                          className="pl-10 font-mono"
                        />
                      </div>
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Expiry" error={errors.cardExpiry}>
                        <Input
                          value={card.expiry}
                          onChange={(event) => setCard({ ...card, expiry: formatExpiry(event.target.value) })}
                          placeholder="MM/YY"
                          inputMode="numeric"
                          autoComplete="cc-exp"
                          className="font-mono"
                        />
                      </Field>
                      <Field label="CVC" error={errors.cardCvc}>
                        <Input
                          value={card.cvc}
                          onChange={(event) => setCard({ ...card, cvc: event.target.value.replace(/\D/g, "").slice(0, 4) })}
                          placeholder="123"
                          inputMode="numeric"
                          autoComplete="cc-csc"
                          className="font-mono"
                        />
                      </Field>
                    </div>
                  </div>
                )}

                {provider === "razorpay" && (
                  <div className="mt-5 space-y-3 border-t border-border pt-4">
                    <Field label="UPI ID" error={errors.upi}>
                      <Input
                        value={upi}
                        onChange={(event) => setUpi(event.target.value)}
                        placeholder="name@bank"
                        autoComplete="off"
                      />
                    </Field>
                    <p className="text-[0.62rem] text-muted-foreground">
                      A collect request would open in your UPI app. This demo confirms instantly.
                    </p>
                  </div>
                )}

                {provider === "cod" && (
                  <div className="mt-5 rounded-xl bg-muted/60 p-3.5 text-[0.65rem] leading-relaxed text-muted-foreground">
                    Pay {formatCurrency(totals.total)} in cash when your order arrives. A small handling fee
                    may apply in some regions; vendor payouts settle after delivery.
                  </div>
                )}
              </section>

              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-xs font-semibold">Discount code</p>
                <div className="mt-2.5">
                  <CouponInput compact />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <Button variant="ghost" size="sm" onClick={() => setStep(0)}>
                  <ArrowLeft className="size-3.5" /> Back to delivery
                </Button>
                <Button size="lg" onClick={nextStep}>
                  Review order <ArrowRight className="size-4" />
                </Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <section className="rounded-2xl border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
                  <h2 className="text-sm font-semibold">Review & confirm</h2>
                  <Badge variant="success">Ready</Badge>
                </div>
                <div className="divide-y divide-border">
                  <div className="flex items-start justify-between gap-3 p-4 sm:px-5">
                    <div>
                      <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Deliver to
                      </p>
                      <p className="mt-1 text-xs font-semibold">{selectedAddress.recipientName}</p>
                      <p className="mt-0.5 text-[0.65rem] leading-relaxed text-muted-foreground">
                        {selectedAddress.line1}
                        {selectedAddress.line2 ? `, ${selectedAddress.line2}` : ""}, {selectedAddress.city},{" "}
                        {selectedAddress.state} {selectedAddress.postalCode}, {selectedAddress.country}
                      </p>
                      <p className="text-[0.62rem] text-muted-foreground">{selectedAddress.phone}</p>
                    </div>
                    <button onClick={() => setStep(0)} className="shrink-0 text-[0.62rem] font-semibold text-primary hover:underline">
                      Edit
                    </button>
                  </div>

                  <div className="flex items-start justify-between gap-3 p-4 sm:px-5">
                    <div>
                      <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Delivery method
                      </p>
                      <p className="mt-1 text-xs font-semibold">{method.label}</p>
                      <p className="mt-0.5 text-[0.65rem] text-muted-foreground">
                        {method.eta} ·{" "}
                        {totals.shipping === 0 ? "Free" : formatCurrency(totals.shipping)}
                      </p>
                    </div>
                    <button onClick={() => setStep(0)} className="shrink-0 text-[0.62rem] font-semibold text-primary hover:underline">
                      Edit
                    </button>
                  </div>

                  <div className="flex items-start justify-between gap-3 p-4 sm:px-5">
                    <div>
                      <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Payment
                      </p>
                      <p className="mt-1 text-xs font-semibold">
                        {provider === "stripe"
                          ? `Card ···· ${card.number.replace(/\s/g, "").slice(-4)}`
                          : provider === "razorpay"
                            ? `UPI · ${upi}`
                            : "Cash on delivery"}
                      </p>
                      <p className="mt-0.5 text-[0.65rem] text-muted-foreground">
                        {provider === "cod" ? "Due on delivery" : "Charged securely at confirmation"}
                      </p>
                    </div>
                    <button onClick={() => setStep(1)} className="shrink-0 text-[0.62rem] font-semibold text-primary hover:underline">
                      Edit
                    </button>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-border bg-card p-5">
                <h2 className="text-sm font-semibold">
                  {lines.length} {lines.length === 1 ? "item" : "items"} from{" "}
                  {new Set(lines.map((line) => line.storeId)).size}{" "}
                  {new Set(lines.map((line) => line.storeId)).size === 1 ? "maker" : "makers"}
                </h2>
                <div className="mt-3 space-y-2">
                  {lines.map((line) => (
                    <div key={line.key} className="flex items-center justify-between gap-3 text-xs">
                      <span className="min-w-0 truncate text-muted-foreground">
                        {line.quantity} × {line.title}
                        {line.variantLabel ? ` (${line.variantLabel})` : ""}
                      </span>
                      <span className="shrink-0 font-medium tabular-nums">
                        {formatCurrency(line.price * line.quantity, line.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" />
                  <p className="text-[0.65rem] leading-relaxed text-muted-foreground">
                    By placing this order you agree to Nexvia&apos;s{" "}
                    <Link href="/support#terms" className="font-semibold text-foreground underline-offset-2 hover:underline">
                      Terms
                    </Link>{" "}
                    and{" "}
                    <Link href="/support#returns" className="font-semibold text-foreground underline-offset-2 hover:underline">
                      returns policy
                    </Link>
                    . Your payment is held for 24 hours before vendor settlement.
                  </p>
                </div>
                <Button size="lg" className="mt-4 w-full" loading={processing} onClick={placeOrder}>
                  <LockKeyhole className="size-4" />
                  {provider === "cod"
                    ? `Place order · pay ${formatCurrency(totals.total)} on delivery`
                    : `Pay ${formatCurrency(totals.total)} & place order`}
                </Button>
                <p className="mt-2.5 text-center text-[0.6rem] text-muted-foreground">
                  Demo checkout — no real payment is processed.
                </p>
              </div>

              <div className="flex justify-start">
                <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                  <ArrowLeft className="size-3.5" /> Back to payment
                </Button>
              </div>
            </>
          )}

          {Object.keys(errors).length > 0 && (
            <div className="flex items-start gap-2 rounded-xl border border-danger/20 bg-danger/5 p-3 text-xs text-danger" role="alert">
              <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
              <span>Please fix the highlighted fields before continuing.</span>
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-28">
          <CheckoutSummary totals={totals} showItems />
          <div className="mt-3 flex items-center justify-center gap-4 text-[0.58rem] text-muted-foreground">
            <span className="flex items-center gap-1"><ShieldCheck className="size-3" /> Buyer protection</span>
            <span className="flex items-center gap-1"><Truck className="size-3" /> Tracked delivery</span>
            <span className="flex items-center gap-1"><LockKeyhole className="size-3" /> Secure</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
