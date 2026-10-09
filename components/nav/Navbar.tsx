"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import MobileNavbar from "./MobileNavbar";
import { navigation } from "../../data/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [showNavbar, setShowNavbar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowNavbar(window.scrollY > 200);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname]);

  return (
    <>
      <AnimatePresence>
        {showNavbar && (
          <motion.nav
            key="floating-nav"
            initial={{ y: -24, opacity: 0, scale: 0.97, filter: "blur(8px)" }}
            animate={{ y: 0, opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ y: -18, opacity: 0, scale: 0.97, filter: "blur(6px)" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:block fixed top-4 left-0 right-0 z-50 w-fit mx-auto"
          >
            <motion.div
              layout
              className="rounded-lg border border-white bg-light dark:border-zinc-700 dark:bg-dark/40 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
            >
              <div className="md:flex items-center gap-8 pl-[15px] pr-[8px] h-[50px]">
                <Link href="/">
                  <motion.span
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.96 }}
                    className="text-black dark:text-white text-2xl font-semibold tracking-tight inline-block -translate-y-[2.4px]"
                  >
                    l.
                  </motion.span>
                </Link>

                <div className="flex items-center gap-6">
                  {navigation.map((item, i) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 + i * 0.045, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <NavLink href={item.href}>{item.label}</NavLink>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => router.push("/cv-builder")}
                  className="bg-white text-black px-3 py-2 rounded-md text-xs font-medium hover:bg-zinc-200 transition-colors"
                >
                  Buat CV
                </motion.button>
              </div>
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>

      <MobileNavbar />
    </>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent) => {
    const hash = href.includes("#") ? href.split("#")[1] : null;
    if (hash && pathname === "/") {
      e.preventDefault();
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      window.history.replaceState(null, "", "#" + hash);
    } else if (hash && pathname !== "/") {
      e.preventDefault();
      router.push("/#" + hash);
    }
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className="text-xs font-medium text-black hover:text-zinc-700 dark:text-zinc-300 dark:hover:text-white transition-colors duration-200"
    >
      {children}
    </Link>
  );
}
