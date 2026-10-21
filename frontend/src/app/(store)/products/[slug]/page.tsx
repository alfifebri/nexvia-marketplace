import type { Metadata } from "next";
import { ProductDetailView } from "@/components/products/product-detail-view";
import { getProductBySlug } from "@/lib/demo/products";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) {
    return { title: "Product not found" };
  }
  return {
    title: product.title,
    description: `${product.subtitle} — ${product.description.slice(0, 130)}`,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: `${product.title} · Nexvia`,
      description: product.subtitle,
      images: [{ url: product.thumbnail }],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  return <ProductDetailView key={slug} slug={slug} />;
}
