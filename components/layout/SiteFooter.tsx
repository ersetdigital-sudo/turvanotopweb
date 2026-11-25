import Link from "next/link";
import { BrandMarkIcon } from "@/components/icons";
import { footerInfoLinks } from "@/lib/site";
import { serviceLinks } from "@/lib/services";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="footer-brand-logo" aria-label="Turvanotopweb Beranda">
              <span className="brand-icon-mark" aria-hidden="true">
                <BrandMarkIcon width={20} height={20} />
              </span>
              <span className="footer-brand-name">
                Turvano<span>topweb</span>
              </span>
            </Link>
            <p className="footer-brand-desc">
              Isi ulang dan bayar tagihan di satu tempat: pulsa, kuota, saldo e-wallet, token
              listrik, sampai cicilan.
            </p>
            <p className="footer-brand-sub">
              Harga kelihatan sebelum bayar, dan pesananmu bisa dilacak kapan saja.
            </p>
          </div>

          <div>
            <h4 className="footer-heading">Layanan</h4>
            <ul className="footer-links-grid">
              {serviceLinks.map((service) => (
                <li key={service.slug}>
                  <Link href={service.href}>{service.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="footer-heading">Informasi</h4>
            <ul className="footer-links-list">
              {footerInfoLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-copy">
            &copy; <span className="current-year">{year}</span> Turvanotopweb. Hak Cipta Dilindungi.
          </div>
        </div>
      </div>
    </footer>
  );
}
