import Link from "next/link";
import {
  ArrowRightIcon,
  CategoryIcon,
  CheckIcon,
  ClockCheckIcon,
  SearchIcon,
} from "@/components/icons";
import { categories } from "@/lib/catalog";
import { rupiah } from "@/lib/format";
import { heroTrustPoints } from "@/lib/home-content";
import type { CategorySlug } from "@/types";

const QUICK_SLUGS: CategorySlug[] = ["pulsa", "paket-data", "uang-elektronik", "pln"];

const quickServices = QUICK_SLUGS.flatMap((slug) => {
  const category = categories.find((entry) => entry.slug === slug);
  if (!category) return [];
  const prices = (category.products ?? []).map((product) => product.price);
  return [
    {
      slug,
      name: category.name,
      from: prices.length ? Math.min(...prices) : null,
    },
  ];
});

export function HomeHero() {
  return (
    <section className="tv-hero" aria-label="Hero Turvanotopweb">
      <div className="tv-hero-bg" aria-hidden="true" />

      <div className="container tv-hero-grid">
        <div className="tv-hero-copy">
          <div className="tv-eyebrow">
            <span className="tv-eyebrow-dot" aria-hidden="true" />
            TOP UP DAN TAGIHAN, SATU LAYAR
          </div>

          <h1 className="tv-hero-title">
            <span>Pulsa sampai tagihan,</span>{" "}
            <span className="tv-hero-mark">beres dari satu layar.</span>
            <span className="tv-hero-tag">Lihat total sebelum bayar, lacak sampai selesai.</span>
          </h1>

          <p className="tv-hero-sub">
            Isi pulsa dan kuota, tambah saldo e-wallet, beli token listrik, atau lunasi cicilan dan
            iuran bulanan. Pilih produk, cek totalnya, bayar lewat QRIS atau transfer, lalu pantau
            pesananmu dengan ID transaksi.
          </p>

          <div className="tv-hero-cta">
            <Link href="/layanan" className="tv-btn tv-btn-primary">
              <span>Mulai Transaksi</span>
              <ArrowRightIcon width={18} height={18} strokeWidth={2.4} />
            </Link>
            <Link href="/cek-transaksi" className="tv-btn tv-btn-ghost">
              <SearchIcon width={17} height={17} strokeWidth={2.2} />
              <span>Lacak Pesanan</span>
            </Link>
          </div>

          <ul className="tv-hero-trust" aria-label="Keunggulan Layanan">
            {heroTrustPoints.map((point) => (
              <li key={point}>
                <CheckIcon width={15} height={15} strokeWidth={2.6} />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="tv-hero-visual">
          <div className="tv-panel">
            <div className="tv-panel-head">
              <h2>Pilih layanan, lanjut bayar</h2>
              <span className="tv-panel-badge">Cek harga dulu</span>
            </div>

            <div className="tv-tiles">
              {quickServices.map((service) => (
                <Link
                  key={service.slug}
                  href={`/layanan?kategori=${service.slug}`}
                  className="tv-tile"
                  aria-label={`Buka layanan ${service.name}`}
                >
                  <span className="tv-tile-icon">
                    <CategoryIcon slug={service.slug} width={22} height={22} />
                  </span>
                  <span className="tv-tile-name">{service.name}</span>
                  {service.from !== null ? (
                    <span className="tv-tile-price">
                      Mulai <b>{rupiah(service.from)}</b>
                    </span>
                  ) : null}
                  <ArrowRightIcon className="tv-tile-arrow" width={16} height={16} strokeWidth={2.4} />
                </Link>
              ))}
            </div>

            <Link href="/layanan" className="tv-panel-link">
              Buka katalog lengkap
              <ArrowRightIcon width={15} height={15} strokeWidth={2.4} />
            </Link>
          </div>

          <div className="tv-float tv-float-qris">
            <span className="tv-float-icon tv-float-icon-light">
              <CheckIcon width={16} height={16} strokeWidth={3} />
            </span>
            <span>
              <b>Bayar lewat QRIS</b>
              <small>Scan, bayar, lalu konfirmasi</small>
            </span>
          </div>

          <div className="tv-float tv-float-track">
            <span className="tv-float-icon tv-float-icon-dark">
              <ClockCheckIcon width={17} height={17} />
            </span>
            <span>
              <b>Pesanan bisa dilacak</b>
              <small className="tv-steps">
                <i /> Dipesan <i /> Dibayar <i className="on" /> Selesai
              </small>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
