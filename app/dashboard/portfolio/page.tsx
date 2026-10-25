import { PortfolioBuilder } from "../../../components/PortfolioBuilder";
import { DashboardPageHeader } from "../../../components/dashboard/DashboardPageHeader";
export default function PortfolioDashboardPage() {
  return (
    <>
      <DashboardPageHeader
        label="Portofolio"
        title="Biar karyamu yang bercerita."
        description="Susun profil dan kumpulkan karya terbaikmu."
      />
      <div className="dash-feature-panel">
        <PortfolioBuilder />
      </div>
    </>
  );
}
