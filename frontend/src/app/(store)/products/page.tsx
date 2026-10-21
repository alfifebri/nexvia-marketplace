import type { Metadata } from "next";
import { CatalogView } from "@/components/products/catalog-view";
import { parseFilters } from "@/lib/product-filters";

export const metadata: Metadata = {
  title: "Shop all",
  description:
    "Browse the full Nexvia catalogue — audio, homeware, apparel, beauty and more from independent, vetted makers.",
  alternates: { canonical: "/products" },
};

type SearchParams = Record<string, string | string[] | undefined>;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolved = await searchParams;
  const params = new URLSearchParams();
  Object.entries(resolved).forEach(([key, value]) => {
    if (typeof value === "string") params.set(key, value);
    else if (Array.isArray(value)) params.set(key, value[0]);
  });

  return <CatalogView initialFilters={parseFilters(params)} />;
}
