import { SuratDemo } from "../../../components/Builders";
import { DashboardPageHeader } from "../../../components/dashboard/DashboardPageHeader";
export default function SuratDashboardPage() {
  return (
    <>
      <DashboardPageHeader
        label="Surat lamaran"
        title="Buka percakapan yang tepat."
        description="Sesuaikan surat dengan perusahaan dan posisi tujuan."
      />
      <div className="dash-feature-panel">
        <SuratDemo isPlus={false} />
      </div>
    </>
  );
}
