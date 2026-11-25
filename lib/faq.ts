import type { FaqItem } from "@/types";

/** Home page FAQ accordion content (also reused for FAQPage structured data). */
export const faqItems: FaqItem[] = [
  {
    id: "faq-1",
    badge: "Cara pesan",
    question: "Gimana cara pesannya?",
    answer: [
      {
        type: "text",
        text: "Buka Layanan, pilih kategorinya, isi nomor HP atau ID pelanggan, lalu pilih produk. Di checkout kamu bisa lihat total dan pilih cara bayar. Setelah itu, simpan ID transaksinya ya.",
      },
    ],
  },
  {
    id: "faq-2",
    badge: "Akun",
    question: "Harus bikin akun dulu?",
    answer: [
      {
        type: "text",
        text: "Nggak perlu. Tidak ada daftar atau login. Simpan saja ID transaksi yang muncul setelah checkout, dipakai buat cek pesananmu kapan pun.",
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
        text: "Pesananmu diproses setelah pembayaran dikonfirmasi admin, biasanya cuma beberapa menit. Kalau operator atau penyedianya lagi padat, bisa lebih lama. Statusnya bisa kamu pantau di halaman Cek Transaksi.",
      },
    ],
  },
  {
    id: "faq-4",
    badge: "Pembayaran",
    question: "Bayarnya bisa pakai apa?",
    answer: [
      {
        type: "text",
        text: "Pilihannya muncul di halaman checkout, misalnya QRIS yang bisa discan dari e-wallet atau m-banking, atau transfer bank. Yang tampil tergantung metode yang sedang aktif.",
      },
    ],
  },
  {
    id: "faq-5",
    badge: "Cek pesanan",
    question: "Gimana cara cek pesanan?",
    answer: [
      { type: "text", text: "Buka halaman " },
      { type: "link", text: "Cek Transaksi", href: "/cek-transaksi" },
      {
        type: "text",
        text: ", masukkan ID transaksi, lalu kamu bisa lihat status bayar dan detail pesanannya. Bisa juga lewat kolom cek cepat di bawah.",
      },
    ],
  },
  {
    id: "faq-6",
    badge: "Kendala",
    question: "Sudah bayar tapi produk belum masuk?",
    answer: [
      {
        type: "text",
        text: "Tunggu beberapa menit dulu sambil cek status di Cek Transaksi. Kalau masih belum berubah, hubungi CS lewat ",
      },
      { type: "link", text: "Pusat Bantuan", href: "/bantuan" },
      {
        type: "text",
        text: " dengan menyertakan ID transaksi dan bukti bayar.",
      },
    ],
  },
  {
    id: "faq-7",
    badge: "Biaya",
    question: "Ada biaya lain selain harga produk?",
    answer: [
      {
        type: "text",
        text: "Total yang harus dibayar, termasuk biaya admin kalau ada, ditampilkan di ringkasan pesanan sebelum kamu bayar.",
      },
    ],
  },
];

/** Plain-text answers, used when emitting FAQPage JSON-LD. */
export function faqPlainAnswer(item: FaqItem): string {
  return item.answer.map((segment) => segment.text).join("");
}
