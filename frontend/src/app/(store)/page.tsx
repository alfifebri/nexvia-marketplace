import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { BrandMarquee } from "@/components/home/brand-marquee";
import { TrustStrip } from "@/components/home/trust-strip";
import { CategoryGrid } from "@/components/home/category-grid";
import { FeaturedProducts } from "@/components/home/featured-products";
import { EditorialStandard } from "@/components/home/editorial-standard";
import { DealOfWeek } from "@/components/home/deal-of-week";
import { SplitPayments } from "@/components/home/split-payments";
import { VendorSpotlight } from "@/components/home/vendor-spotlight";
import { Testimonials } from "@/components/home/testimonials";
import { ClosingCTA } from "@/components/home/closing-cta";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/products?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <BrandMarquee />
      <div className="pt-14 sm:pt-16">
        <TrustStrip />
      </div>
      <CategoryGrid />
      <FeaturedProducts />
      <EditorialStandard />
      <DealOfWeek />
      <SplitPayments />
      <VendorSpotlight />
      <Testimonials />
      <ClosingCTA />
    </>
  );
}
