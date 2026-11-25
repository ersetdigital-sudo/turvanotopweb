import { Reveal } from "@/components/motion/Reveal";
import { QuickTrackerForm } from "@/components/home/QuickTrackerForm";
import { timelineSteps } from "@/lib/home-content";

export function HomeTimeline() {
  return (
    <section
      className="home-timeline-section"
      id="alur-transaksi"
      aria-label="Alur Transaksi Turvanotopweb"
    >
      <div className="container">
        <div className="home-sec-header">
          <span className="section-kicker">CARA KERJA</span>
          <h2>Tiga langkah dari pilih sampai selesai</h2>
          <p>
            Tidak perlu membuat akun. Pilih layanan, bayar, lalu cek statusnya kapan pun kamu mau.
          </p>
        </div>

        <Reveal className="home-steps-grid">
          {timelineSteps.map((step) => (
            <div className="home-step-item" key={step.badge}>
              <div className="home-step-badge">{step.badge}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </Reveal>

        <div className="home-tracking-strip">
          <div className="home-tracking-info">
            <h3>Punya ID transaksi?</h3>
            <p>Masukkan di sini untuk melihat status pesananmu.</p>
          </div>
          <QuickTrackerForm />
        </div>
      </div>
    </section>
  );
}
