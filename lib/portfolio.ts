export const PORTFOLIO_TEMPLATES = [
  {
    id: "bento",
    name: "Bento",
    category: "Kreatif & personal",
    description:
      "Kartu modular, aksen lime, dan ruang untuk setiap sisi dirimu.",
  },
  {
    id: "editorial",
    name: "Editorial",
    category: "Desainer & profesional",
    description:
      "Tipografi besar, nuansa kertas, dan karya sebagai pusat perhatian.",
  },
  {
    id: "midnight",
    name: "Midnight",
    category: "Developer & visual artist",
    description: "Kanvas gelap, aksen violet, dan galeri karya yang imersif.",
  },
  {
    id: "mono",
    name: "Mono Portrait",
    category: "Fotografi & art direction",
    description:
      "Potret hitam-putih tanpa background, nama raksasa, dan komposisi editorial yang berani.",
  },
  {
    id: "vivid",
    name: "Vivid",
    category: "Desainer visual & kreatif",
    description:
      "Latar gradasi lembut, tipografi tebal, potret besar, dan aksen hijau yang berani.",
  },
  {
    id: "minimalist",
    name: "Minimalist",
    category: "Profesional & Elegan",
    description:
      "Bersih, terfokus pada konten, dengan layout yang presisi.",
  },
] as const;
export type PortfolioTemplate = (typeof PORTFOLIO_TEMPLATES)[number]["id"];
// Platform yang dikenali form sosial media. `prefix` melengkapi username yang
// diketik tanpa domain penuh, jadi pengguna cukup menulis @namamu.
export const SOCIAL_NETWORKS = [
  { id: "instagram", label: "Instagram", prefix: "https://instagram.com/" },
  { id: "linkedin", label: "LinkedIn", prefix: "https://linkedin.com/in/" },
  { id: "x", label: "X", prefix: "https://x.com/" },
  { id: "tiktok", label: "TikTok", prefix: "https://tiktok.com/@" },
  { id: "github", label: "GitHub", prefix: "https://github.com/" },
  { id: "behance", label: "Behance", prefix: "https://behance.net/" },
  { id: "dribbble", label: "Dribbble", prefix: "https://dribbble.com/" },
  { id: "youtube", label: "YouTube", prefix: "https://youtube.com/@" },
] as const;
export type SocialNetwork = (typeof SOCIAL_NETWORKS)[number]["id"];
export type WebSocial = {
  id: string;
  network: SocialNetwork;
  url: string;
};
export type WebProject = {
  id: string;
  title: string;
  category: string;
  description: string;
  url: string;
  image: string;
};
export type WebPortfolio = {
  template: PortfolioTemplate;
  name: string;
  role: string;
  headline: string;
  bio: string;
  location: string;
  email: string;
  website: string;
  avatar: string;
  available: boolean;
  skills: string[];
  projects: WebProject[];
  socials: WebSocial[];
  seoTitle: string;
  seoDescription: string;
};
export const EMPTY_WEB_PORTFOLIO: WebPortfolio = {
  template: "bento",
  name: "",
  role: "",
  headline: "",
  bio: "",
  location: "",
  email: "",
  website: "",
  avatar: "",
  available: true,
  skills: [],
  projects: [],
  socials: [],
  seoTitle: "",
  seoDescription: "",
};
export const DEMO_WEB_PORTFOLIO: WebPortfolio = {
  ...EMPTY_WEB_PORTFOLIO,
  name: "Alex Morgan",
  role: "Product designer & creative thinker",
  headline: "Ide yang baik.\nPengalaman yang berkesan.",
  bio: "Saya merancang pengalaman digital yang terasa sederhana, berguna, dan punya karakter. Terbuka untuk kolaborasi berikutnya.",
  location: "Jakarta, Indonesia",
  skills: ["Product design", "Brand identity", "Web development", "Figma"],
  socials: [
    { id: "demo-social-1", network: "instagram", url: "https://instagram.com/alexmorgan" },
    { id: "demo-social-2", network: "linkedin", url: "https://linkedin.com/in/alexmorgan" },
  ],
  projects: [
    {
      id: "demo-1",
      title: "Forma — A new perspective",
      category: "Brand identity",
      description:
        "Identitas visual yang mempertemukan bentuk, warna, dan cerita.",
      image: "",
      url: "",
    },
    {
      id: "demo-2",
      title: "Objects of everyday",
      category: "Digital experience",
      description:
        "Eksplorasi pengalaman belanja yang lebih dekat dengan keseharian.",
      image: "",
      url: "",
    },
    {
      id: "demo-3",
      title: "Make room for ideas",
      category: "Art direction",
      description:
        "Ruang untuk ide besar dan detail kecil yang membuat perbedaan.",
      image: "",
      url: "",
    },
  ],
};
// Data contoh per tema untuk panel LIVE PREVIEW saat memilih desain. Setiap
// tema memakai orang, foto, dan tiga karya berbeda supaya pengunjung bisa
// membayangkan hasil akhirnya sebelum mulai mengisi.
export const DEMO_WEB_PORTFOLIOS: Record<PortfolioTemplate, WebPortfolio> = {
  bento: {
    ...EMPTY_WEB_PORTFOLIO,
    template: "bento",
    name: "Nadia Prameswari",
    role: "Brand & Visual Designer",
    headline: "Good ideas, made visible.",
    bio: "Merancang identitas dan pengalaman visual untuk brand yang ingin tampil beda. Percaya bahwa detail kecil yang membuat sebuah karya terasa hidup.",
    location: "Bandung, Indonesia",
    email: "halo@nadia.studio",
    website: "https://nadia.studio",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
    available: true,
    skills: ["Brand identity", "Art direction", "Visual design", "Illustration"],
    socials: [
      { id: "demo-bento-ig", network: "instagram", url: "https://instagram.com/nadiaprameswari" },
      { id: "demo-bento-in", network: "linkedin", url: "https://linkedin.com/in/nadiaprameswari" },
    ],
    projects: [
      {
        id: "demo-bento-1",
        title: "Loka Coffee — Rebrand",
        category: "Brand identity",
        description: "Identitas baru untuk kedai kopi lokal dengan karakter hangat.",
        image: "https://picsum.photos/seed/bento-work-1/1200/800",
        url: "",
      },
      {
        id: "demo-bento-2",
        title: "Ruang Baca — Website",
        category: "Web design",
        description: "Situs perpustakaan komunitas yang tenang dan mudah dijelajahi.",
        image: "https://picsum.photos/seed/bento-work-2/1200/800",
        url: "",
      },
      {
        id: "demo-bento-3",
        title: "Nadi — Campaign",
        category: "Art direction",
        description: "Kampanye visual untuk merayakan suara kreator muda.",
        image: "https://picsum.photos/seed/bento-work-3/1200/800",
        url: "",
      },
    ],
  },
  editorial: {
    ...EMPTY_WEB_PORTFOLIO,
    template: "editorial",
    name: "Raka Adhitama",
    role: "Editorial Designer & Art Director",
    headline: "Cerita lewat huruf dan gambar.",
    bio: "Menata informasi menjadi cerita yang enak dibaca. Bekerja di persimpangan desain editorial, tipografi, dan fotografi.",
    location: "Yogyakarta, Indonesia",
    email: "studio@rakaadhitama.com",
    website: "https://rakaadhitama.com",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80",
    available: true,
    skills: ["Editorial design", "Typography", "Photography", "Print"],
    socials: [
      { id: "demo-editorial-ig", network: "instagram", url: "https://instagram.com/rakaadhitama" },
      { id: "demo-editorial-be", network: "behance", url: "https://behance.net/rakaadhitama" },
    ],
    projects: [
      {
        id: "demo-editorial-1",
        title: "Sensus — Annual Report",
        category: "Editorial",
        description: "Laporan tahunan dengan ritme tipografi yang tegas.",
        image: "https://picsum.photos/seed/editorial-work-1/1200/800",
        url: "",
      },
      {
        id: "demo-editorial-2",
        title: "Kata — Magazine",
        category: "Print",
        description: "Majalah budaya dengan pendekatan grid yang ekspresif.",
        image: "https://picsum.photos/seed/editorial-work-2/1200/800",
        url: "",
      },
      {
        id: "demo-editorial-3",
        title: "Arsip — Exhibition",
        category: "Art direction",
        description: "Identitas pameran arsip visual kota.",
        image: "https://picsum.photos/seed/editorial-work-3/1200/800",
        url: "",
      },
    ],
  },
  midnight: {
    ...EMPTY_WEB_PORTFOLIO,
    template: "midnight",
    name: "Kezia Ananta",
    role: "Developer & Visual Artist",
    headline: "Designing what's next.",
    bio: "Membangun antarmuka dan instalasi digital yang memadukan kode, cahaya, dan rasa ingin tahu.",
    location: "Jakarta, Indonesia",
    email: "hi@keziaananta.dev",
    website: "https://keziaananta.dev",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80",
    available: true,
    skills: ["Creative coding", "Web development", "Motion", "WebGL"],
    socials: [
      { id: "demo-midnight-gh", network: "github", url: "https://github.com/keziaananta" },
      { id: "demo-midnight-x", network: "x", url: "https://x.com/keziaananta" },
    ],
    projects: [
      {
        id: "demo-midnight-1",
        title: "Orbit — SaaS Platform",
        category: "Product design",
        description: "Dashboard gelap untuk tim data yang bekerja sepanjang malam.",
        image: "https://picsum.photos/seed/midnight-work-1/1200/800",
        url: "",
      },
      {
        id: "demo-midnight-2",
        title: "Signal — Design System",
        category: "Design system",
        description: "Sistem komponen modular dengan aksen violet.",
        image: "https://picsum.photos/seed/midnight-work-2/1200/800",
        url: "",
      },
      {
        id: "demo-midnight-3",
        title: "Nocturne — Interactive",
        category: "Creative coding",
        description: "Instalasi web interaktif yang bereaksi terhadap suara.",
        image: "https://picsum.photos/seed/midnight-work-3/1200/800",
        url: "",
      },
    ],
  },
  mono: {
    ...EMPTY_WEB_PORTFOLIO,
    template: "mono",
    name: "Bima Saputra",
    role: "Fotografer & Art Director",
    headline: "Photography with a point of view.",
    bio: "Merekam manusia dan ruang dalam hitam-putih. Fokus pada potret, dokumenter, dan arah seni untuk brand.",
    location: "Denpasar, Indonesia",
    email: "hello@bimasaputra.photo",
    website: "https://bimasaputra.photo",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80",
    available: true,
    skills: ["Portrait", "Documentary", "Art direction", "Retouching"],
    socials: [
      { id: "demo-mono-ig", network: "instagram", url: "https://instagram.com/bimasaputra" },
      { id: "demo-mono-be", network: "behance", url: "https://behance.net/bimasaputra" },
    ],
    projects: [
      {
        id: "demo-mono-1",
        title: "Tanah — Photo Series",
        category: "Documentary",
        description: "Potret kehidupan petani di kaki gunung.",
        image: "https://picsum.photos/seed/mono-work-1/1200/800",
        url: "",
      },
      {
        id: "demo-mono-2",
        title: "Potret Kota — Editorial",
        category: "Portrait",
        description: "Wajah-wajah kota dalam cahaya pagi.",
        image: "https://picsum.photos/seed/mono-work-2/1200/800",
        url: "",
      },
      {
        id: "demo-mono-3",
        title: "Sunyi — Exhibition",
        category: "Art direction",
        description: "Pameran foto tentang ruang yang kosong.",
        image: "https://picsum.photos/seed/mono-work-3/1200/800",
        url: "",
      },
    ],
  },
  vivid: {
    ...EMPTY_WEB_PORTFOLIO,
    template: "vivid",
    name: "Alya Kusuma",
    role: "Visual Designer & Illustrator",
    headline: "Warna di luar garis.",
    bio: "Menciptakan identitas visual yang berani, hangat, dan mudah diingat. Senang bermain dengan warna dan bentuk.",
    location: "Surabaya, Indonesia",
    email: "halo@alyakusuma.com",
    website: "https://alyakusuma.com",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
    available: true,
    skills: ["Visual identity", "Illustration", "Packaging", "Campaign"],
    socials: [
      { id: "demo-vivid-ig", network: "instagram", url: "https://instagram.com/alyakusuma" },
      { id: "demo-vivid-dr", network: "dribbble", url: "https://dribbble.com/alyakusuma" },
    ],
    projects: [
      {
        id: "demo-vivid-1",
        title: "Bloom — Brand Identity",
        category: "Brand identity",
        description: "Identitas ceria untuk brand perawatan tubuh alami.",
        image: "https://picsum.photos/seed/vivid-work-1/1200/800",
        url: "",
      },
      {
        id: "demo-vivid-2",
        title: "Kroma — Mobile App",
        category: "UI design",
        description: "Aplikasi belajar warna untuk anak-anak.",
        image: "https://picsum.photos/seed/vivid-work-2/1200/800",
        url: "",
      },
      {
        id: "demo-vivid-3",
        title: "Festival Warna — Campaign",
        category: "Campaign",
        description: "Kampanye visual untuk festival seni tahunan.",
        image: "https://picsum.photos/seed/vivid-work-3/1200/800",
        url: "",
      },
    ],
  },
  minimalist: {
    ...EMPTY_WEB_PORTFOLIO,
    template: "minimalist",
    name: "Daniel Hartono",
    role: "Product Designer",
    headline: "Simple, useful, thoughtful.",
    bio: "Merancang produk digital yang bersih dan fokus pada kebutuhan pengguna. Bekerja dengan tim produk dari riset hingga peluncuran.",
    location: "Jakarta, Indonesia",
    email: "hello@danielhartono.com",
    website: "https://danielhartono.com",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
    available: true,
    skills: ["Product design", "UX research", "Prototyping", "Design system"],
    socials: [
      { id: "demo-minimalist-in", network: "linkedin", url: "https://linkedin.com/in/danielhartono" },
      { id: "demo-minimalist-ig", network: "instagram", url: "https://instagram.com/danielhartono" },
    ],
    projects: [
      {
        id: "demo-minimalist-1",
        title: "Flow — Product Design",
        category: "Product design",
        description: "Aplikasi manajemen tugas yang tenang dan terfokus.",
        image: "https://picsum.photos/seed/minimalist-work-1/1200/800",
        url: "",
      },
      {
        id: "demo-minimalist-2",
        title: "North — Design System",
        category: "Design system",
        description: "Sistem desain untuk produk perbankan digital.",
        image: "https://picsum.photos/seed/minimalist-work-2/1200/800",
        url: "",
      },
      {
        id: "demo-minimalist-3",
        title: "Clarity — Dashboard",
        category: "Dashboard",
        description: "Dasbor analitik yang sederhana untuk tim non-teknis.",
        image: "https://picsum.photos/seed/minimalist-work-3/1200/800",
        url: "",
      },
    ],
  },
};
export function safePortfolioUrl(value: string): string | undefined {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) &&
      !url.username &&
      !url.password
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
}
// Alamat portofolio hidup di root (`/<slug>`), jadi nama yang sudah dipakai
// rute aplikasi tidak boleh diambil pengguna. Daftar ini juga dijaga oleh
// constraint portfolio_websites_slug_check di Supabase.
export const RESERVED_PORTFOLIO_SLUGS = [
  "admin",
  "api",
  "app",
  "auth",
  "blog",
  "contact",
  "cv-ats",
  "cv-builder",
  "daftar",
  "dashboard",
  "dashboard-preview",
  "docs",
  "faq",
  "fonts",
  "harga",
  "help",
  "home",
  "lamaranku",
  "login",
  "mail",
  "masuk",
  "p",
  "portfolio",
  "privacy",
  "privasi",
  "reset-password",
  "seg-test",
  "signup",
  "skor",
  "status",
  "support",
  "surat",
  "syarat",
  "terms",
  "www",
] as const;

