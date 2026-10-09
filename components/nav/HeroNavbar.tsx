"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import SmallChevronButton from "./SmallChevronButton";
import { navigation } from "../../data/navigation";
import { motion } from "framer-motion";

export default function HeroNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";

  return (
    <header className="hidden lg:block absolute top-0 left-0 w-full z-30">
      <div className="px-8 py-8">
        <div className="grid grid-cols-3 items-start">
          <motion.nav
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.07, delayChildren: 0.35 } },
            }}
            className="flex flex-col items-start gap-2"
          >
            {navigation.map((item) => (
              <motion.div
                key={item.href}
                variants={{
                  hidden: { opacity: 0, x: -12, filter: "blur(6px)" },
                  visible: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
                }}
              >
                <Link
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
                  className={`transition text-sm ${
                    isHome
                      ? "text-white hover:text-white/80 dark:text-white/90 dark:hover:text-white"
                      : "text-black hover:text-black/80 dark:text-white/90 dark:hover:text-white"
                  } duration-300`}
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </motion.nav>

          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.96, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center items-start"
          >
            <Link
              href="/"
              className={`transition font-semibold text-2xl tracking-tight ${
                isHome
                  ? "dark:text-white dark:hover:text-white/80 text-white hover:text-white/80 duration-300"
                  : "text-black hover:text-black/80 dark:text-white dark:hover:text-white/80 duration-300"
              }`}
            >
              lamaranku.
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="flex justify-end items-start"
          >
            <SmallChevronButton
              title="Buat CV"
              onClick={() => router.push("/cv-builder")}
            />
          </motion.div>
        </div>
      </div>
    </header>
  );
}
