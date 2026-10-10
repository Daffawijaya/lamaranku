"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  type Variants,
} from "framer-motion";
import {
  ChevronRight,
  FolderKanban,
  Gauge,
  Pause,
  Play,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import type { IconType } from "react-icons";
import { BiLogoGmail } from "react-icons/bi";
import { TbFileTextFilled } from "react-icons/tb";
import { navigation } from "../../data/navigation";

type Slide = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  offer: string;
  cta: string;
  href: string;
  tab: string;
  icon: LucideIcon | IconType;
  iconClassName: string;
  bg: string;
  video: string;
};

export const AI_CONIC =
  "conic-gradient(from 0deg, #ff0000, #ff8000, #ffee00, #00e600, #0099ff, #9933ff, #ff0000)";

// Teks "AI" superbold isi gradient conic (background-clip:text jalan di teks asli).
export function AiRainbowIcon({ className, size = 16 }: { className?: string; size?: string | number }) {
  return (
    <span
      aria-hidden="true"
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        background: AI_CONIC,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: "0",
        whiteSpace: "nowrap",
      }}
    >
      ✦
    </span>
  );
}

const SLIDES: Slide[] = [
  {
    id: "cv",
    eyebrow: "CV Builder",
    title: "CV ATS dan Kreatif Siap Pakai",
    description: "10 template ATS dan Kreatif. Basic gratis 2 CV tersimpan.",
    offer: "Oxford, Bold Impact, dan Geo Flow khusus Plus.",
    cta: "Pilih Template",
    href: "/cv-builder",
    tab: "CV Builder",
    icon: TbFileTextFilled,
    iconClassName: "bg-sky-700",
    bg: "linear-gradient(135deg, #0b1e3a 0%, #12305e 45%, #1b2a4a 100%)",
    video: "/videos/hero-cv.mp4",
  },
  {
    id: "skor",
    eyebrow: "Cek Skor CV",
    title: "Cek Skor CV 2 Menit",
    description: "Nilai kesiapan ATS lewat cek mandiri 10 kriteria.",
    offer: "Basic 3x sebulan, Plus unlimited plus rincian.",
    cta: "Cek Skorku",
    href: "/skor",
    tab: "Cek Skor CV",
    icon: Gauge,
    iconClassName: "bg-[#001e36]",
    bg: "linear-gradient(135deg, #0a2a22 0%, #134535 50%, #1a2a3a 100%)",
    video: "/videos/hero-skor.mp4",
  },
  {
    id: "portfolio",
    eyebrow: "Portfolio Builder",
    title: "Portfolio Satu Halaman",
    description: "Kumpulkan karya, bagikan lewat link, unduh PDF.",
    offer: "Basic aktif 3 bulan, Plus 6 bulan plus link custom.",
    cta: "Susun Portfolio",
    href: "/portfolio",
    tab: "Portfolio Builder",
    icon: FolderKanban,
    iconClassName: "bg-amber-600",
    bg: "linear-gradient(135deg, #2b1038 0%, #4a1a52 45%, #231a3a 100%)",
    video: "/videos/hero-portfolio.mp4",
  },
  {
    id: "surat",
    eyebrow: "Generator Surat",
    title: "Surat Lamaran Siap Kirim",
    description: "Satu tujuan, satu surat jadi dalam 1 menit.",
    offer: "Basic 3 surat per bulan, Plus unlimited.",
    cta: "Buat Surat",
    href: "/surat",
    tab: "Generator Surat",
    icon: BiLogoGmail,
    iconClassName: "bg-emerald-700",
    bg: "linear-gradient(135deg, #0a2a22 0%, #134535 50%, #1a2a3a 100%)",
    video: "/videos/hero-surat.mp4",
  },
  {
    id: "ai",
    eyebrow: "AI Plus, segera hadir",
    title: "AI Career Assistant",
    description: "Merapikan kalimat, mengusulkan frasa, menilai kecocokan lowongan.",
    offer: "Segera hadir untuk paket Plus.",
    cta: "Lihat AI Plus",
    href: "/#ai-plus",
    tab: "AI Plus",
    icon: AiRainbowIcon,
    iconClassName: "bg-[#000b1d]",
    bg: "linear-gradient(135deg, #101b2e 0%, #2a2350 50%, #3d2b52 100%)",
    video: "/videos/hero-ai.mp4",
  },
];

