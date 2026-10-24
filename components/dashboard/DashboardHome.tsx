"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { RefListCard } from "./RefListCard";
import { dashboardTools } from "./navigation";
import { loadSaved } from "../../lib/cv";
export function DashboardHome() {
  const [counts, setCounts] = useState<{
    cv: number;
    portfolio: number;
  } | null>(null);
  useEffect(() => {
    const update = () => {
      let portfolio = 0;
      try {
        const value = JSON.parse(
          localStorage.getItem("lamaranku_portfolios") || "[]",
        );
        if (Array.isArray(value)) portfolio = value.length;
      } catch {}
      setCounts({ cv: loadSaved().length, portfolio });
    };
    update();
    window.addEventListener("storage", update);
    return () => window.removeEventListener("storage", update);
  }, []);
  const stats = [
    { label: "CV tersimpan", value: counts?.cv, href: "/dashboard/cv-builder" },
    {
      label: "Portofolio tersimpan",
      value: counts?.portfolio,
      href: "/dashboard/portfolio",
    },
  ];
  return (
    <div className="workspace-home">
      <div className="workspace-mobile-heading">
        <h1>Beranda</h1>
        <p>Ruang persiapan lamaranmu</p>
      </div>
      <div className="workspace-home-grid">
        <div>
          <div className="workspace-stats">
            {stats.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="ref-card workspace-stat"
              >
                <strong>{s.value ?? "…"}</strong>
                <span>{s.label}</span>
              </Link>
            ))}
          </div>
          <RefListCard
            className="mt-3"
            title="Siapkan lamaranmu"
            ariaLabel="Alat persiapan lamaran"
            items={dashboardTools
              .slice(1)
              .map((t) => ({
                key: t.href,
                title: t.title,
                subtitle: t.description,
                href: t.href,
              }))}
          />
        </div>
        <aside>
          <RefListCard
            ariaLabel="Langkah berikutnya"
            title="Langkah berikutnya"
          >
            <p className="workspace-summary">
              Mulai dari CV, lalu periksa kecocokannya dengan posisi yang kamu
              incar.
            </p>
            <Link
              href="/dashboard/cv-builder"
              className="ref-create workspace-home-action"
            >
              Buat CV
            </Link>
          </RefListCard>
          <RefListCard
            className="mt-3"
            ariaLabel="Penyimpanan dokumen"
            title="Penyimpanan"
          >
            <p className="workspace-summary">
              CV dan portofolio disimpan di browser ini. Gunakan perangkat yang
              sama untuk melanjutkan.
            </p>
          </RefListCard>
        </aside>
      </div>
    </div>
  );
}
