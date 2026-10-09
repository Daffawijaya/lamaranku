"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function FooterBrand() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["18%", "0%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [0.4, 1]);
  const letterSpacing = useTransform(scrollYProgress, [0, 1], ["0.08em", "0.02em"]);

  return (
    <section
      ref={ref}
      className="relative h-[120px] sm:h-[170px] md:h-[230px] lg:h-[300px] overflow-hidden bg-light dark:bg-dark transition-colors"
    >
      <motion.div
        style={{ y, opacity }}
        className="absolute inset-x-0 bottom-[-15%] flex justify-center will-change-transform"
      >
        <motion.div
          initial={{ y: 60, opacity: 0, filter: "blur(12px)" }}
          whileInView={{ y: 0, opacity: 0.95, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{ letterSpacing } as any}
          className="px-4 sm:px-8 md:px-10 whitespace-nowrap select-none font-extrabold tracking-wide leading-none text-[100px] sm:text-[150px] md:text-[320px] lg:text-[300px] text-black/10 dark:text-[#242428]"
        >
          {"lamaranku".split("").map((char, i) => (
            <motion.span
              key={i}
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block"
              style={{
                WebkitMaskImage:
                  "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.2) 75%, rgba(0,0,0,0) 100%)",
                maskImage:
                  "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.2) 75%, rgba(0,0,0,0) 100%)",
              }}
            >
              {char}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        animate={{ x: [0, 24, -16, 0], opacity: [0.12, 0.2, 0.12] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[140px] bg-violet-500/10 blur-[80px] rounded-full hidden dark:block"
      />
    </section>
  );
}