const AUTOPLAY_MS = 5200;

// Icon tab mengikuti dropdown Produk di navbar (sumber tunggal); AI Plus
// tidak ada di sana jadi tetap pakai icon slide sendiri.
const NAV_BY_HREF = new Map(navigation.map((item) => [item.href, item]));

const ADOBE_EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];
const EXPO_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const IMG_MS = 0.8;

const bgVariants: Variants = {
  enter: (dir: number) => ({ x: dir < 0 ? "-100%" : "100%" }),
  center: { x: "0%", transition: { duration: IMG_MS, ease: ADOBE_EASE } },
  exit: (dir: number) => ({
    x: dir < 0 ? "100%" : "-100%",
    transition: { duration: IMG_MS, ease: ADOBE_EASE },
  }),
};

const imgVariants: Variants = {
  enter: { scale: 1.08 },
  center: { scale: 1, transition: { duration: IMG_MS, ease: ADOBE_EASE } },
  exit: { scale: 1 },
};

const copyParent: Variants = {
  enter: {},
  center: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
  exit: { transition: { staggerChildren: 0.015 } },
};

const copyChild: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir < 0 ? -56 : 56 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EXPO_EASE } },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir < 0 ? 24 : -24,
    transition: { duration: 0.22, ease: "easeIn" },
  }),
};

