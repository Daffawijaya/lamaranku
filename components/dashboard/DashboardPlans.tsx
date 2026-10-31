"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Minus } from "lucide-react";
import { T } from "../i18n/LanguageProvider";
import { Dropdown } from "../ui/Dropdown";
import { DashboardTable } from "./DashboardTable";
import { useAccountPlus } from "./AccountContext";
import { sections, PLUS_PRICE, WA_NUMBER, type CellValue } from "../../data/features";
import { wa } from "../../lib/wa";

function FeatureValue({ value }: { value: CellValue }) {
  if (typeof value === "string") return <T text={value} />;
  return <span className="dashboard-feature-value">{value ? <Check size={16} aria-hidden="true" /> : <Minus size={16} aria-hidden="true" />}<span className="sr-only"><T text={value ? "Termasuk" : "Tidak termasuk"} /></span></span>;
}

export function DashboardPlans() {
  const plus = useAccountPlus();
  const [filter, setFilter] = useState("all");
  const visible = sections.filter(section => filter === "all" || section.id === filter);
  return <div className="dashboard-info">
    <p className="dashboard-info-intro"><T text="Gratis untuk mulai. Pilih paket sesuai kebutuhan dokumen dan persiapan kariermu." /></p>
    <div className="dashboard-info-grid">
      <section className="dash-ui-card dashboard-plan" aria-labelledby="dashboard-basic-title">
        <span className="dash-ui-badge"><T text={plus ? "Mulai gratis" : "Paket saat ini"} /></span>
        <h2 id="dashboard-basic-title"><T text="Basic" /></h2>
        <p className="dashboard-plan-price"><T text="Gratis" /></p>
        <p><T text="Susun dokumen pertamamu dan coba fitur dasar Lamaranku." /></p>
        <Link href="/dashboard/cv-builder" scroll={false} className="dash-ui-button"><T text="Buat CV" /></Link>
      </section>
      <section className="dash-ui-card dashboard-plan" aria-labelledby="dashboard-plus-title">
        <span className="dash-ui-badge"><T text={plus ? "Paket saat ini" : "Lebih lengkap"} /></span>
        <h2 id="dashboard-plus-title"><T text="Plus" /></h2>
        <p className="dashboard-plan-price"><T text={PLUS_PRICE} /></p>
        <p><T text="Pilihan untuk kebutuhan CV, template, dan bantuan AI yang lebih lengkap." /></p>
        {plus ? <span className="dash-ui-badge"><T text="Plus aktif" /></span> : WA_NUMBER !== "6280000000000" ? <a href={wa(`Halo Lamaranku, saya ingin informasi paket Plus ${PLUS_PRICE}`)} target="_blank" rel="noopener noreferrer" className="dash-ui-button dash-ui-button-primary"><T text="Tanya paket Plus" /></a> : <p className="dashboard-info-muted"><T text="Kontak aktivasi Plus belum tersedia." /></p>}
      </section>
    </div>
    <section aria-labelledby="dashboard-comparison-title">
      <div className="dashboard-info-heading"><h2 id="dashboard-comparison-title"><T text="Bandingkan fitur" /></h2><Dropdown label="Saring grup fitur" value={filter} onChange={setFilter} options={[{ value: "all", label: "Semua fitur" }, ...sections.map(section => ({ value: section.id, label: section.title }))]} /></div>
      <div className="dashboard-info-stack">{visible.map(section => <section key={section.id} className="dashboard-table-card" aria-labelledby={`features-${section.id}`}>
        <h3 id={`features-${section.id}`} className="dashboard-table-heading"><T text={section.title} /></h3>
        <DashboardTable caption={<T text={`Perbandingan paket Basic dan Plus untuk ${section.title}`} />} header={<tr><th scope="col"><T text="Fitur" /></th><th scope="col" className="dashboard-plan-value"><T text="Basic" /></th><th scope="col" className="dashboard-plan-value"><T text="Plus" /></th></tr>}>
          {section.rows.map(row => <tr key={row.fitur}><th scope="row"><span className="dashboard-feature-title"><T text={row.fitur} /></span><span className="dashboard-info-muted"><T text={row.deskripsi} /></span></th><td className="dashboard-plan-value"><FeatureValue value={row.basic} /></td><td className="dashboard-plan-value"><FeatureValue value={row.plus} /></td></tr>)}
        </DashboardTable>
      </section>)}</div>
    </section>
    <section className="dash-ui-card dashboard-info-faq" aria-labelledby="dashboard-plan-faq"><h2 id="dashboard-plan-faq"><T text="Tentang paket" /></h2>
      <details><summary><T text="Apakah Basic gratis?" /></summary><p><T text="Ya. Kamu bisa mulai menggunakan Basic tanpa biaya, dengan batas fitur sesuai tabel di atas." /></p></details>
      <details><summary><T text="Bagaimana cara mengaktifkan Plus?" /></summary><p><T text="Konfirmasikan harga dan akses melalui kontak resmi Lamaranku sebelum melakukan pembayaran. Akses Plus mengikuti status akun setelah aktivasi." /></p></details>
      <details><summary><T text="Di mana panduan penggunaan aplikasinya?" /></summary><p><Link href="/dashboard/cara-kerja" scroll={false}><T text="Buka Cara kerja" /></Link></p></details>
    </section>
  </div>;
}
