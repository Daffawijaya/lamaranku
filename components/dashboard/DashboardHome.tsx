"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  ChevronDown,
  FileText,
  GraduationCap,
  Info,
  Plus,
  ScanText,
} from "lucide-react";
import { loadSaved, type SavedCv } from "../../lib/cv";
import { cvCompletion, cvSections, savedCvDate } from "../../lib/dashboard";
import { TEMPLATES, templateById } from "../../data/templates";
import { dashboardTools } from "./navigation";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];
const SECTION_NAMES = [
  "Informasi kontak",
  "Ringkasan profil",
  "Pengalaman kerja",
  "Pendidikan",
  "Keahlian",
];
const editHref = (id: string) =>
  "/dashboard/cv-builder?cv=" + encodeURIComponent(id);
const average = (values: number[]) =>
  values.length
    ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
    : 0;

export function DashboardHome() {
  const [saved, setSaved] = useState<SavedCv[] | null>(null);
  const [period, setPeriod] = useState("all");
  const [documentId, setDocumentId] = useState("all");
  const [template, setTemplate] = useState("all");
  const [year, setYear] = useState(new Date().getFullYear());
  useEffect(() => {
    const read = () => setSaved(loadSaved().reverse());
    read();
    window.addEventListener("storage", read);
    return () => window.removeEventListener("storage", read);
  }, []);

  const entries = (saved ?? []).filter((cv) => {
    const date = savedCvDate(cv.updatedAt);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - Number(period));
    cutoff.setHours(0, 0, 0, 0);
    return (
      (documentId === "all" || documentId === cv.id) &&
      (template === "all" || template === cv.data.templateId) &&
      (period === "all" || (date !== null && date >= cutoff))
    );
  });
  const sections = SECTION_NAMES.map((name, index) => ({
    name,
    value: average(entries.map((cv) => cvSections(cv.data)[index].value)),
  }));
  const weakest = [...sections].sort((a, b) => a.value - b.value).slice(0, 3);
  const strongest = [...sections].sort((a, b) => b.value - a.value).slice(0, 3);
  const activity = MONTHS.map(
    (_, month) =>
      entries.filter((cv) => {
        const date = savedCvDate(cv.updatedAt);
        return date?.getFullYear() === year && date.getMonth() === month;
      }).length,
  );
  const maxActivity = Math.max(4, ...activity);
  const years = Array.from(
    new Set([
      new Date().getFullYear(),
      ...(saved ?? []).flatMap((cv) => {
        const date = savedCvDate(cv.updatedAt);
        return date ? [date.getFullYear()] : [];
      }),
    ]),
  ).sort((a, b) => b - a);
  const completion = average(entries.map((cv) => cvCompletion(cv.data)));
  const completeCount = entries.filter(
    (cv) => cvCompletion(cv.data) === 100,
  ).length;
  const metrics = [
    { label: "CV tersimpan", value: entries.length, suffix: " dokumen" },
    {
      label: "Pengalaman kerja",
      value: entries.reduce(
        (sum, cv) =>
          sum +
          cv.data.pengalaman.filter(
            (item) => item.jabatan.trim() || item.perusahaan.trim(),
          ).length,
        0,
      ),
      suffix: " posisi",
    },
    {
      label: "Keahlian tercantum",
      value: new Set(
        entries.flatMap((cv) =>
          cv.data.keahlian
            .split(/[,;\n]/)
            .map((skill) => skill.trim().toLowerCase())
            .filter(Boolean),
        ),
      ).size,
      suffix: " keahlian",
    },
    {
      label: "Kelengkapan kontak",
      value: sections[0].value + "%",
      series: entries.map((cv) => cvSections(cv.data)[0].value).reverse(),
    },
    {
      label: "Kelengkapan CV",
      value: completion + "%",
      series: entries.map((cv) => cvCompletion(cv.data)).reverse(),
    },
    {
      label: "CV lengkap",
      value: completeCount,
      suffix: ` / ${entries.length}`,
      series: entries
        .map((cv) => (cvCompletion(cv.data) === 100 ? 100 : 0))
        .reverse(),
    },
  ];

  return (
    <div className="report-dashboard" aria-busy={saved === null}>
      <div className="report-filters">
        <Filter label="Periode" value={period} onChange={setPeriod}>
          <option value="all">Semua waktu</option>
          <option value="30">30 hari terakhir</option>
          <option value="7">7 hari terakhir</option>
        </Filter>
        <Filter label="Dokumen" value={documentId} onChange={setDocumentId}>
          <option value="all">Semua CV</option>
          {(saved ?? []).map((cv) => (
            <option key={cv.id} value={cv.id}>
              {cv.judul}
            </option>
          ))}
        </Filter>
        <Filter label="Template" value={template} onChange={setTemplate}>
          <option value="all">Semua template</option>
          {TEMPLATES.map((item) => (
            <option value={item.id} key={item.id}>
              {item.name}
            </option>
          ))}
        </Filter>
      </div>
      <div className="report-top-grid">
        <section className="report-metrics" aria-label="Statistik CV">
          {metrics.map((metric) => (
            <article className="report-card report-metric" key={metric.label}>
              <h2>
                {metric.label}
                {metric.label === "Kelengkapan CV" && (
                  <span title="Persentase kolom terisi, bukan skor ATS atau penilaian AI.">
                    <Info
                      size={12}
                      aria-label="Dihitung dari kolom yang terisi"
                    />
                  </span>
                )}
              </h2>
              <div className="report-metric-value">
                {saved === null ? "—" : metric.value}
                <small>{metric.suffix}</small>
              </div>
              {metric.series !== undefined && (
                <Sparkline values={metric.series} />
              )}
            </article>
          ))}
        </section>
        <section
          className="report-card report-activity"
          aria-labelledby="activity-title"
        >
          <div className="report-card-heading">
            <h2 id="activity-title">Aktivitas dokumen</h2>
            <label className="report-year">
              <span className="sr-only">Tahun aktivitas</span>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
              >
                {years.map((y) => (
                  <option key={y}>{y}</option>
                ))}
              </select>
              <ChevronDown size={11} />
            </label>
          </div>
          <div
            className="report-chart"
            role="img"
            aria-label={`Jumlah CV terakhir diperbarui per bulan tahun ${year}: ${MONTHS.map((month, i) => `${month} ${activity[i]}`).join(", ")}`}
          >
            <div className="report-chart-scale">
              {[4, 3, 2, 1, 0].map((n) => (
                <span key={n}>{Math.round((maxActivity * n) / 4)}</span>
              ))}
            </div>
            <div className="report-bars">
              {MONTHS.map((month, i) => (
                <div
                  className="report-bar-column"
                  key={month}
                  title={`${month} ${year}: ${activity[i]} CV`}
                >
                  <div className="report-bar-track">
                    <span
                      style={{
                        height: (activity[i] / maxActivity) * 100 + "%",
                      }}
                    />
                  </div>
                  <span>{month}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="report-chart-note">
            {entries.length
              ? "Berdasarkan tanggal pembaruan terakhir CV tersimpan."
              : "Simpan CV pertama untuk mulai melihat aktivitasmu."}
          </p>
        </section>
      </div>
      <div className="report-two-columns">
        <SectionProgress
          title="Bagian yang perlu dilengkapi"
          sections={weakest}
          tone="coral"
          hasData={entries.length > 0}
        />
        <SectionProgress
          title="Bagian paling lengkap"
          sections={strongest}
          tone="green"
          hasData={entries.length > 0}
        />
      </div>
      <div className="report-two-columns">
        <section
          className="report-card report-documents"
          aria-labelledby="documents-title"
        >
          <div className="report-card-heading">
            <h2 id="documents-title">Dokumen terbaru</h2>
            <Link href="/dashboard/cv-builder" aria-label="Buat CV baru">
              <Plus size={15} />
            </Link>
          </div>
          {saved === null ? (
            <p className="report-empty" role="status">
              Memuat dokumen…
            </p>
          ) : entries.length ? (
            <div className="report-document-list">
              {entries.slice(0, 4).map((cv, index) => (
                <Link
                  href={editHref(cv.id)}
                  key={cv.id}
                  className="report-document"
                >
                  <span className="report-document-icon">
                    <FileText size={19} />
                  </span>
                  <span>
                    <strong>{cv.judul}</strong>
                    <small>
                      {templateById(cv.data.templateId).name} · {cv.updatedAt}
                    </small>
                  </span>
                  <span className="report-document-rank">
                    {index + 1} <ArrowUpRight size={13} />
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="report-empty">
              <FileText size={26} strokeWidth={1.4} />
              <strong>
                {saved?.length
                  ? "Belum ada CV sesuai filter"
                  : "Belum ada CV tersimpan"}
              </strong>
              <p>
                {saved?.length
                  ? "Coba pilih periode atau template lain."
                  : "Mulai susun CV, lalu simpan untuk melanjutkannya di sini."}
              </p>
              <Link href="/dashboard/cv-builder">
                Buat CV baru <ArrowUpRight size={13} />
              </Link>
            </div>
          )}
        </section>
        <section
          className="report-card report-shortcuts"
          aria-labelledby="shortcuts-title"
        >
          <div className="report-card-heading">
            <h2 id="shortcuts-title">Alat persiapan lamaran</h2>
          </div>
          {dashboardTools.slice(1).map((tool) => (
            <Link key={tool.href} href={tool.href} className="report-shortcut">
              <span className="report-shortcut-icon">
                <tool.icon size={17} />
              </span>
              <span>
                <strong>{tool.title}</strong>
                <small>{tool.description}</small>
              </span>
              <ArrowUpRight size={14} />
            </Link>
          ))}
        </section>
      </div>
      <p className="report-footnote">
        <Info size={12} /> Data dari CV yang disimpan di browser ini.
        Kelengkapan menunjukkan kolom terisi, bukan skor ATS.
      </p>
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  const series = values.length > 1 ? values : [values[0] ?? 0, values[0] ?? 0];
  const points = series
    .map(
      (value, i) =>
        `${(i / (series.length - 1)) * 120},${27 - (value / 100) * 22}`,
    )
    .join(" ");
  return (
    <svg
      className="report-sparkline"
      viewBox="0 0 120 32"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polygon points={`0,32 ${points} 120,32`} fill="#edf3ff" />
      <polyline
        points={points}
        fill="none"
        stroke="#3b6cff"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function Filter({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="report-filter">
      <span>{label}:</span>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </select>
      <ChevronDown size={12} />
    </label>
  );
}

function SectionProgress({
  title,
  sections,
  tone,
  hasData,
}: {
  title: string;
  sections: { name: string; value: number }[];
  tone: "coral" | "green";
  hasData: boolean;
}) {
  const icons = [BriefcaseBusiness, GraduationCap, ScanText];
  return (
    <section className={`report-card report-progress report-progress-${tone}`}>
      <div className="report-card-heading">
        <h2>{title}</h2>
      </div>
      {sections.map((section, index) => {
        const Icon = icons[index];
        return (
          <div className="report-progress-row" key={section.name}>
            <span className="report-progress-icon">
              <Icon size={17} />
            </span>
            <div>
              <span>{section.name}</span>
              <div className="report-progress-line">
                <div className="report-progress-track">
                  <span
                    style={{ width: (hasData ? section.value : 0) + "%" }}
                  />
                </div>
                <small>
                  {hasData ? `${section.value}%` : "—"}
                  <span> terisi</span>
                </small>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
