"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronRight,
  LayoutGrid,
  List,
  Plus,
  Search,
  SearchX,
  ShoppingBag,
  SlidersHorizontal,
  Star,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { Product, ProductFilters } from "@/types";
import { ProductCard } from "@/components/products/product-card";
import { FilterPanel } from "@/components/products/filter-panel";
import { ProductImage } from "@/components/ui/product-image";
import { Rating } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import { useCatalog } from "@/hooks/queries";
import { useDebounce } from "@/hooks/use-debounce";
import { useCartStore } from "@/stores/cart-store";
import { activeFilterCount, serializeFilters } from "@/lib/product-filters";
import { defaultFilters } from "@/lib/services/catalog-service";
import { categories, categoryLabel } from "@/lib/constants";
import { cn, formatCurrency } from "@/lib/utils";

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest arrivals" },
  { value: "popular", label: "Best selling" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
] as const;

const gridRefId = "catalog-grid";

function ActiveChips({
  filters,
  onChange,
  onClear,
}: {
  filters: ProductFilters;
  onChange: (patch: Partial<ProductFilters>) => void;
  onClear: () => void;
}) {
  const chips: { key: string; label: string; onRemove: () => void }[] = [
    ...filters.categories.map((category) => ({
      key: `cat-${category}`,
      label: categoryLabel(category),
      onRemove: () => onChange({ categories: filters.categories.filter((item) => item !== category) }),
    })),
    ...filters.brands.map((brand) => ({
      key: `brand-${brand}`,
      label: brand,
      onRemove: () => onChange({ brands: filters.brands.filter((item) => item !== brand) }),
    })),
    ...(filters.rating
      ? [{ key: "rating", label: `${filters.rating}★ & up`, onRemove: () => onChange({ rating: 0 }) }]
      : []),
    ...(filters.inStock
      ? [{ key: "stock", label: "In stock", onRemove: () => onChange({ inStock: false }) }]
      : []),
    ...(filters.onSale
      ? [{ key: "sale", label: "On sale", onRemove: () => onChange({ onSale: false }) }]
      : []),
    ...(filters.minPrice > 0 || filters.maxPrice < 1000
      ? [
          {
            key: "price",
            label: `$${filters.minPrice} – $${filters.maxPrice}`,
            onRemove: () => onChange({ minPrice: 0, maxPrice: 1000 }),
          },
        ]
      : []),
  ];

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {chips.map((chip) => (
        <button
          key={chip.key}
          onClick={chip.onRemove}
          className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-card py-1 pl-2.5 pr-1.5 text-[0.68rem] font-medium transition-colors hover:border-foreground/20"
        >
          {chip.label}
          <span className="grid size-4 place-items-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-foreground group-hover:text-background">
            <X className="size-2.5" />
          </span>
        </button>
      ))}
      <button
        onClick={onClear}
        className="ml-1 text-[0.68rem] font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Clear
      </button>
    </div>
  );
}

function ProductRow({ product }: { product: Product }) {
  const addLine = useCartStore((state) => state.addLine);
  const option = product.variants[0]?.options[0];
  const variant = option ? { [product.variants[0].name.toLowerCase()]: option.value } : undefined;
  const price = product.price + (option?.priceDelta ?? 0);

  return (
    <article className="group flex gap-4 rounded-2xl border border-border bg-card p-3 transition-all hover:border-foreground/15 hover:shadow-soft sm:gap-5 sm:p-4">
      <Link href={`/products/${product.slug}`} className="shrink-0">
        <ProductImage
          src={product.thumbnail}
          alt={product.title}
          className="size-28 rounded-xl sm:size-36"
          sizes="144px"
          hoverZoom
        />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {product.brand}
            </p>
            <Link href={`/products/${product.slug}`}>
              <h3 className="mt-1 line-clamp-1 text-sm font-semibold tracking-tight sm:text-base">
                {product.title}
              </h3>
            </Link>
            <p className="mt-1 hidden line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:block">
              {product.subtitle} · {product.storeName}
            </p>
          </div>
          {product.discountPercentage > 0 && <Badge variant="coral">−{product.discountPercentage}%</Badge>}
        </div>

        <div className="mt-2 flex items-center gap-2">
          <Rating value={product.rating.rate} count={product.rating.count} size="xs" />
          <span className="text-[0.62rem] text-muted-foreground">· {product.soldCount} sold</span>
        </div>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-3">
          <div>
            <span className="text-base font-semibold tabular-nums">{formatCurrency(price)}</span>
            {product.compareAtPrice && (
              <span className="ml-2 text-[0.68rem] text-muted-foreground line-through">
                {formatCurrency(product.compareAtPrice)}
              </span>
            )}
            <p className={cn("mt-0.5 text-[0.62rem]", product.stock > 0 ? "text-success" : "text-danger")}>
              {product.stock > 0 ? `${product.stock} in stock` : "Sold out"}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            disabled={product.stock <= 0}
            onClick={() => {
              addLine({
                productId: product.id,
                slug: product.slug,
                title: product.title,
                thumbnail: product.thumbnail,
                price,
                currency: product.currency,
                quantity: 1,
                stock: product.stock,
                vendorId: product.vendorId,
                storeId: product.storeId,
                storeName: product.storeName,
                variant,
                variantLabel: option?.label,
              });
              toast.success("Added to cart", { description: product.title });
            }}
          >
            <Plus className="size-3.5" /> Add
          </Button>
        </div>
      </div>
    </article>
  );
}

