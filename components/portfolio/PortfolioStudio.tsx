"use client";
import Link from "next/link";
import { T, LocalizedAttributes } from "../i18n/LanguageProvider";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Crown,
  ExternalLink,
  Globe2,
  ImagePlus,
  Laptop,
  Loader2,
  Plus,
  Rocket,
  Save,
  Smartphone,
  Trash2,
  X,
} from "lucide-react";
import { PortfolioBuilder } from "../PortfolioBuilder";
import { useAccountId, useAccountPlus } from "../dashboard/AccountContext";
import { readAccountValue, writeAccountValue } from "../../lib/account-storage";
import {
  DEMO_WEB_PORTFOLIO,
  EMPTY_WEB_PORTFOLIO,
  PORTFOLIO_TEMPLATES,
  parseWebPortfolio,
  portfolioFingerprint,
  portfolioImageUrl,
  SOCIAL_NETWORKS,
  validPortfolioSlug,
  type SocialNetwork,
  type WebPortfolio,
  type WebProject,
  type WebSocial,
} from "../../lib/portfolio";
import {
  preparePortfolioImage,
  type PortfolioImageTreatment,
} from "../../lib/portfolio-image";
import "./portfolio-studio.css";
import "./new-template.css";

type Site = {
  slug: string;
  draft: WebPortfolio;
  published: WebPortfolio | null;
  published_at: string | null;
  updated_at: string;
};
type LocalDraft = { document: WebPortfolio; slug: string; updatedAt: string };
const LOCAL_KEY = "lamaranku_portfolio_website_draft";
const steps = ["Desain", "Pratinjau & edit", "Terbitkan"];

export function PortfolioStudio() {
  const [mode, setMode] = useState("website");
  return (
    <div className="portfolio-studio">
      <header className="ps-heading">
        <div>
          <span className="ps-kicker">
            <Globe2 size={14} /> <T text={"PORTFOLIO STUDIO"} />
          </span>
          <h1>
            <T text={"Karyamu layak punya rumah."} />
          </h1>
          <p>
            <T
              text={
                "Dari ide menjadi website personal. Pilih desain, ceritakan dirimu, dan bagikan ke dunia."
              }
            />
          </p>
        </div>
        <span className="ps-plus">
          <Crown size={13} /> <T text={"Website dengan Plus"} />
        </span>
      </header>
      <div className="ps-mode" role="tablist" aria-label="Jenis portofolio">
        <button
          id="ps-web-tab"
          role="tab"
          aria-controls="ps-web-panel"
          aria-selected={mode === "website"}
          onClick={() => setMode("website")}
        >
          <Globe2 size={15} /> <T text={"Website online"} />
        </button>
        <button
          id="ps-pdf-tab"
          role="tab"
          aria-controls="ps-pdf-panel"
          aria-selected={mode === "pdf"}
          onClick={() => setMode("pdf")}
        >
          <ArrowDownToLine size={15} /> <T text={"Portofolio PDF"} />
        </button>
      </div>
      <div
        id="ps-web-panel"
        role="tabpanel"
        aria-labelledby="ps-web-tab"
        hidden={mode !== "website"}
      >
        <WebsiteEditor />
      </div>
      {mode === "pdf" && (
        <div id="ps-pdf-panel" role="tabpanel" aria-labelledby="ps-pdf-tab">
          <PortfolioBuilder onOpenWebsite={() => setMode("website")} />
        </div>
      )}
    </div>
  );
}

