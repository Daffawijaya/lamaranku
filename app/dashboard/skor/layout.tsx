import type { ReactNode } from "react";
import { ReviewProvider } from "../../../components/dashboard/ReviewContext";

export default function ReviewLayout({ children }: { children: ReactNode }) {
  return <ReviewProvider>{children}</ReviewProvider>;
}
