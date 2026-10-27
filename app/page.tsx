import { type CSSProperties } from "react";
import Link from "next/link";
import { ChevronRight, FileText, FolderKanban, Gauge, Mail, ArrowRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { FaFolderOpen, FaMagic, FaTachometerAlt } from "react-icons/fa";
import { BiLogoGmail } from "react-icons/bi";
import { TbFileTextFilled } from "react-icons/tb";
import type { IconType } from "react-icons";
import Navbar from "../components/jds/SiteNavbar";
import ParallaxHero from "../components/jds/ParallaxHero";
import HeroCarousel from "../components/jds/HeroCarousel";
import { AiRainbowIcon, AI_CONIC } from "../components/jds/AiRainbowIcon";
import RevealDark from "../components/jds/RevealDark";
import { SectionHeading } from "../components/jds/SectionHeading";
import { FaqSection } from "../components/jds/FaqSection";
import { TrustCta } from "../components/jds/TrustCta";
import { SiteFooter } from "../components/jds/SiteFooter";
import ComparisonTable from "../components/ComparisonTable";
import { PLUS_PRICE } from "../data/features";
import { wa } from "../lib/wa";
import { SITE_URL } from "../lib/seo";
import { StructuredData } from "../components/seo/StructuredData";

const WA_PATH =
  "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z";

const FAQS: [string, string][] = [
  [
    "Gratisnya sampai mana?",
    "Paket Basic menyimpan 2 CV dan membuat 3 surat tiap bulan. Hasil unduhan memakai cap contoh Lamaranku."
  ],
  [
    "Apa beda template ATS dan Kreatif?",
    "ATS satu kolom teks polos agar terbaca sistem penyaring perusahaan besar dan BUMN. Kreatif memakai bilah sisi dan warna, cocok untuk agensi, startup, dan industri media."
  ],
  [
    "Di mana data saya disimpan?",
    "Masuk ke akun untuk membuka dashboard. Dokumen tersimpan di browser yang kamu pakai; sinkronisasi dokumen antarperangkat belum tersedia. Unduh PDF untuk menyimpan salinan."
  ],
  [
    "Bagaimana cara mengunduh CV?",
    "Tekan Unduh PDF di halaman builder, lalu pilih simpan sebagai PDF di dialog cetak. Paket Basic ikut mencetak cap contoh, Plus bersih."
  ],
  [
    "Template mana yang terkunci?",
    "Columbia, Munich, Oxford, Corporate, Bold Impact, dan Geo Flow khusus Plus. Harvard, Adelaide, Structura, dan Minimalist terbuka untuk Basic."
  ],
  [
    "Berapa harga Plus?",
    `Harga awal ${PLUS_PRICE}. Angka ini masih bisa berubah, konfirmasi lewat WA sebelum membayar. Fase ini pembayaran manual lewat QRIS.`
  ]
];

const FEATURES: { href: string; icon: LucideIcon; chip: string; title: string; desc: string; cta: string }[] = [
  {
    href: "/cv-builder",
    icon: FileText,
    chip: "10 template",
    title: "CV Builder",
    desc: "Template ATS dan Kreatif. Basic gratis 2 CV tersimpan.",
    cta: "Buka CV Builder"
  },
  {
    href: "/skor",
    icon: Gauge,
    chip: "2 menit",
    title: "Cek Skor CV",
    desc: "Review isi CV dengan AI, bukti, dan prioritas perbaikan.",
    cta: "Cek skorku"
  },
  {
    href: "/portfolio",
    icon: FolderKanban,
    chip: "1 halaman",
    title: "Portfolio Builder",
    desc: "Kumpulkan karya, simpan lokal, unduh PDF.",
    cta: "Susun portfolio"
  },
  {
    href: "/surat",
    icon: Mail,
    chip: "3x sebulan",
    title: "Generator Surat",
    desc: "Surat lamaran siap kirim dalam 1 menit.",
    cta: "Buat surat"
  }
];

const AI_CARDS: { icon: IconType; img: string; t: string; d: string; iconBg: string; iconColor: string; glyph?: string; iconStyle?: CSSProperties }[] = [
  {
    icon: TbFileTextFilled,
    img: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80",
    t: "Perbaiki kalimat CV",
    d: "AI merapikan dan memperkuat kalimat pengalaman agar terbaca profesional. Kamu yang memutuskan, AI hanya mengusulkan.",
    iconBg: "bg-[#eb1000]",
    iconColor: "text-white",
    glyph: "w-6 h-6"
  },
  {
    icon: FaMagic,
    img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
    t: "Saran frasa siap pakai",
    d: "Minta bullet point sesuai posisi yang dituju. Salin yang cocok, buang yang tidak.",
    iconBg: "",
    iconColor: "text-white",
    iconStyle: { background: AI_CONIC }
  },
  {
    icon: FaTachometerAlt,
    img: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80",
    t: "Cek kecocokan lowongan",
    d: "Tempel syarat lowongan, lihat bagian berkas yang kurang. Tanpa janji lolos.",
    iconBg: "bg-[#001e36]",
    iconColor: "text-[#31a8ff]",
    glyph: "w-6 h-6"
  },
  {
    icon: FaFolderOpen,
    img: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&w=800&q=80",
    t: "Deskripsi karya otomatis",
    d: "Ubah catatan kasar jadi deskripsi karya yang rapi untuk portfoliomu.",
    iconBg: "bg-[#330000]",
    iconColor: "text-[#ff9a00]",
    glyph: "w-6 h-6"
  },
  {
    icon: BiLogoGmail,
    img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80",
    t: "Rapikan surat lamaran",
    d: "Nada dan struktur surat disesuaikan dengan posisi yang dilamar. Kuota mengikuti paketmu.",
    iconBg: "bg-[#49021f]",
    iconColor: "text-[#ff3366]",
    glyph: "w-6 h-6"
  }
];

export default function Home() {
  return (
    <div className="w-full min-h-screen bg-white text-slate-900 font-sans antialiased">
      <StructuredData data={{ "@context": "https://schema.org", "@graph": [
        { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: "Lamaranku", url: SITE_URL },
        { "@type": "WebSite", "@id": `${SITE_URL}/#website`, name: "Lamaranku", url: SITE_URL, inLanguage: "id", publisher: { "@id": `${SITE_URL}/#organization` } },
      ] }} />
      <Navbar />

      <ParallaxHero>
        <HeroCarousel />
      </ParallaxHero>

      <section className="relative z-10 bg-white px-5 pb-6 pt-14 lg:pt-20" aria-labelledby="home-title">
        <div className="mx-auto max-w-[1056px] text-center">
          <h1 id="home-title" className="text-3xl font-bold tracking-tight sm:text-5xl">Buat CV ATS dan portofolio gratis.</h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-zinc-600">Siapkan lamaran kerja dalam satu tempat: pilih template CV, tulis pengalamanmu, susun karya, dan unduh PDF. Mulai dengan Basic gratis; masuk ke dashboard untuk menyimpan pekerjaanmu di browser.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-4 text-sm font-semibold">
            <Link href="/cv-builder" className="rounded-full bg-[#3b63fb] px-6 py-3 text-white hover:bg-[#274dea]">Bikin CV gratis</Link>
            <Link href="/cv-ats" className="rounded-full border border-zinc-300 px-6 py-3 hover:bg-zinc-100">Panduan CV ATS</Link>
            <Link href="/portfolio" className="rounded-full border border-zinc-300 px-6 py-3 hover:bg-zinc-100">Buat portofolio gratis</Link>
          </div>
        </div>
      </section>

      <section id="fitur" className="relative z-10 scroll-mt-28 bg-white py-12 text-zinc-900 lg:py-16">
        <div className="max-w-[1310px] mx-auto px-5 sm:px-4 lg:px-6">
          <SectionHeading
            badgeText="Fitur"
            title="Semua kebutuhan berkas."
            subtitle="Empat alat, satu tempat. Klik kartu untuk membuka halamannya."
            titleClassName="text-[28px] sm:text-[42px]"
            className="mb-12"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <Link
                key={f.href}
                href={f.href}
                className="bg-zinc-100 rounded-2xl p-6 group transition-all duration-[600ms] hover:bg-black hover:shadow-lg flex flex-col"
              >
                <span className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-3 py-1 text-[11px] font-bold text-white group-hover:bg-white group-hover:text-black transition-colors">
                  <f.icon aria-hidden="true" className="h-3.5 w-3.5" />
                  {f.chip}
                </span>
                <span className="mt-4 block text-lg font-bold text-zinc-900 group-hover:text-white">{f.title}</span>
                <span className="mt-1 block text-sm text-zinc-600 group-hover:text-white/60">{f.desc}</span>
                <span className="mt-auto inline-flex items-center gap-0.5 self-start pt-3 text-sm font-bold text-zinc-900 group-hover:text-white">
                  {f.cta}
                  <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="cara-kerja" className="relative z-10 scroll-mt-28 py-12 bg-white text-zinc-900 lg:py-16">
        <div className="max-w-[1310px] mx-auto px-5 sm:px-4 lg:px-6">
          <SectionHeading
            badgeText="Cara Kerja"
            title="Dari template ke lamaran."
            subtitle="Tiga langkah cepat, batasnya tertulis jelas."
            titleClassName="text-[28px] sm:text-[42px]"
            className="mb-12"
          />
          <div className="mx-[12px] mt-10 sm:mx-0 sm:mt-12" aria-label="Tahapan membuat CV">
            <ol className="grid min-h-[92px] grid-cols-[5fr_7fr] sm:min-h-[72px] min-[1200px]:grid-cols-[1fr_2fr]">
              <li>
                <p className="text-xs font-bold leading-tight sm:text-sm">Langkah 1</p>
                <Link href="/cv-builder" className="mt-1 block max-w-[96px] text-[11px] leading-[1.35] sm:max-w-[220px] sm:text-sm sm:leading-snug hover:underline">
                  Pilih Template
                </Link>
                <p className="mt-1 max-w-[96px] text-[11px] leading-[1.35] text-black/60 sm:max-w-[220px] sm:text-xs">
                  Saring ATS atau Kreatif, klik pakai.
                </p>
              </li>
              <li className="flex justify-between">
                <div className="max-w-[96px] sm:max-w-[220px]">
                  <p className="text-xs font-bold leading-tight sm:text-sm">Langkah 2</p>
                  <Link href="/cv-builder" className="mt-1 block text-[11px] leading-[1.35] sm:text-sm sm:leading-snug hover:underline">Isi Informasi</Link>
                  <p className="mt-1 text-[11px] leading-[1.35] text-black/60 sm:text-xs">
                    Data diri sampai keahlian, hasil mengikuti template.
                  </p>
                </div>
                <div className="max-w-[96px] text-right sm:max-w-[220px]">
                  <p className="text-xs font-bold leading-tight sm:text-sm">Langkah 3</p>
                  <Link href="/cv-builder" className="mt-1 block text-[11px] leading-[1.35] sm:text-sm sm:leading-snug hover:underline">Simpan dan Unduh</Link>
                  <p className="mt-1 text-[11px] leading-[1.35] text-black/60 sm:text-xs">
                    Basic 2 CV, unduh PDF, Plus tanpa cap.
                  </p>
                </div>
              </li>
            </ol>

            <div className="relative mt-3 h-4 sm:h-5" aria-hidden="true">
              <span className="absolute inset-y-0 left-0 w-[2px] -translate-x-px rounded-[1px] bg-[#f47ab2]" />
              <span className="absolute inset-y-0 left-[41.6667%] w-[2px] -translate-x-px rounded-[1px] bg-[#ffce2e] min-[1200px]:left-1/3" />
              <span className="absolute inset-y-0 left-full w-[2px] -translate-x-px rounded-[1px] bg-[#ffce2e]" />
            </div>

            <div className="mt-2 grid grid-cols-[5fr_7fr] gap-1 min-[1200px]:grid-cols-[1fr_2fr]">
              <div className="flex h-8 items-center justify-center rounded-l-[4px] bg-gradient-to-r from-[#f47ab2] to-[#ffce2e] px-2 text-center text-[10px] font-bold sm:text-sm">
                Pilih template
              </div>
              <div className="flex h-8 items-center justify-center rounded-r-[4px] bg-[#ffce2e] px-2 text-center text-[10px] font-bold sm:text-sm">
                Isi dan unduh
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="preview" className="relative z-10 scroll-mt-28 py-12 bg-white text-zinc-900 lg:py-16">
        <div className="max-w-[1310px] mx-auto px-5 sm:px-4 lg:px-6">
          <SectionHeading
            badgeText="Siap Melamar"
            title="Dari data diri sampai siap melamar."
            subtitle="Mulai dari yang kamu punya. Susun jadi CV yang rapi dan mudah dibaca."
            titleClassName="text-[28px] sm:text-[42px]"
            className="mb-12"
          />
          <ol className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {
                step: "01",
                icon: FileText,
                title: "Lengkapi profil",
                desc: "Siapkan pengalaman, pendidikan, dan keahlianmu. Baru mulai karier? Masukkan magang, organisasi, atau proyek yang pernah kamu kerjakan."
              },
              {
                step: "02",
                icon: FolderKanban,
                title: "Pilih tampilan CV",
                desc: "Pilih template ATS atau Kreatif sesuai kebutuhanmu. Lihat hasilnya langsung saat mengisi data di builder."
              },
              {
                step: "03",
                icon: Gauge,
                title: "Siapkan CV",
                desc: "Periksa kontak, rapikan isi, lalu simpan dan unduh PDF. Gunakan cek skor mandiri untuk meninjau kesiapan CV-mu."
              }
            ].map((item) => (
              <li key={item.step} className="rounded-2xl bg-zinc-100 p-6 sm:p-8">
                <div className="mb-6 flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-zinc-900">
                    <item.icon aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <span aria-hidden="true" className="text-sm font-semibold text-zinc-400">{item.step}</span>
                </div>
                <h3 className="text-lg font-bold text-zinc-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">{item.desc}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex justify-center">
            <Link
              href="/cv-builder"
              className="group inline-flex min-h-[44px] items-center gap-2 rounded-full bg-zinc-900 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-900"
            >
              Mulai Buat CV
              <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
      <RevealDark
        id="ai-plus"
        heading={
          <div className="max-w-[1310px] mx-auto px-5 sm:px-4 lg:px-6">
            <SectionHeading
              badgeIcon={
                <span className="inline-flex items-center gap-2">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded bg-[#000b1d]">
                    <AiRainbowIcon className="h-3 w-3" size={28} />
                  </span>
                  <span className="text-white text-lg">AI Plus</span>
                </span>
              }
              title="Asisten AI untuk berkas."
              subtitle="Segera hadir untuk paket Plus. Merapikan kalimat, mengusulkan frasa, menilai kecocokan lowongan."
              titleClassName="text-[28px] sm:text-[42px]"
              button={{ label: "Lihat Harga Plus", href: "/harga" }}
              dark
              className="mb-12"
            />
          </div>
        }
      >

        <img
          src="https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1800&q=85"
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="w-full h-[420px] sm:h-[520px] lg:h-auto block object-cover object-center -mt-[12rem] sm:-mt-[14rem] lg:-mt-[16rem] mb-4 opacity-80 [mask-image:linear-gradient(to_bottom,transparent_0%,black_32%,black_68%,transparent_88%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_32%,black_68%,transparent_88%)] lg:-mb-16"
        />

        <div className="max-w-[1310px] mx-auto px-5 sm:px-4 lg:px-6">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            {AI_CARDS.map((item) => (
              <div
                key={item.t}
                className="group relative overflow-hidden bg-[#141414] p-6 rounded-xl transition-all min-h-[260px] flex flex-col"
              >
                <img
                  src={item.img}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover opacity-0 scale-105 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className={`relative z-10 w-8 h-8 ${item.iconBg} ${item.iconColor} rounded font-black flex items-center justify-center mb-12`} style={item.iconStyle}>
                  <item.icon aria-hidden="true" className={item.glyph ?? "w-4 h-4"} />
                </div>
                <div className="relative z-10 mt-auto">
                  <h3 className="font-bold text-xl sm:text-2xl mb-1">{item.t}</h3>
                  <p className="text-sm text-zinc-400 group-hover:text-zinc-200 leading-relaxed transition-colors duration-500">
                    {item.d}
                  </p>
                </div>
              </div>
            ))}
            <a
              href={wa(`Halo Lamaranku, saya mau upgrade Plus ${PLUS_PRICE}`)}
              className="group bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-900 p-6 rounded-xl transition-all min-h-[260px] flex flex-col"
            >
              <div className="w-8 h-8 bg-white text-black rounded font-black flex items-center justify-center mb-12">
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </div>
              <div className="mt-auto">
                <h3 className="font-bold text-xl sm:text-2xl mb-1">Plus {PLUS_PRICE}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Harga awal, bisa berubah. Konfirmasi WA sebelum bayar. Tanpa perpanjangan otomatis.
                </p>
                <span className="mt-4 text-sm font-semibold text-white inline-flex items-center gap-1">
                  Upgrade ke Plus
                  <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </a>
          </div>
        </div>
      </RevealDark>

      <section id="harga" className="relative z-10 scroll-mt-28 py-12 bg-white text-zinc-900 lg:py-16">
        <div className="max-w-[1310px] mx-auto px-5 sm:px-4 lg:px-6">
          <SectionHeading
            badgeText="Paket"
            title="Batas Basic dan isi Plus."
            subtitle="CV, skor, portfolio, dan surat dalam satu tabel."
            titleClassName="text-[28px] sm:text-[42px]"
            className="mb-12"
          />
          <ComparisonTable showPaywallMoment={false} />
        </div>
      </section>

      <TrustCta
        eyebrow="Plus"
        title={`Siap tanpa batas dengan ${PLUS_PRICE}?`}
        description="CV dan surat unlimited, unduhan tanpa cap, semua template terbuka. Harga awal, konfirmasi WA sebelum bayar. Tanpa perpanjangan otomatis."
        primary={{ label: "Upgrade ke Plus", href: wa(`Halo Lamaranku, saya mau upgrade Plus ${PLUS_PRICE}`), external: true }}
        secondary={{ label: "Buat CV gratis", href: "/cv-builder" }}
      />

      <div id="faq" className="scroll-mt-28">
        <FaqSection
          title="Pertanyaan populer."
          items={FAQS.map(([question, answer]) => ({ question, answer }))}
        />
      </div>

      <SiteFooter variant="light" />

      <div className="no-print fixed bottom-6 right-6 z-50 hidden flex-col items-end gap-2 transition-opacity duration-500 md:flex">
        <a
          href={wa("Halo Lamaranku, saya butuh bantuan")}
          aria-label="Chat via WhatsApp"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg ring-2 ring-white/20 transition hover:scale-105 active:scale-95"
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current text-white" aria-hidden="true"><path d={WA_PATH} /></svg>
        </a>
      </div>
      <div className="no-print fixed bottom-[25vh] right-0 z-50 flex items-center gap-2 transition-opacity duration-500 md:hidden">
        <a
          href={wa("Halo Lamaranku, saya butuh bantuan")}
          aria-label="Bantuan, chat via WhatsApp"
          className="flex flex-col items-center gap-1.5 rounded-l-lg bg-[#25D366] px-1.5 py-3 text-white shadow-lg ring-2 ring-white/20 active:scale-95"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true"><path d={WA_PATH} /></svg>
          <span className="text-[11px] font-bold text-white">Bantuan</span>
        </a>
      </div>
    </div>
  );
}
