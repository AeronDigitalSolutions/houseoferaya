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

export function HomePageShell() {
  return (
    <main className="overflow-x-hidden bg-gradient-to-b from-beige-100 via-[#f8f5f0] to-[#f4efe8] text-royal-800">
      <CursorAura />
      <Navbar />
      <BannerSlider immersive />
      <div id="after-banner">
        <Hero />
      </div>
      <NewArrivalsMarquee />
      <FeaturedCollections />
      <BestsellersSection />
      <SignatureHighlight />
      <BrandStory />
      <Craftsmanship />
      <Testimonials />
      <GalleryStrip />
      <Footer />
    </main>
  );
}
