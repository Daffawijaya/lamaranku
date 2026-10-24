import { PortfolioBuilder } from "../../../components/PortfolioBuilder";
import { DashboardPageHeader } from "../../../components/dashboard/DashboardPageHeader";
export default function PortfolioDashboardPage() {
  return (
    <>
      <DashboardPageHeader
        eyebrow="PORTOFOLIO"
        title="Karyamu, ceritamu."
        description="Susun profil dan kumpulkan karya terbaikmu."
      />
      <div className="workspace-feature-panel">
        <PortfolioBuilder />
      </div>
    </>
  );
}
