import type { ReactNode } from "react";
export const metadata = {
  title: "Pratinjau portofolio",
  robots: { index: false, follow: false },
};
export default function PreviewLayout({ children }: { children: ReactNode }) {
  return children;
}
