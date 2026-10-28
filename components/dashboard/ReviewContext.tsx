"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSkor, type Skor } from "../SkorChecker";
import { reviewRoute } from "../../lib/review-navigation";

const ReviewContext = createContext<Skor | null>(null);

export function ReviewProvider({ children }: { children: ReactNode }) {
  // The shared layout keeps the PDF and in-flight request alive between steps.
  const review = useSkor(true);
  const { busy, phase } = review;
  const path = usePathname();
  const router = useRouter();
  useEffect(() => {
    const target = reviewRoute({ busy, phase });
    if (path === target) return;
    const draft = new URLSearchParams(window.location.search).get("draft");
    router.replace(target + (busy && draft ? `?draft=${encodeURIComponent(draft)}` : ""), { scroll: false });
  }, [path, busy, phase, router]);
  return <ReviewContext.Provider value={review}>{children}</ReviewContext.Provider>;
}

export function useDashboardReview() {
  const review = useContext(ReviewContext);
  if (!review) throw new Error("ReviewProvider diperlukan untuk halaman review CV.");
  return review;
}