export function CatalogView({ initialFilters }: { initialFilters: ProductFilters }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [filters, setFilters] = useState<ProductFilters>(initialFilters);
  const [queryInput, setQueryInput] = useState(initialFilters.q);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const debouncedQuery = useDebounce(queryInput, 300);
  const gridRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  const effectiveFilters = useMemo(
    () => ({ ...filters, q: debouncedQuery }),
    [filters, debouncedQuery],
  );

  const { data, isLoading, isFetching } = useCatalog(effectiveFilters);

  useEffect(() => {
    const params = serializeFilters(effectiveFilters).toString();
    startTransition(() => {
      router.replace(params ? `${pathname}?${params}` : pathname, { scroll: false });
    });
  }, [effectiveFilters, pathname, router]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [filters.page, filters.sort]);

  const update = (patch: Partial<ProductFilters>) => {
    setFilters((current) => ({ ...current, ...patch, page: patch.page ?? 1 }));
  };

  const updateQueryInput = (value: string) => {
    setQueryInput(value);
    setFilters((current) => (current.page === 1 ? current : { ...current, page: 1 }));
  };

  const clearFilters = () => {
    setQueryInput("");
    setFilters({ ...defaultFilters });
  };

  const facets = data?.facets;
  const filterCount = activeFilterCount(filters);
  const singleCategory = filters.categories.length === 1 ? filters.categories[0] : null;
  const heading = singleCategory ? categoryLabel(singleCategory) : "All objects";
  const description =
    categories.find((category) => category.slug === singleCategory)?.description ??
    "Every piece in the Nexvia catalogue — vetted, reviewed and ready to ship from independent studios.";

  const pageCount = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  const filterPanel = (
    <FilterPanel filters={filters} facets={facets} onChange={update} onClear={clearFilters} />
  );

  return (
    <div>
      <div className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 grid-overlay opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden />
        <div className="container-page relative py-10 sm:py-14">
          <nav className="flex items-center gap-1.5 text-[0.68rem] text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="size-3" />
            <Link href="/products" className="hover:text-foreground">Shop</Link>
            {singleCategory && (
              <>
                <ChevronRight className="size-3" />
                <span className="text-foreground">{categoryLabel(singleCategory)}</span>
              </>
            )}
          </nav>

          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {data ? `${data.total} pieces` : "Catalogue"}
              </p>
              <h1 className="mt-2 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">{heading}</h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>
            <div className="flex items-center gap-2">
              {categories.slice(0, 4).map((category) => (
                <Link
                  key={category.slug}
                  href={`/products?category=${category.slug}`}
                  className={cn(
                    "hidden rounded-full border px-3 py-1.5 text-[0.68rem] font-medium transition-colors md:block",
                    filters.categories.includes(category.slug)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card hover:border-foreground/20",
                  )}
                >
                  {category.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container-page py-8 lg:py-10">
        <div className="lg:grid lg:grid-cols-[248px_1fr] lg:gap-10">
          <aside className="hidden lg:block">
            <div className="sticky top-28 max-h-[calc(100dvh-8rem)] overflow-y-auto pr-2">{filterPanel}</div>
          </aside>

          <div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-0 flex-1 sm:max-w-xs">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={queryInput}
                    onChange={(event) => updateQueryInput(event.target.value)}
                    placeholder="Search this catalogue…"
                    aria-label="Search catalogue"
                    className="h-10 w-full rounded-full border border-border bg-card pl-9 pr-8 text-xs outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring"
                  />
                  {queryInput && (
                    <button
                      onClick={() => updateQueryInput("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:text-foreground"
                      aria-label="Clear search"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setMobileFiltersOpen(true)}
                >
                  <SlidersHorizontal className="size-4" /> Filters
                  {filterCount > 0 && (
                    <span className="grid size-4 place-items-center rounded-full bg-primary text-[0.55rem] font-bold text-primary-foreground">
                      {filterCount}
                    </span>
                  )}
                </Button>

                <div className="ml-auto flex items-center gap-2">
                  <span className="hidden text-[0.68rem] text-muted-foreground sm:block">
                    {data ? `${data.total} results` : "—"}
                  </span>
                  <Select
                    value={filters.sort}
                    onValueChange={(value) => update({ sort: value as ProductFilters["sort"] })}
                  >
                    <SelectTrigger className="h-10 w-[160px] rounded-full text-xs">
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent align="end">
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="text-xs">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="hidden items-center rounded-full border border-border bg-card p-0.5 sm:flex">
                    <button
                      onClick={() => setView("grid")}
                      className={cn(
                        "grid size-8 place-items-center rounded-full transition-colors",
                        view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                      )}
                      aria-label="Grid view"
                      aria-pressed={view === "grid"}
                    >
                      <LayoutGrid className="size-3.5" />
                    </button>
                    <button
                      onClick={() => setView("list")}
                      className={cn(
                        "grid size-8 place-items-center rounded-full transition-colors",
                        view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                      )}
                      aria-label="List view"
                      aria-pressed={view === "list"}
                    >
                      <List className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <ActiveChips filters={filters} onChange={update} onClear={clearFilters} />
            </div>

            <div ref={gridRef} id={gridRefId} className={cn("mt-6 transition-opacity", isPending || isFetching ? "opacity-60" : "")}>
              {isLoading ? (
                <ProductGridSkeleton count={9} />
              ) : data && data.items.length > 0 ? (
                view === "grid" ? (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:gap-x-5 xl:grid-cols-4">
                    {data.items.map((product, index) => (
                      <ProductCard key={product.id} product={product} priority={index < 4} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.items.map((product) => (
                      <ProductRow key={product.id} product={product} />
                    ))}
                  </div>
                )
              ) : (
                <EmptyState
                  icon={SearchX}
                  title="Nothing matches that combination"
                  description="Try removing a filter or searching for something broader. The good stuff is in here somewhere."
                  action={
                    <div className="flex flex-wrap justify-center gap-2">
                      <Button onClick={clearFilters}>Clear all filters</Button>
                      <Button asChild variant="outline">
                        <Link href="/products?sort=featured">
                          <Star className="size-4" /> Editor&apos;s picks
                        </Link>
                      </Button>
                    </div>
                  }
                />
              )}
            </div>

            {data && data.items.length > 0 && (
              <div className="mt-10 flex flex-col items-center gap-4 border-t border-border pt-8">
                <p className="text-[0.68rem] text-muted-foreground">
                  Showing {(data.page - 1) * data.pageSize + 1}–
                  {Math.min(data.total, data.page * data.pageSize)} of {data.total}
                </p>
                <Pagination
                  page={data.page}
                  pageCount={pageCount}
                  onPageChange={(page) => update({ page })}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetContent side="bottom" className="max-h-[88dvh] p-0">
          <div className="flex items-center justify-between border-b border-border px-5 py-4 pr-16">
            <SheetTitle className="text-base font-semibold">Filters</SheetTitle>
            <span className="text-[0.68rem] text-muted-foreground">{data?.total ?? 0} results</span>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-5">{filterPanel}</div>
          <div className="border-t border-border bg-card p-4">
            <Button className="w-full" size="lg" onClick={() => setMobileFiltersOpen(false)}>
              <ShoppingBag className="size-4" /> Show {data?.total ?? 0} results
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