/**
 * Tautan sosial media final. Isian boleh berupa URL penuh atau username /
 * @namamu; username dilengkapi prefix platform.
 */
export function socialLinkUrl(
  network: unknown,
  value: string,
): string | undefined {
  const entry = SOCIAL_NETWORKS.find((item) => item.id === network);
  if (!entry) return undefined;
  const input = value.trim();
  if (!input) return undefined;
  if (/^https?:\/\//i.test(input)) return safePortfolioUrl(input);
  const handle = input.replace(/^@+/, "").replace(/^\/+/, "");
  if (!handle || !/^[\w.-]+$/.test(handle)) return undefined;
  return safePortfolioUrl(entry.prefix + handle);
}

export const validPortfolioSlug = (value: unknown): value is string =>
  typeof value === "string" &&
  /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/.test(value) &&
  !(RESERVED_PORTFOLIO_SLUGS as readonly string[]).includes(value);
export function portfolioImageUrl(path: string): string | undefined {
  const value = path.trim();
  if (!value) return undefined;
  // Data contoh / pratinjau boleh memakai URL gambar langsung.
  if (/^https?:\/\//i.test(value)) return safePortfolioUrl(value);
  if (!/^[a-f\d-]{36}\/[a-f\d-]{36}\.(webp|png|jpg)$/.test(value))
    return undefined;
  const origin = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return origin
    ? `${origin}/storage/v1/object/public/portfolio-images/${value}`
    : undefined;
}
export function parseWebPortfolio(
  value: unknown,
  owner?: string,
  options?: { allowRemoteImages?: boolean },
): WebPortfolio {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw Error("Isi portofolio tidak valid.");
  const v = value as Record<string, unknown>;
  const text = (key: string, max: number, source = v) => {
    if (typeof source[key] !== "string" || (source[key] as string).length > max)
      throw Error(`Kolom ${key} tidak valid atau terlalu panjang.`);
    return (source[key] as string).trim();
  };
  const image = (key: string, source = v) => {
    const remote = options?.allowRemoteImages === true;
    const path = text(key, remote ? 2000 : 100, source);
    const stored = /^[a-f\d-]{36}\/[a-f\d-]{36}\.(webp|png|jpg)$/.test(path);
    const external = remote && /^https?:\/\//i.test(path);
    if (
      path &&
      ((!stored && !external) ||
        (external && !safePortfolioUrl(path)) ||
        (stored && owner && !path.startsWith(`${owner}/`)))
    )
      throw Error("Gambar tidak valid atau bukan milik akun ini.");
    return path;
  };
  const url = (key: string, source = v) => {
    const result = text(key, 2000, source);
    if (result && !safePortfolioUrl(result))
      throw Error("Gunakan tautan lengkap berawalan https:// atau http://.");
    return result;
  };
  if (!PORTFOLIO_TEMPLATES.some((t) => t.id === v.template))
    throw Error("Pilih desain portofolio yang tersedia.");
  if (
    typeof v.available !== "boolean" ||
    !Array.isArray(v.skills) ||
    v.skills.length > 24 ||
    v.skills.some((s) => typeof s !== "string" || s.length > 60)
  )
    throw Error("Keahlian tidak valid (maksimal 24).");
  if (!Array.isArray(v.projects) || v.projects.length > 12)
    throw Error("Maksimal 12 karya per portofolio.");
  // Draft lama belum punya `socials`; anggap kosong supaya tetap valid.
  const socialsInput = v.socials === undefined ? [] : v.socials;
  if (!Array.isArray(socialsInput) || socialsInput.length > SOCIAL_NETWORKS.length)
    throw Error(`Sosial media tidak valid (maksimal ${SOCIAL_NETWORKS.length}).`);
  const networks = new Set<string>();
  const socials = socialsInput.map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item))
      throw Error("Sosial media tidak valid.");
    const s = item as Record<string, unknown>;
    if (!SOCIAL_NETWORKS.some((entry) => entry.id === s.network))
      throw Error("Pilih platform sosial media yang tersedia.");
    const url = socialLinkUrl(s.network, text("url", 300, s)) ?? "";
    if (!url) throw Error("Tautan sosial media belum valid.");
    if (networks.has(s.network as string))
      throw Error("Setiap platform sosial media cukup satu tautan.");
    networks.add(s.network as string);
    return {
      id: text("id", 80, s),
      network: s.network as SocialNetwork,
      url,
    };
  });
  const email = text("email", 254);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw Error("Alamat email belum valid.");
  return {
    template: v.template as PortfolioTemplate,
    name: text("name", 100),
    role: text("role", 150),
    headline: text("headline", 240),
    bio: text("bio", 3000),
    location: text("location", 120),
    email,
    website: url("website"),
    avatar: image("avatar"),
    available: v.available,
    skills: [
      ...new Set((v.skills as string[]).map((s) => s.trim()).filter(Boolean)),
    ],
    socials,
    seoTitle: text("seoTitle", 70),
    seoDescription: text("seoDescription", 180),
    projects: v.projects.map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item))
        throw Error("Karya tidak valid.");
      const p = item as Record<string, unknown>;
      return {
        id: text("id", 80, p),
        title: text("title", 150, p),
        category: text("category", 80, p),
        description: text("description", 2000, p),
        url: url("url", p),
        image: image("image", p),
      };
    }),
  };
}
// JSONB returns object keys in its own order. Normalizing through the parser
// gives a stable value for comparing the live snapshot with the draft.
export function portfolioFingerprint(
  value: unknown,
  owner?: string,
): string | null {
  try {
    return JSON.stringify(parseWebPortfolio(value, owner));
  } catch {
    return null;
  }
}
