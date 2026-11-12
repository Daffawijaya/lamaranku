import { redirect } from "next/navigation";
// Portofolio kini dipisah menjadi /dashboard/portfolio-web (website online)
// dan /dashboard/portfolio-pdf (Portofolio PDF). Rute lama mengalihkan ke PDF.
export default function PortfolioDashboardPage() {
  redirect("/dashboard/portfolio-pdf");
}