export default function HeroCarousel() {
  const slides = useMemo(() => SLIDES, []);
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const railRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const timeoutRef = useRef<number | null>(null);
  const startRef = useRef(0);
  const remainingRef = useRef(AUTOPLAY_MS);
  const pausedRef = useRef(false);

  const togglePaused = useCallback(() => {
    if (!pausedRef.current) {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
        remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - startRef.current));
      }
      rootRef.current?.querySelectorAll("video").forEach((video) => video.pause());
    } else {
      rootRef.current?.querySelectorAll("video").forEach((video) => {
        void video.play().catch(() => {});
      });
    }
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
  }, []);

  const alignActiveTab = useCallback((index: number) => {
    const rail = railRef.current;
    const button = railRef.current?.querySelector<HTMLButtonElement>(`[data-hero-tab="${index}"]`);
    if (!rail || !button) return;
    if (window.matchMedia("(min-width: 1024px)").matches) return;
    const leftPadding = Number.parseFloat(window.getComputedStyle(rail).paddingLeft) || 0;
    rail.scrollTo({
      left: Math.max(0, button.offsetLeft - leftPadding),
      behavior: "smooth",
    });
  }, []);

  const select = useCallback((index: number) => {
    if (slides.length === 0) return;
    const cur = activeRef.current;
    const next = (index + slides.length) % slides.length;
    if (next !== cur) {
      setDirection(
        next === 0 && cur === slides.length - 1
          ? 1
          : next === slides.length - 1 && cur === 0
            ? -1
            : next > cur
              ? 1
              : -1,
      );
      activeRef.current = next;
      remainingRef.current = AUTOPLAY_MS;
      setActive(next);
    }
    alignActiveTab(next);
  }, [alignActiveTab, slides.length]);

  useEffect(() => {
    if (slides.length === 0) return;
    if (paused) {
      rootRef.current?.querySelectorAll("video").forEach((video) => video.pause());
      return;
    }
    startRef.current = Date.now();
    timeoutRef.current = window.setTimeout(() => {
      timeoutRef.current = null;
      remainingRef.current = AUTOPLAY_MS;
      select(activeRef.current + 1);
    }, remainingRef.current);
    rootRef.current?.querySelectorAll("video").forEach((video) => {
      void video.play().catch(() => {});
    });
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [paused, active, select, slides.length]);

  useEffect(() => {
    alignActiveTab(active);
  }, [active, alignActiveTab]);

  if (slides.length === 0) return null;

  return (
    <MotionConfig reducedMotion="user">
    <div ref={rootRef} className="relative h-full min-h-[100svh] w-full overflow-hidden md:min-h-0">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={active}
          custom={direction}
          variants={bgVariants}
          initial="enter"
          animate="center"
          exit="exit"
          aria-hidden="true"
          className="absolute inset-0"
        >
          <motion.div variants={imgVariants} className="relative h-full w-full" style={{ background: slides[active].bg }}>
            <video
              src={slides[active].video}
              autoPlay={!paused}
              muted
              loop
              playsInline
              preload="auto"
              onLoadedData={(event) => {
                if (pausedRef.current) {
                  event.currentTarget.currentTime = 0;
                  event.currentTarget.pause();
                }
              }}
              aria-hidden="true"
              tabIndex={-1}
              className="h-full w-full object-cover"
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/35 to-black/70" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1310px] flex-col px-5 pb-[104px] pt-[86px] text-white sm:px-4 md:h-full md:min-h-0 md:pb-[112px] md:pt-[116px] lg:px-6">
        <div className="mt-1 max-w-[350px] -translate-y-2 md:max-w-[640px] md:-translate-y-8">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={active}
              custom={direction}
              variants={copyParent}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <motion.p
                custom={direction}
                variants={copyChild}
                className="mb-3 text-base font-bold md:mb-5 md:text-lg"
              >
                {slides[active].eyebrow}
              </motion.p>
              <motion.h1
                custom={direction}
                variants={copyChild}
                className="text-[40px] font-black leading-[.98] tracking-[-.025em] md:text-[72px] md:leading-[.96] md:tracking-[-.035em]"
              >
                {slides[active].title}
              </motion.h1>
              <motion.p
                custom={direction}
                variants={copyChild}
                className="mt-3 text-[17px] font-semibold leading-[1.18] text-white md:mt-6 md:max-w-[560px] md:text-xl md:leading-[1.25]"
              >
                {slides[active].description}
              </motion.p>
              <motion.p
                custom={direction}
                variants={copyChild}
                className="mt-2 text-[17px] font-semibold leading-[1.18] text-white md:mt-7 md:max-w-[560px] md:text-xl md:leading-[1.25]"
              >
                {slides[active].offer}
              </motion.p>
              <motion.div custom={direction} variants={copyChild}>
                <Link
                  href={slides[active].href}
                  className="mt-7 inline-flex items-center rounded-full border border-white bg-white px-4 py-2 text-sm font-semibold text-black transition-transform active:scale-[.98] sm:px-5 md:mt-8"
                >
                  {slides[active].cta}
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-auto flex items-center justify-between md:justify-start">
          <button
            type="button"
            onClick={togglePaused}
            aria-label={paused ? "Putar carousel" : "Jeda carousel"}
            className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.10),rgba(255,255,255,0.04)_45%,rgba(0,0,0,0.42))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_8px_24px_rgba(0,0,0,0.24)] backdrop-blur-2xl backdrop-saturate-150 md:hidden"
          >
            {paused ? <Play className="h-3 w-3 fill-current" /> : <Pause className="h-3 w-3 fill-current" />}
          </button>
          <button
            type="button"
            onClick={() => select(active + 1)}
            aria-label="Slide berikutnya"
            className="grid h-10 w-10 place-items-center rounded-md border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.10),rgba(255,255,255,0.04)_45%,rgba(0,0,0,0.42))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_8px_24px_rgba(0,0,0,0.24)] backdrop-blur-2xl backdrop-saturate-150 transition-[background-color,border-color,box-shadow] hover:border-white/15 hover:bg-[linear-gradient(145deg,rgba(255,255,255,0.14),rgba(255,255,255,0.06)_45%,rgba(0,0,0,0.38))] md:hidden"
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div
        ref={railRef}
        className="absolute inset-x-0 bottom-[128px] z-20 mx-auto flex max-w-[1310px] gap-1 overflow-x-auto px-5 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-4 md:bottom-[128px] md:gap-2 md:py-0 lg:bottom-[72px] lg:overflow-visible lg:px-6"
      >
        {slides.map((slide, index) => {
          const Icon = slide.icon;
          const nav = NAV_BY_HREF.get(slide.href);

          return (
            <button
              key={slide.tab}
              type="button"
              data-hero-tab={index}
              onClick={() => select(index)}
              className={`group relative flex h-12 w-[220px] shrink-0 items-center gap-1.5 rounded-[8px] border px-3 font-bold backdrop-blur-2xl backdrop-saturate-150 transition-[background-color,color,transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(.42,0,0,1)] sm:w-[240px] md:h-16 md:w-[260px] md:min-w-0 md:flex-none md:flex-col md:items-start md:gap-0 md:px-2 md:pb-2 md:pt-2 lg:w-auto lg:flex-1 ${
                active === index
                  ? "border-transparent bg-white text-black shadow-none"
                  : "border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.07),rgba(20,20,24,0.36)_48%,rgba(0,0,0,0.54))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.09),0_8px_24px_rgba(0,0,0,0.18)] hover:border-white/15 hover:bg-[linear-gradient(145deg,rgba(255,255,255,0.10),rgba(20,20,24,0.40)_48%,rgba(0,0,0,0.50))]"
              }`}
            >
              <span
                aria-hidden="true"
                className={`grid h-5 w-5 shrink-0 place-items-center rounded ${nav ? `${nav.iconBg} ${nav.iconColor}` : `text-white ${slide.iconClassName}`}`}
              >
                {nav ? (
                  <nav.icon className={nav.iconSize ?? "h-3 w-3"} />
                ) : (
                  <Icon className="h-3 w-3" />
                )}
              </span>
              <span className="flex min-w-0 flex-1 items-center justify-between gap-1 whitespace-nowrap text-[13px] md:mt-1.5 md:w-full md:flex-none md:text-left md:text-[11px] lg:text-[13px] xl:text-sm">
                <span className="min-w-0 flex-1 truncate">{slide.tab}</span>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
              {active === index && (
                <span className="absolute inset-x-0 bottom-0 h-[3px] overflow-hidden rounded-b-[8px] bg-black/10">
                  <span
                    key={active}
                    style={{ animationPlayState: paused ? "paused" : "running" }}
                    className="mobile-hero-progress block h-full bg-red-600"
                  />
                </span>
              )}
            </button>
          );
        })}
        <button
          type="button"
          onClick={togglePaused}
          aria-label={paused ? "Putar carousel" : "Jeda carousel"}
          className="hidden h-10 w-10 shrink-0 place-items-center self-center rounded-full border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.10),rgba(255,255,255,0.04)_45%,rgba(0,0,0,0.42))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_8px_24px_rgba(0,0,0,0.24)] backdrop-blur-2xl backdrop-saturate-150 transition-[background-color,border-color,box-shadow] hover:border-white/15 hover:bg-[linear-gradient(145deg,rgba(255,255,255,0.14),rgba(255,255,255,0.06)_45%,rgba(0,0,0,0.38))] md:ml-5 md:grid lg:ml-3"
        >
          {paused ? <Play className="h-3 w-3 fill-current" /> : <Pause className="h-3 w-3 fill-current" />}
        </button>
        <span
          aria-hidden="true"
          className="h-px w-[calc(100%-220px)] shrink-0 sm:w-[calc(100%-240px)] md:w-[calc(100%-260px)] lg:hidden"
        />
      </div>
    </div>
    </MotionConfig>
  );
}
