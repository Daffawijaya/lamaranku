"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

function backgroundTravel(progress: number) {
  const t = Math.max(0, progress * 2 - 1);
  // Creep at 3%, then integrate smootherstep velocity from 3% to 100%.
  // Acceleration and jerk are zero at both ends of the speed transition.
  return 3 * progress + 48.5 * (2.5 * t ** 4 - 3 * t ** 5 + t ** 6);
}

export default function RevealDark({ id, heading, children }: { id?: string; heading: ReactNode; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    // The white section ends 25vh below this section's layout start.
    offset: ["start 0.75", "start -0.25"],
  });
  const y = useTransform(scrollYProgress, (progress) => {
    return `${100 * progress - 72.75 - backgroundTravel(progress)}vh`;
  });
  const headingY = useTransform(scrollYProgress, (progress) => {
    // Integrate a 10% → 100% velocity ramp with flat acceleration and jerk
    // at both ends. Less total travel starts the heading 11.25vh higher.
    const easedTravel = 3.5 * progress ** 6 - 5 * progress ** 7 + 1.875 * progress ** 8;
    const headingTravel = 10 * progress + 90 * easedTravel;
    // Finish at zero offset and full speed, attached to the background.
    return `${16.5 - headingTravel + backgroundTravel(progress)}vh`;
  });

  return (
    <section
      id={id}
      ref={ref}
      className="relative z-0 -mt-[25vh] scroll-mt-28 overflow-hidden bg-black text-white motion-reduce:!mt-0"
    >
      <motion.div
        style={{ y }}
        className="pb-20 pt-[calc(15vh+8rem)] sm:pt-[calc(15vh+9rem)] motion-reduce:!transform-none"
      >
        <motion.div style={{ y: headingY }} className="relative z-10 motion-reduce:!transform-none">
          {heading}
        </motion.div>
        {children}
      </motion.div>
    </section>
  );
}
