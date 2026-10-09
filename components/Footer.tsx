"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { navigation } from "../data/navigation";
import { WA_NUMBER } from "../data/features";
import { motion } from "framer-motion";

export default function Footer({ title }: { title?: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <footer className="border-t-[0.5px] border-light dark:border-white/10 relative overflow-hidden bg-light dark:bg-dark text-black dark:text-white transition-colors">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-10 z-20">
        {title && (
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="py-10 sm:py-12 md:py-16 text-center flex justify-center items-center">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium leading-relaxed max-w-3xl">
                {title}
              </h2>
            </div>

            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              whileInView={{ scaleX: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.85, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="w-full h-[0.5px] origin-center bg-gradient-to-r from-transparent via-black/15 to-transparent dark:from-transparent dark:via-white/15 dark:to-transparent"
            />
          </motion.div>
        )}

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.09, delayChildren: 0.12 } },
          }}
          className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-14 py-12 md:py-16"
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
              visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
            }}
            className="text-center md:text-left"
          >
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
              lamaranku.
            </h3>

            <p className="mt-5 md:mt-8 text-black/60 dark:text-white/60">
              Berkas lamaran rapi dari HP.
            </p>
          </motion.div>

          <div></div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 16 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
            }}
            className="text-center md:text-left"
          >
            <p className="text-black/40 dark:text-white/40 text-sm mb-4 md:mb-5">
              Profil
            </p>

            <div className="flex flex-col gap-3">
              <Link
                href="/cv-builder"
                className="text-black/80 dark:text-white/80 hover:text-black dark:hover:text-white transition"
              >
                Buat CV
              </Link>

              <Link
                href={`https://wa.me/${WA_NUMBER}?text=Halo%20Lamaranku`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-black/80 dark:text-white/80 hover:text-black dark:hover:text-white transition"
              >
                Chat WA
              </Link>
            </div>

            <p className="text-black/40 dark:text-white/40 text-sm mt-8 mb-4 md:mb-5">
              Kontak Pengembang
            </p>

            <Link
              href="https://daffayanwijaya.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black/80 dark:text-white/80 hover:text-black dark:hover:text-white transition"
            >
              Daffa Yan Wijaya
            </Link>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 16 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.08 } },
            }}
            className="text-center md:text-left"
          >
            <p className="text-black/40 dark:text-white/40 text-sm mb-4 md:mb-5">
              Navigasi
            </p>

            <div className="flex flex-col items-center md:items-start gap-3 md:gap-4">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    const hash = item.href.includes("#") ? item.href.split("#")[1] : null;
                    if (hash && pathname === "/") {
                      e.preventDefault();
                      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
                      window.history.replaceState(null, "", "#" + hash);
                    } else if (hash && pathname !== "/") {
                      e.preventDefault();
                      router.push("/#" + hash);
                    }
                  }}
                  className="text-black/80 dark:text-white/80 hover:text-black dark:hover:text-white transition"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="py-6 md:py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center"
        >
          <p className="text-sm text-black/40 dark:text-white/40">
            © {new Date().getFullYear()} lamaranku.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-x-5 gap-y-2">
            <p className="text-black/40 dark:text-white/40 transition text-sm">
              Dibuat di Malang, Indonesia.
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
