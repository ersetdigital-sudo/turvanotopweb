/** Static marketing copy for the home page sections. */

export const heroTrustPoints = [
  "8 jenis layanan",
  "Harga kelihatan sebelum bayar",
  "Pesanan bisa dilacak",
];

export interface TimelineStep {
  badge: string;
  title: string;
  desc: string;
}

export const timelineSteps: TimelineStep[] = [
  {
    badge: "01",
    title: "Pilih layanan",
    desc: "Pilih produknya, lalu isi nomor HP atau ID pelanggan.",
  },
  {
    badge: "02",
    title: "Cek total dan bayar",
    desc: "Harga produk dan biaya admin kelihatan dulu sebelum kamu bayar.",
  },
  {
    badge: "03",
    title: "Pantau pesananmu",
    desc: "Masukkan ID transaksi di Cek Transaksi buat lihat status dan hasilnya.",
  },
];
