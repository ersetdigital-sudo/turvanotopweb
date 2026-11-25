import type { Metadata } from "next";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeServicesGrid } from "@/components/home/HomeServicesGrid";
import { HomeFaq } from "@/components/home/HomeFaq";
import { HomeTimeline } from "@/components/home/HomeTimeline";
import { JsonLd } from "@/components/seo/JsonLd";
import { createMetadata, faqSchema } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Turvanotopweb — Pulsa sampai Tagihan, Beres dari Satu Layar",
  description:
    "Isi pulsa, beli paket data, top up uang elektronik, token listrik, dan bayar tagihan bulanan di satu tempat. Total terlihat sebelum bayar dan status pesanan bisa dilacak.",
  path: "/",
  keywords: ["pulsa", "paket data", "uang elektronik", "token listrik", "bayar tagihan", "Turvanotopweb"],
});

export default function HomePage() {
  return (
    <>
      <JsonLd data={faqSchema()} />
      <HomeHero />
      <HomeServicesGrid />
      <HomeFaq />
      <HomeTimeline />
    </>
  );
}
