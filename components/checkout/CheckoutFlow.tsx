"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRightIcon, ClockCheckIcon, SearchIcon } from "@/components/icons";
import { useSearchParam } from "@/hooks/use-search-param";
import { isCategorySlug } from "@/lib/catalog";
import { useLiveCatalog } from "@/hooks/use-live-catalog";
import { apiFetch } from "@/lib/fetcher";
import { keepTogether, rupiah, toWhatsAppLink } from "@/lib/format";
import {
  detectOperator,
  isAutoOperatorCategory,
  productsForProvider,
  toLocalPhone,
} from "@/lib/operator";
import type { CategorySlug, Order, Product, PublicSettings } from "@/types";

const PREPAID = "prabayar";
const STEPPER = ["Data Pelanggan", "Pilih Produk", "Ringkasan", "Pembayaran", "Hasil"];
const BILL_MIN = 10000;
const BILL_MAX = 50000000;

type PaymentMethod = "qris" | "va" | "ewallet";
type LineItem = Product & { isBill?: boolean; adminFee?: number };

function generateOrderId(): string {
  let code = "";
  for (let i = 0; i < 7; i += 1) code += Math.floor(Math.random() * 10);
  return `TVN-${code}`;
}

export function CheckoutFlow() {
  const urlKategori = useSearchParam("kategori");
  const urlCust = useSearchParam("cust");
  const urlProduk = useSearchParam("produk");
  const urlProvider = useSearchParam("provider");

  // Query params seed the flow; explicit user choices override them.
  const [slugOverride, setSlugOverride] = useState<CategorySlug | null>(null);
  const [customerOverride, setCustomerOverride] = useState<string | null>(null);
  const [providerOverride, setProviderOverride] = useState<string | null>(null);
  const [productOverride, setProductOverride] = useState<LineItem | null | undefined>(undefined);
  const [stageOverride, setStageOverride] = useState<number | null>(null);
  // Belum ada metode terpilih: pelanggan memilih dulu, baru petunjuk + QRIS muncul.
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  // ID dibuat saat masuk tahap 4; pesanan baru disimpan saat pelanggan menekan "Saya Sudah Bayar".
  const [pendingId, setPendingId] = useState("");
  const instructionsRef = useRef<HTMLDivElement>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [billAmountInput, setBillAmountInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [custError, setCustError] = useState("");
  const [providerError, setProviderError] = useState("");
  const [showProviderPicker, setShowProviderPicker] = useState(false);
  const [stage2Error, setStage2Error] = useState("");
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");

  // Products and the customer-facing settings are served live from Supabase.
  const { categories, settings } = useLiveCatalog();

  const slug: CategorySlug = slugOverride ?? (isCategorySlug(urlKategori) ? urlKategori : "pulsa");
  const category = categories.find((c) => c.slug === slug) ?? categories[0];
  const isPrepaid = category.type === PREPAID;
  const customer = customerOverride ?? (urlCust || "");
  // Pulsa & paket data: operator ditebak dari nomor, tidak perlu dipilih manual.
  const autoOperator = isAutoOperatorCategory(category.slug);
  const detected = autoOperator ? detectOperator(customer, category.providers) : null;
  const provider =
    providerOverride ??
    detected ??
    (urlProvider && category.providers.includes(urlProvider) ? urlProvider : "");
  const activeProvider = provider || (autoOperator ? "" : category.providers[0] || "");
  const providerPickerVisible =
    category.providers.length > 0 &&
    (!autoOperator ||
      showProviderPicker ||
      (!detected && toLocalPhone(customer).length >= 4));

  // Tagihan: nominal diketik pelanggan dari tagihan aslinya (tidak ada angka rekaan).
  const billAmount = Number(billAmountInput) || 0;

  /** Stage 2 product list — prepaid uses catalog products, bills use the amount the customer typed. */
  const lineItems: LineItem[] = isPrepaid
    ? productsForProvider(category.products, category.slug, activeProvider).map((p) => ({ ...p }))
    : [
        {
          id: `bill-${category.slug}`,
          name: `Tagihan ${category.name}`,
          note: "",
          price: billAmount,
          isBill: true,
          adminFee: settings?.adminFeeBill ?? category.adminFee ?? 2500,
        },
      ];
  // A ?produk= param pre-selects the matching product without an effect.
  const requestedItem = urlProduk ? lineItems.find((i) => i.id === urlProduk) ?? null : null;
  const product =
    productOverride !== undefined
      ? productOverride && lineItems.some((item) => item.id === productOverride.id)
        ? productOverride
        : null
      : requestedItem;
  const activeItem = product ?? lineItems[0] ?? null;
  const admin = activeItem?.isBill ? (settings?.adminFeeBill ?? category.adminFee ?? 2500) : 0;
  const total = activeItem ? activeItem.price + admin : 0;

  // Nomor valid + nominal sudah dipilih di halaman layanan -> langsung ke ringkasan;
  // nomor valid saja -> pilih produk; selain itu mulai dari awal.
  const hasValidCust = !!urlCust && category.field.pattern.test(urlCust);
  const initialStage = hasValidCust
    ? isPrepaid && requestedItem && (!autoOperator || activeProvider)
      ? 3
      : 2
    : 1;
  const stage = stageOverride ?? initialStage;

  const goToStage = useCallback((next: number) => {
    setStageOverride(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  function handleStage1Next() {
    const clean =
      category.field.inputmode === "tel" ? toLocalPhone(customer) : customer.trim().replace(/[\s-]/g, "");
    if (!clean) {
      setCustError(`Silakan masukkan ${category.field.label.toLowerCase()}.`);
      return;
    }
    if (category.field.pattern && !category.field.pattern.test(clean)) {
      setCustError(category.field.error);
      return;
    }
    if (category.providers.length > 0 && !activeProvider) {
      setProviderError(
        autoOperator
          ? "Operator belum dikenali dari nomor ini. Pilih operatornya secara manual."
          : "Silakan pilih provider terlebih dahulu.",
      );
      return;
    }
    setCustError("");
    setProviderError("");
    setCustomerOverride(clean);
    goToStage(2);
  }

  function handleStage2Next() {
    if (!activeItem) {
      setStage2Error("Pilih salah satu produk atau nominal terlebih dahulu.");
      return;
    }
    if (activeItem.isBill && (billAmount < BILL_MIN || billAmount > BILL_MAX)) {
      setStage2Error("Masukkan jumlah tagihan antara Rp10.000 dan Rp50.000.000.");
      return;
    }
    setStage2Error("");
    goToStage(3);
  }

  function selectCategory(nextSlug: CategorySlug) {
    setSlugOverride(nextSlug);
    setProductOverride(undefined);
    setProviderOverride(null);
    setShowProviderPicker(false);
    setCustError("");
    setProviderError("");
    setStage2Error("");
  }

  /**
   * Persists the order to Supabase. The server rebuilds price, status, and SN itself
   * (the order always starts as "menunggu verifikasi admin"). Returns `false` when the
   * server rejects it, leaving the customer on the payment stage with an inline message.
   */
  async function createOrder(): Promise<boolean> {
    setCreatingOrder(true);
    setOrderError("");
    try {
      const { order: created } = await apiFetch<{ order: Order }>("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          id: pendingId || generateOrderId(),
          categorySlug: category.slug,
          provider: activeProvider,
          ...(activeItem?.isBill ? { billAmount } : { productId: activeItem?.id }),
          customer,
          paymentMethod: (paymentMethod ?? "qris").toUpperCase(),
        }),
      });
      setOrder(created);
      return true;
    } catch (error) {
      // ID bentrok: buat ID baru supaya percobaan berikutnya langsung bisa.
      if (error instanceof Error && /terpakai/i.test(error.message)) setPendingId(generateOrderId());
      setOrderError(
        error instanceof Error ? error.message : "Gagal membuat pesanan. Silakan coba lagi.",
      );
      return false;
    } finally {
      setCreatingOrder(false);
    }
  }

  /** Ringkasan -> pembayaran: metode dipilih ulang dan ID baru dibuat tiap masuk tahap 4. */
  function goToPayment() {
    setPaymentMethod(null);
    setPendingId(generateOrderId());
    setOrderError("");
    goToStage(4);
  }

  function selectPaymentMethod(next: PaymentMethod) {
    setPaymentMethod(next);
    setOrderError("");
    // Bawa petunjuk (dan foto QRIS) ke layar, terutama di ponsel.
    window.setTimeout(
      () => instructionsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      60,
    );
  }

  async function handleConfirmPayment() {
    if (!paymentMethod || submitting) return;
    setSubmitting(true);
    const saved = await createOrder();
    if (!saved) {
      setSubmitting(false);
      return;
    }
    setTimeout(() => {
      setSubmitting(false);
      goToStage(5);
    }, 900);
  }

  const waText = pendingId
    ? `Halo Admin Turvanotopweb, saya ingin konfirmasi pembayaran untuk pesanan ID: ${pendingId} (${activeProvider ? `${activeProvider} — ` : ""}${activeItem?.name ?? ""}) sebesar ${rupiah(total)}. Nomor tujuan: ${customer}.`
    : "";

  return (
    <div className="container checkout-container">
      {/* Stepper */}
      <div className="checkout-stepper">
        {STEPPER.map((label, index) => {
          const stepNo = index + 1;
          const cls = stepNo === stage ? " active" : stepNo < stage ? " done" : "";
          return (
            <div className={`step-indicator-item${cls}`} id={`stepper-${stepNo}`} key={label}>
              <span className="step-num-badge">{stepNo}</span>
              <span>{label}</span>
            </div>
          );
        })}
      </div>

      <div className="checkout-card" id="checkout-flow-card">
        {/* Stage 1 */}
        <div className={`checkout-stage-pane${stage === 1 ? " active" : ""}`} id="stage-1-pane">
          <div className="section-kicker">TAHAP 01</div>
          <h1 className="stage-title">Masukkan data pelanggan.</h1>
          <p className="stage-desc">Pastikan nomor atau ID yang kamu masukkan sudah benar.</p>

          <label className="form-label">Kategori Layanan</label>
          <div className="category-select-grid">
            {categories.map((c) => (
              <button
                key={c.slug}
                type="button"
                className={`cat-select-btn${c.slug === slug ? " active" : ""}`}
                data-cat={c.slug}
                onClick={() => selectCategory(c.slug)}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: 28 }}>
            <label className="form-label" id="customer-id-label" htmlFor="customer-id-input">
              {category.field.label}
            </label>
            <input
              type="text"
              id="customer-id-input"
              className="form-control-input"
              placeholder={category.field.placeholder}
              inputMode={category.field.inputmode}
              autoComplete="tel"
              value={customer}
              onChange={(event) => {
                const next = event.target.value;
                // Nomor berganti operator -> buang pilihan manual sebelumnya.
                if (autoOperator && detectOperator(next, category.providers) !== detected) {
                  setProviderOverride(null);
                  setShowProviderPicker(false);
                }
                setCustomerOverride(next);
                setCustError("");
                setProviderError("");
              }}
            />
            {autoOperator && activeProvider && (
              <div id="detected-provider-badge" className="operator-detect-badge" style={{ marginTop: 10 }}>
                ✓ Operator {activeProvider === detected ? "terdeteksi" : "dipilih"}: {activeProvider}
                {detected && (
                  <button
                    type="button"
                    className="operator-detect-change"
                    onClick={() => setShowProviderPicker((open) => !open)}
                  >
                    {showProviderPicker ? "Tutup" : "Ganti"}
                  </button>
                )}
              </div>
            )}
            <div id="customer-id-error" style={{ color: "#DC2626", fontSize: 13, marginTop: 6 }}>
              {custError}
            </div>
          </div>

          <div
            id="checkout-provider-section"
            style={{ marginBottom: 28, display: providerPickerVisible ? "block" : "none" }}
          >
            <label className="form-label" id="checkout-provider-label">
              {category.slug === "uang-elektronik"
                ? "Pilih Dompet Digital / E-Wallet"
                : autoOperator
                  ? "Pilih Operator Secara Manual"
                  : "Pilih Operator / Penyedia Resmi"}
            </label>
            <div id="checkout-provider-chips" className="provider-chips-wrap">
              {category.providers.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`provider-chip-btn${p === activeProvider ? " active" : ""}`}
                  data-provider={p}
                  onClick={() => {
                    setProviderOverride(p);
                    setProviderError("");
                    if (autoOperator && detected) setShowProviderPicker(false);
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
            <div id="checkout-provider-error" style={{ color: "#DC2626", fontSize: 13, marginTop: 6 }}>
              {providerError}
            </div>
          </div>

          <button
            type="button"
            className="btn-primary"
            id="btn-stage1-next"
            style={{ width: "100%" }}
            onClick={handleStage1Next}
          >
            Pilih Produk
            <ArrowRightIcon width={16} height={16} strokeWidth={2.2} />
          </button>
        </div>

        {/* Stage 2 */}
        <div className={`checkout-stage-pane${stage === 2 ? " active" : ""}`} id="stage-2-pane">
          <div className="section-kicker">TAHAP 02</div>
          <h2 className="stage-title">Pilih produk yang sesuai.</h2>
          <p className="stage-desc">Periksa nominal dan harga sebelum melanjutkan.</p>

          <div
            id="stage-2-provider-bar"
            style={{
              marginBottom: 18,
              padding: "12px 18px",
              background: "#e9eef8",
              borderRadius: 10,
              border: "1.5px solid #c3cfe8",
              display: activeProvider ? "flex" : "none",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ fontSize: 14, color: "#14213f" }}>
              Provider / Dompet Digital:{" "}
              <strong id="stage2-provider-name" style={{ color: "#2e4c8c", fontSize: 15 }}>
                {activeProvider || "-"}
              </strong>
            </div>
            <button
              type="button"
              id="btn-change-provider"
              className="btn-secondary"
              style={{ padding: "4px 12px", fontSize: 12, cursor: "pointer" }}
              onClick={() => goToStage(1)}
            >
              Ganti Provider
            </button>
          </div>

          <div className="checkout-products-list" id="checkout-products-list">
            {isPrepaid && lineItems.length === 0 ? (
              <div className="products-empty-hint" style={{ gridColumn: "1 / -1" }}>
                Belum ada paket untuk operator ini. Kembali ke tahap 1 lalu pilih operatornya.
              </div>
            ) : isPrepaid ? (
              lineItems.map((item) => {
                const selected = activeItem?.id === item.id;
                const displayName =
                  activeProvider && category.slug === "uang-elektronik"
                    ? `${activeProvider} ${item.name}`
                    : item.name;
                return (
                  <div
                    key={item.id}
                    className={`product-card-item${selected ? " selected" : ""}`}
                    data-id={item.id}
                    onClick={() => {
                      setProductOverride(item);
                      setStage2Error("");
                    }}
                  >
                    {activeProvider && (
                      <div className="product-provider-badge">{activeProvider}</div>
                    )}
                    <div className="product-name-txt">{keepTogether(displayName)}</div>
                    <div className="product-note-txt">{keepTogether(item.note)}</div>
                    <div className="product-price-txt">{rupiah(item.price)}</div>
                  </div>
                );
              })
            ) : (
              <div
                style={{
                  gridColumn: "1 / -1",
                  background: "#e9eef8",
                  border: "1.5px solid #c3cfe8",
                  borderRadius: 12,
                  padding: 22,
                  color: "#14213f",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Jumlah tagihan</div>
                <div style={{ fontSize: 14, color: "#2e4c8c", marginBottom: 14 }}>
                  Nomor Pelanggan: <b>{customer}</b> ({category.name}). Masukkan nominal sesuai tagihan aslimu.
                </div>
                <label htmlFor="bill-amount-input" style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                  Nominal tagihan (Rp)
                </label>
                <input
                  type="text"
                  id="bill-amount-input"
                  className="form-control-input"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="Contoh: 145000"
                  value={billAmount ? billAmount.toLocaleString("id-ID") : ""}
                  onChange={(event) => {
                    setBillAmountInput(event.target.value.replace(/\D/g, "").slice(0, 9));
                    setStage2Error("");
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    marginTop: 14,
                    borderTop: "1px solid #c3cfe8",
                    fontSize: 14,
                  }}
                >
                  <span>Biaya Administrasi:</span>
                  <b>{rupiah(settings?.adminFeeBill ?? category.adminFee ?? 2500)}</b>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    borderTop: "1px solid #c3cfe8",
                    fontSize: 14,
                  }}
                >
                  <span>Total:</span>
                  <b>{rupiah(total)}</b>
                </div>
              </div>
            )}
          </div>

          <div id="stage-2-error" style={{ color: "#DC2626", fontSize: 13, marginBottom: 18 }}>
            {stage2Error}
          </div>

          <div style={{ display: "flex", gap: 14, justifyContent: "space-between" }}>
            <button type="button" className="btn-secondary" id="btn-stage2-back" onClick={() => goToStage(1)}>
              &larr; Kembali
            </button>
            <button type="button" className="btn-primary" id="btn-stage2-next" onClick={handleStage2Next}>
              Lanjut ke Ringkasan &rarr;
            </button>
          </div>
        </div>

        {/* Stage 3 */}
        <div className={`checkout-stage-pane${stage === 3 ? " active" : ""}`} id="stage-3-pane">
          <div className="section-kicker">TAHAP 03</div>
          <h2 className="stage-title">Periksa pesananmu.</h2>
          <p className="stage-desc">
            Pastikan produk, data pelanggan, dan total pembayaran sudah sesuai.
          </p>

          <div className="summary-box">
            <div className="summary-row">
              <span className="label">Kategori Layanan</span>
              <span className="val" id="summary-category-val">
                {category.name}
              </span>
            </div>
            <div
              className="summary-row"
              id="summary-provider-row"
              style={activeProvider ? undefined : { display: "none" }}
            >
              <span className="label" id="summary-provider-label">
                {category.slug === "uang-elektronik"
                  ? "Penyedia / Dompet Digital"
                  : "Penyedia / Operator"}
              </span>
              <span className="val" id="summary-provider-val" style={{ fontWeight: 700, color: "#2e4c8c" }}>
                {activeProvider || "-"}
              </span>
            </div>
            <div className="summary-row">
              <span className="label">Nomor / ID Pelanggan</span>
              <span className="val" id="summary-cust-id-val" style={{ fontFamily: "var(--font-mono)" }}>
                {customer}
              </span>
            </div>
            <div className="summary-row">
              <span className="label">Produk Terpilih</span>
              <span className="val" id="summary-product-val">
                {(activeProvider ? `${activeProvider} — ` : "") + (activeItem?.name ?? "-")}
              </span>
            </div>
            <div className="summary-row">
              <span className="label">Harga Produk</span>
              <span className="val" id="summary-price-val">
                {rupiah(activeItem?.price ?? 0)}
              </span>
            </div>
            <div className="summary-row">
              <span className="label">Biaya Administrasi</span>
              <span className="val" id="summary-admin-val">
                {admin ? rupiah(admin) : "Rp 0 (Termasuk)"}
              </span>
            </div>
            <div className="summary-row total">
              <span className="label">Total Pembayaran</span>
              <span className="val" id="summary-total-val">
                {rupiah(total)}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 14, justifyContent: "space-between" }}>
            <button
              type="button"
              className="btn-secondary"
              id="btn-stage3-back"
              disabled={creatingOrder}
              onClick={() => goToStage(2)}
            >
              Ubah Pesanan
            </button>
            <button
              type="button"
              className="btn-primary"
              id="btn-stage3-next"
              disabled={creatingOrder}
              onClick={goToPayment}
            >
              Lanjut ke Pembayaran →
            </button>
          </div>
        </div>

        {/* Stage 4 */}
        <div className={`checkout-stage-pane${stage === 4 ? " active" : ""}`} id="stage-4-pane">
          <div className="section-kicker">TAHAP 04</div>
          <h2 className="stage-title">Selesaikan pembayaran.</h2>
          <p className="stage-desc">Pilih metode pembayaran, lalu ikuti petunjuknya sampai selesai.</p>

          <div className="pay-total-box">
            <span className="pay-total-label">Total yang harus dibayar:</span>
            <span id="payment-total-val" className="pay-total-val">
              {rupiah(total)}
            </span>
          </div>

          <div className="pay-step-label">
            <span className="pay-step-num">1</span>
            Pilih metode pembayaran
          </div>
          <div className="payment-methods-grid">
            {(
              [
                { id: "qris", icon: "QRIS", note: "Semua e-wallet & m-banking" },
                { id: "va", icon: "Transfer Bank", note: "Ke rekening resmi kami" },
                { id: "ewallet", icon: "Dompet Digital", note: "DANA, OVO, GoPay, dll." },
              ] as const
            ).map((method) => (
              <div
                key={method.id}
                role="button"
                tabIndex={0}
                aria-pressed={paymentMethod === method.id}
                className={`payment-method-card${paymentMethod === method.id ? " selected" : ""}`}
                data-method={method.id}
                onClick={() => selectPaymentMethod(method.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    selectPaymentMethod(method.id);
                  }
                }}
              >
                <div className="pay-card-icon">{method.icon}</div>
                <div className="pay-card-note">{method.note}</div>
              </div>
            ))}
          </div>

          <div ref={instructionsRef} className="payment-instructions-box" id="payment-instructions-wrap">
            {paymentMethod ? (
              <>
                <div className="pay-step-label">
                  <span className="pay-step-num">2</span>
                  {PAYMENT_TITLES[paymentMethod]}
                </div>
                <PaymentInstructions
                  method={paymentMethod}
                  info={{
                    id: pendingId,
                    totalFormatted: rupiah(total),
                    provider: activeProvider,
                    customer,
                  }}
                  settings={settings}
                  waText={waText}
                />
              </>
            ) : (
              <div className="pay-empty-hint" id="payment-empty-hint">
                Pilih salah satu metode pembayaran di atas, nanti petunjuk dan kode pembayarannya
                (termasuk foto QRIS) muncul di sini.
              </div>
            )}
          </div>

          {orderError && (
            <div id="stage-4-error" style={{ color: "#DC2626", fontSize: 13.5, marginBottom: 16 }}>
              {orderError}
            </div>
          )}

          <div className="pay-note">
            Setelah membayar, tekan <b>Saya Sudah Bayar</b>. Status pesananmu diperbarui setelah
            pembayaran diverifikasi.
          </div>

          <div className="pay-actions">
            <button
              type="button"
              className="btn-secondary"
              id="btn-stage4-back"
              disabled={submitting}
              onClick={() => goToStage(3)}
            >
              &larr; Kembali
            </button>
            <button
              type="button"
              className="btn-primary"
              id="btn-stage4-check-payment"
              onClick={handleConfirmPayment}
              disabled={!paymentMethod || submitting}
            >
              {submitting ? (
                <>
                  <span
                    style={{
                      display: "inline-block",
                      width: 14,
                      height: 14,
                      border: "2px solid #FFFFFF",
                      borderRightColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin 0.7s linear infinite",
                    }}
                  />
                  Memproses pesanan...
                </>
              ) : (
                <>
                  Saya Sudah Bayar
                  <ClockCheckIcon width={16} height={16} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stage 5 */}
        <div className={`checkout-stage-pane${stage === 5 ? " active" : ""}`} id="stage-5-pane">
          <div id="stage5-processing-state" className="stage-status-box">
            <div className="stage-status-icon-wrap pending">
              <ClockCheckIcon width={34} height={34} />
            </div>
            <h2 className="stage-title">Pembayaran terkonfirmasi.</h2>
            <p className="stage-desc">
              Admin akan memverifikasi pembayaranmu, lalu memproses pesananmu. Simpan ID transaksi di bawah dan pantau
              statusnya kapan saja.
            </p>

            <div className="summary-box" style={{ textAlign: "left", marginTop: 26 }}>
              <div className="summary-row">
                <span className="label">ID Transaksi</span>
                <span
                  className="val"
                  id="final-tx-id"
                  style={{ fontFamily: "var(--font-mono)", color: "#2e4c8c", fontSize: 17 }}
                >
                  {order?.id ?? "-"}
                </span>
              </div>
              <div
                className="summary-row"
                id="final-provider-row"
                style={order?.provider ? undefined : { display: "none" }}
              >
                <span className="label" id="final-provider-label">
                  {category.slug === "uang-elektronik" ? "Penyedia / Dompet Digital" : "Penyedia / Operator"}
                </span>
                <span className="val" id="final-provider-val" style={{ fontWeight: 700, color: "#2e4c8c" }}>
                  {order?.provider || "-"}
                </span>
              </div>
              <div className="summary-row">
                <span className="label">Produk</span>
                <span className="val" id="final-product-name">
                  {order ? `${order.category} — ${order.product}` : "-"}
                </span>
              </div>
              <div className="summary-row">
                <span className="label">Nomor / ID Pelanggan</span>
                <span className="val" id="final-cust-id" style={{ fontFamily: "var(--font-mono)" }}>
                  {order?.customer ?? "-"}
                </span>
              </div>
              <div className="summary-row">
                <span className="label">Total</span>
                <span className="val" id="final-total" style={{ fontWeight: 700 }}>
                  {order?.totalFormatted ?? "-"}
                </span>
              </div>
              <div className="summary-row">
                <span className="label">Status</span>
                <span className="val" id="final-status" style={{ color: "#b45309", fontWeight: 700 }}>
                  {order?.statusLabel ?? "Menunggu Verifikasi Admin"}
                </span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 14,
                marginTop: 30,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Link
                href={order ? `/cek-transaksi?id=${encodeURIComponent(order.id)}` : "/cek-transaksi"}
                id="btn-view-in-tracker"
                className="btn-primary"
              >
                Pantau di Cek Transaksi
              </Link>
              <Link href="/layanan" className="btn-secondary">
                Transaksi Layanan Lain
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const PAYMENT_TITLES: Record<PaymentMethod, string> = {
  qris: "Bayar dengan QRIS",
  va: "Transfer ke rekening bank",
  ewallet: "Kirim ke dompet digital",
};

interface PaymentInfo {
  id: string;
  totalFormatted: string;
  provider: string;
  customer: string;
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="pay-copy-btn"
      aria-label={`Salin ${label}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1800);
        } catch {
          /* clipboard tidak tersedia: pengguna bisa menyalin manual */
        }
      }}
    >
      {copied ? "Tersalin ✓" : "Salin"}
    </button>
  );
}

function PayStepList({ steps }: { steps: React.ReactNode[] }) {
  return (
    <ol className="pay-steps-list">
      {steps.map((step, index) => (
        <li key={index}>{step}</li>
      ))}
    </ol>
  );
}

function WhatsAppButton({ href }: { href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="pay-wa-btn">
      <svg
        width={15}
        height={15}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#10B981"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
      Tanya admin via WhatsApp
    </a>
  );
}

function AccountList({
  accounts,
  emptyText,
}: {
  accounts: { id: string; title: string; holder: string; number: string }[];
  emptyText: string;
}) {
  if (accounts.length === 0) {
    return <div className="pay-empty-hint">{emptyText}</div>;
  }
  return (
    <div className="pay-account-list">
      {accounts.map((account) => (
        <div className="pay-account-card" key={account.id}>
          <div>
            <div className="pay-account-name">{account.title}</div>
            <div className="pay-account-holder">a.n. {account.holder}</div>
          </div>
          <div className="pay-account-right">
            <span className="pay-account-num">{account.number}</span>
            <CopyButton value={account.number.replace(/\s/g, "")} label={`nomor ${account.title}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Petunjuk pembayaran sesuai metode yang dipilih pelanggan. */
function PaymentInstructions({
  method,
  info,
  settings,
  waText,
}: {
  method: PaymentMethod;
  info: PaymentInfo;
  settings: PublicSettings | null;
  waText: string;
}) {
  if (!settings) {
    return <div className="pay-empty-hint">Memuat petunjuk pembayaran…</div>;
  }
  const waButton = settings.whatsappNumber ? (
    <WhatsAppButton href={toWhatsAppLink(settings.whatsappNumber, waText)} />
  ) : null;
  const idRow = (
    <div className="pay-id-row">
      ID Transaksi: <b>{info.id}</b>
    </div>
  );

  if (method === "qris") {
    const hasQris = settings.qrisActive !== false && !!settings.qrisImage;
    return (
      <div className="pay-panel pay-panel-qris">
        <div className="pay-qris-frame">
          {hasQris ? (
            // Next's optimizer is bypassed on purpose so the stored image is
            // served as-is: re-encoding could soften a scannable QR code.
            <Image
              src={settings.qrisImage}
              alt="Kode QRIS pembayaran Turvanotopweb"
              width={320}
              height={320}
              unoptimized
              priority
            />
          ) : (
            <p className="pay-qris-missing">
              QRIS belum tersedia. Hubungi admin lewat WhatsApp untuk menyelesaikan pembayaran.
            </p>
          )}
          {hasQris && (
            <>
              <div className="pay-qris-merchant">{settings.qrisMerchant || "QRIS Turvanotopweb"}</div>
              {settings.qrisNmid && <div className="pay-qris-nmid">NMID: {settings.qrisNmid}</div>}
            </>
          )}
        </div>
        <div className="pay-panel-body">
          <PayStepList
            steps={[
              "Buka aplikasi e-wallet atau m-banking apa pun yang mendukung QRIS.",
              <>
                Pilih menu <b>Bayar / Scan QRIS</b>, lalu pindai kode QRIS di halaman ini.
              </>,
              <>
                Pastikan nominalnya <b>{info.totalFormatted}</b>, lalu selesaikan pembayaran.
              </>,
              <>
                Kembali ke halaman ini dan tekan <b>Saya Sudah Bayar</b>.
              </>,
            ]}
          />
          {settings.qrisInstructions && <p className="pay-note-small">{settings.qrisInstructions}</p>}
          {idRow}
          {waButton}
        </div>
      </div>
    );
  }

  if (method === "va") {
    const accounts = (settings.banks || [])
      .filter((bank) => bank.active !== false)
      .map((bank) => ({ id: bank.id, title: `Bank ${bank.name}`, holder: bank.accName, number: bank.accNo }));
    return (
      <div className="pay-panel pay-panel-stack">
        <AccountList
          accounts={accounts}
          emptyText="Rekening transfer belum tersedia. Hubungi admin lewat WhatsApp untuk menyelesaikan pembayaran."
        />
        <PayStepList
          steps={[
            "Buka m-banking atau ATM bank kamu, pilih menu Transfer.",
            <>
              Transfer ke salah satu rekening di atas sebesar <b>{info.totalFormatted}</b> (tepat sesuai
              nominal).
            </>,
            "Simpan bukti transfer.",
            <>
              Kembali ke halaman ini dan tekan <b>Saya Sudah Bayar</b>.
            </>,
          ]}
        />
        {idRow}
        {waButton}
      </div>
    );
  }

  const wallets = (settings.ewallets || [])
    .filter((wallet) => wallet.active !== false)
    .map((wallet) => ({ id: wallet.id, title: wallet.name, holder: wallet.accName, number: wallet.accNo }));
  return (
    <div className="pay-panel pay-panel-stack">
      <AccountList
        accounts={wallets}
        emptyText="Akun dompet digital belum tersedia. Hubungi admin lewat WhatsApp untuk menyelesaikan pembayaran."
      />
      <PayStepList
        steps={[
          "Buka aplikasi dompet digitalmu (DANA, OVO, GoPay, dan lainnya).",
          <>
            Kirim saldo ke salah satu akun di atas sebesar <b>{info.totalFormatted}</b> (tepat sesuai
            nominal).
          </>,
          "Simpan bukti pengiriman.",
          <>
            Kembali ke halaman ini dan tekan <b>Saya Sudah Bayar</b>.
          </>,
        ]}
      />
      {idRow}
      {waButton}
    </div>
  );
}
