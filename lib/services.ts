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
    desc: "Isi pulsa semua operator, dari nominal kecil sampai besar.",
  },
  {
    slug: "paket-data",
    name: "Paket Data",
    desc: "Kuota harian sampai bulanan, pilih sesuai pemakaianmu.",
  },
  {
    slug: "uang-elektronik",
    name: "Uang Elektronik",
    desc: "Isi saldo GoPay, OVO, DANA, ShopeePay, atau LinkAja.",
  },
  {
    slug: "pln",
    name: "PLN",
    desc: "Beli token listrik pakai nomor meter, atau bayar tagihan bulanan.",
  },
  {
    slug: "internet",
    name: "Pembayaran Internet",
    desc: "Bayar tagihan Wi-Fi rumah: IndiHome, Biznet, First Media, dan lainnya.",
  },
  {
    slug: "bpjs",
    name: "BPJS Kesehatan",
    desc: "Bayar iuran BPJS Kesehatan keluarga pakai nomor Virtual Account.",
  },
  {
    slug: "pdam",
    name: "PDAM",
    desc: "Cek dan bayar tagihan air PDAM di wilayahmu.",
  },
  {
    slug: "multifinance",
    name: "Multifinance",
    desc: "Bayar cicilan motor, mobil, dan pembiayaan lain pakai nomor kontrak.",
  },
];
