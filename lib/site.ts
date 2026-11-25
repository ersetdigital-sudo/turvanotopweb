import type { NavItem } from "@/types";

/**
 * Global site configuration.
 *
 * NOTE: values marked "manual" were not present in the original static HTML
 * (it shipped placeholder/demo data) and must be filled in before going live.
 */
export const siteConfig = {
  name: "Turvanotopweb",
  legalName: "Turvanotopweb",
  /** Manual: set NEXT_PUBLIC_SITE_URL to the production domain. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://turvanotopweb.com",
  locale: "id_ID",
  description:
    "Isi pulsa, beli paket data, top up uang elektronik, token listrik, dan bayar tagihan bulanan di satu tempat. Total terlihat sebelum bayar dan status pesanan bisa dilacak.",
  /** Manual: replace with the real customer-care number. */
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "081234567890",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "halo@turvanotopweb.com",
} as const;

/** Primary navigation, shared by the header drawer and footer. */
export const primaryNav: NavItem[] = [
  { label: "Beranda", href: "/" },
  { label: "Layanan", href: "/layanan" },
  { label: "Cek Transaksi", href: "/cek-transaksi" },
  { label: "Bantuan", href: "/bantuan" },
  { label: "Tentang Turvanotopweb", href: "/tentang" },
];

/** Informational links shown in the footer. */
export const footerInfoLinks: NavItem[] = [
  { label: "Tentang Turvanotopweb", href: "/tentang" },
  { label: "Cek Transaksi", href: "/cek-transaksi" },
  { label: "Bantuan", href: "/bantuan" },
  { label: "Kebijakan Privasi", href: "/bantuan#kebijakan" },
  { label: "Syarat dan Ketentuan", href: "/bantuan#ketentuan" },
];
