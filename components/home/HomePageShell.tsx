import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BannerSlider } from "@/components/sections/BannerSlider";
import { Hero } from "@/components/sections/Hero";
import { NewArrivalsMarquee } from "@/components/sections/NewArrivalsMarquee";
import { FeaturedCollections } from "@/components/sections/FeaturedCollections";
import { BestsellersSection } from "@/components/sections/BestsellersSection";
import { SignatureHighlight } from "@/components/sections/SignatureHighlight";
import { BrandStory } from "@/components/sections/BrandStory";
import { Craftsmanship } from "@/components/sections/Craftsmanship";
import { Testimonials } from "@/components/sections/Testimonials";
import { GalleryStrip } from "@/components/sections/GalleryStrip";
import { CursorAura } from "@/components/ui/CursorAura";
import type { Category, Product } from "@/lib/types";
import type { HomepageContentConfig, HomepageTestimonialItem } from "@/lib/homepage-content";

type HomePageShellProps = {
  config?: HomepageContentConfig;
  heroProduct?: (Product & { href?: string }) | null;
  newArrivalProducts?: Product[];
  featuredCollections?: Category[];
  bestsellerTabs?: Array<{
    key: "rings" | "necklaces" | "earrings" | "bracelets";
    label: string;
    categorySlug: string | null;
    products: Product[];
  }>;
  signatureProducts?: Product[];
  testimonials?: HomepageTestimonialItem[];
};

const DEFAULT_CONFIG: HomepageContentConfig = {
  hero: {
    productId: null,
    badgeLabel: "New Capsule",
    description: "Engineered curves with warm golden tonality."
  },
  newArrivals: {
    productIds: []
  },
  featuredCollections: {
    heading: "Featured Collections",
    description: "A restrained mix of sculptural earrings, rings, and drops designed for lasting relevance.",
    categoryIds: []
  },
  bestseller: {
    heading: "Bestsellers",
    description: "Most-loved signature pieces chosen for daily impact and lasting versatility.",
    ringsProductIds: [],
    necklacesProductIds: [],
    earringsProductIds: [],
    braceletsProductIds: []
  },
  signature: {
    productIds: []
  }
};

export function HomePageShell({
  config = DEFAULT_CONFIG,
  heroProduct = null,
  newArrivalProducts = [],
  featuredCollections = [],
  bestsellerTabs = [],
  signatureProducts = [],
  testimonials = []
}: HomePageShellProps) {
  return (
    <main className="overflow-x-hidden bg-gradient-to-b from-beige-100 via-[#f8f5f0] to-[#f4efe8] text-royal-800">
      <CursorAura />
      <Navbar />
      <BannerSlider immersive />
      <Hero product={heroProduct} badgeLabel={config.hero.badgeLabel} description={config.hero.description} />
      <NewArrivalsMarquee products={newArrivalProducts} />
      <FeaturedCollections
        heading={config.featuredCollections.heading}
        description={config.featuredCollections.description}
        categories={featuredCollections}
      />
      <BestsellersSection heading={config.bestseller.heading} description={config.bestseller.description} tabs={bestsellerTabs} />
      <SignatureHighlight products={signatureProducts} />
      <BrandStory />
      <Craftsmanship />
      <Testimonials testimonials={testimonials} />
      <GalleryStrip />
      <Footer />
    </main>
  );
}
