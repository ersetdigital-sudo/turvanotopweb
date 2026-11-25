import type { CategorySlug, NavItem } from "@/types";

/** Compact service references used by the footer and the home services grid. */
export interface ServiceLink extends NavItem {
  slug: CategorySlug;
  shortLabel: string;
}

export const serviceLinks: ServiceLink[] = [
  { slug: "pulsa", label: "Pulsa", shortLabel: "Pulsa", href: "/layanan?kategori=pulsa" },
  { slug: "paket-data", label: "Paket Data", shortLabel: "Paket Data", href: "/layanan?kategori=paket-data" },
  { slug: "uang-elektronik", label: "Uang Elektronik", shortLabel: "Uang Elektronik", href: "/layanan?kategori=uang-elektronik" },
  { slug: "pln", label: "PLN", shortLabel: "PLN", href: "/layanan?kategori=pln" },
  { slug: "internet", label: "Pembayaran Internet", shortLabel: "Internet", href: "/layanan?kategori=internet" },
  { slug: "bpjs", label: "BPJS", shortLabel: "BPJS", href: "/layanan?kategori=bpjs" },
  { slug: "pdam", label: "PDAM", shortLabel: "PDAM", href: "/layanan?kategori=pdam" },
  { slug: "multifinance", label: "Multifinance", shortLabel: "Multifinance", href: "/layanan?kategori=multifinance" },
];

/** The eight cards shown on the home page, with their marketing copy. */
export interface HomeServiceCard {
  slug: CategorySlug;
  name: string;
  desc: string;
}

export const homeServiceCards: HomeServiceCard[] = [
  {
    slug: "pulsa",
    name: "Pulsa",
    desc: "Isi ulang pulsa semua operator seluler, dari nominal kecil sampai besar.",
  },
  {
    slug: "paket-data",
    name: "Paket Data",
    desc: "Kuota harian sampai bulanan, tinggal pilih yang pas untuk pemakaianmu.",
  },
  {
    slug: "uang-elektronik",
    name: "Uang Elektronik",
    desc: "Tambah saldo GoPay, OVO, DANA, ShopeePay, atau LinkAja tanpa repot.",
  },
  {
    slug: "pln",
    name: "PLN",
    desc: "Token listrik prabayar dengan nomor meter, atau lunasi tagihan bulanannya.",
  },
  {
    slug: "internet",
    name: "Pembayaran Internet",
    desc: "Lunasi tagihan Wi-Fi rumah dari IndiHome, Biznet, First Media, dan lainnya.",
  },
  {
    slug: "bpjs",
    name: "BPJS Kesehatan",
    desc: "Bayar iuran BPJS Kesehatan keluarga cukup dengan nomor Virtual Account.",
  },
  {
    slug: "pdam",
    name: "PDAM",
    desc: "Cek dan bayar tagihan air PDAM sesuai wilayah pelangganmu.",
  },
  {
    slug: "multifinance",
    name: "Multifinance",
    desc: "Bayar angsuran kendaraan dan pembiayaan lain memakai nomor kontrak.",
  },
];
