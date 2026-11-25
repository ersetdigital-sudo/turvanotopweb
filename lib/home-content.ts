/** Static marketing copy for the home page sections. */

export const heroTrustPoints = [
  "8 kategori dalam satu tempat",
  "Total tampil sebelum bayar",
  "Lacak dengan ID transaksi",
];

export interface TimelineStep {
  badge: string;
  title: string;
  desc: string;
}

export const timelineSteps: TimelineStep[] = [
  {
    badge: "01",
    title: "Pilih layanan dan isi tujuan",
    desc: "Tentukan produknya, lalu masukkan nomor ponsel atau ID pelanggan sesuai layanan.",
  },
  {
    badge: "02",
    title: "Cek total, lalu bayar",
    desc: "Harga produk dan biaya admin ditampilkan sebelum kamu menyelesaikan pembayaran.",
  },
  {
    badge: "03",
    title: "Pantau sampai selesai",
    desc: "Buka Cek Transaksi dan masukkan ID untuk melihat status serta hasil pesananmu.",
  },
];
