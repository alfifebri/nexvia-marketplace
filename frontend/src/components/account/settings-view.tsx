"use client";

import { useState } from "react";
import {
  AlertCircle,
  Check,
  LockKeyhole,
  MapPin,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import type { Address } from "@/types";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/auth-store";
import { updatePasswordRequest } from "@/lib/services/auth-service";
import { getApiErrorMessage } from "@/lib/api";
import { cn, uid } from "@/lib/utils";

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

export function SettingsView() {
  const user = useAuthStore((state) => state.user);
  const mode = useAuthStore((state) => state.mode);
  const updateProfile = useAuthStore((state) => state.updateProfile);

  const [profile, setProfile] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    avatar: user?.avatar ?? "",
  });
  const [profilePending, setProfilePending] = useState(false);

  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [passwordError, setPasswordError] = useState("");
  const [passwordPending, setPasswordPending] = useState(false);

  const [addressOpen, setAddressOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addressDraft, setAddressDraft] = useState<Address>(emptyAddress);
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});

  const addresses = user?.addresses ?? [];

  if (!user) return null;

  const saveProfile = (event: React.FormEvent) => {
    event.preventDefault();
    if (profile.name.trim().length < 2) {
      toast.error("Please enter your full name.");
      return;
    }
    setProfilePending(true);
    updateProfile({
      name: profile.name.trim(),
      email: profile.email.trim(),
      phone: profile.phone.trim(),
      avatar: profile.avatar.trim(),
    });
    window.setTimeout(() => {
      setProfilePending(false);
      toast.success("Profile updated", { description: "Changes are saved to this browser." });
    }, 350);
  };

  const savePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordError("");
    if (!passwords.current) {
      setPasswordError("Enter your current password.");
      return;
    }
    if (passwords.next.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (passwords.next !== passwords.confirm) {
      setPasswordError("New passwords don't match.");
      return;
    }
    if (passwords.next === passwords.current) {
      setPasswordError("Choose a password you haven't used here before.");
      return;
    }

    setPasswordPending(true);
    try {
      if (mode === "demo") {
        await new Promise((resolve) => setTimeout(resolve, 450));
        toast.success("Password updated (demo workspace)", {
          description: "The live API isn't connected, so this change is simulated.",
        });
      } else {
        await updatePasswordRequest({ currentPassword: passwords.current, newPassword: passwords.next });
        toast.success("Password updated.");
      }
      setPasswords({ current: "", next: "", confirm: "" });
    } catch (error) {
      setPasswordError(getApiErrorMessage(error));
    } finally {
      setPasswordPending(false);
    }
  };

  const openNewAddress = () => {
    setEditingId(null);
    setAddressDraft({ ...emptyAddress, isDefault: addresses.length === 0, country: addresses[0]?.country ?? "" });
    setAddressErrors({});
    setAddressOpen(true);
  };

  const openEditAddress = (address: Address) => {
    setEditingId(address.id ?? null);
    setAddressDraft({ ...address });
    setAddressErrors({});
    setAddressOpen(true);
  };

  const saveAddress = () => {
    const errors: Record<string, string> = {};
    if (addressDraft.recipientName.trim().length < 2) errors.recipientName = "Who receives this order?";
    if (addressDraft.phone.replace(/\D/g, "").length < 7) errors.phone = "Enter a valid phone number.";
    if (!addressDraft.line1.trim()) errors.line1 = "Street address is required.";
    if (!addressDraft.city.trim()) errors.city = "City is required.";
    if (!addressDraft.state.trim()) errors.state = "State or region is required.";
    if (!addressDraft.postalCode.trim()) errors.postalCode = "Postal code is required.";
    if (!addressDraft.country.trim()) errors.country = "Country is required.";
    setAddressErrors(errors);
    if (Object.keys(errors).length > 0) return;

    let next = [...addresses];
    const prepared: Address = {
      ...addressDraft,
      id: editingId ?? uid("addr"),
      recipientName: addressDraft.recipientName.trim(),
      phone: addressDraft.phone.trim(),
      line1: addressDraft.line1.trim(),
      line2: addressDraft.line2?.trim(),
      city: addressDraft.city.trim(),
      state: addressDraft.state.trim(),
      postalCode: addressDraft.postalCode.trim(),
      country: addressDraft.country.trim(),
    };

    if (prepared.isDefault) {
      next = next.map((address) => ({ ...address, isDefault: false }));
    }

    if (editingId) {
      next = next.map((address) => (address.id === editingId ? prepared : address));
    } else {
      next = [...next, prepared];
    }

    updateProfile({ addresses: next });
    setAddressOpen(false);
    toast.success(editingId ? "Address updated" : "Address added");
  };

  const removeAddress = (id?: string) => {
    if (!id) return;
    const next = addresses.filter((address) => address.id !== id);
    if (next.length > 0 && !next.some((address) => address.isDefault)) {
      next[0] = { ...next[0], isDefault: true };
    }
    updateProfile({ addresses: next });
    toast.success("Address removed");
  };

  const setDefaultAddress = (id?: string) => {
    if (!id) return;
    updateProfile({
      addresses: addresses.map((address) => ({ ...address, isDefault: address.id === id })),
    });
    toast.success("Default address updated");
  };

  return (
    <div>
      <div>
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Account
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Settings</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Profile, delivery addresses and sign-in security.
        </p>
      </div>

      <Tabs defaultValue="profile" className="mt-7">
        <TabsList className="h-auto flex-wrap rounded-xl">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <form onSubmit={saveProfile} className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-4">
              <Avatar src={profile.avatar || undefined} name={profile.name || user.name} size="lg" />
              <div>
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-[0.68rem] text-muted-foreground capitalize">
                  {user.role} account · joined{" "}
                  {user.createdAt ? new Date(user.createdAt).getFullYear() : "—"}
                </p>
                {user.isEmailVerified && (
                  <span className="mt-1 inline-flex items-center gap-1 text-[0.6rem] font-semibold text-success">
                    <ShieldCheck className="size-3" /> Email verified
                  </span>
                )}
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Full name" htmlFor="settings-name">
                <Input
                  id="settings-name"
                  value={profile.name}
                  onChange={(event) => setProfile({ ...profile, name: event.target.value })}
                  autoComplete="name"
                />
              </Field>
              <Field label="Email address" htmlFor="settings-email">
                <Input
                  id="settings-email"
                  type="email"
                  value={profile.email}
                  onChange={(event) => setProfile({ ...profile, email: event.target.value })}
                  autoComplete="email"
                />
              </Field>
              <Field label="Phone" htmlFor="settings-phone" optional>
                <Input
                  id="settings-phone"
                  value={profile.phone}
                  onChange={(event) => setProfile({ ...profile, phone: event.target.value })}
                  autoComplete="tel"
                />
              </Field>
              <Field label="Avatar URL" htmlFor="settings-avatar" optional>
                <Input
                  id="settings-avatar"
                  value={profile.avatar}
                  onChange={(event) => setProfile({ ...profile, avatar: event.target.value })}
                  placeholder="https://…"
                />
              </Field>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <p className="text-[0.62rem] text-muted-foreground">
                {mode === "demo"
                  ? "Demo workspace · profile edits are stored locally in this browser."
                  : "Profile changes sync through the Nexvia API."}
              </p>
              <Button type="submit" size="sm" loading={profilePending}>
                Save changes
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="addresses">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {addresses.length} saved {addresses.length === 1 ? "address" : "addresses"} · used at checkout
            </p>
            <Button size="sm" onClick={openNewAddress}>
              <Plus className="size-3.5" /> Add address
            </Button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {addresses.map((address) => (
              <article
                key={address.id}
                className={cn(
                  "rounded-2xl border bg-card p-4",
                  address.isDefault ? "border-primary/40" : "border-border",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="size-3.5 text-muted-foreground" />
                    <p className="text-xs font-semibold">{address.label ?? "Address"}</p>
                    {address.isDefault && <Badge variant="accent">Default</Badge>}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditAddress(address)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                      aria-label="Edit address"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      onClick={() => removeAddress(address.id)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-danger/5 hover:text-danger"
                      aria-label="Remove address"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
                <address className="mt-3 text-xs not-italic leading-relaxed text-foreground/80">
                  <span className="block font-medium text-foreground">{address.recipientName}</span>
                  {address.line1}
                  {address.line2 ? `, ${address.line2}` : ""}
                  <br />
                  {address.city}, {address.state} {address.postalCode}
                  <br />
                  {address.country}
                  <br />
                  <span className="text-muted-foreground">{address.phone}</span>
                </address>
                {!address.isDefault && (
                  <button
                    onClick={() => setDefaultAddress(address.id)}
                    className="mt-3 text-[0.62rem] font-semibold text-primary hover:underline"
                  >
                    Make default
                  </button>
                )}
              </article>
            ))}

            {addresses.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center sm:col-span-2">
                <MapPin className="mx-auto size-7 text-muted-foreground/50" />
                <p className="mt-3 text-sm font-semibold">No addresses yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Add one now, or save it during checkout.
                </p>
                <Button size="sm" className="mt-4" onClick={openNewAddress}>
                  <Plus className="size-3.5" /> Add your first address
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="security">
          <form onSubmit={savePassword} className="max-w-lg rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-full bg-primary/10 text-primary">
                <LockKeyhole className="size-4" />
              </span>
              <div>
                <h2 className="text-sm font-semibold">Change password</h2>
                <p className="text-[0.62rem] text-muted-foreground">
                  Use at least 8 characters with a mix of letters and numbers.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <Field label="Current password" htmlFor="current-password">
                <Input
                  id="current-password"
                  type="password"
                  value={passwords.current}
                  onChange={(event) => setPasswords({ ...passwords, current: event.target.value })}
                  autoComplete="current-password"
                />
              </Field>
              <Field label="New password" htmlFor="new-password">
                <Input
                  id="new-password"
                  type="password"
                  value={passwords.next}
                  onChange={(event) => setPasswords({ ...passwords, next: event.target.value })}
                  autoComplete="new-password"
                />
              </Field>
              <Field label="Confirm new password" htmlFor="confirm-password">
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwords.confirm}
                  onChange={(event) => setPasswords({ ...passwords, confirm: event.target.value })}
                  autoComplete="new-password"
                />
              </Field>
            </div>

            {passwordError && (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-danger/20 bg-danger/5 p-3 text-xs text-danger" role="alert">
                <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
              <p className="flex items-center gap-1.5 text-[0.6rem] text-muted-foreground">
                <Check className="size-3 text-success" /> Sessions on other devices stay active
              </p>
              <Button type="submit" size="sm" loading={passwordPending}>
                Update password
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>

      <Dialog open={addressOpen} onOpenChange={setAddressOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit address" : "Add an address"}</DialogTitle>
            <DialogDescription>Saved addresses are available at checkout.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Recipient name" error={addressErrors.recipientName} className="sm:col-span-2">
              <Input
                value={addressDraft.recipientName}
                onChange={(event) => setAddressDraft({ ...addressDraft, recipientName: event.target.value })}
                placeholder="Riya Sharma"
              />
            </Field>
            <Field label="Phone" error={addressErrors.phone}>
              <Input
                value={addressDraft.phone}
                onChange={(event) => setAddressDraft({ ...addressDraft, phone: event.target.value })}
                placeholder="+91 98765 43210"
              />
            </Field>
            <Field label="Label" optional>
              <Input
                value={addressDraft.label ?? ""}
                onChange={(event) => setAddressDraft({ ...addressDraft, label: event.target.value })}
                placeholder="Home"
              />
            </Field>
            <Field label="Street address" error={addressErrors.line1} className="sm:col-span-2">
              <Input
                value={addressDraft.line1}
                onChange={(event) => setAddressDraft({ ...addressDraft, line1: event.target.value })}
                placeholder="402, Willow Residency"
              />
            </Field>
            <Field label="Apartment, suite (optional)" className="sm:col-span-2">
              <Input
                value={addressDraft.line2 ?? ""}
                onChange={(event) => setAddressDraft({ ...addressDraft, line2: event.target.value })}
                placeholder="12th Main, Indiranagar"
              />
            </Field>
            <Field label="City" error={addressErrors.city}>
              <Input
                value={addressDraft.city}
                onChange={(event) => setAddressDraft({ ...addressDraft, city: event.target.value })}
              />
            </Field>
            <Field label="State / region" error={addressErrors.state}>
              <Input
                value={addressDraft.state}
                onChange={(event) => setAddressDraft({ ...addressDraft, state: event.target.value })}
              />
            </Field>
            <Field label="Postal code" error={addressErrors.postalCode}>
              <Input
                value={addressDraft.postalCode}
                onChange={(event) => setAddressDraft({ ...addressDraft, postalCode: event.target.value })}
              />
            </Field>
            <Field label="Country" error={addressErrors.country}>
              <Input
                value={addressDraft.country}
                onChange={(event) => setAddressDraft({ ...addressDraft, country: event.target.value })}
              />
            </Field>
          </div>

          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={Boolean(addressDraft.isDefault)}
              onChange={(event) => setAddressDraft({ ...addressDraft, isDefault: event.target.checked })}
              className="size-3.5 rounded border-input accent-primary"
            />
            Make this my default delivery address
          </label>

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button variant="ghost" size="sm" onClick={() => setAddressOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={saveAddress}>
              <UserRound className="size-3.5" /> Save address
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
