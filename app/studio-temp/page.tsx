import { AccountProvider } from "../../components/dashboard/AccountContext";
import { PortfolioStudio } from "../../components/portfolio/PortfolioStudio";

export const dynamic = "force-dynamic";

export default function StudioTempPage() {
  return (
    <AccountProvider userId="studio-temp" plus={false}>
      <main
        style={{
          minHeight: "100vh",
          background: "#121212",
          color: "#f4f4f2",
          padding: 32,
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <PortfolioStudio />
      </main>
    </AccountProvider>
  );
}
