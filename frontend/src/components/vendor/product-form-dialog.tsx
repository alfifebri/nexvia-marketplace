"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categories, categoryLabel } from "@/lib/constants";
import { discountPercent, slugify, uid } from "@/lib/utils";

const fallbackImage =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  vendorId: string;
  storeId: string;
  storeName: string;
  onSave: (product: Product) => void;
}

interface FormState {
  title: string;
  subtitle: string;
  description: string;
  price: string;
  compareAt: string;
  category: string;
  brand: string;
  stock: string;
  sku: string;
  thumbnail: string;
  status: Product["status"];
  tags: string;
  highlights: string;
}

const emptyForm: FormState = {
  title: "",
  subtitle: "",
  description: "",
  price: "",
  compareAt: "",
  category: "audio",
  brand: "",
  stock: "20",
  sku: "",
  thumbnail: "",
  status: "draft",
  tags: "",
  highlights: "",
};

const toFormState = (product: Product): FormState => ({
  title: product.title,
  subtitle: product.subtitle,
  description: product.description,
  price: String(product.price),
  compareAt: product.compareAtPrice ? String(product.compareAtPrice) : "",
  category: product.category,
  brand: product.brand,
  stock: String(product.stock),
  sku: product.sku,
  thumbnail: product.thumbnail,
  status: product.status,
  tags: product.tags.join(", "),
  highlights: product.highlights.join("\n"),
});

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  vendorId,
  storeId,
  storeName,
  onSave,
}: ProductFormDialogProps) {
  const [form, setForm] = useState<FormState>(() => (product ? toFormState(product) : emptyForm));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (patch: Partial<FormState>) => setForm((current) => ({ ...current, ...patch }));

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (form.title.trim().length < 3) next.title = "Product name is too short.";
    if (!form.subtitle.trim()) next.subtitle = "Add a short subtitle.";
    if (form.description.trim().length < 20) next.description = "Write at least a couple of sentences.";
    if (!form.price || Number(form.price) <= 0) next.price = "Enter a price above zero.";
    if (form.compareAt && Number(form.compareAt) <= Number(form.price)) {
      next.compareAt = "Compare-at should be higher than the price.";
    }
    if (!form.brand.trim()) next.brand = "Brand is required.";
    if (!form.stock || Number(form.stock) < 0) next.stock = "Enter available stock.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const thumbnail = form.thumbnail.trim() || product?.thumbnail || fallbackImage;
    const title = form.title.trim();
    const highlights = form.highlights
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const tags = form.tags
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);
    const price = Number(form.price);
    const compareAt = form.compareAt ? Number(form.compareAt) : undefined;

    const saved: Product = {
      id: product?.id ?? uid("p"),
      slug: product?.slug ?? `${slugify(title)}-${Math.random().toString(36).slice(2, 6)}`,
      title,
      subtitle: form.subtitle.trim(),
      description: form.description.trim(),
      highlights: highlights.length > 0 ? highlights : product?.highlights ?? [],
      price,
      compareAtPrice: compareAt,
      currency: product?.currency ?? "USD",
      category: form.category,
      categoryLabel: categoryLabel(form.category),
      brand: form.brand.trim(),
      images: product?.images?.length ? [thumbnail, ...product.images.slice(1)] : [thumbnail],
      thumbnail,
      rating: product?.rating ?? { rate: 0, count: 0 },
      stock: Number(form.stock),
      sku: form.sku.trim() || `NVX-${title.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      discountPercentage: discountPercent(price, compareAt),
      tags: tags.length > 0 ? tags : product?.tags ?? [],
      attributes: product?.attributes ?? { Brand: form.brand.trim(), Origin: "Independent studio" },
      variants: product?.variants ?? [],
      warrantyInformation: product?.warrantyInformation ?? "2-year Nexvia-backed warranty.",
      shippingInformation: product?.shippingInformation ?? "Ships within 1–2 business days.",
      returnPolicy: product?.returnPolicy ?? "30-day free returns.",
      vendorId: product?.vendorId ?? vendorId,
      storeId: product?.storeId ?? storeId,
      storeName: product?.storeName ?? storeName,
      status: form.status,
      isFeatured: product?.isFeatured ?? false,
      soldCount: product?.soldCount ?? 0,
      source: product?.source ?? "manual",
      createdAt: product?.createdAt ?? new Date().toISOString(),
    };

    onSave(saved);
    onOpenChange(false);
    toast.success(product ? "Product updated" : "Product created", { description: saved.title });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Edit product" : "Add a product"}</DialogTitle>
          <DialogDescription>
            {product
              ? "Changes go live on your storefront immediately."
              : "Draft first, publish when it's ready for the catalogue."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Product name" error={errors.title} className="sm:col-span-2">
              <Input value={form.title} onChange={(event) => update({ title: event.target.value })} placeholder="Arc Two Headphones" />
            </Field>
            <Field label="Subtitle" error={errors.subtitle} className="sm:col-span-2">
              <Input value={form.subtitle} onChange={(event) => update({ subtitle: event.target.value })} placeholder="Adaptive sound, lighter than air" />
            </Field>
            <Field label="Description" error={errors.description} className="sm:col-span-2">
              <Textarea
                value={form.description}
                onChange={(event) => update({ description: event.target.value })}
                placeholder="What makes this object worth keeping…"
                className="min-h-28"
              />
            </Field>
            <Field label="Price (USD)" error={errors.price}>
              <Input type="number" min="0" step="0.01" value={form.price} onChange={(event) => update({ price: event.target.value })} placeholder="249" />
            </Field>
            <Field label="Compare-at price" optional error={errors.compareAt}>
              <Input type="number" min="0" step="0.01" value={form.compareAt} onChange={(event) => update({ compareAt: event.target.value })} placeholder="299" />
            </Field>
            <Field label="Brand" error={errors.brand}>
              <Input value={form.brand} onChange={(event) => update({ brand: event.target.value })} placeholder="Nova Audio" />
            </Field>
            <Field label="Stock" error={errors.stock}>
              <Input type="number" min="0" value={form.stock} onChange={(event) => update({ stock: event.target.value })} />
            </Field>
            <Field label="Category">
              <Select value={form.category} onValueChange={(value) => update({ category: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.slug} value={category.slug}>{category.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Status">
              <Select value={form.status} onValueChange={(value) => update({ status: value as Product["status"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="SKU" optional>
              <Input value={form.sku} onChange={(event) => update({ sku: event.target.value })} placeholder="NOVA-ARC-02" />
            </Field>
            <Field label="Image URL" optional className="sm:col-span-2">
              <Input value={form.thumbnail} onChange={(event) => update({ thumbnail: event.target.value })} placeholder="https://images.unsplash.com/…" />
            </Field>
            <Field label="Tags" optional hint="Comma separated" className="sm:col-span-2">
              <Input value={form.tags} onChange={(event) => update({ tags: event.target.value })} placeholder="audio, wireless, travel" />
            </Field>
            <Field label="Highlights" optional hint="One per line" className="sm:col-span-2">
              <Textarea
                value={form.highlights}
                onChange={(event) => update({ highlights: event.target.value })}
                placeholder={"40-hour battery\nReplaceable earpads"}
                className="min-h-20"
              />
            </Field>
          </div>

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">{product ? "Save changes" : "Create product"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
