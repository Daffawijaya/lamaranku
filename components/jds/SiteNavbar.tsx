"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { navigation, sectionLinks } from "../../data/navigation";

function goHash(
  e: React.MouseEvent,
  href: string,
  pathname: string,
  router: ReturnType<typeof useRouter>,
  after?: () => void,
) {
  const hash = href.includes("#") ? href.split("#")[1] : null;
  if (!hash) {
    after?.();
    return;
  }
  e.preventDefault();
  after?.();
  window.setTimeout(() => {
    if (pathname === "/") {
      // Scroll ke judul section (bukan awal section) agar judul mendarat
      // tepat di bawah navbar. offsetTop rantai layout dipakai supaya tidak
      // terpengaruh transform animasi. Sticky navbar HP total 96px.
      const el = document.getElementById(hash);
      const head = el?.matches("h1, h2") ? el : el?.querySelector("h1, h2");
      // Pakai kontainer heading agar badge di atas judul ikut terlihat.
      const box = (head && head !== el ? head.parentElement ?? head : head ?? el) as HTMLElement | null;
      let y = 0;
      let n = box;
      while (n) {
        y += n.offsetTop;
        n = n.offsetParent as HTMLElement | null;
      }
      if (el) window.scrollTo({ top: Math.max(0, y - 120), behavior: "smooth" });
      window.history.replaceState(null, "", "#" + hash);
    } else {
      router.push("/#" + hash);
    }
  }, 60);
}

function GridIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-5 w-5 fill-current"
    >
      {[2.25, 8.25, 14.25].flatMap((x) =>
        [2.25, 8.25, 14.25].map((y) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="3.5" height="3.5" rx="1" />
        )),
      )}
    </svg>
  );
}

