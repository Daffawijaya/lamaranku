import { SuratDemo } from "../../../components/Builders";
import { DashboardPageHeader } from "../../../components/dashboard/DashboardPageHeader";
export default function SuratDashboardPage() {
  return (
    <>
      <DashboardPageHeader
        eyebrow="SURAT LAMARAN"
        title="Sampaikan ketertarikanmu."
        description="Sesuaikan surat dengan perusahaan dan posisi tujuan."
      />
      <div className="workspace-feature-panel">
        <SuratDemo isPlus={false} />
      </div>
    </>
  );
}
