"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FiMenu, FiX } from "react-icons/fi";
import { navigation } from "../../data/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function MobileNavbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const pathname = usePathname();

  const isHome = pathname === "/";
  const transparentPage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <motion.nav
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`
    lg:hidden fixed top-0 left-0 z-50
    w-screen h-12
    flex items-center justify-between px-5

    transition-all duration-300
    ${
      transparentPage && !scrolled
        ? "bg-transparent backdrop-blur-0 border-b dark:border-white/20 border-white/80"
        : "bg-light dark:bg-dark/40 backdrop-blur-xl border-b border-white dark:border-white/10"
    }
  `}
      >
        <Link
          href="/"
          className={`text-xl font-bold tracking-wide ${
            transparentPage && !scrolled ? (isHome ? "text-white" : "text-black dark:text-white") : "text-black dark:text-white"
          }`}
        >
          lamaranku.
        </Link>

        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.06 }}
          onClick={() => setOpen(true)}
          aria-label="Buka menu"
          className={`text-xl ${transparentPage && !scrolled ? (isHome ? "text-white" : "text-black dark:text-white") : "text-black dark:text-white"}`}
        >
          <FiMenu />
        </motion.button>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[60] bg-light dark:bg-dark flex flex-col"
          >
            <div className="h-16 flex items-center justify-between px-5 border-b border-white dark:border-white/10 shrink-0">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="text-xl font-bold tracking-wide text-black dark:text-white"
              >
                lamaranku.
              </Link>

              <div className="flex items-center gap-1">
                <motion.button
                  whileTap={{ scale: 0.85, rotate: 90 }}
                  onClick={() => setOpen(false)}
                  aria-label="Tutup menu"
                  className="text-black dark:text-white text-3xl"
                >
                  <FiX />
                </motion.button>
              </div>
            </div>

            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.07, delayChildren: 0.12 } },
              }}
              className="flex flex-col px-6 pt-10 gap-8"
            >
              {navigation.map((item) => (
                <motion.div
                  key={item.href}
                  variants={{
                    hidden: { x: -18, opacity: 0, filter: "blur(6px)" },
                    visible: { x: 0, opacity: 1, filter: "blur(0px)", transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
                  }}
                >
                  <Link
                    href={item.href}
                    onClick={(e) => {
                      const hash = item.href.includes("#") ? item.href.split("#")[1] : null;
                      if (hash && pathname === "/") {
                        e.preventDefault();
                        setOpen(false);
                        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
                        window.history.replaceState(null, "", "#" + hash);
                      } else if (hash && pathname !== "/") {
                        e.preventDefault();
                        setOpen(false);
                        router.push("/#" + hash);
                      } else {
                        setOpen(false);
                      }
                    }}
                    className="text-black dark:text-white text-xl font-medium"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.42, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mt-auto w-full px-6 pb-8 pt-6"
            >
              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.015 }}
                onClick={() => router.push("/cv-builder")}
                className="w-full h-11 rounded-lg flex items-center justify-center bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
              >
                Buat CV
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