function WebsiteEditor() {
  const userId = useAccountId();
  const plus = useAccountPlus();
  const [data, setData] = useState<WebPortfolio>(EMPTY_WEB_PORTFOLIO);
  const [slug, setSlug] = useState("");
  const [site, setSite] = useState<Site | null>(null);
  const [step, setStep] = useState(0);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [localSaved, setLocalSaved] = useState(false);
  const [showDemo, setShowDemo] = useState(true);
  const [confirmUnpublish, setConfirmUnpublish] = useState(false);
  const [previewSize, setPreviewSize] = useState({ width: 600, height: 650 });

  const stageRef = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const edit = (patch: Partial<WebPortfolio>) => {
    setData((previous) => ({ ...previous, ...patch }));
    setShowDemo(false);
    setLocalSaved(false);
    setNotice("");
  };
  const sendPreview = useCallback(
    () =>
      frame.current?.contentWindow?.postMessage(
        {
          type: "lamaranku:portfolio-preview",
          document: showDemo
            ? { ...DEMO_WEB_PORTFOLIO, template: data.template }
            : data,
          demo: showDemo,
        },
        window.location.origin,
      ),
    [data, showDemo],
  );

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      let local: LocalDraft | null = null;
      try {
        const stored = readAccountValue(LOCAL_KEY, userId) as LocalDraft | null;
        if (stored)
          local = {
            ...stored,
            document: parseWebPortfolio(stored.document, userId ?? undefined),
          };
      } catch {
        /* A malformed local draft must not block cloud recovery. */
      }
      if (local) {
        setData(local.document);
        setSlug(local.slug);
        setShowDemo(false);
      }
      try {
        const response = await fetch("/api/portfolio", { cache: "no-store" });
        const result = await response.json();
        if (cancelled) return;
        if (!response.ok)
          throw Error(result.error || "Website belum dapat dimuat.");
        const cloud = result.site as Site | null;
        setSite(cloud);
        if (
          cloud &&
          (!local ||
            Date.parse(cloud.updated_at) >= Date.parse(local.updatedAt))
        ) {
          setData(parseWebPortfolio(cloud.draft));
          setSlug(cloud.slug);
          setShowDemo(false);
        } else if (local && cloud)
          setNotice(
            "Draft terbaru dari perangkat ini dipulihkan. Simpan untuk memperbarui salinan online.",
          );
      } catch (e) {
        if (!cancelled && plus)
          setError(
            e instanceof Error
              ? e.message
              : "Koneksi tidak tersedia. Draft tetap bisa diedit di perangkat ini.",
          );
      } finally {
        if (!cancelled) setReady(true);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [userId, plus]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const resize = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0 && entry.contentRect.height > 0)
        setPreviewSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
    });
    resize.observe(stage);
    return () => resize.disconnect();
  }, []);
  useEffect(() => {
    if (!ready) return;
    const timer = window.setTimeout(() => {
      try {
        writeAccountValue(
          LOCAL_KEY,
          { document: data, slug, updatedAt: new Date().toISOString() },
          userId,
        );
        setLocalSaved(true);
      } catch {
        setError(
          "Draft perangkat belum tersimpan. Penyimpanan browser penuh atau diblokir.",
        );
      }
    }, 500);
    return () => window.clearTimeout(timer);
  }, [data, slug, ready, userId]);

  useEffect(() => {
    sendPreview();
  }, [sendPreview]);
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (
        event.origin === window.location.origin &&
        event.source === frame.current?.contentWindow &&
        event.data?.type === "lamaranku:portfolio-preview-ready"
      )
        sendPreview();
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [sendPreview]);

  const save = async (action: "save" | "publish" | "unpublish") => {
    if (busy || uploading) return;
    setError("");
    setNotice("");
    try {
      if (action !== "unpublish") {
        parseWebPortfolio(data, userId ?? undefined);
        if (!validPortfolioSlug(slug))
          throw Error(
            "Pilih alamat 3–40 karakter: huruf kecil, angka, atau tanda hubung.",
          );
        if (action === "publish" && (!data.name.trim() || !data.role.trim()))
          throw Error(
            "Isi nama dan peran di langkah Isi portofolio terlebih dahulu.",
          );
      }
      setBusy(true);
      const response = await fetch("/api/portfolio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, slug, document: data }),
      });
      const result = await response.json();
      if (!response.ok)
        throw Error(result.error || "Perubahan belum tersimpan.");
      setSite(result.site);
      setConfirmUnpublish(false);
      setNotice(
        action === "publish"
          ? "Website sudah online! Salin link dan bagikan portofoliomu."
          : action === "unpublish"
            ? "Website sudah dinonaktifkan. Draft tetap tersimpan."
            : "Draft tersimpan di akun. Terbitkan untuk memperbarui website publik.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Koneksi terputus. Coba lagi.");
    } finally {
      setBusy(false);
    }
  };
  const updateProject = (id: string, patch: Partial<WebProject>) =>
    edit({
      projects: data.projects.map((p) =>
        p.id === id ? { ...p, ...patch } : p,
      ),
    });
  const importDraft = () => {
    const old = readAccountValue("lamaranku_portfolio_draft", userId) as {
      data?: Record<string, unknown>;
    } | null;
    if (!old?.data || typeof old.data.nama !== "string") {
      setNotice(
        "Belum ada draft PDF di perangkat ini. Isi profil atau buat portofolio PDF terlebih dahulu.",
      );
      return;
    }
    const source = old.data;
    edit({
      name: String(source.nama || ""),
      role: String(source.peran || ""),
      bio: String(source.bio || ""),
      email: String(source.email || ""),
      website: String(source.tautan || ""),
      skills: String(source.keahlian || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 24),
      projects: Array.isArray(source.projects)
        ? source.projects
            .slice(0, 12)
            .filter((p) => p && typeof p === "object")
            .map((p) => ({
              id: crypto.randomUUID(),
              title: String(p.judul || ""),
              description: String(p.deskripsi || ""),
              url: String(p.tautan || ""),
              category: "",
              image: "",
            }))
        : [],
    });
    setNotice(
      "Isi draft PDF disalin. Periksa kembali profil dan tautan sebelum menerbitkan.",
    );
  };
  const publicPath = site?.published_at ? `/${site.slug}` : null;
  const draftFingerprint = portfolioFingerprint(data, userId ?? undefined);
  const liveHasChanges = Boolean(
    site?.published_at &&
      (!draftFingerprint ||
        site.slug !== slug ||
        portfolioFingerprint(site.published) !== draftFingerprint),
  );
  const previewWidth = mobile ? Math.min(375, previewSize.width) : 1080;
  const previewScale = mobile ? 1 : previewSize.width / previewWidth;

  return (
    <>
      <div className="ps-progress">
        <div>
          {steps.map((label, index) => (
            <button
              key={label}
              type="button"
              aria-current={step === index ? "step" : undefined}
              onClick={() => setStep(index)}
            >
              <span>{step > index ? <Check size={13} /> : index + 1}</span>
              <T text={label} />
              {index < 2 && <i />}
            </button>
          ))}
        </div>
        <span className="ps-autosave">
          {localSaved ? (
            <>
              <CheckCircle2 size={13} />{" "}
              <T text={"Draft di perangkat tersimpan"} />
            </>
          ) : (
            "Menyimpan draft…"
          )}
        </span>
      </div>
      {!plus && (
        <div className="ps-upgrade">
          <Crown size={20} />
          <div>
            <strong>
              <T text={"Jadikan portofoliomu sebuah website dengan Plus."} />
            </strong>
            <p>
              <T
                text={
                  "Eksplorasi semua desain dan siapkan isinya gratis. Upgrade untuk unggah gambar, simpan di akun, dan terbitkan link pribadimu."
                }
              />
            </p>
          </div>
          <Link href="/dashboard/paket">
            <T text={"Lihat Plus "} />
            <ArrowUpRightIcon />
          </Link>
        </div>
      )}
      <div className="ps-workspace">
        <section className="ps-editor" aria-label="Editor website portofolio">
          {!ready && (
            <p className="ps-loading" role="status">
              <Loader2 className="ps-spin" size={17} />{" "}
              <T text={"Memuat draft portofolio…"} />
            </p>
          )}
          <fieldset
            disabled={!ready || busy || uploading}
            className="ps-editor-fields"
          >
            {step === 0 && (
              <>
                <div className="ps-section-heading">
                  <span>
                    <T text={"01 / PILIH KANVASMU"} />
                  </span>
                  <h2>
                    <T text={"Satu cerita. Banyak cara menyampaikannya."} />
                  </h2>
                  <p>
                    <T
                      text={
                        "Desain bisa diganti kapan saja. Semua isimu tetap ikut."
                      }
                    />
                  </p>
                </div>
                <div className="ps-templates">
                  {PORTFOLIO_TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={`ps-template ps-template-${t.id}`}
                      aria-pressed={data.template === t.id}
                      onClick={() =>
                        setData((previous) => ({ ...previous, template: t.id }))
                      }
                    >
                      <div className="ps-template-visual" aria-hidden="true">
                        {t.id === "mono" ? (
                          <div className="ps-mono-mini">
                            <span className="ps-mono-mini-credit">
                              © Alex Design &amp; Strategy
                            </span>
                            <nav>
                              <span>About</span>
                              <span>Projects</span>
                              <span>Contact</span>
                            </nav>
                            <b>Alex Graham</b>
                            <span className="ps-mono-mini-portrait">
                              <i>A</i>
                            </span>
                            <small>
                              Web Designer
                              <br />
                              Art Director
                            </small>
                          </div>
                        ) : t.id === "minimalist" ? (
                          <div className="ps-new-template-mini">
                            <span className="ps-new-template-mini-portrait">A</span>
                            <div className="ps-new-template-mini-content">
                              <b>Building digital products, brands, and experience.</b>
                            </div>
                            <div className="ps-new-template-mini-logo-grid">
                              <i /><i /><i />
                            </div>
                          </div>
                        ) : t.id === "vivid" ? (
                          <div className="ps-vivid-mini">
                            <span className="ps-vivid-mini-brand">
                              <i />
                              <T text={"Alex"} />
                            </span>
                            <div className="ps-vivid-mini-copy">
                              <small>
                                <T text={"Hi everyone, I am Alex"} />
                              </small>
                              <b>
                                <T text={"Visual Designer"} />
                                <br />
                                <T text={"Based in Bali"} />
                              </b>
                              <i>
                                <T text={"Get In Touch"} />
                              </i>
                            </div>
                            <div className="ps-vivid-mini-visual">
                              <span className="ps-vivid-mini-frame" />
                              <span className="ps-vivid-mini-photo">A</span>
                              <span className="ps-vivid-mini-blob" />
                            </div>
                            <div className="ps-vivid-mini-bar">
                              <T text={"WEB DESIGN  ✦  BRAND IDENTITY  ✦"} />
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="ps-mini-nav">
                              <b>
                                <T text={"Alex®"} />
                              </b>
                              <span>
                                <T text={"Work   About ↗"} />
                              </span>
                            </div>
                            <div className="ps-mini-hero">
                              <div>
                                <small>
                                  <T text={"AVAILABLE FOR WORK"} />
                                </small>
                                <b>
                                  {t.id === "editorial" ? (
                                    <>
                                      <T text={"Less noise."} />
                                      <br />
                                      <T text={"More meaning."} />
                                    </>
                                  ) : t.id === "midnight" ? (
                                    <>
                                      <T text={"Designing"} />
                                      <br />
                                      <T text={"what's next."} />
                                    </>
                                  ) : (
                                    <>
                                      <T text={"Good ideas."} />
                                      <br />
                                      <T text={"Great impact."} />
                                    </>
                                  )}
                                </b>
                                <i>
                                  <T text={"Explore work ↗"} />
                                </i>
                              </div>
                              <span>A</span>
                            </div>
                            <div className="ps-mini-grid">
                              <i />
                              <i />
                            </div>
                          </>
                        )}
                      </div>
                      <div className="ps-template-info">
                        <div>
                          <strong>{t.name}</strong>
                          <small>
                            <T text={t.category} />
                          </small>
                        </div>
                        <span className="ps-template-check">
                          {data.template === t.id && <Check size={13} />}
                        </span>
                      </div>
                      <p>
                        <T text={t.description} />
                      </p>
                    </button>
                  ))}
                </div>
                <button
                  className="ps-primary ps-next"
                  type="button"
                  onClick={() => setStep(1)}
                >
                  <T text={"Gunakan "} />
                  {
                    PORTFOLIO_TEMPLATES.find((t) => t.id === data.template)
                      ?.name
                  }{" "}
                  <ArrowRight size={16} />
                </button>
              </>
            )}
            {step === 1 && (
              <>
                <div className="ps-section-heading">
                  <span>
                    <T text={"02 / CERITAKAN DIRIMU"} />
                  </span>
                  <h2>
                    <T text={"Edit langsung di pratinjau."} />
                  </h2>
                  <p>
                    <T
                      text={
                        "Klik ikon pensil pada bagian yang ingin kamu ubah."
                      }
                    />
                  </p>
                </div>
                <button
                  type="button"
                  className="ps-import"
                  onClick={importDraft}
                >
                  <T text={"Salin isi dari draft portofolio PDF "} />
                  <ArrowRight size={14} />
                </button>




                <div className="ps-step-actions">
                  <button
                    type="button"
                    className="ps-secondary"
                    onClick={() => setStep(0)}
                  >
                    <ArrowLeft size={15} /> <T text={"Desain"} />
                  </button>
                  <button
                    type="button"
                    className="ps-primary"
                    onClick={() => setStep(2)}
                  >
                    <T text={"Siapkan website "} />
                    <ArrowRight size={15} />
                  </button>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <div className="ps-section-heading">
                  <span>
                    <T text={"03 / SIAP DILIHAT DUNIA"} />
                  </span>
                  <h2>
                    <T text={"Alamat baru untuk kesempatan baru."} />
                  </h2>
                  <p>
                    <T
                      text={
                        "Satu link untuk semua karya, cerita, dan cara menghubungimu."
                      }
                    />
                  </p>
                </div>
                <div className="ps-publish-card">
                  <Globe2 size={26} />
                  <h3>
                    <T text={"Pilih alamat portofoliomu"} />
                  </h3>
                  <label className="ps-slug-label" htmlFor="portfolio-slug">
                    <T text={"Alamat website"} />
                  </label>
                  <div className="ps-slug">
                    <span>/p/</span>
                    <input
                      id="portfolio-slug"
                      value={slug}
                      maxLength={40}
                      placeholder="namamu"
                      onChange={(e) => {
                        setSlug(e.target.value.toLowerCase());
                        setLocalSaved(false);
                      }}
                    />
                    <Globe2 size={15} />
                  </div>
                  <p className="ps-hint">
                    <T
                      text={
                        "3–40 karakter. Gunakan huruf kecil, angka, dan tanda hubung. Satu website per akun."
                      }
                    />
                  </p>
                  {slug && !validPortfolioSlug(slug) && (
                    <p className="ps-inline-error">
                      <T
                        text={
                          "Alamat belum valid atau merupakan nama yang dicadangkan."
                        }
                      />
                    </p>
                  )}
                  {site?.published_at && slug !== site.slug && (
                    <p className="ps-hint">
                      <T
                        text={
                          "Mengganti alamat saat menerbitkan akan menonaktifkan link lama."
                        }
                      />
                    </p>
                  )}
                </div>
                <details className="ps-details" open>
                  <summary>
                    <T text={"Tampilan di mesin pencari "} />
                    <span>
                      <T text={"SEO"} />
                    </span>
                  </summary>
                  <div className="ps-form-content">
                    <Field
                      label="Judul halaman"
                      value={data.seoTitle}
                      onChange={(seoTitle) => edit({ seoTitle })}
                      max={70}
                      placeholder={`${data.name || "Namamu"} — ${data.role || "Portofolio"}`}
                    />
                    <Field
                      label="Deskripsi singkat"
                      value={data.seoDescription}
                      onChange={(seoDescription) => edit({ seoDescription })}
                      max={180}
                      area
                      placeholder="Ceritakan fokus keahlianmu dalam satu atau dua kalimat."
                    />
                    <p className="ps-hint">
                      <T
                        text={
                          "Jika kosong, nama, peran, dan bio digunakan otomatis. Foto profil menjadi gambar saat link dibagikan."
                        }
                      />
                    </p>
                  </div>
                </details>
                <div className="ps-publish-summary">
                  <span>
                    <CheckCircle2 size={15} />{" "}
                    {
                      PORTFOLIO_TEMPLATES.find((t) => t.id === data.template)
                        ?.name
                    }
                  </span>
                  <span>
                    <CheckCircle2 size={15} />{" "}
                    <T text={"Responsive desktop & mobile"} />
                  </span>
                  <span>
                    <CheckCircle2 size={15} /> {data.projects.length}{" "}
                    <T text={"karya pilihan"} />
                  </span>
                </div>
                {plus ? (
                  <>
                    <div className="ps-publish-buttons">
                      <button
                        type="button"
                        className="ps-secondary"
                        onClick={() => void save("save")}
                      >
                        <Save size={15} /> <T text={"Simpan draft di akun"} />
                      </button>
                      <button
                        type="button"
                        className="ps-primary"
                        onClick={() => void save("publish")}
                      >
                        <Rocket size={15} />{" "}
                        <T
                          text={
                            site?.published_at
                              ? "Terbitkan perubahan"
                              : "Terbitkan website"
                          }
                        />
                      </button>
                    </div>
                    <p className="ps-hint">
                      <T
                        text={
                          "Website aktif selama Plus aktif. Draft tidak mengubah website publik sampai diterbitkan. Gambar unggahan dapat diakses lewat URL publik."
                        }
                      />
                    </p>
                  </>
                ) : (
                  <Link className="ps-primary ps-next" href="/dashboard/paket">
                    <Crown size={15} />{" "}
                    <T text={"Aktifkan Plus untuk terbitkan"} />
                  </Link>
                )}
              </>
            )}
          </fieldset>
          {uploading && (
            <p className="ps-feedback" role="status">
              <Loader2 className="ps-spin" size={15} />{" "}
              <T text={"Menyiapkan dan mengunggah gambar…"} />
            </p>
          )}
          {busy && (
            <p className="ps-feedback" role="status">
              <Loader2 className="ps-spin" size={15} />{" "}
              <T text={"Menyimpan perubahan…"} />
            </p>
          )}
          {error && (
            <div className="ps-feedback ps-error" role="alert">
              <T text={error} />
              <button
                type="button"
                aria-label="Tutup pesan kesalahan"
                onClick={() => setError("")}
              >
                <X size={14} />
              </button>
            </div>
          )}
          {notice && (
            <p className="ps-feedback ps-success" role="status">
              <T text={notice} />
            </p>
          )}
          {publicPath && (
            <div className="ps-live" data-active={plus}>
              <span>
                <i /> <T text={plus ? "Website online " : "Website dijeda · Plus tidak aktif "} />
                {liveHasChanges && "· ada perubahan draft"}
              </span>
              <a href={publicPath} target="_blank" rel="noopener noreferrer">
                {publicPath}
                <ExternalLink size={14} />
              </a>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard
                      .writeText(`${window.location.origin}${publicPath}`)
                      .then(
                        () => setNotice("Link website disalin."),
                        () =>
                          setError(
                            "Link belum tersalin. Buka website lalu salin alamatnya.",
                          ),
                      );
                  }}
                >
                  <Copy size={13} /> <T text={"Salin link"} />
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setConfirmUnpublish(true)}
                >
                  <T text={"Nonaktifkan"} />
                </button>
              </div>
              {confirmUnpublish && (
                <div className="ps-unpublish">
                  <p>
                    <T
                      text={
                        "Nonaktifkan link publik? Isi dan draft tetap tersimpan."
                      }
                    />
                  </p>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void save("unpublish")}
                  >
                    <T text={"Ya, nonaktifkan"} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmUnpublish(false)}
                  >
                    <T text={"Batal"} />
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
        <aside className="ps-preview" aria-label="Pratinjau website">
          <header>
            <div>
              <span className="ps-preview-dot" /> <T text={"LIVE PREVIEW"} />
            </div>
            <div className="ps-devices">
              <button
                type="button"
                aria-label="Pratinjau desktop"
                aria-pressed={!mobile}
                onClick={() => setMobile(false)}
              >
                <Laptop size={16} />
              </button>
              <button
                type="button"
                aria-label="Pratinjau mobile"
                aria-pressed={mobile}
                onClick={() => setMobile(true)}
              >
                <Smartphone size={16} />
              </button>
            </div>
          </header>
          <div className="ps-preview-address">
            <span>● ● ●</span>
            <span>
              <T text={"lamaranku / "} />
              {slug || "namamu"}
            </span>
            <Globe2 size={11} />
          </div>
          <div
            ref={stageRef}
            className={`ps-preview-stage${mobile ? " is-mobile" : ""}`}
          >
            <iframe
              ref={frame}
              src="/portfolio/preview"
              title="Pratinjau website portofolio"
              style={{
                width: previewWidth,
                height: previewSize.height / previewScale,
                transform: `scale(${previewScale})`,
              }}
              onLoad={sendPreview}
            />
          </div>
          <footer>
            <span>
              <T
                text={
                  showDemo
                    ? "Contoh isi • ganti dengan ceritamu sendiri"
                    : "Pratinjau draft • belum tentu sudah online"
                }
              />
            </span>
            <button type="button" onClick={() => setShowDemo(!showDemo)}>
              <T text={showDemo ? "Lihat isiku" : "Lihat contoh"} />
            </button>
          </footer>
        </aside>
      </div>
    </>
  );
}

