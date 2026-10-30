"use client";

import { T, LocalizedAttributes } from "../i18n/LanguageProvider";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowUpRight,
  ChevronDown,
  FileText,
  FolderOpen,
  Images,
  MoreVertical,
  Plus,
} from "lucide-react";
import { templateById } from "../../data/templates";
import { cvCompletion, cvSections, savedCvDate } from "../../lib/dashboard";
import { useDashboardData } from "./DashboardData";
import { DashboardTable } from "./DashboardTable";

const COLORS = ["var(--appearance-accent, #3b63fb)", "#e8b461", "#a497d5", "#e4e4e7"];
const editHref = (id: string) =>
  "/dashboard/cv-builder?cv=" + encodeURIComponent(id);

export function DashboardHome() {
  const { saved, query } = useDashboardData();
  const allDocuments = saved ?? [];
  const [sort, setSort] = useState("recent");
  const documents = allDocuments
    .filter((cv) =>
      `${cv.judul} ${cv.data.nama} ${templateById(cv.data.templateId).name}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    )
    .sort((a, b) =>
      sort === "name"
        ? a.judul.localeCompare(b.judul, "id")
        : (savedCvDate(b.updatedAt)?.getTime() ?? 0) -
          (savedCvDate(a.updatedAt)?.getTime() ?? 0),
    );
  const count = allDocuments.length;
  const sectionValues = [0, 1, 2, 3, 4].map((index) =>
    count
      ? allDocuments.reduce(
          (sum, cv) => sum + cvSections(cv.data)[index].value,
          0,
        ) / count
      : 0,
  );
  const coverage = [
    (sectionValues[0] + sectionValues[1] + sectionValues[4]) / 5,
    sectionValues[2] / 5,
    sectionValues[3] / 5,
  ];
  const completion = Math.round(
    coverage.reduce((sum, value) => sum + value, 0),
  );
  const segments = [
    ...coverage,
    Math.max(0, 100 - coverage.reduce((sum, value) => sum + value, 0)),
  ];
  let start = 0;
  const gradient = segments
    .map((value, index) => {
      const end = start + value;
      const segment = `${COLORS[index]} ${start}% ${end}%`;
      start = end;
      return segment;
    })
    .join(",");
  const atsCount = allDocuments.filter(
    (cv) => templateById(cv.data.templateId).kind === "ats",
  ).length;
  const creativeCount = count - atsCount;

  return (
    <div className="drive-home">
      <div className="drive-home-top">
        <section className="drive-intro">
          <h2>
            <T text={"Kelola berkas "} /><br />
            <T text={"lamaranmu"} /><span>.</span>
          </h2>
          <p><T text={"Susun CV dan simpan dokumen untuk peluang karier berikutnya."} /></p>
        </section>
        <LocalizedAttributes><div className="drive-shortcuts" aria-label="Akses cepat dokumen">
          <LocalizedAttributes><Link
            href="/dashboard/cv-builder"
            className="drive-add-card"
            aria-label="Buat CV baru"
          >
            <Plus size={22} aria-hidden="true" />
          </Link></LocalizedAttributes>
          <Link
            href="/dashboard/cv-builder?template=harvard"
            className="drive-folder drive-folder-primary"
          >
            <span className="drive-folder-number">
              01
              <MoreVertical size={16} />
            </span>
            <FolderOpen className="drive-folder-glyph" aria-hidden="true" />
            <strong><T text={"CV ATS"} /></strong>
            <small>{atsCount} <T text={"dokumen"} /></small>
          </Link>
          <Link
            href="/dashboard/cv-builder?template=minimalist"
            className="drive-folder drive-folder-secondary"
          >
            <span className="drive-folder-number">
              02
              <MoreVertical size={16} />
            </span>
            <FolderOpen className="drive-folder-glyph" aria-hidden="true" />
            <strong><T text={"CV Kreatif"} /></strong>
            <small>{creativeCount} <T text={"dokumen"} /></small>
          </Link>
          <Link href="/dashboard/portfolio" className="drive-gallery">
            <Images className="drive-folder-glyph" aria-hidden="true" />
            <strong>
              <T text={"Portofolio "} /><br />
              <T text={"karyamu "} /></strong>
            <ArrowUpRight size={18} />
          </Link>
        </div></LocalizedAttributes>
      </div>
      <div className="drive-home-bottom">
        <section
          className="drive-card drive-storage"
          aria-labelledby="drive-storage-title"
        >
          <header>
            <h2 id="drive-storage-title"><T text={"Kelengkapan"} /></h2>
            <LocalizedAttributes><Link
              href="/dashboard/cv-builder"
              title="Kelola CV"
              aria-label="Kelola CV"
            >
              <MoreVertical size={18} />
            </Link></LocalizedAttributes>
          </header>
          <LocalizedAttributes><div
            className={"drive-donut" + (!count ? " is-empty" : "")}
            style={
              count
                ? { background: `conic-gradient(from -28deg, ${gradient})` }
                : undefined
            }
            role="img"
            aria-label={
              count
                ? `Rata-rata kelengkapan CV ${completion} persen`
                : "Belum ada CV untuk menghitung kelengkapan"
            }
          >
            <div>
              <strong>
                {count ? completion : "—"}
                <span>{count ? "%" : ""}</span>
              </strong>
            </div>
          </div></LocalizedAttributes>
          <div className="drive-storage-legend">
            {[
              "Profil & keahlian",
              "Pengalaman",
              "Pendidikan",
              "Belum terisi",
            ].map((label, index) => (
              <div key={label}>
                <i style={{ background: COLORS[index] }} />
                <span>
                  <strong><T text={label} /></strong>
                  <small>
                    {count ? `${Math.round(segments[index])}%` : "—"}
                  </small>
                </span>
              </div>
            ))}
          </div>
          <p className="sr-only">
            <T text={count
              ? "Kelengkapan kolom CV, bukan skor ATS."
              : "Simpan CV untuk melihat kelengkapannya."} />
          </p>
        </section>
        <section
          className="drive-card drive-files"
          aria-labelledby="drive-files-title"
        >
          <header>
            <h2 id="drive-files-title"><T text={"Dokumen terakhir"} /></h2>
            <label className="drive-file-sort">
              <span className="sr-only"><T text={"Urutkan dokumen"} /></span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="recent"><T text={"Terbaru"} /></option>
                <option value="name"><T text={"Nama A–Z"} /></option>
              </select>
              <ChevronDown size={13} />
            </label>
          </header>
          {saved === null ? (
            <p className="drive-files-empty" role="status">
              <T text={"Memuat dokumenmu… "} /></p>
          ) : documents.length ? (
            <DashboardTable caption={<T text="Dokumen terakhir" />} header={<tr>
                  <th scope="col"><T text="Dokumen" /></th>
                  <th scope="col" className="dash-ui-table-template"><T text="Template" /></th>
                  <th scope="col"><T text="Kelengkapan" /></th>
                  <th scope="col" className="dash-ui-table-action"><T text="Aksi" /></th>
                </tr>}>
                {documents.slice(0, 4).map(cv => (
                  <tr key={cv.id}>
                    <td><Link href={editHref(cv.id)} className="dash-ui-document"><FileText size={17} aria-hidden="true" /><span>{cv.judul}<time className="dash-ui-document-date">{cv.updatedAt}</time></span></Link></td>
                    <td className="dash-ui-table-template">{templateById(cv.data.templateId).name}</td>
                    <td className="dash-ui-table-number"><LocalizedAttributes><span className="dash-ui-badge" aria-label={`Kelengkapan ${cvCompletion(cv.data)} persen`}>{cvCompletion(cv.data)}%</span></LocalizedAttributes></td>
                    <td className="dash-ui-table-action"><Link href={editHref(cv.id)} className="dash-ui-button"><T text="Buka" /></Link></td>
                  </tr>
                ))}
            </DashboardTable>
          ) : (
            <div className="drive-files-empty">
              <span>
                <FileText size={27} strokeWidth={1.4} />
              </span>
              <strong>
                <T text={query.trim()
                  ? "Dokumen tidak ditemukan"
                  : "Belum ada dokumen tersimpan"} />
              </strong>
              <p>
                <T text={query.trim()
                  ? "Coba cari nama CV atau template yang lain."
                  : "CV yang kamu simpan akan muncul di sini, siap dilanjutkan kapan saja."} />
              </p>
              {!query.trim() && (
                <Link href="/dashboard/cv-builder">
                  <T text={"Buat CV pertamamu "} /><Plus size={14} />
                </Link>
              )}
            </div>
          )}
          {documents.length > 4 && (
            <Link
              href="/dashboard/cv-builder#cv-library-title"
              className="drive-view-all"
            >
              <T text={"Lihat semua "} />{documents.length} <T text={"CV "} /><ArrowUpRight size={13} />
            </Link>
          )}
        </section>
      </div>
      <p className="drive-home-note">
        <T text={"Dokumen tersimpan di browser ini. Gunakan perangkat yang sama untuk melanjutkan. "} /></p>
    </div>
  );
}
