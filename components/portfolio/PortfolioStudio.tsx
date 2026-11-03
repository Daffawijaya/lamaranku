"use client";
import Link from "next/link";
import { T, LocalizedAttributes } from "../i18n/LanguageProvider";
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
import { useState, useEffect } from "react";
import { useAccountId, useAccountPlus } from "../dashboard/AccountContext";
import { readAccountValue, writeAccountValue } from "../../lib/account-storage";
import {
  DEMO_WEB_PORTFOLIOS,
  EMPTY_WEB_PORTFOLIO,
  PORTFOLIO_TEMPLATES,
  parseWebPortfolio,
  portfolioFingerprint,
  portfolioImageUrl,
  validPortfolioSlug,
  type PortfolioTemplate,
  type WebPortfolio,
} from "../../lib/portfolio";
import "./portfolio-studio.css";
import { PortfolioWebsite } from "./PortfolioWebsite";

type StepKey = "profile" | "projects" | "publish";

export function PortfolioStudio() {
  const accountId = useAccountId();
  const hasPlus = useAccountPlus();
  const [currentStep, setCurrentStep] = useState<StepKey>("profile");
  const [formData, setFormData] = useState<WebPortfolio>({ ...EMPTY_WEB_PORTFOLIO });
  const [isSaving, setIsSaving] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [slug, setSlug] = useState("");
  const [slugError, setSlugError] = useState("");

  useEffect(() => {
    if (!accountId) return;
    (async () => {
      const stored = await readAccountValue(accountId, "portfolio-preview");
      if (stored) {
        try {
          const parsed = parseWebPortfolio(stored as unknown as Record<string, unknown>);
          if (parsed && parsed.template) setFormData(parsed);
        } catch {}
      }
    })();
  }, [accountId]);

  function updateField<K extends keyof WebPortfolio>(key: K, value: WebPortfolio[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!accountId) return;
    setIsSaving(true);
    try {
      await writeAccountValue("portfolio-preview", formData, accountId);
    } finally {
      setIsSaving(false);
    }
  }

  function handlePublish() {
    setIsPublished(true);
  }

  function handleReset() {
    setFormData({ ...EMPTY_WEB_PORTFOLIO });
    setSlug("");
    setIsPublished(false);
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold"><T text={"Portfolio Studio"} /></h1>
          <p className="text-sm text-muted-foreground"><T text={"Buat dan terbitkan website portofolio profesional dalam hitungan menit."} /></p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving || !accountId}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
            <T text={"Simpan draft"} />
          </button>
          <button
            onClick={handlePublish}
            disabled={!accountId}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#3b63fb] px-5 py-3 text-sm font-semibold text-white hover:bg-[#274dea] disabled:opacity-50"
          >
            <Rocket className="mr-2 size-4" />
            <T text={"Terbitkan"} />
          </button>
        </div>
      </header>

      <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-[1fr_420px]">
        <div className="flex flex-col gap-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6">
          <nav className="flex gap-2" aria-label="Steps">
            {(["profile", "projects", "publish"] as StepKey[]).map((step) => (
              <button
                key={step}
                onClick={() => setCurrentStep(step)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  currentStep === step
                    ? "bg-[#3b63fb] text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                <T text={
                  step === "profile" ? "Profil" :
                  step === "projects" ? "Proyek" :
                  "Terbitkan"
                } />
              </button>
            ))}
          </nav>

          {currentStep === "profile" && (
            <PortfolioBuilder data={formData} onChange={updateField} demoMode />
          )}

          {currentStep === "projects" && (
            <ProjectsBuilder data={formData} onChange={updateField} />
          )}

          {currentStep === "publish" && (
            <PublishStep
              slug={slug}
              slugError={slugError}
              onSlugChange={setSlug}
              onSlugError={setSlugError}
              onPublish={handlePublish}
              isPublished={isPublished}
              hasPlus={hasPlus}
            />
          )}
        </div>

        <aside className="flex flex-col gap-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold"><T text={"Live Preview"} /></h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFormData({ ...formData, template: "modular" as PortfolioTemplate })}
                  className={`rounded-lg px-2 py-1 text-xs font-medium ${
                    formData.template === "modular"
                      ? "bg-[#3b63fb] text-white"
                      : "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  Modular
                </button>
                <button
                  onClick={() => setFormData({ ...formData, template: "mono" as PortfolioTemplate })}
                  className={`rounded-lg px-2 py-1 text-xs font-medium ${
                    formData.template === "mono"
                      ? "bg-[#3b63fb] text-white"
                      : "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  Mono
                </button>
                <button
                  onClick={() => setFormData({ ...formData, template: "vivid" as PortfolioTemplate })}
                  className={`rounded-lg px-2 py-1 text-xs font-medium ${
                    formData.template === "vivid"
                      ? "bg-[#3b63fb] text-white"
                      : "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  Vivid
                </button>
                <button
                  onClick={() => setFormData({ ...formData, template: "minimalist" as PortfolioTemplate })}
                  className={`rounded-lg px-2 py-1 text-xs font-medium ${
                    formData.template === "minimalist"
                      ? "bg-[#3b63fb] text-white"
                      : "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  Minimal
                </button>
                <button
                  onClick={() => setFormData({ ...formData, template: "poster" as PortfolioTemplate })}
                  className={`rounded-lg px-2 py-1 text-xs font-medium ${
                    formData.template === "poster"
                      ? "bg-[#3b63fb] text-white"
                      : "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  Poster
                </button>
                <button
                  onClick={() => setFormData({ ...formData, template: "abrantes" as PortfolioTemplate })}
                  className={`rounded-lg px-2 py-1 text-xs font-medium ${
                    formData.template === "abrantes"
                      ? "bg-[#3b63fb] text-white"
                      : "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  Abrantes
                </button>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
              <div className="aspect-[4/3] overflow-auto p-4">
                <PortfolioWebsite data={formData} demo />
              </div>
            </div>
          </div>

          {!hasPlus && (
            <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-[#3b63fb]/5 to-transparent p-5">
              <div className="flex items-start gap-3">
                <Crown className="mt-0.5 size-5 text-[#3b63fb] shrink-0" />
                <div>
                  <h3 className="font-semibold"><T text={"Upgrade ke Plus"} /></h3>
                  <p className="mt-1 text-sm text-muted-foreground"><T text={"Terbitkan website portofolio profesional dengan domain custom dan preview real-time."} /></p>
                  <Link
                    href="/dashboard/paket"
                    className="mt-4 inline-flex min-h-10 items-center justify-center rounded-full bg-[#3b63fb] px-5 py-2 text-sm font-semibold text-white hover:bg-[#274dea]"
                  >
                    <T text={"Lihat paket"} />
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h3 className="font-semibold"><T text={"Tips Portofolio"} /></h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-4 text-green-500 shrink-0" />
                <span><T text={"Gunakan foto profil yang profesional."} /></span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-4 text-green-500 shrink-0" />
                <span><T text={"Tampilkan 3-5 proyek terbaik Anda."} /></span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-4 text-green-500 shrink-0" />
                <span><T text={"Sertakan deskripsi yang jelas untuk setiap karya."} /></span>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function PublishStep({
  slug,
  slugError,
  onSlugChange,
  onSlugError,
  onPublish,
  isPublished,
  hasPlus,
}: {
  slug: string;
  slugError: string;
  onSlugChange: (value: string) => void;
  onSlugError: (error: string) => void;
  onPublish: () => void;
  isPublished: boolean;
  hasPlus: boolean;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold"><T text={"Terbitkan Website"} /></h2>
        <p className="mt-1 text-sm text-muted-foreground"><T text={"Pilih slug untuk URL portofolio Anda."} /></p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            <T text={"URL Portofolio"} />
          </label>
          <div className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2">
            <Globe2 className="size-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">lamaranku.com/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                onSlugChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
                onSlugError("");
              }}
              placeholder="nama-anda"
              className="flex-1 border-0 bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground"
              maxLength={40}
            />
          </div>
          {slugError && <p className="mt-1 text-sm text-red-500">{slugError}</p>}
          {!hasPlus && (
            <p className="mt-2 text-xs text-muted-foreground"><T text={"Website portofolio memerlukan paket Plus."} /></p>
          )}
        </div>

        <button
          onClick={onPublish}
          disabled={!slug || !!slugError || !hasPlus}
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#3b63fb] px-6 py-3 text-sm font-semibold text-white hover:bg-[#274dea] disabled:opacity-50"
        >
          <Rocket className="mr-2 size-4" />
          <T text={"Terbitkan Sekarang"} />
        </button>
      </div>

      {isPublished && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 size-5 text-green-600 shrink-0" />
            <div>
              <h3 className="font-semibold text-green-900"><T text={"Website Berhasil Diterbitkan!"} /></h3>
              <p className="mt-1 text-sm text-green-700">
                <T text={"Portofolio Anda sekarang bisa diakses di:"} />
                <br />
                <a
                  href={`https://lamaranku.com/${slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium underline mt-1"
                >
                  https://lamaranku.com/{slug}
                  <ExternalLink className="size-3" />
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectsBuilder({
  data,
  onChange,
}: {
  data: WebPortfolio;
  onChange: <K extends keyof WebPortfolio>(key: K, value: WebPortfolio[K]) => void;
}) {
  const [projects, setProjects] = useState<Array<{ title: string; category: string; description: string; image: string; url: string }>>(
    data.projects || []
  );

  function addProject() {
    const updated = [...projects, { title: "", category: "", description: "", image: "", url: "" }];
    setProjects(updated);
    onChange("projects", updated.map((p, i) => ({ ...EMPTY_WEB_PORTFOLIO.projects![0], id: `project-${i}`, ...p })));
  }

  function updateProject(index: number, field: string, value: string) {
    const updated = projects.map((p, i) => i === index ? { ...p, [field]: value } : p);
    setProjects(updated);
    onChange("projects", updated.map((p, i) => ({ ...EMPTY_WEB_PORTFOLIO.projects![0], id: `project-${i}`, ...p })));
  }

  function removeProject(index: number) {
    const updated = projects.filter((_, i) => i !== index);
    setProjects(updated);
    onChange("projects", updated.map((p, i) => ({ ...EMPTY_WEB_PORTFOLIO.projects![0], id: `project-${i}`, ...p })));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold"><T text={"Proyek & Karya"} /></h2>
          <p className="mt-1 text-sm text-muted-foreground"><T text={"Tambahkan proyek untuk ditampilkan di portofolio Anda."} /></p>
        </div>
        <button
          onClick={addProject}
          className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#3b63fb] px-4 py-2 text-sm font-semibold text-white hover:bg-[#274dea]"
        >
          <Plus className="mr-2 size-4" />
          <T text={"Tambah Proyek"} />
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center">
          <ImagePlus className="mx-auto size-8 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground"><T text={"Belum ada proyek. Tambahkan proyek pertama Anda."} /></p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project, index) => (
            <div key={index} className="rounded-xl border border-zinc-200 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Proyek {index + 1}</span>
                <button
                  onClick={() => removeProject(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  value={project.title}
                  onChange={(e) => updateProject(index, "title", e.target.value)}
                  placeholder="Judul Proyek"
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  value={project.category}
                  onChange={(e) => updateProject(index, "category", e.target.value)}
                  placeholder="Kategori"
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                />
              </div>
              <textarea
                value={project.description}
                onChange={(e) => updateProject(index, "description", e.target.value)}
                placeholder="Deskripsi proyek..."
                rows={3}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  value={project.image}
                  onChange={(e) => updateProject(index, "image", e.target.value)}
                  placeholder="URL Gambar (opsional)"
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  value={project.url}
                  onChange={(e) => updateProject(index, "url", e.target.value)}
                  placeholder="URL Proyek (opsional)"
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function PortfolioBuilder({
  data,
  onChange,
  demoMode = false,
}: {
  data: WebPortfolio;
  onChange: <K extends keyof WebPortfolio>(key: K, value: WebPortfolio[K]) => void;
  demoMode?: boolean;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold"><T text={"Profil Pribadi"} /></h2>
        <p className="mt-1 text-sm text-muted-foreground"><T text={"Isi informasi dasar tentang diri Anda."} /></p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-2"><T text={"Nama Lengkap"} /></label>
          <input
            type="text"
            value={data.name || ""}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="John Doe"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2"><T text={"Role / Pekerjaan"} /></label>
          <input
            type="text"
            value={data.role || ""}
            onChange={(e) => onChange("role", e.target.value)}
            placeholder="UI/UX Designer"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2"><T text={"Headline"} /></label>
        <input
          type="text"
          value={data.headline || ""}
          onChange={(e) => onChange("headline", e.target.value)}
          placeholder="Saya membantu brand tumbuh melalui desain yang efektif"
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2"><T text={"Bio"} /></label>
        <textarea
          value={data.bio || ""}
          onChange={(e) => onChange("bio", e.target.value)}
          placeholder="Ceritakan tentang diri Anda..."
          rows={4}
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-2"><T text={"Lokasi"} /></label>
          <input
            type="text"
            value={data.location || ""}
            onChange={(e) => onChange("location", e.target.value)}
            placeholder="Jakarta, Indonesia"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2"><T text={"Email"} /></label>
          <input
            type="email"
            value={data.email || ""}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder="email@example.com"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2"><T text={"Website"} /></label>
        <input
          type="url"
          value={data.website || ""}
          onChange={(e) => onChange("website", e.target.value)}
          placeholder="https://contoh.com"
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2"><T text={"URL Foto Profil"} /></label>
        <input
          type="url"
          value={data.avatar || ""}
          onChange={(e) => onChange("avatar", e.target.value)}
          placeholder="https://contoh.com/foto.jpg"
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="available"
          checked={data.available || false}
          onChange={(e) => onChange("available", e.target.checked)}
          className="size-4 rounded border-zinc-300"
        />
        <label htmlFor="available" className="text-sm"><T text={"Tersedia untuk proyek baru"} /></label>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2"><T text={"Skills"} /></label>
        <input
          type="text"
          value={(data.skills || []).join(", ")}
          onChange={(e) => onChange("skills", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
          placeholder="UI/UX Design, Web Development, Branding"
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2"><T text={"Social Media"} /></label>
        <p className="text-xs text-muted-foreground mb-2"><T text={"Pisahkan dengan koma untuk beberapa akun."} /></p>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="url"
            value={data.socials?.find((s) => s.network === "instagram")?.url || ""}
            onChange={(e) => {
              const socials = [...(data.socials || [])];
              const idx = socials.findIndex((s) => s.network === "instagram");
              if (idx >= 0) socials[idx] = { ...socials[idx], url: e.target.value };
              else socials.push({ id: "instagram", network: "instagram", url: e.target.value });
              onChange("socials", socials);
            }}
            placeholder="Instagram URL"
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
          <input
            type="url"
            value={data.socials?.find((s) => s.network === "linkedin")?.url || ""}
            onChange={(e) => {
              const socials = [...(data.socials || [])];
              const idx = socials.findIndex((s) => s.network === "linkedin");
              if (idx >= 0) socials[idx] = { ...socials[idx], url: e.target.value };
              else socials.push({ id: "linkedin", network: "linkedin", url: e.target.value });
              onChange("socials", socials);
            }}
            placeholder="LinkedIn URL"
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
      </div>
    </div>
  );
}