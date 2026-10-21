import type { ProductFilters, SortKey } from "@/types";
import { defaultFilters } from "@/lib/services/catalog-service";

const validSorts: SortKey[] = ["featured", "newest", "price-asc", "price-desc", "rating", "popular"];

export function parseFilters(params: URLSearchParams | ReadonlyURLSearchParams): ProductFilters {
  const sortParam = params.get("sort") as SortKey | null;
  const categories = params.get("category");
  const brands = params.get("brand");
  const price = params.get("price");
  const [minPrice, maxPrice] = price?.split("-").map(Number) ?? [];

  return {
    ...defaultFilters,
    q: params.get("q") ?? "",
    categories: categories ? categories.split(",").filter(Boolean) : [],
    brands: brands ? brands.split(",").filter(Boolean) : [],
    minPrice: Number.isFinite(minPrice) ? minPrice : defaultFilters.minPrice,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : defaultFilters.maxPrice,
    rating: Number(params.get("rating")) || 0,
    inStock: params.get("inStock") === "true",
    onSale: params.get("onSale") === "true",
    sort: sortParam && validSorts.includes(sortParam) ? sortParam : "featured",
    page: Math.max(1, Number(params.get("page")) || 1),
    pageSize: Math.min(48, Math.max(4, Number(params.get("pageSize")) || defaultFilters.pageSize)),
  };
}

export function serializeFilters(filters: ProductFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.categories.length) params.set("category", filters.categories.join(","));
  if (filters.brands.length) params.set("brand", filters.brands.join(","));
  if (filters.minPrice > defaultFilters.minPrice || filters.maxPrice < defaultFilters.maxPrice) {
    params.set("price", `${filters.minPrice}-${filters.maxPrice}`);
  }
  if (filters.rating) params.set("rating", String(filters.rating));
  if (filters.inStock) params.set("inStock", "true");
  if (filters.onSale) params.set("onSale", "true");
  if (filters.sort !== "featured") params.set("sort", filters.sort);
  if (filters.page > 1) params.set("page", String(filters.page));
  if (filters.pageSize !== defaultFilters.pageSize) params.set("pageSize", String(filters.pageSize));
  return params;
}

export function activeFilterCount(filters: ProductFilters) {
  return (
    filters.categories.length +
    filters.brands.length +
    (filters.rating ? 1 : 0) +
    (filters.inStock ? 1 : 0) +
    (filters.onSale ? 1 : 0) +
    (filters.minPrice > defaultFilters.minPrice || filters.maxPrice < defaultFilters.maxPrice ? 1 : 0)
  );
}

type ReadonlyURLSearchParams = {
  get: (key: string) => string | null;
};
