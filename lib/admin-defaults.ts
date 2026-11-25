import type { AdminProduct, AdminSettings, CategorySlug } from "@/types";
import { categories } from "@/lib/catalog";

/**
 * Default admin configuration. These values are the seed for a fresh Supabase
 * project (lib/supabase/store.ts inserts them on first run) and the source for
 * the admin console's "Reset Bawaan" button.
 */


/** slug → display name, used when the admin form creates a new product. */
export const CATEGORY_NAMES: Record<CategorySlug, string> = {
  pulsa: "Pulsa",
  "paket-data": "Paket Data",
  "uang-elektronik": "Uang Elektronik",
  pln: "PLN",
  internet: "Pembayaran Internet",
  bpjs: "BPJS Kesehatan",
  pdam: "PDAM",
  multifinance: "Multifinance",
};

export const defaultSettings: AdminSettings = {
  // Nomor CS diambil dari env saat pertama kali di-seed; ubah lewat dashboard admin.
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP ?? "",
  whatsappAdminName: "Customer Care Turvanotopweb",
  whatsappHours: "07:00 - 23:00 WIB Setiap Hari",
  whatsappTemplateOrder:
    "Halo Admin Turvanotopweb, saya ingin konfirmasi pembayaran pesanan dengan ID: {id} ({produk}) sebesar {total}. Mohon segera diverifikasi. Terima kasih!",
  whatsappTemplateSuccess:
    "Halo Kak! Pesanan Turvanotopweb ID: {id} untuk {produk} telah BERHASIL diproses. Nomor SN / Token Anda: {sn}. Terima kasih telah bertransaksi di Turvanotopweb!",
  qrisImage: "",
  qrisMerchant: "TURVANOTOPWEB",
  qrisNmid: "",
  qrisActive: true,
  qrisInstructions:
    "Buka aplikasi GoPay, OVO, DANA, ShopeePay, BCA Mobile, atau m-banking lainnya, lalu scan kode QR di atas.",
  // Rekening dan akun e-wallet sengaja nonaktif dan kosong. Isi lewat dashboard
  // admin lalu aktifkan; data contoh tidak boleh tampil ke pelanggan.
  banks: [
    { id: "bca", name: "BCA", code: "bca", accNo: "", accName: "", active: false },
    { id: "mandiri", name: "Mandiri", code: "mandiri", accNo: "", accName: "", active: false },
    { id: "bri", name: "BRI", code: "bri", accNo: "", accName: "", active: false },
    { id: "bni", name: "BNI", code: "bni", accNo: "", accName: "", active: false },
  ],
  ewallets: [
    { id: "gopay", name: "GoPay", accNo: "", accName: "", active: false },
    { id: "dana", name: "DANA", accNo: "", accName: "", active: false },
    { id: "ovo", name: "OVO", accNo: "", accName: "", active: false },
    { id: "shopeepay", name: "ShopeePay", accNo: "", accName: "", active: false },
  ],
  adminFeeBill: 2500,
};

/** Flattens the shared catalog into the admin product list (default state). */
export function buildDefaultProducts(): AdminProduct[] {
  const flat: AdminProduct[] = [];
  for (const category of categories) {
    if (!category.products?.length) continue;
    for (const product of category.products) {
      flat.push({
        id: product.id,
        categorySlug: category.slug,
        categoryName: category.name,
        provider: product.provider ?? category.providers[0] ?? "",
        name: product.name,
        price: product.price,
        note: product.note,
        active: true,
      });
    }
  }
  return flat;
}
