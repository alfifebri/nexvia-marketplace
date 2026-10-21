"use client";

import { Star } from "lucide-react";
import type { FacetBucket, ProductFilters, SearchResult } from "@/types";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface FilterPanelProps {
  filters: ProductFilters;
  facets?: SearchResult["facets"];
  onChange: (patch: Partial<ProductFilters>) => void;
  onClear: () => void;
}

const pricePresets = [
  { label: "Under $100", min: 0, max: 100 },
  { label: "$100 – $250", min: 100, max: 250 },
  { label: "$250 – $500", min: 250, max: 500 },
  { label: "$500+", min: 500, max: 1000 },
];

function FacetRow({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="group flex w-full items-center justify-between gap-2 rounded-lg py-1.5 text-left text-xs transition-colors hover:text-foreground"
      aria-pressed={checked}
    >
      <span className="flex items-center gap-2.5">
        <span
          className={cn(
            "grid size-4 shrink-0 place-items-center rounded-[5px] border transition-all",
            checked
              ? "border-primary bg-primary text-primary-foreground"
              : "border-input bg-card group-hover:border-foreground/40",
          )}
        >
          {checked && (
            <svg viewBox="0 0 12 12" className="size-2.5" fill="none">
              <path d="M2.5 6l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <span className={cn("truncate", checked ? "font-semibold text-foreground" : "text-foreground/75")}>
          {label}
        </span>
      </span>
      {typeof count === "number" && (
        <span className="shrink-0 text-[0.65rem] tabular-nums text-muted-foreground/70">{count}</span>
      )}
    </button>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-border py-5 first:border-t-0 first:pt-0">
      <h3 className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}

export function FilterPanel({ filters, facets, onChange, onClear }: FilterPanelProps) {
  const toggleList = (key: "categories" | "brands", value: string) => {
    const current = filters[key];
    onChange({
      [key]: current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    });
  };

  const toggleFacet = (bucket: FacetBucket, key: "categories" | "brands") =>
    toggleList(key, bucket.value);

  const priceActive =
    filters.minPrice > 0 || filters.maxPrice < 1000;

  return (
    <div className="space-y-0">
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-sm font-semibold">Filters</h2>
        <button
          type="button"
          onClick={onClear}
          className="text-[0.65rem] font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Clear all
        </button>
      </div>

      <Group title="Category">
        <div className="space-y-0.5">
          {(facets?.categories ?? []).map((bucket) => (
            <FacetRow
              key={bucket.value}
              label={bucket.label}
              count={bucket.count}
              checked={filters.categories.includes(bucket.value)}
              onChange={() => toggleFacet(bucket, "categories")}
            />
          ))}
        </div>
      </Group>

      <Group title="Price">
        <div className="flex flex-wrap gap-1.5">
          {pricePresets.map((preset) => {
            const active = filters.minPrice === preset.min && filters.maxPrice === preset.max;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => onChange({ minPrice: preset.min, maxPrice: preset.max })}
                className={cn(
                  "rounded-full border px-2.5 py-1.5 text-[0.65rem] font-medium transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground",
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-[0.65rem] text-muted-foreground">
            <span>Max price</span>
            <span className="font-semibold tabular-nums text-foreground">${filters.maxPrice}</span>
          </div>
          <input
            type="range"
            min={0}
            max={1000}
            step={25}
            value={filters.maxPrice}
            onChange={(event) => onChange({ minPrice: 0, maxPrice: Number(event.target.value) })}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
            aria-label="Maximum price"
          />
          {priceActive && (
            <button
              type="button"
              onClick={() => onChange({ minPrice: 0, maxPrice: 1000 })}
              className="text-[0.62rem] text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              Reset price
            </button>
          )}
        </div>
      </Group>

      <Group title="Brand">
        <div className="max-h-56 space-y-0.5 overflow-y-auto pr-1">
          {(facets?.brands ?? []).slice(0, 10).map((bucket) => (
            <FacetRow
              key={bucket.value}
              label={bucket.label}
              count={bucket.count}
              checked={filters.brands.includes(bucket.value)}
              onChange={() => toggleFacet(bucket, "brands")}
            />
          ))}
        </div>
      </Group>

      <Group title="Rating">
        <div className="space-y-1">
          {[4, 3, 2].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => onChange({ rating: filters.rating === rating ? 0 : rating })}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-1.5 py-1.5 text-xs transition-colors",
                filters.rating === rating ? "bg-muted font-semibold" : "hover:bg-muted/60",
              )}
            >
              <span className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={cn(
                      "size-3",
                      index < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/25",
                    )}
                  />
                ))}
              </span>
              <span className="text-muted-foreground">& up</span>
            </button>
          ))}
        </div>
      </Group>

      <Group title="Availability">
        <label className="flex items-center justify-between gap-3 py-1.5">
          <span className="text-xs text-foreground/80">In stock only</span>
          <Switch
            checked={filters.inStock}
            onCheckedChange={(checked) => onChange({ inStock: checked })}
            aria-label="In stock only"
          />
        </label>
        <label className="flex items-center justify-between gap-3 py-1.5">
          <span className="text-xs text-foreground/80">On sale</span>
          <Switch
            checked={filters.onSale}
            onCheckedChange={(checked) => onChange({ onSale: checked })}
            aria-label="On sale only"
          />
        </label>
      </Group>
    </div>
  );
}
