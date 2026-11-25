import type { Metadata } from "next";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeServicesGrid } from "@/components/home/HomeServicesGrid";
import { HomeFaq } from "@/components/home/HomeFaq";
import { HomeTimeline } from "@/components/home/HomeTimeline";
import { JsonLd } from "@/components/seo/JsonLd";
import { createMetadata, faqSchema } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Turvanotopweb — Isi Pulsa, Bayar Listrik, Top Up E-Wallet",
  description:
    "Isi pulsa, beli paket data, top up e-wallet, bayar token listrik dan tagihan bulanan di satu tempat. Harga kelihatan sebelum bayar, pesanan bisa dilacak.",
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
