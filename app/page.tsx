import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BannerSlider } from "@/components/sections/BannerSlider";
import { Hero } from "@/components/sections/Hero";
import { FeaturedCollections } from "@/components/sections/FeaturedCollections";
import { SignatureHighlight } from "@/components/sections/SignatureHighlight";
import { BrandStory } from "@/components/sections/BrandStory";
import { Craftsmanship } from "@/components/sections/Craftsmanship";
import { Testimonials } from "@/components/sections/Testimonials";
import { GalleryStrip } from "@/components/sections/GalleryStrip";
import { CursorAura } from "@/components/ui/CursorAura";

export default function HomePage() {
  return (
    <main className="overflow-x-hidden bg-gradient-to-b from-beige-100 via-[#f8f5f0] to-[#f4efe8] text-royal-800">
      <CursorAura />
      <Navbar />
      <BannerSlider />
      <div id="after-banner">
      <Hero />
      </div>
      <FeaturedCollections />
      <SignatureHighlight />
      <BrandStory />
      <Craftsmanship />
      <Testimonials />
      <GalleryStrip />
      <Footer />
    </main>
  );
}
