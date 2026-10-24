import IsiClient from "../../cv-builder/isi/IsiClient";
import { DashboardPageHeader } from "../../../components/dashboard/DashboardPageHeader";
export default function CvDashboardPage() {
  return (
    <>
      <DashboardPageHeader
        eyebrow="CV BUILDER"
        title="Potensimu, dalam satu cerita."
        description="Lengkapi profil, susun pengalaman, lalu simpan dan unduh CV-mu."
      />
      <div className="workspace-feature-panel">
        <IsiClient embedded />
      </div>
    </>
  );
}
