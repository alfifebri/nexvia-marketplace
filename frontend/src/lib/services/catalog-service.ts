import type { FacetBucket, Product, ProductFilters, SearchResult } from "@/types";
import { API_MODE, api } from "@/lib/api";
import { demoProducts } from "@/lib/demo/products";

const normalize = (value: string) => value.toLowerCase().trim();

const matchesQuery = (product: Product, tokens: string[]) => {
  if (tokens.length === 0) return true;
  const haystack = normalize(
    [
      product.title,
      product.subtitle,
      product.brand,
      product.categoryLabel,
      product.category,
      product.description,
      product.storeName,
      ...product.tags,
      ...Object.values(product.attributes).map(String),
    ].join(" "),
  );
  return tokens.every((token) => haystack.includes(token));
};

const sortProducts = (products: Product[], sort: ProductFilters["sort"]) => {
  const list = [...products];
  switch (sort) {
    case "newest":
      return list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    case "price-asc":
      return list.sort((a, b) => a.price - b.price);
    case "price-desc":
      return list.sort((a, b) => b.price - a.price);
    case "rating":
      return list.sort((a, b) => b.rating.rate - a.rating.rate || b.rating.count - a.rating.count);
    case "popular":
      return list.sort((a, b) => b.soldCount - a.soldCount);
    case "featured":
    default:
      return list.sort(
        (a, b) =>
          Number(b.isFeatured) - Number(a.isFeatured) ||
          b.rating.rate * Math.log10(b.rating.count + 10) - a.rating.rate * Math.log10(a.rating.count + 10),
      );
  }
};

export const defaultFilters: ProductFilters = {
  q: "",
  categories: [],
  brands: [],
  minPrice: 0,
  maxPrice: 1000,
  rating: 0,
  inStock: false,
  onSale: false,
  sort: "featured",
  page: 1,
  pageSize: 12,
};

export function productPriceBounds(products: Product[] = demoProducts) {
  const prices = products.map((product) => product.price);
  return {
    min: Math.floor(Math.min(...prices, 0)),
    max: Math.ceil(Math.max(...prices, 1000)),
  };
}

export function searchDemoProducts(filters: ProductFilters, source: Product[]): SearchResult {
  const tokens = normalize(filters.q).split(/\s+/).filter(Boolean);
  const active = source.filter((product) => product.status !== "archived");

  const queryMatched = active.filter((product) => matchesQuery(product, tokens));

  const priceMatched = queryMatched.filter(
    (product) => product.price >= filters.minPrice && product.price <= filters.maxPrice,
  );

  const base = priceMatched.filter(
    (product) =>
      product.rating.rate >= filters.rating &&
      (!filters.inStock || product.stock > 0) &&
      (!filters.onSale || product.discountPercentage > 0),
  );

  const facetBase = priceMatched.filter(
    (product) => (!filters.inStock || product.stock > 0) && (!filters.onSale || product.discountPercentage > 0),
  );

  const countBy = (key: (product: Product) => string): FacetBucket[] => {
    const counts = new Map<string, number>();
    for (const product of facetBase) {
      const value = key(product);
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([value, count]) => ({
        value,
        label: value
          .split(/[-_]/)
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" "),
        count,
      }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  };

  const categories = countBy((product) => product.category);
  const brands = countBy((product) => product.brand);

  const filtered = base.filter(
    (product) =>
      (filters.categories.length === 0 || filters.categories.includes(product.category)) &&
      (filters.brands.length === 0 || filters.brands.includes(product.brand)),
  );

  const sorted = sortProducts(filtered, filters.sort);
  const pageSize = filters.pageSize;
  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const page = Math.min(Math.max(1, filters.page), pageCount);

  return {
    items: sorted.slice((page - 1) * pageSize, page * pageSize),
    total: sorted.length,
    page,
    pageSize,
    facets: {
      categories,
      brands,
      price: productPriceBounds(active),
      availability: {
        inStock: queryMatched.filter((product) => product.stock > 0).length,
        onSale: queryMatched.filter((product) => product.discountPercentage > 0).length,
      },
    },
  };
}

export async function searchProducts(
  filters: ProductFilters,
  source: Product[] = demoProducts,
): Promise<SearchResult> {
  if (API_MODE === "live") {
    try {
      const response = await api.get("/products", {
        params: {
          q: filters.q,
          category: filters.categories.join(","),
          brand: filters.brands.join(","),
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          rating: filters.rating,
          inStock: filters.inStock,
          onSale: filters.onSale,
          sort: filters.sort,
          page: filters.page,
          pageSize: filters.pageSize,
        },
      });
      const payload = response.data?.data;
      const items: Product[] = Array.isArray(payload) ? payload : (payload?.items ?? payload?.products ?? []);
      if (items.length > 0 || payload?.total === 0) {
        return {
          items,
          total: payload?.total ?? items.length,
          page: payload?.page ?? filters.page,
          pageSize: payload?.pageSize ?? filters.pageSize,
          facets: payload?.facets ?? {
            categories: [],
            brands: [],
            price: productPriceBounds(source),
            availability: { inStock: 0, onSale: 0 },
          },
        };
      }
    } catch {
      /* The catalog service is not live yet — fall through to the bundled dataset. */
    }
  }
  return searchDemoProducts(filters, source);
}

export async function fetchProduct(slug: string, source: Product[] = demoProducts): Promise<Product | null> {
  if (API_MODE === "live") {
    try {
      const response = await api.get(`/products/${slug}`);
      const payload = response.data?.data;
      if (payload?.id || payload?._id) return payload as Product;
    } catch {
      /* fall back to demo */
    }
  }
  return source.find((product) => product.slug === slug || product.id === slug) ?? null;
}

export function relatedProducts(product: Product, source: Product[], limit = 4) {
  return source
    .filter(
      (item) =>
        item.id !== product.id &&
        item.status === "active" &&
        (item.category === product.category || item.brand === product.brand),
    )
    .sort((a, b) => b.rating.rate - a.rating.rate)
    .slice(0, limit);
}

export function featuredProducts(source: Product[], limit = 8) {
  return sortProducts(source.filter((product) => product.status === "active"), "featured").slice(0, limit);
}