export default function SiteNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [produkOpen, setProdukOpen] = useState(false);
  const produkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!produkOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeProduk();
    };
    const onClick = (e: MouseEvent) => {
      if (produkRef.current && !produkRef.current.contains(e.target as Node)) {
        closeProduk();
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [produkOpen]);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setIsOpen(false);
    };
    desktopQuery.addEventListener("change", closeOnDesktop);
    return () => desktopQuery.removeEventListener("change", closeOnDesktop);
  }, []);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const isHome = pathname === "/" || pathname === "";
  const useLightSurface = !isHome && !isScrolled;
  const isDark = isScrolled || !isHome;
  const expanded = produkOpen;
  const ink = isDark || expanded;
  // `wide` dibalik bersamaan dengan panel (open & close simetris): padding
  // luar dan dalam beranimasi komplementer 0.5s sehingga isi navbar diam,
  // hanya bg yang mengecil/membesar bersamaan dengan panel.
  const [wide, setWide] = useState(false);

  const openProduk = () => {
    setProdukOpen(true);
    setWide(true);
  };

  const closeProduk = () => {
    setProdukOpen(false);
    setWide(false);
  };

  return (
    <>
      <header
        data-navbar-variant="desktop"
        className={`sticky top-0 z-50 hidden h-16 transition-colors duration-300 lg:block ${
          useLightSurface ? "bg-[#f5f5f5]" : ""
        }`}
      >
        <div className="absolute inset-x-0 top-0">
          {/* Layer bg visual saja: satu-satunya yang beranimasi, isi tidak ikut geser */}
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 transition-[margin,border-radius,background-color,box-shadow,border-color] duration-500 ${
              wide
                ? "mx-0 mt-0 rounded-b-2xl bg-[#f5f5f5] shadow-lg shadow-black/10"
                : useLightSurface
                  ? "mx-0 mt-0 rounded-none border-b border-gray-200 bg-[#f5f5f5]"
                  : isScrolled
                    ? "mx-2 mt-2 rounded-2xl border-b border-transparent bg-white/60 shadow-lg shadow-black/10 backdrop-blur-xl"
                    : "mx-0 mt-0 border-b border-transparent bg-transparent"
            }`}
          />
          <div className={`relative transition-[padding] duration-500 ${isScrolled ? "pt-2" : ""}`}>
          <div className="flex h-16 items-center justify-between px-[22px]">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              aria-label="Lamaranku beranda"
              className="flex shrink-0 items-center"
            >
              <span className={`text-2xl font-black tracking-tight ${ink ? "text-zinc-900" : "text-white"}`}>
                lamaranku.
              </span>
            </Link>

            <div className="flex items-center gap-5">
            <div ref={produkRef} className="relative">
              <button
                type="button"
                aria-expanded={produkOpen}
                aria-haspopup="true"
                onClick={() => (produkOpen ? closeProduk() : openProduk())}
                className={`flex items-center gap-1 rounded-lg py-2 text-sm font-semibold tracking-wide transition-colors ${
                  ink ? "text-zinc-600 hover:text-zinc-900" : "text-zinc-300 hover:text-white"
                }`}
              >
                Produk
                <ChevronDown
                  aria-hidden="true"
                  className={`h-4 w-4 transition-transform duration-300 ${produkOpen ? "rotate-180" : ""}`}
                />
              </button>
            </div>

            <nav
              aria-label="Bagian beranda"
              className={`hidden items-center gap-5 text-sm font-semibold tracking-wide transition-colors md:flex ${
                ink ? "text-zinc-600" : "text-zinc-300"
              }`}
            >
              {sectionLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(e) => goHash(e, link.href, pathname, router)}
                  className={`transition-colors ${
                    ink ? "hover:text-zinc-900" : "hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/masuk"
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all sm:px-5 ${
                ink
                  ? "border border-zinc-900 bg-transparent text-zinc-900 hover:bg-zinc-900 hover:text-white"
                  : "border border-white bg-white text-black hover:bg-zinc-200"
              }`}
            >
              Masuk
            </Link>
          </div>
          </div>

          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                key="produk-panel"
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.25, delay: 0 } }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="grid gap-4 px-[22px] pb-8 pt-2 sm:grid-cols-2 lg:grid-cols-4"
                  role="menu"
                  aria-label="Produk Lamaranku"
                >
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        role="menuitem"
                        aria-current={isActive ? "page" : undefined}
                        onClick={() => closeProduk()}
                        className="group rounded-2xl bg-white p-5 transition-colors hover:bg-black"
                      >
                        <span aria-hidden="true" className={`flex h-6 w-6 items-center justify-center rounded-md ${item.iconBg} ${item.iconColor}`}>
                          <item.icon className="h-3.5 w-3.5" />
                        </span>
                        <span className="mt-6 block text-base font-bold text-zinc-900 transition-colors group-hover:text-white">
                          {item.label}
                          {isActive && <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-[#3b63fb]" aria-hidden="true" />}
                        </span>
                        <span className="mt-1 block text-sm leading-relaxed text-zinc-600 transition-colors group-hover:text-white/60">{item.desc}</span>
                      </Link>
                    );
                  })}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </div>
      </header>

      <header
        data-navbar-variant="compact"
        className={`jds-compact-header sticky top-0 z-50 h-20 lg:hidden ${
          useLightSurface ? "bg-[#f5f5f5]" : ""
        }`}
      >
        <div
          className={`jds-compact-navbar ${
            isScrolled ? "jds-compact-navbar-scrolled" : ""
          }`}
        >
          <div className="flex h-16 min-w-0 flex-1 items-center">
            <Link
              href="/"
              aria-label="Lamaranku beranda"
              className="flex h-4 w-[46px] shrink-0 items-center py-0 pl-4 pr-3"
            >
              <span className={`text-lg font-black leading-none ${isDark ? "text-black" : "text-white"}`}>
                l.
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setIsOpen(true)}
              aria-label="Buka Menu"
              className={`flex h-5 w-5 shrink-0 items-center justify-center transition-colors ${
                isDark ? "text-black" : "text-white"
              }`}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 14 7"
                className="h-[7px] w-3.5 fill-current"
              >
                <path d="M13.25 5.5H.75a.75.75 0 0 0 0 1.5h12.5a.75.75 0 0 0 0-1.5Z" />
                <path d="M.75 1.5h12.5a.75.75 0 0 0 0-1.5H.75a.75.75 0 0 0 0 1.5Z" />
              </svg>
            </button>
          </div>

          <div className="flex h-10 shrink-0 items-center gap-1 pr-4">
            <Link
              href="/cv-builder"
              aria-label="Lihat semua template"
              className={`flex h-8 w-8 items-center justify-center rounded-[5px] transition-colors ${
                isDark ? "text-black hover:bg-black/5" : "text-white hover:bg-white/10"
              }`}
            >
              <GridIcon />
            </Link>

            <Link
              href="/masuk"
              aria-label="Masuk ke Lamaranku"
              className={`flex h-10 items-center justify-center rounded-full border px-4 pb-0.5 pt-0 text-sm font-bold leading-none transition-colors ${
                isDark
                  ? "border-black bg-transparent text-black hover:bg-black hover:text-white"
                  : "border-white bg-white text-black hover:bg-zinc-100"
              }`}
            >
              Masuk
            </Link>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="site-menu"
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.42, 0, 0, 1] }}
            className="fixed inset-0 z-[60] flex flex-col bg-[#f3f3f3] text-black lg:hidden"
            role="dialog"
            aria-label="Menu navigasi"
          >
            <div className="relative z-10 m-2 flex h-16 items-center justify-between">
              <div className="flex h-16 w-[66px] shrink-0 items-center">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Tutup menu"
                  className="ml-3 flex h-5 w-5 items-center justify-center text-black"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 14 14"
                    className="h-3.5 w-3.5 fill-none stroke-current"
                  >
                    <path d="M2.25 2.25 11.75 11.75M11.75 2.25 2.25 11.75" strokeWidth="1.5" />
                  </svg>
                </button>
              </div>

              <div className="flex h-10 shrink-0 items-center gap-1 pr-4">
                <Link
                  href="/cv-builder"
                  aria-label="Lihat semua template"
                  onClick={() => setIsOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-[5px] text-black transition-colors hover:bg-black/5"
                >
                  <GridIcon />
                </Link>
                <Link
                  href="/masuk"
                  onClick={() => setIsOpen(false)}
                  className="flex h-10 items-center justify-center rounded-full border border-black px-4 pb-0.5 pt-0 text-sm font-bold leading-none text-black transition-colors hover:bg-black hover:text-white"
                >
                  Masuk
                </Link>
              </div>
            </div>

            <nav
              aria-label="Navigasi utama"
              className="absolute inset-x-0 bottom-0 top-16 overflow-y-auto px-6 pb-36 pt-2"
            >
              <p className="px-1 pb-1 text-xs font-bold uppercase tracking-[0.16em] text-black/50">
                Produk
              </p>
              {navigation.map((link, index) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={(e) => goHash(e, link.href, pathname, router, () => setIsOpen(false))}
                    aria-current={isActive ? "page" : undefined}
                    style={{ animationDelay: `${180 + index * 60}ms` }}
                    className="jds-compact-menu-link flex h-12 w-full items-center py-2 font-sans text-[32px] font-black leading-8 tracking-[-0.96px] text-black"
                  >
                    <span>{link.label}</span>
                  </Link>
                );
              })}
              <p className="px-1 pt-4 text-xs font-bold uppercase tracking-[0.16em] text-black/50">
                Jelajah beranda
              </p>
              {sectionLinks.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(e) => goHash(e, link.href, pathname, router, () => setIsOpen(false))}
                  style={{ animationDelay: `${180 + (navigation.length + index) * 60}ms` }}
                  className="jds-compact-menu-link flex h-12 w-full items-center py-2 font-sans text-[32px] font-black leading-8 tracking-[-0.96px] text-black"
                >
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>

            <div className="absolute inset-x-0 bottom-0 px-6 pb-8 pt-6">
              <Link
                href="/#harga"
                onClick={() => setIsOpen(false)}
                className="flex h-11 w-full items-center justify-center rounded-full border-2 border-[#2c2c2c] text-sm font-bold transition-colors hover:bg-[#2c2c2c] hover:text-white"
              >
                Lihat Harga
              </Link>
              <Link
                href="/masuk"
                onClick={() => setIsOpen(false)}
                className="mt-2 flex h-11 w-full items-center justify-center rounded-full bg-black text-sm font-medium text-white transition-colors hover:bg-zinc-800"
              >
                Masuk
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