function ArrowUpRightIcon() {
  return <ExternalLink size={14} />;
}
function Field({
  label,
  value,
  onChange,
  max,
  placeholder,
  area = false,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  max: number;
  placeholder?: string;
  area?: boolean;
  type?: string;
}) {
  const props = {
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(e.target.value),
    maxLength: max,
    placeholder,
  };
  return (
    <label className="ps-field">
      <span>
        <T text={label} />
      </span>
      {area ? (
        <LocalizedAttributes>
          <textarea {...props} rows={3} />
        </LocalizedAttributes>
      ) : (
        <LocalizedAttributes>
          <input {...props} type={type} />
        </LocalizedAttributes>
      )}
    </label>
  );
}
function SkillsField({
  value,
  onChange,
}: {
  value: string[];
  onChange: (skills: string[]) => void;
}) {
  const [text, setText] = useState(value.join(", "));
  useEffect(() => {
    setText(value.join(", "));
  }, [value]);
  return (
    <label className="ps-field">
      <span>
        <T text={"Keahlian"} />
      </span>
      <input
        value={text}
        maxLength={1400}
        onChange={(e) => setText(e.target.value)}
        onBlur={() =>
          onChange(
            [
              ...new Set(
                text
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              ),
            ]
              .slice(0, 24)
              .map((s) => s.slice(0, 60)),
          )
        }
        placeholder="Figma, React, Branding"
      />
      <small>
        <T
          text={
            "Pisahkan dengan koma, maksimal 24 keahlian. Klik di luar kolom untuk menerapkan."
          }
        />
      </small>
    </label>
  );
}
function SocialsField({
  value,
  onChange,
}: {
  value: WebSocial[];
  onChange: (socials: WebSocial[]) => void;
}) {
  const taken = new Set(value.map((social) => social.network));
  const available = SOCIAL_NETWORKS.find((entry) => !taken.has(entry.id));
  const update = (id: string, patch: Partial<WebSocial>) =>
    onChange(
      value.map((social) =>
        social.id === id ? { ...social, ...patch } : social,
      ),
    );
  return (
    <div className="ps-socials">
      <span className="ps-socials-label">
        <T text={"Sosial media"} />
      </span>
      {value.map((social, index) => {
        const entry = SOCIAL_NETWORKS.find(
          (item) => item.id === social.network,
        );
        if (!entry) return null;
        return (
          <div className="ps-social-row" key={social.id}>
            <select
              aria-label={`Platform sosial media ${index + 1}`}
              value={social.network}
              onChange={(event) =>
                update(social.id, {
                  network: event.target.value as SocialNetwork,
                })
              }
            >
              {SOCIAL_NETWORKS.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                  disabled={item.id !== social.network && taken.has(item.id)}
                >
                  {item.label}
                </option>
              ))}
            </select>
            <LocalizedAttributes>
              <input
                aria-label={`Tautan ${entry.label}`}
                value={social.url}
                maxLength={300}
                placeholder={`${entry.prefix.replace("https://", "")}namamu`}
                onChange={(event) =>
                  update(social.id, { url: event.target.value })
                }
              />
            </LocalizedAttributes>
            <button
              type="button"
              className="ps-icon-button"
              aria-label={`Hapus ${entry.label}`}
              onClick={() =>
                onChange(value.filter((item) => item.id !== social.id))
              }
            >
              <Trash2 size={14} />
            </button>
          </div>
        );
      })}
      <button
        type="button"
        className="ps-add"
        disabled={!available}
        onClick={() =>
          available &&
          onChange([
            ...value,
            { id: crypto.randomUUID(), network: available.id, url: "" },
          ])
        }
      >
        <Plus size={14} /> <T text={"Tambah sosial media"} />
      </button>
      <p className="ps-hint">
        <T
          text={"Tulis username (misalnya @namamu) atau tempel tautan lengkapnya."}
        />
      </p>
    </div>
  );
}

