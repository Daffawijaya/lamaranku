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
] as const;
export type PortfolioTemplate = (typeof PORTFOLIO_TEMPLATES)[number]["id"];
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
export const validPortfolioSlug = (value: unknown): value is string =>
  typeof value === "string" &&
  /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/.test(value) &&
  !["admin", "api", "dashboard", "portfolio", "support", "lamaranku"].includes(
    value,
  );
export function portfolioImageUrl(path: string): string | undefined {
  if (!/^[a-f\d-]{36}\/[a-f\d-]{36}\.(webp|png|jpg)$/.test(path))
    return undefined;
  const origin = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return origin
    ? `${origin}/storage/v1/object/public/portfolio-images/${path}`
    : undefined;
}
export function parseWebPortfolio(
  value: unknown,
  owner?: string,
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
    const path = text(key, 100, source);
    if (
      path &&
      (!portfolioImageUrl(path) || (owner && !path.startsWith(`${owner}/`)))
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
