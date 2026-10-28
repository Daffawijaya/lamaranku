"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowUpRight,
  ChevronDown,
  FileText,
  MoreVertical,
  Plus,
} from "lucide-react";
import { templateById } from "../../data/templates";
import { cvCompletion, cvSections, savedCvDate } from "../../lib/dashboard";
import { useDashboardData } from "./DashboardData";

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
            Kelola berkas
            <br />
            lamaranmu<span>.</span>
          </h2>
          <p>Susun CV dan simpan dokumen untuk peluang karier berikutnya.</p>
        </section>
        <div className="drive-shortcuts" aria-label="Akses cepat dokumen">
          <Link
            href="/dashboard/cv-builder"
            className="drive-add-card"
            aria-label="Buat CV baru"
          >
            <Plus size={22} aria-hidden="true" />
          </Link>
          <Link
            href="/dashboard/cv-builder?template=harvard"
            className="drive-folder drive-folder-primary"
          >
            <span className="drive-folder-number">
              01
              <MoreVertical size={16} />
            </span>
            <FolderGlyph />
            <strong>CV ATS</strong>
            <small>{atsCount} dokumen</small>
          </Link>
          <Link
            href="/dashboard/cv-builder?template=minimalist"
            className="drive-folder drive-folder-secondary"
          >
            <span className="drive-folder-number">
              02
              <MoreVertical size={16} />
            </span>
            <FolderGlyph folded />
            <strong>CV Kreatif</strong>
            <small>{creativeCount} dokumen</small>
          </Link>
          <Link href="/dashboard/portfolio" className="drive-gallery">
            <GalleryArt />
            <strong>
              Portofolio
              <br />
              karyamu
            </strong>
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </div>
      <div className="drive-home-bottom">
        <section
          className="drive-card drive-storage"
          aria-labelledby="drive-storage-title"
        >
          <header>
            <h2 id="drive-storage-title">Kelengkapan</h2>
            <Link
              href="/dashboard/cv-builder"
              title="Kelola CV"
              aria-label="Kelola CV"
            >
              <MoreVertical size={18} />
            </Link>
          </header>
          <div
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
          </div>
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
                  <strong>{label}</strong>
                  <small>
                    {count ? `${Math.round(segments[index])}%` : "—"}
                  </small>
                </span>
              </div>
            ))}
          </div>
          <p className="sr-only">
            {count
              ? "Kelengkapan kolom CV, bukan skor ATS."
              : "Simpan CV untuk melihat kelengkapannya."}
          </p>
        </section>
        <section
          className="drive-card drive-files"
          aria-labelledby="drive-files-title"
        >
          <header>
            <h2 id="drive-files-title">Dokumen terakhir</h2>
            <label className="drive-file-sort">
              <span className="sr-only">Urutkan dokumen</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="recent">Terbaru</option>
                <option value="name">Nama A–Z</option>
              </select>
              <ChevronDown size={13} />
            </label>
          </header>
          {saved === null ? (
            <p className="drive-files-empty" role="status">
              Memuat dokumenmu…
            </p>
          ) : documents.length ? (
            <div className="drive-file-list">
              {documents.slice(0, 4).map((cv, index) => (
                <Link
                  href={editHref(cv.id)}
                  key={cv.id}
                  className="drive-file-row dash-data-row"
                >
                  <span className={`drive-file-icon file-color-${index}`}>
                    <FileText size={17} />
                  </span>
                  <span className="drive-file-name">
                    <strong>{cv.judul}</strong>
                    <small>{templateById(cv.data.templateId).name}</small>
                  </span>
                  <span
                    className="drive-file-owner"
                    aria-label={`Kelengkapan ${cvCompletion(cv.data)} persen`}
                  >
                    <i aria-hidden="true">
                      {cv.data.nama.trim()[0]?.toUpperCase() || "C"}
                    </i>
                    <small>{cvCompletion(cv.data)}%</small>
                  </span>
                  <time>{cv.updatedAt}</time>
                </Link>
              ))}
            </div>
          ) : (
            <div className="drive-files-empty">
              <span>
                <FileText size={27} strokeWidth={1.4} />
              </span>
              <strong>
                {query.trim()
                  ? "Dokumen tidak ditemukan"
                  : "Belum ada dokumen tersimpan"}
              </strong>
              <p>
                {query.trim()
                  ? "Coba cari nama CV atau template yang lain."
                  : "CV yang kamu simpan akan muncul di sini, siap dilanjutkan kapan saja."}
              </p>
              {!query.trim() && (
                <Link href="/dashboard/cv-builder">
                  Buat CV pertamamu <Plus size={14} />
                </Link>
              )}
            </div>
          )}
          {documents.length > 4 && (
            <Link
              href="/dashboard/cv-builder#cv-library-title"
              className="drive-view-all"
            >
              Lihat semua {documents.length} CV <ArrowUpRight size={13} />
            </Link>
          )}
        </section>
      </div>
      <p className="drive-home-note">
        Dokumen tersimpan di browser ini. Gunakan perangkat yang sama untuk
        melanjutkan.
      </p>
    </div>
  );
}

function FolderGlyph({ folded = false }: { folded?: boolean }) {
  return (
    <svg
      className="drive-folder-glyph"
      viewBox="0 0 44 44"
      fill="none"
      aria-hidden="true"
    >
      {folded ? (
        <>
          <path d="M10 3 31 13 19 20 4 12Z" fill="currentColor" />
          <path d="M31 13 39 20 23 30 10 23Z" fill="currentColor" />
          <path d="M10 23 31 34 20 41 4 32Z" fill="currentColor" />
          <path d="m31 13 8 7v13l-8-5Z" fill="currentColor" opacity=".65" />
        </>
      ) : (
        <>
          <path d="M4 13 16 6v15L4 28Z" fill="currentColor" />
          <path d="M16 6 28 0v15l-12 7Z" fill="currentColor" opacity=".8" />
          <path d="m28 14 12 7-12 7-12-7Z" fill="currentColor" />
          <path d="M40 21v14l-12 7V28Z" fill="currentColor" opacity=".85" />
          <path d="m4 28 12-7v14l12 7-12-1Z" fill="currentColor" />
        </>
      )}
    </svg>
  );
}

function GalleryArt() {
  return (
    <svg
      className="drive-gallery-art"
      viewBox="0 0 170 240"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <path fill="#ffffff" d="M0 0h170v240H0z" />
      <path fill="#ecd4ac" d="M0 0h60L20 80 0 37Z" />
      <path fill="#18181b" d="M20 0h60L52 126 12 40Z" />
      <path fill="var(--appearance-accent, #3b63fb)" d="M80 0h59l31 88-119 39Z" />
      <path fill="#e78d7a" d="m170 119-28 30 28 9Z" />
      <path fill="#a497d5" d="M170 151h-36q-2 28 36 35Z" />
      <path fill="#8bb6a2" d="m170 186-15 19 15 24Z" />
    </svg>
  );
}
