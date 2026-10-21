"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Archive,
  Boxes,
  Eye,
  EyeOff,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types";
import { ProductImage } from "@/components/ui/product-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductFormDialog } from "@/components/vendor/product-form-dialog";
import { useMounted } from "@/hooks/use-mounted";
import { useProductMutations, useVendorWorkspace } from "@/hooks/queries";
import { formatCurrency, formatNumber } from "@/lib/utils";

const statusTabs = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "draft", label: "Drafts" },
  { id: "archived", label: "Archived" },
] as const;

export function VendorProducts() {
  const mounted = useMounted();
  const { vendor, products } = useVendorWorkspace();
  const { addProduct, updateProduct, deleteProduct } = useProductMutations();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof statusTabs)[number]["id"]>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const list = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return products
      .filter((product) => (status === "all" ? true : product.status === status))
      .filter(
        (product) =>
          !needle ||
          product.title.toLowerCase().includes(needle) ||
          product.sku.toLowerCase().includes(needle) ||
          product.categoryLabel.toLowerCase().includes(needle),
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [products, status, query]);

  const stats = useMemo(
    () => ({
      total: products.length,
      active: products.filter((product) => product.status === "active").length,
      low: products.filter((product) => product.stock <= 10).length,
      value: products.reduce((sum, product) => sum + product.price * product.stock, 0),
    }),
    [products],
  );

  if (!mounted) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-56" />
        <div className="grid gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setFormOpen(true);
  };

  const toggleStatus = (product: Product) => {
    const next = product.status === "active" ? "archived" : "active";
    updateProduct(product.id, { status: next });
    toast.success(next === "active" ? "Product published" : "Product archived", { description: product.title });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Catalogue</p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">Products</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {vendor.name} · {stats.total} objects in your catalogue
          </p>
        </div>
        <Button size="sm" onClick={openNew}>
          <Plus className="size-3.5" /> Add product
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {[
          { label: "Total products", value: formatNumber(stats.total), icon: Package },
          { label: "Live listings", value: formatNumber(stats.active), icon: Eye },
          { label: "Low stock", value: formatNumber(stats.low), icon: AlertTriangle },
          { label: "Inventory value", value: formatCurrency(stats.value), icon: TrendingUp },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-3.5">
            <stat.icon className="size-3.5 text-muted-foreground" />
            <p className="mt-2 text-lg font-semibold tabular-nums">{stat.value}</p>
            <p className="text-[0.6rem] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1 overflow-x-auto">
            {statusTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatus(tab.id)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[0.65rem] font-medium transition-colors ${
                  status === tab.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {tab.label}
                <span className="ml-1 opacity-60">
                  {tab.id === "all" ? products.length : products.filter((product) => product.status === tab.id).length}
                </span>
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, SKU, category…"
              className="h-9 rounded-full pl-8 text-xs"
              aria-label="Search products"
            />
          </div>
        </div>

        {list.length === 0 ? (
          <div className="p-10 text-center">
            <Boxes className="mx-auto size-7 text-muted-foreground/50" />
            <p className="mt-3 text-sm font-semibold">{query ? "No products match that" : "No products here yet"}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {query ? "Try a different search or status." : "Add your first object to open the storefront."}
            </p>
            {!query && <Button size="sm" className="mt-4" onClick={openNew}><Plus className="size-3.5" /> Add product</Button>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-border text-[0.55rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  <th className="px-4 py-2.5">Product</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right">Price</th>
                  <th className="px-4 py-2.5 text-right">Stock</th>
                  <th className="px-4 py-2.5 text-right">Sold</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {list.map((product) => (
                  <tr key={product.id} className="group text-xs transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ProductImage src={product.thumbnail} alt={product.title} className="size-10 rounded-lg" sizes="40px" />
                        <div className="min-w-0">
                          <p className="max-w-52 truncate font-semibold">{product.title}</p>
                          <p className="text-[0.58rem] text-muted-foreground">
                            {product.sku} · {product.categoryLabel}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={product.status === "active" ? "success" : product.status === "draft" ? "muted" : "warning"}
                        className="text-[0.5rem]"
                      >
                        {product.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatCurrency(product.price, product.currency)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={
                          product.stock === 0
                            ? "font-semibold text-danger"
                            : product.stock <= 10
                              ? "font-semibold text-amber-600 dark:text-amber-300"
                              : "tabular-nums"
                        }
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                      {formatNumber(product.soldCount)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/products/${product.slug}`}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          aria-label={`View ${product.title}`}
                        >
                          <Eye className="size-3.5" />
                        </Link>
                        <button
                          onClick={() => openEdit(product)}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          aria-label={`Edit ${product.title}`}
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          onClick={() => toggleStatus(product)}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          aria-label={product.status === "active" ? "Archive product" : "Publish product"}
                        >
                          {product.status === "active" ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                        </button>
                        <button
                          onClick={() => setDeleteTarget(product)}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-danger/5 hover:text-danger"
                          aria-label={`Delete ${product.title}`}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ProductFormDialog
        key={`${editing?.id ?? "new"}-${formOpen}`}
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editing}
        vendorId={vendor.ownerId}
        storeId={vendor.id}
        storeName={vendor.name}
        onSave={(product) => {
          if (editing) updateProduct(editing.id, product);
          else addProduct(product);
        }}
      />

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(value) => !value && setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Archive className="size-5 text-danger" /> Delete product?
            </DialogTitle>
            <DialogDescription>
              “{deleteTarget?.title}” will be removed from the catalogue. This can&apos;t be undone in the demo
              workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (!deleteTarget) return;
                deleteProduct(deleteTarget.id);
                toast.success("Product deleted", { description: deleteTarget.title });
                setDeleteTarget(null);
              }}
            >
              Delete permanently
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
