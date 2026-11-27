import type { Order } from "@/types";
import { getCategory } from "@/lib/catalog";
import { toLocalPhone } from "@/lib/operator";
import { readActiveProductsByCategory, readSettings } from "@/lib/supabase/store";
import { parseOrderInput } from "@/lib/transactions";

/**
 * Membangun pesanan dari checkout PUBLIK.
 *
 * Browser pelanggan tidak dipercaya: harga, nama produk, status, dan SN tidak
 * pernah diambil dari payload. Yang dibaca hanya pilihan pelanggan (kategori,
 * produk, penyedia, nomor tujuan, metode bayar, nominal tagihan); sisanya
 * dihitung ulang dari katalog di database. Status selalu "PENDING" (menunggu
 * verifikasi admin) dan SN selalu kosong: hanya admin yang boleh menandai
 * pesanan berhasil dan mengisi SN dari konsol admin.
 */

const ID_PATTERN = /^TVN-\d{7}$/;
const PAYMENT_METHODS = ["QRIS", "VA", "EWALLET"];
export const BILL_MIN = 10_000;
export const BILL_MAX = 50_000_000;

export const PENDING_LABEL = "Menunggu Verifikasi Admin";
const PENDING_MESSAGE =
  "Pembayaran dikonfirmasi pelanggan. Admin akan memverifikasi pembayaran, lalu memproses pesananmu.";

type Result = { order: Order } | { error: string };

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function buildPublicOrder(input: unknown): Promise<Result> {
  if (!input || typeof input !== "object") return { error: "Data pesanan tidak lengkap atau tidak valid." };
  const raw = input as Record<string, unknown>;

  const id = text(raw.id).toUpperCase();
  if (!ID_PATTERN.test(id)) return { error: "ID transaksi tidak valid. Silakan ulangi transaksi." };

  const category = getCategory(text(raw.categorySlug));
  if (!category) return { error: "Layanan tidak dikenal." };

  const customer =
    category.field.inputmode === "tel" ? toLocalPhone(text(raw.customer)) : text(raw.customer).replace(/[\s-]/g, "");
  if (!customer || !category.field.pattern.test(customer)) return { error: category.field.error };

  const provider = text(raw.provider);
  if (category.providers.length > 0 && !category.providers.includes(provider)) {
    return { error: "Penyedia layanan tidak valid." };
  }

  let total: number;
  let productName: string;

  if (category.type === "prabayar") {
    const list = (await readActiveProductsByCategory())[category.slug] ?? [];
    const product = list.find((item) => item.id === text(raw.productId));
    if (!product) return { error: "Produk tidak ditemukan atau sudah tidak aktif. Silakan pilih ulang." };
    if (product.provider && product.provider !== provider) {
      return { error: "Produk tidak cocok dengan penyedia yang dipilih." };
    }
    total = product.price;
    productName = product.name;
  } else {
    // Tagihan: nominalnya diketik pelanggan dari tagihan aslinya; biaya admin dari pengaturan.
    const amount = Math.round(Number(raw.billAmount));
    if (!Number.isFinite(amount) || amount < BILL_MIN || amount > BILL_MAX) {
      return { error: "Jumlah tagihan harus antara Rp10.000 dan Rp50.000.000." };
    }
    const settings = await readSettings();
    total = amount + (settings.adminFeeBill ?? category.adminFee ?? 2500);
    productName = `Tagihan ${category.name}`;
  }

  const method = text(raw.paymentMethod).toUpperCase();

  const order = parseOrderInput({
    id,
    category: category.name,
    categorySlug: category.slug,
    provider: provider || undefined,
    product: `${provider ? `${provider} — ` : ""}${productName}`,
    customer,
    total,
    paymentMethod: PAYMENT_METHODS.includes(method) ? method : "QRIS",
    status: "PENDING",
    statusLabel: PENDING_LABEL,
    sn: "",
    systemMessage: PENDING_MESSAGE,
  });
  if (!order) return { error: "Data pesanan tidak lengkap atau tidak valid." };
  return { order };
}
