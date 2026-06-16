import { HomePageShell } from "@/components/home/HomePageShell";
import { getHomepageStorefrontData } from "@/lib/homepage-content";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  try {
    const homepageData = await getHomepageStorefrontData();
    return <HomePageShell {...homepageData} />;
  } catch (error) {
    console.error("Homepage storefront data load failed:", error);
    return (
      <HomePageShell
        newArrivalProducts={[]}
        featuredCollections={[]}
        bestsellerTabs={[]}
        signatureProducts={[]}
        testimonials={[]}
      />
    );
  }
}
