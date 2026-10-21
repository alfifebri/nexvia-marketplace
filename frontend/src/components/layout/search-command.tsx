"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Loader2, Search, Sparkles, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ProductImage } from "@/components/ui/product-image";
import { Rating } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/hooks/use-debounce";
import { useCatalog } from "@/hooks/queries";
import { useUIStore } from "@/stores/ui-store";
import { categories } from "@/lib/constants";
import { cn, formatCurrency } from "@/lib/utils";

const trending = ["Noise cancelling", "Type 75", "Linen throw", "Bakuchiol", "Running shoes"];

export function SearchCommand() {
  const open = useUIStore((state) => state.searchOpen);
  const setOpen = useUIStore((state) => state.setSearchOpen);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const debounced = useDebounce(query, 220);
  const router = useRouter();

  const filters = useMemo(
    () => ({
      q: debounced,
      categories: [],
      brands: [],
      minPrice: 0,
      maxPrice: 1000,
      rating: 0,
      inStock: false,
      onSale: false,
      sort: "featured" as const,
      page: 1,
      pageSize: 6,
    }),
    [debounced],
  );

  const { data, isFetching } = useCatalog(filters);
  const results = data?.items ?? [];

  const updateQuery = (value: string) => {
    setQuery(value);
    setActiveIndex(0);
  };

  const goToProduct = (slug: string) => {
    setOpen(false);
    router.push(`/products/${slug}`);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(results.length - 1, index + 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(0, index - 1));
    }
    if (event.key === "Enter" && results[activeIndex]) {
      event.preventDefault();
      goToProduct(results[activeIndex].slug);
    }
    if (event.key === "Enter" && !results[activeIndex] && query.trim()) {
      setOpen(false);
      router.push(`/products?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent hideClose className="max-w-2xl gap-0 overflow-hidden p-0">
        <DialogTitle className="sr-only">Search Nexvia</DialogTitle>
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          {isFetching && debounced ? (
            <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
          ) : (
            <Search className="size-4 shrink-0 text-muted-foreground" />
          )}
          <input
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search products, brands, vendors…"
            autoFocus
            aria-label="Search query"
            className="h-8 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/60"
          />
          <button
            onClick={() => setOpen(false)}
            className="rounded-md border border-border bg-muted px-2 py-1 text-[0.6rem] font-semibold text-muted-foreground"
          >
            ESC
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {!query && (
            <div className="space-y-5 p-3">
              <div>
                <p className="mb-2.5 flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  <TrendingUp className="size-3.5" /> Trending searches
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {trending.map((term) => (
                    <button
                      key={term}
                      onClick={() => updateQuery(term)}
                      className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2.5 flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  <Sparkles className="size-3.5" /> Browse categories
                </p>
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                  {categories.slice(0, 8).map((category) => (
                    <Link
                      key={category.slug}
                      href={`/products?category=${category.slug}`}
                      onClick={() => setOpen(false)}
                      className="rounded-xl border border-border bg-card px-3 py-2.5 text-xs font-medium transition-colors hover:bg-muted"
                    >
                      {category.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {query && results.length === 0 && !isFetching && (
            <div className="px-4 py-12 text-center">
              <p className="text-sm font-semibold">No matches for “{query}”</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Try a broader term, or browse all products.
              </p>
              <Link
                href="/products"
                onClick={() => setOpen(false)}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold underline underline-offset-4"
              >
                Browse catalogue <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          )}

          {query && results.length > 0 && (
            <div className="space-y-0.5">
              {results.map((product, index) => (
                <button
                  key={product.id}
                  onClick={() => goToProduct(product.slug)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors",
                    index === activeIndex ? "bg-muted" : "hover:bg-muted/60",
                  )}
                >
                  <ProductImage
                    src={product.thumbnail}
                    alt={product.title}
                    className="size-14 shrink-0 rounded-lg"
                    sizes="56px"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold">{product.title}</p>
                      {product.compareAtPrice && <Badge variant="coral">Sale</Badge>}
                    </div>
                    <p className="mt-0.5 truncate text-[0.7rem] text-muted-foreground">
                      {product.brand} · {product.storeName}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <Rating value={product.rating.rate} count={product.rating.count} size="xs" compactCount />
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums">
                    {formatCurrency(product.price, product.currency)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {query && (
          <div className="flex items-center justify-between border-t border-border bg-muted/40 px-5 py-3">
            <span className="text-[0.68rem] text-muted-foreground">
              {data?.total ?? 0} results · ↑↓ to navigate · ↵ to open
            </span>
            <Link
              href={`/products?q=${encodeURIComponent(query)}`}
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1.5 text-[0.68rem] font-semibold hover:underline underline-offset-4"
            >
              View all <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
