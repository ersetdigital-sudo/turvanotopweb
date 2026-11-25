import type { FaqItem } from "@/types";

/** Home page FAQ accordion content (also reused for FAQPage structured data). */
export const faqItems: FaqItem[] = [
  {
    id: "faq-1",
    badge: "Panduan",
    question: "Bagaimana cara memesan di Turvanotopweb?",
    answer: [
      {
        type: "text",
        text: "Buka halaman Layanan, pilih kategori, isi nomor ponsel atau ID pelanggan, lalu pilih produknya. Di checkout kamu bisa melihat total pembayaran, memilih metode bayar yang aktif, dan menyelesaikan pembayaran. Setelah itu simpan ID transaksi yang muncul.",
      },
    ],
  },
  {
    id: "faq-2",
    badge: "Akun",
    question: "Perlu daftar akun dulu?",
    answer: [
      {
        type: "text",
        text: "Tidak. Tidak ada registrasi atau login untuk pembeli. Cukup simpan ID transaksi setelah checkout, lalu pakai untuk melacak pesananmu kapan saja.",
      },
    ],
  },
  {
    id: "faq-3",
    badge: "Proses",
    question: "Berapa lama sampai produknya masuk?",
    answer: [
      {
        type: "text",
        text: "Pesanan diproses setelah pembayaranmu dikonfirmasi admin, biasanya dalam hitungan menit. Saat penyedia layanan atau operator sedang padat, prosesnya bisa lebih lama. Statusnya selalu bisa dicek di halaman Cek Transaksi.",
      },
    ],
  },
  {
    id: "faq-4",
    badge: "Pembayaran",
    question: "Bayarnya bisa lewat apa?",
    answer: [
      {
        type: "text",
        text: "Metode yang tersedia tampil di halaman checkout, misalnya QRIS yang bisa dipindai dari e-wallet atau m-banking, atau transfer ke rekening yang tertera. Metode yang muncul mengikuti yang sedang aktif.",
      },
    ],
  },
  {
    id: "faq-5",
    badge: "Pelacakan",
    question: "Bagaimana cara melacak pesanan?",
    answer: [
      { type: "text", text: "Buka halaman " },
      { type: "link", text: "Cek Transaksi", href: "/cek-transaksi" },
      {
        type: "text",
        text: ", masukkan ID transaksi, lalu lihat status pembayaran dan rincian pesananmu. ID juga bisa dimasukkan lewat kolom cek cepat di bawah.",
      },
    ],
  },
  {
    id: "faq-6",
    badge: "Kendala",
    question: "Sudah bayar tapi produk belum masuk, bagaimana?",
    answer: [
      {
        type: "text",
        text: "Tunggu beberapa menit sambil memantau statusnya di Cek Transaksi. Kalau belum berubah, buka ",
      },
      { type: "link", text: "Pusat Bantuan", href: "/bantuan" },
      {
        type: "text",
        text: " atau hubungi CS dengan menyertakan ID transaksi dan bukti pembayaran.",
      },
    ],
  },
  {
    id: "faq-7",
    badge: "Biaya",
    question: "Ada biaya lain di luar harga produk?",
    answer: [
      {
        type: "text",
        text: "Total yang harus dibayar, termasuk biaya admin bila ada, ditampilkan di ringkasan pesanan sebelum kamu membayar.",
      },
    ],
  },
];

/** Plain-text answers, used when emitting FAQPage JSON-LD. */
export function faqPlainAnswer(item: FaqItem): string {
  return item.answer.map((segment) => segment.text).join("");
}
