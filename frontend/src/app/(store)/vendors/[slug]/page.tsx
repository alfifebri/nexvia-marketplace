import type { Metadata } from "next";
import { VendorStoreView } from "@/components/vendors/vendor-store-view";
import { demoVendors } from "@/lib/demo/vendors";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const vendor = demoVendors.find((item) => item.slug === slug);
  if (!vendor) return { title: "Vendor not found" };
  return {
    title: vendor.name,
    description: vendor.description,
    alternates: { canonical: `/vendors/${vendor.slug}` },
    openGraph: {
      title: `${vendor.name} · Nexvia`,
      description: vendor.description,
      images: [{ url: vendor.banner }],
    },
  };
}

export default async function VendorStorePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  return <VendorStoreView key={slug} slug={slug} />;
}