function ImageField({
  label,
  value,
  plus,
  treatment = "default",
  onChange,
  onBusy,
  onError,
}: {
  label: string;
  value: string;
  plus: boolean;
  treatment?: PortfolioImageTreatment;
  onChange: (path: string) => void;
  onBusy: (busy: boolean) => void;
  onError: (error: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState("");
  const copy =
    treatment === "mono"
      ? "Gambar diproses otomatis ke hitam-putih dan WebP."
      : "Dikonversi otomatis ke WebP agar ringan.";
  const upload = async (file: File | undefined) => {
    if (!file) return;
    onError("");
    onBusy(true);
    setStage(
      treatment === "portrait" ? "Menyiapkan potret…" : "Menyiapkan gambar…",
    );
    try {
      const blob = await preparePortfolioImage(file, treatment, setStage);
      setStage("Mengunggah hasil WebP…");
      const form = new FormData();
      form.append("image", blob, "portfolio.webp");
      const response = await fetch("/api/portfolio/images", {
        method: "POST",
        body: form,
      });
      const result = await response.json();
      if (!response.ok) throw Error(result.error || "Unggahan gagal.");
      onChange(result.path);
    } catch (e) {
      onError(e instanceof Error ? e.message : "Gambar belum dapat diunggah.");
    } finally {
      setStage("");
      onBusy(false);
      if (input.current) input.current.value = "";
    }
  };
  return (
    <div className="ps-image-field">
      <span>{label}</span>
      <div className={value ? "ps-upload has-image" : "ps-upload"}>
        {value && (
          <LocalizedAttributes>
            <img
              src={portfolioImageUrl(value)}
              alt={label}
              width={160}
              height={120}
            />
          </LocalizedAttributes>
        )}
        <div>
          <ImagePlus size={19} />
          <strong>
            <T text={value ? "Ganti gambar" : "Beri sentuhan visual"} />
          </strong>
          <small aria-live="polite">
            {stage ? (
              <span className="ps-upload-stage" role="status">
                {stage}
              </span>
            ) : (
              <>
                <T text={"Semua format gambar · maks. 10 MB"} />
                <br />
                <T text={copy} />
              </>
            )}
          </small>
          <button
            type="button"
            disabled={!plus}
            onClick={() => input.current?.click()}
          >
            <T text={plus ? "Pilih gambar" : "Unggah dengan Plus"} />
          </button>
          {value && (
            <button
              type="button"
              className="ps-image-remove"
              onClick={() => onChange("")}
            >
              <T text={"Hapus dari portofolio"} />
            </button>
          )}
        </div>
        <input
          ref={input}
          type="file"
          accept="image/*"
          aria-label={label}
          hidden
          disabled={!plus}
          onChange={(e) => void upload(e.target.files?.[0])}
        />
      </div>
    </div>
  );
}
