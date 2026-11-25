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
          <span className="section-kicker">CARA PESAN</span>
          <h2>Pesan dalam tiga langkah</h2>
          <p>
            Nggak perlu akun. Pilih, bayar, lalu pantau statusnya.
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
            <p>Masukkan di sini buat cek status pesananmu.</p>
          </div>
          <QuickTrackerForm />
        </div>
      </div>
    </section>
  );
}
